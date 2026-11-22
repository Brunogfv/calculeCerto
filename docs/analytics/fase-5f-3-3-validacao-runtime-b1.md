# Fase 5F.3.3 — Validação controlada de runtime B1

Status: **pré-verificação e testes locais aprovados; testes remotos não executados por
pré-requisitos ausentes; nenhuma escrita, flag, migration, deploy ou limpeza realizada**.
Data/hora: **2026-11-14T19:15:53-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O ambiente e os testes locais passaram, mas o fluxo
remoto Edge → Function → Neon não pôde ser executado sem alterações expressamente proibidas nesta
fase: ativar flags, aplicar migrations/criar tabelas e configurar rate limiting.

---

## 1. Escopo e limites respeitados

- Site: `portal-contas-validation-b1` / `9cd7034f-5691-46af-8030-d70f7ed52ca7`.
- Deploy existente: `6af7b9adbbe4d110c7592f70` (`ready`, `deploy-preview`, `published_at=null`).
- Neon: `square-mountain-69641645`, branch `validation-b1`, banco `validation_b1`, role
  `validation_b1_runtime`.
- Nenhum deploy novo, POST, ativação de flag, migration, alteração de role, rate limit ou variável.
- Nenhuma alteração em produção, homologação principal, DNS ou visibilidade.
- Nenhum commit, push ou PR.
- Nenhum valor secreto foi lido ou impresso.

---

## 2. Etapa A — Pré-verificação

### 2.1 Netlify

| Verificação | Resultado |
|---|---|
| Team ID | `697d58587a017c3396fb416e` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Nome | `portal-contas-validation-b1` |
| Plano | Free |
| Visibilidade | Pública (`sso_login=false`) |
| Deploy atual | `6af7b9adbbe4d110c7592f70` |
| Estado/contexto | `ready` / `deploy-preview` |
| Publicado | não (`published_at=null`; `published_deploy=null`) |
| Deploys posteriores | nenhum; apenas o deploy autorizado |
| Variáveis B1 | exatamente `DATABASE_URL` e `EDGE_INGEST_SECRET`, ambas site-specific/secret |
| Valores das variáveis | não lidos; apontamento exclusivo para `validation_b1` e segredo B1 registrado na fase 5F.3.1C |
| Variáveis compartilhadas | 0 |
| Produção | deploy `6af0feebef830ebab5cd25dd`, pública |
| Homologação | deploy `6af47527818a48a5dbbef2c4`, privada |

### 2.2 Flags

| Flag | Estado no B1 |
|---|---|
| `ANALYTICS_INGEST_ENABLED` | ausente |
| `EDGE_CAPTURE_ENABLED` | ausente |
| `EDGE_ANALYTICS_ENABLED` | ausente |
| `HTML_CAPTURE_CLEANUP_ENABLED` | ausente |

Nenhuma flag foi criada ou alterada. Pelo código, a ausência mantém Edge e Function em modo
desativado.

### 2.3 Neon

