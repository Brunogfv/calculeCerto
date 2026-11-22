# Fase 5F.38 - Pre-homologacao controlada B1 (somente leitura)

Status: **auditoria remota de leitura concluida; nenhuma alteracao de codigo, configuracao, deploy,
flag, cron, banco ou ambiente remoto executada**.
Data/hora de referencia: **2026-11-20T13:14:28Z**.
Branch: `feat/portal-analytics`.
HEAD e remote analisados: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
CI de referencia: `44733531472` (todos os jobs aprovados).
Site B1: `portal-contas-validation-b1` (`9cd7034f-5691-46af-8030-d70f7ed52ca7`).
Neon B1: projeto `square-mountain-69641645`, branch `validation-b1`, banco `validation_b1`.

**Classificacao da auditoria: 2 - Aprovado com pendencias.**
A execucao da auditoria foi concluida e nenhuma evidencia contradiz o codigo/CI. A B1 remota,
porem, nao possui deploy publicado valido; portanto o ambiente ainda **nao esta pronto para
homologacao** e a fase nao aprova homologacao nem producao.

---

## 1. Escopo e limites

### Autorizado e executado

- leitura do Git local, HEAD, status e historico recente;
- leitura do CI e dos relatorios/testes existentes;
- consulta somente leitura ao site B1 no Netlify;
- consulta somente leitura ao banco `validation_b1` no Neon;
- conexao com as roles de runtime/cleanup apenas para verificar identidade, memberships e privilegios;
- criacao deste relatorio.

### Nao executado

- deploy, preview, publish ou rollback;
- alteracao/remocao/leitura exposta de variaveis de ambiente ou secrets;
- alteracao de flags ou secrets;
- execucao de `Run now`, cron ou cleanup;
- DDL, DML, `DELETE`, `TRUNCATE`, grants ou revogacoes;
- alteracao de roles, banco, branch ou projeto Neon;
- commit, push, PR ou novo workflow de CI;
- qualquer operacao no site de producao.

Nenhum valor de token, senha, connection string ou secret foi impresso. As consultas usaram
variaveis de ambiente apenas durante processos locais.

---

## 2. Git, CI e testes locais

| Item | Estado |
|---|---|
| Branch | `feat/portal-analytics` |
| HEAD | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` |
| Indice | vazio |
| Working tree | possui alteracoes antigas nao commitadas e relatorios nao versionados |
| Codigo sob auditoria | commit `665f0b3` |
| CI 44733531472 | sucesso em todos os jobs |
| B1 artifact/gate | aprovado no CI |
| Analytics | aprovado no CI |
| Playwright | aprovado no CI |
| Commit/push nesta fase | nenhum |

Os testes locais nao foram reexecutados nesta fase porque o working tree contem alteracoes
preexistentes nao commitadas. Rodar a suite sobre esse estado nao validaria o mesmo conteudo que o
CI `44733531472` validou. A evidencia de teste continua sendo o conjunto de `665f0b3`:

- analytics: 135/135;
- Playwright: 62/62;
- B1: 39/39;
- consentimento: 2/2;
- SSL: 5/5;
- isolamento: 41/41;
- HTML canonico: 162 paginas;
- gate B1: `validated_only`.

Isso comprova o conteudo versionado, nao um deploy B1 atual.

---

## 3. Estado remoto do site B1

### 3.1 Site e deploy publicado

| Campo | Resultado |
|---|---|
| Nome | `portal-contas-validation-b1` |
| ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| URL HTTPS | `https://portal-contas-validation-b1.netlify.app` |
| State | `current` |
| `published_deploy` | `null` |
| `deploy_id` | vazio |
| `sso_login` | `false` |
| Resposta da URL publica | HTTP 404 |

**Nao existe deploy publicado na B1.** A URL publica responde 404. O site esta cadastrado e tem
historico de previews, mas nao representa um ambiente de homologacao disponivel.

### 3.2 Previews encontrados

O preview mais recente e `6afd151972b2d3618033a7dd`:

| Campo | Resultado |
|---|---|
| State | `ready` |
| Context | `deploy-preview` |
| Criado em | `2026-11-18T03:01:45.381Z` |
| `published_at` | `null` |
| `commit_ref` | `null` |
| URL do preview | responde 200 |
| Functions | `capture-html`, `cleanup-html-capture`, `collect` |
| Schedule | `cleanup-html-capture` em `15 3 * * *` |
| Rate limit de `capture-html` | 60 requisicoes/60 s, chaves IP e dominio |

