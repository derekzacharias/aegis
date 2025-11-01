import { ArrayNotEmpty, IsArray, IsOptional, IsString, Matches } from 'class-validator';

const OPTIONAL_EMAIL_REGEX = /^\s*$|^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export class UpdateAssessmentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  frameworkIds?: string[];

  @IsOptional()
  @IsString()
  @Matches(OPTIONAL_EMAIL_REGEX, {
    message: 'owner must be empty or a valid email address'
  })
  owner?: string;
}
