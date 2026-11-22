# Fase 5F.3.5 — Auditoria de privilégios e preparação transacional do Neon B1

Status: **auditoria remota somente leitura concluída; wrapper transacional e testes locais
preparados; nenhuma operação remota de escrita executada**.
Data/hora: **2026-11-14T19:30:40-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** A estratégia técnica está definida e validada
localmente, mas a aplicação remota, a role de cleanup B1, a retenção da Fase 2/3 e o rate limiting
continuam dependendo de autorização/decisão específica.

---

## 1. Identidade e isolamento confirmados

Consultas somente de leitura no B1:

| Verificação | Resultado |
|---|---|
| Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` |
| Database | `validation_b1` |
| `current_database()` | `validation_b1` |
| `current_user` | `validation_b1_runtime` |
| PostgreSQL | 17.12 |
| SSL | `sslmode=require`; stream TLS criptografado e certificado par presentes |
| Tabelas em `public` | 0 |
| `schema_migrations` | ausente |
| Funções/sequences em `public` | 0 |
| Dados de aplicação | nenhum |
| Acesso a `neondb` | negado |

O banco está vazio e não possui migrations aplicadas.

---

## 2. Inventário de roles

| Role | LOGIN | SUPERUSER | CREATEDB | CREATEROLE | REPLICATION | BYPASSRLS | INHERIT |
|---|---|---|---|---|---|---|---|
| `validation_b1_runtime` | sim | não | não | não | não | não | sim |
| `analytics_runtime` | sim | não | não | não | não | não | não |
| `analytics_cleanup` | sim | não | não | não | não | não | não |
| `neondb_owner` | sim | não | sim | sim | sim | sim | sim |
| `neon_superuser` | não | não | sim | sim | sim | sim | sim |
| `cloud_admin` | sim | sim | sim | sim | sim | sim | sim |

### 2.1 Memberships

| Membro | Grupo | ADMIN | INHERIT | SET |
|---|---|---|---|---|
| `neondb_owner` | `analytics_runtime` | sim | não | não |
| `neondb_owner` | `analytics_cleanup` | sim | não | não |
| `neondb_owner` | `validation_b1_runtime` | sim | não | não |

- `validation_b1_runtime` não é membro de `analytics_runtime`, `analytics_cleanup`,
  `neondb_owner` ou `neon_superuser`.
- `validation_b1_runtime` não pode executar `SET ROLE` para essas roles.
- `analytics_runtime` e `analytics_cleanup` têm `INHERIT=false`, mas os grants das migrations são
  **diretos** e continuam valendo.
- `neondb_owner` tem ADMIN sobre as três roles, mas INHERIT/SET falsos; não há caminho de herança
  para a role B1.
- `neon_superuser` não tem LOGIN; `validation_b1_runtime` não é membro.

### 2.2 Ownership

- Database `validation_b1`: owner `neondb_owner`.
- Schema `public`: owner `pg_database_owner`.
- `validation_b1_runtime` não possui database, schema, tabela, função ou sequence.
- Não existem objetos de aplicação no momento.

---

## 3. Privilégios efetivos atuais

| Item | `validation_b1_runtime` |
|---|---|
| `CONNECT` no database | sim (grant explícito) |
| `CREATE` no database | não |
| `TEMPORARY` no database | sim (via PUBLIC) |
| `USAGE` no schema `public` | sim |
| `CREATE` no schema `public` | não |
| Privilégios de tabela | nenhum (0 tabelas) |
| Privilégios de sequence | nenhum |
| Privilégios de função | nenhum |
| Default privileges para objetos futuros | nenhum |

ACL do database:

```text
{=T/neondb_owner,neondb_owner=CTc/neondb_owner,neon_superuser=CTc/neondb_owner,
 validation_b1_runtime=c/neondb_owner}
```

ACL do schema:

```text
{pg_database_owner=UC/pg_database_owner,=U/pg_database_owner,
 validation_b1_runtime=U/pg_database_owner}
