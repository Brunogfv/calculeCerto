const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8765';
const CONSENT_KEY = 'pca_consent_v1';

async function prepararRede(page, opcoes = {}) {
    const coletas = opcoes.coletas || [];

    await page.route('**/*', route => {
        const url = route.request().url();

        if (url === BASE + '/api/collect') {
            if (opcoes.falharColeta) {
                return route.fulfill({ status: 503, body: '' });
            }

            let evento = null;
            try {
                evento = JSON.parse(route.request().postData() || 'null');
            } catch {}

            if (evento) coletas.push(evento);
            return route.fulfill({ status: 202, contentType: 'application/json', body: '{}' });
        }

        if (url.startsWith(BASE) || url.startsWith('data:')) return route.continue();
        return route.abort();
    });

    return coletas;
}

function lerConsentimento(page) {
    return page.evaluate(chave => {
        const bruto = localStorage.getItem(chave);
        return bruto ? JSON.parse(bruto) : null;
    }, CONSENT_KEY);
}

async function cookieEdge(page) {
    return (await page.context().cookies()).find(cookie => cookie.name === 'pca_edge_consent') || null;
}

function ultimaAtualizacao(page) {
    return page.evaluate(() => {
        const dl = window.dataLayer || [];
        for (let i = dl.length - 1; i >= 0; i--) {
            const entrada = dl[i];
            if (entrada && entrada[0] === 'consent' && entrada[1] === 'update') return entrada[2];
        }
        return null;
    });
}

async function esperarEvento(coletas, nome, timeout = 8000) {
    await expect.poll(() => coletas.some(evento => evento.event === nome), { timeout }).toBe(true);
    return coletas.find(evento => evento.event === nome);
}

