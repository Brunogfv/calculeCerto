# Fase 5F.13 — Auditoria independente de rate limiting e runtime da retenção B1

Status: **auditoria concluída; nenhuma operação remota de escrita; nenhum deploy; nenhuma limpeza
executada**.
Data/hora: **2026-11-17T17:59:50-03:00**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** A arquitetura está consistente, as duas regras de
rate limiting foram **reconhecidas pela plataforma no deploy** e a role de cleanup está no menor
privilégio esperado. O enforcement real do rate limiting e o runtime da limpeza continuam **não
comprovados**; há achados altos de operação (orçamento de 30 s e ausência de cleanup automático no
alvo atual) e um risco condicional de cascata em sessão inconsistente.

---

## 1. Escopo e ambientes verificados

| Item | Valor |
|---|---|
| Team ID | `697d58587a017c3396fb416e` |
| Site ID B1 | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Site | `portal-contas-validation-b1` |
| Domínio | `https://portal-contas-validation-b1.netlify.app` |
| Deploy auditado | `6afb78132cdffef6e6a05696` |
| Contexto/estado | `deploy-preview` / `ready` |
| Neon Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` |
| Database | `validation_b1` |
| Runtime role | `validation_b1_runtime` |
| Cleanup role | `validation_b1_cleanup` |

Verificações realizadas somente por leitura: API Netlify, metadados do deploy, funções/Edge
Functions publicadas, variáveis por contexto, banco Neon e testes locais descartáveis.

Nenhum deploy, promoção, POST remoto, execução de Scheduled Function, DELETE/INSERT/UPDATE/TRUNCATE
remoto, alteração de role/grant/migration, alteração de flag ou variável, commit ou push foi
executado.

Créditos no momento da auditoria: **139,4738745652 disponíveis** de 300. Não houve deploy nesta
fase; portanto, não há custo de deploy atribuível a ela. O deploy continua intacto.

---

## 2. Estado do deploy atual

| Verificação | Resultado |
|---|---|
| Deploy ID | `6afb78132cdffef6e6a05696` |
| URL | `https://6afb78132cdffef6e6a05696--portal-contas-validation-b1.netlify.app` |
| Estado | `ready` |
| Contexto | `deploy-preview` |
| `published_at` | `null` |
| Publicado no site | não (`site.deploy_id=null`, `published_deploy=null`) |
| Functions | `capture-html`, `cleanup-html-capture` |
| Edge Functions | `html-capture` |
| `function_schedules` | `cleanup-html-capture` com `15 3 * * *` |
| Rate limit code-based | 2 regras: 1 Function + 1 Edge |
| Produção | deploy `6af0feebef830ebab5cd25dd`, inalterado |
| Homologação principal | deploy `6af47527818a48a5dbbef2c4`, inalterado |
| `traffic_rules_config_per_scope` | `{}` — não há regra de UI |

O site B1 continua sem deploy publicado. O preview não dispara cron automaticamente; a função
agendada só pode ser executada manualmente pela opção **Run now** da UI ou localmente.

---

## 3. Auditoria do rate limiting

### 3.1 Configuração presente no código e no build

| Camada | Configuração |
|---|---|
| Edge `/*` | `rateLimit.windowLimit=120`, `windowSize=60`, `aggregateBy=['ip','domain']` |
| Function `/api/capture-html` | `rateLimit.windowLimit=60`, `windowSize=60`, `aggregateBy=['ip','domain']` |

As regras são code-based, não estão no `netlify.toml` e usam a sintaxe oficial documentada para
Functions e Edge Functions. O Free permite **2 regras code-based por projeto**; há exatamente duas.

### 3.2 Reconhecimento pela plataforma

O metadado do deploy confirma que a plataforma reconheceu **as duas regras**:

- Function `capture-html`: `traffic_rules.action.type = "rate_limit"`, algoritmo
  `sliding_window`, `window_size=60`, `window_limit=60`, agregação `ip` + `domain`.
- Edge `html-capture`: `traffic_rules.action.type = "rate_limit"`, algoritmo
  `sliding_window`, `window_size=60`, `window_limit=120`, agregação `ip` + `domain`, com
  `path="/*"` e 29 `excluded_patterns`.

