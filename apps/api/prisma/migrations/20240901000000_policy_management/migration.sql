-- Policy and procedure management core entities
CREATE TYPE "PolicyVersionStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

CREATE TYPE "PolicyApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "PolicyDocument" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reviewCadenceDays" INTEGER,
    "currentVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PolicyDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PolicyDocument_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "PolicyVersion" (
    "id" TEXT PRIMARY KEY,
    "policyId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "label" TEXT,
    "status" "PolicyVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "isCurrent" BOOLEAN NOT NULL DEFAULT FALSE,
    "supersedesId" TEXT,
    CONSTRAINT "PolicyVersion_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "PolicyDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PolicyVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PolicyVersion_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PolicyVersion_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PolicyVersion_supersedesId_fkey" FOREIGN KEY ("supersedesId") REFERENCES "PolicyVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "PolicyApproval" (
    "id" TEXT PRIMARY KEY,
    "policyVersionId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" "PolicyApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "decisionComment" TEXT,
    CONSTRAINT "PolicyApproval_policyVersionId_fkey" FOREIGN KEY ("policyVersionId") REFERENCES "PolicyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PolicyApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

ALTER TABLE "PolicyDocument"
    ADD CONSTRAINT "PolicyDocument_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "PolicyVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "PolicyVersion_policyId_versionNumber_key" ON "PolicyVersion" ("policyId", "versionNumber");

CREATE UNIQUE INDEX "PolicyApproval_policyVersionId_approverId_key" ON "PolicyApproval" ("policyVersionId", "approverId");

CREATE INDEX "PolicyDocument_organizationId_idx" ON "PolicyDocument" ("organizationId");
CREATE INDEX "PolicyDocument_ownerId_idx" ON "PolicyDocument" ("ownerId");
CREATE INDEX "PolicyVersion_policyId_idx" ON "PolicyVersion" ("policyId");
CREATE INDEX "PolicyVersion_status_idx" ON "PolicyVersion" ("status");
CREATE INDEX "PolicyApproval_policyVersionId_idx" ON "PolicyApproval" ("policyVersionId");
CREATE INDEX "PolicyApproval_approverId_idx" ON "PolicyApproval" ("approverId");
