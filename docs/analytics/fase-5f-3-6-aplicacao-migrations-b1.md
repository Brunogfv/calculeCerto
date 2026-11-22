# Fase 5F.3.6 — Aplicação controlada das migrations no Neon B1

Status: **migrations 001–006 aplicadas exclusivamente em `validation_b1`; privilégios mínimos
confirmados; nenhum dado inserido; nenhuma alteração fora do B1**.
Data/hora: **2026-11-14T19:54:00-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 1 — Aprovado.**

---

## 1. Identidade e destino

| Item | Valor |
|---|---|
| Project ID | `square-mountain-69641645` |
| Nome do projeto | `portal-contas-homologacao` |
| Branch | `validation-b1` / `br-misty-sound-b6pnt7iw` |
| Database | `validation_b1` |
| Estado da branch | `ready` |
| PostgreSQL | 17.12 |
| Executor | `neondb_owner` |
| Credencial usada | connection string administrativa/migration do B1, não exibida |
| Role runtime | `validation_b1_runtime` |

O host da connection string foi comparado em memória com o endpoint retornado pela API Neon para
a branch `br-misty-sound-b6pnt7iw`:

- host esperado e usado: `ep-rough-glade-••••••••.c-2.sa-east-1.aws.neon.tech`;
- correspondência de Project ID, branch, database, executor e `sslmode=require`: confirmada;
- nenhuma connection string, senha ou token foi impresso.

A verificação de destino foi feita por duas fontes independentes: API/CLI Neon (Project ID e branch)
e identidade `current_database()`/`current_user` no banco antes da escrita.

---

## 2. Pré-verificação remota

Antes da aplicação:

| Verificação | Resultado |
|---|---|
| `current_database()` | `validation_b1` |
| `current_user` | `neondb_owner` |
| SSL do cliente | stream TLS criptografado; certificado par presente |
| Tabelas em `public` | 0 |
| `schema_migrations` | ausente |
| Funções/sequences em `public` | 0 |
| Dados de aplicação | 0 |
| `validation_b1_runtime` | sem grants de tabela |
| `validation_b1_runtime` `CONNECT` | sim |
| `validation_b1_runtime` `CREATE` | não |
| `validation_b1_runtime` `neondb` | sem CONNECT |

---

## 3. Arquivos e hashes auditados

Arquivos preparados, sem alteração nesta fase:

```text
database/b1/apply-b1-migrations.mjs
SHA-256 0A5868379FE3C100D877D86B2F08FEEC676F72432473B74511118F235BD1CA9C

database/b1/b1-privileges.sql
SHA-256 56312F9CF659FF2222FC2AD479C1B403EA45B01F532ABC3300A948015B14D5F2
```

Migrations canônicas:

```text
001_init.sql
1D99309EF467EA558834DA21E123F4D33DD4C5039F79655909150D765F49F590

002_phase2_review.sql
F45B0904D891427C13D6C4B537AE195BE86739C09CEF84137EAA890E4A26937F

003_phase4_html_capture.sql
6E26976E9F02AB3F606CB0A55EE636C9447A42C191B465627F1C651CCCD91199

004_phase4_audit_fixes.sql
85DA4452BDA5832170F05F6AD5D39C537E8C35BC99F79D0E7C54A4FDD44C3D78

005_phase4_cleanup_role.sql
3DC2C6585EC7A60ECD090584DD8382C4C5988EDD57712616626B3FAC228708FA

006_phase2_runtime_grants.sql
C91600D91CFE1BE3DECDF0821A2F60E4038E1644139D72170F70B21360C0EE6C
```

O wrapper usa os hashes SHA-256 das migrations, registra-os em `schema_migrations` e valida a
correspondência após a aplicação. Nenhum desses valores é secreto.

---

## 4. Auditoria de grants e revokes

O wrapper:

