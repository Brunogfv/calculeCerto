import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const B1 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(B1, 'public');
const TIPOS = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8'
};

function iniciarServidor() {
    const servidor = http.createServer((req, res) => {
        const url = new URL(req.url, 'http://127.0.0.1');
        const relativo = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\//, '');
        const arquivo = path.resolve(PUBLIC, relativo);
        if (!arquivo.startsWith(PUBLIC + path.sep) || !fs.existsSync(arquivo)) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream' });
        res.end(fs.readFileSync(arquivo));
    });
    return new Promise((resolve) => servidor.listen(0, '127.0.0.1', () => resolve(servidor)));
}

async function prepararPagina(browser, base, initScript) {
    const context = await browser.newContext();
    if (initScript) await context.addInitScript(initScript);
    const page = await context.newPage();
    const chamadasApi = [];
    await page.route('**/*', (route) => {
        const url = new URL(route.request().url());
        if (url.origin !== base) {
            chamadasApi.push(url.href);
            return route.abort();
        }
        if (url.pathname.startsWith('/api/')) chamadasApi.push(url.href);
        return route.continue();
    });
    await page.goto(base + '/');
    return { context, page, chamadasApi };
}

test('página B1 não chama API antes do consentimento e reflete aceitar/recusar/retirar', async () => {
    const servidor = await iniciarServidor();
    const browser = await chromium.launch({ headless: true });
    const base = `http://127.0.0.1:${servidor.address().port}`;

    try {
        const { context, page, chamadasApi } = await prepararPagina(browser, base);

        await page.waitForSelector('#b1-status');
        assert.match(await page.locator('#b1-status').innerText(), /Sem consentimento local válido/i);
        assert.equal(await page.evaluate(() => localStorage.getItem('pca_consent_v1')), null);
        assert.equal(chamadasApi.length, 0);

        await page.click('#b1-accept');
        const aceito = JSON.parse(await page.evaluate(() => localStorage.getItem('pca_consent_v1')));
        assert.equal(aceito.version, '2026-11');
        assert.equal(aceito.analytics, true);
        assert.equal(aceito.ads, false);
        assert.equal(chamadasApi.length, 0);

        await page.click('#b1-reject');
        const recusado = JSON.parse(await page.evaluate(() => localStorage.getItem('pca_consent_v1')));
        assert.equal(recusado.analytics, false);
        assert.equal(chamadasApi.length, 0);

        await page.click('#b1-accept');
        await page.click('#b1-withdraw');
        assert.equal(await page.evaluate(() => localStorage.getItem('pca_consent_v1')), null);
        assert.match(await page.locator('#b1-status').innerText(), /retirado/i);
        assert.equal(chamadasApi.length, 0);

        await context.close();
    } finally {
        await browser.close();
        await new Promise((resolve) => servidor.close(resolve));
    }
});

test('DNT/GPC desabilita aceitar e não permite captura', async () => {
    const servidor = await iniciarServidor();
    const browser = await chromium.launch({ headless: true });
    const base = `http://127.0.0.1:${servidor.address().port}`;

    try {
        const { context, page, chamadasApi } = await prepararPagina(browser, base, () => {
            Object.defineProperty(navigator, 'doNotTrack', { configurable: true, get: () => '1' });
        });

        await page.waitForSelector('#b1-status');
        assert.equal(await page.locator('#b1-accept').isDisabled(), true);
        assert.match(await page.locator('#b1-status').innerText(), /DNT\/GPC/i);
        assert.equal(chamadasApi.length, 0);

        await context.close();
    } finally {
        await browser.close();
        await new Promise((resolve) => servidor.close(resolve));
    }
});
