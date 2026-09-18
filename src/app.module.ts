import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { CategoriesModule } from './categories/categories.module';
import { InventoryModule } from './inventory/inventory.module';
import { TeachersModule } from './teachers/teachers.module';
import { SchedulesModule } from './schedules/schedules.module';
import { SchoolModule } from './school/school.module';
import { MaterialsModule } from './materials/materials.module';
import { ComputersModule } from './computers/computers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    AuthModule,
    UsersModule,
    GroupsModule,
    CategoriesModule,
    InventoryModule,
    TeachersModule,
    SchedulesModule,
    SchoolModule,
    MaterialsModule,
    ComputersModule,
  ],
})
export class AppModule {}
