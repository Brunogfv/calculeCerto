-- Fase 5F.3.5 — privilégios mínimos da role runtime B1.
-- Este arquivo é executado pelo wrapper transacional apply-b1-migrations.mjs.
-- Não execute isoladamente fora de uma transação validada.
--
-- Alvo obrigatório: database validation_b1, executor neondb_owner.
-- Role de runtime: validation_b1_runtime.
-- Roles herdadas analytics_runtime/analytics_cleanup: remover privilégios no B1.
-- A role de cleanup B1 não é criada nem usada nesta fase.

DO $$
BEGIN
    IF current_database() <> 'validation_b1' THEN
        RAISE EXCEPTION 'B1 guard: current_database()=% (esperado validation_b1)', current_database();
    END IF;
    IF current_user <> 'neondb_owner' THEN
        RAISE EXCEPTION 'B1 guard: current_user=% (esperado neondb_owner)', current_user;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'validation_b1_runtime') THEN
        RAISE EXCEPTION 'B1 guard: role validation_b1_runtime ausente';
    END IF;
    IF to_regclass('public.schema_migrations') IS NULL THEN
        RAISE EXCEPTION 'B1 guard: schema_migrations ausente';
    END IF;
    IF (SELECT count(*) FROM pg_tables WHERE schemaname = 'public') <> 14 THEN
        RAISE EXCEPTION 'B1 guard: número de tabelas inesperado: %', (SELECT count(*) FROM pg_tables WHERE schemaname = 'public');
    END IF;
    IF (SELECT count(*) FROM schema_migrations) <> 6 THEN
        RAISE EXCEPTION 'B1 guard: migrations esperadas=6, encontradas=%', (SELECT count(*) FROM schema_migrations);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analytics_runtime') THEN
        EXECUTE 'REVOKE CONNECT ON DATABASE validation_b1 FROM analytics_runtime';
        EXECUTE 'REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM analytics_runtime';
        EXECUTE 'REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM analytics_runtime';
        EXECUTE 'REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM analytics_runtime';
        EXECUTE 'REVOKE USAGE ON SCHEMA public FROM analytics_runtime';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analytics_cleanup') THEN
        EXECUTE 'REVOKE CONNECT ON DATABASE validation_b1 FROM analytics_cleanup';
        EXECUTE 'REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM analytics_cleanup';
        EXECUTE 'REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM analytics_cleanup';
        EXECUTE 'REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM analytics_cleanup';
        EXECUTE 'REVOKE USAGE ON SCHEMA public FROM analytics_cleanup';
    END IF;
END $$;

GRANT CONNECT ON DATABASE validation_b1 TO validation_b1_runtime;
GRANT USAGE ON SCHEMA public TO validation_b1_runtime;

-- INSERT sem RETURNING em html_events.
GRANT INSERT ON TABLE html_events TO validation_b1_runtime;

-- Upserts com resolução de conflito; SELECT é exigido pelo ON CONFLICT.
GRANT SELECT, INSERT, UPDATE ON TABLE html_traffic_daily, html_indicators_monthly TO validation_b1_runtime;

-- SELECT é necessário por causa de RETURNING count nos contadores.
GRANT SELECT, INSERT, UPDATE ON TABLE edge_daily_counters, edge_rate_limits TO validation_b1_runtime;

-- INSERT sem RETURNING no nonce.
GRANT INSERT ON TABLE edge_nonces TO validation_b1_runtime;

DO $$
DECLARE
    app_tables TEXT[] := ARRAY[
        'html_events', 'html_traffic_daily', 'html_indicators_monthly',
        'edge_daily_counters', 'edge_nonces', 'edge_rate_limits'
    ];
    tabela TEXT;
