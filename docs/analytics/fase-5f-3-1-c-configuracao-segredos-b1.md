# Fase 5F.3.1C — Configuração segura das variáveis do B1

Status: **duas variáveis configuradas exclusivamente no site B1; verificações aprovadas; nenhum
deploy, migration ou ingestão executados**.
Data/hora: **2026-11-13T22:23:14-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

---

## 1. Resumo executivo

Foram configuradas no site B1 apenas as duas variáveis autorizadas:

| Nome | Tipo | Armazenamento |
|---|---|---|
| `DATABASE_URL` | Segredo de servidor | Netlify, site-specific, `is_secret=true` |
| `EDGE_INGEST_SECRET` | Segredo HMAC | Netlify, site-specific, `is_secret=true` |

A `DATABASE_URL` aponta exclusivamente para:

- host da branch `validation-b1` (modo direto);
- database `validation_b1`;
- role `validation_b1_runtime`;
- SSL obrigatório via `sslmode=require`.

O `EDGE_INGEST_SECRET` foi gerado com 48 bytes aleatórios (64 caracteres URL-safe; 64 bytes UTF-8)
e armazenado no Windows Credential Manager em
`portal-contas-validation-b1/EDGE_INGEST_SECRET`.

A configuração foi feita por chamada autenticada à API da Netlify usando a sessão existente. Nenhum
valor de variável, senha, token ou connection string foi exibido. Não houve deploy e o B1 continua
vazio.

**Classificação: 1 — Aprovado.**

---

## 2. Identidades confirmadas

| Item | Valor |
|---|---|
| Equipe | BruMiTa |
| Team/Account ID | `697d58587a017c3396fb416e` |
| Site B1 | `portal-contas-validation-b1` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Domínio | `https://portal-contas-validation-b1.netlify.app` |
| Plano | Free |
| Visibilidade | Pública (`sso_login=false`) |
| Deploy no B1 | Nenhum (`deploy_id` e `published_deploy` nulos) |
| Produção | `273101e3-7a01-4931-aeaf-4cee4fe74f07` |
| Homologação | `3da70f72-70f7-4883-b60b-25b430cc9270` |

Nenhum comando foi executado usando apenas o nome do site; todas as escritas usaram o Site ID B1.

---

## 3. Auditoria do código

### 3.1 `DATABASE_URL`

- Lida pela Function em `validation-b1/netlify/functions/_lib/db.mjs:7,19`.
- Usada por `capture-html.mjs` via `getSharedPool(process.env)`.
- O pool usa `max=1` por padrão (`DB_POOL_MAX` é opcional; não configurado).
- O nome alternativo `CLEANUP_DATABASE_URL`/`MIGRATION_DATABASE_URL` não é usado pelo B1.
- A Edge Function não recebe `DATABASE_URL`; a allowlist de ambiente do Edge não a inclui.

### 3.2 `EDGE_INGEST_SECRET`

- Lida pela Edge Function em `validation-b1/netlify/edge-functions/_lib/edge-capture.mjs:68,117,190`.
- Lida pela Function em `validation-b1/netlify/functions/_lib/capture-config.mjs:13`.
- Mínimo validado: **32 bytes UTF-8**.
- Uso: HMAC-SHA-256 em hexadecimal, incluindo `rate_key` e assinatura
  `edge-v1\nkeyId\ntimestamp\nnonce\ncorpo`.
- `EDGE_INGEST_KEY_ID` é opcional; o código usa o default `v1`.
- Não foi criado `EDGE_INGEST_KEY_ID` nesta fase.

### 3.3 Flags e variáveis adicionais

- `EDGE_CAPTURE_ENABLED` e `EDGE_ANALYTICS_ENABLED` são comparadas explicitamente com `'true'`.
- `ANALYTICS_INGEST_ENABLED` não é usada pelo B1.
- `HTML_CAPTURE_CLEANUP_ENABLED` não é usada pelo B1; não há Scheduled Function de limpeza no B1.
- `RATE_LIMIT_HMAC_SECRET` não é usado pelo B1 e **não** foi criado.
- `CLEANUP_DATABASE_URL` e `MIGRATION_DATABASE_URL` não são necessárias no B1.
- Nenhuma variável adicional obrigatória foi encontrada. Portanto, as duas variáveis autorizadas
  bastam para o runtime do B1.

---

## 4. Conexão mínima com o banco B1

A senha foi recuperada exclusivamente do Windows Credential Manager, sem exibição. A connection
string foi montada em memória, sem gravação local.

| Verificação | Resultado |
|---|---|
| `current_database()` | `validation_b1` |
| `current_user` | `validation_b1_runtime` |
| Host | `ep-rough-glade-••••••••.c-2.sa-east-1.aws.neon.tech` |
| Database na URL | `validation_b1` (sem `neondb`) |
| Pooling | direto (não pooled) |
| `sslmode` | `require` |
| TLS do cliente | stream criptografado e certificado par presentes |
| Tabelas não-sistema em `validation_b1` | 0 |
| Migrations aplicadas | 0 |

Os endpoints direto e pooled foram testados; ambos conectaram. Foi escolhido o modo **direto** para
manter o baseline registrado na fase 5F.3.1B2 e porque o endpoint informa `pooler_enabled=false`.
Isso é compatível com `pg` Pool (`max=1`) e não altera o Neon.