```

Default ACL existente:

```text
cloud_admin -> neon_superuser (tabelas e sequences no schema public)
```

Não há default ACL para `validation_b1_runtime`; portanto, grants futuros precisam ser explícitos.

---

## 4. Matriz das seis tabelas da Fase 4

Código auditado: `capture-handler.mjs`, `edge-capture.mjs`, `cleanup-html-capture.mjs` e o
`validation-b1` correspondente.

| Tabela | Runtime B1 necessário | Cleanup B1 necessário | Owner/migration |
|---|---|---|---|
| `html_events` | INSERT | SELECT, DELETE | todos |
| `html_traffic_daily` | SELECT, INSERT, UPDATE (ON CONFLICT) | SELECT, DELETE | todos |
| `html_indicators_monthly` | SELECT, INSERT, UPDATE (ON CONFLICT) | SELECT, DELETE | todos |
| `edge_daily_counters` | SELECT, INSERT, UPDATE (RETURNING) | SELECT, DELETE | todos |
| `edge_nonces` | INSERT | SELECT, DELETE | todos |
| `edge_rate_limits` | SELECT, INSERT, UPDATE (RETURNING) | SELECT, DELETE | todos |

Nenhuma dessas tabelas usa sequence, função ou trigger. Não há `DELETE`/`TRUNCATE`/DDL para o
runtime. O `ON CONFLICT DO UPDATE` exige SELECT nas tabelas agregadas; isso foi comprovado no teste
local.

A Edge Function não acessa o banco diretamente; ela envia para a Function. O cleanup B1 não existe
hoje; a matriz mostra o mínimo de uma futura role exclusiva de cleanup.

---

## 5. Análise das migrations 001–006

- `003_phase4_html_capture.sql` concede `SELECT, INSERT, UPDATE` nas tabelas da Fase 4 à role
  `analytics_runtime`, se ela existir.
- `005_phase4_cleanup_role.sql` concede `SELECT, DELETE` na Fase 4 e revoga `CREATE` da role
  `analytics_cleanup`, se ela existir.
- `006_phase2_runtime_grants.sql` concede privilégios das Fases 2/3 à `analytics_runtime`, se ela
  existir.
- Nenhuma migration concede privilégios a `validation_b1_runtime`.
- Na branch B1, `analytics_runtime` e `analytics_cleanup` **existem e têm LOGIN**; portanto, os
  `DO` blocks condicionais executam e concedem privilégios a roles herdadas.
- A ordem é lexical (001–006); não há validação explícita de dependências.
- Não há funções, triggers ou sequences; as migrations são compatíveis com execução transacional no
  PostgreSQL 17. Não há `CREATE DATABASE`, `VACUUM`, `CREATE INDEX CONCURRENTLY` ou `ALTER SYSTEM`.

---

## 6. Comparação das alternativas

| Alternativa | Segurança | Isolamento | Compatibilidade | Impacto na homologação | Complexidade | Recomendação |
|---|---|---|---|---|---|---|
| **A. Manter roles herdadas + grants B1** | Baixa: as roles herdadas continuam recebendo grants das migrations | Ruim para B1 | Alta, sem wrapper | Nenhum grant em objetos da homologação; roles são do branch B1 | Baixa | Não recomendada |
| **B. Criar roles B1 exclusivas de runtime/cleanup** | Média/alta se combinada com grants explícitos | Boa, mas as roles herdadas ainda recebem grants se as migrations rodarem | Média: migrations não conhecem os novos nomes; exige grants manuais | Nenhum objeto da homologação é alterado; roles atuais não são tocadas | Média | Útil para cleanup futuro, não resolve sozinha os grants herdados |
| **C. Wrapper transacional que aplica migrations e revoga grants herdados** | Alta: revoga antes do commit; sem alterar migrations | Boa: B1 runtime recebe apenas o necessário; roles herdadas ficam sem tabelas | Alta: arquivos canônicos preservados; migrações transacionais | Nenhum objeto/role da homologação é alterado; operação limitada a B1 | Média | **Recomendada** |

A alternativa C foi preparada localmente. A alternativa B pode ser usada no futuro apenas para uma
role de cleanup exclusiva; não é necessária para o runtime atual.

**Escopo das roles:** as roles observadas são roles da branch B1 (cópias da branch principal). O
wrapper não altera atributos/memberships; ele altera apenas grants de objetos no database
`validation_b1`. Nenhum objeto ou grant de `neondb`/homologação principal é tocado.

---

## 7. SQL de preparação

Criados, sem execução remota:

- `database/b1/b1-privileges.sql`
- `database/b1/apply-b1-migrations.mjs`

O wrapper:

1. exige `B1_APPLY_CONFIRM=APPLY_VALIDATION_B1`;
2. exige `B1_DATABASE_URL` em memória, sem gravar a URL;
3. valida `current_database() = validation_b1` e `current_user = neondb_owner`;
4. exige banco vazio e `schema_migrations` inexistente;
5. aplica 001–006 na ordem, calcula SHA-256 e registra em `schema_migrations`;
6. rejeita SQL com operações incompatíveis com transação única;
7. executa as revogações dos grants das roles herdadas;
8. concede à `validation_b1_runtime` somente:
   - `CONNECT` no database e `USAGE` no schema;
   - `INSERT` em `html_events`;
   - `SELECT, INSERT, UPDATE` em `html_traffic_daily`, `html_indicators_monthly`,
     `edge_daily_counters` e `edge_rate_limits`;
   - `INSERT` em `edge_nonces`;
9. valida contagens, roles, privilégios e ausência de acesso à Fase 2/3;
10. executa `COMMIT` somente após todas as validações; em erro, `ROLLBACK`.

O arquivo SQL não contém senha, connection string ou comando automático de conexão.

---

## 8. Testes locais em PostgreSQL 17

Ambiente: container temporário `postgres:17` (PostgreSQL **17.11**), database local
`validation_b1`, roles locais `validation_b1_runtime`, `analytics_runtime`, `analytics_cleanup`,
`validation_b1_cleanup`, owner `neondb_owner`. Sem conexão com Neon.

| Teste | Resultado |
|---|---|
| Wrapper completa 001–006 em transação única | 6/6 aplicadas |
| Tabelas de aplicação | 13 |
| `schema_migrations` | 6 |
| Runtime: INSERT | permitido |
| Runtime: SELECT/INSERT/UPDATE com ON CONFLICT/RETURNING | permitido |
| Runtime: DELETE | negado: `42501` |
| Runtime: TRUNCATE | negado: `42501` |
| Runtime: CREATE TABLE / ALTER TABLE | negado: `42501` |
| Runtime: acesso a `pageviews`/`visitors` | negado: `42501` |
| Nonce duplicado | rejeitado: `23505` |
| Cleanup: SELECT/DELETE na Fase 4 | permitido |
| Cleanup: DELETE de registro antigo | permitido |
| Cleanup: INSERT/UPDATE/TRUNCATE | negado: `42501` |
| Cleanup: acesso à Fase 2/3 | negado: `42501` |
| Roles herdadas após o wrapper | sem privilégios de tabela |
| `analytics_runtime`/`analytics_cleanup` com SELECT/DELETE | falso após revogação |
| Memberships da runtime | 0 |
| Atributos administrativos da runtime | todos falsos |
| Reexecução do wrapper | abortada por banco não vazio/`schema_migrations` existente |
| Falha artificial após migrations | rollback; 0 tabelas e `schema_migrations` ausente |
| SQL de privilégios | composto por REVOKE/GRANT idempotentes; não foi reaplicado separadamente no teste |

Observação: as roles locais foram criadas como NOLOGIN e com INHERIT padrão; as roles remotas
herdadas têm LOGIN e INHERIT=false. Os grants diretos e as revogações testadas têm o mesmo efeito
para privilégios de tabela.

---

## 9. Rate limiting

| Camada | Situação |
|---|---|
| Netlify nativo | `traffic_rules_config_per_scope={}`; nenhuma regra; plano Free |
| Antes da Function | não há proteção específica comprovada |
| HMAC | impede payload não autenticado, mas não impede custo de requisições inválidas que chegam à Function |
| Banco | `edge_rate_limits`/`edge_daily_counters` só funcionam depois das migrations/grants |
| IP interno Edge → Function | `rate_key` é HMAC; não há IP bruto persistido |
| Limite diário | previsto no código; não ativo no B1 vazio |
| Replay | suportado por `edge_nonces`; testado localmente com `23505` |

Recomendação: definir proteção de borda/plataforma antes de ativar coleta ou aceitar explicitamente
o custo de requisições inválidas. O rate limit no banco é posterior ao HMAC e depende da Fase 4.

Nenhuma regra ou teste de carga foi executado.

---

## 10. Retenção da Fase 2/3

- `cleanup-html-capture` cobre apenas as tabelas da Fase 4.
- `cleanup-rate-limits.mjs` remove `rate_limits`, mas a migration 005 não concede DELETE em
  `rate_limits` para `analytics_cleanup`; esse script usa `MIGRATION_DATABASE_URL`/`DATABASE_URL`
  no modo produção.
- Não há política de retenção implementada para `sessions`, `pageviews`, `events`,
  `affiliate_clicks`, `visitors` e `ingest_events`.
- Não foi criada role de cleanup B1 nem concedido DELETE de Fase 2/3.
- A retenção dessas tabelas exige decisão de produto/privacidade e uma role/procedimento separado.

---

## 11. Riscos remanescentes

1. As roles herdadas `analytics_runtime` e `analytics_cleanup` continuam existindo e com LOGIN na
   branch B1; o wrapper remove seus grants de tabela e CONNECT, mas não as remove.
2. O wrapper precisa ser aplicado como `neondb_owner` e validar a identidade antes do `BEGIN`; a
   aplicação remota exige autorização separada.
3. Se uma nova migration for adicionada depois, o wrapper/checksums precisam ser atualizados.
4. A role `validation_b1_runtime` é `INHERIT=true`; hoje não tem memberships. Qualquer membership
   futura deve ser tratada como mudança de privilégios.
5. `PUBLIC` tem `USAGE` no schema e `TEMPORARY` no database; não tem `CONNECT` no database B1.
6. O rate limiting antes da Function e a retenção da Fase 2/3 permanecem abertos.

---

## 12. Plano recomendado de aplicação futura

1. Autorizar expressamente a aplicação e o wrapper.
2. Confirmar a identidade: Project ID, branch, database, current user e SSL.
3. Confirmar banco B1 vazio, sem `schema_migrations`, tabelas, funções ou sequences.
4. Confirmar roles: `validation_b1_runtime` presente; `analytics_runtime`/`analytics_cleanup`
   herdadas presentes e que não serão usadas.
5. Executar `database/b1/apply-b1-migrations.mjs` com `B1_APPLY_CONFIRM` e
   `B1_DATABASE_URL` em memória, sem exibir a URL.
6. O wrapper aplica 001–006, revoga grants das roles herdadas, concede o mínimo à role B1 e valida
   tudo na mesma transação.
7. Se qualquer validação falhar, o wrapper executa `ROLLBACK`; interromper e não insistir sem
   analisar o erro.
8. Após commit, executar somente consultas de verificação: contagens, `schema_migrations`,
   privilégios de database/schema/tabelas, memberships, ausência de acesso a `neondb`.
9. Não criar role de cleanup, não ativar flags, não executar POST e não aplicar dados sintéticos
   nesta etapa.
10. Definir em fase separada a role de cleanup B1 e a retenção da Fase 2/3.

O wrapper não foi executado remotamente. O comando de aplicação não deve ser executado sem a
autorização específica da próxima etapa.
