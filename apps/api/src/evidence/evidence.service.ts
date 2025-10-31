import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface EvidenceItem {
  id: string;
  name: string;
  controlIds: string[];
  frameworkIds: string[];
  storagePath: string;
  uploadedBy: string;
  uploadedAt: string;
  reviewDue: string | null;
  status: 'pending' | 'approved' | 'archived';
  fileType: string;
  sizeInKb: number;
  lastReviewed: string | null;
  nextAction: string | null;
}

export interface CreateEvidenceInput {
  name: string;
  controlIds: string[];
  frameworkIds: string[];
  uploadedBy: string;
  status: EvidenceItem['status'];
  fileType: string;
  sizeInKb: number;
}

@Injectable()
export class EvidenceService {
  private readonly items: Map<string, EvidenceItem> = new Map();

  constructor() {
    const now = new Date().toISOString();
    const seed: EvidenceItem[] = [
      {
        id: 'evidence-1',
        name: 'System Security Plan',
        controlIds: ['ac-2', 'ac-17'],
        frameworkIds: ['nist-800-53-rev5', 'nist-csf-2-0'],
        storagePath: 's3://local-evidence/system-security-plan.pdf',
        uploadedBy: 'alice@example.com',
        uploadedAt: now,
        reviewDue: null,
        status: 'approved',
        fileType: 'pdf',
        sizeInKb: 18400,
        lastReviewed: now,
        nextAction: 'Share with auditor'
      },
      {
        id: 'evidence-2',
        name: 'PCI Access Control Policy',
        controlIds: ['pci-8-2-6'],
        frameworkIds: ['pci-dss-4-0'],
        storagePath: 's3://local-evidence/pci-access-control.docx',
        uploadedBy: 'payments@example.com',
        uploadedAt: now,
        reviewDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        status: 'pending',
        fileType: 'docx',
        sizeInKb: 920,
        lastReviewed: null,
        nextAction: 'Assign reviewer'
      },
      {
        id: 'evidence-3',
        name: 'CIS Benchmark Scan Results',
        controlIds: ['cis-4-1'],
        frameworkIds: ['cis-v8'],
        storagePath: 's3://local-evidence/cis-scan-results.csv',
        uploadedBy: 'automation@example.com',
        uploadedAt: now,
        reviewDue: null,
        status: 'archived',
        fileType: 'csv',
        sizeInKb: 560,
        lastReviewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
        nextAction: 'Superseded'
      }
    ];

    seed.forEach((item) => this.items.set(item.id, item));
  }

  async list(): Promise<EvidenceItem[]> {
    return Array.from(this.items.values()).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }

  async create(payload: CreateEvidenceInput): Promise<EvidenceItem> {
    const now = new Date().toISOString();
    const item: EvidenceItem = {
      id: uuidv4(),
      name: payload.name,
      controlIds: payload.controlIds,
      frameworkIds: payload.frameworkIds,
      storagePath: `s3://local-evidence/${payload.name.toLowerCase().replace(/\s+/g, '-')}.${payload.fileType}`,
      uploadedBy: payload.uploadedBy,
      uploadedAt: now,
      reviewDue: null,
      status: payload.status,
      fileType: payload.fileType,
      sizeInKb: payload.sizeInKb,
      lastReviewed: null,
      nextAction: 'Pending triage'
    };

    this.items.set(item.id, item);
    return item;
  }
}
