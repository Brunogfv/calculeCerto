const RETENTION_LOCK_KEY = 871238;
const DEFAULT_BATCH_SIZE = 1000;
const MAX_BATCH_SIZE = 5000;
const DEFAULT_MAX_BATCHES = 100;
const DEFAULT_TIME_BUDGET_MS = 20_000;
const MAX_TIME_BUDGET_MS = 25_000;
const DEFAULT_BATCH_TIMEOUT_MS = 5_000;
const MAX_BATCH_TIMEOUT_MS = 15_000;
const DEFAULT_SHUTDOWN_RESERVE_MS = 1_000;
const MIN_BATCH_MARGIN_MS = 250;

export const TABELAS_RETENCAO = Object.freeze([
    'visitors', 'sessions', 'pageviews', 'events', 'affiliate_clicks',
    'ingest_events', 'rate_limits', 'html_events', 'html_traffic_daily',
    'html_indicators_monthly', 'edge_daily_counters', 'edge_nonces',
    'edge_rate_limits'
]);

const LIMITS = {
    days: [1, 3650],
    months: [1, 120],
    hours: [1, 8760],
    batch: [1, MAX_BATCH_SIZE],
    batches: [1, 1000],
    timeBudget: [1_000, MAX_TIME_BUDGET_MS],
    batchTimeout: [100, MAX_BATCH_TIMEOUT_MS],
    shutdownReserve: [100, 5_000]
};

function inteiro(nome, valor, [minimo, maximo]) {
    const numero = Number(valor);
    if (!Number.isInteger(numero) || numero < minimo || numero > maximo) {
        throw new Error(`Retenção inválida para ${nome}: ${valor}`);
    }
    return numero;
}

