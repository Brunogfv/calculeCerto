import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { criarEvento, enviarEvento } from '../netlify/edge-functions/_lib/edge-capture.mjs';
import { createCaptureHandler } from '../netlify/functions/_lib/capture-handler.mjs';
import { montarMensagemAssinada } from '../netlify/edge-functions/_lib/capture-signature.mjs';
import { CAPTURE_MAX_BODY_BYTES, excedeLimiteCorpo } from '../netlify/edge-functions/_lib/capture-limits.mjs';
import { parseConsentCookie } from '../netlify/edge-functions/_lib/capture-policy.mjs';
import * as collectModule from '../netlify/functions/collect.mjs';
import { COMPARTILHADOS } from '../scripts/shared-files.mjs';

const B1 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(B1, '..');
const AGORA = new Date('2026-11-11T12:00:00.000Z');
const SEGREDO = 'segredo-b1-de-teste-com-mais-de-32-bytes';
const COOKIE = 'pca_edge_consent=v=2026-11&analytics=1&ads=0';

function hash(arquivo) {
    return crypto.createHash('sha256').update(fs.readFileSync(arquivo)).digest('hex');
}

function payload(overrides = {}) {
    return {
        schema_version: 1,
        request_id: crypto.randomUUID(),
        nonce: crypto.randomUUID(),
        captured_at: AGORA.toISOString(),
        purpose: 'analytics',
        method: 'GET',
        path: '/',
        status_code: 200,
        country_code: 'BR',
        accept_language: 'pt-BR',
        referrer_host: null,
        ua_family: 'chrome',
        ua_version: '124',
        client_hints: { ua: 'Chromium', mobile: '?0', platform: '"Windows"' },
        fetch_metadata: { accept: 'text/html', mode: 'navigate', dest: 'document', site: 'none' },
        traffic_class: 'likely_human',
        bot_family: null,
        confidence: 55,
        signals: ['ua_browser', 'accept_html'],
        classifier_version: 'phase4-v1',
        rate_key: 'a'.repeat(64),
        sample_rate: 1,
        sampling_method: 'request_id_day_v1',
        is_estimate: false,
        ...overrides
    };
}

function request(body, headers = {}) {
    const texto = JSON.stringify(body);
    const cabecalhos = {
        'Content-Type': 'application/json',
        'x-pca-edge-timestamp': String(Math.floor(AGORA.getTime() / 1000)),
        'x-pca-edge-nonce': body.nonce,
        'x-pca-edge-key-id': 'v1',
        ...headers
    };
    const assinatura = cabecalhos['x-pca-edge-signature'] ?? crypto.createHmac('sha256', SEGREDO)
        .update(montarMensagemAssinada({
            keyId: cabecalhos['x-pca-edge-key-id'],
            timestamp: cabecalhos['x-pca-edge-timestamp'],
            nonce: cabecalhos['x-pca-edge-nonce'],
            corpo: texto
        }))
        .digest('hex');

    return new Request('https://b1.invalid/api/capture-html', {
        method: 'POST',
        headers: { ...cabecalhos, 'x-pca-edge-signature': assinatura },
        body: texto
    });
}

function handlerComPoolProibido(env = {}) {
    return createCaptureHandler({
        getPool: () => {
            throw new Error('pool não deveria ser usado');
        },
        env: {
            EDGE_CAPTURE_ENABLED: 'true',
            EDGE_ANALYTICS_ENABLED: 'true',
            EDGE_INGEST_SECRET: SEGREDO,
            EDGE_INGEST_KEY_ID: 'v1',
            ...env
        },
        now: () => AGORA
    });
}

test('lista compartilhada mantém exatamente 23 arquivos esperados', () => {
    assert.equal(COMPARTILHADOS.length, 23);
});

test('cópias compartilhadas são idênticas aos módulos canônicos', () => {
    for (const relativo of COMPARTILHADOS) {
        const canonico = path.join(ROOT, relativo);
        const copia = path.join(B1, relativo);
        assert.equal(fs.existsSync(canonico), true, `canônico ausente: ${relativo}`);
        assert.equal(fs.existsSync(copia), true, `cópia ausente: ${relativo}`);
        assert.equal(hash(copia), hash(canonico), `divergência: ${relativo} (rode npm run sync:shared)`);
    }
});

