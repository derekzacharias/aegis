import { EvidenceIngestionStatus, EvidenceStatus } from '@prisma/client';
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength
} from 'class-validator';

export class UpdateEvidenceStatusDto {
  @IsEnum(EvidenceStatus)
  status!: EvidenceStatus;

  @IsOptional()
  @IsEnum(EvidenceIngestionStatus)
  ingestionStatus?: EvidenceIngestionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  reviewerId?: string;

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
  @MaxLength(256)
  ingestionNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  statusNote?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  nextAction?: string;
}
