# Encerramento da Fase 5F e prontidao para producao

Status: **homologacao B1 encerrada; producao auditada somente em leitura; nenhuma alteracao remota**.
Data: **2026-11-22**.
Branch de trabalho: `feat/portal-analytics`.
HEAD local/remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.

**Decisao final: 3 - NAO PRONTO PARA PRODUCAO.**

A homologacao funcional do B1 esta aprovada, mas a producao ainda nao contem o codigo, o artefato
de producao, o banco confirmado nem as configuracoes necessarias para o analytics first-party.

---

## 1. Encerramento da homologacao B1

Fonte: `docs/analytics/fase-5f-62-deploy-final-homologacao-b1.md`.

| Item | Registro |
|---|---|
| Deploy aprovado | `6b023d4035e5fbd62321cde1` |
| Site | `portal-contas-validation-b1` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Team ID | `697d58587a017c3396fb416e` |
| Contexto | `deploy-preview` |
| Estado | `ready` |
| `published_at` | `null` |
| `published_deploy` | `null` |
| Projeto Neon | `portal-contas-homologacao` |
| Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` |
| Branch ID | `br-misty-sound-b6pnt7iw` |
| Database | `validation_b1` |
| PostgreSQL | 17 |
| Migrations | 7 |
| Tabelas | 14 |
| Artefato homologado | SHA-256 `0bdf9d0b4843aa79760a5750b14ebcdc748022e84616ec4dd2e28d8e35ba8dbe` |
| Classificacao | **1 - Homologacao aprovada** |

Testes registrados na 5F.62:

- `/api/collect` registrada e inicializada; GET 405/Allow POST;
- sete tipos de evento aceitos;
- persistencia no database `validation_b1`;
- deduplicacao idempotente;
- rate limit: 60 respostas 202 e 1 resposta 429;
- origem nao autorizada: 403;
- payload invalido: 400;
- payload grande: 413;
- CSP B1 restritiva.

**Dados sinteticos remanescentes:** estao no B1, incluindo a sessao principal e a sessao do teste
de rate limit, alem de linhas de tentativas anteriores. Nao houve cleanup. A localizacao logica e o
database `validation_b1`, tabelas de analytics; nao ha dados de producao nesta limpeza.

**Producao:** nenhuma publicacao em producao ocorreu na 5F.62.

---

## 2. Codigo e artefatos

### 2.1 Estado do Git

| Item | Estado |
|---|---|
| `main` local/remota | `572457e506b35ce7fa0e423280aedd82b11c43fb` |
| Branch de analytics | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` |
| Commit em producao | `572457e506b35ce7fa0e423280aedd82b11c43fb` |
| Commits analytics a frente da main | 5 |
| Alteracoes locais nao integradas | 338 entradas de status; 206 arquivos rastreados modificados |
| Commit da correcao final B1 | **nao existe**; as correcoes finais estao no working tree |

O deploy de producao foi criado a partir de `main` em 2026-11-08 e nao contem os commits de
analytics da branch `feat/portal-analytics`.

### 2.2 Codigo homologado x codigo de producao

O artefato B1 5F.61 foi gerado a partir da copia B1 e dos modulos compartilhados locais. Os
principais arquivos de Function comparados (`collect-handler`, `validation`, `http`, `db`,
`config`) estao identicos entre a copia B1 e o canonico local. Porem:

- a producao nao recebeu esses arquivos;
- a producao nao tem `collect.mjs` publicado;
- a producao nao tem o cliente `js/analytics.js` publicado;
- a pagina B1 e um artefato minimo de homologacao, **nao um artefato de producao**;
- as correcoes 5F.59/5F.61 de empacotamento estao em scripts locais, alguns ainda nao rastreados.

### 2.3 Reproducao e dependencias

| Item | Resultado |
|---|---|
| Gate B1 `--check` | reproduziu `0bdf9d0b...` |
| Artefato B1 5F.61 | integro |
| Build canonico | executado localmente |
| Runtime deps B1 | `pg`, `zod`, `ua-parser-js` + transitivas |
| Reproducao a partir de commit limpo | **PENDENTE**; a branch nao contem todo o working tree final |
| Dependencias de producao | **PENDENTE**; nao ha artefato de producao validado |

**Classificacao:** B1 APROVADO; producao PENDENTE/BLOQUEADA.

---

## 3. Banco de producao

Nao foi executada nenhuma escrita, migration, grant, limpeza ou insercao.

### 3.1 Candidato identificado

| Item | Valor |
|---|---|
| Projeto Neon | `portal-contas-homologacao` |
| Project ID | `square-mountain-69641645` |
| Branch | `main` |
| Branch ID | `br-dawn-paper-b6qcp9gw` |
| Database | `neondb` |
| Owner | `neondb_owner` |
| Tabelas | 14 |
| Tabelas de analytics | 7 |
| Migrations | 001 a 006 |
| `sessions.user_agent` | presente |
| Roles de analytics | `analytics_runtime`, `analytics_cleanup` |

O database `portal_analytics` citado no `.env.example` **nao existe** nesse projeto/branch. O
candidato `main/neondb` nao pode ser confirmado como alvo de producao porque:

- o site de producao nao tem variavel de banco;
- a branch `main` e default do projeto, mas o projeto tem nome de homologacao;
- nao ha conexao de producao configurada para atribuir esse database ao deploy publicado.

**Classificacao:** NAO VERIFICADO / BLOQUEADO.

### 3.2 Diferencas de schema

