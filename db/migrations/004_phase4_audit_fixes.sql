CREATE TABLE edge_daily_counters (
    day DATE NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose = 'analytics'),
    count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
    PRIMARY KEY (day, purpose)
);

ALTER TABLE html_events
    ADD CONSTRAINT html_events_analytics_only CHECK (purpose = 'analytics');

ALTER TABLE html_traffic_daily
    ADD CONSTRAINT html_traffic_daily_analytics_only CHECK (purpose = 'analytics');

ALTER TABLE html_indicators_monthly
    ADD CONSTRAINT html_indicators_monthly_analytics_only CHECK (purpose = 'analytics');

DO $$
DECLARE
    role_name TEXT := 'analytics_runtime';
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
        EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), role_name);
        EXECUTE format('GRANT USAGE ON SCHEMA public TO %I', role_name);
        EXECUTE format(
            'GRANT SELECT, INSERT, UPDATE ON TABLE html_events, html_traffic_daily, html_indicators_monthly, edge_nonces, edge_rate_limits, edge_daily_counters TO %I',
            role_name
        );
    END IF;
END $$;
