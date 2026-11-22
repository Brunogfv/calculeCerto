# Fase 5F.5 — Plano de correções dos achados da auditoria B1

Status: **investigação local concluída; nenhuma correção, deploy, escrita remota, alteração de
flags/roles/migrations ou limpeza executada**.
Data/hora: **2026-11-15T21:55:46-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação do plano: 2 — Aprovado com pendências.** Há soluções viáveis no plano Free para
mitigar os achados altos, mas elas exigem implementação, testes, autorização e uma decisão sobre
limites residuais. Nenhuma correção foi implementada.

---

## 1. Resumo executivo

Os dois achados altos da Fase 5F.4 não são falhas do fluxo de captura em si; são lacunas de
**proteção de entrada** e de **operação de retenção**.

- A Netlify Free **oferece rate limiting code-based** em Functions e Edge Functions. Isso permite
  bloquear requisições antes da execução do código da Function/Edge, com até 2 regras por projeto,
  agregação por IP/domínio e atraso de propagação de até 10 s.
- O rate limit existente em `edge_rate_limits`/`edge_daily_counters` continua sendo a proteção do
  banco depois da autenticação HMAC; ele não substitui o limite de entrada.
- A retenção está descrita no código, mas não está operacional no B1: a função de cleanup não está
  publicada no B1, o cron não roda em deploy preview, a flag está desligada, não existe role B1
  dedicada e a Fase 2/3 não possui política de retenção.
- O cookie de consentimento continua sendo uma preferência do cliente, não prova criptográfica.
- O classificador precisa de fixtures e validação em tráfego controlado; não foi validado em
  tráfego real.
- O saldo recente é 140,0759 créditos; não há cobrança automática/cartão. Nenhum custo foi gerado
  nesta fase.

**Recomendação principal:** combinar rate limiting code-based da Netlify (Edge e Function) com
HMAC/nonce existentes, rate limits no banco, retenção operacional em bateladas e observabilidade
sem PII. Não usar Blobs como contador exato nem contratar serviço externo neste momento.

---

## 2. Achados da Fase 5F.4 e situação atual

| Achado | Gravidade | Situação confirmada |
|---|---|---|
| F-01 sem proteção antes da Function | Alta | `traffic_rules_config_per_scope={}`; sem `rateLimit` no código; Function recebe HMAC inválido e só limita depois do HMAC |
| F-02 retenção não operacional | Alta | B1 sem cleanup function/cron/flag/role B1; Fase 2/3 sem política |
| F-03 classificador sem tráfego real | Média | Apenas fixtures locais; casos `likely_human` 55 e crawler genérico `unknown` |
| F-04 observabilidade/latência | Média | Sem p95/p99; logs de runtime não consultados; poucas medições |
| F-05 consentimento controlado pelo cliente | Média | Cookie não assinado; Edge aceita o valor |
| F-06 cleanup sem batching / Fase 2/3 | Média | `DELETE` sem `LIMIT`; Fase 2/3 fora do cleanup |
| F-07 fail-open com diagnóstico limitado | Baixa | Página preservada; erros pouco visíveis |
| F-08 registros sintéticos retidos | Baixa | 2 linhas; limpeza não autorizada |

Estado atual confirmado por leitura:

- B1: deploy 2 `6afa50e666410b01eb5a0589`, `deploy-preview`, `ready`, não publicado.
- Flags: captura/analytics `false`; amostra `0.1`; cleanup `false`.
- Neon: 6 migrations, 13 tabelas de aplicação, 2 `html_events`, 2 nonces, 2 rate limits,
  1 contador diário, 1 agregado diário e 1 mensal.
- Runtime: sem DELETE/TRUNCATE/DDL, sem acesso a `neondb`, sem memberships.
- Créditos: 140,0759 disponíveis; sem cartão; auto top-up desativado.
- Produção e homologação principal: deploys e visibilidade inalterados.

---

## 3. Diagnóstico dos dois achados altos

### 3.1 Caminho e custo antes da HMAC

