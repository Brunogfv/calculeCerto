# Portal das Contas Analytics — Fase 2

Status: backend de coleta e banco implementados localmente; **sem push, PR, deploy ou migração de produção**.

## Escopo

- Endpoint `POST /api/collect` como Netlify Function.
- Schema PostgreSQL no Neon.
- Validação estrita, consentimento, deduplicação e rate limiting.
- HMAC para identificação temporária no rate limit; sem IP completo.
- Testes unitários e integração com PostgreSQL temporário no CI.

Fora do escopo desta fase: script do navegador, banner de consentimento, Edge Function de documentos, painel, relatórios e GA4.

## Feature flag

A ingestão fica **desligada por padrão**:

```env
ANALYTICS_INGEST_ENABLED=false
```

Enquanto estiver `false`, o endpoint responde `204` e não abre conexão com o banco. Ela só deve ser ativada depois da implementação do consentimento na Fase 3.

## Arquitetura

```text
POST /api/collect
  └─ netlify/functions/collect.mjs
       ├─ valida origem, método, content-type, tamanho e schema
       ├─ exige consent.analytics=true
       ├─ aplica rate limit (HMAC do IP + sessão + visitante)
       └─ Neon PostgreSQL
```

## Arquivos

- `netlify/functions/collect.mjs`: endpoint Netlify Functions v2 em `/api/collect`.
- `netlify/functions/_lib/`: banco, validação, HMAC/rate limit, HTTP, User-Agent e atribuição.
- `db/migrations/001_init.sql`: schema inicial.
- `db/migrations/002_phase2_review.sql`: deduplicação global, chaves estrangeiras e constraints da revisão.
- `scripts/migrate.mjs`: runner de migrações com bloqueio de banco de teste.
- `scripts/cleanup-rate-limits.mjs`: limpeza de rate limits antigos.
- `tests/analytics/`: testes unitários e integração.
- `.github/workflows/ci.yml`: job `analytics-backend` com PostgreSQL 16 temporário.

## Neon — configuração

1. Crie um projeto Neon gratuito.
2. Crie o banco de produção `portal_analytics`.
3. Crie um banco/branch separado para testes, por exemplo `portal_analytics_test`.
4. Crie uma role de runtime `analytics_runtime` com permissões de coleta e copie a **connection string pooled** dela para `DATABASE_URL` na Netlify.
5. Guarde a connection string da role owner em `MIGRATION_DATABASE_URL` apenas para migrações.
6. Copie a connection string do banco de teste para `TEST_DATABASE_URL` no ambiente local/CI.
7. Não execute migrações de produção nesta fase.
8. Em Neon, configure alertas de consumo/uso do projeto e mantenha o autosuspend do plano gratuito.
9. Não faça upgrade de plano sem autorização.

### Variáveis na Netlify

Configurar em **Site configuration → Environment variables**:

```env
DATABASE_URL=postgresql://.../portal_analytics?sslmode=require
MIGRATION_DATABASE_URL=postgresql://.../portal_analytics?sslmode=require
RATE_LIMIT_HMAC_SECRET=<segredo aleatório de 32+ bytes>
ANALYTICS_INGEST_ENABLED=false
ALLOWED_ORIGINS=https://portaldascontas.com.br,https://www.portaldascontas.com.br
```

Não copie segredos para o repositório, para o HTML ou para o JavaScript público.

## Migrações

Teste local:

```bash
TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/portal_analytics_test \
ANALYTICS_TEST_DB=1 \
npm run db:migrate:test
```

Produção (somente após autorização explícita, em outra etapa):

```bash
MIGRATION_DATABASE_URL=... npm run db:migrate:prod
```

O runner de teste recusa:

- banco cujo nome não contenha `test`;
- `TEST_DATABASE_URL` igual a `DATABASE_URL`;
- execução com `NODE_ENV=production`.

## Testes

```bash
npm run test:analytics
```

Se `TEST_DATABASE_URL` não estiver definido, os testes de integração são ignorados; os testes unitários continuam rodando. No CI, o job `analytics-backend` sobe um PostgreSQL 16 temporário, aplica as migrações e executa os testes.

Para rodar a integração localmente com Docker:

```bash
docker run --rm -d --name pca-test-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=portal_analytics_test \
  -p 5433:5432 postgres:16
```

Depois:

