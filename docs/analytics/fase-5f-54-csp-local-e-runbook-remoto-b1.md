# Fase 5F.54 - CSP local e runbook remoto B1

Status: **preparacao local concluida; nenhuma operacao remota executada**.
Data: **2026-11-20**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.

**Classificacao: 1 - Aprovado.**

CSP restrita corrigida no B1, fluxo de consentimento revalidado, migration 007 e privilegios 009
revisados, runner incremental testado localmente e runbook remoto documentado.

---

## 1. Diagnostico da CSP

### 1.1 Fontes auditadas

| Fonte | Resultado |
|---|---|
| `validation-b1/public/_headers` | fonte oficial do B1; `connect-src` corrigido |
| `validation-b1/dist/_headers` | regenerado pelo build B1; mesmo conteudo da fonte |
| `validation-b1/netlify.toml` | sem diretiva CSP; somente build/functions |
| `validation-b1/.netlify/netlify.toml` | cache local ignorado pelo Git; atualizado localmente |
| HTML B1 (`index.html`, `validacao-encerrada.html`) | sem meta CSP e sem recurso externo |
| `js/analytics.js` | endpoint relativo `/api/collect`; `sendBeacon`/`fetch` |
| `_headers` da raiz/producao | nao alterado; CSP de producao permanece intacta |
| Testes B1 | atualizados para a nova diretiva |

Nao existe meta tag de CSP nas paginas B1 que possa sobrescrever o header. O header Netlify e a
fonte efetiva.

### 1.2 Origem necessaria

O cliente usa o caminho relativo `/api/collect`. No dominio B1 isso e same-origin. Para permitir
tambem uma pagina local de teste que aponte para o endpoint B1 por HTTPS, a origem exata do site
B1 precisa estar autorizada.

Origem exata:

```text
https://portal-contas-validation-b1.netlify.app
```

Diretiva resultante:

```text
connect-src 'self' https://portal-contas-validation-b1.netlify.app
```

Propriedades:

- `'self'` preservado: o dominio B1 e as paginas locais same-origin continuam funcionando.
- Nenhum `*`, nenhum `*.netlify.app` e nenhum esquema generico `https:`.
- Nenhuma origem de producao (`portaldascontas.com.br`) foi adicionada.
- `script-src`, `style-src`, `img-src`, `base-uri`, `form-action` e `frame-ancestors` nao foram
  ampliados.
- CSP nao antecipa nem dispara coleta; o consentimento continua sendo o gate do cliente.
- O draft URL dinamico e coberto por `'self'` quando a pagina e servida no proprio draft. O valor
  exato de `ALLOWED_ORIGINS` do servidor, se uma pagina local chamar o B1, deve ser configurado
  separadamente e nao foi alterado.

### 1.3 Alteracoes de CSP

Antes:

```text
connect-src 'none'
```

Depois:

```text
connect-src 'self' https://portal-contas-validation-b1.netlify.app
```

Arquivos afetados:

- `validation-b1/public/_headers`
- `validation-b1/dist/_headers` (build local)
- `validation-b1/.netlify/netlify.toml` (cache local ignorado; nao versionado)
- `validation-b1/artifact-contract.json` (hashes de fonte)
- `validation-b1/tests/b1.spec.mjs` (teste de origem exata)
- `validation-b1/tests/artifact.spec.mjs` (hash da fixture)

O artefato congelado da Fase 5F.51 **nao foi alterado nem substituido**. Ele continua com o CSP
antigo e nao deve ser usado para uma janela browser; um novo pacote completo precisara ser gerado
em fase autorizada depois desta correcao.

---

## 2. Testes de consentimento

### 2.1 Site canonico - Playwright

Os testes de consentimento do site passaram, incluindo:

| Caso | Resultado |
|---|---|
| Primeiro acesso sem consentimento | nega tudo, sem IDs e sem chamada |
| Cookie antigo sem preferencia local | nao autoriza |
| Aceitar tudo | analytics e ads concedidos, pageview sem valores |
| Recusar | analytics/ads negados, sem IDs e sem eventos |
| Personalizar | analytics independente de ads |
| Retirar analytics | IDs removidos; novas interacoes nao coletam |
| DNT | analytics e ads personalizados desativados |
| GPC | analytics e ads personalizados desativados |
| Calculadora/afiliado | envia apenas metadados; sem valores ou URL completa |
| Endpoint indisponivel | pagina nao quebra |

Nenhuma semantica do banner foi alterada.

### 2.2 B1 - Playwright local