```text
GET página
  → Edge html-capture
     → context.next() entrega HTML
     → flags/escopo/DNT/GPC/consentimento/amostragem
     → classificação, HMAC do IP, payload, assinatura
     → waitUntil(fetch /api/capture-html)

POST direto /api/capture-html
  → Function capture-html
     → flags/segredo/método/key-id/timestamp
     → leitura do corpo e limite de 8 KiB
     → HMAC-SHA256 e comparação
     → schema/JSON/nonce
     → Neon (somente após HMAC e schema)
```

Recursos consumidos antes da HMAC:

- invocação da Function;
- leitura de headers e corpo;
- CPU de verificação de método/key ID/timestamp/tamanho;
- web request e compute da Function;
- no caso da Edge, invocação da Edge e CPU de classificação/assinatura.

Requisições inválidas **não chegam ao Neon** hoje, mas podem consumir Function/CPU/web requests.
O `edge_rate_limits` e o `edge_daily_counters` são aplicados depois de HMAC e schema; portanto,
protegem o banco, não a invocação.

### 3.2 Por que IP/UA não resolvem sozinhos

- HMAC autentica o serviço, não o visitante.
- IP pode estar ausente, ser compartilhado (NAT) ou mudar.
- UA é falsificável e não entra na autenticação.
- Um atacante distribuído entre muitos IPs contorna um limite puramente por IP.
- Um limite apenas no banco não impede a Function de ser invocada.

---

## 4. Alternativas comparadas para proteção contra abuso

### A. Rate limiting code-based da Netlify

**Ponto exato:** configuração `rateLimit` no `config` exportado da Edge Function e/ou da Function.
A Netlify aplica a regra antes do código da Function/Edge; o bloqueio retorna `429` ou rewrite.

**Disponibilidade Free:** sim. A documentação informa regras code-based em todos os planos, com
limite de **2 regras por projeto** no Free, agregação por IP + domínio, janela de 1–180 s e ação
block/rewrite. Não há regra global por domínio no Free; isso é Enterprise/HP Edge.

**O que bloqueia:** excesso por IP/domínio; reduz invocações de Function/Edge por um único IP;
pode bloquear antes do código, inclusive POST direto ao endpoint.

**O que não bloqueia:** ataque distribuído por muitos IPs; tráfego abaixo do limite; NAT
compartilhado pode gerar falso `429`; o atraso de propagação pode permitir até 10 s de excesso;
não autentica nem valida HMAC; não substitui rate limit no banco.

**Impacto em usuários:** limite alto na Edge (páginas) e limite específico na Function reduz
falsos positivos; ainda é necessário testar Edge→Function, pois o IP visto pela Function pode ser
o da borda/plataforma, não o do visitante.

**Custo:** incluído no plano Free (2 regras); deploy necessário. Sem serviço externo.

**Complexidade:** baixa/média; duas regras, testes de preview, verificação no deploy log.

### B. Controle de frequência na Edge com estado compartilhado

**Ponto:** handler Edge usando Netlify Blobs, KV ou outro estado compartilhado.

**O que bloqueia:** poderia bloquear por chave antes da Function, se implementado.

**Limitações:** Blobs são key/value com consistência eventual ou forte, mas **last write wins e
sem controle de concorrência atômico**; não são adequados para contador exato de rate limit. O
custo de Blobs consome créditos; a Edge tem orçamento de CPU de 50 ms; maior latência. Um atacante
distribuído ainda contorna chave por IP.

**Recomendação:** não usar como rate limit principal. Pode ser um contador aproximado secundário,
com decisão de produto e testes, mas não é necessário para a primeira mitigação.

### C. Serviço externo gratuito

**Ponto:** CDN/WAF/proxy externo.

**O que bloqueia:** regras globais, geográficas, desafios, WAF; pode cobrir ataques distribuídos.

**Limitações:** exige criar conta, alterar DNS/arquitetura, aceitar termos e disponibilidade de
terceiro; o Free externo pode ter limites e mudanças unilaterais; não foi autorizado criar conta.
Não é necessário para o risco atual do B1, que está desligado.

