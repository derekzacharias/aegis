import path from 'path';

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
};

export default () => {
  const accessTokenTtlSeconds = parseNumber(process.env['AUTH_ACCESS_TOKEN_TTL'], 60 * 15);
  const refreshTokenTtlSeconds = parseNumber(
    process.env['AUTH_REFRESH_TOKEN_TTL'],
    60 * 60 * 24 * 7
  );
  const passwordMinLength = parseNumber(process.env['AUTH_PASSWORD_MIN_LENGTH'], 12);

  const corsOrigins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:4200')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const storageMode = (process.env['EVIDENCE_STORAGE_MODE'] ?? 'local').toLowerCase();
  const storageBucket = process.env['EVIDENCE_BUCKET'] ?? 'local-evidence';
  const storageEndpoint = process.env['EVIDENCE_STORAGE_ENDPOINT'] ?? '';
  const storageRegion = process.env['EVIDENCE_STORAGE_REGION'] ?? 'us-east-1';
  const storageAccessKey = process.env['EVIDENCE_STORAGE_ACCESS_KEY'] ?? '';
  const storageSecretKey = process.env['EVIDENCE_STORAGE_SECRET_KEY'] ?? '';
  const storageUsePathStyle = parseBoolean(
    process.env['EVIDENCE_STORAGE_FORCE_PATH_STYLE'],
    storageMode !== 's3'
  );
  const storageUploadTtlSeconds = parseNumber(process.env['EVIDENCE_UPLOAD_URL_TTL'], 60 * 15);
  const storageLocalDir =
    process.env['EVIDENCE_LOCAL_DIR'] ?? path.resolve(process.cwd(), 'tmp', 'evidence');

  return {
    environment: process.env['NODE_ENV'] ?? 'development',
    port: Number(process.env['PORT'] ?? 3333),
    databaseUrl:
      process.env['DATABASE_URL'] ?? 'postgresql://localhost:5432/compliance',
    jwtSecret: process.env['JWT_SECRET'] ?? 'change-me',
    auth: {
      accessTokenTtlSeconds,
      refreshTokenTtlSeconds,
      passwordMinLength
    },
    cors: {
      origins: corsOrigins
    },
    storage: {
      mode: storageMode,
      bucket: storageBucket,
      endpoint: storageEndpoint,
      region: storageRegion,
      accessKey: storageAccessKey,
      secretKey: storageSecretKey,
      usePathStyle: storageUsePathStyle,
      uploadUrlTtlSeconds: storageUploadTtlSeconds,
      localDir: storageLocalDir
    },
    // Backwards compatibility for legacy consumers
    storageBucket,
    storageEndpoint,
    storageRegion
  };
};
