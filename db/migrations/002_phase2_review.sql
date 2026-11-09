-- Ajustes da revisão final da Fase 2.

-- Deduplicação global: um event_id só pode ser processado uma vez,
-- independentemente de ser pageview, evento de calculadora ou afiliado.
CREATE TABLE ingest_events (
    event_id UUID PRIMARY KEY,
    event_name TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ingest_events_received_at_idx ON ingest_events (received_at);

-- Integridade do visitante nas tabelas de detalhe.
ALTER TABLE pageviews
    ADD CONSTRAINT pageviews_visitor_id_fk
    FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE;

ALTER TABLE events
    ADD CONSTRAINT events_visitor_id_fk
    FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE;

ALTER TABLE affiliate_clicks
    ADD CONSTRAINT affiliate_clicks_visitor_id_fk
    FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE;

-- Slots de afiliado e contadores não podem ser inválidos.
ALTER TABLE affiliate_clicks
    ALTER COLUMN slot SET NOT NULL;

ALTER TABLE sessions
    ADD CONSTRAINT sessions_counters_nonnegative
    CHECK (pageview_count >= 0 AND event_count >= 0 AND engagement_ms >= 0);

ALTER TABLE rate_limits
    ADD CONSTRAINT rate_limits_count_nonnegative
    CHECK (count >= 0);
