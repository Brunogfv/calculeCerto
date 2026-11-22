import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MIGRATIONS_DIR = path.join(ROOT, 'db', 'migrations');
const PRIVILEGES_SQL = path.join(ROOT, 'database', 'b1', 'b1-privileges.sql');
const COLLECT_PRIVILEGES_SQL = path.join(ROOT, 'database', 'b1', '009-runtime-collect-privileges.sql');
const EXPECTED_DATABASE = 'validation_b1';
const EXPECTED_OWNER = 'neondb_owner';
const PHASE4_MIGRATIONS = [
    '001_init.sql',
    '002_phase2_review.sql',
    '003_phase4_html_capture.sql',
    '004_phase4_audit_fixes.sql',
    '005_phase4_cleanup_role.sql',
    '006_phase2_runtime_grants.sql'
];
const FINAL_MIGRATION = '007_remove_session_user_agent.sql';
const UNSAFE_SQL = /\b(?:CREATE\s+DATABASE|DROP\s+DATABASE|VACUUM|CREATE\s+INDEX\s+CONCURRENTLY|ALTER\s+SYSTEM|COMMIT|ROLLBACK)\b/i;

if (process.env.B1_APPLY_CONFIRM !== 'APPLY_VALIDATION_B1') {
    console.error('Bloqueado: defina B1_APPLY_CONFIRM=APPLY_VALIDATION_B1 para autorizar a aplicação local/remota.');
    process.exit(2);
}

const connectionString = process.env.B1_DATABASE_URL;
if (!connectionString) {
    console.error('B1_DATABASE_URL ausente.');
    process.exit(2);
}

function readMigration(filename) {
    const file = path.join(MIGRATIONS_DIR, filename);
    if (!fs.existsSync(file)) throw new Error(`Migration ausente: ${filename}`);
    const sql = fs.readFileSync(file, 'utf8');
    if (UNSAFE_SQL.test(sql)) {
        throw new Error(`Migration com operação incompatível com transação única: ${filename}`);
    }
    return {
        filename,
        sql,
        checksum: crypto.createHash('sha256').update(sql).digest('hex')
    };
}

function migrationSql() {
    return `CREATE TABLE schema_migrations (
        filename TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
}

async function main() {
    const client = new pg.Client({
        connectionString,
        application_name: 'validation-b1-controlled-migrations'
    });

    await client.connect();
    try {
        await client.query('BEGIN');

        const identity = (await client.query(
            'SELECT current_database() AS database, current_user AS user_name'
        )).rows[0];
        if (identity.database !== EXPECTED_DATABASE || identity.user_name !== EXPECTED_OWNER) {
            throw new Error(
                `Identidade divergente: database=${identity.database}, user=${identity.user_name}`
            );
        }

        const pre = (await client.query(`
            SELECT
                to_regclass('public.schema_migrations') AS schema_migrations,
                (SELECT count(*)::int FROM pg_tables WHERE schemaname = 'public') AS public_tables,
                EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'validation_b1_runtime') AS has_runtime
        `)).rows[0];
        if (pre.schema_migrations !== null || pre.public_tables !== 0) {
            throw new Error('Banco B1 não está vazio ou já possui schema_migrations');
        }
        if (!pre.has_runtime) throw new Error('Role validation_b1_runtime ausente');

        await client.query(migrationSql());

        const phase4Migrations = PHASE4_MIGRATIONS.map(readMigration);
        for (const migration of phase4Migrations) {
            await client.query(migration.sql);
            await client.query(
                'INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)',
                [migration.filename, migration.checksum]
            );
        }

        const privileges = fs.readFileSync(PRIVILEGES_SQL, 'utf8');
        await client.query(privileges);

        const finalMigration = readMigration(FINAL_MIGRATION);
        await client.query(finalMigration.sql);
        await client.query(
            'INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)',
            [finalMigration.filename, finalMigration.checksum]
        );

        const collectPrivileges = fs.readFileSync(COLLECT_PRIVILEGES_SQL, 'utf8');
        await client.query(collectPrivileges);

        const verify = (await client.query(`
            SELECT
                (SELECT count(*)::int FROM schema_migrations) AS migrations,
                (SELECT count(*)::int FROM pg_tables WHERE schemaname = 'public') AS tables,
                has_table_privilege('validation_b1_runtime', 'html_events', 'INSERT') AS runtime_insert_html,
                has_table_privilege('validation_b1_runtime', 'html_events', 'DELETE') AS runtime_delete_html,
                has_table_privilege('validation_b1_runtime', 'visitors', 'SELECT') AS runtime_phase2,
                has_table_privilege('validation_b1_runtime', 'sessions', 'DELETE') AS runtime_delete_sessions,
                has_table_privilege('validation_b1_runtime', 'rate_limits', 'TRUNCATE') AS runtime_truncate_rate_limits,
                EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'sessions'
                      AND column_name = 'user_agent'
                ) AS runtime_user_agent,
                EXISTS (
                    SELECT 1 FROM pg_roles
                    WHERE rolname = 'validation_b1_runtime'
                      AND (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls)
                ) AS runtime_admin
        `)).rows[0];
        if (verify.migrations !== 7 || verify.tables !== 14) {
            throw new Error('Valida��ǜo de contagem falhou');
        }
        if (!verify.runtime_insert_html ||
            verify.runtime_delete_html ||
            !verify.runtime_phase2 ||
            verify.runtime_delete_sessions ||
            verify.runtime_truncate_rate_limits ||
            verify.runtime_user_agent ||
            verify.runtime_admin) {
            throw new Error('Valida��ǜo de privilǸgios da runtime falhou');
        }

        await client.query('COMMIT');
        console.log(JSON.stringify({
            applied: [...phase4Migrations, finalMigration].map((migration) => migration.filename),
            migrations: verify.migrations,
            tables: verify.tables,
            runtimeRole: 'validation_b1_runtime',
            collectPrivileges: true,
            inheritedRolesRevoked: true,
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
    console.error('Aplicação B1 falhou: ' + error.message);
    process.exit(1);
});
