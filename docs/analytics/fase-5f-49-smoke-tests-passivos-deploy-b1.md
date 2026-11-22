# Fase 5F.49 - Smoke tests passivos do deploy draft B1

Status: **smoke tests passivos concluidos; nenhum deploy, upload, escrita remota, migration,
cleanup, alteracao de flags, commit ou push executado**.
Data/hora de referencia: **2026-11-20T20:16:39Z**.
Deploy: `6b007a6d6e15671b125b952e`.
Site: `portal-contas-validation-b1` (`9cd7034f-5691-46af-8030-d70f7ed52ca7`).
URL: `https://6b007a6d6e15671b125b952e--portal-contas-validation-b1.netlify.app`.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.

**Classificacao: 1 - Smoke tests aprovados.**
O comportamento HTTP passivo esta consistente, o isolamento B1 foi confirmado e nao houve erro
critico observavel. Functions e Edge nao foram chamadas por rota mutavel; a Edge foi apenas
atravessada por GET de pagina, com flags desligadas.

---

## 1. Identificacao do deploy

Consulta somente leitura a API Netlify:

| Campo | Valor |
|---|---|
| Deploy ID | `6b007a6d6e15671b125b952e` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Site | `portal-contas-validation-b1` |
| Estado | `ready` |
| Contexto | `deploy-preview` |
| `published_at` | `null` |
| Site `published_deploy` | `null` |
| URL | `https://6b007a6d6e15671b125b952e--portal-contas-validation-b1.netlify.app` |
| Functions | `capture-html`, `cleanup-html-capture` |
| Edge | `edge_functions_present=true`, 1 Edge |

Nao houve divergencia de destino ou estado.

---

## 2. Metodos e ferramentas

- `curl -I` para HEAD sem seguir redirects;
- `curl` GET apenas para leitura de recursos estaticos;
- Playwright Chromium headless para navegacao limitada;
- API Netlify somente leitura para estado do deploy/site;
- inspecao local de HTML, CSS, JavaScript e codigo das Functions/Edge.

Nao foram usados formularios, cliques, POST, consentimento, analytics, cleanup, `Run now`, deploy,
upload ou qualquer metodo de escrita.

As requisicoes GET/HEAD podem gerar logs na infraestrutura do Netlify. Isso e uma limitacao
operacional conhecida, nao uma alteracao de conteudo.

---

## 3. Recursos testados

Metodo HEAD, sem seguir redirects:

| Caminho | Status | Content-Type | Redirect |
|---|---:|---|---|
| `/` | 200 | `text/html; charset=UTF-8` | nenhum |
| `/index.html` | 200 | `text/html; charset=UTF-8` | nenhum |
| `/validacao-encerrada.html` | 200 | `text/html; charset=UTF-8` | nenhum |
| `/validacao-encerrada` | 200 | `text/html; charset=UTF-8` | nenhum |
| `/robots.txt` | 200 | `text/plain; charset=UTF-8` | nenhum |
| `/b1.css` | 200 | `text/css; charset=UTF-8` | nenhum |
| `/b1-consent.js` | 200 | `application/javascript; charset=UTF-8` | nenhum |
| `/build-manifest.json` | 200 | `application/json` | nenhum |
| `/api/collect` | 404 | `text/html; charset=utf-8` | nenhum |
| `/calculadoras/imc` | 404 | `text/html; charset=utf-8` | nenhum |
| `/artigos/financas/o-que-e-cdi` | 404 | `text/html; charset=utf-8` | nenhum |
| `/paginas/contato` | 404 | `text/html; charset=utf-8` | nenhum |
| `/imgs/logo.png` | 404 | `text/html; charset=utf-8` | nenhum |

As rotas canonicas de calculadora, artigo, institucional e imagem retornaram 404 **por desenho**:
o B1 e um ambiente minimo com apenas 7 arquivos estaticos. Nao foram seguidas para producao nem
tratadas como falha de navegacao do B1.

---

## 4. Headers observados

Resposta de `/`:

| Header | Valor observado | Avaliacao |
|---|---|---|
| `Content-Security-Policy` | `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'` | igual ao `_headers` B1 |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | header adicional do Netlify; nao conflita |
| `X-Content-Type-Options` | `nosniff` | esperado |
| `Referrer-Policy` | `no-referrer` | esperado |
| `Permissions-Policy` | `camera=(), geolocation=(), microphone=(), payment=(), usb=()` | esperado |
| `X-Frame-Options` | `DENY` | esperado |
| `X-Robots-Tag` | `noindex, nofollow, noarchive` e `noindex` | esperado; duplicacao do Netlify |
| `Cache-Control` | `no-store` | esperado |

O `_headers` B1 tem SHA-256
`cacc628a492bc6a3f232ccf9664133735de4394e739bb78d9ced8a64ebbc7839`. O CSP servido preserva a
politica restritiva; nao ha `googletagmanager`, `google-analytics`, `adsbygoogle` ou
`doubleclick` no CSP observado.

---

## 5. Isolamento