| Item | B1 aprovado | Candidato producao |
|---|---|---|
| Migrations | 7 | 6 |
| 007 remove `user_agent` | aplicada | ausente |
| `sessions.user_agent` | ausente | presente |
| Runtime role | `validation_b1_runtime` | `analytics_runtime` |
| Grants | minimos B1 | grants fase 2 mais amplos em tabelas de eventos |
| `validation_b1_cleanup` | presente | nao presente |

O schema de producao **nao esta no mesmo estado** do B1 homologado. Nao foram aplicadas
migrations nem grants.

**Classificacao:** BLOQUEADO para producao.

---

## 4. Netlify de producao

| Item | Confirmado |
|---|---|
| Site | `strong-entremet-998544` |
| Site ID | `273101e3-7a01-4931-aeaf-4cee4fe74f07` |
| Dominio | `https://portaldascontas.com.br` |
| Team ID | `697d58587a017c3396fb416e` |
| Deploy publicado | `6af0feebef830ebab5cd25dd` |
| Contexto | `production` |
| Estado | `ready` |
| `published_at` | `2026-11-08T23:00:13.877Z` |
| Branch do deploy | `main` |
| Commit | `572457e506b35ce7fa0e423280aedd82b11c43fb` |

### Variaveis

- site env: **vazio**;
- account env para o site: **vazio**;
- nenhuma `DATABASE_URL`, `RATE_LIMIT_HMAC_SECRET`, `ALLOWED_ORIGINS`,
  `ANALYTICS_INGEST_ENABLED`, `EDGE_INGEST_SECRET` ou flag de captura/cleanup;
- as variaveis necessarias existem apenas no B1, nao em producao.

### Comportamento publicado

| Verificacao | Resultado |
|---|---|
| `/api/collect` | **404** |
| Cliente `js/analytics.js` no HTML | nao |
| Banner/consentimento first-party no HTML | nao detectado |
| GA/GTM no HTML | presente |
| CSP | permite self e terceiros Google; nao ha endpoint first-party |
| `connect-src 'self'` | presente |
| Dados de producao | nao alterados |

O site publicado esta em um estado anterior ao recurso analytics. Nao ha rota de coleta, cliente
first-party, consentimento local, secrets de ingestao ou banco conectado.

**Classificacao:** BLOQUEADO para analytics em producao.

---

## 5. Privacidade e seguranca

| Item | B1 | Producao | Classificacao |
|---|---|---|---|
| Consentimento antes da coleta | testado na 5F.62 e Playwright | cliente first-party nao publicado | B1 APROVADO; producao PENDENTE |
| Sem valores/resultados em eventos | validado em testes | nao ha fluxo first-party publicado | APROVADO no B1 |
| Politica de privacidade | arquivo local atualizado, nao integrado | pagina antiga no deploy de producao | PENDENTE |
| Retencao e exclusao | documentacao/cleanup local; nao executado | nao configurado/verificado | PENDENTE |
| CORS/origem | B1 restrita a origem exata | sem endpoint/configuracao de producao | PENDENTE |
| CSP | B1 restritiva testada | producao ampla, sem endpoint analytics | PENDENTE |
| Validacao de payload | testada no B1 | nao publicada | APROVADO no B1 |
| Rollback/desligamento | flags B1 desligadas e runbook; sem producao | deploy antigo pode ser restaurado; sem analytics ativo | PENDENTE |

A politica de privacidade local contem linguagem de analytics/consentimento/retencao, mas essa
versao nao esta no deploy de producao. Nao foi possivel confirmar que a versao publicada cobre o
novo fluxo first-party.

---

## 6. Dados sinteticos e impacto

- B1: dados sinteticos remanescentes; nenhum cleanup executado.
- Producao: nenhuma insercao, limpeza ou leitura de dados pessoais.
- Nenhuma Scheduled Function foi executada.
- Nenhuma migration/grant foi aplicado.

**Classificacao:** B1 documentado; producao sem alteracao.

---

## 7. Confirmacao de operacoes remotas

Somente leituras remotas:

- API Netlify para site, deploy e nomes/contextos de variaveis;
- CLI Neon para projeto, branches e databases;
- conexao PostgreSQL de leitura ao candidato `main/neondb` para migrations/tabelas/roles;
- HTTP GET ao site de producao.

Nao houve:

- deploy;
- upload;
- alteracao de site, dominio, variavel, secret ou flag;
- migration ou grant;
- escrita no Neon;
- cleanup;
- commit, push ou PR.

---

## 8. Decisao objetiva

**3 - NAO PRONTO PARA PRODUCAO.**

Motivos objetivos:

1. Producao esta no commit `572457e`, anterior ao analytics; nao ha cliente, endpoint ou
   functions first-party publicados.
2. O site de producao nao tem nenhuma variavel de banco/segredo/flags de analytics.
3. Nao existe database de producao confirmado como `portal_analytics`; o candidato `main/neondb`
   tem apenas 6 migrations, mantem `user_agent` e usa role/grants diferentes do B1.
4. O estado local tem 338 entradas pendentes e 206 arquivos rastreados modificados; o codigo
   final B1 nao esta todo commitado/integrado.
5. O artefato B1 e minimo de homologacao e nao e um artefato de producao do Portal.
6. Consentimento, privacy policy, retencao, CORS e rollback de producao nao foram verificados no
   estado publicado.

A proxima etapa, se autorizada, deve ser **planejamento de producao** (nao implantacao): consolidar
codigo, definir banco/projeto de producao, aplicar/revisar migrations e grants em janela propria,
configurar Netlify, validar privacidade/consentimento e preparar rollback.

**Nenhuma correcao ou operacao remota foi executada.**