function lerOpcoes(opcoes = {}) {
    const timeBudgetMs = inteiro(
        'timeBudgetMs',
        opcoes.timeBudgetMs ?? process.env.RETENTION_TIME_BUDGET_MS ?? DEFAULT_TIME_BUDGET_MS,
        LIMITS.timeBudget
    );
    const shutdownReserveMs = inteiro(
        'shutdownReserveMs',
        opcoes.shutdownReserveMs ?? process.env.RETENTION_SHUTDOWN_RESERVE_MS ?? DEFAULT_SHUTDOWN_RESERVE_MS,
        LIMITS.shutdownReserve
    );
    const margemNecessaria = shutdownReserveMs + MIN_BATCH_MARGIN_MS;
    if (margemNecessaria >= timeBudgetMs) {
        throw new Error('Orcamento de retencao invalido: margem de encerramento consome o orcamento.');
    }
    const batchTimeoutPadrao = Math.min(
        DEFAULT_BATCH_TIMEOUT_MS,
        timeBudgetMs - margemNecessaria
    );
    const batchTimeoutMs = inteiro(
        'batchTimeoutMs',
        opcoes.batchTimeoutMs ?? process.env.RETENTION_BATCH_TIMEOUT_MS ?? batchTimeoutPadrao,
        LIMITS.batchTimeout
    );
    if (batchTimeoutMs + margemNecessaria > timeBudgetMs) {
        throw new Error('Orcamento de retencao invalido: lote nao cabe no orcamento restante.');
    }

    return {
        rawDays: inteiro('rawDays', opcoes.rawDays ?? process.env.EDGE_CAPTURE_RAW_RETENTION_DAYS ?? 7, LIMITS.days),
        aggregateDays: inteiro('aggregateDays', opcoes.aggregateDays ?? process.env.EDGE_CAPTURE_AGGREGATE_RETENTION_DAYS ?? 90, LIMITS.days),
        indicatorMonths: inteiro('indicatorMonths', opcoes.indicatorMonths ?? process.env.EDGE_CAPTURE_INDICATOR_RETENTION_MONTHS ?? 13, LIMITS.months),
        nonceHours: inteiro('nonceHours', opcoes.nonceHours ?? process.env.EDGE_CAPTURE_NONCE_RETENTION_HOURS ?? 24, LIMITS.hours),
        rateHours: inteiro('rateHours', opcoes.rateHours ?? process.env.EDGE_CAPTURE_RATE_RETENTION_HOURS ?? 24, LIMITS.hours),
        counterDays: inteiro('counterDays', opcoes.counterDays ?? process.env.EDGE_CAPTURE_COUNTER_RETENTION_DAYS ?? 90, LIMITS.days),
        pageviewDays: inteiro('pageviewDays', opcoes.pageviewDays ?? process.env.PHASE2_PAGEVIEW_RETENTION_DAYS ?? 90, LIMITS.days),
        eventDays: inteiro('eventDays', opcoes.eventDays ?? process.env.PHASE2_EVENT_RETENTION_DAYS ?? 90, LIMITS.days),
        affiliateDays: inteiro('affiliateDays', opcoes.affiliateDays ?? process.env.PHASE2_AFFILIATE_RETENTION_DAYS ?? 90, LIMITS.days),
        sessionMonths: inteiro('sessionMonths', opcoes.sessionMonths ?? process.env.PHASE2_SESSION_RETENTION_MONTHS ?? 13, LIMITS.months),
        visitorMonths: inteiro('visitorMonths', opcoes.visitorMonths ?? process.env.PHASE2_VISITOR_RETENTION_MONTHS ?? 13, LIMITS.months),
        ingestEventDays: inteiro('ingestEventDays', opcoes.ingestEventDays ?? process.env.PHASE2_INGEST_RETENTION_DAYS ?? 90, LIMITS.days),
        rateLimitHours: inteiro('rateLimitHours', opcoes.rateLimitHours ?? process.env.PHASE2_RATE_LIMIT_RETENTION_HOURS ?? 24, LIMITS.hours),
        batchSize: inteiro('batchSize', opcoes.batchSize ?? process.env.RETENTION_BATCH_SIZE ?? DEFAULT_BATCH_SIZE, LIMITS.batch),
        maxBatches: inteiro('maxBatches', opcoes.maxBatches ?? process.env.RETENTION_MAX_BATCHES ?? DEFAULT_MAX_BATCHES, LIMITS.batches),
        timeBudgetMs,
        shutdownReserveMs,
        batchTimeoutMs,
        expectedDatabase: String(opcoes.expectedDatabase ?? process.env.CLEANUP_EXPECTED_DATABASE ?? 'validation_b1'),
        expectedRole: String(opcoes.expectedRole ?? process.env.CLEANUP_EXPECTED_ROLE ?? 'validation_b1_cleanup'),
        now: typeof opcoes.now === 'function' ? opcoes.now : Date.now
    };
}

