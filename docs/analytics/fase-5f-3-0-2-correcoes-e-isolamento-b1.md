# Fase 5F.3.0.2 — Correções locais e isolamento B1

Status: **correções locais concluídas; nenhum site, deploy ou operação remota executada**.
Data: 2026-11-11.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

A Fase 5F.3.1 **não** foi iniciada.

---

## 1. Resumo executivo

O bloqueador B1-01 foi corrigido: o `config` da Edge Function agora usa o literal `'/imgs/*'`,
sem constante ou expressão dinâmica. A correção foi feita primeiro no canônico
`netlify/edge-functions/html-capture.js`, seguida de sincronização explícita e atualização do
`shared-manifest.json` do B1.

Foram também implementados:

- verificação obrigatória de shared-manifest no build, comparando **canônico, cópia e manifesto**;
- falha de build para divergência, arquivo ausente, manifesto inválido, entrada extra e caminho
  inválido;
- teste estático que rejeita `IMGS_PREFIX`, `const/let/var` ou `+` dentro do `config` da Edge;
- `package-lock.json` próprio do B1 e Playwright declarado como devDependency;
- `NPM_FLAGS=--omit=dev --ignore-scripts` no build remoto;
- remoção do caminho `/api/capture-html` da página de diagnóstico;
- testes de divergência, manifesto ausente/inválido, entrada extra e caminho inválido.

**Testes:** B1 **19/19** de build/manifest/HMAC + **2/2** browser; raiz **72/72** analytics;
Playwright de consentimento da raiz **11/11**; build B1 **6 publicados + manifest, 10,0 KiB**.

**Isolamento de segredos:** a documentação oficial confirma que **shared environment variables
não estão disponíveis no Free** e que **escopos por variável são Pro/Enterprise**. No Free,
variáveis site-specific não são compartilhadas entre sites; o risco restante é que, sem escopos,
elas ficam disponíveis ao build do próprio B1. O build B1 não lê nem imprime segredos, não usa
plugins e o `npm install` usa `--omit=dev`.

**Conclusão: 2 — Aprovado com pendências documentadas.** A arquitetura B1 continua viável; o
bloqueador foi removido. Ainda dependem de etapa futura: base directory no site, confirmação do
plano/site-specific vars, commit/CLI para deploy, bundler real, rate limit, replay/Neon e teste
HTTPS/cookie.

---

## 2. Correção do `IMGS_PREFIX`

### Antes

```js
const IMGS_PREFIX = '/imgs';

export const config = {
    path: '/*',
    excludedPath: [
        ...
        IMGS_PREFIX + '/*',
        ...
    ],
    onError: 'bypass'
};
```

### Depois

```js
export const config = {
    path: '/*',
    excludedPath: [
        '/api/*',
        '/.netlify/*',
        '/css/*',
        '/js/*',
        '/imgs/*',
        '/fonts/*',
        ...
    ],
    onError: 'bypass'
};
```

- Correção aplicada primeiro em `netlify/edge-functions/html-capture.js`.
- `npm run sync:shared` copiou o canônico para `validation-b1/netlify/edge-functions/html-capture.js`.
- `shared-manifest.json` foi regenerado com os hashes novos.
- Os dois arquivos contêm `'/imgs/*'` e não contêm `IMGS_PREFIX`.
- Nenhuma outra alteração de configuração foi feita.

### Outras configurações verificadas

- Edge `html-capture.js`: único objeto `config` de Edge; depois da correção não possui
  `const/let/var`, `IMGS_PREFIX` ou `+` no bloco.
- Function `capture-html.mjs`: `config = { path: '/api/capture-html' }`, estático.
- Function `cleanup-html-capture.mjs` (canônica, não copiada para B1): `schedule` literal.
- Function `collect.mjs` (canônica, não copiada para B1): `path` literal.
- Não há outro `config` dinâmico no B1.

O build B1 agora executa um guard local que rejeita `IMGS_PREFIX`, `const/let/var` ou `+` no bloco
`config` da Edge. O teste B1 repete a checagem no canônico e na cópia.

---

## 3. Validação local do parser/bundler

| Verificação | Resultado | Classificação |
|---|---|---|
| `config` textual contém apenas literais | Passou | **Comprovado localmente** |
| Import local do módulo resolve `config` | Passou | **Comprovado localmente**, não é parser Netlify |
| Guard estático do build | Passou | Verificação local conservadora |
| Netlify CLI disponível | **Não**; `netlify` não está instalado | Ferramenta ausente |
| `@netlify/edge-bundler` disponível | **Não** | Ferramenta ausente |
| `netlify dev` para validar config | **Não executado**; depende de CLI | Dependente de ferramenta |
| Parser real da Netlify | Não executado | **Dependente de validação remota** |
| Bundling real de Functions/Edge | Não executado | **Não comprovado** |

