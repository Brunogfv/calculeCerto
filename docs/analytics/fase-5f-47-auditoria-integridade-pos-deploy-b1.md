# Fase 5F.47 - Auditoria de integridade pos-deploy B1

Status: **auditoria somente leitura concluida; nenhum deploy, upload, alteracao remota, migration,
cleanup, commit ou push executado**.
Data/hora de referencia: **2026-11-20T19:56:37Z**.
Deploy auditado: `6b007a6d6e15671b125b952e`.
Site: `portal-contas-validation-b1` (`9cd7034f-5691-46af-8030-d70f7ed52ca7`).
URL draft: `https://6b007a6d6e15671b125b952e--portal-contas-validation-b1.netlify.app`.
Digest local aprovado: `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339`.
Artefato local: 25 arquivos, 81.443 bytes.

**Classificacao: 2 - Integridade parcialmente comprovada.**
Destino, draft, arquivos estaticos e inventario de recursos foram comprovados. Functions e Edge
Functions nao possuem recuperacao integral de conteudo pela API oficial; portanto nao se declara
igualdade byte a byte para esses componentes.

---

## 1. Escopo e limites

Esta fase nao autorizou:

- novo deploy, upload ou retry;
- alteracao de configuracao, variavel, flag ou producao;
- migration, cleanup ou Scheduled Functions;
- commit, push ou PR;
- chamada de escrita em APIs remotas.

Foram usadas apenas leituras locais e consultas HTTP/API somente leitura. Nenhum recurso remoto foi
alterado.

---

## 2. Inventario local

### 2.1 Functions publicadas

O contrato B1 tem duas Functions de entrada e sete arquivos de biblioteca:

| Funcao | Entrada | Rotas esperadas | Dependencias principais |
|---|---|---|---|
| capture-html | `netlify/functions/capture-html.mjs` | `/api/capture-html` | `_lib/capture-handler`, `_lib/db` |
| cleanup-html-capture | `netlify/functions/cleanup-html-capture.mjs` | agendada | `_lib/db`, `_lib/cleanup-html-capture` |

Arquivos locais e SHA-256 (do manifesto 5F.45):

| Caminho | SHA-256 |
|---|---|
| `netlify/functions/capture-html.mjs` | `669c39813063e968ffb2f4c0fff6cc946b57d657928e4d06f396e240ee77c999` |
| `netlify/functions/cleanup-html-capture.mjs` | `c9f7dd040042c575644b89268dea897652760019a7113a08290e801a7e193a3a` |
| `_lib/capture-config.mjs` | `89a7de54fda9e0d508fa5dc5bc9c6dc310b369fad6d877bbe2d1139fb4f44730` |
| `_lib/capture-handler.mjs` | `b87766d6e0390a0d5e14be34454d8431a3b07d647b4e350b313ccf2630eb4ca1` |
| `_lib/capture-validation.mjs` | `9c053c7473e49a71808fd1e678a5b113b24dc9c508b85c784fd9b54ac9c1e788` |
| `_lib/cleanup-html-capture.mjs` | `1bbdf4e1a316f2752ce0e8c060695d539d600293b307838bcd1397c8acd12564` |
| `_lib/cleanup-retention.mjs` | `14c57306c6ad3995b60793850e1489a710d978c674951848ca2e3f79825fdaba` |
| `_lib/db.mjs` | `6f153a461ebcc7b5689100e7a9ab6c1662de6244f9d0ba51e5838633cdc94820` |
| `_lib/http.mjs` | `818468e1e8e7e66d42a18c719b1068dfbfd7f6a37511d6c8315073e27f131929` |

### 2.2 Edge Function publicada

| Caminho | Funcao | SHA-256 |
|---|---|---|
| `netlify/edge-functions/html-capture.js` | entrada | `655a1bb9c52f204e822e24a96d6edb58217766649f266d3fa332ed2c6a5d9e86` |
| `_lib/capture-limits.mjs` | suporte | `ab59256ddbc958cd1b19761d3605c94cd6790b2fc9f664d251d66c2d192b19bd` |
| `_lib/capture-policy.mjs` | suporte | `81de026b4035ed295d007a31f25416f2716bdf5e01575eada0cddf68ce1e1c85` |
| `_lib/capture-signature.mjs` | suporte | `fb5a4c94cf8f9fc08e19b2b0e0be3cdb2c8feb0fda2b4b6ac999d74be7f5adfa` |
| `_lib/classifier.mjs` | suporte | `2f6c3020fe4b2189974ed21d30399ed55140f312faebb2d7801d19ca7503a42b` |
| `_lib/edge-capture.mjs` | suporte | `7a66cff0702b1263f7f125946f70205cae1e866a2eaafdf8a6083e15cce41bf1` |
| `_lib/edge-env.mjs` | suporte | `e349d2068e92cfee886344ea6ac1f701f58add0cc9334a4782ec59b8f540f21c` |

