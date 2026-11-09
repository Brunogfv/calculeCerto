import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATIONS_DIR = path.join(ROOT, 'db', 'migrations');

const modoTest = process.argv.includes('--test');
const modoProducao = process.argv.includes('--production');

function obterUrl() {
    if (modoTest && modoProducao) {
        throw new Error('Use --test ou --production, não ambos.');
    }

    if (modoProducao) {
        if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL ausente.');
        if (process.env.NODE_ENV === 'test') throw new Error('Migração de produção bloqueada em NODE_ENV=test.');
        return process.env.DATABASE_URL;
    }

    if (!process.env.TEST_DATABASE_URL) throw new Error('TEST_DATABASE_URL ausente para migração de teste.');
    if (process.env.NODE_ENV === 'production') throw new Error('Migração de teste bloqueada em NODE_ENV=production.');
    if (process.env.DATABASE_URL && process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
        throw new Error('TEST_DATABASE_URL não pode ser igual a DATABASE_URL.');
    }

    const nomeBanco = new URL(process.env.TEST_DATABASE_URL).pathname.replace(/^\//, '');
    if (!/test/i.test(nomeBanco)) {
        throw new Error('O banco de teste precisa ter "test" no nome (ex.: portal_analytics_test).');
    }

    return process.env.TEST_DATABASE_URL;
}

function listarMigracoes() {
    return fs.readdirSync(MIGRATIONS_DIR)
        .filter((arquivo) => arquivo.endsWith('.sql'))
        .sort()
        .map((arquivo) => ({
            arquivo,
            caminho: path.join(MIGRATIONS_DIR, arquivo),
            sql: fs.readFileSync(path.join(MIGRATIONS_DIR, arquivo), 'utf8')
        }));
}

async function migrate() {
    const url = obterUrl();
    const pool = new Pool({ connectionString: url, max: 1 });
    const client = await pool.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename TEXT PRIMARY KEY,
                checksum TEXT NOT NULL,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `);

        const aplicadas = new Map(
            (await client.query('SELECT filename, checksum FROM schema_migrations')).rows
                .map((linha) => [linha.filename, linha.checksum])
        );

        for (const migracao of listarMigracoes()) {
            const checksum = crypto.createHash('sha256').update(migracao.sql).digest('hex');
            const checksumAnterior = aplicadas.get(migracao.arquivo);

            if (checksumAnterior && checksumAnterior !== checksum) {
                throw new Error(`Migração alterada após ser aplicada: ${migracao.arquivo}`);
            }
            if (checksumAnterior) {
                console.log(`Ignorada (já aplicada): ${migracao.arquivo}`);
                continue;
            }

            await client.query('BEGIN');
            try {
                await client.query(migracao.sql);
                await client.query(
                    'INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)',
                    [migracao.arquivo, checksum]
                );
                await client.query('COMMIT');
                console.log(`Aplicada: ${migracao.arquivo}`);
            } catch (erro) {
                await client.query('ROLLBACK');
                throw erro;
            }
        }

        console.log(`Migrações concluídas no banco de ${modoProducao ? 'produção' : 'teste'}.`);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch((erro) => {
    console.error('Falha na migração:', erro.message);
    process.exitCode = 1;
});
