# Fase 5F.3.7 — Testes controlados de runtime B1

Status: **pré-auditoria e testes locais concluídos; testes remotos não executados porque as flags
exigiriam um novo deploy, expressamente não autorizado nesta fase**.
Data/hora: **2026-11-14T20:00:01-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O fluxo local e o ambiente estão corretos, mas a
validação remota integrada não pôde ser executada sem publicar um novo deploy com as flags — e a
autorização atual proíbe qualquer novo deploy.

---

## 1. Resumo executivo

A Etapa B encontrou um bloqueio obrigatório:

- As flags `EDGE_CAPTURE_ENABLED` e `EDGE_ANALYTICS_ENABLED` estão ausentes/desativadas no B1.
- A Netlify aplica variáveis de ambiente de Functions/Edge **no momento do deploy**.
- Alterar variáveis da Netlify exige novo deploy; para Edge Functions a documentação é explícita:
  “Changes to environment variables for edge functions require a build and deploy to take effect.”
- O deploy autorizado `6af7b9adbbe4d110c7592f70` continuará com as flags desativadas até que um novo
  deploy seja criado.
- Nenhuma flag foi alterada. Nenhum deploy foi executado. Nenhum POST remoto foi feito.

---

## 2. Identidade e estado preservado

### 2.1 Netlify

| Item | Valor |
|---|---|
| Site | `portal-contas-validation-b1` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Conta/Team ID | `697d58587a017c3396fb416e` |
| Plano | Free |
| Visibilidade | Pública (`sso_login=false`) |
| Deploy autorizado | `6af7b9adbbe4d110c7592f70` |
| Contexto | `deploy-preview` |
| Publicado | não (`published_at=null`; `published_deploy=null`) |
| Variáveis B1 | `DATABASE_URL`, `EDGE_INGEST_SECRET` |
| Flags no B1 | ausentes |
| Variáveis compartilhadas | 0 |

### 2.2 Neon

