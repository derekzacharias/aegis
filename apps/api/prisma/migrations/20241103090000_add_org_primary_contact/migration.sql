-- Add primary contact email for organizations

ALTER TABLE "Organization"
  ADD COLUMN IF NOT EXISTS "primaryContactEmail" TEXT;
