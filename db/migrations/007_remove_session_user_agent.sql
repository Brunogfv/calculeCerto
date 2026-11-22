-- Remove a persistencia do User-Agent bruto da tabela de sessoes.
-- A classificacao derivada usada pela aplicacao permanece em device_type, browser,
-- os e is_test; a string original nao e necessaria para retencao ou analytics.

ALTER TABLE sessions
    DROP COLUMN IF EXISTS user_agent;
