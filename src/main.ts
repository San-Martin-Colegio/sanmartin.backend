import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const configuredOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const developmentOrigins = ['http://localhost:4200'];
  const allowedOrigins = configuredOrigins.length ? configuredOrigins : developmentOrigins;

  if (process.env.NODE_ENV === 'production' && configuredOrigins.length === 0) {
    logger.warn('CORS_ORIGINS no está configurado; se mantiene compatibilidad temporal con cualquier origen.');
  }

  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production' && configuredOrigins.length === 0
        ? true
        : (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
              return;
            }
            callback(new Error('Origen no permitido por CORS'), false);
          },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global API prefix
  app.setGlobalPrefix('api');

  // Global DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 San Martín de Porres Backend running at http://localhost:${port}/api`);
}

bootstrap();
