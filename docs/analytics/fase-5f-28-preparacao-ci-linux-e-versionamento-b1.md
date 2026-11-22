# Fase 5F.28 — Preparação controlada para CI Linux B1

Status: **preparação local concluída; nenhum arquivo foi adicionado ao Git e nenhuma operação remota foi executada**.
Data/hora: **2026-11-19T14:54:01-03:00**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O job B1 foi executado localmente em Node.js 22
com 39/39 testes, 2/2 de consentimento, gate e isolamento aprovados. O workflow completo ainda não
está liberado: o job de analytics falha em banco limpo e o risco TOCTOU continua não aceito.

---

## 1. Leitura e ambiente

Foram lidos:

- `docs/analytics/fase-5f-27-validacao-local-netlify-cli-b1.md`;
- `docs/analytics/fase-5f-26-correcao-isolamento-build-e-lockfile-b1.md`;
- `docs/analytics/fase-5f-25-auditoria-final-independente-gate-b1.md`;
- `.github/workflows/ci.yml`, os dois lockfiles, scripts, testes e `.gitignore`.

Ambiente local:

| Item | Resultado |
|---|---|
| Node.js local | `v24.13.0` |
| npm local | `11.6.2` |
| nvm | ausente |
| Docker | `29.6.2` |
| Imagem para Node.js 22 | `node:22-bookworm` oficial |
| Node.js no container | `v22.23.5` |
| npm no container | `10.9.9` |
| PostgreSQL do teste | container `postgres:16-alpine` |

O workflow permanece em Node.js 22; ele não foi alterado para coincidir com o Node.js 24 local.

---

## 2. Compatibilidade Node.js 22 — B1

Execução no container oficial, com `node_modules` em volumes Docker separados para não contaminar
o `node_modules` Windows:

```text
docker run ... node:22-bookworm
npm ci --no-audit --no-fund
```

Resultado:

- **950 pacotes** instalados a partir de `validation-b1/package-lock.json`;
- `netlify-cli/27.20.0 linux-x64 node-v22.23.5`;
- `npm ls netlify-cli --depth=0` retornou `netlify-cli@27.20.0`;
- lockfile permaneceu com **505.941 bytes** e SHA-256
  `5640303029B537769810ADD41C38106E0B924C493A6105C6339F4C0F911AA0AE`.

Testes executados no Node.js 22:

| Verificação | Resultado |
|---|---|
| `npm run sync:shared` | passou; manifesto de 16 arquivos |
| `npm run build` | passou; 6 arquivos publicados + manifesto |
| B1 shared/b1/artifact/gate | **39/39 pass**, **0 skip** |
| Consentimento no navegador | **2/2 pass** |
| `npm run deploy:b1 -- --check` | passou; `validated_only` |
| Symlink no teste Linux | passou |
| Isolamento B1 | **41 arquivos preservados** |
| SSL local | **5/5 pass** |

O resultado do gate foi:

```json
{
  "status": "validated_only",
  "static_files": 7,
  "functions": 9,
  "edge_functions": 7,
  "redirects": 0
}
```

O skip de symlink existente no Windows não ocorreu no container Linux. Nenhum deploy, login,
consulta de conta ou `--confirm` foi executado.

---

## 3. Resultado no Node.js 22 — Analytics

O job de analytics também foi executado no Node.js 22 com PostgreSQL 16. Ele **não passou em banco
limpo**.

Na execução com o banco do workflow (`portal_analytics_test`):

- 135 testes;
- 105 aprovados;
- 13 falharam;
- 17 foram cancelados;
- 2 suítes.

Causas comprovadas:

1. `tests/analytics/capture.integration.spec.mjs` fixa `expectedDatabase: 'validation_b1_test'`,
   mas o workflow usa `portal_analytics_test`.
2. O workflow roda `npm run db:migrate:test` antes de os testes criarem as roles. As migrations 005
   e 006 concedem privilégios somente quando as roles já existem; em banco limpo, as roles são
   criadas depois e a migration não é reaplicada porque já está em `schema_migrations`.
3. O teste de timeout de envio falha no Node.js 22 com
   `Promise resolution is still pending but the event loop has already resolved`. O teste isolado
   `capture-hardening.spec.mjs` reproduziu 5 aprovados e 17 cancelados, sem banco.

Consequência: o job `analytics-backend` do workflow ainda **não está pronto** para uma execução
limpa no GitHub. Isso é separado do job B1, mas bloqueia o workflow completo.

### Testes não executados ou incompletos

- `npm test` do raiz e a suíte Playwright do site não foram executados nesta fase;
- a suíte completa de analytics foi executada, mas terminou com falhas;
- o job de produção e o CI remoto não foram executados;
- deploy, `--confirm`, Run now, cleanup e validação remota não foram executados por restrição;
- o único teste ignorado no Windows foi o symlink; no Linux/Node.js 22 ele passou, sem skip.

