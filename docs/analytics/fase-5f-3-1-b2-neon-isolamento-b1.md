# Fase 5F.3.1B2 — Isolamento Neon do B1

Status: **branch, banco e papel criados; isolamento de `neondb` e da branch principal
confirmado; limitação residual nos bancos de sistema aceita pelo usuário; nenhuma migration
aplicada**.
Data/hora: **2026-11-13T20:40:55-03:00**.
Decisão de aceite da limitação: **2026-11-13T21:29:27-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

---

## 1. Resumo executivo

Foi criado um ambiente Neon dedicado ao B1, separado da branch principal de homologação:

- branch `validation-b1`, ID `br-misty-sound-b6pnt7iw`, filha de `br-dawn-paper-b6qcp9gw`;
- banco `validation_b1`, vazio, owner `neondb_owner`;
- papel `validation_b1_runtime`, com LOGIN, senha aleatória forte, sem atributos administrativos;
- credencial armazenada no Gerenciador de Credenciais do Windows;
- `CONNECT` revogado de `PUBLIC` no `neondb` **da branch B1** e concedido ao papel B1 apenas em
  `validation_b1`;
- `USAGE` no schema `public` de `validation_b1`; sem `CREATE` no banco ou no schema.

Testes confirmam:

- o papel B1 conecta em `validation_b1`;
- o papel B1 **não** conecta em `neondb` da branch B1 (`42501`);
- o papel B1 **não** conecta na branch principal (`28P01`; papel inexistente lá);
- o papel não é superusuário, não cria bancos/papéis, não replica, não ignora RLS, não é membro
  de `neon_superuser`/`neondb_owner` e não possui bancos, schemas ou relações;
- `validation_b1` não contém tabelas;
- a branch principal e o `neondb` principal permanecem inalterados.

Há uma **limitação residual de plataforma**: na branch B1, o papel ainda consegue conectar nos
bancos de sistema `postgres` e `template1`, porque o `PUBLIC` recebe `CONNECT` por padrão e esses
bancos pertencem a `cloud_admin`. Não foi possível revogar esse `PUBLIC` com as credenciais
disponíveis (`neondb_owner` não é owner; `SET ROLE neon_superuser` é bloqueado). Esses bancos não
contêm dados de homologação. O papel não tem `CREATE` neles nem `SELECT` nas tabelas internas do
Neon em `postgres`.

**Classificação: 2 — Aprovado com pendências.** O isolamento dos dados de homologação
(`neondb`/branch principal) foi alcançado. A exigência literal de “CONNECT apenas em
`validation_b1`” não é integralmente possível nos bancos de sistema gerenciados pela Neon sem
intervenção da plataforma.

---

## 2. Recursos criados

| Recurso | Valor |
|---|---|
| Projeto Neon | `portal-contas-homologacao` / `square-mountain-69641645` |
| Organization | `org-odd-cloud-52869489` |
| Região | `aws-sa-east-1` |
| Branch B1 | `validation-b1` / `br-misty-sound-b6pnt7iw` |
| Branch pai | `br-dawn-paper-b6qcp9gw` |
| Criação | `parent-data` (cópia copy-on-write, incluindo roles e `neondb`) |
| Database B1 | `validation_b1` |
| Owner do database | `neondb_owner` |
| Papel B1 | `validation_b1_runtime` |
| Host B1 | `ep-rough-glade-••••••••.c-2.sa-east-1.aws.neon.tech` |
| Modo de pooling | direto (não pooled) |
| Tabelas em `validation_b1` | 0 |
| Migrations aplicadas | nenhuma |

O `neondb` da branch B1 foi copiado do pai e mantém os dados de homologação na branch de
validação. Ele **não** foi removido nem teve dados/schema alterados. A única alteração foi de ACL
do database, descrita na seção 4, e vale apenas para a branch B1.

---

## 3. Credencial

| Item | Valor |
|---|---|
| Gerenciador | Windows Credential Manager |
| Tipo | Genérico |
| Target | `portal-contas-validation-b1/validation_b1_runtime` |
| Usuário | `validation_b1_runtime` |
| Persistência | máquina local |
| Senha | 48 bytes aleatórios, 64 caracteres URL-safe |
| Senha exibida em terminal/log | não |
| Senha em `.env`, config, `dist/` ou relatório | não |
| Verificação | `cmdkey /list:portal-contas-validation-b1/validation_b1_runtime` confirmou target, usuário e persistência |

