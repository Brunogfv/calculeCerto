# Fase 5F.3.0.1 — Auditoria independente da preparação B1

Status: **auditoria concluída; nenhum site, deploy ou operação remota executada**.
Data: 2026-11-11.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

A Fase 5F.3.1 **não** foi iniciada. Esta fase não corrigiu os achados; apenas documentou.

---

## 1. Resumo executivo

A estrutura `validation-b1/` está localmente bem organizada: build próprio, página mínima,
consentimento sem rede antes da escolha, headers restritivos, cópias compartilhadas com hash,
testes locais e build sem segredos. Os testes locais passaram.

**Porém, a criação do site B1 não deve ser autorizada ainda.** Foram encontrados:

- **1 bloqueador:** o `config` da Edge Function usa a constante `IMGS_PREFIX` dentro de
  `excludedPath`. A documentação oficial de configuração de Edge Functions exige **valores
  estáticos** no `config` e diz que constantes/variáveis não são permitidas. O teste local importa
  o módulo e resolve a constante, mas isso **não prova** que o parser/bundler da Netlify aceitará a
  declaração. O mesmo código está no canônico e na cópia B1.
- **3 achados altos:** ambiguidade entre base directory e package directory; isolamento de segredos
  depende de não haver variáveis compartilhadas do time; e `validation-b1/` não está commitado,
  portanto não há caminho Git atual para um deploy.
- **4 médios:** cópias podem ficar desatualizadas sem verificação no build; endpoint público sem
  rate limit nativo e com cookie de consentimento forjável; bundler/imports remotos não validados;
  replay/limite diário/Neon não validados localmente por falta de `TEST_DATABASE_URL`.
- **4 baixos e 2 informativos.**

**Conclusão: 3 — Não aprovado; correções locais necessárias.** O bloqueador B1-01 é uma correção
local simples (usar literal `/imgs/*` em vez de `IMGS_PREFIX + '/*'` e ressincronizar B1), mas não
foi executada nesta fase por falta de autorização. Depois dela, B1-02/B1-03 precisam ser confirmados
no futuro setup do site.

**Nenhum crédito foi consumido. Nenhum site foi criado. A produção e a homologação privada não
foram alteradas.**

---

## 2. Estado inicial do Git

| Item | Valor |
|---|---|
| Diretório | `D:\Projetos\Site Calculadora` |
| Branch | `feat/portal-analytics` |
| Commit | `8d455fc4f01f7944f2a015681dd5c81c0704d786` |
| `git status --short` inicial | 260 entradas |
| Estado final após este relatório | 261 entradas (260 + este relatório) |
| Alterações funcionais nesta fase | Nenhuma |
| Commit/push/PR | Nenhum |
| Site/deploy remoto | Nenhum |

O diretório `validation-b1/` continua não rastreado. A auditoria executou testes locais que
regeneraram `validation-b1/dist/` e `shared-manifest.json`; não alteraram a implementação funcional.

---

## 3. Auditoria de isolamento

### Estrutura verificada

- `validation-b1/netlify.toml`
- `validation-b1/package.json`
- `validation-b1/public/**`
- `validation-b1/netlify/functions/**`
- `validation-b1/netlify/edge-functions/**`
- `validation-b1/scripts/**`
- `validation-b1/tests/**`
- `validation-b1/shared-manifest.json`
- `netlify.toml` da raiz
- `package.json` da raiz

### Configuração encontrada

```toml
[build]
  command = "node scripts/build.mjs"
  publish = "dist"
  edge_functions = "netlify/edge-functions"

[build.environment]
  NODE_VERSION = "22"

[functions]
  directory = "netlify/functions"
```

### Conclusões documentais

- A documentação oficial confirma que `netlify.toml` pode ficar em um subdiretório quando a
  **base directory** ou a **package directory** é definida.
- A busca de configuração ocorre na ordem **package directory → base directory → root directory**.
  Com base directory `validation-b1`, o `netlify.toml` do B1 é encontrado antes do root.
- Todos os caminhos do `netlify.toml` são relativos à **base directory**. Portanto, com base
  `validation-b1`, `dist`, `netlify/functions` e `netlify/edge-functions` apontam para o B1.
- A **package directory sozinha não é suficiente**: o build continuaria rodando na raiz, e
  `node scripts/build.mjs` / `publish = "dist"` seriam resolvidos no lugar errado. O site futuro
  deve ser criado com **base directory `validation-b1`**, não apenas package directory.
