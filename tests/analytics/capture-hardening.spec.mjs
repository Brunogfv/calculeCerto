import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { createCaptureHandler } from '../../netlify/functions/_lib/capture-handler.mjs';
import { readCaptureConfig } from '../../netlify/functions/_lib/capture-config.mjs';
import { EDGE_ENV_ALLOWLIST, lerEnv, selecionarEnvEdge } from '../../netlify/edge-functions/_lib/edge-env.mjs';
import {
    CAPTURE_MAX_BODY_BYTES,
    DEFAULT_CAPTURE_TIMEOUT_MS,
    excedeLimiteCorpo,
    lerTimeoutCaptura
} from '../../netlify/edge-functions/_lib/capture-limits.mjs';
import { criarEvento, enviarEvento, executarCaptura } from '../../netlify/edge-functions/_lib/edge-capture.mjs';
import { parseConsentCookie } from '../../netlify/edge-functions/_lib/capture-policy.mjs';
import { montarMensagemAssinada } from '../../netlify/edge-functions/_lib/capture-signature.mjs';

const SEGREDO = 'segredo-edge-de-teste-com-mais-de-32-bytes';
const AGORA = new Date('2026-11-09T12:00:00.000Z');
const AMBIENTE_PROIBIDO = {
    DATABASE_URL: 'postgresql://nao-deve-chegar',
    CLEANUP_DATABASE_URL: 'postgresql://nao-deve-chegar',
    MIGRATION_DATABASE_URL: 'postgresql://nao-deve-chegar',
    RATE_LIMIT_HMAC_SECRET: 'nao-deve-chegar',
    EDGE_SECURITY_ENABLED: 'false',
    OUTRA_VARIAVEL: 'nao-deve-chegar'
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
    const mensagem = montarMensagemAssinada({
        keyId: cabecalhos['x-pca-edge-key-id'],
        timestamp: cabecalhos['x-pca-edge-timestamp'],
        nonce: cabecalhos['x-pca-edge-nonce'],
        corpo: texto
    });
    const assinatura = crypto.createHmac('sha256', SEGREDO).update(mensagem).digest('hex');

    return new Request('http://127.0.0.1:8765/api/capture-html', {
        method: 'POST',
        headers: {
            ...cabecalhos,
            'x-pca-edge-signature': cabecalhos['x-pca-edge-signature'] ?? assinatura
        },
        body: texto
    });
}

const envHandler = {
    EDGE_CAPTURE_ENABLED: 'true',
    EDGE_ANALYTICS_ENABLED: 'true',
    EDGE_INGEST_SECRET: SEGREDO,
    EDGE_INGEST_KEY_ID: 'v1',
    EDGE_CAPTURE_MAX_EVENTS_DAY: '1000',
    EDGE_RATE_MAX: '1000',
    EDGE_RATE_WINDOW_SECONDS: '300'
};

function handlerComPoolProibido(env = envHandler) {
    return createCaptureHandler({
        getPool: () => {
            throw new Error('o pool não deveria ser usado');
        },
        env,
        now: () => AGORA
    });
}

test('Edge recebe apenas variáveis da allowlist explícita', () => {
    const acessadas = [];
    const envApi = {
        get: (nome) => {
            acessadas.push(nome);
            return {
                ...AMBIENTE_PROIBIDO,
                EDGE_CAPTURE_ENABLED: 'true',
                EDGE_ANALYTICS_ENABLED: 'false',
                EDGE_INGEST_SECRET: SEGREDO,
                EDGE_INGEST_KEY_ID: 'v1',
                EDGE_ANALYTICS_SAMPLE_RATE: '0.1',
                EDGE_CAPTURE_TIMEOUT_MS: '1500'
            }[nome];
        },
        toObject: () => {
            throw new Error('toObject não deve ser usado pelo Edge');
        }
    };

    const env = lerEnv(envApi);

    assert.deepEqual(Object.keys(env).sort(), [...EDGE_ENV_ALLOWLIST].sort());
    assert.equal(env.EDGE_CAPTURE_ENABLED, 'true');
    assert.equal(env.EDGE_INGEST_SECRET, SEGREDO);
    assert.equal(env.EDGE_CAPTURE_TIMEOUT_MS, '1500');
    assert.equal(acessadas.length, EDGE_ENV_ALLOWLIST.length);
    for (const proibida of Object.keys(AMBIENTE_PROIBIDO)) {
        assert.equal(proibida in env, false, proibida);
    }
});

