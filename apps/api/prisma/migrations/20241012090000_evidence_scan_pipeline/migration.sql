-- Create Enum for scan status
CREATE TYPE "EvidenceScanStatus" AS ENUM ('PENDING', 'RUNNING', 'CLEAN', 'INFECTED', 'FAILED');

-- Add new columns to EvidenceItem for caching latest scan details
ALTER TABLE "EvidenceItem"
  ADD COLUMN IF NOT EXISTS "lastScanStatus" "EvidenceScanStatus",
  ADD COLUMN IF NOT EXISTS "lastScanAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastScanEngine" TEXT,
  ADD COLUMN IF NOT EXISTS "lastScanSignatureVersion" TEXT,
  ADD COLUMN IF NOT EXISTS "lastScanNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "lastScanDurationMs" INTEGER,
  ADD COLUMN IF NOT EXISTS "lastScanBytes" INTEGER;

-- Create EvidenceScan table to persist antivirus metadata
CREATE TABLE IF NOT EXISTS "EvidenceScan" (
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
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EvidenceScan_pkey" PRIMARY KEY ("id")
);

-- Relationship between scans and evidence
ALTER TABLE "EvidenceScan"
  ADD CONSTRAINT "EvidenceScan_evidenceId_fkey"
  FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "EvidenceScan_evidenceId_idx" ON "EvidenceScan" ("evidenceId");