- O `netlify.toml` da raiz tem build de produção (`npm run build:deploy`) e publish `dist`. Se a
  base/package do B1 não for configurada corretamente, há risco de o B1 usar a configuração raiz e
  publicar o portal inteiro, violando o isolamento.
- `edge_functions` na seção `[build]` é uma chave oficial para diretório customizado de Edge
  Functions; o valor é relativo à base.
- Dependências JavaScript devem estar no `package.json` da base; a Netlify executa `npm install`
  nessa base quando não há lockfile de outro gerenciador. O B1 tem `pg` e `zod` exatos; não tem
  lockfile próprio, mas a instalação é compatível com npm.

**Resultado:** configuração local consistente, mas o deploy depende de a base directory ser
definida explicitamente no futuro site. Isso é uma **condição de aprovação**, não algo que o build
local prova.

---

## 4. Auditoria de Functions e Edge

### Presença e imports

- Function `capture-html.mjs` e helpers necessários estão presentes.
- Edge `html-capture.js` e helpers estão presentes.
- As 13 cópias são idênticas aos arquivos canônicos no momento da auditoria: o teste SHA-256
  comparou origem e cópia e passou.
- O build B1 não depende de `netlify/` da raiz nem de arquivos fora de `validation-b1`; o
  `sync-shared.mjs` é local e as cópias estão dentro do B1.
- O grafo Edge local não importa `node:` nem npm; a Function usa `pg` e `zod`, declarados no
  `package.json` do B1.
- Os imports relativos dentro de `_lib` resolvem localmente; o teste de importação passou.

### Achado bloqueador — `config` não estático

`validation-b1/netlify/edge-functions/html-capture.js` (e o canônico) usa:

```js
const IMGS_PREFIX = '/imgs';
...
excludedPath: [
    ...
    IMGS_PREFIX + '/*',
    ...
]
```

A documentação oficial de configuração de Edge Functions (Frameworks API) diz que o `config` deve
usar **apenas valores estáticos** e que **constantes ou variáveis não são permitidas**. O teste
local importa o módulo e obtém o valor resolvido, mas não executa o parser/bundler da Netlify.

**Classificação:** Bloqueador até correção local e nova verificação.
**Correção recomendada:** trocar a expressão por literal `'/imgs/*'` no canônico, ressincronizar B1
e repetir os testes. Não corrigir na cópia B1 isoladamente sem atualizar o canônico.

### Compatibilidade real

| Camada | Local | Netlify real |
|---|---|---|
| Imports Edge | Passou em Node | **Não comprovado** |
| Imports Function fora de `functions/` | Passou em Node | **Não comprovado** |
| Config Edge estático | Falha potencial | **Não comprovado / risco de rejeição** |
| Bundling Functions/Edge | Não executado | **Não comprovado** |
| Runtime Node/Deno | Node local, não Deno | **Não comprovado** |

O build local não executa o bundler da Netlify e não substitui um deploy de teste.

---

## 5. Auditoria de variáveis e segredos

### Documentação aplicável

- Variáveis **site** são específicas do site; variáveis **shared** são do time e ficam disponíveis a
  todos os sites.
- Variáveis site sobrepõem shared com o mesmo nome/escopo/contexto, mas não removem a existência da
  shared para outros nomes/contextos.
- **Escopos** (Builds/Functions/Runtime/Post processing) são recurso **Pro/Enterprise**; no Free,
  as variáveis tendem a ficar disponíveis a todos os escopos. Não presumir isolamento por escopo no
  Free.
- Variáveis declaradas em `netlify.toml` têm apenas Builds/Post-processing e não devem conter
  segredos. O B1 não declara segredos no `netlify.toml`.

### Matriz

