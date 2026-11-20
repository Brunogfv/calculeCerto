import pg from 'pg';
import { limparRetencao } from '../netlify/functions/_lib/cleanup-retention.mjs';

const { Pool } = pg;

if (process.env.CLEANUP_CONFIRM !== 'APPLY_RETENTION_B1') {
    console.error('Bloqueado: defina CLEANUP_CONFIRM=APPLY_RETENTION_B1 para invocação manual autorizada.');
    process.exit(2);
}

const connectionString = process.env.CLEANUP_DATABASE_URL;
if (!connectionString) {
    console.error('CLEANUP_DATABASE_URL ausente; não usar DATABASE_URL como fallback.');
    process.exit(2);
}

const expectedDatabase = process.env.CLEANUP_EXPECTED_DATABASE || 'validation_b1';
const expectedRole = process.env.CLEANUP_EXPECTED_ROLE || 'validation_b1_cleanup';
const pool = new Pool({ connectionString, max: 1 });

try {
    const resultado = await limparRetencao(pool, { expectedDatabase, expectedRole });
    console.log(JSON.stringify({
        status: resultado.status,
        reason: resultado.reason,
        budgetExhausted: resultado.budgetExhausted,
        tables: resultado.tables,
        truncated: resultado.truncated,
        timeBudgetMs: resultado.timeBudgetMs,
        batchTimeoutMs: resultado.batchTimeoutMs,
        durationMs: resultado.durationMs,
        secretsPrinted: false
    }));
} catch (erro) {
    console.error(`cleanup-retention status=error code=${erro?.code || 'cleanup_failed'}`);
    process.exitCode = 1;
} finally {
    await pool.end();
}
