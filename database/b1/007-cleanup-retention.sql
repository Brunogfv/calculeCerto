-- Fase 5F.10 â€” aplicaÃ§Ã£o operacional da retenÃ§Ã£o B1 (nÃ£o Ã© migration registrada).
-- NÃƒO executar remotamente sem autorizaÃ§Ã£o especÃ­fica.
--
-- PrÃ©-requisito: role validation_b1_cleanup criada/validada pelo SQL 008.
-- Senha nunca estÃ¡ neste arquivo. O script Ã© aplicado em transaÃ§Ã£o Ãºnica.

BEGIN;

DO $$
DECLARE
    tabela TEXT;
    tabelas TEXT[] := ARRAY[
        'visitors', 'sessions', 'pageviews', 'events', 'affiliate_clicks',
        'ingest_events', 'rate_limits', 'html_events', 'html_traffic_daily',
        'html_indicators_monthly', 'edge_daily_counters', 'edge_nonces',
        'edge_rate_limits'
    ];
    r RECORD;
BEGIN
    IF current_database() <> 'validation_b1' THEN
        RAISE EXCEPTION 'Alvo deve ser validation_b1, atual=%', current_database();
    END IF;

    FOREACH tabela IN ARRAY tabelas LOOP
        IF to_regclass(format('public.%I', tabela)) IS NULL THEN
            RAISE EXCEPTION 'Tabela esperada ausente: %', tabela;
        END IF;
    END LOOP;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='visitors' AND column_name='last_seen_at') OR
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sessions' AND column_name='last_seen_at') OR
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pageviews' AND column_name='received_at') OR
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='received_at') OR
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='affiliate_clicks' AND column_name='received_at') OR
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ingest_events' AND column_name='received_at') OR
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='rate_limits' AND column_name='window_start') OR
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='html_events' AND column_name='received_at') OR
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='html_traffic_daily' AND column_name='day') OR
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='html_indicators_monthly' AND column_name='month') OR
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='edge_daily_counters' AND column_name='day') OR
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='edge_nonces' AND column_name='expires_at') OR
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='edge_rate_limits' AND column_name='window_start') THEN
        RAISE EXCEPTION 'Coluna de retenção esperada ausente';
    END IF;

    SELECT rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls,
           rolinherit, rolcanlogin
      INTO r
      FROM pg_roles
     WHERE rolname = 'validation_b1_cleanup';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Role validation_b1_cleanup ausente';
    END IF;
    IF NOT r.rolcanlogin OR r.rolsuper OR r.rolcreatedb OR r.rolcreaterole OR
       r.rolreplication OR r.rolbypassrls OR r.rolinherit THEN
        RAISE EXCEPTION 'Role validation_b1_cleanup com atributo proibido ou INHERIT';
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_auth_members m
        JOIN pg_roles u ON u.oid = m.member
        WHERE u.rolname = 'validation_b1_cleanup'
    ) THEN
        RAISE EXCEPTION 'Role validation_b1_cleanup possui membership recebida';
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_auth_members m
        JOIN pg_roles u ON u.oid = m.member
        JOIN pg_roles g ON g.oid = m.roleid
        JOIN pg_roles grantor ON grantor.oid = m.grantor
        WHERE g.rolname = 'validation_b1_cleanup'
          AND NOT (u.rolname = 'neondb_owner' AND grantor.rolname = 'cloud_admin')
    ) THEN
        RAISE EXCEPTION 'Role validation_b1_cleanup possui membership concedida inesperada';
    END IF;
    IF to_regclass('public.schema_migrations') IS NOT NULL AND has_table_privilege('validation_b1_cleanup', 'schema_migrations', 'SELECT') THEN
        RAISE EXCEPTION 'Role validation_b1_cleanup jÃ¡ acessa schema_migrations';
    END IF;

    EXECUTE 'GRANT CONNECT ON DATABASE validation_b1 TO validation_b1_cleanup';
    EXECUTE 'GRANT USAGE ON SCHEMA public TO validation_b1_cleanup';
    EXECUTE 'REVOKE CREATE ON SCHEMA public FROM validation_b1_cleanup';
    EXECUTE 'REVOKE CREATE ON DATABASE validation_b1 FROM validation_b1_cleanup';
    EXECUTE 'GRANT SELECT, DELETE ON TABLE
        visitors, sessions, pageviews, events, affiliate_clicks,
        ingest_events, rate_limits, html_events, html_traffic_daily,
        html_indicators_monthly, edge_daily_counters, edge_nonces,
        edge_rate_limits
        TO validation_b1_cleanup';