`validation-b1 npm run test:browser`: **2/2**.

- Sem consentimento valido: zero chamadas capturadas.
- Aceitar: preferencia local e cookie, sem chamada automatica.
- Recusar: analytics=false, sem chamada.
- Retirar: preferencia removida, sem chamada.
- DNT: botao de aceite desabilitado, sem chamada.

A pagina B1 nao inclui o cliente `js/analytics.js`; ela apenas testa consentimento e diagnostico.
A coleta server-side do B1 nao foi ativada.

### 2.3 CSP

- Teste estatico B1 valida a diretiva exata, `'self'`, ausencia de `*`, ausencia de producao e
  demais diretivas inalteradas.
- Playwright canonico `CSP sem violacoes` passou.
- Nenhuma CSP remota foi alterada.

---

## 3. Revisao da migration 007

Arquivo: `db/migrations/007_remove_session_user_agent.sql`.

```sql
ALTER TABLE sessions
    DROP COLUMN IF EXISTS user_agent;
```

| Item | Resultado |
|---|---|
| PostgreSQL | 17.11 local; remoto esperado 17.12 |
| Compatibilidade | comando padrao PostgreSQL 17 |
| Idempotencia | `DROP COLUMN IF EXISTS` |
| Transacao | executada dentro de transacao do runner |
| Sete migrations | validadas localmente |
| Tabelas | 14 |
| `sessions.user_agent` | removida |
| Views/triggers/functions dependentes | nenhuma no schema |
| Codigo de ingestao | nao referencia `user_agent` |
| Historico 001-006 | preservado; checksum da 007 inserido |

O wrapper `database/b1/apply-b1-migrations.mjs` executa 001-006, privilegios fase 4, 007 e 009
em sequencia, em banco B1 vazio. O novo runner `database/b1/apply-runtime-hardening.mjs` cobre o
alvo **ja existente** com seis migrations.

O runner incremental foi testado localmente em banco B1 isolado:

1. aplicou 001-006 e privilegios fase 4;
2. executou `apply-runtime-hardening.mjs`;
3. retornou `migrations=7`, `tables=14`, `userAgentPresent=false`;
4. manteve `runtimeCollectPrivileges=true`;
5. commit unico; falhas fazem rollback de 007, do registro de migration e de 009.

Ele recusa o alvo se migrations nao forem exatamente seis, se a coluna ja estiver ausente, se a
runtime ja tiver acesso fase 2/3, se houver membership ou se o executor nao for
`neondb_owner` em `validation_b1`.

---

## 4. Revisao dos privilegios 009

Arquivo: `database/b1/009-runtime-collect-privileges.sql`.

```sql
GRANT SELECT, INSERT, UPDATE ON TABLE visitors TO validation_b1_runtime;
GRANT SELECT, INSERT, UPDATE ON TABLE sessions TO validation_b1_runtime;
GRANT SELECT, INSERT, UPDATE ON TABLE rate_limits TO validation_b1_runtime;

GRANT INSERT ON TABLE ingest_events, pageviews, events, affiliate_clicks
    TO validation_b1_runtime;

GRANT SELECT (event_id) ON TABLE ingest_events, pageviews, events, affiliate_clicks
    TO validation_b1_runtime;
```

| Verificacao | Resultado |
|---|---|
| `GRANT` idempotente | sim |
| DELETE | nao concedido |
| TRUNCATE | nao concedido |
| DDL | nao concedido |
| Ownership | nao concedido |
| Membership | nao concedida |
| `SUPERUSER`/`CREATEDB`/`CREATEROLE`/`BYPASSRLS` | nao concedidos |
| `schema_migrations` | sem SELECT |
| `SELECT(event_id)` | limitado as quatro tabelas que usam conflito/retorno |
| SELECT de coluna nao usada | postflight rejeita |
| UPDATE em pageviews/events/affiliate/ingest | postflight rejeita |
| Cleanup | nao alterado |
| Preflight/postflight | somente leitura |

O SQL inclui guards de database/owner, sete migrations, 14 tabelas, ausencia de `user_agent`,
ausencia de membership/admin e pos-verificacao dos privilegios. O arquivo
`009-runtime-collect-preflight.sql` e `009-runtime-collect-postflight.sql` sao consultas de
leitura para a janela remota.

Testes locais com `validation_b1_runtime`:

