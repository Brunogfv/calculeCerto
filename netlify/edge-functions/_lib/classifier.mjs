export const CLASSIFIER_VERSION = 'phase4-v1';

export const CLASSES = Object.freeze([
    'likely_human',
    'likely_bot',
    'automation',
    'preview_or_monitoring',
    'unknown'
]);

const AUTOMATION_PATTERNS = [
    ['headlesschrome', 'headless_browser', 'headless_chrome'],
    ['playwright', 'headless_browser', 'playwright'],
    ['puppeteer', 'headless_browser', 'puppeteer'],
    ['selenium', 'headless_browser', 'selenium'],
    ['phantomjs', 'headless_browser', 'phantomjs'],
    ['cypress', 'headless_browser', 'cypress'],
    ['lighthouse', 'headless_browser', 'lighthouse'],
    ['webdriver', 'headless_browser', 'webdriver'],
    ['curl/', 'script_client', 'curl'],
    ['wget/', 'script_client', 'wget'],
    ['python-requests', 'script_client', 'python_requests'],
    ['python-urllib', 'script_client', 'python_urllib'],
    ['go-http-client', 'script_client', 'go_http'],
    ['java/', 'script_client', 'java'],
    ['okhttp', 'script_client', 'okhttp'],
    ['node-fetch', 'script_client', 'node_fetch'],
    ['undici', 'script_client', 'undici'],
    ['postmanruntime', 'script_client', 'postman'],
    ['insomnia', 'script_client', 'insomnia']
];

const PREVIEW_PATTERNS = [
    ['facebookexternalhit', 'social_preview', 'facebook'],
    ['facebookbot', 'social_preview', 'facebook'],
    ['twitterbot', 'social_preview', 'twitter'],
    ['linkedinbot', 'social_preview', 'linkedin'],
    ['slackbot', 'social_preview', 'slack'],
    ['discordbot', 'social_preview', 'discord'],
    ['telegrambot', 'social_preview', 'telegram'],
    ['whatsapp', 'social_preview', 'whatsapp'],
    ['pinterest', 'social_preview', 'pinterest'],
    ['embedly', 'social_preview', 'embedly'],
    ['skypeuripreview', 'social_preview', 'skype'],
    ['redditbot', 'social_preview', 'reddit'],
    ['uptimerobot', 'monitoring', 'uptimerobot'],
    ['pingdom', 'monitoring', 'pingdom'],
    ['statuscake', 'monitoring', 'statuscake'],
    ['newrelic', 'monitoring', 'newrelic'],
    ['datadog', 'monitoring', 'datadog'],
    ['betteruptime', 'monitoring', 'betteruptime'],
    ['site24x7', 'monitoring', 'site24x7'],
    ['freshping', 'monitoring', 'freshping']
];

const BOT_PATTERNS = [
    ['googlebot', 'search', 'googlebot'],
    ['google-inspectiontool', 'search', 'google'],
    ['bingbot', 'search', 'bingbot'],
    ['duckduckbot', 'search', 'duckduckbot'],
    ['yandexbot', 'search', 'yandex'],
    ['baiduspider', 'search', 'baidu'],
    ['applebot', 'search', 'applebot'],
    ['ahrefsbot', 'seo', 'ahrefs'],
    ['semrushbot', 'seo', 'semrush'],
    ['mj12bot', 'seo', 'mj12'],
    ['dotbot', 'seo', 'dotbot'],
    ['petalbot', 'seo', 'petalbot'],
    ['gptbot', 'ai_crawler', 'gptbot'],
    ['claudebot', 'ai_crawler', 'claudebot'],
    ['anthropic-ai', 'ai_crawler', 'anthropic'],
    ['perplexitybot', 'ai_crawler', 'perplexity'],
    ['ccbot', 'ai_crawler', 'ccbot'],
    ['bytespider', 'ai_crawler', 'bytespider'],
    ['amazonbot', 'ai_crawler', 'amazonbot']
];

const CONFIDENCE = {
    automation: [80, 85, 90, 95],
    preview_or_monitoring: [80, 85, 90, 95],
    likely_bot: [60, 70, 80, 84],
    likely_human: [55, 65, 72, 80]
};