test('página B1 é mínima, noindex e sem recursos externos', () => {
    const html = fs.readFileSync(path.join(B1, 'public', 'index.html'), 'utf8');
    const encerrada = fs.readFileSync(path.join(B1, 'public', 'validacao-encerrada.html'), 'utf8');

    for (const texto of [html, encerrada]) {
        assert.match(texto, /name=["']robots["'][^>]*content=["'][^"']*noindex/i);
        assert.doesNotMatch(texto, /(?:src|href)\s*=\s*["'](?:https?:)?\/\//i);
        assert.doesNotMatch(texto, /<(?:form|input|textarea|select)\b/i);
        assert.doesNotMatch(texto, /googletagmanager|google-analytics|adsbygoogle|doubleclick|mercadolivre/i);
    }

    for (const id of ['b1-accept', 'b1-reject', 'b1-withdraw', 'b1-reload', 'b1-status']) {
        assert.match(html, new RegExp(`id=["']${id}["']`));
    }
    assert.match(html, /Ambiente técnico de validação/i);
    assert.doesNotMatch(html, /\/api\/capture-html/);
});

test('script de consentimento espelha a versão e o cookie canônicos sem coletar no navegador', () => {
    const script = fs.readFileSync(path.join(B1, 'public', 'b1-consent.js'), 'utf8');
    const frontend = fs.readFileSync(path.join(ROOT, 'js', 'analytics.js'), 'utf8');
    const politica = fs.readFileSync(path.join(ROOT, 'netlify', 'edge-functions', '_lib', 'capture-policy.mjs'), 'utf8');

    assert.match(script, /const VERSAO = '2026-11'/);
    assert.match(script, /const EDGE_CONSENT_COOKIE = 'pca_edge_consent'/);
    assert.match(frontend, /const VERSAO = '2026-11'/);
    assert.match(politica, /CONSENT_VERSION = '2026-11'/);
    assert.match(politica, /EDGE_CONSENT_COOKIE = 'pca_edge_consent'/);

    assert.doesNotMatch(script, /\bfetch\s*\(/);
    assert.doesNotMatch(script, /sendBeacon|XMLHttpRequest|\/api\/collect|pca_vid|pca_sid/i);
    assert.doesNotMatch(script, /googletagmanager|google-analytics|adsbygoogle|doubleclick|mercadolivre/i);
    assert.equal(parseConsentCookie(COOKIE).analytics, true);
});

test('headers e robots restringem indexação e recursos', () => {
    const headers = fs.readFileSync(path.join(B1, 'public', '_headers'), 'utf8');
    const robots = fs.readFileSync(path.join(B1, 'public', 'robots.txt'), 'utf8');

    assert.match(headers, /X-Robots-Tag:\s*noindex, nofollow, noarchive/i);
    assert.match(headers, /Content-Security-Policy:/i);
    assert.match(headers, /default-src 'none'/i);
    assert.match(headers, /script-src 'self'/i);
    assert.match(headers, /style-src 'self'/i);
    assert.match(headers, /img-src 'none'/i);
    assert.match(
        headers,
        /connect-src 'self' https:\/\/portal-contas-validation-b1\.netlify\.app(?:;|$)/i
    );
    assert.match(headers, /base-uri 'none'/i);
    assert.match(headers, /form-action 'none'/i);
    assert.match(headers, /frame-ancestors 'none'/i);
    const csp = (headers.match(/Content-Security-Policy:\s*([^\n]+)/i) || [])[1] || '';
    assert.doesNotMatch(csp, /\*/);
    assert.doesNotMatch(csp, /connect-src[^;\n]*https:\s/i);
    assert.doesNotMatch(csp, /portaldascontas\.com\.br/i);
    assert.match(robots, /User-agent:\s*\*/i);
    assert.match(robots, /Disallow:\s*\//i);
});

test('build B1 é independente e não publica segredos nem recursos externos', () => {
    execFileSync(process.execPath, [path.join(B1, 'scripts', 'build.mjs')], { cwd: B1, stdio: 'pipe' });

    const dist = path.join(B1, 'dist');
    const arquivos = [];
    const percorrer = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) percorrer(full);
            else arquivos.push(full);
        }
    };
    percorrer(dist);

    assert.equal(arquivos.some((arquivo) => arquivo.endsWith('.env')), false);
    assert.equal(arquivos.some((arquivo) => arquivo.endsWith('.map')), false);

    const proibidos = [
        'postgresql://',
        'DATABASE_URL',
        'CLEANUP_DATABASE_URL',
        'MIGRATION_DATABASE_URL',
        'EDGE_INGEST_SECRET',
        'RATE_LIMIT_HMAC_SECRET',
        'googletagmanager',
        'google-analytics',
        'googlesyndication',
        'adsbygoogle',
        'doubleclick',
        'mercadolivre'
    ];
    for (const arquivo of arquivos) {
        const texto = fs.readFileSync(arquivo, 'utf8');
        for (const proibido of proibidos) {
            assert.equal(texto.includes(proibido), false, `${proibido} em ${path.relative(dist, arquivo)}`);
        }
    }
});

test('config de Edge usa literais estáticos e não usa IMGS_PREFIX', () => {
    const edgeSource = fs.readFileSync(path.join(B1, 'netlify', 'edge-functions', 'html-capture.js'), 'utf8');
    const canonicalSource = fs.readFileSync(path.join(ROOT, 'netlify', 'edge-functions', 'html-capture.js'), 'utf8');

    for (const fonte of [edgeSource, canonicalSource]) {
        const bloco = fonte.match(/export const config\s*=\s*({[\s\S]*?});/);
        assert.ok(bloco, 'config não encontrado');
        assert.doesNotMatch(bloco[1], /IMGS_PREFIX|\b(?:const|let|var)\b|\+/, 'config contém expressão dinâmica');
        assert.match(bloco[1], /'\/imgs\/\*'/);
    }
});

test('configurações de Edge e Function do B1 permanecem nas rotas esperadas', async () => {
    globalThis.Netlify = { env: { get: () => undefined, toObject: () => { throw new Error('toObject não deve ser usado'); } } };
    const edge = await import(pathToFileURL(path.join(B1, 'netlify', 'edge-functions', 'html-capture.js')).href);
    const fn = await import(pathToFileURL(path.join(B1, 'netlify', 'functions', 'capture-html.mjs')).href);
    const cleanup = await import(pathToFileURL(path.join(B1, 'netlify', 'functions', 'cleanup-html-capture.mjs')).href);

    assert.equal(edge.config.path, '/*');
    assert.equal(edge.config.onError, 'bypass');
    assert.deepEqual(edge.config.rateLimit, {
        windowLimit: 120,
        windowSize: 60,
        aggregateBy: ['ip', 'domain']
    });
    assert.equal(fn.config.path, '/api/capture-html');
    assert.deepEqual(fn.config.rateLimit, {
        windowLimit: 60,
        windowSize: 60,
        aggregateBy: ['ip', 'domain']
    });
    assert.equal(cleanup.config.schedule, '15 3 * * *');
    assert.equal(typeof edge.default, 'function');
    assert.equal(typeof fn.default, 'function');
    assert.equal(typeof cleanup.runScheduledCleanup, 'function');
});

test('página raiz é elegível para captura e o payload não contém IP/UA bruto', async () => {
    const request = new Request('https://b1.invalid/', {
        headers: {
            Cookie: COOKIE,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
            Accept: 'text/html',
            'Accept-Language': 'pt-BR',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Site': 'none'
        }
    });
    const response = new Response('', { status: 200, headers: { 'Content-Type': 'text/html' } });
    const resultado = await criarEvento({
        request,
        response,
        context: { ip: '203.0.113.10', geo: { country: { code: 'BR' } } },
        env: {
            EDGE_CAPTURE_ENABLED: 'true',
            EDGE_ANALYTICS_ENABLED: 'true',
            EDGE_INGEST_SECRET: SEGREDO,
            EDGE_ANALYTICS_SAMPLE_RATE: '1'
        },
        now: AGORA
    });

    assert.equal(resultado.ok, true);
    assert.equal(resultado.payload.path, '/');
    const serializado = JSON.stringify(resultado.payload);
    assert.equal(serializado.includes('203.0.113.10'), false);
    assert.equal(serializado.includes('Mozilla/5.0'), false);
    assert.match(resultado.payload.rate_key, /^[0-9a-f]{64}$/);
});

test('envio B1 só considera 202 como sucesso e respeita o limite de corpo', async () => {
    for (const [status, esperado] of [[202, true], [200, false], [204, false], [401, false]]) {
        const resultado = await enviarEvento({
            payload: { nonce: crypto.randomUUID() },
            secret: SEGREDO,
            baseUrl: 'https://b1.invalid/',
            fetchImpl: async () => new Response('', { status }),
            now: AGORA
        });
        assert.equal(resultado, esperado, String(status));
    }

    assert.equal(CAPTURE_MAX_BODY_BYTES, 8192);
    assert.equal(excedeLimiteCorpo('a'.repeat(8192)), false);
    assert.equal(excedeLimiteCorpo('a'.repeat(8193)), true);
});

test('handler B1 rejeita HMAC inválido, nonce divergente e corpo grande sem banco', async () => {
    const handler = handlerComPoolProibido();
    const p = payload();

    assert.equal((await handler(request(p, { 'x-pca-edge-signature': '0'.repeat(64) }))).status, 401);

    const outroNonce = crypto.randomUUID();
    assert.equal((await handler(request(p, { 'x-pca-edge-nonce': outroNonce }))).status, 400);

    assert.equal((await handler(request('x'.repeat(8193)))).status, 413);
    assert.equal((await handlerComPoolProibido({ EDGE_ANALYTICS_ENABLED: 'false' })(request(p))).status, 204);
    assert.equal((await handlerComPoolProibido({ EDGE_INGEST_SECRET: '' })(request(p))).status, 503);
});


test('B1 expoe collect em /api/collect e mantem UA bruto fora do handler', () => {
    assert.equal(collectModule.config.path, '/api/collect');
    assert.equal(typeof collectModule.default, 'function');
    const fonte = fs.readFileSync(path.join(B1, 'netlify', 'functions', '_lib', 'collect-handler.mjs'), 'utf8');
    assert.doesNotMatch(fonte, /user_agent/i);
});
