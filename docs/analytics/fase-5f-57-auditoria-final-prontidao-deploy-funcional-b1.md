# Fase 5F.57 - Auditoria final de prontidao para deploy draft funcional B1

Status: **auditoria local e remota somente leitura concluida**.
Data: **2026-11-21**.
Branch Git: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.

**Classificacao: 2 - Aprovado com pendencias.**

O artefato, o banco B1 e a separacao de roles estao consistentes. A ativacao funcional ainda nao
esta pronta: faltam variaveis obrigatorias de ingestao/origem e alguns valores secretos nao podem
ser validados estruturalmente pela API do Netlify.

Nao houve deploy, escrita no Neon, migration, grant, cleanup, alteracao de Netlify, commit ou push.

---

## 1. Resumo executivo

| Area | Resultado |
|---|---|
| Relatorio 5F.56 | Migration 007 e grants 009 documentados e aprovados |
| Artefato 5F.55 | Presente, congelado e com digest esperado |
| CSP do artefato | Restrita, com `'self'` e origem B1 exata |
| Neon B1 | 7 migrations, 14 tabelas, sem `sessions.user_agent` |
| Privilegios runtime | Contrato minimo confirmado |
| Netlify site/deploy | Site e deploy draft corretos; nada publicado |
| Variaveis Netlify | Configuracao de coleta incompleta |
| Testes de escrita nesta fase | Nenhum |
| Proximo passo | Configuracao/validacao antes de deploy funcional |

O bloqueio pratico e de **configuracao de ativacao**, nao de integridade do pacote ou do schema.

---

## 2. Evidencias verificadas do relatorio 5F.56

Lido integralmente o relatorio
`docs/analytics/fase-5f-56-aplicacao-remota-migration007-grants009-b1.md`.

Evidencias confirmadas:

- identificacao corrigida: projeto Neon `portal-contas-homologacao`, branch `validation-b1`,
  database `validation_b1`;
- preflight antes da escrita: 6 migrations, 14 tabelas, `sessions.user_agent` presente e
  runtime sem privilegios fase 2/3;
- runner transacional aplicou 007 e 009;
- postflight: 7 migrations, 14 tabelas, coluna `user_agent` ausente;
- checksum remoto da 007 igual ao local
  (`654b5743e400fdc91391f008497763d2975615ad336bc829e198fef583d473b7`);
- privilegios efetivos da runtime conferidos;
- testes positivos de ingestao, deduplicacao, rate limit e rollback;
- testes negativos de DDL, DELETE, TRUNCATE, roles, `schema_migrations` e origem nao autorizada;
- dados sinteticos foram identificados;
- nenhum cleanup, DELETE em massa ou TRUNCATE foi executado;
- ressalva de `pg_stat_ssl=false` com `--ssl require` preservada.

O relatorio 5F.56 e suficiente para confirmar a aplicacao, mas nao autoriza deploy nem ativacao.

---

## 3. Identidade dos ambientes

### 3.1 Neon

| Item | Confirmado |
|---|---|
| Project name | `portal-contas-homologacao` |
| Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` |
| Branch ID | `br-misty-sound-b6pnt7iw` |
| Branch state | `ready` |
| Database | `validation_b1` |
| Database owner | `neondb_owner` |
| PostgreSQL do projeto | 17 |
| Server version | `170012` (17.12) |
| Project state | `ready` |

O database `neondb` existe na mesma branch, mas nao foi usado. A branch `main` e o projeto Neon
principal nao foram acessados.

### 3.2 Netlify

| Item | Confirmado |
|---|---|
| Site name | `portal-contas-validation-b1` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Team ID | `697d58587a017c3396fb416e` |
| Team name | `BruMiTa` |
| URL do site | `http://portal-contas-validation-b1.netlify.app` |
| Deploy draft anterior | `6b007a6d6e15671b125b952e` |
| Contexto do deploy | `deploy-preview` |
| Estado do deploy | `ready` |
| `published_at` | `null` |
| `published_deploy` do site | `null` |

