import { Module } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { PolicyController } from './policy.controller';
import { PolicyActorGuard } from './policy-actor.guard';
import { PolicyStorageService } from './policy.storage';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PolicyService, PolicyActorGuard, PolicyStorageService],
  controllers: [PolicyController]
})
export class PolicyModule {}
