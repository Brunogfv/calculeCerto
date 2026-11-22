# Fase 5F.9 — Pré-auditoria remota para habilitação segura da retenção B1

Status: **pré-auditoria concluída; nenhum SQL, role, variável, flag, deploy ou limpeza remota
executado**.
Data/hora: **2026-11-15T23:31:22-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Pronto com pendências.** O modelo de privilégios está validado localmente,
mas a execução remota exige uma decisão sobre o arquivo 007 (não é uma migration registrada),
criação não idempotente da role, deploy novo (o deploy B1 atual não contém cleanup/rateLimit),
configuração de conexão direta e validação manual sem cron em preview.

---

## 1. Resumo executivo

O estado remoto confirmado é o esperado, mas ainda não preparado para executar a retenção:

- B1 está no deploy `6afa50e666410b01eb5a0589`, anterior às mudanças locais da Fase 5F.6.
- Esse deploy tem apenas a Function `capture-html`; **não tem** `cleanup-html-capture`.
- O deploy atual não contém as configurações locais de `rateLimit`; a Netlify não tem regra de
  rate limit aplicada (`traffic_rules_config_per_scope={}`).
- Flags finais: captura/analytics `false`, amostra `0.1`, cleanup `false`.
- `CLEANUP_DATABASE_URL` não existe no B1.
- Neon B1 tem 6 migrations, 13 tabelas de aplicação e 2 registros sintéticos.
- `validation_b1_cleanup` **não existe** no Neon.
- `validation_b1_runtime` continua sem DELETE/TRUNCATE/DDL e sem acesso a `neondb`.

O SQL local 007/008 foi validado em PostgreSQL 17 local, mas há dois pontos de processo que precisam
ser resolvidos antes da execução remota:

1. `database/b1/007-cleanup-retention.sql` é um script B1 de privilégios/índices, **não** uma
   migration em `db/migrations`; o runner não a aplica e `schema_migrations` continua em 6.
2. `008-create-validation-b1-cleanup.sql` não é idempotente e falha se a role já existir. Uma falha
   depois da criação da role exige tratamento explícito antes de reexecutar.

---

## 2. Auditoria do SQL 007

Arquivo: `database/b1/007-cleanup-retention.sql`.

### 2.1 Pontos corretos

- Verifica `current_database()='validation_b1'`.
- Exige a role `validation_b1_cleanup`.
- Rejeita role com `SUPERUSER`, `CREATEDB`, `CREATEROLE`, `REPLICATION`, `BYPASSRLS` ou `INHERIT`.
- Rejeita membership.
- Concede `CONNECT` e `USAGE`.
- Revoga `CREATE` no schema/database.
- Concede somente `SELECT, DELETE` nas 13 tabelas.
- Não concede `schema_migrations`.
- Cria índices `sessions_last_seen_at_idx` e `visitors_last_seen_at_idx` com `IF NOT EXISTS`.
- Compatível com PostgreSQL 17 (validado localmente).

### 2.2 Pendências

- **Não é uma migration registrada.** Não está em `db/migrations` e não cria linha em
  `schema_migrations`. Se a expectativa for “migration 007”, é preciso decidir entre:
  - tratá-la como script operacional B1 separado; ou
  - movê-la para um mecanismo de migration próprio, com checksum/registro.
  Não alterar agora.
- `CREATE INDEX` normal pode bloquear escritas durante a criação; no B1 atual é pequeno.
- Grants são idempotentes; índices usam `IF NOT EXISTS`. O bloco `DO` é atômico, mas a criação dos
  índices vem depois; uma falha no segundo índice deixa o primeiro aplicado. Reexecução é segura.

---

## 3. Auditoria da role de cleanup

Arquivo: `database/b1/008-create-validation-b1-cleanup.sql`.

| Item | Situação |
|---|---|
| Role remota | ausente |
| Nome | `validation_b1_cleanup` |
| LOGIN | previsto |
| NOINHERIT | previsto |
| NOSUPERUSER/NOCREATEDB/NOCREATEROLE/NOREPLICATION/NOBYPASSRLS | previsto |
| Memberships | nenhuma |
| DDL | não previsto |
| INSERT/UPDATE | não previsto |
| SELECT/DELETE | 13 tabelas previstas |
| `schema_migrations` | sem acesso |
| `neondb` | sem acesso previsto |

**Pendência de idempotência:** a criação falha se a role já existir. O fluxo futuro deve:

1. verificar existência antes de executar;
2. se existir, não recriar; validar atributos/memberships e aplicar apenas 007;
3. se a criação falhar depois de criar a role, fazer diagnóstico e não repetir cegamente.

A senha não está no arquivo; o script usa `psql -v`. O procedimento futuro deve fornecer o valor por
stdin/arquivo temporário protegido, não por argumento visível em processo/histórico.

