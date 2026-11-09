import crypto from 'node:crypto';

export function hmacIdentifier(ip, segredo) {
    const valor = String(ip || 'unknown');
    const digest = crypto.createHmac('sha256', segredo).update(valor).digest('hex');
    return `ip:${digest}`;
}

export function windowStart(now, windowSeconds) {
    const ms = windowSeconds * 1000;
    return new Date(Math.floor(now.getTime() / ms) * ms);
}

async function incrementar(pool, chave, inicio, limite) {
    const resultado = await pool.query(
        `INSERT INTO rate_limits (bucket_key, window_start, count)
         VALUES ($1, $2, 1)
         ON CONFLICT (bucket_key, window_start)
         DO UPDATE SET count = rate_limits.count + 1
         RETURNING count`,
        [chave, inicio]
    );

    const count = Number(resultado.rows[0]?.count || 0);
    return { permitido: count <= limite, count };
}

export async function checkRateLimits({ pool, ip, sessionId, visitorId, limits, now, hmacSecret }) {
    if (!hmacSecret) throw new Error('RATE_LIMIT_HMAC_SECRET ausente.');

    const buckets = [
        { chave: hmacIdentifier(ip, hmacSecret), ...limits.ip },
        { chave: `session:${sessionId}`, ...limits.session },
        { chave: `visitor:${visitorId}`, ...limits.visitor }
    ];

    for (const bucket of buckets) {
        const inicio = windowStart(now, bucket.windowSeconds);
        const resultado = await incrementar(pool, bucket.chave, inicio, bucket.max);
        if (!resultado.permitido) {
            return {
                permitido: false,
                bucket: bucket.chave.startsWith('ip:') ? 'ip' : bucket.chave.split(':')[0],
                retryAfterSeconds: bucket.windowSeconds
            };
        }
    }

    return { permitido: true };
}

export async function cleanupOldRateLimits(pool, retentionHours = 24) {
    const resultado = await pool.query(
        `DELETE FROM rate_limits
         WHERE window_start < now() - ($1 * interval '1 hour')`,
        [retentionHours]
    );
    return resultado.rowCount || 0;
}
