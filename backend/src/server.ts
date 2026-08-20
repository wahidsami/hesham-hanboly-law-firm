import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import { Prisma } from '@prisma/client';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import { config } from './config';
import {
  clearAuthCookie,
  currentSession,
  loginWithUsernamePassword,
  logoutCurrentSession,
  requireAdmin,
  setAuthCookie,
} from './auth';
import { ensureAdminUser, ensureDatabaseSchema, prisma } from './db';
import {
  articleToRecord,
  cmsPageToRecord,
  createConsultation,
  createDoctorShieldRequest,
  deleteCmsPage,
  deleteMediaAsset,
  getDoctorShieldRequestById,
  getConsultationById,
  listMediaAssets,
  listCmsRevisions,
  listArticles,
  listConsultations,
  listDoctorShieldRequests,
  listCmsPages,
  listHeroSlides,
  listNavigationItems,
  listPracticeAreas,
  listPublishedArticles,
  listPublishedPracticeAreas,
  normalizeArticleInput,
  normalizePracticeAreaInput,
  saveCmsPage,
  saveCmsRevision,
  saveNavigationItems,
  restoreCmsRevision,
  updateDoctorShieldRequest,
  updateConsultation,
  updateMediaAsset,
  practiceAreaToRecord,
  siteSettingsToRecord,
  toSiteContent,
} from './content';
import { getDoctorShieldCharge, formatSarAmount } from './doctorShieldPricing';
import {
  createPaymentTransactionAttempt,
  getLatestPaymentTransactionForRequest,
  getNextAttemptNumber,
  getPaymentTransactionByCheckoutId,
  getSuccessfulPaymentTransactionForRequest,
  hasSuccessfulPaymentForRequest,
  paymentTransactionToRecord,
  setPaymentTransactionFailed,
  setPaymentTransactionInitiated,
  setPaymentTransactionSucceeded,
  updateDoctorShieldPaymentSummary,
  updatePaymentTransaction,
} from './doctorShieldPayments';
import { HyperPayError, hyperpayService } from './hyperpay';
import { getAnalyticsOverview, recordAnalyticsEvent } from './analytics';
import { uploadBufferToS3 } from './uploads';
import { seedDatabase } from './seed';
import { validateSaudiId } from './utils/validateSaudiId';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });
const consultationUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const distPath = path.resolve(process.cwd(), 'dist');
const localUploadsPath = path.resolve(process.cwd(), 'backend', 'uploads');

app.use(express.json({ limit: '8mb' }));
app.use('/uploads', express.static(localUploadsPath));

app.use((request, response, next) => {
  const devScriptSources = config.isDev ? ["'unsafe-eval'"] : [];
  const devConnectSources = config.isDev ? ['ws:', 'wss:', 'http://localhost:*', 'https://localhost:*', 'http://127.0.0.1:*', 'https://127.0.0.1:*'] : [];
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "img-src 'self' data: blob: https://eu-test.oppwa.com",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' ${devScriptSources.join(' ')} https://eu-test.oppwa.com`.trim(),
    `connect-src 'self' https://eu-test.oppwa.com ${devConnectSources.join(' ')}`.trim(),
    "frame-src 'self' https://eu-test.oppwa.com",
    "font-src 'self' data:",
    "form-action 'self' https://eu-test.oppwa.com",
  ].join('; ');

  response.setHeader('Content-Security-Policy', csp);
  next();
});

const asyncHandler =
  (handler: express.RequestHandler): express.RequestHandler =>
  (request, response, next) =>
    Promise.resolve(handler(request, response, next)).catch(next);

const sendError = (response: express.Response, error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const statusFromError = error && typeof error === 'object' && 'status' in error && typeof (error as { status?: unknown }).status === 'number'
    ? (error as { status: number }).status
    : null;
  const status = statusFromError ?? (
    message.includes('required') ||
    message.includes('must') ||
    message.includes('exists') ||
    message.includes('Invalid')
      ? 400
      : 500
  );
  response.status(status).json({ error: message });
};

const readString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
};

const normalizeHyperPayBrand = (value: string) => {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'MASTERCARD') return 'MASTER';
  if (normalized === 'MASTER' || normalized === 'VISA' || normalized === 'MADA') return normalized;
  return '';
};

const splitDoctorFullName = (fullName: string) => {
  const normalized = fullName.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return { givenName: '', surname: '' };
  }

  const parts = normalized.split(' ');
  if (parts.length === 1) {
    return { givenName: parts[0], surname: parts[0] };
  }

  return {
    givenName: parts[0],
    surname: parts.slice(1).join(' '),
  };
};

const extractCardLast4 = (value: unknown) => {
  if (typeof value === 'string' && value.trim()) {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 4) {
      return digits.slice(-4);
    }
  }

  if (value && typeof value === 'object') {
    const card = value as Record<string, unknown>;
    const raw = readString(card.last4Digits, card.last4, card.maskedPan);
    if (raw) {
      const digits = raw.replace(/\D/g, '');
      if (digits.length >= 4) {
        return digits.slice(-4);
      }
    }
  }

  return '';
};

const HYPERPAY_PAYMENT_RESOURCE_PATH_PATTERN = /^\/v1\/checkouts\/([A-Za-z0-9._-]+)\/payment$/;
const HYPERPAY_VERIFY_WINDOW_MS = 60_000;
const HYPERPAY_VERIFY_MAX_REQUESTS = 2;
const hyperPayVerificationAttempts = new Map<string, number[]>();

const validateHyperPayResourcePath = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return null;
  }

  const match = trimmed.match(HYPERPAY_PAYMENT_RESOURCE_PATH_PATTERN);
  if (!match) {
    return null;
  }

  return {
    resourcePath: trimmed,
    checkoutId: match[1],
  };
};

type SafeHyperPayVerificationSummary = {
  verificationSuccess: boolean;
  resultCode: string | null;
  resultDescription: string | null;
  checkoutId: string | null;
  gatewayTransactionId: string | null;
  merchantTransactionId: string;
  amount: number;
  currency: string;
  paymentType: string;
  paymentBrand: string;
  paymentTransactionId: string;
  paymentStatus: string;
  paidAt: string | null;
  verificationSource: string;
};

const buildSafeHyperPayVerificationSummary = (
  paymentTransaction: {
    id: string;
    merchantTransactionId: string;
    checkoutId: string | null;
    gatewayTransactionId: string | null;
    amount: number;
    currency: string;
    paymentType: string;
    paymentBrand: string;
    paymentStatus: string;
    resultCode: string | null;
    failureReason: string | null;
    paidAt: Date | null;
  },
  options: {
    verificationSuccess: boolean;
    resultDescription: string | null;
    verificationSource: string;
    fallbackCheckoutId?: string | null;
    fallbackGatewayTransactionId?: string | null;
  },
): SafeHyperPayVerificationSummary => ({
  verificationSuccess: options.verificationSuccess,
  resultCode: paymentTransaction.resultCode,
  resultDescription: options.resultDescription,
  checkoutId: paymentTransaction.checkoutId || options.fallbackCheckoutId || null,
  gatewayTransactionId: paymentTransaction.gatewayTransactionId || options.fallbackGatewayTransactionId || null,
  merchantTransactionId: paymentTransaction.merchantTransactionId,
  amount: paymentTransaction.amount,
  currency: paymentTransaction.currency,
  paymentType: paymentTransaction.paymentType,
  paymentBrand: paymentTransaction.paymentBrand,
  paymentTransactionId: paymentTransaction.id,
  paymentStatus: paymentTransaction.paymentStatus,
  paidAt: paymentTransaction.paidAt ? paymentTransaction.paidAt.toISOString() : null,
  verificationSource: options.verificationSource,
});

const canVerifyHyperPayCheckout = (checkoutId: string) => {
  const now = Date.now();
  const recent = (hyperPayVerificationAttempts.get(checkoutId) || []).filter((timestamp) => now - timestamp < HYPERPAY_VERIFY_WINDOW_MS);
  if (recent.length >= HYPERPAY_VERIFY_MAX_REQUESTS) {
    hyperPayVerificationAttempts.set(checkoutId, recent);
    return false;
  }

  recent.push(now);
  hyperPayVerificationAttempts.set(checkoutId, recent);
  return true;
};

const successResultCodePattern = /^(000\.000\.|000\.100\.1|000\.[36]|000\.400\.[1][12]0)/;
const pendingResultCodePattern = /^(000\.200|800\.400\.5|100\.400\.500)/;

const isSuccessfulHyperPayResultCode = (resultCode: string) => successResultCodePattern.test(resultCode);
const isPendingHyperPayResultCode = (resultCode: string) => pendingResultCodePattern.test(resultCode);

