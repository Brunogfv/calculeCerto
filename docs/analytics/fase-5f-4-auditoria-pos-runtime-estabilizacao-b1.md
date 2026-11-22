# Fase 5F.4 — Auditoria pós-runtime e estabilização B1

Status: **auditoria read-only concluída; nenhum deploy, POST, escrita, limpeza ou alteração de
configuração foi executado**.
Data/hora: **2026-11-15T21:55:46-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O fluxo e o isolamento estão corretos, mas há
achados altos de proteção contra abuso e retenção, além de evidência insuficiente de desempenho,
logs e classificação de bots em tráfego real.

---

## 1. Resumo executivo

- Os dois deploys da fase 5F.3.9 permanecem `ready`, `deploy-preview`, não publicados.
- Flags finais: `EDGE_CAPTURE_ENABLED=false`, `EDGE_ANALYTICS_ENABLED=false`,
  `EDGE_ANALYTICS_SAMPLE_RATE=0.1`, `HTML_CAPTURE_CLEANUP_ENABLED=false`.
- Neon B1: 6 migrations, 13 tabelas de aplicação + `schema_migrations`, 2 registros sintéticos
  em `html_events`. Nenhum dado novo.
- `validation_b1_runtime` mantém privilégios mínimos; `neondb` inacessível; nenhuma membership.
- Produção e homologação principal permanecem com os deploys anteriores.
- Não há rate limit nativo configurado na Netlify.
- A retenção não está operacional no B1: não há Scheduled Function publicada no B1, a flag está
  desligada, não há role de cleanup B1 e a retenção da Fase 2/3 não está coberta.
- O classificador foi exercitado localmente; não há validação com tráfego real de bots.
- A latência real é insuficiente para p95/p99; há apenas medições pontuais da fase anterior.

**Achados altos:** ausência de proteção antes da Function contra tráfego inválido/flood; retenção
não operacional. **Achados médios:** classificação de bots não validada em tráfego real,
observabilidade limitada, cookie de consentimento controlado pelo cliente e cleanup sem batching.

---

## 2. Identidade dos ambientes

| Item | Valor |
|---|---|
| Site | `portal-contas-validation-b1` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Team ID | `697d58587a017c3396fb416e` |
| Plano | Free |
| Deploy 1 | `6afa4fa4b15e42516ce00fd9` |
| Deploy 2 | `6afa50e666410b01eb5a0589` |
| Contexto | `deploy-preview` |
| Publicados | não (`published_at=null`) |
| Projeto Neon | `square-mountain-69641645` |
| Branch | `validation-b1` |
| Database | `validation_b1` |
| Runtime | `validation_b1_runtime` |

---

## 3. Estado inicial e final

### 3.1 Netlify

| Item | Estado |
|---|---|
| Deploy atual | `6afa50e666410b01eb5a0589` |
| Deploy 1 | `6afa4fa4b15e42516ce00fd9` |
| Deploy 2 | `6afa50e666410b01eb5a0589` |
| Deploys posteriores | nenhum |
| `EDGE_CAPTURE_ENABLED` | `false` |
| `EDGE_ANALYTICS_ENABLED` | `false` |
| `EDGE_ANALYTICS_SAMPLE_RATE` | `0.1` |
| `HTML_CAPTURE_CLEANUP_ENABLED` | `false` |
| `EDGE_SECURITY_ENABLED` | ausente |
| `ANALYTICS_INGEST_ENABLED` | ausente |
| `DATABASE_URL`/`EDGE_INGEST_SECRET` | presentes, site-specific, não lidos |
| Rate limit nativo | `traffic_rules_config_per_scope={}` |
| Scheduled Functions no deploy | nenhuma |

### 3.2 Neon

| Item | Estado |
|---|---|
| `current_database()` | `validation_b1` |
| Usuário da consulta | `neondb_owner` |
| Migrations | 6 |
| Tabelas em `public` | 14 (13 de aplicação + `schema_migrations`) |
| Funções/sequences | 0 |
| `html_events` | 2 |
| `edge_nonces` | 2 |
| `edge_rate_limits` | 2 |
| `edge_daily_counters` | 1 linha, `count=2` |
| `html_traffic_daily` | 1 linha, `observed_count=2` |
| `html_indicators_monthly` | 1 linha, `observed_count=2` |
| Dados pessoais/IP bruto | nenhum |
| Limpeza executada | não |

Os dois registros sintéticos são da fase 5F.3.9 (`referrer_host` com prefixo
`v_fase5f_3_9_b1_`), não há registros inesperados.

### 3.3 Produção e homologação principal

