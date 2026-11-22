-- Fase 5F.53 - pos-verificacao somente leitura dos grants de collect B1.
-- Executar no Neon B1 depois de 009-runtime-collect-privileges.sql.
-- Nao altera dados, roles ou privilegios.

SELECT
    (SELECT count(*)::int FROM schema_migrations) AS migrations,
    (SELECT count(*)::int FROM pg_tables WHERE schemaname = 'public') AS tabelas,
    EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'sessions'
          AND column_name = 'user_agent'
    ) AS user_agent_presente;

SELECT
    has_table_privilege('validation_b1_runtime', 'visitors', 'SELECT') AS visitors_select,
    has_table_privilege('validation_b1_runtime', 'visitors', 'INSERT') AS visitors_insert,
    has_table_privilege('validation_b1_runtime', 'visitors', 'UPDATE') AS visitors_update,
    has_table_privilege('validation_b1_runtime', 'sessions', 'SELECT') AS sessions_select,
    has_table_privilege('validation_b1_runtime', 'sessions', 'INSERT') AS sessions_insert,
    has_table_privilege('validation_b1_runtime', 'sessions', 'UPDATE') AS sessions_update,
    has_table_privilege('validation_b1_runtime', 'rate_limits', 'SELECT') AS rate_limits_select,
    has_table_privilege('validation_b1_runtime', 'rate_limits', 'INSERT') AS rate_limits_insert,
    has_table_privilege('validation_b1_runtime', 'rate_limits', 'UPDATE') AS rate_limits_update;

SELECT
    has_table_privilege('validation_b1_runtime', 'pageviews', 'INSERT') AS pageviews_insert,
    has_table_privilege('validation_b1_runtime', 'events', 'INSERT') AS events_insert,
    has_table_privilege('validation_b1_runtime', 'affiliate_clicks', 'INSERT') AS affiliate_insert,
    has_table_privilege('validation_b1_runtime', 'ingest_events', 'INSERT') AS ingest_insert,
    has_column_privilege('validation_b1_runtime', 'pageviews', 'event_id', 'SELECT') AS pageviews_event_id_select,
    has_column_privilege('validation_b1_runtime', 'events', 'event_id', 'SELECT') AS events_event_id_select,
    has_column_privilege('validation_b1_runtime', 'affiliate_clicks', 'event_id', 'SELECT') AS affiliate_event_id_select,
    has_column_privilege('validation_b1_runtime', 'ingest_events', 'event_id', 'SELECT') AS ingest_event_id_select;

SELECT
    has_table_privilege('validation_b1_runtime', 'visitors', 'DELETE') AS visitors_delete,
    has_table_privilege('validation_b1_runtime', 'sessions', 'DELETE') AS sessions_delete,
    has_table_privilege('validation_b1_runtime', 'pageviews', 'DELETE') AS pageviews_delete,
    has_table_privilege('validation_b1_runtime', 'events', 'DELETE') AS events_delete,
    has_table_privilege('validation_b1_runtime', 'affiliate_clicks', 'DELETE') AS affiliate_delete,
    has_table_privilege('validation_b1_runtime', 'ingest_events', 'DELETE') AS ingest_delete,
    has_table_privilege('validation_b1_runtime', 'rate_limits', 'DELETE') AS rate_limits_delete;

SELECT
    has_table_privilege('validation_b1_runtime', 'sessions', 'TRUNCATE') AS sessions_truncate,
    has_table_privilege('validation_b1_runtime', 'pageviews', 'UPDATE') AS pageviews_update,
    has_table_privilege('validation_b1_runtime', 'events', 'UPDATE') AS events_update,
    has_table_privilege('validation_b1_runtime', 'affiliate_clicks', 'UPDATE') AS affiliate_update,
    has_table_privilege('validation_b1_runtime', 'ingest_events', 'UPDATE') AS ingest_update,
    has_table_privilege('validation_b1_runtime', 'schema_migrations', 'SELECT') AS schema_migrations_select;

SELECT
    pg_has_role('validation_b1_runtime', 'validation_b1_cleanup', 'MEMBER') AS runtime_cleanup_member,
    pg_has_role('validation_b1_runtime', 'neondb_owner', 'MEMBER') AS runtime_owner_member,
    has_schema_privilege('validation_b1_runtime', 'public', 'CREATE') AS runtime_schema_create,
    EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname = 'validation_b1_runtime'
          AND (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls)
    ) AS runtime_admin;
