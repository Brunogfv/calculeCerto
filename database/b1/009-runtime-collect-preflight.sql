-- Fase 5F.53 - pre-verificacao somente leitura dos grants de collect B1.
-- Executar no Neon B1 antes de aplicar 009-runtime-collect-privileges.sql.
-- Nao altera dados, roles ou privilegios.

SELECT current_database() AS database, current_user AS executor;

SELECT filename, applied_at
FROM schema_migrations
ORDER BY filename;

SELECT count(*)::int AS migrations
FROM schema_migrations;

SELECT count(*)::int AS tabelas_publicas
FROM pg_tables
WHERE schemaname = 'public';

SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sessions'
  AND column_name = 'user_agent';

SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls, rolinherit
FROM pg_roles
WHERE rolname IN ('validation_b1_runtime', 'validation_b1_cleanup', 'neondb_owner')
ORDER BY rolname;

SELECT
    u.rolname AS member,
    g.rolname AS role_granted,
    m.inherit_option,
    m.set_option
FROM pg_auth_members m
JOIN pg_roles u ON u.oid = m.member
JOIN pg_roles g ON g.oid = m.roleid
WHERE u.rolname IN ('validation_b1_runtime', 'validation_b1_cleanup')
ORDER BY u.rolname, g.rolname;

SELECT
    has_database_privilege('validation_b1_runtime', 'validation_b1', 'CONNECT') AS runtime_connect,
    has_schema_privilege('validation_b1_runtime', 'public', 'USAGE') AS runtime_schema_usage,
    has_schema_privilege('validation_b1_runtime', 'public', 'CREATE') AS runtime_schema_create;

SELECT
    c.relname AS tabela,
    r.rolname AS owner,
    has_table_privilege('validation_b1_runtime', c.oid, 'SELECT') AS runtime_select,
    has_table_privilege('validation_b1_runtime', c.oid, 'INSERT') AS runtime_insert,
    has_table_privilege('validation_b1_runtime', c.oid, 'UPDATE') AS runtime_update,
    has_table_privilege('validation_b1_runtime', c.oid, 'DELETE') AS runtime_delete,
    has_table_privilege('validation_b1_runtime', c.oid, 'TRUNCATE') AS runtime_truncate
FROM pg_class c
JOIN pg_roles r ON r.oid = c.relowner
WHERE c.relkind = 'r'
  AND c.relnamespace = 'public'::regnamespace
  AND c.relname IN (
      'visitors', 'sessions', 'pageviews', 'events',
      'affiliate_clicks', 'ingest_events', 'rate_limits'
  )
ORDER BY c.relname;

SELECT
    has_column_privilege('validation_b1_runtime', 'pageviews', 'event_id', 'SELECT') AS pageviews_event_id_select,
    has_column_privilege('validation_b1_runtime', 'events', 'event_id', 'SELECT') AS events_event_id_select,
    has_column_privilege('validation_b1_runtime', 'affiliate_clicks', 'event_id', 'SELECT') AS affiliate_event_id_select,
    has_column_privilege('validation_b1_runtime', 'ingest_events', 'event_id', 'SELECT') AS ingest_event_id_select;
