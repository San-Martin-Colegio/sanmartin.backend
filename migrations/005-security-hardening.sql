BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role varchar NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS token_version integer NOT NULL DEFAULT 0;

ALTER TABLE teachers
  ALTER COLUMN phone TYPE text,
  ALTER COLUMN email TYPE text,
  ALTER COLUMN address TYPE text;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

ALTER TABLE teachers DROP CONSTRAINT IF EXISTS chk_teachers_status;
ALTER TABLE teachers ADD CONSTRAINT chk_teachers_status
  CHECK (status IN ('Activo', 'Inactivo'));

ALTER TABLE teachers DROP CONSTRAINT IF EXISTS chk_teachers_education_level;
ALTER TABLE teachers ADD CONSTRAINT chk_teachers_education_level
  CHECK (education_level IN (
    'Inicial', 'Primaria', 'Secundaria', 'Administrativo',
    'Directivo', 'Auxiliares', 'Vigilantes'
  ));

ALTER TABLE schedules DROP CONSTRAINT IF EXISTS chk_schedules_day;
ALTER TABLE schedules ADD CONSTRAINT chk_schedules_day
  CHECK (day IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'));

ALTER TABLE schedules DROP CONSTRAINT IF EXISTS chk_schedules_block;
ALTER TABLE schedules ADD CONSTRAINT chk_schedules_block CHECK (block BETWEEN 1 AND 24);

ALTER TABLE computers DROP CONSTRAINT IF EXISTS chk_computers_status;
ALTER TABLE computers ADD CONSTRAINT chk_computers_status
  CHECK (status IN ('Bueno', 'Regular', 'Malo'));

ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS chk_inventory_status;
ALTER TABLE inventory_items ADD CONSTRAINT chk_inventory_status
  CHECK (status IN ('Bueno', 'Regular', 'Malo'));

ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS chk_inventory_quantity;
ALTER TABLE inventory_items ADD CONSTRAINT chk_inventory_quantity CHECK (quantity >= 0);

ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS chk_inventory_asset_type;
ALTER TABLE inventory_items ADD CONSTRAINT chk_inventory_asset_type
  CHECK (asset_type IN ('material', 'computer'));

ALTER TABLE area_material_stocks DROP CONSTRAINT IF EXISTS chk_material_stock_quantity;
ALTER TABLE area_material_stocks ADD CONSTRAINT chk_material_stock_quantity CHECK (quantity >= 0);

COMMIT;
