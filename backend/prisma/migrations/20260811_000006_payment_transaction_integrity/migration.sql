ALTER TABLE "PaymentTransaction"
  ADD COLUMN IF NOT EXISTS "integrity" TEXT;
