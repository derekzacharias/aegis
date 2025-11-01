import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString
} from 'class-validator';
import { CreateEvidenceInput } from '../evidence.service';

export class CreateEvidenceDto implements CreateEvidenceInput {
  @IsString()
  name!: string;

  @IsArray()
  controlIds!: string[];

  @ArrayNotEmpty()
  frameworkIds!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assessmentControlIds?: string[];

  @IsString()
  uploadedBy!: string;

  @IsIn(['pending', 'approved', 'archived'])
  status!: 'pending' | 'approved' | 'archived';

  @IsString()
  fileType!: string;

  @IsNumber()
  @IsPositive()
  sizeInKb!: number;
}