test.describe('Consentimento e Consent Mode v2', () => {
    test('primeiro acesso nega tudo, não coleta e mantém o banner acessível', async ({ page }) => {
        const coletas = await prepararRede(page);
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });

        const banner = page.locator('.pca-consent');
        await expect(banner).toHaveClass(/pca-consent--visivel/);
        await expect(banner).toHaveAttribute('role', 'dialog');
        await expect(page.locator('#pca-consent-title')).toBeVisible();
        await expect(page.locator('[data-pca-aceitar]')).toHaveText('Aceitar tudo');
        await expect(page.locator('[data-pca-recusar]')).toHaveText('Recusar opções não essenciais');

        const consentimento = await lerConsentimento(page);
        expect(consentimento).toBeNull();
        expect(await page.evaluate(() => localStorage.getItem('pca_vid'))).toBeNull();
        expect(await page.evaluate(() => sessionStorage.getItem('pca_sid'))).toBeNull();
        expect(await cookieEdge(page)).toBeNull();

        const padrao = await page.evaluate(() => {
            const entrada = (window.dataLayer || [])[0];
            return entrada ? entrada[2] : null;
        });
        expect(padrao).toMatchObject({
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });

        await page.waitForTimeout(400);
        expect(coletas).toEqual([]);
    });

    test('cookie antigo não autoriza após limpeza do consentimento local', async ({ page }) => {
        const coletas = await prepararRede(page);
        await page.context().addCookies([{
            url: BASE,
            name: 'pca_edge_consent',
            value: 'v=2026-11&analytics=1&ads=0',
            secure: true,
            sameSite: 'Lax'
        }]);
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });

        await expect(page.locator('.pca-consent')).toHaveClass(/pca-consent--visivel/);
        expect(await page.evaluate(() => localStorage.getItem('pca_consent_v1'))).toBeNull();
        expect(await cookieEdge(page)).toBeNull();
        expect(await page.evaluate(() => localStorage.getItem('pca_vid'))).toBeNull();
        await page.waitForTimeout(300);
        expect(coletas).toEqual([]);
    });

    test('aceitar tudo libera analytics e publicidade, cria IDs e envia pageview sem valores', async ({ page }) => {
        const coletas = await prepararRede(page);
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });
        await page.locator('[data-pca-aceitar]').click();

        await expect(page.locator('.pca-consent')).not.toHaveClass(/pca-consent--visivel/);
        await expect.poll(() => lerConsentimento(page)).toMatchObject({ analytics: true, ads: true, version: '2026-11' });
        await expect.poll(() => page.evaluate(() => localStorage.getItem('pca_vid'))).toBeTruthy();
        await expect.poll(() => page.evaluate(() => sessionStorage.getItem('pca_sid'))).toBeTruthy();

        const atualizacao = await ultimaAtualizacao(page);
        expect(atualizacao).toMatchObject({
            analytics_storage: 'granted',
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted'
        });

        const cookie = await cookieEdge(page);
        expect(cookie).toBeTruthy();
        expect(cookie.value).toContain('analytics=1');
        expect(cookie.value).toContain('ads=1');
        expect(cookie.value).not.toMatch(/pca_vid|visitor|session/i);
        expect(cookie.secure).toBe(true);
        expect(cookie.httpOnly).toBe(false);
        expect(cookie.sameSite).toBe('Lax');
        expect(cookie.path).toBe('/');

        const pageview = await esperarEvento(coletas, 'pageview');
        expect(pageview.consent).toMatchObject({ analytics: true, version: '2026-11' });
        expect(JSON.stringify(pageview)).not.toMatch(/PESO_SECRETO|RESULTADO_SECRETO/);
    });

    test('recusar mantém tudo negado, não cria IDs e não envia eventos', async ({ page }) => {
        const coletas = await prepararRede(page);
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });
        await page.locator('[data-pca-recusar]').click();

        await expect(page.locator('.pca-consent')).not.toHaveClass(/pca-consent--visivel/);
        await expect.poll(() => lerConsentimento(page)).toMatchObject({ analytics: false, ads: false });
        expect(await page.evaluate(() => localStorage.getItem('pca_vid'))).toBeNull();
        expect(await page.evaluate(() => sessionStorage.getItem('pca_sid'))).toBeNull();

        const cookie = await cookieEdge(page);
        expect(cookie).toBeTruthy();
        expect(cookie.value).toContain('analytics=0');

        const atualizacao = await ultimaAtualizacao(page);
        expect(atualizacao).toMatchObject({
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });

        await page.waitForTimeout(400);
        expect(coletas).toEqual([]);
    });

    test('personalizar separa analytics de publicidade e retirar analytics limpa IDs', async ({ page }) => {
        const coletas = await prepararRede(page);
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });

        await page.locator('[data-pca-personalizar]').click();
        await expect(page.locator('[data-pca-painel]')).toBeVisible();
        await expect(page.locator('[data-pca-analytics]')).not.toBeChecked();
        await expect(page.locator('[data-pca-ads]')).not.toBeChecked();

        await page.locator('[data-pca-analytics]').check();
        await page.locator('[data-pca-salvar]').click();

        await expect.poll(() => lerConsentimento(page)).toMatchObject({ analytics: true, ads: false });
        expect(await ultimaAtualizacao(page)).toMatchObject({
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });
        await expect.poll(() => page.evaluate(() => localStorage.getItem('pca_vid'))).toBeTruthy();
        await esperarEvento(coletas, 'pageview');
        const cookieAnalytics = await cookieEdge(page);
        expect(cookieAnalytics.value).toContain('analytics=1');
        expect(cookieAnalytics.value).toContain('ads=0');

        await page.locator('.pca-prefs-link').click();
        await page.locator('[data-pca-personalizar]').click();
        await expect(page.locator('[data-pca-analytics]')).toBeChecked();
        await expect(page.locator('[data-pca-ads]')).not.toBeChecked();

        await page.locator('[data-pca-analytics]').uncheck();
        await page.locator('[data-pca-ads]').check();
        await page.locator('[data-pca-salvar]').click();

        await expect.poll(() => lerConsentimento(page)).toMatchObject({ analytics: false, ads: true });
        expect(await ultimaAtualizacao(page)).toMatchObject({
            analytics_storage: 'denied',
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted'
        });
        expect(await page.evaluate(() => localStorage.getItem('pca_vid'))).toBeNull();
        expect(await page.evaluate(() => sessionStorage.getItem('pca_sid'))).toBeNull();
        const cookieRetirada = await cookieEdge(page);
        expect(cookieRetirada.value).toContain('analytics=0');

        const totalDepoisDaRetirada = coletas.length;
        await page.locator('.calc-card input').first().fill('DEPOIS_DA_RETIRADA');
        await page.evaluate(() => {
            const link = document.querySelector('.oferta-card a');
            link.addEventListener('click', evento => evento.preventDefault(), { once: true });
            link.click();
        });
        await page.waitForTimeout(300);
        expect(coletas.length).toBe(totalDepoisDaRetirada);
    });

    test('DNT desativa analytics e publicidade personalizada', async ({ page }) => {
        const coletas = await prepararRede(page);
        await page.addInitScript(() => {
            try {
                Object.defineProperty(Navigator.prototype, 'doNotTrack', { get: () => '1', configurable: true });
            } catch {}
            try {
                Object.defineProperty(window, 'doNotTrack', { value: '1', configurable: true });
            } catch {}
        });

        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('.pca-consent')).toHaveClass(/pca-consent--visivel/);
        await expect(page.locator('.pca-consent__texto')).toContainText('desativados');
        await expect(page.locator('[data-pca-aceitar]')).toBeHidden();

        expect(await page.evaluate(() => localStorage.getItem('pca_vid'))).toBeNull();
        expect(await cookieEdge(page)).toBeNull();
        expect(await ultimaAtualizacao(page)).toMatchObject({
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });

        await page.waitForTimeout(400);
        expect(coletas).toEqual([]);
    });

    test('GPC desativa analytics e publicidade personalizada', async ({ page }) => {
        const coletas = await prepararRede(page);
        await page.addInitScript(() => {
            try {
                Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true, configurable: true });
            } catch {}
            try {
                Object.defineProperty(window, 'globalPrivacyControl', { value: true, configurable: true });
            } catch {}
        });

        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('.pca-consent')).toHaveClass(/pca-consent--visivel/);
        await expect(page.locator('.pca-consent__texto')).toContainText('desativados');
        await expect(page.locator('[data-pca-aceitar]')).toBeHidden();

        expect(await page.evaluate(() => localStorage.getItem('pca_vid'))).toBeNull();
        expect(await cookieEdge(page)).toBeNull();
        expect(await ultimaAtualizacao(page)).toMatchObject({
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });

        await page.waitForTimeout(400);
        expect(coletas).toEqual([]);
    });

    test('Consent Mode vem antes do GA4, sem duplicar tags', async ({ page }) => {
        await prepararRede(page);
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const ordem = await page.evaluate(() => {
            const html = document.documentElement.outerHTML;
            return {
                defaultIndex: html.indexOf("gtag('consent', 'default'"),
                gaIndex: html.indexOf('googletagmanager.com/gtag/js'),
                gaCount: [...document.scripts].filter(script => /googletagmanager\.com\/gtag\/js/.test(script.src)).length,
                adsCount: [...document.scripts].filter(script => /pagead2\.googlesyndication\.com/.test(script.src)).length,
                pcaJs: document.querySelectorAll('[data-pca-analytics-js]').length,
                pcaCss: document.querySelectorAll('[data-pca-analytics-css]').length
            };
        });

        expect(ordem.defaultIndex).toBeGreaterThan(-1);
        expect(ordem.gaIndex).toBeGreaterThan(-1);
        expect(ordem.defaultIndex).toBeLessThan(ordem.gaIndex);
        expect(ordem.gaCount).toBe(1);
        expect(ordem.adsCount).toBe(1);
        expect(ordem.pcaJs).toBe(1);
        expect(ordem.pcaCss).toBe(1);
    });

    test('calculadora e afiliado enviam apenas metadados, sem valores ou URL completa', async ({ page }) => {
        const coletas = await prepararRede(page);
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });
        await page.locator('[data-pca-aceitar]').click();

        await page.locator('.calc-card input').first().fill('PESO_SECRETO_72');
        const inicio = await esperarEvento(coletas, 'calculator_start');
        expect(inicio.data).toHaveProperty('calculator');
        expect(JSON.stringify(inicio)).not.toContain('PESO_SECRETO_72');

        await expect.poll(() => page.evaluate(() => typeof window.salvarCalculo)).toBe('function');
        await page.evaluate(() => window.salvarCalculo('Calculadora Teste', 'PESO_SECRETO_72', 'RESULTADO_SECRETO'));
        const conclusao = await esperarEvento(coletas, 'calculator_complete');
        expect(conclusao.data).toMatchObject({ calculator: 'Calculadora Teste' });
        expect(JSON.stringify(conclusao)).not.toMatch(/PESO_SECRETO_72|RESULTADO_SECRETO/);

        await page.locator('.oferta-card a').first().waitFor();
        const hrefAntes = await page.locator('.oferta-card a').first().getAttribute('href');
        await page.evaluate(() => {
            const link = document.querySelector('.oferta-card a');
            link.addEventListener('click', evento => evento.preventDefault(), { once: true });
            link.click();
        });
        const afiliado = await esperarEvento(coletas, 'affiliate_click');
        expect(afiliado.data).toHaveProperty('product');
        expect(afiliado.data).toHaveProperty('destination_host');
        expect(JSON.stringify(afiliado)).not.toMatch(/https?:\/\//);
        expect(await page.locator('.oferta-card a').first().getAttribute('href')).toBe(hrefAntes);
    });

    test('endpoint indisponível não quebra a página', async ({ page }) => {
        const erros = [];
        page.on('pageerror', erro => erros.push(erro.message));
        await prepararRede(page, { falharColeta: true });

        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });
        await page.locator('[data-pca-aceitar]').click();
        await expect(page.locator('.pca-consent')).not.toHaveClass(/pca-consent--visivel/);
        await page.waitForTimeout(500);

        expect(erros).toEqual([]);
    });

    test('banner cabe na tela móvel sem overflow horizontal', async ({ page }) => {
        await prepararRede(page);
        await page.setViewportSize({ width: 360, height: 640 });
        await page.goto('/calculadoras/imc.html', { waitUntil: 'domcontentloaded' });

        const banner = page.locator('.pca-consent');
        await expect(banner).toBeVisible();
        const caixa = await banner.boundingBox();
        expect(caixa.x).toBeGreaterThanOrEqual(0);
        expect(caixa.x + caixa.width).toBeLessThanOrEqual(361);
        expect(caixa.y + caixa.height).toBeLessThanOrEqual(641);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(361);
    });
});
