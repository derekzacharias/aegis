import { Injectable, Logger } from '@nestjs/common';
import {
  IntegrationJobPayload,
  IntegrationJobResult,
  IntegrationOutboundProvider,
  SupportedIntegration
} from '../integrations/outbound-provider';
import { JiraIntegrationProvider } from '../integrations/jira.provider';
import { ServiceNowIntegrationProvider } from '../integrations/servicenow.provider';

@Injectable()
export class IntegrationProcessor {
  private readonly logger = new Logger(IntegrationProcessor.name);
  private readonly providers: Record<
    SupportedIntegration,
    IntegrationOutboundProvider
  >;

  constructor(
    jiraProvider: JiraIntegrationProvider,
    serviceNowProvider: ServiceNowIntegrationProvider
  ) {
    this.providers = {
      jira: jiraProvider,
      servicenow: serviceNowProvider
    };
  }

  async handle(job: IntegrationJobPayload): Promise<IntegrationJobResult> {
    const provider = this.providers[job.provider];
    if (!provider) {
      throw new Error(`Unsupported integration provider: ${job.provider}`);
    }

    this.logger.log(
      `Processing ${job.provider.toUpperCase()} integration ${job.action} (attempt ${
        job.attempt ?? 1
      })`
    );

    let result: IntegrationJobResult;
    switch (job.action) {
      case 'create':
        result = await provider.create(job.payload);
        break;
      case 'update':
        result = await provider.update(job.payload);
        break;
      case 'sync':
        result = await provider.sync(job.payload);
        break;
      default:
        throw new Error(`Unsupported integration action: ${job.action}`);
    }

    if (result.success) {
      this.logger.log(`${job.provider}.${job.action} succeeded - ${result.message}`);
    } else {
      this.logger.warn(`${job.provider}.${job.action} failed - ${result.message}`);
    }

    return result;
  }
}
