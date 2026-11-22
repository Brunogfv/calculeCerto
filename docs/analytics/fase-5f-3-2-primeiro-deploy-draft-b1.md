# Fase 5F.3.2 — Primeiro deploy draft e validação de publicação B1

Status: **um único deploy draft criado no B1; publicação estática, Function e Edge reconhecidas;
nenhum POST, ativação, segundo deploy ou promoção**.
Data/hora: **2026-11-13T22:34:22-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

---

## 1. Resumo executivo

O primeiro deploy draft do B1 foi concluído com sucesso no Site ID
`9cd7034f-5691-46af-8030-d70f7ed52ca7`.

- **Deploy ID:** `6af7b9adbbe4d110c7592f70`
- **URL draft:** `https://6af7b9adbbe4d110c7592f70--portal-contas-validation-b1.netlify.app`
- **Contexto:** `deploy-preview`
- **Estado:** `ready`
- **Publicado:** não (`published_at=null`; `published_deploy=null`)
- **Arquivos:** 7 no publish (6 páginas/arquivos + `build-manifest.json`)
- **Function:** `capture-html`, rota `/api/capture-html`
- **Edge Function:** presente (`edge_functions_present=true`); bundle `html-capture`
- **Scheduled Functions:** nenhuma

A publicação estática respondeu `200` em `/`, `/robots.txt`, `/validacao-encerrada.html`,
`/b1.css` e `/b1-consent.js`, com headers de `noindex`, CSP, `no-referrer`, `nosniff`, `DENY` e
`no-store`. Não foram encontrados segredos, rastreadores, recursos externos ou conteúdo real do
Portal.

**Classificação: 1 — Aprovado.** A validação de runtime/HMAC, logs de invocação e consumo de
créditos continuam pendentes para uma fase específica.

---

## 2. Identidades e créditos

| Item | Valor |
|---|---|
| Equipe | BruMiTa |
| Team/Account ID | `697d58587a017c3396fb416e` |
| Site B1 | `portal-contas-validation-b1` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Domínio | `https://portal-contas-validation-b1.netlify.app` |
| Plano | Free |
| Visibilidade | Pública (`sso_login=false`) |
| Produção | `273101e3-7a01-4931-aeaf-4cee4fe74f07` |
| Homologação | `3da70f72-70f7-4883-b60b-25b430cc9270` |

**Saldo informado pelo usuário antes do deploy:** **140,8 créditos**.
O saldo não foi lido por API nesta etapa. O teto autorizado era **15 créditos** e foi executado
apenas um deploy draft. O consumo efetivo não foi independentemente confirmado; conferir no painel.

---

## 3. Pré-verificações

### 3.1 Netlify

| Verificação | Resultado |
|---|---|
| Team ID | `697d58587a017c3396fb416e` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Nome/domínio | `portal-contas-validation-b1` / `https://portal-contas-validation-b1.netlify.app` |
| Plano | Free |
| Visibilidade | Pública |
| Deploy no B1 antes | Nenhum (`b1_deploys=[]`; sem `deploy_id` publicado) |
| Variáveis B1 | exatamente `DATABASE_URL` e `EDGE_INGEST_SECRET`, ambas site-specific/secret |
| Variáveis compartilhadas | 0 no nível da equipe |
| Produção | deploy `6af0feebef830ebab5cd25dd`, pública |
| Homologação | deploy `6af47527818a48a5dbbef2c4`, privada |

O Site ID foi passado explicitamente em todas as operações. Nenhuma seleção implícita de site foi
usada.

### 3.2 Estado local

| Verificação | Resultado |
|---|---|
| Diretório | `D:\Projetos\Site Calculadora\validation-b1` |
| `validation-b1/netlify.toml` | presente; build/publish/Functions/Edge do B1 |
| Diretório atual de publicação | `validation-b1/dist` |
| Manifesto compartilhado | 13 arquivos; válido |
| Cópias canônicas | hashes conferem |
| `dist/` | 6 arquivos publicados + `build-manifest.json` |
| Functions | `netlify/functions/capture-html.mjs` + `_lib` |
| Edge Functions | `netlify/edge-functions/html-capture.js` + `_lib` |
| `.netlify/state.json` | ausente antes e depois do deploy |
| Conteúdo de produção na publicação | nenhum |
| Segredos no `dist`/config | nenhum |

