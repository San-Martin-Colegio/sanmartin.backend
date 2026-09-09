import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {

  const dbSsl = configService.get<string>('DB_SSL');

  return {
    type: 'postgres',

    host: configService.get<string>('DB_HOST', 'localhost'),

    port: Number(
      configService.get<string>('DB_PORT', '5432'),
    ),

    username: configService.get<string>(
      'DB_USERNAME',
      'postgres',
    ),

    password: configService.get<string>(
      'DB_PASSWORD',
      'postgres',
    ),

    database: configService.get<string>(
      'DB_DATABASE',
      'sistema_inventario_sm',
    ),

    autoLoadEntities: true,

    synchronize:
      configService.get<string>('DB_SYNC', 'false') === 'true',

    logging:
      configService.get<string>('NODE_ENV') === 'development',

    ssl:
      dbSsl === 'require' ||
      dbSsl === 'true' ||
      configService.get<string>('NODE_ENV') === 'production'
        ? {
            rejectUnauthorized: false,
          }
        : false,
  };
};