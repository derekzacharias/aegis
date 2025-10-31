import { IsEnum, IsString, IsUrl } from 'class-validator';
import { IntegrationProvider } from '@prisma/client';

export class ConnectIntegrationDto {
  @IsEnum(IntegrationProvider)
  provider!: IntegrationProvider;

  @IsUrl({
    protocols: ['https']
  })
  baseUrl!: string;

  @IsString()
  clientId!: string;

  @IsString()
  clientSecret!: string;
}