test('selecionarEnvEdge descarta segredos de banco e de outras fases', () => {
    const env = selecionarEnvEdge({
        ...AMBIENTE_PROIBIDO,
        EDGE_CAPTURE_ENABLED: 'true',
        EDGE_ANALYTICS_ENABLED: 'true',
        EDGE_INGEST_SECRET: SEGREDO,
        EDGE_INGEST_KEY_ID: 'v1',
        EDGE_ANALYTICS_SAMPLE_RATE: '0.1'
    });

    assert.equal('DATABASE_URL' in env, false);
    assert.equal('CLEANUP_DATABASE_URL' in env, false);
    assert.equal('MIGRATION_DATABASE_URL' in env, false);
    assert.equal('RATE_LIMIT_HMAC_SECRET' in env, false);
    assert.equal('EDGE_SECURITY_ENABLED' in env, false);
    assert.equal(env.EDGE_CAPTURE_ENABLED, 'true');
});

test('lerEnv sem Netlify.env devolve objeto vazio', () => {
    assert.deepEqual(lerEnv(null), {});
    assert.deepEqual(lerEnv({}), {});
});

test('lerEnv não inventa variáveis e preserva valores vazios', () => {
    const env = lerEnv({
        get: (nome) => (nome === 'EDGE_CAPTURE_ENABLED' ? '' : undefined)
    });

    assert.deepEqual(env, { EDGE_CAPTURE_ENABLED: '' });
});

test('limite de corpo é único e não pode ser alterado por variável de ambiente', () => {
    assert.equal(CAPTURE_MAX_BODY_BYTES, 8192);
    assert.equal(readCaptureConfig({ EDGE_CAPTURE_MAX_BODY_BYTES: '16384' }).maxBodyBytes, CAPTURE_MAX_BODY_BYTES);
    assert.equal(readCaptureConfig({ EDGE_CAPTURE_MAX_BODY_BYTES: '1024' }).maxBodyBytes, CAPTURE_MAX_BODY_BYTES);
    assert.equal(readCaptureConfig({}).maxBodyBytes, CAPTURE_MAX_BODY_BYTES);

    assert.equal(excedeLimiteCorpo('a'.repeat(CAPTURE_MAX_BODY_BYTES)), false);
    assert.equal(excedeLimiteCorpo('a'.repeat(CAPTURE_MAX_BODY_BYTES + 1)), true);
});

test('timeout do envio é limitado e o envio falha em silêncio quando aborta', async () => {
    assert.equal(lerTimeoutCaptura(undefined), DEFAULT_CAPTURE_TIMEOUT_MS);
    assert.equal(lerTimeoutCaptura('100'), 250);
    assert.equal(lerTimeoutCaptura('9999'), 5000);
    assert.equal(lerTimeoutCaptura('invalido'), DEFAULT_CAPTURE_TIMEOUT_MS);
    assert.equal(lerTimeoutCaptura('1abc'), DEFAULT_CAPTURE_TIMEOUT_MS);
    assert.equal(lerTimeoutCaptura(''), DEFAULT_CAPTURE_TIMEOUT_MS);
    assert.equal(lerTimeoutCaptura('-1'), DEFAULT_CAPTURE_TIMEOUT_MS);

    let abortado = false;
    const fetchImpl = (_url, opcoes) => new Promise((_resolve, reject) => {
        opcoes.signal.addEventListener('abort', () => {
            abortado = true;
            reject(new DOMException('aborted', 'AbortError'));
        });
    });

    const keepAlive = setTimeout(() => {}, 1000);
    try {
        const inicio = performance.now();
        const resultado = await enviarEvento({
            payload: { nonce: crypto.randomUUID() },
            secret: SEGREDO,
            baseUrl: 'https://portaldascontas.com.br/calculadoras/imc',
            fetchImpl,
            now: AGORA,
            timeoutMs: 25
        });
        const duracao = performance.now() - inicio;

        assert.equal(resultado, false);
        assert.equal(abortado, true);
        assert.ok(duracao < 1000, `timeout não respeitado: ${duracao.toFixed(2)}ms`);
    } finally {
        clearTimeout(keepAlive);
    }
});