function acharPadrao(ua, padroes) {
    for (const [trecho, familia, nome] of padroes) {
        if (ua.includes(trecho)) return { familia, nome };
    }
    return null;
}

function contemTokenDeBot(ua) {
    return ua
        .split(/[^a-z0-9]+/)
        .some((token) => /(?:bot|crawler|spider)$/.test(token));
}

function versao(ua, padrao) {
    const encontrado = ua.match(padrao);
    return encontrado ? encontrado[1] : null;
}

function identificarUa(uaOriginal) {
    const ua = String(uaOriginal || '').toLowerCase();
    if (!ua) {
        return {
            sinal: 'ua_absent',
            familia: null,
            versao: null,
            botFamily: null
        };
    }

    const automacao = acharPadrao(ua, AUTOMATION_PATTERNS);
    if (automacao) {
        return {
            sinal: 'ua_automation',
            familia: automacao.nome,
            versao: versao(ua, /(?:chrome|version)\/([\d.]+)/),
            botFamily: automacao.familia
        };
    }

    const preview = acharPadrao(ua, PREVIEW_PATTERNS);
    if (preview) {
        return {
            sinal: 'ua_preview',
            familia: preview.nome,
            versao: null,
            botFamily: preview.familia
        };
    }

    const bot = acharPadrao(ua, BOT_PATTERNS);
    if (bot) {
        return {
            sinal: 'ua_declared_bot',
            familia: bot.nome,
            versao: null,
            botFamily: bot.familia
        };
    }

    if (contemTokenDeBot(ua)) {
        return {
            sinal: 'ua_declared_bot',
            familia: 'other_bot',
            versao: null,
            botFamily: 'other_bot'
        };
    }

    if (!/mozilla\/5\.0/.test(ua)) {
        return {
            sinal: 'ua_unknown_client',
            familia: 'unknown_client',
            versao: null,
            botFamily: null
        };
    }

    let familia = 'unknown_browser';
    let versaoUa = null;
    if (ua.includes('samsungbrowser/')) {
        familia = 'samsung';
        versaoUa = versao(ua, /samsungbrowser\/([\d.]+)/);
    } else if (ua.includes('edg/')) {
        familia = 'edge';
        versaoUa = versao(ua, /edg\/([\d.]+)/);
    } else if (ua.includes('opr/') || ua.includes('opera')) {
        familia = 'opera';
        versaoUa = versao(ua, /(?:opr|opera)\/([\d.]+)/);
    } else if (ua.includes('chrome/') || ua.includes('crios/')) {
        familia = 'chrome';
        versaoUa = versao(ua, /(?:chrome|crios)\/([\d.]+)/);
    } else if (ua.includes('firefox/') || ua.includes('fxios/')) {
        familia = 'firefox';
        versaoUa = versao(ua, /(?:firefox|fxios)\/([\d.]+)/);
    } else if (ua.includes('safari/') || ua.includes('version/')) {
        familia = 'safari';
        versaoUa = versao(ua, /(?:version)\/([\d.]+)/);
    }

    return {
        sinal: 'ua_browser',
        familia,
        versao: versaoUa,
        botFamily: null
    };
}

function familiasDaClasse(classe, sinais) {
    const familias = new Set();
    if (sinais.has('ua_automation') || sinais.has('ua_preview') || sinais.has('ua_declared_bot') || sinais.has('ua_browser')) {
        familias.add('ua');
    }
    if (classe === 'likely_human') {
        if (sinais.has('accept_html')) familias.add('accept');
        if (sinais.has('fetch_navigate') || sinais.has('fetch_document') || sinais.has('fetch_site_present')) familias.add('fetch');
        if (sinais.has('client_hints')) familias.add('client_hints');
        if (sinais.has('language_present')) familias.add('language');
    } else {
        if (sinais.has('accept_non_html')) familias.add('accept');
        if (sinais.has('missing_fetch')) familias.add('fetch');
        if (sinais.has('missing_client_hints')) familias.add('client_hints');
    }
    return familias.size;
}

