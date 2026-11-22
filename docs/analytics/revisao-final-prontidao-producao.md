# Revisao final de prontidao para producao - Portal das Contas Analytics

Status: **revisao somente leitura concluida; nenhuma alteracao, commit, deploy ou escrita remota**.
Data: **2026-11-22**.
Branch: `feat/portal-analytics`.
HEAD: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
Main/producao: `572457e506b35ce7fa0e423280aedd82b11c43fb`.

**Classificacao: 3 - NAO PRONTO PARA PRODUCAO.**

O codigo consolidado e o build completo estao tecnicamente validados. A producao, porem, ainda
nao tem o Analytics integrado, nao possui configuracao de banco/secrets e o alvo real do banco de
producao nao foi confirmado com evidencia suficiente.

---

## 1. Fontes consultadas

- `docs/analytics/consolidacao-local-analytics-portal-completo.md`
- `docs/analytics/fase-5f-62-deploy-final-homologacao-b1.md`
- `docs/analytics/encerramento-5f-e-prontidao-producao.md`
- `docs/analytics/recuperacao-inventario-codigo-analytics.md`
- `docs/analytics/plano-consolidacao-analytics.md`
- Git, artefatos locais, API Netlify de leitura, CLI Neon e PostgreSQL candidato em leitura.
- HTTP GET no site de producao.

Nenhuma operacao de escrita foi executada.

---

## 2. Codigo consolidado

| Item | Estado |
|---|---|
| Branch | `feat/portal-analytics` |
| HEAD | `665f0b3` |
| Main | `572457e` |
| Commits ahead/behind | 5 / 0 |
| Status entries | 342 no momento da revisao |
| Diffs rastreados reais | 206 |
| Untracked reais | 177 |
| Staged | nenhum |
| Snapshot inicial | preservado |
| Snapshot patch SHA-256 | `1a652445eebeb1abd787bb065d8be62e40d6931e6b6fde06cdb651fe59460be7` |
| Snapshot untracked | 176 arquivos |
| Patch cached check | ok |
| B1 historico | `0bdf9d0b...`, preservado |
| B1 deploy aprovado | `6b023d4035e5fbd62321cde1` |
| Build completo | 162 HTML, 671 arquivos, 19.633.188 bytes |

O working tree nao esta commitado. O snapshot inicial esta recuperavel, mas a integracao em main
ainda exige commit/merge autorizado.

### 2.1 Build e Functions

- `npm run build:deploy`: concluido.
- 162 HTML processados; 159 URLs no sitemap; Pagefind com 159 paginas.
- `dist` com 671 arquivos / 18.7 MB.
- Functions empacotadas localmente:
  - `collect.zip` 1.039.732 bytes, rota `/api/collect`;
  - `capture-html.zip` 987.353 bytes, rota `/api/capture-html`;
  - `cleanup-html-capture.zip` 422.004 bytes, schedule.
- `collect` inicializado fora do repositorio com `pg: true`.
- Artefato B1 minimo nao foi usado como producao.

### 2.2 Diferencas para main/producao

- Main nao contem o Analytics first-party.
- O deploy de producao (`6af0feeb...`) e do commit `572457e`.
- O build consolidado e o codigo de producao atual sao versoes diferentes.
- Existem 206 diffs e 177 untracked; isso precisa ser consolidado em commits antes de main.
- O snapshot comprova recuperabilidade, mas nao substitui a integracao versionada.

---

## 3. Banco candidato

### 3.1 Identidade encontrada

| Item | Valor |
|---|---|
| Projeto Neon | `portal-contas-homologacao` |
| Project ID | `square-mountain-69641645` |
| Branch | `main` |
| Branch ID | `br-dawn-paper-b6qcp9gw` |
| Database | `neondb` |
| PostgreSQL | 17 |
| Tabelas | 14 |
| Tabelas de analytics | 7 |
| Migrations | 001 a 006 |
| `sessions.user_agent` | presente (1) |
| Roles | `analytics_runtime`, `analytics_cleanup` |

### 3.2 Conclusao de identidade

**NAO CONFIRMADO / BLOQUEADO.**