test('envio só considera sucesso o status 202 documentado', async () => {
    for (const [status, esperado] of [[202, true], [200, false], [204, false], [401, false], [409, false], [429, false], [503, false]]) {
        const resultado = await enviarEvento({
            payload: { nonce: crypto.randomUUID() },
            secret: SEGREDO,
            baseUrl: 'https://portaldascontas.com.br/calculadoras/imc',
            fetchImpl: async () => new Response('', { status }),
            now: AGORA
        });
        assert.equal(resultado, esperado, String(status));
    }
});

test('segredo do Edge usa o mesmo critério de bytes UTF-8 da Function', async () => {
    const request = new Request('https://portaldascontas.com.br/calculadoras/imc', {
        headers: {
            Cookie: 'pca_edge_consent=v=2026-11&analytics=1&ads=0',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
            Accept: 'text/html',
            'Accept-Language': 'pt-BR',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Site': 'none'
        }
    });
    const response = new Response('', { status: 200, headers: { 'Content-Type': 'text/html' } });
    const context = { ip: '203.0.113.10', geo: { country: { code: 'BR' } } };
    const base = {
        EDGE_CAPTURE_ENABLED: 'true',
        EDGE_ANALYTICS_ENABLED: 'true',
        EDGE_INGEST_KEY_ID: 'v1',
        EDGE_ANALYTICS_SAMPLE_RATE: '1'
    };

    const bytesOk = await criarEvento({
        request,
        response,
        context,
        env: { ...base, EDGE_INGEST_SECRET: 'é'.repeat(16) },
        now: AGORA
    });
    assert.equal(bytesOk.ok, true);

    const bytesCurto = await criarEvento({
        request,
        response,
        context,
        env: { ...base, EDGE_INGEST_SECRET: 'é'.repeat(15) },
        now: AGORA
    });
    assert.equal(bytesCurto.ok, false);
    assert.equal(bytesCurto.motivo, 'sem_segredo');

    for (const semSegredo of [undefined, '']) {
        const resultado = await criarEvento({
            request,
            response,
            context,
            env: { ...base, EDGE_INGEST_SECRET: semSegredo },
            now: AGORA
        });
        assert.equal(resultado.ok, false);
        assert.equal(resultado.motivo, 'sem_segredo');
    }
});

test('flags falsas impedem qualquer chamada ao sender', async () => {
    const request = new Request('https://portaldascontas.com.br/calculadoras/imc', {
        headers: { Cookie: 'pca_edge_consent=v=2026-11&analytics=1&ads=0' }
    });
    const response = new Response('', { status: 200, headers: { 'Content-Type': 'text/html' } });
    let chamou = false;
    const trabalho = [];

    const resultado = await executarCaptura({
        request,
        context: {
            next: async () => response,
            waitUntil: (promessa) => trabalho.push(promessa),
            ip: '203.0.113.10',
            geo: {}
        },
        env: { ...envHandler, EDGE_ANALYTICS_ENABLED: 'false' },
        now: AGORA,
        sender: async () => {
            chamou = true;
            return true;
        }
    });

    await Promise.all(trabalho);
    assert.equal(resultado.status, 200);
    assert.equal(chamou, false);
});

test('envio recusa corpo acima do limite único antes de chamar fetch', async () => {
    let chamou = false;
    const resultado = await enviarEvento({
        payload: { nonce: crypto.randomUUID(), preenchimento: 'a'.repeat(CAPTURE_MAX_BODY_BYTES + 1) },
        secret: SEGREDO,
        baseUrl: 'https://portaldascontas.com.br/calculadoras/imc',
        fetchImpl: async () => {
            chamou = true;
            return new Response('', { status: 202 });
        },
        now: AGORA
    });

    assert.equal(resultado, false);
    assert.equal(chamou, false);
});

