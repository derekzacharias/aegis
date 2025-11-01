import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';

export class CreatePolicyDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(30)
  reviewCadenceDays?: number;

  @IsOptional()
  @IsString()
  ownerId?: string;
}
