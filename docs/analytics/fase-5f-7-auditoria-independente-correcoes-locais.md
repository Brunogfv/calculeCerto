# Fase 5F.7 — Auditoria independente das correções locais

Status: **auditoria local concluída; nenhuma correção aplicada; nenhuma operação remota executada**.
Data/hora: **2026-11-15T23:08:28-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 3 — Bloqueado.** A implementação tem uma regressão comprovada na rotina de
retenção e três testes de integração PostgreSQL falham. A próxima etapa não deve começar até a
correção da role/contrato de cleanup e a atualização dos testes.

---

## 1. Resumo executivo

- Rate limiting code-based foi adicionado à Edge (`120/60 s`) e à Function (`60/60 s`); a sintaxe é
  oficialmente suportada e o Free aceita até 2 regras por projeto.
- A configuração foi importada e testada localmente, mas **a aplicação real das regras pela
  plataforma não foi validada**.
- A rotina de retenção foi ampliada para Fases 2/3/4, com batching, advisory lock e validação de
  cutoffs.
- A ampliação quebrou a compatibilidade com a role `analytics_cleanup` existente e com os testes de
  integração da Fase 4: três testes falham com `42501 — permission denied for table
  affiliate_clicks`.
- O SQL da nova role `validation_b1_cleanup` foi preparado, mas não aplicado; não há role B1 de
  cleanup.
- O cron de Scheduled Function não executa em deploy preview; o B1 continua sem retenção
  operacional automática.
- As correções do classificador passam nos testes locais.
- 84/84 testes analytics, 19/19 B1, 2/2 consentimento e o build passam. As integrações
  PostgreSQL, agora executadas localmente, dão **28/31 pass e 3 fail**.

---

## 2. Auditoria do rate limiting

### 2.1 O que foi verificado

- `netlify/functions/capture-html.mjs` exporta `rateLimit: { windowLimit:60, windowSize:60,
  aggregateBy:['ip','domain'] }`.
- `netlify/edge-functions/html-capture.js` exporta `rateLimit: { windowLimit:120, windowSize:60,
  aggregateBy:['ip','domain'] }`.
- As cópias do B1 estão sincronizadas e os testes de configuração passam.
- HMAC, timestamp, nonce, body de 8 KiB e `edge_rate_limits`/`edge_daily_counters` continuam
  presentes; a configuração não os removeu.
- A sintaxe corresponde à documentação oficial da Netlify para regras code-based em Functions e
  Edge Functions.
- No Free, o limite é de **2 regras code-based por projeto**; as duas regras usadas se enquadram.

### 2.2 O que não foi comprovado

- **Hipótese não validada:** a aplicação efetiva das regras pela Netlify, inclusive no deploy
  preview e no deploy log.
- **Hipótese de risco:** em chamadas Edge → Function, o IP usado pelo agregador da Function pode ser
  o da borda, não o do visitante. Se isso ocorrer, o limite de 60/min da Function pode se tornar um
  limite compartilhado e gerar falsos `429` para tráfego legítimo.
- **Limitação conhecida:** agregação por IP/domínio é contornável por IPs distribuídos; não há
  limite global no Free.
- **Limitação conhecida:** a Netlify documenta atraso de até 10 s na aplicação do limite.
- **Não comprovado:** comportamento exato dos headers de resposta `429`; a plataforma documenta o
  status, não um cabeçalho específico.

O rate limit não substitui HMAC e o HMAC não substitui rate limit; essa separação permanece.

---

## 3. Compatibilidade com Netlify Free

| Item | Resultado |
|---|---|
| Regras code-based em Functions | suportadas oficialmente |
| Regras code-based em Edge | suportadas oficialmente |
| Plano Free | até 2 regras por projeto |
| Regras usadas | 1 Edge + 1 Function |
| Regra por IP + domínio | suportada |
| Regra global por domínio | não disponível no Free |
| Enforcement antes do código | documentado para Functions/Edge |
| Aplicação real no B1 | **não comprovada** |

A compatibilidade **de configuração** está comprovada; a **de comportamento em runtime** não.

---

## 4. Auditoria da rotina de retenção

### 4.1 Pontos corretos

