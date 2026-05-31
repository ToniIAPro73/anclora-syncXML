CREATE TYPE "PilotUserRole" AS ENUM ('admin', 'pilot_user');
CREATE TYPE "PilotUserStatus" AS ENUM ('active', 'revoked', 'expired');

CREATE TABLE "PilotUser" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "PilotUserRole" NOT NULL DEFAULT 'pilot_user',
  "status" "PilotUserStatus" NOT NULL DEFAULT 'active',
  "sourceRequestId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "lastLoginAt" TIMESTAMP(3),

  CONSTRAINT "PilotUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PilotUser_email_key" ON "PilotUser"("email");
CREATE INDEX "PilotUser_status_idx" ON "PilotUser"("status");
CREATE INDEX "PilotUser_sourceRequestId_idx" ON "PilotUser"("sourceRequestId");