O deploy anterior continua sendo o artefato antigo; o novo artefato 5F.55 nao foi publicado.

---

## 4. Integridade do artefato 5F.55

Diretorio:

```text
C:\Users\Joanita\AppData\Local\Temp\opencode\b1-artifact-5f55
```

| Verificacao | Resultado |
|---|---|
| Diretorio existe | sim |
| SHA-256 integral | `834dce3dc8a1e7f88d77bc365da0226af5ba64911c5da9ac8450ee3ca30be513` |
| `package-manifest.json` SHA-256 | `dcba286b956750908715ad3accc43cb4d2cfedd63009348522e55bf9c3a0570d` |
| Arquivos | 32 |
| Bytes totais | 105.975 |
| Estaticos | 7 |
| Functions | 16 |
| Edge Functions | 7 |
| Redirects | 0 |
| `validarPacote` | passou |
| Digest recalculado | identico ao esperado |
| `dist/_headers` SHA-256 | `b98b4793ac11cc100247dcc06d9131a81833d61a070b3654254868c96fff9f92` |
| `_redirects` | ausente |
| `netlify/functions/collect.mjs` | presente, `config.path='/api/collect'` |
| `ua-parser-js` | `2.0.10` em `validation-b1/package.json` e importado no fluxo |
| Referencias a producao no artefato | nenhuma |
| Secrets/credenciais no artefato | nenhum valor; somente nomes de variaveis |

O artefato 5F.51 permanece em `b1-artifact-5f51`, com digest historico
`6b80bea75089a28063df8bd3926772a8e59e163f7db08e1093ed9ac2168ab470` e
`package-manifest.json` `32fc940451ee59b3bcadbe58f3af17ab7093717e55d4fbb1f8661214bfc7d1ab`.
Nao foi alterado.

### 4.1 CSP efetiva

Conteudo efetivo em `dist/_headers` do pacote:

```text
Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'none'; connect-src 'self' https://portal-contas-validation-b1.netlify.app; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
```

Confirmacoes:

- `connect-src` contem `'self'` e exatamente a origem B1;
- nao contem `*`, `*.netlify.app` ou `https:` generico;
- nao contem `portaldascontas.com.br`;
- `script-src`, `style-src`, `img-src`, `base-uri`, `form-action` e `frame-ancestors` preservados;
- o artefato contem `dist/_headers`, nao apenas uma configuracao local.

O artefato e o CSP estao **aprovados**. O problema remanescente e operacional/configuracao.

---

## 5. Estado do Neon apos a 5F.56 - somente leitura

| Verificacao | Resultado |
|---|---|
| Migrations | 001 a 007 |
| Tabelas publicas | 14 |
| Tabelas faltantes/extra | nenhuma |
| `sessions.user_agent` | 0 colunas |
| Runtime sem SUPERUSER/CREATEDB/CREATEROLE/REPLICATION/BYPASSRLS | confirmado |
| Runtime memberships | nenhuma |
| Runtime objetos possuidos | nenhum |
| Runtime CREATE no schema/database | false |
| Runtime SELECT em `schema_migrations` | false |

### 5.1 Privilegios efetivos

| Tabela | SELECT | INSERT | UPDATE | DELETE | TRUNCATE |
|---|---|---|---|---|---|
| `visitors` | sim | sim | sim | nao | nao |
| `sessions` | sim | sim | sim | nao | nao |
| `rate_limits` | sim | sim | sim | nao | nao |
| `pageviews` | somente `event_id` | sim | nao | nao | nao |
| `events` | somente `event_id` | sim | nao | nao | nao |
| `affiliate_clicks` | somente `event_id` | sim | nao | nao | nao |
| `ingest_events` | somente `event_id` | sim | nao | nao | nao |

