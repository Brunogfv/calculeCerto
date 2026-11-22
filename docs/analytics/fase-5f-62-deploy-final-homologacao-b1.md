# Fase 5F.62 - Deploy final e homologacao funcional B1

Status: **deploy draft concluido e homologacao funcional aprovada; nenhuma publicacao em producao**.
Data: **2026-11-22**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.

**Classificacao: 1 - Homologacao aprovada.**

O deploy corretivo com o artefato 5F.61 registrou as rotas customizadas, inicializou as Functions
com `pg` resolvido e passou os testes funcionais de ingestao, deduplicacao, rate limit, seguranca e
isolamento no Neon B1.

---

## 1. Identidade dos ambientes

### Neon

| Item | Confirmado |
|---|---|
| Projeto | `portal-contas-homologacao` |
| Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` |
| Branch ID | `br-misty-sound-b6pnt7iw` |
| Database | `validation_b1` |
| PostgreSQL | 17 |
| Migrations | 7 |
| Tabelas | 14 |

### Netlify

| Item | Confirmado |
|---|---|
| Site | `portal-contas-validation-b1` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Team ID | `697d58587a017c3396fb416e` |
| Deploy | `6b023d4035e5fbd62321cde1` |
| Draft URL | `https://6b023d4035e5fbd62321cde1--portal-contas-validation-b1.netlify.app` |
| Contexto | `deploy-preview` |
| Estado | `ready` |
| `published_at` | `null` |
| `published_deploy` | `null` |

Nenhuma publicacao em producao.

---

## 2. Artefato

| Item | Resultado |
|---|---|
| Diretorio | `C:\Users\Joanita\AppData\Local\Temp\opencode\b1-artifact-5f61` |
| SHA-256 | `0bdf9d0b4843aa79760a5750b14ebcdc748022e84616ec4dd2e28d8e35ba8dbe` |
| Arquivos | 1.251 |
| Estaticos | 7 |
| Functions-fonte | 16 |
| Edge | 7 |
| `package.json` / lockfile | presentes |
| Dependencias de producao | `pg`, `zod`, `ua-parser-js` + transitivas |
| CSP | B1 exata |
| Secrets | nenhum valor |

O gate oficial recebeu as fontes + runtime deps e reportou o mesmo digest
`0bdf9d0b4843aa79760a5750b14ebcdc748022e84616ec4dd2e28d8e35ba8dbe`.

---

## 3. Confirmacao pre-deploy

| Item | Estado |
|---|---|
| `ALLOWED_ORIGINS` | somente deploy-preview; `https://portal-contas-validation-b1.netlify.app` |
| `RATE_LIMIT_HMAC_SECRET` | presente, sem valor exposto |
| `ANALYTICS_INGEST_ENABLED` | `true` somente em deploy-preview |
| `DATABASE_URL` | presente no preview, configurado para B1 |
| `CLEANUP_DATABASE_URL` | restrito a deploy-preview |
| `EDGE_CAPTURE_ENABLED` | `false` |
| `EDGE_ANALYTICS_ENABLED` | `false` |
| `HTML_CAPTURE_CLEANUP_ENABLED` | `false` |

Nenhuma configuracao remota foi alterada nesta fase.

---

## 4. Registro das rotas e inicializacao

### `/api/collect`

```http
GET /api/collect
HTTP 405
Allow: POST
{"error":"method_not_allowed"}
```

A rota customizada foi registrada e a Function inicializou. O erro de `pg` nao ocorreu.

### `/api/capture-html`

```http
GET /api/capture-html
HTTP 204
```

A rota tambem foi registrada. Captura HTML permanece desabilitada, portanto a resposta vazia e a
esperada.

### HTML raiz e CSP

```http
GET /
HTTP 200
```

CSP real:

```text
default-src 'none'; script-src 'self'; style-src 'self'; img-src 'none'; connect-src 'self' https://portal-contas-validation-b1.netlify.app; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
```

A pagina B1 nao chama `/api/collect` automaticamente.

### Resolucao de dependencias

O bundle `collect` publicado encontra `pg`; o erro `Cannot find package 'pg'` nao apareceu. Os
testes controlados de escrita confirmaram que a conexao chegou ao Neon B1.

---

## 5. Consentimento

| Caso | Resultado |
|---|---|
| Sem consentimento (`analytics=false`) | 204; nenhuma linha criada |
| Consentimento recusado | 204; nenhuma ingestao |
| Consentimento aceito | eventos aceitos |
| Valores de calculadora no payload | 400; sem persistencia |
| Retirada/negacao posterior | representada por `analytics=false`; sem ingestao |

