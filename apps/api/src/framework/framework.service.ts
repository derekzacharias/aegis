import { Injectable, Logger } from '@nestjs/common';
import { FrameworkFamily } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { frameworks as seededFrameworks } from './seed/frameworks.seed';

export type FrameworkSummary = {
  id: string;
  name: string;
  version: string;
  description: string;
  family: FrameworkFamily | 'Custom';
  controlCount: number;
};

@Injectable()
export class FrameworkService {
  private readonly logger = new Logger(FrameworkService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<FrameworkSummary[]> {
    try {
      const results = await this.prisma.framework.findMany({
        select: {
          id: true,
          name: true,
          version: true,
          description: true,
          family: true,
          controlCount: true
        },
        orderBy: { name: 'asc' }
      });

      if (results.length) {
        return results;
      }
    } catch (error) {
      this.logger.warn(
        `Unable to load frameworks from database, falling back to seed data: ${String(error)}`
      );
    }

    return seededFrameworks;
  }
}
