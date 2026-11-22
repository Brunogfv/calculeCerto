# Fase 5F.53 - Correcao local do contrato de permissoes do runtime B1

Status: **correcao local concluida; nenhuma alteracao remota executada**.
Data de referencia: **2026-11-20**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.

**Classificacao: 1 - Contrato de permissoes validado.**

O SQL minimo, a migration 007, o wrapper B1 e os testes positivos/negativos foram executados em
PostgreSQL 17 local isolado. Nenhum comando foi aplicado no Neon, Netlify, producao ou banco remoto.

---

## 1. Operacoes SQL reais identificadas

O endpoint `/api/collect` executa as seguintes operacoes, nesta ordem real de codigo:

### 1.1 Rate limit, antes da transacao principal

Arquivo: `netlify/functions/_lib/rate-limit.mjs`.

```sql
INSERT INTO rate_limits (bucket_key, window_start, count)
VALUES ($1, $2, 1)
ON CONFLICT (bucket_key, window_start)
DO UPDATE SET count = rate_limits.count + 1
RETURNING count
```

- Executado ate tres vezes, sequencialmente: IP HMAC, sessao e visitante.
- `ON CONFLICT` exige INSERT/UPDATE; `RETURNING count` exige SELECT de `count`.
- O contador e incrementado mesmo quando o limite e excedido; nesse caso o handler retorna 429
  antes de abrir a transacao de eventos.
- Nao ha DELETE nem TRUNCATE nesse fluxo.

### 1.2 Inicio da transacao

Arquivo: `netlify/functions/_lib/collect-handler.mjs`, dentro de `withTransaction`:

```sql
SELECT visitor_id
FROM sessions
WHERE session_id = $1
```

- Le `sessions.session_id` e `sessions.visitor_id` para impedir troca de visitante na mesma sessao.

### 1.3 Deduplicacao global

```sql
INSERT INTO ingest_events (event_id, event_name, received_at)
VALUES ($1, $2, $3)
ON CONFLICT (event_id) DO NOTHING
RETURNING event_id
```

- INSERT em `ingest_events`.
- `ON CONFLICT`/`RETURNING event_id` exige SELECT de `event_id`.
- Se `rowCount = 0`, a transacao termina sem gravar visitante, sessao, pageview ou evento.

### 1.4 Visitante

```sql
INSERT INTO visitors (visitor_id, first_seen_at, last_seen_at)
VALUES ($1, $2, $2)
ON CONFLICT (visitor_id)
DO UPDATE SET last_seen_at = GREATEST(visitors.last_seen_at, EXCLUDED.last_seen_at)
```

- INSERT, UPDATE e SELECT em `visitors`.
- O SELECT e necessario para a expressao `visitors.last_seen_at` no conflito.

### 1.5 Sessao

```sql
INSERT INTO sessions (
    session_id, visitor_id, started_at, last_seen_at, ended_at,
    landing_path, exit_path, referrer, referrer_host, source, medium, campaign,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
    device_type, browser, os, screen_width, screen_height, language,
    country_code, is_test, consent_version, updated_at
) VALUES (...)
ON CONFLICT (session_id) DO UPDATE SET
    last_seen_at = GREATEST(sessions.last_seen_at, EXCLUDED.last_seen_at),
    ended_at = COALESCE(EXCLUDED.ended_at, sessions.ended_at),
    exit_path = COALESCE(EXCLUDED.exit_path, sessions.exit_path),
    is_test = sessions.is_test OR EXCLUDED.is_test,
    consent_version = COALESCE(EXCLUDED.consent_version, sessions.consent_version),
    updated_at = now()
```

- SELECT, INSERT e UPDATE em `sessions`.
- O SELECT e necessario para o `SELECT visitor_id` anterior e para as referencias a
  `sessions.last_seen_at`, `sessions.ended_at`, `sessions.exit_path`, `sessions.is_test` e
  `sessions.consent_version` no conflito.

### 1.6 Pageview