A senha foi gerada em memória durante o setup e gravada diretamente no Credential Manager via
`CredWriteW`. Ela não foi incluída em argumentos de processo, arquivos temporários, comandos
versionados ou saída de console. A connection string completa também não foi registrada.

---

## 4. Alterações de ACL

Todas as alterações abaixo são **locais à branch `validation-b1`**. Nenhum comando foi executado
na branch principal.

### `neondb` da branch B1

```sql
REVOKE CONNECT ON DATABASE neondb FROM PUBLIC;
```

Efeito observado:

```text
datacl = {=T/neondb_owner,neondb_owner=CTc/neondb_owner,neon_superuser=CTc/neondb_owner,
          analytics_runtime=c/neondb_owner,analytics_cleanup=c/neondb_owner}
```

O `PUBLIC` manteve apenas `TEMP`; perdeu `CONNECT` e `CREATE`. O papel B1 não tem `CONNECT` no
`neondb` (`has_database_privilege = false`) e a conexão real falha com `42501`.

As definições dos papéis copiados (`neondb_owner`, `analytics_runtime`, `analytics_cleanup`) não
foram alteradas: não houve `ALTER ROLE`, troca de senha, `GRANT`/`REVOKE` de membership ou mudança
de atributos. A consequência de acl é apenas a perda de `CONNECT` via `PUBLIC` no `neondb` da
branch B1, que não é usado por esses papéis nessa branch.

### `validation_b1`

```sql
REVOKE CONNECT ON DATABASE validation_b1 FROM PUBLIC;
GRANT CONNECT ON DATABASE validation_b1 TO validation_b1_runtime;
GRANT USAGE ON SCHEMA public TO validation_b1_runtime;
REVOKE CREATE ON SCHEMA public FROM validation_b1_runtime;
```

Efeito observado:

```text
datacl = {=T/neondb_owner,neondb_owner=CTc/neondb_owner,neon_superuser=CTc/neondb_owner,
          validation_b1_runtime=c/neondb_owner}
```

O papel B1 é o único papel não-owner com `CONNECT` explícito. Não há `CREATE` no database nem no
schema `public`. Não foram concedidos privilégios de tabela, sequência ou função, pois o banco está
vazio e nenhuma migration foi aplicada.

---

## 5. Testes de isolamento

### 5.1 Conexão positiva

O papel `validation_b1_runtime` conectou em `validation_b1` e executou consultas somente leitura.

| Verificação | Resultado |
|---|---|
| `current_user` | `validation_b1_runtime` |
| `current_database()` | `validation_b1` |
| `rolsuper` | `false` |
| `rolcreatedb` | `false` |
| `rolcreaterole` | `false` |
| `rolreplication` | `false` |
| `rolbypassrls` | `false` |
| `CONNECT` em `validation_b1` | `true` |
| `CREATE` em `validation_b1` | `false` |
| `CONNECT` em `neondb` | `false` |
| `USAGE` em `public` | `true` |
| `CREATE` em `public` | `false` |
| Bancos possuídos | 0 |
| Schemas possuídos | 0 |
| Relações possuídas | 0 |
| Memberships do papel | nenhuma |
| Tabelas em `public` de `validation_b1` | 0 |

### 5.2 Conexões negativas

| Destino | Resultado |
|---|---|
| `neondb` na branch B1 | bloqueado: `42501 — permission denied for database "neondb"` |
| Branch principal (`neondb`) | bloqueado: `28P01 — password authentication failed for user 'validation_b1_runtime'` |

O erro da branch principal é compatível com papel branch-scoped: `validation_b1_runtime` não
existe na branch principal. `neon roles list --branch main` continua retornando apenas
`analytics_runtime`, `analytics_cleanup` e `neondb_owner`.

### 5.3 Branch principal e `neondb` principal

| Verificação | Resultado |
|---|---|
| Branches | `main` e `validation-b1` presentes; `main` não foi alterada |
| Roles na main | `analytics_runtime`, `analytics_cleanup`, `neondb_owner`; sem `validation_b1_runtime` |
| Databases na main | apenas `neondb` |
| ACL do `neondb` principal | preservada, incluindo `PUBLIC` com `CONNECT`/`CREATE`/`TEMP` |
| Dados/schema do `neondb` principal | não alterados |
| Migration | nenhuma aplicada |

