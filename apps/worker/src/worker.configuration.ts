export default () => ({
  environment: process.env['NODE_ENV'] ?? 'development',
  redisUrl: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
  workQueueName: process.env['WORK_QUEUE_NAME'] ?? 'compliance-jobs',
  reportBucket: process.env['REPORT_BUCKET'] ?? 'local-reports',
  scheduler: {
    refreshIntervalMs: process.env['SCHEDULER_REFRESH_INTERVAL_MS'] ?? '180000',
    apiBaseUrl: process.env['SCHEDULER_API_BASE_URL'] ?? null
  }
});
