import test from 'node:test';
import assert from 'node:assert/strict';
import { classificar, CLASSIFIER_VERSION } from '../../netlify/edge-functions/_lib/classifier.mjs';

const CRHOME = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.6367.91 Safari/537.36',
    accept: 'text/html,application/xhtml+xml',
    acceptLanguage: 'pt-BR,pt;q=0.9',
    secFetchMode: 'navigate',
    secFetchDest: 'document',
    secFetchSite: 'none',
    secChUa: '"Chromium";v="124", "Google Chrome";v="124"'
};

test('classifica navegador com múltiplos sinais como likely_human', () => {
    const resultado = classificar(CRHOME);
    assert.equal(resultado.traffic_class, 'likely_human');
    assert.equal(resultado.confidence, 80);
    assert.equal(resultado.ua_family, 'chrome');
    assert.equal(resultado.ua_version, '124.0.6367.91');
    assert.ok(resultado.signals.includes('accept_html'));
    assert.ok(resultado.signals.includes('fetch_navigate'));
    assert.ok(resultado.signals.includes('client_hints'));
    assert.equal(resultado.classifier_version, CLASSIFIER_VERSION);
});

test('classifica automação explícita apenas com evidência corroborante', () => {
    const resultado = classificar({
        userAgent: 'Mozilla/5.0 HeadlessChrome/124.0.0.0',
        accept: '*/*'
    });
    assert.equal(resultado.traffic_class, 'automation');
    assert.equal(resultado.bot_family, 'headless_browser');
    assert.ok(resultado.confidence >= 80 && resultado.confidence <= 95);
    assert.ok(resultado.signals.includes('ua_automation'));
    assert.ok(resultado.signals.includes('missing_fetch'));
});

test('um único sinal forte isolado permanece unknown', () => {
    const resultado = classificar({
        userAgent: 'Mozilla/5.0 HeadlessChrome/124.0.0.0',
        accept: 'text/html',
        acceptLanguage: 'pt-BR',
        secFetchMode: 'navigate',
        secFetchDest: 'document',
        secFetchSite: 'none',
        secChUa: '"Chromium";v="124"'
    });
    assert.equal(resultado.traffic_class, 'unknown');
    assert.equal(resultado.confidence, 35);
});

test('crawler declarado com corroboração vira likely_bot sem verificação de IP', () => {
    const resultado = classificar({
        userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        accept: '*/*'
    });
    assert.equal(resultado.traffic_class, 'likely_bot');
    assert.equal(resultado.bot_family, 'search');
    assert.ok(resultado.confidence >= 60 && resultado.confidence <= 84);
    assert.ok(resultado.signals.includes('ua_declared_bot'));
});

test('preview/monitor é distinto de automação', () => {
    const resultado = classificar({
        userAgent: 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
        accept: '*/*'
    });
    assert.equal(resultado.traffic_class, 'preview_or_monitoring');
    assert.equal(resultado.bot_family, 'social_preview');
});

test('conflito entre bot declarado e navegação humana forte permanece unknown', () => {
    const resultado = classificar({
        userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)',
        accept: 'text/html',
        secFetchMode: 'navigate',
        secFetchDest: 'document'
    });
    assert.equal(resultado.traffic_class, 'unknown');
    assert.equal(resultado.confidence, 25);
    assert.ok(resultado.signals.includes('conflict_claimed_bot_human'));
});

test('UA de navegador isolado não basta para likely_human', () => {
    const resultado = classificar({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36'
    });
    assert.equal(resultado.traffic_class, 'unknown');
});

test('cliente genérico não é classificado como navegador', () => {
    const resultado = classificar({
        userAgent: 'SomeClient/1.0',
        accept: 'text/html'
    });
    assert.equal(resultado.traffic_class, 'unknown');
    assert.ok(resultado.signals.includes('ua_unknown_client'));
});

test('país não é sinal de classe', () => {
    const resultado = classificar({ userAgent: 'curl/8.0', accept: '*/*' });
    assert.equal(resultado.traffic_class, 'automation');
    assert.equal(Object.prototype.hasOwnProperty.call(resultado, 'country_code'), false);
});

test('saída não contém User-Agent bruto nem IP', () => {
    const resultado = classificar(CRHOME);
    const serializado = JSON.stringify(resultado);
    assert.equal(serializado.includes('Mozilla/5.0'), false);
    assert.equal(serializado.includes('203.0.113'), false);
    assert.equal(serializado.includes('visitor'), false);
});

test('ordem de prioridade: automation vence preview quando ambas as evidências existem', () => {
    const resultado = classificar({
        userAgent: 'HeadlessChrome Slackbot 1.0',
        accept: '*/*'
    });
    assert.equal(resultado.traffic_class, 'automation');
});

test('UA desconhecido com apenas Accept não infla likely_human', () => {
    const resultado = classificar({
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) SomeBrowser/1.0',
        accept: 'text/html'
    });
    assert.equal(resultado.traffic_class, 'unknown');
});

test('Bingbot é reconhecido como likely_bot de busca', () => {
    const resultado = classificar({
        userAgent: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        accept: '*/*'
    });
    assert.equal(resultado.traffic_class, 'likely_bot');
    assert.equal(resultado.bot_family, 'search');
});

test('monitor UptimeRobot é preview_or_monitoring, não humano', () => {
    const resultado = classificar({ userAgent: 'UptimeRobot/2.0', accept: '*/*' });
    assert.equal(resultado.traffic_class, 'preview_or_monitoring');
    assert.equal(resultado.bot_family, 'monitoring');
});

test('crawler genérico com token Crawler é reconhecido sem borda de palavra', () => {
    const resultado = classificar({
        userAgent: 'Mozilla/5.0 (compatible; ExampleCrawler/1.0)',
        accept: '*/*'
    });
    assert.equal(resultado.traffic_class, 'likely_bot');
    assert.equal(resultado.bot_family, 'other_bot');
});

test('UA ausente permanece unknown mesmo com headers de navegação', () => {
    const resultado = classificar({
        userAgent: '',
        accept: 'text/html',
        secFetchMode: 'navigate',
        secFetchDest: 'document'
    });
    assert.equal(resultado.traffic_class, 'unknown');
    assert.ok(resultado.signals.includes('ua_absent'));
});

test('UA falsificado com human headers permanece unknown', () => {
    const resultado = classificar({
        userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)',
        accept: 'text/html',
        secFetchMode: 'navigate',
        secFetchDest: 'document'
    });
    assert.equal(resultado.traffic_class, 'unknown');
    assert.ok(resultado.signals.includes('conflict_claimed_bot_human'));
});
