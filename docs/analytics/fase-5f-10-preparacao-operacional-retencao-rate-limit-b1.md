# Fase 5F.10 — Preparação operacional e correções locais para retenção e rate limiting B1

Status: **correções operacionais locais concluídas; SQL, role, cleanup, invocação manual e build
validados; nenhuma operação remota executada**.
Data/hora: **2026-11-16T18:11:17-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 1 — Aprovado localmente e pronto para autorização remota.** A implementação
local está consistente; criação da role, aplicação dos SQLs, deploy e rate limiting em runtime
continuam pendentes de autorização específica.

---

## 1. Alterações locais realizadas

- SQL 008 reescrito para ser idempotente e validar rigorosamente a role existente.
- SQL 007 ampliado com pré-checagem de tabelas/colunas, transação única, pós-checagem de
  privilégios/índices e tolerância a `schema_migrations` ausente no teste local.
- `cleanup-retention.mjs` passou a validar banco, role, atributos, memberships e privilégios antes
  de qualquer DELETE.
- `runScheduledCleanup` exige `CLEANUP_DATABASE_URL` no fluxo real, aceita
  `CLEANUP_EXPECTED_DATABASE`/`CLEANUP_EXPECTED_ROLE` e não usa `DATABASE_URL` como fallback.
- Criado `scripts/cleanup-retention.mjs` para invocação manual autorizada, sem endpoint público.
- Testes novos para SQL/role, guards, fallback, confirmação manual, identidade e privilégios.
- Cópias compartilhadas do B1 sincronizadas; manifesto com 16 arquivos.
- Nenhuma alteração remota.

---

## 2. SQL 008 — criação segura/idempotente da role

Arquivo: `database/b1/008-create-validation-b1-cleanup.sql`.

Comportamento:

1. exige senha via variável psql, nunca no arquivo;
2. exige `current_database()='validation_b1'`;
3. cria a role apenas se ela não existir;
4. se existir, não recria e valida o estado;
5. exige `LOGIN`, `NOINHERIT`, `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`,
   `NOREPLICATION`, `NOBYPASSRLS`;
6. rejeita memberships recebidas ou concedidas;
7. rejeita objetos de propriedade da role;
8. executa criação + validação em transação única;
9. interrompe se houver divergência, sem corrigir silenciosamente.

Testes locais:

| Cenário | Resultado |
|---|---|
| Role inexistente | criada |
| Segunda execução com role correta | aceita sem recriar |
| Role preexistente com `INHERIT` | rejeitada |
| Role corrigida para `NOINHERIT` | aceita |
| Memberships | 0 |
| Senha no repositório | não |

---

## 3. Auditoria do SQL 007

Arquivo: `database/b1/007-cleanup-retention.sql`.

É um **script operacional**, não uma migration registrada. Não cria linha em
`schema_migrations`.

Pré-condições implementadas:

- banco `validation_b1`;
- 13 tabelas esperadas;
- colunas de cutoff presentes;
- role existente, `LOGIN`, `NOINHERIT` e sem atributos administrativos;
- zero memberships recebidas/concedidas;
- sem acesso prévio a `schema_migrations` (quando a tabela existe).

Aplicação:

- `BEGIN`/`COMMIT` único;
- `CONNECT`/`USAGE`;
- revogação de `CREATE` no schema/database;
- `GRANT SELECT, DELETE` nas 13 tabelas, sem INSERT/UPDATE/TRUNCATE/DDL;
- índices `sessions_last_seen_at_idx` e `visitors_last_seen_at_idx` com `IF NOT EXISTS`;
- pós-condição valida privilégios, ausência de memberships e presença dos índices.

Testes locais:

| Teste | Resultado |
|---|---|
| Primeira aplicação | passou |
| Segunda aplicação | passou (idempotente) |
| Tabelas | 13 |
| SELECT/DELETE em `html_events` | true/true |
| INSERT/UPDATE em `html_events` | false/false |
| Índices de `sessions`/`visitors` | presentes |
| `schema_migrations` | sem acesso |
| Role | `NOINHERIT`, sem admin/memberships |

---

## 4. Segurança da conexão cleanup

- `CLEANUP_DATABASE_URL` é obrigatório no fluxo real.
- Não há fallback para `DATABASE_URL`.
- A conexão deve ser **direta**, não pooled, para preservar o advisory lock de sessão.
- O pool de cleanup usa `max=1`; a função fecha o pool no `finally`.
- Antes de DELETEs, a rotina valida:
  - database e role esperados;
  - atributos de role e `NOINHERIT`;
  - memberships recebidas/concedidas;
  - `USAGE` sim e `CREATE` no schema/database não;
  - `schema_migrations` sem SELECT;
  - SELECT/DELETE nas 13 tabelas, sem INSERT/UPDATE/TRUNCATE.
- Falha de identidade/privilégio ocorre antes do lock e de qualquer DELETE.
- Falha de conexão não altera dados.

---

## 5. Scheduled Function

