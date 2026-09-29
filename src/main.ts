import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule, ObserveInstrument } from './app.module.js';
import { AllExceptionsFilter } from './infrastructure/http/filters/all-exceptions.filter.js';
import {
  Environment,
  type EnvironmentVariables,
} from './infrastructure/config/environment-variables.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
    logger:
      process.env.NODE_ENV === Environment.Production
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService<EnvironmentVariables, true>);

  app.use(helmet());
  // No JWT on the client: auth relies on cookies. Any cookie set in a controller
  // must use { httpOnly: true, secure: process.env.NODE_ENV === 'PRODUCTION', sameSite: 'strict' }.
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');

  // Wildcard origins are prohibited; credentials required for HttpOnly/SameSite=Strict cookies to work.
  app.enableCors({
    origin: configService.get('FRONTEND_URL', { infer: true }),
    credentials: true,
  });

  // Only a card token and small metadata are ever sent; anything larger is treated as an attack.
  app.useBodyParser('json', { limit: '10kb' });

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Bookstore Payment API')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('api/v1/docs', app, swaggerDocument);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  await app.listen(configService.get('PORT', { infer: true }));
}
await bootstrap();  