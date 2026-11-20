import pg from 'pg';
import { pathToFileURL } from 'node:url';
import { limparHtmlCapture } from '../netlify/functions/_lib/cleanup-html-capture.mjs';

const { Pool } = pg;
export { limparHtmlCapture };

function obterUrl() {
    const modoProducao = process.argv.includes('--production');
    const modoTest = process.argv.includes('--test');
    if (modoProducao && modoTest) throw new Error('Use --test ou --production, não ambos.');

    if (modoProducao) {
        const url = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
        if (!url) throw new Error('MIGRATION_DATABASE_URL ou DATABASE_URL ausente.');
        if (process.env.NODE_ENV === 'test') throw new Error('Limpeza de produção bloqueada em NODE_ENV=test.');
        return url;
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

async function main() {
    const pool = new Pool({ connectionString: obterUrl(), max: 1 });
    try {
        const resultados = await limparHtmlCapture(pool);
        console.log(`HTML capture limpo: ${JSON.stringify(resultados)}`);
    } finally {
        await pool.end();
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch((erro) => {
        console.error('Falha na limpeza:', erro.message);
        process.exitCode = 1;
    });
}
