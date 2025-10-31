import { Module } from '@nestjs/common';
import { FrameworkService } from './framework.service';
import { FrameworkController } from './framework.controller';

@Module({
  providers: [FrameworkService],
  controllers: [FrameworkController],
  exports: [FrameworkService]
})
export class FrameworkModule {}
