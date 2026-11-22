# Fase 5F.16 — Consolidação técnica e planejamento da validação final B1

Status: **auditoria local concluída; nenhuma operação remota; nenhum código ou ambiente alterado**.
Data: **2026-11-17**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** A implementação local e a documentação estão
coerentes, e os testes locais registrados são abrangentes. A validação remota do código corrigido, a
execução manual da limpeza, o cron automático e o enforcement de rate limiting ainda não foram
comprovados.

---

## 1. Resumo executivo

O sistema de analytics está implementado em camadas: consentimento, coleta Fase 2, Edge Capture,
Function de captura, HMAC/replay protection, rate limiting de plataforma e de banco, retenção e
limpeza. Há testes locais cobrindo unidade, integração PostgreSQL 17, B1 e consentimento no
navegador.

O último deploy conhecido (`6afb78132cdffef6e6a05696`) é um preview do B1 e **não contém** as
correções locais da Fase 5F.14. O cron está reconhecido no preview, mas não executa em preview. A
limpeza permanece desativada e nunca foi executada em runtime publicado. As flags de ingestão,
captura, analytics e cleanup permanecem desativadas segundo os relatórios locais; este estado não foi
reconfirmado remotamente nesta fase.

A Fase 5F.15 comprovou a membership de plataforma
`neondb_owner → validation_b1_cleanup`, concedida por `cloud_admin`; a role de cleanup não herda
privilégios administrativos e não acessa `neondb`. Não foi identificado privilégio excessivo.

A conclusão local está avançada. A conclusão de homologação e a conclusão do agendamento automático
são etapas distintas e ainda abertas.

---

## 2. Escopo e limitações

Esta fase inspecionou somente:

- código local atual em `netlify/` e `validation-b1/`;
- testes locais em `tests/analytics/` e `validation-b1/tests/`;
- migrations em `db/migrations/` e scripts operacionais em `database/b1/`;
- relatórios 5F.1 a 5F.15;
- documentação e configurações locais (`netlify.toml`, `.env.example`, README, docs).

Não houve consulta ao Neon ou à Netlify nesta fase. Nenhuma variável remota foi verificada como
estado atual. Os dados remotos e ambientes são os reportados nas fases anteriores, não uma
reconfirmação desta auditoria.

Também não foram executados:

- testes locais;
- migrations;
- SQL remoto;
- deploy, Run now, Scheduled Function ou limpeza;
- alterações de código, testes, configurações, roles, grants, variáveis, flags ou dados.

Testes e resultados citados são evidências documentadas da Fase 5F.14, não uma reexecução nesta
fase.

---

## 3. Estado atual da arquitetura

### Componentes de analytics

1. **Consentimento:** cookie versionado, DNT/GPC e bloqueio antes da captura.
2. **Coleta Fase 2:** Function `/api/collect`, validação de payload, HMAC/rate limit de banco,
   visitante/sessão/pageview/eventos e persistência PostgreSQL.
3. **Edge Capture:** Edge Function `html-capture.js`, classificação de tráfego, amostragem e envio
   assinado para `/api/capture-html`.
4. **Function de captura:** validação HMAC, timestamp, nonce, corpo, escopo e persistência.
5. **Proteção contra abuso:** regras code-based da Netlify, HMAC, nonce, rate limit de banco e limite
   diário.
6. **Retenção:** 13 tabelas, prazos por tabela, batching, deadline, advisory lock, rollback por lote
   e proteção de filhos recentes.
7. **B1:** artefato mínimo, `validation-b1/netlify/`, duas Functions e uma Edge Function.
8. **Cópia B1:** 16 arquivos compartilhados com hashes idênticos ao código canônico.

### Ambientes conhecidos

| Item | Estado conhecido |
|---|---|
| Neon Project | `square-mountain-69641645` |
| Branch B1 | `validation-b1` (`br-misty-sound-b6pnt7iw`) |
| Database B1 | `validation_b1` |
| Role runtime | `validation_b1_runtime` |
| Role cleanup | `validation_b1_cleanup` |
| Site B1 | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Deploy conhecido | `6afb78132cdffef6e6a05696` |
| Contexto | `deploy-preview` |
| Deploy atual contém 5F.14 | não |
| Deploy publicado do B1 | não |
| Cron no preview | não executa automaticamente |
| Cleanup real | não executado |
| Produção/homologação | não alteradas nos relatórios |