O preview tambem e divergente do artefato B1 esperado: contem `collect`, enquanto o contrato
atual exige ausencia de `collect`; o historico da Fase 5F.18 registra 252 redirects e 16 headers.
Outros previews antigos (`6afb...`, `6afa...`, `6af7...`) tambem nao estao publicados.

Conclusao: o preview `6afd` **nao pode** ser usado para homologacao, nem como prova do artefato
atual.

### 3.3 Functions e Edge

- `GET /sites/{site}/functions`: resposta vazia, coerente com a ausencia de deploy publicado.
- A metadata do deploy de preview nao expoe uma lista de Edge Functions (`edge_functions: null`).
- O preview antigo e a evidencia historica indicam Edge Capture, mas nao foi possivel confirmar
  o Edge atual em um deploy B1 valido.

O caminho Edge -> Function e a configuracao ativa de Edge permanecem **nao confirmados** no runtime
B1.

---

## 4. Variaveis de ambiente da B1

Foram consultados apenas nomes, contextos e os booleanos das flags explicitamente comparadas.
Valores de secrets e connection strings nao foram impressos.

| Contexto | Chaves presentes |
|---|---|
| `deploy-preview` | `CLEANUP_DATABASE_URL`, `DATABASE_URL`, `EDGE_ANALYTICS_ENABLED`, `EDGE_ANALYTICS_SAMPLE_RATE`, `EDGE_CAPTURE_ENABLED`, `EDGE_INGEST_SECRET`, `HTML_CAPTURE_CLEANUP_ENABLED`, `NODE_VERSION` |
| `branch-deploy` | `DATABASE_URL`, `EDGE_INGEST_SECRET`, `NODE_VERSION` |
| `production` | `DATABASE_URL`, `EDGE_INGEST_SECRET`, `NODE_VERSION` |
| `dev` | `NODE_VERSION` |

Flags verificadas:

| Flag | Preview | Producao do site B1 |
|---|---|---|
| `HTML_CAPTURE_CLEANUP_ENABLED` | `false` | ausente |
| `EDGE_CAPTURE_ENABLED` | `false` | ausente |
| `EDGE_ANALYTICS_ENABLED` | `false` | ausente |

O cleanup e seus secrets continuam restritos ao preview. As flags de captura/analytics estao
desligadas no preview e ausentes no contexto de producao do site B1. Isso reduz risco de ativacao
acidental, mas nao substitui um deploy valido e uma janela controlada.

---

## 5. Estado do Neon B1

### 5.1 Identidade e conexao

| Item | Resultado |
|---|---|
| Projeto | `square-mountain-69641645` / `portal-contas-homologacao` |
| Regiao | `aws-sa-east-1` |
| Branch | `validation-b1` |
| Banco | `validation_b1` |
| Migracoes aplicadas | 6 |
| Conexao `neondb_owner` | bem-sucedida |
| Conexao `validation_b1_cleanup` | bem-sucedida |
| `sslmode` solicitado | `verify-full` |
| `pg_stat_ssl` na conexao | `false` |

A conexao com `sslmode=verify-full` foi estabelecida, mas `pg_stat_ssl` retornou `false` nas duas
conexoes. Isso nao permite afirmar TLS ponta a ponta nem validar certificado de forma conclusiva;
a evidencia de SSL continua **insuficiente**.

### 5.2 Roles e privilegios

Roles consultadas:

| Role | Super | Create DB | Create role | Replication | Bypass RLS | Inherit |
|---|---|---|---|---|---|---|
| `analytics_cleanup` | nao | nao | nao | nao | nao | nao |
| `analytics_runtime` | nao | nao | nao | nao | nao | nao |
| `validation_b1_cleanup` | nao | nao | nao | nao | nao | nao |
| `validation_b1_runtime` | nao | nao | nao | nao | nao | sim |

Conexao efetiva como `validation_b1_cleanup`:

- `current_database()` = `validation_b1`;
- `public` com `USAGE`, sem `CREATE`;
- nenhuma membership de role;
- `SELECT` e `DELETE` nas 13 tabelas de dados;
- sem `INSERT`, `UPDATE` ou `TRUNCATE` nas 13 tabelas;
- sem privilegios de schema/DDL.

Tabelas verificadas: `visitors`, `sessions`, `pageviews`, `events`, `affiliate_clicks`,
`ingest_events`, `rate_limits`, `html_events`, `html_traffic_daily`, `html_indicators_monthly`,
`edge_daily_counters`, `edge_nonces`, `edge_rate_limits`.