| Variável | Finalidade | Classificação | Consumida em | Necessidade | Escopo desejado | Se ausente |
|---|---|---|---|---|---|---|
| `EDGE_CAPTURE_ENABLED` | Liga a captura | Configuração pública | Edge e Function | Runtime | Functions/Edge; no Free, todos | `false`; sem captura |
| `EDGE_ANALYTICS_ENABLED` | Autoriza analytics | Configuração pública | Edge e Function | Runtime | Functions/Edge; no Free, todos | `false`; sem captura |
| `EDGE_INGEST_SECRET` | HMAC e rate key | Segredo | Edge e Function | Runtime | Functions/Edge; site-specific | Edge não envia; Function 503 |
| `EDGE_INGEST_KEY_ID` | Identificador da chave | Configuração não secreta | Edge e Function | Runtime | Functions/Edge | default `v1`; deve ser explícito |
| `EDGE_ANALYTICS_SAMPLE_RATE` | Amostragem | Configuração operacional | Edge | Runtime | Functions/Edge | default 0.1 |
| `EDGE_CAPTURE_TIMEOUT_MS` | Timeout Edge → Function | Configuração operacional | Edge | Runtime | Functions/Edge | default 2000 ms |
| `EDGE_CAPTURE_MAX_EVENTS_DAY` | Limite diário | Configuração operacional | Function | Runtime | Functions | default 25.000 |
| `EDGE_CAPTURE_TIMESTAMP_WINDOW_SECONDS` | Janela de timestamp | Configuração operacional | Function | Runtime | Functions | default 60 |
| `EDGE_CAPTURE_NONCE_TTL_SECONDS` | TTL do nonce | Configuração operacional | Function | Runtime | Functions | default 600 |
| `EDGE_RATE_MAX` | Rate por rate key | Configuração operacional | Function | Runtime | Functions | default 120 |
| `EDGE_RATE_WINDOW_SECONDS` | Janela do rate | Configuração operacional | Function | Runtime | Functions | default 300 |
| `DATABASE_URL` | Conexão do banco de teste | Segredo de servidor | Function | Runtime | Functions; site-specific | Function 503; sem captura |
| `DB_POOL_MAX` | Pool | Configuração operacional | Function | Runtime | Functions | default 1 |
| `TEST_DATABASE_URL` | Testes locais/CI | Segredo local | Testes locais | Somente local | Nunca no site B1 | testes de integração skipped |

**Não usar no B1:** `CLEANUP_DATABASE_URL`, `MIGRATION_DATABASE_URL`, `RATE_LIMIT_HMAC_SECRET`,
`EDGE_SECURITY_ENABLED`, `ALLOWED_ORIGINS`, `HTML_CAPTURE_CLEANUP_ENABLED`. O B1 não tem limpeza
agendada.

### Respostas específicas

1. **Um novo site pode receber variáveis próprias sem compartilhar segredos com produção?**
   Sim, por meio de variáveis **site-specific**. O risco é a existência de variáveis **shared** do
   time, que são disponibilizadas a todos os sites. No Free, shared não está disponível; confirmar
   o plano e a ausência de shared antes de criar o site.
2. **A configuração do B1 pode receber apenas seus próprios segredos?**
   Sim, se todos os segredos forem site-specific e não houver shared com os mesmos nomes. Não
   configurar segredos em `netlify.toml`, no repositório ou no `dist/`.
3. **Como impedir uma variável de produção de chegar ao B1?**
   Não usar shared; manter produção com variáveis site-specific; verificar a lista de variáveis do
   time e do B1 antes do deploy; não depender apenas de override, porque escopos/contextos podem
   deixar lacunas. Se houver shared de produção, **não criar o B1** até removê-la ou isolar o time.
4. **Como impedir um segredo do B1 de chegar aos outros sites?**
   Criar o segredo como site-specific do B1, nunca shared; não colocá-lo no `netlify.toml`; marcar
   como secret quando o recurso estiver disponível; rotacionar após o teste.
5. **Quais variáveis precisam existir na Edge e na Function?**
   Edge: as seis da allowlist (`EDGE_CAPTURE_ENABLED`, `EDGE_ANALYTICS_ENABLED`,
   `EDGE_INGEST_SECRET`, `EDGE_INGEST_KEY_ID`, `EDGE_ANALYTICS_SAMPLE_RATE`,
   `EDGE_CAPTURE_TIMEOUT_MS`). Function: flags, segredo, key-id, limites, `DATABASE_URL`.
6. **Risco de expor segredos no build?**
   Sim, especialmente no Free, onde escopos Functions podem não existir e as variáveis ficam
   disponíveis ao build. O `build.mjs` do B1 não lê nem imprime variáveis; dependências são
   `pg`/`zod` fixadas e não há plugins. Ainda assim, o build deve permanecer simples e não executar
   scripts de terceiros que leiam ambiente. Não foi encontrado segredo real no `dist/`.

**Classificação:** Alto enquanto não for confirmado que não existem shared variables de produção;
Médio no Free por ausência de escopos; Informativo se o time confirmar plano Free sem shared.

---

## 6. Auditoria de segurança pública

