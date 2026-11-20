# Fase 5F.33 - Correcao de dependencias e integridade do contrato B1

Status: **correcoes locais e checkout Linux limpo aprovados; indice Git vazio e nenhum commit, push ou CI remoto executado**.
Data/hora: **2026-11-20T00:54:00Z** (referencia ao CI da fase anterior).
Branch: `feat/portal-analytics`.
Commit preservado: `027d7d31c29fb2a559a59abb3466909dfab54d29`.
HEAD local: **inalterado em `027d7d31c29fb2a559a59abb3466909dfab54d29`**.

**Classificacao: 1 - Aprovado (escopo local).** A dependencia ausente foi identificada, o conjunto
complementar foi validado em checkout Linux limpo, o contrato B1 foi tornado deterministico e a
regressao integral passou. Nada foi versionado ou publicado.

---

## 1. Estado inicial do Git

| Verificacao | Resultado |
|---|---|
| Branch | `feat/portal-analytics` |
| HEAD | `027d7d31c29fb2a559a59abb3466909dfab54d29` |
| Commit preservado | sim; nao foi alterado |
| Indice Git inicial | vazio |
| Arquivos staged iniciais | 0 |
| Upstream | `origin/feat/portal-analytics` |
| Remote | `https://github.com/Brunogfv/calculeCerto.git` |
| Working tree | alteracoes preexistentes e relatorios nao versionados |

Nao houve reset, clean, checkout destrutivo, amend, rebase ou force push.

---

## 2. Commit e branch de referencia

- Commit publicado: `027d7d31c29fb2a559a59abb3466909dfab54d29`.
- Branch: `feat/portal-analytics`.
- O CI da Fase 5F.32 foi executado sobre esse commit e terminou com failure.
- Nenhum commit novo foi criado nesta fase.

---

## 3. Analise dos logs do CI 44649473339

Log local preservado em:

`C:\Users\Joanita\AppData\Local\Temp\opencode\ci-5f32.log`

### Job de validacao estatica

- `npm ci`, Node.js 22, Playwright e build passaram.
- `npm test` falhou ao carregar `tests/analytics/capture.integration.spec.mjs`:

```text
Cannot find module .../scripts/cleanup-html-capture.mjs
```

### Job de analytics

- PostgreSQL, roles, migrations, `npm ci` e Node.js 22 passaram.
- A suite falhou pelo mesmo modulo ausente.
- O erro ocorreu na importacao, antes de executar os testes de integracao.

### Job B1

- Node.js 22, `npm ci` B1, Netlify CLI, Playwright and `sync:shared` passaram.
- O build falhou antes dos testes e do gate:

```text
Error: Function de origem divergente do contrato: _lib/cleanup-retention.mjs
```

### Job de producao

- Nao executado porque os jobs anteriores falharam.

---

## 4. Causa comprovada da dependencia ausente

`tests/analytics/capture.integration.spec.mjs` importa:

```text
../../scripts/cleanup-html-capture.mjs
```

Esse script e uma ferramenta de teste/manutencao, nao um artefato gerado. Ele reexporta e executa
`limparHtmlCapture` da biblioteca `netlify/functions/_lib/cleanup-html-capture.mjs`.

O script existia no workspace local, mas nunca foi versionado nos 69 caminhos. O checkout do GitHub
nao o possuia. O mesmo ocorreu com outros testes e fontes auxiliares de analytics.

O job raiz tambem e afetado porque `playwright.config.js` usa `testDir: './tests'`, descobrindo os
arquivos de `tests/analytics` e `tests/e2e`.

---

## 5. Grafo minimo de dependencias

```text
tests/analytics/capture.integration.spec.mjs
  -> scripts/cleanup-html-capture.mjs
    -> netlify/functions/_lib/cleanup-html-capture.mjs
    -> pg

tests/analytics/cleanup-manual.spec.mjs
  -> scripts/cleanup-retention.mjs
    -> netlify/functions/_lib/cleanup-retention.mjs
    -> pg

tests/analytics/capture-policy.spec.mjs
  -> js/analytics.js
  -> netlify/edge-functions/_lib/capture-policy.mjs

testes de integracao
  -> db/migrations/001..006

job raiz / Playwright
  -> tests/e2e/consent.spec.js
  -> tests/unit/site.spec.js
  -> css/analytics.css
  -> js/analytics.js
```

Os demais imports de `tests/analytics` ja apontavam para fontes canonicas versionadas no commit
`027d7d3`.

---

## 6. Arquivos complementares necessarios

Foram identificados e usados localmente no checkout limpo:

