import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested
} from 'class-validator';

export class EvidenceHintDto {
  @IsOptional()
  @IsString()
  evidenceId?: string;

  @IsString()
  summary!: string;

  @IsOptional()
  @IsString()
  rationale?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : parseFloat(value)))
  @IsNumber()
  @Min(0)
  @Max(1)
  score?: number;
}

export class UpsertCrosswalkMappingDto {
  @IsString()
  sourceControlId!: string;

  @IsString()
  targetControlId!: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : parseFloat(value)))
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @IsOptional()
  @IsString()
  rationale?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => EvidenceHintDto)
  evidenceHints?: EvidenceHintDto[];
}