| Site | Deploy | Visibilidade |
|---|---|---|
| Produção | `6af0feebef830ebab5cd25dd` | pública |
| Homologação | `6af47527818a48a5dbbef2c4` | privada |

Nenhuma alteração de deploy, variável ou visibilidade foi feita nesta fase.

---

## 4. Classificação de bots

### 4.1 Implementação

`classifier.mjs` usa UA, Accept, Accept-Language, Sec-Fetch-* e client hints. A versão é
`phase4-v1`. A classificação não usa IP, país, nem probabilidade calibrada. O campo `confidence`
é uma faixa heurística (0–95), não uma probabilidade.

### 4.2 Matriz local

| Caso | Classe | Confiança | Evidência principal |
|---|---|---:|---|
| Navegador Chrome comum | `likely_human` | 80 | UA + Accept HTML + fetch + client hints + idioma |
| UA de navegador desconhecido | `likely_human` | 55 | UA browser + Accept HTML, sem fetch |
| Googlebot | `likely_bot` | 70 | UA declarado + ausência de sinais humanos |
| Bingbot | `likely_bot` | 70 | UA declarado + ausência de sinais humanos |
| Slackbot (preview) | `preview_or_monitoring` | 85 | UA preview + ausência de sinais humanos |
| UptimeRobot (monitor) | `preview_or_monitoring` | 85 | UA monitor + ausência de sinais humanos |
| `ExampleCrawler/1.0` | `unknown` | 35 | UA browser desconhecido; “Crawler” não tem borda de palavra |
| `curl/8.0` | `automation` | 85 | UA automation + ausência de sinais humanos |
| Googlebot com headers humanos | `unknown` | 25 | conflito declarado bot × navegação |
| UA ausente | `unknown` | 35 | sem UA |
| HeadlessChrome com headers humanos | `unknown` | 35 | conflito automação × navegação |
| Chrome com UA isolado | `unknown` | 35 | evidência insuficiente |

### 4.3 Avaliação

- UA isolado não define sozinho `likely_human`; há confirmação por Accept/fetch.
- País não é sinal; IP não entra no classificador.
- Previews e monitores são distintos de automação e de busca.
- Googlebot e Bingbot são diferenciados de clientes automatizados.
- Bots conhecidos não bloqueiam a navegação; a classificação é apenas registro.
- **Falso positivo potencial:** UA `Mozilla/5.0` desconhecido + `Accept: text/html` recebe
  `likely_human` 55, apesar de não ter fetch/client hints.
- **Falso negativo potencial:** `ExampleCrawler/1.0` ficou `unknown` porque a busca textual de
  “crawler” exige borda de palavra; não inflou humano, mas não foi rotulado como crawler.
- Não houve teste com tráfego real de bots; a matriz é inteiramente local.

---

## 5. Latência e timeout

| Fonte | Evidência |
|---|---|
| Edge timeout | `DEFAULT_CAPTURE_TIMEOUT_MS=2000`; limite 250–5000 ms |
| Function DB timeout | conexão de 5 s; pool `max=1` |
| `waitUntil` | usado para não bloquear a resposta da página |
| Fase 5F.3.9 — testes negativos | ~190–578 ms em 6 requisições |
| GET/Edge válido | latência não registrada |
| Function HMAC válido | latência não registrada |
| Cold start | não observado |
| p95/p99 | indisponível |
| Logs de runtime | não consultados nesta fase |

O único p95 local é o benchmark de processamento puro (~0,98 ms), que **não** representa a latência
de rede, Function, Neon ou Edge em produção. Não há base para conclusão estatística.

---

## 6. Fail-open

Código e testes locais confirmam:

- `context.next()` é chamado primeiro; a resposta HTML não depende da captura.
- `processarCaptura`/`executarCaptura` capturam erros e não alteram a resposta.
- Falha de `waitUntil` é capturada.
- Falha do coletor/Function não quebra a navegação.
- O sender só considera sucesso `202`; respostas diferentes não geram retry.
- `fetch` usa `AbortSignal.timeout` uma vez; não há tentativas ilimitadas.
- `html-capture.js` usa `onError: 'bypass'`.
- Timeout, HMAC inválido, nonce duplicado, payload inválido e JSON inválido são testados localmente.

Limitação: erros da Edge são absorvidos sem log estruturado acessível; fail-open funciona, mas o
diagnóstico fica limitado.

---

## 7. Proteção contra abuso

### 7.1 Estado atual

