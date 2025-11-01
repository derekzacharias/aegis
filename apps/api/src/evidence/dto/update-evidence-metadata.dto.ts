import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEvidenceMetadataDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  controlIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  frameworkIds?: string[];

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
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  nextAction?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  source?: string;
}