---

## 4. Resultado da auditoria local

### 4.1 Componentes implementados e com testes

| Componente | Evidência local |
|---|---|
| Consentimento | testes de política, cookie, DNT/GPC e navegador |
| Coleta Fase 2 | testes unitários + `collect.integration.spec.mjs` |
| Edge Capture | `capture-edge.spec.mjs`, `capture-policy.spec.mjs`, classifier |
| HMAC/replay | `capture-hardening.spec.mjs`, integração com nonce/HMAC |
| Rate limit de banco | `rate-limit.spec.mjs` + integração |
| Persistência | `collect.integration.spec.mjs`, `capture.integration.spec.mjs` |
| Retenção/limpeza | `cleanup-retention.spec.mjs`, integração de 13 tabelas |
| B1 | `b1.spec.mjs`, `browser-consent.spec.mjs`, shared manifest |
| Build | `validation-b1/scripts/build.mjs` e testes de segredo/artefato |

Resultado registrado na 5F.14: **135/135 analytics**, **19/19 B1**, **2/2 consentimento**, build B1
com 6 arquivos + manifest e 16 arquivos compartilhados idênticos. Nesta fase os testes não foram
reexecutados.

### 4.2 Cópia canônica × B1

Comparação local de hashes dos 16 arquivos de `validation-b1/scripts/shared-files.mjs`:

- **16/16 idênticos**;
- nenhuma divergência de código entre canônico e B1;
- `validation-b1/netlify.toml` configura build, publish, Edge Functions e Functions;
- `validation-b1/dist` e `.netlify` são artefatos locais; não são evidência do deploy remoto;
- o deploy remoto conhecido é anterior à 5F.14.

### 4.3 Flags e variáveis identificadas no código

| Variável/flag | Uso local | Estado documentado |
|---|---|---|
| `ANALYTICS_INGEST_ENABLED` | `readConfig` / `/api/collect` | ausente/desativada no B1 |
| `EDGE_CAPTURE_ENABLED` | Edge capture | `false` |
| `EDGE_ANALYTICS_ENABLED` | Edge analytics | `false` |
| `EDGE_ANALYTICS_SAMPLE_RATE` | amostragem Edge | `0.1` |
| `EDGE_INGEST_KEY_ID` | key ID HMAC | ausente; default `v1` |
| `EDGE_INGEST_SECRET` | HMAC Edge→Function | presente/secret |
| `HTML_CAPTURE_CLEANUP_ENABLED` | scheduled cleanup | `false` no preview |
| `CLEANUP_DATABASE_URL` | conexão de limpeza | secret no preview |
| `CLEANUP_EXPECTED_DATABASE` | guarda de banco | default `validation_b1` |
| `CLEANUP_EXPECTED_ROLE` | guarda de role | default `validation_b1_cleanup` |
| `RETENTION_TIME_BUDGET_MS` | orçamento global | default 20.000 |
| `RETENTION_BATCH_TIMEOUT_MS` | timeout por lote | default 5.000 |
| `RETENTION_SHUTDOWN_RESERVE_MS` | margem de encerramento | default 1.000 |
| `RETENTION_BATCH_SIZE` / `RETENTION_MAX_BATCHES` | lotes | defaults 1.000/100 |
| `DATABASE_URL` | runtime Fase 2/captura | presente/secret |
| `ALLOWED_ORIGINS` | origem / `/api/collect` | ausente/não usada no B1 |

Esses estados vêm dos relatórios 5F.12/5F.13. Não foram confirmados remotamente nesta fase.

### 4.4 Divergências documentais

- **5F.14 × 5F.15:** a 5F.14 ainda tratava a membership como divergência aberta; a 5F.15 comprovou a
  exceção `neondb_owner → validation_b1_cleanup`. Não é contradição de código; é resolução posterior.
- **5F.12 × 5F.13:** a 5F.12 dizia que o metadado do deploy não provava rate limit; a 5F.13
  encontrou o metadado estruturado com as duas regras reconhecidas. A 5F.12 continua correta quanto
  a “não há prova de enforcement”.
