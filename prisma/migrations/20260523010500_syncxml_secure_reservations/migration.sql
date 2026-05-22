-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('DRAFT', 'IMPORTED', 'VALIDATED', 'XML_GENERATED', 'CONSOLIDATED', 'DOWNLOADED', 'DELETED');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'VALID', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "StoredFileType" AS ENUM ('SOURCE_EXCEL', 'GENERATED_XML', 'VALIDATION_REPORT');

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "establishmentCode" TEXT,
    "address" TEXT,
    "municipality" TEXT,
    "municipalityCode" TEXT,
    "postalCode" TEXT,
    "province" TEXT,
    "countryIso3" TEXT DEFAULT 'ESP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "reference" TEXT,
    "channel" TEXT,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "contractDate" TIMESTAMP(3),
    "guestCount" INTEGER,
    "roomCount" INTEGER,
    "internet" BOOLEAN,
    "paymentType" TEXT,
    "paymentMethod" TEXT,
    "paymentHolder" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'DRAFT',
    "validationStatus" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "sourceExcelFileId" TEXT,
    "generatedXmlFileId" TEXT,
    "validationReportJson" JSONB,
    "normalizedPayloadJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "generatedAt" TIMESTAMP(3),
    "downloadedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "sourceRow" INTEGER,
    "role" TEXT DEFAULT 'VI',
    "firstName" TEXT NOT NULL,
    "surname1" TEXT NOT NULL,
    "surname2" TEXT,
    "birthDate" TIMESTAMP(3),
    "nationalityIso3" TEXT,
    "documentType" TEXT,
    "documentNumber" TEXT,
    "documentSupport" TEXT,
    "sex" TEXT,
    "address" TEXT,
    "addressComplement" TEXT,
    "municipality" TEXT,
    "municipalityCode" TEXT,
    "postalCode" TEXT,
    "countryIso3" TEXT,
    "phone" TEXT,
    "phone2" TEXT,
    "email" TEXT,
    "relationship" TEXT,
    "validationStatus" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "validationErrors" JSONB,
    "validationWarnings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoredFile" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT,
    "type" "StoredFileType" NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "safeFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "blobUrl" TEXT,
    "blobPath" TEXT,
    "encrypted" BOOLEAN NOT NULL DEFAULT true,
    "encryptionIv" TEXT,
    "encryptionAuthTag" TEXT,
    "sha256" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StoredFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT,
    "eventType" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reservation_reference_idx" ON "Reservation"("reference");

-- CreateIndex
CREATE INDEX "Reservation_checkIn_idx" ON "Reservation"("checkIn");

-- CreateIndex
CREATE INDEX "Reservation_checkOut_idx" ON "Reservation"("checkOut");

-- CreateIndex
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");

-- CreateIndex
CREATE INDEX "Reservation_deletedAt_idx" ON "Reservation"("deletedAt");

-- CreateIndex
CREATE INDEX "Guest_reservationId_idx" ON "Guest"("reservationId");

-- CreateIndex
CREATE INDEX "Guest_documentNumber_idx" ON "Guest"("documentNumber");

-- CreateIndex
CREATE INDEX "Guest_email_idx" ON "Guest"("email");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoredFile" ADD CONSTRAINT "StoredFile_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
