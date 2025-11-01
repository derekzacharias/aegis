import { IsObject, IsOptional } from 'class-validator';

export class PublishFrameworkDto {
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