| Controle | Resultado | Evidência |
|---|---|---|
| CSP | Passou | `default-src 'none'`, `script-src/style-src 'self'`, `connect-src 'none'`, `form-action 'none'`, `frame-ancestors 'none'` |
| X-Robots-Tag | Passou | `noindex, nofollow, noarchive` em `/*` |
| Meta robots | Passou | Presente em `index.html` e `validacao-encerrada.html` |
| robots.txt | Passou | `User-agent: *` / `Disallow: /` |
| Headers HTTP | Passou | `nosniff`, `DENY`, `no-referrer`, `no-store` |
| Página de encerramento | Passou | `validacao-encerrada.html` sem scripts |
| Consentimento | Passou local | 2 testes de navegador, sem rede antes da escolha |
| DNT/GPC | Passou local | “Aceitar” desabilitado e cookie positivo removido |
| Rastreadores | Passou | Sem GA4/AdSense/afiliados; scan do `dist` |
| Links externos | Passou | Nenhum `src/href` externo no HTML |
| Dados pessoais | Passou | Sem formulário, input, IP/UA bruto ou ID de visitante |
| Segredos no build | Passou | Scan do `dist`; nenhum segredo real |
| HMAC | Passou local | Testes B1 e raiz |
| Replay | **Não executado com DB** | Integração PostgreSQL skipped |
| Limite de payload | Passou local | 8192/8193/UTF-8 |
| Limite diário | **Não executado com DB** | Integração PostgreSQL skipped |

### Observações

- **Noindex/robots não são controle de acesso.** O B1 será público e todos os arquivos devem ser
  seguros para exposição.
- O diagnóstico exibe o caminho `/api/capture-html`. Não é segredo, mas anuncia o endpoint de
  ingestão a qualquer visitante; é um **Baixo/Informativo**.
- O endpoint público continua sem rate limit nativo nesta fase. O cookie de consentimento é
  forjável; um cliente pode enviar `analytics=1` sem interação. Durante a janela pública, isso pode
  gerar capturas e consumo até o limite diário. Mitigação: janela curta, amostra baixa, limite
  diário baixo, monitoramento e flags `false` fora da janela.
- A página mínima não usa autenticação; é intencional. HMAC protege Edge → Function, não o visitante.

---

## 7. Revisão de deploy e créditos

### Correção da memória anterior

A criação do site **não tem tarifa própria documentada**; o primeiro deploy de produção é que custa
**15 créditos**. A formulação anterior “15 para criar o site” deve ser lida como “15 para o primeiro
deploy de produção”, não como uma taxa separada de criação.

Tarifas oficiais usadas:

- Deploy de produção: **15 créditos** cada (build minutes não são calculados à parte).
- Branch deploy/Deploy Preview: **0 créditos**.
- Web requests: **2 créditos/10.000**, incluindo Edge, Functions API, assets e redirects.
- Compute de Function: **10 créditos/GB-hora**; 1 GB padrão.
- Banda: **20 créditos/GB**.
- Edge entra em web requests; a métrica de invocações Edge não deve ser somada como compute.
- Free: 300 créditos/mês, limite rígido; ao esgotar, projetos pausam.
- 429 de rate limit pode ou não contar como web request; **NÃO COMPROVADO**; orçar
  conservadoramente.

### Sequência mínima

| Caminho | Deploys | Custo de deploy | Uso estimado | Total |
|---|---|---:|---:|---:|
| Site novo + baseline produção + 2 branch deploys públicos | 1 produção + 2 branch | 15 | <2 | <17 |
| Site existente + 2 branch deploys | 0 produção + 2 branch | 0 | <2 | <2 |
| Sem branch público: 2 deploys de produção | 2 produção | 30 | <2 | <32 |
| 3 deploys de produção | 3 produção | 45 | >32 | **não usar** |

**Menor sequência recomendada:**

1. Criar o site e fazer o **primeiro deploy de produção baseline** com flags `false` (15).
2. Criar um **branch deploy** com flags `true` para os testes (0).
3. Criar um **branch deploy** com rate limit experimental (0).
4. Encerrar voltando ao branch baseline; não é necessário um quarto deploy.
5. Remover site/branch e revogar segredo após a evidência.

Isso exige que os previews/branches do site B1 sejam **públicos**. Se não forem, o teste não
funciona como B1; a alternativa é 2 deploys de produção (30) e encerramento no segundo, sem um
terceiro. Um terceiro deploy de produção estoura o teto com uso.

### Limites

