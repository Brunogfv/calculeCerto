# Consolidacao local do Analytics no Portal completo

Status: **consolidacao local executada e validada; nenhum commit, deploy ou escrita remota**.
Data: **2026-11-22**.
Branch: `feat/portal-analytics`.
HEAD inicial/final: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
Main/producao: `572457e506b35ce7fa0e423280aedd82b11c43fb`.

**Classificacao: 1 - CONSOLIDACAO LOCAL APROVADA.**

O site completo foi construido, os 162 HTML permaneceram consistentes, as Functions foram
empacotadas e inicializadas localmente e as suites aplicaveis passaram. O artefato minimo B1 nao
foi usado como producao.

---

## 1. Snapshot e preservacao

Snapshot local recuperavel:

```text
C:\Users\Joanita\AppData\Local\Temp\opencode\pca-snapshot-consolidation
```

| Item | Valor |
|---|---|
| `tracked.patch` SHA-256 | `1a652445eebeb1abd787bb065d8be62e40d6931e6b6fde06cdb651fe59460be7` |
| Arquivos untracked copiados | 176 |
| `status.txt` | preservado |
| `untracked-manifest.json` | preservado |
| Patch verificado contra o indice/HEAD | `git apply --check --cached --binary` = ok |
| Artefato B1 5F.61 | preservado, SHA-256 `0bdf9d0b4843aa79760a5750b14ebcdc748022e84616ec4dd2e28d8e35ba8dbe` |
| Artefatos 5F.55/5F.59 | ambos presentes e nao modificados |

Nenhum reset, checkout, clean, restore, stash, rebase, cherry-pick ou exclusao foi executado.

---

## 2. Alteracoes locais e tratamento dos HTML

### 2.1 HTML consolidados

O build aplicou Analytics em **162 HTML**. A analise comparativa confirmou um unico bloco
consistente, com os mesmos 508 bytes de marcacao:

- 106 paginas com insercao do bloco (`+15/-0`);
- 55 paginas com bloco + reordenacao da tag Google (`+16/-1`);
- 1 pagina, `paginas/privacidade.html`, com bloco + texto editorial (`+59/-18`).

Todos os 162 contem:

```text
<!-- pca-analytics:start -->
/css/analytics.min.5198db7f.css
gtag('consent', 'default', ... todos negados ...)
/js/analytics.min.53aca874.js defer
<!-- pca-analytics:end -->
```

O bloco de consentimento aparece antes da tag Google nas 55 paginas reordenadas. Nao houve
alteracao de SEO, canonical, links, metadados, AdSense ou conteudo de calculadora/artigo fora do
bloco de analytics. A politica de privacidade manteve o texto editorial novo.

### 2.2 Pagina de privacidade

`dist/paginas/privacidade.html` foi gerado com:

- bloco de consentimento;
- texto de Analytics/Publicidade/Consent Mode v2;
- declaracao de que valores e resultados de calculadora nao sao coletados;
- HMAC de rate limit sem IP completo;
- retencao, retirada e canal de exclusao;
- DNT/GPC e independencia analytics/publicidade.

Conteudo coerente com o handler e os testes. SHA-256 do HTML de privacidade gerado:

```text
e3692ff73315b9d467f92605af02b82b91ef6496eb099b23f5998fefc800d43e
```

### 2.3 Fontes x gerados

Fontes preservadas:

```text
js/analytics.js
css/analytics.css
netlify/functions/**
netlify/edge-functions/**
scripts/apply-analytics.js
db/migrations/001 a 007
tests/analytics/**
tests/e2e/consent.spec.js
package.json
package-lock.json
```

Gerados/regenerados pelo build:

```text
162 HTML com bloco de analytics
css/analytics.min.*.css
js/analytics.min.*.js
asset-manifest.json
sitemap.xml
_redirects
pagefind/**
dist/**
```

Os 24 arquivos Pagefind antigos foram substituidos pelo novo indice; nao houve exclusao manual de
relatorios ou artefatos historicos. O B1 minimo permanece separado em `validation-b1/`.

---

## 3. Backend, Functions e dependencias

Fonte integrada no site completo:

```text
netlify/functions/collect.mjs                    -> config.path /api/collect
netlify/functions/capture-html.mjs               -> /api/capture-html
netlify/functions/cleanup-html-capture.mjs       -> schedule
netlify/functions/_lib/attribution.mjs
netlify/functions/_lib/collect-handler.mjs
netlify/functions/_lib/config.mjs
netlify/functions/_lib/db.mjs
netlify/functions/_lib/http.mjs
netlify/functions/_lib/rate-limit.mjs
netlify/functions/_lib/user-agent.mjs
netlify/functions/_lib/validation.mjs
netlify/functions/_lib/capture-*.mjs
netlify/functions/_lib/cleanup-*.mjs
netlify/edge-functions/**
```

