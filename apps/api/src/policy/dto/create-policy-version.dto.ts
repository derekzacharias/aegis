import {
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';

export class CreatePolicyVersionDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @IsOptional()
  @IsISO8601()
  effectiveAt?: string;

  @IsOptional()
  @IsString()
  supersedesVersionId?: string;
}
