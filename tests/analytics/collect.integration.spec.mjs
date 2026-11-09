import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createCollectHandler } from '../../netlify/functions/_lib/collect-handler.mjs';
import { createPool } from '../../netlify/functions/_lib/db.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const testUrl = process.env.TEST_DATABASE_URL;
const nomeBanco = testUrl ? new URL(testUrl).pathname.replace(/^\//, '') : '';
const isolado = !!testUrl
    && process.env.ANALYTICS_TEST_DB === '1'
    && process.env.NODE_ENV !== 'production'
    && testUrl !== process.env.DATABASE_URL
    && /test/i.test(nomeBanco);

const suite = isolado ? describe : describe.skip;
const ORIGIN = 'http://127.0.0.1:8765';

function payload(event = 'pageview', data) {
    const valor = {
        event_id: crypto.randomUUID(),
        session_id: crypto.randomUUID(),
        visitor_id: 'v_' + crypto.randomBytes(12).toString('hex'),
        event,
        ts: new Date().toISOString(),
        consent: { analytics: true, version: '2026-11' },
        page: {
            path: '/calculadoras/imc',
            title: 'Calculadora de IMC',
            referrer: 'https://www.google.com/search'
        },
        context: { language: 'pt-BR', screen: { width: 1366, height: 900 } }
    };
    if (data !== undefined) valor.data = data;
    return valor;
}

function request(body, headers = {}) {
    return new Request('http://127.0.0.1:8765/api/collect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Origin: ORIGIN,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
            'X-Forwarded-For': '203.0.113.10',
            'X-Country': 'BR',
            ...headers
        },
        body: typeof body === 'string' ? body : JSON.stringify(body)
    });
}

const envBase = {
    ANALYTICS_INGEST_ENABLED: 'true',
    RATE_LIMIT_HMAC_SECRET: 'segredo-de-teste-com-32-bytes-123456',
    ALLOWED_ORIGINS: ORIGIN,
    RATE_LIMIT_IP_MAX: '1000',
    RATE_LIMIT_VISITOR_MAX: '1000',
    RATE_LIMIT_SESSION_MAX: '1000'
};

