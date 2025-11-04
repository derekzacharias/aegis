-- Add mustResetPassword flag to users
ALTER TABLE "User"
ADD COLUMN "mustResetPassword" BOOLEAN NOT NULL DEFAULT false;

-- Create table for user invites
CREATE TABLE "UserInvite" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ANALYST',
    "invitedById" TEXT,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserInvite_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserInvite_organizationId_email_idx" ON "UserInvite" ("organizationId", "email");

ALTER TABLE "UserInvite"
ADD CONSTRAINT "UserInvite_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserInvite"
ADD CONSTRAINT "UserInvite_invitedById_fkey"
FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create table for forced password reset tokens
CREATE TABLE "UserPasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserPasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserPasswordResetToken_userId_expiresAt_idx"
ON "UserPasswordResetToken" ("userId", "expiresAt");

ALTER TABLE "UserPasswordResetToken"
ADD CONSTRAINT "UserPasswordResetToken_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
