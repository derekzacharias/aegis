-- Add tracking fields for assessment progress and user login metadata
ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMPTZ;

ALTER TABLE "AssessmentProject"
    ADD COLUMN IF NOT EXISTS "progressSatisfied" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "progressPartial" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "progressUnsatisfied" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "progressTotal" INTEGER NOT NULL DEFAULT 0;
