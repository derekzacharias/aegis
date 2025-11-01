-- Expand integration connection to support OAuth, webhooks, and mapping state
CREATE TYPE "IntegrationConnectionStatus" AS ENUM ('PENDING', 'CONNECTED', 'ERROR');

ALTER TABLE "IntegrationConnection"
    ADD COLUMN IF NOT EXISTS "oauthAccessToken" TEXT,
    ADD COLUMN IF NOT EXISTS "oauthRefreshToken" TEXT,
    ADD COLUMN IF NOT EXISTS "oauthExpiresAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "oauthScopes" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    ADD COLUMN IF NOT EXISTS "webhookSecret" TEXT,
    ADD COLUMN IF NOT EXISTS "webhookUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "mappingPreferences" JSONB DEFAULT '{}'::JSONB NOT NULL,
    ADD COLUMN IF NOT EXISTS "lastSyncedAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "lastWebhookAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "status" "IntegrationConnectionStatus" DEFAULT 'PENDING' NOT NULL,
    ADD COLUMN IF NOT EXISTS "statusMessage" TEXT,
    ADD COLUMN IF NOT EXISTS "syncCursor" TEXT;
