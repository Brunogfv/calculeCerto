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
2. Minifica e versiona CSS/JS (`scripts/build-assets.js`).
3. Gera `sitemap.xml` (`scripts/generate-sitemap.js`).
4. Gera o índice do Pagefind em `pagefind/` (apenas HTML de conteúdo).

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

### Busca (Pagefind)

O índice fica em `pagefind/`. O comando `npm run build` já executa o Pagefind com um glob restrito às páginas de conteúdo, evitando indexar `dist/`, `node_modules` e páginas noindex.

### Build de deploy

```bash
npm run build:deploy
```

Roda o build completo e prepara `dist/` com apenas os arquivos de produção (HTML, assets com hash, imagens, Pagefind, `_headers`, `_redirects`, sitemap etc.). Fontes, testes, scripts, docs e `node_modules` ficam fora do deploy.

## Testes

Suíte permanente com Playwright Test:

```bash
npm test
```

O comando executa `npm run build` e depois **34 testes**:

- Fiscal 2026: INSS, IRRF, redutor, 13º e exemplos oficiais.
- Estrutura/SEO: header/footer, canonical/robots, assets versionados, OG/Twitter, JSON-LD, sitemap, imagens, favicon e afiliados.
- Navegação: header/footer sem JS, menu, tema, busca, ofertas Mercado Livre, cálculos, dependências dinâmicas e Pagefind.
- Chart.js local nas 13 páginas.
- CSP sem violações.

Comandos auxiliares:

```bash
npm run test:ui
npm run test:report
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


