import test from 'node:test';
import assert from 'node:assert/strict';
import { hmacIdentifier, windowStart } from '../../netlify/functions/_lib/rate-limit.mjs';

test('HMAC do IP é determinístico e não contém o IP bruto', () => {
    const segredo = 'segredo-de-teste-1234567890';
    const a = hmacIdentifier('203.0.113.10', segredo);
    const b = hmacIdentifier('203.0.113.10', segredo);
    assert.equal(a, b);
    assert.match(a, /^ip:[0-9a-f]{64}$/);
    assert.equal(a.includes('203.0.113.10'), false);
});

test('HMAC muda com o segredo', () => {
    const a = hmacIdentifier('203.0.113.10', 'segredo-a');
    const b = hmacIdentifier('203.0.113.10', 'segredo-b');
    assert.notEqual(a, b);
});

test('janela do rate limit é alinhada', () => {
    const now = new Date('2026-11-08T12:03:45.000Z');
    assert.equal(windowStart(now, 60).toISOString(), '2026-11-08T12:03:00.000Z');
    assert.equal(windowStart(now, 300).toISOString(), '2026-11-08T12:00:00.000Z');
});

test('IP ausente usa identificador opaco', () => {
    const chave = hmacIdentifier(null, 'segredo');
    assert.match(chave, /^ip:[0-9a-f]{64}$/);
    assert.equal(chave.includes('unknown'), false);
});
