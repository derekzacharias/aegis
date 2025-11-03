-- Extend user profile fields and add audit log table
ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT,
    ADD COLUMN IF NOT EXISTS "jobTitle" TEXT,
    ADD COLUMN IF NOT EXISTS "timezone" TEXT,
    ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "bio" TEXT;

CREATE TABLE IF NOT EXISTS "UserProfileAudit" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "actorId" TEXT,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "UserProfileAudit"
    ADD CONSTRAINT "UserProfileAudit_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "UserProfileAudit_userId_createdAt_idx"
    ON "UserProfileAudit" ("userId", "createdAt" DESC);
