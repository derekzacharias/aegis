import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReprocessEvidenceDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
