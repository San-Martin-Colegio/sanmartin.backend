import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';
import { SCHEDULE_DAYS, getScheduleBlock } from '../src/schedules/constants/schedule-blocks';

dotenv.config({ path: path.join(__dirname, '../.env') });

type StaffCategory = 'Administrativo' | 'Directivo' | 'Auxiliares';

interface StaffSeed {
  firstName: string;
  lastName: string;
  phone?: string;
  specialty: string;
  educationLevel: StaffCategory;
  shifts: Record<string, number>;
}

interface TeacherRow {
  id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  specialty: string | null;
  education_level: string;
}

const allWeek = (block: number): Record<string, number> =>
  Object.fromEntries(SCHEDULE_DAYS.map((day) => [day, block]));

const STAFF: StaffSeed[] = [
  {
    firstName: 'Bety Soledad',
    lastName: 'Ruiz Zamora',
    phone: '945134747',
    specialty: 'Secretaría',
    educationLevel: 'Administrativo',
    shifts: allWeek(2),
  },
  {
    firstName: 'Milagros De Jesús',
    lastName: 'Cruz Morachimo',
    phone: '920719162',
    specialty: 'Auxiliar de Biblioteca',
    educationLevel: 'Administrativo',
    shifts: allWeek(1),
  },
  {
    firstName: 'Edwin Joselito',
    lastName: 'Mendoza Serrano',
    phone: '944414505',
    specialty: 'Auxiliar de Laboratorio',
    educationLevel: 'Administrativo',
    shifts: allWeek(2),
  },
  {
    firstName: 'Milton',
    lastName: 'Correa Aguilar',
    phone: '949243486',
    specialty: 'Personal de Servicio',
    educationLevel: 'Administrativo',
    shifts: allWeek(2),
  },
  {
    firstName: 'Carlos',
    lastName: 'Ellen Mory',
    phone: '988759651',
    specialty: 'Personal de Servicio',
    educationLevel: 'Administrativo',
    shifts: allWeek(5),
  },
  {
    firstName: 'Carlos',
    lastName: 'Chávez Rojas',
    phone: '949401032',
    specialty: 'Personal de Servicio',
    educationLevel: 'Administrativo',
    shifts: allWeek(3),
  },
  {
    firstName: 'Antonia',
    lastName: 'Villar Pinedo',
    phone: '950433399',
    specialty: 'Personal de Servicio',
    educationLevel: 'Administrativo',
    shifts: allWeek(4),
  },
  {
    firstName: 'Yuriko Yessebel',
    lastName: 'Vásquez Parimango',
    phone: '938359387',
    specialty: 'Personal de Servicio',
    educationLevel: 'Administrativo',
    shifts: allWeek(2),
  },
  {
    firstName: 'Richard Lenin',
    lastName: 'Paredes Varas',
    phone: '977254870',
    specialty: 'Personal de Servicio',
    educationLevel: 'Administrativo',
    shifts: allWeek(2),
  },
  {
    firstName: 'Silvia Esther',
    lastName: 'Alvitres Malca',
    phone: '948425496',
    specialty: 'Auxiliar de Educación',
    educationLevel: 'Auxiliares',
    shifts: allWeek(2),
  },
  {
    firstName: 'Willy',
    lastName: 'Sedano Flores',
    specialty: 'Auxiliar de Educación',
    educationLevel: 'Auxiliares',
    shifts: allWeek(1),
  },
  {
    firstName: 'Magaly',
    lastName: 'Alva Alcantara',
    specialty: 'Auxiliar de Educación',
    educationLevel: 'Auxiliares',
    shifts: allWeek(1),
  },
  {
    firstName: 'Diana',
    lastName: 'Florian de Miñano',
    specialty: 'Psicología',
    educationLevel: 'Administrativo',
    shifts: allWeek(2),
  },
  {
    firstName: 'Rosa Linda',
    lastName: 'Valverde Lozano',
    phone: '940221774',
    specialty: 'Subdirectora de Inicial y Primaria',
    educationLevel: 'Directivo',
    shifts: { Lunes: 1, Martes: 2, Miércoles: 1, Jueves: 1, Viernes: 2 },
  },
  {
    firstName: 'María Del Pilar',
    lastName: 'Mora Esquivel',
    phone: '948483334',
    specialty: 'Subdirectora de Primaria',
    educationLevel: 'Directivo',
    shifts: { Lunes: 2, Martes: 1, Miércoles: 2, Jueves: 1, Viernes: 2 },
  },
  {
    firstName: 'Libertad Brazilia',
    lastName: 'Vigo Zamora',
    specialty: 'Subdirectora de Secundaria',
    educationLevel: 'Directivo',
    shifts: allWeek(1),
  },
  {
    firstName: 'Elver Ademar',
    lastName: 'Briceño Obando',
    specialty: 'Director de la I.E.',
    educationLevel: 'Directivo',
    shifts: { Lunes: 1, Martes: 2, Miércoles: 1, Jueves: 2, Viernes: 1 },
  },
];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function createClient(): Client {
  const ssl =
    process.env.DB_SSL === 'require' ||
    process.env.DB_SSL === 'true' ||
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
  const client = createClient();
  await client.connect();

  try {
    const teachers = (await client.query<TeacherRow>(
      `SELECT id, first_name, last_name, phone, specialty, education_level
       FROM teachers`,
    )).rows;

    const resolved = STAFF.map((seed) => {
      const matches = teachers.filter(
        (teacher) => normalize(teacher.last_name) === normalize(seed.lastName),
      );
      if (matches.length > 1) {
        throw new Error(`Hay más de un registro para ${seed.lastName}.`);
      }
      return { seed, teacher: matches[0] };
    });

    for (const { seed } of resolved) {
      for (const [day, block] of Object.entries(seed.shifts)) {
        if (!SCHEDULE_DAYS.includes(day)) {
          throw new Error(`Día inválido para ${seed.lastName}: ${day}.`);
        }
        if (!getScheduleBlock(seed.educationLevel, block)) {
          throw new Error(`Turno inválido para ${seed.lastName}: bloque ${block}.`);
        }
      }
    }

    const existingCount = resolved.filter((item) => item.teacher).length;
    const scheduleCount = STAFF.reduce(
      (total, person) => total + Object.keys(person.shifts).length,
      0,
    );

    console.log(`Modo: ${apply ? 'APLICAR CAMBIOS' : 'SIMULACIÓN (sin cambios)'}`);
    console.log(`Personal validado: ${STAFF.length}`);
    console.log(`Registros existentes que se reutilizarán: ${existingCount}`);
    console.log(`Registros nuevos: ${STAFF.length - existingCount}`);
    console.log(`Turnos semanales que quedarán registrados: ${scheduleCount}`);

    if (!apply) {
      console.log('Simulación correcta. Usa --apply para guardar los datos.');
      return;
    }

    const existingIds = resolved
      .map((item) => item.teacher?.id)
      .filter((id): id is number => id !== undefined);
    const backup = await client.query(
      `SELECT json_build_object(
         'teachers', COALESCE((SELECT json_agg(row_to_json(t)) FROM teachers t WHERE t.id = ANY($1::int[])), '[]'::json),
         'schedules', COALESCE((SELECT json_agg(row_to_json(s)) FROM schedules s WHERE s.teacher_id = ANY($1::int[])), '[]'::json)
       ) AS data`,
      [existingIds.length ? existingIds : [-1]],
    );
    const backupDirectory = path.join(__dirname, '../backups');
    fs.mkdirSync(backupDirectory, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDirectory, `staff-before-${timestamp}.json`);
    fs.writeFileSync(
      backupPath,
      JSON.stringify({ createdAt: new Date().toISOString(), ...backup.rows[0].data }, null, 2),
    );

    await client.query('BEGIN');
    try {
      const existingSeeds = resolved.filter((item) => item.teacher);
      if (existingSeeds.length) {
        await client.query(
          `UPDATE teachers AS teacher
           SET education_level = data.education_level,
               specialty = data.specialty,
               phone = COALESCE(NULLIF(data.phone, ''), teacher.phone),
               updated_at = NOW()
           FROM UNNEST($1::int[], $2::text[], $3::text[], $4::text[])
             AS data(id, education_level, specialty, phone)
           WHERE teacher.id = data.id`,
          [
            existingSeeds.map((item) => item.teacher!.id),
            existingSeeds.map((item) => item.seed.educationLevel),
            existingSeeds.map((item) => item.seed.specialty),
            existingSeeds.map((item) => item.seed.phone || ''),
          ],
        );
      }

      const newSeeds = resolved.filter((item) => !item.teacher).map((item) => item.seed);
      if (newSeeds.length) {
        await client.query(
          `INSERT INTO teachers
            (first_name, last_name, phone, specialty, education_level, status, created_at, updated_at)
           SELECT first_name, last_name, NULLIF(phone, ''), specialty, education_level, 'Activo', NOW(), NOW()
           FROM UNNEST($1::text[], $2::text[], $3::text[], $4::text[], $5::text[])
             AS data(first_name, last_name, phone, specialty, education_level)`,
          [
            newSeeds.map((seed) => seed.firstName),
            newSeeds.map((seed) => seed.lastName),
            newSeeds.map((seed) => seed.phone || ''),
            newSeeds.map((seed) => seed.specialty),
            newSeeds.map((seed) => seed.educationLevel),
          ],
        );
      }

      const savedTeachers = (await client.query<TeacherRow>(
        `SELECT id, first_name, last_name, phone, specialty, education_level
         FROM teachers
         WHERE education_level = ANY($1::text[])`,
        [['Administrativo', 'Directivo', 'Auxiliares']],
      )).rows;

      const teacherByLastName = new Map(
        savedTeachers.map((teacher) => [normalize(teacher.last_name), teacher]),
      );
      const targetIds = STAFF.map((seed) => {
        const teacher = teacherByLastName.get(normalize(seed.lastName));
        if (!teacher) throw new Error(`No se encontró a ${seed.lastName} después de guardar.`);
        return teacher.id;
      });

      await client.query('DELETE FROM schedules WHERE teacher_id = ANY($1::int[])', [targetIds]);

      const scheduleRows = STAFF.flatMap((seed) => {
        const teacher = teacherByLastName.get(normalize(seed.lastName))!;
        return Object.entries(seed.shifts).map(([day, block]) => {
          const blockInfo = getScheduleBlock(seed.educationLevel, block)!;
          return {
            teacherId: teacher.id,
            day,
            block,
            startTime: blockInfo.startTime,
            endTime: blockInfo.endTime,
            subject: seed.specialty,
            classroom:
              seed.educationLevel === 'Directivo'
                ? 'Dirección'
                : seed.educationLevel === 'Auxiliares'
                  ? 'Auxiliares'
                  : seed.specialty === 'Psicología'
                    ? 'Psicología'
                    : 'Personal administrativo',
          };
        });
      });

      await client.query(
        `INSERT INTO schedules
          (teacher_id, day, block, start_time, end_time, subject, classroom, created_at, updated_at)
         SELECT teacher_id, day, block, start_time, end_time, subject, classroom, NOW(), NOW()
         FROM UNNEST(
           $1::int[], $2::text[], $3::int[], $4::text[],
           $5::text[], $6::text[], $7::text[]
         ) AS data(teacher_id, day, block, start_time, end_time, subject, classroom)`,
        [
          scheduleRows.map((row) => row.teacherId),
          scheduleRows.map((row) => row.day),
          scheduleRows.map((row) => row.block),
          scheduleRows.map((row) => row.startTime),
          scheduleRows.map((row) => row.endTime),
          scheduleRows.map((row) => row.subject),
          scheduleRows.map((row) => row.classroom),
        ],
      );

      await client.query('COMMIT');
      console.log(`Copia de seguridad: ${backupPath}`);
      console.log(`Personal guardado: ${STAFF.length}`);
      console.log(`Turnos guardados: ${scheduleRows.length}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error al cargar personal y horarios:', error);
  process.exit(1);
});
