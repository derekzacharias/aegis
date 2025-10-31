import { Body, Controller, Get, Put } from '@nestjs/common';
import { ConnectIntegrationDto } from './dto/connect-integration.dto';
import { IntegrationService, IntegrationSummary } from './integration.service';

@Controller('integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get()
  async list(): Promise<IntegrationSummary[]> {
    return this.integrationService.list();
  }

  @Put()
  async connect(@Body() payload: ConnectIntegrationDto): Promise<IntegrationSummary> {
    return this.integrationService.upsert({
      provider: payload.provider,
      baseUrl: payload.baseUrl,
      clientId: payload.clientId,
      clientSecret: payload.clientSecret
    });
  }
}