ACL observada no `neondb` principal:

```text
{=Tc/neondb_owner,neondb_owner=CTc/neondb_owner,neon_superuser=CTc/neondb_owner,
 analytics_runtime=c/neondb_owner,analytics_cleanup=c/neondb_owner}
```

---

## 6. Limitação residual: bancos de sistema

Na branch B1, os bancos `postgres` e `template1` são gerenciados pela Neon e pertencem a
`cloud_admin`:

```text
postgres  owner = cloud_admin, datacl = null (defaults de plataforma)
template1 owner = cloud_admin, datacl = {=c/cloud_admin,cloud_admin=CTc/cloud_admin}
```

O papel B1 consegue conectar nesses dois bancos porque o `PUBLIC` recebe `CONNECT` por padrão.
Tentativas de corrigir isso com as credenciais disponíveis não foram efetivas:

- `REVOKE CONNECT ON DATABASE postgres/template1 FROM PUBLIC` executado como `neondb_owner` não
  alterou a ACL (sem privilégio de owner);
- `SET ROLE neon_superuser` é bloqueado pela plataforma;
- `neondb_owner` é membro de `neon_superuser`, mas `neon_superuser` não é owner de `postgres`/
  `template1` e não é superusuário.

Impacto observado:

| Verificação | Resultado |
|---|---|
| `CONNECT` em `postgres` | permitido (default de plataforma) |
| `CONNECT` em `template1` | permitido (default de plataforma) |
| `CREATE` em `postgres`/`template1` | `false` |
| `CREATE` no schema `public` de `postgres`/`template1` | `false` |
| Tabelas de aplicação em `template1` | 0 |
| Tabelas internas no `postgres` | 4, todas owner `cloud_admin`; sem `SELECT` para o papel B1 |
| Dados de homologação nesses bancos | nenhum |

As 4 tabelas internas observadas em `postgres` são de infraestrutura Neon
(`neon.drop_subscriptions_done`, `neon_migration.migration_id`, `public.health_check`,
`public.lakebase_attributes`), não dados de homologação. O papel não possui `SELECT` nelas.

Se a exigência de “CONNECT apenas em `validation_b1`” incluir também `postgres` e `template1`,
ela não pode ser atendida integralmente neste projeto com as credenciais atuais. As alternativas
seriam intervenção da Neon/`cloud_admin` nesses bancos, mudança de plataforma/projeto ou aceitar a
limitação documentada. Nenhuma dessas alternativas foi executada.

---

## 7. O que não foi feito

- Nenhuma migration `001`–`006` foi aplicada.
- Nenhum papel de cleanup foi criado.
- Nenhuma permissão de tabela/sequência/função foi concedida ao collector.
- Nenhuma alteração de dados, schema ou ACL na branch principal.
- Nenhum deploy, variável de ambiente, Function/Edge remota ou alteração na Netlify.
- Nenhum commit, push, PR ou merge.
- Nenhuma credencial foi impressa, gravada em arquivo versionado ou incluída no relatório.
- Nenhuma verificação independente de saldo/créditos foi feita nesta etapa.

---

## 8. Decisão registrada

Em **2026-11-13T21:29:27-03:00**, o usuário decidiu **aceitar a limitação de plataforma** nos
bancos de sistema `postgres`/`template1`, mantendo o isolamento efetivo de `neondb`/branch
principal e o princípio de menor privilégio.

Consequências:

- o ambiente B1 permanece criado e pode ser usado na próxima fase autorizada;
- nenhuma migration foi aplicada nesta etapa;
- o papel B1 não deve receber privilégios além de `CONNECT` em `validation_b1` e `USAGE` no
  schema até que a fase de migrations/grants seja explicitamente autorizada;
- a próxima etapa autorizada pode aplicar as migrations como `neondb_owner` e conceder ao papel B1
  apenas os privilégios de tabela necessários ao collector, sem criar papel de cleanup e sem
  reutilizar credenciais de homologação;
- a limitação residual deve ser reavaliada se o escopo de segurança passar a incluir os bancos de
  sistema gerenciados pela Neon.
