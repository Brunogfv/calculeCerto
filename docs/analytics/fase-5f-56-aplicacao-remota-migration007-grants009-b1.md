# Fase 5F.56 - Aplicacao remota da migration 007 e grants 009 no B1

Status: **migration 007 e grants 009 aplicados e verificados no Neon B1**.
Data: **2026-11-21**.
Branch Git: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.

**Classificacao: 1 - Aprovado.**

A aplicacao foi limitada ao branch `validation-b1` do projeto Neon
`portal-contas-homologacao`. Nao houve deploy, alteracao no Netlify, ativacao de coleta, cleanup,
producao ou commit.

---

## 1. Correcao da identificacao

A primeira tentativa da 5F.56 foi interrompida porque o nome do projeto Neon
(`portal-contas-homologacao`) nao coincidia com o nome `portal-contas-validation-b1` informado na
autorizacao inicial.

A correcao foi confirmada pelo usuario:

- `portal-contas-validation-b1` e o nome do **site Netlify**;
- o projeto Neon correto e `portal-contas-homologacao`;
- o alvo B1 e a branch `validation-b1`, Branch ID `br-misty-sound-b6pnt7iw`, database
  `validation_b1`.

Nenhuma operacao de banco foi executada durante a primeira tentativa bloqueada.

---

## 2. Identidade confirmada

| Item | Encontrado |
|---|---|
| Project name | `portal-contas-homologacao` |
| Project ID | `square-mountain-69641645` |
| Project state | `ready` |
| PostgreSQL do projeto | 17 |
| Branch | `validation-b1` |
| Branch ID | `br-misty-sound-b6pnt7iw` |
| Branch state | `ready` |
| Database alvo | `validation_b1` |
| Database owner | `neondb_owner` |
| Executor da migration | `neondb_owner` |
| Server version | `170012` (PostgreSQL 17.12) |

O database `neondb` existe na mesma branch, mas **nao foi usado**. A branch `main` e o projeto Neon
principal nao foram acessiveis nesta operacao.

O projeto tambem listou o banco `neondb`; ele foi ignorado. O alvo exclusivo foi
`validation_b1`.

---

## 3. Preflight remoto - somente leitura

Executado antes da escrita, sem alterar dados.

| Verificacao | Resultado |
|---|---|
| `current_database()` | `validation_b1` |
| `current_user` | `neondb_owner` |
| Migrations | 6 |
| Migrations encontradas | 001, 002, 003, 004, 005, 006 |
| Migration 007 | ausente |
| Tabelas publicas | 14 |
| Tabelas faltantes/extra | nenhuma |
| `sessions.user_agent` | 1 coluna (presente) |
| Runtime `validation_b1_runtime` | existe |
| Runtime SUPERUSER/CREATEDB/CREATEROLE/REPLICATION/BYPASSRLS | todos false |
| Runtime memberships | nenhuma |
| Runtime objetos possuidos | nenhum |
| Runtime acesso fase 2/3 | nenhum (SELECT/INSERT/UPDATE false) |
| Runtime CREATE no schema | false |
| Cleanup `validation_b1_cleanup` | existe; sem atributos administrativos; INHERIT=false |

O estado correspondeu ao contrato da Fase 5F.53: seis migrations, coluna `user_agent` presente e
runtime sem os grants de collect.

---

## 4. Aplicacao transacional

Comando executado:

```powershell
node database/b1/apply-runtime-hardening.mjs
```

Com `B1_HARDENING_CONFIRM=APPLY_VALIDATION_B1_RUNTIME` e connection string obtida em memoria pelo
Neon CLI. Nenhuma URL de conexao foi impressa.

O runner:

1. confirmou database `validation_b1` e executor `neondb_owner`;
2. abriu uma unica transacao;
3. aplicou `007_remove_session_user_agent.sql`;
4. inseriu o checksum da 007 em `schema_migrations`;
5. aplicou `009-runtime-collect-privileges.sql`;
6. executou o postflight;
7. fez `COMMIT` somente apos todas as verificacoes.

Saida do runner:

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

Nao houve rollback porque todas as verificacoes passaram.

---

## 5. Postflight

### 5.1 Migration

| Verificacao | Resultado |
|---|---|
| Migrations | 7 |
| Arquivos | 001 a 007 |
| 007 registrada | sim |
| Checksum da 007 no banco | `654b5743e400fdc91391f008497763d2975615ad336bc829e198fef583d473b7` |
| Checksum local da 007 | `654b5743e400fdc91391f008497763d2975615ad336bc829e198fef583d473b7` |
| Correspondencia | sim |
| `sessions.user_agent` | 0 colunas |
| Tabelas publicas | 14 |
| Tabelas faltantes/extra | nenhuma |

### 5.2 Privilegios efetivos da runtime

| Tabela | SELECT | INSERT | UPDATE | DELETE | TRUNCATE |
|---|---|---|---|---|---|
| `visitors` | sim | sim | sim | nao | nao |
| `sessions` | sim | sim | sim | nao | nao |
| `rate_limits` | sim | sim | sim | nao | nao |
| `pageviews` | somente `event_id` | sim | nao | nao | nao |
| `events` | somente `event_id` | sim | nao | nao | nao |
| `affiliate_clicks` | somente `event_id` | sim | nao | nao | nao |
| `ingest_events` | somente `event_id` | sim | nao | nao | nao |

Confirmado:

