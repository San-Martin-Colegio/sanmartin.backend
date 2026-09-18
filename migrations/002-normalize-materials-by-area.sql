-- Creates a single material catalog and keeps quantities per area/zone.
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  name varchar NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS area_material_stocks (
  id SERIAL PRIMARY KEY,
  group_id integer NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
  material_id integer NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, material_id)
);

-- Legacy categories with the same normalized name become one catalog material.
INSERT INTO materials (name)
SELECT MIN(TRIM(c.name))
FROM categories c
JOIN inventory_items i ON i.category_id = c.id
WHERE COALESCE(i.asset_type, 'material') = 'material'
GROUP BY LOWER(TRIM(c.name))
ON CONFLICT (name) DO NOTHING;

-- Sum every legacy quantity into its corresponding area and catalog material.
INSERT INTO area_material_stocks (group_id, material_id, quantity)
SELECT c.group_id, m.id, SUM(i.quantity)
FROM inventory_items i
JOIN categories c ON c.id = i.category_id
JOIN materials m ON LOWER(TRIM(m.name)) = LOWER(TRIM(c.name))
WHERE COALESCE(i.asset_type, 'material') = 'material'
GROUP BY c.group_id, m.id
ON CONFLICT (group_id, material_id) DO UPDATE
SET quantity = EXCLUDED.quantity, updated_at = now();
