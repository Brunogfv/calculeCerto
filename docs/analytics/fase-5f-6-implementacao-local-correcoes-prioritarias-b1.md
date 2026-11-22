# Fase 5F.6 — Implementação local das correções prioritárias B1

Status: **correções P0/P1 implementadas localmente; testes locais aprovados; nenhuma operação
remota executada**.
Data/hora: **2026-11-15T23:00:58-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** As correções estão implementadas e testadas
localmente, mas o rate limiting de plataforma e a retenção agendada exigem validação em deploy e a
role B1 de cleanup ainda não existe no Neon.

---

## 1. Diagnóstico antes das alterações

Confirmado no código e nos ambientes de referência:

- Netlify Free suporta **rate limiting code-based** em Functions e Edge Functions, com até
  **2 regras por projeto**, agregação por IP + domínio, janela configurável e ação block/rewrite.
- Não havia `rateLimit` no `config` da Function nem da Edge.
- O rate limit existente (`edge_rate_limits`, `edge_daily_counters`) é aplicado **depois** de HMAC
  e schema; protege o banco, não a invocação.
- A limpeza existente não tinha batching/advisory lock, cobria apenas a Fase 4 e não estava
  publicada/operacional no B1.
- `visitors`/`sessions` não tinham índice por `last_seen_at`; a limpeza da Fase 2/3 não existia.
- O classificador classificava UA desconhecido + `Accept: text/html` como `likely_human` 55 e não
  reconhecia `ExampleCrawler` como crawler.

Nenhum ambiente remoto foi alterado.

---

## 2. Arquivos criados e modificados

### Criados

- `netlify/functions/_lib/cleanup-retention.mjs`
- `tests/analytics/cleanup-retention.spec.mjs`
- `tests/analytics/rate-limit-config.spec.mjs`
- `database/b1/007-cleanup-retention.sql`
- Relatório desta fase.

### Modificados

- `netlify/functions/capture-html.mjs` — `rateLimit` da Function.
- `netlify/edge-functions/html-capture.js` — `rateLimit` da Edge.
- `netlify/edge-functions/_lib/classifier.mjs` — correções de classificador.
- `netlify/functions/_lib/cleanup-html-capture.mjs` — delega para a retenção completa.
- `package.json` — inclusão dos novos testes.
- `validation-b1/scripts/shared-files.mjs` — manifesto de 16 arquivos.
- `validation-b1/shared-manifest.json` — regenerado.
- Cópias compartilhadas do B1 via `npm run sync:shared`:
  - `validation-b1/netlify/functions/capture-html.mjs`
  - `validation-b1/netlify/functions/cleanup-html-capture.mjs`
  - `validation-b1/netlify/functions/_lib/cleanup-html-capture.mjs`
  - `validation-b1/netlify/functions/_lib/cleanup-retention.mjs`
  - `validation-b1/netlify/edge-functions/html-capture.js`
  - `validation-b1/netlify/edge-functions/_lib/classifier.mjs`
- `validation-b1/tests/b1.spec.mjs` — manifesto 16, rateLimit e cleanup.
- `tests/analytics/classifier.spec.mjs` — novas fixtures.

Nenhum código de consentimento, política de privacidade, migration histórica, role ou configuração
remota foi alterado.

---

## 3. Implementação de proteção contra abuso

### 3.1 Netlify — Function

`netlify/functions/capture-html.mjs`:

```js
export const config = {
    path: '/api/capture-html',
    rateLimit: {
        windowLimit: 60,
        windowSize: 60,
        aggregateBy: ['ip', 'domain']
    }
};
```

A Netlify aplica a regra antes do código da Function. O endpoint direto passa a ter uma barreira de
entrada independente do HMAC.

### 3.2 Netlify — Edge

`netlify/edge-functions/html-capture.js`:

```js
export const config = {
    path: '/*',
    rateLimit: {
        windowLimit: 120,
        windowSize: 60,
        aggregateBy: ['ip', 'domain']
    },
    excludedPath: [ ... ],
    onError: 'bypass'
};
```

A regra da Edge limita pageviews por IP antes da CPU de captura/classificação/assinatura. O limite é
alto para reduzir falsos positivos de usuários legítimos.

### 3.3 Camadas e o que cada uma protege

