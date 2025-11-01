import { Injectable, Logger } from '@nestjs/common';

export type SupportedIntegration = 'jira' | 'servicenow';
export type OutboundAction = 'create' | 'update' | 'sync';

export interface IntegrationJobPayload {
  provider: SupportedIntegration;
  action: OutboundAction;
  payload: Record<string, unknown>;
  attempt?: number;
}

export interface IntegrationJobResult {
  success: boolean;
  message: string;
  externalId?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export abstract class IntegrationOutboundProvider {
  protected readonly logger = new Logger(this.constructor.name);

  abstract create(payload: Record<string, unknown>): Promise<IntegrationJobResult>;
  abstract update(payload: Record<string, unknown>): Promise<IntegrationJobResult>;
  abstract sync(payload: Record<string, unknown>): Promise<IntegrationJobResult>;

  protected async simulateLatency() {
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
}