A matriz remota coincide com o contrato da Fase 5F.53 e com a aplicacao da 5F.56.

### 5.2 Cleanup

| Verificacao | Resultado |
|---|---|
| Role | `validation_b1_cleanup` |
| Atributos administrativos | todos false |
| INHERIT | false |
| SELECT em `visitors` | sim |
| DELETE em `sessions` | sim |
| INSERT/UPDATE/TRUNCATE em `sessions` | nao |
| CREATE no schema | nao |
| Membership em `neondb_owner` | nao |

A cleanup nao foi alterada nesta fase.

### 5.3 Dados sinteticos e SSL

Os dados sinteticos da 5F.56 continuam no B1; **nenhum cleanup foi executado nesta fase** e
nenhum DELETE/TRUNCATE foi feito.

A conexao de auditoria usou `--ssl require` e o backend reportou `pg_stat_ssl.ssl=false`. A
ressalva da 5F.56 permanece: no Neon, o TLS pode terminar no proxy e esse campo nao prova, sozinho,
ausencia de TLS. A validacao criptografica ponta a ponta permanece nao comprovada.

---

## 6. Estado do Netlify e das variaveis

### 6.1 Contextos observados

Chaves resolvidas por contexto, sem valores:

| Contexto | Variaveis |
|---|---|
| `deploy-preview` | `CLEANUP_DATABASE_URL`, `DATABASE_URL`, `EDGE_ANALYTICS_ENABLED`, `EDGE_ANALYTICS_SAMPLE_RATE`, `EDGE_CAPTURE_ENABLED`, `EDGE_INGEST_SECRET`, `HTML_CAPTURE_CLEANUP_ENABLED`, `NODE_VERSION`, `NPM_FLAGS` |
| `production` | `DATABASE_URL`, `EDGE_INGEST_SECRET`, `NODE_VERSION`, `NPM_FLAGS` |
| `branch-deploy` | `DATABASE_URL`, `EDGE_INGEST_SECRET`, `NODE_VERSION`, `NPM_FLAGS` |

`CLEANUP_DATABASE_URL` esta restrita a `deploy-preview`, sem aparencia nos outros contextos.

### 6.2 Variaveis obrigatorias para ativacao funcional

| Variavel | Estado no deploy-preview | Necessidade | Risco / observacao |
|---|---|---|---|
| `DATABASE_URL` | presente, secreta, contexts branch/deploy/prod/dev | URL B1 com role runtime | valor mascarado pela API; alvo/role nao comprovados |
| `CLEANUP_DATABASE_URL` | presente, secreta, somente preview | URL B1 da cleanup | valor mascarado; role/db nao comprovados |
| `EDGE_INGEST_SECRET` | presente, secreta, contexts branch/deploy/prod/dev | HMAC Edge/Function | valor mascarado; comprimento real nao confirmado |
| `RATE_LIMIT_HMAC_SECRET` | **ausente** | obrigatoria no collect | sem ela, ativacao retorna 503 |
| `ALLOWED_ORIGINS` | **ausente** | origem B1 exata | default do codigo inclui origens de producao; B1 nao seria aceito |
| `ANALYTICS_INGEST_ENABLED` | **ausente** | `true` somente na janela | atualmente desligado (seguro) |
| `EDGE_CAPTURE_ENABLED` | presente, `false` | somente janela Edge | desligado |
| `EDGE_ANALYTICS_ENABLED` | presente, `false` | somente janela Edge | desligado |
| `HTML_CAPTURE_CLEANUP_ENABLED` | presente, `false` | cleanup nao deve rodar | desligado; Scheduled nao deve coletar |
| `EDGE_ANALYTICS_SAMPLE_RATE` | `0.1` | opcional para Edge | sem efeito com flags false |
| `EDGE_INGEST_KEY_ID` | **ausente** | opcional/default | default do Edge pode ser usado; verificar antes da janela |