Isso é evidência de **configuração incluída no deploy e reconhecida pela plataforma**. Não é prova
de **enforcement observado no runtime**.

O `traffic_rules_config_per_scope={}` representa apenas regras de UI; não contradiz as regras
code-based reconhecidas no metadado.

### 3.3 Enforcement real

**Não comprovado.** Não foi gerada carga, não houve teste de 429, não foi medido o IP interno da
chamada Edge → Function e não foi possível observar contadores de bloqueio. O resumo do deploy não
lista uma mensagem explícita de rate limiting; a evidência disponível é o metadado estruturado de
tráfego.

Limitações aplicáveis:

- a plataforma documenta atraso de até **10 s** entre ultrapassar o limite e começar a bloquear;
- a agregação por IP/domínio no Free não impõe limite global e é contornável por IPs distribuídos;
- a documentação não define claramente qual IP é usado na chamada interna Edge → Function; o
  limite de 60/min da Function pode ser compartilhado pela borda e gerar falso `429`;
- a semântica de `excludedPath` para a regra de rate limit da Edge não está explicitada na
  documentação; não se pode afirmar que assets/API excluídos também não contam, nem o contrário;
- o deploy não fornece, via API, o log de post-processing com a mensagem de reconhecimento; o
  metadado estruturado é a evidência platform-side disponível.

### 3.4 Camadas complementares

HMAC, timestamp, nonce, limite de corpo de 8 KiB, rate limit por `rate_key` no banco e limite diário
permanecem presentes e testados. O rate limit de plataforma não substitui essas camadas, e vice-
versa. A matriz de proteção continua coerente; a única lacuna é a observação do enforcement de
plataforma.

---

## 4. Auditoria da Scheduled Function

| Verificação | Resultado |
|---|---|
| Arquivo | `netlify/functions/cleanup-html-capture.mjs` |
| Cron | `15 3 * * *` (UTC) |
| Função no deploy | sim |
| Schedule no deploy | sim, reconhecido |
| `HTML_CAPTURE_CLEANUP_ENABLED` no preview | `false` |
| Execução nesta fase | não |
| Logs de execução | não existem; não invocada |
| Cron em preview | não executa automaticamente |

### Comportamento desativado

`runScheduledCleanup` retorna `{enabled:false,status:'disabled'}` antes de chamar `getPool` quando a
flag não é exatamente `'true'`. Confirmação local adicional: com `getPool` que lançaria erro, a
função retornou `disabled` sem chamar o pool. Sem `CLEANUP_DATABASE_URL`, retorna
`missing_cleanup_url` antes de criar conexão.

### Contexto de execução

O deploy atual é `deploy-preview`. A documentação oficial afirma que Scheduled Functions só rodam
no cron em **deploys publicados**; previews e branch deploys não disparam cron. Além disso:

- `CLEANUP_DATABASE_URL` está presente **somente** no contexto `deploy-preview`;
- `HTML_CAPTURE_CLEANUP_ENABLED` também está somente no preview, com `false`;
- produção tem apenas `DATABASE_URL` e `EDGE_INGEST_SECRET`, sem cleanup.

Consequência: se este preview fosse promovido, a função agendada não teria
`CLEANUP_DATABASE_URL` nem a flag no contexto de produção. Portanto, **não existe hoje um alvo
publicado com cleanup automático operacional**.

---

## 5. Privilégios, conexão e integridade

### Role `validation_b1_cleanup`

| Verificação remota | Resultado |
|---|---|
| Login | sim |
| `SUPERUSER`, `CREATEDB`, `CREATEROLE`, `REPLICATION`, `BYPASSRLS` | não |
| `NOINHERIT` | sim |
| Memberships recebidas | nenhuma |
| `USAGE` em `public` | sim |
| `CREATE` no schema/database | não |
| `SELECT`/`DELETE` nas 13 tabelas | sim |
| `INSERT`/`UPDATE`/`TRUNCATE`/DDL | não |
| `SELECT`/`DELETE` em `schema_migrations` | não |
| Owner de objetos | não |

