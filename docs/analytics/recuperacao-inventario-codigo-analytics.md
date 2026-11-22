# Recuperacao e inventario do codigo Analytics

Status: **inventario somente leitura concluido; nenhuma alteracao, commit, deploy ou operacao remota**.
Data: **2026-11-22**.
Raiz analisada: `D:\Projetos\Site Calculadora`.

**Decisao: 2 - INVENTARIO PARCIAL; EXISTEM INCERTEZAS.**

O trabalho local esta inventariado e preservado, a homologacao B1 esta aprovada e a producao nao
esta pronta. A incerteza principal e o alvo real de banco de producao: o candidato `main/neondb`
tem apenas seis migrations, enquanto a API de producao nao possui configuracao de banco.

---

## 1. Snapshot do Git

| Item | Valor |
|---|---|
| Branch atual | `feat/portal-analytics` |
| HEAD local/remoto | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` |
| `main` local/remota | `572457e506b35ce7fa0e423280aedd82b11c43fb` |
| Commits a frente da main | 5 |
| Commits atras da main | 0 |
| Staged | 0 arquivos |
| Status entries | **339** no momento da leitura |
| Modificados (`M`) | 185 |
| Deletados (`D`) | 24 |
| Nao rastreados (`??`) | 130 |
| Arquivos nao rastreados reais | 174 (diretorios agregados no status) |
| Alteracoes rastreadas reais | 206 (`git diff HEAD`) |
| Modificacoes sem diff de conteudo | 3 |

O valor `338` mencionado na solicitacao e o estado anterior ao relatorio de encerramento; o
relatorio `docs/analytics/encerramento-5f-e-prontidao-producao.md` e a entrada adicional,
totalizando 339. Nada foi removido ou reorganizado.

Os tres `M` sem diff de conteudo sao:

- `_redirects`
- `netlify/functions/_lib/cleanup-retention.mjs`
- `validation-b1/netlify/functions/_lib/cleanup-retention.mjs`

Eles tem o mesmo hash de HEAD e diferenca aparente de filesystem/linha final; nao sao alteracoes
funcionais pendentes.

---

## 2. Inventario quantitativo por categoria

| Categoria | Entradas no status | Natureza |
|---|---:|---|
| Documentacao/relatorios | 85 | historico; nao e codigo de producao |
| B1 (`validation-b1/`) | 25 | homologacao; nao promover como producao |
| Analytics source | 3 | alteracoes realmente funcionais pendentes |
| Banco/migrations B1 | 2 entradas (9+1 arquivos) | SQL/ferramentas B1 e migration 007 |
| Gerados/artefatos | 54 | HTML versionado, minificados, Pagefind, redirects |
| Site HTML | 162 | paginas completas com bloco de analytics |
| Tooling/config | 8 | CI, README, env de exemplo, caches locais |
| Nao identificado | 0 | todas as entradas foram enquadradas |

### 2.1 Analytics source - 3 entradas de status, 2 diffs reais

```text
M D:\Projetos\Site Calculadora\netlify\functions\_lib\cleanup-retention.mjs  (sem diff de conteudo)
M D:\Projetos\Site Calculadora\netlify\functions\_lib\collect-handler.mjs
M D:\Projetos\Site Calculadora\tests\analytics\collect.integration.spec.mjs
```

O `collect-handler` atual remove a escrita de `user_agent`; o teste cobre nao persistencia e logs.
O `cleanup-retention` aparece como `M` por filesystem/linha final, mas tem o mesmo hash de HEAD e
nao possui diff funcional. Os dois diffs reais de analytics sao o handler e o teste; ambos devem
ser preservados. O cliente `js/analytics.js`, os demais handlers e as Edge Functions **ja estao no
HEAD da branch** desde os commits de analytics, nao aparecem como modificados.

### 2.2 Banco e migrations

Entradas de status:

```text
D:\Projetos\Site Calculadora\db\migrations\007_remove_session_user_agent.sql
D:\Projetos\Site Calculadora\database\
```

Conteudo do diretorio `database` (9 arquivos):

```text
D:\Projetos\Site Calculadora\database\b1\007-cleanup-retention.sql
D:\Projetos\Site Calculadora\database\b1\008-create-validation-b1-cleanup.sql
D:\Projetos\Site Calculadora\database\b1\009-runtime-collect-postflight.sql
D:\Projetos\Site Calculadora\database\b1\009-runtime-collect-preflight.sql
D:\Projetos\Site Calculadora\database\b1\009-runtime-collect-privileges.sql
D:\Projetos\Site Calculadora\database\b1\apply-b1-migrations.mjs
D:\Projetos\Site Calculadora\database\b1\apply-runtime-hardening.mjs
D:\Projetos\Site Calculadora\database\b1\b1-privileges.sql
```

`007_remove_session_user_agent.sql` e uma migration de schema real. Os arquivos `database/b1`
sao ferramentas/privilegios de homologacao e **nao devem ser promovidos automaticamente** como
migration de producao.

### 2.3 B1 - 25 entradas

```text
M validation-b1/artifact-contract.json
M validation-b1/netlify/functions/_lib/cleanup-retention.mjs
M validation-b1/package-lock.json
M validation-b1/package.json
M validation-b1/public/_headers
M validation-b1/scripts/artifact.mjs
M validation-b1/scripts/deploy-b1.mjs
M validation-b1/scripts/shared-files.mjs
M validation-b1/shared-manifest.json
M validation-b1/tests/artifact.spec.mjs
M validation-b1/tests/b1.spec.mjs
M validation-b1/tests/gate.spec.mjs
?? validation-b1/netlify/functions/_lib/attribution.mjs
?? validation-b1/netlify/functions/_lib/collect-handler.mjs
?? validation-b1/netlify/functions/_lib/config.mjs
?? validation-b1/netlify/functions/_lib/rate-limit.mjs
?? validation-b1/netlify/functions/_lib/user-agent.mjs
?? validation-b1/netlify/functions/_lib/validation.mjs
?? validation-b1/netlify/functions/collect.mjs
?? validation-b1/scripts/bundle-functions.mjs
?? validation-b1/scripts/deploy-target.mjs
?? validation-b1/scripts/freeze-artifact-runtime.mjs
?? validation-b1/scripts/freeze-artifact.mjs
?? validation-b1/scripts/prepare-runtime-deps.mjs
?? validation-b1/tests/deploy-simulation.spec.mjs
```

Classificacao: **artefato/homologacao B1**. Preservar como historico e para reproducao do B1. Nao
usar esse diretorio como codigo de producao; a pagina B1 e minima e nao contem o site completo.

### 2.4 Site HTML - 162 arquivos modificados

Todos os 162 HTML modificados contem o bloco `pca-analytics:start`; o build aplica o consentimento
e referencia os assets minificados versionados.

| Grupo | Quantidade | Caminhos |
|---|---:|---|
| Artigos | 103 | `D:\Projetos\Site Calculadora\artigos\**\*.html` |
| Calculadoras | 51 | `D:\Projetos\Site Calculadora\calculadoras\*.html` |
| Raiz | 4 | `index.html`, `busca.html`, `meus-calculos.html`, `obrigado.html` |
| Paginas institucionais | 4 | `paginas\*.html` |

Todos sao parte do **site completo**, nao do B1 minimo. A alteracao predominante e o bloco de
analytics/versionamento; `paginas/privacidade.html` tambem tem o texto novo de privacidade,
consentimento e retencao.

### 2.5 Gerados e assets - 54 entradas

```text
D:\Projetos\Site Calculadora\_redirects
D:\Projetos\Site Calculadora\asset-manifest.json
D:\Projetos\Site Calculadora\sitemap.xml
D:\Projetos\Site Calculadora\css\analytics.min.5198db7f.css
D:\Projetos\Site Calculadora\js\analytics.min.53aca874.js
D:\Projetos\Site Calculadora\pagefind\
```

O Pagefind concentra 25 caminhos rastreados (24 deletados + entrada de metadata) e 26 arquivos
novos no working tree. Esses arquivos sao **gerados pelo build**; nao sao a fonte do analytics.
`css/analytics.min...` e `js/analytics.min...` sao assets de deploy e precisam ser gerados/validados
junto com os HTML, nao descartados isoladamente.

### 2.6 Tooling/config - 8 entradas

```text
M .env.example
M .github/workflows/ci.yml
M .gitignore
M README.md
?? .agents/
?? .netlify/
?? opencode.jsonc
?? skills-lock.json
```

- `.env.example`, CI e README sao documentacao/configuracao de integracao;
- `.agents/` e ferramentas de agentes, nao producao;
- `.netlify/` e cache local de edge functions, nao producao;
- `opencode.jsonc` e `skills-lock.json` sao ferramentas locais.

### 2.7 Documentacao - 85 arquivos

Todos estao sob:

```text
D:\Projetos\Site Calculadora\docs\analytics\
```

Sao relatorios e inventarios historicos, inclusive as fases 5F.51 a 5F.62 e o encerramento. Nao
sao codigo de producao, mas devem ser preservados para auditoria/proveniencia.

### 2.8 Ignorados relevantes

O `git status --ignored` tem 24.308 entradas, principalmente `node_modules/`, `dist/`,
`validation-b1/dist/`, `validation-b1/.netlify/`, `.env*`, relatorios de Playwright e caches.
Nenhum arquivo ignorado foi alterado nesta etapa.

---

## 3. Analise dos 206 arquivos rastreados

| Grupo | Quantidade | Conteudo |
|---|---:|---|
| HTML do site completo | 162 | bloco analytics + assets versionados; privacidade atualizada |
| B1 | 11 diffs reais | scripts, contrato, testes e copias compartilhadas |
| Analytics core | 2 diffs reais | `collect-handler`, teste de integracao |
| Gerados | 3 diffs reais + 1 sem conteudo | `asset-manifest`, `sitemap`, `_redirects` |
| Tooling | 4 | `.env.example`, CI, `.gitignore`, README |
| Deletados | 24 | Pagefind antigo |
| Sem diff | 3 | `_redirects`, cleanup root, cleanup B1 |

As alteracoes HTML sao **necessarias para o site completo** se os HTML forem commitados como
fonte; alternativamente, podem ser regeneradas pelo build com `scripts/apply-analytics.js`.
Elas nao sao do B1 minimo.

---

## 4. Proveniencia

```text
main de producao
  572457e  Merge PR #5 catalogo
       |
       +-- feature branch feat/portal-analytics
            0e723dc  backend de coleta fase 2
            8d455fc  deduplicacao/isolamento fase 2
            027d7d3  versionamento homologacao B1/CI Linux
            68759c5  CI e integridade B1
            665f0b3  teste local/escopo B1

