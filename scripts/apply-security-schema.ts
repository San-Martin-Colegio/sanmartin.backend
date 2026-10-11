import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: path.join(__dirname, '../.env') });

const TABLES = [
  'users',
  'school',
  'groups',
  'categories',
  'inventory_items',
  'teachers',
  'schedules',
  'materials',
  'area_material_stocks',
  'computers',
];

const VALIDATIONS: Record<string, string> = {
  teacherStatus: `SELECT COUNT(*)::int AS count FROM teachers
    WHERE status IS NULL OR status NOT IN ('Activo', 'Inactivo')`,
  teacherEducationLevel: `SELECT COUNT(*)::int AS count FROM teachers
    WHERE education_level IS NULL OR education_level NOT IN (
      'Inicial', 'Primaria', 'Secundaria', 'Administrativo',
      'Directivo', 'Auxiliares', 'Vigilantes'
    )`,
  scheduleDay: `SELECT COUNT(*)::int AS count FROM schedules
    WHERE day IS NULL OR day NOT IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes')`,
  scheduleBlock: `SELECT COUNT(*)::int AS count FROM schedules
    WHERE block IS NULL OR block < 1 OR block > 24`,
  computerStatus: `SELECT COUNT(*)::int AS count FROM computers
    WHERE status IS NULL OR status NOT IN ('Bueno', 'Regular', 'Malo')`,
  inventoryStatus: `SELECT COUNT(*)::int AS count FROM inventory_items
    WHERE status IS NULL OR status NOT IN ('Bueno', 'Regular', 'Malo')`,
  inventoryQuantity: `SELECT COUNT(*)::int AS count FROM inventory_items
    WHERE quantity IS NULL OR quantity < 0`,
  inventoryAssetType: `SELECT COUNT(*)::int AS count FROM inventory_items
    WHERE asset_type IS NOT NULL AND asset_type NOT IN ('material', 'computer')`,
  materialStockQuantity: `SELECT COUNT(*)::int AS count FROM area_material_stocks
    WHERE quantity IS NULL OR quantity < 0`,
};

const EXPECTED_CONSTRAINTS = [
  'chk_teachers_status',
  'chk_teachers_education_level',
  'chk_schedules_day',
  'chk_schedules_block',
  'chk_computers_status',
  'chk_inventory_status',
  'chk_inventory_quantity',
  'chk_inventory_asset_type',
  'chk_material_stock_quantity',
];

function client(): Client {
  const ssl =
    ['require', 'true'].includes(process.env.DB_SSL || '') ||
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined;
  return new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'sistema_inventario_sm',
    ssl,
  });
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  const database = client();
  await database.connect();

  try {
    const counts: Record<string, number> = {};
    for (const table of TABLES) {
      const result = await database.query(`SELECT COUNT(*)::int AS count FROM "${table}"`);
      counts[table] = result.rows[0].count;
    }
    const invalid: Record<string, number> = {};
    for (const [name, query] of Object.entries(VALIDATIONS)) {
      invalid[name] = (await database.query(query)).rows[0].count;
    }
    const existingConstraints = (
      await database.query(
        `SELECT conname FROM pg_constraint WHERE conname = ANY($1::text[]) ORDER BY conname`,
        [EXPECTED_CONSTRAINTS],
      )
    ).rows.map((row) => row.conname);
    const missingConstraints = EXPECTED_CONSTRAINTS.filter(
      (name) => !existingConstraints.includes(name),
    );
    console.log(`Modo: ${apply ? 'APLICAR CAMBIOS' : 'SIMULACIÓN (sin cambios)'}`);
    console.log(JSON.stringify({ counts, invalid, missingConstraints }, null, 2));
    if (Object.values(invalid).some((count) => count > 0)) {
      throw new Error('Hay datos incompatibles con las restricciones; no se realizó ningún cambio.');
    }
    if (!apply) return;

    const backup: Record<string, unknown[]> = {};
    for (const table of TABLES) {
      backup[table] = (await database.query(`SELECT * FROM "${table}" ORDER BY id`)).rows;
    }
    const backupDirectory = path.join(__dirname, '../backups');
    fs.mkdirSync(backupDirectory, { recursive: true, mode: 0o700 });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDirectory, `security-schema-before-${timestamp}.json`);
    fs.writeFileSync(
      backupPath,
      JSON.stringify({ createdAt: new Date().toISOString(), tables: backup }, null, 2),
      { mode: 0o600 },
    );

    const migration = fs.readFileSync(
      path.join(__dirname, '../migrations/005-security-hardening.sql'),
      'utf8',
    );
    await database.query(migration);
    const finalCounts: Record<string, number> = {};
    for (const table of TABLES) {
      finalCounts[table] = (
        await database.query(`SELECT COUNT(*)::int AS count FROM "${table}"`)
      ).rows[0].count;
    }
    if (JSON.stringify(finalCounts) !== JSON.stringify(counts)) {
      throw new Error('La cantidad de registros cambió inesperadamente después de la migración.');
    }
    const finalConstraints = (
      await database.query(
        `SELECT conname FROM pg_constraint WHERE conname = ANY($1::text[])`,
        [EXPECTED_CONSTRAINTS],
      )
    ).rows.map((row) => row.conname);
    const finalMissingConstraints = EXPECTED_CONSTRAINTS.filter(
      (name) => !finalConstraints.includes(name),
    );
    if (finalMissingConstraints.length > 0) {
      throw new Error(`No se crearon estas restricciones: ${finalMissingConstraints.join(', ')}`);
    }
    console.log(`Copia de seguridad: ${backupPath}`);
    console.log(JSON.stringify({ finalCounts }, null, 2));
    console.log('Migración de seguridad aplicada correctamente.');
  } finally {
    await database.end();
  }
}

main().catch((error) => {
  console.error('No se pudo aplicar la migración de seguridad:', error);
  process.exit(1);
});
