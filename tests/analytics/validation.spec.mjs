import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { parseCollectPayload } from '../../netlify/functions/_lib/validation.mjs';

function basePayload(event = 'pageview', data) {
    const payload = {
        event_id: crypto.randomUUID(),
        session_id: crypto.randomUUID(),
        visitor_id: 'visitor_' + crypto.randomBytes(12).toString('hex'),
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
    if (data !== undefined) payload.data = data;
    return payload;
}

test('aceita pageview válido sem valores', () => {
    const resultado = parseCollectPayload(basePayload());
    assert.equal(resultado.ok, true);
    assert.equal(resultado.consent, true);
});

test('aceita consentimento recusado e sinaliza para não gravar', () => {
    const payload = basePayload();
    payload.consent = { analytics: false };
    const resultado = parseCollectPayload(payload);
    assert.equal(resultado.ok, true);
    assert.equal(resultado.consent, false);
});

test('rejeita valores e resultados de calculadora', () => {
    const payload = basePayload('calculator_complete', {
        calculator: 'Calculadora de IMC',
        values: 'peso=70',
        resultado: 'IMC 22'
    });
    const resultado = parseCollectPayload(payload);
    assert.equal(resultado.ok, false);
    assert.equal(resultado.motivo, 'forbidden_payload');
});

test('aceita calculator_complete sem valores', () => {
    const resultado = parseCollectPayload(basePayload('calculator_complete', {
        calculator: 'Calculadora de IMC',
        duration_ms: 1500
    }));
    assert.equal(resultado.ok, true);
});

test('aceita affiliate_click com produto, categoria e slot', () => {
    const resultado = parseCollectPayload(basePayload('affiliate_click', {
        product: 'Balança Digital Inteligente',
        category: 'imc',
        slot: 'pos-resultado',
        destination_host: 'mercadolivre.com.br'
    }));
    assert.equal(resultado.ok, true);
});

test('rejeita evento desconhecido', () => {
    const resultado = parseCollectPayload(basePayload('desconhecido'));
    assert.equal(resultado.ok, false);
});

test('rejeita campo extra no topo', () => {
    const payload = basePayload();
    payload.extra = true;
    assert.equal(parseCollectPayload(payload).ok, false);
});

test('rejeita caminho inválido', () => {
    const payload = basePayload();
    payload.page.path = 'https://externo.example/';
    assert.equal(parseCollectPayload(payload).ok, false);
});

test('rejeita timestamp futuro', () => {
    const payload = basePayload();
    payload.ts = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    assert.equal(parseCollectPayload(payload).ok, false);
});

test('rejeita payload sem consentimento', () => {
    const payload = basePayload();
    delete payload.consent;
    assert.equal(parseCollectPayload(payload).ok, false);
});
