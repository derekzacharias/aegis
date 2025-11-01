import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateEvidenceLinksDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assessmentControlIds?: string[];
}
