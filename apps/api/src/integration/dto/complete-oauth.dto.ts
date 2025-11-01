import { IsIn, IsString } from 'class-validator';
import { INTEGRATION_PROVIDERS, IntegrationProvider } from '../integration.types';

export class CompleteOAuthDto {
  @IsIn(INTEGRATION_PROVIDERS)
  provider!: IntegrationProvider;

  @IsString()
  state!: string;

  @IsString()
  code!: string;
}
