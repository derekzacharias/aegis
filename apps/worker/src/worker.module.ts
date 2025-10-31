import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './worker.configuration';
import { ReportingProcessor } from './workers/reporting.processor';
import { IntegrationProcessor } from './workers/integration.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    })
  ],
  providers: [ReportingProcessor, IntegrationProcessor]
})
export class WorkerModule {}
