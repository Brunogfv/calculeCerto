# Fase 5F.3.0.3 — Auditoria independente final de prontidão B1

Status: **auditoria concluída; nenhum site, deploy ou operação remota executada**.
Data: 2026-11-11.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

A Fase 5F.3.1 **não** foi iniciada. Esta fase não corrigiu achados; apenas auditou e documentou.

---

## 1. Resumo executivo

O bloqueador anterior foi resolvido: o `config` da Edge usa literais, sem `IMGS_PREFIX` ou
expressões dinâmicas; canônico e B1 estão sincronizados. O build B1 agora verifica o manifesto,
o canônico e a cópia, e falha em divergência, ausência, manifesto inválido, entrada extra ou
caminho inválido. As dependências do B1 estão explícitas, com lockfile próprio, Playwright como
devDependency e `NPM_FLAGS=--omit=dev --ignore-scripts`.

**Testes:** B1 **19/19** build/manifest/HMAC + **2/2** browser; raiz **72/72**; Playwright da raiz
**11/11**; build B1 **6 publicados + manifest, 10,0 KiB**; scan do `dist` sem segredos/trackers.

**Principal risco restante:** no plano Free, variáveis site-specific ficam disponíveis também ao
build (escopos são Pro/Enterprise). Para o B1, isso é **condicionado/aceitável** apenas porque os
segredos serão exclusivamente de teste (banco/role e HMAC de teste), não haverá shared variables
no Free e o build não lê/imprime ambiente, não executa lifecycle scripts e não usa plugins.
Se algum segredo de produção/homologação ou shared variable for usado, o risco passa a **impeditivo**.

**Pendências altas:** criar o site com **base directory `validation-b1`** (não apenas package
directory); resolver o caminho de deploy do diretório não commitado (Git ou CLI/API); comprovar o
bundler/runtime real; validar replay/Neon; aceitar explicitamente a exposição condicionada do build.

**Classificação: 2 — Aprovado com pendências que precisam ser aceitas expressamente pelo usuário.**
Não é autorização para criar o site agora.

---

## 2. Estado do projeto

| Item | Valor |
|---|---|
| Diretório | `D:\Projetos\Site Calculadora` |
| Branch | `feat/portal-analytics` |
| Commit | `8d455fc4f01f7944f2a015681dd5c81c0704d786` |
| `git status --short` | 262 entradas |
| `validation-b1/` | Não rastreado |
| Código canônico `netlify/` | Não rastreado (fases anteriores) |
| Alterações funcionais nesta fase | Nenhuma |
| Site/deploy remoto | Nenhum |

Arquivos e relatórios examinados: `fase-5f-3-0*.md`, `validation-b1/**`, canônico
`netlify/edge-functions/html-capture.js`, scripts de sync/build/verify, testes B1, `package.json` e
`package-lock.json` do B1, `netlify.toml` B1 e raiz.

---

## 3. Auditoria do config da Edge

### Resultado

- `config` canônico e B1 contêm `path: '/*'`, lista literal de `excludedPath`, `onError: 'bypass'`.
- Não há `const/let/var`, `IMGS_PREFIX` ou `+` dentro do bloco `config`.
- A entrada de imagens é o literal `'/imgs/*'`.
- Function `capture-html.mjs`: `config = { path: '/api/capture-html' }`, estático.
- `cleanup` e `collect` canônicos também têm configs literais (não copiados para B1).

### O que foi comprovado localmente

- O texto do `config` não contém expressão dinâmica (teste e guard do build).
- O import local resolve o objeto `config`.
- Canônico e B1 têm o mesmo conteúdo; hash de sincronização confere.

### O que depende do parser/bundler real

- Não há Netlify CLI instalado (`netlify` não encontrado) nem `@netlify/edge-bundler`.
- `npx --no-install netlify --version` falhou por ausência local.
- `netlify dev` não pôde ser executado.
- A aceitação do `config` pelo parser oficial e o bundling real continuam **dependentes de
  validação remota**.

