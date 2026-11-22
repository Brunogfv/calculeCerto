# Fase 5F.3.9 — Deploys draft e validação determinística de runtime B1

Status: **dois deploys draft concluídos; runtime Edge → Function → Neon B1 validado; flags
desativadas; amostragem restaurada para 0.1; nenhum dado removido**.
Data/hora: **2026-11-15T21:42:39-03:00** (execução concluída; deploys e testes realizados na
sequência).
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 1 — Aprovado.** Dois deploys draft, captura real, HMAC, replay, consentimento,
persistência no B1 e restauração das flags foram comprovados dentro do orçamento.

---

## 1. Identidade e escopo

| Item | Valor |
|---|---|
| Site | `portal-contas-validation-b1` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Team ID | `697d58587a017c3396fb416e` |
| Deploy anterior | `6af7b9adbbe4d110c7592f70` |
| Deploy 1 | `6afa4fa4b15e42516ce00fd9` |
| URL do deploy 1 | `https://6afa4fa4b15e42516ce00fd9--portal-contas-validation-b1.netlify.app` |
| Deploy 2 | `6afa50e666410b01eb5a0589` |
| URL do deploy 2 | `https://6afa50e666410b01eb5a0589--portal-contas-validation-b1.netlify.app` |
| Contexto dos dois | `deploy-preview` |
| Estado dos dois | `ready` |
| Publicados | não (`published_at=null`) |
| Projeto Neon | `square-mountain-69641645` |
| Branch | `validation-b1` |
| Database | `validation_b1` |
| Runtime | `validation_b1_runtime` |

---

## 2. Créditos

Consultas somente leitura em `/bruno-gfv/billing/credits`:

| Momento | Disponível | Usado | Total |
|---|---:|---:|---:|
| Saldo informado anteriormente | 140,3583 | — | 300 |
| Antes do deploy 1 | 140,0961 | 159,9039 | 300 |
| Depois do deploy 1 | 140,0961 | 159,9039 | 300 |
| Antes do deploy 2 | 140,0881 | 159,9119 | 300 |
| Depois do deploy 2 | 140,0881 | 159,9119 | 300 |

- Consumo atribuível ao deploy 1: **0** crédito medido.
- Consumo atribuível ao deploy 2: **0** crédito medido.
- Variação observada na fase: **0,0080** crédito; abaixo do teto de 30.
- Nenhum add-on foi usado.
- Auto top-up desativado; nenhum cartão/payment method cadastrado.
- Plano Free.

Os deploys draft não consumiram créditos de publicação nesta medição.

---

## 3. Configurações temporárias

| Variável | Antes | Durante deploy 1 | Final |
|---|---|---|---|
| `EDGE_CAPTURE_ENABLED` | ausente | `true` | `false` |
| `EDGE_ANALYTICS_ENABLED` | ausente | `true` | `false` |
| `EDGE_ANALYTICS_SAMPLE_RATE` | ausente | `1` | `0.1` |
| `HTML_CAPTURE_CLEANUP_ENABLED` | ausente | `false` | `false` |
| `EDGE_SECURITY_ENABLED` | ausente | ausente | ausente |
| `ANALYTICS_INGEST_ENABLED` | ausente | ausente | ausente |

Não foram alterados `DATABASE_URL`, `EDGE_INGEST_SECRET`, `EDGE_INGEST_KEY_ID` ou
`ALLOWED_ORIGINS`. A amostragem 1 foi aplicada somente ao contexto `deploy-preview` do B1.

Amostragem 1 = 100% das requisições elegíveis; as demais verificações de consentimento, DNT/GPC,
escopo, classificação, assinatura, nonce e limite permaneceram ativas.

---

## 4. Testes locais

| Teste | Resultado |
|---|---|
| `npm run test:analytics` | 72/72 pass; 2 suítes PostgreSQL skipped |
| `npm test` em `validation-b1` | 19/19 pass |
| `npm run test:browser` | 2/2 pass |
| `npx netlify-cli build --offline` | build, Function e Edge empacotados |
| Build B1 | 6 arquivos + manifest; Function `capture-html`; Edge `html-capture` |

Nenhum segredo foi encontrado no build ou nos artefatos publicados.

---

## 5. Testes remotos

### 5.1 GET e consentimento

| Cenário | Status | Capturou? |
|---|---:|---|
| GET básico sem cookie | 200 | não |
| Cookie inválido | 200 | não |
| Analytics recusado + ads aceito | 200 | não |
| DNT ativo + analytics aceito | 200 | não |
| GPC ativo + analytics aceito | 200 | não |
| Analytics aceito (Edge) | 200 | sim, 1 registro |

O consentimento de publicidade não foi confundido com consentimento analytics.

### 5.2 Edge → Function

O GET com consentimento analytics aceito produziu o registro:

```text
request_id: ecd60ff6-c57e-416b-995c-130ade9938b7
path: /
referrer_host: v_fase5f_3_9_b1_edge.example
country_code: BR
traffic_class: likely_human
confidence: 65
sample_rate: 1.0000
```

Esse registro prova o fluxo real Browser → Edge Function → Netlify Function → Neon B1. A Edge usou
o segredo B1 para assinar a chamada e a Function persistiu no database `validation_b1`.

### 5.3 HMAC e replay

| Cenário | Status | Efeito |
|---|---:|---|
| HMAC válido (POST direto à Function) | 202 | 1 registro sintético |
| Replay exato | 409 | sem segunda captura |
| Assinatura/Corpo adulterado + segredo incorreto | 401 | sem escrita |
| Timestamp expirado | 401 | sem escrita |
| Timestamp futuro | 401 | sem escrita |
| Key ID desconhecido | 401 | sem escrita |
| Corpo acima de 8 KB | 413 | sem escrita |
| Método GET na Function | 405 | sem escrita |

