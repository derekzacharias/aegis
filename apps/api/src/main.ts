import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app/app.module';

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createOriginMatcher(origins: string[]) {
  const exactMatches = new Set<string>();
  const patternMatches: RegExp[] = [];
  let allowAll = false;

  for (const rawOrigin of origins) {
    const origin = rawOrigin.trim();
    if (!origin) {
      continue;
    }

    if (origin === '*') {
      allowAll = true;
      continue;
    }

    if (origin.includes('*')) {
      const pattern = new RegExp(`^${origin.split('*').map(escapeRegExp).join('.*')}$`);
      patternMatches.push(pattern);
      continue;
    }

    exactMatches.add(origin);
  }

  return (origin?: string | null) => {
    if (!origin) {
      return true;
    }

    if (allowAll) {
      return true;
    }

    if (exactMatches.has(origin)) {
      return true;
    }

    return patternMatches.some((pattern) => pattern.test(origin));
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const globalPrefix = 'api';

  app.setGlobalPrefix(globalPrefix);
  app.use(helmet());
  app.use(cookieParser());
  const configuredOrigins = config.get<string[]>('cors.origins') ?? ['http://localhost:4200'];
  const defaultLanOrigins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'http://192.168.*:4200',
    'http://10.*:4200',
    'http://172.16.*:4200',
    'http://172.17.*:4200',
    'http://172.18.*:4200',
    'http://172.19.*:4200',
    'http://172.20.*:4200',
    'http://172.21.*:4200',
    'http://172.22.*:4200',
    'http://172.23.*:4200',
    'http://172.24.*:4200',
    'http://172.25.*:4200',
    'http://172.26.*:4200',
    'http://172.27.*:4200',
    'http://172.28.*:4200',
    'http://172.29.*:4200',
    'http://172.30.*:4200',
    'http://172.31.*:4200'
  ];
  const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultLanOrigins]));
  const isOriginAllowed = createOriginMatcher(allowedOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  const port = config.get<number>('PORT') ?? 3333;
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 API running on http://127.0.0.1:${port}/${globalPrefix}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to bootstrap API', err);
  process.exit(1);
});