---

## 4. Inventário B1

`validation-b1` tem **41 arquivos** fora de `node_modules`, `dist` e `.netlify`:

### Configuração e documentação

- `validation-b1/.gitignore`
- `validation-b1/README.md`
- `validation-b1/artifact-contract.json`
- `validation-b1/netlify.toml`
- `validation-b1/package.json`
- `validation-b1/package-lock.json`
- `validation-b1/shared-manifest.json` (gerado, mas necessário antes do sync no teste de isolamento)

### Netlify Functions — 9 arquivos

- `validation-b1/netlify/functions/capture-html.mjs`
- `validation-b1/netlify/functions/cleanup-html-capture.mjs`
- `validation-b1/netlify/functions/_lib/capture-config.mjs`
- `validation-b1/netlify/functions/_lib/capture-handler.mjs`
- `validation-b1/netlify/functions/_lib/capture-validation.mjs`
- `validation-b1/netlify/functions/_lib/cleanup-html-capture.mjs`
- `validation-b1/netlify/functions/_lib/cleanup-retention.mjs`
- `validation-b1/netlify/functions/_lib/db.mjs`
- `validation-b1/netlify/functions/_lib/http.mjs`

### Netlify Edge Functions — 7 arquivos

- `validation-b1/netlify/edge-functions/html-capture.js`
- `validation-b1/netlify/edge-functions/_lib/capture-limits.mjs`
- `validation-b1/netlify/edge-functions/_lib/capture-policy.mjs`
- `validation-b1/netlify/edge-functions/_lib/capture-signature.mjs`
- `validation-b1/netlify/edge-functions/_lib/classifier.mjs`
- `validation-b1/netlify/edge-functions/_lib/edge-capture.mjs`
- `validation-b1/netlify/edge-functions/_lib/edge-env.mjs`

### Arquivos públicos — 6 arquivos

- `validation-b1/public/_headers`
- `validation-b1/public/b1-consent.js`
- `validation-b1/public/b1.css`
- `validation-b1/public/index.html`
- `validation-b1/public/robots.txt`
- `validation-b1/public/validacao-encerrada.html`

### Scripts — 7 arquivos

- `validation-b1/scripts/artifact.mjs`
- `validation-b1/scripts/build.mjs`
- `validation-b1/scripts/deploy-b1.mjs`
- `validation-b1/scripts/package-deploy.mjs`
- `validation-b1/scripts/shared-files.mjs`
- `validation-b1/scripts/sync-shared.mjs`
- `validation-b1/scripts/verify-shared.mjs`

### Testes — 5 arquivos

- `validation-b1/tests/artifact.spec.mjs`
- `validation-b1/tests/b1.spec.mjs`
- `validation-b1/tests/browser-consent.spec.mjs`
- `validation-b1/tests/gate.spec.mjs`
- `validation-b1/tests/shared-manifest.spec.mjs`

---

## 5. Conjunto candidato exato ao versionamento

Este conjunto cobre o job `b1-artifact-linux` e a etapa de isolamento do job raiz. Ele não inclui
os demais arquivos de analytics necessários ao job `analytics-backend`, que permanece bloqueado.

### 5.1 B1 — 41 arquivos

Os 41 arquivos listados na seção 4, sem exceção:

```text
validation-b1/.gitignore
validation-b1/README.md
validation-b1/artifact-contract.json
validation-b1/netlify.toml
validation-b1/package.json
validation-b1/package-lock.json
validation-b1/shared-manifest.json
validation-b1/netlify/functions/capture-html.mjs
validation-b1/netlify/functions/cleanup-html-capture.mjs
validation-b1/netlify/functions/_lib/capture-config.mjs
validation-b1/netlify/functions/_lib/capture-handler.mjs
validation-b1/netlify/functions/_lib/capture-validation.mjs
validation-b1/netlify/functions/_lib/cleanup-html-capture.mjs
validation-b1/netlify/functions/_lib/cleanup-retention.mjs
validation-b1/netlify/functions/_lib/db.mjs
validation-b1/netlify/functions/_lib/http.mjs
validation-b1/netlify/edge-functions/html-capture.js
validation-b1/netlify/edge-functions/_lib/capture-limits.mjs
validation-b1/netlify/edge-functions/_lib/capture-policy.mjs
validation-b1/netlify/edge-functions/_lib/capture-signature.mjs
validation-b1/netlify/edge-functions/_lib/classifier.mjs
validation-b1/netlify/edge-functions/_lib/edge-capture.mjs
validation-b1/netlify/edge-functions/_lib/edge-env.mjs
validation-b1/public/_headers
validation-b1/public/b1-consent.js
validation-b1/public/b1.css
validation-b1/public/index.html
validation-b1/public/robots.txt
validation-b1/public/validacao-encerrada.html
validation-b1/scripts/artifact.mjs
validation-b1/scripts/build.mjs
validation-b1/scripts/deploy-b1.mjs
validation-b1/scripts/package-deploy.mjs
validation-b1/scripts/shared-files.mjs
validation-b1/scripts/sync-shared.mjs
validation-b1/scripts/verify-shared.mjs
validation-b1/tests/artifact.spec.mjs
validation-b1/tests/b1.spec.mjs
validation-b1/tests/browser-consent.spec.mjs
validation-b1/tests/gate.spec.mjs
validation-b1/tests/shared-manifest.spec.mjs
```

