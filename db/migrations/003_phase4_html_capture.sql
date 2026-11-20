CREATE TABLE html_events (
    request_id UUID PRIMARY KEY,
    captured_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    purpose TEXT NOT NULL CHECK (purpose IN ('analytics', 'security')),
    method TEXT NOT NULL CHECK (method = 'GET'),
    path TEXT NOT NULL CHECK (length(path) BETWEEN 1 AND 512),
    status_code SMALLINT NOT NULL CHECK (status_code BETWEEN 100 AND 599),
    country_code CHAR(2),
    accept_language TEXT,
    referrer_host TEXT,
    ua_family TEXT,
    ua_version TEXT,
    client_hints JSONB NOT NULL DEFAULT '{}'::jsonb,
    fetch_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    traffic_class TEXT NOT NULL CHECK (traffic_class IN (
        'likely_human', 'likely_bot', 'automation', 'preview_or_monitoring', 'unknown'
    )),
    bot_family TEXT,
    confidence SMALLINT NOT NULL CHECK (confidence BETWEEN 0 AND 100),
    signals TEXT[] NOT NULL CHECK (cardinality(signals) >= 1),
    classifier_version TEXT NOT NULL,
    sample_rate NUMERIC(5,4) NOT NULL CHECK (sample_rate > 0 AND sample_rate <= 1),
    sampling_method TEXT NOT NULL,
    is_estimate BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$'),
    CHECK (path NOT LIKE '%?%' AND path NOT LIKE '%#%')
);

CREATE TABLE html_traffic_daily (
    day DATE NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('analytics', 'security')),
    path TEXT NOT NULL,
    traffic_class TEXT NOT NULL CHECK (traffic_class IN (
        'likely_human', 'likely_bot', 'automation', 'preview_or_monitoring', 'unknown'
    )),
    bot_family TEXT NOT NULL DEFAULT '',
    country_code TEXT NOT NULL DEFAULT '',
    sample_rate NUMERIC(5,4) NOT NULL CHECK (sample_rate > 0 AND sample_rate <= 1),
    observed_count INTEGER NOT NULL DEFAULT 0 CHECK (observed_count >= 0),
    PRIMARY KEY (day, purpose, path, traffic_class, bot_family, country_code, sample_rate)
);

CREATE TABLE html_indicators_monthly (
    month DATE NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('analytics', 'security')),
    traffic_class TEXT NOT NULL CHECK (traffic_class IN (
        'likely_human', 'likely_bot', 'automation', 'preview_or_monitoring', 'unknown'
    )),
    bot_family TEXT NOT NULL DEFAULT '',
    sample_rate NUMERIC(5,4) NOT NULL CHECK (sample_rate > 0 AND sample_rate <= 1),
    observed_count INTEGER NOT NULL DEFAULT 0 CHECK (observed_count >= 0),
    PRIMARY KEY (month, purpose, traffic_class, bot_family, sample_rate)
);

CREATE TABLE edge_nonces (
    nonce TEXT PRIMARY KEY,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE edge_rate_limits (
    bucket_key TEXT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
    PRIMARY KEY (bucket_key, window_start)
);

CREATE INDEX html_events_captured_at_idx ON html_events (captured_at);
CREATE INDEX html_events_received_at_idx ON html_events (received_at);
CREATE INDEX html_events_purpose_idx ON html_events (purpose);
CREATE INDEX html_events_traffic_class_idx ON html_events (traffic_class);
CREATE INDEX html_events_bot_family_idx ON html_events (bot_family);
CREATE INDEX html_events_path_idx ON html_events (path);
CREATE INDEX html_traffic_daily_day_idx ON html_traffic_daily (day);
CREATE INDEX html_indicators_monthly_month_idx ON html_indicators_monthly (month);
CREATE INDEX edge_nonces_expires_at_idx ON edge_nonces (expires_at);
CREATE INDEX edge_rate_limits_window_start_idx ON edge_rate_limits (window_start);
