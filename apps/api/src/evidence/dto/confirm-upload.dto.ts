import { EvidenceStatus } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class ConfirmUploadDto {
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  name!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  frameworkIds!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  controlIds?: string[];

  @IsOptional()
  @IsISO8601()
  reviewDue?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  retentionPeriodDays?: number;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  retentionReason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  reviewerId?: string;

  @IsOptional()
  @IsEnum(EvidenceStatus)
  initialStatus?: EvidenceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  statusNote?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  nextAction?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(64)
  source?: string;
}