const verifyDoctorShieldPaymentWithHyperPay = async (
  doctorShieldRequestId: string,
  resourcePathValue: unknown,
) => {
  const resourcePath = validateHyperPayResourcePath(resourcePathValue);
  if (!resourcePath) {
    const error = new Error('A valid HyperPay resourcePath is required.');
    (error as { status?: number }).status = 400;
    throw error;
  }

  const paymentTransaction = await getPaymentTransactionByCheckoutId(resourcePath.checkoutId);
  if (!paymentTransaction) {
    const error = new Error('Payment transaction not found for the provided checkout ID.');
    (error as { status?: number }).status = 404;
    throw error;
  }

  if (paymentTransaction.doctorShieldRequestId !== doctorShieldRequestId) {
    const error = new Error('The payment transaction does not belong to this Doctor Shield request.');
    (error as { status?: number }).status = 400;
    throw error;
  }

  const doctorShieldRequest = await getDoctorShieldRequestById(doctorShieldRequestId);
  if (!doctorShieldRequest) {
    const error = new Error('Doctor Shield request not found.');
    (error as { status?: number }).status = 404;
    throw error;
  }

  if (paymentTransaction.paymentStatus === 'succeeded') {
    const charge = getDoctorShieldCharge(doctorShieldRequest.hasBeenConvicted as 'yes' | 'no');
    const persistedRequest = doctorShieldRequest.paymentStatus === 'paid'
      ? doctorShieldRequest
      : await prisma.doctorShieldRequest.update({
          where: { id: doctorShieldRequestId },
          data: {
            paymentStatus: 'paid',
            paymentAmount: charge.amountLabel,
            paymentMethod: paymentTransaction.paymentBrand || doctorShieldRequest.paymentMethod || '',
            cardBrand: paymentTransaction.paymentBrand || doctorShieldRequest.cardBrand || '',
        },
      });
    const verificationSummary = buildSafeHyperPayVerificationSummary(paymentTransaction, {
      verificationSuccess: true,
      resultDescription: paymentTransaction.failureReason,
      verificationSource: 'stored server-side HyperPay verification',
      fallbackCheckoutId: resourcePath.checkoutId,
      fallbackGatewayTransactionId: paymentTransaction.gatewayTransactionId,
    });
    return {
      state: 'paid' as const,
      doctorShieldRequestId,
      paymentTransaction,
      doctorShieldRequest: persistedRequest,
      verificationResponse: null,
      verificationSummary,
    };
  }

  if (!paymentTransaction.checkoutId && !paymentTransaction.resourcePath) {
    const error = new Error('No checkout information is available for this payment attempt.');
    (error as { status?: number }).status = 400;
    throw error;
  }

  if (paymentTransaction.checkoutId !== resourcePath.checkoutId) {
    const error = new Error('The provided resourcePath does not match the stored checkout ID.');
    (error as { status?: number }).status = 400;
    throw error;
  }

  if (!canVerifyHyperPayCheckout(paymentTransaction.checkoutId || resourcePath.checkoutId)) {
    const error = new Error('Verification limit reached for this checkout. Please try again in a moment.');
    (error as { status?: number }).status = 429;
    throw error;
  }

  const paymentResult = await hyperpayService.getPaymentStatus(resourcePath.resourcePath);

  const authoritativeCharge = getDoctorShieldCharge(doctorShieldRequest.hasBeenConvicted as 'yes' | 'no');

  const verifiedAmount = Number.parseInt(String(paymentResult.amount || authoritativeCharge.amount), 10);
  const verifiedCurrency = String(paymentResult.currency || config.hyperpay.currency).toUpperCase();
  const verifiedPaymentType = String(paymentResult.paymentType || config.hyperpay.paymentType).toUpperCase();
  const verifiedMerchantTransactionId = paymentResult.merchantTransactionId || paymentTransaction.merchantTransactionId;
  const verifiedPaymentBrand = normalizeHyperPayBrand(paymentResult.paymentBrand || paymentTransaction.paymentBrand);
  const expectedPaymentBrand = normalizeHyperPayBrand(paymentTransaction.paymentBrand);
  const paymentResultResourcePath = validateHyperPayResourcePath(paymentResult.resourcePath || resourcePath.resourcePath);

  if (paymentTransaction.gatewayTransactionId && paymentResult.id && paymentTransaction.gatewayTransactionId !== paymentResult.id) {
    const failed = await setPaymentTransactionFailed(paymentTransaction.id, {
      resultCode: paymentResult.resultCode,
      failureReason: 'HyperPay payment ID mismatch.',
      resourcePath: paymentResult.resourcePath || paymentTransaction.resourcePath,
      gatewayTransactionId: paymentResult.id,
      paymentBrand: verifiedPaymentBrand || paymentTransaction.paymentBrand,
    });
    const error = new Error('HyperPay payment ID mismatch.');
    (error as { status?: number; paymentTransaction?: typeof failed }).status = 400;
    (error as { paymentTransaction?: typeof failed }).paymentTransaction = failed;
    throw error;
  }

  if (verifiedMerchantTransactionId !== paymentTransaction.merchantTransactionId) {
    const failed = await setPaymentTransactionFailed(paymentTransaction.id, {
      resultCode: paymentResult.resultCode,
      failureReason: 'Merchant transaction ID mismatch.',
      resourcePath: paymentResult.resourcePath || paymentTransaction.resourcePath,
      gatewayTransactionId: paymentResult.id || paymentTransaction.gatewayTransactionId,
      paymentBrand: verifiedPaymentBrand || paymentTransaction.paymentBrand,
    });
    const error = new Error('Merchant transaction ID mismatch.');
    (error as { status?: number; paymentTransaction?: typeof failed }).status = 400;
    (error as { paymentTransaction?: typeof failed }).paymentTransaction = failed;
    throw error;
  }

  if (verifiedAmount !== authoritativeCharge.amount) {
    const failed = await setPaymentTransactionFailed(paymentTransaction.id, {
      resultCode: paymentResult.resultCode,
      failureReason: `Amount mismatch: expected ${authoritativeCharge.amount}, received ${verifiedAmount}.`,
      resourcePath: paymentResult.resourcePath || paymentTransaction.resourcePath,
      gatewayTransactionId: paymentResult.id || paymentTransaction.gatewayTransactionId,
      paymentBrand: verifiedPaymentBrand || paymentTransaction.paymentBrand,
    });
    const error = new Error('Payment amount mismatch.');
    (error as { status?: number; paymentTransaction?: typeof failed }).status = 400;
    (error as { paymentTransaction?: typeof failed }).paymentTransaction = failed;
    throw error;
  }

  if (verifiedCurrency !== config.hyperpay.currency.toUpperCase()) {
    const failed = await setPaymentTransactionFailed(paymentTransaction.id, {
      resultCode: paymentResult.resultCode,
      failureReason: `Currency mismatch: expected ${config.hyperpay.currency}, received ${verifiedCurrency}.`,
      resourcePath: paymentResult.resourcePath || paymentTransaction.resourcePath,
      gatewayTransactionId: paymentResult.id || paymentTransaction.gatewayTransactionId,
      paymentBrand: verifiedPaymentBrand || paymentTransaction.paymentBrand,
    });
    const error = new Error('Payment currency mismatch.');
    (error as { status?: number; paymentTransaction?: typeof failed }).status = 400;
    (error as { paymentTransaction?: typeof failed }).paymentTransaction = failed;
    throw error;
  }

  if (verifiedPaymentType !== config.hyperpay.paymentType.toUpperCase()) {
    const failed = await setPaymentTransactionFailed(paymentTransaction.id, {
      resultCode: paymentResult.resultCode,
      failureReason: `Payment type mismatch: expected ${config.hyperpay.paymentType}, received ${verifiedPaymentType}.`,
      resourcePath: paymentResult.resourcePath || paymentTransaction.resourcePath,
      gatewayTransactionId: paymentResult.id || paymentTransaction.gatewayTransactionId,
      paymentBrand: verifiedPaymentBrand || paymentTransaction.paymentBrand,
    });
    const error = new Error('Payment type mismatch.');
    (error as { status?: number; paymentTransaction?: typeof failed }).status = 400;
    (error as { paymentTransaction?: typeof failed }).paymentTransaction = failed;
    throw error;
  }

  if (expectedPaymentBrand && verifiedPaymentBrand && expectedPaymentBrand !== verifiedPaymentBrand) {
    const failed = await setPaymentTransactionFailed(paymentTransaction.id, {
      resultCode: paymentResult.resultCode,
      failureReason: `Payment brand mismatch: expected ${expectedPaymentBrand}, received ${verifiedPaymentBrand}.`,
      resourcePath: paymentResult.resourcePath || paymentTransaction.resourcePath,
      gatewayTransactionId: paymentResult.id || paymentTransaction.gatewayTransactionId,
      paymentBrand: verifiedPaymentBrand || paymentTransaction.paymentBrand,
    });
    const error = new Error('Payment brand mismatch.');
    (error as { status?: number; paymentTransaction?: typeof failed }).status = 400;
    (error as { paymentTransaction?: typeof failed }).paymentTransaction = failed;
    throw error;
  }

  if (paymentResultResourcePath && paymentResultResourcePath.resourcePath !== resourcePath.resourcePath) {
    const failed = await setPaymentTransactionFailed(paymentTransaction.id, {
      resultCode: paymentResult.resultCode,
      failureReason: 'HyperPay resourcePath mismatch.',
      resourcePath: paymentResult.resourcePath || paymentTransaction.resourcePath,
      gatewayTransactionId: paymentResult.id || paymentTransaction.gatewayTransactionId,
      paymentBrand: verifiedPaymentBrand || paymentTransaction.paymentBrand,
    });
    const error = new Error('HyperPay resourcePath mismatch.');
    (error as { status?: number; paymentTransaction?: typeof failed }).status = 400;
    (error as { paymentTransaction?: typeof failed }).paymentTransaction = failed;
    throw error;
  }

  const now = new Date();
  const paymentResponseIsSuccessful = isSuccessfulHyperPayResultCode(paymentResult.resultCode);
  const paymentResponseIsPending = isPendingHyperPayResultCode(paymentResult.resultCode);

  if (paymentResponseIsSuccessful) {
    const cardLast4 = extractCardLast4(paymentResult.raw);
    const [succeeded, updatedRequest] = await prisma.$transaction([
      prisma.paymentTransaction.update({
        where: { id: paymentTransaction.id },
        data: {
          paymentStatus: 'succeeded',
          resourcePath: paymentResult.resourcePath || paymentTransaction.resourcePath,
          gatewayTransactionId: paymentResult.id || paymentTransaction.gatewayTransactionId,
          paymentBrand: verifiedPaymentBrand || paymentTransaction.paymentBrand,
          resultCode: paymentResult.resultCode,
          failureReason: null,
          paidAt: now,
        },
      }),
      prisma.doctorShieldRequest.update({
        where: { id: doctorShieldRequestId },
        data: {
          paymentStatus: 'paid',
          paymentAmount: authoritativeCharge.amountLabel,
          paymentMethod: verifiedPaymentBrand || paymentTransaction.paymentBrand || '',
          cardBrand: verifiedPaymentBrand || paymentTransaction.paymentBrand || '',
          ...(cardLast4 ? { cardLast4 } : {}),
        },
      }),
    ]);

    return {
      state: 'paid' as const,
      doctorShieldRequestId,
      paymentTransaction: succeeded,
      doctorShieldRequest: updatedRequest,
      verificationResponse: paymentResult,
      verificationSummary: {
        verificationSuccess: true,
        resultCode: paymentResult.resultCode,
        resultDescription: paymentResult.resultDescription,
        checkoutId: succeeded.checkoutId || resourcePath.checkoutId,
        gatewayTransactionId: succeeded.gatewayTransactionId || paymentResult.id || null,
        merchantTransactionId: succeeded.merchantTransactionId,
        amount: succeeded.amount,
        currency: succeeded.currency,
        paymentType: succeeded.paymentType,
        paymentBrand: succeeded.paymentBrand,
        paymentTransactionId: succeeded.id,
        paymentStatus: succeeded.paymentStatus,
        paidAt: succeeded.paidAt,
        verificationSource: 'server-side HyperPay',
      },
    };
  }

  if (paymentResponseIsPending) {
    const pending = await updatePaymentTransaction(paymentTransaction.id, {
      checkoutId: paymentTransaction.checkoutId,
      resourcePath: paymentResult.resourcePath || paymentTransaction.resourcePath,
      gatewayTransactionId: paymentResult.id || paymentTransaction.gatewayTransactionId,
      paymentBrand: verifiedPaymentBrand || paymentTransaction.paymentBrand,
      paymentStatus: 'pending',
      resultCode: paymentResult.resultCode,
      failureReason: paymentResult.resultDescription || null,
    });

    return {
      state: 'pending' as const,
      doctorShieldRequestId,
      paymentTransaction: pending,
      doctorShieldRequest,
      verificationResponse: paymentResult,
      verificationSummary: {
        verificationSuccess: false,
        resultCode: paymentResult.resultCode,
        resultDescription: paymentResult.resultDescription,
        checkoutId: pending.checkoutId || resourcePath.checkoutId,
        gatewayTransactionId: pending.gatewayTransactionId || paymentResult.id || null,
        merchantTransactionId: pending.merchantTransactionId,
        amount: pending.amount,
        currency: pending.currency,
        paymentType: pending.paymentType,
        paymentBrand: pending.paymentBrand,
        paymentTransactionId: pending.id,
        paymentStatus: pending.paymentStatus,
        paidAt: pending.paidAt,
        verificationSource: 'server-side HyperPay',
      },
    };
  }

  const failed = await setPaymentTransactionFailed(paymentTransaction.id, {
    resultCode: paymentResult.resultCode,
    failureReason: paymentResult.resultDescription || 'Payment verification failed.',
    resourcePath: paymentResult.resourcePath || paymentTransaction.resourcePath,
    gatewayTransactionId: paymentResult.id || paymentTransaction.gatewayTransactionId,
    paymentBrand: verifiedPaymentBrand || paymentTransaction.paymentBrand,
  });

  return {
    state: 'failed' as const,
    doctorShieldRequestId,
    paymentTransaction: failed,
    doctorShieldRequest,
    verificationResponse: paymentResult,
    verificationSummary: {
      verificationSuccess: false,
      resultCode: paymentResult.resultCode,
      resultDescription: paymentResult.resultDescription,
      checkoutId: failed.checkoutId || resourcePath.checkoutId,
      gatewayTransactionId: failed.gatewayTransactionId || paymentResult.id || null,
      merchantTransactionId: failed.merchantTransactionId,
      amount: failed.amount,
      currency: failed.currency,
      paymentType: failed.paymentType,
      paymentBrand: failed.paymentBrand,
      paymentTransactionId: failed.id,
      paymentStatus: failed.paymentStatus,
      paidAt: failed.paidAt,
      verificationSource: 'server-side HyperPay',
    },
  };
};

