import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';

export class SubmitPolicyVersionDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  approverIds!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
