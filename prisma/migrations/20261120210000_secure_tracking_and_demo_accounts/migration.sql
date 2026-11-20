-- Add a private, unguessable credential for public shipment tracking.
ALTER TABLE "pakets" ADD COLUMN "trackingToken" TEXT;

UPDATE "pakets"
SET "trackingToken" = gen_random_uuid()::TEXT
WHERE "trackingToken" IS NULL;

ALTER TABLE "pakets" ALTER COLUMN "trackingToken" SET NOT NULL;

CREATE UNIQUE INDEX "pakets_trackingToken_key" ON "pakets"("trackingToken");

-- Disable previously seeded accounts with publicly documented credentials.
UPDATE "users"
SET "aktif" = false
WHERE "email" IN (
    'admin@ekspresku.test',
    'kurir@ekspresku.test',
    'pelanggan@ekspresku.test'
);
