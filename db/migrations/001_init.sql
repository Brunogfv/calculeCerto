-- Portal das Contas Analytics — schema inicial (Fase 2)
-- Não armazena IP completo, valores de calculadoras ou resultados.

CREATE TABLE visitors (
    visitor_id TEXT PRIMARY KEY,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
    session_id UUID PRIMARY KEY,
    visitor_id TEXT NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    landing_path TEXT,
    exit_path TEXT,
    referrer TEXT,
    referrer_host TEXT,
    source TEXT,
    medium TEXT,
    campaign TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    pageview_count INTEGER NOT NULL DEFAULT 0,
    event_count INTEGER NOT NULL DEFAULT 0,
    engagement_ms BIGINT NOT NULL DEFAULT 0,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    screen_width INTEGER,
    screen_height INTEGER,
    language TEXT,
    country_code TEXT,
    region TEXT,
    city TEXT,
    user_agent TEXT,
    bot_class TEXT NOT NULL DEFAULT 'INDETERMINADO'
        CHECK (bot_class IN ('HUMANO_PROVAVEL', 'BOT_CONHECIDO', 'SUSPEITO', 'INDETERMINADO')),
    bot_score SMALLINT NOT NULL DEFAULT 0 CHECK (bot_score BETWEEN 0 AND 100),
    bot_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_test BOOLEAN NOT NULL DEFAULT false,
    consent_version TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pageviews (
    event_id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    visitor_id TEXT NOT NULL,
    path TEXT NOT NULL,
    title TEXT,
    referrer TEXT,
    referrer_host TEXT,
    occurred_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    engagement_ms BIGINT NOT NULL DEFAULT 0,
    bot_class TEXT NOT NULL DEFAULT 'INDETERMINADO'
        CHECK (bot_class IN ('HUMANO_PROVAVEL', 'BOT_CONHECIDO', 'SUSPEITO', 'INDETERMINADO')),
    is_test BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE events (
    event_id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    visitor_id TEXT NOT NULL,
    name TEXT NOT NULL,
    page_path TEXT,
    target TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    bot_class TEXT NOT NULL DEFAULT 'INDETERMINADO'
        CHECK (bot_class IN ('HUMANO_PROVAVEL', 'BOT_CONHECIDO', 'SUSPEITO', 'INDETERMINADO')),
    is_test BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE affiliate_clicks (
    event_id UUID PRIMARY KEY REFERENCES events(event_id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    visitor_id TEXT NOT NULL,
    product TEXT NOT NULL,
    category TEXT,
    slot TEXT,
    page_path TEXT,
    occurred_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_test BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE rate_limits (
    bucket_key TEXT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (bucket_key, window_start)
);

CREATE INDEX sessions_started_at_idx ON sessions (started_at);
CREATE INDEX sessions_visitor_id_idx ON sessions (visitor_id);
CREATE INDEX sessions_bot_class_idx ON sessions (bot_class);
CREATE INDEX sessions_country_code_idx ON sessions (country_code);
CREATE INDEX sessions_source_idx ON sessions (source);
CREATE INDEX pageviews_received_at_idx ON pageviews (received_at);
CREATE INDEX pageviews_session_id_idx ON pageviews (session_id);
CREATE INDEX pageviews_path_idx ON pageviews (path);
CREATE INDEX events_received_at_idx ON events (received_at);
CREATE INDEX events_session_id_idx ON events (session_id);
CREATE INDEX events_name_idx ON events (name);
CREATE INDEX affiliate_clicks_received_at_idx ON affiliate_clicks (received_at);
CREATE INDEX affiliate_clicks_product_idx ON affiliate_clicks (product);
CREATE INDEX affiliate_clicks_category_idx ON affiliate_clicks (category);
CREATE INDEX affiliate_clicks_slot_idx ON affiliate_clicks (slot);
CREATE INDEX rate_limits_window_start_idx ON rate_limits (window_start);
