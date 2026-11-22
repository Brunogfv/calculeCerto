# Portal das Contas

Site estático de calculadoras online gratuitas para finanças, saúde, reformas e educação.

**Produção:** https://portaldascontas.com.br/

## Stack

- HTML, CSS e JavaScript estáticos (sem framework).
- **Netlify** para hospedagem, redirects e headers.
- **Pagefind** para busca local.
- **Chart.js** local em `js/vendor/` (sem CDN).
- **terser** e **clean-css** para minificação e versionamento de assets.
- **Playwright** para testes de navegador.

## Estrutura

```
.
├── index.html                  # Home
├── obrigado.html               # Confirmação do formulário (noindex)
├── calculadoras/               # 51 calculadoras
├── artigos/                    # Artigos e CSS específico de artigos
├── paginas/                    # Sobre, contato, privacidade e termos
├── css/                        # Estilos globais e por calculadora
├── js/                         # Scripts das calculadoras e utilitários
│   └── vendor/                 # Chart.js local/versionado
├── imgs/                       # Imagens otimizadas
├── pagefind/                   # Índice de busca gerado pelo Pagefind
├── scripts/
│   ├── build-assets.js         # Minifica/versiona CSS/JS e atualiza o HTML
│   ├── generate-sitemap.js     # Gera o sitemap a partir dos arquivos
│   ├── generate-html-redirects.js # Gera redirects .html -> URL limpa
│   ├── apply-accessibility.js  # Skip link, ARIA e menu acessível em todos os HTMLs
│   ├── prepare-deploy.js       # Copia só os arquivos de produção para dist/
│   ├── clean-build.js          # Limpa dist/ e pagefind/ antes do build
│   ├── test-local.js           # Teste legado local com Playwright
│   ├── test-producao.js        # Teste legado em produção
│   └── ...
├── tests/
│   ├── server.js               # Servidor HTTP com _headers para os testes
│   ├── unit/                   # Fiscal e validações estáticas
│   └── e2e/                    # Navegação, Chart.js e CSP
├── docs/relatorios/            # Relatórios históricos de SEO e auditoria
├── netlify.toml                # Build/deploy Netlify (publica dist/)
├── _headers                    # CSP, segurança e cache (Netlify)
├── _redirects                  # Redirects canônicos e URLs legadas
├── sitemap.xml
├── robots.txt
├── ads.txt
└── asset-manifest.json         # Mapa fonte → arquivo com hash (gerado)
```

## Rodando localmente

Requisitos: Node.js e npm.

```bash
npm install
```

O site usa caminhos absolutos (`/css/...`, `/js/...`), então **não abra os HTMLs com `file://`**. Suba um servidor HTTP na raiz:

```bash
python -m http.server 8000
# ou
npx serve .
```

Abra `http://localhost:8000`.

## Build

### Build completo

```bash
npm run build
```

Executa:

1. Limpa `dist/` e `pagefind/`.
2. Aplica o bloco de analytics/consentimento em todos os HTMLs (`scripts/apply-analytics.js`).
3. Minifica e versiona CSS/JS (`scripts/build-assets.js`).
4. Gera `sitemap.xml` (`scripts/generate-sitemap.js`).
5. Gera os redirects `.html` → URL limpa (`scripts/generate-html-redirects.js`).
6. Aplica acessibilidade estrutural (`scripts/apply-accessibility.js`).
7. Gera o índice do Pagefind em `pagefind/` (apenas HTML de conteúdo).

### Apenas assets

```bash
npm run build:assets
```

O script:

1. Minifica todos os arquivos de `css/`, `artigos/css/` e `js/`.
2. Gera arquivos com hash: `nome.min.<hash>.css` e `nome.min.<hash>.js`.
3. Atualiza automaticamente as referências em todos os HTMLs.
4. Atualiza as dependências dinâmicas do header (`usuario.js`, `favoritos-auto.js`, `utils-calculadoras.js`).
5. Escreve `asset-manifest.json` com o mapa fonte → versão com hash.

**Importante:**
- Edite sempre os fontes (`css/*.css`, `js/*.js`), nunca os arquivos `*.min.<hash>.*`.
- Os fontes originais permanecem no repositório para manutenção.
- Os arquivos com hash são os que o site carrega e podem ter cache imutável.

### Sitemap

```bash
npm run build:sitemap
```

Gera `sitemap.xml` a partir dos HTMLs reais, com URLs limpas, `/artigos/` com barra final, `lastmod` baseado em `dateModified` (artigos) ou data do arquivo, e exclusão de `busca`/`meus-calculos`.

### Acessibilidade

```bash
npm run a11y:apply
```

Aplica em todos os HTMLs, de forma idempotente:

- Skip link para `#conteudo-principal` e `tabindex="-1"` no `<main>`.
- Botões acessíveis para os dropdowns, com `aria-expanded`, `aria-controls` e `aria-haspopup`.
- `aria-label` no menu, na busca e no botão de tema.
- Remoção dos `onclick` inline do header.
- Live region nos resultados da busca e `aria-hidden` em ícones decorativos.

O comando também roda automaticamente no `npm run build` antes do Pagefind.

### Busca (Pagefind)

O índice fica em `pagefind/`. O comando `npm run build` já executa o Pagefind com um glob restrito às páginas de conteúdo, evitando indexar `dist/`, `node_modules` e páginas noindex.

### Build de deploy

```bash
npm run build:deploy
```

Roda o build completo e prepara `dist/` com apenas os arquivos de produção (HTML, assets com hash, imagens, Pagefind, `_headers`, `_redirects`, sitemap etc.). Fontes, testes, scripts, docs e `node_modules` ficam fora do deploy.

### Ofertas e publicidade

O catálogo fica em `js/produtos.js`:

- `bancoDeAnuncios`: produtos por categoria, com título, descrição, imagem e link de afiliado.
- `categoriasPagina`: apelidos das calculadoras que não têm categoria própria (ex.: `tdee` → `tmb`, `imposto-renda` → `juros`).
- `categoriasRelacionadas`: categorias complementares usadas quando a principal tem poucos itens.

Ao carregar, o script:

1. Deduplica produtos por título.
2. Escolhe 3 ofertas no desktop (2 no mobile) e 4 na home, com rotação diária.
3. Renderiza a grade após o resultado e, no desktop, um rail sticky de 300px.
4. Informa `Publicidade`/`Ofertas de parceiros` e envia eventos `ad_impression` e `clique_anuncio_afiliado` ao GA4.

Para adicionar um produto, inclua-o em `bancoDeAnuncios` com um link específico do Mercado Livre e uma imagem local em `imgs/`. Páginas sem uma categoria cadastrada continuam sem ofertas.

## Analytics

O módulo **Portal das Contas Analytics** está em desenvolvimento na branch `feat/portal-analytics`. A Fase 2 (banco e endpoint de coleta) está documentada em [`docs/analytics/fase-2.md`](docs/analytics/fase-2.md), incluindo configuração do Neon, variáveis de ambiente, migrações, testes e feature flag. A Fase 3 (consentimento, Consent Mode v2, collect no navegador e privacidade) está em [`docs/analytics/fase-3.md`](docs/analytics/fase-3.md). O bloco de consentimento é aplicado no build por `scripts/apply-analytics.js`.

A ingestão permanece desligada (`ANALYTICS_INGEST_ENABLED=false`) até a validação da Fase 3 e autorização explícita. O banner e o coletor são aplicados no build, mas o endpoint segue respondendo `204` sem gravar enquanto a flag estiver desligada.

O plano técnico da Fase 4 (captura HTML no edge, identificação de automações e classificação de tráfego) está em [`docs/analytics/fase-4-plano.md`](docs/analytics/fase-4-plano.md), com as decisões em [`docs/analytics/fase-4-decisoes.md`](docs/analytics/fase-4-decisoes.md) e a LIA em [`docs/analytics/fase-4-lia.md`](docs/analytics/fase-4-lia.md).

A Fase 4 está implementada **somente em ambiente local/teste**: Edge Function `html-capture`, Function interna `capture-html`, classificador compartilhado, migrations de teste `003` a `005`, cookie de consentimento `pca_edge_consent`, roles restritas `analytics_runtime`/`analytics_cleanup`, limpeza transacional e Scheduled Function de retenção (`HTML_CAPTURE_CLEANUP_ENABLED=false`). `EDGE_CAPTURE_ENABLED`, `EDGE_ANALYTICS_ENABLED` e `EDGE_SECURITY_ENABLED` permanecem desligadas; não há deploy, migração de produção ou ativação. A entrega local e as limitações estão em [`docs/analytics/fase-4-implementacao.md`](docs/analytics/fase-4-implementacao.md); o procedimento isolado de homologação está em [`docs/analytics/fase-4-homologacao.md`](docs/analytics/fase-4-homologacao.md).

A Fase 5F.1.1 investigou a comunicação Edge → Function em projeto privado, a exposição de variáveis no Edge, o cookie de consentimento, timeout, limite de payload e o plano financeiro mínimo. O relatório e as correções locais estão em [`docs/analytics/fase-5f-1-1-investigacao.md`](docs/analytics/fase-5f-1-1-investigacao.md). Conclusão principal: **não há bypass documentado de SSO**; a homologação privada não consegue validar o caminho Edge → Function sem mudança de arquitetura ou de visibilidade. Nenhuma flag foi alterada.

