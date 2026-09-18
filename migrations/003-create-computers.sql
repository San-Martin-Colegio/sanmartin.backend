CREATE TABLE IF NOT EXISTS computers (
  id SERIAL PRIMARY KEY,
  code varchar NOT NULL UNIQUE,
  status varchar NOT NULL DEFAULT 'Bueno',
  area_id integer NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
  observation text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Preserve every existing computer record; legacy name becomes the computer code
-- and legacy notes become the observation.
INSERT INTO computers (code, status, area_id, observation, created_at, updated_at)
SELECT
  CASE WHEN legacy.code_position = 1 THEN legacy.name ELSE legacy.name || '-' || legacy.id END,
  legacy.status, legacy.group_id, legacy.notes, legacy.created_at, legacy.updated_at
FROM (
  SELECT i.id, i.name, i.status, i.notes, i.created_at, i.updated_at, c.group_id,
    ROW_NUMBER() OVER (PARTITION BY i.name ORDER BY i.id) AS code_position
  FROM inventory_items i
  JOIN categories c ON c.id = i.category_id
  WHERE i.asset_type = 'computer'
) AS legacy
ON CONFLICT (code) DO NOTHING;