O SQL 007 mantém uma exceção para a membership automática de plataforma
`neondb_owner`/`cloud_admin`, mas ela **não está presente na role no momento da auditoria**. Não há
privilégio excessivo comprovado.

### Conexão

- A rotina usa exclusivamente `CLEANUP_DATABASE_URL`; não há fallback para `DATABASE_URL`.
- A variável é secreta e site-specific; a URL completa não foi lida nem exibida.
- A configuração anterior usa endpoint direto da branch, não pooled.
- O código não valida `sslmode`, host direto/pooled ou esquema da URL; ele confia no valor secreto.
- A role de cleanup e a role runtime são distintas.

### Validação antes de excluir

`limparRetencao` valida banco, usuário, atributos da role, memberships, schema/database/migrations e
privilégios das 13 tabelas. Falhas lançam erro antes de qualquer `DELETE`. Testes locais de banco e
role divergentes interrompem a operação.

### Lock, lotes e rollback

- `pg_try_advisory_lock(871238)` é adquirido em uma conexão dedicada do pool.
- Lock ocupado retorna `{locked:false}` sem `DELETE`; foi confirmado localmente com um cliente
  segurando o lock real.
- Batching por `ctid` com `LIMIT`; commit por lote; falha do lote faz `ROLLBACK` e propaga erro.
- `statement_timeout=30s` e `lock_timeout=5s` por lote.
- Lotes anteriores a uma falha permanecem commitados; não há rollback global nem marca de
  retomada/`run_id`.
- Logs de sucesso/erro não incluem IP, UA, payload, SQL ou credenciais.

---

## 6. Matriz de retenção por tabela

Ordem de exclusão no código: `affiliate_clicks` → `events` → `pageviews` → `sessions` →
`visitors` → `ingest_events` → `rate_limits` → `html_events` → `html_traffic_daily` →
`html_indicators_monthly` → `edge_daily_counters` → `edge_nonces` → `edge_rate_limits`.

| Tabela | Critério/prazo | Coluna | Dependências e ordem | Privilégio | Cobertura de teste |
|---|---|---|---|---|---|
| `affiliate_clicks` | 90 dias | `received_at` | FK para `events`, `sessions`, `visitors`; excluída antes delas | SELECT/DELETE | Unit allowlist + ad hoc old/recent |
| `events` | 90 dias | `received_at` | FK para `sessions`, `visitors`; antes delas | SELECT/DELETE | Unit + ad hoc |
| `pageviews` | 90 dias | `received_at` | FK para `sessions`, `visitors`; antes delas | SELECT/DELETE | Unit + ad hoc |
| `sessions` | 13 meses | `last_seen_at` | Pai de detalhes; cascata para filhos; antes de `visitors` | SELECT/DELETE | Unit + ad hoc 13m |
| `visitors` | 13 meses, sem sessão remanescente | `last_seen_at` | Pai; `NOT EXISTS sessions`; após `sessions` | SELECT/DELETE | Unit + ad hoc 13m |
| `ingest_events` | 90 dias | `received_at` | Independente | SELECT/DELETE | Unit + ad hoc |
| `rate_limits` | 24 h | `window_start` | Independente | SELECT/DELETE | Unit + ad hoc |
| `html_events` | 7 dias | `received_at` | Independente | SELECT/DELETE | Integração old/recent |
| `html_traffic_daily` | 90 dias | `day` | Independente | SELECT/DELETE | Integração old/recent |
| `html_indicators_monthly` | 13 meses | `month` | Independente | SELECT/DELETE | Integração old/recent |
| `edge_daily_counters` | 90 dias | `day` | Independente | SELECT/DELETE | Integração old/recent |
| `edge_nonces` | 24 h | `expires_at` | Independente | SELECT/DELETE | Integração old/recent |
| `edge_rate_limits` | 24 h | `window_start` | Independente | SELECT/DELETE | Integração old/recent |

As 13 tabelas estão na allowlist e têm SELECT/DELETE remotos. `schema_migrations` não é alvo.

