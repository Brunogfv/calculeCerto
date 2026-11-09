const HEADERS_BASE = {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    Vary: 'Origin'
};

export function jsonResponse(status, corpo, extras = {}) {
    return new Response(JSON.stringify(corpo), {
        status,
        headers: {
            ...HEADERS_BASE,
            'Content-Type': 'application/json; charset=utf-8',
            ...extras
        }
    });
}

export function emptyResponse(status, extras = {}) {
    return new Response(null, {
        status,
        headers: {
            ...HEADERS_BASE,
            ...extras
        }
    });
}

export function getHeader(request, nome) {
    return request.headers.get(nome) || '';
}

export function getClientIp(request) {
    const candidatos = [
        request.headers.get('x-nf-client-connection-ip'),
        request.headers.get('x-real-ip'),
        (request.headers.get('x-forwarded-for') || '').split(',')[0]
    ];

    for (const candidato of candidatos) {
        const valor = String(candidato || '').trim();
        if (valor) return valor;
    }

    return null;
}

export function getCountry(request, header = 'x-country') {
    const valor = String(request.headers.get(header) || request.headers.get('cf-ipcountry') || '')
        .trim()
        .toUpperCase();

    return /^[A-Z]{2}$/.test(valor) ? valor : null;
}

export function getUserAgent(request) {
    return String(request.headers.get('user-agent') || '').slice(0, 512);
}

export function referrerHost(referrer) {
    try {
        const url = new URL(referrer);
        return url.hostname.toLowerCase().replace(/^www\./, '') || null;
    } catch {
        return null;
    }
}

export function sanitizeReferrer(referrer) {
    if (!referrer) return null;
    try {
        const url = new URL(referrer);
        if (!/^https?:$/.test(url.protocol)) return null;
        return (url.origin + url.pathname).slice(0, 2048);
    } catch {
        return null;
    }
}

export function originDaRequisicao(request) {
    const origin = request.headers.get('origin');
    if (origin) return origin;

    const referer = request.headers.get('referer');
    if (!referer) return null;

    try {
        return new URL(referer).origin;
    } catch {
        return null;
    }
}

export function origemPermitida(request, allowedOrigins) {
    const origem = originDaRequisicao(request);
    return !!origem && allowedOrigins.includes(origem);
}

export async function lerJson(request, maxBodyBytes) {
    const contentType = (request.headers.get('content-type') || '').toLowerCase();
    if (!contentType.startsWith('application/json')) {
        return { ok: false, status: 415, motivo: 'content_type' };
    }

    const contentLength = Number.parseInt(request.headers.get('content-length') || '0', 10);
    if (Number.isFinite(contentLength) && contentLength > maxBodyBytes) {
        return { ok: false, status: 413, motivo: 'payload_too_large' };
    }

    let texto;
    try {
        texto = await request.text();
    } catch {
        return { ok: false, status: 400, motivo: 'invalid_body' };
    }

    if (new TextEncoder().encode(texto).length > maxBodyBytes) {
        return { ok: false, status: 413, motivo: 'payload_too_large' };
    }

    try {
        return { ok: true, value: JSON.parse(texto) };
    } catch {
        return { ok: false, status: 400, motivo: 'invalid_json' };
    }
}

export function pareceHeadless(userAgent) {
    return /headlesschrome|playwright|puppeteer|lighthouse/i.test(String(userAgent || ''));
}