- Cron: `15 3 * * *` (UTC).
- `cleanup-html-capture` está incluída no build B1 local (2 Functions + 1 Edge).
- `HTML_CAPTURE_CLEANUP_ENABLED=false`.
- Sem `CLEANUP_DATABASE_URL`, retorna `missing_cleanup_url` sem abrir banco.
- Com flag falsa, retorna `disabled` sem abrir banco.
- Usa `validation_b1_cleanup`; não usa a runtime.
- Logs retornam apenas status/contagens/tabelas/lotes/duração, sem PII.
- B1 é preview; o cron não executa nesse contexto. A validação deve ser manual/controlada.

---

## 6. Invocação manual controlada

Novo CLI: `scripts/cleanup-retention.mjs`.

Regras:

- exige `CLEANUP_CONFIRM=APPLY_RETENTION_B1`;
- exige `CLEANUP_DATABASE_URL`;
- não usa `DATABASE_URL` como fallback;
- exige database/role esperados;
- aplica os mesmos guards de identidade e privilégios;
- não recebe tabela, cutoff ou limite por argumento;
- não é endpoint HTTP, não é GET público e não aceita usuário anônimo;
- não contorna a flag do Scheduled Function (é operação administrativa manual).

Testes locais:

- sem confirmação: exit 2, sem conexão;
- sem URL: exit 2, sem fallback;
- URL/role/database corretos em PostgreSQL local: status ok;
- banco/role divergentes: falha antes de DELETE.

---

## 7. Rate limiting

Configuração local:

| Camada | Limite | Agregação |
|---|---:|---|
| Edge | 120 / 60 s | IP + domínio |
| Function | 60 / 60 s | IP + domínio |

A sintaxe é oficialmente suportada, Free permite 2 regras por projeto, e o enforcement antes do
código é documentado. HMAC, nonce, timestamp, limite de 8 KiB e rate limit no banco permanecem.

Não comprovado em runtime: enforcement efetivo, headers `429` e comportamento do IP interno
Edge→Function. O deploy B1 atual ainda não contém essas regras; será necessário novo deploy.

---

## 8. Build B1

- Shared manifest: 16 arquivos, hashes consistentes.
- Build offline: passou.
- Publish: 6 arquivos + manifest.
- Functions: `capture-html`, `cleanup-html-capture`.
- Edge: `html-capture`.
- Nenhum segredo no `dist`.
- Nenhum deploy executado.

---

## 9. Testes e resultados

| Suíte | Resultado |
|---|---|
| Analytics | **88/88 pass** |
| B1 | **19/19 pass** |
| Consentimento | **2/2 pass** |
| Integração PostgreSQL 17 | **32/32 pass** |
| Build B1 | passou |
| SQL 008 (criação, repetição, role incorreta) | passou/falhou conforme esperado |
| SQL 007 (primeira/segunda aplicação) | passou |
| CLI manual (sem confirmação, sem URL, autorizado) | passou/falhou conforme esperado |

Nenhum teste ignorado foi tratado como aprovado. A execução padrão mostra 2 suítes skip por
ausência de `TEST_DATABASE_URL`; com PG local, 32/32 passaram.

---

## 10. Pendências

1. Criar `validation_b1_cleanup` no Neon B1 via 008 seguro.
2. Aplicar 007 como `neondb_owner`, em transação.
3. Configurar `CLEANUP_DATABASE_URL` direto e `CLEANUP_EXPECTED_DATABASE`/`ROLE`.
4. Fazer deploy preview do código novo.
5. Validar rate limiting e IP interno Edge→Function em preview.
6. Validar cleanup manual, flag e preservação dos 2 registros sintéticos.
7. Definir orçamento total de tempo/lotes para a função agendada.
8. Não ativar cleanup/coleta em produção/homologação.

---

## 11. Sequência exata das operações remotas futuras

1. Confirmar Site ID, deploy, branch, database e executor.
2. Criar a role via 008 em canal seguro; validar atributos/memberships.
3. Aplicar 007 em transação; validar grants/índices/pós-condições.
4. Configurar `CLEANUP_DATABASE_URL` direto e `CLEANUP_EXPECTED_*` no Site ID B1.
5. Manter flag `false`.
6. Fazer deploy preview do código novo.
7. Abrir janela controlada, habilitar flag e invocar o CLI/função manualmente; o cron não roda em
   preview.
8. Validar old removido, recent preservado, lock, falha de lote e logs sem PII.
9. Desativar flag; fazer segundo deploy preview se a mudança de flag exigir deploy.
10. Confirmar estado final; não apagar os 2 registros sintéticos; não promover.

---

## 12. Estimativa de deploys e créditos

- Nenhum deploy/consumo nesta fase.
- Saldo recente: **140,0759**; plano Free.
- Mínimo de 1 deploy preview para levar o código novo; até 2 se ativação/desativação de flag exigir
  deploys separados.
- Reservar **até 30 créditos**; deploys draft anteriores mediram 0, mas não presumir custo zero.
- Nenhum upgrade/compra recomendado.

---

## 13. Classificação final

**1 — Aprovado localmente e pronto para autorização remota.** SQLs, role de menor privilégio,
guards de conexão/privilégio, invocação manual, cleanup, rateLimit e build estão preparados; os
testes locais passam 88/88, 19/19, 2/2, 32/32 e SQL/CLI específicos. Toda operação remota continua
pendente de autorização explícita.