**Gap de cobertura da suíte:** o teste de integração principal semeia antigos/recentes apenas para
as tabelas da Fase 4/Edge. As tabelas da Fase 2/3 são executadas, mas sem linhas antigas e recentes
semeadas. A auditoria fez uma verificação local adicional (não um teste versionado) que confirmou
exclusão de antigos e preservação de recentes em 90 dias, 13 meses, ingest, rate limits e batching.
Esse cenário deve virar teste permanente antes de operação real.

---

## 7. Testes locais executados

PostgreSQL 17.11 local descartável; nenhum banco remoto foi usado para DELETE/INSERT/UPDATE.

| Suíte | Resultado |
|---|---|
| Analytics (inclui integrações PostgreSQL) | **120/120 pass**, 0 fail, 0 skip |
| B1 (`sync:shared` + build + test) | **19/19 pass** |
| Consentimento no navegador | **2/2 pass** |
| Build B1 | passou: 6 arquivos + manifest, 10,0 KiB |
| Manifesto compartilhado | 16 arquivos idênticos |
| Migrations locais | 6 |
| Lock real concorrente | bloqueou; `locked=false`, nenhum DELETE |
| Função desativada | retornou `disabled` sem chamar `getPool` |
| URL ausente | retornou `missing_cleanup_url` sem abrir pool |
| Retenção 90 dias | antigos removidos; recentes preservados |
| Retenção 13 meses | antigos removidos; recentes preservados |
| Cascata de sessão inconsistente | reproduzida localmente; recente foi removido pela cascata |

Observação de ambiente de teste: uma primeira execução em banco já migrado antes da criação das
roles falhou 2 testes porque os grants de migration só são aplicados a roles existentes. O banco foi
recriado vazio, a suíte criou as roles antes das migrations e passou 120/120. É um problema de ordem
do harness de teste, não do runtime de produção.

Não foram testados: enforcement real de 429, IP interno Edge→Function, timeout real de 30 s da
Scheduled Function, conexão pooled/SSL real, falha de conexão no runtime publicado, dry-run e
execução manual no B1.

---

## 8. Achados classificados

### A-01 — Alto — Orçamento de execução incompatível com o limite de 30 s

- **Evidência:** `DEFAULT_MAX_BATCHES=100` por tabela; `LIMITS.batches` aceita até 1000; 13 tabelas;
  `statement_timeout=30s` por lote; a plataforma limita Scheduled Functions a **30 s**; não há
  deadline total nem `run_id`/retomada.
- **Impacto:** a função pode ser encerrada no meio; lotes anteriores ficam commitados, tabelas
  posteriores não são limpas e não há sinal claro de execução incompleta. A retenção pode atrasar
  indefinidamente.
- **Correção:** deadline total conservador (ex.: 20 s), orçamento por tabela, `maxBatches` menor e
  log de `run_id`/`stopped_due_to_deadline`; retomada idempotente. É mudança local + nova janela de
  teste, não operação remota.

### A-02 — Alto — Cleanup automático não operacional no alvo atual

- **Evidência:** deploy é `deploy-preview`; cron só roda em publicado; `CLEANUP_DATABASE_URL` e
  `HTML_CAPTURE_CLEANUP_ENABLED` existem somente no contexto `deploy-preview`; produção não tem
  nenhum dos dois; a função agendada não foi executada.
- **Impacto:** não há retenção automática no B1 atual; promover o preview não resolve porque o
  contexto de produção não tem URL/flag. A função só pode ser validada manualmente.
- **Correção:** decidir entre execução manual controlada ou alvo publicado dedicado; configurar
  variáveis no contexto correto somente com autorização; não promover este preview. Requer operação
  remota futura.

### M-01 — Médio — Function pode agregar IP interno Edge→Function

- **Evidência:** regra da Function reconhecida com agregação `ip`+`domain` e limite 60/60; a chamada
  é feita pela Edge; a documentação não define o IP dessa chamada interna.
- **Impacto:** se o IP agregado for o da borda, o limite de 60/min pode ser compartilhado e gerar
  falso `429` para tráfego legítimo.
