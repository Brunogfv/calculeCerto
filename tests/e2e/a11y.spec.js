const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8765';

async function bloquearExternos(page) {
    await page.route('**/*', route => {
        const url = route.request().url();
        if (url.startsWith(BASE) || url.startsWith('data:')) return route.continue();
        return route.abort();
    });
}

test.describe('Acessibilidade — teclado, foco e ARIA', () => {
    test('skip link é o primeiro foco e leva ao conteúdo', async ({ page }) => {
        await bloquearExternos(page);
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });

        await page.keyboard.press('Tab');
        const skip = page.locator('.skip-link');
        await expect(skip).toBeFocused();

        await expect.poll(
            () => skip.evaluate(el => getComputedStyle(el).top),
            { timeout: 2_000 }
        ).toBe('8px');

        const estilo = await skip.evaluate(el => getComputedStyle(el).outlineStyle);
        expect(estilo).not.toBe('none');

        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/#conteudo-principal$/);
        await expect(page.locator('main')).toBeFocused();
    });

    test('dropdown desktop abre com Enter, navega com setas e fecha com Escape', async ({ page }) => {
        await bloquearExternos(page);
        await page.setViewportSize({ width: 1366, height: 900 });
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });

        const trigger = page.locator('header .menu-trigger').first();
        await trigger.focus();
        await page.keyboard.press('Enter');

        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        const controls = await trigger.getAttribute('aria-controls');
        const submenu = page.locator('#' + controls);
        await expect(submenu).toBeVisible();

        await page.keyboard.press('ArrowDown');
        await expect(submenu.locator('a').first()).toBeFocused();

        await page.keyboard.press('Escape');
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(trigger).toBeFocused();
    });

    test('menu mobile abre, foca o primeiro item e fecha com Escape', async ({ page }) => {
        await bloquearExternos(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });

        const hamburger = page.locator('.mobile-menu-btn');
        await expect(hamburger).toBeVisible();
        await hamburger.click();

        await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
        await expect(hamburger).toHaveAttribute('aria-label', 'Fechar menu');
        await expect(page.locator('#nav-menu')).toHaveClass(/active/);
        await expect(page.locator('#nav-menu .menu-trigger').first()).toBeFocused();

        await page.keyboard.press('Escape');
        await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
        await expect(hamburger).toHaveAttribute('aria-label', 'Abrir menu');
        await expect(hamburger).toBeFocused();
    });

    test('submenu mobile fecha primeiro e depois o menu fecha', async ({ page }) => {
        await bloquearExternos(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });

        const hamburger = page.locator('.mobile-menu-btn');
        await hamburger.click();

        const trigger = page.locator('#nav-menu .menu-trigger').first();
        await trigger.click();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');

        const controls = await trigger.getAttribute('aria-controls');
        await expect(page.locator('#' + controls)).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(trigger).toBeFocused();
        await expect(page.locator('#nav-menu')).toHaveClass(/active/);

        await page.keyboard.press('Escape');
        await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
        await expect(hamburger).toBeFocused();
    });

    test('busca tem rótulo, live region e fecha com Escape', async ({ page }) => {
        await bloquearExternos(page);
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const input = page.locator('#site-search');
        await expect(input).toHaveAttribute('aria-label', 'Buscar no site');
        await expect(page.locator('#search-results-list')).toHaveAttribute('aria-live', 'polite');

        await input.fill('inss');
        await expect.poll(
            () => page.locator('#search-results-list a').count(),
            { timeout: 20_000 }
        ).toBeGreaterThan(0);

        await page.keyboard.press('Escape');
        await expect(page.locator('#search-results-list')).not.toHaveClass(/active/);
    });

    test('tema tem rótulo acessível e página atual recebe aria-current', async ({ page }) => {
        await bloquearExternos(page);
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });

        const theme = page.locator('.toggle-theme');
        await expect(theme).toHaveAttribute('aria-label', /Ativar tema/);
        const antes = await theme.getAttribute('aria-label');
        await theme.click();
        await expect.poll(() => theme.getAttribute('aria-label')).not.toBe(antes);

        await expect(page.locator('nav a[href="/calculadoras/imc"]')).toHaveAttribute('aria-current', 'page');
    });

    test('header renderizado não usa onclick inline e mantém ARIA consistente', async ({ page }) => {
        await bloquearExternos(page);
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        await expect(page.locator('header [onclick]')).toHaveCount(0);
        await expect(page.locator('header .menu-trigger')).toHaveCount(5);

        const invalidos = await page.evaluate(() => [...document.querySelectorAll('header .menu-trigger')]
            .filter(trigger => !document.getElementById(trigger.getAttribute('aria-controls'))).length);
        expect(invalidos).toBe(0);
    });
});
