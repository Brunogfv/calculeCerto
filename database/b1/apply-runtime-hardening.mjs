import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MIGRATION_007 = path.join(ROOT, 'db', 'migrations', '007_remove_session_user_agent.sql');
const PRIVILEGES_009 = path.join(ROOT, 'database', 'b1', '009-runtime-collect-privileges.sql');
const CONFIRMATION = 'APPLY_VALIDATION_B1_RUNTIME';

if (process.env.B1_HARDENING_CONFIRM !== CONFIRMATION) {
    console.error(`Bloqueado: defina B1_HARDENING_CONFIRM=${CONFIRMATION} para autorizar explicitamente.`);
    process.exit(2);
}

const connectionString = process.env.B1_ADMIN_DATABASE_URL;
if (!connectionString) {
    console.error('B1_ADMIN_DATABASE_URL ausente.');
    process.exit(2);
}

function readSql(file) {
    const sql = fs.readFileSync(file, 'utf8');
    return { sql, checksum: crypto.createHash('sha256').update(sql).digest('hex') };
}

async function main() {
    const migration = readSql(MIGRATION_007);
    const privileges = readSql(PRIVILEGES_009);
    const client = new Client({
        connectionString,
        application_name: 'validation-b1-runtime-hardening'
    });

    await client.connect();
    try {
        await client.query('BEGIN');

        const identity = (await client.query(
            'SELECT current_database() AS database, current_user AS executor'
        )).rows[0];
        if (identity.database !== 'validation_b1' || identity.executor !== 'neondb_owner') {
            throw new Error('Identidade divergente: alvo deve ser validation_b1 como neondb_owner.');
        }

        const pre = (await client.query(`
            SELECT
                to_regclass('public.schema_migrations') AS schema_migrations,
                (SELECT count(*)::int FROM schema_migrations) AS migration_count,
                (SELECT count(*)::int FROM pg_tables WHERE schemaname = 'public') AS table_count,
                EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'sessions'
                      AND column_name = 'user_agent'
                ) AS has_user_agent,
                EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'validation_b1_runtime') AS has_runtime,
                has_table_privilege('validation_b1_runtime', 'visitors', 'SELECT') AS runtime_phase2
        `)).rows[0];

        if (pre.schema_migrations === null || pre.migration_count !== 6) {
            throw new Error(`Preflight: migrations esperadas=6, encontradas=${pre.migration_count}.`);
        }
        if (pre.table_count !== 14) {
            throw new Error(`Preflight: tabelas esperadas=14, encontradas=${pre.table_count}.`);
        }
        if (!pre.has_user_agent) {
            throw new Error('Preflight: sessions.user_agent ausente; migration 007 ja aplicada ou alvo divergente.');
        }
        if (!pre.has_runtime) {
            throw new Error('Preflight: role validation_b1_runtime ausente.');
        }
        if (pre.runtime_phase2) {
            throw new Error('Preflight: runtime ja possui SELECT em visitors; 009 pode estar aplicado.');
        }

        const role = (await client.query(`
            SELECT rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls
            FROM pg_roles
            WHERE rolname = 'validation_b1_runtime'
        `)).rows[0];
        if (!role || role.rolsuper || role.rolcreatedb || role.rolcreaterole ||
            role.rolreplication || role.rolbypassrls) {
            throw new Error('Preflight: role runtime ausente ou com atributo administrativo.');
        }
        if ((await client.query(`
            SELECT 1
            FROM pg_auth_members m
            JOIN pg_roles u ON u.oid = m.member
            WHERE u.rolname = 'validation_b1_runtime'
        `)).rowCount > 0) {
            throw new Error('Preflight: runtime possui membership.');
        }

        await client.query(migration.sql);
        await client.query(
            'INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)',
            ['007_remove_session_user_agent.sql', migration.checksum]
        );
        await client.query(privileges.sql);

        const post = (await client.query(`
            SELECT
                (SELECT count(*)::int FROM schema_migrations) AS migration_count,
                (SELECT count(*)::int FROM pg_tables WHERE schemaname = 'public') AS table_count,
                EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'sessions'
                      AND column_name = 'user_agent'
                ) AS has_user_agent,
                has_table_privilege('validation_b1_runtime', 'visitors', 'SELECT') AS runtime_select_visitors,
                has_table_privilege('validation_b1_runtime', 'sessions', 'INSERT') AS runtime_insert_sessions,
                has_table_privilege('validation_b1_runtime', 'rate_limits', 'UPDATE') AS runtime_update_rate_limits,
                has_table_privilege('validation_b1_runtime', 'sessions', 'DELETE') AS runtime_delete_sessions,
                has_table_privilege('validation_b1_runtime', 'rate_limits', 'TRUNCATE') AS runtime_truncate_rate_limits,
                has_column_privilege('validation_b1_runtime', 'pageviews', 'event_id', 'SELECT') AS runtime_pageviews_event_id,
                has_table_privilege('validation_b1_runtime', 'schema_migrations', 'SELECT') AS runtime_schema_migrations,
                has_schema_privilege('validation_b1_runtime', 'public', 'CREATE') AS runtime_schema_create
        `)).rows[0];

        if (post.migration_count !== 7 || post.table_count !== 14 || post.has_user_agent) {
            throw new Error('Postflight: contagem ou coluna user_agent divergente.');
        }
        if (!post.runtime_select_visitors || !post.runtime_insert_sessions ||
            !post.runtime_update_rate_limits || !post.runtime_pageviews_event_id) {
            throw new Error('Postflight: privilegios minimos ausentes.');
        }
        if (post.runtime_delete_sessions || post.runtime_truncate_rate_limits ||
            post.runtime_schema_migrations || post.runtime_schema_create) {
            throw new Error('Postflight: privilegio proibido presente.');
        }

        await client.query('COMMIT');
        console.log(JSON.stringify({
            applied: ['007_remove_session_user_agent.sql', '009-runtime-collect-privileges.sql'],
            migrations: post.migration_count,
            tables: post.table_count,
            userAgentPresent: false,
            runtimeCollectPrivileges: true,
            committed: true,
            secretsPrinted: false
        }));
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch {}
        throw error;
    } finally {
        await client.end();
    }
}

main().catch((error) => {
    console.error('Runtime hardening B1 falhou: ' + error.message);
    process.exit(1);
});