Evidencias contra a confirmacao automatica:

- o site de producao nao tem `DATABASE_URL` nem qualquer variavel de banco;
- o projeto tem nome de homologacao;
- o database `portal_analytics` citado no `.env.example` nao existe;
- nao ha outro projeto Neon na conta listada;
- o candidato tem 6 migrations, enquanto o contrato consolidado tem 7;
- a branch `main` do Neon nao esta conectada ao deploy publicado.

O candidato `main/neondb` pode ser um banco de trabalho/homologacao. Nao e seguro assumir que seja
o banco de producao sem confirmacao do proprietario, host/role, destino Netlify e plano de backup.

Nenhuma migration, grant, DDL ou escrita foi executada.

---

## 4. Netlify de producao

| Item | Valor |
|---|---|
| Site | `strong-entremet-998544` |
| Site ID | `273101e3-7a01-4931-aeaf-4cee4fe74f07` |
| Dominio | `https://portaldascontas.com.br` |
| Team ID | `697d58587a017c3396fb416e` |
| Deploy publicado | `6af0feebef830ebab5cd25dd` |
| Contexto | `production` |
| Estado | `ready` |
| Publicado em | `2026-11-08T23:00:13.877Z` |
| Branch/commit | `main` / `572457e` |
| Variaveis site/account | **nenhuma** |
| `/api/collect` | **404** |
| Cliente first-party no HTML | nao |
| Banner de consentimento local | nao detectado |
| GA/GTM no HTML | presente |

O deploy publicado e anterior ao Analytics. Nao ha Functions, Edge, secrets ou flags de ingestao
configurados.

### 4.1 Variaveis necessarias

| Variavel | Necessaria | Contexto | Consumidor | Estado inicial seguro |
|---|---|---|---|---|
| `DATABASE_URL` | sim | production e preview autorizado | Functions/collect | apontar ao banco confirmado, role runtime; validar sem expor |
| `RATE_LIMIT_HMAC_SECRET` | sim | production/preview | collect/rate limit | secret >=32 bytes, exclusivo |
| `EDGE_INGEST_SECRET` | se Edge for ativado | production/preview | Edge/capture | secret exclusivo, flags off |
| `ALLOWED_ORIGINS` | sim | production/preview | collect/CORS | origens exatas `https://portaldascontas.com.br,https://www.portaldascontas.com.br` |
| `ANALYTICS_INGEST_ENABLED` | sim | production/preview | collect | `false` ate janela autorizada |
| `EDGE_CAPTURE_ENABLED` | apenas se aprovado | production/preview | Edge | `false` |
| `EDGE_ANALYTICS_ENABLED` | apenas se aprovado | production/preview | Edge | `false` |
| `HTML_CAPTURE_CLEANUP_ENABLED` | apenas cleanup | production/preview | Scheduled cleanup | `false` |
| `EDGE_ANALYTICS_SAMPLE_RATE` | se Edge | production/preview | Edge | `0.1` ou valor aprovado |
| `EDGE_INGEST_KEY_ID` | opcional | production/preview | Edge/Function | default atual ou ID aprovado |
| `CLEANUP_DATABASE_URL` | se cleanup | production | Scheduled cleanup | role `analytics_cleanup`, flag off |
| `DB_POOL_MAX` | opcional | production | collect | conforme carga |

Nenhuma variavel foi criada ou alterada.

---

## 5. Privacidade e seguranca

### 5.1 Verificado no codigo e nos testes locais

| Controle | Evidencia |
|---|---|
| Consentimento antes da coleta | testes Playwright/consentimento e B1 |
| Independencia analytics/ads | teste de personalizacao |
| Consent Mode v2 antes do GA | teste de ordem de tags e HTML |
| DNT/GPC | testes e cliente |
| Retirada limpa IDs e interrompe coleta | testes |
| Sem valores/resultados de calculadora | validacao de payload e testes |
| Sem clique em anuncio | apenas evento de oferta `affiliate_click` |
| Deduplicacao | testes e rate limit |
| Rate limit/HMAC sem IP completo | testes |
| CORS/origem e CSP | codigo e testes |
| Runtime/cleanup separados | migrations/privilegios e testes |
| Desligamento rapido | `ANALYTICS_INGEST_ENABLED=false` |

