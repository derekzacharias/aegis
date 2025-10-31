import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { AssessmentModule } from '../assessment/assessment.module';
import { EvidenceModule } from '../evidence/evidence.module';
import { HealthController } from './health.controller';
import { IntegrationModule } from '../integration/integration.module';
import { ReportingModule } from '../reporting/reporting.module';
import { FrameworkModule } from '../framework/framework.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    FrameworkModule,
    DashboardModule,
    AssessmentModule,
    EvidenceModule,
    IntegrationModule,
    ReportingModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
