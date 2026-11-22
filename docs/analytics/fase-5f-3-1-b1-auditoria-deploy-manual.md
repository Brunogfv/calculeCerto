# Fase 5F.3.1B1 — Auditoria do método de deploy manual do site B1

Status: **auditoria local concluída; nenhum deploy executado**.
Data/hora: **2026-11-13T18:47:34-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

A Fase 5F.3.1B2 **não** foi iniciada.

---

## 1. Resumo executivo

O método manual mais seguro para o B1 é:

```text
Executar a CLI a partir de validation-b1/
usar --site 9cd7034f-5691-46af-8030-d70f7ed52ca7
usar --dir dist e --functions netlify/functions
deixar o build padrão executar o netlify.toml local
```

A CLI **27.19.0**:

- reconhece o `netlify.toml` do B1 quando executada em `validation-b1/`;
- executa `node scripts/build.mjs`;
- empacota a Function `capture-html`;
- empacota a Edge Function `html-capture`;
- gera os bundles locais sem publicar;
- aceita `--site` explícito, sem exigir `netlify link`;
- declara que o deploy manual envia arquivos estáticos, Functions e Edge Functions e processa
  redirects/headers.

Isso foi comprovado localmente com `netlify build --dry --offline` e `netlify build --offline`.
**O upload remoto não foi executado**, por proibição explícita. Portanto o método está
**aprovado com pendências**: a prova final de upload/atomicidade/runtime continua na 5F.3.1B2.

**Classificação: 2 — Aprovado com pendências.**

---

## 2. Versão e ambiente

| Item | Valor |
|---|---|
| Netlify CLI | `27.19.0` (via `npx netlify-cli`) |
| Node local | `v24.13.0` |
| Node B1 (`netlify.toml`/engines) | `22` / `>=22` |
| Site B1 | `portal-contas-validation-b1` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Domínio B1 | `https://portal-contas-validation-b1.netlify.app` |
| Team | BruMiTa / `697d58587a017c3396fb416e` |
| Plano | Free |
| Estado atual do site | Público, vazio, sem deploy, sem repositório, sem variáveis |

O Node 24 local é compatível com a CLI; o build B1 usa Node 22 no `netlify.toml`, e a CLI/Netlify
respeita essa configuração no build remoto. Para reproduzir o runtime, o Node local ideal é 22.

---

## 3. Documentação oficial consultada

Consultada em **2026-11-13**.

1. Netlify — **Get started with Netlify CLI** (manual deploys, diretórios, Functions, draft/prod).
   https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/
2. Netlify — **Get started with Edge Functions** (manual deploy suportado a partir do CLI 12.2.8).
   https://docs.netlify.com/build/edge-functions/get-started/
3. Netlify — **Functions configuration** (diretório de Functions).
   https://docs.netlify.com/build/functions/configuration/
4. Netlify — **Optional configuration for Edge Functions** (diretório de Edge).
   https://docs.netlify.com/build/edge-functions/optional-configuration/
5. Netlify — **File-based configuration** (netlify.toml, publish, Functions).
   https://docs.netlify.com/build/configure-builds/file-based-configuration/
6. Netlify — **Headers** / **Redirects**.
   https://docs.netlify.com/manage/routing/headers/
   https://docs.netlify.com/manage/routing/redirects/overview/
7. CLI instalada — `netlify deploy --help`, `netlify build --help` (inspeção local, versão 27.19.0).

Documentação oficial confirma:

- `netlify deploy` faz build local por padrão, envia estáticos, Functions e Edge Functions e processa
  redirects/headers.
- `--dir` e `--functions` são relativos ao diretório atual.
- `--site` recebe nome ou ID; `--prod` publica; sem `--prod` é draft.
- Manual deploy de Edge Functions exige CLI 12.2.8+; a versão 27.19.0 atende.
- O deploy manual de Functions precisa de `node_modules` local para as dependências.

---

## 4. Comandos futuros recomendados (NÃO EXECUTADOS)

### Draft para inspeção

Executar a partir de `validation-b1/`:

```powershell
cd "D:\Projetos\Site Calculadora\validation-b1"
npx netlify-cli deploy `
  --site 9cd7034f-5691-46af-8030-d70f7ed52ca7 `
  --dir dist `
  --functions netlify/functions `
  --skip-functions-cache `
  --message "B1 validation draft"