**Recomendação:** contingência apenas se houver ataque distribuído comprovado; não contratar agora.

### D. Combinação em camadas — recomendada

1. Rate limit code-based na **Function** `/api/capture-html` (protege POST direto e invalidações).
2. Rate limit code-based na **Edge** `/*` com limite alto (protege CPU/edge de páginas).
3. HMAC + timestamp + nonce/replay + body 8 KiB existentes.
4. `edge_rate_limits`/`edge_daily_counters` após HMAC para o volume autenticado.
5. Monitoramento por motivo/status, sem IP/UA bruto.
6. Amostragem 0.1 final; 1 apenas em janela autorizada.

**Limites iniciais sugeridos (a validar em preview, não aplicados):**

| Camada | Regra | Janela | Agregação | Ação |
|---|---:|---:|---|---|
| Edge `/*` | 120 req | 60 s | IP + domínio | `429`/rewrite |
| Function `/api/capture-html` | 30 req | 60 s | IP + domínio | `429` |
| HMAC/nonce | existente | 60 s timestamp | nonce/replay | 401/409 |
| Banco | 120/300 s por rate key; 25k/dia | atual | HMAC rate key | 429 |
| Amostragem | 0.1 | por dia UTC | request ID | descarte |

Os números são hipóteses iniciais; precisam de teste de carga controlado em preview. No Free, a
regra de Function e a de Edge usam 2 regras; não há limite global por domínio. O risco distribuído
permanece e deve ser aceito/documentado ou tratado fora do Free.

**Justificativa:** HMAC continua sendo autenticação; rate limit é frequência; a combinação reduz
custo de invalidações e mantém o banco protegido, sem prometer bloqueio global no Free.

---

## 5. Plano de retenção completo

### 5.1 Matriz de tabelas

| Tabela | Conteúdo | Retenção proposta | Mecanismo atual | Operacional? | Risco |
|---|---|---|---|---|---|
| `visitors` | id opaco, primeira/última atividade | 13 meses (a aprovar) | nenhum | não | crescimento ilimitado |
| `sessions` | atribuição, dispositivo, UA bruto, país/região/cidade | 13 meses (a aprovar) | nenhum | não | PII/armazenamento |
| `pageviews` | path/título/referrer/data | 90 dias (a aprovar) | nenhum | não | volume |
| `events` | eventos/metadata | 90 dias (a aprovar) | nenhum | não | volume |
| `affiliate_clicks` | produto/categoria/slot | 90 dias (a aprovar) | nenhum | não | volume |
| `ingest_events` | deduplicação de event_id | 90 dias (a aprovar) | nenhum | não | replay após janela |
| `rate_limits` | HMAC de identificador | 24 h | `cleanup-rate-limits` | não no B1 | crescimento |
| `html_events` | evento HTML bruto sanitizado | 7 dias | `cleanup-html-capture` | não no B1 | volume |
| `html_traffic_daily` | agregado diário | 90 dias | `cleanup-html-capture` | não no B1 | volume |
| `html_indicators_monthly` | indicador mensal | 13 meses | `cleanup-html-capture` | não no B1 | volume |
| `edge_daily_counters` | contador diário | 90 dias | `cleanup-html-capture` | não no B1 | volume |
| `edge_nonces` | nonce/replay | 24 h | `cleanup-html-capture` | não no B1 | replay após janela |
| `edge_rate_limits` | rate key HMAC | 24 h | `cleanup-html-capture` | não no B1 | crescimento |

### 5.2 Por que não está operacional

- O deploy B1 contém apenas `capture-html`; não há `cleanup-html-capture` publicado.
- `function_schedules=[]` no B1; **Scheduled Functions não executam em deploy preview**; o cron
  `15 3 * * *` só existe no deploy publicado correspondente.
- `HTML_CAPTURE_CLEANUP_ENABLED=false`.
- Não há `CLEANUP_DATABASE_URL` no B1.
- Não há role exclusiva `validation_b1_cleanup`; a `analytics_cleanup` herdada não recebeu grants
  no B1 após 5F.3.6.