- `pageviews`, `events`, `affiliate_clicks` e `ingest_events` sem SELECT de tabela inteira;
- `SELECT(event_id)` presente apenas nessas quatro tabelas;
- sem UPDATE indevido nas quatro tabelas de eventos;
- sem DELETE e sem TRUNCATE nas sete tabelas;
- sem SELECT em `schema_migrations`;
- sem CREATE no schema/database;
- sem ownership de objetos;
- sem memberships;
- sem atributos administrativos.

### 5.3 Separacao de roles

`validation_b1_cleanup` foi consultada apenas em leitura e permaneceu com o contrato anterior:

| Verificacao | Resultado |
|---|---|
| SELECT em `visitors` | sim |
| DELETE em `sessions` | sim |
| INSERT em `sessions` | nao |
| UPDATE em `sessions` | nao |
| TRUNCATE em `sessions` | nao |
| CREATE no schema | nao |
| Membership em `neondb_owner` | nao |
| Atributos administrativos | todos false |

A cleanup nao foi alterada. A runtime nao pode assumir cleanup ou owner:

- `SET ROLE validation_b1_cleanup` negado;
- `SET ROLE neondb_owner` negado;
- `ALTER ROLE validation_b1_cleanup` negado.

---

## 6. Testes controlados

Foram usados IDs sinteticos unicos e conexoes diretas `validation_b1_runtime` e
`neondb_owner`. Nao houve trafego publico nem ativacao de `ANALYTICS_INGEST_ENABLED` no Netlify.
O processo local de teste configurou a ingestao apenas em memoria.

### 6.1 Positivos

| Operacao | Resultado |
|---|---|
| session_start | 202 |
| pageview | 202 |
| affiliate_click | 202 |
| calculator_complete | 202 |
| session_end | 202 |
| Visitante/sessao criados | 1/1 |
| Pageviews | 1 |
| Events | 4 |
| Affiliate clicks | 1 |
| Ingest events | 5 |
| Deduplicacao do mesmo event_id | pageview/ingest mantidos em 1 |
| Rate limit por sessao | primeira 202, segunda 429 |
| Rollback com visitante divergente | 400; nenhuma pageview/ingest gravada |

### 6.2 Negativos

| Tentativa | Codigo |
|---|---|
| `CREATE TABLE` | 42501 |
| `DROP TABLE sessions` | 42501 |
| `DELETE FROM sessions` | 42501 |
| `TRUNCATE sessions` | 42501 |
| `ALTER ROLE validation_b1_cleanup` | 42501 |
| `SET ROLE validation_b1_cleanup` | 42501 |
| `SET ROLE neondb_owner` | 42501 |
| `SELECT * FROM schema_migrations` | 42501 |
| `SELECT count(*) FROM html_events` | 42501 |
| `UPDATE pageviews` | 42501 |
| `DELETE FROM rate_limits` | 42501 |
| `TRUNCATE visitors` | 42501 |
| `SELECT user_agent FROM sessions` | 42703 (coluna inexistente) |
| Origem nao autorizada no handler | 403 |

Nenhum privilegio adicional foi concedido para contornar falhas. O erro 42703 da coluna
`user_agent` e o resultado esperado da migration 007.

Os testes inseriram linhas sinteticas no B1. Nenhuma operacao de cleanup, DELETE em massa ou
TRUNCATE foi executada.

---

## 7. SSL e conexao

As conexoes foram obtidas com `--ssl require` no Neon CLI. O driver `pg` emitiu o aviso de que
`require` e tratado como `verify-full` no comportamento atual.

O backend reportou `pg_stat_ssl.ssl=false`, compatível com terminacao TLS no proxy Neon. Isso
**nao e, sozinho, prova de ausencia de TLS**; a visibilidade do `pg_stat_ssl` no backend nao
representa necessariamente o transporte cliente-proxy. O valor real da URL nao foi impresso.

Nao foi necessario alterar SSL para concluir a aplicacao. A comprovacao criptografica ponta a
ponta continua como limitacao de observabilidade, nao como falha da migration/grants.

---

## 8. Restricoes preservadas

| Item | Estado |
|---|---|
| Neon principal / branch main | nao acessado |
| Database `neondb` | nao usado |
| Producao | nao alterada |
| Deploy/upload | nenhum |
| Netlify | nao acessado/alterado |
| Secrets | nenhum alterado ou impresso |
| Variaveis/flags | nenhuma alterada |
| `ANALYTICS_INGEST_ENABLED` | nao habilitado no Netlify |
| Cleanup | nao executado |
| Commit/push/PR | nenhum |
| Migration 007 | aplicada somente em `validation_b1` |
| Grants 009 | aplicados somente em `validation_b1` |

A connection string, passwords, tokens e secrets nao foram incluidos neste relatorio nem nos
logs de resultado.

---

## 9. Pendencias apos a operacao

1. Configurar `ALLOWED_ORIGINS` e `RATE_LIMIT_HMAC_SECRET` no preview B1, se ainda nao estiverem
   configurados, somente em autorizacao propria.
2. Ativar `ANALYTICS_INGEST_ENABLED` apenas na janela autorizada.
3. Autorizar o deploy do novo artefato `834dce3...`; nao reutilizar o artefato 5F.51.
4. Executar smoke tests pos-deploy e comparar o conteudo publicado.
5. Executar cleanup autorizado dos dados sinteticos quando a janela permitir.
6. Testar Edge/cleanup/SSL em autorizacoes separadas.

**Classificacao final: 1 - Aprovado.** A migration e os grants foram aplicados e verificados; o
ambiente remoto de B1 esta pronto para a proxima etapa autorizada.
