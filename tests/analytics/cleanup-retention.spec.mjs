import test from 'node:test';
import assert from 'node:assert/strict';
import { limparRetencao, RETENTION_LOCK_KEY } from '../../netlify/functions/_lib/cleanup-retention.mjs';

const TABELAS_ESPERADAS = new Set([
    'affiliate_clicks', 'events', 'pageviews', 'sessions', 'visitors',
    'ingest_events', 'rate_limits', 'html_events', 'html_traffic_daily',
    'html_indicators_monthly', 'edge_daily_counters', 'edge_nonces', 'edge_rate_limits'
]);

function fakePool({
    locked = true,
    counts = {},
    failOn = null,
    clock = null,
    advancePerBatchMs = 0,
    advanceOnIdentityMs = 0
} = {}) {
    const queries = [];
    let releases = 0;
    const avancar = (ms) => {
        if (clock && ms) clock.t += ms;
    };
    const client = {
        async query(sql, params = []) {
            queries.push({ sql, params });
            if (sql.includes('current_database() AS database')) {
                avancar(advanceOnIdentityMs);
                return { rows: [{
                    database: 'validation_b1', role_name: 'validation_b1_cleanup',
                    rolsuper: false, rolcreatedb: false, rolcreaterole: false,
                    rolreplication: false, rolbypassrls: false, rolinherit: false,
                    memberships: 0, invalid_granted_memberships: 0,
                    schema_usage: true, schema_create: false, database_create: false,
                    migrations_select: false
                }] };
            }
            if (sql.includes('unnest($1::text[])')) return { rows: params[0].map((nome) => ({
                nome, select_ok: true, delete_ok: true, insert_ok: false,
                update_ok: false, truncate_ok: false
            })) };
            if (sql.includes('pg_try_advisory_lock')) return { rows: [{ locked }] };
            if (sql.includes('pg_advisory_unlock')) return { rows: [{ pg_advisory_unlock: true }] };
            if (/^(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/.test(sql)) return { rows: [], rowCount: 0 };
            const match = sql.match(/DELETE FROM ([a-z_]+)/);
            const table = match?.[1];
            if (failOn === table) throw new Error('falha simulada');
            const restante = counts[table] ?? 0;
            const rowCount = Math.min(restante, Number(params[1] || 1));
            counts[table] = restante - rowCount;
            avancar(advancePerBatchMs);
            return { rows: [], rowCount };
        },
        release() { releases += 1; }
    };
    return {
        queries,
        get releases() { return releases; },
        async connect() { return client; }
    };
}

test('rejeita retenção inválida antes de abrir conexão', async () => {
    const pool = { connect: () => { throw new Error('não deveria conectar'); } };
    await assert.rejects(() => limparRetencao(pool, { rawDays: 0 }), /Reten/);
    await assert.rejects(() => limparRetencao(pool, { batchSize: 0 }), /Reten/);
    await assert.rejects(() => limparRetencao(pool, { aggregateDays: 1.5 }), /Reten/);
});

test('não executa DELETE quando advisory lock está ocupado', async () => {
    const pool = fakePool({ locked: false });
    const result = await limparRetencao(pool, {});
    assert.equal(result.locked, false);
    assert.equal(pool.queries.some((item) => /DELETE FROM/.test(item.sql)), false);
    assert.equal(pool.queries.some((item) => /pg_advisory_unlock/.test(item.sql)), false);
});

test('executa batching, ordem e unlock sem tocar tabelas fora da allowlist', async () => {
    const counts = { html_events: 2, affiliate_clicks: 1 };
    const pool = fakePool({ counts });
    const result = await limparRetencao(pool, { batchSize: 1, maxBatches: 10 });

    assert.equal(result.locked, true);
    assert.equal(result.tables.affiliate_clicks.removidos, 1);
    assert.equal(result.tables.html_events.removidos, 2);
    assert.equal(result.tables.html_events.lotes, 3);
    assert.equal(result.truncated, false);
    assert.equal(pool.queries.some((item) => item.params[0] === RETENTION_LOCK_KEY), true);
    assert.equal(pool.queries.some((item) => /pg_advisory_unlock/.test(item.sql)), true);

    const tabelas = new Set(
        pool.queries
            .map((item) => item.sql.match(/DELETE FROM ([a-z_]+)/)?.[1])
            .filter(Boolean)
    );
    for (const tabela of tabelas) assert.equal(TABELAS_ESPERADAS.has(tabela), true, tabela);
    for (const tabela of TABELAS_ESPERADAS) assert.equal(tabelas.has(tabela), true, tabela);
});

test('falha de lote faz ROLLBACK e propaga erro', async () => {
    const pool = fakePool({ failOn: 'events' });
    await assert.rejects(() => limparRetencao(pool, {}), /falha simulada/);
    assert.equal(pool.queries.some((item) => /^ROLLBACK/.test(item.sql)), true);
    assert.equal(pool.queries.some((item) => /pg_advisory_unlock/.test(item.sql)), true);
});

test('resultado não contém dados pessoais ou SQL', async () => {
    const result = await limparRetencao(fakePool({}), {});
    const serializado = JSON.stringify(result);
    assert.equal(serializado.includes('203.0.113'), false);
    assert.equal(serializado.includes('Mozilla/5.0'), false);
    assert.equal(serializado.includes('DELETE FROM'), false);
    assert.equal(serializado.includes('password'), false);
});


test('rejeita banco ou role esperados divergentes antes de deletar', async () => {
    const poolBanco = fakePool({});
    await assert.rejects(
        () => limparRetencao(poolBanco, { expectedDatabase: 'outro_banco' }),
        /banco inesperado/
    );
    assert.equal(poolBanco.queries.some((item) => /DELETE FROM/.test(item.sql)), false);

    const poolRole = fakePool({});
    await assert.rejects(
        () => limparRetencao(poolRole, { expectedRole: 'outra_role' }),
        /role inesperada/
    );
    assert.equal(poolRole.queries.some((item) => /DELETE FROM/.test(item.sql)), false);
});




test('rejeita orcamento invalido antes de abrir conexao', async () => {
    const pool = { connect: () => { throw new Error('nao deveria conectar'); } };
    await assert.rejects(
        () => limparRetencao(pool, {
            timeBudgetMs: 1_000,
            shutdownReserveMs: 900,
            batchTimeoutMs: 500
        }),
        /Orcamento/
    );
    await assert.rejects(
        () => limparRetencao(pool, {
            timeBudgetMs: 1_000,
            shutdownReserveMs: 100,
            batchTimeoutMs: 800
        }),
        /Orcamento/
    );
});

test('orcamento interrompe entre lotes, libera lock e fecha client', async () => {
    const clock = { t: 0 };
    const counts = { affiliate_clicks: 5, html_events: 5 };
    const pool = fakePool({ counts, clock, advancePerBatchMs: 1_000 });
    const result = await limparRetencao(pool, {
        timeBudgetMs: 1_000,
        shutdownReserveMs: 100,
        batchTimeoutMs: 500,
        batchSize: 1,
        maxBatches: 10,
        now: () => clock.t
    });

    assert.equal(result.status, 'budget_exhausted');
    assert.equal(result.reason, 'time_budget');
    assert.equal(result.budgetExhausted, true);
    assert.equal(result.tables.affiliate_clicks.removidos, 1);
    assert.equal(result.tables.affiliate_clicks.reason, 'time_budget');
    assert.equal(result.tables.html_events.skipped, true);
    assert.equal(result.truncated, true);
    assert.equal(pool.queries.some((item) => /pg_advisory_unlock/.test(item.sql)), true);
    assert.equal(pool.releases, 1);
});

test('nao inicia lote quando a margem restante e insuficiente', async () => {
    const clock = { t: 0 };
    const pool = fakePool({ clock, advanceOnIdentityMs: 900 });
    const result = await limparRetencao(pool, {
        timeBudgetMs: 1_000,
        shutdownReserveMs: 100,
        batchTimeoutMs: 200,
        now: () => clock.t
    });

    assert.equal(result.status, 'budget_exhausted');
    assert.equal(result.budgetExhausted, true);
    assert.equal(pool.queries.some((item) => /DELETE FROM/.test(item.sql)), false);
    assert.equal(pool.queries.some((item) => /pg_advisory_unlock/.test(item.sql)), false);
    assert.equal(pool.releases, 1);
});

test('retoma em execucao posterior sem duplicar nem perder registros', async () => {
    const counts = { affiliate_clicks: 2 };
    const clock1 = { t: 0 };
    const pool1 = fakePool({ counts, clock: clock1, advancePerBatchMs: 1_000 });
    const first = await limparRetencao(pool1, {
        timeBudgetMs: 1_000,
        shutdownReserveMs: 100,
        batchTimeoutMs: 500,
        batchSize: 1,
        maxBatches: 10,
        now: () => clock1.t
    });
    assert.equal(first.status, 'budget_exhausted');
    assert.equal(counts.affiliate_clicks, 1);

    const clock2 = { t: 0 };
    const pool2 = fakePool({ counts, clock: clock2 });
    const second = await limparRetencao(pool2, {
        timeBudgetMs: 1_000,
        shutdownReserveMs: 100,
        batchTimeoutMs: 500,
        batchSize: 1,
        maxBatches: 10,
        now: () => clock2.t
    });
    assert.equal(second.status, 'complete');
    assert.equal(second.tables.affiliate_clicks.removidos, 1);
    assert.equal(counts.affiliate_clicks, 0);
});

test('aplica timeout de lote configuravel em vez de 30s fixo', async () => {
    const pool = fakePool({});
    const result = await limparRetencao(pool, {
        timeBudgetMs: 2_000,
        shutdownReserveMs: 100,
        batchTimeoutMs: 500
    });
    const configs = pool.queries.filter((item) => item.sql.includes('set_config'));
    assert.equal(result.status, 'complete');
    assert.equal(configs.some((item) => item.sql.includes('statement_timeout') && item.params[0] === '500ms'), true);
    assert.equal(configs.some((item) => item.sql.includes('lock_timeout') && item.params[0] === '500ms'), true);
});

test('falha de conexao propaga sem release de client inexistente', async () => {
    await assert.rejects(
        () => limparRetencao({ connect: async () => { throw new Error('conexao falhou'); } }, {}),
        /conexao falhou/
    );
});

test('marca resultado parcial quando maxBatches termina antes da tabela', async () => {
    const counts = { affiliate_clicks: 5 };
    const pool = fakePool({ counts });
    const result = await limparRetencao(pool, { batchSize: 1, maxBatches: 2 });

    assert.equal(result.status, 'partial');
    assert.equal(result.reason, 'max_batches');
    assert.equal(result.budgetExhausted, false);
    assert.equal(result.tables.affiliate_clicks.removidos, 2);
    assert.equal(result.tables.affiliate_clicks.truncado, true);
});
