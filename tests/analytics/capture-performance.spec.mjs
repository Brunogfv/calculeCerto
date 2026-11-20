import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { criarEvento } from '../../netlify/edge-functions/_lib/edge-capture.mjs';

const SEGREDO = 'segredo-edge-de-teste-com-mais-de-32-bytes';
const COOKIE = 'pca_edge_consent=v=2026-11&analytics=1&ads=0';

function request() {
    return new Request('https://portaldascontas.com.br/calculadoras/imc', {
        headers: {
            Cookie: COOKIE,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
            Accept: 'text/html',
            'Accept-Language': 'pt-BR',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Site': 'none',
            'Sec-CH-UA': '"Chromium";v="124"'
        }
    });
}

function response() {
    return new Response('', { status: 200, headers: { 'Content-Type': 'text/html' } });
}

test('processamento puro de captura fica dentro do orçamento local', async () => {
    const env = {
        EDGE_CAPTURE_ENABLED: 'true',
        EDGE_ANALYTICS_ENABLED: 'true',
        EDGE_SECURITY_ENABLED: 'false',
        EDGE_INGEST_SECRET: SEGREDO,
        EDGE_ANALYTICS_SAMPLE_RATE: '1'
    };
    const tempos = [];
    for (let i = 0; i < 80; i++) {
        const inicio = performance.now();
        await criarEvento({
            request: request(),
            response: response(),
            context: { requestId: crypto.randomUUID(), ip: '203.0.113.10', geo: {} },
            env,
            now: new Date('2026-11-09T12:00:00.000Z')
        });
        tempos.push(performance.now() - inicio);
    }

    tempos.sort((a, b) => a - b);
    const p95 = tempos[Math.floor(tempos.length * 0.95)];
    console.log(`capture-processamento-local p95=${p95.toFixed(2)}ms`);
    assert.ok(p95 < 100, `p95 local acima do limite: ${p95.toFixed(2)}ms`);
});
