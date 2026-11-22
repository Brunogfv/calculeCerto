-- Fase 5F.53 - privilegios minimos de ingestao da runtime B1.
--
-- Aplicar SOMENTE no branch/database validation_b1, depois da migration 007,
-- pelo executor neondb_owner, dentro da transacao do wrapper B1.
-- Este arquivo nao cria, altera ou remove roles, ownership ou tabelas.
--
-- Operacoes justificadas:
--   rate_limits: INSERT/UPDATE do contador e SELECT(count) para RETURNING.
--   sessions: SELECT do visitor da sessao, INSERT do upsert e UPDATE dos contadores.
--   visitors: INSERT do upsert e UPDATE de last_seen_at; SELECT por causa do
--     ON CONFLICT DO UPDATE que referencia visitors.last_seen_at.
--   ingest_events: INSERT e SELECT(event_id) para RETURNING/ON CONFLICT.
--   pageviews/events/affiliate_clicks: INSERT; SELECT(event_id) e exigido pelo
--     RETURNING/ON CONFLICT do PostgreSQL, sem liberar as demais colunas.
--   Nenhuma permissao de DELETE, TRUNCATE, DDL, sequencia ou schema CREATE.

DO $$
BEGIN
    IF current_database() <> 'validation_b1' THEN
        RAISE EXCEPTION 'B1 collect grants: current_database()=% (esperado validation_b1)', current_database();
    END IF;
    IF current_user <> 'neondb_owner' THEN
        RAISE EXCEPTION 'B1 collect grants: current_user=% (esperado neondb_owner)', current_user;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'validation_b1_runtime') THEN
        RAISE EXCEPTION 'B1 collect grants: role validation_b1_runtime ausente';
    END IF;
    IF (SELECT count(*) FROM schema_migrations) <> 7 THEN
        RAISE EXCEPTION 'B1 collect grants: migrations esperadas=7, encontradas=%',
            (SELECT count(*) FROM schema_migrations);
    END IF;
    IF (SELECT count(*) FROM pg_tables WHERE schemaname = 'public') <> 14 THEN
        RAISE EXCEPTION 'B1 collect grants: tabelas esperadas=14, encontradas=%',
            (SELECT count(*) FROM pg_tables WHERE schemaname = 'public');
    END IF;
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'sessions'
          AND column_name = 'user_agent'
    ) THEN
        RAISE EXCEPTION 'B1 collect grants: sessions.user_agent ainda existe; migration 007 ausente';
    END IF;
    IF EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'validation_b1_runtime'
          AND (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls)
    ) THEN
        RAISE EXCEPTION 'B1 collect grants: runtime com atributo administrativo';
    END IF;
    IF EXISTS (
        SELECT 1
        FROM pg_auth_members m
        JOIN pg_roles u ON u.oid = m.member
        WHERE u.rolname = 'validation_b1_runtime'
    ) THEN
        RAISE EXCEPTION 'B1 collect grants: runtime possui membership';
    END IF;
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_roles r ON r.oid = c.relowner
        WHERE r.rolname = 'validation_b1_runtime'
    ) THEN
        RAISE EXCEPTION 'B1 collect grants: runtime possui objetos';
    END IF;
    IF has_schema_privilege('validation_b1_runtime', 'public', 'CREATE') THEN
        RAISE EXCEPTION 'B1 collect grants: runtime possui CREATE no schema public';
    END IF;
    IF NOT has_schema_privilege('validation_b1_runtime', 'public', 'USAGE') THEN
        RAISE EXCEPTION 'B1 collect grants: runtime sem USAGE no schema public';
    END IF;
    IF NOT has_database_privilege('validation_b1_runtime', 'validation_b1', 'CONNECT') THEN
        RAISE EXCEPTION 'B1 collect grants: runtime sem CONNECT no database';
    END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON TABLE visitors TO validation_b1_runtime;
GRANT SELECT, INSERT, UPDATE ON TABLE sessions TO validation_b1_runtime;
GRANT SELECT, INSERT, UPDATE ON TABLE rate_limits TO validation_b1_runtime;

GRANT INSERT ON TABLE ingest_events, pageviews, events, affiliate_clicks
    TO validation_b1_runtime;

GRANT SELECT (event_id) ON TABLE ingest_events, pageviews, events, affiliate_clicks
    TO validation_b1_runtime;

DO $$
DECLARE
    tabela TEXT;
    tabelas TEXT[] := ARRAY[
        'visitors', 'sessions', 'pageviews', 'events',
        'affiliate_clicks', 'ingest_events', 'rate_limits'
    ];
