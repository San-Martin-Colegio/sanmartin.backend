import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

dotenv.config({ path: path.join(__dirname, '../.env') });

import { User } from '../src/users/entities/user.entity';
import { School } from '../src/school/entities/school.entity';
import { Group } from '../src/groups/entities/group.entity';
import { Category } from '../src/categories/entities/category.entity';
import { InventoryItem } from '../src/inventory/entities/inventory-item.entity';
import { Teacher } from '../src/teachers/entities/teacher.entity';
import { Schedule } from '../src/schedules/entities/schedule.entity';

async function seed() {
  console.log('🌱 Ejecutando seed de base de datos...');

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

  await dataSource.initialize();
  console.log('✅ Conectado a PostgreSQL.');

  const userRepo = dataSource.getRepository(User);
  const schoolRepo = dataSource.getRepository(School);

  // 1. Sembrar o actualizar Admin
  let admin = await userRepo.findOne({ where: { username: 'admin' } });
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('admin1234', salt);

  if (!admin) {
    admin = userRepo.create({
      username: 'admin',
      password: hash,
      fullName: 'Administrador General',
    });
    await userRepo.save(admin);
    console.log('✅ Usuario admin creado (Usuario: admin | Contraseña: admin1234)');
  } else {
    admin.password = hash;
    await userRepo.save(admin);
    console.log('✅ Contraseña de usuario admin actualizada a: admin1234');
  }

  // 2. Sembrar colegio si no existe
  let school = await schoolRepo.findOne({ where: { id: 1 } });
  if (!school) {
    school = schoolRepo.create({
      id: 1,
      name: 'Colegio San Martín de Porres',
      address: 'Av. Principal 123',
      phone: '999888777',
      email: 'contacto@smp.edu.pe',
      principal: 'Dr. Roberto Gómez',
      mission: 'Formar líderes con valores y excelencia académica.',
      vision: 'Ser la institución educativa líder reconocida por su calidad humana y científica.',
      values: 'Responsabilidad, Respeto, Honestidad, Solidaridad',
    });
    await schoolRepo.save(school);
    console.log('✅ Datos de colegio inicializados.');
  }

  await dataSource.destroy();
  console.log('🎉 Seed completado exitosamente.');
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
