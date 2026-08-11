CREATE TABLE "PaymentTransaction" (
  "id" TEXT NOT NULL,
  "doctorShieldRequestId" TEXT NOT NULL,
  "merchantTransactionId" TEXT NOT NULL,
  "checkoutId" TEXT,
  "resourcePath" TEXT,
  "gatewayTransactionId" TEXT,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "paymentType" TEXT NOT NULL,
  "paymentBrand" TEXT NOT NULL DEFAULT '',
  "paymentStatus" TEXT NOT NULL,
  "resultCode" TEXT,
  "failureReason" TEXT,
  "paidAt" TIMESTAMP(3),
  "attemptNumber" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PaymentTransaction"
  ADD CONSTRAINT "PaymentTransaction_doctorShieldRequestId_fkey"
  FOREIGN KEY ("doctorShieldRequestId") REFERENCES "DoctorShieldRequest"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "PaymentTransaction_merchantTransactionId_key" ON "PaymentTransaction"("merchantTransactionId");
CREATE UNIQUE INDEX "PaymentTransaction_checkoutId_key" ON "PaymentTransaction"("checkoutId");
CREATE UNIQUE INDEX "PaymentTransaction_gatewayTransactionId_key" ON "PaymentTransaction"("gatewayTransactionId");
CREATE UNIQUE INDEX "PaymentTransaction_request_attempt_key" ON "PaymentTransaction"("doctorShieldRequestId", "attemptNumber");
CREATE INDEX "PaymentTransaction_doctorShieldRequestId_idx" ON "PaymentTransaction"("doctorShieldRequestId");
CREATE INDEX "PaymentTransaction_resourcePath_idx" ON "PaymentTransaction"("resourcePath");
CREATE INDEX "PaymentTransaction_paymentStatus_idx" ON "PaymentTransaction"("paymentStatus");
