-- Create table for framework warmup caches
CREATE TABLE "FrameworkWarmupCache" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "crosswalkPayload" JSONB NOT NULL,
    "controlCatalogPayload" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedById" TEXT,
    CONSTRAINT "FrameworkWarmupCache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FrameworkWarmupCache_frameworkId_key" ON "FrameworkWarmupCache"("frameworkId");
CREATE INDEX "FrameworkWarmupCache_organizationId_generatedAt_idx" ON "FrameworkWarmupCache"("organizationId", "generatedAt");

ALTER TABLE "FrameworkWarmupCache"
    ADD CONSTRAINT "FrameworkWarmupCache_frameworkId_fkey"
        FOREIGN KEY ("frameworkId")
        REFERENCES "Framework"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;

ALTER TABLE "FrameworkWarmupCache"
    ADD CONSTRAINT "FrameworkWarmupCache_generatedById_fkey"
        FOREIGN KEY ("generatedById")
        REFERENCES "User"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