- Teto da campanha: **32 créditos**.
- Reserva mínima: **100 créditos**.
- Saldo mínimo de início: **132 créditos**, a confirmar imediatamente antes da 5F.3.1.
- Interromper se consumo projetado >32 ou saldo restante <100.
- Adiar se saldo <132, se o ciclo estiver no fim ou se a produção estiver consumindo rápido.

---

## 8. Auditoria de dependência do Git

`validation-b1/` **não está commitado** (não rastreado). Alternativas:

| Método | Consome B1? | Exige commit/push? | Observação |
|---|---|---|---|
| Site Git-linked | Sim, após commit/push | **Sim** | Caminho normal; precisa de autorização de commit/push/PR |
| Branch deploy | Sim, se branch remoto existir | **Sim** | Branch/Deploy Preview exige push/PR; não autorizado |
| Deploy Preview | Sim, se PR existir | **Sim** | Exige PR/push; não autorizado |
| Netlify CLI manual | Sim, se CLI >=12.2.8 e build local | **Não** | CLI não instalado; exige auth e autorização de deploy |
| API de deploy | Possível, com payload/zip e auth | **Não** | Mais complexo; exige token e autorização; Functions/Edge precisam estar no artefato |
| Netlify Drop/estático | Apenas HTML/CSS/JS | **Não** | Não inclui Functions/Edge; insuficiente para B1 |

**Conclusão:** não há caminho remoto disponível sob as restrições atuais. A criação do site B1
depende de nova autorização para commit/push/PR (Git) ou para instalar/usar CLI/API de deploy
manual. O B1 local está pronto, mas o repositório não o expõe ao Git.

---

## 9. Testes locais executados

| Teste | Resultado | Aprovados | Falhas | Ignorados |
|---|---|---:|---:|---:|
| `validation-b1/npm run test:all` | PASS | 9 + 2 browser | 0 | 0 |
| `validation-b1/npm run build` | PASS | 6 publicados + manifest | 0 | 0 |
| `npm run test:analytics` (raiz) | PASS | 72 | 0 | 2 suítes PostgreSQL |
| `npx playwright test tests/e2e/consent.spec.js` | PASS | 11 | 0 | 0 |
| SHA-256 das 13 cópias | PASS | 13 | 0 | 0 |
| Scan de segredos/recursos externos no `dist` | PASS | — | 0 | 0 |

### Não executados

- Deploy real, Edge/Function remota, rate limiting remoto e IP da chamada interna.
- Replay, limite diário e persistência com PostgreSQL real (`TEST_DATABASE_URL` ausente).
- Bundler real da Netlify com base directory/package directory.
- Cookie `Secure` em HTTPS real e captura Edge → Function.
- Cold start, CPU, `waitUntil`, `AbortSignal`, WebCrypto e latência até o Neon.

---

## 10. Achados

| ID | Severidade | Achado | Evidência | Ação recomendada |
|---|---|---|---|---|
| B1-01 | **Bloqueador** | `config` da Edge usa constante `IMGS_PREFIX` em `excludedPath` | Código B1 e canônico; docs de Frameworks API exigem valores estáticos | Trocar por literal `/imgs/*`, ressincronizar e retestar; não criar site antes |
| B1-02 | **Alto** | Base directory vs package directory | Docs de monorepos: package directory só descobre config; build/publish continuam relativos à base (root) | Criar o site com base `validation-b1` explicitamente; conferir deploy log |
| B1-03 | **Alto** | Isolamento de segredos depende de não haver shared vars | Docs: shared vars do time alcançam todos os sites; no Free escopos não estão disponíveis | Confirmar plano Free e ausência de shared de produção; se houver, bloqueador |
| B1-04 | **Alto** | B1 não commitado; sem caminho Git atual | `git status` mostra `validation-b1/` não rastreado | Nova autorização para commit/push/PR ou CLI/API manual |
| B1-05 | Médio | Build não verifica se as cópias estão sincronizadas | `build.mjs` não lê `shared-manifest.json`; testes fazem a verificação | Rodar `test:all` antes do deploy; considerar verificação no build |
| B1-06 | Médio | Endpoint público sem rate limit; cookie de consentimento forjável | Código B1 copiado; nenhuma regra `rateLimit` | Janela curta, amostra/limite diário baixos, monitorar e rate limit futuro |
| B1-07 | Médio | Bundler/imports reais não validados | Testes locais Node apenas | Deploy de teste em alvo público |
| B1-08 | Médio | Replay/limite diário/Neon não validados | Suítes de integração skipped | Executar com PostgreSQL de teste |
| B1-09 | Baixo | `test:browser` usa Playwright da raiz, não declarado no B1 | `package.json` do B1 não lista Playwright | Documentar dependência local ou declarar devDependency |
| B1-10 | Baixo | Sem `package-lock.json` no B1 | Apenas `package.json` com versões exatas | Gerar lockfile em etapa autorizada |
| B1-11 | Baixo | Diagnóstico revela `/api/capture-html` | `index.html` | Opcional: genericizar antes da janela pública |
| B1-12 | Baixo | Cookie `Secure`/captura não testados em HTTPS | Browser test usa HTTP local e não verifica cookie | Validar no domínio Netlify real |
| B1-13 | Informativo | `noindex`/`robots.txt` não são controle de acesso | Página pública | Tratar B1 como público |
| B1-14 | Informativo | Free não oferece escopos de variáveis | Docs de env vars | Build simples; não imprimir ambiente; não usar plugins não confiáveis |

