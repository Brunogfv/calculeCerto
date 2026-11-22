# Fase 5F.3.4 — Auditoria e preparação das migrations do Neon B1

Status: **auditoria concluída; migrations compatíveis com PostgreSQL 17 nos testes locais; nenhuma
migration, tabela, role, permissão ou variável foi alterada remotamente**.
Data/hora: **2026-11-14T19:30:40-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** A estrutura é compatível e os testes locais
passaram, mas a aplicação remota exige uma decisão sobre roles herdadas e uma concessão adicional
para `validation_b1_runtime`. O procedimento remoto está preparado abaixo e **não foi executado**.

---

## 1. Isolamento remoto antes da auditoria

Consultas somente de leitura na role `validation_b1_runtime`:

| Verificação | Resultado |
|---|---|
| Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` / `br-misty-sound-b6pnt7iw` |
| Database | `validation_b1` |
| `current_database()` | `validation_b1` |
| `current_user` | `validation_b1_runtime` |
| SSL | stream TLS criptografado; certificado par presente |
| Tabelas em `public` | 0 |
| `schema_migrations` | ausente |
| Dados de aplicação | nenhum |
| `CONNECT` em `validation_b1` | sim |
| `CREATE` em `validation_b1` | não |
| `CONNECT` em `neondb` | não |
| `USAGE` em `public` | sim |
| `CREATE` em `public` | não |
| Superuser/CREATEDB/CREATEROLE/REPLICATION/BYPASSRLS | todos `false` |
| Memberships da role B1 | nenhuma |
| Objetos possuídos | 0 |

A role B1 não tem privilégios administrativos e não acessa `neondb`.

### 1.1 Roles herdadas encontradas na branch B1

A branch B1 foi criada a partir da branch principal e contém cópias das roles de homologação:

| Role | Existe no B1 | Login | Atributos administrativos |
|---|---|---|---|
| `analytics_runtime` | sim (cópia herdada) | sim | nenhum |
| `analytics_cleanup` | sim (cópia herdada) | sim | nenhum |
| `neondb_owner` | sim | sim | `CREATEDB`, `CREATEROLE`, `REPLICATION`, `BYPASSRLS` (owner) |
| `validation_b1_runtime` | sim | sim | nenhum |

**Ponto crítico:** `analytics_runtime` e `analytics_cleanup` existem e têm LOGIN na branch B1.
As migrations 003, 005 e 006 concedem privilégios a esses nomes quando eles existem. Portanto, o
método canônico não fica restrito à role B1.

---

## 2. Arquivos inspecionados

Migrations canônicas, sem modificação:

- `db/migrations/001_init.sql`
- `db/migrations/002_phase2_review.sql`
- `db/migrations/003_phase4_html_capture.sql`
- `db/migrations/004_phase4_audit_fixes.sql`
- `db/migrations/005_phase4_cleanup_role.sql`
- `db/migrations/006_phase2_runtime_grants.sql`

Código e mecanismo de aplicação:

- `scripts/migrate.mjs`;
- `scripts/cleanup-rate-limits.mjs`;
- `scripts/cleanup-html-capture.mjs`;
- `netlify/functions/capture-html.mjs`;
- `netlify/functions/collect.mjs`;
- `netlify/functions/cleanup-html-capture.mjs`;
- `netlify/functions/_lib/capture-handler.mjs`;
- `netlify/functions/_lib/collect-handler.mjs`;
- `netlify/functions/_lib/rate-limit.mjs`;
- `netlify/functions/_lib/cleanup-html-capture.mjs`;
- `netlify/functions/_lib/validation.mjs`;
- `validation-b1/netlify/functions/*` e módulos compartilhados correspondentes.

---

## 3. Ordem e objetos das migrations

Ordem aplicada pelo runner: ordenação lexical dos nomes, `001` a `006`.

| Migration | Objetos principais |
|---|---|
| `001_init.sql` | `visitors`, `sessions`, `pageviews`, `events`, `affiliate_clicks`, `rate_limits` e índices |
| `002_phase2_review.sql` | `ingest_events`, FKs de visitante em `pageviews`/`events`/`affiliate_clicks`, `slot NOT NULL`, checks de contadores |
| `003_phase4_html_capture.sql` | `html_events`, `html_traffic_daily`, `html_indicators_monthly`, `edge_nonces`, `edge_rate_limits`, índices e grants condicionais para `analytics_runtime` |
| `004_phase4_audit_fixes.sql` | `edge_daily_counters` e checks `analytics_only` |
| `005_phase4_cleanup_role.sql` | grants/revokes condicionais para `analytics_cleanup` nas tabelas da Fase 4 |
| `006_phase2_runtime_grants.sql` | grants condicionais para `analytics_runtime` nas tabelas das Fases 2/3 |

O runner cria `schema_migrations (filename, checksum, applied_at)` fora das migrations canônicas.

Não há `SERIAL`, sequences, funções ou triggers nas migrations. Não há dependência oculta de
sequences/funções/triggers. `updated_at` é atualizado pelo código da aplicação, não por trigger.

---

## 4. Matriz de privilégios encontrada

### 4.1 Privilégios canônicos após 001–006

| Role | Fase 2/3 | Fase 4 | DELETE | INSERT/UPDATE | DDL |
|---|---|---|---|---|---|
| `analytics_runtime` (se existir) | SELECT/INSERT/UPDATE em `sessions`, `rate_limits`, `visitors`; SELECT/INSERT em `pageviews`, `events`, `ingest_events`, `affiliate_clicks` | SELECT/INSERT/UPDATE | não | sim | não |
| `analytics_cleanup` (se existir) | nenhum | SELECT/DELETE | sim, Fase 4 | não | `CREATE` revogado |
| `validation_b1_runtime` | **nenhum** | **nenhum** | não | não | não |
| `neondb_owner` | owner dos objetos | owner | owner | owner | owner |

### 4.2 Consequências para o B1

- `validation_b1_runtime` **não recebe nenhum grant de tabela das migrations 001–006**. Sem uma
  concessão adicional, a Function B1 falharia ao gravar nas tabelas da Fase 4.
- `analytics_runtime` herdada receberia privilégios na Fase 4 e na Fase 2/3 do B1.
- `analytics_cleanup` herdada receberia SELECT/DELETE na Fase 4 do B1.
- As duas roles herdadas têm LOGIN; não são roles exclusivas B1 e não devem ser usadas como runtime
  ou cleanup do B1.

---

## 5. Testes locais em PostgreSQL 17

Ambiente: container temporário isolado `postgres:17` (PostgreSQL **17.11**), banco
`validation_b1_test`, sem conexão com Neon. Foram criadas localmente as roles
`analytics_runtime`, `analytics_cleanup` e `validation_b1_runtime` (NOLOGIN, apenas para testes) e
aplicadas as migrations 001–006 pelo runner canônico.

### 5.1 Estrutura

| Verificação | Resultado |
|---|---|
| Migrations aplicadas | 6/6 |
| Tabelas de aplicação | 13 |
| `schema_migrations` | 6 registros |
| Índices em `public` | 41 (incluindo índices de PK) |
| Constraints em `public` | 52 |
| Tabelas esperadas | todas presentes |
| Objetos inesperados | nenhum |
| `schema_migrations` consistente | sim |

Tabelas de aplicação: `visitors`, `sessions`, `pageviews`, `events`, `affiliate_clicks`,
`rate_limits`, `ingest_events`, `html_events`, `html_traffic_daily`,
`html_indicators_monthly`, `edge_nonces`, `edge_rate_limits`, `edge_daily_counters`.

### 5.2 Runtime após concessão mínima simulada

Foi simulado o grant que o plano exige para a role B1: `USAGE` no schema e
`SELECT, INSERT, UPDATE` nas seis tabelas da Fase 4, sem Fase 2/3 e sem `DELETE`.

| Teste | Resultado |
|---|---|
| SELECT/INSERT/UPDATE nas tabelas da Fase 4 | permitido |
| INSERT com `RETURNING` | permitido |
| UPSERT em `edge_rate_limits` / `edge_daily_counters` | permitido |
| UPSERT em `html_traffic_daily` / `html_indicators_monthly` | permitido |
| Nonce duplicado | rejeitado com `23505` |
| DELETE em `html_events` | negado: `42501` |
| TRUNCATE em `html_events` | negado: `42501` |
| CREATE TABLE | negado: `42501` (schema `public`) |
| SELECT em `visitors`/`pageviews` | negado: `42501` |
| Rate limit / contador / nonce / evento | operações compatíveis |

### 5.3 Cleanup

| Teste | Resultado |
|---|---|
| SELECT/DELETE nas tabelas da Fase 4 | permitido |
| DELETE de registro antigo | permitido; registro recente preservado |
| INSERT em `html_events` | negado: `42501` |
| UPDATE em `html_events` | negado: `42501` |
| TRUNCATE | negado: `42501` |
| SELECT em `pageviews` (Fase 2) | negado: `42501` |
| Escrita nas tabelas da Fase 2/3 | não permitida |

### 5.4 Roles herdadas

| Teste | Resultado |
|---|---|
| `analytics_runtime` SELECT em `pageviews` | permitido (grant da migration 006) |
| `analytics_runtime` SELECT em `html_events` | permitido (grant da migration 003) |
| `analytics_runtime` DELETE em `html_events` | negado |
| `analytics_cleanup` SELECT/DELETE em `html_events` | permitido |
| `analytics_cleanup` SELECT em `pageviews` | negado |
| Atributos administrativos das três roles | todos `false` |

O teste local confirma o risco: as migrations canônicas concedem privilégios às roles herdadas
quando elas existem, como ocorre na branch B1.

### 5.5 Reexecução e falhas

| Cenário | Resultado |
|---|---|
| Reexecutar migrations já aplicadas | todas ignoradas; nenhuma reaplicação |
| Checksum alterado de migration aplicada | falha antes de reaplicar: `Migração alterada após ser aplicada` |
| `schema_migrations` com arquivo ausente (`999_missing.sql`) | **não detectado**; o runner ignora silenciosamente a ausência |
| Falha parcial em migration posterior | transação da migration revertida; 001–006 permaneceram, 007 não registrada e tabela parcial ausente |
| Ordem | ordenação lexical; não há validação explícita de dependências entre arquivos |

A falha parcial foi testada com uma migration artificial em diretório temporário, sem alterar as
migrations canônicas. O banco de teste foi descartado ao final.

---

## 6. Privacidade

### 6.1 Fase 2/3

- `visitors.visitor_id` é identificador opaco, sem IP bruto.
- `sessions` contém `user_agent`, `country_code`, `region`, `city`, `language`, referrer/UTM e
  contadores. `user_agent` e geolocalização podem ser dados pessoais ou quase identificadores.
- `pageviews` pode conter `path`, `title` e `referrer`; o validador atual rejeita query/fragmento
  no caminho, mas `title`/`referrer` ainda podem carregar informação contextual.
- `events.metadata` é limitado pelo validador a campos de evento; valores de calculadora e chaves
  proibidas são rejeitados antes da gravação.
- `affiliate_clicks` guarda produto/categoria/slot, sem valores de cálculo.
- Não há coluna de IP bruto.
- `rate_limits.bucket_key` é HMAC/chave opaca; não é IP bruto.

### 6.2 Fase 4

- `html_events` não guarda IP bruto nem User-Agent completo; guarda país, path, `ua_family`,
  `ua_version`, client hints, metadados de fetch e classificação.
- `signals`, `client_hints` e `fetch_metadata` podem ser quase identificadores, mas não há IP.
- `html_traffic_daily`/`html_indicators_monthly` são agregados.
- `edge_nonces` guarda nonce; `edge_rate_limits` guarda HMAC de rate key.
- `edge_daily_counters` é agregado diário.

### 6.3 Retenção

- `cleanup-html-capture` remove dados da Fase 4 segundo retenções configuradas.
- `cleanup-rate-limits` remove `rate_limits` (Fase 2), mas a migration 005 **não concede DELETE em
  `rate_limits` para `analytics_cleanup`**. Se esse script for executado com a role de cleanup, ele
  falhará; ele usa a connection string de migração/runtime no modo produção. Documentado como
  dependência separada.
- Não existe rotina de retenção definida nesta fase para `sessions`, `pageviews`, `events` e
  `affiliate_clicks`; isso precisa de decisão de privacidade antes de produção.

---

## 7. Rate limiting

| Camada | Situação |
|---|---|
| Netlify nativo | `traffic_rules_config_per_scope = {}`; nenhuma regra configurada; conta Free |
| Edge → Function | HMAC e nonce impedem payload não autenticado, mas não impedem custo de requisições inválidas que chegam à Function |
| Function / banco | `edge_rate_limits`, `edge_daily_counters` e `rate_limits` dependem de tabelas/grants; não estão ativos no B1 |
| Rate limit por IP | usa HMAC/chave opaca; não persiste IP bruto |
| Limite diário | previsto no código, mas sem tabelas/grants no B1 |
| Replay | suportado por `edge_nonces` e `html_events`/PKs; não ativo sem migrations |

Recomendação: não considerar o HMAC suficiente para proteger a Function de custo de requisições
inválidas. Antes de ativar coleta, definir uma proteção de borda/plataforma (rate limit/firewall)
ou aceitar explicitamente o risco de chamadas inválidas chegarem à Function; a proteção no banco é
posterior ao HMAC e depende da Fase 4.

Nenhuma regra, teste de carga ou ativação foi executada.

---

## 8. Problemas encontrados e alternativas

### P1 — Role B1 sem grants de tabela

As migrations canônicas concedem tabelas Fase 4 a `analytics_runtime`, não a
`validation_b1_runtime`. Aplicar 001–006 isoladamente deixa a role B1 sem acesso às tabelas.

### P2 — Roles herdadas com LOGIN recebem privilégios

`analytics_runtime` e `analytics_cleanup` existem na branch B1 (cópias da branch principal) e têm
LOGIN. As migrations 003, 005 e 006 concedem privilégios a elas se existirem. Isso amplia o acesso
de roles que não são exclusivas do B1.

### P3 — Retenção da Fase 2/3 e rate limits antigos

`cleanup-html-capture` cobre apenas Fase 4. `cleanup-rate-limits` não tem grant correspondente em
`analytics_cleanup`; a retenção de `sessions`/`pageviews`/`events`/`affiliate_clicks` não está
definida.

### Alternativas para P2

**A. Preparar roles exclusivas B1 antes da aplicação.**
Não é viável sem alterar/renomear as roles herdadas ou alterar as migrations canônicas, porque os
nomes `analytics_runtime`/`analytics_cleanup` já existem na branch e são hard-coded nas migrations.
Criar roles com outros nomes não faria os `DO` blocks concederem os privilégios.

**B. Aplicação transacional controlada, sem alterar as migrations canônicas.**
Aplicar 001–006 em uma única transação como `neondb_owner`, depois revogar os grants concedidos às
roles herdadas e conceder apenas à role B1, tudo antes do `COMMIT`. O teste local confirmou que o
resultado final pode ser:

- `analytics_runtime`/`analytics_cleanup` sem privilégios nas tabelas do B1;
- `validation_b1_runtime` com `CONNECT`, `USAGE` e `SELECT/INSERT/UPDATE` nas seis tabelas da Fase 4;
- sem `DELETE`, `TRUNCATE` ou DDL para a role B1.

A alternativa B é a recomendada no plano abaixo. Ela não foi executada remotamente.

---

## 9. Plano de aplicação remota (não executado)

### 9.1 Pré-requisitos

1. Autorização específica para escrita em `validation_b1`.
2. Confirmar que o Project ID é `square-mountain-69641645`, branch `validation-b1`, database
   `validation_b1`.
3. Confirmar `current_database() = validation_b1` e `current_user = neondb_owner` antes de qualquer
   escrita; abortar se divergir.
4. Confirmar que `validation_b1_runtime` existe e que `analytics_runtime`/`analytics_cleanup` são
   cópias herdadas que não serão usadas.
5. Confirmar SSL e que `neondb` não será alvo.
6. Fazer snapshot/backup lógico ou usar a possibilidade de reset da branch Neon; o banco está
   vazio, mas a recuperação precisa ser definida antes.

### 9.2 Roles

- Não criar nem alterar roles.
- Usar `neondb_owner` apenas para aplicar migrations.
- Não usar `analytics_runtime`/`analytics_cleanup` como runtime/cleanup do B1.
- Manter `validation_b1_runtime` como única role de runtime.

### 9.3 Ordem de aplicação

1. Abrir conexão como `neondb_owner` no database `validation_b1`.
2. Iniciar transação única.
3. Criar/garantir `schema_migrations` com o mesmo formato do runner.
4. Aplicar `001_init.sql`, `002_phase2_review.sql`, `003_phase4_html_capture.sql`,
   `004_phase4_audit_fixes.sql`, `005_phase4_cleanup_role.sql` e `006_phase2_runtime_grants.sql`
   nessa ordem, registrando filename/checksum.
5. Antes do commit:
   - `REVOKE CONNECT ON DATABASE validation_b1 FROM analytics_runtime, analytics_cleanup;`
   - revogar todos os privilégios de tabela dessas duas roles nas tabelas da Fase 4;
   - garantir `CONNECT`/`USAGE` para `validation_b1_runtime`;
   - conceder `SELECT, INSERT, UPDATE` nas seis tabelas da Fase 4 para `validation_b1_runtime`;
   - não conceder `DELETE`, `TRUNCATE`, DDL, Fase 2/3 ou privilégios administrativos.
6. Executar consultas de validação ainda na transação.
7. `COMMIT` somente se todas as verificações passarem; caso contrário, `ROLLBACK`.

### 9.4 Rollback e interrupção

- Interromper se qualquer identificador divergir.
- Interromper se qualquer migration falhar; usar `ROLLBACK`.
- Interromper se qualquer grant às roles herdadas permanecer após a revogação.
- Interromper se `validation_b1_runtime` receber privilégios além dos seis tabelas da Fase 4.
- Interromper se houver qualquer conexão acidental a `neondb` ou outro database.
- Se o commit ocorrer e a validação falhar, não executar correções improvisadas; usar reset/restore
  da branch ou aguardar autorização específica.

### 9.5 Consultas pós-aplicação

- `current_database()`, `current_user`, `version()`.
- Lista de tabelas e `schema_migrations`.
- `has_database_privilege`/`has_schema_privilege`/`has_table_privilege` para
  `validation_b1_runtime`, `analytics_runtime` e `analytics_cleanup`.
- Tentativas negativas de DELETE/TRUNCATE/DDL e acesso a Fase 2/3.
- `SELECT count(*)` das tabelas (deve ser 0 antes de dados sintéticos).
- Confirmar ausência de grants às roles herdadas e de acesso ao `neondb`.

---

## 10. Pendências

1. Decidir entre A/B para as roles herdadas; recomendação: **B**, com wrapper transacional.
2. Autorizar a aplicação remota e o grant adicional para `validation_b1_runtime`.
3. Definir retenção das tabelas da Fase 2/3 e o papel responsável por `cleanup-rate-limits`.
4. Definir proteção de rate limiting antes da Function/Neon.
5. Após aplicação, validar runtime com dados sintéticos `v_fase5f33_`/`v_fase5f34_` em fase própria.

Nenhuma migration foi aplicada remotamente. Nenhuma role, tabela, permissão, variável, flag ou dado
foi criado no Neon B1.
