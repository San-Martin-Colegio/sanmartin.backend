import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as sqlite3 from 'sqlite3';

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

import { User } from '../src/users/entities/user.entity';
import { School } from '../src/school/entities/school.entity';
import { Group } from '../src/groups/entities/group.entity';
import { Category } from '../src/categories/entities/category.entity';
import { InventoryItem } from '../src/inventory/entities/inventory-item.entity';
import { Teacher } from '../src/teachers/entities/teacher.entity';
import { Schedule } from '../src/schedules/entities/schedule.entity';
import { SCHEDULE_BLOCKS } from '../src/schedules/constants/schedule-blocks';

async function runMigration() {
  console.log('🔄 Iniciando migración de SQLite a PostgreSQL...');

  const sqlitePath = path.join(__dirname, '../../data/inventario.db');
  const sqliteExists = fs.existsSync(sqlitePath);

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'sistema_inventario_sm',
    entities: [User, School, Group, Category, InventoryItem, Teacher, Schedule],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado exitosamente a PostgreSQL.');
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error);
    console.log('Asegúrate de que PostgreSQL esté en ejecución y la base de datos exista.');
    process.exit(1);
  }

  const userRepo = dataSource.getRepository(User);
  const schoolRepo = dataSource.getRepository(School);
  const groupRepo = dataSource.getRepository(Group);
  const categoryRepo = dataSource.getRepository(Category);
  const inventoryRepo = dataSource.getRepository(InventoryItem);
  const teacherRepo = dataSource.getRepository(Teacher);
  const scheduleRepo = dataSource.getRepository(Schedule);

  if (sqliteExists) {
    console.log(`📂 Leyendo datos existentes desde SQLite: ${sqlitePath}`);
    const sqliteDb = new sqlite3.Database(sqlitePath);

    const queryAll = (sql: string): Promise<any[]> =>
      new Promise((resolve, reject) => {
        sqliteDb.all(sql, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

    try {
      // 1. Usuarios
      const rawUsers = await queryAll('SELECT * FROM usuarios').catch(() => []);
      for (const u of rawUsers) {
        const existing = await userRepo.findOne({ where: { username: u.username } });
        if (!existing) {
          const user = userRepo.create({
            id: u.id,
            username: u.username,
            password: u.password,
            fullName: u.nombre_completo || u.username,
          });
          await userRepo.save(user);
          console.log(`  + Usuario migrado: ${u.username}`);
        }
      }

      // 2. Colegio
      const rawSchool = await queryAll('SELECT * FROM colegio').catch(() => []);
      for (const s of rawSchool) {
        const existing = await schoolRepo.findOne({ where: { id: s.id } });
        if (!existing) {
          const school = schoolRepo.create({
            id: s.id,
            name: s.nombre,
            address: s.direccion,
            phone: s.telefono,
            email: s.correo,
            principal: s.director,
            mission: s.mision,
            vision: s.vision,
            values: s.valores,
          });
          await schoolRepo.save(school);
          console.log(`  + Datos de Colegio migrados: ${s.nombre}`);
        }
      }

      // 3. Grupos
      const rawGroups = await queryAll('SELECT * FROM grupos').catch(() => []);
      for (const g of rawGroups) {
        const existing = await groupRepo.findOne({ where: { id: g.id } });
        if (!existing) {
          const group = groupRepo.create({
            id: g.id,
            name: g.nombre,
            icon: g.icono || 'Folder',
            description: g.descripcion || '',
            order: g.orden || 0,
          });
          await groupRepo.save(group);
          console.log(`  + Grupo migrado: ${g.nombre}`);
        }
      }

      // 4. Categorías
      const rawCategories = await queryAll('SELECT * FROM categorias').catch(() => []);
      for (const c of rawCategories) {
        const existing = await categoryRepo.findOne({ where: { id: c.id } });
        if (!existing) {
          const category = categoryRepo.create({
            id: c.id,
            groupId: c.grupo_id,
            name: c.nombre,
            description: c.descripcion || '',
          });
          await categoryRepo.save(category);
          console.log(`  + Categoría migrada: ${c.nombre}`);
        }
      }

      // 5. Inventario
      const rawItems = await queryAll('SELECT * FROM inventario').catch(() => []);
      for (const i of rawItems) {
        const existing = await inventoryRepo.findOne({ where: { id: i.id } });
        if (!existing) {
          const item = inventoryRepo.create({
            id: i.id,
            name: i.nombre,
            categoryId: i.categoria_id,
            quantity: i.cantidad || 1,
            status: i.estado || 'Bueno',
            location: i.ubicacion || '',
            notes: i.observaciones || i.detalle || '',
          });
          await inventoryRepo.save(item);
          console.log(`  + Ítem de inventario migrado: ${i.nombre}`);
        }
      }

      // 6. Docentes
      const rawTeachers = await queryAll('SELECT * FROM docentes').catch(() => []);
      for (const t of rawTeachers) {
        const existing = await teacherRepo.findOne({ where: { id: t.id } });
        if (!existing) {
          const teacher = teacherRepo.create({
            id: t.id,
            firstName: t.nombres,
            lastName: t.apellidos,
            phone: t.celular,
            email: t.correo,
            address: t.direccion,
            specialty: t.especialidad,
            status: t.estado || 'Activo',
          });
          await teacherRepo.save(teacher);
          console.log(`  + Docente migrado: ${t.nombres} ${t.apellidos}`);
        }
      }

      // 7. Horarios
      const rawSchedules = await queryAll('SELECT * FROM horarios').catch(() => []);
      for (const h of rawSchedules) {
        const existing = await scheduleRepo.findOne({ where: { id: h.id } });
        if (!existing) {
          const blockNum = parseInt(h.bloque, 10) || 1;
          const blockInfo = SCHEDULE_BLOCKS.find((b) => b.block === blockNum);
          const schedule = scheduleRepo.create({
            id: h.id,
            teacherId: h.docente_id,
            day: h.dia,
            block: blockNum,
            subject: h.materia,
            gradeSection: h.grado_seccion || '',
            classroom: h.aula || '',
            startTime: blockInfo ? blockInfo.startTime : '07:00',
            endTime: blockInfo ? blockInfo.endTime : '07:45',
          });
          await scheduleRepo.save(schedule);
          console.log(`  + Horario migrado: ID ${h.id} (Docente ${h.docente_id})`);
        }
      }

      sqliteDb.close();
    } catch (sqliteErr) {
      console.warn('Advertencia durante la lectura de SQLite:', sqliteErr);
    }
  }

  // Verificar si se necesita inicializar usuario administrador por defecto
  const userCount = await userRepo.count();
  if (userCount === 0) {
    console.log('🌱 Creando usuario administrador inicial (admin / admin1234)...');
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin1234', salt);
    await userRepo.save(
      userRepo.create({
        username: 'admin',
        password: hash,
        fullName: 'Administrador General',
      }),
    );
  }

  // Verificar si se necesita inicializar datos de colegio por defecto
  const schoolCount = await schoolRepo.count();
  if (schoolCount === 0) {
    console.log('🌱 Creando información institucional por defecto...');
    await schoolRepo.save(
      schoolRepo.create({
        id: 1,
        name: 'Colegio San Martín de Porres',
        address: 'Av. Principal 123',
        phone: '999888777',
        email: 'contacto@smp.edu.pe',
        principal: 'Dr. Roberto Gómez',
        mission: 'Formar líderes con valores y excelencia académica.',
        vision: 'Ser la institución educativa líder reconocida por su calidad humana y científica.',
        values: 'Responsabilidad, Respeto, Honestidad, Solidaridad',
      }),
    );
  }

  // Resetear secuencias en PostgreSQL si es necesario
  const tables = ['users', 'school', 'groups', 'categories', 'inventory_items', 'teachers', 'schedules'];
  for (const table of tables) {
    try {
      await dataSource.query(
        `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 1)) FROM "${table}";`,
      );
    } catch (e) {
      // Ignorar si la secuencia ya está alineada o la tabla no tiene secuencia
    }
  }

  await dataSource.destroy();
  console.log('🎉 Migración completada exitosamente.');
}

runMigration().catch((err) => {
  console.error('❌ Error fatal en migración:', err);
  process.exit(1);
});
