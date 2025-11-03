-- Extend evidence storage schema for upload workflow, retention, and auditing

DO $$ BEGIN
    CREATE TYPE "EvidenceStorageProvider" AS ENUM ('S3', 'LOCAL');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "EvidenceUploadStatus" AS ENUM ('PENDING', 'UPLOADED', 'CONFIRMED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "EvidenceIngestionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'QUARANTINED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TYPE "EvidenceStatus" ADD VALUE 'QUARANTINED';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "EvidenceUploadRequest" (
    "id" TEXT PRIMARY KEY,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvidenceUploadRequest_organizationId_fkey"
        FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvidenceUploadRequest_requestedById_fkey"
        FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "EvidenceUploadRequest_org_idx"
    ON "EvidenceUploadRequest"("organizationId");

CREATE INDEX IF NOT EXISTS "EvidenceUploadRequest_status_idx"
    ON "EvidenceUploadRequest"("status");

ALTER TABLE "EvidenceItem"
    ADD COLUMN IF NOT EXISTS "storageKey" TEXT,
    ADD COLUMN IF NOT EXISTS "storageProvider" "EvidenceStorageProvider" NOT NULL DEFAULT 'S3',
    ADD COLUMN IF NOT EXISTS "originalFilename" TEXT,
    ADD COLUMN IF NOT EXISTS "contentType" TEXT,
    ADD COLUMN IF NOT EXISTS "fileSize" INTEGER,
    ADD COLUMN IF NOT EXISTS "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS "reviewerId" TEXT,
    ADD COLUMN IF NOT EXISTS "uploadRequestId" TEXT,
    ADD COLUMN IF NOT EXISTS "retentionPeriodDays" INTEGER,
    ADD COLUMN IF NOT EXISTS "retentionExpiresAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "retentionReason" TEXT,
    ADD COLUMN IF NOT EXISTS "ingestionStatus" "EvidenceIngestionStatus" NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS "ingestionNotes" TEXT,
    ADD COLUMN IF NOT EXISTS "lastStatusChangeAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "EvidenceItem"
SET
    "storageKey" = COALESCE("storageKey", regexp_replace("storageUri", '^.*/', '')),
    "originalFilename" = COALESCE("originalFilename", "name"),
    "contentType" = COALESCE("contentType", 'application/octet-stream'),
    "fileSize" = COALESCE("fileSize", 0)
WHERE TRUE;

ALTER TABLE "EvidenceItem"
    ALTER COLUMN "storageKey" SET NOT NULL,
    ALTER COLUMN "originalFilename" SET NOT NULL,
    ALTER COLUMN "contentType" SET NOT NULL,
    ALTER COLUMN "fileSize" SET NOT NULL;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'EvidenceItem_reviewerId_fkey'
    ) THEN
        ALTER TABLE "EvidenceItem"
            ADD CONSTRAINT "EvidenceItem_reviewerId_fkey"
                FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'EvidenceItem_uploadRequestId_fkey'
    ) THEN
        ALTER TABLE "EvidenceItem"
            ADD CONSTRAINT "EvidenceItem_uploadRequestId_fkey"
                FOREIGN KEY ("uploadRequestId") REFERENCES "EvidenceUploadRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'EvidenceItem_uploadRequestId_unique'
    ) THEN
        ALTER TABLE "EvidenceItem"
            ADD CONSTRAINT "EvidenceItem_uploadRequestId_unique" UNIQUE ("uploadRequestId");
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "EvidenceItem_reviewer_idx"
    ON "EvidenceItem"("reviewerId");

CREATE INDEX IF NOT EXISTS "EvidenceItem_ingestion_status_idx"
    ON "EvidenceItem"("ingestionStatus");

CREATE TABLE IF NOT EXISTS "EvidenceStatusHistory" (
    "id" TEXT PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "fromStatus" "EvidenceStatus",
    "toStatus" "EvidenceStatus" NOT NULL,
    "note" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT,
    CONSTRAINT "EvidenceStatusHistory_evidenceId_fkey"
        FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvidenceStatusHistory_changedById_fkey"
        FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "EvidenceStatusHistory_evidence_idx"
    ON "EvidenceStatusHistory"("evidenceId");
