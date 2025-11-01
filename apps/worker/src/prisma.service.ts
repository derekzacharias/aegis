import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly config: ConfigService) {
    super({
      datasources: {
        db: {
          url:
            config.get<string>('databaseUrl') ??
            config.get<string>('DATABASE_URL') ??
            'postgresql://localhost:5432/compliance'
        }
      }
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