- `cleanup-rate-limits` não é Scheduled Function no B1 e a migration 005 não concede DELETE em
  `rate_limits` para `analytics_cleanup`.
- Fase 2/3 não tem rotina de retenção.

### 5.3 Estratégia proposta

1. **Role B1 exclusiva de cleanup** (`validation_b1_cleanup`, nome a aprovar), com `CONNECT`,
   `USAGE` e `SELECT/DELETE` apenas nas tabelas retidas; sem INSERT/UPDATE/TRUNCATE/DDL. Não usar
   `analytics_cleanup` herdada nem a runtime.
2. **Função de cleanup própria do B1** (ou extensão da `cleanup-html-capture`), com cron em deploy
   de teste publicado ou execução manual controlada em preview. Preview não executa cron; a
   limpeza contínua exige um alvo publicado ou agendador externo autorizado.
3. **Batching por tabela:** `DELETE` em lotes de 1.000–5.000 linhas, transação por lote,
   `statement_timeout` e limite de duração total. Não usar `DELETE` único sem `LIMIT`.
4. **Advisory lock** (`pg_advisory_xact_lock`) para impedir duas limpezas concorrentes.
5. **Cutoffs fixos e validados:** 7/90/13 meses/24 h; valores negativos/inválidos abortam; testes
   de preservação de registros recentes.
6. **Ordem Fase 2/3:** `affiliate_clicks` → `events` → `pageviews` → `sessions` (13 meses) →
   `visitors` sem sessões recentes → `ingest_events`; `rate_limits` separado. Avaliar cascatas FKs
   antes de executar.
7. **Índices:** adicionar índice para `sessions.last_seen_at`/`visitors.last_seen_at` se a retenção
   for por esses campos; os demais já possuem índices (`received_at`, `day`, `month`,
   `expires_at`, `window_start`).
8. **Evidência sem PII:** registrar `run_id`, tabela, linhas removidas, cutoff, duração e status;
   nunca valores, path, IP, UA ou IDs de visitante.
9. **Reexecução:** idempotente; falha de lote faz rollback do lote e retry no dia seguinte; sem
   retry ilimitado.
10. **Ativação:** flag própria, janela controlada, logs e autorização; não ativar agora.

---

## 6. Análise de consentimento

### 6.1 Fluxo atual

- `js/analytics.js` mantém `pca_consent_v1` em `localStorage` e o cookie
  `pca_edge_consent=v=2026-11&analytics=1&ads=0` com `Secure; SameSite=Lax; Path=/; Max-Age`.
- A Edge lê o cookie; DNT/GPC bloqueiam; analytics e ads são campos separados.
- Retirada grava `analytics=0&ads=0` e remove o storage.
- O cookie não tem `HttpOnly` (o frontend precisa lê-lo/escrevê-lo) e não é assinado.

### 6.2 O que o cookie prova

Prova que o navegador apresentou aquele valor; **não prova** que a pessoa fez a escolha. Um usuário
ou script pode forjar o cookie. Isso é uma preferência do cliente, não atestação criptográfica.
Para o escopo atual, o risco é aceitável se documentado; para auditoria legal, pode não ser
suficiente.

### 6.3 Alternativas

| Alternativa | Vantagens | Limitações | Recomendação |
|---|---|---|---|
| Manter atual + documentar | Simples, sem deploy de backend, respeita preferência | Forjável; storage/cookie podem divergir | Manter no curto prazo; revisão jurídica |
| Cookie assinado pelo servidor | Dificulta forja casual; versão/prazo verificáveis | Ainda pode ser obtido por quem consente; exige endpoint/segredo; não prova identidade | Só se houver exigência legal; não como “prova” |
| Outro canal (header/localStorage) | Pode reduzir divergência | Edge não lê localStorage; header teria de ser gerado pelo cliente | Não resolve forja; manter cookie |

Não transformar assinatura em prova de consentimento. O objetivo é integridade do sinal, não
autenticação da pessoa. Este ponto exige avaliação de privacidade/jurídica; não há conclusão
jurídica neste relatório.

---

## 7. Melhorias do classificador e observabilidade