A documentação oficial de Frameworks API afirma que o `config` deve usar apenas valores estáticos
e que constantes/variáveis não são permitidas. A correção remove a violação textual. Não foi
possível executar o parser/bundler oficial localmente porque não há Netlify CLI/edge-bundler
instalado; a aceitação final continua dependendo de build/deploy de teste.

---

## 4. Investigação de isolamento de segredos

### Fatos oficiais

- Variáveis **site-specific** pertencem a um site; variáveis **shared** pertencem ao time e são
  disponibilizadas a todos os sites.
- No **Free**, shared environment variables são **N/A**; o recurso é Pro/Enterprise.
- Escopos por variável (Builds/Functions/Runtime/Post-processing) são **Pro/Enterprise**. No Free,
  a variável site-specific tende a ficar disponível a todos os escopos do próprio site.
- Variáveis site-specific produzem um segredo do B1 que não é automaticamente disponibilizado aos
  outros sites; o inverso também vale, desde que não haja shared variables.
- Se a equipe estiver em plano pago com shared variables, um novo site recebe essas variáveis
  compartilhadas; nesse caso, o isolamento não é automático.

### Avaliação por alternativa

| Alternativa | `DATABASE_URL` | `EDGE_INGEST_SECRET` | `RATE_LIMIT_HMAC_SECRET` | Edge/Function | Free | Outro usuário/equipe | Custo | Complexidade | Reversão |
|---|---|---|---|---|---|---|---|---|---|
| **A. Equipe Netlify separada** | Isolado por equipe | Isolado por equipe | Isolado | Sim | A confirmar; criação de outra equipe exige autorização e pode exigir outro owner/organização | Sim, provavelmente | Pode alterar billing/limites | Alta | Transferir/remover site |
| **B. Site-specific na mesma equipe** | Isolado entre sites no Free | Isolado entre sites | Não usado no B1 | Sim | **Compatível** | Não | Nenhum | Baixa | Remover site/segredo |
| **C. Infraestrutura independente** | Fora da Netlify | Fora da Netlify | Fora | Sim, mas outro runtime | Depende do provedor | Sim | Pode haver custo | Alta | Remover serviço |
| **D. Não guardar `DATABASE_URL` na Netlify** | Exigiria outro proxy/token; ainda há segredo | Ainda no Edge/Function | — | Sim, com mais peças | Depende | Sim | Pode haver custo | Alta | Complexa |

**Recomendação:** **B**, com confirmação de que a equipe está no Free e sem shared variables.
Usar `DATABASE_URL` de banco/branch/role de teste exclusivo e `EDGE_INGEST_SECRET` novo, ambos
site-specific. Não usar `RATE_LIMIT_HMAC_SECRET` no B1 (não é necessário para captura). Não copiar
segredos de produção/homologação.

Se a equipe estiver em plano com shared variables de produção, **não criar o B1** até remover as
shared ou usar uma equipe separada (A), com autorização. A separação apenas por site não resolve
shared variables.

### Exposição no build

Como no Free não há escopos, os segredos site-specific do B1 ficam disponíveis ao build. Mitigações
já aplicadas:

- `build.mjs` não lê nem imprime `process.env`;
- não há plugins/terceiros no build;
- dependências são `pg`/`zod` fixadas, lockfile próprio, `--omit=dev`;
- nenhum segredo em `netlify.toml`, `.env` ou `dist/`.

Risco residual: qualquer dependência comprometida no `npm install` poderia ler o ambiente. O
lockfile e a redução de dependências diminuem o risco; não eliminam.

---

## 5. Melhorias no shared-manifest

### Implementação

- `scripts/shared-files.mjs`: lista explícita dos **13** arquivos.
- `scripts/verify-shared.mjs`: lê o manifesto, valida versão/estrutura, exige exatamente a lista,
  valida caminhos e compara SHA-256 de canônico, cópia e manifesto.
- `build.mjs`: chama `verifyShared` antes de limpar/publicar `dist`; falha com mensagem do arquivo.
- `sync-shared.mjs`: usa a mesma lista e o mesmo hash; a sincronização continua explícita.
- O build **não** copia nem corrige divergências silenciosamente.

### Testes adicionados

- manifesto válido e cópias idênticas passam;
- divergência na cópia B1 falha;
- divergência no canônico falha;
- cópia ausente falha;
- canônico ausente falha;
- manifesto ausente, JSON inválido e versão errada falham;
- lista esperada divergente e caminho com `..` falham;
- entrada extra no manifesto falha;
- lista tem exatamente 13 arquivos.

