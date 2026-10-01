import { prisma } from './db';

export type PaymentLifecycleStatus = 'pending' | 'initiated' | 'succeeded' | 'failed' | 'expired';

export interface ConsultationPaymentTransactionRecord {
  id: string;
  consultationRequestId: string;
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

export interface ConsultationPaymentSummaryPatch {
  paymentStatus?: string;
  paymentAmount?: string;
  paymentMethod?: string;
  cardBrand?: string;
  cardLast4?: string;
}

export const consultationPaymentTransactionToRecord = (transaction: {
  id: string;
  consultationRequestId: string;
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
}): ConsultationPaymentTransactionRecord => ({
  id: transaction.id,
  consultationRequestId: transaction.consultationRequestId,
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

export const listConsultationPaymentTransactionsForRequest = async (consultationRequestId: string) =>
  prisma.consultationPaymentTransaction.findMany({
    where: { consultationRequestId },
    orderBy: [{ attemptNumber: 'asc' }, { createdAt: 'asc' }],
  });

export const getLatestConsultationPaymentTransactionForRequest = async (consultationRequestId: string) =>
  prisma.consultationPaymentTransaction.findFirst({
    where: { consultationRequestId },
    orderBy: [{ attemptNumber: 'desc' }, { createdAt: 'desc' }],
  });

export const getSuccessfulConsultationPaymentTransactionForRequest = async (consultationRequestId: string) =>
  prisma.consultationPaymentTransaction.findFirst({
    where: {
      consultationRequestId,
      paymentStatus: 'succeeded',
    },
    orderBy: [{ paidAt: 'desc' }, { updatedAt: 'desc' }],
  });

export const getConsultationPaymentTransactionByCheckoutId = async (checkoutId: string) =>
  prisma.consultationPaymentTransaction.findUnique({
    where: { checkoutId },
  });

export const getConsultationPaymentTransactionByMerchantTransactionId = async (merchantTransactionId: string) =>
  prisma.consultationPaymentTransaction.findUnique({
    where: { merchantTransactionId },
  });

export const getNextAttemptNumber = async (consultationRequestId: string) => {
  const latest = await getLatestConsultationPaymentTransactionForRequest(consultationRequestId);
  return latest ? latest.attemptNumber + 1 : 1;
};

export const createConsultationPaymentTransactionAttempt = async (payload: {
  consultationRequestId: string;
  merchantTransactionId: string;
  checkoutId?: string | null;
  integrity?: string | null;
  resourcePath?: string | null;
  gatewayTransactionId?: string | null;
  amount: number;
  currency: string;
  paymentType: string;
  paymentBrand?: string;
  paymentStatus?: PaymentLifecycleStatus;
  resultCode?: string | null;
  failureReason?: string | null;
  paidAt?: Date | null;
  attemptNumber: number;
}) => prisma.consultationPaymentTransaction.create({
  data: {
    consultationRequestId: payload.consultationRequestId,
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

export const updateConsultationPaymentTransaction = async (
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
) => prisma.consultationPaymentTransaction.update({
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

export const updateConsultationPaymentSummary = async (
  consultationRequestId: string,
  patch: ConsultationPaymentSummaryPatch,
) => {
  const existing = await prisma.consultationRequest.findUnique({
    where: { id: consultationRequestId },
  });
  if (!existing) {
    throw new Error('Consultation request not found.');
  }

  await prisma.consultationRequest.update({
    where: { id: consultationRequestId },
    data: {
      paymentStatus: patch.paymentStatus ?? existing.paymentStatus,
      paymentAmount: patch.paymentAmount ?? existing.paymentAmount,
      paymentMethod: patch.paymentMethod ?? existing.paymentMethod,
      cardBrand: patch.cardBrand ?? existing.cardBrand,
      cardLast4: patch.cardLast4 ?? existing.cardLast4,
    },
  });

  return prisma.consultationRequest.findUnique({
    where: { id: consultationRequestId },
  });
};

export const hasSuccessfulPaymentForRequest = async (consultationRequestId: string) => {
  const successful = await prisma.consultationPaymentTransaction.findFirst({
    where: { consultationRequestId, paymentStatus: 'succeeded' },
    select: { id: true },
  });
  return Boolean(successful);
};

export const setConsultationPaymentTransactionFailed = async (
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
) => prisma.consultationPaymentTransaction.update({
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

export const setConsultationPaymentTransactionSucceeded = async (
  id: string,
  patch: Partial<{
    resourcePath: string | null;
    gatewayTransactionId: string | null;
    paymentBrand: string;
    resultCode: string | null;
    failureReason: string | null;
    paidAt: Date | null;
  }>,
) => prisma.consultationPaymentTransaction.update({
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

export const setConsultationPaymentTransactionInitiated = async (
  id: string,
  patch: Partial<{
    checkoutId: string | null;
    integrity: string | null;
    resourcePath: string | null;
    gatewayTransactionId: string | null;
    paymentBrand: string;
  }>,
) => prisma.consultationPaymentTransaction.update({
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
