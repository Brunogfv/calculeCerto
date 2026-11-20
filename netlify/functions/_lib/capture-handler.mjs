import crypto from 'node:crypto';
import { withTransaction } from './db.mjs';
import { emptyResponse, jsonResponse } from './http.mjs';
import { parseCapturePayload, timestampValido } from './capture-validation.mjs';
import { readCaptureConfig } from './capture-config.mjs';
import { montarMensagemAssinada } from '../../edge-functions/_lib/capture-signature.mjs';

function hmacHex(segredo, texto) {
    return crypto.createHmac('sha256', segredo).update(texto).digest('hex');
}

function assinaturaCorreta(assinatura, esperada) {
    if (!/^[0-9a-f]{64}$/i.test(String(assinatura || ''))) return false;
    const recebida = Buffer.from(assinatura, 'hex');
    const calculada = Buffer.from(esperada, 'hex');
    return recebida.length === calculada.length && crypto.timingSafeEqual(recebida, calculada);
}

function inicioJanela(data, segundos) {
    const ms = segundos * 1000;
    return new Date(Math.floor(data.getTime() / ms) * ms);
}

async function consumirRate(client, chave, now, config) {
    const inicio = inicioJanela(now, config.rate.windowSeconds);
    const resultado = await client.query(
        `INSERT INTO edge_rate_limits (bucket_key, window_start, count)
         VALUES ($1, $2, 1)
         ON CONFLICT (bucket_key, window_start)
         DO UPDATE SET count = edge_rate_limits.count + 1
         RETURNING count`,
        [chave, inicio]
    );
    const count = Number(resultado.rows[0]?.count || 0);
    return { permitido: count <= config.rate.max, count };
}

async function consumirContadorDiario(client, dia, purpose, max) {
    const resultado = await client.query(
        `INSERT INTO edge_daily_counters (day, purpose, count)
         VALUES ($1, $2, 1)
         ON CONFLICT (day, purpose)
         DO UPDATE SET count = edge_daily_counters.count + 1
         WHERE edge_daily_counters.count < $3
         RETURNING count`,
        [dia, purpose, max]
    );
    return resultado.rowCount > 0;
}

async function lerCorpo(request, maxBodyBytes) {
    const tipo = String(request.headers.get('content-type') || '').toLowerCase();
    if (!tipo.startsWith('application/json')) return { ok: false, status: 415, motivo: 'content_type' };

    const tamanhoDeclarado = Number.parseInt(request.headers.get('content-length') || '0', 10);
    if (Number.isFinite(tamanhoDeclarado) && tamanhoDeclarado > maxBodyBytes) {
        return { ok: false, status: 413, motivo: 'payload_too_large' };
    }

    let texto;
    try {
        texto = await request.text();
    } catch {
        return { ok: false, status: 400, motivo: 'invalid_body' };
    }

    if (Buffer.byteLength(texto, 'utf8') > maxBodyBytes) {
        return { ok: false, status: 413, motivo: 'payload_too_large' };
    }

    return { ok: true, texto };
}

function diaUtc(data) {
    return data.toISOString().slice(0, 10);
}

function mesUtc(data) {
    return `${data.toISOString().slice(0, 7)}-01`;
}

