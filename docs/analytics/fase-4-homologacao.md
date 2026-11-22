# Fase 4 - Homologação isolada

Status: **procedimento preparado; nenhuma homologação, deploy ou configuração real foi executada**. Este documento deve ser seguido somente após autorização explícita.

## 1. Objetivo

Validar a Fase 4 em um site Netlify isolado e em um banco Neon separado da produção, com dados sintéticos e credenciais exclusivas, sem qualquer comunicação com produção.

## 2. Inventário de acessos da limpeza

A rotina `netlify/functions/_lib/cleanup-html-capture.mjs` executa, em uma única transação:

| Tabela | Operação | Permissão necessária |
|---|---|---|
| `html_events` | `DELETE ... WHERE` | `SELECT`, `DELETE` |
| `html_traffic_daily` | `DELETE ... WHERE` | `SELECT`, `DELETE` |
| `html_indicators_monthly` | `DELETE ... WHERE` | `SELECT`, `DELETE` |
| `edge_daily_counters` | `DELETE ... WHERE` | `SELECT`, `DELETE` |
| `edge_nonces` | `DELETE ... WHERE` | `SELECT`, `DELETE` |
| `edge_rate_limits` | `DELETE ... WHERE` | `SELECT`, `DELETE` |

Não há CTE, `RETURNING`, sequence, `TRUNCATE`, DDL ou acesso às tabelas das Fases 2/3. O `SELECT` é necessário para avaliar os predicados de retenção. A transação garante rollback total em falha parcial.

A Scheduled Function usa exclusivamente `CLEANUP_DATABASE_URL`, que deve apontar para `analytics_cleanup`. Ela não usa a role de ingestão nem o owner.

## 3. Três roles

| Role | Uso | Permissões |
|---|---|---|
| `analytics_runtime` | Ingestão Edge -> Function | `CONNECT`, `USAGE` em `public`, `SELECT/INSERT/UPDATE` nas tabelas da Fase 4 |
| `analytics_cleanup` | Scheduled Function de limpeza | `CONNECT`, `USAGE` em `public`, `SELECT/DELETE` nas tabelas da Fase 4 |
| Owner do banco | Migrações e criação de roles/objetos | DDL; não deve ser usada pelas Functions |

Nenhuma role é superuser, owner de tabela/banco, criadora de banco/schema/extensão ou administradora de outras roles.

### 3.1 Criação das roles fora do repositório

Executar como owner/administrador autorizado, com senhas geradas e armazenadas no gerenciador de segredos do ambiente:

```sql
CREATE ROLE analytics_runtime
    LOGIN PASSWORD '<RUNTIME_SECRET>'
    NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT;

CREATE ROLE analytics_cleanup
    LOGIN PASSWORD '<CLEANUP_SECRET>'
    NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT;
```

Não incluir senhas reais em SQL versionado, logs, documentação ou frontend. A criação e a troca de senha são operações administrativas externas.

### 3.2 Grants

As migrations `004` e `005` aplicam grants condicionais quando as roles existem. Executar as migrations com a role owner, nunca com as roles de runtime/limpeza.

A role `analytics_cleanup` não recebe `INSERT`, `UPDATE`, `TRUNCATE`, `DELETE` nas Fases 2/3, `CREATE` no schema/banco ou privilégios administrativos.

## 4. Variáveis de ambiente

Configurar na Netlify **somente no site de homologação**, com escopo de Functions (e Edge quando indicado). Não usar o site de produção.

