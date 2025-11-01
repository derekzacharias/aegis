import { Injectable } from '@nestjs/common';
import { IntegrationJobResult, IntegrationOutboundProvider } from './outbound-provider';

@Injectable()
export class ServiceNowIntegrationProvider extends IntegrationOutboundProvider {
  async create(payload: Record<string, unknown>): Promise<IntegrationJobResult> {
    await this.simulateLatency();
    const shortDescription = String(payload['shortDescription'] ?? 'Compliance remediation task');
    const assignmentGroup = String(payload['assignmentGroup'] ?? 'SN-SECOPS');
    const externalId =
      typeof payload['sysId'] === 'string'
        ? payload['sysId']
        : `SN${Math.floor(Math.random() * 1_000_000)
            .toString()
            .padStart(6, '0')}`;

    this.logger.log(`Creating ServiceNow ticket ${externalId} (${shortDescription})`);

    return {
      success: true,
      message: 'ServiceNow ticket created',
      externalId,
      updatedAt: new Date().toISOString(),
      metadata: {
        assignmentGroup,
        shortDescription
      }
    };
  }

  async update(payload: Record<string, unknown>): Promise<IntegrationJobResult> {
    await this.simulateLatency();
    const externalId = String(payload['sysId'] ?? payload['externalId'] ?? 'UNKNOWN');
    const state = String(payload['state'] ?? 'In Progress');

    this.logger.log(`Updating ServiceNow ticket ${externalId} -> ${state}`);

    return {
      success: true,
      message: `ServiceNow ticket ${externalId} updated`,
      externalId,
      updatedAt: new Date().toISOString(),
      metadata: { state }
    };
  }

  async sync(payload: Record<string, unknown>): Promise<IntegrationJobResult> {
    await this.simulateLatency();
    const assignmentGroup = String(payload['assignmentGroup'] ?? 'SN-SECOPS');

    this.logger.log(`Running ServiceNow sync for group ${assignmentGroup}`);

    return {
      success: true,
      message: `ServiceNow sync completed for ${assignmentGroup}`,
      updatedAt: new Date().toISOString(),
      metadata: {
        assignmentGroup,
        ticketsProcessed: Math.floor(Math.random() * 40) + 10
      }
    };
  }
}
