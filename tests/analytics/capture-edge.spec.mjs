import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { criarEvento, enviarEvento, executarCaptura } from '../../netlify/edge-functions/_lib/edge-capture.mjs';
import { montarMensagemAssinada } from '../../netlify/edge-functions/_lib/capture-signature.mjs';
import { parseCapturePayload } from '../../netlify/functions/_lib/capture-validation.mjs';

const SECRET = 'segredo-edge-de-teste-com-mais-de-32-bytes';
const NOW = new Date('2026-11-09T12:00:00.000Z');
const COOKIE = 'pca_edge_consent=v=2026-11&analytics=1&ads=0';

function criarRequest(opcoes = {}) {
    return new Request('https://portaldascontas.com.br/calculadoras/imc', {
        method: 'GET',
        headers: {
            Cookie: COOKIE,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
            Accept: 'text/html',
            'Accept-Language': 'pt-BR',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Site': 'none',
            'Sec-CH-UA': '"Chromium";v="124"',
            Referer: 'https://www.google.com/search?q=imc',
            ...opcoes.headers
        }
    });
}

function criarResponse(status = 200) {
    return new Response('', {
        status,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

function criarContexto(response = criarResponse()) {
    return {
        requestId: crypto.randomUUID(),
        ip: '203.0.113.10',
        geo: { country: { code: 'BR' } },
        next: async () => {
            contexto.ordem.push('next');
            return response;
        },
        waitUntil: (promessa) => {
            contexto.ordem.push('waitUntil');
            contexto.trabalho = promessa;
        },
        ordem: []
    };
}

const env = {
    EDGE_CAPTURE_ENABLED: 'true',
    EDGE_ANALYTICS_ENABLED: 'true',
    EDGE_SECURITY_ENABLED: 'false',
    EDGE_INGEST_SECRET: SECRET,
    EDGE_INGEST_KEY_ID: 'v1',
    EDGE_ANALYTICS_SAMPLE_RATE: '1'
};

let contexto;

test.beforeEach(() => {
    contexto = null;
});

test('cria evento de analytics sem UA bruto, IP ou IDs de visitante', async () => {
    const ctx = { requestId: crypto.randomUUID(), ip: '203.0.113.10', geo: { country: { code: 'BR' } } };
    const resultado = await criarEvento({
        request: criarRequest(),
        response: criarResponse(),
        context: ctx,
        env,
        now: NOW
    });

    assert.equal(resultado.ok, true);
    assert.equal(resultado.payload.purpose, 'analytics');
    assert.equal(resultado.payload.country_code, 'BR');
    assert.equal(resultado.payload.sample_rate, 1);
    assert.equal(resultado.payload.is_estimate, false);
    assert.equal(resultado.payload.classifier_version, 'phase4-v1');
    assert.equal(resultado.payload.traffic_class, 'likely_human');
    assert.match(resultado.payload.rate_key, /^[0-9a-f]{64}$/);
    assert.equal(resultado.payload.path, '/calculadoras/imc');

    const serializado = JSON.stringify(resultado.payload);
    assert.equal(serializado.includes('Mozilla/5.0'), false);
    assert.equal(serializado.includes('203.0.113.10'), false);
    assert.equal(serializado.includes('visitor_id'), false);
    assert.equal(serializado.includes('session_id'), false);
});

test('requestId da Netlify não substitui o UUID do payload', async () => {
    const ctx = {
        requestId: '01FDWR77JMF2DA1CHF5YA6H07K',
        ip: '203.0.113.10',
        geo: { country: { code: 'BR' } }
    };
    const resultado = await criarEvento({
        request: criarRequest(),
        response: criarResponse(),
        context: ctx,
        env,
        now: NOW
    });

    assert.equal(resultado.ok, true);
    assert.match(resultado.payload.request_id, /^[0-9a-f-]{36}$/i);
    assert.match(resultado.payload.nonce, /^[0-9a-f-]{36}$/i);
    assert.notEqual(resultado.payload.request_id, resultado.payload.nonce);
    assert.equal(parseCapturePayload(resultado.payload).ok, true);
});

test('sem cookie válido ou com analytics=0 não captura', async () => {
    const ctx = { requestId: crypto.randomUUID(), ip: '203.0.113.10', geo: {} };
    const semCookie = await criarEvento({
        request: criarRequest({ headers: { Cookie: '' } }),
        response: criarResponse(),
        context: ctx,
        env,
        now: NOW
    });
    assert.equal(semCookie.ok, false);
    assert.equal(semCookie.motivo, 'sem_consentimento');

    const recusado = await criarEvento({
        request: criarRequest({ headers: { Cookie: 'pca_edge_consent=v=2026-11&analytics=0&ads=1' } }),
        response: criarResponse(),
        context: ctx,
        env,
        now: NOW
    });
    assert.equal(recusado.ok, false);
});

test('DNT/GPC bloqueiam analytics', async () => {
    const ctx = { requestId: crypto.randomUUID(), ip: '203.0.113.10', geo: {} };
    for (const header of [{ DNT: '1' }, { 'Sec-GPC': '1' }]) {
        const resultado = await criarEvento({
            request: criarRequest({ headers: header }),
            response: criarResponse(),
            context: ctx,
            env,
            now: NOW
        });
        assert.equal(resultado.ok, false);
        assert.equal(resultado.motivo, 'dnt_gpc');
    }
});

test('escopo e resposta não-HTML não capturam', async () => {
    const ctx = { requestId: crypto.randomUUID(), ip: '203.0.113.10', geo: {} };
    const api = await criarEvento({
        request: new Request('https://portaldascontas.com.br/api/collect', { headers: { Cookie: COOKIE } }),
        response: criarResponse(),
        context: ctx,
        env,
        now: NOW
    });
    assert.equal(api.ok, false);

    const json = await criarEvento({
        request: criarRequest(),
        response: new Response('', { status: 200, headers: { 'Content-Type': 'application/json' } }),
        context: ctx,
        env,
        now: NOW
    });
    assert.equal(json.ok, false);
});

test('flags desligadas não capturam', async () => {
    const ctx = { requestId: crypto.randomUUID(), ip: '203.0.113.10', geo: {} };
    const resultado = await criarEvento({
        request: criarRequest(),
        response: criarResponse(),
        context: ctx,
        env: { ...env, EDGE_ANALYTICS_ENABLED: 'false' },
        now: NOW
    });
    assert.equal(resultado.ok, false);
    assert.equal(resultado.motivo, 'analytics_disabled');
});

test('context.next é chamado primeiro e waitUntil recebe trabalho assíncrono', async () => {
    contexto = criarContexto();
    const enviados = [];
    const resposta = await executarCaptura({
        request: criarRequest(),
        context: contexto,
        env,
        now: NOW,
        sender: async (dados) => {
            contexto.ordem.push('sender');
            enviados.push(dados);
            return true;
        }
    });

    assert.equal(resposta.status, 200);
    assert.equal(contexto.ordem[0], 'next');
    await contexto.trabalho;
    assert.equal(contexto.ordem.includes('waitUntil'), true);
    assert.equal(contexto.ordem.includes('sender'), true);
    assert.equal(enviados.length, 1);
    assert.equal(enviados[0].payload.purpose, 'analytics');
});

test('falha do waitUntil não altera a resposta', async () => {
    contexto = criarContexto();
    contexto.waitUntil = () => {
        throw new Error('waitUntil failed');
    };
    const resposta = await executarCaptura({
        request: criarRequest(),
        context: contexto,
        env,
        now: NOW,
        sender: async () => true
    });
    assert.equal(resposta.status, 200);
    await new Promise((resolve) => setTimeout(resolve, 20));
});

test('falha do coletor não altera a resposta nem lança erro', async () => {
    contexto = criarContexto();
    const resposta = await executarCaptura({
        request: criarRequest(),
        context: contexto,
        env,
        now: NOW,
        sender: async () => {
            throw new Error('collector down');
        }
    });

    assert.equal(resposta.status, 200);
    const resultado = await contexto.trabalho;
    assert.equal(resultado, false);
});

test('envio assina a mensagem canônica com corpo, timestamp, nonce e key-id', async () => {
    const contextoEvento = { requestId: crypto.randomUUID(), ip: '203.0.113.10', geo: { country: { code: 'BR' } } };
    const evento = await criarEvento({
        request: criarRequest(),
        response: criarResponse(),
        context: contextoEvento,
        env,
        now: NOW
    });
    let capturado;
    const fetchFake = async (url, opcoes) => {
        capturado = { url, opcoes };
        return new Response('', { status: 202 });
    };

    const resultado = await enviarEvento({
        payload: evento.payload,
        secret: SECRET,
        keyId: 'v1',
        baseUrl: 'https://portaldascontas.com.br/calculadoras/imc',
        fetchImpl: fetchFake,
        now: NOW
    });

    assert.equal(resultado, true);
    assert.equal(capturado.url.pathname, '/api/capture-html');
    assert.equal(capturado.opcoes.headers['x-pca-edge-nonce'], evento.payload.nonce);
    assert.notEqual(evento.payload.nonce, evento.payload.request_id);
    assert.equal(capturado.opcoes.headers['x-pca-edge-key-id'], 'v1');
    assert.equal(capturado.opcoes.headers['x-pca-edge-timestamp'], String(Math.floor(NOW.getTime() / 1000)));
    const mensagem = montarMensagemAssinada({
        keyId: 'v1',
        timestamp: capturado.opcoes.headers['x-pca-edge-timestamp'],
        nonce: capturado.opcoes.headers['x-pca-edge-nonce'],
        corpo: capturado.opcoes.body
    });
    const esperada = crypto.createHmac('sha256', SECRET).update(mensagem).digest('hex');
    assert.equal(capturado.opcoes.headers['x-pca-edge-signature'], esperada);
});
