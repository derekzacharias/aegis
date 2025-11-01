import { randomUUID } from 'crypto';
import type { ReportArtifactRecord } from './reporting.types';

export class ReportStore {
  private readonly artifacts = new Map<string, ReportArtifactRecord>();

  save(partial: Omit<ReportArtifactRecord, 'id' | 'createdAt'>): ReportArtifactRecord {
    const record: ReportArtifactRecord = {
      ...partial,
      id: randomUUID(),
      createdAt: new Date().toISOString()
    };

    this.artifacts.set(record.id, record);
    return record;
  }

  findByJob(jobId: string): ReportArtifactRecord[] {
    return Array.from(this.artifacts.values()).filter((artifact) => artifact.jobId === jobId);
  }

  get(id: string): ReportArtifactRecord | undefined {
    return this.artifacts.get(id);
  }

  clear() {
    this.artifacts.clear();
  }
}

export const reportStore = new ReportStore();
export type ReportStoreType = ReportStore;
