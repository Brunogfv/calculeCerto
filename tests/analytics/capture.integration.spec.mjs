import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createCaptureHandler } from '../../netlify/functions/_lib/capture-handler.mjs';
import { createPool } from '../../netlify/functions/_lib/db.mjs';
import { limparHtmlCapture } from '../../scripts/cleanup-html-capture.mjs';
import { RETENTION_LOCK_KEY } from '../../netlify/functions/_lib/cleanup-retention.mjs';
import { config as cleanupConfig, runScheduledCleanup } from '../../netlify/functions/cleanup-html-capture.mjs';
import { montarMensagemAssinada } from '../../netlify/edge-functions/_lib/capture-signature.mjs';
import { CLEANUP_PASSWORD, RUNTIME_PASSWORD, prepararRolesTeste, validarConfiguracaoTeste } from '../../scripts/test-db.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const testUrl = process.env.TEST_DATABASE_URL;
const nomeBanco = testUrl ? new URL(testUrl).pathname.replace(/^\//, '') : '';
const configurado = !!testUrl && process.env.ANALYTICS_TEST_DB === '1';
if (configurado) validarConfiguracaoTeste(testUrl);
const isolado = configurado && /test/i.test(nomeBanco);

const suite = isolado ? describe : describe.skip;
const SEGREDO = 'segredo-edge-de-teste-com-mais-de-32-bytes';
const AGORA = new Date('2026-11-09T12:00:00.000Z');

const envBase = {
    EDGE_CAPTURE_ENABLED: 'true',
    EDGE_ANALYTICS_ENABLED: 'true',
    EDGE_SECURITY_ENABLED: 'false',
    EDGE_INGEST_SECRET: SEGREDO,
    EDGE_INGEST_KEY_ID: 'v1',
    EDGE_CAPTURE_MAX_EVENTS_DAY: '1000',
    EDGE_RATE_MAX: '1000',
    EDGE_RATE_WINDOW_SECONDS: '300'
};

function payload(overrides = {}) {
    return {
        schema_version: 1,
        request_id: crypto.randomUUID(),
        nonce: crypto.randomUUID(),
        captured_at: AGORA.toISOString(),
        purpose: 'analytics',
        method: 'GET',
        path: '/calculadoras/imc',
        status_code: 200,
        country_code: 'BR',
        accept_language: 'pt-BR',
        referrer_host: 'google.com',
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
        sample_rate: 0.1,
        sampling_method: 'request_id_day_v1',
        is_estimate: true,
        ...overrides
    };
}

function request(body, headers = {}) {
    const texto = typeof body === 'string' ? body : JSON.stringify(body);
    const cabecalhos = {
        'Content-Type': 'application/json',
        'x-pca-edge-timestamp': String(Math.floor(AGORA.getTime() / 1000)),
        'x-pca-edge-nonce': typeof body === 'object' ? body.nonce : crypto.randomUUID(),
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

    return new Request('http://127.0.0.1:8765/api/capture-html', {
        method: 'POST',
        headers: {
            ...cabecalhos,
            'x-pca-edge-signature': assinatura
        },
        body: texto
    });
}

suite('capture-html - integração com PostgreSQL de teste', () => {
    let pool;
    let handler;

    let restrictedPool;
    let restrictedHandler;
    let cleanupPool;
    let analyticsCleanupPool;

    before(async () => {
        await prepararRolesTeste(testUrl);

        execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'migrate.mjs'), '--test'], {
            env: { ...process.env, TEST_DATABASE_URL: testUrl, ANALYTICS_TEST_DB: '1' },
            stdio: 'pipe'
        });
        pool = createPool(testUrl, 5);
        await pool.query('GRANT USAGE ON SCHEMA public TO validation_b1_cleanup');
        await pool.query(`GRANT SELECT, DELETE ON TABLE
            visitors, sessions, pageviews, events, affiliate_clicks,
            ingest_events, rate_limits, html_events, html_traffic_daily,
            html_indicators_monthly, edge_daily_counters, edge_nonces,
            edge_rate_limits
            TO validation_b1_cleanup`);
        await pool.query('REVOKE CREATE ON SCHEMA public FROM validation_b1_cleanup');
        handler = createCaptureHandler({ getPool: () => pool, env: envBase, now: () => AGORA });

        const restricted = new URL(testUrl);
        restricted.username = 'analytics_runtime';
        restricted.password = RUNTIME_PASSWORD;
        restrictedPool = createPool(restricted.toString(), 2);
        restrictedHandler = createCaptureHandler({ getPool: () => restrictedPool, env: envBase, now: () => AGORA });

        const cleanupUrl = new URL(testUrl);
        cleanupUrl.username = 'validation_b1_cleanup';
        cleanupUrl.password = CLEANUP_PASSWORD;
        cleanupPool = createPool(cleanupUrl.toString(), 2);

        const analyticsCleanupUrl = new URL(testUrl);
        analyticsCleanupUrl.username = 'analytics_cleanup';
        analyticsCleanupUrl.password = CLEANUP_PASSWORD;
        analyticsCleanupPool = createPool(analyticsCleanupUrl.toString(), 2);
    });

    after(async () => {
        if (pool) await pool.end();
        if (restrictedPool) await restrictedPool.end();
        if (cleanupPool) await cleanupPool.end();
        if (analyticsCleanupPool) await analyticsCleanupPool.end();
    });

    beforeEach(async () => {
        await pool.query(`TRUNCATE
            visitors, sessions, pageviews, events, affiliate_clicks,
            ingest_events, rate_limits, html_events, html_traffic_daily,
            html_indicators_monthly, edge_daily_counters, edge_nonces,
            edge_rate_limits
            RESTART IDENTITY CASCADE`);
    });

    const diasAtras = (dias) => new Date(Date.now() - dias * 86400000);

    async function inserirSessao({ visitorDias = 420, sessionDias = 420 } = {}) {
        const visitorId = `ret-${crypto.randomUUID()}`;
        const sessionId = crypto.randomUUID();
        await pool.query(
            `INSERT INTO visitors (visitor_id, first_seen_at, last_seen_at)
             VALUES ($1, $2, $2)`,
            [visitorId, diasAtras(visitorDias)]
        );
        await pool.query(
            `INSERT INTO sessions (session_id, visitor_id, started_at, last_seen_at)
             VALUES ($1, $2, $3, $3)`,
            [sessionId, visitorId, diasAtras(sessionDias)]
        );
        return { visitorId, sessionId };
    }

    async function inserirPageview({ visitorId, sessionId, dias = 100 }) {
        await pool.query(
            `INSERT INTO pageviews (
                event_id, session_id, visitor_id, path, occurred_at, received_at
             ) VALUES ($1, $2, $3, '/retention-test', $4, $4)`,
            [crypto.randomUUID(), sessionId, visitorId, diasAtras(dias)]
        );
    }

    async function inserirEvento({ visitorId, sessionId, dias = 100, nome = 'retention-test' }) {
        const eventId = crypto.randomUUID();
        await pool.query(
            `INSERT INTO events (
                event_id, session_id, visitor_id, name, occurred_at, received_at
             ) VALUES ($1, $2, $3, $4, $5, $5)`,
            [eventId, sessionId, visitorId, nome, diasAtras(dias)]
        );
        return eventId;
    }

    async function inserirAfiliado({ eventId, visitorId, sessionId, dias = 100 }) {
        await pool.query(
            `INSERT INTO affiliate_clicks (
                event_id, session_id, visitor_id, product, slot, occurred_at, received_at
             ) VALUES ($1, $2, $3, 'retention-product', 'retention-slot', $4, $4)`,
            [eventId, sessionId, visitorId, diasAtras(dias)]
        );
    }

    async function executarLimpeza() {
        return limparHtmlCapture(cleanupPool, {
            expectedDatabase: 'validation_b1_test',
            expectedRole: 'validation_b1_cleanup',
            batchSize: 100,
            maxBatches: 20
        });
    }

    async function contar(tabela, coluna, valor) {
        return (await pool.query(
            `SELECT count(*)::int AS n FROM ${tabela} WHERE ${coluna} = $1`,
            [valor]
        )).rows[0].n;
    }

    test('não grava quando captura ou analytics estão desligados', async () => {
        const desligado = createCaptureHandler({
            getPool: () => pool,
            env: { ...envBase, EDGE_ANALYTICS_ENABLED: 'false' },
            now: () => AGORA
        });
        assert.equal((await desligado(request(payload()))).status, 204);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_events')).rows[0].n, 0);
    });

    test('rejeita HMAC inválido', async () => {
        const resposta = await handler(request(payload(), { 'x-pca-edge-signature': '0'.repeat(64) }));
        assert.equal(resposta.status, 401);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_events')).rows[0].n, 0);
    });

    test('rejeita timestamp expirado', async () => {
        const antigo = String(Math.floor(AGORA.getTime() / 1000) - 120);
        const resposta = await handler(request(payload(), { 'x-pca-edge-timestamp': antigo }));
        assert.equal(resposta.status, 401);
    });

    test('aceita evento, grava amostra e atualiza agregados', async () => {
        const p = payload();
        const resposta = await handler(request(p));
        assert.equal(resposta.status, 202);

        const linha = (await pool.query('SELECT * FROM html_events')).rows[0];
        assert.equal(linha.request_id, p.request_id);
        assert.equal(linha.purpose, 'analytics');
        assert.equal(Number(linha.sample_rate), 0.1);
        assert.equal(linha.is_estimate, true);
        assert.equal(linha.country_code.trim(), 'BR');
        assert.equal(linha.path, '/calculadoras/imc');
        assert.equal(Object.prototype.hasOwnProperty.call(linha, 'ip'), false);
        assert.equal(Object.prototype.hasOwnProperty.call(linha, 'user_agent'), false);

        const diario = (await pool.query('SELECT * FROM html_traffic_daily')).rows[0];
        assert.equal(diario.observed_count, 1);
        assert.equal(Number(diario.sample_rate), 0.1);
        const mensal = (await pool.query('SELECT * FROM html_indicators_monthly')).rows[0];
        assert.equal(mensal.observed_count, 1);
    });

    test('não grava duplicado quando o mesmo nonce é reenviado', async () => {
        const p = payload();
        assert.equal((await handler(request(p))).status, 202);
        assert.equal((await handler(request(p))).status, 409);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_events')).rows[0].n, 1);
    });

    test('rejeita payload inválido, caminho fora do escopo e segurança desligada', async () => {
        const invalido = payload({ confidence: 99 });
        assert.equal((await handler(request(invalido))).status, 400);

        const fora = payload({ path: '/api/collect' });
        assert.equal((await handler(request(fora))).status, 400);

        const seguranca = payload({ purpose: 'security' });
        const resposta = await handler(request(seguranca));
        assert.equal(resposta.status, 204);
        assert.equal(resposta.headers.get('x-analytics-status'), 'security_disabled');
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_events')).rows[0].n, 0);
    });

    test('aplica rate limit por rate_key', async () => {
        const limitado = createCaptureHandler({
            getPool: () => pool,
            env: { ...envBase, EDGE_RATE_MAX: '2' },
            now: () => AGORA
        });
        const chave = 'b'.repeat(64);
        assert.equal((await limitado(request(payload({ rate_key: chave })))).status, 202);
        assert.equal((await limitado(request(payload({ rate_key: chave })))).status, 202);
        assert.equal((await limitado(request(payload({ rate_key: chave })))).status, 429);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_events')).rows[0].n, 2);
    });

    test('aceita ingestão com role de runtime restrita', async () => {
        const privilegio = await pool.query(`SELECT has_table_privilege('analytics_runtime', 'html_events', 'INSERT') AS ok`);
        assert.equal(privilegio.rows[0].ok, true);
        assert.equal((await restrictedHandler(request(payload()))).status, 202);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_events')).rows[0].n, 1);
    });

    test('aplica limite diário', async () => {
        const limitado = createCaptureHandler({
            getPool: () => pool,
            env: { ...envBase, EDGE_CAPTURE_MAX_EVENTS_DAY: '1' },
            now: () => AGORA
        });
        assert.equal((await limitado(request(payload()))).status, 202);
        assert.equal((await limitado(request(payload()))).status, 429);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_events')).rows[0].n, 1);
    });

    test('rejeita método, content-type, tamanho, key-id, timestamp futuro e nonce divergente', async () => {
        const metodo = await handler(new Request('http://127.0.0.1:8765/api/capture-html', { method: 'GET' }));
        assert.equal(metodo.status, 405);

        assert.equal((await handler(request(payload(), { 'Content-Type': 'text/plain' }))).status, 415);
        assert.equal((await handler(request('x'.repeat(9000)))).status, 413);
        assert.equal((await handler(request(payload(), { 'x-pca-edge-key-id': 'v2' }))).status, 401);
        const futuro = String(Math.floor(AGORA.getTime() / 1000) + 120);
        assert.equal((await handler(request(payload(), { 'x-pca-edge-timestamp': futuro }))).status, 401);

        const p = payload();
        const outroNonce = crypto.randomUUID();
        assert.equal((await handler(request(p, { 'x-pca-edge-nonce': outroNonce }))).status, 400);
    });

    test('concorrência: mesmo nonce produz um aceite e um replay', async () => {
        const p = payload();
        const respostas = await Promise.all([handler(request(p)), handler(request(p))]);
        const status = respostas.map((r) => r.status).sort((a, b) => a - b);
        assert.deepEqual(status, [202, 409]);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_events')).rows[0].n, 1);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM edge_nonces')).rows[0].n, 1);
        const rate = await pool.query('SELECT count FROM edge_rate_limits WHERE bucket_key = $1', [p.rate_key]);
        assert.equal(rate.rows[0].count, 1);
    });

    test('concorrência: rate limit não ultrapassa o máximo e não deixa contador extra', async () => {
        const limitado = createCaptureHandler({
            getPool: () => pool,
            env: { ...envBase, EDGE_RATE_MAX: '2' },
            now: () => AGORA
        });
        const chave = 'c'.repeat(64);
        const pedidos = Array.from({ length: 5 }, () => payload({ rate_key: chave }));
        const respostas = await Promise.all(pedidos.map((p) => limitado(request(p))));
        assert.equal(respostas.filter((r) => r.status === 202).length, 2);
        assert.equal(respostas.filter((r) => r.status === 429).length, 3);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_events')).rows[0].n, 2);
        const rate = await pool.query('SELECT count FROM edge_rate_limits WHERE bucket_key = $1', [chave]);
        assert.equal(rate.rows[0].count, 2);
    });

    test('concorrência: limite diário não ultrapassa o cap', async () => {
        const limitado = createCaptureHandler({
            getPool: () => pool,
            env: { ...envBase, EDGE_CAPTURE_MAX_EVENTS_DAY: '2' },
            now: () => AGORA
        });
        const pedidos = Array.from({ length: 5 }, () => payload());
        const respostas = await Promise.all(pedidos.map((p) => limitado(request(p))));
        assert.equal(respostas.filter((r) => r.status === 202).length, 2);
        assert.equal(respostas.filter((r) => r.status === 429).length, 3);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_events')).rows[0].n, 2);
        const counter = await pool.query(`SELECT count FROM edge_daily_counters WHERE day = $1 AND purpose = 'analytics'`, [AGORA.toISOString().slice(0, 10)]);
        assert.equal(counter.rows[0].count, 2);
    });

    test('role analytics_cleanup tem apenas os privilégios de limpeza da Fase 4', async () => {
        const privilegios = await pool.query(`
            SELECT
                has_table_privilege('analytics_cleanup', 'html_events', 'DELETE') AS delete_fase4,
                has_table_privilege('analytics_cleanup', 'html_events', 'SELECT') AS select_fase4,
                has_table_privilege('analytics_cleanup', 'html_events', 'INSERT') AS insert_fase4,
                has_table_privilege('analytics_cleanup', 'visitors', 'DELETE') AS delete_fase2,
                has_table_privilege('analytics_cleanup', 'pageviews', 'DELETE') AS delete_fase2_pageviews
        `);
        assert.equal(privilegios.rows[0].delete_fase4, true);
        assert.equal(privilegios.rows[0].select_fase4, true);
        assert.equal(privilegios.rows[0].insert_fase4, false);
        assert.equal(privilegios.rows[0].delete_fase2, false);
        assert.equal(privilegios.rows[0].delete_fase2_pageviews, false);

        await assert.rejects(
            () => analyticsCleanupPool.query('DELETE FROM visitors'),
            (erro) => erro.code === '42501'
        );
        await assert.rejects(
            () => analyticsCleanupPool.query('CREATE TABLE pca_cleanup_forbidden (id int)'),
            (erro) => erro.code === '42501'
        );
        await assert.rejects(
            () => analyticsCleanupPool.query('ALTER TABLE html_events ADD COLUMN pca_forbidden int'),
            (erro) => erro.code === '42501'
        );
    });

    test('validation_b1_cleanup tem privilégios mínimos para a retenção completa', async () => {
        const privilegios = await pool.query(`
            SELECT
                has_schema_privilege('validation_b1_cleanup', 'public', 'USAGE') AS usage,
                has_schema_privilege('validation_b1_cleanup', 'public', 'CREATE') AS create_schema,
                has_table_privilege('validation_b1_cleanup', 'visitors', 'SELECT') AS select_visitors,
                has_table_privilege('validation_b1_cleanup', 'visitors', 'DELETE') AS delete_visitors,
                has_table_privilege('validation_b1_cleanup', 'visitors', 'INSERT') AS insert_visitors,
                has_table_privilege('validation_b1_cleanup', 'visitors', 'UPDATE') AS update_visitors,
                has_table_privilege('validation_b1_cleanup', 'html_events', 'SELECT') AS select_html,
                has_table_privilege('validation_b1_cleanup', 'html_events', 'DELETE') AS delete_html,
                has_table_privilege('validation_b1_cleanup', 'schema_migrations', 'SELECT') AS select_migrations
        `);
        const p = privilegios.rows[0];
        assert.equal(p.usage, true);
        assert.equal(p.create_schema, false);
        assert.equal(p.select_visitors, true);
        assert.equal(p.delete_visitors, true);
        assert.equal(p.insert_visitors, false);
        assert.equal(p.update_visitors, false);
        assert.equal(p.select_html, true);
        assert.equal(p.delete_html, true);
        assert.equal(p.select_migrations, false);

        await assert.rejects(() => cleanupPool.query("INSERT INTO visitors (visitor_id) VALUES ('x')"), (erro) => erro.code === '42501');
        await assert.rejects(() => cleanupPool.query('UPDATE visitors SET last_seen_at = now()'), (erro) => erro.code === '42501');
        await assert.rejects(() => cleanupPool.query('TRUNCATE html_events'), (erro) => erro.code === '42501');
        await assert.rejects(() => cleanupPool.query('CREATE TABLE pca_b1_cleanup_forbidden (id int)'), (erro) => erro.code === '42501');
        await assert.rejects(() => cleanupPool.query('ALTER TABLE html_events ADD COLUMN pca_b1_forbidden int'), (erro) => erro.code === '42501');
        await assert.rejects(() => cleanupPool.query('DELETE FROM schema_migrations'), (erro) => erro.code === '42501');

        const memberships = await pool.query(`
            SELECT count(*)::int AS n
            FROM pg_auth_members m JOIN pg_roles u ON u.oid = m.member
            WHERE u.rolname = 'validation_b1_cleanup'
        `);
        assert.equal(memberships.rows[0].n, 0);
    });

    test('limpa retenção de brutos, agregados, contadores, nonces e rate limits', async () => {
        const eventoAntigo = payload();
        const eventoRecente = payload();
        const inserirEvento = (evento, quando) => pool.query(
            `INSERT INTO html_events (
                request_id, captured_at, received_at, purpose, method, path, status_code,
                country_code, accept_language, referrer_host, ua_family, ua_version,
                client_hints, fetch_metadata, traffic_class, bot_family, confidence, signals,
                classifier_version, sample_rate, sampling_method, is_estimate
            ) VALUES ($1, $2, $2, 'analytics', 'GET', '/calculadoras/imc', 200,
                'BR', 'pt-BR', 'google.com', 'chrome', '124', '{}'::jsonb, '{}'::jsonb,
                'likely_human', NULL, 55, ARRAY['ua_browser', 'accept_html'], 'phase4-v1', 0.1, 'request_id_day_v1', true)`,
            [evento.request_id, quando]
        );
        await inserirEvento(eventoAntigo, new Date(Date.now() - 8 * 86400000));
        await inserirEvento(eventoRecente, new Date());
        await pool.query(
            `INSERT INTO html_traffic_daily (day, purpose, path, traffic_class, bot_family, country_code, sample_rate, observed_count)
             VALUES (current_date - 100, 'analytics', '/calculadoras/imc', 'likely_human', '', 'BR', 0.1, 1),
                    (current_date, 'analytics', '/calculadoras/imc', 'likely_human', '', 'BR', 0.1, 1)`
        );
        await pool.query(
            `INSERT INTO html_indicators_monthly (month, purpose, traffic_class, bot_family, sample_rate, observed_count)
             VALUES (date_trunc('month', now()) - interval '14 months', 'analytics', 'likely_human', '', 0.1, 1),
                    (date_trunc('month', now()), 'analytics', 'likely_human', '', 0.1, 1)`
        );
        await pool.query(
            `INSERT INTO edge_daily_counters (day, purpose, count)
             VALUES (current_date - 100, 'analytics', 1), (current_date, 'analytics', 1)`
        );
        await pool.query(
            `INSERT INTO edge_nonces (nonce, expires_at)
             VALUES ('old-nonce', now() - interval '25 hours'), ('recent-nonce', now() + interval '1 hour')`
        );
        await pool.query(
            `INSERT INTO edge_rate_limits (bucket_key, window_start, count)
             VALUES ('old-rate', now() - interval '25 hours', 1), ('recent-rate', now(), 1)`
        );

        const resultado = await limparHtmlCapture(cleanupPool, { rawDays: 7, aggregateDays: 90, indicatorMonths: 13, counterDays: 90, nonceHours: 24, rateHours: 24, expectedDatabase: 'validation_b1_test', expectedRole: 'validation_b1_cleanup' });
        assert.equal(resultado.locked, true);
        assert.equal(resultado.tables.html_events.removidos, 1);
        assert.equal(resultado.tables.html_traffic_daily.removidos, 1);
        assert.equal(resultado.tables.html_indicators_monthly.removidos, 1);
        assert.equal(resultado.tables.edge_daily_counters.removidos, 1);
        assert.equal(resultado.tables.edge_nonces.removidos, 1);
        assert.equal(resultado.tables.edge_rate_limits.removidos, 1);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_events')).rows[0].n, 1);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_traffic_daily')).rows[0].n, 1);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_indicators_monthly')).rows[0].n, 1);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM edge_daily_counters')).rows[0].n, 1);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM edge_nonces')).rows[0].n, 1);
        assert.equal((await pool.query('SELECT count(*)::int AS n FROM edge_rate_limits')).rows[0].n, 1);

        const repetido = await limparHtmlCapture(cleanupPool, { rawDays: 7, aggregateDays: 90, indicatorMonths: 13, counterDays: 90, nonceHours: 24, rateHours: 24, expectedDatabase: 'validation_b1_test', expectedRole: 'validation_b1_cleanup' });
        assert.equal(repetido.locked, true);
        for (const item of Object.values(repetido.tables)) assert.equal(item.removidos, 0);
    });

    test('falha em lote posterior mantém lotes anteriores e faz rollback do lote com erro', async () => {
        const eventoAntigo = payload();
        await pool.query(
            `INSERT INTO html_events (
                request_id, captured_at, received_at, purpose, method, path, status_code,
                country_code, accept_language, referrer_host, ua_family, ua_version,
                client_hints, fetch_metadata, traffic_class, bot_family, confidence, signals,
                classifier_version, sample_rate, sampling_method, is_estimate
            ) VALUES ($1, now() - interval '8 days', now() - interval '8 days', 'analytics', 'GET', '/calculadoras/imc', 200,
                'BR', 'pt-BR', 'google.com', 'chrome', '124', '{}'::jsonb, '{}'::jsonb,
                'likely_human', NULL, 55, ARRAY['ua_browser', 'accept_html'], 'phase4-v1', 0.1, 'request_id_day_v1', true)`,
            [eventoAntigo.request_id]
        );
        await pool.query(
            `INSERT INTO html_traffic_daily (day, purpose, path, traffic_class, bot_family, country_code, sample_rate, observed_count)
             VALUES (current_date - 100, 'analytics', '/calculadoras/imc', 'likely_human', '', 'BR', 0.1, 1)`
        );
        await pool.query(
            `INSERT INTO html_indicators_monthly (month, purpose, traffic_class, bot_family, sample_rate, observed_count)
             VALUES (date_trunc('month', now()) - interval '14 months', 'analytics', 'likely_human', '', 0.1, 1)`
        );
        await pool.query(`CREATE OR REPLACE FUNCTION pca_fail_cleanup() RETURNS trigger AS $$
            BEGIN RAISE EXCEPTION 'cleanup_failure'; END;
            $$ LANGUAGE plpgsql`);
        await pool.query(`CREATE TRIGGER pca_fail_cleanup_trigger BEFORE DELETE ON html_indicators_monthly
            FOR EACH ROW EXECUTE FUNCTION pca_fail_cleanup()`);

        try {
            await assert.rejects(
                () => limparHtmlCapture(cleanupPool, { rawDays: 7, aggregateDays: 90, indicatorMonths: 13, counterDays: 90, nonceHours: 24, rateHours: 24, expectedDatabase: 'validation_b1_test', expectedRole: 'validation_b1_cleanup' }),
                /cleanup_failure/
            );
            assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_events')).rows[0].n, 0);
            assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_traffic_daily')).rows[0].n, 0);
            assert.equal((await pool.query('SELECT count(*)::int AS n FROM html_indicators_monthly')).rows[0].n, 1);
        } finally {
            await pool.query('DROP TRIGGER IF EXISTS pca_fail_cleanup_trigger ON html_indicators_monthly');
            await pool.query('DROP FUNCTION IF EXISTS pca_fail_cleanup()');
        }
    });

    test('sessao antiga com filhos antigos remove toda a arvore', async () => {
        const { visitorId, sessionId } = await inserirSessao();
        await inserirPageview({ visitorId, sessionId });
        const eventId = await inserirEvento({ visitorId, sessionId });
        await inserirAfiliado({ eventId, visitorId, sessionId });

        await executarLimpeza();

        assert.equal(await contar('visitors', 'visitor_id', visitorId), 0);
        assert.equal(await contar('sessions', 'session_id', sessionId), 0);
        assert.equal(await contar('events', 'event_id', eventId), 0);
    });

    test('sessao antiga com filho recente preserva sessao, visitante e filho', async () => {
        const { visitorId, sessionId } = await inserirSessao();
        await inserirPageview({ visitorId, sessionId, dias: 0 });

        await executarLimpeza();

        assert.equal(await contar('sessions', 'session_id', sessionId), 1);
        assert.equal(await contar('visitors', 'visitor_id', visitorId), 1);
        assert.equal((await pool.query(
            `SELECT count(*)::int AS n FROM pageviews WHERE visitor_id = $1`,
            [visitorId]
        )).rows[0].n, 1);
    });

    test('sessao recente com filho antigo preserva sessao e remove apenas o filho', async () => {
        const { visitorId, sessionId } = await inserirSessao({ sessionDias: 0, visitorDias: 420 });
        await inserirPageview({ visitorId, sessionId, dias: 100 });

        await executarLimpeza();

        assert.equal(await contar('sessions', 'session_id', sessionId), 1);
        assert.equal(await contar('visitors', 'visitor_id', visitorId), 1);
        assert.equal((await pool.query(
            `SELECT count(*)::int AS n FROM pageviews WHERE visitor_id = $1`,
            [visitorId]
        )).rows[0].n, 0);
    });

    test('sessao antiga sem filhos e removida junto com o visitante', async () => {
        const { visitorId, sessionId } = await inserirSessao();

        await executarLimpeza();

        assert.equal(await contar('sessions', 'session_id', sessionId), 0);
        assert.equal(await contar('visitors', 'visitor_id', visitorId), 0);
    });

    test('sessao com filhos em faixas diferentes preserva o filho recente e a arvore', async () => {
        const { visitorId, sessionId } = await inserirSessao();
        await inserirPageview({ visitorId, sessionId, dias: 100 });
        const oldEventId = await inserirEvento({ visitorId, sessionId, dias: 100 });
        await inserirAfiliado({ eventId: oldEventId, visitorId, sessionId, dias: 100 });
        await inserirEvento({ visitorId, sessionId, dias: 0, nome: 'recent-retention-test' });

        await executarLimpeza();

        assert.equal(await contar('sessions', 'session_id', sessionId), 1);
        assert.equal(await contar('visitors', 'visitor_id', visitorId), 1);
        assert.equal((await pool.query(
            `SELECT count(*)::int AS n FROM pageviews WHERE visitor_id = $1`,
            [visitorId]
        )).rows[0].n, 0);
        assert.equal((await pool.query(
            `SELECT count(*)::int AS n FROM events WHERE visitor_id = $1`,
            [visitorId]
        )).rows[0].n, 1);
        assert.equal((await pool.query(
            `SELECT count(*)::int AS n FROM affiliate_clicks WHERE visitor_id = $1`,
            [visitorId]
        )).rows[0].n, 0);
    });

    test('advisory lock real impede execucao concorrente sem DELETE', async () => {
        const { visitorId, sessionId } = await inserirSessao();
        const lockClient = await pool.connect();

        try {
            await lockClient.query('SELECT pg_advisory_lock($1)', [RETENTION_LOCK_KEY]);
            const result = await limparHtmlCapture(cleanupPool, {
                expectedDatabase: 'validation_b1_test',
                expectedRole: 'validation_b1_cleanup',
                batchSize: 1,
                maxBatches: 20
            });

            assert.equal(result.locked, false);
            assert.equal(result.status, 'locked');
            assert.equal(await contar('sessions', 'session_id', sessionId), 1);
            assert.equal(await contar('visitors', 'visitor_id', visitorId), 1);
        } finally {
            await lockClient.query('SELECT pg_advisory_unlock($1)', [RETENTION_LOCK_KEY]);
            lockClient.release();
        }
    });

    test('orcamento global interrompe no PostgreSQL e retoma na execucao seguinte', async () => {
        const { visitorId, sessionId } = await inserirSessao();
        for (let i = 0; i < 5; i += 1) {
            const eventId = await inserirEvento({ visitorId, sessionId, dias: 100, nome: `budget-${i}` });
            await inserirAfiliado({ eventId, visitorId, sessionId, dias: 100 });
        }

        const clock = { t: 0 };
        const primeiro = await limparHtmlCapture(cleanupPool, {
            expectedDatabase: 'validation_b1_test',
            expectedRole: 'validation_b1_cleanup',
            batchSize: 1,
            maxBatches: 100,
            timeBudgetMs: 1_000,
            shutdownReserveMs: 100,
            batchTimeoutMs: 200,
            now: () => {
                const atual = clock.t;
                clock.t += 100;
                return atual;
            }
        });
        assert.equal(primeiro.status, 'budget_exhausted');
        assert.equal(primeiro.budgetExhausted, true);
        assert.equal(primeiro.tables.affiliate_clicks.removidos, 2);
        assert.equal(await contar('sessions', 'session_id', sessionId), 1);
        assert.equal((await pool.query(
            `SELECT count(*)::int AS n FROM affiliate_clicks WHERE visitor_id = $1`,
            [visitorId]
        )).rows[0].n, 3);

        const segundo = await executarLimpeza();
        assert.equal(segundo.status, 'complete');
        assert.equal((await pool.query(
            `SELECT count(*)::int AS n FROM affiliate_clicks WHERE visitor_id = $1`,
            [visitorId]
        )).rows[0].n, 0);
        assert.equal(await contar('sessions', 'session_id', sessionId), 0);
    });

    test('falha de lote nao remove sessao com filho recente', async () => {
        const { visitorId, sessionId } = await inserirSessao();
        await inserirPageview({ visitorId, sessionId, dias: 0 });
        await inserirEvento({ visitorId, sessionId, dias: 100 });
        await pool.query(
            `INSERT INTO html_traffic_daily (
                day, purpose, path, traffic_class, bot_family, country_code, sample_rate, observed_count
             ) VALUES (current_date - 100, 'analytics', '/retention-test', 'likely_human', '', 'BR', 0.1, 1)`
        );

        await pool.query(`CREATE OR REPLACE FUNCTION pca_fail_scope() RETURNS trigger AS $$
            BEGIN RAISE EXCEPTION 'cleanup_scope_failure'; END;
            $$ LANGUAGE plpgsql`);
        await pool.query(`CREATE TRIGGER pca_fail_scope_trigger BEFORE DELETE ON html_traffic_daily
            FOR EACH ROW EXECUTE FUNCTION pca_fail_scope()`);

        try {
            await assert.rejects(() => executarLimpeza(), /cleanup_scope_failure/);
            assert.equal(await contar('sessions', 'session_id', sessionId), 1);
            assert.equal(await contar('visitors', 'visitor_id', visitorId), 1);
            assert.equal((await pool.query(
                `SELECT count(*)::int AS n FROM pageviews WHERE visitor_id = $1`,
                [visitorId]
            )).rows[0].n, 1);
        } finally {
            await pool.query('DROP TRIGGER IF EXISTS pca_fail_scope_trigger ON html_traffic_daily');
            await pool.query('DROP FUNCTION IF EXISTS pca_fail_scope()');
        }
    });

    test('agendamento de limpeza está configurado e desativado por padrão', async () => {
        assert.equal(cleanupConfig.schedule, '15 3 * * *');
        const desativado = await runScheduledCleanup({
            getPool: () => pool,
            env: { HTML_CAPTURE_CLEANUP_ENABLED: 'false' }
        });
        assert.deepEqual(desativado, { enabled: false, status: 'disabled' });

        const ativado = await runScheduledCleanup({
            getPool: () => cleanupPool,
            env: { HTML_CAPTURE_CLEANUP_ENABLED: 'true', CLEANUP_EXPECTED_DATABASE: 'validation_b1_test', CLEANUP_EXPECTED_ROLE: 'validation_b1_cleanup' }
        });
        assert.equal(ativado.enabled, true);
        assert.equal(ativado.status, 'complete');
    });
});