Observação: o `pg_stat_ssl` do backend Neon pode retornar `false` porque a terminação TLS ocorre no
proxy da Neon; a evidência de SSL do cliente é o stream TLS criptografado com certificado par.

---

## 5. Variáveis configuradas na Netlify

A API `POST /accounts/{account_id}/env?site_id={site_id}` foi usada com as duas variáveis no nível
do site B1. Nenhuma variável foi criada no nível da equipe.

| Nome | Site-specific | Segredo | Contextos |
|---|---|---|---|
| `DATABASE_URL` | sim | sim | production, deploy-preview, branch-deploy, dev-server |
| `EDGE_INGEST_SECRET` | sim | sim | production, deploy-preview, branch-deploy, dev-server |

Escopos registrados pela API: `builds`, `functions`, `runtime`. O escopo `post_processing` foi
excluído porque segredos não podem executar nele.

A conta está no plano **Free** e `env_var_scopes.included=false`; portanto não há garantia de
isolamento granular por escopo. Os dois segredos de teste ficam disponíveis ao build do próprio B1,
que não os lê nem os imprime. O contexto `dev` não recebeu valor; o `netlify dev` local não deve ser
usado como prova de runtime com esses segredos.

A consulta de nomes no contexto de produção retornou:

```text
DATABASE_URL
EDGE_INGEST_SECRET
NODE_VERSION
```

`NODE_VERSION` vem do `netlify.toml`/build environment, não é variável site-specific criada nesta
fase.

---

## 6. Armazenamento local seguro

| Item | Valor |
|---|---|
| Credencial do banco | Windows Credential Manager, target `portal-contas-validation-b1/validation_b1_runtime` |
| Segredo Edge | Windows Credential Manager, target `portal-contas-validation-b1/EDGE_INGEST_SECRET` |
| `EDGE_INGEST_SECRET` | 64 caracteres / 64 bytes UTF-8; 48 bytes aleatórios |
| Senha/segredo exibidos | não |
| `.env` criado | não |
| Connection string em arquivo | não |
| Segredos em `dist/` ou `netlify.toml` | não |
| Segredos em logs/relatório | não |

A leitura de confirmação do segredo Edge retornou apenas tamanho e presença; o valor não foi
impresso. Nenhum `env:pull` foi executado.

---

## 7. Flags antes e depois

| Flag | Antes | Depois | Efeito |
|---|---|---|---|
| `ANALYTICS_INGEST_ENABLED` | ausente | ausente | desativada por padrão |
| `EDGE_CAPTURE_ENABLED` | ausente | ausente | desativada por padrão |
| `EDGE_ANALYTICS_ENABLED` | ausente | ausente | desativada por padrão |
| `HTML_CAPTURE_CLEANUP_ENABLED` | ausente | ausente | desativada por padrão |

As flags não foram criadas nem modificadas. Como o código exige o valor exato `'true'`, a ausência
mantém a captura e a ingestão desativadas. `EDGE_INGEST_KEY_ID` também permanece ausente; o código
usa o default `v1`.

---

## 8. Verificação posterior

| Verificação | Resultado |
|---|---|
| Variáveis site-specific no B1 | exatamente `DATABASE_URL` e `EDGE_INGEST_SECRET` |
| Variáveis na equipe (shared) | 0 |
| Variáveis no B1 com `is_secret` | 2/2 |
| Variáveis na produção | inalteradas (0 site-specific) |
| Variáveis na homologação | inalteradas (11 nomes, mesmos nomes de antes) |
| Deploy na produção | inalterado: `6af0feebef830ebab5cd25dd` |
| Deploy na homologação | inalterado: `6af47527818a48a5dbbef2c4` |
| Deploy no B1 | nenhum (`deploy_id`/`published_deploy` nulos) |
| Banco `validation_b1` | vazio, 0 tabelas não-sistema |
| Branch/database/role Neon | inalterados |
| Migrations | nenhuma |
| POST de ingestão | nenhum |
| Deploy draft/produção | nenhum |

O B1 continua público, vazio e sem deploy. Nenhuma alteração foi feita em produção, homologação,
Neon, branch, database, role, migrations ou rate limiting.

---

## 9. Pendências para o primeiro deploy draft

1. Autorização específica para o primeiro deploy draft.
2. Confirmar no deploy draft que a Function lê `DATABASE_URL` e que o Edge lê
   `EDGE_INGEST_SECRET` sem exibir valores.
3. Manter as flags desativadas até a janela controlada; não houve POST nem ativação nesta fase.
4. Considerar rotação do `EDGE_INGEST_SECRET` após o teste, se o ambiente for compartilhado.
5. Reavaliar o risco residual do plano Free: os segredos site-specific ficam disponíveis ao build
   do próprio B1.

---

## 10. Proibições respeitadas

- Nenhum deploy.
- Nenhum POST de captura/ingestão.
- Nenhuma flag ativada.
- Nenhuma migration, tabela, role, rate limit ou alteração no Neon.
- Nenhuma variável compartilhada ou em outro site.
- Nenhum commit, push, PR ou merge.
- Nenhum segredo ou connection string exibido ou gravado em arquivo versionado.
