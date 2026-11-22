# Fase 5F.52 - Auditoria de prontidao remota para homologacao funcional B1

Status: **auditoria de leitura concluida; nenhum deploy, upload, migration remota, alteracao de
roles/grants, secrets/flags, cleanup, commit ou push executado**.
Data/hora de referencia: **2026-11-20T20:42:23Z**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.

**Classificacao: 3 - Bloqueado.**
O artefato local e o destino estao consistentes, mas a role de runtime remota
`validation_b1_runtime` **nao possui privilegios de tabela das Fases 2/3** necessarios ao
`/api/collect`. A homologacao funcional nao pode ser executada sem uma alteracao de grants
autorizada ou uma decisao de arquitetura.

---

## 1. Integridade do artefato congelado

Artefato:

```text
%TEMP%\opencode\b1-artefato-5f51
```

Verificacao sem reconstruir:

| Item | Resultado |
|---|---|
| Arquivos | 32 |
| Bytes | 105.927 |
| Digest validado | `6b80bea75089a28063df8bd3926772a8e59e163f7db08e1093ed9ac2168ab470` |
| Manifesto do pacote | `32fc940451ee59b3bcadbe58f3af17ab7093717e55d4fbb1f8661214bfc7d1ab` |
| Config | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` |
| Estaticos | 7 |
| Functions | 16 |
| Edge | 7 |
| Redirects | 0 |
| Read-only | sim |
| `validarPacote` | passou |
| Digest recalculado | igual ao aprovado |

A integridade do artefato local esta comprovada. Nao foi reconstruido; nao foi publicado.

---

## 2. Identidade do destino Netlify

Consulta somente leitura:

| Item | Resultado |
|---|---|
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Nome | `portal-contas-validation-b1` |
| URL | `https://portal-contas-validation-b1.netlify.app` |
| Team | `BruMiTa` / `697d58587a017c3396fb416e` |
| Deploy atual | `6b007a6d6e15671b125b952e` |
| Estado do deploy | `ready` |
| Contexto | `deploy-preview` |
| `published_at` | `null` |
| `published_deploy` | `null` |
| Functions atuais | `capture-html`, `cleanup-html-capture` |
| Edge atual | presente |
| `publish` | `dist` |
| Gate oficial | `--check`/`--confirm`, `--draft`, `--no-build` |

O deploy completo de 32 arquivos ainda **nao foi publicado**. O site B1 continua sem deploy
publicado e nao ha producao alterada.

As variaveis atuais do contexto preview incluem:

- `DATABASE_URL`;
- `CLEANUP_DATABASE_URL`;
- `EDGE_ANALYTICS_ENABLED=false`;
- `EDGE_ANALYTICS_SAMPLE_RATE=0.1`;
- `EDGE_CAPTURE_ENABLED=false`;
- `EDGE_INGEST_SECRET`;
- `HTML_CAPTURE_CLEANUP_ENABLED=false`.

Nao foram encontradas `ALLOWED_ORIGINS`, `RATE_LIMIT_HMAC_SECRET` ou `ANALYTICS_INGEST_ENABLED`.

---

## 3. Estado do Neon B1

Consulta somente leitura, sem senha/URL exibida:

