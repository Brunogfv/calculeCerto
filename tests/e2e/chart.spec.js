const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8765';

const paginas = [
    'cdb', 'dividendos', 'imposto-renda', 'inflacao', 'inss', 'investimento',
    'ir-investimentos', 'juros', 'lca-vs-cdb', 'lci-vs-cdb',
    'poupanca-vs-investimento', 'price-sac', 'tesouro-direto'
];

for (const nome of paginas) {
    test(`${nome}: Chart.js local e sem CDN`, async ({ page }) => {
        const erros = [];
        const externos = [];

        page.on('pageerror', error => erros.push(error.message));
        page.on('request', request => {
            if (/cdn\.jsdelivr\.net|cdn\.ampproject\.org/i.test(request.url())) {
                externos.push(request.url());
            }
        });

        await page.route('**/*', route => {
            const url = route.request().url();
            if (url.startsWith(BASE) || url.startsWith('data:')) return route.continue();
            return route.abort();
        });

        await page.goto(`/calculadoras/${nome}.html`, { waitUntil: 'domcontentloaded' });

        await expect.poll(
            () => page.evaluate(() => typeof window.Chart),
            { timeout: 15_000 }
        ).toBe('function');

        const local = await page.evaluate(() => [...document.scripts]
            .some(script => /vendor\/chart-4\.6\.1\.umd\.min\.js/.test(script.src)));

        expect(local).toBe(true);
        expect(externos).toEqual([]);
        expect(erros).toEqual([]);
    });
}