- Allowlist fechada de 13 tabelas.
- Cutoffs validados antes de conectar; valores inválidos falham cedo.
- Batching por `ctid` com `LIMIT`, tamanho 1.000 (máximo 5.000).
- Advisory lock `pg_try_advisory_lock(871238)`.
- Transação por lote, `statement_timeout=30s`, `lock_timeout=5s`.
- `ROLLBACK` no lote que falhar.
- Ordem de Fase 2/3 coerente com FKs; `visitors` exige ausência de sessões.
- Logs/retorno sem PII.
- Teste local com PostgreSQL 17 (superuser) confirmou old removido e recent preservado, lock
  bloqueando concorrente e batching.

### 4.2 Regressão comprovada

**A implementação não funciona com a role `analytics_cleanup` existente.**

- A role criada pelas migrations/ testes só tem `SELECT/DELETE` nas tabelas da Fase 4.
- A rotina agora começa pela Fase 2/3 (`affiliate_clicks`) e tenta `DELETE` sem grant.
- Resultado real dos testes locais: `42501 — permission denied for table affiliate_clicks`.
- Isso afeta:
  - `limpa retenção de brutos, agregados, contadores, nonces e rate limits`;
  - `falha parcial da limpeza faz rollback...`;
  - `agendamento de limpeza está configurado...`.

A role nova `validation_b1_cleanup` e seus grants foram preparados, mas **não foram aplicados** e
não são usados por esses testes. Portanto, a retenção completa ainda não é executável no ambiente
atual.

### 4.3 Outros riscos

- O contrato de retorno de `limparHtmlCapture` mudou de
  `{raw,daily,monthly,dailyCounters,nonces,rate}` para `{locked,tables,truncated,durationMs}`; testes
  e consumidores antigos não foram atualizados.
- O teste de falha parcial esperava rollback de todas as tabelas da Fase 4; a nova rotina usa
  commit por lote e deixa lotes anteriores preservados. Isso é idempotente, mas exige atualização
  explícita do contrato/teste.
- `sessions`/`visitors` têm índices preparados, mas não aplicados; a limpeza pode fazer varredura.
- `sessions` tem `ON DELETE CASCADE` para filhos; uma sessão antiga com filho recente poderia
  remover o filho por cascata. É um cenário de borda que precisa de teste antes de dados reais.
- `maxBatches=100` e `statement_timeout=30s` por lote não impõem um orçamento total de execução.
  Uma Scheduled Function pode ser encerrada antes de terminar; os lotes já commitados permanecem,
  mas a execução fica incompleta e sem marca de retomada.
- Se `CLEANUP_DATABASE_URL` usar endpoint pooled, o advisory lock de sessão pode não sobreviver
  entre operações. A conexão de cleanup deve ser direta; isso não está imposto no código/SQL.

---

## 5. Auditoria da role `validation_b1_cleanup`

O SQL `database/b1/007-cleanup-retention.sql`:

- exige `current_database()='validation_b1'`;
- exige a role já criada;
- concede `CONNECT`/`USAGE`;
- revoga `CREATE` no schema/database;
- concede `SELECT, DELETE` nas 13 tabelas;
- não concede INSERT/UPDATE/TRUNCATE/DDL;
- cria índices `sessions_last_seen_at_idx` e `visitors_last_seen_at_idx` com `IF NOT EXISTS`.

Pontos de atenção:

- **A criação da role não está no SQL.** Ela precisa ser criada com LOGIN, senha em cofre,
  `NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS` e, idealmente, `NOINHERIT` e sem
  memberships. O script assume que isso já ocorreu.
- Não há verificação de que a role não possui memberships ou atributos administrativos após a
  criação.
- O script é transacional para grants/índices, mas o `CREATE INDEX` pode bloquear escritas em
  tabelas grandes; em B1, o volume atual é mínimo.
- O script não foi aplicado; a compatibilidade PostgreSQL 17 foi revisada por sintaxe, não
  executada contra Neon.
- A role pode ler e apagar as 13 tabelas; é o mínimo compatível com a limpeza completa, mas deve ser
  exclusiva do B1.

**Conclusão:** o SQL é uma boa base, mas a role e a integração com o código ainda não estão
fechadas.

---

## 6. Scheduled Function e execução operacional

- A função `cleanup-html-capture` agora chama a retenção completa.
- Cron `15 3 * * *` (UTC); `HTML_CAPTURE_CLEANUP_ENABLED=false`.
- B1 é `deploy-preview`; **Scheduled Functions não executam cron em preview**.
- Não há `CLEANUP_DATABASE_URL` no B1.
- Não há role `validation_b1_cleanup` no Neon.
- Não há evidência de execução real; não executar agora.
- Recomendação inicial: execução manual controlada, batch pequeno, `maxBatches` baixo, limite de
  tempo total e log de `run_id`; só depois considerar agendamento em alvo publicado.
