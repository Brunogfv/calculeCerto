# Plano de consolidacao do Analytics

Status: **analise somente leitura concluida; nenhum arquivo, commit ou ambiente foi alterado**.
Data: **2026-11-22**.
Branch: `feat/portal-analytics`.
HEAD: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
Main: `572457e506b35ce7fa0e423280aedd82b11c43fb`.

**Recomendacao: 2 - PRONTO COM RESSALVAS.**

A consolidacao pode ser planejada e executada em commits independentes, mas duas questoes
continuam abertas: confirmar o banco de producao e decidir explicitamente o que sera versionado
como fonte e o que sera regenerado pelo build.

---

## 1. Snapshot preservado

| Item | Valor |
|---|---|
| Branch atual | `feat/portal-analytics` |
| HEAD local/remoto | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` |
| Main local/remota | `572457e506b35ce7fa0e423280aedd82b11c43fb` |
| Commits ahead | 5 |
| Commits behind | 0 |
| Staged | nenhum arquivo |
| Status entries | 339 no inventario; 340 apos o relatorio de encerramento |
| Real tracked diffs | 206 |
| `M` / `D` / `??` | 185 / 24 / 130 |
| Untracked reais | 174 (diretorios agregados no status) |
| Diffs sem conteudo | 3 |
| Artefato B1 aprovado | `b1-artifact-5f61`, SHA-256 `0bdf9d0b4843aa79760a5750b14ebcdc748022e84616ec4dd2e28d8e35ba8dbe` |

Nao foi executado `git add`, commit, reset, restore, clean, stash, checkout, rebase, cherry-pick,
deploy ou escrita remota.

---

## 2. Analise dos 162 HTML

### 2.1 Metodo

Os 162 HTML foram comparados com `HEAD` por diff e assinatura de alteracao. Todos contem o marcador
`pca-analytics:start`; nenhum foi tratado como substituicao integral automatica.

### 2.2 Assinaturas encontradas

| Assinatura | Arquivos | Alteracao |
|---|---:|---|
| `+15 / -0` | 106 | insercao do bloco de consentimento/analytics e assets |
| `+16 / -1` | 55 | bloco de analytics + reordenacao do script GA |
| `+59 / -18` | 1 | `paginas/privacidade.html`: bloco + politica de privacidade |
| Total | 162 | |

### 2.3 Conteudo comum

Nos 161 arquivos de site (exceto privacidade):

- inclusao de `/css/analytics.min.5198db7f.css` com `data-pca-analytics-css`;
- inline `gtag('consent','default', ...)` com analytics/ad storage negados;
- inclusao de `/js/analytics.min.53aca874.js` com `data-pca-analytics-js`, `defer`;
- manutencao do GA/GTM existente; nas 55 paginas o script GA foi deslocado para depois do bloco de
  consentimento;
- nenhuma remocao de AdSense, canonical, metadados, conteudo de calculadora ou artigo;
- nenhuma mudanca de layout/estrutura fora do head, exceto a reordenacao da tag GA;
- diferenca observada e integralmente regeneravel por `scripts/apply-analytics.js`.

### 2.4 Pagina de privacidade

`paginas/privacidade.html` e a unica pagina com alteracao de **conteudo editorial**:

- bloco de analytics;
- texto de consentimento, Consent Mode v2, DNT/GPC;
- descricao de que valores/resultados de calculadora nao sao coletados;
- HMAC de rate limit sem IP completo;
- retencao e canal de exclusao;
- data de atualizacao e referencias ao banner/preferencias.

Essa pagina deve ser integrada manualmente; nao deve ser tratada como HTML gerado comum.

### 2.5 Caminhos

Grupos completos:

```text
D:\Projetos\Site Calculadora\artigos\**\*.html          103 arquivos
D:\Projetos\Site Calculadora\calculadoras\*.html         51 arquivos
D:\Projetos\Site Calculadora\index.html
D:\Projetos\Site Calculadora\busca.html
D:\Projetos\Site Calculadora\meus-calculos.html
D:\Projetos\Site Calculadora\obrigado.html
D:\Projetos\Site Calculadora\paginas\contato.html
D:\Projetos\Site Calculadora\paginas\privacidade.html
D:\Projetos\Site Calculadora\paginas\sobre.html
D:\Projetos\Site Calculadora\paginas\termos.html
```

Conclusao: **161 HTML sao regeneraveis pelo build**; **1 HTML (privacidade) tem conteudo manual**.
Nao substituir os 162 integralmente sem preservar o texto de privacidade.

---

## 3. Analise dos 24 arquivos excluidos

Todos os 24 deletados estao em `pagefind/` e sao artefatos gerados do indice de busca:

```text
D:\Projetos\Site Calculadora\pagefind\fragment\pt-br_2349acf.pf_fragment
D:\Projetos\Site Calculadora\pagefind\index\pt-br_1dd73f9.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_356ee85.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_356f7cf.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_365c72d.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_3c38ed6.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_65d8f78.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_768b64e.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_811ee23.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_8414938.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_9f5a818.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_b832d65.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_ba34e2f.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_c1ee9d4.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_c286bda.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_d5c2ec9.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_da4cd12.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_da571cb.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_ddb86f5.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_e5ef538.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_e670bbd.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_efd3162.pf_index
D:\Projetos\Site Calculadora\pagefind\index\pt-br_ff59fe2.pf_index
D:\Projetos\Site Calculadora\pagefind\pagefind.pt-br_f65bc13147d92.pf_meta
```

Evidencia:

- `pagefind/pagefind-entry.json` no HEAD aponta para o hash antigo
  `pt-br_f65bc13147d92`;
- o working tree aponta para o novo hash `pt-br_d16cf3711dd60`;
- as paginas HTML nao referenciam um arquivo `.pf_index` nominal; o Pagefind carrega o hash de
  `pagefind-entry.json`;
- os novos fragmentos/indices/meta existem no working tree como untracked;
- sao artefatos de build, nao conteudo editorial.

Classificacao: **exclusao necessaria/regeneravel**, nao suspeita. Nao restaurar manualmente; gerar
novo indice no build.

---

## 4. Separacao fonte x gerado

### 4.1 Versionar como fonte

```text
D:\Projetos\Site Calculadora\js\analytics.js
D:\Projetos\Site Calculadora\css\analytics.css
D:\Projetos\Site Calculadora\scripts\apply-analytics.js
D:\Projetos\Site Calculadora\netlify\functions\collect.mjs
D:\Projetos\Site Calculadora\netlify\functions\_lib\attribution.mjs
D:\Projetos\Site Calculadora\netlify\functions\_lib\collect-handler.mjs
D:\Projetos\Site Calculadora\netlify\functions\_lib\config.mjs
D:\Projetos\Site Calculadora\netlify\functions\_lib\db.mjs
D:\Projetos\Site Calculadora\netlify\functions\_lib\http.mjs
D:\Projetos\Site Calculadora\netlify\functions\_lib\rate-limit.mjs
D:\Projetos\Site Calculadora\netlify\functions\_lib\user-agent.mjs
D:\Projetos\Site Calculadora\netlify\functions\_lib\validation.mjs
D:\Projetos\Site Calculadora\netlify\functions\capture-html.mjs
D:\Projetos\Site Calculadora\netlify\functions\cleanup-html-capture.mjs
D:\Projetos\Site Calculadora\netlify\edge-functions\**
D:\Projetos\Site Calculadora\db\migrations\001_init.sql
D:\Projetos\Site Calculadora\db\migrations\002_phase2_review.sql
D:\Projetos\Site Calculadora\db\migrations\003_phase4_html_capture.sql
D:\Projetos\Site Calculadora\db\migrations\004_phase4_audit_fixes.sql
D:\Projetos\Site Calculadora\db\migrations\005_phase4_cleanup_role.sql
D:\Projetos\Site Calculadora\db\migrations\006_phase2_runtime_grants.sql
D:\Projetos\Site Calculadora\db\migrations\007_remove_session_user_agent.sql
D:\Projetos\Site Calculadora\tests\analytics\**
D:\Projetos\Site Calculadora\tests\e2e\consent.spec.js
D:\Projetos\Site Calculadora\package.json
D:\Projetos\Site Calculadora\package-lock.json
D:\Projetos\Site Calculadora\.env.example
D:\Projetos\Site Calculadora\.github\workflows\ci.yml
```

Documentacao essencial:

```text
D:\Projetos\Site Calculadora\docs\analytics\fase-2.md
D:\Projetos\Site Calculadora\docs\analytics\fase-3.md
D:\Projetos\Site Calculadora\docs\analytics\fase-4-plano.md
D:\Projetos\Site Calculadora\docs\analytics\fase-4-homologacao.md
D:\Projetos\Site Calculadora\docs\analytics\fase-5f-53-correcao-local-permissoes-runtime-b1.md
D:\Projetos\Site Calculadora\docs\analytics\fase-5f-54-csp-local-e-runbook-remoto-b1.md
D:\Projetos\Site Calculadora\docs\analytics\fase-5f-56-aplicacao-remota-migration007-grants009-b1.md
D:\Projetos\Site Calculadora\docs\analytics\fase-5f-61-diagnostico-definitivo-runtime-functions.md
D:\Projetos\Site Calculadora\docs\analytics\fase-5f-62-deploy-final-homologacao-b1.md
D:\Projetos\Site Calculadora\docs\analytics\encerramento-5f-e-prontidao-producao.md
D:\Projetos\Site Calculadora\docs\analytics\recuperacao-inventario-codigo-analytics.md
D:\Projetos\Site Calculadora\docs\analytics\plano-consolidacao-analytics.md
```

### 4.2 Versionar manualmente

```text
D:\Projetos\Site Calculadora\paginas\privacidade.html
```

Contem a politica de privacidade nova, alem do bloco gerado de analytics. E o unico HTML com
conteudo editorial novo relevante.

### 4.3 Regenerar e nao versionar como fonte

```text
D:\Projetos\Site Calculadora\pagefind\**
D:\Projetos\Site Calculadora\css\analytics.min.5198db7f.css
D:\Projetos\Site Calculadora\js\analytics.min.53aca874.js
D:\Projetos\Site Calculadora\asset-manifest.json
D:\Projetos\Site Calculadora\sitemap.xml
D:\Projetos\Site Calculadora\_redirects
```

Os 161 HTML que so receberam o bloco de analytics tambem entram no build regenerado:

```text
artigos/**/*.html
calculadoras/*.html
index.html
busca.html
meus-calculos.html
obrigado.html
paginas/contato.html
paginas/sobre.html
paginas/termos.html
```

Se a equipe decidir versionar os HTML com o bloco para obter deploy estatico sem build, isso deve
ser uma decisao explicita; o build atual sabe reaplicar o bloco e remover duplicatas.

### 4.4 Nao versionar

```text
D:\Projetos\Site Calculadora\.agents\
D:\Projetos\Site Calculadora\.netlify\
D:\Projetos\Site Calculadora\opencode.jsonc
D:\Projetos\Site Calculadora\skills-lock.json
```

Sao ferramentas/caches locais; nao pertencem ao site de producao.

### 4.5 Preservar fora do caminho de producao

```text
D:\Projetos\Site Calculadora\validation-b1\
D:\Projetos\Site Calculadora\database\b1\
```

Sao historico/homologacao B1. Nao usar como artefato de producao. Podem ser versionados em commit
separado de documentacao/homologacao, nunca mesclados ao runtime de producao.

### 4.6 Documentacao historica

Os 85 arquivos em `docs/analytics/` devem ser preservados. Apenas os essenciais precisam entrar no
commit de documentacao; o restante pode ficar em commit historico ou arquivo de auditoria, sem
ser tratado como codigo.

---

## 5. Grupos de commits propostos

Os grupos abaixo sao uma proposta. Nenhum commit foi criado.

### Grupo 1 - Runtime first-party e cliente

Caminhos:

```text
js/analytics.js
css/analytics.css
netlify/functions/collect.mjs
netlify/functions/_lib/attribution.mjs
netlify/functions/_lib/collect-handler.mjs
netlify/functions/_lib/config.mjs
netlify/functions/_lib/db.mjs
netlify/functions/_lib/http.mjs
netlify/functions/_lib/rate-limit.mjs
netlify/functions/_lib/user-agent.mjs
netlify/functions/_lib/validation.mjs
scripts/apply-analytics.js
```

Dependencias: nenhuma alem de Node/`pg`/`zod`/`ua-parser-js` no runtime.

Testes: `test:analytics`, `imports.spec`, consent unit, CSP.

Risco: o cliente e o endpoint precisam compartilhar contrato de evento/origem; nao commitar o
cliente sem o endpoint ou vice-versa em uma versao publicavel.

### Grupo 2 - Consentimento, privacidade e build das paginas

Caminhos:

```text
paginas/privacidade.html
scripts/apply-analytics.js
scripts/build-assets.js
scripts/apply-accessibility.js
```

Dependencias: Grupo 1 (`js/analytics.js` e CSS) e assets gerados.

Testes: Playwright consent/CSP, `paginas/privacidade.html`, build canonico; verificar que os 161
HTML regenerados nao duplicam o bloco.

Risco: nao commitar HTML gerado sem regenerar assets; a pagina de privacidade mistura politica
manual e bloco gerado.

### Grupo 3 - Backend de captura/Edge (somente se a arquitetura for aprovada)

Caminhos:

```text
netlify/functions/capture-html.mjs
netlify/functions/cleanup-html-capture.mjs
netlify/functions/_lib/capture-config.mjs
netlify/functions/_lib/capture-handler.mjs
netlify/functions/_lib/capture-validation.mjs
netlify/functions/_lib/cleanup-html-capture.mjs
netlify/functions/_lib/cleanup-retention.mjs
netlify/edge-functions/**
```

Dependencias: client/endpoint do Grupo 1, HMAC, banco e flags ainda desligadas.

Testes: capture integration, cleanup, Edge, CSP, imports.

Risco: esse grupo amplia superficie e custo; producao deve decidir se a captura/Edge entra nesta
janela. Nao ativar flags sem autorizacao.

### Grupo 4 - Banco e migrations

Caminhos:

```text
db/migrations/001_init.sql
db/migrations/002_phase2_review.sql
db/migrations/003_phase4_html_capture.sql
db/migrations/004_phase4_audit_fixes.sql
db/migrations/005_phase4_cleanup_role.sql
db/migrations/006_phase2_runtime_grants.sql
db/migrations/007_remove_session_user_agent.sql
```

Dependencias: confirmar alvo de producao e fazer backup/rollback; nao aplicar neste plano.

Testes: PostgreSQL 17 local, 7 migrations, 14 tabelas, sem `user_agent`, runtime minimo.

Risco: nao aplicar no banco errado; producao candidata tem 6 migrations.

### Grupo 5 - Testes e CI

Caminhos:

```text
tests/analytics/**
tests/e2e/consent.spec.js
tests/unit/test-local-scope.spec.js
.github/workflows/ci.yml
```

Dependencias: grupos 1-4.

Testes: Windows/Linux, Playwright, analytics 137, build canonico, CSP e isolamento.

Risco: testes B1 nao substituem o site completo; CI precisa do banco de teste efemero.

### Grupo 6 - Documentacao essencial

Caminhos: os relatorios listados em 4.1.

Dependencias: nenhuma de runtime.

Risco: documentacao afirma B1 aprovado, nao producao pronta.

### Grupo 7 - Historico B1 (opcional, nao producao)

Caminhos:

```text
validation-b1/**
database/b1/**
```

Dependencias: nenhuma para producao.

Testes: manter a suite B1 como evidencia historica.

Risco: nunca publicar `validation-b1` como site de producao.

### Fora de commits

```text
pagefind/**
css/analytics.min.*
js/analytics.min.*
asset-manifest.json
sitemap.xml
_redirects
.agents/**
.netlify/**
opencode.jsonc
skills-lock.json
```

Gerar no build; nao versionar cegamente. `_redirects` e `sitemap` sao gerados e ja estavam
rastreados no repositorio; a decisao de versionar deve seguir a convencao existente, mas nao deve
ser feita a partir de uma execucao local sem build reproduzivel.

---

## 6. Ordem de integracao

```text
1. confirmar alvo de producao (banco)
2. commit runtime first-party + cliente
3. commit consentimento/privacidade/build
4. commit backend/Edge (se aprovado)
5. commit migrations
6. commit testes/CI
7. build completo do site; regenerar HTML/min/Pagefind/redirects
8. rodar testes completos e comparar artefato
9. preparar env/secrets Netlify com flags desligadas
10. deploy de producao autorizado e janela de ativacao
11. cleanup/retencao e limpeza B1 em etapas separadas
```

O grupo 1 pode depender apenas do codigo; a implantacao real depende do grupo 4 e da configuracao
do ambiente. Nao usar o artefato B1 minimo como producao.

---

## 7. Testes obrigatorios por etapa

| Etapa | Testes |
|---|---|
| Runtime/cliente | `test:analytics`, unit validation, imports, consent local |
| Paginas/build | `npm run build:deploy`, Playwright, CSP, privacidade |
| Backend/Edge | capture integration, cleanup, Edge, rate limit |
| Banco | PostgreSQL 17 local, 7 migrations, privilegios, rollback |
| CI | Windows/Linux, `test:analytics`, Playwright, isolamento |
| Pre-producao | smoke, consentimento, DNT/GPC, sem valores, origem/CORS, rate limit, rollback |

---

## 8. Riscos e conflitos

1. **Perda de trabalho:** 338/339 entradas nao commitadas; nao executar reset/clean/checkout.
2. **B1 inadequado:** o artefato 5F.61 e minimo; nao e o site completo.
3. **Banco errado:** `main/neondb` e `portal_analytics` sao alvos diferentes; so 6 migrations no
   candidato.
4. **HTML duplicado:** rodar `apply-analytics` sobre HTML ja marcado deve remover/reinserir o bloco;
   validar os 162.
5. **Privacidade:** o texto novo nao esta no deploy de producao; nao pode ser perdido ao regenerar.
6. **Pagefind/minificados:** sao gerados; nao representam fonte; `pagefind-entry.json` referencia
   hashes novos.
7. **Dependencias:** producao precisa de runtime deps e function bundling; B1 ja provou o modelo.
8. **Escopo:** Edge/cleanup/HTML capture nao foram decididos para producao; separar do MVP.

---

## 9. Criterios para considerar a consolidacao concluida

- working tree limpo ou apenas gerados ignorados;
- grupos 1-6 revisados e commitados sem misturar B1/homologacao com producao;
- build completo reproduzivel;
- 162 HTML regenerados sem perda de privacidade/metadados;
- migrations locais 001-007 e testes verdes;
- suite B1 preservada como historica;
- nenhum artefato B1 usado como producao;
- alvo de banco confirmado;
- configuracao/env e deploy ainda exigem autorizacao separada.

---

## 10. O que exige autorizacao antes de mudar

- criar/stage/commit dos grupos;
- escolher versionar ou regenerar HTML/minificados/Pagefind;
- confirmar banco/branch/projeto de producao;
- aplicar migrations/grants;
- configurar Netlify/secrets/flags;
- gerar e publicar o artefato completo de producao;
- executar cleanup dos dados sinteticos B1;
- promover o deploy.

Nenhuma dessas operacoes foi executada nesta preparacao.

**Recomendacao final: 2 - PRONTO COM RESSALVAS.**


