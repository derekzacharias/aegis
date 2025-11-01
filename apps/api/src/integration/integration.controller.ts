import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Put
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { ConnectIntegrationDto } from './dto/connect-integration.dto';
import { UpdateMappingDto } from './dto/update-mapping.dto';
import { InitiateOAuthDto } from './dto/initiate-oauth.dto';
import { CompleteOAuthDto } from './dto/complete-oauth.dto';
import {
  INTEGRATION_PROVIDERS,
  IntegrationDetail,
  IntegrationProvider,
  IntegrationSummary
} from './integration.types';
import { IntegrationService } from './integration.service';

@Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
@Controller('integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get()
  async list(): Promise<IntegrationSummary[]> {
    return this.integrationService.list();
  }

  @Get(':provider')
  async detail(@Param('provider') providerParam: string): Promise<IntegrationDetail> {
    return this.integrationService.detail(this.parseProvider(providerParam));
  }

  @Put()
  @Roles(UserRole.ADMIN)
  async connect(@Body() payload: ConnectIntegrationDto): Promise<IntegrationDetail> {
    return this.integrationService.upsert({
      provider: payload.provider,
      baseUrl: payload.baseUrl,
      clientId: payload.clientId,
      clientSecret: payload.clientSecret,
      scopes: payload.scopes
    });
  }

  @Patch('mapping')
  @Roles(UserRole.ADMIN)
  async updateMapping(@Body() payload: UpdateMappingDto): Promise<IntegrationDetail> {
    const mapping = {
      projectKey: payload.mapping.projectKey ?? null,
      defaultIssueType: payload.mapping.defaultIssueType,
      assessmentTagField: payload.mapping.assessmentTagField ?? null,
      statusMapping: this.entriesToRecord(payload.mapping.statusMapping, 'backlog'),
      priorityMapping: this.entriesToRecord(payload.mapping.priorityMapping, 'medium')
    };

    return this.integrationService.updateMapping({
      provider: payload.provider,
      mapping
    });
  }

  @Post('oauth/initiate')
  @Roles(UserRole.ADMIN)
  async initiateOAuth(@Body() payload: InitiateOAuthDto) {
    return this.integrationService.initiateOAuth({
      provider: payload.provider,
      redirectUri: payload.redirectUri,
      scopes: payload.scopes
    });
  }

  @Post('oauth/complete')
  @Roles(UserRole.ADMIN)
  async completeOAuth(@Body() payload: CompleteOAuthDto): Promise<IntegrationDetail> {
    return this.integrationService.completeOAuth({
      provider: payload.provider,
      state: payload.state,
      code: payload.code
    });
  }

  @Post('jira/webhook')
  @HttpCode(202)
  async jiraWebhook(
    @Body() payload: Record<string, unknown>,
    @Headers('x-jira-signature') signature?: string
  ) {
    await this.integrationService.ingestWebhook('JIRA', payload, signature);
    return { acknowledged: true };
  }

  @Post('servicenow/webhook')
  @HttpCode(202)
  async serviceNowWebhook(
    @Body() payload: Record<string, unknown>,
    @Headers('x-servicenow-signature') signature?: string
  ) {
    await this.integrationService.ingestWebhook('SERVICENOW', payload, signature);
    return { acknowledged: true };
  }

  private parseProvider(providerParam: string): IntegrationProvider {
    const normalized = providerParam.toUpperCase();
    if (!INTEGRATION_PROVIDERS.includes(normalized as IntegrationProvider)) {
      throw new BadRequestException(`Unsupported integration provider: ${providerParam}`);
    }

    return normalized as IntegrationProvider;
  }

  private entriesToRecord(
    entries: Array<{ from: string; to: string }>,
    defaultValue: string
  ): Record<string, string> {
    const record = entries.reduce<Record<string, string>>((acc, entry) => {
      acc[entry.from] = entry.to;
      return acc;
    }, {});

    if (!record.default) {
      record.default = defaultValue;
    }

    return record;
  }
}
