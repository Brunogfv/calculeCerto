# Fase 5F.11 — Criação da role e aplicação dos privilégios de cleanup no Neon B1

Status: **role `validation_b1_cleanup` criada, SQL 007 aplicado, privilégios e conexão direta
validados; nenhuma limpeza, deploy, flag ou variável Netlify foi alterada**.
Data/hora: **2026-11-16T18:28:44-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 1 — Aprovado, com exceção de plataforma documentada.** O Neon adiciona
automaticamente `neondb_owner` como membro da nova role, com grantor `cloud_admin`; o usuário
autorizou aceitar essa exceção. Nenhuma outra membership foi aceita.

---

## 1. Identificação confirmada

| Item | Valor |
|---|---|
| Autenticação Neon | `bruno.gfv` |
| Project ID | `square-mountain-69641645` |
| Projeto | `portal-contas-homologacao` |
| Branch | `validation-b1` / `br-misty-sound-b6pnt7iw` |
| Database | `validation_b1` |
| PostgreSQL | 17.12 |
| Executor da criação/007 | `neondb_owner` |
| Role runtime | `validation_b1_runtime` |
| Nova role | `validation_b1_cleanup` |

A conexão confirmou `current_database()=validation_b1`; não apontou para `main` nem `neondb`.

---

## 2. Estado inicial

- `validation_b1_cleanup` ausente.
- 6 migrations, 13 tabelas de aplicação + `schema_migrations`.
- 2 `html_events`, 2 nonces, 2 edge rate limits, 1 contador diário, 1 agregado diário, 1 mensal.
- `validation_b1_runtime` sem DELETE/TRUNCATE/DDL, sem memberships adicionais, sem `neondb`.
- Deploy B1 `6afa50e666410b01eb5a0589`, sem cleanup/rateLimit publicados; flags desativadas.
- `CLEANUP_DATABASE_URL` ausente.

---

## 3. Criação da role

A role foi criada em transação como `neondb_owner`, com:

- LOGIN;
- senha aleatória de 48 bytes, nunca exibida;
- `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`, `NOREPLICATION`, `NOBYPASSRLS`;
- `NOINHERIT`;
- nenhum objeto próprio;
- nenhuma membership recebida.

A senha foi armazenada no Windows Credential Manager em
`portal-contas-validation-b1/validation_b1_cleanup`; a confirmação foi feita por target, sem exibir
o valor.

### Exceção de plataforma

O Neon adicionou automaticamente:

```text
member: neondb_owner
group_role: validation_b1_cleanup
grantor: cloud_admin
admin_option: true
inherit_option: false
set_option: false
```

Tentativas de revogar com `neondb_owner` não tiveram efeito; `SET ROLE neon_superuser` é bloqueado.
O usuário autorizou aceitar essa membership de plataforma. Ela não concede privilégios adicionais à
role de cleanup; `neondb_owner` já é administrativo/owner.

Não há nenhuma outra membership recebida ou concedida para `validation_b1_cleanup`.

---

## 4. SQL 007 aplicado

O SQL 007 foi aplicado como `neondb_owner`, em transação única, no banco `validation_b1`.

Pré-condições confirmadas:

- banco correto;
- 13 tabelas e colunas de cutoff;
- role existente;
- atributos corretos, `NOINHERIT`;
- membership recebida: nenhuma;
- membership concedida: somente a exceção `neondb_owner`/`cloud_admin`;
- `schema_migrations` sem acesso prévio.

Aplicação:

- `CONNECT`/`USAGE`;
- revogação de `CREATE` no schema/database;
- `GRANT SELECT, DELETE` nas 13 tabelas;
- nenhum INSERT/UPDATE/TRUNCATE/DDL;
- índices de `sessions.last_seen_at` e `visitors.last_seen_at`;
- pós-condições validadas.

O SQL 007 não é uma migration registrada; `schema_migrations` permanece com 6 registros.

---

## 5. Privilégios efetivos