- **Correção:** validar em preview autorizado, observando logs/contadores e o IP da chamada; se
  confirmado, elevar o limite ou separar a regra.

### M-02 — Médio — Escopo da regra Edge em relação a `excludedPath` não comprovado

- **Evidência:** Edge tem `path="/*"` e 29 `excluded_patterns`; a regra foi reconhecida no metadado
  da Edge, mas a documentação de rate limit não explicita se paths excluídos deixam de ser contados.
- **Impacto:** assets, API ou páginas excluídas podem consumir o limite de 120/min, ou podem ficar
  fora dele; há risco de falso `429` ou de proteção menor que a esperada.
- **Correção:** teste controlado por path, incluindo asset excluído e rota de API; registrar a
  semântica observada.

### M-03 — Médio — Conexão direta e SSL não são impostos pelo código

- **Evidência:** `createPool(env.CLEANUP_DATABASE_URL,1)`; nenhuma validação de `sslmode`, host
  direto, ausência de `-pooler` ou banco; a configuração anterior é direta, mas o código não a
  garante.
- **Impacto:** uma URL pooled pode invalidar a semântica do advisory lock de sessão; uma URL sem SSL
  depende da rejeição do provedor. Não há fallback para `DATABASE_URL`, mas também não há fail-fast
  para endpoint inadequado.
- **Correção:** validar `sslmode=require/verify-full`, host não pooled e identidade; manter a URL
  secreta. Mudança local, sem conceder privilégios.

### M-04 — Médio (condicional a alto) — Cascata de `sessions` pode apagar filho recente

- **Evidência:** teste local com sessão com `last_seen_at` de 14 meses e `pageview` recente:
  `sessions` removeu 1, `pageviews` reportou 0 removidos, mas a pageview recente desapareceu por
  `ON DELETE CASCADE`; contagem final = 0. O mesmo pode ocorrer com `events`/`affiliate_clicks`.
- **Impacto:** se houver inconsistência (evento atrasado, backfill, clock skew ou edição manual), um
  registro recente pode ser excluído indiretamente. No B1 atual não há sessões nem filhos da Fase 2/3
  (contagem 0), então o risco é de dados futuros/inconsistentes.
- **Correção:** antes de apagar `sessions`, exigir que não exista filho com
  `received_at`/`occurred_at` dentro do prazo de retenção; ou reconciliar `last_seen_at`; adicionar
  teste de cascata. Se ingestão atrasada for esperada, elevar a prioridade para alto.

### M-05 — Médio — Cobertura de testes não inclui timeout, Phase2/3 e cascata

- **Evidência:** suíte passa 120/120, mas não semeia antigos/recentes das tabelas de Fase 2/3; não
  testa deadline/orçamento; não testa a cascata de sessão inconsistente; não testa falha de conexão
  publicada.
- **Impacto:** regressões de retenção podem passar; o achado A-01/M-04 não é protegido por teste.
- **Correção:** ampliar a suíte local com esses cenários antes de autorizar operação.

### B-01 — Baixo — Ordem do harness de teste pode gerar falso negativo

- **Evidência:** banco pré-migrado antes da criação das roles fez 2 testes falharem por falta de
  grants; banco recriado vazio passou 120/120.
- **Impacto:** resultados falsos em CI/execução manual; não é falha de produção.
- **Correção:** documentar que o banco de teste deve começar vazio ou que as roles devem ser criadas
  antes das migrations.

### B-02 — Baixo — Resumo do deploy não expõe mensagem de rate limiting

- **Evidência:** `summary.messages` não menciona rate limit; `available_functions[].tr` e
  `edge_functions[].traffic_rules` contêm as regras.
- **Impacto:** leitura apressada do resumo pode concluir ausência de regra.
- **Correção:** documentar o campo estruturado como fonte de verificação e não usar apenas o resumo.

### B-03 — Baixo — Limitações inerentes ao Free

- **Evidência:** 2 regras, agregação por IP/domínio, sem limite global, atraso de até 10 s.
- **Impacto:** ataque distribuído/rotativo contorna; excesso pode passar na janela de propagação.
- **Correção:** aceitar residual ou usar camada externa em fase autorizada.

