# Fase 5F.61 - Diagnostico definitivo do runtime das Functions B1

Status: **causa raiz identificada e correcao local validada; nenhum deploy executado**.
Data: **2026-11-22**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.

**Classificacao: 1 - Resolvido localmente.**

A falha da 5F.60 nao era de `pg`, banco ou CSP. O artefato 5F.59 usava arquivos `.zip`
pre-compilados fora do fluxo esperado pelo deploy de Functions com rotas customizadas. O Netlify
aceitou os arquivos como Functions, mas nao reconstruiu as rotas e os metadados de runtime; por
isso `/api/collect` ficou 404 e a rota padrao retornou 502.

A correcao usa o diretorio-fonte oficial de Functions + `node_modules` de producao no mesmo
diretorio-base. O ZISI/Netlify CLI entao gera os bundles no deploy, preservando rotas, runtime e
dependencias.

---

## 1. Causa raiz comprovada

### Evidencia

Com o diretorio de zips do 5F.59, `zipFunctions` retornou:

```json
[
  { "name": "collect", "routes": [] },
  { "name": "capture-html", "routes": [] },
  { "name": "cleanup-html-capture", "routes": [] }
]
```

O mesmo `zipFunctions` sobre o diretorio-fonte, com `node_modules` de producao disponivel,
retornou:

```json
[
  {
    "name": "collect",
    "routes": [{ "pattern": "/api/collect", "literal": "/api/collect" }],
    "size": 1060351
  },
  {
    "name": "capture-html",
    "routes": [{ "pattern": "/api/capture-html", "literal": "/api/capture-html" }],
    "size": 1007736
  },
  {
    "name": "cleanup-html-capture",
    "routes": [],
    "size": 426860
  }
]
```

Conclusao: quando o Netlify CLI recebe novamente um diretorio contendo zips, ele nao recupera as
rotas customizadas do bundle. Quando recebe as fontes, ele registra as rotas e inclui as
dependencias.

O 502 em `/.netlify/functions/collect` e consistente com a falta dos metadados de deploy/runtime
que o empacotamento pre-compilado descartado nao forneceu. A correcao correta e deixar o ZISI
oficial gerar o bundle a partir das fontes no deploy, com as dependencias disponiveis.

### Causa secundaria anterior

O 5F.58 original falhou porque o staging nao tinha dependencias de runtime. O staging do deploy
precisa ter `package.json`, `package-lock.json` e `node_modules` de producao para que o ZISI
resolva `pg`, `zod` e `ua-parser-js` enquanto registra as Functions.

---

## 2. Mapeamento das 16 Functions

| # | Arquivo-fonte | Tipo | Rota/registro | Dependencia externa |
|---|---|---|---|---|
| 1 | `capture-html.mjs` | entrypoint | `/api/capture-html` | `zod`, `pg` via captura |
| 2 | `cleanup-html-capture.mjs` | entrypoint | schedule do contrato; sem rota HTTP propria | `pg` |
| 3 | `collect.mjs` | entrypoint | `/api/collect` | `pg`, `zod`, `ua-parser-js` |
| 4 | `_lib/attribution.mjs` | interno | importado por collect | nenhuma |
| 5 | `_lib/capture-config.mjs` | interno | importado por captura | nenhuma |
| 6 | `_lib/capture-handler.mjs` | interno | importado por captura | `zod`, `pg` |
| 7 | `_lib/capture-validation.mjs` | interno | importado por captura | `zod` |
| 8 | `_lib/cleanup-html-capture.mjs` | interno | importado por cleanup | `pg` |
| 9 | `_lib/cleanup-retention.mjs` | interno | importado por cleanup | `pg` |
| 10 | `_lib/collect-handler.mjs` | interno | importado por collect | `pg`, `zod`, `ua-parser-js` |
| 11 | `_lib/config.mjs` | interno | importado por collect | nenhuma |
| 12 | `_lib/db.mjs` | interno | importado por collect/captura/cleanup | `pg` |
| 13 | `_lib/http.mjs` | interno | importado por collect/captura | nenhuma |
| 14 | `_lib/rate-limit.mjs` | interno | importado por collect | nenhuma |
| 15 | `_lib/user-agent.mjs` | interno | importado por collect | `ua-parser-js` |
| 16 | `_lib/validation.mjs` | interno | importado por collect | `zod` |

