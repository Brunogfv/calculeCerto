# Fase 4 - Implementação local

Status: **implementada e testada localmente; não publicada e não ativada**. Branch `feat/portal-analytics`. Sem push, PR, deploy, migração de produção ou ativação de coleta.

## Escopo entregue

- Edge Function `html-capture` em `netlify/edge-functions/html-capture.js`.
- Ingestão interna `capture-html` em `netlify/functions/capture-html.mjs`.
- Classificador compartilhado em `netlify/edge-functions/_lib/classifier.mjs`.
- Política de consentimento, escopo, cookie e amostragem em `netlify/edge-functions/_lib/capture-policy.mjs`.
- Captura assíncrona e assinatura em `netlify/edge-functions/_lib/edge-capture.mjs`.
- Validação, HMAC, nonce, rate limit e persistência em `netlify/functions/_lib/capture-*`.
- Migrations de teste `003_phase4_html_capture.sql` e `004_phase4_audit_fixes.sql`.
- Limpeza transacional em `netlify/functions/_lib/cleanup-html-capture.mjs` e CLI em `scripts/cleanup-html-capture.mjs`.
- Scheduled Function `netlify/functions/cleanup-html-capture.mjs`, desativada por `HTML_CAPTURE_CLEANUP_ENABLED=false`.
- Ponte de consentimento em `js/analytics.js` (`pca_edge_consent`).
- Testes em `tests/analytics/classifier.spec.mjs`, `capture-policy.spec.mjs`, `capture-edge.spec.mjs`, `capture-performance.spec.mjs` e `capture.integration.spec.mjs`.

## Fluxo

```text
GET HTML público
  -> Edge Function html-capture
       -> context.next() imediatamente
       -> cookie pca_edge_consent + DNT/GPC + escopo + amostragem 10%
       -> classificação local
       -> body assinado com HMAC
       -> context.waitUntil(fetch /api/capture-html)
  -> Function capture-html
       -> HMAC, timestamp, nonce/replay, payload, rate limit e limite diário
       -> html_events + html_traffic_daily + html_indicators_monthly
```

A falha de qualquer etapa de coleta é silenciosa. `onError: "bypass"` e captura de exceções preservam a entrega estática.

## Consentimento

- Cookie first-party `pca_edge_consent`, sem identificador de visitante.
- Valor: `v=2026-11&analytics=1&ads=0`; o edge lê somente analytics.
- Atributos: `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age=15552000`, sem `Domain`.
- Sem cookie válido, versão diferente ou `analytics=0`: nenhum evento de analytics.
- DNT/GPC bloqueiam analytics.
- Criado/atualizado após escolha explícita; recusa/retirada zera a flag.

## Segurança

- HMAC-SHA256 de uma mensagem canônica versionada que inclui `x-pca-edge-key-id`, `x-pca-edge-timestamp`, `x-pca-edge-nonce` e o corpo exato; a assinatura vai em `x-pca-edge-signature`. O status `202` é o único considerado sucesso pelo Edge.
- `request_id` é UUID gerado no edge; `context.requestId` da Netlify não é usado como UUID. O nonce também é UUID independente e assinado no corpo.
- Janela de timestamp de 60 segundos; nonce único e replay retorna `409`.
- Nonce, rate limit, contador diário e persistência rodam na mesma transação; rejeições fazem rollback de todos os contadores.
- `EDGE_INGEST_SECRET` com 32+ bytes, separado do segredo da Fase 2; não existe no navegador.
- Corpo máximo único de 8192 bytes, compartilhado por Edge e Function, rate limit por `rate_key` HMAC (sem IP bruto) e limite diário atômico.
- O módulo Edge lê somente uma allowlist explícita de variáveis (`EDGE_CAPTURE_ENABLED`, `EDGE_ANALYTICS_ENABLED`, `EDGE_INGEST_SECRET`, `EDGE_INGEST_KEY_ID`, `EDGE_ANALYTICS_SAMPLE_RATE`, `EDGE_CAPTURE_TIMEOUT_MS`); `Netlify.env.toObject()` não é usado. `DATABASE_URL`, `CLEANUP_DATABASE_URL`, `MIGRATION_DATABASE_URL` e `RATE_LIMIT_HMAC_SECRET` não chegam ao Edge.
- `EDGE_SECURITY_ENABLED=false` e constraints de banco impedem persistência de `purpose=security`.
- Sem IP completo, User-Agent bruto, cookies de visitante, `visitor_id` ou `session_id`.

## Classificação

Prioridade: `automation` > `preview_or_monitoring` > `likely_bot` > `likely_human` > `unknown`.

A classificação exige pelo menos dois sinais independentes para classes diferentes de `unknown`; `confidence` é um nível de evidência, não probabilidade calibrada. `unknown` é preservado em evidência insuficiente/conflito. As faixas e a matriz de sinais estão em `fase-4-decisoes.md`.

## Retenção

- `html_events`: 7 dias.
- UA bruto: não armazenado.
- IP completo: não persistido.
- Hash HMAC do IP/rate key: até 24 horas em tabela separada.
- `html_traffic_daily`: 90 dias.
- `html_indicators_monthly`: 13 meses.
- `edge_daily_counters`: 90 dias.
- Nonces/rate limits antigos: limpeza em 24 horas.
- A limpeza é transacional, idempotente e limitada às tabelas da Fase 4. A Scheduled Function usa cron `15 3 * * *` (UTC), usa a role `analytics_cleanup` via `CLEANUP_DATABASE_URL` e permanece desativada por `HTML_CAPTURE_CLEANUP_ENABLED=false` até autorização.