---

## 4. Auditoria dos privilégios

- Role runtime `validation_b1_runtime`: `CONNECT` no B1, sem `neondb`, sem DELETE/TRUNCATE/DDL.
- `analytics_cleanup` herdada: LOGIN, sem grants no B1; não usar.
- `validation_b1_cleanup`: ainda ausente; SQL preparado.
- `PUBLIC` não ganha tabelas; schema `public` tem `USAGE` inerente.
- O cleanup precisa de `SELECT` para o subquery de `ctid`/`NOT EXISTS` e `DELETE` para expurgo;
  não precisa de INSERT/UPDATE/TRUNCATE/DDL/sequences/funções.
- Advisory lock/unlock são funções nativas; não exigem grant adicional.
- A role não deve herdar memberships; `NOINHERIT` está previsto.

**Conclusão:** a matriz mínima é tecnicamente suficiente; o que falta é a criação/aplicação remota.

---

## 5. Auditoria dos índices

Pré-requisitos da rotina:

| Tabela/campo | Índice |
|---|---|
| `html_events.received_at` | `html_events_received_at_idx` |
| `html_traffic_daily.day` | PK/índice diário |
| `html_indicators_monthly.month` | PK/índice mensal |
| `edge_daily_counters.day` | PK |
| `edge_nonces.expires_at` | `edge_nonces_expires_at_idx` |
| `edge_rate_limits.window_start` | `edge_rate_limits_window_start_idx` |
| `pageviews.received_at` | `pageviews_received_at_idx` |
| `events.received_at` | `events_received_at_idx` |
| `affiliate_clicks.received_at` | `affiliate_clicks_received_at_idx` |
| `ingest_events.received_at` | `ingest_events_received_at_idx` |
| `rate_limits.window_start` | `rate_limits_window_start_idx` |
| `sessions.last_seen_at` | preparado `sessions_last_seen_at_idx` |
| `visitors.last_seen_at` | preparado `visitors_last_seen_at_idx` |

Os índices de `sessions`/`visitors` ainda não existem no Neon. Sem eles, o cleanup pode varrer
tabelas; em B1 pequeno é aceitável, mas a aplicação de 007 é recomendada antes da operação real.

---

## 6. Auditoria da conexão

- A rotina usa uma conexão de `pg.Pool` (`max` pequeno no cleanup) e advisory lock de sessão.
- **Conexão direta é necessária** para garantir que o advisory lock permaneça na mesma sessão.
- `CLEANUP_DATABASE_URL` deve ser a URL direta da branch B1, não a pooled.
- O plano Free do Neon tem limites de conexão; o pool de cleanup deve usar `max=1` ou 2.
- `connectionTimeoutMillis` deve ser curto; o cleanup já usa `statement_timeout`/`lock_timeout`
  por lote.
- A conexão deve ser fechada no `finally`; a rotina faz release do client; a função fecha o pool.
- Falha de conexão antes do DELETE não altera dados; falha após um lote deixa os lotes anteriores
  commitados, sem dados recentes removidos.
- Não foi exibida URL, senha ou token.

---

## 7. Auditoria da Scheduled Function

| Item | Estado |
|---|---|
| Código de cleanup no build B1 | local presente; **não publicado** no deploy atual |
| Cron | `15 3 * * *` no código |
| Função no deploy B1 atual | apenas `capture-html`; sem cleanup |
| `function_schedules` | vazio |
| `HTML_CAPTURE_CLEANUP_ENABLED` | `false` |
| `CLEANUP_DATABASE_URL` | ausente |
| Preview | cron não executa em deploy preview |
| Timeout | a função pode exceder o limite se `maxBatches=100`; não há orçamento total no código |
| Concorrência | advisory lock previsto |
| Observabilidade | log JSON com contagens; sem PII |

A validação futura não deve depender do cron do preview. Deve usar invocação manual controlada da
função/publicação, ou um alvo publicado só para a janela, sempre com flag e após autorização.

---

## 8. Estado remoto confirmado (somente leitura)

### Netlify

| Item | Valor |
|---|---|
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Nome | `portal-contas-validation-b1` |
| Deploy atual | `6afa50e666410b01eb5a0589` |
| Deploy 1 | `6afa4fa4b15e42516ce00fd9` |
| Contexto | `deploy-preview` |
| Publicado | não |
| Functions do deploy | somente `capture-html` |
| Edge | `html-capture` presente |
| `CLEANUP_DATABASE_URL` | ausente |
| `HTML_CAPTURE_CLEANUP_ENABLED` | `false` |
| Rate limit nativo | `{}` (sem regra) |

### Neon