- A verificação de sucesso deve usar contagens/logs e comparação de cutoffs; nunca apagar os 2
  registros sintéticos sem autorização.

---

## 7. Auditoria do classificador

Correções confirmadas nos testes:

- UA desconhecido com apenas `Accept` agora é `unknown`.
- `ExampleCrawler` agora é `likely_bot` com `other_bot`.
- Bingbot e UptimeRobot são classificados corretamente.
- UA ausente e UA falsificado permanecem `unknown`/conflito.
- UA isolado e país isolado não determinam classe.
- `confidence` continua uma faixa de evidência, não probabilidade calibrada.
- O classificador não bloqueia visitantes.

Riscos residuais:

- Sem validação em tráfego real.
- Heurísticas ainda podem gerar falsos positivos/negativos em UAs não previstos.
- A correção de `likely_human` pode reduzir a captura de navegadores incomuns; é uma decisão
  conservadora, não uma garantia.

---

## 8. Testes executados

| Suíte | Resultado |
|---|---|
| `npm run test:analytics` sem `TEST_DATABASE_URL` | 84/84 pass; 2 suítes skip |
| `npm test` B1 | 19/19 pass |
| `npm run test:browser` | 2/2 pass |
| Build B1 offline | pass; 2 Functions + 1 Edge |
| Integração PostgreSQL local (capture + collect) | 28/31 pass; 3 fail |

As integrações foram executadas com PostgreSQL 17.11 local e `TEST_DATABASE_URL`; as duas suítes
anteriormente skip foram executadas. Não são mais “aprovadas por omissão”.

Falhas:

1. `capture.integration`: limpeza de retenção completa — `42501` em `affiliate_clicks`.
2. `capture.integration`: falha parcial esperada — falhou antes, pelo mesmo motivo.
3. `capture.integration`: agendamento de limpeza — `42501` em `affiliate_clicks`.

Nenhum teste ignorado foi tratado como aprovado.

---

## 9. Testes ignorados/não executados

- `capture.integration` e `collect.integration` foram executadas nesta auditoria com PG local.
- Nenhum teste foi marcado como ignorado na execução com `TEST_DATABASE_URL`.
- A execução padrão (sem `TEST_DATABASE_URL`) ainda mostra 2 suítes skip; isso é esperado.
- Não foi executada carga remota, cleanup remoto ou deploy.

---

## 10. Problemas encontrados

### P-01 — Regressão de retenção/permissões

- **Gravidade:** Alto/bloqueador.
- **Tipo:** problema comprovado no código/teste.
- **Evidência:** `42501` em `affiliate_clicks`; 3 testes de integração falham.
- **Impacto:** a nova limpeza não roda com a role de cleanup existente; retenção não é operacional.
- **Correção necessária:** alinhar role/grants (B1) e contrato dos testes; decidir se a função antiga
  continua Phase4 ou passa a exigir a nova role.
- **Autorização:** necessária; não foi alterado.

### P-02 — Contrato de retorno e rollback por lote

- **Gravidade:** Alto/médio.
- **Tipo:** problema comprovado.
- **Evidência:** testes esperam `{raw,daily,...}` e rollback total; código retorna
  `{locked,tables,...}` e commits por lote.
- **Impacto:** testes/CLI/consumidores antigos quebram; comportamento de falha mudou.
- **Correção:** atualizar testes/consumidores e documentar semântica de falha parcial; ou preservar
  adaptador de compatibilidade.
- **Autorização:** necessária.

### P-03 — Retenção B1 não operacional

- **Gravidade:** Alto.
- **Tipo:** limitação de infraestrutura/arquitetura.
- **Evidência:** preview sem cron; flag false; sem `CLEANUP_DATABASE_URL`; sem role B1.
- **Impacto:** dados não expiram automaticamente no B1.
- **Correção:** role/grants, execução manual ou alvo publicado; autorização.
- **Autorização:** necessária.

### P-04 — Rate limit da Function pode agregar IP da borda

- **Gravidade:** Médio/alto (hipótese).
- **Tipo:** hipótese não validada em runtime.
- **Evidência:** configuração por IP; chamada interna Edge→Function.
- **Impacto:** possível bloqueio global de capturas legítimas.
- **Correção:** testar em preview e, se confirmado, elevar o limite da Function ou separar a regra.
- **Autorização:** necessária.

