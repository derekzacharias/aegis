import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { CustomControlDto } from './create-custom-framework.dto';

export class UpsertCustomControlsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CustomControlDto)
  controls!: CustomControlDto[];
}