A excecao de membership documentada foi confirmada: `neondb_owner` e membro de
`validation_b1_cleanup`, grantor `cloud_admin`, `admin_option=true`, `inherit_option=false`,
`set_option=false`. A role de cleanup nao recebe memberships.

### 5.3 Dados atuais

| Tabela | Linhas |
|---|---:|
| `visitors` | 0 |
| `sessions` | 0 |
| `pageviews` | 0 |
| `events` | 0 |
| `affiliate_clicks` | 0 |
| `ingest_events` | 0 |
| `rate_limits` | 0 |
| `html_events` | 2 |
| `html_traffic_daily` | 1 |
| `html_indicators_monthly` | 1 |
| `edge_daily_counters` | 1 |
| `edge_nonces` | 2 |
| `edge_rate_limits` | 2 |

Nao foram lidos conteudos de linhas nem dados pessoais. O banco confirma estrutura/roles, mas os
dados de analytics de sessao estao vazios; isso e consistente com flags desligadas, nao com uma
homologacao de ingestao concluida.

---

## 6. Matriz de prontidao B1

### 6.1 Comprovado

- Git/HEAD/CI do conteudo versionado.
- Ausencia de deploy publicado na B1.
- Preview `6afd` pronto, mas nao publicado, com `collect` e schedule de cleanup.
- Site B1 sem functions disponiveis publicamente.
- Contextos e nomes das variaveis da B1.
- Flags de cleanup/Edge/analytics desligadas no preview e ausentes no contexto de producao B1.
- Banco, branch, database e roles do Neon B1.
- Role de cleanup sem memberships e com SELECT/DELETE restritos.
- Exception de membership de `neondb_owner` confirmada.
- Schema com 6 migracoes.
- Ausencia de dados de sessoes/eventos no B1 no momento da consulta.

### 6.2 Nao comprovado ou falhou

| Item | Estado | Impacto |
|---|---|---|
| Deploy B1 publicado e atual | falhou: `published_deploy=null`, URL 404 | bloqueia homologacao |
| Artefato B1 atual no runtime | preview divergente, com `collect` | bloqueia homologacao |
| Edge atual | nao exposto/confirmado no deploy | bloqueia validacao Edge |
| Consentimento/Consent Mode no deploy B1 | nao testado em deploy valido | bloqueia homologacao |
| Ingestao `/api/collect` no deploy B1 | nao testada | bloqueia homologacao |
| Rate limit/429 real | configuracao antiga, sem teste de carga | bloqueia homologacao |
| Cleanup Runtime/Run now | flag false, sem execucao | bloqueia homologacao |
| Schedule operacional | existe em preview, mas nao em deploy publicado | bloqueia homologacao |
| SSL efetivo | `pg_stat_ssl=false`; inconclusivo | pendencia |
| UA bruto em `sessions` | achado de codigo/schema, nao corrigido | bloqueia producao |
| TOCTOU | nao mitigado de forma definitiva | bloqueia homologacao/publicacao |
| Producao | nao avaliada nesta fase | fora do escopo |

### 6.3 Classificacao dos achados

- **Falha critica de ambiente:** nao ha deploy B1 publicado; a URL publica e 404.
- **Falha de validade do preview:** o preview mais recente e antigo/divergente e contem `collect`.
- **Pendencia critica de runtime:** cleanup, Edge, consentimento, ingestao e rate limit nao foram
  observados em um deploy B1 valido.
- **Pendencia de seguranca:** SSL sem evidencia conclusiva.
- **Bloqueador de producao:** UA bruto em `sessions` por ate 13 meses.
- **Risco operacional:** TOCTOU nao aceito.

---

## 7. Bloqueadores de homologacao

| ID | Bloqueador | Evidencia nesta fase | Criterio de resolucao |
|---|---|---|---|
| H-01 | Nenhum deploy B1 publicado | `published_deploy=null`; URL 404 | Publicar o contrato B1 validado em janela autorizada |
| H-02 | Preview atual e divergente | `6afd` com 3 Functions, `collect`; contrato exige ausencia de `collect` | Gerar/publicar artefato B1 atual e verificar hashes pos-deploy |
| H-03 | Edge/consent/ingestao nao validados | Sem deploy valido; Edge nao exposto na metadata | Executar testes em B1 valido |
| H-04 | Cleanup nao executado | Flag false; sem Run now; sem deploy publicado | Executar cleanup autorizado com dados sinteticos e status observado |
| H-05 | Rate limit/429 nao observado | Apenas 60/60 no preview; sem carga/429 | Teste controlado de limite e registro de comportamento |
| H-06 | SSL inconclusivo | `pg_stat_ssl=false` apesar de `verify-full` | Validar host/certificado/TLS sem expor secret |
| H-07 | TOCTOU nao aceito | Gate atual e processo local | Operacao exclusiva + verificacao pos-upload ou aceitacao formal |

