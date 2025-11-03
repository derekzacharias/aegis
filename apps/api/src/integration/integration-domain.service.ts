import { Injectable } from '@nestjs/common';
import { IntegrationMappingPreferences, IntegrationProvider } from './integration.types';

export interface NormalizedIntegrationEvent {
  externalId: string;
  summary: string;
  description?: string | null;
  status: string;
  priority: string;
  link?: string | null;
  projectKey?: string | null;
  assessmentId?: string | null;
  occurredAt?: string;
  raw: Record<string, unknown>;
}

export interface IntegrationTaskSnapshot {
  taskId: string;
  externalId: string;
  provider: IntegrationProvider;
  organizationId: string;
  summary: string;
  status: string;
  priority: string;
  link: string | null;
  projectKey: string | null;
  assessmentId: string | null;
  updatedAt: string;
  lastPayload: Record<string, unknown>;
}

@Injectable()
export class IntegrationDomainService {
  private readonly tasks = new Map<string, IntegrationTaskSnapshot>();

  upsertFromWebhook(
    provider: IntegrationProvider,
    event: NormalizedIntegrationEvent,
    mapping: IntegrationMappingPreferences,
    organizationId: string
  ): IntegrationTaskSnapshot {
    const key = this.getTaskKey(organizationId, provider, event.externalId);
    const now = event.occurredAt ?? new Date().toISOString();
    const status =
      mapping.statusMapping[event.status] ?? mapping.statusMapping.default ?? 'pending';
    const priority =
      mapping.priorityMapping[event.priority] ?? mapping.priorityMapping.default ?? 'medium';

    const snapshot: IntegrationTaskSnapshot = {
      taskId: key,
      externalId: event.externalId,
      provider,
      organizationId,
      summary: event.summary,
      status,
      priority,
      link: event.link ?? null,
      projectKey: event.projectKey ?? mapping.projectKey,
      assessmentId: event.assessmentId ?? null,
      updatedAt: now,
      lastPayload: event.raw
    };

    this.tasks.set(key, snapshot);
    return snapshot;
  }

  getMetrics(provider: IntegrationProvider, organizationId: string) {
    const list = this.listTasks(provider, organizationId);
    const projects = new Set(
      list.map((task) => task.projectKey).filter((value): value is string => Boolean(value))
    );

    return {
      issuesLinked: list.length,
      projectsMapped: projects.size
    };
  }

  listTasks(provider?: IntegrationProvider, organizationId?: string) {
    const list = Array.from(this.tasks.values());
    if (!provider && !organizationId) {
      return list;
    }
    return list.filter((task) => {
      if (provider && task.provider !== provider) {
        return false;
      }
      if (organizationId && task.organizationId !== organizationId) {
        return false;
      }
      return true;
    });
  }

  clear() {
    this.tasks.clear();
  }

  private getTaskKey(
    organizationId: string,
    provider: IntegrationProvider,
    externalId: string
  ) {
    return `${organizationId}:${provider.toLowerCase()}:${externalId}`;
  }
}
