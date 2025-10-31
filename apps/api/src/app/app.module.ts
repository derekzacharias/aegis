import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { FrameworkModule } from '../framework/framework.module';
import { AssessmentModule } from '../assessment/assessment.module';
import { EvidenceModule } from '../evidence/evidence.module';
import { HealthController } from './health.controller';
import { DatabaseModule } from '../database/database.module';
import { IntegrationModule } from '../integration/integration.module';
import { ReportingModule } from '../reporting/reporting.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    DatabaseModule,
    FrameworkModule,
    AssessmentModule,
    EvidenceModule,
    IntegrationModule,
    ReportingModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
