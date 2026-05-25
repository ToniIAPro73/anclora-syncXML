-- CreateEnum
CREATE TYPE "SesSubmissionStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'PROCESSING', 'PROCESSED', 'FAILED', 'PARTIAL', 'UNKNOWN');

-- CreateTable
CREATE TABLE "SesSubmission" (
    "id"                     TEXT NOT NULL,
    "createdAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"              TIMESTAMP(3) NOT NULL,
    "xmlHash"                TEXT NOT NULL,
    "fileName"               TEXT,
    "reference"              TEXT,
    "environment"            TEXT NOT NULL DEFAULT 'pre',
    "endpoint"               TEXT NOT NULL,
    "landlordCode"           TEXT NOT NULL,
    "establishmentCode"      TEXT,
    "applicationName"        TEXT NOT NULL DEFAULT 'Anclora SyncXML',
    "operationType"          TEXT NOT NULL DEFAULT 'A',
    "communicationType"      TEXT,
    "requestSoap"            TEXT,
    "responseSoap"           TEXT,
    "sesResponseCode"        TEXT,
    "sesResponseDescription" TEXT,
    "sesBatchCode"           TEXT,
    "batchStatus"            TEXT,
    "batchProcessedAt"       TIMESTAMP(3),
    "communicationCode"      TEXT,
    "status"                 "SesSubmissionStatus" NOT NULL DEFAULT 'SENT',
    "sesErrors"              JSONB,
    "lastCheckedAt"          TIMESTAMP(3),
    "queryHistory"           JSONB,

    CONSTRAINT "SesSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SesSubmission_sesBatchCode_idx" ON "SesSubmission"("sesBatchCode");

-- CreateIndex
CREATE INDEX "SesSubmission_reference_idx" ON "SesSubmission"("reference");

-- CreateIndex
CREATE INDEX "SesSubmission_createdAt_idx" ON "SesSubmission"("createdAt");
