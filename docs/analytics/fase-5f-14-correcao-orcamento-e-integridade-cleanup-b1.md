# Fase 5F.14 — Correções locais de segurança e orçamento da retenção B1

Status: **correções locais implementadas e testadas; nenhuma operação remota executada**.
Data/hora: **2026-11-17T18:20:43-03:00**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O orçamento global, a interrupção segura, a
retomada e a proteção contra cascata foram implementados e cobertos por testes locais. O runtime
publicado, o alvo de cron e o enforcement de rate limiting continuam sem comprovação; a validação
operacional exige nova autorização.

---

## 1. Achados originais e escopo

A auditoria 5F.13 identificou:

1. **A-01 (alto):** a rotina podia usar até 100 lotes por tabela, com `statement_timeout=30s`, sem
   orçamento global, enquanto a Scheduled Function da Netlify tem limite de **30 s**.
2. **A-02 (alto):** o cleanup automático não está operacional no B1: o deploy é preview, o cron só
   roda em publicado e `CLEANUP_DATABASE_URL`/`HTML_CAPTURE_CLEANUP_ENABLED` existem apenas no
   contexto `deploy-preview`.
3. **M-04 (médio, condicional a alto):** a exclusão de uma sessão antiga podia remover por cascata
   um filho recente quando os critérios de data ficavam inconsistentes.
4. **M-03 (médio):** o código não validava que `CLEANUP_DATABASE_URL` fosse uma conexão direta/SSL;
   essa pendência permanece.
5. **Divergência de memberships:** a Fase 5F.11 registrou uma membership administrativa excepcional
   de `neondb_owner`; a 5F.13 observou ausência de memberships. A role não foi alterada nesta fase.

Esta fase é exclusivamente local. Nenhum deploy, alteração Netlify/Neon, execução de Scheduled
Function, DELETE/INSERT/UPDATE remoto, mudança de flags/roles/grants/migrations, commit ou push foi
executado. Os dois registros sintéticos remotos permanecem preservados.

---

## 2. Arquivos alterados

### Código

- `netlify/functions/_lib/cleanup-retention.mjs`
  - orçamento global, deadline, limites de lote, status explícito, guarda de cascata;
- `netlify/functions/cleanup-html-capture.mjs`
  - repasse das opções de orçamento e status real da execução;
- `scripts/cleanup-retention.mjs`
  - saída manual com status, motivo, orçamento e truncamento.

### Testes

- `tests/analytics/cleanup-retention.spec.mjs`
  - orçamento, interrupção, retomada, timeout de lote, release, falha de conexão, resultado parcial;
- `tests/analytics/capture.integration.spec.mjs`
  - matriz de sessões/filhos, lock real, orçamento em PostgreSQL 17 e retomada, falha parcial.

### Cópias do B1 sincronizadas localmente

- `validation-b1/netlify/functions/cleanup-html-capture.mjs`
- `validation-b1/netlify/functions/_lib/cleanup-retention.mjs`
- `validation-b1/shared-manifest.json`

Nenhuma SQL, role, grant, migration ou variável remota foi alterada.

---

## 3. Estratégia de orçamento

### Parâmetros

| Parâmetro | Padrão | Limites | Uso |
|---|---:|---:|---|
| `timeBudgetMs` | 20.000 ms | 1.000–25.000 ms | orçamento global da execução |
| `shutdownReserveMs` | 1.000 ms | 100–5.000 ms | margem para unlock, release, logging |
| `batchTimeoutMs` | 5.000 ms | 100–15.000 ms | `statement_timeout` do lote |
| `batchSize` | 1.000 | 1–5.000 | registros por lote |
| `maxBatches` | 100 | 1–1.000 | limite de lotes por tabela |

O padrão de 20 s fica abaixo do limite de 30 s da plataforma. O deadline é calculado no início,
antes da conexão:

`deadline = início + timeBudgetMs - shutdownReserveMs`

A conexão, a validação de identidade/role e a preparação consomem o mesmo orçamento. O código não
aumenta o timeout da plataforma e não inicia um lote se:

`restante < batchTimeoutMs + 250 ms`

O `statement_timeout` de cada lote é configurável e nunca é fixo em 30 s. O `lock_timeout` é limitado
ao tempo restante do lote. O advisory lock é liberado no `finally` e o client é sempre liberado; no
caminho da Scheduled Function, o pool criado pela função é fechado no `finally`.

### Resultado explícito

O retorno agora inclui:

- `status`: `complete`, `partial`, `budget_exhausted` ou `locked`;
- `reason`: `time_budget`, `max_batches`, `lock_busy` ou `null`;
- `budgetExhausted`;
- `tables[nome] = {removidos, lotes, truncado, skipped, reason}`;
- `truncated`, `durationMs`, `timeBudgetMs`, `shutdownReserveMs`, `batchTimeoutMs`.

