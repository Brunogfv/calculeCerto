import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    amostrar,
    bloqueadoPorPrivacidade,
    caminhoPermitido,
    CONSENT_VERSION,
    EDGE_CONSENT_COOKIE,
    lerTaxaAmostragem,
    montarCookieConsentimento,
    parseConsentCookie,
    respostaEhHtml
} from '../../netlify/edge-functions/_lib/capture-policy.mjs';
import { timestampValido } from '../../netlify/functions/_lib/capture-validation.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('cookie de consentimento válido exige versão e analytics=1', () => {
    const cookie = 'pca_edge_consent=v%3D2026-11%26analytics%3D1%26ads%3D0';
    const resultado = parseConsentCookie(cookie);
    assert.deepEqual(resultado, { valido: true, analytics: true, ads: false, version: '2026-11' });
});

test('cookie inválido, versão desconhecida ou analytics=0 não autoriza', () => {
    assert.equal(parseConsentCookie('').valido, false);
    assert.equal(parseConsentCookie('pca_edge_consent=v=2025-01&analytics=1').valido, false);
    assert.equal(parseConsentCookie('pca_edge_consent=v=2026-11&analytics=0').analytics, false);
    assert.equal(parseConsentCookie('outro=1').valido, false);
});

test('cookie montado não contém identificador e tem atributos exigidos', () => {
    const cookie = montarCookieConsentimento(true, false);
    assert.match(cookie, /^pca_edge_consent=v=2026-11&analytics=1&ads=0/);
    assert.match(cookie, /Secure/);
    assert.match(cookie, /SameSite=Lax/);
    assert.match(cookie, /Path=\//);
    assert.doesNotMatch(cookie, /visitor|visitor_id|session|uuid/i);
});

test('frontend e Edge usam a mesma versão e o mesmo nome de cookie', () => {
    const fonte = fs.readFileSync(path.join(RAIZ, 'js', 'analytics.js'), 'utf8');
    const versao = fonte.match(/const VERSAO = '([^']+)'/);
    const cookie = fonte.match(/const EDGE_CONSENT_COOKIE = '([^']+)'/);

    assert.ok(versao, 'constante VERSAO ausente no frontend');
    assert.ok(cookie, 'constante EDGE_CONSENT_COOKIE ausente no frontend');
    assert.equal(versao[1], CONSENT_VERSION);
    assert.equal(cookie[1], EDGE_CONSENT_COOKIE);
});

test('DNT e GPC bloqueiam privacidade', () => {
    assert.equal(bloqueadoPorPrivacidade(new Headers({ DNT: '1' })), true);
    assert.equal(bloqueadoPorPrivacidade(new Headers({ 'Sec-GPC': '1' })), true);
    assert.equal(bloqueadoPorPrivacidade(new Headers()), false);
});

test('escopo aceita apenas HTML público permitido', () => {
    assert.equal(caminhoPermitido('/'), true);
    assert.equal(caminhoPermitido('/calculadoras/imc'), true);
    assert.equal(caminhoPermitido('/calculadoras/imc.html'), true);
    assert.equal(caminhoPermitido('/artigos/financas/foo'), true);
    assert.equal(caminhoPermitido('/paginas/privacidade'), true);
});

test('escopo exclui assets, API, páginas pessoais e caminhos malformados', () => {
    for (const caminho of [
        '/css/style.css',
        '/js/app.js',
        '/imgs/foo.png',
        '/pagefind/pagefind.js',
        '/api/collect',
        '/busca',
        '/meus-calculos',
        '/obrigado',
        '/sitemap.xml',
        '/robots.txt',
        '/calculadoras/foo.pdf',
        '//evil.example/path',
        'https://evil.example/',
        '/calculadoras/../api/x'
    ]) {
        assert.equal(caminhoPermitido(caminho), false, caminho);
    }
});

test('resposta precisa ser HTML e 200/304', () => {
    assert.equal(respostaEhHtml(new Response('', { status: 200, headers: { 'Content-Type': 'text/html' } })), true);
    assert.equal(respostaEhHtml(new Response(null, { status: 304, headers: { 'Content-Type': 'text/html' } })), true);
    assert.equal(respostaEhHtml(new Response('', { status: 404, headers: { 'Content-Type': 'text/html' } })), false);
    assert.equal(respostaEhHtml(new Response('', { status: 200, headers: { 'Content-Type': 'application/json' } })), false);
});

test('timestamp exige dígitos e rejeita passado, futuro e sufixo', () => {
    const agora = Date.parse('2026-11-09T12:00:00.000Z');
    const atual = String(Math.floor(agora / 1000));
    assert.equal(timestampValido(atual, agora, 60), true);
    assert.equal(timestampValido(atual + 'abc', agora, 60), false);
    assert.equal(timestampValido(String(Number(atual) - 120), agora, 60), false);
    assert.equal(timestampValido(String(Number(atual) + 120), agora, 60), false);
});

test('amostragem é determinística e taxa 1 sempre inclui', () => {
    const data = new Date('2026-11-09T12:00:00.000Z');
    assert.equal(amostrar('request-a', data, 1), true);
    assert.equal(amostrar('request-a', data, 0.1), amostrar('request-a', data, 0.1));
    assert.equal(lerTaxaAmostragem('0.1'), 0.1);
    assert.equal(lerTaxaAmostragem('invalida'), 0.1);
    assert.equal(lerTaxaAmostragem('0'), 0.1);
});

test('amostragem de 10% tem distribuição aproximada e usa o dia UTC', () => {
    const data = new Date('2026-11-09T23:59:59.000Z');
    let incluidos = 0;
    for (let i = 0; i < 10000; i++) {
        if (amostrar(`request-${i}`, data, 0.1)) incluidos++;
    }
    assert.ok(incluidos > 850 && incluidos < 1150, `distribuição inesperada: ${incluidos}`);
    assert.equal(amostrar('request-a', new Date('2026-11-09T00:00:00.000Z'), 0.1), amostrar('request-a', new Date('2026-11-09T23:59:59.000Z'), 0.1));
});