BEGIN
    IF NOT has_table_privilege('validation_b1_runtime', 'visitors', 'SELECT') OR
       NOT has_table_privilege('validation_b1_runtime', 'visitors', 'INSERT') OR
       NOT has_table_privilege('validation_b1_runtime', 'visitors', 'UPDATE') THEN
        RAISE EXCEPTION 'B1 collect grants: privileges insuficientes em visitors';
    END IF;
    IF NOT has_table_privilege('validation_b1_runtime', 'sessions', 'SELECT') OR
       NOT has_table_privilege('validation_b1_runtime', 'sessions', 'INSERT') OR
       NOT has_table_privilege('validation_b1_runtime', 'sessions', 'UPDATE') THEN
        RAISE EXCEPTION 'B1 collect grants: privileges insuficientes em sessions';
    END IF;
    IF NOT has_table_privilege('validation_b1_runtime', 'rate_limits', 'SELECT') OR
       NOT has_table_privilege('validation_b1_runtime', 'rate_limits', 'INSERT') OR
       NOT has_table_privilege('validation_b1_runtime', 'rate_limits', 'UPDATE') THEN
        RAISE EXCEPTION 'B1 collect grants: privileges insuficientes em rate_limits';
    END IF;

    IF NOT has_table_privilege('validation_b1_runtime', 'pageviews', 'INSERT') OR
       NOT has_table_privilege('validation_b1_runtime', 'events', 'INSERT') OR
       NOT has_table_privilege('validation_b1_runtime', 'affiliate_clicks', 'INSERT') OR
       NOT has_table_privilege('validation_b1_runtime', 'ingest_events', 'INSERT') THEN
        RAISE EXCEPTION 'B1 collect grants: INSERT ausente em tabela de eventos';
    END IF;

    IF NOT has_column_privilege('validation_b1_runtime', 'pageviews', 'event_id', 'SELECT') OR
       NOT has_column_privilege('validation_b1_runtime', 'events', 'event_id', 'SELECT') OR
       NOT has_column_privilege('validation_b1_runtime', 'affiliate_clicks', 'event_id', 'SELECT') OR
       NOT has_column_privilege('validation_b1_runtime', 'ingest_events', 'event_id', 'SELECT') THEN
        RAISE EXCEPTION 'B1 collect grants: SELECT(event_id) ausente';
    END IF;
    IF has_column_privilege('validation_b1_runtime', 'pageviews', 'path', 'SELECT') OR
       has_column_privilege('validation_b1_runtime', 'events', 'metadata', 'SELECT') OR
       has_column_privilege('validation_b1_runtime', 'affiliate_clicks', 'product', 'SELECT') OR
       has_column_privilege('validation_b1_runtime', 'ingest_events', 'event_name', 'SELECT') THEN
        RAISE EXCEPTION 'B1 collect grants: SELECT de coluna nao utilizada';
    END IF;
    IF has_table_privilege('validation_b1_runtime', 'pageviews', 'SELECT') OR
       has_table_privilege('validation_b1_runtime', 'events', 'SELECT') OR
       has_table_privilege('validation_b1_runtime', 'affiliate_clicks', 'SELECT') OR
       has_table_privilege('validation_b1_runtime', 'ingest_events', 'SELECT') THEN
        RAISE EXCEPTION 'B1 collect grants: SELECT de tabela inteira desnecessario';
    END IF;

    FOREACH tabela IN ARRAY tabelas LOOP
        IF has_table_privilege('validation_b1_runtime', tabela, 'DELETE') THEN
            RAISE EXCEPTION 'B1 collect grants: DELETE indevido em %', tabela;
        END IF;
        IF has_table_privilege('validation_b1_runtime', tabela, 'TRUNCATE') THEN
            RAISE EXCEPTION 'B1 collect grants: TRUNCATE indevido em %', tabela;
        END IF;
    END LOOP;

    IF has_table_privilege('validation_b1_runtime', 'pageviews', 'UPDATE') OR
       has_table_privilege('validation_b1_runtime', 'events', 'UPDATE') OR
       has_table_privilege('validation_b1_runtime', 'affiliate_clicks', 'UPDATE') OR
       has_table_privilege('validation_b1_runtime', 'ingest_events', 'UPDATE') THEN
        RAISE EXCEPTION 'B1 collect grants: UPDATE indevido em tabela de eventos';
    END IF;
    IF has_table_privilege('validation_b1_runtime', 'schema_migrations', 'SELECT') THEN
        RAISE EXCEPTION 'B1 collect grants: runtime pode ler schema_migrations';
    END IF;
    IF has_schema_privilege('validation_b1_runtime', 'public', 'CREATE') THEN
        RAISE EXCEPTION 'B1 collect grants: runtime possui CREATE no schema public';
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname = 'validation_b1_runtime'
          AND (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls)
    ) THEN
        RAISE EXCEPTION 'B1 collect grants: runtime com atributo administrativo';
    END IF;
    IF EXISTS (
        SELECT 1
        FROM pg_auth_members m
        JOIN pg_roles u ON u.oid = m.member
        WHERE u.rolname = 'validation_b1_runtime'
    ) THEN
        RAISE EXCEPTION 'B1 collect grants: runtime possui membership';
    END IF;
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_roles r ON r.oid = c.relowner
        WHERE r.rolname = 'validation_b1_runtime'
    ) THEN
        RAISE EXCEPTION 'B1 collect grants: runtime possui objetos';
    END IF;
END $$;
