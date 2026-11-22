# Fase 5F.8 — Correção das permissões e validação da retenção

Status: **correção local concluída; role de teste de menor privilégio validada; nenhuma operação
remota executada**.
Data/hora: **2026-11-15T23:21:54-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 1 — Aprovado (local).** A retenção completa das Fases 2, 3 e 4 funciona com uma
role exclusiva de cleanup, sem INSERT/UPDATE/DDL, e os testes PostgreSQL 17 passam integralmente.
A criação da role no Neon e a validação remota continuam exigindo autorização futura.

---

## 1. Causa exata dos três testes que falharam na auditoria

A rotina de retenção foi ampliada para as Fases 2/3/4, mas os testes de integração ainda usavam
`analytics_cleanup`, cuja migration 005 concede privilégios **apenas nas tabelas da Fase 4**.

Como a rotina começa por `affiliate_clicks` (Fase 2/3), a primeira operação `DELETE` era rejeitada:

```text
42501 — permission denied for table affiliate_clicks
```

Consequências nos três testes:

1. limpeza completa falhava antes de qualquer tabela da Fase 4;
2. o teste de falha parcial falhava pelo mesmo motivo, antes do trigger;
3. o teste de agendamento falhava ao executar o cleanup com a mesma role.

Também havia incompatibilidade de contrato: a rotina nova retorna
`{locked,tables,truncated,durationMs}` e os testes antigos esperavam
`{raw,daily,monthly,dailyCounters,nonces,rate}`. O teste de falha parcial esperava rollback global,
enquanto a rotina nova faz commit por lote.

---

## 2. Matriz final de privilégios

Role de cleanup B1: `validation_b1_cleanup`.

| Tabela | SELECT | DELETE | INSERT | UPDATE | DDL/TRUNCATE | Observação |
|---|---:|---:|---:|---:|---:|---|
| `visitors` | sim | sim | não | não | não | `NOT EXISTS` de sessões |
| `sessions` | sim | sim | não | não | não | corte por `last_seen_at` |
| `pageviews` | sim | sim | não | não | não | Fase 2 |
| `events` | sim | sim | não | não | não | Fase 2 |
| `affiliate_clicks` | sim | sim | não | não | não | FK para `events` |
| `ingest_events` | sim | sim | não | não | não | deduplicação |
| `rate_limits` | sim | sim | não | não | não | 24 h |
| `html_events` | sim | sim | não | não | não | 7 dias |
| `html_traffic_daily` | sim | sim | não | não | não | 90 dias |
| `html_indicators_monthly` | sim | sim | não | não | não | 13 meses |
| `edge_daily_counters` | sim | sim | não | não | não | 90 dias |
| `edge_nonces` | sim | sim | não | não | não | 24 h |
| `edge_rate_limits` | sim | sim | não | não | não | 24 h |

Não há sequences, funções ou triggers de aplicação envolvidos. `pg_try_advisory_lock`/unlock são
funções de sistema disponíveis à role. `ctid` e funções de data são nativas.

`validation_b1_cleanup` não recebe `SELECT` em `schema_migrations`, não possui memberships, é
`NOINHERIT`, não é owner e não tem acesso a `neondb`.

---

## 3. Arquivos SQL criados ou modificados

### `database/b1/007-cleanup-retention.sql` (modificado nesta fase)

- valida banco `validation_b1`;
- exige a role existente;
- rejeita role com atributos administrativos ou `INHERIT`;
- rejeita role com memberships;
- concede `CONNECT`/`USAGE`;
- revoga `CREATE` no schema/database;
- concede somente `SELECT, DELETE` nas 13 tabelas;
- cria índices `sessions_last_seen_at_idx` e `visitors_last_seen_at_idx` com `IF NOT EXISTS`.

### `database/b1/008-create-validation-b1-cleanup.sql` (criado)

- exige confirmação de senha via variável psql, sem segredo no arquivo;
- exige `current_database()='validation_b1'`;
- falha se a role já existir;
- cria `LOGIN`, `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`, `NOREPLICATION`, `NOBYPASSRLS`,
  `NOINHERIT`;
- não cria memberships.

O SQL foi aplicado somente no PostgreSQL local de teste, com senha local efêmera. Nenhum SQL foi
aplicado no Neon.

---

## 4. Justificativa de cada privilégio

- `CONNECT`: necessário para abrir a conexão de cleanup.
- `USAGE` no schema: necessário para resolver as tabelas.
- `SELECT`: necessário para o subquery de `ctid` e para `NOT EXISTS` em `visitors`.
- `DELETE`: necessário para expurgar cada tabela.
- `INSERT`/`UPDATE`: desnecessários; a rotina só remove.
- `TRUNCATE`: desnecessário e proibido; não foi concedido.
- `CREATE`/`ALTER`/`DROP`: desnecessários; revogados/negados.
- `schema_migrations`: não é alvo de retenção; sem SELECT.
- `pg_try_advisory_lock`: execução pública nativa; não exige grant adicional.

---

## 5. Testes com a role de menor privilégio

A suíte de integração foi atualizada para:

- criar `validation_b1_cleanup` localmente com `NOINHERIT`;
- conceder apenas `USAGE` + `SELECT/DELETE` nas 13 tabelas;
- conectar o pool de cleanup com essa role, não com `analytics_cleanup` nem com owner;
- manter `analytics_cleanup` apenas para o teste legado de Phase 4.

Testes comprovados com `validation_b1_cleanup`:

| Teste | Resultado |
|---|---|
| SELECT nas tabelas de retenção | permitido |
| DELETE nas tabelas de retenção | permitido |
| INSERT em `visitors` | negado `42501` |
| UPDATE em `visitors` | negado `42501` |
| TRUNCATE em `html_events` | negado `42501` |
| CREATE TABLE | negado `42501` |
| ALTER TABLE | negado `42501` |
| DELETE em `schema_migrations` | negado `42501` |
| Memberships | 0 |
| Execução integral da retenção | passou |
| Recentes preservados | passou |
| Vencidos removidos | passou |
| Advisory lock concorrente | bloqueou |
| Falha em lote posterior | rollback do lote com erro; lotes anteriores preservados |
| Reexecução | sem exclusões adicionais |
| Allowlist | somente as 13 tabelas |

O teste de falha parcial foi atualizado para a semântica real: cada lote tem sua própria transação;
um erro no lote de `html_indicators_monthly` preserva o lote e mantém os lotes anteriores já
commitados. Isso é idempotente e não apaga dados recentes, mas **não é rollback global**.

---

## 6. Resultados PostgreSQL 17

PostgreSQL local **17.11**, sem Neon:

- migrations 001–006 aplicadas;
- role `validation_b1_cleanup` criada localmente com `008`;
- grants/índices aplicados com `007`;
- role verificada: `NOINHERIT`, sem admin, sem memberships;
- 13 tabelas em `public`;
- `sessions_last_seen_at_idx` e `visitors_last_seen_at_idx` presentes;
- `has_table_privilege` confirmou SELECT/DELETE e ausência de INSERT/UPDATE;
- `schema_migrations` inacessível à role;
- suíte de integração PostgreSQL: **32/32 pass**.

---

## 7. Resultados de regressão

| Suíte | Resultado |
|---|---|
| `npm run test:analytics` (sem `TEST_DATABASE_URL`) | **84/84 pass**; 2 suítes skip |
| `npm test` B1 | **19/19 pass** |
| `npm run test:browser` | **2/2 pass** |
| `npx netlify-cli build --offline` | pass; 2 Functions + 1 Edge |
| `capture.integration` + `collect.integration` com PG local | **32/32 pass** |

Não há falhas abertas nas suítes executadas.

---

## 8. Riscos ainda existentes

1. **Rate limiting de plataforma:** configuração code-based está presente, mas a aplicação real
   pela Netlify não foi validada em runtime.
2. **IP interno Edge → Function:** a Function pode agregar chamadas internas por IP de borda; o
   limite de 60/min pode precisar de ajuste após teste preview.
3. **Ataque distribuído:** limite por IP/domínio não é global no Free.
4. **B1 preview:** Scheduled Function não executa cron em deploy preview; a retenção B1 ainda exige
   execução manual ou alvo publicado.
5. **Role remota:** `validation_b1_cleanup` ainda não existe no Neon; os SQLs não foram aplicados.
6. **Execução longa:** `maxBatches=100` e `statement_timeout=30s` por lote não impõem orçamento
   total; uma Scheduled Function pode ser encerrada com lotes anteriores commitados.
7. **Conexão pooled:** advisory lock é de sessão; o endpoint de cleanup deve ser direto.
8. **Cascatas Fase 2/3:** sessão antiga com filho recente pode remover o filho por cascata; testar
   com dados representativos antes de operação real.
9. **Classificador:** corrigido localmente, mas sem validação em tráfego real.
10. **Produção/homologação:** a função canônica agora cobre Fases 2/3/4; não ativar cleanup nelas sem
    atualizar a role `analytics_cleanup`/grants de produção, o que não foi feito.

---

## 9. Procedimento futuro de criação da role B1

1. Gerar senha forte e armazenar no Windows Credential Manager.
2. Conectar ao database `validation_b1` como `neondb_owner`.
3. Confirmar `current_database()` e `current_user`.
4. Executar `database/b1/008-create-validation-b1-cleanup.sql` com a senha via variável psql, sem
   imprimir o valor.
5. Executar `database/b1/007-cleanup-retention.sql`.
6. Verificar atributos, memberships, DDL negado, acesso a `neondb` negado e grants nas 13 tabelas.
7. Guardar a senha no Credential Manager e configurar `CLEANUP_DATABASE_URL` no B1 usando endpoint
   **direto**, não pooled.

Essas etapas não foram executadas remotamente.

---

## 10. Procedimento futuro de ativação controlada da retenção

1. Autorizar a criação remota da role e aplicação dos SQLs.
2. Fazer deploy preview do código de cleanup B1 (a função agora está no diretório do B1).
3. Manter `HTML_CAPTURE_CLEANUP_ENABLED=false` até a janela autorizada.
4. Executar cleanup manualmente com `maxBatches` baixo e batch pequeno; verificar logs e contagens.
5. Confirmar remoção de vencidos, preservação de recentes e nenhuma PII nos logs.
6. Testar lock concorrente e falha de um lote.
7. Só depois avaliar agendamento em alvo publicado; preview não executa cron.
8. Não limpar os 2 registros sintéticos existentes sem autorização.
9. Não promover deploy nem alterar produção/homologação.

---

## 11. Estimativa de créditos

- Nenhum deploy/crédito consumido nesta fase.
- Saldo recente: **140,0759**; plano Free 300.
- Para validação futura, reservar até **30 créditos** para até dois deploys draft; cada teste deve
  ser curto. Nenhum upgrade/compra.

---

## 12. Classificação final

**1 — Aprovado (local).** A falha de privilégios foi corrigida com uma role B1 exclusiva de menor
privilégio, o SQL foi validado em PostgreSQL 17 local e as suítes de integração passaram 32/32.
A criação da role no Neon, a validação de rate limiting em runtime e a ativação operacional da
retenção continuam pendentes de autorização específica.