async function validarIdentidadeEPrivilegios(client, config) {
    const identidade = (await client.query(`
        SELECT
            current_database() AS database,
            current_user AS role_name,
            (SELECT rolsuper FROM pg_roles WHERE rolname = current_user) AS rolsuper,
            (SELECT rolcreatedb FROM pg_roles WHERE rolname = current_user) AS rolcreatedb,
            (SELECT rolcreaterole FROM pg_roles WHERE rolname = current_user) AS rolcreaterole,
            (SELECT rolreplication FROM pg_roles WHERE rolname = current_user) AS rolreplication,
            (SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user) AS rolbypassrls,
            (SELECT rolinherit FROM pg_roles WHERE rolname = current_user) AS rolinherit,
            (SELECT count(*)::int FROM pg_auth_members m
                JOIN pg_roles u ON u.oid = m.member WHERE u.rolname = current_user) AS memberships,
            (SELECT count(*)::int FROM pg_auth_members m
                JOIN pg_roles u ON u.oid = m.member
                JOIN pg_roles g ON g.oid = m.roleid
                JOIN pg_roles grantor ON grantor.oid = m.grantor
                WHERE g.rolname = current_user
                  AND NOT (u.rolname = 'neondb_owner' AND grantor.rolname = 'cloud_admin')) AS invalid_granted_memberships,
            has_schema_privilege(current_user, 'public', 'USAGE') AS schema_usage,
            has_schema_privilege(current_user, 'public', 'CREATE') AS schema_create,
            has_database_privilege(current_user, current_database(), 'CREATE') AS database_create,
            CASE WHEN to_regclass('public.schema_migrations') IS NULL THEN false ELSE has_table_privilege(current_user, 'schema_migrations', 'SELECT') END AS migrations_select
    `)).rows[0];

    if (identidade.database !== config.expectedDatabase) {
        throw new Error(`Cleanup no banco inesperado: ${identidade.database}`);
    }
    if (identidade.role_name !== config.expectedRole) {
        throw new Error(`Cleanup com role inesperada: ${identidade.role_name}`);
    }
    if (identidade.rolsuper || identidade.rolcreatedb || identidade.rolcreaterole ||
        identidade.rolreplication || identidade.rolbypassrls || identidade.rolinherit) {
        throw new Error('Cleanup com atributo de role proibido');
    }
    if (identidade.memberships !== 0 || identidade.invalid_granted_memberships !== 0) {
        throw new Error('Cleanup com membership inesperada');
    }
    if (!identidade.schema_usage || identidade.schema_create || identidade.database_create || identidade.migrations_select) {
        throw new Error('Cleanup com privilégio de schema/database/migration inesperado');
    }

    const privilegios = (await client.query(`
        SELECT t.nome,
               has_table_privilege(current_user, t.nome, 'SELECT') AS select_ok,
               has_table_privilege(current_user, t.nome, 'DELETE') AS delete_ok,
               has_table_privilege(current_user, t.nome, 'INSERT') AS insert_ok,
               has_table_privilege(current_user, t.nome, 'UPDATE') AS update_ok,
               has_table_privilege(current_user, t.nome, 'TRUNCATE') AS truncate_ok
        FROM unnest($1::text[]) AS t(nome)
    `, [TABELAS_RETENCAO])).rows;

    if (privilegios.length !== TABELAS_RETENCAO.length) {
        throw new Error('Cleanup não encontrou todas as tabelas esperadas');
    }
    for (const p of privilegios) {
        if (!p.select_ok || !p.delete_ok || p.insert_ok || p.update_ok || p.truncate_ok) {
            throw new Error(`Cleanup com privilégios inesperados em ${p.nome}`);
        }
    }
}

