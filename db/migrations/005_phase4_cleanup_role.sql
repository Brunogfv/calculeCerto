DO $$
DECLARE
    role_name TEXT := 'analytics_cleanup';
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
        EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), role_name);
        EXECUTE format('GRANT USAGE ON SCHEMA public TO %I', role_name);
        EXECUTE format('REVOKE CREATE ON SCHEMA public FROM %I', role_name);
        EXECUTE format('REVOKE CREATE ON DATABASE %I FROM %I', current_database(), role_name);
        EXECUTE format(
            'GRANT SELECT, DELETE ON TABLE html_events, html_traffic_daily, html_indicators_monthly, edge_daily_counters, edge_nonces, edge_rate_limits TO %I',
            role_name
        );
    END IF;
END $$;