## Permissões

- A migration `004` cria grants condicionais para `analytics_runtime` quando a role existe.
- A role de runtime recebe `USAGE` no schema, `CONNECT` no banco e `SELECT/INSERT/UPDATE` apenas nas tabelas da Fase 4.
- A limpeza usa `analytics_cleanup`, não a role de runtime nem o owner.
- Teste de integração executou a ingestão com `analytics_runtime` e a limpeza com `analytics_cleanup`, sem usar o owner como substituto.

## Testes executados

- Playwright: **59/59** (48 anteriores + 11 de consentimento/cookie).
- Analytics backend: **77/77** (28 anteriores + classificador, edge, HMAC, replay, concorrência, retenção, falhas e performance). A contagem atual, incluindo os testes da revisão independente e as suítes de integração condicionais, está em [`fase-5f-1-2-auditoria-independente.md`](fase-5f-1-2-auditoria-independente.md).
- Integração real com PostgreSQL 16 temporário: **17/17** testes de captura, incluindo concorrência de nonce, rate limit, limite diário e role de limpeza.
- Build: **671 arquivos / 18,7 MB**.
- Coletor da Fase 3 com ponte de cookie: **3070 bytes gzip**.
- Microbenchmark local de captura pura: **p95 entre 0,65 ms e 3,37 ms** em execuções locais; não representa o runtime Netlify Edge.
- Testes confirmam rollback de contadores em replay/limite e rollback total da limpeza em falha parcial.

## Correções da auditoria

- C1: UUID gerado para `request_id` e nonce independente; teste com ID ULID da Netlify.
- C2: Scheduled Function oficial da Netlify para limpeza, desligada por flag; testes de agendamento, rollback parcial e execução repetida.
- I1/I2: nonce, rate limit, contador diário e persistência na mesma transação; testes concorrentes reais.
- I3: `context.waitUntil` protegido; teste com exceção no agendador.
- I4: cookie antigo é invalidado quando não há consentimento local válido; teste E2E.
- I5: cliente genérico não é classificado como navegador; sinal `ua_unknown_client`.
- I6: grants condicionais e teste de ingestão com role restrita.
- Timestamp com regex estrita; configuração `security` removida do caminho de ingestão; `purpose=security` bloqueado também no banco.

## Roles e ativação futura da limpeza

- `analytics_runtime`: ingestão; `SELECT/INSERT/UPDATE` nas tabelas da Fase 4, sem `DELETE`; usada por `DATABASE_URL`.
- `analytics_cleanup`: exclusiva de limpeza; `SELECT/DELETE` apenas nas tabelas da Fase 4; sem `INSERT/UPDATE`, sem tabelas das Fases 2/3 e sem DDL; usada por `CLEANUP_DATABASE_URL`.
- Owner: cria migrations, roles e grants; não é usada pelas Functions.

Ativação:

1. Criar as roles `analytics_runtime` e `analytics_cleanup` fora do repositório, com senhas no gerenciador de segredos, antes das migrations `004`/`005`.
2. Aplicar migrations `001` a `005` com a role owner.
3. Configurar `DATABASE_URL` com `analytics_runtime` e `CLEANUP_DATABASE_URL` com `analytics_cleanup`.
4. Configurar `HTML_CAPTURE_CLEANUP_ENABLED=true` somente no deploy de homologação/produção autorizado.
5. O cron `15 3 * * *` roda em UTC e só é agendado em published deploy; previews não executam o cron.
6. Monitorar os logs `html-capture-cleanup status=ok/error` e configurar alerta da Netlify para falhas.

## Homologação

O procedimento completo de homologação isolada está em [`fase-4-homologacao.md`](fase-4-homologacao.md).

## Limitações e pendências

- A Edge Function não foi executada no runtime real da Netlify nesta etapa; os módulos puros e o handler foram testados localmente.
- **Projeto privado não é alcançável por requisição não autenticada.** A chamada `fetch()` da Edge para `/api/capture-html` usa `credentials: 'omit'` e, portanto, não passa pela proteção de login/SSO da homologação privada. Não há bypass interno documentado. O assunto está detalhado em [`fase-5f-1-1-investigacao.md`](fase-5f-1-1-investigacao.md).
- O timeout padrão de envio passou a 2000 ms (configurável entre 250 e 5000 ms) por causa da distância entre a Function `cmh` e o Neon `aws-sa-east-1`; o valor ainda não foi validado no runtime real.
- Não há deploy, preview remoto, migração de produção ou ativação.
- Não há dashboard nem relatório; requisições HTML não são visitantes únicos.
- Segurança permanece desligada até validação jurídica/DPO, atualização da política e lacuna documentada nos controles existentes.
- A primeira navegação que cria o cookie não é capturada; a captura ocorre nas requisições HTML seguintes.
- A amostragem de 10% produz estimativas; não há calibração estatística de confiança nem de audiência.
- UA/client hints e ausência de reputação de IP/TLS limitam a detecção de automação.

## Próximo passo

Aguardar validação da Fase 4 e da investigação 5F.1.1. Não iniciar a Fase 5F.2 sem autorização explícita.