| Variável | Finalidade | Escopo | Segredo | Homologação | Produção |
|---|---|---|---|---|---|
| `ANALYTICS_INGEST_ENABLED` | Ingestão da Fase 2 | Functions | Não | `false` | `false` até ativação autorizada |
| `DATABASE_URL` | Conexão da ingestão Fase 4 | Functions | Sim | `analytics_runtime` no banco de homologação | `analytics_runtime` no banco de produção |
| `MIGRATION_DATABASE_URL` | Migrações/owner | Somente operação segura de migração | Sim | owner do banco de homologação | owner, nunca na runtime |
| `TEST_DATABASE_URL` | Testes locais/CI | Ambiente local | Sim | PostgreSQL temporário | Não usar em produção |
| `ANALYTICS_TEST_DB` | Guarda dos testes | Ambiente local | Não | `1` | Não usar em produção |
| `RATE_LIMIT_HMAC_SECRET` | HMAC da Fase 2 | Functions | Sim | segredo aleatório de 32+ bytes | segredo aleatório de 32+ bytes |
| `EDGE_CAPTURE_ENABLED` | Liga a Edge Function de captura | Functions/Edge | Não | `true` somente durante o teste | `false` até ativação autorizada |
| `EDGE_ANALYTICS_ENABLED` | Autoriza finalidade analytics no edge | Functions/Edge | Não | `true` durante o teste | `false` até ativação autorizada |
| `EDGE_SECURITY_ENABLED` | Reservado para segurança | Functions/Edge | Não | `false` | `false` |
| `EDGE_INGEST_SECRET` | HMAC Edge -> Function | Functions/Edge | Sim | segredo exclusivo de homologação, 32+ bytes | segredo exclusivo de produção |
| `EDGE_INGEST_KEY_ID` | Identificador da chave HMAC | Functions/Edge | Não | `v1` | `v1` ou versão autorizada |
| `EDGE_ANALYTICS_SAMPLE_RATE` | Amostragem de analytics | Functions/Edge | Não | `0.1` | `0.1` até nova aprovação |
| `EDGE_CAPTURE_TIMEOUT_MS` | Timeout Edge → Function | Functions/Edge | Não | `2000` (250–5000) | `2000` até medição real |
| `EDGE_CAPTURE_MAX_BODY_BYTES` | **Fixo em 8192; não configurável** | — | — | ignorado | ignorado |
| `EDGE_CAPTURE_MAX_EVENTS_DAY` | Limite diário | Functions | Não | valor de teste, ex. `100` | `25000` ou valor aprovado |
| `EDGE_CAPTURE_TIMESTAMP_WINDOW_SECONDS` | Janela do timestamp | Functions | Não | `60` | `60` |
| `EDGE_CAPTURE_NONCE_TTL_SECONDS` | TTL do nonce | Functions | Não | `600` | `600` |
| `EDGE_RATE_MAX` | Limite por rate_key | Functions | Não | `20` no teste | `120` ou valor aprovado |
| `EDGE_RATE_WINDOW_SECONDS` | Janela do rate limit | Functions | Não | `300` | `300` |
| `EDGE_CAPTURE_RAW_RETENTION_DAYS` | Retenção bruta | Functions | Não | `7` | `7` |
| `EDGE_CAPTURE_AGGREGATE_RETENTION_DAYS` | Retenção agregada | Functions | Não | `90` | `90` |
| `EDGE_CAPTURE_INDICATOR_RETENTION_MONTHS` | Indicadores | Functions | Não | `13` | `13` |
| `EDGE_CAPTURE_NONCE_RETENTION_HOURS` | Nonces | Functions | Não | `24` | `24` |
| `EDGE_CAPTURE_RATE_RETENTION_HOURS` | Rate limits | Functions | Não | `24` | `24` |
| `EDGE_CAPTURE_COUNTER_RETENTION_DAYS` | Contadores diários | Functions | Não | `90` | `90` |
| `HTML_CAPTURE_CLEANUP_ENABLED` | Ativa a limpeza agendada | Functions | Não | `false` por padrão; `true` somente no teste manual | `false` até ativação autorizada |
| `CLEANUP_DATABASE_URL` | Conexão da limpeza | Functions | Sim | `analytics_cleanup` no banco de homologação | `analytics_cleanup` no banco de produção |
| `ALLOWED_ORIGINS` | Origens da Fase 2 | Functions | Não | URL do site de homologação | domínio de produção |

Valores de credenciais nunca devem aparecer em HTML, JS, logs, issues, PRs ou arquivos versionados.

## 5. Etapa A - Preparação isolada

1. Criar um **site Netlify separado** para homologação, sem domínio de produção e sem integração com o site principal.
2. Criar um **projeto/branch/database Neon separado**, sem conexão com o banco de produção.
3. Criar roles `analytics_runtime` e `analytics_cleanup` no banco de homologação, com senhas no gerenciador de segredos.
4. Aplicar migrations `001` a `005` usando a role owner do banco de homologação.
5. Configurar as variáveis da seção 4 no site de homologação, com escopo Functions/Edge.
6. Confirmar que o site/banco de produção não foram tocados: comparar IDs, domínios, branches e logs.
7. Popular dados sintéticos apenas no banco de homologação; não copiar dados reais.

## 6. Etapa B - Edge Function

> **Atenção:** em projeto **privado**, a chamada interna `fetch('/api/capture-html')` é uma nova
> requisição sem cookie de login e **não alcança a Function**. Não há bypass de SSO documentado.
> Para validar o caminho Edge → Function ponta a ponta, use um alvo público (site/branch de teste
> público) ou a arquitetura com Blobs descrita em
> [`fase-5f-1-1-investigacao.md`](fase-5f-1-1-investigacao.md). A homologação privada continua
> adequada para entrega de página, consentimento, flags e falha silenciosa.

1. Publicar somente no site de homologação, após autorização. Se o objetivo for validar a ingestão,
   usar o alvo público autorizado.
2. Verificar que `/calculadoras/imc` e outras URLs HTML retornam o conteúdo original.
3. Confirmar que `context.next()` entrega a resposta e `context.waitUntil()` agenda a captura.
4. Confirmar que a captura não atrasa a resposta e que falha do coletor é silenciosa.
5. Validar `onError: "bypass"` induzindo erro controlado no ambiente de homologação.
6. Confirmar que imports `.mjs` e a Function interna `/api/capture-html` foram empacotados.
7. Verificar cache, redirects, assets e endpoints excluídos.
8. Medir CPU, TTFB p50/p95 e taxa de erros nos logs Netlify.

