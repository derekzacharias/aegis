import {
  BaselineLevel as PrismaBaselineLevel,
  EvidenceIngestionStatus,
  EvidenceStatus,
  EvidenceStorageProvider,
  PolicyApprovalStatus,
  PolicyVersionStatus,
  Prisma,
  PrismaClient,
  UserRole
} from '@prisma/client';
import { hash } from 'bcrypt';
import { frameworks } from '../src/framework/seed/frameworks.seed';
import { controls } from '../src/framework/seed/controls.seed';
import { controlMappings } from '../src/framework/seed/control-mappings.seed';

const prisma = new PrismaClient();

const mapBaselines = (baselines?: readonly string[]): PrismaBaselineLevel[] =>
  (baselines ?? []).map((level) => level.toUpperCase() as PrismaBaselineLevel);

async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: 'aegis-compliance' },
    update: {
      primaryContactEmail: 'support@aegis.local'
    },
    create: {
      slug: 'aegis-compliance',
      name: 'Aegis Compliance Control Center',
      impactLevel: 'MODERATE',
      primaryContactEmail: 'support@aegis.local'
    }
  });

  for (const framework of frameworks) {
    await prisma.framework.upsert({
      where: { id: framework.id },
      create: {
        id: framework.id,
        slug: framework.id,
        name: framework.name,
        version: framework.version,
        description: framework.description,
        family: framework.family,
        status: 'PUBLISHED',
        isCustom: false,
        controlCount: framework.controlCount,
        metadata: Prisma.JsonNull,
        organizationId: organization.id
      },
      update: {
        slug: framework.id,
        name: framework.name,
        version: framework.version,
        description: framework.description,
        family: framework.family,
        status: 'PUBLISHED',
        isCustom: false,
        controlCount: framework.controlCount
      }
    });
  }

  for (const control of controls) {
    const kind = control.kind === 'enhancement' ? 'ENHANCEMENT' : 'BASE';
    const metadataValue =
      control.metadata === undefined
        ? Prisma.JsonNull
        : (control.metadata as Prisma.InputJsonValue | null) ?? Prisma.JsonNull;

    await prisma.control.upsert({
      where: { id: control.id },
      create: {
        id: control.id,
        frameworkId: control.frameworkId,
        family: control.family,
        title: control.title,
        description: control.description,
        priority: control.priority,
        kind,
        parentId: control.parentId ?? null,
        baselines: mapBaselines(control.baselines),
        keywords: control.keywords ?? [],
        references: control.references ?? [],
        relatedControls: control.relatedControls ?? [],
        tags: control.tags ?? [],
        metadata: metadataValue,
        isCustom: false
      },
      update: {
        frameworkId: control.frameworkId,
        family: control.family,
        kind,
        parentId: control.parentId ?? null,
        title: control.title,
        description: control.description,
        priority: control.priority,
        baselines: mapBaselines(control.baselines),
        keywords: control.keywords ?? [],
        references: control.references ?? [],
        relatedControls: control.relatedControls ?? [],
        tags: control.tags ?? [],
        metadata: metadataValue,
        isCustom: false
      }
    });
  }

  const adminEmail = process.env['SEED_ADMIN_EMAIL'] ?? 'admin@aegis.local';
  const adminPassword =
    process.env['SEED_ADMIN_PASSWORD'] ?? 'ChangeMeNow!42';
  const adminHash = await hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminHash,
      role: 'ADMIN',
      organizationId: organization.id,
      firstName: 'Aegis',
      lastName: 'Admin',
      jobTitle: 'System Administrator',
      timezone: 'UTC'
    },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      role: 'ADMIN',
      firstName: 'Aegis',
      lastName: 'Admin',
      organizationId: organization.id,
      jobTitle: 'System Administrator',
      timezone: 'UTC'
    }
  });

  const assessmentSeeds = [
    {
      id: 'assessment-fedramp-moderate',
      name: 'FedRAMP Moderate Baseline Readiness',
      status: 'IN_PROGRESS' as const,
      frameworkIds: ['nist-800-53-rev5', 'nist-csf-2-0'],
      progress: {
        satisfied: 142,
        partial: 98,
        unsatisfied: 34,
        total: 310
      }
    },
    {
      id: 'assessment-pci-gap',
      name: 'PCI DSS 4.0 Gap Analysis',
      status: 'DRAFT' as const,
      frameworkIds: ['pci-dss-4-0'],
      progress: {
        satisfied: 32,
        partial: 21,
        unsatisfied: 18,
        total: 120
      }
    },
    {
      id: 'assessment-cis-operational',
      name: 'CIS v8 Operational Review',
      status: 'COMPLETE' as const,
      frameworkIds: ['cis-v8'],
      progress: {
        satisfied: 153,
        partial: 0,
        unsatisfied: 0,
        total: 153
      }
    }
  ];

  for (const seed of assessmentSeeds) {
    await prisma.assessmentProject.upsert({
      where: { id: seed.id },
      create: {
        id: seed.id,
        name: seed.name,
        status: seed.status,
        organizationId: organization.id,
        ownerId: adminUser.id,
        ownerEmail: adminUser.email,
        progressSatisfied: seed.progress.satisfied,
        progressPartial: seed.progress.partial,
        progressUnsatisfied: seed.progress.unsatisfied,
        progressTotal: seed.progress.total,
        frameworks: {
          create: seed.frameworkIds.map((frameworkId) => ({
            framework: {
              connect: { id: frameworkId }
            }
          }))
        }
      },
      update: {
        name: seed.name,
        status: seed.status,
        ownerId: adminUser.id,
        ownerEmail: adminUser.email,
        progressSatisfied: seed.progress.satisfied,
        progressPartial: seed.progress.partial,
        progressUnsatisfied: seed.progress.unsatisfied,
        progressTotal: seed.progress.total,
        frameworks: {
          deleteMany: {},
          create: seed.frameworkIds.map((frameworkId) => ({
            framework: {
              connect: { id: frameworkId }
            }
          }))
        }
      }
    });
  }

  const mappingEvidenceHints: Array<{
    mappingId: string;
    evidenceId: string;
    summary: string;
    rationale?: string;
    score?: number;
  }> = [];

  for (const mapping of controlMappings) {
    const existing = await prisma.controlMapping.findFirst({
      where: {
        sourceControlId: mapping.sourceControlId,
        targetControlId: mapping.targetControlId
      }
    });

    const record = existing
      ? await prisma.controlMapping.update({
          where: { id: existing.id },
          data: {
            confidence: mapping.confidence,
            tags: mapping.tags ?? [],
            origin: mapping.origin ?? 'SEED',
            rationale: mapping.rationale
          }
        })
      : await prisma.controlMapping.create({
          data: {
            sourceControlId: mapping.sourceControlId,
            targetControlId: mapping.targetControlId,
            confidence: mapping.confidence,
            tags: mapping.tags ?? [],
            origin: mapping.origin ?? 'SEED',
            rationale: mapping.rationale
          }
        });

    await prisma.controlMappingEvidenceHint.deleteMany({
      where: { mappingId: record.id }
    });

    for (const hint of mapping.evidenceHints ?? []) {
      if (!hint.evidenceId) {
        continue;
      }
      mappingEvidenceHints.push({
        mappingId: record.id,
        evidenceId: hint.evidenceId,
        summary: hint.summary ?? 'See referenced evidence artifact',
        rationale: hint.rationale ?? undefined,
        score: hint.score ?? 0.5
      });
    }
  }

  const evidenceSeeds: Array<{
    id: string;
    name: string;
    storageUri: string;
    storageKey: string;
    originalFilename: string;
    contentType: string;
    fileSize: number;
    fileType: string;
    sizeInKb: number;
    displayFrameworkIds: string[];
    displayControlIds: string[];
    frameworkIds: string[];
    tags: string[];
    status: EvidenceStatus;
    ingestionStatus: EvidenceIngestionStatus;
    reviewDue?: Date | null;
    retentionPeriodDays?: number | null;
    retentionReason?: string | null;
    retentionExpiresAt?: Date | null;
    checksum?: string;
    notes?: string;
    nextAction?: string;
  }> = [
    {
      id: 'evidence-ra5-monthly-scan',
      name: 'Monthly Authenticated Vulnerability Scan',
      storageUri: 's3://seed/monthly-vuln-scan.pdf',
      storageKey: 'seed/monthly-vuln-scan.pdf',
      originalFilename: 'monthly-vulnerability-scan.pdf',
      contentType: 'application/pdf',
      fileSize: 1_572_864,
      fileType: 'pdf',
      sizeInKb: 1536,
      displayFrameworkIds: ['nist-800-53-rev5', 'cis-v8'],
      displayControlIds: ['ra-5', 'cis-4-1'],
      frameworkIds: ['nist-800-53-rev5', 'cis-v8'],
      tags: ['vulnerability', 'scan', 'continuous-monitoring'],
      status: EvidenceStatus.APPROVED,
      ingestionStatus: EvidenceIngestionStatus.COMPLETED,
      reviewDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120),
      retentionPeriodDays: 730,
      retentionReason: 'FedRAMP documentation retention (2 years)',
      retentionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 730),
      checksum: 'sha256:seed-ra5-scan',
      notes: 'Seeded report showing remediation tracking and scan cadence.',
      nextAction: 'Share with auditor'
    },
    {
      id: 'evidence-privileged-mfa-policy',
      name: 'Privileged Access MFA Enforcement Policy',
      storageUri: 's3://seed/privileged-mfa-policy.pdf',
      storageKey: 'seed/privileged-mfa-policy.pdf',
      originalFilename: 'privileged-mfa-policy.pdf',
      contentType: 'application/pdf',
      fileSize: 786_432,
      fileType: 'pdf',
      sizeInKb: 768,
      displayFrameworkIds: ['nist-800-53-rev5', 'pci-dss-4-0'],
      displayControlIds: ['ia-2', 'pci-8-2-6'],
      frameworkIds: ['nist-800-53-rev5', 'pci-dss-4-0'],
      tags: ['mfa', 'identity', 'access-control'],
      status: EvidenceStatus.PENDING,
      ingestionStatus: EvidenceIngestionStatus.PROCESSING,
      reviewDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      retentionPeriodDays: 365,
      retentionReason: 'Quarterly access control attestation',
      retentionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      checksum: 'sha256:seed-mfa-policy',
      notes: 'Seeded policy package covering multi-factor requirements for privileged accounts.',
      nextAction: 'Assign reviewer'
    }
  ];

  for (const seed of evidenceSeeds) {
    const metadata: Prisma.JsonObject = {
      controlIds: seed.displayControlIds,
      categories: ['reuse'],
      tags: seed.tags,
      notes: seed.notes ?? null,
      source: 'seed',
      nextAction: seed.nextAction ?? null
    };

    await prisma.evidenceItem.upsert({
      where: { id: seed.id },
      create: {
        id: seed.id,
        organizationId: organization.id,
        name: seed.name,
        storageUri: seed.storageUri,
        storageKey: seed.storageKey,
        storageProvider: EvidenceStorageProvider.S3,
        originalFilename: seed.originalFilename,
        contentType: seed.contentType,
        fileSize: seed.fileSize,
        fileType: seed.fileType,
        sizeInKb: seed.sizeInKb,
        checksum: seed.checksum ?? null,
        metadata,
        uploadedById: adminUser.id,
        uploadedByEmail: adminUser.email,
        reviewDue: seed.reviewDue ?? null,
        retentionPeriodDays: seed.retentionPeriodDays ?? null,
        retentionReason: seed.retentionReason ?? null,
        retentionExpiresAt: seed.retentionExpiresAt ?? null,
        status: seed.status,
        ingestionStatus: seed.ingestionStatus,
        nextAction: seed.nextAction ?? null,
        lastReviewed: seed.status === EvidenceStatus.APPROVED ? new Date() : null,
        displayFrameworkIds: seed.displayFrameworkIds,
        displayControlIds: seed.displayControlIds,
        frameworks: {
          create: seed.frameworkIds.map((frameworkId) => ({
            framework: {
              connect: { id: frameworkId }
            }
          }))
        }
      },
      update: {
        name: seed.name,
        storageUri: seed.storageUri,
        storageKey: seed.storageKey,
        originalFilename: seed.originalFilename,
        contentType: seed.contentType,
        fileSize: seed.fileSize,
        fileType: seed.fileType,
        sizeInKb: seed.sizeInKb,
        checksum: seed.checksum ?? null,
        metadata,
        uploadedById: adminUser.id,
        uploadedByEmail: adminUser.email,
        reviewDue: seed.reviewDue ?? null,
        retentionPeriodDays: seed.retentionPeriodDays ?? null,
        retentionReason: seed.retentionReason ?? null,
        retentionExpiresAt: seed.retentionExpiresAt ?? null,
        status: seed.status,
        ingestionStatus: seed.ingestionStatus,
        nextAction: seed.nextAction ?? null,
        lastReviewed: seed.status === EvidenceStatus.APPROVED ? new Date() : null,
        displayFrameworkIds: seed.displayFrameworkIds,
        displayControlIds: seed.displayControlIds,
        frameworks: {
          deleteMany: {},
          create: seed.frameworkIds.map((frameworkId) => ({
            framework: {
              connect: { id: frameworkId }
            }
          }))
        }
      }
    });

    await prisma.evidenceStatusHistory.create({
      data: {
        evidenceId: seed.id,
        fromStatus:
          seed.status === EvidenceStatus.PENDING ? null : EvidenceStatus.PENDING,
        toStatus: seed.status,
        changedById: adminUser.id,
        note: seed.notes ?? 'Seeded evidence record for demo purposes'
      }
    });
  }

  for (const hint of mappingEvidenceHints) {
    const evidenceExists = await prisma.evidenceItem.findUnique({
      where: { id: hint.evidenceId },
      select: { id: true }
    });

    if (!evidenceExists) {
      continue;
    }

    await prisma.controlMappingEvidenceHint.create({
      data: {
        mappingId: hint.mappingId,
        evidenceId: hint.evidenceId,
        summary: hint.summary,
        rationale: hint.rationale ?? null,
        score: hint.score ?? 0.5
      }
    });
  }

  const assessmentControlSeeds = [
    {
      id: 'assessment-control-ra-5',
      assessmentId: 'assessment-fedramp-moderate',
      controlId: 'ra-5',
      status: 'SATISFIED' as const,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      evidenceIds: ['evidence-ra5-monthly-scan']
    },
    {
      id: 'assessment-control-ia-2',
      assessmentId: 'assessment-fedramp-moderate',
      controlId: 'ia-2',
      status: 'PARTIAL' as const,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
      evidenceIds: ['evidence-privileged-mfa-policy']
    },
    {
      id: 'assessment-control-cis-4-1',
      assessmentId: 'assessment-cis-operational',
      controlId: 'cis-4-1',
      status: 'SATISFIED' as const,
      evidenceIds: ['evidence-ra5-monthly-scan']
    },
    {
      id: 'assessment-control-pci-8-2-6',
      assessmentId: 'assessment-pci-gap',
      controlId: 'pci-8-2-6',
      status: 'UNSATISFIED' as const,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      evidenceIds: ['evidence-privileged-mfa-policy']
    }
  ];

  for (const seed of assessmentControlSeeds) {
    const record = await prisma.assessmentControl.upsert({
      where: { id: seed.id },
      create: {
        id: seed.id,
        assessmentId: seed.assessmentId,
        controlId: seed.controlId,
        status: seed.status,
        dueDate: seed.dueDate ?? null
      },
      update: {
        status: seed.status,
        dueDate: seed.dueDate ?? null
      }
    });

    await prisma.assessmentEvidence.deleteMany({
      where: { assessmentControlId: record.id }
    });

    for (const evidenceId of seed.evidenceIds ?? []) {
      await prisma.assessmentEvidence.create({
        data: {
          assessmentControlId: record.id,
          evidenceId
        }
      });
    }
  }

  const [policyAuthor, policyCoAuthor, policyApprover] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alex.mercier@example.com' },
      update: {
        firstName: 'Alex',
        lastName: 'Mercier',
        role: UserRole.ANALYST,
        organizationId: organization.id
      },
      create: {
        email: 'alex.mercier@example.com',
        firstName: 'Alex',
        lastName: 'Mercier',
        role: UserRole.ANALYST,
        organizationId: organization.id
      }
    }),
    prisma.user.upsert({
      where: { email: 'nina.chen@example.com' },
      update: {
        firstName: 'Nina',
        lastName: 'Chen',
        role: UserRole.ADMIN,
        organizationId: organization.id
      },
      create: {
        email: 'nina.chen@example.com',
        firstName: 'Nina',
        lastName: 'Chen',
        role: UserRole.ADMIN,
        organizationId: organization.id
      }
    }),
    prisma.user.upsert({
      where: { email: 'owen.grant@example.com' },
      update: {
        firstName: 'Owen',
        lastName: 'Grant',
        role: UserRole.AUDITOR,
        organizationId: organization.id
      },
      create: {
        email: 'owen.grant@example.com',
        firstName: 'Owen',
        lastName: 'Grant',
        role: UserRole.AUDITOR,
        organizationId: organization.id
      }
    })
  ]);

  const securityPolicy = await prisma.policyDocument.upsert({
    where: { id: 'policy-information-security' },
    update: {
      title: 'Information Security Program Policy',
      description:
        'Baseline policy covering the management, monitoring, and continual improvement of the enterprise security program.',
      category: 'Security',
      tags: ['security', 'governance', 'iso27001'],
      ownerId: policyAuthor.id,
      organizationId: organization.id,
      reviewCadenceDays: 365
    },
    create: {
      id: 'policy-information-security',
      title: 'Information Security Program Policy',
      description:
        'Baseline policy covering the management, monitoring, and continual improvement of the enterprise security program.',
      category: 'Security',
      tags: ['security', 'governance', 'iso27001'],
      ownerId: policyAuthor.id,
      organizationId: organization.id,
      reviewCadenceDays: 365
    }
  });

  const securityV1 = await prisma.policyVersion.upsert({
    where: {
      policyId_versionNumber: {
        policyId: securityPolicy.id,
        versionNumber: 1
      }
    },
    update: {
      label: 'Initial Baseline',
      status: PolicyVersionStatus.APPROVED,
      approvedAt: new Date('2024-02-01T12:00:00.000Z'),
      approvedById: policyApprover.id,
      effectiveAt: new Date('2024-02-15T00:00:00.000Z'),
      notes: 'Approved baseline to align with FedRAMP and ISO requirements.',
      storagePath: 'policies/aegis-compliance/information-security/v1/policy.pdf',
      originalName: 'information-security-policy-v1.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 284_112,
      checksum: 'sha256:32f8013b8b51d16f4bfe1b837ab0a6daddc4d7dc0e38d6cf4cf6fb548d3e6f5e',
      isCurrent: true,
      submittedAt: new Date('2024-01-20T09:00:00.000Z'),
      submittedById: policyCoAuthor.id
    },
    create: {
      policyId: securityPolicy.id,
      versionNumber: 1,
      label: 'Initial Baseline',
      status: PolicyVersionStatus.APPROVED,
      createdById: policyAuthor.id,
      submittedAt: new Date('2024-01-20T09:00:00.000Z'),
      submittedById: policyCoAuthor.id,
      approvedAt: new Date('2024-02-01T12:00:00.000Z'),
      approvedById: policyApprover.id,
      effectiveAt: new Date('2024-02-15T00:00:00.000Z'),
      notes: 'Approved baseline to align with FedRAMP and ISO requirements.',
      storagePath: 'policies/aegis-compliance/information-security/v1/policy.pdf',
      originalName: 'information-security-policy-v1.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 284_112,
      checksum: 'sha256:32f8013b8b51d16f4bfe1b837ab0a6daddc4d7dc0e38d6cf4cf6fb548d3e6f5e',
      isCurrent: true
    }
  });

  const securityV2 = await prisma.policyVersion.upsert({
    where: {
      policyId_versionNumber: {
        policyId: securityPolicy.id,
        versionNumber: 2
      }
    },
    update: {
      label: 'Zero Trust Enhancements',
      status: PolicyVersionStatus.IN_REVIEW,
      submittedAt: new Date('2024-08-05T15:30:00.000Z'),
      submittedById: policyAuthor.id,
      supersedesId: securityV1.id,
      notes:
        'Incorporates zero trust requirements, updates metrics, and aligns with latest CIS controls.',
      storagePath: 'policies/aegis-compliance/information-security/v2/draft.docx',
      originalName: 'information-security-policy-v2-draft.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSizeBytes: 316_488,
      checksum: 'sha256:5fbe56d19e2a0a35d92ff14d6a6a5bd7f9b7f551ce01a1fb7fcc8aa3f471d8a1',
      isCurrent: false
    },
    create: {
      policyId: securityPolicy.id,
      versionNumber: 2,
      label: 'Zero Trust Enhancements',
      status: PolicyVersionStatus.IN_REVIEW,
      createdById: policyAuthor.id,
      submittedAt: new Date('2024-08-05T15:30:00.000Z'),
      submittedById: policyAuthor.id,
      supersedesId: securityV1.id,
      notes:
        'Incorporates zero trust requirements, updates metrics, and aligns with latest CIS controls.',
      storagePath: 'policies/aegis-compliance/information-security/v2/draft.docx',
      originalName: 'information-security-policy-v2-draft.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSizeBytes: 316_488,
      checksum: 'sha256:5fbe56d19e2a0a35d92ff14d6a6a5bd7f9b7f551ce01a1fb7fcc8aa3f471d8a1',
      isCurrent: false
    }
  });

  await prisma.policyDocument.update({
    where: { id: securityPolicy.id },
    data: { currentVersionId: securityV1.id }
  });

  await prisma.policyApproval.upsert({
    where: {
      policyVersionId_approverId: {
        policyVersionId: securityV1.id,
        approverId: policyApprover.id
      }
    },
    update: {
      status: PolicyApprovalStatus.APPROVED,
      decidedAt: new Date('2024-02-01T11:45:00.000Z'),
      decisionComment: 'Reviewed and approved for production release.'
    },
    create: {
      policyVersionId: securityV1.id,
      approverId: policyApprover.id,
      status: PolicyApprovalStatus.APPROVED,
      decidedAt: new Date('2024-02-01T11:45:00.000Z'),
      decisionComment: 'Reviewed and approved for production release.'
    }
  });

  await prisma.policyApproval.upsert({
    where: {
      policyVersionId_approverId: {
        policyVersionId: securityV2.id,
        approverId: policyApprover.id
      }
    },
    update: {
      status: PolicyApprovalStatus.PENDING,
      decidedAt: null,
      decisionComment: null
    },
    create: {
      policyVersionId: securityV2.id,
      approverId: policyApprover.id,
      status: PolicyApprovalStatus.PENDING
    }
  });

  const incidentResponsePolicy = await prisma.policyDocument.upsert({
    where: { id: 'policy-incident-response-plan' },
    update: {
      title: 'Incident Response Plan',
      description: 'Operational playbook guiding teams through triage, containment, and recovery actions.',
      category: 'Operations',
      tags: ['incident-response', 'ir', 'operations'],
      ownerId: policyCoAuthor.id,
      organizationId: organization.id,
      reviewCadenceDays: 180
    },
    create: {
      id: 'policy-incident-response-plan',
      title: 'Incident Response Plan',
      description: 'Operational playbook guiding teams through triage, containment, and recovery actions.',
      category: 'Operations',
      tags: ['incident-response', 'ir', 'operations'],
      ownerId: policyCoAuthor.id,
      organizationId: organization.id,
      reviewCadenceDays: 180
    }
  });

  await prisma.policyVersion.upsert({
    where: {
      policyId_versionNumber: {
        policyId: incidentResponsePolicy.id,
        versionNumber: 1
      }
    },
    update: {
      label: 'Draft for Q4 Tabletop',
      status: PolicyVersionStatus.DRAFT,
      createdById: policyCoAuthor.id,
      notes: 'Draft prepared ahead of tabletop exercise for leadership feedback.',
      storagePath: 'policies/aegis-compliance/incident-response/v1/draft.docx',
      originalName: 'incident-response-plan-v1-draft.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSizeBytes: 241_920,
      checksum: 'sha256:1fb6c08c5c4c4b501275e18d339dd52c37fb75f1cfa171f1cdb39a40e3c8f27c',
      isCurrent: false
    },
    create: {
      policyId: incidentResponsePolicy.id,
      versionNumber: 1,
      label: 'Draft for Q4 Tabletop',
      status: PolicyVersionStatus.DRAFT,
      createdById: policyCoAuthor.id,
      notes: 'Draft prepared ahead of tabletop exercise for leadership feedback.',
      storagePath: 'policies/aegis-compliance/incident-response/v1/draft.docx',
      originalName: 'incident-response-plan-v1-draft.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSizeBytes: 241_920,
      checksum: 'sha256:1fb6c08c5c4c4b501275e18d339dd52c37fb75f1cfa171f1cdb39a40e3c8f27c',
      isCurrent: false
    }
  });

  await prisma.policyDocument.update({
    where: { id: incidentResponsePolicy.id },
    data: { currentVersionId: null }
  });

  const localEvidenceSeeds: Array<{
    id: string;
    name: string;
    storageUri: string;
    storageKey: string;
    originalFilename: string;
    contentType: string;
    fileSize: number;
    checksum?: string;
    status: EvidenceStatus;
    ingestionStatus: EvidenceIngestionStatus;
    reviewDue?: Date | null;
    retentionPeriodDays?: number | null;
    retentionReason?: string | null;
    retentionExpiresAt?: Date | null;
    frameworks: string[];
  }> = [
    {
      id: 'seed-evidence-ssp',
      name: 'System Security Plan v2',
      storageUri: 's3://local-evidence/system-security-plan-v2.pdf',
      storageKey: 'system-security-plan-v2.pdf',
      originalFilename: 'system-security-plan-v2.pdf',
      contentType: 'application/pdf',
      fileSize: 18_400 * 1024,
      checksum: 'sha256:demo-ssp-hash',
      status: EvidenceStatus.APPROVED,
      ingestionStatus: EvidenceIngestionStatus.COMPLETED,
      reviewDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
      retentionPeriodDays: 730,
      retentionReason: 'FedRAMP documentation retention (2 years)',
      retentionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 730),
      frameworks: ['nist-800-53-rev5']
    },
    {
      id: 'seed-evidence-mfa',
      name: 'Privileged MFA Enforcement Screenshot',
      storageUri: 's3://local-evidence/mfa-enforcement.png',
      storageKey: 'mfa-enforcement.png',
      originalFilename: 'mfa-enforcement.png',
      contentType: 'image/png',
      fileSize: 820 * 1024,
      checksum: 'sha256:demo-mfa-hash',
      status: EvidenceStatus.PENDING,
      ingestionStatus: EvidenceIngestionStatus.PROCESSING,
      reviewDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      retentionPeriodDays: 365,
      retentionReason: 'Quarterly access control attestation',
      retentionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      frameworks: ['cis-v8', 'pci-dss-4-0']
    }
  ];

  for (const seed of localEvidenceSeeds) {
    await prisma.evidenceStatusHistory.deleteMany({
      where: { evidenceId: seed.id }
    });

    await prisma.evidenceItem.upsert({
      where: { id: seed.id },
      update: {
        name: seed.name,
        storageUri: seed.storageUri,
        storageKey: seed.storageKey,
        storageProvider: EvidenceStorageProvider.LOCAL,
        originalFilename: seed.originalFilename,
        contentType: seed.contentType,
        fileSize: seed.fileSize,
        checksum: seed.checksum,
        metadata: {
          frameworks: seed.frameworks,
          seed: true
        } as Prisma.JsonObject,
        reviewerId: adminUser.id,
        uploadedById: adminUser.id,
        reviewDue: seed.reviewDue ?? null,
        retentionPeriodDays: seed.retentionPeriodDays ?? null,
        retentionReason: seed.retentionReason ?? null,
        retentionExpiresAt: seed.retentionExpiresAt ?? null,
        status: seed.status,
        ingestionStatus: seed.ingestionStatus,
        frameworks: {
          deleteMany: {},
          create: seed.frameworks.map((frameworkId) => ({
            framework: {
              connect: { id: frameworkId }
            }
          }))
        }
      },
      create: {
        id: seed.id,
        name: seed.name,
        storageUri: seed.storageUri,
        storageKey: seed.storageKey,
        storageProvider: EvidenceStorageProvider.LOCAL,
        originalFilename: seed.originalFilename,
        contentType: seed.contentType,
        fileSize: seed.fileSize,
        checksum: seed.checksum,
        metadata: {
          frameworks: seed.frameworks,
          seed: true
        } as Prisma.JsonObject,
        organizationId: organization.id,
        reviewerId: adminUser.id,
        uploadedById: adminUser.id,
        reviewDue: seed.reviewDue ?? null,
        retentionPeriodDays: seed.retentionPeriodDays ?? null,
        retentionReason: seed.retentionReason ?? null,
        retentionExpiresAt: seed.retentionExpiresAt ?? null,
        status: seed.status,
        ingestionStatus: seed.ingestionStatus,
        frameworks: {
          create: seed.frameworks.map((frameworkId) => ({
            framework: {
              connect: { id: frameworkId }
            }
          }))
        }
      }
    });

    await prisma.evidenceStatusHistory.create({
      data: {
        evidenceId: seed.id,
        fromStatus:
          seed.status === EvidenceStatus.PENDING ? null : EvidenceStatus.PENDING,
        toStatus: seed.status,
        changedById: adminUser.id,
        note: 'Seeded evidence record for demo purposes'
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