### 5.2 Fontes canônicas compartilhadas — 16 arquivos

O `sync:shared` lê o diretório pai; sem estes arquivos o job B1 falha:

```text
netlify/functions/capture-html.mjs
netlify/functions/cleanup-html-capture.mjs
netlify/functions/_lib/capture-config.mjs
netlify/functions/_lib/capture-handler.mjs
netlify/functions/_lib/capture-validation.mjs
netlify/functions/_lib/cleanup-html-capture.mjs
netlify/functions/_lib/cleanup-retention.mjs
netlify/functions/_lib/db.mjs
netlify/functions/_lib/http.mjs
netlify/edge-functions/html-capture.js
netlify/edge-functions/_lib/capture-limits.mjs
netlify/edge-functions/_lib/capture-policy.mjs
netlify/edge-functions/_lib/capture-signature.mjs
netlify/edge-functions/_lib/classifier.mjs
netlify/edge-functions/_lib/edge-capture.mjs
netlify/edge-functions/_lib/edge-env.mjs
```

### 5.3 Suporte raiz — 7 arquivos

```text
.github/workflows/ci.yml
package.json
scripts/apply-analytics.js
scripts/apply-accessibility.js
scripts/build-assets.js
scripts/generate-html-redirects.js
scripts/check-b1-isolation.mjs
```

`package.json` adiciona `test:isolation`; os quatro walkers excluem `validation-b1`; o script de
isolamento é executado pelo job raiz. O lockfile raiz já é versionado e não precisa entrar neste
conjunto.

**Total do conjunto funcional: 64 arquivos.**

Documentação não é necessária para o job B1. Os relatórios 5F.26, 5F.27 e este 5F.28 devem ser
revisados/versionados separadamente como registro de auditoria, se autorizado.

---

## 6. Arquivos excluídos e justificativas

### Gerados — não versionar

- `validation-b1/dist/**` — saída de `npm run build`, recriada no CI;
- `validation-b1/.netlify/**` — zips, edge bundles e import map temporários;
- `validation-b1/node_modules/**` — dependências instaladas por `npm ci`;
- cache de Chromium do Playwright — externo ao repositório;
- artefatos de build/teste do raiz (`asset-manifest.json`, `pagefind/**`, `sitemap.xml`, HTML
  gerado) — preexistentes e fora do escopo B1.

### Temporários

- `/tmp/b1-tests.tap` no CI;
- volumes Docker `b1-5f28-node22` e `b1-5f28-root-node22`;
- diretórios `mkdtemp` criados pelo gate;
- container PostgreSQL e rede Docker usados somente nesta verificação.

### Sensíveis ou com potencial de dados

- `node_modules` (não versionar);
- `.netlify` (artefatos de empacotamento);
- nenhum `.env`, log, dump, `.pem`, `.key` ou credencial foi encontrado nos candidatos;
- as senhas `runtime-test-password` e `cleanup-test-password` em testes são fixtures sintéticas,
  não credenciais reais;
- o segredo HMAC do workflow é sintético e usado somente no PostgreSQL temporário do CI.

### Preexistentes de outras tarefas

- `docs/analytics/**` (exceto o novo relatório 5F.28);
- código/testes/assets de analytics do raiz não usados pelo job B1;
- modificações massivas de HTML, pagefind, sitemap, CSS/JS e dependências já presentes antes
  desta fase;
- `.agents/`, `skills-lock.json`, `opencode.jsonc` e demais arquivos de ferramentas.

---

## 7. Por que B1 ainda não está versionado

- `git ls-files validation-b1` retorna **0 arquivos**.
- `validation-b1` não está no `.gitignore` raiz.
- O `.gitignore` interno ignora apenas `node_modules/`, `dist/` e `.netlify/`.
- As 41 entradas aparecem como `??` porque foram criadas nas fases anteriores e nunca receberam
  `git add`/commit.
- As fases anteriores foram deliberadamente locais e não executaram operações Git.
- O conjunto atual não deve ser adicionado em bloco sem revisão; a lista das seções 5.1–5.3 é o
  recorte proposto.

