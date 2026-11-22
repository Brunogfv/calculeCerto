# Fase 5F.3.1A — Verificação remota e preparação do site B1

Status: **preparação concluída; site B1 criado vazio; nenhum deploy ou variável configurada**.
Data/hora da execução: **2026-11-13T18:34:28-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

A Fase 5F.3.1B **não** foi iniciada.

---

## 1. Resumo executivo

A sessão Netlify autenticada foi utilizada via CLI (sem exibir tokens). Foram confirmados:

- equipe **BruMiTa**, ID `697d58587a017c3396fb416e`;
- plano **Free** (`account_type: Free`, `type_name: Free`, `type_slug: credit-free`);
- ausência de shared variables (`shared_env_variables.included: false`);
- ausência de escopos de env vars (`env_var_scopes.included: false`);
- ausência de cartão/pagamento e auto recharge (`has_stripe_payment_method: false`,
  `auto_topup_enabled: false`);
- produção pública, deploy `6af0feebef830ebab5cd25dd`;
- homologação privada, deploy `6af47527818a48a5dbbef2c4`;
- saldo informado pelo usuário: **141,1 créditos** (confirmação do usuário; não leitura de saldo
  pela API);
- disponibilidade do nome confirmada pela criação bem-sucedida.

O site B1 foi criado **vazio**, sem repositório, sem deploy, sem variáveis, sem segredos, sem
integrações e sem custo de deploy. O site ficou público (`sso_login: false`) e sem conteúdo
publicado.

**Site ID:** `9cd7034f-5691-46af-8030-d70f7ed52ca7`
**Nome:** `portal-contas-validation-b1`
**Domínio:** `https://portal-contas-validation-b1.netlify.app`

**Classificação: 1 — Preparação concluída.** A base directory/build settings não foram aplicadas
porque o site não tem repositório; isso fica documentado como pendência da etapa de deploy manual,
não como falha de criação.

---

## 2. Equipe e plano confirmados

| Item | Evidência |
|---|---|
| Team ID | `697d58587a017c3396fb416e` (`listAccountsForUser`/`sites:list`) |
| Nome | BruMiTa |
| Plano | Free (`account_type: Free`, `type_name: Free`, `type_slug: credit-free`) |
| Créditos do plano | 300 incluídos; `used` da API não foi usado como saldo atual |
| Shared variables | `shared_env_variables.included: false` |
| Escopos de env vars | `env_var_scopes.included: false` |
| Cartão/pagamento | `has_stripe_payment_method: false` |
| Auto recharge | `auto_topup_enabled: false` |
| Pro trial | `on_pro_trial: false` |

Nenhuma variável compartilhada sensível foi encontrada. Nenhum valor de variável foi lido ou
exibido.

---

## 3. Créditos

- **Saldo informado pelo usuário:** 141,1 créditos.
- **Natureza:** confirmação do usuário, não leitura independente da API.
- **Teto da validação:** 32 créditos.
- **Reserva mínima:** 100 créditos.
- **Saldo mínimo de início:** 132 créditos.
- **Custo de deploy:** nenhum; não houve deploy.
- **Custo de criação:** nenhuma tarifa própria documentada; não foi observado consumo de deploy.
- A API de conta retornou `credits.included=300` e `credits.used=0`; esse valor **não** foi usado
  como saldo atual porque o usuário informou 141,1. O painel deve ser a fonte de verdade.

---

## 4. Produção e homologação — antes e depois

| Site | ID | Antes | Depois |
|---|---|---|---|
| Produção | `273101e3-7a01-4931-aeaf-4cee4fe74f07` | Pública (`sso_login:false`), deploy `6af0feebef830ebab5cd25dd`, branch `main` | Inalterada; mesmos ID, visibilidade e deploy |
| Homologação | `3da70f72-70f7-4883-b60b-25b430cc9270` | Privada (`sso_login:true`), deploy `6af47527818a48a5dbbef2c4` | Inalterada; mesmos ID, visibilidade e deploy |
| B1 | `9cd7034f-5691-46af-8030-d70f7ed52ca7` | Não existia | Criado público, sem deploy, sem variáveis, sem repositório |

Nenhuma operação foi feita em produção ou homologação.

---

## 5. Variáveis compartilhadas

- A API de equipe confirmou `shared_env_variables.included: false`.
- Não foi encontrada variável compartilhada sensível ou relacionada a produção/homologação.
- Nenhum valor de variável foi lido, exibido ou copiado.
- Nenhuma variável foi criada, alterada ou excluída.
- Nenhuma variável foi configurada no site B1: `env:list` a partir de diretório neutro retornou
  `{}`.

---

## 6. Auditoria local do B1

- `validation-b1/` presente.
- `netlify.toml` próprio com build `node scripts/build.mjs`, publish `dist`, Edge em
  `netlify/edge-functions`, Functions em `netlify/functions`, `NODE_VERSION=22`,
  `NPM_FLAGS=--omit=dev --ignore-scripts`.
- `shared-manifest.json`: versão 1, **13 arquivos**; hashes canônico/cópia/manifesto conferem.
- `IMGS_PREFIX` ausente; literal `'/imgs/*'` no canônico e na cópia.
- `package.json`: `pg 8.23.1`, `zod 4.6.7`, Playwright dev `1.64.1`; lockfile v3 com 18 entradas.
- Nenhum `hasInstallScript` no lockfile.
- `dist/`: 7 arquivos (6 publicados + `build-manifest.json`); sem segredos, GA4, AdSense,
  afiliados, `/api/capture-html`, `/api/collect`, IDs de visitante ou recursos externos.