## 7. Etapa C - Consentimento

1. Sem cookie: nenhuma requisição a `/api/capture-html`.
2. Cookie com `analytics=1`: captura sujeita à amostragem.
3. Recusa: cookie `analytics=0`, nenhuma captura.
4. Retirada: IDs locais removidos, cookie invalidado, capturas posteriores interrompidas.
5. DNT: nenhuma captura.
6. GPC: nenhuma captura.
7. Cookie inválido, versão desconhecida ou expirado: nenhuma captura.
8. Cookie antigo após limpar `localStorage`: nenhuma captura e cookie invalidado.

## 8. Etapa D - Segurança da ingestão

1. HMAC válido sobre a mensagem canônica (`key-id`, timestamp, nonce e corpo) -> aceito.
2. HMAC inválido, ou timestamp/nonce/key-id alterado depois da assinatura -> rejeitado.
3. Timestamp passado/futuro -> rejeitado.
4. Nonce repetido -> `409`, sem nova linha.
5. Requisições concorrentes com mesmo nonce -> um aceite e um replay.
6. Rate limit concorrente -> máximo respeitado.
7. Limite diário concorrente -> cap respeitado.
8. Payload > 8 KB -> rejeitado.
9. `Content-Type` inválido, método inválido e key-id desconhecido -> rejeitados.
10. Confirmar respostas genéricas, sem segredos ou detalhes internos.

## 9. Etapa E - Persistência e privacidade

Consultar o banco de homologação e confirmar:

- `html_events` contém apenas as colunas aprovadas.
- Não existe IP completo.
- Não existe User-Agent bruto.
- Não existem valores ou resultados de calculadoras.
- Não existem `visitor_id` ou `session_id`.
- `sample_rate`, `sampling_method` e `is_estimate` estão corretos.
- `purpose=security` não foi persistido.
- Não há contagem de visitantes únicos; os relatórios usam requisições observadas/estimadas.
- Totais diários e mensais conferem com os eventos de teste.

## 10. Etapa F - Limpeza

1. Inserir dados sintéticos antigos e recentes na homologação.
2. Manter `HTML_CAPTURE_CLEANUP_ENABLED=false` fora da janela de teste.
3. No ambiente publicado de homologação, ativar a flag temporariamente.
4. Invocar manualmente a Scheduled Function `cleanup-html-capture` conforme o CLI da Netlify.
5. Confirmar remoção dos vencidos e preservação dos recentes.
6. Confirmar que tabelas das Fases 2/3 não são acessíveis pela role de limpeza.
7. Confirmar que a execução usa `CLEANUP_DATABASE_URL` com `analytics_cleanup`, não owner.
8. Verificar logs `status=ok`/`status=error` sem dados sensíveis.
9. Confirmar cron `15 3 * * *` UTC no painel Netlify.
10. Desligar a flag após o teste.

## 11. Etapa G - Estabilidade

- Simular falha de banco: a página continua funcionando e a coleta falha silenciosamente.
- Simular indisponibilidade do coletor: nenhum erro visível na página.
- Desativar `EDGE_CAPTURE_ENABLED`/`EDGE_ANALYTICS_ENABLED`: nenhuma nova captura.
- Verificar CPU, duração das Functions, erros 5xx e limites de runtime.
- Verificar que a limpeza não excede o limite de 30 s da Scheduled Function com o volume de teste.

## 12. Critérios de aprovação

A homologação só será aprovada se:

- nenhuma falha de coleta prejudicar a entrega da página;
- nenhuma captura ocorrer sem consentimento válido;
- nenhum replay for aceito;
- nenhum limite concorrente for ultrapassado;
- nenhuma role tiver privilégio indevido;
- nenhum dado além do escopo aprovado for persistido;
- a limpeza automática remover vencidos, preservar recentes e não tocar Fases 2/3;
- a coleta de segurança permanecer desativada;
- não houver comunicação entre homologação e banco de produção.

## 13. Desativação rápida

- **Captura:** definir `EDGE_CAPTURE_ENABLED=false` e `EDGE_ANALYTICS_ENABLED=false`; publicar a alteração. A Edge Function deixa de enviar eventos; a página continua estática.
- **Limpeza:** definir `HTML_CAPTURE_CLEANUP_ENABLED=false` e publicar. A Scheduled Function passa a responder `DISABLED` sem abrir banco.
- **Falha de limpeza:** procurar `html-capture-cleanup status=error code=...` nos logs; verificar conectividade/role/owner e alertas Netlify.
- **Segurança:** permanece `EDGE_SECURITY_ENABLED=false`; nenhuma coleta de segurança deve ser ativada nesta fase.

## 14. Fora do escopo

Este procedimento não autoriza deploy, criação de site/banco real, configuração de variáveis reais, migração de produção ou ativação de coleta. A execução exige autorização explícita.