function tabelasDeRetencao(opcoes) {
    return [
        {
            nome: 'affiliate_clicks',
            valor: opcoes.affiliateDays,
            sql: `DELETE FROM affiliate_clicks
                  WHERE ctid IN (
                      SELECT ctid FROM affiliate_clicks
                      WHERE received_at < now() - ($1 * interval '1 day')
                      LIMIT $2
                  )`
        },
        {
            nome: 'events',
            valor: opcoes.eventDays,
            sql: `DELETE FROM events
                  WHERE ctid IN (
                      SELECT ctid FROM events
                      WHERE received_at < now() - ($1 * interval '1 day')
                      LIMIT $2
                  )`
        },
        {
            nome: 'pageviews',
            valor: opcoes.pageviewDays,
            sql: `DELETE FROM pageviews
                  WHERE ctid IN (
                      SELECT ctid FROM pageviews
                      WHERE received_at < now() - ($1 * interval '1 day')
                      LIMIT $2
                  )`
        },
        {
            nome: 'sessions',
            valor: opcoes.sessionMonths,
            sql: `DELETE FROM sessions
                  WHERE ctid IN (
                      SELECT s.ctid FROM sessions s
                      WHERE s.last_seen_at < now() - ($1 * interval '1 month')
                        AND NOT EXISTS (
                            SELECT 1 FROM pageviews p
                            WHERE p.session_id = s.session_id
                              AND p.received_at >= now() - ($3 * interval '1 day')
                        )
                        AND NOT EXISTS (
                            SELECT 1 FROM events e
                            WHERE e.session_id = s.session_id
                              AND e.received_at >= now() - ($4 * interval '1 day')
                        )
                        AND NOT EXISTS (
                            SELECT 1 FROM affiliate_clicks a
                            WHERE a.session_id = s.session_id
                              AND a.received_at >= now() - ($5 * interval '1 day')
                        )
                      LIMIT $2
                  )`,
            parametros: (config) => [
                config.sessionMonths,
                config.batchSize,
                config.pageviewDays,
                config.eventDays,
                config.affiliateDays
            ]
        },
        {
            nome: 'visitors',
            valor: opcoes.visitorMonths,
            sql: `DELETE FROM visitors
                  WHERE ctid IN (
                      SELECT v.ctid FROM visitors v
                      WHERE v.last_seen_at < now() - ($1 * interval '1 month')
                        AND NOT EXISTS (
                            SELECT 1 FROM sessions s WHERE s.visitor_id = v.visitor_id
                        )
                      LIMIT $2
                  )`
        },
        {
            nome: 'ingest_events',
            valor: opcoes.ingestEventDays,
            sql: `DELETE FROM ingest_events
                  WHERE ctid IN (
                      SELECT ctid FROM ingest_events
                      WHERE received_at < now() - ($1 * interval '1 day')
                      LIMIT $2
                  )`
        },
        {
            nome: 'rate_limits',
            valor: opcoes.rateLimitHours,
            sql: `DELETE FROM rate_limits
                  WHERE ctid IN (
                      SELECT ctid FROM rate_limits
                      WHERE window_start < now() - ($1 * interval '1 hour')
                      LIMIT $2
                  )`
        },
        {
            nome: 'html_events',
            valor: opcoes.rawDays,
            sql: `DELETE FROM html_events
                  WHERE ctid IN (
                      SELECT ctid FROM html_events
                      WHERE received_at < now() - ($1 * interval '1 day')
                      LIMIT $2
                  )`
        },
        {
            nome: 'html_traffic_daily',
            valor: opcoes.aggregateDays,
            sql: `DELETE FROM html_traffic_daily
                  WHERE ctid IN (
                      SELECT ctid FROM html_traffic_daily
                      WHERE day < current_date - ($1 * interval '1 day')
                      LIMIT $2
                  )`
        },
        {
            nome: 'html_indicators_monthly',
            valor: opcoes.indicatorMonths,
            sql: `DELETE FROM html_indicators_monthly
                  WHERE ctid IN (
                      SELECT ctid FROM html_indicators_monthly
                      WHERE month < date_trunc('month', now()) - ($1 * interval '1 month')
                      LIMIT $2
                  )`
        },
        {
            nome: 'edge_daily_counters',
            valor: opcoes.counterDays,
            sql: `DELETE FROM edge_daily_counters
                  WHERE ctid IN (
                      SELECT ctid FROM edge_daily_counters
                      WHERE day < current_date - ($1 * interval '1 day')
                      LIMIT $2
                  )`
        },
        {
            nome: 'edge_nonces',
            valor: opcoes.nonceHours,
            sql: `DELETE FROM edge_nonces
                  WHERE ctid IN (
                      SELECT ctid FROM edge_nonces
                      WHERE expires_at < now() - ($1 * interval '1 hour')
                      LIMIT $2
                  )`
        },
        {
            nome: 'edge_rate_limits',
            valor: opcoes.rateHours,
            sql: `DELETE FROM edge_rate_limits
                  WHERE ctid IN (
                      SELECT ctid FROM edge_rate_limits
                      WHERE window_start < now() - ($1 * interval '1 hour')
                      LIMIT $2
                  )`
        }
    ];
}

function tabelasNaoExecutadas(tabelas, motivo) {
    return Object.fromEntries(tabelas.map((tabela) => [
        tabela.nome,
        { removidos: 0, lotes: 0, truncado: true, skipped: true, reason: motivo }
    ]));
}