---

## 4. Build local e testes

| Etapa | Resultado |
|---|---|
| `npm test` em `validation-b1` | **19/19** aprovados |
| `npm run test:browser` | **2/2** aprovados |
| `npx netlify-cli --version` | `27.19.0` |
| `npx netlify-cli build --offline` | concluído; build B1, Functions e Edge |
| Build B1 | 6 arquivos publicados + manifest, 10,0 KiB |
| Shared manifest | 13 arquivos OK |
| Function bundling | `capture-html.mjs` empacotado |
| Edge bundling | `html-capture` empacotado |
| Segredos no build | nenhuma variável impressa; nenhum segredo nos artefatos |

O build local foi executado antes do deploy e o deploy executou novamente o mesmo build. Não houve
alteração de arquivos funcionais para contornar erros.

---

## 5. Deploy draft

Comando executado uma única vez a partir de `D:\Projetos\Site Calculadora\validation-b1`:

```powershell
npx netlify-cli deploy `
  --site 9cd7034f-5691-46af-8030-d70f7ed52ca7 `
  --dir dist `
  --functions netlify/functions `
  --skip-functions-cache `
  --message "B1 validation draft"
```

Não foi usado `--prod`.

Resultado do CLI:

- Build, Functions bundling e Edge Functions bundling concluídos;
- `Deploying 7 files, 1 function and 3 edge functions`;
- `Found 9 files, 1 function and 1 edge function to upload`;
- 11 assets enviados;
- `Deploy is live!`;
- Deploy ID `6af7b9adbbe4d110c7592f70`;
- Draft URL `https://6af7b9adbbe4d110c7592f70--portal-contas-validation-b1.netlify.app`.

Nenhum segundo deploy foi executado.

---

## 6. Verificação do deploy

| Campo | Valor |
|---|---|
| Deploy ID | `6af7b9adbbe4d110c7592f70` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Estado | `ready` |
| Contexto | `deploy-preview` |
| Publicado | `published_at=null` |
| URL draft | `https://6af7b9adbbe4d110c7592f70--portal-contas-validation-b1.netlify.app` |
| `edge_functions_present` | `true` |
| Function disponível | `capture-html` |
| Rota da Function | `/api/capture-html` |
| Runtime da Function | `nodejs24.x` |
| Scheduled Functions | `[]` |
| `required_functions` | `[]` |
| `required_edge_functions` | `[]` |

O site B1 permaneceu sem `published_deploy`; o deploy existe apenas como draft/deploy preview.
Não houve promoção para a URL principal.

---

## 7. Headers e conteúdo publicado

### 7.1 GET/HEAD

| Rota | GET | HEAD | Conteúdo |
|---|---|---|---|
| `/` | 200 | 200 | HTML B1 mínimo, `noindex` |
| `/robots.txt` | 200 | 200 | `User-agent: *` / `Disallow: /` |
| `/validacao-encerrada.html` | 200 | 200 | HTML B1 de encerramento |
| `/b1.css` | 200 | — | CSS local |
| `/b1-consent.js` | 200 | — | JS local |

Headers observados em `/` e nas páginas HTML:

- `X-Robots-Tag: noindex, nofollow, noarchive`;
- `Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; ...`;
- `Referrer-Policy: no-referrer`;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Permissions-Policy` restritiva;
- `Cache-Control: no-store`.

O header `X-Robots-Tag` aparece repetido pelo Netlify, mas contém `noindex` em todas as ocorrências.

### 7.2 Conteúdo e rastreadores

| Verificação | Resultado |
|---|---|
| HTML B1 mínimo | sim |
| Conteúdo real do Portal das Contas | não |
| Recursos externos (`http(s)://`) | nenhum |
| GA4/GTM | nenhum |
| Google Analytics/AdSense | nenhum |
| Afiliados | nenhum |
| `postgresql://` | nenhum |
| `DATABASE_URL`/`EDGE_INGEST_SECRET` | nenhum |
| Dados pessoais | nenhum |
| Formulários/eventos | nenhum enviado |