### P-05 — Limites Free e distribuídos

- **Gravidade:** Médio.
- **Tipo:** limitação de infraestrutura conhecida.
- **Evidência:** 2 regras, por IP/domínio, sem limite global.
- **Impacto:** ataque distribuído/rotativo evita o limite.
- **Correção:** aceitar residual ou usar camada externa em etapa autorizada.
- **Autorização:** necessária.

### P-06 — Timeout/orçamento do cleanup

- **Gravidade:** Médio.
- **Tipo:** risco de operação.
- **Evidência:** até 100 lotes, 30 s por lote; sem orçamento total.
- **Impacto:** função pode ser encerrada com trabalho parcial (lotes anteriores commitados).
- **Correção:** orçamento de tempo total e `maxBatches` conservador; retomada idempotente.
- **Autorização:** necessária.

### P-07 — Advisory lock com pooled connection

- **Gravidade:** Médio (hipótese).
- **Tipo:** hipótese de infraestrutura.
- **Evidência:** lock de sessão; endpoint de cleanup não é validado.
- **Impacto:** concorrência não bloqueada se o endpoint for pooled.
- **Correção:** exigir conexão direta para cleanup e validar.
- **Autorização:** necessária.

### P-08 — Classificador sem tráfego real

- **Gravidade:** Médio.
- **Tipo:** limitação de evidência.
- **Evidência:** testes locais apenas.
- **Impacto:** falsos positivos/negativos possíveis.
- **Correção:** validação controlada posterior.
- **Autorização:** necessária.

### P-09 — Resposta 429/cabeçalhos e enforcement

- **Gravidade:** Baixo/médio.
- **Tipo:** hipótese de plataforma.
- **Evidência:** documentação de 429/atraso de 10 s; sem teste real.
- **Impacto:** comportamento percebido pode diferir do esperado.
- **Correção:** validar em preview e registrar logs.
- **Autorização:** necessária.

---

## 11. Arquivos que precisam de correção

- `netlify/functions/_lib/cleanup-retention.mjs` — contrato/role de cleanup, orçamento total,
  lock/endpoint e semântica de rollback.
- `netlify/functions/_lib/cleanup-html-capture.mjs` — adaptador de compatibilidade ou decisão de
  contrato.
- `tests/analytics/capture.integration.spec.mjs` — role/grants, retorno e rollback esperados.
- `tests/analytics/collect.integration.spec.mjs` — revisar apenas se o contrato de retenção afetar.
- `database/b1/007-cleanup-retention.sql` — criar role explicitamente, validar NOINHERIT/memberships
  e documentar aplicação transacional.
- Testes de rate limit em preview — não é correção de código local, é validação.
- Documentação de operação/cron/flags — alinhar nome da flag e escopo Phase2/3.

Nenhuma correção foi feita nesta fase.

---

## 12. Operações remotas necessárias para a próxima etapa

1. Corrigir localmente a role/contrato/testes e rodar o suite PostgreSQL.
2. Criar `validation_b1_cleanup` no Neon B1 com senha no cofre e `NOINHERIT`.
3. Aplicar grants/índices preparados, com verificação de identidade e transação.
4. Configurar `CLEANUP_DATABASE_URL` (conexão direta) e definir execução manual/controlada.
5. Fazer deploy preview do código alterado para testar rateLimit.
6. Validar rateLimit, 429, IP interno Edge→Function e cleanup com dados sintéticos.
7. Não promover, não limpar dados e não ativar coleta permanente sem autorização.

---

## 13. Estimativa de créditos

- Nenhum deploy/consumo nesta fase.
- Saldo recente: **140,0759** créditos; plano Free 300.
- Deploys draft anteriores mediram 0 crédito, mas reservar **até 30 créditos** para até dois deploys
  de validação continua prudente.
- Web requests: 10.000 = 2 créditos; manter os testes curtos e controlados.
- Nenhum upgrade/compra recomendado.

---

## 14. Classificação final

**3 — Bloqueado.** A regressão comprovada de permissões/contrato na retenção e as 3 falhas de
integração impedem considerar a implementação pronta para validação no B1. O rate limiting e o
classificador estão consistentes localmente, mas o rate limiting ainda carece de validação em
runtime. Nenhuma correção ou operação remota foi executada nesta auditoria.
