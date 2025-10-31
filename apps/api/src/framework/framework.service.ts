import { Injectable } from '@nestjs/common';
import { frameworks as seededFrameworks } from './seed/frameworks.seed';
import { FrameworkFamily } from './framework.types';

export type FrameworkSummary = {
  id: string;
  name: string;
  version: string;
  description: string;
  family: FrameworkFamily;
  controlCount: number;
};

@Injectable()
export class FrameworkService {
  async list(): Promise<FrameworkSummary[]> {
    return seededFrameworks;
  }
}
