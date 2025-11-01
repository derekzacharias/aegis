-- Extend control mapping metadata for crosswalk engine
DO $$ BEGIN
    CREATE TYPE "ControlMappingOrigin" AS ENUM ('SEED', 'ALGO', 'MANUAL');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "ControlMapping"
    ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS "origin" "ControlMappingOrigin" NOT NULL DEFAULT 'SEED';

CREATE UNIQUE INDEX IF NOT EXISTS "ControlMapping_source_target_key"
    ON "ControlMapping" ("sourceControlId", "targetControlId");

CREATE TABLE IF NOT EXISTS "ControlMappingEvidenceHint" (
    "id" TEXT PRIMARY KEY,
    "mappingId" TEXT NOT NULL,
    "evidenceId" TEXT,
    "summary" TEXT NOT NULL,
    "rationale" TEXT,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ControlMappingEvidenceHint_mappingId_fkey"
        FOREIGN KEY ("mappingId") REFERENCES "ControlMapping"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ControlMappingEvidenceHint_evidenceId_fkey"
        FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
