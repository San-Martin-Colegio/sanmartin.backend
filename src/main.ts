import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { json, NextFunction, Request, Response, urlencoded } from 'express';
import cookieParser = require('cookie-parser');
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SanitizeInputPipe } from './common/pipes/sanitize-input.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const logger = new Logger('Bootstrap');
  const production = process.env.NODE_ENV === 'production';

  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.use(json({ limit: '100kb', strict: true }));
  app.use(urlencoded({ extended: false, limit: '20kb' }));
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' },
      hsts: production
        ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
        : false,
    }),
  );

  const configuredOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const developmentOrigins = ['http://localhost:4200'];
  const allowedOrigins = configuredOrigins.length ? configuredOrigins : developmentOrigins;

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origen no permitido por CORS'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-CSRF-Protection'],
    maxAge: 600,
  });

  app.use((request: Request, response: Response, next: NextFunction) => {
    const forwardedProtocol = String(request.headers['x-forwarded-proto'] || '')
      .split(',')[0]
      .trim();
    if (production && forwardedProtocol !== 'https' && !request.secure) {
      response.status(426).json({ message: 'HTTPS is required' });
      return;
    }

    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Pragma', 'no-cache');

    const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
    if (mutating && request.header('X-CSRF-Protection') !== '1') {
      response.status(403).json({ message: 'Solicitud no autorizada.' });
      return;
    }
    const hasPayload =
      Number(request.header('content-length') || 0) > 0 ||
      Boolean(request.header('transfer-encoding'));
    if (mutating && hasPayload && !request.is('application/json')) {
      response.status(415).json({ message: 'Solo se acepta contenido JSON.' });
      return;
    }
    next();
  });

  // Global API prefix
  app.setGlobalPrefix('api');

  // Global DTO validation
  app.useGlobalPipes(
    new SanitizeInputPipe(),
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  const port = process.env.PORT || 3000;
  app.enableShutdownHooks();
  await app.listen(port);
  logger.log(`San Martín de Porres Backend activo en el puerto ${port}.`);
}

bootstrap();
