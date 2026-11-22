function inteiro(valor, padrao, minimo, maximo) {
    const numero = Number.parseInt(valor ?? '', 10);
    if (!Number.isFinite(numero)) return padrao;
    return Math.min(maximo, Math.max(minimo, numero));
}

export function readConfig(env = process.env) {
    const allowedOrigins = String(env.ALLOWED_ORIGINS || 'https://portaldascontas.com.br,https://www.portaldascontas.com.br')
        .split(',')
        .map((origem) => origem.trim())
        .filter(Boolean);

    return {
        ingestEnabled: env.ANALYTICS_INGEST_ENABLED === 'true',
        hmacSecret: env.RATE_LIMIT_HMAC_SECRET || '',
        allowedOrigins,
        maxBodyBytes: inteiro(env.ANALYTICS_MAX_BODY_BYTES, 16 * 1024, 1024, 64 * 1024),
        dbPoolMax: inteiro(env.DB_POOL_MAX, 1, 1, 10),
        countryHeader: env.ANALYTICS_COUNTRY_HEADER || 'x-country',
        rateLimits: {
            ip: {
                windowSeconds: inteiro(env.RATE_LIMIT_IP_WINDOW_SECONDS, 300, 30, 3600),
                max: inteiro(env.RATE_LIMIT_IP_MAX, 120, 1, 100000)
            },
            visitor: {
                windowSeconds: inteiro(env.RATE_LIMIT_VISITOR_WINDOW_SECONDS, 3600, 60, 86400),
                max: inteiro(env.RATE_LIMIT_VISITOR_MAX, 600, 1, 100000)
            },
            session: {
                windowSeconds: inteiro(env.RATE_LIMIT_SESSION_WINDOW_SECONDS, 60, 10, 3600),
                max: inteiro(env.RATE_LIMIT_SESSION_MAX, 60, 1, 10000)
            }
        }
    };
}