working tree nao commitado
  - correcoes 5F.53 a 5F.61
  - migration 007
  - HTML/Pagefind/minificados gerados
  - B1 scripts/artefatos
  - documentacao
```

| Elemento | Proveniencia |
|---|---|
| Codigo base | `main` 572457e e commits analytics da feature |
| B1 homologado | artefato 5F.61, SHA-256 `0bdf9d0b4843aa79760a5750b14ebcdc748022e84616ec4dd2e28d8e35ba8dbe` |
| Deploy B1 aprovado | `6b023d4035e5fbd62321cde1` da 5F.62 |
| B1 anterior | 5F.55 `834d...`; 5F.59 `7504...`; preservados |
| Producao publicada | deploy `6af0feebef830ebab5cd25dd`, main 572457e |
| Artefato de producao | **nao existe**; o B1 minimo nao e producao |
| Correcoes finais | working tree, ainda sem commit |

O que foi testado no B1:

- endpoint first-party, rotas, dependencias, consentimento server-side, persistencia, dedup, rate
  limit e seguranca;
- artefato minimo B1, nao o site completo.

O que foi testado localmente no site completo:

- Playwright 62, analytics 137, build canonico e CSP;
- nao houve deploy de producao desse conjunto.

---

## 5. Baseline de producao e diferencas

### 5.1 Estado remoto de producao (somente leitura)

| Item | Valor |
|---|---|
| Site Netlify | `strong-entremet-998544` |
| Site ID | `273101e3-7a01-4931-aeaf-4cee4fe74f07` |
| Dominio | `https://portaldascontas.com.br` |
| Team ID | `697d58587a017c3396fb416e` |
| Deploy publicado | `6af0feebef830ebab5cd25dd` |
| Commit do deploy | `572457e506b35ce7fa0e423280aedd82b11c43fb` |
| Branch do deploy | `main` |
| Variaveis site/account | nenhuma |
| `/api/collect` | 404 |
| Cliente first-party no HTML | nao |
| Banner de consentimento local | nao detectado |
| GA/GTM no HTML | presente |