`NODE_VERSION=22` e `NPM_FLAGS` estao presentes nos contextos; nao sao variaveis de ingestao.

### 6.3 Validade estrutural

A API do Netlify devolve os segredos como placeholders mascarados. Para `DATABASE_URL`,
`CLEANUP_DATABASE_URL` e `EDGE_INGEST_SECRET` foi possivel confirmar presenca e contextos, mas
**nao** foi possivel validar host, database, role, `sslmode` ou comprimento real sem ler o valor
secreto.

Nao foram impressos valores. Nao houve alteracao de variaveis.

---

## 7. Matriz de ativacao funcional

| Configuracao | Estado atual | Estado necessario para homologacao | Risco | Acao futura | Autorizacao |
|---|---|---|---|---|---|
| Site/deploy | draft `6b007...`, sem publicacao | novo draft 5F.55 | usar artefato antigo | deploy unico futuro | especifica |
| Artefato | `834dce3...`, 32 arquivos | mesmo digest | integridade | validar antes do deploy | fase futura |
| CSP | B1 exata | manter | wildcard/producao | nao alterar | nenhuma |
| `DATABASE_URL` preview | presente/mascarada | comprovadamente B1 | DB/role errados | validar em canal autorizado | especifica |
| `CLEANUP_DATABASE_URL` | preview only, mascarada | B1 cleanup | cleanup errado | validar antes de cleanup | especifica |
| `EDGE_INGEST_SECRET` | presente, mascarado | HMAC valido | mismatch | validar/usar existente | especifica |
| `RATE_LIMIT_HMAC_SECRET` | ausente | >=32 bytes | 503/limites | configurar | especifica |
| `ALLOWED_ORIGINS` | ausente | `https://portal-contas-validation-b1.netlify.app` | default producao; B1 rejeitado | configurar | especifica |
| `ANALYTICS_INGEST_ENABLED` | ausente/false | `true` somente na janela | coleta desligada | ativar na janela | especifica |
| `EDGE_CAPTURE_ENABLED` | false | true somente teste Edge | Captura indevida | manter false | especifica |
| `EDGE_ANALYTICS_ENABLED` | false | true somente teste Edge | Amostra indevida | manter false | especifica |
| `HTML_CAPTURE_CLEANUP_ENABLED` | false | false | Scheduled/cleanup | manter false | especifica |
| `EDGE_ANALYTICS_SAMPLE_RATE` | 0.1 | conforme janela | amostra | manter | especifica |
| `EDGE_INGEST_KEY_ID` | ausente | default/ID valido | HMAC | verificar default | especifica |
| Dados sinteticos | presentes | cleanup posterior | retencao | cleanup autorizado depois | especifica |

### 7.1 Controles de seguranca da proposta

Atende:

- nao coleta antes do consentimento: cliente/Edge continuam sem envio antes de consentimento;
- nao persiste valores/resultados: handler continua rejeitando `values` e campos sensiveis;
- nao envia clique de anuncio: o fluxo envia apenas `affiliate_click` de oferta, nao eventos de
  anuncio;
- CSP restritiva preservada;
- cleanup desligado;
- Scheduled cleanup desligado;
- sem `ANALYTICS_INGEST_ENABLED` ativo no Netlify.

Nao atende ainda:

- `ALLOWED_ORIGINS` ausente nao garante aceitar apenas B1; o default do codigo usa origens de
  producao;
- `RATE_LIMIT_HMAC_SECRET` ausente impede o fluxo funcional;
- o alvo real de `DATABASE_URL`/`CLEANUP_DATABASE_URL` nao e comprovavel pela API mascarada;
- o artefato B1 nao inclui o cliente `js/analytics.js`; a coleta browser nao esta incluida.

---

## 8. Riscos e pendencias

### Riscos

1. **Origem:** sem `ALLOWED_ORIGINS`, o default do codigo e o conjunto de origens de producao.
   Ativar ingestao antes de configurar poderia aceitar origem de producao e rejeitar B1.
