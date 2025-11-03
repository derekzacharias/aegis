import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { IntegrationOAuthService } from './integration-oauth.service';
import { IntegrationDomainService } from './integration-domain.service';

@Module({
  imports: [PrismaModule],
  providers: [IntegrationService, IntegrationOAuthService, IntegrationDomainService],
  controllers: [IntegrationController],
  exports: [IntegrationService]
})
export class IntegrationModule {}