Banco candidato:

| Item | Valor |
|---|---|
| Projeto Neon | `portal-contas-homologacao` (`square-mountain-69641645`) |
| Branch | `main` (`br-dawn-paper-b6qcp9gw`) |
| Database | `neondb` |
| Tabelas | 14 |
| Tabelas analytics | 7 |
| Migrations | 001 a 006 |
| `sessions.user_agent` | presente |
| Roles | `analytics_runtime`, `analytics_cleanup` |
| Database `portal_analytics` | nao existe |

O database candidato nao pode ser confirmado como producao porque o site nao possui
`DATABASE_URL` e o projeto tem nome de homologacao. A confirmacao do alvo e uma dependencia
externa para a integracao.

### 5.2 Diferencas de producao

- Producao publicada e anterior ao analytics.
- `/api/collect` de producao e 404.
- Nao ha cliente first-party nem banner de consentimento detectado no HTML publicado.
- Site de producao nao possui variaveis de site/account; configuracao B1 nao existe em producao.
- Banco candidato `main/neondb` tem 6 migrations; B1 tem 7.
- O database `portal_analytics` citado no `.env.example` nao existe no projeto.
- `analytics_runtime` da producao tem grants mais amplos que o contrato B1.

### Riscos de perda ou erro

1. **Nao executar reset/clean/checkout**; ha 338/339 entradas nao commitadas.
2. Nao promover o artefato B1 minimo para producao; ele substituiria o site completo.
3. Nao aplicar `database/b1` diretamente em producao; sao ferramentas de homologacao.
4. Nao commitar Pagefind nem minificados sem regenerar o build completo.
5. Nao aplicar 007 no banco errado; confirmar `main/neondb` versus `portal_analytics`.
6. O privacy policy local ainda nao esta no deploy publicado.
7. O site de producao nao tem env/secret/flags; habilitar sem configurar gera 404/503/coleta
   inconsistente.

