import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';
import {
  INITIAL_SCHEDULE_BLOCKS,
  PRIMARY_SCHEDULE_BLOCKS,
  SCHEDULE_DAYS,
  ScheduleBlockInfo,
} from '../src/schedules/constants/schedule-blocks';

dotenv.config({ path: path.join(__dirname, '../.env') });

type EducationLevel = 'Inicial' | 'Primaria';
type Shift = 'M' | 'T';

interface TeacherSeed {
  educationLevel: EducationLevel;
  lastName: string;
  gradeSection: string;
  shift: Shift;
}

interface TeacherRow {
  id: number;
  first_name: string;
  last_name: string;
  education_level: string;
}

interface GroupRow {
  id: number;
  name: string;
}

interface MaterialRow {
  id: number;
  name: string;
}

const TEACHER_SCHEDULES: TeacherSeed[] = [
  { educationLevel: 'Inicial', lastName: 'Pizarro Núñez', gradeSection: '3A', shift: 'M' },
  { educationLevel: 'Inicial', lastName: 'Gonzales Reyna', gradeSection: '3B', shift: 'T' },
  { educationLevel: 'Inicial', lastName: 'Tang Cruz', gradeSection: '4A', shift: 'M' },
  { educationLevel: 'Inicial', lastName: 'Marquina Siccha', gradeSection: '4B', shift: 'T' },
  { educationLevel: 'Inicial', lastName: 'Bon Blas', gradeSection: '5A', shift: 'M' },
  { educationLevel: 'Inicial', lastName: 'Liza Marcelo', gradeSection: '5B', shift: 'T' },

  { educationLevel: 'Primaria', lastName: 'Vásquez Marquina', gradeSection: '1ro A', shift: 'M' },
  { educationLevel: 'Primaria', lastName: 'Montoya Diaz', gradeSection: '1ro B', shift: 'M' },
  { educationLevel: 'Primaria', lastName: 'Espinoza Chiclayo', gradeSection: '1ro C', shift: 'T' },
  { educationLevel: 'Primaria', lastName: 'Blas Rodríguez', gradeSection: '2do A', shift: 'M' },
  { educationLevel: 'Primaria', lastName: 'Pinedo Banda', gradeSection: '2do B', shift: 'M' },
  { educationLevel: 'Primaria', lastName: 'Díaz Obando', gradeSection: '2do C', shift: 'T' },
  { educationLevel: 'Primaria', lastName: 'Abanto Rosas', gradeSection: '2do D', shift: 'T' },
  { educationLevel: 'Primaria', lastName: 'Vela López', gradeSection: '3ro A', shift: 'M' },
  { educationLevel: 'Primaria', lastName: 'Gago Alcedo', gradeSection: '3ro B', shift: 'M' },
  { educationLevel: 'Primaria', lastName: 'Quiroz Perez', gradeSection: '3ro C', shift: 'T' },
  { educationLevel: 'Primaria', lastName: 'Vásquez Castro', gradeSection: '3ro D', shift: 'T' },
  { educationLevel: 'Primaria', lastName: 'Ledesma Diez', gradeSection: '4to A', shift: 'M' },
  { educationLevel: 'Primaria', lastName: 'Díaz Castillo', gradeSection: '4to B', shift: 'M' },
  { educationLevel: 'Primaria', lastName: 'Zavaleta Valle', gradeSection: '4to C', shift: 'T' },
  { educationLevel: 'Primaria', lastName: 'Sagastegui Saldaña', gradeSection: '4to D', shift: 'T' },
  { educationLevel: 'Primaria', lastName: 'Ponce Zavala', gradeSection: '5to A', shift: 'M' },
  { educationLevel: 'Primaria', lastName: 'Loaces Soto', gradeSection: '5to B', shift: 'M' },
  { educationLevel: 'Primaria', lastName: 'Diaz Huaylla', gradeSection: '5to C', shift: 'T' },
  { educationLevel: 'Primaria', lastName: 'Castillo Vidal', gradeSection: '5to D', shift: 'T' },
  { educationLevel: 'Primaria', lastName: 'Flores Rengifo', gradeSection: '6to A', shift: 'M' },
  { educationLevel: 'Primaria', lastName: 'Alvarez Alcantara', gradeSection: '6to B', shift: 'T' },
  { educationLevel: 'Primaria', lastName: 'Sabana Charcape', gradeSection: '6to C', shift: 'T' },
];

const TARGET_AREAS = [
  ...Array.from({ length: 11 }, (_, index) => `P-${index + 1}`),
  ...Array.from({ length: 15 }, (_, index) => `S-${index + 1}`),
];

