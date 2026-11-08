const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8765';

async function bloquearExternos(page) {
    await page.route('**/*', route => {
        const url = route.request().url();
        if (url.startsWith(BASE) || url.startsWith('data:')) return route.continue();
        return route.abort();
    });
}

function verificarHrefResultado(href) {
    const url = new URL(href, BASE);
    expect(url.origin).toBe(BASE);
    expect(url.pathname).not.toContain('/js/');
    expect(url.pathname).not.toMatch(/\.html$/i);
    expect(url.pathname).toMatch(/^\/(artigos|calculadoras|paginas)(\/|$)/);
}

test.describe('Site — navegação e funcionalidades', () => {
    test('header e footer aparecem sem JavaScript', async ({ browser }) => {
        const context = await browser.newContext({ javaScriptEnabled: false });
        const page = await context.newPage();

        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });

        await expect(page.locator('header.header.topo')).toHaveCount(1);
        await expect(page.locator('footer')).toHaveCount(1);
        await expect(page.locator('header.header.topo')).toBeVisible();
        await expect(page.locator('footer').first()).toBeVisible();

        await context.close();
    });

    test('menu, tema e busca do header', async ({ page }) => {
        await bloquearExternos(page);
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });

        const temaAntes = await page.evaluate(() => document.body.getAttribute('data-theme'));
        await page.locator('.toggle-theme').click();
        await expect.poll(() => page.evaluate(() => document.body.getAttribute('data-theme'))).not.toBe(temaAntes);

        await page.evaluate(() => window.toggleMenu());
        await expect(page.locator('#nav-menu')).toHaveClass(/active/);

        await page.fill('#site-search', 'inss');
        await expect.poll(
            () => page.locator('#search-results-list a').count(),
            { timeout: 20_000 }
        ).toBeGreaterThan(0);

        const hrefHeader = await page.locator('#search-results-list a').first().getAttribute('href');
        verificarHrefResultado(hrefHeader);
    });

    test('ofertas Mercado Livre e páginas sem anúncio', async ({ page }) => {
        await bloquearExternos(page);

        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });
        await page.locator('#anuncio-dinamico').scrollIntoViewIfNeeded();
        await expect.poll(async () => {
            const href = await page.locator('#anuncio-dinamico a').first().getAttribute('href');
            return href || '';
        }, { timeout: 20_000 }).toMatch(/mercadolivre|meli[.]la/);
        await expect(page.locator('#anuncio-dinamico img').first()).toHaveAttribute('loading', 'lazy');

        await page.goto('/paginas/sobre.html', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('#anuncio-dinamico')).toHaveCount(0);
        await expect(page.locator('.oferta-card')).toHaveCount(0);

        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.locator('#anuncio-dinamico').scrollIntoViewIfNeeded();
        await expect.poll(async () => {
            const href = await page.locator('#anuncio-dinamico a').first().getAttribute('href');
            return href || '';
        }, { timeout: 20_000 }).toMatch(/mercadolivre|meli[.]la/);

        const html = await page.locator('#anuncio-dinamico').innerHTML();
        expect(html).not.toMatch(/amazon|amzn\.to/i);
    });

    test('cálculos principais', async ({ page }) => {
        await bloquearExternos(page);

        await page.goto('/calculadoras/decimo-terceiro.html', { waitUntil: 'domcontentloaded' });
        const decimo = await page.evaluate(() => {
            document.getElementById('salario-bruto').value = '5000';
            document.getElementById('meses-trabalhados').value = '12';
            document.getElementById('dependentes').value = '0';
            calcularDecimoTerceiro();
            return document.getElementById('res-liquido').textContent.trim();
        });
        expect(decimo).toContain('4.498,49');

        await page.goto('/calculadoras/imposto-renda.html', { waitUntil: 'domcontentloaded' });
        const ir = await page.evaluate(() => {
            document.getElementById('valor-bruto').value = '4.000,00';
            document.getElementById('valor-deducao').value = '368,60';
            document.getElementById('num-dependentes').value = '0';
            calcularIR();
            return document.getElementById('valor-imposto').textContent.trim();
        });
        expect(ir).toContain('0,00');

        await page.goto('/calculadoras/pj-vs-clt.html', { waitUntil: 'domcontentloaded' });
        const pj = await page.evaluate(() => ({
            inss: calcularINSS(5000).toFixed(2),
            irrf: calcularIRPF(4000, 373.41).toFixed(2)
        }));
        expect(pj.inss).toBe('501.51');
        expect(pj.irrf).toBe('0.00');
    });

    test('dependências dinâmicas e ausência de 404 locais', async ({ page }) => {
        const falhas = [];
        page.on('response', response => {
            if (response.url().startsWith(BASE) && response.status() >= 400) {
                falhas.push(`${response.status()} ${response.url()}`);
            }
        });

        await bloquearExternos(page);
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });

        await expect.poll(() => page.evaluate(() => typeof window.salvarCalculo), { timeout: 15_000 }).toBe('function');
        await expect.poll(() => page.evaluate(() => typeof window.converterParaNumero)).toBe('function');
        await expect.poll(() => page.evaluate(() => typeof window.renderizarBotaoFavorito), { timeout: 15_000 }).toBe('function');

        expect(falhas).toEqual([]);
    });

    test('busca Pagefind', async ({ page }) => {
        await bloquearExternos(page);
        await page.goto('/busca?q=inss', { waitUntil: 'domcontentloaded' });
        await expect.poll(
            () => page.locator('#results-list a').count(),
            { timeout: 20_000 }
        ).toBeGreaterThan(0);

        const hrefBusca = await page.locator('#results-list a').first().getAttribute('href');
        verificarHrefResultado(hrefBusca);
    });

    test('artigo com CSS versionado, header e footer', async ({ page }) => {
        await bloquearExternos(page);
        await page.goto('/artigos/financas/como-calcular-desconto-inss.html', { waitUntil: 'domcontentloaded' });

        const sheets = await page.evaluate(() => [...document.styleSheets].map(s => s.href).filter(Boolean));
        expect(sheets.some(s => /como-calcular-desconto-inss\.min\.[0-9a-f]{8}\.css/.test(s))).toBe(true);

        await expect(page.locator('header.header.topo')).toHaveCount(1);
        await expect(page.locator('footer')).toHaveCount(1);
    });

    test('meus-calculos usa usuario versionado', async ({ page }) => {
        await bloquearExternos(page);
        await page.goto('/meus-calculos.html', { waitUntil: 'domcontentloaded' });

        const srcs = await page.evaluate(() => [...document.scripts].map(s => s.src));
        expect(srcs.some(src => /usuario\.min\.[0-9a-f]{8}\.js/.test(src))).toBe(true);
    });
});