Enquanto H-01 e H-02 existirem, uma homologacao real nao pode ser declarada.

---

## 8. Bloqueadores de producao

| ID | Bloqueador | Estado |
|---|---|---|
| P-01 | UA bruto em `sessions` por ate 13 meses | nao corrigido; requer decisao de privacidade |
| P-02 | Revisao juridica/DPO | pendente |
| P-03 | Producao nao migrada/ativada | nao avaliada nesta fase |
| P-04 | Cleanup/monitoramento de producao | nao operacional |
| P-05 | Protecao de abuso em producao | nao comprovada |
| P-06 | TOCTOU | nao aceito |
| P-07 | Rollout/rollback de producao | nao definido/testado |

A B1 nao e producao. Mesmo uma homologacao B1 aprovada nao autoriza ativacao de producao.

---

## 9. Achado de privacidade mantido

O handler de `/api/collect` persiste `sessions.user_agent` truncado, e a retencao documentada de
sessoes chega a 13 meses. A minimizacao recomendada e remover/normalizar o UA bruto ou limitar sua
retencao com aprovacao de privacidade. O achado nao foi alterado nesta fase.

Esse e o principal bloqueador de producao independente do estado do deploy B1.

---

## 10. O que foi confirmado nesta fase

1. O conteudo versionado `665f0b3` tem CI verde.
2. A B1 nao tem deploy publicado; a URL publica responde 404.
3. O preview `6afd` e antigo, nao publicado e divergente do contrato atual.
4. As variaveis de cleanup/Edge/analytics estao no preview e desligadas; nao estao no contexto de
   producao do site B1.
5. O Neon B1 existe com 6 migracoes, roles separadas e role de cleanup restrita.
6. A role de cleanup nao tem memberships e nao possui INSERT/UPDATE/TRUNCATE/DDL.
7. O banco B1 nao contem sessoes/eventos de analytics no momento da consulta.
8. SSL permanece inconclusivo.
9. Nenhuma operacao remota de escrita foi executada.

---

## 11. O que nao foi confirmado

- deploy B1 atual e valido;
- Edge Capture atual;
- fluxo Edge -> Function;
- consentimento/Consent Mode em B1;
- ingestao `/api/collect` em B1;
- rate limit e resposta 429 no runtime;
- cleanup real, agendamento efetivo e status `complete/partial/budget_exhausted/locked`;
- SSL ponta a ponta;
- configuracao ativa de producao e Google;
- aprovacao juridica/DPO;
- aceitacao do risco TOCTOU.

---

## 12. Autorizacoes necessarias para a proxima fase

- publicar um deploy B1 valido do contrato atual, sem `collect`/redirects extras;
- executar `Run now`/cleanup em B1 com dados sinteticos e janela controlada;
- executar teste controlado de rate limit/429 em B1;
- validar SSL/certificado e conexao das roles sem expor secrets;
- decidir e aprovar a correcao do UA bruto antes de producao;
- definir decisao operacional para TOCTOU;
- somente depois, planejar migracao/ativacao de producao.

Nenhuma dessas autorizacoes foi concedida ou exercida nesta fase.

---

## 13. Conclusao

- **Auditoria 5F.38 concluida?** Sim, dentro do escopo somente leitura.
- **B1 esta pronta para homologacao?** Nao. Nao ha deploy publicado valido; o preview e divergente.
- **Codigo/CI estao consistentes?** Sim, no commit `665f0b3`.
- **Podemos homologar agora?** Nao. Faltam deploy valido, testes de runtime e cleanup.
- **Podemos ativar producao?** Nao. Ha bloqueadores de privacidade, SSL, abuso e operacao.
- **Proxima acao recomendada:** autorizar uma unica janela B1 para publicar o artefato validado,
  executar testes de consentimento/Edge/ingestao/rate limit, rodar cleanup com dados sinteticos e
  verificar SSL; depois emitir o relatorio de homologacao.

**Classificacao final: 2 - Aprovado com pendencias.**
A fase de auditoria esta concluida. A homologacao e a producao **nao** estao aprovadas.