- ingestao de session_start, pageview, affiliate_click, calculator_complete e session_end;
- deduplicacao por `event_id`;
- rate limit com 429;
- rollback em troca de visitante;
- DDL, DROP, DELETE, TRUNCATE, `ALTER ROLE`, `SET ROLE`, `schema_migrations` e fase 4 negados;
- `SELECT user_agent` retorna coluna inexistente apos 007.

Nenhum privilegio foi ampliado para facilitar testes.

---

## 5. Runbook remoto - somente documentacao

Nao executar esta secao nesta fase. Todos os comandos abaixo sao para uma autorizacao futura
especifica e devem ser executados com o alvo confirmado.

### 5.1 Identidade

```powershell
neon projects get square-mountain-69641645
neon branches get validation-b1 --project-id square-mountain-69641645
neon databases list --project-id square-mountain-69641645 --branch validation-b1
```

Esperado:

- project id `square-mountain-69641645`;
- branch `validation-b1` / id `br-misty-sound-b6pnt7iw`;
- database `validation_b1`;
- PostgreSQL 17.12;
- branch nao e producao nem o projeto principal.

Interromper se qualquer identidade divergir.

### 5.2 Preflight somente leitura

```powershell
$env:B1_ADMIN_DATABASE_URL = neon connection-string validation-b1 `
  --project-id square-mountain-69641645 `
  --database-name validation_b1 `
  --role-name neondb_owner `
  --ssl require
```

Nunca exibir a connection string. Executar consultas:

```powershell
psql "$env:B1_ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 -c @"
SELECT current_database(), current_user;
SELECT count(*) AS migrations FROM schema_migrations;
SELECT count(*) AS tabelas FROM pg_tables WHERE schemaname = 'public';
SELECT count(*) AS user_agent_columns
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'user_agent';
SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolbypassrls
FROM pg_roles WHERE rolname = 'validation_b1_runtime';
"@
```

Esperado:

```text
validation_b1 | neondb_owner
migrations=6
tabelas=14
user_agent_columns=1
runtime: todos os atributos administrativos = false
```

Interromper se migrations != 6, tabelas != 14, coluna != 1 ou runtime tiver atributo indevido.
Consultas adicionais de leitura: `database/b1/009-runtime-collect-preflight.sql` (apos 007).

### 5.3 Aplicar 007 e 009

```powershell
$env:B1_HARDENING_CONFIRM = 'APPLY_VALIDATION_B1_RUNTIME'
node database/b1/apply-runtime-hardening.mjs
```

O runner:

1. repete o preflight em transacao;
2. aplica 007;
3. registra o checksum da 007 em `schema_migrations`;
4. aplica 009;
5. executa o postflight;
6. faz commit unico ou rollback integral.

Esperado:

```json
{
  "applied": ["007_remove_session_user_agent.sql", "009-runtime-collect-privileges.sql"],
  "migrations": 7,
  "tables": 14,
  "userAgentPresent": false,
  "runtimeCollectPrivileges": true,
  "committed": true,
  "secretsPrinted": false
}
```

Nao usar `apply-b1-migrations.mjs` para o B1 existente: ele exige banco vazio.

### 5.4 Postflight somente leitura

```powershell
psql "$env:B1_ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 `
  -f database/b1/009-runtime-collect-postflight.sql
```

Esperado:

- `migrations=7`;
- `tabelas=14`;
- `user_agent_presente=false`;
- required SELECT/INSERT/UPDATE e `SELECT(event_id)` = true;
- DELETE/TRUNCATE/UPDATE indevido/schema_migrations/DDL = false;
- runtime sem membership em cleanup/owner e sem CREATE.

Interromper diante de qualquer `false` em privilegio requerido ou `true` em privilegio proibido.

### 5.5 Teste controlado de conexao da runtime

Somente se autorizado:

```powershell
$env:B1_RUNTIME_DATABASE_URL = neon connection-string validation-b1 `
  --project-id square-mountain-69641645 `
  --database-name validation_b1 `
  --role-name validation_b1_runtime `
  --ssl require