```

### Produção, somente após aprovação do draft e nova autorização

```powershell
cd "D:\Projetos\Site Calculadora\validation-b1"
npx netlify-cli deploy `
  --site 9cd7034f-5691-46af-8030-d70f7ed52ca7 `
  --dir dist `
  --functions netlify/functions `
  --skip-functions-cache `
  --prod `
  --message "B1 validation production"
```

**Não usar:**

- `--site-name`/`--create-site` (o site já existe);
- `--remote` (exige repositório conectado);
- `--allow-anonymous`;
- `--no-build` no primeiro deploy (o build local precisa gerar `dist` e bundles);
- execução a partir da raiz do repositório;
- `--dir validation-b1/dist` a partir da raiz;
- `netlify link`.

O `--site` explícito e a execução em `validation-b1/` impedem a seleção implícita de produção ou
homologação. O `--dir dist` e `--functions netlify/functions` são relativos ao B1; o Edge é lido do
`netlify.toml` local.

---

## 5. Diretórios e artefatos necessários

| Item | Caminho | Situação |
|---|---|---|
| Config B1 | `validation-b1/netlify.toml` | Presente; build `node scripts/build.mjs`, publish `dist`, Functions e Edge configurados |
| Publish | `validation-b1/dist/` | 6 arquivos publicados + `build-manifest.json` |
| Functions | `validation-b1/netlify/functions/` | `capture-html.mjs` + `_lib` |
| Edge Functions | `validation-b1/netlify/edge-functions/` | `html-capture.js` + `_lib` |
| Headers | `validation-b1/dist/_headers` | Presente; headers normalizados no build |
| Redirects | `validation-b1/dist/_redirects` | Ausente; não há redirects no B1 |
| Scheduled Functions | — | Não existem no B1; não aplicável nesta fase |
| Dependências | `validation-b1/node_modules/` | `npm ci --ignore-scripts` já executado localmente |
| Lockfile | `validation-b1/package-lock.json` | v3, 18 entradas; sem `hasInstallScript` |

O build `netlify build --offline` gerou:

- `validation-b1/.netlify/functions/capture-html.zip`;
- `validation-b1/.netlify/edge-functions-dist/*.eszip` + `manifest.json`;
- `validation-b1/.netlify/netlify.toml` com paths absolutos e headers;
- `validation-b1/dist/` com `_headers`.

Nenhum `state.json` de linking foi criado. `.netlify/` é artefato local ignorado pelo `.gitignore`.

---

## 6. Testes locais e evidências

| Teste | Resultado |
|---|---|
| `npx netlify-cli build --dry --offline` em `validation-b1` | Config B1 detectado; build.command, Functions bundling e Edge Functions bundling listados |
| `npx netlify-cli build --offline` em `validation-b1` | Build, Functions bundling e Edge Functions bundling concluídos |
| `netlify build` Function packaging | `capture-html.mjs` empacotado |
| `netlify build` Edge packaging | `html-capture` empacotado; manifest com rota `/*` e exclusões |
| Conteúdo do ZIP de Function | Function + `node_modules/pg`/`zod`; sem páginas da raiz nem dist da produção |
| Edge bundle | `eszip` de ~29 KB + manifest; sem páginas da raiz |
| Headers | `_headers` presente no `dist`; `netlify build` normalizou em `.netlify/netlify.toml` |
| Redirects | Nenhum `_redirects`/redirect no B1 |
| Scheduled | Nenhuma função agendada no B1 |
| Scan de segredos no `.netlify`/`dist` | Nenhum padrão de segredo real encontrado |
| Build B1 | 6 publicados + manifest, 10,0 KiB |
| Testes B1 | 19/19 + 2/2 browser (fase anterior; sem alteração de implementação) |
| Testes raiz | 72/72; Playwright 11/11 (fase anterior) |

### O que foi comprovado

- A CLI descobre o `netlify.toml` do B1 quando executada no B1 e resolve base/publish/Functions/Edge
  localmente.
- O build local empacota Functions e Edge, com imports resolvidos.
- Nenhum conteúdo da raiz ou de produção entrou nos artefatos.
- O `_headers` é preservado no publish.
- O comando `deploy --help` declara upload de estáticos, Functions e Edge e processamento de
  redirects/headers.

### O que não foi comprovado

- Upload real de deploy draft/produção.
- Comportamento do `--site` em um deploy real sem criar `state.json` (revisão do código sugere que
  `--site` usa a API sem link; a confirmação final exige execução futura).
- Runtime real das Functions/Edge no site B1.
- Custo de deploy draft/produção e créditos.
- Comportamento de `--prod`/draft no site B1.
- Scheduled Functions no B1 (não existem).

---

## 7. Comparação das alternativas

| Alternativa | Como funciona | Vantagens | Desvantagens | Situação |
|---|---|---|---|---|
| **A. CLI manual com diretórios explícitos** | `deploy` a partir de `validation-b1`, `--site`, `--dir dist`, `--functions` | Simples; sem commit/repo; build e bundling locais; Site ID explícito; pode ser draft | Exige CLI/auth local; precisa validar upload real; risco de executar no diretório errado | **Recomendada** |
| **B. API oficial** | Criar deploy + upload de arquivos/bundles/edge manifests via API | Controle fino; sem CLI | Mais complexo; precisa montar/upload de bundles e manifests; maior chance de erro; autenticação/token | Não necessária agora |
| **C. Repositório Git + branch deploy** | Commit/push, conectar repo, build na Netlify | Fluxo versionado; Deploy Previews | Exige commit/push/conexão de repo; não autorizado; base/build settings; mais superfície | Não usar nesta fase |

**Recomendação: A.** A CLI local com `--site`, `--dir` e `--functions` é o método mais simples e
compatível com o B1. B só se A falhar em runtime; C fica fora do escopo.

---

## 8. Riscos e limitações

1. **Diretório errado:** executar na raiz pode usar o `netlify.toml` de produção. Mitigação:
   `cd validation-b1` e `--dir dist`/`--functions netlify/functions`.
2. **`--dir` sozinho:** não é suficiente para Functions/Edge. Usar build padrão e `--functions`;
   o Edge é lido do `netlify.toml`.
3. **Cache de Functions:** usar `--skip-functions-cache` na primeira validação para forçar bundling
   novo.
4. **Upload não comprovado:** a prova local cobre build/bundling, não o upload remoto nem o runtime.
5. **Site sem build settings/base:** o site B1 está vazio e manual; o deploy usa o config local. Não
   há build remoto/Git.
6. **Dependências:** `node_modules` do B1 precisa existir; `npm ci --ignore-scripts` foi executado.
7. **Segredos:** o build local não recebeu `DATABASE_URL`/`EDGE_INGEST_SECRET`; nenhum segredo foi
   incorporado. No deploy futuro, configurar segredos somente via runtime/site, nunca no HTML/JS.
8. **Scheduled Functions:** não existem no B1; se adicionadas, o build as empacota, mas o cron só
   roda em deploy publicado.
9. **Créditos:** não houve deploy; o custo real de draft/produção não foi medido. O saldo de 141,1 é
   confirmação do usuário e deve ser reconferido no painel.
10. **`--site`/link:** a revisão do código indica que `--site` usa a API sem chamar link; confirmar
    no primeiro deploy que nenhum `state.json` indesejado é criado. O diretório B1 não contém
    `state.json`.

---

## 9. Confirmação de ausência de deploy e alterações remotas

- Nenhum deploy draft, produção, branch ou preview foi executado.
- Nenhum upload de arquivos ao Netlify.
- Nenhuma configuração remota alterada.
- Nenhuma variável/segredo criado ou alterado.
- Nenhuma regra de rate limiting criada.
- Nenhuma Function/Edge Function executada remotamente.
- Nenhuma escrita no Neon, migration ou role.
- Nenhum commit, push, PR, repositório conectado ou `netlify link`.
- Nenhum serviço pago ou upgrade.
- O site B1 continua vazio, sem deploy e sem variáveis.
- Produção e homologação intactas.

O build local `netlify build --offline` criou apenas artefatos locais em
`validation-b1/.netlify/`; não publicou conteúdo.

---

## 10. Recomendação final

**2 — Aprovado com pendências.**

O método A está comprovado localmente para build, empacotamento de Functions e Edge Functions,
headers e caminhos explícitos. Não há bloqueador arquitetural. A publicação real ainda não foi
executada e precisa de autorização da 5F.3.1B2, preferencialmente:

1. Draft deploy a partir de `validation-b1/` com Site ID explícito e `--skip-functions-cache`.
2. Verificar URL do draft, páginas, headers, Function e Edge.
3. Confirmar que nenhum `state.json` de linking foi criado e que produção/homologação não mudaram.
4. Só então, com nova autorização, `--prod`.
5. Reconfirmar saldo de créditos no painel antes de qualquer deploy.

A Fase 5F.3.1B2 **não** deve começar automaticamente.