- **Deploy × código local:** o canônico e B1 estão sincronizados localmente, mas o deploy conhecido é
  anterior à 5F.14. Código local não é código publicado.
- **Docs × migrations:** as 6 migrations estão em `db/migrations/`; 007/008 de B1 são scripts
  operacionais, não migrations registradas. `schema_migrations` permanece em 6.
- **Testes:** a suíte registrada é 135/135 com PostgreSQL 17; não há evidência de execução remota.

---

## 5. Resultado da auditoria da limpeza

### 5.1 Orçamento e segurança

O código local confirma:

- `timeBudgetMs` padrão **20.000 ms**, máximo 25.000;
- `shutdownReserveMs` padrão **1.000 ms**;
- `batchTimeoutMs` padrão **5.000 ms**, configurável;
- `batchSize` máximo 5.000, `maxBatches` máximo 1.000;
- deadline calculado **antes do `pool.connect`**;
- lote só inicia se `restante >= batchTimeoutMs + 250 ms`;
- `statement_timeout` e `lock_timeout` são configurados por lote e não há mais `30s` fixo;
- o lote faz `BEGIN`/`COMMIT`; erro faz `ROLLBACK`;
- o advisory lock e o client são liberados no `finally`;
- a Scheduled Function fecha o pool quando foi ela que o criou.

Status retornados: `complete`, `partial`, `budget_exhausted` e `locked`. A tabela inclui `skipped`,
`truncado` e motivo. A retomada seguinte usa os mesmos cutoffs e é idempotente; não há garantia de
execução total em uma única invocação quando o deadline é atingido.

### 5.2 Integridade referencial e cascata

A proteção local impede que `sessions` seja excluída quando existe filho recente:

- `pageviews.received_at` recente;
- `events.received_at` recente;
- `affiliate_clicks.received_at` recente.

`visitors` continua protegido por `NOT EXISTS sessions`. As constraints e o `ON DELETE CASCADE`
permanecem; filhos já elegíveis ainda podem ser removidos pela cascata. Os prazos não foram
alterados.

Testes registrados cobrem:

- sessão antiga com filhos antigos;
- sessão antiga com filho recente;
- sessão recente com filho antigo;
- sessão sem filhos;
- múltiplos filhos em faixas diferentes;
- falha parcial;
- lock concorrente real;
- orçamento no PostgreSQL e retomada.

### 5.3 O que não está comprovado

- execução real da limpeza no B1;
- comportamento do código 5F.14 em deploy (o deploy conhecido é anterior);
- conexão real Netlify→Neon pela role de cleanup;
- SSL/endpoint direto em runtime;
- deadline real de 20 s e encerramento sob o limite de 30 s da plataforma;
- dry-run;
- cron automático;
- ausência de PII em logs reais;
- monitoramento/alertas de falha.

A validação local reduz o risco de regressão de lógica, mas não substitui essas evidências.

---

## 6. Matriz de validação final

Legenda: **1** implementado e validado localmente; **2** validado em ambiente remoto; **3**
implementado, mas ainda não validado; **4** pendente de implementação; **5** não aplicável ou
dependente de decisão arquitetural.

