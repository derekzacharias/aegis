import { ArrayNotEmpty, IsArray, IsEmail, IsString } from 'class-validator';

export class CreateAssessmentDto {
  @IsString()
  name!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  frameworkIds!: string[];

  @IsEmail()
  owner!: string;
}