test('mensagem assinada vincula versão, key-id, timestamp, nonce e corpo', () => {
    const base = { keyId: 'v1', timestamp: '1700000000', nonce: 'nonce-a', corpo: '{"a":1}' };
    assert.equal(montarMensagemAssinada(base), 'edge-v1\nv1\n1700000000\nnonce-a\n{"a":1}');
    assert.notEqual(montarMensagemAssinada(base), montarMensagemAssinada({ ...base, keyId: 'v2' }));
    assert.notEqual(montarMensagemAssinada(base), montarMensagemAssinada({ ...base, timestamp: '1700000001' }));
    assert.notEqual(montarMensagemAssinada(base), montarMensagemAssinada({ ...base, nonce: 'nonce-b' }));
    assert.notEqual(montarMensagemAssinada(base), montarMensagemAssinada({ ...base, corpo: '{"a":2}' }));
});

test('adulterar timestamp ou nonce depois da assinatura invalida o HMAC', async () => {
    const p = payload();
    const texto = JSON.stringify(p);
    const timestamp = Math.floor(AGORA.getTime() / 1000);
    const assinatura = crypto.createHmac('sha256', SEGREDO)
        .update(montarMensagemAssinada({ keyId: 'v1', timestamp: String(timestamp), nonce: p.nonce, corpo: texto }))
        .digest('hex');

    const timestampAdulterado = await handlerComPoolProibido()(new Request('http://127.0.0.1:8765/api/capture-html', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-pca-edge-timestamp': String(timestamp + 1),
            'x-pca-edge-nonce': p.nonce,
            'x-pca-edge-key-id': 'v1',
            'x-pca-edge-signature': assinatura
        },
        body: texto
    }));
    assert.equal(timestampAdulterado.status, 401);

    const nonceAdulterado = await handlerComPoolProibido()(new Request('http://127.0.0.1:8765/api/capture-html', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-pca-edge-timestamp': String(timestamp),
            'x-pca-edge-nonce': crypto.randomUUID(),
            'x-pca-edge-key-id': 'v1',
            'x-pca-edge-signature': assinatura
        },
        body: texto
    }));
    assert.equal(nonceAdulterado.status, 401);
});

test('Handler rejeita HMAC inválido antes de acessar o banco', async () => {
    const resposta = await handlerComPoolProibido()(request(payload(), { 'x-pca-edge-signature': '0'.repeat(64) }));
    assert.equal(resposta.status, 401);
});

test('Handler rejeita timestamp expirado ou futuro antes de acessar o banco', async () => {
    const handler = handlerComPoolProibido();
    const passado = String(Math.floor(AGORA.getTime() / 1000) - 120);
    const futuro = String(Math.floor(AGORA.getTime() / 1000) + 120);
    assert.equal((await handler(request(payload(), { 'x-pca-edge-timestamp': passado }))).status, 401);
    assert.equal((await handler(request(payload(), { 'x-pca-edge-timestamp': futuro }))).status, 401);
    assert.equal((await handler(request(payload(), { 'x-pca-edge-timestamp': '1abc' }))).status, 401);
});

test('Handler rejeita key-id desconhecido e nonce divergente sem acessar o banco', async () => {
    const handler = handlerComPoolProibido();
    assert.equal((await handler(request(payload(), { 'x-pca-edge-key-id': 'v2' }))).status, 401);

    const p = payload();
    const outroNonce = crypto.randomUUID();
    assert.equal((await handler(request(p, { 'x-pca-edge-nonce': outroNonce }))).status, 400);
});

test('Handler rejeita método, content-type e corpo grande sem acessar o banco', async () => {
    const handler = handlerComPoolProibido();
    const metodo = await handler(new Request('http://127.0.0.1:8765/api/capture-html', { method: 'GET' }));
    assert.equal(metodo.status, 405);
    assert.equal((await handler(request(payload(), { 'Content-Type': 'text/plain' }))).status, 415);
    assert.equal((await handler(request('x'.repeat(CAPTURE_MAX_BODY_BYTES + 1)))).status, 413);
});

