CREATE TABLE IF NOT EXISTS "DoctorShieldRequest" (
  "id" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "idNumber" TEXT NOT NULL,
  "specialty" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "employer" TEXT NOT NULL,
  "notes" TEXT NOT NULL,
  "hasBeenConvicted" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "paymentStatus" TEXT NOT NULL,
  "paymentAmount" TEXT NOT NULL,
  "voucherId" TEXT NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "cardBrand" TEXT NOT NULL,
  "cardLast4" TEXT NOT NULL,
  "adminNotes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DoctorShieldRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DoctorShieldRequest_status_idx" ON "DoctorShieldRequest"("status");
CREATE INDEX IF NOT EXISTS "DoctorShieldRequest_createdAt_idx" ON "DoctorShieldRequest"("createdAt");