---

## 6. Plano de integracao proposto

Nenhuma destas etapas foi executada; cada uma exige autorizacao propria.

1. **Preservar o working tree** por commit controlado na branch de trabalho; nao usar operacoes
   destrutivas.
2. Separar **fonte** de **gerado**:
   - fonte: `js/analytics.js`, `css/analytics.css`, functions/edge, scripts, migrations 001-007,
     testes e package;
   - regeneravel: 162 HTML com bloco, minificados, Pagefind, `_redirects`, `sitemap`,
     `asset-manifest`.
3. Revisar e commitar as correcoes reais: `collect-handler`, `cleanup-retention`, migration 007,
   `.env.example`, CI, README, privacidade, testes e scripts.
4. Manter `validation-b1/` e `database/b1/` como historico/homologacao; nao como artefato de
   producao.
5. Gerar um **artefato do site completo** (nao o B1) a partir de `main + analytics`, com build
   reproduzivel, CSP, consentimento e rotas.
6. Confirmar o banco de producao e executar preflight; aplicar 001-007 e grants/roles em janela
   autorizada, com backup/rollback.
7. Configurar Netlify producao com secrets/flags desligadas; publicar primeiro com ingestao
   desligada e validar CSP/consentimento/rotas.
8. Ativar `ANALYTICS_INGEST_ENABLED` somente em canario/window; validar DNT/GPC, sem valores,
   rate limit, retencao e desligamento.
9. Concluir privacidade/retencao/cleanup e remover dados sinteticos do B1 em etapa separada.

Ordem minima de dependencias:

```text
codigo fonte -> build completo -> banco/alvos -> env/secrets -> deploy desligado ->
smoke/CSP/consent -> ingestao controlada -> cleanup
```

---

## 7. O que precisa de autorizacao antes de mudar

- criar commit(s) e integrar a branch;
- decidir e alterar quais arquivos gerados entram no repositorio;
- confirmar o banco/projeto/branch de producao;
- aplicar migration 007 e grants/roles de producao;
- configurar variaveis/secrets no Netlify de producao;
- gerar/publicar artefato completo de producao;
- ativar flags de ingestao/analytics/captura/cleanup;
- executar cleanup dos sinteticos B1;
- promover qualquer deploy.

Nenhuma dessas operacoes foi realizada.

---

## 8. Confirmacao de ausencia de escrita

- `git status` e `git diff` somente leitura;
- nenhuma alteracao, exclusao, rename, reset, checkout, stash, restore, rebase ou cherry-pick;
- nenhum commit/push;
- nenhum deploy/upload;
- nenhuma alteracao no Netlify;
- nenhuma migration/grant;
- nenhuma escrita no Neon;
- nenhum cleanup;
- nenhuma instalacao/atualizacao de dependencia.

**Classificacao final: 2 - Inventario parcial.**