Novos arquivos compartilhados exigem atualização explícita de `shared-files.mjs`; se um novo arquivo
for importado e não estiver na lista, o B1 não o copia e os testes de import falham. Arquivos
removidos do canônico são detectados pela verificação.

**Dependência do build:** a verificação lê o canônico no diretório pai. O build B1, portanto, exige
o checkout completo do repositório, que é o caso do site Git/B1 com base `validation-b1`. Um B1
copiado isoladamente falhará na verificação; isso é intencional para não publicar cópias não
verificadas.

---

## 6. Dependências e reprodutibilidade

- `pg` e `zod` fixados em `8.23.1` e `4.6.7`.
- `playwright` declarado como devDependency `1.64.1` para o teste de navegador.
- `package-lock.json` próprio do B1 criado (lockfile v3).
- `NPM_FLAGS = "--omit=dev --ignore-scripts"` no `netlify.toml` do B1; o build de deploy não instala Playwright nem executa lifecycle scripts de dependências.
- `npm ci --ignore-scripts --omit=dev --dry-run` resolveu 15 pacotes de runtime sem erro.
- O teste de navegador usa Playwright/Chromium local; se o binário não estiver instalado, executar
  `npx playwright install chromium` em etapa local autorizada.
- Não foram atualizadas versões de bibliotecas sem justificativa.

---

## 7. Diagnóstico e segurança

- O diagnóstico não exibe mais `/api/capture-html`; usa mensagem genérica sobre coleta interna
  protegida por HMAC. O teste B1 verifica a ausência do caminho na página.
- Consentimento continua sendo preferência do cliente, não autenticação.
- Cookie `Secure`, DNT/GPC, recusa/retirada e ausência de requisições antes do consentimento foram
  mantidos; o teste de navegador confirma o comportamento em HTTP local.
- Cookie `Secure`/captura não foram testados em HTTPS real; pendência de runtime.
- CSP, `X-Robots-Tag`, meta robots, `robots.txt`, `nosniff`, `DENY`, `no-referrer` e `no-store`
  permanecem.
- Sem GA4, AdSense, afiliados, links externos, formulários ou dados pessoais.
- HMAC, timestamp, nonce, key-id, payload e fail-open foram preservados; replay/limite diário
  continuam dependentes de PostgreSQL de teste.
- Nenhum HMAC ou validação de backend foi enfraquecido.

---

## 8. Arquivos modificados

- `netlify/edge-functions/html-capture.js`
- `validation-b1/netlify/edge-functions/html-capture.js` (sincronizado)
- `validation-b1/shared-manifest.json`
- `validation-b1/netlify.toml`
- `validation-b1/package.json`
- `validation-b1/package-lock.json` (novo)
- `validation-b1/README.md`
- `validation-b1/public/index.html`
- `validation-b1/scripts/shared-files.mjs` (novo)
- `validation-b1/scripts/verify-shared.mjs` (novo)
- `validation-b1/scripts/sync-shared.mjs`
- `validation-b1/scripts/build.mjs`
- `validation-b1/tests/b1.spec.mjs`
- `validation-b1/tests/shared-manifest.spec.mjs` (novo)
- `docs/analytics/fase-5f-3-0-2-correcoes-e-isolamento-b1.md` (este relatório)

`validation-b1/dist/` foi regenerado localmente pelo build; é artefato ignorado, não implementação.
Nenhuma alteração em produção, homologação, migrations, roles ou configuração remota.

Estado Git: **261 entradas** antes das correções e **262** após este relatório. `validation-b1/` e a
árvore canônica `netlify/` continuam não rastreados; o commit futuro precisa incluir ambos.

---

## 9. Testes executados

| Teste | Resultado | Aprovados | Falhas | Ignorados |
|---|---|---:|---:|---:|
| `validation-b1/npm run test:all` | PASS | 19 + 2 browser | 0 | 0 |
| `validation-b1/npm run build` | PASS | 6 publicados + manifest | 0 | 0 |
| Verificação shared-manifest no build | PASS | 13 arquivos | 0 | 0 |
| SHA-256 das 13 cópias | PASS | 13 | 0 | 0 |
| Divergência cópia/canônico, ausência, manifesto inválido, extra, path | PASS | 8 cenários | 0 | 0 |
| `npm run test:analytics` (raiz) | PASS | 72 | 0 | 2 suítes PostgreSQL |
| Playwright consentimento raiz | PASS | 11 | 0 | 0 |
| `npm ci --ignore-scripts --omit=dev --dry-run` | PASS | 15 pacotes | 0 | 0 |
| Scan do `dist` | PASS | — | 0 | 0 |

### Não executados