- `/api/collect` responde 404; endpoint canonico de sessao ausente.
- 0 redirects no deploy; nenhuma rota testada retornou `Location`.
- Nenhum recurso externo carregado no navegador.
- A pagina B1 referencia apenas `/b1.css` e `/b1-consent.js`.
- `b1-consent.js` nao contem `fetch`, `sendBeacon`, XHR, `/api/collect`, IDs de analytics,
  GTM/GA/AdSense; apenas estado local de consentimento e diagnostico.
- Nao foram encontrados redirecionamentos ou headers canonicos no deploy.
- `published_deploy` da B1 permanece `null`; o deploy e draft.

---

## 6. Functions e Edge

### 6.1 `capture-html`

| Item | Valor |
|---|---|
| Caminho local | `validation-b1/netlify/functions/capture-html.mjs` |
| Rota | `/api/capture-html` |
| Metodo funcional | POST |
| Runtime reportado | `nodejs24.x` |
| Regiao reportada | `us-east-2` |
| Finalidade | receber captura HMAC da Edge e persistir HTML/agregados |
| Efeitos colaterais | possiveis INSERTs no PostgreSQL quando flags e HMAC validos |
| Variaveis esperadas | `DATABASE_URL`, `EDGE_INGEST_SECRET`, flags de captura/analytics |
| Chamada nesta fase | **nao** |

A rota nao foi chamada. A leitura do codigo mostra que GET retorna 405 quando a captura esta
habilitada, e retorna 204/disabled quando as flags estao desligadas; ainda assim, nao foi invocada
para nao gerar qualquer possibilidade de escrita.

### 6.2 `cleanup-html-capture`

| Item | Valor |
|---|---|
| Caminho local | `validation-b1/netlify/functions/cleanup-html-capture.mjs` |
| Rota | Scheduled Function, sem rota HTTP publica |
| Metodo esperado | execucao agendada/Run now |
| Runtime reportado | `nodejs24.x` |
| Finalidade | remover HTML bruto e dados vencidos |
| Efeitos colaterais | `DELETE` em tabelas de dados |
| Variaveis esperadas | `CLEANUP_DATABASE_URL`, `HTML_CAPTURE_CLEANUP_ENABLED`, role cleanup |
| Chamada nesta fase | **nao** |

A funcao nao foi executada; o schedule `15 3 * * *` apenas aparece na metadata.

### 6.3 Edge `html-capture`

| Item | Valor |
|---|---|
| Caminho local | `validation-b1/netlify/edge-functions/html-capture.js` |
| Rota | `/*` |
| Finalidade | observar HTML e encaminhar evento assinado a Function |
| Efeitos colaterais | possivel envio a `/api/capture-html` se flags e consentimento permitirem |
| Variaveis esperadas | flags Edge e `EDGE_INGEST_SECRET` |
| Chamada nesta fase | apenas atravessada pelo GET das paginas; flags desligadas |

O navegador fez GET de `/` e `/validacao-encerrada.html`; a Edge foi atravessada, mas nao houve
requisicao a `/api/capture-html` nem evento de analytics.

---

## 7. Navegacao e console

Playwright Chromium headless, sem cliques, formularios ou interacao:

- `/` carregou 200;
- `/validacao-encerrada.html` carregou 200;
- `/b1.css` 200;
- `/b1-consent.js` 200;
- nenhum erro de console `error`;
- nenhum `pageerror`;
- nenhuma request falhou;
- nenhuma request externa (fora do host do deploy);
- apenas 1 script (`/b1-consent.js`), nenhuma imagem externa;
- nenhuma chamada a `/api/capture-html` ou `/api/collect`.

---

## 8. Erros e limitacoes

- Rotas canonicas ausentes retornam 404 por design do B1; nao sao erros do deploy.
- `X-Robots-Tag` e HSTS sao adicionados/duplicados pelo Netlify; nao conflitam com o contrato.
- Nao foi possivel validar comportamento de Functions/Edge em runtime sem executar um POST ou
  Scheduled Function, o que nao era autorizado.
- Requisicoes GET/HEAD podem gerar logs de acesso no Netlify.
- O navegador usou Chromium local; nao foi um teste multi-browser.
- Nao foram testados consentimento com gravacao, analytics, rate limit, cleanup, SSL de banco ou
  producao.
- O deploy continua draft e nao publicado.

---

## 9. Ausencia de operacoes de escrita

- Nenhum deploy, upload ou retry.
- Nenhuma alteracao Netlify/Neon/flags/variaveis/dominios/producao.
- Nenhuma migration ou cleanup.
- Nenhuma Scheduled Function, `Run now`, POST, formulario ou evento de analytics.
- Nenhum commit, push ou PR.
- Apenas GET/HEAD e API Netlify de leitura.

---

## 10. Classificacao final

**1 - Smoke tests aprovados.**

O deploy draft esta `ready`, no contexto `deploy-preview`, sem `published_at` e sem
`published_deploy`. As paginas minimas, assets e headers responderam de forma consistente; o CSP
restritivo foi aplicado; `/api/collect` nao existe; nao houve recurso externo, erro JavaScript,
falha de carregamento ou redirect inesperado. As rotas canonicas 404 sao esperadas no artefato B1
minimo.

Nenhuma operacao de escrita ou chamada mutavel foi executada. Qualquer teste de Function/Edge,
ingestao, rate limit, cleanup ou producao exige autorizacao separada.