Build local de Functions via ZISI/Netlify CLI:

```text
portal-complete-functions-build/
  capture-html.zip          987.353 bytes
  cleanup-html-capture.zip  422.004 bytes
  collect.zip             1.039.732 bytes
  manifest.json
```

Manifesto ZISI:

- `collect` registra `/api/collect`;
- `capture-html` registra `/api/capture-html`;
- `cleanup-html-capture` mantem schedule;
- bundles contem `pg`, `zod`, `ua-parser-js` e transitivas.

O `collect.zip` foi extraido em diretorio vazio e inicializado:

```json
{"path":"/api/collect","handler":"function","pg":true}
```

Nao foi feito deploy. O artefato B1 minimo nao foi usado.

---

## 4. Build completo

Comando executado:

```powershell
npm run build:deploy
```

Resultado:

| Item | Resultado |
|---|---|
| HTML processados | 162 |
| Artigos | 102 |
| Calculadoras | 51 |
| Paginas institucionais | 4 |
| Sitemap | 159 URLs |
| Redirects `.html` | 160 |
| Pagefind | 159 paginas, 11.425 palavras |
| `dist` | 671 arquivos, 19.633.188 bytes (18.7 MB) |
| `_headers` | presente |
| `_redirects` | presente |
| `asset-manifest` | presente |
| `/api/collect` | rota de Function registrada no bundle |

O `dist` contem o site completo, nao o B1 minimo.

---

## 5. Testes

| Suite | Resultado |
|---|---|
| `test:analytics` | 137/137 |
| Playwright canonico | 62/62 |
| B1 Windows | 57 pass + 1 skip (symlink), 0 fail |
| B1 Linux Node 22 | 58/58 |
| B1 browser consent | 2/2 |
| `test:isolation` | 54 arquivos preservados |
| Build B1 | 6 estaticos + manifest |
| Build completo | 162 HTML, 671 arquivos |

Cobertura verificada:

- consentimento antes da coleta e recusa;
- Consent Mode v2 antes do GA;
- independencia analytics/ads;
- retirada interrompe coleta e remove IDs;
- DNT/GPC;
- ausencia de valores/resultados de calculadora;
- validacao de payload, origem, tamanho e metodo;
- deduplicacao;
- rate limit;
- HMAC sem IP completo;
- privilegios de runtime/cleanup;
- isolamento B1;
- CSP sem violacoes;
- paginas completas/navegacao e ausencia de erros JS.

O teste de integracao PostgreSQL usou banco local `validation_b1_test`, sem Neon remoto.

---

## 6. Banco local

Executado localmente em PostgreSQL 17:

```text
db:roles:test
db:migrate:test
```

Resultado:

- migrations 001-007 aplicadas;
- 14 tabelas;
- `sessions.user_agent` ausente;
- roles de teste isoladas;
- privilegios minimos e cleanup validados pela suite.

Nenhuma operacao foi executada no Neon, branch principal ou banco de producao.

---

## 7. Limitacoes e pendencias

1. O site completo ainda nao foi publicado; producao permanece intocada.
2. O alvo real do banco de producao continua pendente: `main/neondb` (6 migrations) versus
   `portal_analytics` inexistente no projeto.
3. O build local prova as Functions e o empacotamento ZISI, mas nao prova a resposta final do
   Netlify sem deploy.
4. Os gerados (`dist`, Pagefind, minificados, sitemap, `_redirects`) nao foram commitados.
5. O working tree continua sem commit; snapshot inicial preservado.
6. A ativacao de ingestao/captura/cleanup em producao depende de autorizacao separada.

A proxima etapa de producao deve confirmar banco/alvo, configurar Netlify com flags desligadas e
autorizar build/deploy de um artefato completo especifico.

---

## 8. Producao, Neon e Netlify

| Sistema | Alteracao |
|---|---|
| Producao Netlify | nenhuma |
| Neon remoto | nenhuma |
| Migrations/grants remotos | nenhum |
| Variaveis/secrets/flags | nenhuma |
| Deploy/upload | nenhum |
| Cleanup | nenhum |
| Branch main | nao alterada |
| Commit/push | nenhum |

O B1 continua aprovado e o artefato 5F.61 permanece como referencia historica read-only.

**Classificacao final: 1 - CONSOLIDACAO LOCAL APROVADA.**
