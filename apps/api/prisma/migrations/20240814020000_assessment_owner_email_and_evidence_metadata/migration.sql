-- Add owner email tracking and evidence metadata columns required for UI mapping
ALTER TABLE "AssessmentProject"
    ADD COLUMN IF NOT EXISTS "ownerEmail" TEXT;

ALTER TABLE "EvidenceItem"
    ADD COLUMN IF NOT EXISTS "fileType" TEXT NOT NULL DEFAULT 'pdf',
    ADD COLUMN IF NOT EXISTS "sizeInKb" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "uploadedByEmail" TEXT,
    ADD COLUMN IF NOT EXISTS "lastReviewed" TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS "nextAction" TEXT,
    ADD COLUMN IF NOT EXISTS "displayControlIds" TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS "displayFrameworkIds" TEXT[] NOT NULL DEFAULT '{}';