O teste de corpo adulterado/segredo incorreto foi combinado em uma única requisição para respeitar
o limite total de 15 requisições; ambos os elementos foram invalidados e a resposta foi 401.

### 5.4 Limite de requisições

- Total de tentativas: **15** (6 GET + 9 POST/GET de Function).
- Capturas válidas: **2** (uma Edge e uma Function direta).
- Nenhuma repetição automática; nenhum crawler, carga ou rajada.
- Um request do harness falhou localmente antes de obter resposta por `Content-Length` manual; foi
  substituído pelo teste combinado 401. Não houve nova execução em massa.

---

## 6. Persistência no Neon B1

Antes dos testes, as seis tabelas estavam vazias. Depois:

| Tabela | Estado |
|---|---|
| `html_events` | 2 registros |
| `edge_nonces` | 2 |
| `edge_rate_limits` | 2 |
| `edge_daily_counters` | 1 linha; `count=2` |
| `html_traffic_daily` | 1 linha; `observed_count=2` |
| `html_indicators_monthly` | 1 linha; `observed_count=2` |

Registros sintéticos:

- Edge: `request_id ecd60ff6-c57e-416b-995c-130ade9938b7`; `referrer_host
  v_fase5f_3_9_b1_edge.example`.
- Function direta: `request_id 11111111-1111-4111-8111-111111111111`; `referrer_host
  v_fase5f_3_9_b1_direct.example`.

Os dois registros têm `path=/`, `country_code=BR`, `traffic_class=likely_human`,
`sample_rate=1.0000`, sem IP bruto, sem valores de calculadora, sem URL com parâmetros pessoais e
sem User-Agent bruto.

O replay não criou terceiro registro em `html_events` nem novo nonce. Não houve limpeza.

---

## 7. Privilégios e isolamento

| Verificação | Resultado |
|---|---|
| `current_database()` | `validation_b1` |
| `current_user` (auditoria) | `neondb_owner` |
| Role runtime em uso | `validation_b1_runtime` |
| Migrations | 6 |
| Tabelas | 13 + `schema_migrations` |
| Runtime `neondb` | sem CONNECT |
| Runtime DELETE | negado |
| Runtime TRUNCATE/DDL | negado |
| Runtime admin/memberships | nenhum |
| `analytics_runtime`/`analytics_cleanup` no B1 | sem privilégios de tabela |
| Dados fora do B1 | nenhum |
| Escrita em `neondb`/branch principal | nenhuma |

As permissões mínimas da Fase 5F.3.6 foram preservadas.

---

## 8. Latência observada

Para os seis testes negativos executados no segundo lote:

| Teste | Tempo aproximado |
|---|---:|
| Corpo adulterado/segredo incorreto | 578 ms |
| Timestamp expirado | 546 ms |
| Timestamp futuro | 191 ms |
| Key ID desconhecido | 194 ms |
| Corpo >8 KB | 192 ms |
| Método GET | 193 ms |

A latência do GET Edge válido e do HMAC válido não foi registrada por uma falha do harness inicial;
não foi inventada. A amostra é pequena e não permite conclusão estatística.

---

## 9. Flags e amostragem finais

| Variável | Valor final |
|---|---|
| `EDGE_CAPTURE_ENABLED` | `false` |
| `EDGE_ANALYTICS_ENABLED` | `false` |
| `EDGE_ANALYTICS_SAMPLE_RATE` | `0.1` |
| `HTML_CAPTURE_CLEANUP_ENABLED` | `false` |
| `EDGE_SECURITY_ENABLED` | ausente |
| `ANALYTICS_INGEST_ENABLED` | ausente |

O deploy 2 foi criado depois da restauração e incorpora os valores finais.

---

## 10. Ambientes preservados

| Item | Estado |
|---|---|
| Produção | deploy `6af0feebef830ebab5cd25dd`; pública; inalterada |
| Homologação principal | deploy `6af47527818a48a5dbbef2c4`; privada; inalterada |
| B1 | deploy 2 `6afa50e666410b01eb5a0589`; draft; não publicado |
| Deploy de produção/promoção | nenhum |
| Variáveis de outros sites | inalteradas |
| Segredos | preservados; nenhum exibido |
| Rate limiting | não alterado |
| Scheduled Function | não executada |
| Limpeza | não executada |
| Dados sintéticos | preservados |

---

## 11. Erros e limitações

1. O primeiro teste de corpo adulterado falhou no cliente por `Content-Length` manual; foi
   substituído por um teste combinado de corpo adulterado + segredo incorreto, com resposta 401.
2. A latência dos primeiros requests não foi registrada; somente o segundo lote tem medições.
3. A identificação sintética foi feita pelo `referrer_host` prefixado, pois o `request_id` da Edge é
   gerado internamente e não aceita prefixo.
4. O teste HMAC/replay válido foi feito por POST direto à Function; o fluxo Edge foi comprovado
   separadamente pelo registro Edge na mesma tabela.
5. Nenhuma conclusão estatística de latência/cold start é feita com esta amostra.

---

## 12. Classificação final

**1 — Aprovado.** Dois deploys draft foram concluídos; Edge, Function, HMAC, replay, consentimento
e persistência foram comprovados; os dados chegaram exclusivamente a `validation_b1`; as flags e a
amostragem foram restauradas; o consumo ficou dentro do limite; produção e homologação principal
permaneceram intactas.
