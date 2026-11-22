# Fase 5F.59 - Correcao do empacotamento das Functions B1

Status: **correcao local concluida e novo artefato congelado; nenhum deploy executado**.
Data: **2026-11-22**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.

**Classificacao: 1 - Corrigido e validado.**

O novo artefato contem Functions empacotadas com suas dependencias e foi validado localmente,
inclusive pela inicializacao dos tres entrypoints fora do repositorio.

---

## 1. Causa raiz comprovada

Causa imediata da Fase 5F.58:

```text
Cannot find package 'pg' imported from /var/task/collect.mjs
```

O artefato 5F.55 continha os 16 arquivos-fonte de Functions, mas nao continha `package.json`,
`package-lock.json`, `node_modules` nem uma etapa de empacotamento das dependencias. O deploy
`--no-build` enviou as Functions como fontes, e `/var/task/collect.mjs` nao encontrou `pg` no
runtime.

O problema nao era:

- schema ou migrations;
- privilegios do Neon;
- CSP;
- caminho `/api/collect`;
- configuracao de origem.

A correcao escolhida usa o empacotador oficial do Netlify (`netlify functions:build`, baseado em
zip-it-and-ship-it/nft) para gerar tres arquivos `.zip` autocontidos, incluindo `node_modules`
e suas dependencias transitivas.

---

## 2. Arquivos alterados ou adicionados

### Novos scripts

- `validation-b1/scripts/bundle-functions.mjs`
  - executa `netlify functions:build`;
  - valida a existencia de `capture-html.zip`, `cleanup-html-capture.zip` e `collect.zip`;
  - remove o `manifest.json` local do ZISI com caminhos absolutos;
  - nao acessa a rede.

- `validation-b1/scripts/freeze-artifact-runtime.mjs`
  - cria o pacote com as Functions empacotadas;
  - valida contrato e bundles;
  - congela o diretorio;
  - calcula digest e cria o manifesto de integridade.

### Alteracoes locais

- `validation-b1/scripts/artifact.mjs`
  - suporte opcional a `netlify/functions-bundled`;
  - validacao de nomes de bundles;
  - digest e manifesto incluem os tres zips.

- `validation-b1/scripts/deploy-target.mjs`
  - usa `netlify/functions-bundled` quando presente;
  - mantem fallback para o diretorio-fonte em testes/artefatos legados.

- `validation-b1/scripts/deploy-b1.mjs`
  - gate oficial agora empacota as Functions antes de criar o pacote;
  - valida os bundles antes do deploy;
  - usa o diretorio `netlify/functions-bundled` no comando de deploy.

- `validation-b1/shared-manifest.json`
  - regenerado pelo `sync:shared` do gate; nao houve alteracao de codigo compartilhado.

Nao foram alterados:

- logica de negocio de ingestao;
- contrato da API;
- schema, migrations ou grants;
- CSP;
- variaveis, secrets ou flags do Netlify;
- Neon;
- producao.

---

## 3. Dependencias auditadas

As 16 Functions-fonte sao:

```text
capture-html.mjs
cleanup-html-capture.mjs
collect.mjs
_lib/attribution.mjs
_lib/capture-config.mjs
_lib/capture-handler.mjs
_lib/capture-validation.mjs
_lib/cleanup-html-capture.mjs
_lib/cleanup-retention.mjs
_lib/collect-handler.mjs
_lib/config.mjs
_lib/db.mjs
_lib/http.mjs
_lib/rate-limit.mjs
_lib/user-agent.mjs
_lib/validation.mjs
```

Dependencias externas usadas:

| Pacote | Uso |
|---|---|
| `pg` | conexao PostgreSQL em collect/capture/cleanup |
| `zod` | validacao de payload/coleta |
| `ua-parser-js` | classificacao derivada de dispositivo/browser/OS |

Dependencias transitivas de `pg` empacotadas: `pg-cloudflare`, `pg-connection-string`,
`pg-int8`, `pg-pool`, `pg-protocol`, `pg-types`, `pgpass`, `postgres-array`, `postgres-bytea`,
`postgres-date`, `postgres-interval`, `split2` e `xtend`, alem de `zod`/`ua-parser-js` onde
aplicavel.

Os bundles nao dependem de `node_modules` externo ao `.zip`.

---

## 4. Novo artefato

| Item | Valor |
|---|---|
| Diretorio congelado | `C:\Users\Joanita\AppData\Local\Temp\opencode\b1-artifact-5f59` |
| Integridade externa | `C:\Users\Joanita\AppData\Local\Temp\opencode\b1-5f59-integrity.json` |
| SHA-256 do artefato | `7504d3475c1eb20d2a6b7f4c0be3b3f6215fdfd4e6ad78d909e3cd02fac1deea` |
| `package-manifest.json` SHA-256 | `dcba286b956750908715ad3accc43cb4d2cfedd63009348522e55bf9c3a0570d` |
| Arquivos totais | 35 |
| Bytes totais | 2.555.064 |
| Estaticos | 7 |
| Functions-fonte | 16 |
| Functions empacotadas | 3 zips |
| Edge Functions | 7 |
| Redirects | 0 |
| CSP `_headers` SHA-256 | `b98b4793ac11cc100247dcc06d9131a81833d61a070b3654254868c96fff9f92` |

Bundles:

```text
netlify/functions-bundled/capture-html.zip
netlify/functions-bundled/cleanup-html-capture.zip
netlify/functions-bundled/collect.zip
```

