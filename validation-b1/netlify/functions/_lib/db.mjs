import pg from 'pg';

const { Pool } = pg;
let sharedPool = null;

export function createPool(connectionString, max = 1) {
    if (!connectionString) throw new Error('DATABASE_URL ausente.');
    return new Pool({
        connectionString,
        max,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 5_000,
        allowExitOnIdle: true
    });
}

export function getSharedPool(env = process.env) {
    if (!sharedPool) {
        sharedPool = createPool(env.DATABASE_URL, Number.parseInt(env.DB_POOL_MAX || '1', 10) || 1);
    }
    return sharedPool;
}

export async function withTransaction(pool, fn) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const resultado = await fn(client);
        await client.query('COMMIT');
        return resultado;
    } catch (erro) {
        try {
            await client.query('ROLLBACK');
        } catch {
            // A transação já pode ter sido encerrada pelo banco.
        }
        throw erro;
    } finally {
        client.release();
    }
}

export async function closePool(pool) {
    if (pool) await pool.end();
}

export async function closeSharedPool() {
    if (sharedPool) {
        await sharedPool.end();
        sharedPool = null;
    }
}
