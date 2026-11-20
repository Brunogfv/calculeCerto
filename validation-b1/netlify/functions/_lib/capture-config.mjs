import { CAPTURE_MAX_BODY_BYTES } from '../../edge-functions/_lib/capture-limits.mjs';

function inteiro(valor, padrao, minimo, maximo) {
    const numero = Number.parseInt(valor ?? '', 10);
    if (!Number.isFinite(numero)) return padrao;
    return Math.min(maximo, Math.max(minimo, numero));
}

export function readCaptureConfig(env = process.env) {
    return {
        enabled: env.EDGE_CAPTURE_ENABLED === 'true',
        analytics: env.EDGE_ANALYTICS_ENABLED === 'true',
        ingestSecret: env.EDGE_INGEST_SECRET || '',
        keyId: env.EDGE_INGEST_KEY_ID || 'v1',
        maxBodyBytes: CAPTURE_MAX_BODY_BYTES,
        maxEventsDay: inteiro(env.EDGE_CAPTURE_MAX_EVENTS_DAY, 25000, 1, 1000000),
        timestampWindowSeconds: inteiro(env.EDGE_CAPTURE_TIMESTAMP_WINDOW_SECONDS, 60, 10, 300),
        nonceTtlSeconds: inteiro(env.EDGE_CAPTURE_NONCE_TTL_SECONDS, 600, 60, 86400),
        rate: {
            windowSeconds: inteiro(env.EDGE_RATE_WINDOW_SECONDS, 300, 30, 3600),
            max: inteiro(env.EDGE_RATE_MAX, 120, 1, 100000)
        }
    };
}
