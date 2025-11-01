import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength
} from 'class-validator';

export class RequestUploadDto {
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  fileName!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(128)
  contentType!: string;

  @IsInt()
  @Min(1)
  sizeInBytes!: number;

  @IsOptional()
  @IsString()
  @Matches(/^sha256:[0-9a-f]{64}$/i, {
    message: 'Checksum must be in the format sha256:<64 hex characters>'
  })
  checksum?: string;
}