Existem 16 arquivos-fonte e 3 entrypoints executaveis. Os outros 13 sao modulos internos
compartilhados. A contagem 7 estaticos + 16 Functions + 7 Edge e a estrutura de contrato do
artefato; a contagem de deploy e 3 Functions porque somente os entrypoints viram arquivos ZIP.

---

## 3. Formato dos bundles do 5F.59

Os tres zips foram gerados pelo ZISI/Netlify Functions Build e continham:

- `netlify/functions/{entrypoint}.mjs`;
- `node_modules` com `pg`/transitivas, `zod` e `ua-parser-js`;
- bootstrap e entrypoint do runtime;
- runtime reportado `nodejs24.x`;
- CommonJS/ESM compativel com o bootstrap do runtime.

O erro 5F.60 nao foi de formato de modulo nem de `pg`; foi de **registro/perda de metadados**
quando o diretorio de zips foi entregue ao deploy. Os zips possuiam `___netlify-metadata.json`
basico, mas nao as rotas customizadas no nivel que o `netlify deploy` reconstruiu.

---

## 4. Relacao Functions x bundles

No artefato 5F.59:

- 3 zips (`collect.zip`, `capture-html.zip`, `cleanup-html-capture.zip`);
- 3 Functions de deploy;
- 16 arquivos-fonte preservados para auditoria;
- as rotas customizadas existiam no codigo-fonte, mas nao foram reaplicadas ao reempacotar zips.

Essa estrutura nao e compativel com o comando de deploy que recebe um diretorio de zips para
recriar as Functions. O deploy oficial precisa das fontes para descobrir `config.path`.

---

## 5. Correcao local adotada

O artefato 5F.61 volta a usar a pasta-fonte `netlify/functions` no deploy, mas inclui no diretorio
base:

```text
package.json
package-lock.json
node_modules/
```

O `node_modules` e instalado somente com dependencias de producao:

```text
pg 8.23.1
ua-parser-js 2.0.10
zod 4.6.7
```

e transitivas de `pg`.

Assim, o ZISI do Netlify CLI:

1. descobre os 3 entrypoints e os modulos internos;
2. le `config.path='/api/collect'` e `/api/capture-html`;
3. resolve `pg`, `zod` e `ua-parser-js` no diretorio-base;
4. gera os zips de deploy com rotas e dependencias no momento do deploy.

Scripts adicionados/ajustados:

- `validation-b1/scripts/prepare-runtime-deps.mjs` - instala dependencias de producao em staging;
- `validation-b1/scripts/artifact.mjs` - aceita runtime deps, hasheia package/lock/node_modules;
- `validation-b1/scripts/deploy-b1.mjs` - usa runtime deps e fonte no gate;
- `validation-b1/scripts/deploy-target.mjs` - volta ao diretorio-fonte autorizado;
- `validation-b1/scripts/freeze-artifact-runtime.mjs` - congela o pacote com runtime deps.

Nao houve alteracao de logica de negocio, schema, migrations, grants, CSP ou Netlify.

---

## 6. Reproducao local

O teste de descoberta/registro foi feito com o proprio ZISI oficial:

```text
fonte + node_modules producao:
  collect: rota /api/collect, tamanho com pg
  capture-html: rota /api/capture-html, tamanho com pg
  cleanup-html-capture: sem rota HTTP propria, schedule
```

O zip de `collect` foi extraido e importado fora do repositorio:

```json
{"path":"/api/collect","handler":"function","pg":true}
```

Tambem foi executado em Node 22 dentro de container:

```json
{"path":"/api/collect","handler":"function","pg":true}
```

O teste detecta explicitamente a falha do 5F.59: quando a entrada e um diretorio de zips, as
rotas retornam vazias; quando a entrada e o diretorio-fonte com dependencias, as rotas retornam
preenchidas.

---

