import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { AssessmentModule } from '../assessment/assessment.module';
import { EvidenceModule } from '../evidence/evidence.module';
import { HealthController } from './health.controller';
import { IntegrationModule } from '../integration/integration.module';
import { ReportingModule } from '../reporting/reporting.module';
import { FrameworkModule } from '../framework/framework.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    PrismaModule,
    AuthModule,
    FrameworkModule,
    DashboardModule,
    AssessmentModule,
    EvidenceModule,
    IntegrationModule,
    ReportingModule,
    PolicyModule,
    SchedulerModule
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule {}