```sql
INSERT INTO pageviews (
    event_id, session_id, visitor_id, path, title, referrer, referrer_host,
    occurred_at, received_at, bot_class, is_test
) VALUES (...)
ON CONFLICT (event_id) DO NOTHING
RETURNING event_id
```

- INSERT em `pageviews`; SELECT de `event_id` por causa do conflito/retorno.
- Se inserido:

```sql
UPDATE sessions
SET pageview_count = pageview_count + 1,
    exit_path = $2,
    last_seen_at = GREATEST(last_seen_at, $3),
    updated_at = now()
WHERE session_id = $1
```

- UPDATE em `sessions`; sem INSERT/DELETE adicional.

### 1.7 Eventos nao-pageview

Inclui `session_start`, `session_end`, `engagement`, `calculator_start`,
`calculator_complete` e `affiliate_click`.

```sql
INSERT INTO events (
    event_id, session_id, visitor_id, name, page_path, target, metadata,
    occurred_at, received_at, bot_class, is_test
) VALUES (...)
ON CONFLICT (event_id) DO NOTHING
RETURNING event_id
```

- INSERT em `events`; SELECT de `event_id` por causa do conflito/retorno.
- Se inserido:

```sql
UPDATE sessions
SET event_count = event_count + 1,
    engagement_ms = GREATEST(engagement_ms, $2),
    ended_at = CASE WHEN $3::timestamptz IS NULL THEN ended_at ELSE $3 END,
    exit_path = CASE WHEN $4::text IS NULL THEN exit_path ELSE $4 END,
    last_seen_at = GREATEST(last_seen_at, $5),
    updated_at = now()
WHERE session_id = $1
```

### 1.8 Affiliate click

```sql
INSERT INTO affiliate_clicks (
    event_id, session_id, visitor_id, product, category, slot,
    page_path, occurred_at, received_at, is_test
) VALUES (...)
ON CONFLICT (event_id) DO NOTHING
```

- INSERT em `affiliate_clicks`.
- O teste demonstrou que o `ON CONFLICT` tambem exige SELECT de `event_id`; nao e necessario
  liberar as demais colunas.

### 1.9 Objetos auxiliares

- Nao existem sequencias/`SERIAL`/`IDENTITY` no schema.
- Nao existem views, funcoes ou triggers de usuario no schema local.
- Nao ha `ON DELETE` executado pelo collect; as FKs sao apenas verificadas nos INSERTs.
- Nao ha DDL, DELETE, TRUNCATE, advisory lock ou operacao administrativa no `/api/collect`.

---

## 2. Matriz minima de privilegios por tabela

### 2.1 Privilegios concedidos a `validation_b1_runtime`

| Tabela | SELECT | INSERT | UPDATE | DELETE | TRUNCATE | Escopo real |
|---|---|---|---|---|---|---|
| `visitors` | sim | sim | sim | nao | nao | tabela inteira; 3 colunas usadas |
| `sessions` | sim | sim | sim | nao | nao | tabela inteira; SELECT do visitante + upsert/contadores |
| `rate_limits` | sim | sim | sim | nao | nao | tabela inteira; 3 colunas usadas |
| `ingest_events` | somente `event_id` | sim | nao | nao | nao | conflito/retorno do event_id |
| `pageviews` | somente `event_id` | sim | nao | nao | nao | conflito/retorno do event_id |
| `events` | somente `event_id` | sim | nao | nao | nao | conflito/retorno do event_id |
| `affiliate_clicks` | somente `event_id` | sim | nao | nao | nao | conflito do event_id |

### 2.2 Permissoes de schema e banco

| Objeto | Privilegio | Necessidade |
|---|---|---|
| database `validation_b1` | CONNECT | connection da runtime |
| schema `public` | USAGE | resolver tabelas |
| schema `public` | CREATE | **nao concedido** |
| database | CREATE | **nao concedido** |
| `schema_migrations` | qualquer | **nao concedido** |
| sequencias | qualquer | **nao existem/nao concedido** |
| views/funcoes/triggers | qualquer | **nao existem/nao concedido** |