### 2.3 Pacote

- 25 arquivos;
- 7 estaticos;
- 9 arquivos de Functions (2 entradas + 7 libs);
- 7 arquivos de Edge (1 entrada + 6 libs);
- 0 redirects;
- configuracao `netlify.toml` com SHA-256
  `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586`;
- `package-manifest.json` SHA-256
  `4cbb24300322db9d8dd1ed8701c23bd4214e3a1eaf527320ff5512179608aeac`;
- `artifact_sha256` `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339`.

---

## 3. Metodos de inspeção

Consultas somente leitura:

- `GET /sites/{site_id}` - site, publicacao, team;
- `GET /deploys/{deploy_id}` - estado, contexto, funcoes, schedules, Edge;
- `GET /deploys/{deploy_id}/files` - lista de arquivos do deploy;
- `GET /sites/{site_id}/functions` - metadata de Functions do site publicado (vazio, pois nao ha
  deploy publicado);
- HEAD/GET na URL draft para headers, status e arquivos estaticos.

Nao foi usado endpoint de escrita. O endpoint de listagem de arquivos do deploy nao esta descrito
como contrato publico no Swagger local instalado; a leitura foi tratada como evidencia auxiliar, nao
como garantia de recuperacao integral. Nao ha GET documentado para o conteudo de Function/Edge por
nome.

---

## 4. Evidencias remotas

### 4.1 Deploy

| Campo | Valor |
|---|---|
| Deploy ID | `6b007a6d6e15671b125b952e` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Estado | `ready` |
| Contexto | `deploy-preview` |
| `published_at` | `null` |
| Site `published_deploy` | `null` |
| Site `deploy_id` | vazio |
| Site `updated_at` | `2026-11-20T16:51:07.392Z` |
| Team | `BruMiTa` / `697d58587a017c3396fb416e` |
| URL | `https://6b007a6d6e15671b125b952e--portal-contas-validation-b1.netlify.app` |

### 4.2 Functions reportadas

| Nome | API `d` | ID | Runtime | Regiao | Rota | Schedule |
|---|---|---|---|---|---|---|
| `capture-html` | `5076ad20c9c2316d554cec38c4e004538d5ca586616fefefbd024a8274c72943` | `f09be74e...` | `nodejs24.x` | `us-east-2` | `/api/capture-html` | nao |
| `cleanup-html-capture` | `c731a5876b10d1c93816b2d31d9ed7069bac6a0f5f0635f39a96cfe5e7786595` | `dc8f3b09...` | `nodejs24.x` | `us-east-2` | agendada | `15 3 * * *` |

`available_functions` contem exatamente duas entradas; nao ha `collect`. `required_functions` esta
vazio.

O campo `d` e um identificador/digest reportado pela API, mas nao corresponde diretamente ao
SHA-256 do arquivo-fonte local; e o resultado do bundle da Function. Nao foi possivel recuperar o
bundle para recalcular SHA-256 localmente.

### 4.3 Edge

- `edge_functions_present=true`;
- resumo do deploy: 1 Edge Function;
- inventario local: uma entrada `html-capture` + 6 libs;
- nenhuma Edge adicional, `collect` ou recursso canonico identificado;
- a API nao expoe o bundle/binario da Edge de forma recuperavel, nem hash SHA-256 do conteudo.

### 4.4 Arquivos publicados

Lista API: 10 entradas, incluindo 3 artefatos internos de Edge. Arquivos comuns:

- `/b1.css`;
- `/b1-consent.js`;
- `/build-manifest.json`;
- `/index.html`;
- `/netlify.toml`;
- `/robots.txt`;
- `/validacao-encerrada.html`.

`_headers` e processado como regra de header, nao aparece como arquivo comum.

Comparacao SHA-1 da API com SHA-1 local:

| Caminho | API SHA-1 | Local SHA-1 | Resultado |
|---|---|---|---|
| `/b1.css` | `56dcf780...` | `56dcf780...` | exato |
| `/b1-consent.js` | `5e06a2f1...` | `5e06a2f1...` | exato |
| `/build-manifest.json` | `36e3f88f...` | `36e3f88f...` | exato |
| `/index.html` | `17ff39a1...` | `17ff39a1...` | exato |
| `/robots.txt` | `63657cbb...` | `63657cbb...` | exato |
| `/validacao-encerrada.html` | `60974d64...` | `60974d64...` | exato |