Se o orçamento acabar, tabelas não iniciadas recebem `skipped:true` e `reason:'time_budget'`. Uma
execução posterior retoma pelos mesmos cutoffs; os lotes já commitados são idempotentes e não há
duplicidade ou perda de integridade. O lote em andamento sempre faz `COMMIT` ou `ROLLBACK`; o lock e
a conexão são liberados em todos os caminhos.

---

## 4. Estratégia de exclusão em cascata

O problema reproduzido na 5F.13 era: sessão com `last_seen_at` antigo, filho com `received_at`
recente, exclusão da sessão removendo o filho recente por `ON DELETE CASCADE`.

A correção mantém as constraints e o cascade, mas impede a sessão de ser elegível quando existe
filho recente. O `DELETE FROM sessions` agora exige, além do cutoff de `last_seen_at`:

- nenhum `pageviews.received_at` dentro do prazo configurado de pageviews;
- nenhum `events.received_at` dentro do prazo configurado de events;
- nenhum `affiliate_clicks.received_at` dentro do prazo configurado de affiliate.

Os prazos de retenção não foram alterados. O fluxo continua excluindo filhos individualmente
elegíveis antes das sessões; a cascata permanece apenas para filhos já elegíveis. `visitors` continua
protegido por `NOT EXISTS sessions`.

Cenários cobertos por teste:

1. sessão antiga + filhos antigos: árvore removida;
2. sessão antiga + filho recente: sessão, visitante e filho preservados;
3. sessão recente + filho antigo: apenas o filho elegível é removido;
4. sessão sem filhos: sessão e visitante removidos;
5. múltiplos filhos em faixas diferentes: filho recente preserva a árvore; filhos antigos elegíveis
   são removidos;
6. falha parcial durante o lote: filhos recentes e sessão preservados; rollback do lote com erro.

---

## 5. Testes e resultados

Execução local com PostgreSQL 17.11 descartável. Nenhum banco remoto foi usado para testes
destrutivos.

| Verificação | Resultado |
|---|---|
| Analytics (unitários + integrações PostgreSQL) | **135/135 pass**, 0 fail, 0 skip |
| B1 (`sync:shared` + build + test) | **19/19 pass** |
| Consentimento no navegador | **2/2 pass** |
| Build B1 | passou: 6 arquivos + manifest, 10,0 KiB |
| Manifesto compartilhado | 16 arquivos idênticos |
| Migrations locais | 6 |

Cobertura específica da retenção:

- orçamento global e deadline;
- não início de lote sem margem;
- interrupção entre lotes e status `budget_exhausted`;
- retomada após interrupção sem duplicidade/perda;
- liberação do advisory lock e `release` do client;
- timeout de lote configurável, sem `statement_timeout=30s` fixo;
- falha de conexão e configuração;
- lock real concorrente;
- rollback de lote com erro;
- permissões mínimas já existentes;
- cascata e preservação de filhos recentes;
- integridade referencial (FKs);
- resultado `partial` por `maxBatches`.

A execução usa banco de teste criado vazio; as roles de teste são criadas antes das migrations,
preservando os grants. Nenhum teste remoto de 429, cron ou execução real da Scheduled Function foi
feito.

---

## 6. Análise dos contextos Netlify

### Configuração observada na fase anterior

- Deploy B1: `6afb78132cdffef6e6a05696`, `deploy-preview`, `ready`, não publicado.
- `CLEANUP_DATABASE_URL`: secret site-specific, somente no contexto `deploy-preview`.
- `HTML_CAPTURE_CLEANUP_ENABLED`: somente no contexto `deploy-preview`, valor `false`.
- Produção: `DATABASE_URL` e `EDGE_INGEST_SECRET`, sem cleanup/flag.
- `function_schedules` contém `cleanup-html-capture` com `15 3 * * *`.

### Por que o cleanup não roda hoje

A documentação oficial da Netlify estabelece que Scheduled Functions:

- têm limite de execução de **30 s**;
- só executam no cron em **deploys publicados**;
- podem ser acionadas manualmente em preview pelo **Run now**;
- não são invocáveis por URL;
- não recebem `POST`/payload.

Como o B1 é preview, o cron não dispara. Se o preview fosse promovido, o contexto de produção não
possui `CLEANUP_DATABASE_URL` nem a flag. Portanto, copiar as variáveis “para produção” sem definir
um alvo publicado, isolamento e autorização não resolve o problema.

### Recomendação futura

1. Manter o preview atual para **Run now** manual e validação controlada, nunca como cron.
2. Para operação agendada, usar um alvo publicado dedicado — não promover cegamente o preview B1.
3. Configurar `CLEANUP_DATABASE_URL` (direta, SSL, banco/role B1) e
   `HTML_CAPTURE_CLEANUP_ENABLED=true` no contexto do alvo publicado, após autorização.