1. `scripts/cleanup-html-capture.mjs` - importado por capture.integration.
2. `scripts/cleanup-retention.mjs` - executado por cleanup-manual.
3. `scripts/ssl-diagnostic.mjs` - importado pelo teste SSL.
4. `tests/analytics/capture-edge.spec.mjs` - suite de analytics.
5. `tests/analytics/capture-performance.spec.mjs` - suite de analytics.
6. `tests/analytics/capture-policy.spec.mjs` - suite de analytics.
7. `tests/analytics/classifier.spec.mjs` - suite de analytics.
8. `tests/analytics/cleanup-manual.spec.mjs` - suite de cleanup.
9. `tests/analytics/cleanup-retention.spec.mjs` - suite de cleanup.
10. `tests/analytics/imports.spec.mjs` - auditoria de imports.
11. `tests/analytics/rate-limit-config.spec.mjs` - suite de rate limit.
12. `tests/analytics/ssl-diagnostic.spec.mjs` - regressao SSL local.
13. `tests/e2e/consent.spec.js` - Playwright de consentimento.
14. `db/migrations/003_phase4_html_capture.sql`.
15. `db/migrations/004_phase4_audit_fixes.sql`.
16. `db/migrations/005_phase4_cleanup_role.sql`.
17. `db/migrations/006_phase2_runtime_grants.sql`.
18. `css/analytics.css` - asset usado pelo frontend/build.
19. `js/analytics.js` - consentimento/frontend e teste de politica.

Justificativas:

- os scripts sao dependencias diretas ou alvos de spawn dos testes;
- as migrations 003-006 completam o schema usado pela integracao;
- o CSS/JS sao necessarios ao build e aos testes de consentimento;
- os testes sao os arquivos explicitamente listados por `test:analytics` e descobertos pelo Playwright.

Tambem foi ajustado `tests/unit/site.spec.js` para excluir `validation-b1` e `netlify` do walker de
site. Sem isso, o teste de SEO tentava aplicar regras do site principal ao HTML B1 e as fontes
server-side. A alteracao e de escopo de teste, nao de producao.

---

## 7. Auditoria CRLF/LF dos arquivos controlados

Foram comparados:

- bytes do working tree Windows;
- blob Git do commit `027d7d3`;
- bytes do checkout Linux;
- hash do contrato.

Resultado:

| Grupo | Resultado |
|---|---|
| 7 estaticos | working, blob e contrato iguais; LF |
| 9 Functions | iguais, exceto cleanup-retention |
| 7 Edge Functions | iguais; LF |
| `build-manifest.json` | hash reproduzido |
| `config_sha256` | inalterado |
| `artifact-contract.json` | apenas hash de cleanup-retention alterado |
| `shared-manifest.json` | regenerado apos normalizacao |

### Divergencia B1 comprovada

`validation-b1/netlify/functions/_lib/cleanup-retention.mjs`:

- working Windows original: 19821 bytes, CRLF, SHA-256 `228c2e45...`;
- blob Git do commit: 19574 bytes, LF, SHA-256 `14c57306...`;
- contrato original: `228c2e45...`;
- contrato corrigido: `14c57306...`;
- bytes finais de trabalho: 19574, LF, `14c57306...`.

A divergencia era de representacao de linhas, nao de conteudo funcional. Nenhum outro arquivo
controlado apresentou diferenca de bytes ou hash entre working, blob e contrato.

---

## 8. Politica deterministica adotada

A politica e:

- arquivos textuais relevantes usam **LF** no checkout e no artefato;
- binarios e artefatos com bytes especificos nao sao normalizados;
- o contrato continua calculando SHA-256 dos bytes exatos do artefato final;
- nao existe normalizacao de hash que ignore CRLF/LF;
- `build-manifest.json` e `config_sha256` continuam sendo validados pelo pacote.

Politica aplicada em `.gitattributes`:

```text
validation-b1/** text eol=lf
netlify/**/*.mjs text eol=lf
netlify/**/*.js text eol=lf
scripts/*.mjs text eol=lf
scripts/*.js text eol=lf
tests/analytics/*.mjs text eol=lf
tests/unit/*.js text eol=lf
tests/e2e/*.js text eol=lf
db/migrations/*.sql text eol=lf
css/*.css text eol=lf
js/*.js text eol=lf
.github/workflows/*.yml text eol=lf
package.json text eol=lf
```

Nao foi aplicada regra global a binarios.

---

## 9. Contrato e hashes

Alteracao legitima:

| Item | Antes | Depois |
|---|---|---|
| `_lib/cleanup-retention.mjs` | `228c2e45b29d0c60e78957bcd31c0460f7a07ed5e5783715ce9b1dcd597da819` | `14c57306c6ad3995b60793850e1489a710d978c674951848ca2e3f79825fdaba` |

- Versao do contrato: 1.
- `static`, demais `functions` e `edge_functions`: inalterados.
- `config_sha256`: `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586`.
- `redirects`: 0.
- `collect`: ausente.
- Allowlists e validacoes de caminho, duplicatas, symlink, arquivo extra/ausente preservadas.
- O manifesto continua sendo comparado ao contrato; nao se autoautoriza.