BEGIN
    IF (SELECT count(*) FROM pg_tables WHERE schemaname = 'public') <> 14 THEN
        RAISE EXCEPTION 'B1 validation: contagem de tabelas inesperada';
    END IF;
    IF (SELECT count(*) FROM schema_migrations) <> 6 THEN
        RAISE EXCEPTION 'B1 validation: contagem de migrations inesperada';
    END IF;

    IF NOT has_database_privilege('validation_b1_runtime', 'validation_b1', 'CONNECT') THEN
        RAISE EXCEPTION 'B1 validation: runtime sem CONNECT';
    END IF;
    IF NOT has_schema_privilege('validation_b1_runtime', 'public', 'USAGE') THEN
        RAISE EXCEPTION 'B1 validation: runtime sem USAGE';
    END IF;
    IF has_schema_privilege('validation_b1_runtime', 'public', 'CREATE') THEN
        RAISE EXCEPTION 'B1 validation: runtime com CREATE no schema';
    END IF;
    IF has_database_privilege('validation_b1_runtime', 'validation_b1', 'CREATE') THEN
        RAISE EXCEPTION 'B1 validation: runtime com CREATE no database';
    END IF;

    IF NOT has_table_privilege('validation_b1_runtime', 'html_events', 'INSERT') THEN
        RAISE EXCEPTION 'B1 validation: runtime sem INSERT em html_events';
    END IF;
    IF has_table_privilege('validation_b1_runtime', 'html_events', 'SELECT') THEN
        RAISE EXCEPTION 'B1 validation: SELECT desnecessário em html_events';
    END IF;
    IF has_table_privilege('validation_b1_runtime', 'html_events', 'UPDATE') THEN
        RAISE EXCEPTION 'B1 validation: UPDATE desnecessário em html_events';
    END IF;

    IF NOT has_table_privilege('validation_b1_runtime', 'html_traffic_daily', 'SELECT') OR
       NOT has_table_privilege('validation_b1_runtime', 'html_traffic_daily', 'INSERT') OR
       NOT has_table_privilege('validation_b1_runtime', 'html_traffic_daily', 'UPDATE') THEN
        RAISE EXCEPTION 'B1 validation: runtime sem SELECT/INSERT/UPDATE em html_traffic_daily';
    END IF;
    IF NOT has_table_privilege('validation_b1_runtime', 'html_indicators_monthly', 'SELECT') OR
       NOT has_table_privilege('validation_b1_runtime', 'html_indicators_monthly', 'INSERT') OR
       NOT has_table_privilege('validation_b1_runtime', 'html_indicators_monthly', 'UPDATE') THEN
        RAISE EXCEPTION 'B1 validation: runtime sem SELECT/INSERT/UPDATE em html_indicators_monthly';
    END IF;
    IF NOT has_table_privilege('validation_b1_runtime', 'edge_daily_counters', 'SELECT') OR
       NOT has_table_privilege('validation_b1_runtime', 'edge_daily_counters', 'INSERT') OR
       NOT has_table_privilege('validation_b1_runtime', 'edge_daily_counters', 'UPDATE') THEN
        RAISE EXCEPTION 'B1 validation: runtime sem SELECT/INSERT/UPDATE em edge_daily_counters';
    END IF;
    IF NOT has_table_privilege('validation_b1_runtime', 'edge_rate_limits', 'SELECT') OR
       NOT has_table_privilege('validation_b1_runtime', 'edge_rate_limits', 'INSERT') OR
       NOT has_table_privilege('validation_b1_runtime', 'edge_rate_limits', 'UPDATE') THEN
        RAISE EXCEPTION 'B1 validation: runtime sem SELECT/INSERT/UPDATE em edge_rate_limits';
    END IF;
    IF NOT has_table_privilege('validation_b1_runtime', 'edge_nonces', 'INSERT') THEN
        RAISE EXCEPTION 'B1 validation: runtime sem INSERT em edge_nonces';
    END IF;
    IF has_table_privilege('validation_b1_runtime', 'edge_nonces', 'SELECT') THEN
        RAISE EXCEPTION 'B1 validation: SELECT desnecessário em edge_nonces';
    END IF;

    FOREACH tabela IN ARRAY app_tables LOOP
        IF has_table_privilege('validation_b1_runtime', tabela, 'DELETE') THEN
            RAISE EXCEPTION 'B1 validation: runtime com DELETE em %', tabela;
        END IF;
        IF has_table_privilege('validation_b1_runtime', tabela, 'TRUNCATE') THEN
            RAISE EXCEPTION 'B1 validation: runtime com TRUNCATE em %', tabela;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analytics_runtime') AND
           has_table_privilege('analytics_runtime', tabela, 'SELECT') THEN
            RAISE EXCEPTION 'B1 validation: analytics_runtime com SELECT em %', tabela;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analytics_cleanup') AND
           has_table_privilege('analytics_cleanup', tabela, 'DELETE') THEN
            RAISE EXCEPTION 'B1 validation: analytics_cleanup com DELETE em %', tabela;
        END IF;
    END LOOP;

    IF has_table_privilege('validation_b1_runtime', 'visitors', 'SELECT') OR
       has_table_privilege('validation_b1_runtime', 'pageviews', 'SELECT') OR
       has_table_privilege('validation_b1_runtime', 'events', 'SELECT') OR
       has_table_privilege('validation_b1_runtime', 'affiliate_clicks', 'SELECT') THEN
        RAISE EXCEPTION 'B1 validation: runtime com acesso à Fase 2/3';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_auth_members m
        JOIN pg_roles u ON u.oid = m.member
        WHERE u.rolname = 'validation_b1_runtime'
    ) THEN
        RAISE EXCEPTION 'B1 validation: runtime possui membership';
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname = 'validation_b1_runtime'
          AND (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls)
    ) THEN
        RAISE EXCEPTION 'B1 validation: runtime com atributo administrativo';
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_roles r ON r.oid = c.relowner
        WHERE r.rolname = 'validation_b1_runtime'
    ) THEN
        RAISE EXCEPTION 'B1 validation: runtime possui objetos';
    END IF;
END $$;
