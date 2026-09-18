-- Run once on PostgreSQL before deploying the Cómputo module when DB_SYNC is disabled.
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS asset_type varchar NOT NULL DEFAULT 'material';

-- Existing inventory records continue to behave as materials.
UPDATE inventory_items
SET asset_type = 'material'
WHERE asset_type IS NULL;
