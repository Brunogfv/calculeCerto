const { test, expect } = require('@playwright/test');

test('CSP sem violações e recursos locais funcionando', async ({ page }) => {
    const violacoes = [];
    const erros = [];

    page.on('console', message => {
        const texto = message.text();
        if (/Content Security Policy|Refused to/i.test(texto)) violacoes.push(texto);
    });
    page.on('pageerror', error => erros.push(error.message));

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('header.header.topo')).toHaveCount(1);

    await page.goto('/calculadoras/imposto-renda.html', { waitUntil: 'domcontentloaded' });
    await expect.poll(
        () => page.evaluate(() => typeof window.Chart),
        { timeout: 15_000 }
    ).toBe('function');

    await page.goto('/busca?q=inss', { waitUntil: 'domcontentloaded' });
    await expect.poll(
        () => page.locator('#results-list a').count(),
        { timeout: 20_000 }
    ).toBeGreaterThan(0);

    await page.goto('/artigos/financas/como-calcular-desconto-inss.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toHaveCount(1);

    await page.waitForTimeout(1_500);

    expect(violacoes).toEqual([]);
    expect(erros).toEqual([]);
});