export function createCaptureHandler({ getPool, env = process.env, now = () => new Date() }) {
    const config = readCaptureConfig(env);

    return async function handler(request) {
        if (!config.enabled || !config.analytics) {
            return emptyResponse(204, { 'X-Analytics-Status': 'disabled' });
        }

        if (!config.ingestSecret || Buffer.byteLength(config.ingestSecret, 'utf8') < 32) {
            return jsonResponse(503, { error: 'capture_not_configured' });
        }

        if (request.method !== 'POST') {
            return jsonResponse(405, { error: 'method_not_allowed' }, { Allow: 'POST' });
        }

        const recebidoEm = now();
        const timestamp = request.headers.get('x-pca-edge-timestamp');
        const nonce = request.headers.get('x-pca-edge-nonce');
        const keyId = request.headers.get('x-pca-edge-key-id');
        const assinatura = request.headers.get('x-pca-edge-signature');

        if (keyId !== config.keyId || !nonce) {
            return jsonResponse(401, { error: 'invalid_edge_credentials' });
        }

        if (!timestampValido(timestamp, recebidoEm.getTime(), config.timestampWindowSeconds)) {
            return jsonResponse(401, { error: 'invalid_timestamp' });
        }

        const corpo = await lerCorpo(request, config.maxBodyBytes);
        if (!corpo.ok) {
            return jsonResponse(corpo.status, { error: corpo.motivo });
        }

        const mensagem = montarMensagemAssinada({
            keyId,
            timestamp,
            nonce,
            corpo: corpo.texto
        });
        const esperada = hmacHex(config.ingestSecret, mensagem);
        if (!assinaturaCorreta(assinatura, esperada)) {
            return jsonResponse(401, { error: 'invalid_signature' });
        }

        let bruto;
        try {
            bruto = JSON.parse(corpo.texto);
        } catch {
            return jsonResponse(400, { error: 'invalid_json' });
        }

        if (bruto?.purpose === 'security') {
            return emptyResponse(204, { 'X-Analytics-Status': 'security_disabled' });
        }

        const validado = parseCapturePayload(bruto);
        if (!validado.ok) {
            return jsonResponse(400, { error: validado.motivo });
        }

        const payload = validado.value;
        if (payload.nonce !== nonce) {
            return jsonResponse(400, { error: 'nonce_mismatch' });
        }

        const capturadoEm = new Date(payload.captured_at);
        if (Number.isNaN(capturadoEm.getTime())) {
            return jsonResponse(400, { error: 'invalid_captured_at' });
        }

        let pool;
        try {
            pool = getPool();
        } catch {
            return jsonResponse(503, { error: 'capture_unavailable' });
        }

        try {
            await withTransaction(pool, async (client) => {
                await client.query(
                    `INSERT INTO edge_nonces (nonce, expires_at)
                     VALUES ($1, $2)`,
                    [nonce, new Date(recebidoEm.getTime() + config.nonceTtlSeconds * 1000)]
                );

                const rate = await consumirRate(client, payload.rate_key, recebidoEm, config);
                if (!rate.permitido) {
                    const erro = new Error('rate_limited');
                    erro.code = 'rate_limited';
                    throw erro;
                }

                const dentroDoLimite = await consumirContadorDiario(client, diaUtc(recebidoEm), payload.purpose, config.maxEventsDay);
                if (!dentroDoLimite) {
                    const erro = new Error('daily_cap');
                    erro.code = 'daily_cap';
                    throw erro;
                }

                await client.query(
                    `INSERT INTO html_events (
                        request_id, captured_at, received_at, purpose, method, path, status_code,
                        country_code, accept_language, referrer_host, ua_family, ua_version,
                        client_hints, fetch_metadata, traffic_class, bot_family, confidence, signals,
                        classifier_version, sample_rate, sampling_method, is_estimate
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7,
                        $8, $9, $10, $11, $12,
                        $13::jsonb, $14::jsonb, $15, $16, $17, $18,
                        $19, $20, $21, $22
                    )`,
                    [
                        payload.request_id,
                        capturadoEm,
                        recebidoEm,
                        payload.purpose,
                        payload.method,
                        payload.path,
                        payload.status_code,
                        payload.country_code,
                        payload.accept_language,
                        payload.referrer_host,
                        payload.ua_family,
                        payload.ua_version,
                        JSON.stringify(payload.client_hints),
                        JSON.stringify(payload.fetch_metadata),
                        payload.traffic_class,
                        payload.bot_family,
                        payload.confidence,
                        payload.signals,
                        payload.classifier_version,
                        payload.sample_rate,
                        payload.sampling_method,
                        payload.is_estimate
                    ]
                );

                await client.query(
                    `INSERT INTO html_traffic_daily (
                        day, purpose, path, traffic_class, bot_family, country_code,
                        sample_rate, observed_count
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
                    ON CONFLICT (day, purpose, path, traffic_class, bot_family, country_code, sample_rate)
                    DO UPDATE SET observed_count = html_traffic_daily.observed_count + 1`,
                    [
                        diaUtc(recebidoEm),
                        payload.purpose,
                        payload.path,
                        payload.traffic_class,
                        payload.bot_family || '',
                        payload.country_code || '',
                        payload.sample_rate
                    ]
                );

                await client.query(
                    `INSERT INTO html_indicators_monthly (
                        month, purpose, traffic_class, bot_family, sample_rate, observed_count
                    ) VALUES ($1, $2, $3, $4, $5, 1)
                    ON CONFLICT (month, purpose, traffic_class, bot_family, sample_rate)
                    DO UPDATE SET observed_count = html_indicators_monthly.observed_count + 1`,
                    [
                        mesUtc(recebidoEm),
                        payload.purpose,
                        payload.traffic_class,
                        payload.bot_family || '',
                        payload.sample_rate
                    ]
                );
            });

            return emptyResponse(202, { 'X-Analytics-Status': 'accepted' });
        } catch (erro) {
            if (erro?.code === '23505') {
                return jsonResponse(409, { error: 'replay' });
            }
            if (erro?.code === 'rate_limited') {
                return jsonResponse(429, { error: 'rate_limited' }, { 'Retry-After': String(config.rate.windowSeconds) });
            }
            if (erro?.code === 'daily_cap') {
                return jsonResponse(429, { error: 'daily_cap' }, { 'Retry-After': '3600' });
            }
            return jsonResponse(503, { error: 'capture_unavailable' });
        }
    };
}
