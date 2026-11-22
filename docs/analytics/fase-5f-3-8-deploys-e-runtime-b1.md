# Fase 5F.3.8 — Deploys draft controlados para testes de runtime B1

Status: **pré-auditoria concluída; deploys e testes remotos não executados por falta de autorização
para a variável de amostragem necessária; nenhuma flag, variável, deploy ou crédito foi alterado**.
Data/hora: **2026-11-14T20:00:01-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O ambiente e os testes locais estão aprovados, mas
a validação remota determinística exige uma variável adicional que não está autorizada nesta fase.

---

## 1. Resumo executivo

A Fase 5F.3.8 autorizou dois deploys draft e a ativação temporária de:

- `EDGE_CAPTURE_ENABLED=true`
- `EDGE_ANALYTICS_ENABLED=true`

Entretanto, a auditoria do código mostrou que o valor padrão de
`EDGE_ANALYTICS_SAMPLE_RATE` é **0.1** (`DEFAULT_SAMPLE_RATE = 0.1` em
`capture-policy.mjs`). O fluxo Edge só envia para a Function quando a amostragem aleatória
`request_id_day_v1` seleciona a requisição. Com o limite autorizado de **5 requisições válidas**, a
probabilidade de nenhuma captura ocorrer é alta; não existe garantia de persistência para validar
Edge → Function → Neon.

A fase proíbe alterar `EDGE_ANALYTICS_SAMPLE_RATE` e determina interromper caso a implementação
exija outra variável. Por isso:

- nenhuma flag foi ativada;
- nenhum deploy foi executado;
- nenhum crédito foi consumido;
- nenhum POST remoto foi feito;
- nenhum dado sintético foi gerado.

---

## 2. Verificação financeira

Fonte consultada: `GET /api/v1/bruno-gfv/billing/credits` (somente leitura).

| Item | Valor |
|---|---|
| Plano | Free (`credit-free`) |
| Créditos do plano | 300,00 |
| Créditos usados | 159,6417 |
| Créditos disponíveis | **140,3583** |
| Add-ons | 0 disponíveis / 0 usados |
| Bloco ativo | `QcZkH3ASVxrB8xCe`; 140,3583 disponíveis; expira 2026-11-30 |
| Auto top-up | desativado (`auto_topup_enabled=false`) |
| Cartão/Stripe | nenhum (`has_stripe_payment_method=false`; `/billing/payment_methods` vazio) |
| `auto_pay` do billing | `true`, mas sem método de pagamento e sem auto top-up |
| Período | 2026-10-31 a 2026-11-30 |

O saldo disponível (140,3583) comporta o orçamento de 30 créditos para dois deploys. Nenhum deploy
foi executado, portanto não houve consumo nesta fase.

---

## 3. Identidade e estado atual

| Item | Valor |
|---|---|
| Site | `portal-contas-validation-b1` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Team ID | `697d58587a017c3396fb416e` |
| Deploy atual | `6af7b9adbbe4d110c7592f70` |
| Contexto | `deploy-preview` |
| Estado | `ready` |
| Publicado | não (`published_at=null`; `published_deploy=null`) |
| Build status | `active=0`; nenhum deploy concorrente |
| Variáveis B1 | `DATABASE_URL`, `EDGE_INGEST_SECRET` |
| Flags B1 | ausentes |
| Variáveis compartilhadas | 0 |

### Neon B1