A revisão independente da Fase 5F.1.2 está em [`docs/analytics/fase-5f-1-2-auditoria-independente.md`](docs/analytics/fase-5f-1-2-auditoria-independente.md). Ela corrigiu a assinatura para cobrir `key-id`, timestamp, nonce e corpo, alinhou o critério de segredo em bytes UTF-8, endureceu o parser de timeout e exige HTTP `202` como sucesso. A recomendação é **aprovado com pendências**; nenhuma validação remota foi executada.

## Testes

Suíte permanente com Playwright Test:

```bash
npm test
```

O comando executa `npm run build` e depois **59 testes** (48 existentes + 11 de consentimento/cookie). A suíte de analytics é executada separadamente com `npm run test:analytics`; ela cobre classificador, edge, HMAC, replay, concorrência, retenção, falhas, allowlist de ambiente, limite de payload e timeout. A contagem varia conforme as suítes de integração com PostgreSQL de teste estiverem habilitadas.

- Consentimento e Consent Mode v2: primeiro acesso, aceitar, recusar, personalizar, retirar, DNT/GPC, ordem das tags, eventos de calculadora/afiliado, endpoint indisponível e mobile.
- Fiscal 2026: INSS, IRRF, redutor, 13º e exemplos oficiais.
- Estrutura/SEO: header/footer, canonical/robots, assets versionados, OG/Twitter, JSON-LD, sitemap, imagens, favicon e afiliados.
- Navegação: header/footer sem JS, menu, tema, busca, ofertas Mercado Livre, cálculos, dependências dinâmicas e Pagefind.
- Ofertas: grade relacionada, aliases de categoria, rail sticky no desktop e layout mobile.
- Acessibilidade: skip link, dropdowns por teclado, foco visível, ARIA, live region e `aria-current`.
- Chart.js local nas 13 páginas.
- CSP sem violações.

Comandos auxiliares:

```bash
npm run test:ui
npm run test:report
npm run test:analytics
npm run db:cleanup:html-capture:test
```

Testes legados:

```bash
node scripts/test-local.js
node scripts/test-producao.js
```

O primeiro sobe um servidor local e gera `relatorio-local.md`. O segundo faz crawl de `https://portaldascontas.com.br` (ou `SITE_URL`) e gera `relatorio-producao.md`.

## Dados fiscais

As tabelas de 2026 estão centralizadas em `js/fiscal-2026.js`:

- INSS: Portaria Interministerial MPS/MF nº 13/2026.
- IRRF: Lei nº 15.191/2025 (tabela progressiva).
- Redutor: Lei nº 15.270/2025.

Ao atualizar valores anuais, altere esse arquivo, rode `npm run build` e valide os cálculos.

## SEO

- Canonical e meta description em todas as páginas.
- Open Graph e Twitter Card em home, calculadoras, artigos e páginas institucionais.
- JSON-LD: `WebApplication`, `WebSite`, `Organization`, `Article`, `FAQPage` e `BreadcrumbList`.
- Páginas `busca.html` e `meus-calculos.html` usam `noindex`.
- `sitemap.xml` e `robots.txt` na raiz.

## CI

O workflow `.github/workflows/ci.yml` roda em push para `main` e em pull requests:

- `npm test` (build + suíte permanente).
- `node scripts/prepare-deploy.js` (valida o build de deploy).
- Testes legados e, fora de PRs, testes de produção + Lighthouse.

## Deploy (Netlify)

- `netlify.toml` executa `npm run build:deploy` e publica `dist/`.
- `dist/` contém apenas os arquivos de produção; fontes, testes, scripts, docs e `node_modules` ficam fora.
- `_headers`: CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` e cache.
- `_redirects`: consolida `www`, remove `.html` das URLs e mantém redirects legados.
- Assets com hash têm cache `immutable` de 1 ano.
- HTML revalida a cada acesso.

**Ao adicionar um script ou serviço externo**, atualize a CSP em `_headers` e valide no navegador.

## Convenções

- Cálculos executados 100% no navegador (privacidade).
- Ofertas de afiliados apenas do Mercado Livre; não há mais links/ofertas da Amazon.
- Conteúdo em português do Brasil.
- Evite scripts de terceiros desnecessários: cada novo domínio exige ajuste de CSP.
- Prefira imagens em WebP e mantenha `width`/`height`/`loading="lazy"`.

## Relatórios históricos

Relatórios antigos de SEO, refatoração de URLs e auditoria estão em `docs/relatorios/`.

## Contato

- Site: https://portaldascontas.com.br/
- Formulário: https://portaldascontas.com.br/paginas/contato
- O envio usa **Netlify Forms** e redireciona para `/obrigado`.
- Configure as notificações por e-mail em **Site settings → Forms → Form notifications** no Netlify.


