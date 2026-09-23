-- Migración segura e idempotente para clasificar docentes por nivel educativo.
-- Los registros existentes pertenecen a Secundaria.
BEGIN;

ALTER TABLE teachers
  ADD COLUMN IF NOT EXISTS education_level varchar NOT NULL DEFAULT 'Secundaria';

UPDATE teachers
SET education_level = 'Secundaria'
WHERE education_level IS NULL OR BTRIM(education_level) = '';

COMMIT;