| Item | Valor |
|---|---|
| Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` / `br-misty-sound-b6pnt7iw` |
| Database | `validation_b1` |
| Role runtime | `validation_b1_runtime` |
| Migrations | 6 |
| Tabelas | 13 de aplicação + `schema_migrations` |
| Dados nas seis tabelas da Fase 4 | 0 |
| Runtime | `CONNECT`/`USAGE`; INSERT/SELECT/UPDATE necessários; sem DELETE/TRUNCATE/DDL/admin; sem `neondb` |

---

## 4. Pré-auditoria técnica

Arquivos revisados:

- `validation-b1/netlify.toml`;
- `validation-b1/netlify/edge-functions/`;
- `validation-b1/netlify/functions/`;
- `validation-b1/shared-manifest.json`;
- `database/b1/apply-b1-migrations.mjs`;
- `database/b1/b1-privileges.sql`;
- relatório `docs/analytics/fase-5f-3-7-testes-runtime-b1.md`.

Testes locais executados nesta fase:

| Teste | Resultado |
|---|---|
| `npm run test:analytics` | 72/72 pass; 2 suítes PostgreSQL skipped |
| `npm test` em `validation-b1` | 19/19 pass |
| `npm run test:browser` | 2/2 pass |
| `npx netlify-cli build --offline` | build, Function e Edge empacotados |

O build não contém senhas, tokens, connection strings, HMAC secrets, IDs reais, GA4, AdSense ou
recursos externos. O build B1 gerou 6 arquivos publicados + manifest.

---

## 5. Bloqueio encontrado

### 5.1 Amostragem padrão de 10%

O código:

```text
DEFAULT_SAMPLE_RATE = 0.1
```

A Edge só envia o evento quando `amostrar(requestId, now, taxa)` retorna `true`. O `requestId` é
gerado internamente por `crypto.randomUUID()`, sem controle pelo cliente. Com taxa 0.1:

- uma requisição válida tem 10% de chance de ser enviada;
- 5 requisições válidas têm cerca de 41% de chance de produzir ao menos uma captura;
- não há garantia de persistência no Neon dentro do limite autorizado.

### 5.2 Variável adicional necessária

Para uma validação determinística do fluxo Edge → Function → Neon seria necessário configurar
temporariamente:

```text
EDGE_ANALYTICS_SAMPLE_RATE=1
```

Essa variável está expressamente na lista de “Não alterar” da fase. O limite de 5 requisições
válidas também impede compensar a amostragem com volume.

Não foi alterada nenhuma flag nem a variável de amostragem, e nenhum deploy foi executado.

### 5.3 Identificação sintética

O `request_id` é gerado pela Edge e não pode receber o prefixo
`v_fase5f_3_8_b1_`. Para identificar os dados como sintéticos, o caminho viável seria usar o
`Referer` com host prefixado, que é persistido em `html_events.referrer_host`. Isso não foi
executado. Nenhum registro sintético foi criado.

---

## 6. Flags: antes e depois

| Flag | Antes | Depois | Alteração |
|---|---|---|---|
| `EDGE_CAPTURE_ENABLED` | ausente | ausente | não |
| `EDGE_ANALYTICS_ENABLED` | ausente | ausente | não |
| `ANALYTICS_INGEST_ENABLED` | ausente | ausente | não |
| `HTML_CAPTURE_CLEANUP_ENABLED` | ausente | ausente | não |
| `EDGE_SECURITY_ENABLED` | ausente | ausente | não |

Nenhum deploy foi executado para tornar flags efetivas. Nenhuma restauração é necessária.

---

## 7. Testes remotos

| Item | Resultado |
|---|---|
| Deploy 1 | não executado |
| Deploy 2 | não executado |
| GET remoto | não executado para captura |
| Edge → Function | não executado |
| HMAC/replay/timestamp | não executado |
| Consentimento remoto | não executado |
| Persistência Neon | não executada |
| Dados `v_fase5f_3_8_b1_` | 0 |
| Não conformidades de isolamento | nenhuma (sem execução) |

A ausência de testes remotos não é uma aprovação do runtime; é um bloqueio de autorização por
dependência da variável de amostragem.

---

## 8. Ambientes e créditos

| Item | Estado |
|---|---|
| Produção | intacta; deploy `6af0feebef830ebab5cd25dd`; pública |
| Homologação principal | intacta; deploy `6af47527818a48a5dbbef2c4`; privada |
| B1 | deploy `6af7b9adbbe4d110c7592f70`; não publicado |
| Deploy novo | nenhum |
| Créditos consumidos nesta fase | 0 |
| Saldo disponível após a fase | 140,3583 |
| Limite autorizado | 30 créditos para dois deploys |
| Limpeza | não executada; sem dados |

---

## 9. Proposta de continuidade

Solicitar autorização específica para uma destas opções:

1. **Amostragem controlada:** autorizar temporariamente `EDGE_ANALYTICS_SAMPLE_RATE=1` no site B1,
   além das duas flags já autorizadas, e removê-la no segundo deploy.
2. **Outro método determinístico** aprovado para o teste, sem alterar a variável de amostragem.
3. **Teste parcial:** autorizar explicitamente uma validação com 5 GETs e aceitar que pode não
   haver captura, tratando a fase como 2 — Aprovado com pendências.

A opção 1 é a mais direta e mantém o limite de 5 requisições válidas. Ela exigiria as duas deploys
já autorizadas, com estimativa de até 30 créditos; o saldo atual comporta o orçamento.

---

## 10. Classificação final

**2 — Aprovado com pendências.** A pré-auditoria, os testes locais, o build, os créditos e o
isolamento foram verificados. A validação remota integrada não foi executada porque a amostragem
padrão de 10% impede prova determinística de persistência com o limite de 5 requisições, e a
variável necessária para corrigir isso não foi autorizada.