const loadArticleBySlug = async (slug: string) =>
  prisma.article.findUnique({
    where: { slug },
  });

const loadPracticeAreaBySlug = async (slug: string) =>
  prisma.practiceArea.findUnique({
    where: { slug },
  });

const loadCmsPageBySlug = async (slug: string) => {
  const trimmedSlug = slug.trim();
  const slugCandidates = trimmedSlug.startsWith('/')
    ? [trimmedSlug, trimmedSlug.slice(1)]
    : [trimmedSlug, `/${trimmedSlug}`];

  for (const candidate of slugCandidates) {
    const page = await prisma.cmsPage.findUnique({
      where: { slug: candidate },
    });
    if (page) {
      return page;
    }
  }

  return null;
};

const sanitizeCmsPageBlocks = (slug: string, blocks: unknown[]) => {
  const normalizedSlug = slug.replace(/^\/+/, '').toLowerCase();
  if (!Array.isArray(blocks)) {
    return [];
  }

  const normalizeBlockAssetPaths = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return value.startsWith('/src/assets/images/')
        ? value.replace('/src/assets/images/', '/images/')
        : value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => normalizeBlockAssetPaths(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, normalizeBlockAssetPaths(entry)]),
      );
    }

    return value;
  };

  const normalizedBlocks = blocks.map((block) => normalizeBlockAssetPaths(block));

  if (normalizedSlug !== 'team') {
    return normalizedBlocks;
  }

  return normalizedBlocks.filter((block) => {
    if (!block || typeof block !== 'object') {
      return true;
    }
    const typedBlock = block as { id?: unknown; type?: unknown };
    return typedBlock.id !== 'team-intro';
  });
};

const assertUniqueArticleSlug = async (slug: string, currentId?: string) => {
  const conflict = await prisma.article.findUnique({ where: { slug } });
  if (conflict && conflict.id !== currentId) {
    throw new Error('Article slug already exists.');
  }
};

const assertUniquePracticeAreaSlug = async (slug: string, currentId?: string) => {
  const conflict = await prisma.practiceArea.findUnique({ where: { slug } });
  if (conflict && conflict.id !== currentId) {
    throw new Error('Practice area slug already exists.');
  }
};