const STOCKS: ReadonlyArray<{ material: string; quantity: number }> = [
  { material: 'Mesas', quantity: 35 },
  { material: 'Sillas', quantity: 35 },
  { material: 'Escritorio', quantity: 1 },
  { material: 'Estante', quantity: 1 },
  { material: 'Pizarra', quantity: 2 },
  { material: 'Trifolios', quantity: 2 },
];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function blocksFor(seed: TeacherSeed): ScheduleBlockInfo[] {
  const blocks =
    seed.educationLevel === 'Inicial'
      ? INITIAL_SCHEDULE_BLOCKS
      : PRIMARY_SCHEDULE_BLOCKS;
  const firstAfternoonBlock = seed.educationLevel === 'Inicial' ? 6 : 7;

  return blocks.filter((block) =>
    seed.shift === 'M'
      ? block.block < firstAfternoonBlock
      : block.block >= firstAfternoonBlock,
  );
}

function databaseClient(): Client {
  const useSsl =
    process.env.DB_SSL === 'require' ||
    process.env.DB_SSL === 'true' ||
    process.env.NODE_ENV === 'production';

  return new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'sistema_inventario_sm',
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  const client = databaseClient();
  await client.connect();

  try {
    const inspection = await client.query<{
      teachers: TeacherRow[];
      groups: GroupRow[];
      materials: MaterialRow[];
    }>(
      `SELECT
        COALESCE(
          (SELECT json_agg(row_to_json(t)) FROM (
            SELECT id, first_name, last_name, education_level
            FROM teachers
            WHERE education_level = ANY($1::text[])
          ) t),
          '[]'::json
        ) AS teachers,
        COALESCE(
          (SELECT json_agg(row_to_json(g)) FROM (SELECT id, name FROM groups) g),
          '[]'::json
        ) AS groups,
        COALESCE(
          (SELECT json_agg(row_to_json(m)) FROM (SELECT id, name FROM materials) m),
          '[]'::json
        ) AS materials`,
      [['Inicial', 'Primaria']],
    );
    const { teachers, groups, materials } = inspection.rows[0];

    const resolvedTeachers = TEACHER_SCHEDULES.map((seed) => {
      const matches = teachers.filter(
        (teacher) =>
          teacher.education_level === seed.educationLevel &&
          normalize(teacher.last_name) === normalize(seed.lastName),
      );
      if (matches.length !== 1) {
        throw new Error(
          `Se esperaba un docente ${seed.educationLevel} con apellido "${seed.lastName}"; coincidencias: ${matches.length}.`,
        );
      }
      return { seed, teacher: matches[0] };
    });

    const resolvedGroups = TARGET_AREAS.map((areaName) => {
      const matches = groups.filter((group) => normalize(group.name) === normalize(areaName));
      if (matches.length !== 1) {
        throw new Error(
          `Se esperaba un área "${areaName}"; coincidencias: ${matches.length}.`,
        );
      }
      return matches[0];
    });

    const existingMaterialNames = new Set(materials.map((material) => normalize(material.name)));
    const missingMaterials = STOCKS.filter(
      (stock) => !existingMaterialNames.has(normalize(stock.material)),
    ).map((stock) => stock.material);
    const scheduleRows = resolvedTeachers.reduce(
      (total, item) => total + blocksFor(item.seed).length * SCHEDULE_DAYS.length,
      0,
    );

    console.log(`Modo: ${apply ? 'APLICAR CAMBIOS' : 'SIMULACIÓN (sin cambios)'}`);
    console.log(`Docentes validados: ${resolvedTeachers.length}`);
    console.log(`Horarios que quedarán registrados: ${scheduleRows}`);
    console.log(`Áreas validadas: ${resolvedGroups.length}`);
    console.log(`Existencias que quedarán registradas: ${resolvedGroups.length * STOCKS.length}`);
    console.log(
      `Materiales nuevos: ${missingMaterials.length ? missingMaterials.join(', ') : 'ninguno'}`,
    );

    if (!apply) {
      console.log('Simulación correcta. Ejecuta el mismo comando con --apply para guardar.');
      return;
    }

    const teacherIds = resolvedTeachers.map((item) => item.teacher.id);
    const groupIds = resolvedGroups.map((group) => group.id);
    const backupData = await client.query<{
      schedules: unknown[];
      area_material_stocks: unknown[];
    }>(
      `SELECT
        COALESCE(
          (SELECT json_agg(row_to_json(s) ORDER BY s.teacher_id, s.day, s.block)
           FROM schedules s WHERE s.teacher_id = ANY($1::int[])),
          '[]'::json
        ) AS schedules,
        COALESCE(
          (SELECT json_agg(row_to_json(stock) ORDER BY stock.group_name, stock.material_name)
           FROM (
             SELECT ams.*, g.name AS group_name, m.name AS material_name
             FROM area_material_stocks ams
             JOIN groups g ON g.id = ams.group_id
             JOIN materials m ON m.id = ams.material_id
             WHERE ams.group_id = ANY($2::int[])
           ) stock),
          '[]'::json
        ) AS area_material_stocks`,
      [teacherIds, groupIds],
    );

    const backupDirectory = path.join(__dirname, '../backups');
    fs.mkdirSync(backupDirectory, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDirectory, `school-data-before-${timestamp}.json`);
    fs.writeFileSync(
      backupPath,
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          teacherIds,
          groupIds,
          schedules: backupData.rows[0].schedules,
          areaMaterialStocks: backupData.rows[0].area_material_stocks,
        },
        null,
        2,
      ),
    );

    await client.query('BEGIN');
    try {
      const scheduleValues = resolvedTeachers.flatMap(({ seed, teacher }) =>
        SCHEDULE_DAYS.flatMap((day) =>
          blocksFor(seed).map((block) => ({
            teacherId: teacher.id,
            day,
            block: block.block,
            startTime: block.startTime,
            endTime: block.endTime,
            subject: 'Educación',
            gradeSection: seed.gradeSection,
            classroom: `Aula ${seed.gradeSection}`,
          })),
        ),
      );

      const stockValues = resolvedGroups.flatMap((group) =>
        STOCKS.map((stock) => ({
          groupId: group.id,
          materialName: stock.material,
          quantity: stock.quantity,
        })),
      );

      const result = await client.query<{
        schedules_saved: number;
        stocks_saved: number;
      }>(
        `WITH created_materials AS (
           INSERT INTO materials (name, created_at, updated_at)
           SELECT material_name, NOW(), NOW()
           FROM UNNEST($1::text[]) AS names(material_name)
           ON CONFLICT (name) DO NOTHING
           RETURNING id, name
         ),
         removed_schedules AS (
           DELETE FROM schedules WHERE teacher_id = ANY($2::int[])
           RETURNING id
         ),
         saved_schedules AS (
           INSERT INTO schedules
             (teacher_id, day, block, start_time, end_time, subject, grade_section, classroom, created_at, updated_at)
           SELECT teacher_id, day, block, start_time, end_time, subject, grade_section, classroom, NOW(), NOW()
           FROM UNNEST(
             $3::int[], $4::text[], $5::int[], $6::text[],
             $7::text[], $8::text[], $9::text[], $10::text[]
           ) AS rows(teacher_id, day, block, start_time, end_time, subject, grade_section, classroom)
           RETURNING id
         ),
         available_materials AS (
           SELECT id, name FROM materials WHERE name = ANY($1::text[])
           UNION ALL
           SELECT id, name FROM created_materials
         ),
         saved_stocks AS (
           INSERT INTO area_material_stocks
             (group_id, material_id, quantity, created_at, updated_at)
           SELECT stock.group_id, material.id, stock.quantity, NOW(), NOW()
           FROM UNNEST($11::int[], $12::text[], $13::int[])
             AS stock(group_id, material_name, quantity)
           JOIN available_materials material ON material.name = stock.material_name
           ON CONFLICT (group_id, material_id)
           DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW()
           RETURNING id
         )
         SELECT
           (SELECT COUNT(*)::int FROM saved_schedules) AS schedules_saved,
           (SELECT COUNT(*)::int FROM saved_stocks) AS stocks_saved`,
        [
          STOCKS.map((stock) => stock.material),
          teacherIds,
          scheduleValues.map((value) => value.teacherId),
          scheduleValues.map((value) => value.day),
          scheduleValues.map((value) => value.block),
          scheduleValues.map((value) => value.startTime),
          scheduleValues.map((value) => value.endTime),
          scheduleValues.map((value) => value.subject),
          scheduleValues.map((value) => value.gradeSection),
          scheduleValues.map((value) => value.classroom),
          stockValues.map((value) => value.groupId),
          stockValues.map((value) => value.materialName),
          stockValues.map((value) => value.quantity),
        ],
      );

      await client.query('COMMIT');
      console.log(`Copia de seguridad creada en: ${backupPath}`);
      console.log(`Horarios guardados: ${result.rows[0].schedules_saved}`);
      console.log(`Existencias guardadas: ${result.rows[0].stocks_saved}`);
      console.log('Carga finalizada correctamente.');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error al cargar horarios y materiales:', error);
  process.exit(1);
});
