import { classificar } from './classifier.mjs';
import {
    amostrar,
    bloqueadoPorPrivacidade,
    caminhoPermitido,
    DEFAULT_SAMPLE_RATE,
    lerFlags,
    lerTaxaAmostragem,
    metodoPermitido,
    normalizarHeader,
    parseConsentCookie,
    primeiroIdioma,
    referrerHost,
    respostaEhHtml
} from './capture-policy.mjs';
import {
    DEFAULT_CAPTURE_TIMEOUT_MS,
    excedeLimiteCorpo,
    lerTimeoutCaptura,
    tamanhoBytesUtf8
} from './capture-limits.mjs';
import { montarMensagemAssinada } from './capture-signature.mjs';

const CAPTURE_ENDPOINT = '/api/capture-html';

async function assinarHex(segredo, texto) {
    const chave = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(segredo),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const assinatura = await crypto.subtle.sign('HMAC', chave, new TextEncoder().encode(texto));
    return [...new Uint8Array(assinatura)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hmacIp(segredo, ip) {
    return assinarHex(segredo, `ip:${ip || 'unknown'}`);
}

export async function criarEvento({ request, response, context, env, now = new Date() }) {
    const flags = lerFlags(env);
    if (!flags.enabled || !flags.analytics) return { ok: false, motivo: 'analytics_disabled' };

    const url = new URL(request.url);
    const path = url.pathname;
    if (!metodoPermitido(request.method) || !caminhoPermitido(path) || !respostaEhHtml(response)) {
        return { ok: false, motivo: 'fora_do_escopo' };
    }

    if (bloqueadoPorPrivacidade(request.headers)) {
        return { ok: false, motivo: 'dnt_gpc' };
    }

    const consentimento = parseConsentCookie(request.headers.get('cookie'));
    if (!consentimento.valido || !consentimento.analytics) {
        return { ok: false, motivo: 'sem_consentimento' };
    }

    const taxa = lerTaxaAmostragem(env.EDGE_ANALYTICS_SAMPLE_RATE);
    const requestId = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    if (!amostrar(requestId, now, taxa)) {
        return { ok: false, motivo: 'fora_da_amostra' };
    }

    if (!env.EDGE_INGEST_SECRET || tamanhoBytesUtf8(env.EDGE_INGEST_SECRET) < 32) {
        return { ok: false, motivo: 'sem_segredo' };
    }

    const headers = request.headers;
    const ua = headers.get('user-agent') || '';
    const accept = normalizarHeader(headers.get('accept'), 200);
    const acceptLanguage = primeiroIdioma(headers.get('accept-language'));
    const secChUa = normalizarHeader(headers.get('sec-ch-ua'), 256);
    const classificacao = classificar({
        userAgent: ua,
        accept,
        acceptLanguage: acceptLanguage || '',
        secFetchMode: headers.get('sec-fetch-mode') || '',
        secFetchDest: headers.get('sec-fetch-dest') || '',
        secFetchSite: headers.get('sec-fetch-site') || '',
        secChUa
    });

    const payload = {
        schema_version: 1,
        request_id: requestId,
        nonce,
        captured_at: now.toISOString(),
        purpose: 'analytics',
        method: 'GET',
        path: path.slice(0, 512),
        status_code: response.status,
        country_code: String(context.geo?.country?.code || '').toUpperCase().slice(0, 2) || null,
        accept_language: acceptLanguage,
        referrer_host: referrerHost(headers.get('referer')),
        ua_family: classificacao.ua_family,
        ua_version: classificacao.ua_version,
        client_hints: {
            ua: secChUa || null,
            mobile: normalizarHeader(headers.get('sec-ch-ua-mobile'), 10) || null,
            platform: normalizarHeader(headers.get('sec-ch-ua-platform'), 40) || null
        },
        fetch_metadata: {
            accept: accept || null,
            mode: normalizarHeader(headers.get('sec-fetch-mode'), 20) || null,
            dest: normalizarHeader(headers.get('sec-fetch-dest'), 20) || null,
            site: normalizarHeader(headers.get('sec-fetch-site'), 20) || null
        },
        traffic_class: classificacao.traffic_class,
        bot_family: classificacao.bot_family,
        confidence: classificacao.confidence,
        signals: classificacao.signals,
        classifier_version: classificacao.classifier_version,
        rate_key: await hmacIp(env.EDGE_INGEST_SECRET, context.ip),
        sample_rate: taxa,
        sampling_method: 'request_id_day_v1',
        is_estimate: taxa < 1
    };

    if (excedeLimiteCorpo(JSON.stringify(payload))) {
        return { ok: false, motivo: 'payload_grande' };
    }

    return { ok: true, payload };
}

export async function enviarEvento({
    payload,
    secret,
    keyId = 'v1',
    baseUrl,
    fetchImpl = fetch,
    now = new Date(),
    timeoutMs = DEFAULT_CAPTURE_TIMEOUT_MS
}) {
    const corpo = JSON.stringify(payload);
    if (excedeLimiteCorpo(corpo)) return false;

    const timestamp = Math.floor(now.getTime() / 1000).toString();
    const nonce = payload.nonce;
    const mensagem = montarMensagemAssinada({ keyId, timestamp, nonce, corpo });
    const assinatura = await assinarHex(secret, mensagem);
    const limite = Number(timeoutMs);
    const timeout = Number.isFinite(limite) && limite > 0 ? limite : DEFAULT_CAPTURE_TIMEOUT_MS;

    try {
        const resposta = await fetchImpl(new URL(CAPTURE_ENDPOINT, baseUrl), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-pca-edge-timestamp': timestamp,
                'x-pca-edge-nonce': nonce,
                'x-pca-edge-key-id': keyId,
                'x-pca-edge-signature': assinatura
            },
            body: corpo,
            credentials: 'omit',
            redirect: 'error',
            signal: AbortSignal.timeout(timeout)
        });
        return resposta.status === 202;
    } catch {
        return false;
    }
}

export async function processarCaptura({ request, response, context, env, now = new Date() }) {
    try {
        const evento = await criarEvento({ request, response, context, env, now });
        if (!evento.ok) return { enviar: false, motivo: evento.motivo };
        return { enviar: true, payload: evento.payload };
    } catch {
        return { enviar: false, motivo: 'erro_captura' };
    }
}

export async function executarCaptura({ request, context, env, now = new Date(), sender = enviarEvento }) {
    const downstream = context.next();
    const response = await downstream;
    if (!response) return response;

    const trabalho = processarCaptura({ request, response, context, env, now })
        .then((resultado) => {
            if (!resultado.enviar) return false;
            return sender({
                payload: resultado.payload,
                secret: env.EDGE_INGEST_SECRET,
                keyId: env.EDGE_INGEST_KEY_ID || 'v1',
                baseUrl: request.url,
                now,
                timeoutMs: lerTimeoutCaptura(env.EDGE_CAPTURE_TIMEOUT_MS)
            });
        })
        .catch(() => false);

    try {
        if (typeof context.waitUntil === 'function') context.waitUntil(trabalho);
        else trabalho.catch(() => {});
    } catch {
        trabalho.catch(() => {});
    }

    return response;
}

export { CAPTURE_ENDPOINT, DEFAULT_SAMPLE_RATE };