const saveArticle = async (originalSlug: string | undefined, body: unknown) => {
  const existing = originalSlug ? await loadArticleBySlug(originalSlug) : null;
  const payload = normalizeArticleInput(body as Parameters<typeof normalizeArticleInput>[0]);
  await assertUniqueArticleSlug(payload.slug!, existing?.id);

  if (existing) {
    const updated = await prisma.article.update({
      where: { id: existing.id },
      data: {
        slug: payload.slug,
        titleAr: payload.titleAr!,
        titleEn: payload.titleEn!,
        excerptAr: payload.excerptAr!,
        excerptEn: payload.excerptEn!,
        categoryAr: payload.categoryAr!,
        categoryEn: payload.categoryEn!,
        authorAr: payload.authorAr!,
        authorEn: payload.authorEn!,
        date: payload.date!,
        readTimeAr: payload.readTimeAr!,
        readTimeEn: payload.readTimeEn!,
        bodyAr: payload.bodyAr!,
        bodyEn: payload.bodyEn!,
        imageUrl: payload.imageUrl!,
        published: Boolean(payload.published),
        order: Number(payload.order || 0),
      },
    });
    return articleToRecord(updated);
  }

  const created = await prisma.article.create({
    data: {
      slug: payload.slug!,
      titleAr: payload.titleAr!,
      titleEn: payload.titleEn!,
      excerptAr: payload.excerptAr!,
      excerptEn: payload.excerptEn!,
      categoryAr: payload.categoryAr!,
      categoryEn: payload.categoryEn!,
      authorAr: payload.authorAr!,
      authorEn: payload.authorEn!,
      date: payload.date!,
      readTimeAr: payload.readTimeAr!,
      readTimeEn: payload.readTimeEn!,
      bodyAr: payload.bodyAr!,
      bodyEn: payload.bodyEn!,
      imageUrl: payload.imageUrl!,
      published: Boolean(payload.published),
      order: Number(payload.order || 0),
    },
  });
  return articleToRecord(created);
};

const savePracticeArea = async (originalSlug: string | undefined, body: unknown) => {
  const existing = originalSlug ? await loadPracticeAreaBySlug(originalSlug) : null;
  const payload = normalizePracticeAreaInput(body as Parameters<typeof normalizePracticeAreaInput>[0]);
  await assertUniquePracticeAreaSlug(payload.slug!, existing?.id);

  if (existing) {
    const updated = await prisma.practiceArea.update({
      where: { id: existing.id },
      data: {
        slug: payload.slug,
        categorySlug: payload.categorySlug!,
        titleAr: payload.titleAr!,
        titleEn: payload.titleEn!,
        categoryAr: payload.categoryAr!,
        categoryEn: payload.categoryEn!,
        shortDescAr: payload.shortDescAr!,
        shortDescEn: payload.shortDescEn!,
        aboutAr: payload.aboutAr as Prisma.InputJsonValue,
        aboutEn: payload.aboutEn as Prisma.InputJsonValue,
        features: payload.features as Prisma.InputJsonValue,
        processSteps: payload.processSteps as Prisma.InputJsonValue,
        useCases: payload.useCases as Prisma.InputJsonValue,
        faq: payload.faq as Prisma.InputJsonValue,
        imageUrl: payload.imageUrl,
        published: Boolean(payload.published),
        order: Number(payload.order || 0),
      },
    });
    return practiceAreaToRecord(updated);
  }

  const created = await prisma.practiceArea.create({
    data: {
      slug: payload.slug!,
      categorySlug: payload.categorySlug!,
      titleAr: payload.titleAr!,
      titleEn: payload.titleEn!,
      categoryAr: payload.categoryAr!,
      categoryEn: payload.categoryEn!,
      shortDescAr: payload.shortDescAr!,
      shortDescEn: payload.shortDescEn!,
      aboutAr: payload.aboutAr as Prisma.InputJsonValue,
      aboutEn: payload.aboutEn as Prisma.InputJsonValue,
      features: payload.features as Prisma.InputJsonValue,
      processSteps: payload.processSteps as Prisma.InputJsonValue,
      useCases: payload.useCases as Prisma.InputJsonValue,
      faq: payload.faq as Prisma.InputJsonValue,
      imageUrl: payload.imageUrl,
      published: Boolean(payload.published),
      order: Number(payload.order || 0),
    },
  });
  return practiceAreaToRecord(created);
};