## 7. Novo artefato

| Item | Valor |
|---|---|
| Diretorio | `C:\Users\Joanita\AppData\Local\Temp\opencode\b1-artifact-5f61` |
| SHA-256 | `0bdf9d0b4843aa79760a5750b14ebcdc748022e84616ec4dd2e28d8e35ba8dbe` |
| Arquivos | 1.251 |
| Bytes | 8.593.946 |
| Estaticos | 7 |
| Functions-fonte | 16 |
| Edge | 7 |
| Zips pre-compilados | 0 |
| Redirects | 0 |
| CSP | B1 exata |
| Runtime deps | `pg`, `zod`, `ua-parser-js` + transitivas |

O `package-manifest.json` continua:
`dcba286b956750908715ad3accc43cb4d2cfedd63009348522e55bf9c3a0570d`.
O `netlify.toml` mantem `7b5f627a...` e a CSP/edge permanecem iguais.

O gate oficial `npm run deploy:b1 -- --check` reproduziu
`0bdf9d0b4843aa79760a5750b14ebcdc748022e84616ec4dd2e28d8e35ba8dbe`.

Artefatos historicos preservados:

- 5F.55: `834dce3...`, intacto;
- 5F.59: `7504d347...`, intacto.

---

## 8. Diferencas em relacao ao 5F.59

| Item | 5F.59 | 5F.61 |
|---|---|---|
| Entrada de deploy | diretorio de zips | diretorio-fonte |
| Rotas customizadas | perdidas no reempacotamento | descobertas do codigo |
| Dependencias | zips pre-compilados | node_modules de producao no staging |
| Functions-fonte | 16 | 16 |
| Zips pre-compilados | 3 | 0 |
| Arquivos | 35 | 1.251 |
| Hash | `7504d347...` | `0bdf9d0b...` |

O aumento de arquivos vem das 19 arvores de pacotes de producao e seus arquivos; nao ha duplicacao
de versoes deliberada.

---

## 9. Testes executados

| Suite | Resultado |
|---|---|
| Descoberta/registro ZISI com fonte + deps | rotas `/api/collect` e `/api/capture-html` |
| Inicializacao do zip de collect | passou; `pg` resolvido |
| Node 22 no container | passou |
| B1 Windows | 57 pass, 1 skip (symlink), 0 fail |
| B1 Linux Node 22 | 58 pass, 0 fail |
| B1 browser consent | 2/2 |
| `test:analytics` | 137/137 |
| Playwright | 62/62 |
| `test:isolation` | 54 arquivos preservados |
| Build canonico | 162 HTML |
| Build B1 | 6 estaticos + manifest |
| Gate `--check` | `0bdf9d0b...`, sem deploy |

O skip Windows e o teste de symlink; a suite Linux correspondente passou 58/58.

---

## 10. Riscos e pendencias

1. O novo artefato ainda nao foi publicado; o deploy real deve ser autorizado e testado.
2. A descoberta de rotas foi comprovada com o ZISI oficial e importacao local, mas a resposta
   final do Netlify so sera conhecida no draft.
3. O runtime dos zips gerados localmente e `nodejs24.x`; o projeto declara Node 22. As dependencias
   sao JavaScript compativel; confirmar no deploy.
4. O artefato contem `node_modules` de producao; nao contem devDependencies como `netlify-cli`.
5. Nao houve deploy, upload, alteracao no Netlify, Neon, secrets, flags, migrations, grants,
   cleanup, commit ou push nesta fase.

---

## 11. Confirmacao de ausencia de operacoes remotas

- Nenhum deploy.
- Nenhum upload.
- Nenhuma alteracao no Netlify.
- Nenhuma alteracao no Neon.
- Nenhuma alteracao de secrets ou flags.
- Nenhuma migration ou grant.
- Nenhuma ingestao remota.
- Nenhum cleanup.
- Nenhuma operacao em producao.
- Nenhum commit, push ou PR.

Todos os testes desta fase foram locais. Nenhum secret foi incluido no artefato ou no relatorio.

**Classificacao final: 1 - Resolvido localmente.**
