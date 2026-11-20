import path from 'node:path';
import { pathToFileURL } from 'node:url';
import pg from 'pg';

const { Client } = pg;

export const TEST_DATABASE_NAME = 'validation_b1_test';
export const RUNTIME_ROLE = 'analytics_runtime';
export const CLEANUP_ROLE = 'analytics_cleanup';
export const VALIDATION_CLEANUP_ROLE = 'validation_b1_cleanup';
export const RUNTIME_PASSWORD = 'runtime-test-password';
export const CLEANUP_PASSWORD = 'cleanup-test-password';

export function validarConfiguracaoTeste(url = process.env.TEST_DATABASE_URL, env = process.env) {
    if (!url) throw new Error('TEST_DATABASE_URL ausente.');
    if (env.NODE_ENV === 'production') throw new Error('Teste bloqueado em NODE_ENV=production.');
    if (env.ANALYTICS_TEST_DB !== '1') throw new Error('ANALYTICS_TEST_DB deve ser 1.');
    if (env.DATABASE_URL && url === env.DATABASE_URL) {
        throw new Error('TEST_DATABASE_URL não pode ser igual a DATABASE_URL.');
    }

    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        throw new Error('TEST_DATABASE_URL inválida.');
    }
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
        throw new Error('TEST_DATABASE_URL deve usar PostgreSQL.');
    }
    if (parsed.pathname.replace(/^\//, '') !== TEST_DATABASE_NAME) {
        throw new Error(`Banco de teste não autorizado; use ${TEST_DATABASE_NAME}.`);
    }
    return url;
}

export async function prepararRolesTeste(url = process.env.TEST_DATABASE_URL) {
    const connectionString = validarConfiguracaoTeste(url);
    const client = new Client({ connectionString });
    await client.connect();
    try {
        const roles = [
            {
                name: RUNTIME_ROLE,
                sql: `CREATE ROLE ${RUNTIME_ROLE} LOGIN PASSWORD '${RUNTIME_PASSWORD}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`
            },
            {
                name: CLEANUP_ROLE,
                sql: `CREATE ROLE ${CLEANUP_ROLE} LOGIN PASSWORD '${CLEANUP_PASSWORD}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`
            },
            {
                name: VALIDATION_CLEANUP_ROLE,
                sql: `CREATE ROLE ${VALIDATION_CLEANUP_ROLE} LOGIN PASSWORD '${CLEANUP_PASSWORD}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT`
            }
        ];

        for (const role of roles) {
            const existe = await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [role.name]);
            if (existe.rowCount === 0) await client.query(role.sql);
        }
    } finally {
        await client.end();
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    prepararRolesTeste()
        .then(() => console.log('Roles de teste preparadas.'))
        .catch((erro) => {
            console.error(`Preparação de roles bloqueada: ${erro.message}`);
            process.exitCode = 1;
        });
}