| Objeto | SELECT | DELETE | INSERT | UPDATE | TRUNCATE |
|---|---:|---:|---:|---:|---:|
| `visitors` | sim | sim | não | não | não |
| `sessions` | sim | sim | não | não | não |
| `pageviews` | sim | sim | não | não | não |
| `events` | sim | sim | não | não | não |
| `affiliate_clicks` | sim | sim | não | não | não |
| `ingest_events` | sim | sim | não | não | não |
| `rate_limits` | sim | sim | não | não | não |
| `html_events` | sim | sim | não | não | não |
| `html_traffic_daily` | sim | sim | não | não | não |
| `html_indicators_monthly` | sim | sim | não | não | não |
| `edge_daily_counters` | sim | sim | não | não | não |
| `edge_nonces` | sim | sim | não | não | não |
| `edge_rate_limits` | sim | sim | não | não | não |

Outros controles:

- `USAGE` em public: sim;
- `CREATE` no schema/database: não;
- `CONNECT` no B1: sim;
- `CONNECT` em `neondb`: não;
- `schema_migrations`: sem SELECT;
- role sem atributos administrativos;
- sem objetos próprios;
- nenhuma outra membership.

---

## 6. Índices

| Índice | Definição |
|---|---|
| `sessions_last_seen_at_idx` | `btree (last_seen_at)` em `public.sessions` |
| `visitors_last_seen_at_idx` | `btree (last_seen_at)` em `public.visitors` |

Nenhum índice inesperado foi criado.

---

## 7. Conexão direta

Conexão direta validada com `validation_b1_cleanup`:

| Item | Resultado |
|---|---|
| Banco | `validation_b1` |
| Usuário | `validation_b1_cleanup` |
| PostgreSQL | 17.12 |
| SSL | stream TLS criptografado; certificado par presente |
| CONNECT no B1 | sim |
| CONNECT em `neondb` | não |
| USAGE no schema | sim |
| SELECT em `html_events` | sim |
| DELETE em `html_events` | sim |
| INSERT em `html_events` | não |
| Conexão encerrada | sim |

Nenhuma operação de escrita, DELETE, DDL ou limpeza foi executada.

---

## 8. Runtime e outros ambientes

- `validation_b1_runtime` permanece sem DELETE/TRUNCATE/DDL e sem acesso a `neondb`.
- Nenhuma migration adicional; 6 registros em `schema_migrations`.
- 13 tabelas de aplicação.
- 2 registros sintéticos preservados; nenhuma limpeza executada.
- Netlify permanece no deploy `6afa50e666410b01eb5a0589`; sem deploy, variáveis ou flags alteradas.
- Produção e homologação principal não foram tocadas.
- Nenhuma role, grant ou objeto fora do B1 foi alterado.

---

## 9. Operações não executadas

- `CLEANUP_DATABASE_URL` não configurado.
- `HTML_CAPTURE_CLEANUP_ENABLED` não ativado.
- Scheduled Function não executada.
- Nenhum cleanup, DELETE, INSERT, UPDATE, TRUNCATE ou DDL de aplicação.
- Nenhum POST remoto, deploy, rate limit ou alteração Netlify.
- Nenhum commit/push.

---

## 10. Pendências

1. Configurar `CLEANUP_DATABASE_URL` direto no Site ID B1.
2. Configurar `CLEANUP_EXPECTED_DATABASE=validation_b1` e
   `CLEANUP_EXPECTED_ROLE=validation_b1_cleanup`.
3. Fazer deploy preview com o código novo (inclui cleanup/rateLimit).
4. Validar cleanup manual com dados sintéticos e sem apagar os 2 registros existentes.
5. Validar rate limiting real e IP interno Edge→Function.
6. Manter a flag de cleanup desligada até a janela autorizada.
7. Não promover deploy nem alterar produção/homologação.

---

## 11. Classificação final

**1 — Aprovado, com exceção de plataforma aceita.** Role, SQL 007, grants, índices, privilégios
mínimos e conexão direta foram validados. A única exceção é a membership automática
`neondb_owner -> validation_b1_cleanup`, criada por `cloud_admin`, expressamente aceita pelo
usuário. A limpeza permanece desativada.