- Nenhum arquivo funcional foi modificado nesta fase.
- Testes locais anteriores: B1 **19/19 + 2/2 browser**, raiz **72/72**, Playwright **11/11**.
  Não foram reexecutados nesta fase para não regenerar artefatos; a checagem read-only de hashes,
  config e dependências passou.

**Base directory:** o site B1 foi criado sem repositório e sem build settings; não há
`base=validation-b1`, `cmd` ou `dir` no site remoto. Isso é intencional para um site vazio/manual.
O `netlify.toml` local continua sendo a referência para um futuro build/deploy; a base será
aplicada quando/se um repositório for conectado, ou o deploy manual usará `validation-b1/dist`
diretamente. O ponto fica como pendência para a 5F.3.1B.

---

## 7. Método de criação e deploy futuro

- Netlify CLI disponível via `npx netlify-cli` versão **27.19.0**, usando a sessão já autenticada.
- Nenhum token foi solicitado ou exibido.
- `netlify link` **não** foi executado.
- Criação usada:

```text
npx netlify-cli sites:create \
  --name portal-contas-validation-b1 \
  --account-slug bruno-gfv \
  --manual \
  --disable-linking \
  --json
```

- A criação foi **sem repositório conectado**, sem deploy, sem variáveis e sem linking local.
- O site remoto ficou com `build_settings` vazio; não há build automático.
- Deploy manual futuro de `validation-b1/dist/`, sem commit/push/PR, ainda precisa ser comprovado
  em etapa separada. A CLI suporta deploys manuais; a compatibilidade de Functions/Edge nesse modo
  deve ser validada na 5F.3.1B.
- Nenhum deploy foi executado nesta fase.

---

## 8. Site criado

| Campo | Valor |
|---|---|
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Nome | `portal-contas-validation-b1` |
| Domínio | `https://portal-contas-validation-b1.netlify.app` |
| Conta/equipe | BruMiTa / `697d58587a017c3396fb416e` |
| Plano | Free |
| Visibilidade | Pública (`sso_login:false`; sem senha) |
| Deploy publicado | Nenhum (`deploy_id` e `published_deploy` vazios) |
| Repositório | Nenhum |
| Build settings | Vazios |
| Variáveis de ambiente | Nenhuma (`{}`) |
| Funções/Edge | Nenhuma publicada; sem deploy |
| Custo de deploy | Nenhum; não houve deploy |

O nome foi confirmado disponível pela criação bem-sucedida. Nenhum nome alternativo foi escolhido.

---

## 9. Deploy e variáveis

- Nenhum deploy foi realizado.
- Nenhum branch deploy ou Deploy Preview foi criado.
- Nenhuma variável, secret, flag ou configuração de ambiente foi criada.
- Nenhuma regra de rate limiting foi criada.
- Nenhuma Function/Edge Function foi executada remotamente.
- Nenhum conteúdo de `validation-b1/` foi publicado.
- Nenhuma escrita no Neon, migration ou role.
- Nenhum upgrade, cartão ou recurso pago.
- Nenhum commit, push, PR ou merge.
- Nenhum `netlify link` e nenhuma alteração no repositório local.

---

## 10. Consumo de créditos observado

- Não houve deploy; não há custo de deploy de 15 créditos.
- A criação de site não tem tarifa própria documentada e não foi observado consumo de deploy.
- O saldo atual permanece baseado na confirmação do usuário (141,1); não foi feita leitura
  independente de saldo.
- A API de conta mostrou `credits.used=0`, mas isso não foi tratado como saldo atual.
- Recomenda-se conferir o painel antes da 5F.3.1B; o teto de 32 e a reserva de 100 continuam.

---

## 11. Pendências para a próxima etapa

1. Confirmar no painel o saldo após a criação (esperado ainda ≥132).
2. Comprovar o caminho de deploy manual de `validation-b1/dist/` sem commit/push/PR e sem
   repositório conectado.
3. Definir como Functions/Edge serão publicadas no deploy manual; não presumir que o deploy
   estático de `dist` as inclua.
4. Configurar `validation-b1` como base/build settings somente se um repositório for conectado;
   para deploy manual, usar o diretório local.
5. Criar/configurar banco, branch e role Neon de teste, `DATABASE_URL` e `EDGE_INGEST_SECRET`
   exclusivos; nada foi criado.
6. Validar runtime real: bundler, HMAC/replay, HTTPS/cookie, rate limit, fail-open, custos.
7. Não ativar flags, rate limiting ou variáveis antes da autorização da 5F.3.1B.

A Fase 5F.3.1B **não** deve começar automaticamente.

---

## Confirmação obrigatória

- Site B1 criado apenas vazio.
- Nenhum deploy realizado.
- Nenhum branch deploy criado.
- Nenhum POST remoto; apenas leitura e a criação autorizada do site.
- Nenhuma configuração de produção/homologação alterada.
- Nenhuma variável ou flag alterada.
- Nenhuma regra de rate limiting criada.
- Nenhuma Function/Edge Function executada remotamente.
- Nenhuma escrita no Neon.
- Nenhuma migration ou role alterada.
- Nenhum serviço pago contratado ou cartão adicionado.
- Nenhum commit, push, PR ou merge.
- Produção e homologação intactas; visibilidades e deploys inalterados.
- Nenhuma credencial exibida.
