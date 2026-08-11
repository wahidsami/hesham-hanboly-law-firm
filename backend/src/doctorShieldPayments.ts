import { prisma } from './db';
import type { DoctorShieldCharge } from './doctorShieldPricing';

export type PaymentLifecycleStatus = 'pending' | 'initiated' | 'succeeded' | 'failed' | 'expired';

export interface PaymentTransactionRecord {
  id: string;
  doctorShieldRequestId: string;
  merchantTransactionId: string;
  checkoutId: string | null;
  integrity: string | null;
  resourcePath: string | null;
  gatewayTransactionId: string | null;
  amount: number;
  currency: string;
  paymentType: string;
  paymentBrand: string;
  paymentStatus: PaymentLifecycleStatus;
  resultCode: string | null;
  failureReason: string | null;
  paidAt: Date | null;
  attemptNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorShieldPaymentSummaryPatch {
  paymentStatus?: string;
  paymentAmount?: string;
  paymentMethod?: string;
  cardBrand?: string;
  cardLast4?: string;
}

export const paymentTransactionToRecord = (transaction: {
  id: string;
  doctorShieldRequestId: string;
  merchantTransactionId: string;
  checkoutId: string | null;
  integrity: string | null;
  resourcePath: string | null;
  gatewayTransactionId: string | null;
  amount: number;
  currency: string;
  paymentType: string;
  paymentBrand: string;
  paymentStatus: string;
  resultCode: string | null;
  failureReason: string | null;
  paidAt: Date | null;
  attemptNumber: number;
  createdAt: Date;
  updatedAt: Date;
}): PaymentTransactionRecord => ({
  id: transaction.id,
  doctorShieldRequestId: transaction.doctorShieldRequestId,
  merchantTransactionId: transaction.merchantTransactionId,
  checkoutId: transaction.checkoutId,
  integrity: transaction.integrity,
  resourcePath: transaction.resourcePath,
  gatewayTransactionId: transaction.gatewayTransactionId,
  amount: transaction.amount,
  currency: transaction.currency,
  paymentType: transaction.paymentType,
  paymentBrand: transaction.paymentBrand,
  paymentStatus: transaction.paymentStatus as PaymentLifecycleStatus,
  resultCode: transaction.resultCode,
  failureReason: transaction.failureReason,
  paidAt: transaction.paidAt,
  attemptNumber: transaction.attemptNumber,
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt,
});

export const listPaymentTransactionsForRequest = async (doctorShieldRequestId: string) =>
  prisma.paymentTransaction.findMany({
    where: { doctorShieldRequestId },
    orderBy: [{ attemptNumber: 'asc' }, { createdAt: 'asc' }],
  });

export const getLatestPaymentTransactionForRequest = async (doctorShieldRequestId: string) =>
  prisma.paymentTransaction.findFirst({
    where: { doctorShieldRequestId },
    orderBy: [{ attemptNumber: 'desc' }, { createdAt: 'desc' }],
  });

export const getSuccessfulPaymentTransactionForRequest = async (doctorShieldRequestId: string) =>
  prisma.paymentTransaction.findFirst({
    where: {
      doctorShieldRequestId,
      paymentStatus: 'succeeded',
    },
    orderBy: [{ paidAt: 'desc' }, { updatedAt: 'desc' }],
  });

export const getPaymentTransactionByCheckoutId = async (checkoutId: string) =>
  prisma.paymentTransaction.findUnique({
    where: { checkoutId },
  });

export const getPaymentTransactionByMerchantTransactionId = async (merchantTransactionId: string) =>
  prisma.paymentTransaction.findUnique({
    where: { merchantTransactionId },
  });

export const getNextAttemptNumber = async (doctorShieldRequestId: string) => {
  const latest = await getLatestPaymentTransactionForRequest(doctorShieldRequestId);
  return latest ? latest.attemptNumber + 1 : 1;
};

export const createPaymentTransactionAttempt = async (payload: {
  doctorShieldRequestId: string;
  merchantTransactionId: string;
  checkoutId?: string | null;
  integrity?: string | null;
  resourcePath?: string | null;
  gatewayTransactionId?: string | null;
  amount: DoctorShieldCharge['amount'];
  currency: string;
  paymentType: string;
  paymentBrand?: string;
  paymentStatus?: PaymentLifecycleStatus;
  resultCode?: string | null;
  failureReason?: string | null;
  paidAt?: Date | null;
  attemptNumber: number;
}) => prisma.paymentTransaction.create({
  data: {
    doctorShieldRequestId: payload.doctorShieldRequestId,
    merchantTransactionId: payload.merchantTransactionId,
    checkoutId: payload.checkoutId ?? null,
    integrity: payload.integrity ?? null,
    resourcePath: payload.resourcePath ?? null,
    gatewayTransactionId: payload.gatewayTransactionId ?? null,
    amount: payload.amount,
    currency: payload.currency,
    paymentType: payload.paymentType,
    paymentBrand: payload.paymentBrand || '',
    paymentStatus: payload.paymentStatus || 'pending',
    resultCode: payload.resultCode ?? null,
    failureReason: payload.failureReason ?? null,
    paidAt: payload.paidAt ?? null,
    attemptNumber: payload.attemptNumber,
  },
});

export const updatePaymentTransaction = async (
  id: string,
  patch: Partial<{
    checkoutId: string | null;
    integrity: string | null;
    resourcePath: string | null;
    gatewayTransactionId: string | null;
    paymentBrand: string;
    paymentStatus: PaymentLifecycleStatus;
    resultCode: string | null;
    failureReason: string | null;
    paidAt: Date | null;
    amount: number;
    currency: string;
    paymentType: string;
  }>,
) => prisma.paymentTransaction.update({
  where: { id },
  data: {
    checkoutId: patch.checkoutId,
    integrity: patch.integrity,
    resourcePath: patch.resourcePath,
    gatewayTransactionId: patch.gatewayTransactionId,
    paymentBrand: patch.paymentBrand,
    paymentStatus: patch.paymentStatus,
    resultCode: patch.resultCode,
    failureReason: patch.failureReason,
    paidAt: patch.paidAt,
    amount: typeof patch.amount === 'number' ? patch.amount : undefined,
    currency: patch.currency,
    paymentType: patch.paymentType,
  },
});

export const updateDoctorShieldPaymentSummary = async (
  doctorShieldRequestId: string,
  patch: DoctorShieldPaymentSummaryPatch,
) => {
  const existing = await prisma.doctorShieldRequest.findUnique({
    where: { id: doctorShieldRequestId },
  });
  if (!existing) {
    throw new Error('Doctor Shield request not found.');
  }

  await prisma.doctorShieldRequest.update({
    where: { id: doctorShieldRequestId },
    data: {
      paymentStatus: patch.paymentStatus ?? existing.paymentStatus,
      paymentAmount: patch.paymentAmount ?? existing.paymentAmount,
      paymentMethod: patch.paymentMethod ?? existing.paymentMethod,
      cardBrand: patch.cardBrand ?? existing.cardBrand,
      cardLast4: patch.cardLast4 ?? existing.cardLast4,
    },
  });

  return prisma.doctorShieldRequest.findUnique({
    where: { id: doctorShieldRequestId },
  });
};

export const hasSuccessfulPaymentForRequest = async (doctorShieldRequestId: string) => {
  const successful = await prisma.paymentTransaction.findFirst({
    where: { doctorShieldRequestId, paymentStatus: 'succeeded' },
    select: { id: true },
  });
  return Boolean(successful);
};

export const setPaymentTransactionFailed = async (
  id: string,
  patch: Partial<{
    resultCode: string | null;
    failureReason: string | null;
    resourcePath: string | null;
    gatewayTransactionId: string | null;
    paymentBrand: string;
    checkoutId: string | null;
    integrity: string | null;
  }>,
) => prisma.paymentTransaction.update({
  where: { id },
  data: {
    paymentStatus: 'failed',
    resultCode: patch.resultCode ?? null,
    failureReason: patch.failureReason ?? null,
    resourcePath: patch.resourcePath ?? undefined,
    gatewayTransactionId: patch.gatewayTransactionId ?? undefined,
    paymentBrand: patch.paymentBrand ?? undefined,
    checkoutId: patch.checkoutId ?? undefined,
    integrity: patch.integrity ?? undefined,
  },
});

export const setPaymentTransactionSucceeded = async (
  id: string,
  patch: Partial<{
    resourcePath: string | null;
    gatewayTransactionId: string | null;
    paymentBrand: string;
    resultCode: string | null;
    failureReason: string | null;
    paidAt: Date | null;
  }>,
) => prisma.paymentTransaction.update({
  where: { id },
  data: {
    paymentStatus: 'succeeded',
    resourcePath: patch.resourcePath ?? undefined,
    gatewayTransactionId: patch.gatewayTransactionId ?? undefined,
    paymentBrand: patch.paymentBrand ?? undefined,
    resultCode: patch.resultCode ?? null,
    failureReason: patch.failureReason ?? null,
    paidAt: patch.paidAt ?? new Date(),
  },
});

export const setPaymentTransactionInitiated = async (
  id: string,
  patch: Partial<{
    checkoutId: string | null;
    integrity: string | null;
    resourcePath: string | null;
    gatewayTransactionId: string | null;
    paymentBrand: string;
  }>,
) => prisma.paymentTransaction.update({
  where: { id },
  data: {
    paymentStatus: 'initiated',
    checkoutId: patch.checkoutId ?? undefined,
    integrity: patch.integrity ?? undefined,
    resourcePath: patch.resourcePath ?? undefined,
    gatewayTransactionId: patch.gatewayTransactionId ?? undefined,
    paymentBrand: patch.paymentBrand ?? undefined,
  },
});
