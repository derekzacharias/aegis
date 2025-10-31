import { ArrayNotEmpty, IsArray, IsIn, IsString } from 'class-validator';

export class CreateReportDto {
  @IsString()
  assessmentId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(['html', 'pdf'], { each: true })
  formats!: Array<'html' | 'pdf'>;
}