O HTML B1 nao inclui cliente automatico de analytics; o teste de consentimento do navegador B1
continua validando que aceitar/recusar/retirar nao dispara chamadas por conta propria. A aceitacao
funcional foi testada diretamente no endpoint com consentimento sintetico valido.

---

## 6. Ingestao e persistencia

Eventos testados, todos com resposta 202:

- `session_start`
- `pageview`
- `engagement`
- `calculator_start`
- `calculator_complete`
- `affiliate_click`
- `session_end`

Persistencia confirmada no Neon B1:

| Recurso | Quantidade |
|---|---|
| Visitante | 1 |
| Sessao | 1 |
| Pageviews | 1 |
| Events | 6 |
| Affiliate clicks | 1 |

Os dados foram gravados no database `validation_b1`; nenhuma escrita foi feita em producao ou na
branch principal.

---

## 7. Deduplicacao e rate limit

### Deduplicacao

Reenvio do mesmo `event_id` de pageview:

- resposta 202;
- pageviews mantidas em 1;
- ingest events mantidos;
- nenhuma duplicacao.

### Rate limit

Teste de 61 pageviews concorrentes na mesma sessao:

```json
{
  "count202": 60,
  "count429": 1
}
```

O limite por sessao foi aplicado sem erro 5xx. Requisicoes normais foram aceitas antes do limite.

---

## 8. Seguranca e privilegios

| Teste | Resultado |
|---|---|
| Origem nao autorizada | 403 |
| Payload invalido | 400 |
| Payload acima do limite | 413 |
| Valores de calculadora | 400 |
| Erro 5xx nos testes | nenhum |
| Secrets em resposta/teste | nenhum |
| Runtime com DELETE/TRUNCATE/DDL | nao; matriz da 5F.56 preservada |
| `sessions.user_agent` | ausente |
| Migration/grant adicional | nenhum |

O endpoint aceitou somente a origem B1 configurada. O teste de origem externa nao gerou
persistencia.

---

## 9. Isolamento

- Todas as requisicoes foram enviadas ao draft B1;
- todos os registros confirmados estao em `validation_b1`;
- o executor de verificacao foi `neondb_owner` no banco B1;
- nenhuma chamada foi enviada ao dominio de producao;
- nenhuma configuracao de producao foi alterada;
- `published_at=null` e `published_deploy=null`;
- o deploy permanece `deploy-preview` / `ready`.

---

## 10. Dados sinteticos e limpeza

Foram criados dados sinteticos com identificadores exclusivos, incluindo a sessao principal e a
sessao do teste de rate limit. Nenhum cleanup geral, DELETE ou TRUNCATE foi executado.

Os registros de testes anteriores (incluindo tentativas que falharam antes da homologacao final)
permanecem no B1 e devem ser tratados em uma etapa de limpeza autorizada. Nao foi executada
Scheduled Function.

---

## 11. Producao e Netlify

- um unico deploy draft foi realizado;
- nenhum segundo deploy;
- nenhum `--prod` ou `--prod-if-unlocked`;
- nenhum dominio ou configuracao de producao alterado;
- site `published_deploy=null`.

---

## 12. Pendencias e limitacoes

1. Limpar os dados sinteticos remanescentes em etapa autorizada.
2. A pagina B1 nao inclui o cliente de analytics canonical; a homologacao foi server-side/endpoint.
3. A verificacao SSL ponta a ponta continua com a ressalva de `pg_stat_ssl` no proxy Neon.
4. Nenhuma acao de producao foi executada; decisao de producao permanece com o usuario.

---

## 13. Evidencias resumidas

```text
Deploy: 6b023d4035e5fbd62321cde1
Contexto: deploy-preview
Estado: ready
published_at: null
published_deploy: null
SHA-256: 0bdf9d0b4843aa79760a5750b14ebcdc748022e84616ec4dd2e28d8e35ba8dbe

GET /api/collect -> 405, Allow: POST
GET /api/capture-html -> 204
Pageview/session_start/session_end/engagement/calculator_start/calculator_complete/affiliate_click -> 202
Dedup -> 202 sem duplicacao
Rate limit -> 60 x 202, 1 x 429
Origem nao autorizada -> 403
Payload invalido -> 400
Payload grande -> 413
```

**Classificacao final: 1 - Homologacao aprovada.**
