import { IsArray, IsIn, IsOptional, IsString, IsUrl } from 'class-validator';
import { INTEGRATION_PROVIDERS, IntegrationProvider } from '../integration.types';

export class InitiateOAuthDto {
  @IsIn(INTEGRATION_PROVIDERS)
  provider!: IntegrationProvider;

  @IsUrl({ require_tld: false })
  redirectUri!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];
}