---

## 8. Auditoria de segurança

Verificações realizadas nos candidatos:

- nenhum `.env`, `.env.*`, `.pem`, `.key`, `.p12`, log ou dump em `validation-b1`;
- nenhuma URL `postgresql://` real; as ocorrências são listas de bloqueio, testes e validação;
- nenhuma chave privada, token de API, `sk_live_`, `nfp_`, token GitHub/AWS ou credencial Netlify;
- `netlify.toml` contém apenas build, publish, Edge Functions, Functions e `NODE_VERSION`;
- `artifact-contract.json` contém hashes, não segredos;
- `shared-manifest.json` contém hashes de arquivos compartilhados;
- fixtures de teste usam domínio `.invalid`, UUIDs e senhas sintéticas;
- `dist/`, `.netlify/` e `node_modules/` ficaram fora do conjunto.

Nenhum valor secreto foi impresso neste relatório.

---

## 9. Situação do CI

O workflow tem quatro jobs:

- `validacao-estatica`: Node.js 22, `npm ci`, testes raiz, build, isolamento, testes locais;
- `teste-producao`: leitura do site de produção em push/dispatch, sem publicação;
- `analytics-backend`: PostgreSQL 16, `npm ci`, migrations e testes;
- `b1-artifact-linux`: Node.js 22, `npm ci` B1, Playwright, build, testes TAP, consentimento e
  `deploy:b1 -- --check`.

Situação:

- o job B1 está funcional localmente em Node.js 22, sem skip;
- o job de analytics falha em banco limpo, conforme a seção 3;
- o job de produção não foi executado e faz acesso somente de leitura;
- nenhum job publica ou usa `--confirm`;
- o YAML foi analisado localmente e não foi executado no GitHub;
- o workflow não pode ser considerado pronto para o CI completo até corrigir o job de analytics.

Os 64 arquivos candidatos são suficientes para o job B1 e para a etapa de isolamento. Eles não
foram testados em um checkout Git staged porque `git add` não foi autorizado; a execução Node.js 22
ocorreu no workspace que contém todos eles.

---

## 10. TOCTOU

Classificação mantida: **risco residual não aceito**.

### Risco

Entre a validação final do pacote congelado e a leitura pelo Netlify CLI, outro processo do mesmo
usuário pode alterar/substituir arquivos ou diretórios.

### Consequência

Publicação de conteúdo diferente do contrato validado no preview B1, incluindo HTML, Functions ou
Edge Functions não revisados.

### Mitigações existentes

- pacote em `mkdtemp` exclusivo;
- contrato independente com SHA-256;
- validação antes e depois do congelamento;
- `chmod` recursivo;
- deploy do mesmo diretório validado;
- `--check` separado de `--confirm`;
- CLI local fixado;
- workflow sem publicação automática.

### Limitações

- `chmod` não é imutabilidade;
- o CLI relê os arquivos;
- não há lock de filesystem nem assinatura do pacote;
- `netlify deploy` externo continua possível;
- a aceitação do risco precisa ser explícita e não é inferida pelo relatório.

**Aceitação TOCTOU: pendente.**

---

## 11. Pendências

1. Autorizar e revisar o conjunto de 64 arquivos antes de qualquer `git add`.
2. Corrigir o job de analytics:
   - alinhar `portal_analytics_test` com o banco esperado pelos testes ou parametrizar o teste;
   - garantir criação das roles antes das migrations 005/006 ou reaplicar grants em banco limpo;
   - corrigir a compatibilidade do teste de timeout no Node.js 22.
3. Executar o workflow real no GitHub depois de commit/push autorizado.
4. Repetir a preparação em checkout limpo após o commit.
5. Decidir explicitamente sobre o risco TOCTOU.

---

## 12. Confirmação de ausência de operações remotas

- Nenhum acesso autenticado à Netlify ou ao Neon.
- Nenhum deploy, login, link ou `--confirm`.
- Nenhum Run now, cron, cleanup ou SQL remoto.
- Nenhuma variável, flag, role, grant ou migration remota alterada.
- Nenhum crédito Netlify consumido.
- Nenhum `git add`, commit, push, PR ou workflow remoto.
- Nenhuma alteração em produção.

A rede foi usada apenas para o registro npm, a imagem oficial `node:22-bookworm`, a imagem
PostgreSQL e o download do Chromium pelo Playwright.

---

## 13. Classificação final

**2 — Aprovado com pendências.**

O job B1 está comprovado em Node.js 22, com 39/39 testes, consentimento 2/2, gate sem publicação e
isolamento de 41 arquivos. O conjunto de 64 arquivos candidatos está identificado. O CI completo
permanece bloqueado pelos problemas do job de analytics e o risco TOCTOU segue não aceito. Nenhuma
operação Git ou remota foi realizada.