2. **Rate limit:** sem `RATE_LIMIT_HMAC_SECRET`, a ativacao retorna 503.
3. **Banco:** `DATABASE_URL`/`CLEANUP_DATABASE_URL` estao mascaradas; o alvo B1 e a role de cada
   URL nao podem ser comprovados por esta auditoria.
4. **Segredo Edge:** comprimento real de `EDGE_INGEST_SECRET` nao observavel.
5. **Browser:** o artefato B1 minimo nao inclui o cliente `js/analytics.js`; nao ha coleta browser
   para testar, apenas endpoint server-side.
6. **SSL:** `pg_stat_ssl=false` permanece sem prova ponta a ponta; proxy Neon pode explicar.
7. **Dados:** linhas sinteticas da 5F.56 continuam no B1; cleanup posterior precisa de autorizacao.
8. **Artefato atual:** o deploy existente e o 5F.51 antigo; nao usar para a janela browser.

### Pendencias antes de solicitacao de deploy funcional

1. Autorizar configuracao de `ALLOWED_ORIGINS` com a origem exata do B1.
2. Autorizar criacao/rotacao de `RATE_LIMIT_HMAC_SECRET`.
3. Validar `DATABASE_URL`/`CLEANUP_DATABASE_URL` e `EDGE_INGEST_SECRET` por canal autorizado.
4. Decidir se o teste funcional sera server-side ou browser; se browser, incluir cliente e ajustar
   a configuracao de consentimento.
5. Manter `ANALYTICS_INGEST_ENABLED`, `EDGE_CAPTURE_ENABLED`,
   `EDGE_ANALYTICS_ENABLED` e `HTML_CAPTURE_CLEANUP_ENABLED` desligados ate a janela.
6. Autorizar deploy unico do artefato 5F.55.
7. Planejar cleanup dos dados sinteticos apos a homologacao.

---

## 9. Operacoes realizadas e nao realizadas

### Realizadas

- leitura integral do relatorio 5F.56;
- validacao local read-only do artefato 5F.55 (`validarPacote`, digest, contagens, CSP, endpoint);
- consulta read-only de identidade Neon;
- consulta read-only de migrations, tabelas, coluna, privilegios, roles e cleanup;
- consulta read-only do site, deploy e variaveis Netlify;
- analise estatica da configuracao e da CSP.

### Nao realizadas

- nenhum deploy ou upload;
- nenhuma migration/GRANT/REVOKE;
- nenhuma escrita em tabela remota;
- nenhuma ingestao real;
- nenhum cleanup;
- nenhuma Scheduled Function;
- nenhuma alteracao de variavel, secret ou flag;
- nenhuma alteracao de Neon, branch principal ou producao;
- nenhum commit, push ou PR;
- nenhuma reconstrucao ou substituicao de artefato.

Nenhum valor de secret, connection string ou token foi impresso.

---

## 10. Recomendacao e proxima etapa

**Nao solicitar ainda um deploy funcional com ingestao ativa.** O artefato e o banco estao prontos,
mas a configuracao de origem/rate limit esta incompleta e os valores secretos nao foram
estruturalmente comprovados.

Sequencia recomendada, cada etapa com autorizacao propria:

1. configurar e validar `ALLOWED_ORIGINS` e `RATE_LIMIT_HMAC_SECRET`;
2. validar o alvo real das URLs de banco/cleanup e a força do segredo Edge;
3. definir explicitamente se a janela sera server-side ou browser;
4. autorizar o deploy unico do artefato `834dce3...`;
5. manter todas as flags de captura/cleanup desligadas ate a janela;
6. executar smoke tests pos-deploy sem escrita;
7. autorizar ativacao controlada e os testes de escrita;
8. cleanup autorizado dos dados sinteticos ao final.

**Classificacao final: 2 - Aprovado com pendencias.**