| Componente | Estado | Evidência disponível | Pendência | Validação necessária | Risco | Critério objetivo de aprovação |
|---|---:|---|---|---|---|---|
| Consentimento | 1 | Testes de cookie, DNT/GPC, navegador | Runtime remoto | Preview/navegador controlado | Baixo | Sem captura antes do consentimento e retirada funciona |
| Coleta de eventos | 1 | Unitários + integração PostgreSQL 17 | Runtime remoto | Preview + dados isolados | Médio | Evento válido persiste; inválido/rejeitado não grava |
| Edge Capture | 1 | Testes de escopo, classificação, envio | Runtime remoto | Preview com amostragem controlada | Médio | Evento elegível chega à Function; flags off bloqueiam |
| HMAC e replay protection | 1 | Hardening + integração nonce/timestamp | Runtime remoto | POST controlado em alvo autorizado | Médio | Assinatura inválida/replay rejeitados; não há gravação duplicada |
| Rate limiting e HTTP 429 | 3 | Duas regras reconhecidas no deploy 5F.13; sem carga | Enforcement, 429 e IP interno | Teste sequencial controlado; sem flood | Médio | 429 observado nos limites; IP/edge documentado; sem falso bloqueio |
| Persistência no Neon | 1 | Schema, 2 registros e integração local | Escrita real controlada | Runtime + contagem antes/depois | Médio | Dados de teste gravados e lidos sem PII indevida |
| Isolamento entre ambientes | 2 | IDs e estados remotos da 5F.15; produção/homologação intocadas | Reconfirmar no deploy final | Leitura de IDs e deploy | Baixo | B1 não acessa `neondb`/produção; ambientes separados |
| Retenção de dados | 1 | Matriz de 13 tabelas; testes de cutoff | Runtime remoto | Dry-run + execução controlada | Alto | Prazos corretos; recentes preservados |
| Limpeza por lotes | 1 | Testes de batching, budget e retomada | Runtime remoto | Run now com lote pequeno | Alto | Lotes observados; status e tempo abaixo do limite |
| Integridade referencial | 1 | FKs, cascata protegida e testes de cenários | Runtime remoto | Execução com dados representativos | Alto | Nenhum filho recente removido; árvore antiga removida |
| Advisory lock | 1 | Teste real com cliente segurando o lock | Runtime remoto | Run now concorrente controlado | Alto | Segunda execução retorna `locked`; nenhum DELETE |
| Execução manual da limpeza | 3 | Só caminhos locais; `Run now` não executado | Runtime e flags | Preview autorizado ou alvo B | Alto | Resultado explícito; contagens; zero remoção indevida |
| Scheduled Function e cron | 3 | Schedule reconhecido no deploy antigo; cron preview não roda | Código novo publicado e alvo | B publicado dedicado | Alto | Execução automática observada em alvo isolado |
| Monitoramento de falhas | 4 | Logs `console.log/error`; sem run_id/alerta | Alertas, retenção de logs e run_id | Implementação + teste de falha | Médio | Falha/parcial detectável e acionável |

Itens de execução real não podem ser promovidos para **2** apenas porque a configuração foi
reconhecida ou porque o teste local passou.

---

## 7. Pendências classificadas por prioridade

### P0 — bloqueiam qualquer execução real

1. Publicar o código 5F.14 em alvo de teste; o deploy conhecido está desatualizado.
2. Definir o alvo: preview manual ou site publicado dedicado.
3. Garantir dados isolados e não tocar os 2 registros sintéticos.
4. Implementar/validar dry-run antes de qualquer DELETE real.
5. Confirmar conexão direta/SSL e role de cleanup no alvo.

### P1 — necessárias para concluir homologação

6. Executar `Run now` manual com lote pequeno e orçamento conservador.
7. Verificar contagens, status, lock, rollback, logs e ausência de PII.
8. Observar tempo real e confirmar encerramento abaixo de 30 s.
9. Validar a exceção de membership no runtime (sem remover a concessão).
10. Validar 429/IP interno Edge→Function com carga controlada e sem flood.

### P2 — necessárias para agendamento e produção

11. Criar alvo publicado dedicado se o cron for requisito.
12. Validar cron real e frequência, sem depender do preview.
13. Adicionar `run_id`, alertas e retenção de logs.
14. Definir orçamento/maxBatches iniciais e monitorar créditos.
15. Só depois considerar produção, com autorização separada.

---

## 8. Comparação das alternativas A–D

| Alternativa | Isolamento | Segurança | Custo/complexidade | Deploy | Cron real | Risco | Autorização |
|---|---|---|---|---|---|---|---|
| **A. Preview B1 + Run now** | Alto no banco; site público minimalista | Manual, sem endpoint; exige flag e dados isolados | Baixo: 1 preview deploy + 1 execução manual | Preview | Não | Médio: execução manual e DELETE real | Deploy, flag, Run now |
| **B. Site publicado dedicado** | Alto: site/branch/DB/role próprios | Alto se mínimo/privado e sem endpoint | Médio/alto: deploy, cron, Neon extra | Publicado | Sim | Maior: cron pode apagar dados de teste | Criar site/branch/DB/role, envs, deploy |
| **C. Manter desativado; validar só local** | Máximo | Nenhum risco remoto | Muito baixo | Não | Não | Nenhum | Nenhuma |
| **D. Agendador externo** | Depende do runner | Adiciona segredo e manutenção | Médio/alto; nova infraestrutura | Depende | Não valida Netlify | Médio | Nova arquitetura |

