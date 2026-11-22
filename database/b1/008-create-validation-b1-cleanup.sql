-- Fase 5F.10 — criação idempotente e validada da role B1 de cleanup.
-- NÃO executar remotamente sem autorização específica.
--
-- Uso local/futuro (a senha vem de variável psql, nunca do arquivo):
--   psql -v validation_b1_cleanup_password='<segredo>' \
--        -d validation_b1 -f database/b1/008-create-validation-b1-cleanup.sql
--
-- Repetir a execução é seguro somente se a role existente estiver exatamente no estado esperado.

\set ON_ERROR_STOP on
\if :{?validation_b1_cleanup_password}
\else
    \echo 'Defina -v validation_b1_cleanup_password=... em canal seguro.'
    \quit
\endif

BEGIN;

DO $$
BEGIN
    IF current_database() <> 'validation_b1' THEN
        RAISE EXCEPTION 'Alvo deve ser validation_b1, atual=%', current_database();
    END IF;
END $$;

-- Cria somente se ausente. A senha não fica no arquivo nem no output.
SELECT format(
    'CREATE ROLE validation_b1_cleanup LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT',
    :'validation_b1_cleanup_password'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'validation_b1_cleanup')
\gexec

DO $$
DECLARE
    r RECORD;
BEGIN
    SELECT rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls,
           rolinherit, rolcanlogin
      INTO r
      FROM pg_roles
     WHERE rolname = 'validation_b1_cleanup';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Role validation_b1_cleanup ausente após criação';
    END IF;
    IF NOT r.rolcanlogin OR r.rolsuper OR r.rolcreatedb OR r.rolcreaterole OR
       r.rolreplication OR r.rolbypassrls OR r.rolinherit THEN
        RAISE EXCEPTION 'Role validation_b1_cleanup com atributo divergente';
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_auth_members m
        JOIN pg_roles u ON u.oid = m.member
        WHERE u.rolname = 'validation_b1_cleanup'
    ) THEN
        RAISE EXCEPTION 'Role validation_b1_cleanup possui membership recebida';
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_auth_members m
        JOIN pg_roles u ON u.oid = m.member
        JOIN pg_roles g ON g.oid = m.roleid
        JOIN pg_roles grantor ON grantor.oid = m.grantor
        WHERE g.rolname = 'validation_b1_cleanup'
          AND NOT (u.rolname = 'neondb_owner' AND grantor.rolname = 'cloud_admin')
    ) THEN
        RAISE EXCEPTION 'Role validation_b1_cleanup possui membership concedida inesperada';
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_roles o ON o.oid = c.relowner
        WHERE o.rolname = 'validation_b1_cleanup'
    ) OR EXISTS (
        SELECT 1 FROM pg_namespace n JOIN pg_roles o ON o.oid = n.nspowner
        WHERE o.rolname = 'validation_b1_cleanup'
    ) THEN
        RAISE EXCEPTION 'Role validation_b1_cleanup possui objetos próprios';
    END IF;
END $$;

COMMIT;
