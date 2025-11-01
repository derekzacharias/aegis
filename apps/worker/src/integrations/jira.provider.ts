import { Injectable } from '@nestjs/common';
import { IntegrationJobResult, IntegrationOutboundProvider } from './outbound-provider';

@Injectable()
export class JiraIntegrationProvider extends IntegrationOutboundProvider {
  async create(payload: Record<string, unknown>): Promise<IntegrationJobResult> {
    await this.simulateLatency();
    const summary = String(payload['summary'] ?? 'Untitled remediation');
    const projectKey = String(payload['projectKey'] ?? 'FEDRAMP');
    const externalId =
      typeof payload['key'] === 'string'
        ? payload['key']
        : `${projectKey}-${Math.floor(Math.random() * 10_000)}`;

    this.logger.log(`Creating Jira issue ${externalId} (${summary})`);

    return {
      success: true,
      message: 'Jira issue created',
      externalId,
      updatedAt: new Date().toISOString(),
      metadata: {
        summary,
        projectKey
      }
    };
  }

  async update(payload: Record<string, unknown>): Promise<IntegrationJobResult> {
    await this.simulateLatency();
    const externalId = String(payload['key'] ?? payload['externalId'] ?? 'UNKNOWN');
    const status = String(payload['status'] ?? 'In Progress');

    this.logger.log(`Updating Jira issue ${externalId} -> ${status}`);

    return {
      success: true,
      message: `Jira issue ${externalId} updated`,
      externalId,
      updatedAt: new Date().toISOString(),
      metadata: {
        status
      }
    };
  }

  async sync(payload: Record<string, unknown>): Promise<IntegrationJobResult> {
    await this.simulateLatency();
    const projectKeys = (payload['projectKeys'] as string[] | undefined) ?? ['FEDRAMP'];

    this.logger.log(`Running Jira sync for projects ${projectKeys.join(', ')}`);

    return {
      success: true,
      message: `Jira sync completed for ${projectKeys.length} project(s)`,
      updatedAt: new Date().toISOString(),
      metadata: {
        projectKeys,
        issuesProcessed: Math.floor(Math.random() * 50) + 5
      }
    };
  }
}