| Item | Valor |
|---|---|
| Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` / `br-misty-sound-b6pnt7iw` |
| Database | `validation_b1` |
| Executor da pré-auditoria | `neondb_owner` |
| Role runtime | `validation_b1_runtime` |
| Migrations | 6 |
| Tabelas de aplicação | 13 (+ `schema_migrations`) |
| Funções/sequences | 0 |
| Dados nas seis tabelas da Fase 4 | 0 |
| SSL da runtime | stream TLS criptografado; certificado par presente |

Privilégios da runtime confirmados: `CONNECT`/`USAGE`; INSERT em `html_events`/`edge_nonces`;
SELECT/INSERT/UPDATE nas tabelas agregadas e contadores; sem DELETE, TRUNCATE, DDL, admin ou acesso
a `neondb`. `analytics_runtime`/`analytics_cleanup` sem privilégios de tabela no B1.

### 2.3 Produção e homologação principal

| Site | Estado |
|---|---|
| Produção | deploy `6af0feebef830ebab5cd25dd`; pública; inalterada |
| Homologação | deploy `6af47527818a48a5dbbef2c4`; privada; inalterada |
| Variáveis de produção | 0; inalteradas |
| Variáveis de homologação | 11; mesmos nomes |
| Variáveis compartilhadas | 0 |

---

## 3. Revisão do código

- `EDGE_CAPTURE_ENABLED` e `EDGE_ANALYTICS_ENABLED` precisam ser exatamente `true` para a Edge
  criar evento.
- `EDGE_INGEST_SECRET` precisa ter pelo menos 32 bytes UTF-8.
- `EDGE_INGEST_KEY_ID` é opcional; default `v1`.
- `ANALYTICS_INGEST_ENABLED` não é usado pelo B1.
- `HTML_CAPTURE_CLEANUP_ENABLED` não é usado pelo B1; não há Scheduled Function.
- `DATABASE_URL` é lido pela Function; a Edge usa apenas a allowlist de variáveis `EDGE_*`.
- A Edge chama `POST /api/capture-html`; a Function valida HMAC-SHA256, timestamp, nonce,
  key ID, corpo e replay.
- Limite de corpo: 8 KiB; timeout e falhas usam fail-open para a resposta da página.
- Nenhum arquivo de código foi alterado.

---

## 4. Testes locais

| Teste | Resultado |
|---|---|
| `npm run test:analytics` | **72/72 pass**; 2 suítes de integração PostgreSQL skipped por falta de `TEST_DATABASE_URL` |
| `npm test` em `validation-b1` | **19/19 pass** |
| `npm run test:browser` | **2/2 pass** |
| `npx netlify-cli build --offline` | build, Function `capture-html` e Edge `html-capture` empacotados |
| Build B1 | 6 arquivos publicados + manifest, 10,0 KiB |

Os testes locais cobrem consentimento, DNT/GPC, HMAC, timestamp, nonce/replay, limite de corpo,
UTF-8, timeout, fail-open, imports e empacotamento.

---

## 5. Etapa B — bloqueio de deploy

Fontes consultadas:

- documentação Netlify de variáveis para Functions: variáveis são aplicadas com os valores do
  momento do deploy; “to apply updated environment variable values, create a new deploy”;
- documentação Netlify de Edge Functions: alterações de variáveis exigem build e deploy;
- CLI Netlify `env:set`: alterações exigem redeploy para entrar em vigor;
- deploy B1 atual: `6af7b9adbbe4d110c7592f70`.

Conclusão: **não é possível ativar as flags no deploy existente sem novo deploy**. Não foi
executado deploy para testar; não foi alterada nenhuma flag.

### Estimativa de créditos

O envelope anterior de um deploy draft era de até **15 créditos**. Como a desativação também exige
novo deploy, o mínimo seguro seria **dois deploys**:

- 1 deploy draft com flags ativas para os testes;
- 1 deploy draft com flags desativadas para restauração.

Estimativa operacional: **até 30 créditos** (2 × 15), sujeita ao comportamento real de cobrança da
Netlify. O valor não foi confirmado por leitura independente de saldo.

---

## 6. Testes remotos

Nenhum teste remoto de captura foi executado.

| Item | Resultado |
|---|---|
| GET remoto | não necessário para o bloqueio |
| POST `/api/capture-html` | não executado |
| Edge → Function | não executado |
| HMAC válido/ inválido | não executado |
| Timestamp/nonce/replay | não executado |
| Consentimento/DNT/GPC remoto | não executado |
| Persistência Neon | não executada |
| Dados sintéticos `v_fase5f_3_7_b1_` | 0 |
| Requests totais | 0 |
| Flags ativadas | 0 |
| Flags restauradas | não aplicável; nenhuma foi alterada |

Como as flags continuam ausentes, o código permanece em modo desativado; qualquer tentativa de
captura seria apenas um teste nulo, não uma validação do fluxo real.

---

## 7. Flags: antes e depois

| Flag | Antes | Depois |
|---|---|---|
| `EDGE_CAPTURE_ENABLED` | ausente | ausente |
| `EDGE_ANALYTICS_ENABLED` | ausente | ausente |
| `ANALYTICS_INGEST_ENABLED` | ausente | ausente |
| `HTML_CAPTURE_CLEANUP_ENABLED` | ausente | ausente |

Nenhuma variável foi criada, alterada ou removida. Não há restauração pendente.

---

## 8. Latência e estabilidade

- Latência Edge/Function/Neon remota: **não medida**, pois não houve teste remoto.
- Build local: não é métrica de runtime.
- Nenhum número foi estimado como se fosse medição real.
- Nenhum cold start foi observado.

---

## 9. Privilégios e isolamento

Consultas somente de leitura no B1 confirmam:

- `current_database() = validation_b1`;
- runtime sem DELETE/TRUNCATE/DDL, sem admin e sem acesso a `neondb`;
- `analytics_runtime`/`analytics_cleanup` sem privilégios de tabela no B1;
- 6 migrations registradas e 13 tabelas de aplicação;
- zero dados em todas as seis tabelas de captura.

Nenhum teste destrutivo remoto foi executado. Os testes negativos de privilégios permanecem os
testes locais da fase 5F.3.5.

---

## 10. Ambientes

- Produção: intacta; deploy `6af0feebef830ebab5cd25dd`.
- Homologação principal: intacta; deploy `6af47527818a48a5dbbef2c4`.
- B1: deploy `6af7b9adbbe4d110c7592f70`; não publicado.
- Nenhum deploy, publicação, promoção, commit, push ou PR.
- Nenhuma alteração em DNS, visibilidade, rate limiting, retenção ou flags.

---

## 11. Pendências e proposta

Para executar os testes remotos é necessária autorização específica para:

1. Criar um **novo deploy draft** com `EDGE_CAPTURE_ENABLED=true` e
   `EDGE_ANALYTICS_ENABLED=true` apenas no contexto do deploy de teste.
2. Executar os testes sintéticos com o prefixo `v_fase5f_3_7_b1_` e o limite de 15 requisições.
3. Desativar as flags e criar um **segundo deploy draft** para que a desativação valha no deploy;
   ou usar um procedimento equivalente aprovado que não deixe deploy acessível com flags ativas.
4. Definir/estimar o consumo de até 30 créditos.
5. Após os testes, manter os registros sintéticos (sem limpeza) e apresentar os resultados.

Nenhuma dessas ações foi executada nesta fase.

---

## 12. Classificação final

**2 — Aprovado com pendências.** A pré-auditoria, os testes locais, o build e o isolamento foram
aprovados; o teste remoto integrado ficou pendente porque exigiria um novo deploy não autorizado.