| Item | Resultado |
|---|---|
| Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` |
| Branch ID | `br-misty-sound-b6pnt7iw` |
| Database | `validation_b1` |
| PostgreSQL | 17.12 |
| Migrations | 001-006 |
| Migration 007 no remoto | **ausente** |
| `sessions.user_agent` no remoto | **presente** (1 coluna) |
| Owner | `neondb_owner` |

Nao houve escrita, migration, grant ou alteracao de role.

---

## 4. Roles e permissões

### 4.1 `validation_b1_runtime`

Atributos: nao superuser, nao createdb, nao createrole, nao replication, nao bypassrls, inherit=true.
Nao possui membership.

Privilegios de tabela efetivos, somente leitura de catalogo:

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `visitors` | nao | nao | nao | nao |
| `sessions` | nao | nao | nao | nao |
| `pageviews` | nao | nao | nao | nao |
| `events` | nao | nao | nao | nao |
| `affiliate_clicks` | nao | nao | nao | nao |
| `ingest_events` | nao | nao | nao | nao |
| `rate_limits` | nao | nao | nao | nao |
| `html_events` | nao | sim | nao | nao |
| `html_traffic_daily` | sim | sim | sim | nao |
| `html_indicators_monthly` | sim | sim | sim | nao |
| `edge_daily_counters` | sim | sim | sim | nao |
| `edge_nonces` | nao | sim | nao | nao |
| `edge_rate_limits` | sim | sim | sim | nao |

Schema: `USAGE` em `public`, sem `CREATE`; sem `SELECT` em `schema_migrations`.

**Bloqueador:** o endpoint `/api/collect` precisa escrever/ler em `visitors`, `sessions`,
`pageviews`, `events`, `affiliate_clicks`, `ingest_events` e `rate_limits`. A role configurada
como runtime B1 nao tem nenhum desses privilegios. O fluxo de análise first-party falharia sem
grants adicionais ou sem trocar de role, o que nao e aceitavel silenciosamente.

### 4.2 `validation_b1_cleanup`

Atributos: nao superuser/createdb/createrole/replication/bypassrls; inherit=false; sem membership.

Privilegios: SELECT + DELETE nas 13 tabelas; sem INSERT/UPDATE/TRUNCATE; `USAGE` no schema, sem
CREATE; sem `schema_migrations`.

Conclusao: cleanup continua coerente com o desenho de retencao. Nao foi executado.

### 4.3 `neondb_owner`

Owner do banco, com atributos administrativos da plataforma (CREATEDB/CREATEROLE/REPLICATION/
BYPASSRLS). Nao e a role de runtime. Possui membership administrativa em
`validation_b1_runtime` e `validation_b1_cleanup` com `inherit_option=false` e `set_option=false`.

Nao foi usada para runtime ou cleanup nesta fase.

---

## 5. Migration 007 e plano de aplicacao futura

A migration local remove:

```sql
ALTER TABLE sessions DROP COLUMN IF EXISTS user_agent;
```

Estado remoto: migration 007 ausente; coluna ainda existe; 6 migrations.

Sequencia futura, somente com autorizacao propria:

1. Preflight somente leitura: database `validation_b1`, owner `neondb_owner`, branch correta,
   migrations exatamente 001-006, coluna existente, sem 007.
2. Confirmar que o codigo novo (sem escrita de UA) esta no deploy B1.
3. Aplicar 007 em transacao, via runner owner.
4. Verificar 7 migrations, ausencia da coluna, schema e analytics.
5. Aplicar grants adicionais especificos a `validation_b1_runtime` para o fluxo collect, em
   transacao/acao separada e autorizada.
6. Validar efetivamente com a role runtime.
7. Rollback de schema apenas recria coluna vazia; nao recupera dados apagados.

A migration 007 **nao resolve** a falta de privilegios da runtime. Os dois itens sao
independentes e precisam de autorizacao e validacao separadas.

---

## 6. Matriz de variaveis e flags

Nenhum valor foi configurado ou revelado.

| Variavel | Obrigatoria | Contexto | Estado atual | Risco |
|---|---|---|---|---|
| `DATABASE_URL` | sim | preview/runtime | presente, valor nao lido | role/DB errados |
| `CLEANUP_DATABASE_URL` | cleanup | preview | presente, secret | role/DB errados |
| `ALLOWED_ORIGINS` | sim para collect | preview | ausente no levantamento | 403 para B1 |
| `RATE_LIMIT_HMAC_SECRET` | sim para collect | preview | ausente no levantamento | 503/limites errados |
| `EDGE_INGEST_SECRET` | sim para Edge/capture | preview | presente, secret | HMAC invalido |
| `EDGE_INGEST_KEY_ID` | opcional | Edge/Function | nao observado | default v1 |
| `ANALYTICS_INGEST_ENABLED` | teste collect | preview | ausente | 204 disabled |
| `EDGE_CAPTURE_ENABLED` | teste Edge | preview | false | Edge nao captura |
| `EDGE_ANALYTICS_ENABLED` | teste Edge | preview | false | sem captura Edge |
| `HTML_CAPTURE_CLEANUP_ENABLED` | teste cleanup | preview | false | cleanup nao roda |
| `EDGE_ANALYTICS_SAMPLE_RATE` | opcional | preview | 0.1 | amostra divergente |

`CLEANUP_DATABASE_URL` e as flags de cleanup continuam restritas ao preview; nao foram
modificadas.

---

## 7. CSP, cliente e consentimento

`js/analytics.js` usa:

- `ENDPOINT = '/api/collect'`;
- `navigator.sendBeacon(ENDPOINT, ...)` e `fetch(ENDPOINT, ...)`;
- consentimento local antes de iniciar;
- Consent Mode v2;
- nenhum envio antes do consentimento.

O `_headers` B1 atual tem:

```text
connect-src 'none'
```

Portanto, um cliente carregado no B1 nao pode chamar `/api/collect`. A primeira janela server-side
nao depende de CSP; uma janela de navegador precisara de CSP ajustada para
`connect-src 'self'` (ou origem B1 estrita), sem liberar producao ou dominios externos.

O artefato completo tambem nao inclui o cliente canonico `js/analytics.js`; inclui o endpoint e a
Edge. Testes server-side podem ocorrer sem browser. UI/consentimento de navegador exige decisao
separada sobre cliente minimo e CSP.

`ALLOWED_ORIGINS` deve conter somente a origem exata do deploy B1. Como o draft URL e dinamico
(`<deploy>--portal-contas-validation-b1.netlify.app`), a origem exata de um novo deploy so sera
conhecida apos a janela; a configuracao deve ocorrer antes do teste de browser, sem wildcard e sem
incluir producao por conveniencia.

---

## 8. Sequencia operacional segura

Cada grupo exige autorizacao especifica:

1. Confirmar digest local `6b80bea...` e 32 arquivos.
2. Autorizar um unico deploy draft B1.
3. Publicar pelo gate, validar ID/contexto/draft/estado e ausencia de producao.
4. Autorizar migration 007 e grants adicionais da runtime.
5. Aplicar 007 na branch B1; validar schema e 7 migrations.
6. Aplicar grants minimos para collect na `validation_b1_runtime`; validar negativamente DELETE/
   TRUNCATE/DDL.
7. Autorizar/ configura `ALLOWED_ORIGINS` e `RATE_LIMIT_HMAC_SECRET` apenas no preview.
8. Ativar `ANALYTICS_INGEST_ENABLED=true` somente na janela; testar server-side.
9. Testar Edge Capture separadamente (`EDGE_CAPTURE_ENABLED`/`EDGE_ANALYTICS_ENABLED`) com flags
   controladas.
10. Testar cleanup por ultimo, somente com dados sinteticos, SSL/roles comprovados e autorizacao.
11. Reverter flags e variaveis de teste; registrar evidencias; producao intocada.

O deploy do novo artefato nao deve ocorrer antes de o bloqueador de privilegios ser aceito como
pendencia ou resolvido.

---

## 9. Matriz de testes funcionais

| Caso | Requer escrita remota? | Esperado |
|---|---|---|
| Sem consentimento | sim para ingerir; local tambem | 204/nenhuma linha |
| Consentimento recusado | sim para ingerir; local tambem | 204/nenhuma linha |
| Consentimento aceito | sim | 202/linha coerente |
| Origem nao permitida | sim (POST) | 403/nenhuma linha |
| Payload invalido | sim (POST) | 400/nenhuma linha |
| Payload acima do limite | sim (POST) | 413/nenhuma linha |
| Evento duplicado | sim | uma linha/efeito |
| Rate limit excedido | sim | 429 |
| Valores/resultados de calculadora | sim/local | nenhuma persistencia |
| UA/IP bruto | leitura de banco | ausente |
| Roles runtime | somente leitura de catalogo | sem admin/DDL |
| Cleanup fora da retencao | sim, autorizacao separada | nenhuma exclusao indevida |

Testes puramente locais ja cobrem validacao/privacidade; os testes de escrita remota dependem de
grants e flags.

---

## 10. Bloqueadores e riscos residuais

### Bloqueador principal

- **B1 runtime sem grants das Fases 2/3**: `/api/collect` nao pode operar com
  `validation_b1_runtime` no estado atual.

### Bloqueadores/pendencias adicionais

- Migration 007 ausente no Neon B1.
- `ALLOWED_ORIGINS` e `RATE_LIMIT_HMAC_SECRET` ausentes.
- `ANALYTICS_INGEST_ENABLED` ausente.
- Novo artefato de 32 arquivos nao publicado.
- CSP atual `connect-src 'none'` impede cliente browser.
- Cliente canonico de analytics nao incluido no artefato B1.
- Cleanup nao executado/testado no runtime.
- Draft URL dinamico: origem exata futura precisa ser registrada apos o deploy.
- Autorizacao de grants e migration e separada.

Riscos residuais: TOCTOU/CLI externo continuam documentados; nada foi alterado.

---

## 11. Operacoes que exigirao autorizacao especifica

1. Deploy unico do artefato completo B1.
2. Migration 007 no Neon B1.
3. Grants adicionais para `validation_b1_runtime`.
4. Criacao/configuracao de `ALLOWED_ORIGINS` e `RATE_LIMIT_HMAC_SECRET`.
5. Ativacao de flags de ingestao/Edge/cleanup.
6. Testes HTTP de escrita e rate limit.
7. Execucao de cleanup.
8. Qualquer producao.

Nenhuma foi executada.

---

## 12. Confirmacao de ausencia de escrita remota

- Nenhum deploy/upload.
- Nenhuma migration ou grant.
- Nenhuma alteracao de roles, secrets, flags, variaveis ou producao.
- Nenhum cleanup ou Scheduled Function.
- Nenhuma escrita de dados no Neon.
- Apenas consultas SQL `SELECT` e API Netlify de leitura.
- Nenhum commit, push ou PR.

---

## 13. Classificacao final

**3 - Bloqueado.**

O artefato congelado esta integro e o destino B1 esta correto, mas a preparacao remota nao esta
pronta para homologacao funcional: a role runtime nao tem os privilegios necessarios para
`/api/collect`, a migration 007 e os secrets/flags de collect ainda nao estao aplicados e o CSP
atual bloqueia cliente browser. E necessario resolver e autorizar essas etapas antes de qualquer
teste funcional remoto.

Nao executar deploy, upload, migration, cleanup, alteracao de flags, commit, push ou PR.
