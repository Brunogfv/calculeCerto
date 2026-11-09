import pg from 'pg';

const { Pool } = pg;
const modoProducao = process.argv.includes('--production');
const modoTest = process.argv.includes('--test');

function obterUrl() {
    if (modoTest && modoProducao) throw new Error('Use --test ou --production, não ambos.');

    if (modoProducao) {
        if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL ausente.');
        if (process.env.NODE_ENV === 'test') throw new Error('Limpeza de produção bloqueada em NODE_ENV=test.');
        return process.env.DATABASE_URL;
    }

    if (!process.env.TEST_DATABASE_URL) throw new Error('TEST_DATABASE_URL ausente.');
    if (process.env.NODE_ENV === 'production') throw new Error('Limpeza de teste bloqueada em NODE_ENV=production.');
    if (process.env.DATABASE_URL && process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
        throw new Error('TEST_DATABASE_URL não pode ser igual a DATABASE_URL.');
    }

    const nomeBanco = new URL(process.env.TEST_DATABASE_URL).pathname.replace(/^\//, '');
    if (!/test/i.test(nomeBanco)) throw new Error('O banco de teste precisa ter "test" no nome.');

    return process.env.TEST_DATABASE_URL;
}

async function limpar() {
    const pool = new Pool({ connectionString: obterUrl(), max: 1 });
    const retencaoHoras = Number.parseInt(process.env.RATE_LIMIT_RETENTION_HOURS || '24', 10) || 24;

    try {
        const resultado = await pool.query(
            `DELETE FROM rate_limits
             WHERE window_start < now() - ($1 * interval '1 hour')`,
            [retencaoHoras]
        );
        console.log(`Rate limits removidos: ${resultado.rowCount || 0} (retenção: ${retencaoHoras}h).`);
    } finally {
        await pool.end();
    }
}

limpar().catch((erro) => {
    console.error('Falha na limpeza:', erro.message);
    process.exitCode = 1;
});