| Camada | Limite | Protege | Não protege |
|---|---|---|---|
| Netlify Edge | 120/60 s por IP+domínio | CPU/Edge e pageviews em excesso por IP | ataque distribuído, limite global |
| Netlify Function | 60/60 s por IP+domínio | POST direto e invalidações antes da Function | ataque por muitos IPs |
| HMAC/timestamp/nonce | 60 s janela, nonce único | autenticidade, replay, payload | frequência/flood |
| Body limit | 8 KiB | corpo excessivo | requisições pequenas inválidas |
| Banco | 120/300 s por rate key; 25k/dia | volume autenticado/gravação | CPU de invalidações |
| Amostragem | 0.1 final; 1 só em teste | volume de Function/DB | pageviews/Edge |

O HMAC continua obrigatório; o rate limit não o substitui.

---

## 4. Limitações do Netlify Free

- **2 regras code-based por projeto** — usadas uma na Edge e uma na Function.
- **Agregação por IP e domínio**; não há limite global por domínio no Free.
- **Atraso de propagação de até 10 s**; excesso dentro da janela pode passar.
- **NAT compartilhado** pode gerar falso `429`; IP móvel pode evadir.
- **Ataque distribuído** entre muitos IPs continua possível.
- O IP visto pela Function em chamadas internas Edge → Function pode ser da borda, não do
  visitante; isso precisa ser testado em preview.
- Requisições inválidas ainda podem consumir alguma CPU até o limite de plataforma; o risco residual
  é menor, não nulo.

---

## 5. Implementação da retenção

### 5.1 Rotina

`netlify/functions/_lib/cleanup-retention.mjs`:

- valida todos os prazos e o batch antes de conectar;
- adquire `pg_try_advisory_lock(871238)`;
- processa tabelas em ordem;
- faz `DELETE` em lotes de 1.000 (configurável até 5.000);
- usa até 100 lotes por tabela por execução;
- cada lote tem transação e `statement_timeout=30s`/`lock_timeout=5s`;
- em falha, faz `ROLLBACK` do lote e propaga o erro;
- libera o advisory lock no `finally`;
- retorna apenas contagens, lotes, truncamento e duração, sem PII.

A limpeza existente (`_lib/cleanup-html-capture.mjs`) agora delega para essa rotina. A função
agendada `cleanup-html-capture.mjs` continua com cron `15 3 * * *` e flag
`HTML_CAPTURE_CLEANUP_ENABLED`; agora ela cobre Fases 2, 3 e 4.

### 5.2 Prazos aplicados

| Tabela | Prazo padrão |
|---|---|
| `affiliate_clicks` | 90 dias |
| `events` | 90 dias |
| `pageviews` | 90 dias |
| `sessions` | 13 meses |
| `visitors` | 13 meses, sem sessão remanescente |
| `ingest_events` | 90 dias |
| `rate_limits` | 24 h |
| `html_events` | 7 dias |
| `html_traffic_daily` | 90 dias |
| `html_indicators_monthly` | 13 meses |
| `edge_daily_counters` | 90 dias |
| `edge_nonces` | 24 h |
| `edge_rate_limits` | 24 h |

Os prazos da Fase 2/3 são proposta desta implementação e exigem confirmação de produto/privacidade
antes de ativação remota. Não são uma conclusão jurídica.

### 5.3 Ordem e integridade

A ordem é `affiliate_clicks` → `events` → `pageviews` → `sessions` → `visitors` →
`ingest_events` → `rate_limits` → tabelas da Fase 4. A exclusão de `visitors` exige
`NOT EXISTS` de sessão remanescente. As FKs e cascatas foram consideradas; a rotina não usa
`TRUNCATE` nem DDL.

### 5.4 SQL preparado para a role B1

`database/b1/007-cleanup-retention.sql` prepara, sem executar:

- `GRANT CONNECT`/`USAGE` para `validation_b1_cleanup`;
- `SELECT, DELETE` nas 13 tabelas de retenção;
- `REVOKE CREATE` no schema/database;
- índices `sessions_last_seen_at_idx` e `visitors_last_seen_at_idx`.

A role `analytics_cleanup` existente não foi alterada. A role nova deve ser criada em etapa futura
com senha no gerenciador de segredos; nenhuma senha está no SQL.

### 5.5 Operação no B1

O B1 é um deploy preview; **cron de Scheduled Function não executa em preview**. Mesmo com a função
agora incluída no código do B1, a retenção automática exige um alvo publicado ou execução manual
controlada. A flag permanece `false`; nada foi executado.

---

## 6. Correções do classificador

- `likely_human` agora exige `accept_html` e evidência de navegação/contexto forte:
  `fetch_navigate`/`fetch_document`, ou `client_hints` + `language_present`.
