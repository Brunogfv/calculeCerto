const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '../..');
const SITE = 'https://portaldascontas.com.br';
const IGNORAR = /(^|[\\/])(node_modules|scratch|pagefind|\.git|Coverage|dist|tests|scripts|docs|playwright-report|test-results)([\\/]|$)/i;

function walk(dir) {
    let out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (IGNORAR.test(full)) continue;
        if (entry.isDirectory()) out = out.concat(walk(full));
        else out.push(full);
    }
    return out;
}

const FILES = walk(ROOT);
const HTML_FILES = FILES.filter(f => f.endsWith('.html'));
const read = file => fs.readFileSync(file, 'utf8');
const rel = file => path.relative(ROOT, file).replace(/\\/g, '/');
const stripComments = html => html.replace(/<!--[\s\S]*?-->/g, '');

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function contar(html, regex) {
    return (html.match(regex) || []).length;
}

function jsonLdValido(html) {
    const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    for (const block of blocks) {
        JSON.parse(block[1]);
    }
    return blocks.length;
}

test.describe('Estrutura e SEO do site', () => {
    test('header e footer pré-renderizados em todas as páginas', () => {
        for (const file of HTML_FILES) {
            const html = stripComments(read(file));
            const name = rel(file);
            assert(contar(html, /<header\s+class=["']header topo["']/gi) === 1, `${name}: header count inválido`);
            assert(contar(html, /<footer\b/gi) >= 1, `${name}: footer ausente`);
            assert(/gerar-header/.test(html), `${name}: gerar-header ausente`);
            assert(!/gerar-footer\.js/.test(html), `${name}: gerar-footer deveria ter sido removido`);
            assert(!/<div\s+id=["']header-container["'][^>]*>\s*<\/div>/i.test(html), `${name}: header-container vazio`);
            assert(!/<div\s+id=["']footer-container["'][^>]*>\s*<\/div>/i.test(html), `${name}: footer-container vazio`);
        }
    });

    test('canonical, robots e noindex por página', () => {
        for (const file of HTML_FILES) {
            const html = read(file);
            const name = rel(file);
            assert(/<link[^>]*rel=["']canonical["']/i.test(html), `${name}: canonical ausente`);
            assert(/<meta[^>]*name=["']robots["']/i.test(html), `${name}: robots ausente`);
        }

        assert(/noindex/i.test(read(path.join(ROOT, 'busca.html'))), 'busca.html deveria ser noindex');
        assert(/noindex/i.test(read(path.join(ROOT, 'meus-calculos.html'))), 'meus-calculos.html deveria ser noindex');
    });

    test('assets CSS/JS existem e estão versionados', () => {
        assert(fs.existsSync(path.join(ROOT, 'asset-manifest.json')), 'asset-manifest.json ausente');

        for (const file of HTML_FILES) {
            const html = read(file);
            const name = rel(file);
            const dir = path.posix.dirname('/' + name);

            for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
                const value = match[1];
                if (!/\.(css|js)(?:[?#].*)?$/i.test(value)) continue;
                if (/^(?:https?:)?\/\//i.test(value) || /^(?:data|javascript):/i.test(value)) continue;

                const clean = value.split(/[?#]/)[0];
                const resolved = clean.startsWith('/')
                    ? path.posix.normalize(clean)
                    : path.posix.resolve(dir, clean);

                assert(fs.existsSync(path.join(ROOT, resolved)), `${name}: asset ausente ${value}`);
                if (resolved.startsWith('/pagefind/')) continue;

                const base = path.basename(resolved);
                assert(
                    /\.min\.[0-9a-f]{8}\.(js|css)$/i.test(base) || /^chart-4\.6\.1\.umd\.min\.js$/i.test(base),
                    `${name}: asset sem hash ${value}`
                );
            }
        }
    });

    test('SEO da home e das 51 calculadoras', () => {
        const home = read(path.join(ROOT, 'index.html'));
        assert(contar(home, /property=["']og:title["']/gi) === 1, 'home: og:title');
        assert(contar(home, /property=["']og:image["']/gi) === 1, 'home: og:image');
        assert(contar(home, /name=["']twitter:card["']/gi) === 1, 'home: twitter:card');
        assert(/"@type"\s*:\s*"WebSite"/.test(home), 'home: JSON-LD WebSite ausente');
        assert(/"@type"\s*:\s*"Organization"/.test(home), 'home: JSON-LD Organization ausente');

        const calculadoras = fs.readdirSync(path.join(ROOT, 'calculadoras')).filter(f => f.endsWith('.html'));
        expect(calculadoras.length).toBe(51);

        for (const name of calculadoras) {
            const html = read(path.join(ROOT, 'calculadoras', name));
            assert(contar(html, /property=["']og:title["']/gi) === 1, `${name}: og:title`);
            assert(contar(html, /property=["']og:image["']/gi) === 1, `${name}: og:image`);
            assert(contar(html, /name=["']twitter:card["']/gi) === 1, `${name}: twitter:card`);
            assert(/"@type"\s*:\s*"WebApplication"/.test(html), `${name}: JSON-LD WebApplication ausente`);
            assert(jsonLdValido(html) > 0, `${name}: JSON-LD inválido`);
        }
    });

    test('SEO dos artigos e páginas institucionais', () => {
        const files = [
            ...walk(path.join(ROOT, 'artigos')),
            ...walk(path.join(ROOT, 'paginas'))
        ].filter(f => f.endsWith('.html'));

        expect(files.length).toBe(107);

        const obrigatorios = [
            'og:title', 'og:description', 'og:type', 'og:url', 'og:image',
            'og:image:width', 'og:image:height', 'og:site_name', 'og:locale',
            'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'
        ];

        for (const file of files) {
            const html = read(file);
            const name = rel(file);

            for (const tag of obrigatorios) {
                const attr = tag.startsWith('og:') ? 'property' : 'name';
                const total = contar(html, new RegExp(`${attr}=["']${tag}["']`, 'gi'));
                assert(total === 1, `${name}: ${tag}=${total}`);
            }

            const canonical = (html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || [])[1];
            const ogUrl = (html.match(/property=["']og:url["'][^>]*content=["']([^"']+)["']/i) || [])[1];
            assert(canonical === ogUrl, `${name}: og:url diferente do canonical`);

            const esperado = (name === 'artigos/index.html' || name.startsWith('paginas/')) ? 'website' : 'article';
            const ogType = (html.match(/property=["']og:type["'][^>]*content=["']([^"']+)["']/i) || [])[1];
            assert(ogType === esperado, `${name}: og:type=${ogType}, esperado ${esperado}`);

            assert(jsonLdValido(html) >= 0, `${name}: JSON-LD inválido`);
        }
    });

    test('sitemap com 159 URLs, /artigos/ e lastmod', () => {
        const xml = read(path.join(ROOT, 'sitemap.xml'));
        const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
        const lastmods = [...xml.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map(m => m[1]);

        expect(locs.length).toBe(159);
        expect(lastmods.length).toBe(159);
        expect(locs).toContain(`${SITE}/artigos/`);

        for (const loc of locs) {
            assert(!/\.html$/i.test(loc), `sitemap: URL com .html ${loc}`);
            assert(!/\/busca|\/meus-calculos/.test(loc), `sitemap: página noindex ${loc}`);

            const urlPath = loc.replace(SITE, '');
            let file;
            if (urlPath === '/' || urlPath === '') file = path.join(ROOT, 'index.html');
            else if (urlPath.endsWith('/')) file = path.join(ROOT, urlPath, 'index.html');
            else file = path.join(ROOT, urlPath + '.html');

            assert(fs.existsSync(file), `sitemap: arquivo ausente para ${loc}`);
        }

        for (const data of lastmods) {
            assert(/^\d{4}-\d{2}-\d{2}$/.test(data), `sitemap: lastmod inválido ${data}`);
        }
    });

    test('todas as imagens referenciadas existem', () => {
        const arquivos = FILES.filter(f => /\.(html|js|css|json)$/i.test(f));
        const regex = /(?:https?:\/\/[^\/\s"']+)?\/(?:\.\.\/)?imgs\/([^"'\s<>)]+)/g;

        for (const file of arquivos) {
            const content = read(file);
            for (const match of content.matchAll(regex)) {
                let name = match[1].split('?')[0].split('#')[0];
                try { name = decodeURIComponent(name); } catch (e) { /* mantém */ }
                assert(fs.existsSync(path.join(ROOT, 'imgs', name)), `${rel(file)}: imagem ausente ${name}`);
            }
        }
    });

    test('favicon, afiliados e remoções de terceiros', () => {
        for (const file of HTML_FILES) {
            const html = read(file);
            const name = rel(file);
            assert(contar(html, /<link[^>]*rel=["']icon["']/gi) >= 3, `${name}: favicons insuficientes`);
            assert(contar(html, /rel=["']apple-touch-icon["']/gi) === 1, `${name}: apple-touch-icon`);
        }

        const afiliado = /(amzn\.to|amazon\.com(?:\.br)?\/|mercadolivre\.com\/sec|mercadolibre|shopee\.|magazineluiza|awin1?\.)/i;
        for (const file of HTML_FILES) {
            const html = stripComments(read(file));
            for (const tag of html.match(/<a\b[^>]*>/gi) || []) {
                if (afiliado.test(tag)) {
                    assert(/rel=["'][^"']*sponsored/i.test(tag), `${rel(file)}: afiliado sem sponsored`);
                }
            }
        }

        for (const file of FILES.filter(f => /\.(html|js|css)$/i.test(f))) {
            const content = read(file);
            assert(!/amzn\.to|amazon\.com/i.test(content), `${rel(file)}: referência Amazon`);
            assert(!/seo-helper\.js/i.test(content), `${rel(file)}: seo-helper ainda referenciado`);
            assert(!/amp-auto-ads|cdn\.ampproject\.org/i.test(content), `${rel(file)}: AMP ainda referenciado`);
            assert(!/cdn\.jsdelivr\.net\/npm\/chart\.js/i.test(content), `${rel(file)}: Chart.js CDN ainda referenciado`);
        }

        const produtos = read(path.join(ROOT, 'js/produtos.js'));
        expect(contar(produtos, /rel="sponsored nofollow noopener"/g)).toBe(2);
    });

    test('formulário de contato usa Netlify Forms', () => {
        const contato = read(path.join(ROOT, 'paginas', 'contato.html'));
        assert(/data-netlify=["']true["']/i.test(contato), 'contato: data-netlify ausente');
        assert(/name=["']form-name["'][^>]*value=["']contato["']/i.test(contato), 'contato: form-name ausente');
        assert(/action=["']\/obrigado["']/i.test(contato), 'contato: action /obrigado ausente');
        assert(!/formsubmit\.co/i.test(contato), 'contato: formsubmit ainda referenciado');
        assert(/name=["']consentimento["']/i.test(contato), 'contato: consentimento LGPD ausente');

        const obrigado = read(path.join(ROOT, 'obrigado.html'));
        assert(/noindex/i.test(obrigado), 'obrigado.html: noindex ausente');
        assert(/rel=["']canonical["']/i.test(obrigado), 'obrigado.html: canonical ausente');
    });

    test('acessibilidade estrutural do header e do conteúdo', () => {
        for (const file of HTML_FILES) {
            const html = read(file);
            const name = rel(file);

            const skip = html.match(/<a\s+class=["']skip-link["'][^>]*href=["']#([^"']+)["'][^>]*>/i);
            assert(skip, `${name}: skip link ausente`);

            const main = html.match(/<main\b[^>]*>/i);
            assert(main, `${name}: main ausente`);
            assert(new RegExp(`\\bid=["']${skip[1]}["']`, 'i').test(main[0]), `${name}: main sem o id do skip link`);
            assert(/\btabindex=["']-1["']/i.test(main[0]), `${name}: main sem tabindex="-1"`);
            assert(html.indexOf('skip-link') < html.indexOf('<header'), `${name}: skip link depois do header`);

            const header = (html.match(/<header\s+class=["']header topo["'][\s\S]*?<\/header>/i) || [])[0];
            assert(header, `${name}: header ausente`);
            assert(!/\bonclick\s*=/i.test(header), `${name}: onclick no header`);
            assert(!/javascript:void\(0\)/i.test(header), `${name}: javascript:void(0) no header`);
            assert(/<nav\b[^>]*\bid=["']nav-menu["'][^>]*\baria-label=/i.test(header), `${name}: nav sem aria-label`);

            assert(
                /<button\b[^>]*class=["'][^"']*mobile-menu-btn[^"']*["'][^>]*\baria-expanded=["']false["']/i.test(header),
                `${name}: hamburger sem aria-expanded`
            );
            assert(
                /<button\b[^>]*class=["'][^"']*mobile-menu-btn[^"']*["'][^>]*\baria-controls=["']nav-menu["']/i.test(header),
                `${name}: hamburger sem aria-controls`
            );

            const triggers = [...header.matchAll(/<button\b[^>]*class=["'][^"']*menu-trigger[^"']*["'][^>]*>/gi)].map(m => m[0]);
            assert(triggers.length >= 5, `${name}: poucos menu-trigger (${triggers.length})`);

            for (const trigger of triggers) {
                assert(/\baria-expanded=["']false["']/i.test(trigger), `${name}: trigger sem aria-expanded`);
                assert(/\baria-haspopup=["']true["']/i.test(trigger), `${name}: trigger sem aria-haspopup`);

                const controls = (trigger.match(/\baria-controls=["']([^"']+)["']/i) || [])[1];
                assert(controls, `${name}: trigger sem aria-controls`);
                assert(new RegExp(`\\bid=["']${controls}["']`, 'i').test(header), `${name}: aria-controls sem alvo`);
            }

            assert(/<input\b[^>]*id=["']site-search["'][^>]*\baria-label=/i.test(header), `${name}: busca sem aria-label`);
            assert(
                /<div\b[^>]*id=["']search-results-list["'][^>]*\baria-live=["']polite["']/i.test(header),
                `${name}: resultados sem aria-live`
            );
            assert(
                /<button\b[^>]*class=["'][^"']*toggle-theme[^"']*["'][^>]*\btype=["']button["']/i.test(header),
                `${name}: botão de tema sem type="button"`
            );
            assert(
                /<span\b[^>]*id=["']theme-icon["'][^>]*\baria-hidden=["']true["']/i.test(header),
                `${name}: ícone do tema sem aria-hidden`
            );
        }
    });

    test('_redirects e _headers consistentes', () => {
        const redirects = read(path.join(ROOT, '_redirects'));
        assert(redirects.includes('/index.html / 301!'), '_redirects: regra /index.html ausente');
        assert(redirects.includes('/*/index.html /:splat/ 301!'), '_redirects: regra index.html ausente');
        assert(redirects.includes('# BEGIN HTML REDIRECTS'), '_redirects: bloco de redirects gerado ausente');
        assert(redirects.includes('/calculadoras/inss.html /calculadoras/inss 301!'), '_redirects: redirect de calculadora ausente');
        assert(redirects.includes('/artigos/financas/como-calcular-desconto-inss.html /artigos/financas/como-calcular-desconto-inss 301!'), '_redirects: redirect de artigo ausente');
        assert(!redirects.includes('escapeHtml'), '_redirects: regra escapeHtml ainda presente');

        const headers = read(path.join(ROOT, '_headers'));
        assert(headers.includes('Content-Security-Policy:'), '_headers: CSP ausente');
        assert(headers.includes('X-Content-Type-Options: nosniff'), '_headers: nosniff ausente');
        assert(headers.includes('Strict-Transport-Security:'), '_headers: HSTS ausente');
        assert(headers.includes('Cache-Control: public, max-age=31536000, immutable'), '_headers: cache immutable ausente');
        assert(!headers.includes('cdn.ampproject.org'), '_headers: CSP ainda permite AMP');
        assert(!headers.includes('cdn.jsdelivr.net'), '_headers: CSP ainda permite jsDelivr');
        assert(!headers.includes('formsubmit.co'), '_headers: CSP ainda permite formsubmit');
    });
});
