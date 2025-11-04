import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  IsISO8601
} from 'class-validator';

export class UpdatePolicyVersionDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsISO8601()
  effectiveAt?: string | null;

  @IsOptional()
  @IsString()
  supersedesVersionId?: string | null;

  @IsOptional()
  @IsString()
  frameworkMappings?: string | null;
}