Hashes dos bundles:

```text
capture-html.zip        1c7147672df7e322c62ebc41020aac0d0cab66c3bdfc3bfcb8da0c08a2421dcb
cleanup-html-capture.zip 37ed95edbc95cabea6572c9b5d8427a4d82e9b68e811ff85cecbb3fc12c4a098
collect.zip             e0f8afbc817a68ed68a39565a22d87540cafbfce7b5fefc4e4a2c0c8399ba9ee
```

Comando exato de geracao:

```powershell
node scripts/bundle-functions.mjs `
  "D:\Projetos\Site Calculadora\validation-b1\netlify\functions" `
  "C:\Users\Joanita\AppData\Local\Temp\opencode\b1-5f59-bundled-functions"

node scripts/freeze-artifact-runtime.mjs `
  "C:\Users\Joanita\AppData\Local\Temp\opencode\b1-artifact-5f59" `
  "C:\Users\Joanita\AppData\Local\Temp\opencode\b1-5f59-integrity.json" `
  "C:\Users\Joanita\AppData\Local\Temp\opencode\b1-5f59-bundled-functions"
```

O gate oficial `npm run deploy:b1 -- --check` tambem gerou o mesmo digest
`7504d3475c1eb20d2a6b7f4c0be3b3f6215fdfd4e6ad78d909e3cd02fac1deea`, sem deploy.

---

## 5. Comprovacao de runtime

Cada `.zip` foi extraido em diretorio vazio, sem `node_modules` no diretorio pai, e importado
diretamente com Node:

```json
{"name":"collect","config":"/api/collect","handler":"function","pg":true}
{"name":"capture-html","config":"/api/capture-html","handler":"function","pg":true}
{"name":"cleanup-html-capture","config":null,"handler":"function","pg":true}
```

O `collect.zip` contem:

- `netlify/functions/collect.mjs` ja empacotado com as dependencias internas;
- `node_modules/pg` e transitivas;
- `node_modules/zod`;
- `node_modules/ua-parser-js`;
- `___netlify-entry-point.mjs` e metadados do runtime.

As rotas confirmadas no bundle sao `/api/collect` e `/api/capture-html`; o cleanup mantem o
agendamento declarado pelo contrato de Function.

Isso comprova resolucao de `pg` no pacote executavel, nao apenas no `node_modules` do repositorio.

---

## 6. Validacao e testes

| Verificacao | Resultado |
|---|---|
| `validarPacote` | passou |
| `validarBundledFunctions` | 3/3 |
| Digest recalculado apos congelamento | igual |
| SHA-256 do artefato | `7504d347...` |
| B1 Windows | 57 pass, 1 skip (symlink), 0 fail |
| B1 Linux Node 22 | 58 pass, 0 fail |
| B1 browser consent | 2/2 |
| `test:analytics` | 137/137 |
| Playwright | 62/62 |
| `test:isolation` | 53 arquivos preservados |
| Build canonico | 162 HTML |
| Build B1 | 6 estaticos + manifest |
| Gate `--check` | `7504d347...`, sem deploy |
| Inicializacao dos 3 bundles | passou, `pg` resolvido |

Nao houve chamada remota, deploy, upload, ativacao ou escrita no Neon nesta fase.

---

## 7. Diferencas em relacao ao 5F.55

| Item | 5F.55 | 5F.59 |
|---|---|---|
| SHA-256 | `834dce3...` | `7504d347...` |
| Arquivos | 32 | 35 |
| Bytes | 105.975 | 2.555.064 |
| Estaticos | 7 | 7 |
| Functions-fonte | 16 | 16 |
| Bundles executaveis | 0 | 3 |
| Edge | 7 | 7 |
| Redirects | 0 | 0 |
| CSP | correta | correta |
| Dependencias runtime | ausentes | incluidas nos zips |

Foram adicionados apenas os tres zips de Functions empacotadas e a infraestrutura local de
empacotamento. Os arquivos-fonte das Functions, staticos, Edge e CSP permaneceram iguais ao
contrato anterior. O artefato 5F.55 continua intacto como registro historico.

---

## 8. Riscos e pendencias

1. A importacao local prova resolucao Node, mas a publicacao real dos zips nao foi executada
   nesta fase; o proximo deploy deve ser autorizado e validado no draft.
2. O runtime dos bundles reportado pelo ZISI local e `nodejs24.x`; o projeto B1 usa
   `NODE_VERSION=22`. Os pacotes `pg`, `zod` e `ua-parser-js` sao JavaScript compativel; o
   Netlify deve confirmar o runtime no deploy.
3. O gate agora usa `netlify/functions-bundled` quando presente; o artefato novo inclui esse
   diretorio.
4. Variaveis Netlify ja configuradas na Fase 5F.58 nao foram alteradas por esta fase.
5. Um novo deploy precisa ser autorizado; nao houve deploy em 5F.59.

---

## 9. Confirmacao de ausencia de operacao remota

- Nenhum deploy, upload ou publicacao.
- Nenhuma alteracao no Netlify.
- Nenhuma alteracao de secrets, variaveis ou flags.
- Nenhuma escrita no Neon.
- Nenhuma migration ou grant.
- Nenhuma ingestao remota.
- Nenhum cleanup.
- Nenhuma alteracao em producao.
- Nenhum commit, push ou PR.

Todas as operacoes foram locais. Nenhum secret foi incluido no artefato, nos zips ou no relatorio.

**Classificacao final: 1 - Corrigido e validado.**