- Site Netlify, deploy, Edge/Function reais.
- Parser/bundler oficial da Netlify.
- Replay/limite diário/Neon reais (`TEST_DATABASE_URL` ausente).
- HTTPS real, cookie `Secure`, captura Edge → Function.
- Rate limit nativo e IP interno.
- Cold start, CPU, `waitUntil`, `AbortSignal`, WebCrypto e latência.
- Qualquer POST/GET remoto.

---

## 10. Riscos residuais

1. **Base directory:** o site B1 precisa ser criado com base `validation-b1`. Se usar apenas package
   directory, o build/publish serão resolvidos na raiz e podem falhar ou publicar o portal. **Alto**
   de configuração, não de código.
2. **Deploy dependency:** `validation-b1/` não está commitado; Git exige commit/push/PR; CLI/API
   manual exige ferramenta/auth e autorização. **Alto** de processo. O commit futuro deve incluir
   também o canônico corrigido e o `shared-manifest.json`; se o canônico no checkout não tiver o
   literal, o build B1 falhará na verificação de hash.
3. **Segredos:** no Free, shared vars são N/A e site-specific não cruzam sites; confirmar que a
   equipe continua no Free e sem shared. **Médio/Baixo**.
4. **Build exposure:** sem escopos no Free, segredos do B1 ficam no ambiente de build; build não os
   lê, mas dependências poderiam. **Médio**.
5. **Bundler real:** imports/config/Functions/Edge só serão comprovados no deploy. **Médio**.
6. **Endpoint público:** sem rate limit nativo; cookie de consentimento é forjável; janela curta e
   limite diário baixo são necessários. **Médio**.
7. **Replay/Neon:** não validados localmente. **Médio**.
8. **HTTPS/cookie:** teste de navegador local é HTTP e não valida cookie `Secure`/captura. **Baixo**.
9. **Build lê o canônico:** o B1 não é autônomo se copiado fora do repositório; documentado.
10. **noindex/robots:** não são controle de acesso. **Informativo**.

---

## 11. Decisão recomendada

**2 — Aprovado com pendências documentadas.**

O bloqueador de configuração foi corrigido, a sincronização passou a ser verificada no build, os
testes de divergência/ausência/manifesto inválido existem, as dependências estão declaradas com
lockfile e o diagnóstico não expõe mais o caminho de ingestão. A arquitetura B1 permanece viável.

Ainda não é **1 — Aprovado para nova auditoria independente local** porque restam pendências de
configuração/processo que precisam ser resolvidas ou explicitamente aceitas antes de uma nova
auditoria de deploy: base directory, confirmação de plano/site-specific secrets, commit/CLI e
validação remota. Não é **3 — Não aprovado** porque a arquitetura não apresentou defeito
intransponível após a correção.

Próximos passos, todos dependentes de autorização:

1. Confirmar base directory `validation-b1`, nome/domínio/visibilidade e Site ID futuro.
2. Confirmar plano Free e ausência de shared variables; definir banco/role/segredo exclusivos.
3. Autorizar commit/push/PR ou CLI/API manual e o número de deploys.
4. Executar nova auditoria local ou seguir para 5F.3.1 com o checklist atualizado.
5. Validar em runtime: bundler, HMAC, replay, fail-open, HTTPS/cookie, rate limit e custos.

A Fase 5F.3.1 **não** deve começar automaticamente.

---

## 12. Confirmação obrigatória

- Nenhum site criado.
- Nenhum deploy realizado.
- Nenhum branch deploy criado.
- Nenhum POST ou GET remoto.
- Nenhuma configuração remota alterada.
- Nenhuma variável ou flag remota alterada.
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

1. Netlify — File-based configuration.
   https://docs.netlify.com/build/configure-builds/file-based-configuration/
2. Netlify — Build configuration overview.
   https://docs.netlify.com/build/configure-builds/overview/
3. Netlify — Monorepos (config search order e package directory).
   https://docs.netlify.com/build/configure-builds/monorepos/
4. Netlify — Manage build dependencies.
   https://docs.netlify.com/build/configure-builds/manage-dependencies/
5. Netlify — Environment variables overview (site/shared, escopos, overrides).
   https://docs.netlify.com/build/environment-variables/overview/
6. Netlify — Get started with environment variables.
   https://docs.netlify.com/build/environment-variables/get-started/
7. Netlify — Optional configuration for Edge Functions.
   https://docs.netlify.com/build/edge-functions/optional-configuration/
8. Netlify — Frameworks API (config estático).
   https://docs.netlify.com/build/frameworks/frameworks-api/
9. Netlify — Credit-based pricing plans (shared env vars N/A no Free; escopos Pro/Enterprise).
   https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans
10. Netlify — Get started with Edge Functions (manual deploy CLI >=12.2.8).
    https://docs.netlify.com/build/edge-functions/get-started/
11. Netlify — Get started with functions.
    https://docs.netlify.com/build/functions/get-started/