### 5.2 Nao comprovado no ambiente publicado

- o deploy de producao nao contem o cliente/endpoint;
- nao existe consentimento first-party publicado;
- a politica de privacidade publicada e anterior a esta implementacao;
- nao ha evidencia de retencao/cleanup em producao;
- nao ha rate limit ou CORS de producao ativos;
- nao ha monitoramento/alerta de producao para o novo fluxo.

A inspecao tecnica nao substitui avaliacao juridica da politica de privacidade/LIA ou adequacao
regulatoria.

### 5.3 CSP

A CSP de producao ja inclui `connect-src 'self'`, permitindo o endpoint no mesmo dominio quando
ele existir. Tambem libera terceiros Google/Ads existentes. Nao ha endpoint de coleta hoje.
Nenhuma configuracao de CSP foi alterada.

---

## 6. Plano minimo de implantacao

Cada etapa exige autorizacao propria; nenhuma foi executada.

1. **Consolidar codigo**: criar commits na branch, revisar diff, remover/regenerar artefatos nao
   versionaveis e integrar em main via PR.
2. **Diff final**: comparar main com a branch; confirmar os 162 HTML, functions, migrations e tests.
3. **Banco**: confirmar projeto/branch/database/role/host de producao; obter backup ou PITR;
   executar preflight de 6 vs 7 migrations e esquema.
4. **Migrations e roles**: aplicar 001-007 e grants de runtime/cleanup em janela autorizada,
   com transacao/rollback; nao usar roles B1 no banco errado.
5. **Netlify**: configurar env/secrets no contexto correto, flags desligadas; validar nomes e
   escopos sem expor valores.
6. **Preview**: build completo e deploy de preview do artefato consolidado; verificar
   `/api/collect`, CSP, consentimento, CORS e Functions.
7. **Smoke/testes**: consentimento, DNT/GPC, sem valores, dedup, rate limit, origem, privacidade,
   pages e logs sem secrets.
8. **Autorizacao separada**: aprovar producao somente depois desses gates.
9. **Producao controlada**: deploy com ingestao desligada, ativar canario/flag, monitorar.
10. **Rollback**: restaurar deploy `6af0feeb...`, desligar `ANALYTICS_INGEST_ENABLED`, reverter
    env/funcoes e usar backup/PITR do banco se houve migration.

### Criterios de interrupcao

- banco/role/host divergente;
- migration 007 ou grants em alvo nao confirmado;
- env/flags em contexto errado;
- CSP/CORS/consentimento falhando;
- Functions sem `pg` ou `collect` sem rota;
- presenca de valores/resultados ou coleta sem consentimento;
- qualquer erro 5xx/replay/rate limit anormal;
- publicacao acidental em producao.

---

## 7. Bloqueios e riscos

1. **Banco de producao nao confirmado**: `main/neondb` e candidato, nao alvo comprovado.
2. **Sem env/secret no Netlify**: `DATABASE_URL`, rate secret, origins e flags ausentes.
3. **Deploy antigo**: main `572457e` nao contem Analytics; `/api/collect` 404.
4. **Codigo nao commitado**: 206 diffs reais e 177 untracked fora de main.
5. **Politica de privacidade nao publicada** no deploy de producao.
6. **Sem deploy real do site completo**; Functions foram validadas localmente, nao no Netlify de
   producao.
7. **Edge/cleanup nao decididos** para producao; devem ficar desligados.
8. **Dados sinteticos B1** ainda requerem cleanup separado.

---

## 8. Recomendacao

**3 - NAO PRONTO PARA PRODUCAO.**

O codigo consolidado e o build estao prontos para uma **revisao de integracao**, mas a producao
nao pode ser planejada como alvo confirmado enquanto o banco de producao nao for identificado e a
configuracao Netlify/secrets nao existir. A proxima acao deve ser uma autorizacao de consolidacao
versionada e confirmacao do alvo, nao um deploy.

**Nenhuma operacao remota de escrita, migration, grant, deploy, cleanup ou commit foi executada.**