**Contagem:** 1 bloqueador, 3 altos, 4 médios, 4 baixos, 2 informativos.

---

## 11. Conclusão

**3 — Não aprovado; correções locais necessárias.**

O ambiente B1 está bem preparado e os testes locais passaram, mas o bloqueador B1-01 viola uma
restrição documentada de `config` de Edge Function e pode impedir a declaração/bundling da Edge na
Netlify. Além disso, B1-02/B1-03 precisam ser confirmados no setup do site e B1-04 exige autorização
de commit/CLI. Não há base para solicitar a criação do site ainda.

**Correção mínima antes de reavaliar:**

1. Trocar `IMGS_PREFIX + '/*'` por `'/imgs/*'` no canônico e em B1.
2. Rodar `validation-b1/npm run test:all` e confirmar hash/import.
3. Confirmar base directory `validation-b1`, ausência de shared vars e escopos disponíveis.
4. Autorizar o método de deploy (Git ou CLI/API) e o site público.
5. Reexecutar esta auditoria ou registrar a correção e revalidar.

A Fase 5F.3.1 continua dependendo de autorização explícita e não deve começar automaticamente.

---

## 12. Confirmação obrigatória

- Nenhum site criado.
- Nenhum deploy realizado.
- Nenhum POST remoto.
- Nenhuma configuração remota alterada.
- Nenhuma variável ou flag alterada.
- Nenhuma regra de rate limiting criada.
- Nenhuma Function ou Edge Function executada remotamente.
- Nenhuma escrita no Neon.
- Nenhuma migration ou role alterada.
- Nenhum commit, push, PR ou merge.
- Nenhum serviço pago contratado.
- Produção e homologação intactas; visibilidades inalteradas.
- Nenhuma credencial exibida.

---

## Fontes oficiais consultadas

Consultadas em **2026-11-11**.

1. Netlify — File-based configuration (localização do `netlify.toml`, base, paths, functions).
   https://docs.netlify.com/build/configure-builds/file-based-configuration/
2. Netlify — Build configuration overview (base directory, package directory, publish).
   https://docs.netlify.com/build/configure-builds/overview/
3. Netlify — Monorepos (ordem de busca package → base → root; recommended setup).
   https://docs.netlify.com/build/configure-builds/monorepos/
4. Netlify — Manage build dependencies (package.json na base; npm install).
   https://docs.netlify.com/build/configure-builds/manage-dependencies/
5. Netlify — Environment variables overview (site vs shared, escopos, overrides).
   https://docs.netlify.com/build/environment-variables/overview/
6. Netlify — Get started with environment variables (site/shared, mudanças exigem deploy).
   https://docs.netlify.com/build/environment-variables/get-started/
7. Netlify — Optional configuration for Edge Functions (edge_functions directory).
   https://docs.netlify.com/build/edge-functions/optional-configuration/
8. Netlify — Frameworks API, Edge Functions (config estático; constantes não permitidas).
   https://docs.netlify.com/build/frameworks/frameworks-api/
9. Netlify — Get started with Edge Functions (manual deploy CLI >=12.2.8).
   https://docs.netlify.com/build/edge-functions/get-started/
10. Netlify — Get started with functions (manual deploy via CLI/API).
    https://docs.netlify.com/build/functions/get-started/
11. Netlify — How credits work (deploy/web/compute/banda; Edge em web requests).
    https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/