| Item | Valor |
|---|---|
| Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` |
| Database | `validation_b1` |
| Migrations | 6 |
| Tabelas | 13 + `schema_migrations` |
| `validation_b1_cleanup` | ausente |
| `validation_b1_runtime` DELETE/TRUNCATE/DDL | negados |
| `neondb` | sem CONNECT |
| Dados | 2 `html_events`, 2 nonces, 2 rate limits, 1 contador/agregado diário, 1 mensal |

---

## 9. Rate limiting e limitações de preview

- O deploy atual não contém `rateLimit` no código (é o deploy anterior às alterações locais).
- A configuração de tráfego da Netlify está vazia.
- Não há validação remota de Edge 120/60 s ou Function 60/60 s.
- A Function pode ver IP interno da Edge; o limite de 60/min pode agregar chamadas legítimas.
- Preview não executa cron.
- Nenhum teste remoto foi executado.

---

## 10. Sequência de execução futura

1. **Pré-condição:** branch/DB B1 vazios de dados reais; 2 sintéticos identificados; role runtime
   sem alterações.
2. **Criar role** `validation_b1_cleanup` com 008, por canal seguro; se já existir, não recriar.
   Evidência: `pg_roles` com NOINHERIT e sem memberships.
   Interromper se houver divergência. Rollback: role recém-criada sem grants pode ser removida
   apenas com autorização.
3. **Aplicar 007** como `neondb_owner`, em transação/psql, com `current_database` verificado.
   Evidência: grants SELECT/DELETE, índices, sem INSERT/UPDATE/DDL.
   Interromper se qualquer grant falhar; rollback é a transação/DO block, com índices `IF NOT EXISTS`.
4. **Validar privilégios** por `has_table_privilege`, `pg_auth_members`, `has_schema_privilege` e
   tentativa negativa de INSERT/UPDATE/TRUNCATE/DDL.
5. **Configurar `CLEANUP_DATABASE_URL` direto** no Site ID B1, com senha no cofre; nunca pooled.
6. **Manter flag false** e fazer deploy preview do código novo (inclui cleanup e rateLimit).
   Evidência: deploy `deploy-preview`, `cleanup-html-capture` listada, schedules ainda vazios.
7. **Janela controlada:** ativar flag em deploy preview e invocar a função manualmente; o cron não
   roda em preview. Se a ativação exigir outro deploy, autorizar; não publicar.
8. **Validar com dados sintéticos:** old removido, recent preservado, lock concorrente, falha e
   reexecução; logs sem PII; confirmar que os 2 registros originais não foram apagados.
9. **Desativar:** voltar flag false, segundo deploy preview se necessário, confirmar.
10. **Não limpar** os 2 registros existentes sem autorização; não promover.

Cada escrita exige nova autorização. A 007 não deve ser aplicada pelo runner 001–006 sem decisão
explícita de registrá-la como migration ou tratá-la como script operacional.

---

## 11. Estimativa de créditos

- Saldo recente: **140,0759**; plano Free.
- Deploy draft anterior mediu 0 crédito; não assumir que será sempre 0.
- Para publicar o código novo e validar cleanup/flags, reservar **até 30 créditos** (até 2 deploys).
- Testes de rate limit e cleanup devem ser curtos; não há upgrade/compra recomendado.

---

## 12. Riscos e critérios de interrupção

| Risco | Gravidade | Tipo | Critério |
|---|---|---|---|
| 007 não é migration registrada | Alto | decisão de processo | interromper se o executor esperar `schema_migrations` |
| 008 não idempotente | Alto | operação | interromper se role existir parcialmente |
| Deploy atual sem cleanup/rateLimit | Alto | estado remoto | interromper se tentar validar sem novo deploy |
| `CLEANUP_DATABASE_URL` ausente/pooled | Alto | conexão | interromper se não for direta |
| Preview sem cron | Médio | infraestrutura | usar invocação manual |
| Limite de tempo/batches | Médio | operação | reduzir lote/orçamento |
| Rate limit sem runtime | Médio | evidência | não declarar validado |
| IP interno Edge→Function | Médio | hipótese | testar preview |
| Role remota ausente | Esperado | operação | criar somente com autorização |
| Dados sintéticos | Baixo | estado | não apagar sem autorização |

**Interromper imediatamente** em: erro de identidade do banco, criação parcial de role, grant
inesperado, acesso a `neondb`, falha de DDL, execução de cleanup com dados reais, rate limit
aplicado em produção ou alteração fora do B1.

---

## 13. Classificação final

**2 — Pronto com pendências.** O SQL de privilégios e a role foram validados localmente em
PostgreSQL 17 e a matriz de permissões é suficiente. A execução remota ainda depende de: decisão
sobre 007 como script/migration, criação segura da role, deploy do código novo, conexão direta,
configuração de `CLEANUP_DATABASE_URL` e validação manual sem cron em preview.