O HTML servido em `/` tem 2.756 bytes e o local 2.761; a diferenca e a normalizacao de link pelo
Netlify (`validacao-encerrada.html` -> `validacao-encerrada`). O SHA-1 do **arquivo de deploy** na
API coincide com o local. Nao e divergencia de artefato; e transformacao de resposta.

### 4.5 Headers e isolamento

- HTTP 200 na URL draft;
- `Content-Security-Policy: default-src 'none'; ... connect-src 'none'; ...`;
- `X-Robots-Tag: noindex...`;
- `Referrer-Policy: no-referrer`;
- `X-Frame-Options: DENY`;
- `Cache-Control: no-store`;
- sem `googletagmanager`, `google-analytics` ou CSP canonica;
- 0 redirects;
- 1 header rule processada;
- `/api/collect` retorna 404;
- `published_deploy` continua `null`.

---

## 5. Comparacoes e conclusao por componente

| Componente | Evidencia remota | Comparacao | Conclusao |
|---|---|---|---|
| Estaticos | SHA-1 da API, tamanhos, GET/HEAD | 6/6 SHA-1 exatos; HTML de resposta normalizado | Comprovado |
| Configuracao | netlify.toml no deploy; 0 redirects; 1 header | Sem hash de bytes recuperavel; comportamento B1 | Parcial |
| Functions | nomes, rotas, runtime, regiao, `d`, IDs, schedule | Nao ha bundle recuperavel; `d` nao e hash do fonte | Parcial |
| Edge | `edge_functions_present`, 1 Edge, inventario local | Nao ha bundle/hash recuperavel | Parcial |
| Isolamento | 2 Functions, sem collect, 0 redirects, headers B1 | comprovado por metadados/comportamento | Comprovado |
| Draft/producao | `deploy-preview`, `published_at=null`, `published_deploy=null` | comprovado | Comprovado |

**Nao se declara integridade byte a byte de Functions/Edge.** A conclusao e de equivalencia de
inventario e comportamento observavel, nao de conteudo executavel remoto.

---

## 6. Limitacoes tecnicas

1. A API oficial instalada documenta apenas `GET /sites/{site_id}/functions`; nao ha GET documentado
   de conteudo de Function por deploy.
2. Nao ha GET documentado do bundle de Edge Function; a metadata informa presenca e contagem, nao
   bytes.
3. O endpoint de listagem de arquivos do deploy foi usado apenas em leitura; nao e tratado como
   garantia de recuperacao de Functions/Edge.
4. O campo `d` das Functions e um digest de bundle, nao o SHA-256 do arquivo-fonte local.
5. O HTML servido e normalizado pelo Netlify; o arquivo de deploy e o SHA-1 da API foram usados
   para separar transformacao de resposta de divergencia de artefato.
6. Nao foram executados testes de ingestao, rate limit, SSL, cleanup ou consentimento remoto; isso
   exigiria autorizacao e escrita/execucao separadas.

---

## 7. Riscos residuais

- O conteudo executavel de Functions/Edge nao foi comparado byte a byte; uma alteracao remota
  manteria os mesmos nomes/rotas e nao seria detectada por esta auditoria.
- O `d`/IDs remotos nao possuem contraparte local reproduzida.
- A transformacao HTML do Netlify e esperada, mas exige a ressalva de que o corpo servido difere do
  arquivo armazenado.
- O deploy e draft e nao publicado; nao ha validacao de producao.
- Uma nova tentativa/deploy continua exigindo autorizacao separada.

---

## 8. Confirmacao de ausencia de operacoes

- Nenhum deploy, upload, retry ou promocao.
- Nenhuma alteracao de configuracao, flag, variavel, dominio ou producao.
- Nenhuma migration, Neon, cleanup, cron ou Scheduled Function.
- Nenhuma escrita em API remota.
- Nenhum commit, push ou PR.
- Lock e staging locais ausentes no encerramento.

---

## 9. Classificacao final

**2 - Integridade parcialmente comprovada.**

O deploy draft, destino, isolamento, arquivos estaticos, headers, redirects e inventario de
Functions/Edge estao comprovados. A igualdade byte a byte de Functions/Edge nao pode ser
demonstrada com os mecanismos oficiais disponiveis, e o conteudo executavel remoto permanece sem
comparacao integral.

Nao e 1 porque falta essa comparacao. Nao e 3 porque nao ha divergencia comprovada e o deploy
existente esta consistente com o inventario e com os arquivos estaticos aprovados.

A auditoria nao autoriza novo deploy, promocao, migration, cleanup ou producao.