```bash
TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/portal_analytics_test \
ANALYTICS_TEST_DB=1 \
NODE_ENV=test \
RATE_LIMIT_HMAC_SECRET=segredo-de-teste-com-32-bytes \
ALLOWED_ORIGINS=http://127.0.0.1:8765 \
npm run test:analytics
```

## Contrato do endpoint

Eventos aceitos:

- `pageview`
- `session_start`
- `session_end`
- `engagement`
- `calculator_start`
- `calculator_complete`
- `affiliate_click`

Regras:

- `POST` com `application/json`, no máximo 16 KB.
- `Origin`/`Referer` devem estar em `ALLOWED_ORIGINS`.
- `consent.analytics` deve ser `true`; recusa retorna `204` sem gravar.
- `event_id` e `session_id` são UUIDs; `visitor_id` é opaco.
- `calculator_complete` aceita somente o nome da calculadora, sem valores ou resultados.
- `affiliate_click` aceita produto, categoria, slot e host de destino; não o URL completo.
- Campos proibidos (`values`, `resultado`, e-mail, CPF, telefone etc.) rejeitam o payload.
- Respostas: `202` aceito, `204` consentimento recusado/ingestão desligada, `400` inválido, `403` origem, `413` grande, `415` content-type, `429` rate limit, `503` indisponível.

## Deduplicação e integridade

- `ingest_events.event_id` faz a deduplicação **global**: o mesmo `event_id` não pode ser processado como pageview e depois como evento de calculadora.
- `session_id` identifica a sessão; ele **não** deduplica eventos. Vários pageviews, cliques de afiliado e cálculos concluídos podem ocorrer na mesma sessão, desde que tenham `event_id` diferentes.
- Um `session_id` existente só aceita o `visitor_id` que o criou; reutilização por outro visitante retorna `400 session_visitor_mismatch`.
- Chaves estrangeiras ligam sessões a visitantes, e pageviews/eventos/cliques a sessões e visitantes.
- A migration `002_phase2_review.sql` adiciona `ingest_events`, FKs de visitante, `slot NOT NULL` nos cliques e constraints de contadores não negativos.

## Permissões do banco

A role de runtime `analytics_runtime` deve ter somente:

```sql
GRANT CONNECT ON DATABASE portal_analytics TO analytics_runtime;
GRANT USAGE ON SCHEMA public TO analytics_runtime;
GRANT SELECT, INSERT, UPDATE ON
    visitors, sessions, pageviews, events, affiliate_clicks, ingest_events, rate_limits
TO analytics_runtime;
```

- Migrações e limpeza devem usar a role owner em `MIGRATION_DATABASE_URL`.
- A role de runtime não precisa de DDL, `DELETE` ou acesso a `schema_migrations`.
- A `DATABASE_URL` da Netlify deve ser a role de runtime, não a owner.

## Rate limiting e HMAC

- IP não é armazenado; o rate limit usa `HMAC-SHA256(IP, RATE_LIMIT_HMAC_SECRET)`.
- O segredo HMAC precisa ter pelo menos 32 bytes; caso contrário, o endpoint responde `503` e não grava nada.
- O limite por IP é independente e é a proteção principal; `session_id` e `visitor_id` são pseudônimos controlados pelo cliente e servem apenas como limites adicionais.
- Sessão e visitante usam seus identificadores pseudônimos.
- Limites padrão: 120/5 min por IP, 600/hora por visitante e 60/minuto por sessão.
- A tabela `rate_limits` guarda somente bucket HMAC, janela e contador.
- `npm run db:cleanup:rate-limits:test` remove janelas antigas (padrão: 24h).

## Privacidade e retenção

- Sem IP completo, sem valores de calculadoras e sem resultados.
- Sem fingerprinting invasivo.
- Referrer armazenado sem query string.
- A Fase 3 implementará o banner/controle de consentimento, DNT/GPC e atualização da política de privacidade.
- Retenção de eventos brutos e agregados será definida e implementada nas fases seguintes; o rate limit já tem retenção curta.

## Custos

- Neon: plano gratuito; configurar alertas de consumo; sem upgrade automático.
- Netlify: Functions incluídas no plano atual; monitorar invocações/banda.
- GitHub Actions: PostgreSQL temporário sem custo adicional.
- Nenhum serviço pago foi contratado.
