const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8765';

async function bloquearExternos(page) {
    await page.route('**/*', route => {
        const url = route.request().url();
        if (url.startsWith(BASE) || url.startsWith('data:')) return route.continue();
        return route.abort();
    });
}

async function contarOfertas(page, seletor = '#anuncio-dinamico') {
    const container = page.locator(seletor);
    await container.scrollIntoViewIfNeeded();
    await expect.poll(
        () => container.locator('.oferta-card').count(),
        { timeout: 20_000 }
    ).toBeGreaterThan(0);
    return container;
}

test.describe('Ofertas — grade relacionada e rail lateral', () => {
    test('calculadora mostra 3 ofertas relacionadas e rail sticky no desktop', async ({ page }) => {
        await bloquearExternos(page);
        await page.setViewportSize({ width: 1366, height: 900 });
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });

        const container = await contarOfertas(page);
        await expect.poll(() => container.locator('.oferta-card').count()).toBeGreaterThanOrEqual(3);

        const titulos = await container.locator('.oferta-titulo').allTextContents();
        expect(new Set(titulos).size).toBe(titulos.length);

        const primeiroLink = container.locator('.oferta-card a').first();
        await expect(primeiroLink).toHaveAttribute('rel', /sponsored/);
        await expect(container.locator('.oferta-card img').first()).toHaveAttribute('loading', 'lazy');

        const rail = page.locator('#anuncio-lateral');
        await expect(rail).toBeVisible();
        await expect(rail.locator('.oferta-card')).toHaveCount(1);
        await expect(page.locator('.layout-ofertas')).toHaveCount(1);
    });

    test('categoria com poucos itens usa ofertas relacionadas', async ({ page }) => {
        await bloquearExternos(page);
        await page.setViewportSize({ width: 1366, height: 900 });
        await page.goto('/calculadoras/inss.html', { waitUntil: 'domcontentloaded' });

        const container = await contarOfertas(page);
        await expect.poll(() => container.locator('.oferta-card').count()).toBeGreaterThanOrEqual(3);

        const titulos = await container.locator('.oferta-titulo').allTextContents();
        expect(new Set(titulos).size).toBe(titulos.length);
    });

    test('mobile esconde o rail e mantém ofertas após o resultado', async ({ page }) => {
        await bloquearExternos(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });

        const container = await contarOfertas(page);
        await expect.poll(() => container.locator('.oferta-card').count()).toBeGreaterThanOrEqual(2);
        await expect(page.locator('#anuncio-lateral')).toBeHidden();
    });

    test('home mostra vitrine com 4 ofertas e não cria rail', async ({ page }) => {
        await bloquearExternos(page);
        await page.setViewportSize({ width: 1366, height: 900 });
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const container = await contarOfertas(page);
        await expect.poll(() => container.locator('.oferta-card').count()).toBeGreaterThanOrEqual(4);
        await expect(page.locator('#anuncio-lateral')).toHaveCount(0);
        await expect(page.locator('.layout-ofertas')).toHaveCount(0);
    });

    test('energia tem ofertas específicas de consumo', async ({ page }) => {
        await bloquearExternos(page);
        await page.setViewportSize({ width: 1366, height: 900 });
        await page.goto('/calculadoras/energia.html', { waitUntil: 'domcontentloaded' });

        const container = await contarOfertas(page);
        await expect.poll(() => container.locator('.oferta-card').count()).toBeGreaterThanOrEqual(3);
        await expect(container.locator('.oferta-etiqueta').first()).toHaveText('ECONOMIA');
    });
});
