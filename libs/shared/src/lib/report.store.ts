import type { ReportArtifactRecord } from './reporting.types';

type CryptoLike = { randomUUID?: () => string };

const generateId = (): string => {
  const cryptoApi = (globalThis as { crypto?: CryptoLike }).crypto;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }
  return `report-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
};

export class ReportStore {
  private readonly artifacts = new Map<string, ReportArtifactRecord>();

  save(partial: Omit<ReportArtifactRecord, 'id' | 'createdAt'>): ReportArtifactRecord {
    const record: ReportArtifactRecord = {
      ...partial,
      id: generateId(),
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