END $$;

-- Ãndices que apoiam os cutoffs de retenÃ§Ã£o por Ãºltima atividade.
CREATE INDEX IF NOT EXISTS sessions_last_seen_at_idx ON sessions (last_seen_at);
CREATE INDEX IF NOT EXISTS visitors_last_seen_at_idx ON visitors (last_seen_at);

-- PÃ³s-condiÃ§Ã£o: a role pode SELECT/DELETE, mas nÃ£o INSERT/UPDATE/TRUNCATE/DDL.
DO $$
DECLARE
    tabela TEXT;
    tabelas TEXT[] := ARRAY[
        'visitors', 'sessions', 'pageviews', 'events', 'affiliate_clicks',
        'ingest_events', 'rate_limits', 'html_events', 'html_traffic_daily',
        'html_indicators_monthly', 'edge_daily_counters', 'edge_nonces',
        'edge_rate_limits'
    ];
BEGIN
    IF NOT has_schema_privilege('validation_b1_cleanup', 'public', 'USAGE') OR
       has_schema_privilege('validation_b1_cleanup', 'public', 'CREATE') OR
       has_database_privilege('validation_b1_cleanup', 'validation_b1', 'CREATE') THEN
        RAISE EXCEPTION 'Role validation_b1_cleanup com privilÃ©gio de schema/database inesperado';
    END IF;
    IF to_regclass('public.schema_migrations') IS NOT NULL AND has_table_privilege('validation_b1_cleanup', 'schema_migrations', 'SELECT') THEN
        RAISE EXCEPTION 'Role validation_b1_cleanup acessa schema_migrations';
    END IF;

    FOREACH tabela IN ARRAY tabelas LOOP
        IF NOT has_table_privilege('validation_b1_cleanup', tabela, 'SELECT') OR
           NOT has_table_privilege('validation_b1_cleanup', tabela, 'DELETE') OR
           has_table_privilege('validation_b1_cleanup', tabela, 'INSERT') OR
           has_table_privilege('validation_b1_cleanup', tabela, 'UPDATE') OR
           has_table_privilege('validation_b1_cleanup', tabela, 'TRUNCATE') THEN
            RAISE EXCEPTION 'PÃ³s-condiÃ§Ã£o de privilÃ©gios falhou em %', tabela;
        END IF;
    END LOOP;

    IF EXISTS (
        SELECT 1 FROM pg_auth_members m
        JOIN pg_roles u ON u.oid = m.member
        WHERE u.rolname = 'validation_b1_cleanup'
    ) THEN
        RAISE EXCEPTION 'Role validation_b1_cleanup possui membership recebida';
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_auth_members m
        JOIN pg_roles u ON u.oid = m.member
        JOIN pg_roles g ON g.oid = m.roleid
        JOIN pg_roles grantor ON grantor.oid = m.grantor
        WHERE g.rolname = 'validation_b1_cleanup'
          AND NOT (u.rolname = 'neondb_owner' AND grantor.rolname = 'cloud_admin')
    ) THEN
        RAISE EXCEPTION 'Role validation_b1_cleanup possui membership concedida inesperada';
    END IF;
    IF to_regclass('public.sessions_last_seen_at_idx') IS NULL OR
       to_regclass('public.visitors_last_seen_at_idx') IS NULL THEN
        RAISE EXCEPTION 'Índice de retenção esperado ausente';
    END IF;
END $$;

COMMIT;


