import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FrameworkService } from './framework.service';
import { FrameworkController } from './framework.controller';
import { CrosswalkService } from './crosswalk.service';

@Module({
  imports: [PrismaModule],
  providers: [FrameworkService, CrosswalkService],
  controllers: [FrameworkController],
  exports: [FrameworkService, CrosswalkService]
})
export class FrameworkModule {}
