import path from 'path';

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value === null) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }
  if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no', 'n', 'off'].includes(normalized)) {
    return false;
  }
  return fallback;
};

const parseArgs = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
};

export default () => ({
  environment: process.env['NODE_ENV'] ?? 'development',
  redisUrl: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
  workQueueName: process.env['WORK_QUEUE_NAME'] ?? 'compliance-jobs',
  reportBucket: process.env['REPORT_BUCKET'] ?? 'local-reports',
  storage: {
    mode: (process.env['EVIDENCE_STORAGE_MODE'] ?? 'local').toLowerCase(),
    bucket: process.env['EVIDENCE_BUCKET'] ?? 'local-evidence',
    endpoint: process.env['EVIDENCE_STORAGE_ENDPOINT'] ?? null,
    region: process.env['EVIDENCE_STORAGE_REGION'] ?? 'us-east-1',
    accessKey: process.env['EVIDENCE_STORAGE_ACCESS_KEY'] ?? '',
    secretKey: process.env['EVIDENCE_STORAGE_SECRET_KEY'] ?? '',
    usePathStyle: parseBoolean(process.env['EVIDENCE_STORAGE_FORCE_PATH_STYLE'], true),
    localDir:
      process.env['EVIDENCE_LOCAL_DIR'] ?? path.resolve(process.cwd(), 'tmp', 'evidence')
  },
  reportRenderer: {
    mode: process.env['REPORT_RENDERER_MODE'] ?? 'ci',
    templatePath: process.env['REPORT_RENDERER_TEMPLATE_PATH'] ?? null,
    maxAttempts: parseNumber(process.env['REPORT_RENDERER_MAX_ATTEMPTS'], 3),
    renderTimeoutMs: parseNumber(process.env['REPORT_RENDERER_TIMEOUT_MS'], 90_000),
    launchTimeoutMs: parseNumber(process.env['REPORT_RENDERER_LAUNCH_TIMEOUT_MS'], 45_000),
    maxMemoryMb: parseNumber(process.env['REPORT_RENDERER_MAX_MEMORY_MB'], 512),
    sandbox: parseBoolean(process.env['REPORT_RENDERER_ENABLE_SANDBOX'], true),
    headless: process.env['REPORT_RENDERER_HEADLESS'] ?? null,
    chromiumExecutable: process.env['REPORT_RENDERER_EXECUTABLE_PATH'] ?? null,
    disableDevShmUsage: parseBoolean(process.env['REPORT_RENDERER_DISABLE_DEV_SHM'], true),
    extraArgs: parseArgs(process.env['REPORT_RENDERER_EXTRA_ARGS'] ?? ''),
    fontConfigPath: process.env['REPORT_RENDERER_FONTCONFIG_PATH'] ?? null,
    retryBackoffMs: parseNumber(process.env['REPORT_RENDERER_RETRY_BACKOFF_MS'], 750)
  },
  scheduler: {
    refreshIntervalMs: process.env['SCHEDULER_REFRESH_INTERVAL_MS'] ?? '180000',
    apiBaseUrl: process.env['SCHEDULER_API_BASE_URL'] ?? null
  },
  antivirus: {
    enabled: parseBoolean(
      process.env['EVIDENCE_SCAN_ENABLED'],
      (process.env['NODE_ENV'] ?? 'development') !== 'test'
    ),
    engine: (process.env['EVIDENCE_SCAN_ENGINE'] ?? 'clamav').toLowerCase(),
    engineName: process.env['EVIDENCE_SCAN_ENGINE_NAME'] ?? 'ClamAV',
    quarantineOnError: parseBoolean(
      process.env['EVIDENCE_SCAN_QUARANTINE_ON_ERROR'],
      true
    ),
    autoReleaseStrategy: (
      process.env['EVIDENCE_SCAN_AUTO_RELEASE_STRATEGY'] ?? 'pending'
    )
      .toLowerCase()
      .trim(),
    maxRetries: parseNumber(process.env['EVIDENCE_SCAN_MAX_RETRIES'], 3),
    retryDelayMs: parseNumber(process.env['EVIDENCE_SCAN_RETRY_DELAY_MS'], 5_000),
    clamav: {
      host: process.env['EVIDENCE_SCAN_HOST'] ?? '127.0.0.1',
      port: parseNumber(process.env['EVIDENCE_SCAN_PORT'], 3310),
      timeoutMs: parseNumber(process.env['EVIDENCE_SCAN_TIMEOUT_MS'], 10_000),
      chunkSize: parseNumber(process.env['EVIDENCE_SCAN_CHUNK_SIZE'], 64 * 1024),
      cliPath: process.env['EVIDENCE_SCAN_CLAMD_PATH'] ?? 'clamdscan'
    },
    lambda: {
      functionName: process.env['EVIDENCE_SCAN_LAMBDA_NAME'] ?? null,
      invocationRoleArn: process.env['EVIDENCE_SCAN_LAMBDA_ROLE_ARN'] ?? null
    }
  },
  notifications: {
    endpoint: process.env['NOTIFICATION_SERVICE_URL'] ?? null,
    evidenceChannel: process.env['NOTIFICATION_EVIDENCE_CHANNEL'] ?? 'evidence-reviewers'
  }
});
