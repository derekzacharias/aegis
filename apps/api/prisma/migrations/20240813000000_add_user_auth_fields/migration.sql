-- Add password and refresh token hash fields to support authentication
ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "passwordHash" TEXT,
    ADD COLUMN IF NOT EXISTS "refreshTokenHash" TEXT,
    ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);