4. Definir `RETENTION_TIME_BUDGET_MS` conservador (20 s) e `RETENTION_BATCH_TIMEOUT_MS` (5 s);
   começar com `RETENTION_MAX_BATCHES` baixo.
5. Validar primeiro em dry-run/local; só depois habilitar cron.
6. Não alterar variáveis remotas nesta fase.

---

## 7. Divergência de memberships

### Relatos

- **5F.11:** registrou membership administrativa excepcional de `neondb_owner`, aceita como
  comportamento de plataforma.
- **5F.13:** consulta somente de leitura encontrou **nenhuma membership** recebida pela role
  `validation_b1_cleanup`.

Não há evidência suficiente para afirmar se a membership foi removida pela plataforma, se foi
transitória ou se houve diferença de momento/consulta. A role não foi alterada.

### Consulta somente de leitura preparada (NÃO EXECUTADA)

```sql
-- 1. Memberships recebidas e concedidas
SELECT
    u.rolname AS member,
    g.rolname AS granted_role,
    grantor.rolname AS grantor,
    m.admin_option
FROM pg_auth_members m
JOIN pg_roles u ON u.oid = m.member
JOIN pg_roles g ON g.oid = m.roleid
JOIN pg_roles grantor ON grantor.oid = m.grantor
WHERE u.rolname = 'validation_b1_cleanup'
   OR g.rolname = 'validation_b1_cleanup'
ORDER BY member, granted_role, grantor;

-- 2. Atributos administrativos
SELECT rolname, rolcanlogin, rolsuper, rolcreatedb, rolcreaterole,
       rolreplication, rolbypassrls, rolinherit
FROM pg_roles
WHERE rolname IN ('validation_b1_cleanup', 'validation_b1_runtime')
ORDER BY rolname;

-- 3. Privilégios efetivos nas 13 tabelas
SELECT t.nome,
       has_table_privilege('validation_b1_cleanup', 'public.' || quote_ident(t.nome), 'SELECT') AS select_ok,
       has_table_privilege('validation_b1_cleanup', 'public.' || quote_ident(t.nome), 'DELETE') AS delete_ok,
       has_table_privilege('validation_b1_cleanup', 'public.' || quote_ident(t.nome), 'INSERT') AS insert_ok,
       has_table_privilege('validation_b1_cleanup', 'public.' || quote_ident(t.nome), 'UPDATE') AS update_ok,
       has_table_privilege('validation_b1_cleanup', 'public.' || quote_ident(t.nome), 'TRUNCATE') AS truncate_ok
FROM unnest(ARRAY[
    'visitors','sessions','pageviews','events','affiliate_clicks',
    'ingest_events','rate_limits','html_events','html_traffic_daily',
    'html_indicators_monthly','edge_daily_counters','edge_nonces','edge_rate_limits'
]::text[]) AS t(nome)
ORDER BY t.nome;

-- 4. Acesso ao schema_migrations e ao banco neondb
SELECT
    has_table_privilege('validation_b1_cleanup', 'public.schema_migrations', 'SELECT') AS schema_migrations_select,
    has_database_privilege('validation_b1_cleanup', 'neondb', 'CONNECT') AS neondb_connect;
```

Essa consulta deve ser executada em janela autorizada, apenas leitura, antes de qualquer ativação
operacional.

---

## 8. Pendências para validação operacional futura

1. **Runtime publicado:** executar a Scheduled Function manualmente em alvo controlado; nunca cron
   no preview.
2. **Dry-run:** implementar/validar `CLEANUP_DRY_RUN` com `SELECT` dos mesmos cutoffs, sem `DELETE`,
   sem novo privilégio e sem endpoint público.
3. **Orçamento real:** medir duração com dados representativos e confirmar encerramento abaixo de
   30 s; ajustar `maxBatches`.
4. **Conexão:** confirmar endpoint direto, SSL e advisory lock em runtime publicado; implementar
   validação de URL/host/SSL se necessário.
5. **Cron:** definir alvo publicado dedicado e contexto correto das variáveis; não promover o B1
   preview.
6. **Rate limiting:** enforcement real, 429, IP interno Edge→Function e `excludedPath` continuam não
   comprovados.
7. **Memberships:** executar a consulta preparada e reconciliar a divergência 5F.11/5F.13.
8. **Dados sintéticos:** preservar os 2 registros atuais até autorização específica.

Nenhuma dessas etapas foi executada nesta fase.

---

## 9. Classificação final

**2 — Aprovado com pendências.** O orçamento global seguro, a interrupção/retomada, a proteção
contra cascata e a cobertura de testes foram implementados sem regressão local. O runtime real da
Scheduled Function, o alvo publicado, o dry-run, a conexão direta/SSL e o enforcement de rate
limiting ainda precisam de validação operacional autorizada.