### 7.1 Classificador

- Adicionar fixtures permanentes para Googlebot, Bingbot, Slackbot, UptimeRobot, crawler genérico,
  UA ausente, UA falsificado, headers conflitantes e evidência insuficiente.
- Revisar `likely_human` com UA desconhecido + apenas `Accept`: hoje retorna 55; exigir fetch/client
  hints ou rebaixar para `unknown`.
- Revisar detecção de “crawler” sem borda de palavra (`ExampleCrawler` ficou `unknown`).
- Manter `unknown` e `confidence` como faixa de evidência, não probabilidade calibrada.
- Não usar IP/país para classe; não bloquear automaticamente.
- Não declarar validação real; testar em tráfego controlado depois de autorização.

### 7.2 Observabilidade

- Contadores por motivo: `disabled`, `out_of_scope`, `dnt_gpc`, `sem_consentimento`,
  `fora_da_amostra`, `sem_segredo`, `payload_grande`, `erro_captura`, `invalid_signature`,
  `invalid_timestamp`, `invalid_edge_credentials`, `replay`, `rate_limited`, `daily_cap`,
  `capture_unavailable`.
- Latência por etapa: Edge, POST, Function, DB; apenas agregados, sem path/IP/UA.
- Status HTTP e falhas de conexão; timeout; `waitUntil` rejeitado.
- Nunca logar assinatura, segredo, corpo, connection string, IP bruto ou UA bruto.
- Expor relatório simples por deploy/ambiente; alertas para aumento de 401/413/409/429/503.

---

## 8. Matriz de riscos e prioridades

| ID | Risco | Gravidade | Prioridade | Tratamento |
|---|---|---|---|---|
| R-01 | Flood de Function inválida | Alta | P0 antes de exposição | Rate limit code-based Function/Edge |
| R-02 | Retenção não operacional | Alta | P0 antes de operação contínua | Role/função/batches/agendador |
| R-03 | Fase 2/3 sem retenção | Alta/Média | P1 | Política e cleanup separado |
| R-04 | Classificador em tráfego real | Média | P1 | Fixtures + teste controlado |
| R-05 | Observabilidade | Média | P1 | Contadores/latência sem PII |
| R-06 | Cookie forjável | Média | P2 | Documentar/revisão jurídica |
| R-07 | Cleanup sem batching | Média | P1 | Batches + advisory lock |
| R-08 | 2 registros sintéticos | Baixa | P2 | Limpeza autorizada futura |

---

## 9. Arquivos que precisariam ser alterados em uma futura implementação

- `netlify/functions/capture-html.mjs` — `rateLimit` no `config`.
- `validation-b1/netlify/functions/capture-html.mjs` — mesma alteração, se o B1 for o alvo.
- `netlify/edge-functions/html-capture.js` e `validation-b1/netlify/edge-functions/html-capture.js`
  — `rateLimit` de página (limite alto).
- `netlify/functions/_lib/cleanup-html-capture.mjs` — batching, advisory lock, logging.
- `netlify/functions/cleanup-html-capture.mjs` — cron/flag/erros.
- Novo `netlify/functions/cleanup-analytics-data.mjs` (Fases 2/3) ou extensão controlada.
- `validation-b1/netlify/functions/` — incluir cleanup B1, se autorizado.
- `scripts/cleanup-html-capture.mjs` / `scripts/cleanup-rate-limits.mjs` — modo manual/teste.
- Nova migration (não editar 001–006): índice de retenção, role/grants de cleanup, eventual tabela
  de auditoria de limpeza.
- `judge/tests/analytics/*` — fixtures/matriz do classificador.
- `js/analytics.js` e `validation-b1/public/b1-consent.js` — somente se a decisão de consentimento
  exigir mudança.
- `netlify.toml`/`validation-b1/netlify.toml` — se novas Functions/flags forem adicionadas; rate
  limit fica no código, não no TOML.
- Documentação de privacidade/retenção — antes de operação contínua.

Nada foi alterado nesta fase.

---

## 10. Estimativa de esforço e custos

