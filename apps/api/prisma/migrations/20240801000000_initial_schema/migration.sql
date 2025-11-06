-- CreateEnum
CREATE TYPE "ImpactLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateEnum
CREATE TYPE "IntegrationConnectionStatus" AS ENUM ('PENDING', 'CONNECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "ControlMappingOrigin" AS ENUM ('SEED', 'ALGO', 'MANUAL');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ANALYST', 'AUDITOR', 'READ_ONLY');

-- CreateEnum
CREATE TYPE "FrameworkFamily" AS ENUM ('NIST', 'CIS', 'PCI', 'ISO', 'CUSTOM');

-- CreateEnum
CREATE TYPE "FrameworkStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ControlPriority" AS ENUM ('P0', 'P1', 'P2', 'P3');

-- CreateEnum
CREATE TYPE "ControlKind" AS ENUM ('BASE', 'ENHANCEMENT');

-- CreateEnum
CREATE TYPE "BaselineLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'PRIVACY');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETE');

-- CreateEnum
CREATE TYPE "ControlStatus" AS ENUM ('UNASSESSED', 'SATISFIED', 'PARTIAL', 'UNSATISFIED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('PENDING', 'APPROVED', 'ARCHIVED', 'QUARANTINED');

-- CreateEnum
CREATE TYPE "EvidenceStorageProvider" AS ENUM ('S3', 'LOCAL');

-- CreateEnum
CREATE TYPE "EvidenceUploadStatus" AS ENUM ('PENDING', 'UPLOADED', 'CONFIRMED', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "EvidenceIngestionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'QUARANTINED');

-- CreateEnum
CREATE TYPE "EvidenceScanStatus" AS ENUM ('PENDING', 'RUNNING', 'CLEAN', 'INFECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'BLOCKED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('HTML', 'PDF');

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('JIRA', 'SERVICENOW');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('EVIDENCE_REVIEW_REMINDER', 'RECURRING_ASSESSMENT', 'AGENT_HEALTH_CHECK', 'PROFILE_CONTACT_REMINDER');

-- CreateEnum
CREATE TYPE "ScheduleFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PolicyVersionStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PolicyApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PolicyAuditAction" AS ENUM ('POLICY_CREATED', 'VERSION_CREATED', 'VERSION_SUBMITTED', 'APPROVAL_RECORDED', 'VERSION_PUBLISHED', 'VERSION_ARCHIVED', 'RETENTION_UPDATED', 'DOCUMENT_DOWNLOADED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "impactLevel" "ImpactLevel" NOT NULL DEFAULT 'MODERATE',
    "primaryContactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "passwordHash" TEXT,
    "refreshTokenHash" TEXT,
    "refreshTokenId" TEXT,
    "refreshTokenIssuedAt" TIMESTAMP(3),
    "refreshTokenInvalidatedAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "phoneNumber" TEXT,
    "jobTitle" TEXT,
    "timezone" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ANALYST',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Framework" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "family" "FrameworkFamily" NOT NULL,
    "status" "FrameworkStatus" NOT NULL DEFAULT 'DRAFT',
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "controlCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Framework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Control" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "ControlPriority" NOT NULL DEFAULT 'P2',
    "kind" "ControlKind" NOT NULL DEFAULT 'BASE',
    "parentId" TEXT,
    "baselines" "BaselineLevel"[] DEFAULT ARRAY[]::"BaselineLevel"[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "references" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedControls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlMapping" (
    "id" TEXT NOT NULL,
    "sourceControlId" TEXT NOT NULL,
    "targetControlId" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "rationale" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "origin" "ControlMappingOrigin" NOT NULL DEFAULT 'SEED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ControlMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfileAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actorId" TEXT,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProfileAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlMappingEvidenceHint" (
    "id" TEXT NOT NULL,
    "mappingId" TEXT NOT NULL,
    "evidenceId" TEXT,
    "summary" TEXT NOT NULL,
    "rationale" TEXT,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ControlMappingEvidenceHint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "organizationId" TEXT NOT NULL,
    "ownerId" TEXT,
    "ownerEmail" TEXT,
    "targetMaturity" SMALLINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "progressSatisfied" INTEGER NOT NULL DEFAULT 0,
    "progressPartial" INTEGER NOT NULL DEFAULT 0,
    "progressUnsatisfied" INTEGER NOT NULL DEFAULT 0,
    "progressTotal" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AssessmentProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentFramework" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,

    CONSTRAINT "AssessmentFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentControl" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "status" "ControlStatus" NOT NULL DEFAULT 'UNASSESSED',
    "ownerId" TEXT,
    "dueDate" TIMESTAMP(3),
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentControl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "storageUri" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageProvider" "EvidenceStorageProvider" NOT NULL DEFAULT 'S3',
    "originalFilename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL DEFAULT 'pdf',
    "sizeInKb" INTEGER NOT NULL DEFAULT 0,
    "checksum" TEXT,
    "metadata" JSONB NOT NULL,
    "uploadedById" TEXT,
    "uploadedByEmail" TEXT,
    "reviewerId" TEXT,
    "uploadRequestId" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewDue" TIMESTAMP(3),
    "retentionPeriodDays" INTEGER,
    "retentionExpiresAt" TIMESTAMP(3),
    "retentionReason" TEXT,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'PENDING',
    "ingestionStatus" "EvidenceIngestionStatus" NOT NULL DEFAULT 'PENDING',
    "ingestionNotes" TEXT,
    "lastScanStatus" "EvidenceScanStatus",
    "lastScanAt" TIMESTAMP(3),
    "lastScanEngine" TEXT,
    "lastScanSignatureVersion" TEXT,
    "lastScanNotes" TEXT,
    "lastScanDurationMs" INTEGER,
    "lastScanBytes" INTEGER,
    "lastStatusChangeAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewed" TIMESTAMP(3),
    "nextAction" TEXT,
    "displayControlIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "displayFrameworkIds" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceUploadRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "requestedById" TEXT,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeInBytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "storageProvider" "EvidenceStorageProvider" NOT NULL DEFAULT 'S3',
    "storageKey" TEXT NOT NULL,
    "uploadUrl" TEXT,
    "uploadAuthToken" TEXT NOT NULL,
    "status" "EvidenceUploadStatus" NOT NULL DEFAULT 'PENDING',
    "uploadExpiresAt" TIMESTAMP(3) NOT NULL,
    "uploadedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "failureReason" TEXT,
    "lastErrorAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceUploadRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceStatusHistory" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "fromStatus" "EvidenceStatus",
    "toStatus" "EvidenceStatus" NOT NULL,
    "note" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT,

    CONSTRAINT "EvidenceStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceScan" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "status" "EvidenceScanStatus" NOT NULL DEFAULT 'PENDING',
    "engine" TEXT NOT NULL,
    "engineVersion" TEXT,
    "signatureVersion" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "bytesScanned" INTEGER,
    "findings" JSONB,
    "failureReason" TEXT,
    "quarantined" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceFramework" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,

    CONSTRAINT "EvidenceFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentEvidence" (
    "id" TEXT NOT NULL,
    "assessmentControlId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT,
    "assessmentControlId" TEXT,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "ownerId" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentAuditLog" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportArtifact" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "format" "ReportFormat" NOT NULL,
    "storageUri" TEXT NOT NULL,
    "requestedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationConnection" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "oauthAccessToken" TEXT,
    "oauthRefreshToken" TEXT,
    "oauthExpiresAt" TIMESTAMP(3),
    "oauthScopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "webhookSecret" TEXT,
    "webhookUrl" TEXT,
    "mappingPreferences" JSONB,
    "lastSyncedAt" TIMESTAMP(3),
    "lastWebhookAt" TIMESTAMP(3),
    "status" "IntegrationConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "statusMessage" TEXT,
    "syncCursor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "ownerId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ScheduleType" NOT NULL,
    "frequency" "ScheduleFrequency" NOT NULL,
    "nextRun" TIMESTAMP(3) NOT NULL,
    "lastRun" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyDocument" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reviewCadenceDays" INTEGER,
    "currentVersionId" TEXT,
    "retentionPeriodDays" INTEGER,
    "retentionReason" TEXT,
    "retentionExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyVersion" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "label" TEXT,
    "status" "PolicyVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "submittedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "effectiveAt" TIMESTAMP(3),
    "notes" TEXT,
    "storagePath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "supersedesId" TEXT,

    CONSTRAINT "PolicyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyApproval" (
    "id" TEXT NOT NULL,
    "policyVersionId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" "PolicyApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "decidedAt" TIMESTAMP(3),
    "decisionComment" TEXT,

    CONSTRAINT "PolicyApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyVersionFramework" (
    "id" TEXT NOT NULL,
    "policyVersionId" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "controlFamilies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "controlIds" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "PolicyVersionFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyAuditLog" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "policyVersionId" TEXT,
    "action" "PolicyAuditAction" NOT NULL,
    "actorId" TEXT,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Framework_organizationId_slug_key" ON "Framework"("organizationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Framework_organizationId_name_version_key" ON "Framework"("organizationId", "name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ControlMapping_sourceControlId_targetControlId_key" ON "ControlMapping"("sourceControlId", "targetControlId");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceItem_uploadRequestId_key" ON "EvidenceItem"("uploadRequestId");

-- CreateIndex
CREATE INDEX "EvidenceScan_evidenceId_idx" ON "EvidenceScan"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentEvidence_assessmentControlId_evidenceId_key" ON "AssessmentEvidence"("assessmentControlId", "evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyDocument_currentVersionId_key" ON "PolicyDocument"("currentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyVersion_policyId_versionNumber_key" ON "PolicyVersion"("policyId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyApproval_policyVersionId_approverId_key" ON "PolicyApproval"("policyVersionId", "approverId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyVersionFramework_policyVersionId_frameworkId_key" ON "PolicyVersionFramework"("policyVersionId", "frameworkId");

-- CreateIndex
CREATE INDEX "PolicyAuditLog_policyId_createdAt_idx" ON "PolicyAuditLog"("policyId", "createdAt");

-- CreateIndex
CREATE INDEX "PolicyAuditLog_policyVersionId_createdAt_idx" ON "PolicyAuditLog"("policyVersionId", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Framework" ADD CONSTRAINT "Framework_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Framework" ADD CONSTRAINT "Framework_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Framework" ADD CONSTRAINT "Framework_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Control" ADD CONSTRAINT "Control_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Control" ADD CONSTRAINT "Control_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Control"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Control" ADD CONSTRAINT "Control_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Control" ADD CONSTRAINT "Control_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlMapping" ADD CONSTRAINT "ControlMapping_sourceControlId_fkey" FOREIGN KEY ("sourceControlId") REFERENCES "Control"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlMapping" ADD CONSTRAINT "ControlMapping_targetControlId_fkey" FOREIGN KEY ("targetControlId") REFERENCES "Control"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfileAudit" ADD CONSTRAINT "UserProfileAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey

-- AddForeignKey
ALTER TABLE "ControlMappingEvidenceHint" ADD CONSTRAINT "ControlMappingEvidenceHint_mappingId_fkey" FOREIGN KEY ("mappingId") REFERENCES "ControlMapping"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlMappingEvidenceHint" ADD CONSTRAINT "ControlMappingEvidenceHint_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentProject" ADD CONSTRAINT "AssessmentProject_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentProject" ADD CONSTRAINT "AssessmentProject_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentFramework" ADD CONSTRAINT "AssessmentFramework_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "AssessmentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentFramework" ADD CONSTRAINT "AssessmentFramework_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentControl" ADD CONSTRAINT "AssessmentControl_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "AssessmentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentControl" ADD CONSTRAINT "AssessmentControl_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentControl" ADD CONSTRAINT "AssessmentControl_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_uploadRequestId_fkey" FOREIGN KEY ("uploadRequestId") REFERENCES "EvidenceUploadRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceUploadRequest" ADD CONSTRAINT "EvidenceUploadRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceUploadRequest" ADD CONSTRAINT "EvidenceUploadRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceStatusHistory" ADD CONSTRAINT "EvidenceStatusHistory_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceStatusHistory" ADD CONSTRAINT "EvidenceStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceScan" ADD CONSTRAINT "EvidenceScan_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceFramework" ADD CONSTRAINT "EvidenceFramework_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceFramework" ADD CONSTRAINT "EvidenceFramework_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentEvidence" ADD CONSTRAINT "AssessmentEvidence_assessmentControlId_fkey" FOREIGN KEY ("assessmentControlId") REFERENCES "AssessmentControl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentEvidence" ADD CONSTRAINT "AssessmentEvidence_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "AssessmentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assessmentControlId_fkey" FOREIGN KEY ("assessmentControlId") REFERENCES "AssessmentControl"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAuditLog" ADD CONSTRAINT "AssessmentAuditLog_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "AssessmentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAuditLog" ADD CONSTRAINT "AssessmentAuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAuditLog" ADD CONSTRAINT "AssessmentAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportArtifact" ADD CONSTRAINT "ReportArtifact_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "AssessmentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportArtifact" ADD CONSTRAINT "ReportArtifact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportArtifact" ADD CONSTRAINT "ReportArtifact_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyDocument" ADD CONSTRAINT "PolicyDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyDocument" ADD CONSTRAINT "PolicyDocument_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyDocument" ADD CONSTRAINT "PolicyDocument_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "PolicyVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyVersion" ADD CONSTRAINT "PolicyVersion_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "PolicyDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyVersion" ADD CONSTRAINT "PolicyVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyVersion" ADD CONSTRAINT "PolicyVersion_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyVersion" ADD CONSTRAINT "PolicyVersion_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyVersion" ADD CONSTRAINT "PolicyVersion_supersedesId_fkey" FOREIGN KEY ("supersedesId") REFERENCES "PolicyVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyApproval" ADD CONSTRAINT "PolicyApproval_policyVersionId_fkey" FOREIGN KEY ("policyVersionId") REFERENCES "PolicyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyApproval" ADD CONSTRAINT "PolicyApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyVersionFramework" ADD CONSTRAINT "PolicyVersionFramework_policyVersionId_fkey" FOREIGN KEY ("policyVersionId") REFERENCES "PolicyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyVersionFramework" ADD CONSTRAINT "PolicyVersionFramework_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAuditLog" ADD CONSTRAINT "PolicyAuditLog_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "PolicyDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAuditLog" ADD CONSTRAINT "PolicyAuditLog_policyVersionId_fkey" FOREIGN KEY ("policyVersionId") REFERENCES "PolicyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAuditLog" ADD CONSTRAINT "PolicyAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