### 2.3 Permissoes de coluna avaliadas

- `pageviews`, `events`, `affiliate_clicks` e `ingest_events` recebem apenas
  `SELECT(event_id)`, necessario para `ON CONFLICT ... RETURNING event_id`.
- Nao recebem SELECT de `path`, `metadata`, `product`, `event_name` ou demais colunas.
- `visitors`, `sessions` e `rate_limits` usam SELECT de tabela porque o codigo consulta ou
  referencia multiplas colunas no mesmo fluxo; a granularidade por coluna aumentaria a fragilidade
  sem reduzir o acesso funcional relevante.
- Nao foram concedidos privilégios de coluna para UPDATE/INSERT; o SQL usa privilegios de tabela
  apenas nas tres tabelas que realmente recebem essas operacoes.

### 2.4 Heranca, ownership e memberships

- `validation_b1_runtime` nao possui membership em `validation_b1_cleanup` nem em
  `neondb_owner`.
- Nao possui ownership de tabela, schema, database ou sequencia.
- Nao possui `SUPERUSER`, `CREATEDB`, `CREATEROLE`, `REPLICATION` ou `BYPASSRLS`.
- Nao possui `CREATE` no schema `public`.
- Nao pode assumir as roles cleanup ou owner via `SET ROLE`.

### 2.5 Role cleanup

`validation_b1_cleanup` nao foi alterada pelo novo SQL. Ela continua restrita a retencao
previamente autorizada; nenhum DELETE/TRUNCATE/DDL novo foi concedido.

---

## 3. Migration 007

Arquivo: `db/migrations/007_remove_session_user_agent.sql`.

```sql
ALTER TABLE sessions
    DROP COLUMN IF EXISTS user_agent;
```

### Verificacoes

| Item | Resultado local |
|---|---|
| PostgreSQL | 17.11 (imagem `postgres:17`); remoto esperado 17.12 |
| Sete migrations aplicadas | sim |
| Tabelas publicas | 14 |
| `sessions.user_agent` | zero ocorrencias |
| Dependencias de views | nenhuma view no schema |
| Dependencias de triggers | nenhum trigger de usuario |
| Dependencias de funcoes | nenhuma funcao de usuario |
| Sequencias | nenhuma |
| Idempotencia | `DROP COLUMN IF EXISTS` |
| Transacao | aplicada dentro do wrapper B1 em transacao unica |
| Historico 001-006 | aplicado antes da 007, sem alteracao dos checksums |
| Codigo de ingestao | sem referencia a `user_agent`; 137/137 testes analytics passam |

O wrapper `database/b1/apply-b1-migrations.mjs` foi ajustado localmente para:

1. aplicar 001-006;
2. aplicar os privilegios fase 4 existentes;
3. aplicar 007;
4. aplicar o novo SQL de collect;
5. validar sete migrations, 14 tabelas, ausencia da coluna e privilegios.

A 007 nao foi aplicada no Neon.

---

## 4. SQL minimo de grants proposto

Arquivo novo: `database/b1/009-runtime-collect-privileges.sql`.

O SQL e explicito, roda dentro da transacao do wrapper e nao altera roles, ownership, cleanup ou
tabelas. Resumo:

```sql
GRANT SELECT, INSERT, UPDATE ON TABLE visitors TO validation_b1_runtime;
GRANT SELECT, INSERT, UPDATE ON TABLE sessions TO validation_b1_runtime;
GRANT SELECT, INSERT, UPDATE ON TABLE rate_limits TO validation_b1_runtime;

GRANT INSERT ON TABLE ingest_events, pageviews, events, affiliate_clicks
    TO validation_b1_runtime;

GRANT SELECT (event_id) ON TABLE ingest_events, pageviews, events, affiliate_clicks
    TO validation_b1_runtime;
```

O arquivo inclui:

- preflight de database `validation_b1`, executor `neondb_owner`, sete migrations, 14 tabelas,
  ausencia de `user_agent`, ausencia de atributos administrativos, memberships e ownership;
- pos-verificacao de todos os privilegios necessarios;
- verificacao negativa de DELETE, TRUNCATE, UPDATE indevido, SELECT de tabela inteira nas tabelas
  de eventos, SELECT em `schema_migrations` e CREATE no schema;
- nenhuma permissao para `analytics_runtime`, `analytics_cleanup`, `validation_b1_cleanup` ou
  producao.

Consultas auxiliares:

- `database/b1/009-runtime-collect-preflight.sql` - somente leitura, para antes da aplicacao;
- `database/b1/009-runtime-collect-postflight.sql` - somente leitura, para depois da aplicacao.

Nada foi executado no Neon.

---

## 5. Testes PostgreSQL 17

Ambiente local isolado:

- container `pca-5f53-pg`, imagem `postgres:17`;
- database local `validation_b1`, owner local `neondb_owner`;
- roles locais `validation_b1_runtime` e `validation_b1_cleanup`;
- nenhuma conexao com Neon/Netlify.

### 5.1 Aplicacao completa

O wrapper B1 foi executado localmente e retornou:

```json
{
  "migrations": 7,
  "tables": 14,
  "runtimeRole": "validation_b1_runtime",
  "collectPrivileges": true,
  "inheritedRolesRevoked": true,
  "committed": true,
  "secretsPrinted": false
}
```

### 5.2 Ingestao com a role runtime

| Caso | Resultado |
|---|---|
| session_start + pageview + affiliate_click + calculator_complete + session_end | 202 |
| Visitantes/sessoes/pageviews | 1/1/1 |
| Events | 4 (session_start, affiliate_click, calculator_complete, session_end) |
| Affiliate clicks | 1 |
| Ingest events | 5 |
| Rate limit (3 buckets) | 3 linhas |
| Duplicacao do mesmo event_id | 202 sem segunda pageview/ingest |
| Rate limit com maximo 1 | primeira 202, segunda 429 |
| Troca de visitante na mesma sessao | 400, sem novas linhas |

### 5.3 Regressao

`npm run test:analytics` no PostgreSQL 17 local com sete migrations:

```text
tests 137
pass 137
fail 0
```

Inclui collect, deduplicacao, rate limit, cleanups e captura fase 4.

---

## 6. Testes negativos de seguranca

Executados com a role `validation_b1_runtime`:

| Operacao | Codigo | Resultado |
|---|---|---|
| `CREATE TABLE` | 42501 | negado |
| `DROP TABLE sessions` | 42501 | negado |
| `DELETE FROM sessions` | 42501 | negado |
| `TRUNCATE sessions` | 42501 | negado |
| `ALTER ROLE validation_b1_cleanup` | 42501 | negado |
| `SET ROLE validation_b1_cleanup` | 42501 | negado |
| `SET ROLE postgres` (owner local) | 42501 | negado |
| `SELECT * FROM schema_migrations` | 42501 | negado |
| `SELECT count(*) FROM html_events` | 42501 | negado |
| `UPDATE pageviews` | 42501 | negado |
| `DELETE FROM rate_limits` | 42501 | negado |
| `TRUNCATE visitors` | 42501 | negado |
| `SELECT user_agent FROM sessions` | 42703 | coluna ausente apos 007 |

O codigo 42703 e "coluna inexistente", nao erro de permissao: confirma a remocao da coluna. Os
demais sao negacoes de privilegio.

Matriz adicional confirmou:

- `validation_b1_runtime` sem DELETE/TRUNCATE nas sete tabelas;
- sem UPDATE em `pageviews`, `events`, `affiliate_clicks` e `ingest_events`;
- sem SELECT de tabela inteira nessas quatro tabelas;
- com SELECT apenas de `event_id` nessas quatro tabelas;
- sem SELECT em `schema_migrations`;
- sem CREATE no schema;
- sem membership em cleanup/owner;
- sem ownership de objetos;
- `validation_b1_cleanup` sem novos privilegios.