function confianca(classe, quantidadeFamilias) {
    const faixas = CONFIDENCE[classe];
    if (!faixas) return 0;
    const indice = Math.max(0, Math.min(faixas.length - 1, quantidadeFamilias - 2));
    return faixas[indice];
}

export function classificar({ userAgent = '', accept = '', acceptLanguage = '', secFetchMode = '', secFetchDest = '', secFetchSite = '', secChUa = '' } = {}) {
    const ua = identificarUa(userAgent);
    const sinais = new Set([ua.sinal]);
    const acceptLower = String(accept || '').toLowerCase();
    const fetchMode = String(secFetchMode || '').toLowerCase();
    const fetchDest = String(secFetchDest || '').toLowerCase();
    const fetchSite = String(secFetchSite || '').toLowerCase();

    if (acceptLower.includes('text/html')) sinais.add('accept_html');
    else if (acceptLower && acceptLower !== '*/*') sinais.add('accept_non_html');

    if (fetchMode === 'navigate') sinais.add('fetch_navigate');
    if (fetchDest === 'document') sinais.add('fetch_document');
    if (fetchSite) sinais.add('fetch_site_present');
    if (!fetchMode && !fetchDest) sinais.add('missing_fetch');

    if (String(secChUa || '').trim()) sinais.add('client_hints');
    else sinais.add('missing_client_hints');

    if (String(acceptLanguage || '').trim()) sinais.add('language_present');

    const humanoForte = sinais.has('fetch_navigate') && sinais.has('accept_html');
    const navegacaoHumana = sinais.has('fetch_navigate') || sinais.has('fetch_document');
    const contextoHumanoForte = sinais.has('accept_html') && (
        navegacaoHumana || (sinais.has('client_hints') && sinais.has('language_present'))
    );
    if (sinais.has('ua_declared_bot') && humanoForte) {
        sinais.add('conflict_claimed_bot_human');
        return {
            traffic_class: 'unknown',
            confidence: 25,
            signals: [...sinais].sort(),
            ua_family: ua.familia,
            ua_version: ua.versao,
            bot_family: null,
            classifier_version: CLASSIFIER_VERSION
        };
    }

    let trafficClass = 'unknown';
    let quantidadeFamilias = 0;

    if (sinais.has('ua_automation') && (sinais.has('accept_non_html') || sinais.has('missing_fetch') || sinais.has('missing_client_hints'))) {
        trafficClass = 'automation';
        quantidadeFamilias = familiasDaClasse(trafficClass, sinais);
    } else if (sinais.has('ua_preview') && (sinais.has('accept_non_html') || sinais.has('missing_fetch') || sinais.has('missing_client_hints'))) {
        trafficClass = 'preview_or_monitoring';
        quantidadeFamilias = familiasDaClasse(trafficClass, sinais);
    } else if (sinais.has('ua_declared_bot') && (sinais.has('accept_non_html') || sinais.has('missing_fetch') || sinais.has('missing_client_hints'))) {
        trafficClass = 'likely_bot';
        quantidadeFamilias = familiasDaClasse(trafficClass, sinais);
    } else if (sinais.has('ua_browser') && contextoHumanoForte) {
        trafficClass = 'likely_human';
        quantidadeFamilias = familiasDaClasse(trafficClass, sinais);
    }

    if (trafficClass === 'unknown') {
        return {
            traffic_class: 'unknown',
            confidence: sinais.size <= 1 ? 0 : 35,
            signals: [...sinais].sort(),
            ua_family: ua.familia,
            ua_version: ua.versao,
            bot_family: null,
            classifier_version: CLASSIFIER_VERSION
        };
    }

    return {
        traffic_class: trafficClass,
        confidence: confianca(trafficClass, quantidadeFamilias),
        signals: [...sinais].sort(),
        ua_family: ua.familia,
        ua_version: ua.versao,
        bot_family: trafficClass === 'likely_human' ? null : ua.botFamily,
        classifier_version: CLASSIFIER_VERSION
    };
}
