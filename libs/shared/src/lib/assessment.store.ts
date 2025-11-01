import { randomUUID } from 'crypto';
import type { AssessmentSummary, AssessmentProgress } from './assessment.types';

export interface AssessmentCreateInput
  extends Pick<AssessmentSummary, 'name' | 'frameworkIds' | 'owner'> {}

export interface AssessmentRecord extends AssessmentSummary {
  progress: AssessmentProgress;
}

export class AssessmentStore {
  private readonly assessments = new Map<string, AssessmentRecord>();

  constructor() {
    const now = new Date().toISOString();

    const seedData: Array<Omit<AssessmentRecord, 'id'>> = [
      {
        name: 'FedRAMP Moderate Baseline Readiness',
        frameworkIds: ['nist-800-53-rev5', 'nist-csf-2-0'],
        status: 'in-progress',
        owner: 'compliance-team@example.com',
        createdAt: now,
        updatedAt: now,
        progress: {
          satisfied: 142,
          partial: 98,
          unsatisfied: 34,
          total: 310
        }
      },
      {
        name: 'PCI DSS 4.0 Gap Analysis',
        frameworkIds: ['pci-dss-4-0'],
        status: 'draft',
        owner: 'payments@example.com',
        createdAt: now,
        updatedAt: now,
        progress: {
          satisfied: 32,
          partial: 21,
          unsatisfied: 18,
          total: 120
        }
      },
      {
        name: 'CIS v8 Operational Review',
        frameworkIds: ['cis-v8'],
        status: 'complete',
        owner: 'automation@example.com',
        createdAt: now,
        updatedAt: now,
        progress: {
          satisfied: 153,
          partial: 0,
          unsatisfied: 0,
          total: 153
        }
      }
    ];

    seedData.forEach((record) => this.create(record));
  }

  list(): AssessmentRecord[] {
    return Array.from(this.assessments.values()).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
  }

  get(id: string): AssessmentRecord | undefined {
    return this.assessments.get(id);
  }

  create(payload: Omit<AssessmentRecord, 'id'>): AssessmentRecord {
    const id = randomUUID();
    const record: AssessmentRecord = { id, ...payload };
    this.assessments.set(id, record);
    return record;
  }

  updateStatus(id: string, status: AssessmentRecord['status']): AssessmentRecord {
    const current = this.assessments.get(id);

    if (!current) {
      throw new Error(`Assessment ${id} not found`);
    }

    const updated: AssessmentRecord = {
      ...current,
      status,
      updatedAt: new Date().toISOString()
    };

    this.assessments.set(id, updated);
    return updated;
  }

  reset() {
    this.assessments.clear();
    // Reseed using constructor logic
    const now = new Date().toISOString();
    const seedRecords = [
      {
        name: 'FedRAMP Moderate Baseline Readiness',
        frameworkIds: ['nist-800-53-rev5', 'nist-csf-2-0'],
        status: 'in-progress' as const,
        owner: 'compliance-team@example.com',
        createdAt: now,
        updatedAt: now,
        progress: {
          satisfied: 142,
          partial: 98,
          unsatisfied: 34,
          total: 310
        }
      },
      {
        name: 'PCI DSS 4.0 Gap Analysis',
        frameworkIds: ['pci-dss-4-0'],
        status: 'draft' as const,
        owner: 'payments@example.com',
        createdAt: now,
        updatedAt: now,
        progress: {
          satisfied: 32,
          partial: 21,
          unsatisfied: 18,
          total: 120
        }
      },
      {
        name: 'CIS v8 Operational Review',
        frameworkIds: ['cis-v8'],
        status: 'complete' as const,
        owner: 'automation@example.com',
        createdAt: now,
        updatedAt: now,
        progress: {
          satisfied: 153,
          partial: 0,
          unsatisfied: 0,
          total: 153
        }
      }
    ];

    seedRecords.forEach((record) => this.create(record));
  }
}

export const assessmentStore = new AssessmentStore();

export type AssessmentStoreType = AssessmentStore;
