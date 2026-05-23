CREATE TABLE "IneMunicipio" (
    "id" TEXT NOT NULL,
    "codigoMunicipio" TEXT NOT NULL,
    "codigoProvincia" TEXT NOT NULL,
    "codigoMunicipioCorto" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreNormalizado" TEXT NOT NULL,
    "fuente" TEXT NOT NULL DEFAULT 'INE',
    "ineId" INTEGER,
    "ineVariableId" INTEGER,
    "ineJerarquiaPadres" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IneMunicipio_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IneMunicipio_codigoMunicipio_key" ON "IneMunicipio"("codigoMunicipio");
CREATE INDEX "IneMunicipio_codigoProvincia_idx" ON "IneMunicipio"("codigoProvincia");
CREATE INDEX "IneMunicipio_nombreNormalizado_idx" ON "IneMunicipio"("nombreNormalizado");
CREATE INDEX "IneMunicipio_codigoProvincia_nombreNormalizado_idx" ON "IneMunicipio"("codigoProvincia", "nombreNormalizado");
