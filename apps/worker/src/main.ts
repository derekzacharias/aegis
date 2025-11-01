import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { ReportingProcessor } from './workers/reporting.processor';
import { IntegrationProcessor } from './workers/integration.processor';
import { EvidenceProcessor } from './workers/evidence.processor';
import { ScheduleRunner } from './scheduler/schedule-runner';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['log', 'error', 'warn']
  });
  const config = app.get(ConfigService);
  app.get(ReportingProcessor);
  app.get(IntegrationProcessor);
  app.get(EvidenceProcessor);
  await app.get(ScheduleRunner).initialize();
  const queueName = config.get<string>('WORK_QUEUE_NAME') ?? 'compliance-jobs';
  Logger.log(`🛠️ Worker ready for queue "${queueName}"`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Worker failed to start', err);
  process.exit(1);
});
