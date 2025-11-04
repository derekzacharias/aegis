import { IsIn } from 'class-validator';
import { AntivirusAutoReleaseStrategy } from '@compliance/shared';

const STRATEGIES: AntivirusAutoReleaseStrategy[] = ['manual', 'pending', 'previous'];

export class UpdateAntivirusSettingsDto {
  @IsIn(STRATEGIES)
  autoReleaseStrategy!: AntivirusAutoReleaseStrategy;
}