const saveSiteSettings = async (body: unknown) => {
  const input = body as Record<string, unknown>;
  const payload = {
    id: 'main',
    logoImageUrl: String(input.logoImageUrl || ''),
    logoImageAltAr: String(input.logoImageAltAr || ''),
    logoImageAltEn: String(input.logoImageAltEn || ''),
    footerLogoImageUrl: String(input.footerLogoImageUrl || ''),
    footerLogoImageAltAr: String(input.footerLogoImageAltAr || ''),
    footerLogoImageAltEn: String(input.footerLogoImageAltEn || ''),
    navbarCtaAr: String(input.navbarCtaAr || ''),
    navbarCtaEn: String(input.navbarCtaEn || ''),
    doctorShieldBadgeAr: String(input.doctorShieldBadgeAr || ''),
    doctorShieldBadgeEn: String(input.doctorShieldBadgeEn || ''),
    doctorShieldTitleAr: String(input.doctorShieldTitleAr || ''),
    doctorShieldTitleEn: String(input.doctorShieldTitleEn || ''),
    doctorShieldSubtitleAr: String(input.doctorShieldSubtitleAr || ''),
    doctorShieldSubtitleEn: String(input.doctorShieldSubtitleEn || ''),
    doctorShieldDescAr: String(input.doctorShieldDescAr || ''),
    doctorShieldDescEn: String(input.doctorShieldDescEn || ''),
    doctorShieldBullet1Ar: String(input.doctorShieldBullet1Ar || ''),
    doctorShieldBullet1En: String(input.doctorShieldBullet1En || ''),
    doctorShieldBullet2Ar: String(input.doctorShieldBullet2Ar || ''),
    doctorShieldBullet2En: String(input.doctorShieldBullet2En || ''),
    doctorShieldBullet3Ar: String(input.doctorShieldBullet3Ar || ''),
    doctorShieldBullet3En: String(input.doctorShieldBullet3En || ''),
    doctorShieldBullet4Ar: String(input.doctorShieldBullet4Ar || ''),
    doctorShieldBullet4En: String(input.doctorShieldBullet4En || ''),
    doctorShieldButtonAr: String(input.doctorShieldButtonAr || ''),
    doctorShieldButtonEn: String(input.doctorShieldButtonEn || ''),
    doctorShieldCircleTitleAr: String(input.doctorShieldCircleTitleAr || ''),
    doctorShieldCircleTitleEn: String(input.doctorShieldCircleTitleEn || ''),
    doctorShieldCirclePriceAr: String(input.doctorShieldCirclePriceAr || ''),
    doctorShieldCirclePriceEn: String(input.doctorShieldCirclePriceEn || ''),
    doctorShieldCircleNoteAr: String(input.doctorShieldCircleNoteAr || ''),
    doctorShieldCircleNoteEn: String(input.doctorShieldCircleNoteEn || ''),
    aboutSectionBadgeAr: String(input.aboutSectionBadgeAr || ''),
    aboutSectionBadgeEn: String(input.aboutSectionBadgeEn || ''),
    aboutSectionTitleAr: String(input.aboutSectionTitleAr || ''),
    aboutSectionTitleEn: String(input.aboutSectionTitleEn || ''),
    aboutSectionDescAr: String(input.aboutSectionDescAr || ''),
    aboutSectionDescEn: String(input.aboutSectionDescEn || ''),
    aboutSectionCardTitleAr: String(input.aboutSectionCardTitleAr || ''),
    aboutSectionCardTitleEn: String(input.aboutSectionCardTitleEn || ''),
    aboutSectionCardDescAr: String(input.aboutSectionCardDescAr || ''),
    aboutSectionCardDescEn: String(input.aboutSectionCardDescEn || ''),
    aboutSectionButtonAr: String(input.aboutSectionButtonAr || ''),
    aboutSectionButtonEn: String(input.aboutSectionButtonEn || ''),
    statisticsBadgeAr: String(input.statisticsBadgeAr || ''),
    statisticsBadgeEn: String(input.statisticsBadgeEn || ''),
    statisticsNumber: String(input.statisticsNumber || ''),
    statisticsTitleAr: String(input.statisticsTitleAr || ''),
    statisticsTitleEn: String(input.statisticsTitleEn || ''),
    statisticsDescAr: String(input.statisticsDescAr || ''),
    statisticsDescEn: String(input.statisticsDescEn || ''),
    statisticsSupportAr: String(input.statisticsSupportAr || ''),
    statisticsSupportEn: String(input.statisticsSupportEn || ''),
    teamSectionBadgeAr: String(input.teamSectionBadgeAr || ''),
    teamSectionBadgeEn: String(input.teamSectionBadgeEn || ''),
    teamSectionTitleAr: String(input.teamSectionTitleAr || ''),
    teamSectionTitleEn: String(input.teamSectionTitleEn || ''),
    teamSectionDescAr: String(input.teamSectionDescAr || ''),
    teamSectionDescEn: String(input.teamSectionDescEn || ''),
    teamFounderBadgeAr: String(input.teamFounderBadgeAr || ''),
    teamFounderBadgeEn: String(input.teamFounderBadgeEn || ''),
    teamFounderNameAr: String(input.teamFounderNameAr || ''),
    teamFounderNameEn: String(input.teamFounderNameEn || ''),
    teamFounderRoleAr: String(input.teamFounderRoleAr || ''),
    teamFounderRoleEn: String(input.teamFounderRoleEn || ''),
    teamFounderIntroAr: String(input.teamFounderIntroAr || ''),
    teamFounderIntroEn: String(input.teamFounderIntroEn || ''),
    teamFounderImageUrl: String(input.teamFounderImageUrl || ''),
    teamFounderImageAltAr: String(input.teamFounderImageAltAr || ''),
    teamFounderImageAltEn: String(input.teamFounderImageAltEn || ''),
    teamSectionCtaAr: String(input.teamSectionCtaAr || ''),
    teamSectionCtaEn: String(input.teamSectionCtaEn || ''),
    contactSectionBadgeAr: String(input.contactSectionBadgeAr || ''),
    contactSectionBadgeEn: String(input.contactSectionBadgeEn || ''),
    contactSectionTitleAr: String(input.contactSectionTitleAr || ''),
    contactSectionTitleEn: String(input.contactSectionTitleEn || ''),
    contactSectionDescAr: String(input.contactSectionDescAr || ''),
    contactSectionDescEn: String(input.contactSectionDescEn || ''),
    contactSectionOfficeTitleAr: String(input.contactSectionOfficeTitleAr || ''),
    contactSectionOfficeTitleEn: String(input.contactSectionOfficeTitleEn || ''),
    contactSectionAddressHeadAr: String(input.contactSectionAddressHeadAr || ''),
    contactSectionAddressHeadEn: String(input.contactSectionAddressHeadEn || ''),
    contactSectionPhoneLabelAr: String(input.contactSectionPhoneLabelAr || ''),
    contactSectionPhoneLabelEn: String(input.contactSectionPhoneLabelEn || ''),
    contactSectionEmailLabelAr: String(input.contactSectionEmailLabelAr || ''),
    contactSectionEmailLabelEn: String(input.contactSectionEmailLabelEn || ''),
    contactSectionSecurityAr: String(input.contactSectionSecurityAr || ''),
    contactSectionSecurityEn: String(input.contactSectionSecurityEn || ''),
    contactSectionFormTitleAr: String(input.contactSectionFormTitleAr || ''),
    contactSectionFormTitleEn: String(input.contactSectionFormTitleEn || ''),
    contactSectionFormDescAr: String(input.contactSectionFormDescAr || ''),
    contactSectionFormDescEn: String(input.contactSectionFormDescEn || ''),
    aboutHeroBadgeAr: String(input.aboutHeroBadgeAr || ''),
    aboutHeroBadgeEn: String(input.aboutHeroBadgeEn || ''),
    aboutHeroTitleAr: String(input.aboutHeroTitleAr || ''),
    aboutHeroTitleEn: String(input.aboutHeroTitleEn || ''),
    aboutHeroDescAr: String(input.aboutHeroDescAr || ''),
    aboutHeroDescEn: String(input.aboutHeroDescEn || ''),
    teamHeroBadgeAr: String(input.teamHeroBadgeAr || ''),
    teamHeroBadgeEn: String(input.teamHeroBadgeEn || ''),
    teamHeroTitleAr: String(input.teamHeroTitleAr || ''),
    teamHeroTitleEn: String(input.teamHeroTitleEn || ''),
    teamHeroDescAr: String(input.teamHeroDescAr || ''),
    teamHeroDescEn: String(input.teamHeroDescEn || ''),
    contactHeroBadgeAr: String(input.contactHeroBadgeAr || ''),
    contactHeroBadgeEn: String(input.contactHeroBadgeEn || ''),
    contactHeroTitleAr: String(input.contactHeroTitleAr || ''),
    contactHeroTitleEn: String(input.contactHeroTitleEn || ''),
    contactHeroDescAr: String(input.contactHeroDescAr || ''),
    contactHeroDescEn: String(input.contactHeroDescEn || ''),
    footerDescriptionAr: String(input.footerDescriptionAr || ''),
    footerDescriptionEn: String(input.footerDescriptionEn || ''),
    addressAr: String(input.addressAr || ''),
    addressEn: String(input.addressEn || ''),
    email: String(input.email || ''),
    phone: String(input.phone || ''),
    copyrightAr: String(input.copyrightAr || ''),
    copyrightEn: String(input.copyrightEn || ''),
    footerBadgeAr: String(input.footerBadgeAr || ''),
    footerBadgeEn: String(input.footerBadgeEn || ''),
  };

  const payloadWithTimestamp = {
    ...payload,
    updatedAt: new Date(),
  };

  const columns = Object.keys(payloadWithTimestamp);
  const columnFragments = columns.map((column) => Prisma.raw(`"${column}"`));
  const valueFragments = columns.map((column) => Prisma.sql`${payloadWithTimestamp[column as keyof typeof payloadWithTimestamp]}`);
  const updateFragments = columns
    .filter((column) => column !== 'id' && column !== 'updatedAt')
    .map((column) => Prisma.sql`${Prisma.raw(`"${column}"`)} = EXCLUDED.${Prisma.raw(`"${column}"`)}`);

  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "SiteSettings" (${Prisma.join(columnFragments)})
      VALUES (${Prisma.join(valueFragments)})
      ON CONFLICT ("id") DO UPDATE SET ${Prisma.join(updateFragments)}, "updatedAt" = EXCLUDED."updatedAt"
    `,
  );
};

const reseedDatabase = async () => {
  await prisma.adminSession.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.practiceArea.deleteMany({});
  await seedDatabase();
};

app.post(
  '/api/auth/login',
  asyncHandler(async (request, response) => {
    const { username, password } = request.body as { username?: string; password?: string };
    if (!username || !password) {
      response.status(400).json({ error: 'Username and password are required.' });
      return;
    }

    const login = await loginWithUsernamePassword(username, password);
    if (!login) {
      response.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    setAuthCookie(response, login.token);
    response.json({ ok: true });
  }),
);

app.post(
  '/api/auth/logout',
  asyncHandler(async (request, response) => {
    await logoutCurrentSession(request);
    clearAuthCookie(response);
    response.json({ ok: true });
  }),
);

app.get(
  '/api/auth/me',
  asyncHandler(async (request, response) => {
    const user = await currentSession(request);
    if (!user) {
      response.json({ authenticated: false });
      return;
    }

    response.json({ authenticated: true, username: user.username });
  }),
);

app.get(
  '/api/content',
  asyncHandler(async (_request, response) => {
    response.json(await toSiteContent());
  }),
);

app.get(
  '/api/hero-slides',
  asyncHandler(async (_request, response) => {
    response.json(await listHeroSlides());
  }),
);

app.get(
  '/api/articles',
  asyncHandler(async (_request, response) => {
    response.json(await listPublishedArticles());
  }),
);

app.get(
  '/api/articles/:slug',
  asyncHandler(async (request, response) => {
    const article = await loadArticleBySlug(request.params.slug);
    if (!article || !article.published) {
      response.status(404).json({ error: 'Article not found' });
      return;
    }

    response.json(articleToRecord(article));
  }),
);

app.get(
  '/api/practice-areas',
  asyncHandler(async (_request, response) => {
    response.json(await listPublishedPracticeAreas());
  }),
);

app.get(
  '/api/practice-areas/:slug',
  asyncHandler(async (request, response) => {
    const practiceArea = await loadPracticeAreaBySlug(request.params.slug);
    if (!practiceArea || !practiceArea.published) {
      response.status(404).json({ error: 'Practice area not found' });
      return;
    }

    response.json(practiceAreaToRecord(practiceArea));
  }),
);

app.get(
  '/api/pages',
  asyncHandler(async (_request, response) => {
    response.json(await listCmsPages());
  }),
);

app.get(
  '/api/pages/:slug',
  asyncHandler(async (request, response) => {
    const page = await loadCmsPageBySlug(request.params.slug);
    if (!page || page.status === 'hidden') {
      response.status(404).json({ error: 'Page not found' });
      return;
    }
    const revisions = await listCmsRevisions(page.id);
    const latestRevision = revisions[0];
    response.json({
      ...cmsPageToRecord(page),
      blocks: sanitizeCmsPageBlocks(request.params.slug, latestRevision?.blocks || []),
    });
  }),
);

app.get(
  '/api/admin/articles',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json(await listArticles());
  }),
);

app.post(
  '/api/admin/articles',
  requireAdmin,
  asyncHandler(async (request, response) => {
    await saveArticle(undefined, request.body);
    response.json(await toSiteContent());
  }),
);

app.put(
  '/api/admin/articles/:slug',
  requireAdmin,
  asyncHandler(async (request, response) => {
    await saveArticle(request.params.slug, request.body);
    response.json(await toSiteContent());
  }),
);

app.delete(
  '/api/admin/articles/:slug',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const article = await loadArticleBySlug(request.params.slug);
    if (!article) {
      response.status(404).json({ error: 'Article not found' });
      return;
    }

    await prisma.article.delete({ where: { id: article.id } });
    response.json(await toSiteContent());
  }),
);

app.get(
  '/api/admin/practice-areas',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json(await listPracticeAreas());
  }),
);

app.post(
  '/api/admin/practice-areas',
  requireAdmin,
  asyncHandler(async (request, response) => {
    await savePracticeArea(undefined, request.body);
    response.json(await toSiteContent());
  }),
);

app.put(
  '/api/admin/practice-areas/:slug',
  requireAdmin,
  asyncHandler(async (request, response) => {
    await savePracticeArea(request.params.slug, request.body);
    response.json(await toSiteContent());
  }),
);

app.delete(
  '/api/admin/practice-areas/:slug',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const practiceArea = await loadPracticeAreaBySlug(request.params.slug);
    if (!practiceArea) {
      response.status(404).json({ error: 'Practice area not found' });
      return;
    }

    await prisma.practiceArea.delete({ where: { id: practiceArea.id } });
    response.json(await toSiteContent());
  }),
);

app.get(
  '/api/admin/pages',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json(await listCmsPages());
  }),
);

app.post(
  '/api/admin/pages',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const created = await saveCmsPage(undefined, request.body);
    response.json(created);
  }),
);

app.put(
  '/api/admin/pages/:slug',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const updated = await saveCmsPage(request.params.slug, request.body);
    response.json(updated);
  }),
);

app.delete(
  '/api/admin/pages/:slug',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const deleted = await deleteCmsPage(request.params.slug);
    if (!deleted) {
      response.status(404).json({ error: 'Page not found' });
      return;
    }

    response.json({ ok: true });
  }),
);

app.get(
  '/api/admin/pages/:slug/revisions',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const page = await loadCmsPageBySlug(request.params.slug);
    if (!page) {
      response.status(404).json({ error: 'Page not found' });
      return;
    }

    const revisions = await listCmsRevisions(page.id);
    response.json(
      revisions.map((revision) => ({
        ...revision,
        blocks: sanitizeCmsPageBlocks(request.params.slug, revision.blocks || []),
      }))
    );
  }),
);

app.post(
  '/api/admin/pages/:slug/revisions',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const page = await loadCmsPageBySlug(request.params.slug);
    if (!page) {
      response.status(404).json({ error: 'Page not found' });
      return;
    }

    response.json(await saveCmsRevision(page.id, request.body));
  }),
);

app.post(
  '/api/admin/pages/:slug/revisions/:revId/restore',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const page = await loadCmsPageBySlug(request.params.slug);
    if (!page) {
      response.status(404).json({ error: 'Page not found' });
      return;
    }

    response.json(await restoreCmsRevision(page.id, request.params.revId));
  }),
);

app.get(
  '/api/admin/navigation',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json(await listNavigationItems());
  }),
);

app.put(
  '/api/admin/navigation',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const payload = request.body as { items?: unknown };
    const items = Array.isArray(payload.items) ? (payload.items as Parameters<typeof saveNavigationItems>[0]) : [];
    response.json(await saveNavigationItems(items));
  }),
);

app.get(
  '/api/admin/assets',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json(await listMediaAssets());
  }),
);

app.put(
  '/api/admin/assets/:id',
  requireAdmin,
  asyncHandler(async (request, response) => {
    response.json(await updateMediaAsset(request.params.id, request.body));
  }),
);

app.delete(
  '/api/admin/assets/:id',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const deleted = await deleteMediaAsset(request.params.id);
    if (!deleted) {
      response.status(404).json({ error: 'Asset not found' });
      return;
    }

    response.json({ ok: true });
  }),
);

app.post(
  '/api/admin/uploads',
  requireAdmin,
  upload.single('file'),
  asyncHandler(async (request, response) => {
    if (!request.file) {
      response.status(400).json({ error: 'File is required.' });
      return;
    }

    const asset = await uploadBufferToS3({
      buffer: request.file.buffer,
      originalName: request.file.originalname,
      mimeType: request.file.mimetype,
      size: request.file.size,
      altAr: typeof request.body.altAr === 'string' ? request.body.altAr : undefined,
      altEn: typeof request.body.altEn === 'string' ? request.body.altEn : undefined,
    });

    response.json({ asset });
  }),
);

app.post(
  '/api/consultations',
  consultationUpload.fields([
    { name: 'attachments', maxCount: 12 },
    { name: 'recording', maxCount: 1 },
  ]),
  asyncHandler(async (request, response) => {
    const body = request.body as Record<string, unknown>;
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const idNumber = typeof body.idNumber === 'string' ? body.idNumber.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const voucherId = typeof body.voucherId === 'string' && body.voucherId.trim() ? body.voucherId.trim() : `KSA-${Date.now()}`;
    const paymentAmount = typeof body.paymentAmount === 'string' && body.paymentAmount.trim() ? body.paymentAmount.trim() : '80.00 SAR';
    const paymentStatus = typeof body.paymentStatus === 'string' && body.paymentStatus.trim() ? body.paymentStatus.trim() : 'paid';
    const cardBrand = typeof body.cardBrand === 'string' && body.cardBrand.trim() ? body.cardBrand.trim() : 'card';
    const cardLast4 = typeof body.cardLast4 === 'string' && body.cardLast4.trim() ? body.cardLast4.trim() : '';

    if (!fullName || !phone || !email || !idNumber) {
      response.status(400).json({ error: 'Full name, phone, email, and ID number are required.' });
      return;
    }

    const filesByField = request.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | Express.Multer.File[]
      | undefined;
    const fileGroups = !Array.isArray(filesByField) ? filesByField : undefined;

    const attachmentFiles = fileGroups?.attachments || [];
    const recordingFile = fileGroups?.recording?.[0];

    const attachments = [];
    for (const file of attachmentFiles || []) {
      const asset = await uploadBufferToS3({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
      attachments.push({
        id: asset.id,
        name: asset.originalName,
        url: asset.url,
        mimeType: asset.mimeType,
        sizeBytes: asset.size,
        kind: asset.mimeType.startsWith('image/')
          ? 'image'
          : asset.mimeType.startsWith('audio/')
            ? 'audio'
            : 'document',
      });
    }

    let recordingUrl: string | null = null;
    let recordingName: string | null = null;
    let recordingMimeType: string | null = null;
    let recordingSize: number | null = null;

    if (recordingFile) {
      const recordingAsset = await uploadBufferToS3({
        buffer: recordingFile.buffer,
        originalName: recordingFile.originalname,
        mimeType: recordingFile.mimetype,
        size: recordingFile.size,
      });
      recordingUrl = recordingAsset.url;
      recordingName = recordingAsset.originalName;
      recordingMimeType = recordingAsset.mimeType;
      recordingSize = recordingAsset.size;
    }

    const consultation = await createConsultation({
      id: `consult-${Date.now()}`,
      fullName,
      phone,
      email,
      idNumber,
      message,
      status: 'new',
      paymentStatus: paymentStatus as 'paid' | 'pending' | 'refunded',
      paymentAmount,
      voucherId,
      cardBrand,
      cardLast4,
      recordingUrl,
      recordingName,
      recordingMimeType,
      recordingSize,
      attachments,
      adminNotes: '',
    });

    response.status(201).json({ consultation });
  }),
);

app.get(
  '/api/admin/consultations',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json(await listConsultations());
  }),
);

app.get(
  '/api/admin/consultations/:id',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const consultation = await getConsultationById(request.params.id);
    if (!consultation) {
      response.status(404).json({ error: 'Consultation request not found.' });
      return;
    }
    response.json(consultation);
  }),
);

app.patch(
  '/api/admin/consultations/:id',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const patch = request.body as { status?: string; adminNotes?: string };
    const updated = await updateConsultation(request.params.id, {
      status: typeof patch.status === 'string' ? patch.status : undefined,
      adminNotes: typeof patch.adminNotes === 'string' ? patch.adminNotes : undefined,
    });

    if (!updated) {
      response.status(404).json({ error: 'Consultation request not found.' });
      return;
    }

    response.json(updated);
  }),
);

app.post(
  '/api/doctor-shield-requests',
  consultationUpload.single('licenseFile'),
  asyncHandler(async (request, response) => {
    const body = request.body as Record<string, unknown>;
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const idNumber = typeof body.idNumber === 'string' ? body.idNumber.trim() : '';
    const specialty = typeof body.specialty === 'string' ? body.specialty.trim() : '';
    const city = typeof body.city === 'string' ? body.city.trim() : '';
    const employer = typeof body.employer === 'string' ? body.employer.trim() : '';
    const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
    const hasBeenConvicted = typeof body.hasBeenConvicted === 'string' && body.hasBeenConvicted.trim() === 'yes' ? 'yes' : 'no';
    const voucherId = typeof body.voucherId === 'string' && body.voucherId.trim() ? body.voucherId.trim() : `DS-${Date.now()}`;
    const paymentSummary = getDoctorShieldCharge(hasBeenConvicted);
    const licenseFile = request.file;

    if (!fullName || !phone || !email || !idNumber || !specialty || !licenseFile) {
      response.status(400).json({ error: 'Full name, phone, email, ID number, specialty, and the SCFHS license image are required.' });
      return;
    }

    if (!/^05\d{8}$/.test(phone)) {
      response.status(400).json({ error: 'Invalid Saudi phone number. Must be 10 digits and start with 05.' });
      return;
    }

    if (!validateSaudiId(idNumber)) {
      response.status(400).json({ error: 'Invalid Saudi National ID or Iqama number. Must be 10 digits and pass checksum.' });
      return;
    }

    const licenseAsset = await uploadBufferToS3({
      buffer: licenseFile.buffer,
      originalName: licenseFile.originalname,
      mimeType: licenseFile.mimetype,
      size: licenseFile.size,
    });

    const requestRecord = await createDoctorShieldRequest({
      id: `doctor-shield-${Date.now()}`,
      fullName,
      phone,
      email,
      idNumber,
      specialty,
      city,
      employer,
      notes,
      hasBeenConvicted,
      status: 'new',
      paymentStatus: 'pending',
      paymentAmount: paymentSummary.amountLabel,
      voucherId,
      paymentMethod: '',
      cardBrand: '',
      cardLast4: '',
      licenseFileUrl: licenseAsset.url,
      licenseFileName: licenseAsset.originalName,
      licenseFileMimeType: licenseAsset.mimeType,
      licenseFileSize: licenseAsset.size,
      adminNotes: '',
    });

    response.status(201).json({ doctorShieldRequest: requestRecord });
  }),
);

app.post(
  '/api/doctor-shield-requests/:id/payment',
  asyncHandler(async (request, response) => {
    const doctorShieldRequest = await getDoctorShieldRequestById(request.params.id);
    if (!doctorShieldRequest) {
      response.status(404).json({ error: 'Doctor Shield request not found.' });
      return;
    }

    const legacyPaidSummary = String(doctorShieldRequest.paymentStatus || '').toLowerCase() === 'paid';
    if (legacyPaidSummary) {
      response.status(409).json({ error: 'This Doctor Shield request is already marked as paid and cannot create a new payment attempt.' });
      return;
    }

    if (await hasSuccessfulPaymentForRequest(doctorShieldRequest.id)) {
      const successful = await getSuccessfulPaymentTransactionForRequest(doctorShieldRequest.id);
      response.json({
        doctorShieldRequest,
        paymentTransaction: successful ? paymentTransactionToRecord(successful) : null,
        alreadyPaid: true,
      });
      return;
    }

    const body = request.body as Record<string, unknown>;
    const customerSource = typeof body.customer === 'object' && body.customer ? (body.customer as Record<string, unknown>) : {};
    const billingSource = typeof body.billing === 'object' && body.billing ? (body.billing as Record<string, unknown>) : {};

    const email = readString(customerSource.email, body.customerEmail, doctorShieldRequest.email);
    const givenName = readString(customerSource.givenName, body.customerGivenName);
    const surname = readString(customerSource.surname, body.customerSurname);
    const street1 = readString(billingSource.street1, body.billingStreet1);
    const city = readString(billingSource.city, body.billingCity);
    const state = readString(billingSource.state, body.billingState);
    const country = readString(billingSource.country, body.billingCountry);
    const postcode = readString(billingSource.postcode, body.billingPostcode);
    const paymentBrand = normalizeHyperPayBrand(readString(body.paymentBrand, body.paymentMethod));

    const missingFields = [
      !email && 'customer.email',
      !givenName && 'customer.givenName',
      !surname && 'customer.surname',
      !street1 && 'billing.street1',
      !city && 'billing.city',
      !state && 'billing.state',
      !country && 'billing.country',
      !postcode && 'billing.postcode',
    ].filter(Boolean) as string[];

    if (missingFields.length > 0) {
      response.status(400).json({
        error: `Missing HyperPay billing data: ${missingFields.join(', ')}.`,
      });
      return;
    }

    const currentCharge = getDoctorShieldCharge(doctorShieldRequest.hasBeenConvicted as 'yes' | 'no');
    const clientAmount = readString(body.paymentAmount);
    if (clientAmount && clientAmount !== currentCharge.amountLabel) {
      response.status(400).json({
        error: `Payment amount is determined server-side and must match ${currentCharge.amountLabel}.`,
      });
      return;
    }

    const activeTransaction = await getLatestPaymentTransactionForRequest(doctorShieldRequest.id);
    if (activeTransaction && ['pending', 'initiated'].includes(activeTransaction.paymentStatus)) {
      if (!activeTransaction.checkoutId || !activeTransaction.integrity) {
        response.status(409).json({
          error: 'Existing payment transaction is missing secure checkout data. Please create a new Doctor Shield request.',
          doctorShieldRequest,
          paymentTransaction: paymentTransactionToRecord(activeTransaction),
          alreadyInProgress: true,
        });
        return;
      }

      response.json({
        doctorShieldRequest,
        checkout: {
          checkoutId: activeTransaction.checkoutId,
          resourcePath: activeTransaction.resourcePath || null,
          integrity: activeTransaction.integrity,
          paymentBrand: activeTransaction.paymentBrand || null,
          amount: activeTransaction.amount,
          currency: activeTransaction.currency,
          paymentType: activeTransaction.paymentType,
        },
        paymentTransaction: paymentTransactionToRecord(activeTransaction),
        alreadyInProgress: true,
      });
      return;
    }

    const attemptNumber = await getNextAttemptNumber(doctorShieldRequest.id);
    const merchantTransactionId = `DS-${doctorShieldRequest.id}-${attemptNumber}-${Date.now()}`;

    const createdTransaction = await createPaymentTransactionAttempt({
      doctorShieldRequestId: doctorShieldRequest.id,
      merchantTransactionId,
      amount: currentCharge.amount,
      currency: config.hyperpay.currency,
      paymentType: config.hyperpay.paymentType,
      paymentBrand,
      paymentStatus: 'pending',
      attemptNumber,
    });

    try {
      const checkout = await hyperpayService.createCheckout({
        amount: currentCharge.amount,
        merchantTransactionId,
        customer: {
          email,
          givenName,
          surname,
        },
        billing: {
          street1,
          city,
          state,
          country,
          postcode,
        },
        paymentBrand: paymentBrand || undefined,
      });

      const initiated = await setPaymentTransactionInitiated(createdTransaction.id, {
        checkoutId: checkout.id,
        integrity: checkout.integrity || null,
        resourcePath: checkout.resourcePath || null,
        paymentBrand: paymentBrand || undefined,
      });

      response.status(201).json({
        doctorShieldRequest,
        paymentTransaction: paymentTransactionToRecord(initiated),
        checkout: {
          checkoutId: checkout.id,
          resourcePath: checkout.resourcePath || null,
          integrity: checkout.integrity || null,
          paymentBrand: paymentBrand || null,
          amount: currentCharge.amount,
          currency: config.hyperpay.currency,
          paymentType: config.hyperpay.paymentType,
        },
      });
      return;
    } catch (error) {
      const failureReason = error instanceof HyperPayError ? error.message : error instanceof Error ? error.message : 'HyperPay checkout creation failed.';
      const failed = await setPaymentTransactionFailed(createdTransaction.id, {
        failureReason,
      });

      response.status(error instanceof HyperPayError ? error.status : 502).json({
        error: failureReason,
        paymentTransaction: paymentTransactionToRecord(failed),
      });
    }
  }),
);

const handleDoctorShieldPaymentVerification = asyncHandler(async (request, response) => {
  const resourcePathInput =
    (request.method === 'POST' && typeof request.body === 'object' && request.body
      ? (request.body as { resourcePath?: unknown }).resourcePath
      : undefined) ??
    (typeof request.query.resourcePath === 'string' ? request.query.resourcePath : undefined) ??
    (typeof request.query.checkoutId === 'string' ? `/v1/checkouts/${request.query.checkoutId.trim()}/payment` : undefined);

  const resourcePath = validateHyperPayResourcePath(resourcePathInput);
  if (!resourcePath) {
    response.status(400).json({ error: 'A valid HyperPay resourcePath is required.' });
    return;
  }

  const paymentTransaction = await getPaymentTransactionByCheckoutId(resourcePath.checkoutId);
  if (!paymentTransaction) {
    response.status(404).json({ error: 'Payment transaction not found for the provided checkout ID.' });
    return;
  }

  const doctorShieldRequest = await getDoctorShieldRequestById(paymentTransaction.doctorShieldRequestId);
  if (!doctorShieldRequest) {
    response.status(404).json({ error: 'Doctor Shield request not found.' });
    return;
  }

  try {
    const result = await verifyDoctorShieldPaymentWithHyperPay(doctorShieldRequest.id, resourcePathInput);

    response.status(200).json({
      verified: result.state === 'paid',
      state: result.state,
      doctorShieldRequest: await getDoctorShieldRequestById(doctorShieldRequest.id),
      paymentTransaction: paymentTransactionToRecord(result.paymentTransaction),
      verificationSummary: result.verificationSummary,
    });
  } catch (error) {
    const status = error && typeof error === 'object' && 'status' in error && typeof (error as { status?: unknown }).status === 'number'
      ? (error as { status: number }).status
      : 500;
    const paymentTransactionError = error && typeof error === 'object' && 'paymentTransaction' in error
      ? (error as { paymentTransaction?: Parameters<typeof paymentTransactionToRecord>[0] }).paymentTransaction
      : null;

    response.status(status).json({
      error: error instanceof Error ? error.message : 'Payment verification failed.',
      ...(paymentTransactionError ? { paymentTransaction: paymentTransactionToRecord(paymentTransactionError) } : {}),
      ...(paymentTransactionError
        ? {
            verificationSummary: buildSafeHyperPayVerificationSummary(paymentTransactionError, {
              verificationSuccess: paymentTransactionError.paymentStatus === 'succeeded',
              resultDescription: paymentTransactionError.failureReason,
              verificationSource: 'server-side HyperPay verification',
              fallbackCheckoutId: paymentTransactionError.checkoutId,
              fallbackGatewayTransactionId: paymentTransactionError.gatewayTransactionId,
            }),
          }
        : {}),
    });
  }
});

app.get('/api/doctor-shield-requests/payment/verify', handleDoctorShieldPaymentVerification);
app.post('/api/doctor-shield-requests/payment/verify', handleDoctorShieldPaymentVerification);

app.get(
  '/api/admin/doctor-shield-requests',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json(await listDoctorShieldRequests());
  }),
);

app.get(
  '/api/admin/doctor-shield-requests/:id',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const requestRecord = await getDoctorShieldRequestById(request.params.id);
    if (!requestRecord) {
      response.status(404).json({ error: 'Doctor Shield request not found.' });
      return;
    }
    response.json(requestRecord);
  }),
);

app.patch(
  '/api/admin/doctor-shield-requests/:id',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const patch = request.body as { status?: string; adminNotes?: string };
    const updated = await updateDoctorShieldRequest(request.params.id, {
      status: typeof patch.status === 'string' ? patch.status : undefined,
      adminNotes: typeof patch.adminNotes === 'string' ? patch.adminNotes : undefined,
    });

    if (!updated) {
      response.status(404).json({ error: 'Doctor Shield request not found.' });
      return;
    }

    response.json(updated);
  }),
);

app.post(
  '/api/analytics/events',
  asyncHandler(async (request, response) => {
    const body = request.body as Record<string, unknown>;
    const path = typeof body.path === 'string' && body.path.trim() ? body.path.trim() : '/';
    const title = typeof body.title === 'string' ? body.title : '';
    const type = body.type === 'cta_click' ? 'cta_click' : 'page_view';
    const visitorId = typeof body.visitorId === 'string' && body.visitorId.trim() ? body.visitorId.trim() : undefined;
    const sessionId = typeof body.sessionId === 'string' && body.sessionId.trim() ? body.sessionId.trim() : undefined;
    const name = typeof body.name === 'string' ? body.name : '';
    const locale = typeof body.locale === 'string' ? body.locale : '';
    const referrer = typeof body.referrer === 'string' ? body.referrer : '';
    const screenWidth = typeof body.screenWidth === 'number' ? body.screenWidth : typeof body.screenWidth === 'string' && body.screenWidth.trim() ? Number(body.screenWidth) : null;
    const screenHeight = typeof body.screenHeight === 'number' ? body.screenHeight : typeof body.screenHeight === 'string' && body.screenHeight.trim() ? Number(body.screenHeight) : null;

    await recordAnalyticsEvent({
      visitorId,
      sessionId,
      type,
      name,
      path,
      title,
      locale,
      referrer,
      screenWidth: Number.isFinite(screenWidth as number) ? Number(screenWidth) : null,
      screenHeight: Number.isFinite(screenHeight as number) ? Number(screenHeight) : null,
    }, request.headers);

    response.json({ ok: true });
  }),
);

app.get(
  '/api/admin/analytics/overview',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const rangeRaw = typeof request.query.range === 'string' ? request.query.range : '30d';
    const range = ['7d', '30d', '90d', 'all'].includes(rangeRaw) ? rangeRaw : '30d';
    const country = typeof request.query.country === 'string' ? request.query.country.trim() : '';
    response.json(await getAnalyticsOverview(range as '7d' | '30d' | '90d' | 'all', country));
  }),
);

app.post(
  '/api/admin/seed',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    await reseedDatabase();
    response.json(await toSiteContent());
  }),
);

app.get(
  '/api/admin/hero-slides',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json(await listHeroSlides());
  }),
);

app.put(
  '/api/admin/hero-slides',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const payload = request.body as { heroSlides?: unknown };
    const heroSlides = Array.isArray(payload.heroSlides) ? payload.heroSlides : [];

    if (heroSlides.length === 0) {
      response.status(400).json({ error: 'At least one hero slide is required.' });
      return;
    }

    const normalizedSlides: Prisma.HeroSlideCreateManyInput[] = heroSlides.map((rawSlide, index) => {
      const slide = rawSlide as Record<string, unknown>;
      if (typeof slide.id !== 'string' || !slide.id.trim()) {
        throw new Error('Hero slide id is required.');
      }

      return {
        id: slide.id,
        badgeAr: String(slide.badgeAr || ''),
        badgeEn: String(slide.badgeEn || ''),
        badgeIcon: String(slide.badgeIcon || ''),
        titleArLine1: String(slide.titleArLine1 || ''),
        titleEnLine1: String(slide.titleEnLine1 || ''),
        titleArLine2: String(slide.titleArLine2 || ''),
        titleEnLine2: String(slide.titleEnLine2 || ''),
        descriptionAr: String(slide.descriptionAr || ''),
        descriptionEn: String(slide.descriptionEn || ''),
        ctaTextAr: String(slide.ctaTextAr || ''),
        ctaTextEn: String(slide.ctaTextEn || ''),
        actionType: String(slide.actionType || 'contact'),
        actionParam: typeof slide.actionParam === 'string' && slide.actionParam.trim() ? slide.actionParam.trim() : null,
        image: String(slide.image || ''),
        imageAltAr: String(slide.imageAltAr || ''),
        imageAltEn: String(slide.imageAltEn || ''),
        highlightBox: (slide.highlightBox ?? null) as Prisma.InputJsonValue | null,
        order: index + 1,
      };
    });

    await prisma.heroSlide.deleteMany({});
    await prisma.heroSlide.createMany({ data: normalizedSlides });

    response.json(await toSiteContent());
  }),
);

app.put(
  '/api/admin/site-settings',
  requireAdmin,
  asyncHandler(async (request, response) => {
    await saveSiteSettings(request.body);
    response.json(await toSiteContent());
  }),
);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  sendError(response, error);
});

const createDevServer = async (): Promise<ViteDevServer> =>
  createViteServer({
    configFile: path.resolve(process.cwd(), 'vite.config.ts'),
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
  });

const listenOnAvailablePort = async (startingPort: number, retries = 10): Promise<number> => {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const port = startingPort + attempt;
    try {
      await new Promise<void>((resolve, reject) => {
        const server = app.listen(port);
        server.once('listening', () => resolve());
        server.once('error', (error: NodeJS.ErrnoException) => {
          server.close();
          reject(error);
        });
      });
      return port;
    } catch (error) {
      if (!(error instanceof Error) || (error as NodeJS.ErrnoException).code !== 'EADDRINUSE' || attempt === retries) {
        throw error;
      }
    }
  }

  return startingPort;
};

const start = async () => {
  await ensureDatabaseSchema();
  await ensureAdminUser();
  await seedDatabase();

  if (config.isDev) {
    const vite = await createDevServer();
    app.use(vite.middlewares);

    app.use('*', asyncHandler(async (request, response) => {
      const templatePath = path.resolve(process.cwd(), 'index.html');
      const template = await fs.readFile(templatePath, 'utf8');
      const html = await vite.transformIndexHtml(request.originalUrl, template);
      response.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    }));
  } else {
    app.use(express.static(distPath));
    app.use('*', asyncHandler(async (_request, response) => {
      const indexPath = path.join(distPath, 'index.html');
      response.status(200).send(await fs.readFile(indexPath, 'utf8'));
    }));
  }

  const port = await listenOnAvailablePort(config.port);
  console.log(`Backend listening on http://localhost:${port}`);
};

void start();
