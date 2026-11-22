# Fase 5F.46 - Segunda tentativa unica de deploy draft B1

Status: **deploy draft B1 criado e verificado; nenhuma segunda tentativa, producao, migration,
cleanup, alteracao remota adicional, commit ou push executado**.
Data/hora de referencia: **2026-11-20T16:53:00Z**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
Site: `portal-contas-validation-b1` (`9cd7034f-5691-46af-8030-d70f7ed52ca7`).
Team: `BruMiTa` (`697d58587a017c3396fb416e`).
CLI: `netlify-cli/27.20.0`.

**Classificacao: 2 - Deploy realizado com validacao incompleta.**
O destino, o modo draft, os arquivos estaticos e o inventario de recursos foram comprovados. A
igualdade byte a byte de Functions/Edge Functions nao e recuperavel integralmente pela API do
Netlify; por isso a integridade total do artefato remoto nao foi declarada. Nao houve segunda
tentativa.

---

## 1. Autorizacao e escopo

Autorizado especificamente:

- uma unica tentativa de `npm run deploy:b1 -- --confirm`;
- somente Site B1, contexto draft, sem producao;
- verificacoes pos-upload somente leitura.

Nao executado:

- `netlify deploy` direto;
- segundo deploy ou retry;
- `--prod`, `--prod-if-unlocked` ou `--context`;
- migration, Neon, cleanup, Scheduled Functions, flags ou variaveis remotas;
- commit, push, PR ou alteracao de producao.

---

## 2. Estado inicial do repositorio

| Verificacao | Valor |
|---|---|
| Branch | `feat/portal-analytics` |
| HEAD | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` |
| Remote | mesmo HEAD |
| Indice | vazio |
| Staged | 0 |
| Working tree | correcoes locais 5F.40-5F.45, nao commitadas |
| Staging `sHosAj` anterior | ausente |
| Lock do gate | ausente |
| Variaveis `NETLIFY_*` perigosas | ausentes no preflight |

O gate corrigido da 5F.45 era o unico caminho oficial disponivel. Nenhum arquivo foi alterado
durante a execucao; apenas o relatorio foi criado depois.

---

## 3. Verificacoes pre-deploy

Executado antes da tentativa unica:

```powershell
cd validation-b1
npm run deploy:b1 -- --check
```

Resultado:

- `status`: `validated_only`;
- 25 arquivos;
- 7 estaticos, 9 Functions, 7 Edge, 0 redirects;
- 81.443 bytes;
- `artifact_sha256`: `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339`;
- `package_manifest_sha256`:
  `4cbb24300322db9d8dd1ed8701c23bd4214e3a1eaf527320ff5512179608aeac`;
- `config_sha256`:
  `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586`;
- execucao de preflight: `32e0e892-2d4f-4965-b03f-9b02a1836340`;
- site do manifesto: B1 correto.

O preflight nao executou deploy e nao chamou o CLI.

---

## 4. Digest e manifesto

| Item | Valor |
|---|---|
| `artifact_sha256` | `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339` |
| Estaticos | 7 |
| Functions | 9 arquivos (2 entradas + libs) |
| Edge | 7 arquivos (1 entrada + libs) |
| Redirects | 0 |
| Total | 25 arquivos |
| Bytes | 81.443 |
| Site | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |

Manifesto do deploy efetivo: execucao `8ed9448f-da39-42ea-83a5-4706c54ca70c`,
validada em `2026-11-20T16:51:09.025Z`, status `deployed`.

---

## 5. Comando executado

Executado uma unica vez:

```powershell
cd validation-b1
npm run deploy:b1 -- --confirm
```

Argumentos efetivos do CLI, conforme o gate:

```text
deploy
--dir <staging>/dist
--functions <staging>/netlify/functions
--site 9cd7034f-5691-46af-8030-d70f7ed52ca7
--no-build
--draft
--skip-functions-cache
--message "Fase 5F.43 preview B1 isolado"
```

Nao houve `--context`, `--prod`, `--prod-if-unlocked`, `--remote`, `--filter`, `--env`, `--secret-env`
ou argumento adicional. `--context` foi removido na 5F.45 porque e incompativel com `--no-build`.

O CLI reportou:

```text
Deploying 7 files, 2 functions and 3 edge functions
Found 2 files, 2 functions and 1 edge function to upload
Deploy is live!
```

O numero de arquivos de Edge reportado pelo CLI e a contagem do bundle, nao o numero de entradas do
contrato; a API confirma `edge_functions_present=true` e 1 Edge Function no resumo. Nao foi
publicado `collect`.

---

## 6. Deploy criado

| Campo | Valor |
|---|---|
| Deploy ID | `6b007a6d6e15671b125b952e` |
| URL draft | `https://6b007a6d6e15671b125b952e--portal-contas-validation-b1.netlify.app` |
| Estado | `ready` |
| Contexto | `deploy-preview` |
| `published_at` | `null` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Site nome | `portal-contas-validation-b1` |
| Team | `BruMiTa` / `697d58587a017c3396fb416e` |
| Site `published_deploy` | `null` |
| Site `updated_at` | `2026-11-20T16:51:07.392Z` |

