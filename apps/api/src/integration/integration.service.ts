import { Injectable, Logger } from '@nestjs/common';
import { IntegrationProvider } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

export interface IntegrationSummary {
  id: string;
  provider: IntegrationProvider;
  baseUrl: string;
  clientId: string;
  createdAt: string;
}

interface UpsertIntegrationInput {
  provider: IntegrationProvider;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);
  private readonly fallback: Map<IntegrationProvider, IntegrationSummary> = new Map();

  constructor(private readonly prisma: PrismaService) {
    const now = new Date().toISOString();
    this.fallback.set(IntegrationProvider.JIRA, {
      id: 'jira',
      provider: IntegrationProvider.JIRA,
      baseUrl: 'https://your-domain.atlassian.net',
      clientId: 'demo-client-id',
      createdAt: now
    });
    this.fallback.set(IntegrationProvider.SERVICENOW, {
      id: 'servicenow',
      provider: IntegrationProvider.SERVICENOW,
      baseUrl: 'https://instance.service-now.com',
      clientId: 'demo-client-id',
      createdAt: now
    });
  }

  async list(): Promise<IntegrationSummary[]> {
    try {
      const integrations = await this.prisma.integrationConnection.findMany({
        orderBy: { createdAt: 'desc' }
      });

      if (!integrations.length) {
        return this.getFallback();
      }

      return integrations.map((integration) => ({
        id: integration.id,
        provider: integration.provider,
        baseUrl: integration.baseUrl,
        clientId: integration.clientId,
        createdAt: integration.createdAt.toISOString()
      }));
    } catch (error) {
      this.logger.warn(
        `Failed to load integrations from database, using fallback entries: ${String(error)}`
      );
      return this.getFallback();
    }
  }

  async upsert(payload: UpsertIntegrationInput): Promise<IntegrationSummary> {
    try {
      const integration = await this.prisma.integrationConnection.upsert({
        where: {
          organizationId_provider: {
            organizationId: await this.ensureOrganization(),
            provider: payload.provider
          }
        },
        update: {
          baseUrl: payload.baseUrl,
          clientId: payload.clientId,
          clientSecret: payload.clientSecret
        },
        create: {
          organizationId: await this.ensureOrganization(),
          provider: payload.provider,
          baseUrl: payload.baseUrl,
          clientId: payload.clientId,
          clientSecret: payload.clientSecret
        }
      });

      return {
        id: integration.id,
        provider: integration.provider,
        baseUrl: integration.baseUrl,
        clientId: integration.clientId,
        createdAt: integration.createdAt.toISOString()
      };
    } catch (error) {
      this.logger.warn(
        `Failed to persist integration ${payload.provider}, storing fallback entry: ${String(
          error
        )}`
      );

      const summary: IntegrationSummary = {
        id: payload.provider.toLowerCase(),
        provider: payload.provider,
        baseUrl: payload.baseUrl,
        clientId: payload.clientId,
        createdAt: new Date().toISOString()
      };

      this.fallback.set(payload.provider, summary);
      return summary;
    }
  }

  private getFallback(): IntegrationSummary[] {
    return Array.from(this.fallback.values());
  }

  private async ensureOrganization(): Promise<string> {
    const org = await this.prisma.organization.upsert({
      where: { slug: 'aegis-compliance' },
      update: {},
      create: {
        slug: 'aegis-compliance',
        name: 'Aegis Compliance Control Center'
      }
    });
    return org.id;
  }
}