| Camada | Estado |
|---|---|
| Netlify nativo | sem regra (`traffic_rules_config_per_scope={}`) |
| Edge → Function | HMAC e timestamp, sem rate limit de entrada |
| Function | rate limit no banco **depois** de validar HMAC |
| `edge_rate_limits` | 120 por 300 s por rate key |
| `edge_daily_counters` | 25.000/dia por default |
| `edge_nonces` | replay por nonce |
| Body | 8 KiB |
| Timeout Edge | 2 s |
| Retry | nenhum |
| Amostragem | 10% final; 100% só durante o teste |

Requisições com HMAC inválido, key ID errado, timestamp inválido ou corpo excessivo chegam à
Function e consomem CPU antes de qualquer limite de banco. HMAC não impede flood/custo de entrada.

### 7.2 Cenários hipotéticos

Premissas: amostragem 10%; uma Function por evento elegível; Edge em cada pageview; nenhum cache;
custos de Function/Edge por invocação não são expostos de forma confiável na API consultada.

| Cenário | Pageviews/dia | Eventos elegíveis/dia | Edge/dia | Function/dia | Retenção bruta ~7d |
|---|---:|---:|---:|---:|---:|
| Baixo | 10.000 | 1.000 | 10.000 | 1.000 | ~7.000 linhas |
| Médio | 100.000 | 10.000 | 100.000 | 10.000 | ~70.000 linhas |
| Elevado | 1.000.000 | 100.000 | 1.000.000 | 100.000 | ~700.000 linhas |

Abuso sem HMAC válido pode gerar até 100, 1.000 ou 10.000 chamadas/min sem produzir linhas, mas
consumindo Function; a proteção de entrada é a lacuna principal.

Nenhum volume foi executado remotamente. Os números são hipóteses, não medições.

---

## 8. Retenção e limpeza

### 8.1 Implementação

`cleanup-html-capture` remove:

- `html_events` com `received_at` mais antigo que 7 dias;
- `html_traffic_daily` mais antigo que 90 dias;
- `html_indicators_monthly` mais antigo que 13 meses;
- `edge_daily_counters` mais antigo que 90 dias;
- `edge_nonces` expirados há mais de 24 h;
- `edge_rate_limits` mais antigos que 24 h.

A função usa uma transação, sem `LIMIT` por tabela, e depende de índices por `received_at`, `day`,
`month`, `expires_at` e `window_start`; os índices existem.

### 8.2 Estado operacional no B1

- O B1 tem apenas `capture-html` publicado; **não há** `cleanup-html-capture` no deploy.
- `HTML_CAPTURE_CLEANUP_ENABLED=false`.
- Não há Scheduled Function no B1 (`function_schedules=[]`).
- Não há role exclusiva `validation_b1_cleanup`; `analytics_cleanup` herdada não tem grants no B1
  após a fase 5F.3.6.
- `CLEANUP_DATABASE_URL` não está configurada no B1.
- A retenção da Fase 2/3 (`sessions`, `pageviews`, `events`, `affiliate_clicks`, `visitors`,
  `ingest_events`) não está coberta.
- `cleanup-rate-limits` remove `rate_limits` (Fase 2), mas não é Scheduled Function no B1 e não
  recebeu grant da migration 005 para `analytics_cleanup`.

**Conclusão:** as regras estão documentadas no código, mas **não estão operacionais** no B1. Não
foram executadas e os 2 registros sintéticos permanecem.

### 8.3 Riscos

- Crescimento de dados brutos e agregados sem expurgo.
- Transação de limpeza sem batching pode ser longa em volume alto.
- Fase 2/3 sem política de retenção explícita.

---

## 9. Privacidade e segurança

| Verificação | Resultado |
|---|---|
| IP bruto persistido | não; schema não tem coluna de IP |
| User-Agent bruto | não; `html_events` guarda família/versão e client hints |
| IP na rate key | HMAC; `edge_rate_limits.bucket_key` é hash |
| Nonce/replay | `edge_nonces` com TTL e PK |
| Consentimento | cookie `pca_edge_consent`; DNT/GPC testados |
| Ads × analytics | separados; `analytics=0&ads=1` não capturou |
| Valores/resultados de calculadora | ausentes dos payloads e das 2 linhas |
| URLs com parâmetros pessoais | path sem query/fragmento; validador rejeita |
| Segredos no build | nenhum |
| Segredos em logs | não observados |
| Headers | CSP, noindex, no-referrer, nosniff, DENY, no-store no B1 |
| HMAC | SHA-256, comparação timing-safe |
| CORS | Function protegida por HMAC; sem CORS explícito |
| Cookie de consentimento | `Secure`, `SameSite=Lax`, sem HttpOnly; escolha controlada pelo cliente |