psql "$env:B1_RUNTIME_DATABASE_URL" -v ON_ERROR_STOP=1 -c @"
SELECT current_user;
SELECT has_table_privilege('validation_b1_runtime', 'visitors', 'SELECT');
SELECT has_table_privilege('validation_b1_runtime', 'sessions', 'DELETE');
SELECT has_table_privilege('validation_b1_runtime', 'sessions', 'TRUNCATE');
"@
```

Esperado: `validation_b1_runtime`; primeiro privilegio true; DELETE e TRUNCATE false. Nao executar
INSERT de teste nesta etapa sem autorizacao propria.

### 5.6 Criterios de interrupcao

- projeto/branch/database/owner divergentes;
- PostgreSQL diferente de 17.12 ou migrations diferentes de 6 no preflight;
- tabelas diferentes de 14;
- `sessions.user_agent` ausente antes da 007;
- runtime com admin, membership ou acesso fase 2/3 previo;
- erro em 007 ou 009;
- postflight com qualquer privilegio requerido ausente;
- qualquer DELETE, TRUNCATE, DDL, ownership, membership ou acesso a `schema_migrations`;
- qualquer connection string, senha ou secret exibido no output;
- qualquer alteracao fora de `validation_b1`.

---

## 6. Testes executados

### 6.1 Resultados

| Suite | Resultado |
|---|---|
| B1 Windows (`validation-b1 npm test`) | 57 pass, 1 skip (symlink Windows), 0 fail |
| B1 Linux Node 22 (`node --test`) | 58 pass, 0 fail |
| B1 browser consent | 2/2 |
| `npm run test:analytics` | 137/137 |
| Playwright canonico | 62/62 |
| `npm run test:isolation` | 50 arquivos preservados |
| Build B1 | 6 estaticos + manifest, 10.0 KiB |
| Build canonico | 162 HTML, 159 URLs, 671 arquivos / 18.7 MB |
| Runner 007+009 local | 7 migrations, 14 tabelas, sem UA, runtime OK |

O skip Windows e o teste de symlink, nao suportado no ambiente; a mesma suite passou 58/58 no
Linux.

### 6.2 Consentimento/CSP

Foram executados os testes Playwright de consentimento, DNT/GPC, retirada, separacao
analytics/ads, ausencia de valores e endpoint indisponivel. Todos passaram. O teste CSP canonico
passou e a suite B1 valida a CSP restrita.

Nao houve chamada de rede real para `/api/collect` nos testes de consentimento: o Playwright
intercepta as requisicoes.

---

## 7. Hashes e artefatos

| Item | SHA-256 / valor |
|---|---|
| Artefato congelado 5F.51 (nao alterado) | `6b80bea75089a28063df8bd3926772a8e59e163f7db08e1093ed9ac2168ab470` |
| `_headers` B1 anterior | `cacc628a492bc6a3f232ccf9664133735de4394e739bb78d9ced8a64ebbc7839` |
| `_headers` B1 novo | `b98b4793ac11cc100247dcc06d9131a81833d61a070b3654254868c96fff9f92` |
| `build-manifest.json` B1 anterior | `8db479438bb17b7475dae72d0bbb0d86487749c89c01cf1dbb5157cbe88fde29` |
| `build-manifest.json` B1 novo | `b1f900bd853a8d20c4ef3d53b37d3a477bc35db18145a24f24b327099b832fae` |
| `artifact-contract.json` `config_sha256` | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` (inalterado) |

O pacote completo novo **nao foi gerado nem publicado**. O artefato congelado 5F.51 permanece
intacto e ainda contem o CSP antigo. Uma publicacao browser futura exige novo pacote completo
autorizado.

---

## 8. Pendencias para a proxima fase

1. Autorizar e executar migration 007 + grants 009 no Neon B1 via runbook.
2. Configurar `ALLOWED_ORIGINS` e `RATE_LIMIT_HMAC_SECRET` no preview B1.
3. Ativar `ANALYTICS_INGEST_ENABLED` somente na janela de teste.
4. Gerar e validar um **novo artefato completo** com o `_headers` corrigido; o artefato 5F.51
   nao deve ser reutilizado para browser.
5. Publicar apenas com autorizacao especifica do novo artefato.
6. Executar smoke tests remotos e, se autorizado, testes de escrita/rate limit.
7. Testar cleanup/SSL em janela separada.
8. Reverter flags de teste.

---

## 9. Confirmacao de ausencia de operacao remota

- Nenhum projeto/branch Neon remoto foi acessado ou alterado.
- Nenhuma migration ou GRANT/REVOKE remoto.
- Nenhuma role remota alterada.
- Nenhum deploy, upload ou publicacao.
- Nenhuma variavel, secret ou flag Netlify alterada.
- Nenhum cleanup remoto.
- Nenhum banco de producao ou projeto principal acessado.
- Nenhum commit, push ou PR.

Toda validacao de banco ocorreu em PostgreSQL 17 local isolado. Nenhuma connection string,
senha, token ou secret foi incluido neste relatorio.

**Classificacao final: 1 - Aprovado.** A execucao remota depende de autorizacao especifica e do
runbook acima.
