import {
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  IsUrl
} from 'class-validator';

const PHONE_REGEX = /^[\d\s()+\-.]{7,20}$/;

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, {
    message:
      'Phone numbers may include digits, spaces, and ()+- characters and must be at least 7 digits long'
  })
  phoneNumber?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: false
  })
  @MaxLength(512)
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  bio?: string;
}