Hashes finais relevantes:

- contrato: `bfc35d87c2cece8ba5717e572c8f8cfd77f75be9218b9a36016e19aea55f8b38`;
- shared manifest: `894a5b2dc1e031aaf29efb9bf4ab6dc83857e453717565f206ac0665faa377d0`;
- `.gitattributes`: `5f20fb154c29b0034822b9f7a511af85d232936cefb3b98dc9a7a9ef5075acb8`.

---

## 10. Checkout Linux limpo

O checkout foi criado a partir do commit `027d7d3` em diretorio temporario isolado, usando
`git archive` (sem depender do working tree Windows). Foram sobrepostas apenas as correcoes locais
documentadas:

- 69 caminhos ja conhecidos;
- 19 arquivos complementares da secao 6;
- `.gitattributes`;
- ajuste de escopo em `tests/unit/site.spec.js`.

Nenhum `node_modules`, `dist` ou `.netlify` foi copiado. O Node.js foi `v22.23.5`; PostgreSQL 16
descartavel; `npm ci` em raiz e B1.

Resultados no checkout limpo:

| Verificacao | Resultado |
|---|---|
| Analytics | **135/135 pass** |
| `npm test` raiz/Playwright | **59/59 pass** |
| B1 shared/b1/artifact/gate | **39/39 pass** |
| Consentimento | **2/2 pass** |
| SSL local | **5/5 pass** |
| Isolamento B1 | **41/41 preservados** |
| Build canonico | passou; 162 HTML |
| Build B1 | passou; 6 arquivos + manifesto |
| Contrato e manifesto | passaram |
| `deploy:b1 -- --check` | passou; `validated_only` |

Inventario do artefato B1:

```json
{
  "status": "validated_only",
  "static_files": 7,
  "functions": 9,
  "edge_functions": 7,
  "redirects": 0
}
```

Nenhum teste foi cancelado ou marcado como aprovado por skip. O teste de symlink passou no Linux.

---

## 11. Diferenca entre commit original e estado corrigido

| Item | Commit 027d7d3 | Estado local corrigido |
|---|---|---|
| Dependencias de analytics | incompletas | complementadas e validadas em checkout limpo |
| Contrato B1 | hash CRLF de working | hash LF do blob/artefato |
| `.gitattributes` | ausente | politica LF definida |
| Teste de site | walker incluia B1/netlify | exclui escopo B1/server |
| Node.js 22 analytics | falhava por modulo | 135/135 |
| B1 build | falhava no contrato | passa |
| Git | commit publicado | HEAD preservado; nada staged |

Nenhuma migracao historica, role, grant, flag, variavel ou configuracao remota foi alterada.

---

## 12. Arquivos modificados nesta fase

- `.gitattributes` - novo, politica de linhas.
- 41 arquivos sob `validation-b1/**` - normalizados para LF; contrato e shared manifest ajustados.
- 16 fontes canonicas em `netlify/**` - normalizadas e sincronizadas.
- `tests/unit/site.spec.js` - exclusao de `validation-b1` e `netlify` no walker de SEO.
- 19 arquivos complementares de scripts, testes, migrations, CSS e JS listados na secao 6.
- `validation-b1/artifact-contract.json` - hash de cleanup-retention atualizado.
- `validation-b1/shared-manifest.json` - regenerado com bytes finais.

Nao houve alteracao de logica de producao, migrations, deploy ou gate.

---

## 13. Indice Git e operacoes remotas

- Indice Git: **vazio**.
- Nenhum `git add`.
- Nenhum commit novo.
- Nenhum push.
- Nenhum CI remoto.
- Nenhum deploy.
- Nenhum `--confirm`.
- Nenhum acesso a Netlify ou Neon.
- Nenhum SQL remoto, role/grant, flag ou variavel remota.
- Nenhum Run now ou cleanup remoto.
- Nenhum credito Netlify consumido.
- Commit `027d7d31c29fb2a559a59abb3466909dfab54d29` preservado.

---

## 14. Riscos residuais

- As correcoes ainda nao estao versionadas; o CI remoto continua vermelho ate novo commit autorizado.
- Os 19 arquivos complementares estao fora dos 69 originais e precisam ser explicitamente
  autorizados no proximo versionamento.
- O `.gitattributes` so passa a valer no checkout futuro depois de versionado.
- O risco TOCTOU do gate B1 permanece **NAO ACEITO**.
- O checkout limpo foi validado localmente, nao no GitHub Actions.

---

## 15. Classificacao final

**1 - Aprovado (escopo local).**

A dependencia ausente foi identificada e corrigida localmente; o contrato B1 passou a usar bytes LF
deterministicos; o checkout Linux limpo reproduziu os hashes e passou analytics, Playwright, B1,
consentimento, SSL, isolamento, contrato, gate e build. O indice Git permaneceu vazio e nenhuma
operacao remota foi executada.
