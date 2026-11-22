import { referrerHost, sanitizeReferrer } from './http.mjs';

const BUSCADORES = new Set([
    'google.com', 'google.com.br', 'bing.com', 'duckduckgo.com',
    'search.yahoo.com', 'yahoo.com', 'yandex.com', 'yandex.ru', 'baidu.com'
]);

const REDES_SOCIAIS = new Set([
    'instagram.com', 'facebook.com', 'm.facebook.com', 't.co', 'twitter.com', 'x.com',
    'linkedin.com', 'lnkd.in', 'youtube.com', 'youtu.be', 'tiktok.com', 'pinterest.com',
    'wa.me', 'whatsapp.com', 'reddit.com'
]);

function hostCorresponde(host, lista) {
    if (!host) return false;
    return [...lista].some((dominio) => host === dominio || host.endsWith(`.${dominio}`));
}

export function deriveAttribution(utm = {}, referrer = null) {
    const referrerLimpo = sanitizeReferrer(referrer);
    const host = referrerHost(referrer);
    const sourceUtm = utm.source ? String(utm.source).trim().toLowerCase() : '';
    const mediumUtm = utm.medium ? String(utm.medium).trim().toLowerCase() : '';

    let source = 'direct';
    let medium = 'none';

    if (sourceUtm) {
        source = sourceUtm;
        medium = mediumUtm || 'campaign';
    } else if (host) {
        if (hostCorresponde(host, BUSCADORES)) {
            source = host.startsWith('google') ? 'google' : host.startsWith('bing') ? 'bing' : host;
            medium = 'organic';
        } else if (hostCorresponde(host, REDES_SOCIAIS)) {
            source = host;
            medium = 'social';
        } else {
            source = host;
            medium = 'referral';
        }
    }

    return {
        referrer: referrerLimpo,
        referrerHost: host,
        source,
        medium,
        campaign: utm.campaign ? String(utm.campaign).slice(0, 160) : null,
        utmSource: utm.source ? String(utm.source).slice(0, 120) : null,
        utmMedium: utm.medium ? String(utm.medium).slice(0, 120) : null,
        utmCampaign: utm.campaign ? String(utm.campaign).slice(0, 160) : null,
        utmTerm: utm.term ? String(utm.term).slice(0, 160) : null,
        utmContent: utm.content ? String(utm.content).slice(0, 160) : null
    };
}
