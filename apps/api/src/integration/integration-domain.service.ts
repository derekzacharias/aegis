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
    mapping: IntegrationMappingPreferences
  ): IntegrationTaskSnapshot {
    const key = this.getTaskKey(provider, event.externalId);
    const now = event.occurredAt ?? new Date().toISOString();
    const status =
      mapping.statusMapping[event.status] ?? mapping.statusMapping.default ?? 'pending';
    const priority =
      mapping.priorityMapping[event.priority] ?? mapping.priorityMapping.default ?? 'medium';

    const snapshot: IntegrationTaskSnapshot = {
      taskId: key,
      externalId: event.externalId,
      provider,
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

  getMetrics(provider: IntegrationProvider) {
    const list = Array.from(this.tasks.values()).filter((task) => task.provider === provider);
    const projects = new Set(
      list.map((task) => task.projectKey).filter((value): value is string => Boolean(value))
    );

    return {
      issuesLinked: list.length,
      projectsMapped: projects.size
    };
  }

  listTasks() {
    return Array.from(this.tasks.values());
  }

  clear() {
    this.tasks.clear();
  }

  private getTaskKey(provider: IntegrationProvider, externalId: string) {
    return `${provider.toLowerCase()}-${externalId}`;
  }
}
