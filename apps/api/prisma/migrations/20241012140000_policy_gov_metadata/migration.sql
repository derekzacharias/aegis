-- Add retention metadata to policy documents
ALTER TABLE "PolicyDocument"
  ADD COLUMN IF NOT EXISTS "retentionPeriodDays" INTEGER,
  ADD COLUMN IF NOT EXISTS "retentionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "retentionExpiresAt" TIMESTAMP(3);

-- Create audit action enum
DO $$ BEGIN
  CREATE TYPE "PolicyAuditAction" AS ENUM (
    'POLICY_CREATED',
    'VERSION_CREATED',
    'VERSION_SUBMITTED',
    'APPROVAL_RECORDED',
    'VERSION_PUBLISHED',
    'VERSION_ARCHIVED',
    'RETENTION_UPDATED',
    'DOCUMENT_DOWNLOADED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- PolicyVersionFramework mapping table
CREATE TABLE IF NOT EXISTS "PolicyVersionFramework" (
  "id" TEXT PRIMARY KEY,
  "policyVersionId" TEXT NOT NULL,
  "frameworkId" TEXT NOT NULL,
  "controlFamilies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "controlIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  CONSTRAINT "PolicyVersionFramework_policyVersionId_fkey"
    FOREIGN KEY ("policyVersionId") REFERENCES "PolicyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PolicyVersionFramework_frameworkId_fkey"
    FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PolicyVersionFramework_policyVersionId_frameworkId_key"
    UNIQUE ("policyVersionId", "frameworkId")
);

-- Policy audit trail table
CREATE TABLE IF NOT EXISTS "PolicyAuditLog" (
  "id" TEXT PRIMARY KEY,
  "policyId" TEXT NOT NULL,
  "policyVersionId" TEXT,
  "action" "PolicyAuditAction" NOT NULL,
  "actorId" TEXT,
  "message" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PolicyAuditLog_policyId_fkey"
    FOREIGN KEY ("policyId") REFERENCES "PolicyDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PolicyAuditLog_policyVersionId_fkey"
    FOREIGN KEY ("policyVersionId") REFERENCES "PolicyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PolicyAuditLog_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "PolicyAuditLog_policyId_createdAt_idx"
  ON "PolicyAuditLog" ("policyId", "createdAt");

CREATE INDEX IF NOT EXISTS "PolicyAuditLog_policyVersionId_createdAt_idx"
  ON "PolicyAuditLog" ("policyVersionId", "createdAt");