| Frente | Esforço | Custo |
|---|---|---:|
| Rate limit code-based + testes | 1 dia | 0 (Free; 2 regras) |
| Cleanup Fase 4 com batching/lock | 2–3 dias | 0; requer deploy/role |
| Retenção Fase 2/3 | 1–2 dias | 0; requer migration/role |
| Observabilidade sem PII | 1–2 dias | 0; usa Netlify/Neon |
| Classificador fixtures | 0,5–1 dia | 0 |
| Consentimento/documentação | 1–2 dias + revisão jurídica | 0 técnico; jurídico a definir |
| Validação controlada/custos | 1–2 dias | créditos Netlify a medir |

Total técnico estimado: **6–11 dias**, sem serviço pago contratado. Não há conta externa criada.
O custo de Edge/Function/Neon precisa de medição real.

### Cenários de volume (hipóteses)

Fonte de preço: web requests 10.000 = 2 créditos; plano 300/mês; saldo atual 140,0759.
Premissa: todas as pageviews geram web request/Edge; amostragem 10%.

| Cenário | Pageviews/dia | Web requests/mês | Créditos só de web requests | Leitura |
|---|---:|---:|---:|---|
| Baixo | 10.000 | 300.000 | 60 | cabe no Free, com margem limitada |
| Médio | 100.000 | 3.000.000 | 600 | excede os 300 do Free |
| Elevado | 1.000.000 | 30.000.000 | 6.000 | inviável no Free |

Functions compute (1 GB-hour =10 créditos), Edge, Neon e abuso não estão incluídos nessas contas;
são custos a medir. Não recomendar upgrade automaticamente.

---

## 11. Sequência recomendada de implementação e validação

1. **P0 — Rate limit code-based** na Function e Edge, com testes locais e preview; validar
   efetividade, falso `429`, IP interno Edge→Function e deploy log.
2. **P0 — Retenção Fase 4**: role B1 de cleanup, função B1, batches, advisory lock, cutoff e
   logs sem PII; testar localmente com dados sintéticos antigos/recentes.
3. **P1 — Retenção Fase 2/3**: definir prazos, role/grants, função/agendamento e batching;
   testar FKs/cascatas e preservação de recentes.
4. **P1 — Observabilidade**: contadores e latência, sem PII; alertas de 401/413/429/503.
5. **P1 — Classificador**: fixtures e revisão das duas heurísticas apontadas.
6. **P2 — Consentimento**: decisão de produto/jurídico; não implementar assinatura sem essa
   decisão.
7. **Validação final**: preview controlado, limites, retenção, custo e isolamento; só depois
   considerar homologação representativa.

---

## 12. Operações futuras que exigiriam autorização específica

- Alterar código, `config` de rateLimit ou functions.
- Criar role, grants ou migrations.
- Alterar flags/variáveis.
- Fazer deploy (draft ou publicação).
- Executar cleanup ou apagar os 2 registros sintéticos.
- Ativar coleta contínua ou amostragem 1.
- Criar conta/serviço externo ou configurar WAF/CDN.
- Alterar política de privacidade ou consentimento.
- Medir custos/volume com tráfego controlado.

---

## 13. Conclusão

- As soluções propostas **mitigam** o abuso de entrada e **resolvem** a retenção se implementadas e
  testadas, sem alterar migrations canônicas nem roles compartilhadas.
- Há **limitações no Free** que não podem ser eliminadas: limite code-based por IP/domínio, apenas
  2 regras, atraso de até 10 s, sem limite global; ataques distribuídos permanecem possíveis.
- Não é necessário serviço pago para a primeira mitigação. Serviço externo global só se houver
  ataque distribuído comprovado e nova autorização.
- O cookie de consentimento não se torna prova criptográfica; a decisão jurídica permanece.
- O B1 pode continuar como **laboratório isolado** com flags desligadas enquanto as pendências são
  resolvidas. Não deve ser exposto como ambiente representativo até tratar P0/P1.

Nenhuma correção, deploy, migration, role, variável, flag, limpeza ou escrita remota foi executada.