**Risco técnico/jurídico:** o cookie de consentimento é definido pelo cliente e não é assinado. A
Edge aceita o valor como evidência da escolha; um usuário pode forjar o cookie. Isso não cria
coleta de terceiros, mas enfraquece a trilha de consentimento. Necessita avaliação jurídica e,
se exigido, atestação/registro adicional. Não foi alterado.

---

## 10. Isolamento

| Verificação | Resultado |
|---|---|
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` |
| Database | `validation_b1` |
| Runtime | `validation_b1_runtime` |
| `neondb` | sem CONNECT para runtime |
| Memberships da runtime | 0 |
| DELETE/TRUNCATE/DDL da runtime | negados |
| Grants extras | nenhum |
| `analytics_runtime`/`analytics_cleanup` no B1 | sem privilégios de tabela |
| Variáveis compartilhadas | 0 |
| Credenciais de produção | não usadas |
| Recursos de produção | não acessados |
| Deploys de produção | inalterados |

O isolamento está preservado. As roles herdadas continuam existindo, mas sem acesso às tabelas do
B1.

---

## 11. Custos e viabilidade

Fonte: `/bruno-gfv/billing/credits`, consulta somente leitura.

| Item | Valor |
|---|---|
| Plano | Free |
| Créditos do plano | 300 |
| Usados | 159,9241 |
| Disponíveis | **140,0759** |
| Add-ons | 0 |
| Auto top-up | desativado |
| Cartão/payment method | nenhum |
| Custo medido dos dois deploys draft | 0 |
| Consumo de Edge/Function/Neon por requisição | não exposto de forma confiável na API consultada |

Cenários (hipóteses, não medições):

1. **Baixo:** 10.000 pageviews/dia; 1.000 eventos/dia; 30 mil eventos/mês; retenção bruta ~7 mil
   linhas. Compatível com o volume atual; custo de Function/Edge precisa de medição real.
2. **Médio:** 100.000 pageviews/dia; 10.000 eventos/dia; 300 mil/mês; ~70 mil linhas brutas em 7
   dias. Edge e Function passam a ser relevantes; pode exigir limite de abuso e revisão de custo.
3. **Elevado:** 1.000.000 pageviews/dia; 100.000 eventos/dia; 3 milhões/mês; ~700 mil linhas
   brutas. Risco operacional/custo elevado; não recomendado sem rate limiting e retenção ativa.

A amostragem de 10% reduz Function e gravações em ~90%, mas **não** reduz a chamada da Edge por
pageview. Bots e abuso invalidam a estimativa de volume.

Não foi recomendado upgrade; os custos reais exigem medição.

---

## 12. Testes locais

| Teste | Resultado |
|---|---|
| `npm run test:analytics` | 72/72 pass |
| `npm test` em `validation-b1` | 19/19 pass |
| `npm run test:browser` | 2/2 pass |
| `npx netlify-cli build --offline` | build, Function e Edge empacotados |
| Integrações PostgreSQL | 2 suítes skipped por ausência de `TEST_DATABASE_URL` |

Nenhum código foi alterado para os testes. O build não contém segredos.

---

## 13. Achados classificados

### F-01 — Ausência de proteção antes da Function

- **Gravidade:** Alta.
- **Evidência:** Netlify sem regra; HMAC validado dentro da Function; rate limit depois da
  assinatura; sem WAF/edge limit.
- **Impacto:** flood de HMAC inválido consome Function e pode elevar custo/indisponibilidade.
- **Probabilidade:** média/elevada em ambiente público.
- **Recomendação:** rate limit na borda/plataforma ou token bucket antes da Function; monitorar
  401/403/413 e custo.
- **Exige alteração:** configuração de infraestrutura.
- **Autorização adicional:** sim.

### F-02 — Retenção não operacional no B1

- **Gravidade:** Alta.
- **Evidência:** B1 sem cleanup function, sem cron, flag falsa, sem role de cleanup B1, sem
  `CLEANUP_DATABASE_URL`; Fase 2/3 sem política.
- **Impacto:** acúmulo de dados e risco de privacidade/custo.
- **Probabilidade:** certa se coleta permanecer ativa.
- **Recomendação:** publicar cleanup B1, definir role/procedimento, retenção Fase 2/3 e batching.
- **Exige alteração:** função/configuração/role.
- **Autorização adicional:** sim.

### F-03 — Classificador não validado em tráfego real

- **Gravidade:** Média.
- **Evidência:** matriz local; UA desconhecido com Accept HTML vira `likely_human` 55; crawler
  genérico fica `unknown`.
- **Impacto:** possível inflação ou subconta de humanos/bots.
- **Probabilidade:** média.
- **Recomendação:** validar com tráfego controlado e amostra de UAs; revisar heurísticas sem
  bloquear visitantes.
- **Exige alteração:** código/teste.
- **Autorização adicional:** sim.

### F-04 — Observabilidade e latência insuficientes

- **Gravidade:** Média.
- **Evidência:** sem logs de runtime consultáveis; p95/p99 ausente; latência Edge/Function válida não
  registrada; apenas 6 medições pontuais de rejeição (~190–578 ms).
- **Impacto:** dificuldade de detectar regressão e abuso.
- **Probabilidade:** alta.
- **Recomendação:** habilitar logs/métricas e registrar latência por etapa; medir em janela
  representativa.
- **Exige alteração:** configuração/observabilidade.
- **Autorização adicional:** sim.

### F-05 — Consentimento controlado pelo cliente

- **Gravidade:** Média (técnica/jurídica).
- **Evidência:** `pca_edge_consent` é cookie do navegador, não assinado; Edge confia no valor.
- **Impacto:** trilha de consentimento pode ser forjada; não há atestação.
- **Probabilidade:** média.
- **Recomendação:** avaliar exigência legal de atestação/registro; não alterar sem decisão.
- **Exige alteração:** código/política.
- **Autorização adicional:** sim.

### F-06 — Cleanup sem batching e Fase 2/3 sem retenção

- **Gravidade:** Média.
- **Evidência:** `DELETE` por tabela sem `LIMIT`; Fase 2/3 fora de `cleanup-html-capture`;
  `cleanup-rate-limits` sem grant para `analytics_cleanup`.
- **Impacto:** transação longa e acúmulo de dados das Fases 2/3.
- **Probabilidade:** média com volume.
- **Recomendação:** batching/limite, role separada, política de retenção Fase 2/3.
- **Exige alteração:** código/migrations/configuração.
- **Autorização adicional:** sim.

### F-07 — Fail-open com diagnóstico limitado

- **Gravidade:** Baixa.
- **Evidência:** erros da Edge/Function não alteram a página, mas não há logs estruturados
  disponíveis.
- **Impacto:** falhas de captura podem passar despercebidas; navegação preservada.
- **Probabilidade:** média.
- **Recomendação:** logs/observabilidade sem segredos.
- **Exige alteração:** configuração.
- **Autorização adicional:** sim.

### F-08 — Registros sintéticos retidos

- **Gravidade:** Baixa/operacional.
- **Evidência:** 2 linhas `v_fase5f_3_9_b1_`; nenhuma limpeza autorizada.
- **Impacto:** estado de teste conhecido; não é dado real.
- **Recomendação:** limpar somente com autorização específica.
- **Exige alteração:** dados.
- **Autorização adicional:** sim.

---

## 14. Recomendações priorizadas

1. **Antes de nova homologação representativa:** implementar proteção antes da Function
   (rate limit de borda/WAF ou equivalente) e monitorar custo de inválidos.
2. **Antes de coleta contínua:** tornar a retenção operacional no B1, definir role/procedimento de
   cleanup, batching e retenção da Fase 2/3.
3. **Antes de conclusões de audiência:** validar o classificador com tráfego controlado e revisar
   os casos `likely_human` 55 e crawler genérico.
4. **Antes de desempenho:** obter logs/métricas reais e medir p95/p99; não usar o p95 local de
   processamento como latência de produção.
5. **Revisão jurídica:** avaliar a suficiência do cookie `pca_edge_consent` como evidência.
6. **Limpeza dos 2 registros:** somente após autorização específica; não executar agora.

---

## 15. Bloqueios para a próxima fase

- Não iniciar homologação representativa enquanto F-01 e F-02 não tiverem decisão/tratamento.
- Não afirmar validação de bots em produção.
- Não coletar tráfego real até definir rate limiting e retenção.
- Não ativar cleanup, flags ou coleta nesta fase.

---

## 16. Limitações da evidência

- Apenas 2 registros sintéticos reais; nenhum tráfego orgânico.
- Sem logs de runtime disponíveis sem vínculo; sem p95/p99.
- Latência válida Edge/Function não registrada; somente 6 rejeições.
- Classificação de bots baseada em fixtures locais.
- Cenários de custo são hipóteses, não medições.
- Não foi executado teste de indisponibilidade real, carga ou flood.
- Não foi feita conclusão jurídica definitiva.

---

## 17. Classificação final

**2 — Aprovado com pendências.** O fluxo está funcional, isolado e sem vazamento observado; porém
há achados altos de proteção de entrada e retenção, além de evidência insuficiente de desempenho,
observabilidade e classificação em tráfego real. Nenhum achado crítico de isolamento, segredo ou
coleta sem consentimento foi encontrado.