suite('collect — integração com PostgreSQL de teste', () => {
    let pool;
    let handler;

    before(() => {
        execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'migrate.mjs'), '--test'], {
            env: { ...process.env, TEST_DATABASE_URL: testUrl, ANALYTICS_TEST_DB: '1' },
            stdio: 'pipe'
        });
        pool = createPool(testUrl, 1);
        handler = createCollectHandler({ getPool: () => pool, env: envBase });
    });

    after(async () => {
        if (pool) await pool.end();
    });

    beforeEach(async () => {
        await pool.query('TRUNCATE visitors, sessions, pageviews, events, affiliate_clicks, ingest_events, rate_limits RESTART IDENTITY CASCADE');
    });

    test('não grava nada enquanto a ingestão estiver desligada', async () => {
        const desligado = createCollectHandler({
            getPool: () => pool,
            env: { ...envBase, ANALYTICS_INGEST_ENABLED: 'false' }
        });
        const resposta = await desligado(request(payload()));
        assert.equal(resposta.status, 204);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM sessions')).rows[0].n, 0);
    });

    test('não grava nada quando o consentimento é recusado', async () => {
        const p = payload();
        p.consent = { analytics: false };
        const resposta = await handler(request(p));
        assert.equal(resposta.status, 204);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM pageviews')).rows[0].n, 0);
    });

    test('cria visitante, sessão e pageview sem valores de formulário', async () => {
        const inicio = payload('session_start');
        const pageview = payload('pageview');
        pageview.session_id = inicio.session_id;
        pageview.visitor_id = inicio.visitor_id;

        assert.equal((await handler(request(inicio))).status, 202);
        assert.equal((await handler(request(pageview))).status, 202);

        const session = (await pool.query('SELECT * FROM sessions WHERE session_id = $1', [inicio.session_id])).rows[0];
        assert.equal(session.visitor_id, inicio.visitor_id);
        assert.equal(session.pageview_count, 1);
        assert.equal(session.event_count, 1);
        assert.equal(session.country_code, 'BR');
        assert.equal(session.source, 'google');
        assert.equal(session.medium, 'organic');
        assert.equal(session.is_test, false);

        const page = (await pool.query('SELECT * FROM pageviews WHERE event_id = $1', [pageview.event_id])).rows[0];
        assert.equal(page.path, '/calculadoras/imc');
        assert.equal(page.visitor_id, inicio.visitor_id);
        assert.equal(Object.hasOwn(page, 'values'), false);
    });

    test('deduplica pageview pelo event_id', async () => {
        const p = payload();
        assert.equal((await handler(request(p))).status, 202);
        assert.equal((await handler(request(p))).status, 202);
        const total = (await pool.query('SELECT count(*)::int AS n FROM pageviews')).rows[0].n;
        const session = (await pool.query('SELECT pageview_count FROM sessions WHERE session_id = $1', [p.session_id])).rows[0];
        assert.equal(total, 1);
        assert.equal(session.pageview_count, 1);
    });

    test('registra calculator_complete sem valores e rejeita valores', async () => {
        const evento = payload('calculator_complete', { calculator: 'Calculadora de IMC', duration_ms: 1200 });
        assert.equal((await handler(request(evento))).status, 202);
        const linha = (await pool.query('SELECT * FROM events WHERE event_id = $1', [evento.event_id])).rows[0];
        assert.equal(linha.name, 'calculator_complete');
        assert.equal(linha.metadata.calculator, 'Calculadora de IMC');
        assert.equal(Object.hasOwn(linha.metadata, 'values'), false);

        const invalido = payload('calculator_complete', { calculator: 'IMC', values: 'peso=70' });
        assert.equal((await handler(request(invalido))).status, 400);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM events')).rows[0].n, 1);
    });

    test('registra affiliate_click em tabela própria', async () => {
        const evento = payload('affiliate_click', {
            product: 'Balança Digital Inteligente',
            category: 'imc',
            slot: 'pos-resultado',
            destination_host: 'mercadolivre.com.br'
        });
        assert.equal((await handler(request(evento))).status, 202);
        const linha = (await pool.query('SELECT * FROM affiliate_clicks WHERE event_id = $1', [evento.event_id])).rows[0];
        assert.equal(linha.product, 'Balança Digital Inteligente');
        assert.equal(linha.category, 'imc');
        assert.equal(linha.slot, 'pos-resultado');
    });

    test('aplica rate limit e usa HMAC, não IP bruto', async () => {
        const limitado = createCollectHandler({
            getPool: () => pool,
            env: {
                ...envBase,
                RATE_LIMIT_SESSION_MAX: '1',
                RATE_LIMIT_SESSION_WINDOW_SECONDS: '60'
            }
        });
        const a = payload();
        const b = payload();
        b.session_id = a.session_id;
        b.visitor_id = a.visitor_id;

        assert.equal((await limitado(request(a))).status, 202);
        assert.equal((await limitado(request(b))).status, 429);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM pageviews')).rows[0].n, 1);

        const buckets = (await pool.query('SELECT bucket_key FROM rate_limits')).rows.map((linha) => linha.bucket_key);
        assert.ok(buckets.some((chave) => /^ip:[0-9a-f]{64}$/.test(chave)));
        assert.equal(buckets.some((chave) => chave.includes('203.0.113.10')), false);
    });

    test('rejeita origem, método, content-type e payload inválido', async () => {
        assert.equal((await handler(request(payload(), { Origin: 'https://externo.example' }))).status, 403);

        const get = new Request('http://127.0.0.1:8765/api/collect', { method: 'GET', headers: { Origin: ORIGIN } });
        assert.equal((await handler(get)).status, 405);

        const texto = new Request('http://127.0.0.1:8765/api/collect', {
            method: 'POST',
            headers: { Origin: ORIGIN, 'Content-Type': 'text/plain' },
            body: 'x'
        });
        assert.equal((await handler(texto)).status, 415);

        assert.equal((await handler(request({ foo: 'bar' }))).status, 400);
    });

    test('não possui coluna de IP completo nas tabelas de visitantes', async () => {
        const colunas = (await pool.query(
            `SELECT column_name FROM information_schema.columns
             WHERE table_name IN ('visitors', 'sessions', 'pageviews', 'events', 'affiliate_clicks')
               AND lower(column_name) LIKE '%ip%'`
        )).rows.map((linha) => linha.column_name);
        assert.deepEqual(colunas, []);
    });

    test('marca tráfego headless como teste e não humano', async () => {
        const p = payload();
        const resposta = await handler(request(p, { 'User-Agent': 'HeadlessChrome/124.0.0.0' }));
        assert.equal(resposta.status, 202);
        const session = (await pool.query('SELECT is_test FROM sessions WHERE session_id = $1', [p.session_id])).rows[0];
        assert.equal(session.is_test, true);
    });

    test('permite múltiplos eventos legítimos na mesma sessão', async () => {
        const sessionId = crypto.randomUUID();
        const visitorId = 'v_' + crypto.randomBytes(12).toString('hex');

        const pageA = payload('pageview');
        const pageB = payload('pageview');
        pageA.session_id = sessionId; pageA.visitor_id = visitorId;
        pageB.session_id = sessionId; pageB.visitor_id = visitorId;

        const clickA = payload('affiliate_click', { product: 'Produto A', category: 'imc', slot: 'pos-resultado' });
        const clickB = payload('affiliate_click', { product: 'Produto B', category: 'imc', slot: 'rail' });
        clickA.session_id = sessionId; clickA.visitor_id = visitorId;
        clickB.session_id = sessionId; clickB.visitor_id = visitorId;

        const calcA = payload('calculator_complete', { calculator: 'IMC' });
        const calcB = payload('calculator_complete', { calculator: 'IMC' });
        calcA.session_id = sessionId; calcA.visitor_id = visitorId;
        calcB.session_id = sessionId; calcB.visitor_id = visitorId;

        for (const evento of [pageA, pageB, clickA, clickB, calcA, calcB]) {
            assert.equal((await handler(request(evento))).status, 202);
        }

        const session = (await pool.query('SELECT * FROM sessions WHERE session_id = $1', [sessionId])).rows[0];
        const pageviews = (await pool.query('SELECT count(*)::int AS n FROM pageviews WHERE session_id = $1', [sessionId])).rows[0].n;
        const clicks = (await pool.query('SELECT count(*)::int AS n FROM affiliate_clicks WHERE session_id = $1', [sessionId])).rows[0].n;
        const events = (await pool.query('SELECT count(*)::int AS n FROM events WHERE session_id = $1', [sessionId])).rows[0].n;

        assert.equal(session.pageview_count, 2);
        assert.equal(session.event_count, 4);
        assert.equal(pageviews, 2);
        assert.equal(clicks, 2);
        assert.equal(events, 4);
    });

    test('deduplica event_id globalmente entre pageview e evento', async () => {
        const page = payload('pageview');
        const calc = payload('calculator_complete', { calculator: 'IMC' });
        calc.event_id = page.event_id;
        calc.session_id = page.session_id;
        calc.visitor_id = page.visitor_id;

        assert.equal((await handler(request(page))).status, 202);
        assert.equal((await handler(request(calc))).status, 202);

        assert.equal((await pool.query('SELECT count(*)::int AS n FROM pageviews')).rows[0].n, 1);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM events')).rows[0].n, 0);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM ingest_events')).rows[0].n, 1);
        const session = (await pool.query('SELECT pageview_count, event_count FROM sessions WHERE session_id = $1', [page.session_id])).rows[0];
        assert.equal(session.pageview_count, 1);
        assert.equal(session.event_count, 0);
    });

    test('rejeita session_id reutilizado por outro visitante', async () => {
        const first = payload('pageview');
        assert.equal((await handler(request(first))).status, 202);

        const second = payload('pageview');
        second.session_id = first.session_id;
        second.visitor_id = 'v_' + crypto.randomBytes(12).toString('hex');
        assert.equal((await handler(request(second))).status, 400);

        assert.equal((await pool.query('SELECT count(*)::int AS n FROM pageviews')).rows[0].n, 1);
        const session = (await pool.query('SELECT visitor_id FROM sessions WHERE session_id = $1', [first.session_id])).rows[0];
        assert.equal(session.visitor_id, first.visitor_id);
    });

    test('exige segredo HMAC com pelo menos 32 bytes', async () => {
        const curto = createCollectHandler({
            getPool: () => pool,
            env: { ...envBase, RATE_LIMIT_HMAC_SECRET: 'curto' }
        });
        assert.equal((await curto(request(payload()))).status, 503);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM sessions')).rows[0].n, 0);
    });
});