As varreduras foram feitas no `dist` local e nas respostas GET do deploy draft.

---

## 8. Functions e Edge

- `capture-html` está listada no deploy como Function disponível, com rota `/api/capture-html`.
- O ZIP local contém `capture-html`, `pg`, `zod` e dependências; nenhum segredo real foi encontrado.
- A Edge Function `html-capture` foi empacotada e o deploy informa `edge_functions_present=true`.
- O manifesto local da Edge usa rota `/*` com exclusões para `/api/*`, assets e páginas fora do
  escopo.
- Não foi executado `POST /api/capture-html`, `POST /api/collect` ou qualquer chamada de Function.
- Os GETs de páginas passaram pela URL draft sem erro HTTP; com as flags ausentes, a Edge não
  inicia captura.

**Logs:** o CLI `netlify logs` exige projeto vinculado; nenhum `netlify link` foi executado e o
`.netlify/state.json` permaneceu ausente. Logs de runtime não foram consultados. Os logs de build e
deploy exibidos pelo CLI não mostraram erro de bundling ou inicialização.

---

## 9. Flags e configuração

| Flag | Estado |
|---|---|
| `ANALYTICS_INGEST_ENABLED` | ausente |
| `EDGE_CAPTURE_ENABLED` | ausente |
| `EDGE_ANALYTICS_ENABLED` | ausente |
| `HTML_CAPTURE_CLEANUP_ENABLED` | ausente |

As únicas variáveis site-specific continuam sendo `DATABASE_URL` e `EDGE_INGEST_SECRET`. Nenhuma
flag foi criada, alterada ou ativada. Nenhuma variável foi modificada nesta fase.

---

## 10. Isolamento após o deploy

| Verificação | Resultado |
|---|---|
| Produção | inalterada; deploy `6af0feebef830ebab5cd25dd`; pública |
| Homologação | inalterada; deploy `6af47527818a48a5dbbef2c4`; privada |
| Variáveis da produção | inalteradas (0 site-specific) |
| Variáveis da homologação | inalteradas (11 nomes, mesmos nomes) |
| Variáveis compartilhadas | 0 |
| B1 | draft `6af7b9adbbe4d110c7592f70`; sem deploy publicado |
| Neon B1 | branch `validation-b1` e database `validation_b1`; 0 tabelas; 0 migrations |
| Roles Neon | inalteradas; `validation_b1_runtime` presente |
| DNS/visibilidade | inalterados |

O banco `validation_b1` foi consultado pela role `validation_b1_runtime` com SSL; retornou
`current_database=validation_b1`, `current_user=validation_b1_runtime`, stream TLS criptografado e
0 tabelas de usuário.

---

## 11. Proibições respeitadas

- Nenhum `--prod`.
- Nenhum segundo deploy.
- Nenhum deploy em produção/homologação.
- Nenhum branch deploy.
- Nenhum POST de coleta/ingestão.
- Nenhuma flag ativada ou alterada.
- Nenhuma variável criada ou alterada.
- Nenhuma migration, tabela, role, rate limit ou alteração no Neon.
- Nenhuma alteração de DNS ou visibilidade.
- Nenhum commit, push, PR ou conexão de repositório.
- Nenhum segredo ou connection string exibido.

---

## 12. Pendências para validação de runtime

1. Autorização específica para testar HMAC, timestamp, nonce, key ID, replay e rate limit em uma
   janela controlada.
2. Autorização para ativar as flags de captura e executar o primeiro POST controlado.
3. Consultar logs de Function/Edge após a janela, preferencialmente sem criar vínculo local
   permanente ou com escopo restrito.
4. Confirmar no painel o consumo de créditos do deploy draft.
5. Confirmar que nenhum dado foi gravado no Neon antes de qualquer ativação.