### B-04 — Baixo — Ausência de dry-run/run_id e observabilidade de bloqueio

- **Evidência:** não há modo dry-run, `run_id` ou registro de 429; logs de cleanup têm apenas
  contagens e código de erro.
- **Impacto:** validação real é mais difícil; não se distingue execução parcial de conclusão.
- **Correção:** implementar dry-run sem DELETE, usando SELECT da mesma role, e `run_id`; não criar
  endpoint público.

---

## 9. Plano seguro para validação real

Nenhuma etapa abaixo foi executada; todas exigem autorização específica.

1. **Congelar o alvo:** não usar os 2 registros sintéticos nem dados de produção/homologação.
   Preferir banco local equivalente ou branch/database B1 dedicado. Se for remoto, criar alvo
   descartável com IDs explícitos.
2. **Dry-run local:** implementar `CLEANUP_DRY_RUN=true` no código, executando os mesmos `SELECT` de
   cutoff e retornando contagens sem `DELETE`; manter a role apenas com SELECT/DELETE, sem novo
   grant, sem endpoint público.
3. **Testes locais:** semear antigos/recentes para todas as 13 tabelas, incluindo:
   - 90 dias, 13 meses, 24 h e 7 dias;
   - lotes com `batchSize=1..N` e `maxBatches` baixo;
   - lock concorrente real;
   - falha no meio do lote e rollback;
   - sessão antiga com filho recente (cenário M-04);
   - banco/role/URL/SSL inválidos.
4. **Dry-run em preview controlado:** com flag e URL no contexto preview, invocar manualmente pela UI
   **Run now** usando `maxBatches` baixo e dry-run; comparar contagens antes/depois; confirmar zero
   DELETE. Não usar cron.
5. **Dados isolados:** usar UUIDs/prefixos exclusivos e timestamps antigos; nunca reutilizar os 2
   registros atuais. Se o dry-run apontar candidatos, validar que somente os dados de teste estão na
   lista.
6. **Execução real limitada:** somente após autorização e em alvo de teste, com `batchSize` pequeno,
   `maxBatches` pequeno, deadline total e `run_id`; verificar contagens e logs. Não executar no B1
   atual.
7. **Cron:** só depois de um alvo publicado dedicado, com `CLEANUP_DATABASE_URL` e flag no contexto
   correto; separar execução manual de cron. O preview atual não serve para validar cron.
8. **Rate limiting:** em janela autorizada, testar sequencialmente uma rota Edge e uma Function
   direta com IP controlado, medindo 429 após 120/60 e 60/60, respeitando o atraso de 10 s; não
   gerar flood. Verificar separadamente o IP da chamada Edge→Function e o efeito de paths excluídos.

Sem dry-run, a alternativa é executar `DELETE` em transação e sempre `ROLLBACK` para observar
contagens; isso não concede privilégio extra, mas ainda exige um alvo isolado e autorização.

---

## 10. Pendências que exigem nova autorização

1. Corrigir orçamento/deadline, `maxBatches` e `run_id` do cleanup.
2. Adicionar guarda/teste para cascata de sessão inconsistente.
3. Adicionar testes permanentes de Fase 2/3, timeout, conexão e dry-run.
4. Implementar e testar dry-run local, sem endpoint público e sem privilégio extra.
5. Validar enforcement e IP interno do rate limiting em preview autorizado.
6. Definir alvo de cleanup (manual controlado vs. publicado dedicado) e configurar contexto correto.
7. Não executar limpeza, cron, POST remoto, deploy, promoção, alteração de flags/variáveis,
   migrations/roles/grants ou qualquer DELETE remoto sem autorização.

---

## 11. Classificação final

**2 — Aprovado com pendências.** As duas regras de rate limiting estão no código, no deploy e no
metadado de tráfego reconhecido pela plataforma; a role de cleanup está no menor privilégio e os
testes locais passam. O enforcement real, o runtime da Scheduled Function e a operação automática
continuam não comprovados; há achados altos de orçamento e de contexto, além do risco condicional de
cascata que precisa de guarda e teste antes de qualquer execução real.
