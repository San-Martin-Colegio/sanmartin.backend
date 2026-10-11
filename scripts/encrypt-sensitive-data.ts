import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';
import { encryptedTextTransformer } from '../src/common/transformers/encrypted-text.transformer';

dotenv.config({ path: path.join(__dirname, '../.env') });

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
  if (!process.env.DATA_ENCRYPTION_KEY) {
    throw new Error('Configura DATA_ENCRYPTION_KEY antes de cifrar datos.');
  }

  const database = client();
  await database.connect();
  try {
    const rows = (
      await database.query(
        'SELECT id, phone, email, address FROM teachers ORDER BY id',
      )
    ).rows;
    const pending = rows.filter((row) =>
      [row.phone, row.email, row.address].some(
        (value) => value && !String(value).startsWith('enc:v1:'),
      ),
    );
    console.log(`Modo: ${apply ? 'APLICAR CIFRADO' : 'SIMULACIÓN (sin cambios)'}`);
    console.log(`Registros pendientes de cifrado: ${pending.length}`);
    if (!apply || pending.length === 0) return;

    const backupDirectory = path.join(__dirname, '../backups');
    fs.mkdirSync(backupDirectory, { recursive: true, mode: 0o700 });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDirectory, `teacher-pii-before-${timestamp}.json`);
    fs.writeFileSync(
      backupPath,
      JSON.stringify({ createdAt: new Date().toISOString(), teachers: rows }, null, 2),
      { mode: 0o600 },
    );

    await database.query('BEGIN');
    try {
      for (const row of pending) {
        await database.query(
          `UPDATE teachers SET phone = $1, email = $2, address = $3, updated_at = NOW()
           WHERE id = $4`,
          [
            encryptedTextTransformer.to(row.phone),
            encryptedTextTransformer.to(row.email),
            encryptedTextTransformer.to(row.address),
            row.id,
          ],
        );
      }
      await database.query('COMMIT');
      console.log(`Copia de seguridad: ${backupPath}`);
      console.log(`Registros cifrados: ${pending.length}`);
    } catch (error) {
      await database.query('ROLLBACK');
      throw error;
    }
  } finally {
    await database.end();
  }
}

main().catch((error) => {
  console.error('No se pudo cifrar la información sensible:', error);
  process.exit(1);
});
