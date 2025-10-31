import { Injectable, Logger } from '@nestjs/common';
import { EvidenceStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

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
}

const STATUS_MAP_FROM_PRISMA: Record<EvidenceStatus, EvidenceItem['status']> = {
  [EvidenceStatus.PENDING]: 'pending',
  [EvidenceStatus.APPROVED]: 'approved',
  [EvidenceStatus.ARCHIVED]: 'archived'
};

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);
  private readonly fallbackItems: EvidenceItem[] = [
    {
      id: 'evidence-1',
      name: 'System Security Plan',
      controlIds: ['ac-2', 'ac-17'],
      frameworkIds: ['nist-800-53-rev5', 'nist-csf-2-0'],
      storagePath: 's3://local-evidence/system-security-plan.pdf',
      uploadedBy: 'alice@example.com',
      uploadedAt: new Date().toISOString(),
      reviewDue: null,
      status: 'approved'
    }
  ];

  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<EvidenceItem[]> {
    try {
      const items = await this.prisma.evidenceItem.findMany({
        include: {
          controls: {
            select: {
              assessmentControl: {
                select: {
                  controlId: true
                }
              }
            }
          },
          frameworks: {
            select: {
              frameworkId: true
            }
          },
          uploadedBy: true
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      });

      if (!items.length) {
        return this.fallbackItems;
      }

      return items.map((item) => ({
        id: item.id,
        name: item.name,
        controlIds: item.controls.map((control) => control.assessmentControl.controlId),
        frameworkIds: item.frameworks.map((fw) => fw.frameworkId),
        storagePath: item.storageUri,
        uploadedBy: item.uploadedBy?.email ?? 'unknown',
        uploadedAt: item.uploadedAt.toISOString(),
        reviewDue: item.reviewDue ? item.reviewDue.toISOString() : null,
        status: STATUS_MAP_FROM_PRISMA[item.status]
      }));
    } catch (error) {
      this.logger.warn(
        `Failed to load evidence items from database, using fallback seed: ${String(error)}`
      );
      return this.fallbackItems;
    }
  }
}