- usa `BEGIN` único e `COMMIT` somente após validações;
- valida `current_database() = validation_b1` e `current_user = neondb_owner`;
- exige `B1_APPLY_CONFIRM=APPLY_VALIDATION_B1`;
- aborta se `schema_migrations` existir ou se o banco não estiver vazio;
- rejeita operações incompatíveis com transação única;
- aplica 001–006 na ordem;
- revoga CONNECT, USAGE, tabelas, sequences e funções das roles herdadas
  `analytics_runtime` e `analytics_cleanup`;
- não altera atributos, memberships ou senhas de nenhuma role;
- concede à `validation_b1_runtime` apenas o necessário;
- executa ROLLBACK em erro.

Não há alteração em `neondb`, branch principal, produção ou homologação principal.

---

## 5. Aplicação

Comando executado uma única vez, a partir da raiz do repositório:

```powershell
$env:B1_DATABASE_URL = <owner/migration URL em memória>
$env:B1_APPLY_CONFIRM = "APPLY_VALIDATION_B1"
node database/b1/apply-b1-migrations.mjs
```

Resultado:

```text
applied: 001_init.sql, 002_phase2_review.sql, 003_phase4_html_capture.sql,
         004_phase4_audit_fixes.sql, 005_phase4_cleanup_role.sql,
         006_phase2_runtime_grants.sql
migrations: 6
tables: 14
runtimeRole: validation_b1_runtime
inheritedRolesRevoked: true
committed: true
secretsPrinted: false
```

A transação foi concluída com `COMMIT`. Nenhuma aplicação alternativa ou parcial foi executada.

---

## 6. Estrutura pós-aplicação

| Verificação | Resultado |
|---|---|
| Tabelas de aplicação | 13 |
| `schema_migrations` | 1 tabela, 6 registros |
| Total de tabelas em `public` | 14 |
| Índices em `public` | 41 |
| Constraints em `public` | 52 |
| Funções em `public` | 0 |
| Sequences em `public` | 0 |
| Tabelas faltantes | nenhuma |
| Tabelas inesperadas | nenhuma |
| Checksums das migrations | correspondem aos arquivos canônicos |
| Dados em todas as tabelas | 0 |

Tabelas esperadas e presentes: `visitors`, `sessions`, `pageviews`, `events`,
`affiliate_clicks`, `rate_limits`, `ingest_events`, `html_events`, `html_traffic_daily`,
`html_indicators_monthly`, `edge_nonces`, `edge_rate_limits`, `edge_daily_counters`.

---

## 7. Privilégios efetivos da runtime

| Tabela | SELECT | INSERT | UPDATE | DELETE | TRUNCATE |
|---|---|---|---|---|---|
| `html_events` | não | sim | não | não | não |
| `html_traffic_daily` | sim | sim | sim | não | não |
| `html_indicators_monthly` | sim | sim | sim | não | não |
| `edge_daily_counters` | sim | sim | sim | não | não |
| `edge_nonces` | não | sim | não | não | não |
| `edge_rate_limits` | sim | sim | sim | não | não |

O SELECT nas tabelas agregadas e nos contadores é necessário para `ON CONFLICT`/`RETURNING`.
`html_events` e `edge_nonces` não precisam de SELECT para o fluxo atual.

| Verificação da runtime | Resultado |
|---|---|
| `CONNECT` em `validation_b1` | sim |
| `CREATE` no database | não |
| `USAGE` no schema | sim |
| `CREATE` no schema | não |
| `neondb` | sem CONNECT |
| DELETE/TRUNCATE | nenhum |
| DDL | negado |
| Superuser/CREATEDB/CREATEROLE/REPLICATION/BYPASSRLS | todos falsos |
| Memberships | nenhuma |
| Objetos possuídos | nenhum |

A conexão real como `validation_b1_runtime` foi validada: database `validation_b1`, usuário
correto, stream TLS criptografado e certificado par presente.

### 7.1 Roles herdadas