- UA desconhecido com apenas `Accept` passa a `unknown`.
- Crawler genérico é detectado por token terminado em `bot`, `crawler` ou `spider`, sem exigir borda
  de palavra; `ExampleCrawler/1.0` passa a `likely_bot`.
- Classes, `unknown`, `confidence` como faixa de evidência e não bloqueio automático preservados.
- Novas fixtures: Bingbot, UptimeRobot, crawler genérico, UA ausente, UA falsificado, UA
  desconhecido, headers conflitantes e evidência insuficiente.

Não há validação em tráfego real; a matriz é local.

---

## 7. Migrations e compatibilidade

- Nenhuma migration histórica foi alterada.
- Nenhuma migration foi aplicada remotely.
- O SQL preparado é B1-específico e não foi executado.
- A rotina é compatível com PostgreSQL 17 local (testada em 17.11).
- Não há dependência de serviço pago.
- O build B1 empacota `capture-html` e `cleanup-html-capture`; a Edge continua `html-capture`.

---

## 8. Testes executados

| Suíte | Resultado |
|---|---|
| `npm run test:analytics` | **84/84 pass** (72 originais + 12 novos) |
| `npm test` em `validation-b1` | **19/19 pass** |
| `npm run test:browser` | **2/2 pass** |
| `npx netlify-cli build --offline` | build, 2 Functions e 1 Edge empacotados |
| Teste real de retenção em PostgreSQL 17 local | old removido; recent preservado; advisory lock bloqueou concorrente |
| Integração PostgreSQL do suite | **2 skipped** por ausência de `TEST_DATABASE_URL` (`capture.integration` e `collect.integration`) |

Testes novos cobrem: cutoff inválido, lock ocupado, batching, ordem, allowlist, rollback de lote,
ausência de PII no retorno, rateLimit configurado nas duas camadas, correções de classificador.
Não há teste local que reproduza a aplicação de rate limit pela plataforma Netlify; isso só pode
ser validado em deploy preview.

O teste real de retenção usou instância PostgreSQL 17 local isolada, sem Neon. Ele não substitui os
dois testes de integração skipped.

---

## 9. Riscos ainda não resolvidos

1. Rate limiting de plataforma não foi validado em deploy real; o comportamento de IP interno
   Edge → Function e o atraso de 10 s permanecem hipóteses a testar.
2. Ataque distribuído por muitos IPs continua possível no Free.
3. A retenção automática não roda em preview; B1 precisa de execução manual ou alvo publicado.
4. A role `validation_b1_cleanup` e os grants/índices ainda não existem no Neon.
5. Prazos da Fase 2/3 precisam de aprovação de produto/privacidade.
6. O classificador não foi validado em tráfego real.
7. Consentimento e observabilidade avançada permanecem pendentes; não foram ampliados.
8. Os 2 registros sintéticos existentes não foram removidos.

---

## 10. Operações remotas necessárias para futura homologação

- Autorizar deploy preview do código alterado.
- Validar as duas regras de rate limit no deploy log e em testes controlados (incluindo IP interno).
- Criar a role B1 de cleanup e aplicar o SQL preparado (após autorização).
- Aplicar índices de retenção.
- Configurar `CLEANUP_DATABASE_URL`/flag e definir execução manual ou alvo publicado.
- Executar cleanup local/controlado primeiro; depois autorizar execução no B1.
- Validar cleanup, logs e preservação de recentes.
- Definir rate limiting/observabilidade de produção em etapa separada.

Nenhuma dessas operações foi executada.

---

## 11. Estimativa de créditos para validação posterior

- Não houve deploy nem consumo nesta fase.
- Saldo mais recente conhecido: **140,0759** (fonte da auditoria); plano Free 300.
- Deploys draft anteriores mediram **0 crédito** cada; ainda assim, reservar até **30 créditos**
  para até 2 deploys de validação e testes de rate limit/cleanup é prudente.
- Web requests são cobrados por volume (10.000 = 2 créditos); o teste deve ser curto e controlado.
- Nenhum upgrade ou compra recomendado.

---

## 12. Classificação final

**2 — Aprovado com pendências.** As correções P0/P1 estão implementadas localmente e os testes
locais passam, incluindo retenção em PostgreSQL 17 e matriz do classificador. A validação de
plataforma, a role B1 de cleanup e a retenção agendada dependem de autorização e deploy controlado.

Nenhuma operação remota, deploy, POST, alteração de flags/variáveis, role, grant, migration ou
limpeza foi executada.
