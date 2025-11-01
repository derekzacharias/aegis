import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { INTEGRATION_PROVIDERS, IntegrationProvider } from '../integration.types';

export class MappingEntryDto {
  @IsString()
  from!: string;

  @IsString()
  to!: string;
}

export class MappingPreferencesDto {
  @IsOptional()
  @IsString()
  projectKey?: string;

  @IsString()
  defaultIssueType!: string;

  @IsOptional()
  @IsString()
  assessmentTagField?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MappingEntryDto)
  statusMapping!: MappingEntryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MappingEntryDto)
  priorityMapping!: MappingEntryDto[];
}

export class UpdateMappingDto {
  @IsIn(INTEGRATION_PROVIDERS)
  provider!: IntegrationProvider;

  @ValidateNested()
  @Type(() => MappingPreferencesDto)
  mapping!: MappingPreferencesDto;
}
