import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './worker.configuration';
import { ReportingProcessor } from './workers/reporting.processor';
import { IntegrationProcessor } from './workers/integration.processor';
import { EvidenceProcessor } from './workers/evidence.processor';
import { JiraIntegrationProvider } from './integrations/jira.provider';
import { ServiceNowIntegrationProvider } from './integrations/servicenow.provider';
import { InMemoryScheduleStore } from './scheduler/stores/in-memory-schedule.store';
import { HttpScheduleStore } from './scheduler/stores/http-schedule.store';
import { SCHEDULE_HANDLERS, SCHEDULE_STORE } from './scheduler/scheduler.constants';
import { ScheduleRunner } from './scheduler/schedule-runner';
import { EvidenceReviewReminderHandler } from './scheduler/handlers/evidence-review.handler';
import { RecurringAssessmentHandler } from './scheduler/handlers/recurring-assessment.handler';
import { AgentHealthCheckHandler } from './scheduler/handlers/agent-health-check.handler';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    })
  ],
  providers: [
    PrismaService,
    ReportingProcessor,
    EvidenceProcessor,
    JiraIntegrationProvider,
    ServiceNowIntegrationProvider,
    IntegrationProcessor,
    InMemoryScheduleStore,
    EvidenceReviewReminderHandler,
    RecurringAssessmentHandler,
    AgentHealthCheckHandler,
    {
      provide: SCHEDULE_HANDLERS,
      inject: [EvidenceReviewReminderHandler, RecurringAssessmentHandler, AgentHealthCheckHandler],
      useFactory: (
        evidence: EvidenceReviewReminderHandler,
        assessment: RecurringAssessmentHandler,
        health: AgentHealthCheckHandler
      ) => [evidence, assessment, health]
    },
    {
      provide: SCHEDULE_STORE,
      inject: [ConfigService, InMemoryScheduleStore],
      useFactory: (configService: ConfigService, fallbackStore: InMemoryScheduleStore) => {
        const apiBaseUrl = configService.get<string>('scheduler.apiBaseUrl');
        if (apiBaseUrl) {
          return new HttpScheduleStore(apiBaseUrl);
        }

        return fallbackStore;
      }
    },
    ScheduleRunner
  ]
})
export class WorkerModule {}