| Verificação | Resultado |
|---|---|
| `analytics_runtime` existe | sim (LOGIN) |
| `analytics_cleanup` existe | sim (LOGIN) |
| Privilégios de tabela das duas roles na Fase 4 | nenhum |
| `analytics_runtime` `CONNECT` no B1 | não |
| Memberships das roles | inalteradas |
| Atributos das roles | inalterados |

As roles herdadas continuam existindo, mas não têm privilégios de tabela nem CONNECT no B1. O
`USAGE` de schema que aparece via `PUBLIC` não permite acesso às tabelas.

### 7.2 Default privileges

O default ACL existente é apenas de `cloud_admin` para `neon_superuser`; não há default ACL para
`validation_b1_runtime`. Nenhum privilégio futuro é herdado automaticamente.

---

## 8. Testes negativos

Testes remotos foram somente de catálogo (sem escrita). Os testes reais de operação foram feitos no
PostgreSQL 17 local, antes desta aplicação:

| Teste | Resultado |
|---|---|
| Runtime DELETE em `html_events` | negado: `42501` |
| Runtime TRUNCATE em `html_events` | negado: `42501` |
| Runtime CREATE/ALTER TABLE | negado: `42501` |
| Runtime SELECT em `pageviews`/`visitors` | negado: `42501` |
| Runtime acesso a `neondb` | sem CONNECT |
| Cleanup INSERT/UPDATE/TRUNCATE | negado: `42501` |
| Cleanup acesso à Fase 2/3 | negado: `42501` |
| Replay de nonce | rejeitado: `23505` |
| Wrapper com falha artificial após migrations | rollback; 0 tabelas e `schema_migrations` ausente |

Nenhum teste destrutivo foi executado no Neon.

---

## 9. Isolamento e ausência de dados

| Verificação | Resultado |
|---|---|
| Database atual | `validation_b1` |
| Nenhuma escrita em `neondb` | confirmado |
| Nenhuma alteração na branch principal | confirmado |
| Tabelas com dados | 0 |
| Dados sintéticos inseridos | 0 |
| Limpeza executada | não |
| Migrations registradas no B1 | 6 |
| Migrations no banco principal | não verificadas por leitura de dados; nenhuma conexão/escrita fora do B1 |
| Roles criadas/excluídas/alteradas | nenhuma |
| Memberships alteradas | nenhuma |

---

## 10. Ambientes e Netlify

| Item | Estado |
|---|---|
| Produção | intacta; deploy `6af0feebef830ebab5cd25dd`; pública |
| Homologação principal | intacta; deploy `6af47527818a48a5dbbef2c4`; privada |
| B1 | deploy `6af7b9adbbe4d110c7592f70`; `deploy-preview`; não publicado |
| Variáveis B1 | `DATABASE_URL`, `EDGE_INGEST_SECRET`; inalteradas |
| Variáveis de produção | inalteradas (0) |
| Variáveis de homologação | inalteradas (11) |
| Variáveis compartilhadas | 0 |
| Flags de coleta no B1 | ausentes/desativadas |
| Deploy novo | nenhum |
| Commit/push/PR | nenhum |

---

## 11. Pendências

1. Autorização específica para ativar temporariamente as flags e executar o primeiro teste de
   runtime Edge → Function → Neon com dados sintéticos.
2. Definir rate limiting antes da Function/Neon; o Netlify continua sem regra nativa.
3. Definir retenção das tabelas da Fase 2/3; a role de cleanup B1 não foi criada.
4. Testar HMAC, nonce/replay, limite diário e latência em janela controlada.
5. Não executar limpeza, POST, deploy ou ativação até autorização própria.

---

## 12. Classificação final

**1 — Aprovado.** As migrations 001–006 foram aplicadas corretamente em `validation_b1`, os
privilégios mínimos da runtime foram confirmados, as roles herdadas foram removidas do acesso às
tabelas do B1, o banco permanece sem dados e produção/homologação principal foram preservadas.
