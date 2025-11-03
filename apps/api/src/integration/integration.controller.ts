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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth.types';
import { ConnectIntegrationDto } from './dto/connect-integration.dto';
import { UpdateMappingDto } from './dto/update-mapping.dto';
import { InitiateOAuthDto } from './dto/initiate-oauth.dto';
import { CompleteOAuthDto } from './dto/complete-oauth.dto';
import {
  INTEGRATION_PROVIDERS,
  IntegrationDetail,
  IntegrationProvider,
  IntegrationTaskSnapshot,
  IntegrationSummary
} from './integration.types';
import { IntegrationService } from './integration.service';

@Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
@Controller('integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser): Promise<IntegrationSummary[]> {
    return this.integrationService.list(user.organizationId);
  }

  @Get(':provider')
  async detail(
    @Param('provider') providerParam: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<IntegrationDetail> {
    return this.integrationService.detail(user.organizationId, this.parseProvider(providerParam));
  }

  @Get(':provider/tasks')
  async listTasks(
    @Param('provider') providerParam: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<IntegrationTaskSnapshot[]> {
    return this.integrationService.listTasks(
      this.parseProvider(providerParam),
      user.organizationId
    );
  }

  @Put()
  @Roles(UserRole.ADMIN)
  async connect(
    @Body() payload: ConnectIntegrationDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<IntegrationDetail> {
    return this.integrationService.upsert(user.organizationId, {
      provider: payload.provider,
      baseUrl: payload.baseUrl,
      clientId: payload.clientId,
      clientSecret: payload.clientSecret,
      scopes: payload.scopes
    });
  }

  @Patch('mapping')
  @Roles(UserRole.ADMIN)
  async updateMapping(
    @Body() payload: UpdateMappingDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<IntegrationDetail> {
    const mapping = {
      projectKey: payload.mapping.projectKey ?? null,
      defaultIssueType: payload.mapping.defaultIssueType,
      assessmentTagField: payload.mapping.assessmentTagField ?? null,
      statusMapping: this.entriesToRecord(payload.mapping.statusMapping, 'backlog'),
      priorityMapping: this.entriesToRecord(payload.mapping.priorityMapping, 'medium')
    };

    return this.integrationService.updateMapping(user.organizationId, {
      provider: payload.provider,
      mapping
    });
  }

  @Post('oauth/initiate')
  @Roles(UserRole.ADMIN)
  async initiateOAuth(
    @Body() payload: InitiateOAuthDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.integrationService.initiateOAuth(user.organizationId, {
      provider: payload.provider,
      redirectUri: payload.redirectUri,
      scopes: payload.scopes
    });
  }

  @Post('oauth/complete')
  @Roles(UserRole.ADMIN)
  async completeOAuth(
    @Body() payload: CompleteOAuthDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<IntegrationDetail> {
    return this.integrationService.completeOAuth(user.organizationId, {
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