---

## 7. Compatibilidade do runtime com o esquema final

- O codigo de collect nao contem escrita ou leitura de `user_agent`.
- O esquema final tem 14 tabelas, sete migrations e nenhuma coluna `user_agent` em `sessions`.
- A role runtime consegue executar todas as operacoes de ingestao identificadas na secao 1.
- O `ON CONFLICT` usa somente event_id/keys cobertos pelos privilegios.
- Nao ha sequencias, views, funcoes ou triggers adicionais a liberar.
- A role cleanup permanece separada.
- Nenhuma permissao de producao foi adicionada.
- **Pendencia remota:** o Neon B1 ainda esta na migration 006 e nao possui os grants de collect;
  isso exige autorizacao separada.

---

## 8. Analise de CSP

Arquivo: `validation-b1/public/_headers`.

Diretiva atual:

```text
connect-src 'none'
```

O cliente canonico `js/analytics.js` usa:

```text
ENDPOINT = '/api/collect'
navigator.sendBeacon(ENDPOINT, ...) ou fetch(ENDPOINT, ...)
```

Para um cliente browser no mesmo dominio B1, a diretiva minima e:

```text
connect-src 'self'
```

Caracteristicas:

- `'self'` nao e curinga e permite apenas a origem atual do B1.
- Nao e necessario liberar `https://portaldascontas.com.br`, `*.netlify.app`, `*` ou qualquer
  origem de producao.
- O valor de `ALLOWED_ORIGINS` deve conter a origem exata do deploy B1 usado no teste.
- O draft URL e dinamico (`<deploy>--portal-contas-validation-b1.netlify.app`); a origem exata
  deve ser registrada depois do deploy, antes do teste browser.
- O envio so ocorre depois do consentimento; a mudanca de CSP nao altera o gate de consentimento.
- O artefato B1 atual nao inclui o cliente canonico `js/analytics.js`; testes server-side nao
  dependem de CSP. A mudanca de CSP so e necessaria para uma janela browser com cliente.
- Nenhuma configuracao remota ou canonica foi alterada nesta fase.

---

## 9. Pendencias remotas

Sem autorizacao nesta fase:

1. Aplicar a migration 007 no Neon B1.
2. Aplicar `database/b1/009-runtime-collect-privileges.sql` depois da 007.
3. Rodar o preflight e o postflight no Neon B1.
4. Configurar `ALLOWED_ORIGINS` e `RATE_LIMIT_HMAC_SECRET` no preview.
5. Configurar `ANALYTICS_INGEST_ENABLED=true` apenas na janela de teste.
6. Publicar o artefato completo de 32 arquivos (o deploy atual `6b007...` nao o contem).
7. Ajustar `connect-src 'self'` se houver cliente browser.
8. Testar Edge/cleanup flags e SSL em janelas separadas.
9. Reverter flags de teste e registrar evidencias.

O wrapper local `apply-b1-migrations.mjs` serve para banco B1 vazio; o Neon existente exige a
sequencia incremental `007 -> 009`, nao a recriacao do banco.

---

## 10. Confirmacao de que nenhuma alteracao remota foi executada

- Nenhuma migration no Neon.
- Nenhum `GRANT` ou `REVOKE` remoto.
- Nenhuma alteracao de role remota.
- Nenhum deploy/upload.
- Nenhuma alteracao de secret, variavel ou flag.
- Nenhum cleanup.
- Nenhuma escrita em banco remoto.
- Nenhum commit, push ou PR.

Os testes usaram somente o container PostgreSQL 17 local e um database local isolado. Nenhuma
connection string, senha ou secret foi impressa no relatorio.

**Classificacao: 1 - Contrato de permissoes validado localmente.** A aplicacao remota permanece
pendente de autorizacao especifica.
