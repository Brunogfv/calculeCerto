export const EDGE_CONSENT_COOKIE = 'pca_edge_consent';
export const CONSENT_VERSION = '2026-11';
export const DEFAULT_SAMPLE_RATE = 0.1;

const EXTENSOES_EXCLUIDAS = /\.(?:css|js|mjs|cjs|json|xml|txt|pdf|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|otf|eot|map|wasm)$/i;
const PREFIXOS_EXCLUIDOS = [
    '/api/',
    '/.netlify/',
    '/css/',
    '/js/',
    '/imgs/',
    '/fonts/',
    '/pagefind/',
    '/vendor/',
    '/_'
];
const CAMINHOS_EXCLUIDOS = new Set([
    '/busca',
    '/busca.html',
    '/meus-calculos',
    '/meus-calculos.html',
    '/obrigado',
    '/obrigado.html',
    '/404',
    '/404.html',
    '/sitemap.xml',
    '/robots.txt',
    '/ads.txt'
]);

export function lerFlags(env = {}) {
    return {
        enabled: env.EDGE_CAPTURE_ENABLED === 'true',
        analytics: env.EDGE_ANALYTICS_ENABLED === 'true'
    };
}

export function lerTaxaAmostragem(valor) {
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero <= 0 || numero > 1) return DEFAULT_SAMPLE_RATE;
    return numero;
}

export function parseConsentCookie(cookieHeader) {
    const invalido = (version = null) => ({ valido: false, analytics: false, ads: false, version });
    const bruto = String(cookieHeader || '');
    if (!bruto) return invalido();

    let valorBruto = null;
    let ocorrencias = 0;

    for (const parte of bruto.split(';')) {
        const separador = parte.indexOf('=');
        if (separador === -1) continue;
        const nome = parte.slice(0, separador).trim();
        if (nome !== EDGE_CONSENT_COOKIE) continue;

        ocorrencias++;
        if (ocorrencias > 1) return invalido();
        valorBruto = parte.slice(separador + 1).trim();
    }

    if (valorBruto === null) return invalido();

    let valor = valorBruto;
    if (valor.startsWith('"') && valor.endsWith('"')) valor = valor.slice(1, -1);
    try {
        valor = decodeURIComponent(valor);
    } catch {}

    const params = new URLSearchParams(valor);
    const version = params.get('v');
    const chaves = new Set();
    for (const [chave] of params) {
        if (chaves.has(chave)) return invalido(version);
        chaves.add(chave);
    }
    if (version !== CONSENT_VERSION) return invalido(version);
    return {
        valido: true,
        analytics: params.get('analytics') === '1',
        ads: params.get('ads') === '1',
        version
    };
}

export function bloqueadoPorPrivacidade(headers) {
    const dnt = String(headers.get('dnt') || '').trim();
    const gpc = String(headers.get('sec-gpc') || '').trim();
    return dnt === '1' || gpc === '1';
}

export function caminhoPermitido(pathname) {
    const original = String(pathname || '');
    if (!original.startsWith('/') || original.startsWith('//') || original.includes('\\')) return false;

    let caminho;
    try {
        caminho = new URL(original, 'https://portaldascontas.com.br').pathname;
    } catch {
        return false;
    }

    if (!caminho.startsWith('/') || caminho.startsWith('//')) return false;
    if (caminho === '/') return true;
    if (CAMINHOS_EXCLUIDOS.has(caminho)) return false;
    if (PREFIXOS_EXCLUIDOS.some(prefixo => caminho.startsWith(prefixo))) return false;
    if (EXTENSOES_EXCLUIDAS.test(caminho)) return false;

    return /^\/(?:calculadoras|artigos|paginas)(?:\/|$)/i.test(caminho);
}

export function metodoPermitido(method) {
    return String(method || '').toUpperCase() === 'GET';
}

export function respostaEhHtml(resposta) {
    if (!resposta) return false;
    const status = Number(resposta.status);
    if (status !== 200 && status !== 304) return false;
    const tipo = String(resposta.headers?.get?.('content-type') || '').toLowerCase();
    return tipo.includes('text/html');
}

export function normalizarHeader(valor, max = 200) {
    return String(valor || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, max);
}

export function referrerHost(referrer) {
    if (!referrer) return null;
    try {
        const url = new URL(referrer);
        if (!/^https?:$/.test(url.protocol)) return null;
        return url.hostname.toLowerCase().replace(/^www\./, '') || null;
    } catch {
        return null;
    }
}

export function primeiroIdioma(acceptLanguage) {
    const valor = String(acceptLanguage || '').split(',')[0].trim();
    return /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(valor) ? valor.slice(0, 35) : null;
}

export function dataUtc(date = new Date()) {
    return date.toISOString().slice(0, 10);
}

function hashFnv1a(texto) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < texto.length; i++) {
        hash ^= texto.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash >>> 0;
}

export function amostrar(requestId, date = new Date(), taxa = DEFAULT_SAMPLE_RATE) {
    const rate = lerTaxaAmostragem(taxa);
    const bucket = hashFnv1a(`${dataUtc(date)}:${requestId}`) % 10000;
    return bucket < Math.round(rate * 10000);
}

export function montarCookieConsentimento(analytics, ads) {
    return `${EDGE_CONSENT_COOKIE}=v=${CONSENT_VERSION}&analytics=${analytics ? '1' : '0'}&ads=${ads ? '1' : '0'}; Secure; SameSite=Lax; Path=/; Max-Age=15552000`;
}