export async function limparRetencao(pool, opcoes = {}) {
    const config = lerOpcoes(opcoes);
    const agora = config.now;
    const inicio = agora();
    const deadline = inicio + config.timeBudgetMs - config.shutdownReserveMs;
    const tabelas = tabelasDeRetencao(config);
    const client = await pool.connect();
    let lockado = false;

    try {
        await validarIdentidadeEPrivilegios(client, config);

        if (agora() >= deadline) {
            return {
                locked: false,
                status: 'budget_exhausted',
                reason: 'time_budget',
                budgetExhausted: true,
                tables: tabelasNaoExecutadas(tabelas, 'time_budget'),
                truncated: true,
                timeBudgetMs: config.timeBudgetMs,
                shutdownReserveMs: config.shutdownReserveMs,
                batchTimeoutMs: config.batchTimeoutMs,
                durationMs: agora() - inicio
            };
        }

        lockado = Boolean((await client.query(
            'SELECT pg_try_advisory_lock($1) AS locked',
            [RETENTION_LOCK_KEY]
        )).rows[0]?.locked);

        if (!lockado) {
            return {
                locked: false,
                status: 'locked',
                reason: 'lock_busy',
                budgetExhausted: false,
                tables: {},
                truncated: false,
                timeBudgetMs: config.timeBudgetMs,
                shutdownReserveMs: config.shutdownReserveMs,
                batchTimeoutMs: config.batchTimeoutMs,
                durationMs: agora() - inicio
            };
        }

        const resultado = {};
        let budgetExhausted = false;

        for (const tabela of tabelas) {
            let lotes = 0;
            let removidos = 0;
            let truncado = false;
            let skipped = false;
            let reason = null;

            if (agora() >= deadline) {
                budgetExhausted = true;
                skipped = true;
                truncado = true;
                reason = 'time_budget';
            }

            while (!skipped && lotes < config.maxBatches) {
                const restante = deadline - agora();
                if (restante < config.batchTimeoutMs + MIN_BATCH_MARGIN_MS) {
                    budgetExhausted = true;
                    truncado = true;
                    skipped = lotes === 0;
                    reason = 'time_budget';
                    break;
                }

                const timeoutLote = Math.min(
                    config.batchTimeoutMs,
                    Math.max(1, restante - MIN_BATCH_MARGIN_MS)
                );

                await client.query('BEGIN');
                try {
                    await client.query(
                        "SELECT set_config('statement_timeout', $1, true)",
                        [`${timeoutLote}ms`]
                    );
                    await client.query(
                        "SELECT set_config('lock_timeout', $1, true)",
                        [`${Math.min(5_000, timeoutLote)}ms`]
                    );
                    const parametros = tabela.parametros
                        ? tabela.parametros(config)
                        : [tabela.valor, config.batchSize];
                    const resposta = await client.query(tabela.sql, parametros);
                    await client.query('COMMIT');
                    const quantidade = Number(resposta.rowCount || 0);
                    removidos += quantidade;
                    lotes += 1;
                    if (quantidade < config.batchSize) break;
                } catch (erro) {
                    try { await client.query('ROLLBACK'); } catch {}
                    throw erro;
                }
            }

            if (!skipped && lotes >= config.maxBatches) {
                truncado = true;
                if (!reason) reason = 'max_batches';
            }
            resultado[tabela.nome] = { removidos, lotes, truncado, skipped, reason };
        }

        const truncated = Object.values(resultado).some((item) => item.truncado);
        const status = budgetExhausted ? 'budget_exhausted' : (truncated ? 'partial' : 'complete');
        const reason = budgetExhausted ? 'time_budget' : (truncated ? 'max_batches' : null);

        return {
            locked: true,
            status,
            reason,
            budgetExhausted,
            tables: resultado,
            truncated,
            timeBudgetMs: config.timeBudgetMs,
            shutdownReserveMs: config.shutdownReserveMs,
            batchTimeoutMs: config.batchTimeoutMs,
            durationMs: agora() - inicio
        };
    } finally {
        if (lockado) {
            try { await client.query('SELECT pg_advisory_unlock($1)', [RETENTION_LOCK_KEY]); } catch {}
        }
        client.release();
    }
}

export {
    DEFAULT_BATCH_SIZE,
    MAX_BATCH_SIZE,
    DEFAULT_MAX_BATCHES,
    DEFAULT_TIME_BUDGET_MS,
    MAX_TIME_BUDGET_MS,
    DEFAULT_BATCH_TIMEOUT_MS,
    DEFAULT_SHUTDOWN_RESERVE_MS,
    MIN_BATCH_MARGIN_MS,
    RETENTION_LOCK_KEY
};
