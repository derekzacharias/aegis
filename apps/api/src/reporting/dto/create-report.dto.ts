import { ArrayNotEmpty, IsArray, IsIn, IsString } from 'class-validator';
import { ReportFormat } from '@compliance/shared';

export class CreateReportDto {
  @IsString()
  assessmentId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(['html', 'pdf'], { each: true })
  formats!: ReportFormat[];
}
