import { IsArray, IsIn, IsOptional, IsString, IsUrl } from 'class-validator';
import { INTEGRATION_PROVIDERS, IntegrationProvider } from '../integration.types';

export class ConnectIntegrationDto {
  @IsIn(INTEGRATION_PROVIDERS)
  provider!: IntegrationProvider;

  @IsUrl({
    protocols: ['https']
  })
  baseUrl!: string;

  @IsString()
  clientId!: string;

  @IsString()
  clientSecret!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];
}
