ALTER TABLE IF EXISTS "Reservation" ADD COLUMN IF NOT EXISTS "ownerId" TEXT;

DO $$
BEGIN
  IF to_regclass('"Reservation"') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS "Reservation_ownerId_idx" ON "Reservation"("ownerId");
  END IF;
END $$;