O guard local é conservador e cobre o caso conhecido, mas não é o parser oficial da Netlify.

---

## 4. Integridade dos arquivos compartilhados

### Resultado

- Lista explícita de **13** arquivos em `scripts/shared-files.mjs`.
- `verify-shared.mjs` compara SHA-256 de canônico, cópia e manifesto.
- `build.mjs` chama a verificação antes de publicar `dist`; não copia nem corrige nada.
- `sync-shared.mjs` é a única operação que copia; é explícita.
- Manifesto versão 1, estrutura validada, lista exata e hashes hexadecimal de 64 caracteres.
- Caminhos absolutos, com `\` ou `..` são rejeitados.

### Testes que passaram

- manifesto válido + cópias idênticas;
- divergência na cópia;
- divergência no canônico;
- cópia ausente;
- canônico ausente;
- manifesto ausente;
- JSON malformado;
- versão errada;
- lista esperada divergente;
- entrada extra no manifesto;
- caminho inválido;
- lista exata de 13 arquivos.

O build falha diante de divergência e não publica. Arquivos novos exigem atualização explícita de
`shared-files.mjs`; um import novo não copiado faz os testes de import falharem. Arquivos removidos
do canônico são detectados.

### Limitação

A verificação lê o canônico no diretório pai. O build B1 exige o checkout completo do repositório
(é o caso do site Git com base `validation-b1`). Um B1 copiado isoladamente falhará; isso é
intencional, mas deve ser documentado para o deploy.

---

## 5. Auditoria aprofundada de segredos

### Fatos oficiais

- Variáveis **site-specific** pertencem ao site; **shared** pertencem ao time e alcançam todos os
  sites.
- No **Free**, shared variables são **N/A** (Pro/Enterprise).
- **Escopos** (Builds/Functions/Runtime/Post-processing) são Pro/Enterprise. No Free, uma variável
  site-specific fica disponível a todos os escopos **do próprio site**, incluindo build.
- Variáveis declaradas em `netlify.toml` são apenas Builds/Post-processing; o B1 não declara
  segredos ali.
- O B1 não usa `RATE_LIMIT_HMAC_SECRET`; a captura usa `EDGE_INGEST_SECRET` para HMAC do IP/rate key.
  O Phase 2 collector não está no B1. **Não configurar `RATE_LIMIT_HMAC_SECRET`.**

### Exposição ao build

- `build.mjs` usa apenas módulos nativos do Node e scripts locais; não lê `process.env`.
- O build remoto usa `NPM_FLAGS=--omit=dev --ignore-scripts`; Playwright dev não é instalado e
  lifecycle scripts não são executados.
- O lockfile não contém `hasInstallScript` para as dependências do B1.
- Não há plugins de build no B1.
- O `dist` não contém segredos; o scan passa.
- Dependências diretas: `pg` e `zod` (runtime), `playwright` (dev). Não há scripts de ciclo de vida
  no lockfile.

**Risco residual:** no Free, `DATABASE_URL` e `EDGE_INGEST_SECRET` site-specific ficam no ambiente
de build do B1. Código e dependências confiáveis poderiam lê-los; a redução de dependências,
lockfile, `--ignore-scripts` e ausência de leitura no build diminuem o risco, mas não o eliminam.
Isso só é aceitável com segredos **exclusivos de teste**.

### Alternativas

| Opção | O que isola | O que continua exposto | Dependência de confiança | Free | Custo/complexidade | Reversão |
|---|---|---|---|---|---|---|
| **A. Site B1 na equipe Free atual, site-specific** | Variáveis entre sites; sem shared no Free | Segredos de teste no build do B1 | Código/deps do build; sem plugins | **Sim** | Baixa | Remover site/segredo |
| **B. Equipe Netlify separada** | Shared e site vars de outras equipes | Segredos do B1 no build da nova equipe | Mesma confiança no build | A confirmar; pode exigir outro owner/equipe | Média/alta; possível impacto de plano | Transferir/remover |
| **C. Ingestão em infraestrutura independente** | Remove `DATABASE_URL` do build Netlify; HMAC pode ficar fora | Ainda há segredo de assinatura em algum runtime; novo provedor | Código/infra do provedor | Depende do provedor | Alta; possível custo | Remover serviço |

**Recomendação:** **A**, com segredos exclusivos de teste, banco/branch/role de teste, nenhum shared
e confirmação de que a equipe está no Free. **B** só é necessária se houver shared variables de
produção (plano pago) ou exigência de isolamento de equipe. **C** não é necessária para o B1 e
aumenta custo/complexidade.

**Critério:** se a equipe não estiver no Free, se houver shared variables de produção, ou se houver
qualquer segredo real de produção/homologação, o B1 **não pode** receber credenciais nem ser
implantado. Nesse caso, B ou C precisam ser reavaliadas.

**Veredito do risco de build:** **condicionado/aceitável** para B1 com segredos **exclusivamente
de teste**, build confiável, sem plugins, `--ignore-scripts`, lockfile e sem shared variables.
**Impeditivo** se qualquer segredo real de produção/homologação ou shared for usado.

---

## 6. Auditoria de permissões do Neon

Proposta documental, não criada:

- Banco/branch dedicado ao B1, separado de produção e da homologação privada.
- Role exclusiva de teste, por exemplo `analytics_b1_runtime`.
- `CONNECT` no banco de teste e `USAGE` no schema.
- `SELECT/INSERT/UPDATE` apenas nas tabelas da Fase 4: `html_events`, `html_traffic_daily`,
  `html_indicators_monthly`, `edge_nonces`, `edge_rate_limits`, `edge_daily_counters`.
- Sem `DELETE`, DDL, ownership, superuser, acesso às Fases 2/3 ou a outros bancos.
- `DATABASE_URL` site-specific do B1, nunca produção/homologação.

A arquitetura atual permite escrever somente os eventos/contadores esperados; não há cleanup
agendado no B1, portanto a role não precisa de `DELETE`. Se a validação exigir limpeza, ela deve ser
uma operação administrativa separada, não a role de ingestão.

**Pendência:** role/banco/branch não criados; a criação exige autorização e deve ser feita fora do
repositório. Sem role de teste exclusiva, o B1 não deve receber `DATABASE_URL` real.

---

## 7. Auditoria de exposição pública

| Controle | Resultado |
|---|---|
| CSP | Passou: `default-src 'none'`, `script-src/style-src 'self'`, `connect-src 'none'`, `form-action 'none'`, `frame-ancestors 'none'` |
| X-Robots-Tag | Passou: `noindex, nofollow, noarchive` |
| Meta robots | Passou nas duas páginas |
| robots.txt | Passou: `Disallow: /` |
| Página de encerramento | Passou, sem scripts |
| Consentimento | Passou local: aceitar/recusar/retirar, sem rede antes da escolha |
| DNT/GPC | Passou local: botão desabilitado, cookie positivo removido |
| Cookie Secure | Código usa `Secure`; **não validado em HTTPS real** |
| Diagnóstico público | Caminho `/api/capture-html` removido; mensagem genérica |
| Respostas de erro | Genéricas no handler copiado; sem segredo |
| HMAC | Passou local |
| Nonce/replay | **Não executado com PostgreSQL real** |
| Limite de payload | Passou local (8192/8193/UTF-8) |
| Rate key/limite diário | **Não executado com PostgreSQL real** |
| Rastreadores/dados pessoais | Ausentes; sem GA4/AdSense/afiliados; sem formulário/IDs |
| Segredos no `dist` | Nenhum encontrado |

**Rate limiting:** não há regra nativa no B1. O endpoint público e o cookie de consentimento
forjável continuam permitindo que um cliente gere capturas até o limite diário. Para o teste, usar
janela curta, amostra baixa, limite diário baixo, monitoramento e flags `false` fora da janela.

`noindex`/`robots.txt` não são autenticação; o site é público.

---

## 8. Build e dependências

- Build B1 usa apenas módulos nativos (`fs`, `path`, `crypto`, `url`) e scripts locais; não importa
  `pg`, `zod` ou Playwright.
- Testes usam `pg`, `zod` e Playwright; `npm ci --ignore-scripts` no B1 instalou 17 pacotes e os
  testes passaram usando as dependências locais do B1.
- `package-lock.json` próprio, `pg`/`zod` exatos, `playwright` dev `1.64.1`.
- `NPM_FLAGS=--omit=dev --ignore-scripts` reduz a instalação remota e lifecycle scripts.
- Não há `hasInstallScript` no lockfile.
- Node `>=22` no B1 e `NODE_VERSION=22` no `netlify.toml`.
- O build **depende do canônico no diretório pai** para verificar o shared-manifest; não depende do
  `node_modules` da raiz.
- O build não usa source maps; o `dist` tem apenas 6 arquivos publicados + manifest.
- O teste de navegador exige Chromium local; o binário não está no lockfile. Em ambiente limpo,
  executar `npx playwright install chromium` (local, autorizado).

---

## 9. Testes locais

| Teste | Resultado | Aprovados | Falhas | Ignorados |
|---|---|---:|---:|---:|
| `validation-b1/npm run test:all` | PASS | 19 + 2 browser | 0 | 0 |
| `npm ci --ignore-scripts` no B1 | PASS | 17 pacotes | 0 | 0 |
| B1 `npm test` com deps locais | PASS | 19 | 0 | 0 |
| B1 `npm run test:browser` | PASS | 2 | 0 | 0 |
| `npm run test:analytics` raiz | PASS | 72 | 0 | 2 suítes PostgreSQL |
| Playwright consentimento raiz | PASS | 11 | 0 | 0 |
| Shared-manifest e build | PASS | 13 arquivos | 0 | 0 |
| Scan do `dist` | PASS | — | 0 | 0 |

### Não executados

- Site/deploy/Edge/Function/rate limit remotos.
- Parser/bundler oficial da Netlify.
- HTTPS real, cookie `Secure`, captura Edge → Function.
- Replay/limite diário/Neon reais.
- Cold start, CPU, `waitUntil`, `AbortSignal`, WebCrypto e latência.
- Qualquer POST/GET remoto.

---

## 10. Achados e classificação

| ID | Severidade | Achado | Situação |
|---|---|---|---|
| B1-01 | ~~Bloqueador~~ **Resolvido** | `IMGS_PREFIX` no `config` | Literal `'/imgs/*'`; canônico/B1 sincronizados; testes/guard passam |
| B1-02 | **Alto** | Base directory vs package directory | Ainda depende de criar o site com base `validation-b1`; package-only pode buildar na raiz |
| B1-03 | **Alto** | B1 não commitado; sem caminho de deploy | Git exige commit/push; CLI/API exige ferramenta/auth; ainda pendente |
| B1-04 | **Médio** | Segredos de teste disponíveis ao build no Free | Condicionado aceitável; test-only, sem shared, build confiável, `--ignore-scripts` |
| B1-05 | **Médio** | Build depende do canônico no diretório pai | Intencional; exige checkout completo; B1 isolado falha |
| B1-06 | **Médio** | Endpoint público sem rate limit | Cookie forjável; mitigar com janela/limite/amostra/monitoramento |
| B1-07 | **Médio** | Bundler/runtime reais não validados | CLI/edge-bundler ausentes; requer deploy de teste |
| B1-08 | **Médio** | Replay/Neon reais não validados | `TEST_DATABASE_URL` ausente |
| B1-09 | **Baixo** | Cookie `Secure`/captura HTTPS não testados | Teste local é HTTP |
| B1-10 | **Baixo** | Playwright exige Chromium fora do lockfile | Documentado; instalar localmente |
| B1-11 | **Informativo** | `noindex`/robots não são autenticação | Site público |
| B1-12 | **Informativo** | Free não oferece escopos; variáveis site-specific no build | Confirmar plano/no shared |

**Nenhum bloqueador de código permanece.** O risco de build é **condicionado**; se houver
shared variables de produção ou segredo real, passa a **impeditivo**.

---

## 11. Decisão recomendada

**2 — Aprovado com pendências que precisam ser aceitas expressamente pelo usuário.**

O B1 está localmente consistente e testado; o bloqueador foi removido. A criação do site ainda
depende de decisões explícitas:

1. Criar o site com **base directory `validation-b1`**, não package directory.
2. Confirmar que a equipe permanece **Free**, sem shared variables de produção.
3. Autorizar banco/branch/role Neon de teste e segredo HMAC exclusivo de teste.
4. Autorizar commit/push/PR ou CLI/API de deploy; o B1 não está no Git.
5. Aceitar o risco condicionado de segredos de teste no ambiente de build; não usar segredos reais.
6. Autorizar deploy de teste e validar bundler, HTTPS/cookie, HMAC/replay, rate limit, fail-open e
   custos em runtime.

Se o usuário não aceitar o risco de build, a alternativa é **B (equipe separada)** ou **C
(infraestrutura independente)**, ambas fora do escopo atual. Não é **1 — aprovado para solicitar
criação agora**, porque as pendências altas de base/segredo/deploy ainda precisam de aceitação; não
é **3 — arquitetura precisa ser modificada**, porque o bloqueador foi resolvido e a arquitetura
permanece viável.

A Fase 5F.3.1 **não** deve começar automaticamente.

---

## 12. Confirmação obrigatória

- Nenhum site criado.
- Nenhum deploy realizado.
- Nenhum POST ou GET remoto.
- Nenhuma configuração remota alterada.
- Nenhuma variável ou flag alterada.
- Nenhuma regra de rate limiting criada.
- Nenhuma escrita no Neon.
- Nenhuma migration ou role alterada.
- Nenhum serviço pago contratado.
- Nenhum commit, push, PR ou merge.
- Produção e homologação intactas; visibilidades inalteradas.
- Nenhuma credencial exibida.

---

## Fontes oficiais consultadas

Consultadas em **2026-11-11**.

1. Netlify — Frameworks API (config estático; Edge config).
   https://docs.netlify.com/build/frameworks/frameworks-api/
2. Netlify — Edge Functions declarations.
   https://docs.netlify.com/build/edge-functions/declarations/
3. Netlify — Optional configuration for Edge Functions.
   https://docs.netlify.com/build/edge-functions/optional-configuration/
4. Netlify — File-based configuration.
   https://docs.netlify.com/build/configure-builds/file-based-configuration/
5. Netlify — Build configuration overview (base/package/publish).
   https://docs.netlify.com/build/configure-builds/overview/
6. Netlify — Monorepos (config search order).
   https://docs.netlify.com/build/configure-builds/monorepos/
7. Netlify — Manage build dependencies.
   https://docs.netlify.com/build/configure-builds/manage-dependencies/
8. Netlify — Environment variables overview.
   https://docs.netlify.com/build/environment-variables/overview/
9. Netlify — Get started with environment variables.
   https://docs.netlify.com/build/environment-variables/get-started/
10. Netlify — Credit-based pricing plans (shared env vars N/A no Free; escopos).
    https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans
11. Netlify — Get started with Edge Functions (manual deploy CLI).
    https://docs.netlify.com/build/edge-functions/get-started/
12. Netlify — Get started with Functions.
    https://docs.netlify.com/build/functions/get-started/