O site continua sem deploy publicado. O novo deploy e draft/preview.

---

## 7. Verificacoes pos-upload

### 7.1 Arquivos estaticos

A API do deploy lista 10 entradas, incluindo 3 artefatos internos de Edge. Os estaticos/config
publicos sao:

- `/b1.css`;
- `/b1-consent.js`;
- `/build-manifest.json`;
- `/index.html`;
- `/robots.txt`;
- `/validacao-encerrada.html`;
- `/netlify.toml` (configuracao do deploy).

`_headers` nao aparece como arquivo comum, mas a regra de header foi processada.

Comparacao da API `files[].sha` (SHA-1 do arquivo de deploy) com SHA-1 local do `dist`:

| Caminho | API SHA-1 | Local SHA-1 | Resultado |
|---|---|---|---|
| `/b1.css` | `56dcf780...` | `56dcf780...` | exato |
| `/b1-consent.js` | `5e06a2f1...` | `5e06a2f1...` | exato |
| `/build-manifest.json` | `36e3f88f...` | `36e3f88f...` | exato |
| `/index.html` | `17ff39a1...` | `17ff39a1...` | exato |
| `/robots.txt` | `63657cbb...` | `63657cbb...` | exato |
| `/validacao-encerrada.html` | `60974d64...` | `60974d64...` | exato |

O HTML servido em `/` tem 2.756 bytes e o arquivo local tem 2.761; a diferenca e a normalizacao de
link feita pelo Netlify (`/validacao-encerrada.html` -> `/validacao-encerrada`). O **arquivo
publicado** na API tem SHA-1 `17ff39a1...`, identico ao local. Nao se confunde a transformacao de
resposta com divergencia de artefato.

### 7.2 Headers e redirects

Resposta de `/`:

- HTTP 200;
- `Content-Security-Policy: default-src 'none'; ... connect-src 'none'; ...`;
- `X-Robots-Tag: noindex...`;
- `Referrer-Policy: no-referrer`;
- `X-Frame-Options: DENY`;
- `Cache-Control: no-store`;
- sem `googletagmanager`, `google-analytics` ou outros recursos da raiz.

Resumo do deploy:

- 0 redirect rules;
- 1 header rule processada;
- nenhum `collect`;
- nenhuma herança de redirects/headers canonicos.

### 7.3 Functions e Edge

- `available_functions`: `capture-html` e `cleanup-html-capture`;
- nenhuma Function `collect`;
- Functions: 2;
- Edge: 1 (`html-capture`), `edge_functions_present=true`;
- schedule `cleanup-html-capture` em `15 3 * * *`; nao executado.

`GET /api/collect` respondeu 404. Nenhuma chamada de ingestao, cleanup ou Run now foi feita.

### 7.4 Producao

- `published_deploy` da B1 permanece `null`;
- nao houve promocao;
- nenhum comando foi executado no site de producao;
- nenhuma configuracao, flag, variavel ou banco remoto foi alterado.

---

## 8. Divergencias e limitacoes

1. O CLI informou 3 Edge Functions no upload, enquanto o resumo da API informa 1 Edge Function.
   A contagem do bundle inclui arquivos internos/partes; o inventario de entrada e a API indicam
   apenas `html-capture`, sem Edge extra conhecido.
2. O HTML servido e transformado pelo Netlify em relacao ao arquivo local (link normalizado), mas
   o SHA-1 do arquivo de deploy na API e identico ao local.
3. O conteudo binario/fonte de Functions/Edge nao e recuperavel integralmente pela API; a validacao
   remota usa nomes, rotas, contagens e hashes/metadados disponiveis. Nao se declara igualdade byte
   a byte para esses bundles.
4. Nao foram executados testes de ingestao, rate limit, cleanup, SSL ou consentimento remoto; isso
   exige autorizacao separada.

---

## 9. Ausencia de operacoes adicionais

- Nenhum segundo deploy/retry.
- Nenhum `netlify deploy` direto.
- Nenhum `--prod`/`--prod-if-unlocked`/`--context`.
- Nenhuma migration/Neon/cleanup/flags.
- Nenhuma alteracao de producao.
- Nenhum commit, push ou PR.
- Nenhuma chamada de escrita adicional ao Netlify apos o deploy.
- Apenas leituras de API e HTTP apos o deploy.

---

## 10. Classificacao final

**2 - Deploy realizado com validacao incompleta.**

O deploy draft foi criado no destino correto, esta `ready`, em `deploy-preview`, com
`published_at=null`, e os arquivos estaticos publicados correspondem ao SHA-1 local. O isolamento
de headers, redirects, Functions e a ausencia de `collect` foram confirmados. A validacao nao e
completa para o conteudo byte a byte de Functions/Edge, que a API nao expoe integralmente.

Nao e classificacao 3 porque o deploy foi criado e o destino/draft/estaticos foram comprovados.
Nao e classificacao 1 porque a integridade completa de todos os componentes remotos nao foi
demonstrada.

A autorizacao terminou apos esta unica tentativa e verificacao. Nao executar segundo deploy,
promocao, migration, cleanup ou producao sem nova autorizacao explicita.