A alternativa D não é adequada para validar o comportamento real de Scheduled Function da Netlify.

---

## 9. Caminho recomendado

### Conclusão da implementação local

Considerar concluída após manter os 135/135 testes, 19/19 B1, 2/2 consentimento e build/16 arquivos
sincronizados, sem regressão.

### Conclusão da validação em homologação

Usar **A** como caminho mínimo:

1. uma autorização para preview deploy do código 5F.14;
2. flag de cleanup ativada somente na janela;
3. dados isolados e orçamento baixo;
4. `Run now` manual;
5. contagens antes/depois, status, lock, rollback e logs.

Isso conclui a validação de runtime e homologação, mas **não** conclui o cron.

### Conclusão da validação do agendamento automático

Se o cron for requisito, usar **B** com site publicado dedicado, branch/database/role próprios e
dados de teste. O B1 preview não deve ser promovido para esse fim. Sem B, o agendamento permanece
não comprovado.

### Autorização para produção

Não equiparar as etapas. Produção exige autorização separada, revisão de privacidade, monitoramento,
orçamento e rollback, mesmo que A/B passem.

### Alternativa C

Se o objetivo for apenas encerrar a implementação local, C encerra a fase sem validação remota, mas
deixa runtime, cron e enforcement como pendências assumidas.

---

## 10. Estimativa de esforço e créditos

- **A:** 1 preview deploy, 1 execução manual, configuração/flags; esforço baixo. Custo de deploy
  anterior medido em 0 crédito, mas reservar até 15; compute manual e requests são adicionais.
- **B:** site/branch/database/role, 1 deploy publicado, cron e dados de teste; esforço médio/alto.
  Compute estimado de 30 s/dia em 1 GB: ~0,0083 GB-h/dia, ~0,25 GB-h/mês, cerca de 2,5
  créditos/mês, além de requests, banda e Neon. Não presumir custo zero.
- **C:** ~0 remoto; não valida runtime.
- **D:** custo de runner/segredos e manutenção; não recomendado.
- Saldo documentado na 5F.15: **139,3888263442 créditos**. Não consultado nesta fase.

---

## 11. Critérios objetivos para considerar a Fase 5F concluída

1. **Local:** 135/135 analytics, 19/19 B1, 2/2 consentimento, build e 16/16 hashes.
2. **Homologação:** código 5F.14 em preview; `Run now` com status explícito; tempo abaixo de 30 s;
   lock, rollback e preservação de recentes comprovados; nenhum registro sintético removido.
3. **Cron:** alvo publicado dedicado, execução automática observada, logs e contagens corretos,
   nenhuma exclusão indevida.
4. **Produção:** autorização específica, revisão de segurança/privacidade, monitoramento e rollback.

A fase não está concluída apenas com o deploy antigo, com o preview sem execução ou com testes
locais.

---

## 12. Ações que exigirão autorização explícita

- Deploy preview ou publicado.
- Alterar `CLEANUP_DATABASE_URL`, flags ou outras variáveis.
- Executar `Run now`, cron ou limpeza.
- Criar site, branch, database ou role de validação.
- Executar migrations ou SQL remoto.
- Inserir, atualizar ou excluir dados, inclusive os 2 registros sintéticos.
- Alterar código/testes/configurações (dry-run, run_id, alertas).
- Fazer commit, push ou PR.
- Promover qualquer deploy ou tocar produção/homologação principal.

Nenhuma dessas ações foi executada nesta fase.

---

## 13. Classificação final

**2 — Aprovado com pendências.** Implementação local, documentação, sincronização B1 e testes
registrados estão coerentes. A validação do código corrigido em runtime, a execução manual da
limpeza, o cron automático, o dry-run, a conexão direta/SSL e o enforcement de rate limiting ainda
não estão comprovados. Não há evidência de privilégio excessivo ou de ambiente inseguro que
justifique classificação 3 nesta auditoria local.
