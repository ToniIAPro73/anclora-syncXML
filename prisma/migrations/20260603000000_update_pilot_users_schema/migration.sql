ALTER TABLE "PilotUser" ADD COLUMN "name" TEXT, ADD COLUMN "company" TEXT, ADD COLUMN "temporaryPassword" BOOLEAN NOT NULL DEFAULT true, ADD COLUMN "passwordRotatedAt" TIMESTAMP(3);