| Verificação | Resultado |
|---|---|
| Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` / `br-misty-sound-b6pnt7iw` |
| Database | `validation_b1` |
| Role | `validation_b1_runtime` |
| SSL | stream TLS do cliente criptografado; certificado par presente |
| `current_database()` | `validation_b1` |
| `current_user` | `validation_b1_runtime` |
| Tabelas de usuário | 0 |
| Migrations aplicadas | 0 |
| `CONNECT` em `validation_b1` | sim |
| `CREATE` em `validation_b1` | não |
| `CONNECT` em `neondb` | não |
| `USAGE` em `public` | sim |
| `CREATE` em `public` | não |
| Atributos administrativos | todos `false` |
| Memberships | nenhuma |
| Objetos possuídos | 0 |

A role não tem privilégios de DDL, não é owner e não acessa `neondb`. Não foi possível testar
`DELETE`/`TRUNCATE` em tabelas porque não existe nenhuma tabela no banco.

### 2.4 Código e publicação

| Verificação | Resultado |
|---|---|
| Manifesto compartilhado | 13 arquivos; válido |
| Hashes canônicos/cópia | conferem |
| Deploy | Function `capture-html` e Edge `html-capture` reconhecidas |
| `edge_functions_present` | `true` |
| Segredos em publicação/build | nenhum encontrado |
| `.netlify/state.json` | ausente |
| Build local | B1 offline concluído, sem novo deploy |

---

## 3. Etapa B — Testes locais

| Comando | Resultado |
|---|---|
| `npm run test:analytics` | **72/72 pass** |
| Suítes de integração PostgreSQL | **2 skipped** por ausência de `TEST_DATABASE_URL` (`capture.integration` e `collect.integration`) |
| `npm test` em `validation-b1` | **19/19 pass** |
| `npm run test:browser` | **2/2 pass** (consentimento, recusar/retirar e DNT/GPC) |
| `npx netlify-cli build --offline` | build, Function e Edge concluídos |

Os testes locais cobrem canonicalização HMAC, key ID, timestamp, nonce/replay, payload válido e
inválido, limite de tamanho/UTF-8, consentimento, DNT/GPC, timeout, fail-open, tratamento de erros e
imports. As integrações que exigem PostgreSQL real ficaram skipped.

---

## 4. Etapa C — Testes remotos: não executados

Antes de qualquer requisição remota de captura, foram verificados os pré-requisitos. Eles não estão
disponíveis sem alterações proibidas nesta fase.

### C1. Edge Function

**Não executado.** As flags `EDGE_CAPTURE_ENABLED` e `EDGE_ANALYTICS_ENABLED` estão ausentes. Pelo
código, a Edge retorna antes de validar consentimento, HMAC ou enviar à Function. Ativar as flags
seria alteração de configuração; a fase proíbe alteração de variáveis e exige interrupção para
proposta.

### C2. Edge → Function

**Não executado.** Depende das mesmas flags. Não foi enviado POST para `/api/capture-html`.

### C3. HMAC e replay remotos

**Não executado.** Os testes locais de HMAC/replay passaram, mas a validação remota exige flags
ativas e uma Function que consiga persistir. Não foi enviada assinatura real pela rede.

### C4. Banco Neon B1

**Não executado.** O banco `validation_b1` tem **0 tabelas**. A Function grava em tabelas como
`edge_nonces`, `edge_rate_limits`, `edge_daily_counters`, `html_events`, `html_traffic_daily` e
`html_indicators_monthly`, que não existem. Aplicar migrations/criar tabelas ou conceder privilégios
de tabela está expressamente proibido nesta fase.

### C5. Rate limiting

**Parado conforme a instrução.** A configuração efetiva do Netlify está vazia:

```text
traffic_rules_config_per_scope = {}
```

Não há endpoint/API de rate limiting disponível no cliente Netlify consultado, e a conta é Free.
No código, o rate limiting da Function depende de tabelas que ainda não existem. Portanto não há
regra efetiva e segura para testar; nenhuma regra foi criada ou alterada.

---

## 5. Dados sintéticos, logs e latência

| Item | Resultado |
|---|---|
| Registros `v_fase5f33_` | 0 |
| Tabelas com dados | nenhuma |
| Escritas no Neon | nenhuma |
| POST de captura | nenhum |
| Logs de runtime | não consultados; CLI exige projeto vinculado e nenhum `netlify link` foi executado |
| Latência Edge/Function/Neon | não medida; sem teste remoto executado |
| Cold start | não observado |
| Consumo de créditos | não medido nesta fase |
| Limpeza | não necessária; não há registros |

Nenhuma métrica foi inferida ou inventada.

---

## 6. Estado das flags e isolamento

| Item | Estado |
|---|---|
| `ANALYTICS_INGEST_ENABLED` | ausente/desativada |
| `EDGE_CAPTURE_ENABLED` | ausente/desativada |
| `EDGE_ANALYTICS_ENABLED` | ausente/desativada |
| `HTML_CAPTURE_CLEANUP_ENABLED` | ausente/desativada |
| Produção | intacta; deploy `6af0feebef830ebab5cd25dd`; pública |
| Homologação | intacta; deploy `6af47527818a48a5dbbef2c4`; privada |
| Variáveis de produção/homologação | inalteradas |
| B1 | deploy draft existente; sem publicação |
| Neon B1 | sem migrations e sem dados |
| Segredos | nenhum exibido ou exposto |

---

## 7. Pendências e proposta para a próxima autorização

Para executar a validação remota completa é necessário autorizar, em etapa separada:

1. **Migrations no B1:** aplicar as migrations necessárias em `validation_b1` usando
   `neondb_owner`, sem tocar em produção/homologação, e conceder à `validation_b1_runtime` apenas
   os privilégios de tabela/sequência exigidos pelo collector.
2. **Janela de flags:** definir autorização temporária e explícita para
   `EDGE_CAPTURE_ENABLED=true`, `EDGE_ANALYTICS_ENABLED=true`, taxa de amostragem, limites diários e
   janela de reversão imediata.
3. **Logs:** autorizar uma forma de consulta de logs de Function/Edge sem vincular o projeto
   permanentemente, ou aceitar a ausência de logs remotos.
4. **Rate limiting:** como não há regra Netlify efetiva, decidir se o rate limit de aplicação no
   banco será suficiente após as migrations ou se será necessária uma regra de plataforma/plano
   superior.
5. **Testes sintéticos:** após 1–4, executar C1–C4 com o prefixo `v_fase5f33_`, um volume mínimo de
   requisições e limpeza somente com autorização específica.

Nenhuma dessas alterações foi executada nesta fase.

---

## 8. Encerramento

A fase termina **sem validação remota de runtime**, sem ativação, sem escrita e sem deploy. O
ambiente permanece isolado e vazio, com as flags desativadas. A próxima etapa depende de autorização
expressa para migrations, janela de flags e tratamento de rate limiting/logs.
