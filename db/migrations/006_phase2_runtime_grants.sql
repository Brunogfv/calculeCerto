DO $$
DECLARE
    role_name TEXT := 'analytics_runtime';
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
        EXECUTE format('GRANT USAGE ON SCHEMA public TO %I', role_name);
        EXECUTE format(
            'GRANT SELECT, INSERT, UPDATE ON TABLE visitors TO %I',
            role_name
        );
        EXECUTE format(
            'GRANT SELECT, INSERT, UPDATE ON TABLE sessions, rate_limits TO %I',
            role_name
        );
        EXECUTE format(
            'GRANT SELECT, INSERT ON TABLE pageviews, events, ingest_events TO %I',
            role_name
        );
        EXECUTE format(
            'GRANT SELECT, INSERT ON TABLE affiliate_clicks TO %I',
            role_name
        );
    END IF;
END $$;
