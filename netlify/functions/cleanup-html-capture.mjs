import { createPool, closePool } from './_lib/db.mjs';
import { limparHtmlCapture } from './_lib/cleanup-html-capture.mjs';

export const config = {
    schedule: '15 3 * * *'
};

export async function runScheduledCleanup({ getPool, env = process.env } = {}) {
    if (env.HTML_CAPTURE_CLEANUP_ENABLED !== 'true') {
        return { enabled: false, status: 'disabled' };
    }
    if (!getPool && !env.CLEANUP_DATABASE_URL) {
        return { enabled: false, status: 'missing_cleanup_url' };
    }

    let pool = null;
    try {
        pool = getPool ? getPool() : createPool(env.CLEANUP_DATABASE_URL, 1);
        const resultado = await limparHtmlCapture(pool, {
            expectedDatabase: env.CLEANUP_EXPECTED_DATABASE ?? 'validation_b1',
            expectedRole: env.CLEANUP_EXPECTED_ROLE ?? 'validation_b1_cleanup',
            timeBudgetMs: env.RETENTION_TIME_BUDGET_MS,
            shutdownReserveMs: env.RETENTION_SHUTDOWN_RESERVE_MS,
            batchTimeoutMs: env.RETENTION_BATCH_TIMEOUT_MS,
            batchSize: env.RETENTION_BATCH_SIZE,
            maxBatches: env.RETENTION_MAX_BATCHES
        });
        const status = resultado.status ?? 'ok';
        console.log(`html-capture-cleanup status=${status} ${JSON.stringify(resultado)}`);
        return { enabled: true, status, resultado };
    } catch (erro) {
        console.error(`html-capture-cleanup status=error code=${erro?.code || 'cleanup_failed'}`);
        throw erro;
    } finally {
        if (pool && !getPool) {
            try {
                await closePool(pool);
            } catch {}
        }
    }
}

export default async function cleanupHtmlCapture() {
    try {
        const resultado = await runScheduledCleanup();
        return new Response(resultado.enabled ? 'OK' : 'DISABLED', { status: resultado.enabled ? 200 : 204 });
    } catch {
        return new Response('ERROR', { status: 500 });
    }
}