test('limite do corpo vale para 0, 1, 8191, 8192 e 8193 bytes', async () => {
    const handler = handlerComPoolProibido();

    for (const tamanho of [0, 1, 8191, 8192]) {
        const resposta = await handler(request('a'.repeat(tamanho)));
        assert.notEqual(resposta.status, 413, `${tamanho} bytes não deveria ser rejeitado por tamanho`);
    }

    const excedido = await handler(request('a'.repeat(8193)));
    assert.equal(excedido.status, 413);
});

test('limite do corpo mede bytes UTF-8, não caracteres', async () => {
    const handler = handlerComPoolProibido();
    const noLimite = await handler(request('é'.repeat(4096)));
    assert.notEqual(noLimite.status, 413);

    const acima = await handler(request('é'.repeat(4097)));
    assert.equal(acima.status, 413);
});

test('Content-Length ausente, inválido ou mentiroso não contorna o limite real', async () => {
    const handler = handlerComPoolProibido();

    const ausente = await handler(request('a'.repeat(100)));
    assert.notEqual(ausente.status, 413);

    const negativo = await handler(request('a'.repeat(100), { 'Content-Length': '-5' }));
    assert.notEqual(negativo.status, 413);

    const invalido = await handler(request('a'.repeat(100), { 'Content-Length': 'abc' }));
    assert.notEqual(invalido.status, 413);

    const declaradoGrande = await handler(request('a'.repeat(100), { 'Content-Length': '9000' }));
    assert.equal(declaradoGrande.status, 413);

    const declaradoPequeno = await handler(request('a'.repeat(8193), { 'Content-Length': '1' }));
    assert.equal(declaradoPequeno.status, 413);
});

test('mensagens de erro e configuração não expõem segredo', async () => {
    const semSegredo = handlerComPoolProibido({ ...envHandler, EDGE_INGEST_SECRET: '' });
    const respostaConfig = await semSegredo(request(payload()));
    assert.equal(respostaConfig.status, 503);
    const textoConfig = await respostaConfig.text();
    assert.equal(textoConfig.includes(SEGREDO), false);
    assert.equal(textoConfig.includes('DATABASE_URL'), false);

    const respostaHmac = await handlerComPoolProibido()(request(payload(), { 'x-pca-edge-signature': '0'.repeat(64) }));
    assert.equal(respostaHmac.status, 401);
    const textoHmac = await respostaHmac.text();
    assert.equal(textoHmac.includes(SEGREDO), false);
    assert.equal(textoHmac.includes('DATABASE_URL'), false);
});

test('flags desligadas não chegam ao banco', async () => {
    const desligado = handlerComPoolProibido({ ...envHandler, EDGE_ANALYTICS_ENABLED: 'false' });
    const resposta = await desligado(request(payload()));
    assert.equal(resposta.status, 204);
    assert.equal(resposta.headers.get('x-analytics-status'), 'disabled');
});

test('cookie de consentimento adulterado não vira prova de consentimento', () => {
    assert.equal(parseConsentCookie('pca_edge_consent=v=2026-11&analytics=1').valido, true);
    assert.equal(parseConsentCookie('pca_edge_consent=v=2026-11&analytics=01').analytics, false);
    assert.equal(parseConsentCookie('pca_edge_consent=v=2026-11&analytics=true').analytics, false);
    assert.equal(parseConsentCookie('pca_edge_consent=v=2026-11&analytics=1&v=2026-11').valido, false);
    assert.equal(parseConsentCookie('pca_edge_consent=v=2026-11&analytics=1&analytics=0').valido, false);
    assert.equal(parseConsentCookie('pca_edge_consent=v=2026-11&ads=1&ads=1').valido, false);
    assert.equal(parseConsentCookie('pca_edge_consent=analytics=1').valido, false);
    assert.equal(parseConsentCookie('pca_edge_consent=v=2026-11&ads=1').analytics, false);
    assert.equal(parseConsentCookie('pca_edge_consent=v=2026-11&analytics=1; pca_edge_consent=v=2026-11&analytics=1').valido, false);
    assert.equal(parseConsentCookie('outro=1; pca_edge_consent=v=2026-11&analytics=1').valido, true);
});
