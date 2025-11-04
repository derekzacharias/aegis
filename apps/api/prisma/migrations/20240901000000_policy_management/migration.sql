-- Policy and procedure management core entities
DO $$ BEGIN
    CREATE TYPE "PolicyVersionStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "PolicyApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "PolicyDocument" (
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

CREATE TABLE IF NOT EXISTS "PolicyVersion" (
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

CREATE TABLE IF NOT EXISTS "PolicyApproval" (
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

DO $$
DECLARE
    policy_document_table regclass := to_regclass('public."PolicyDocument"');
BEGIN
    IF policy_document_table IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'PolicyDocument_currentVersionId_fkey'
              AND conrelid = policy_document_table
        ) THEN
            ALTER TABLE "PolicyDocument"
                ADD CONSTRAINT "PolicyDocument_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "PolicyVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "PolicyDocument_currentVersionId_key" ON "PolicyDocument" ("currentVersionId");

CREATE UNIQUE INDEX IF NOT EXISTS "PolicyVersion_policyId_versionNumber_key" ON "PolicyVersion" ("policyId", "versionNumber");

CREATE UNIQUE INDEX IF NOT EXISTS "PolicyApproval_policyVersionId_approverId_key" ON "PolicyApproval" ("policyVersionId", "approverId");

CREATE INDEX IF NOT EXISTS "PolicyDocument_organizationId_idx" ON "PolicyDocument" ("organizationId");
CREATE INDEX IF NOT EXISTS "PolicyDocument_ownerId_idx" ON "PolicyDocument" ("ownerId");
CREATE INDEX IF NOT EXISTS "PolicyVersion_policyId_idx" ON "PolicyVersion" ("policyId");
CREATE INDEX IF NOT EXISTS "PolicyVersion_status_idx" ON "PolicyVersion" ("status");
CREATE INDEX IF NOT EXISTS "PolicyApproval_policyVersionId_idx" ON "PolicyApproval" ("policyVersionId");
CREATE INDEX IF NOT EXISTS "PolicyApproval_approverId_idx" ON "PolicyApproval" ("approverId");
