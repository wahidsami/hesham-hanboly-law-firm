import { config } from './config';

type HyperPayResult = {
  code?: string;
  description?: string;
};

export interface HyperPayCheckoutRequest {
  amount: number;
  merchantTransactionId: string;
  customer: {
    email: string;
    givenName: string;
    surname: string;
  };
  billing: {
    street1: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
  };
  paymentBrand?: string;
  resourcePath?: string;
}

export interface HyperPayCheckoutResponse {
  id: string;
  resourcePath?: string;
  integrity?: string;
  resultCode: string;
  resultDescription: string;
  raw: Record<string, unknown>;
}

export interface HyperPayPaymentStatusResponse {
  id: string;
  resourcePath?: string;
  merchantTransactionId?: string;
  amount?: string;
  currency?: string;
  paymentType?: string;
  paymentBrand?: string;
  resultCode: string;
  resultDescription: string;
  raw: Record<string, unknown>;
}

class HyperPayError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = 'HyperPayError';
    this.status = status;
  }
}

const normalizeBaseUrl = () => config.hyperpay.baseUrl.replace(/\/+$/, '');

const parseJsonSafely = async (response: Response) => {
  const text = await response.text();
  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { rawResponseText: text };
  }
};

const extractResult = (body: Record<string, unknown>) => {
  const result = body.result as HyperPayResult | undefined;
  return {
    resultCode: typeof result?.code === 'string' ? result.code : '',
    resultDescription: typeof result?.description === 'string' ? result.description : '',
  };
};

const ensureConfigured = () => {
  const missing: string[] = [];
  if (!config.hyperpay.baseUrl) missing.push('HYPERPAY_BASE_URL');
  if (!config.hyperpay.accessToken) missing.push('HYPERPAY_ACCESS_TOKEN');
  if (!config.hyperpay.entityId) missing.push('HYPERPAY_ENTITY_ID');
  if (!config.hyperpay.currency) missing.push('HYPERPAY_CURRENCY');
  if (!config.hyperpay.paymentType) missing.push('HYPERPAY_PAYMENT_TYPE');
  if (missing.length > 0) {
    throw new HyperPayError(`HyperPay is not configured: ${missing.join(', ')}`, 500);
  }
};

const postForm = async (path: string, params: Record<string, string>) => {
  ensureConfigured();
  const response = await fetch(`${normalizeBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.hyperpay.accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  });

  const body = await parseJsonSafely(response);
  if (!response.ok) {
    const message = typeof body === 'object' && body && typeof (body as Record<string, unknown>).result === 'object'
      ? extractResult(body as Record<string, unknown>).resultDescription || `HyperPay request failed (${response.status})`
      : `HyperPay request failed (${response.status})`;
    throw new HyperPayError(message, response.status);
  }

  return body;
};

const getJson = async (path: string) => {
  ensureConfigured();
  const response = await fetch(`${normalizeBaseUrl()}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.hyperpay.accessToken}`,
      Accept: 'application/json',
    },
  });

  const body = await parseJsonSafely(response);
  if (!response.ok) {
    const message = typeof body === 'object' && body && typeof (body as Record<string, unknown>).result === 'object'
      ? extractResult(body as Record<string, unknown>).resultDescription || `HyperPay request failed (${response.status})`
      : `HyperPay request failed (${response.status})`;
    throw new HyperPayError(message, response.status);
  }

  return body;
};

export const hyperpayService = {
  createCheckout: async (input: HyperPayCheckoutRequest): Promise<HyperPayCheckoutResponse> => {
    const body = await postForm('/v1/checkouts', {
      entityId: config.hyperpay.entityId,
      amount: String(input.amount),
      currency: config.hyperpay.currency,
      paymentType: config.hyperpay.paymentType,
      merchantTransactionId: input.merchantTransactionId,
      'customer.email': input.customer.email,
      'customer.givenName': input.customer.givenName,
      'customer.surname': input.customer.surname,
      'billing.street1': input.billing.street1,
      'billing.city': input.billing.city,
      'billing.state': input.billing.state,
      'billing.country': input.billing.country,
      'billing.postcode': input.billing.postcode,
      testMode: config.hyperpay.testMode,
      integrity: config.hyperpay.integrity ? 'true' : 'false',
      'customParameters[3DS2_enrolled]': config.hyperpay.threeDs2Enrolled ? 'true' : 'false',
      ...(input.paymentBrand ? { paymentBrand: input.paymentBrand } : {}),
      ...(input.resourcePath ? { resourcePath: input.resourcePath } : {}),
    });

    const { resultCode, resultDescription } = extractResult(body);
    const id = typeof body.id === 'string' ? body.id : '';
    const resourcePath = typeof body.resourcePath === 'string' ? body.resourcePath : undefined;
    const integrity = typeof body.integrity === 'string' ? body.integrity : undefined;

    if (!id) {
      throw new HyperPayError('HyperPay did not return a checkout ID.', 502);
    }

    return {
      id,
      resourcePath,
      integrity,
      resultCode,
      resultDescription,
      raw: body,
    };
  },
  getPaymentStatus: async (resourcePathOrCheckoutId: string): Promise<HyperPayPaymentStatusResponse> => {
    const resourcePath = resourcePathOrCheckoutId.startsWith('/v1/')
      ? resourcePathOrCheckoutId
      : `/v1/checkouts/${encodeURIComponent(resourcePathOrCheckoutId)}/payment`;
    const body = await getJson(`${resourcePath}${resourcePath.includes('?') ? '&' : '?'}entityId=${encodeURIComponent(config.hyperpay.entityId)}`);
    const { resultCode, resultDescription } = extractResult(body);

    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) {
      throw new HyperPayError('HyperPay did not return a payment ID.', 502);
    }

    return {
      id,
      resourcePath: typeof body.resourcePath === 'string' ? body.resourcePath : resourcePath,
      merchantTransactionId: typeof body.merchantTransactionId === 'string' ? body.merchantTransactionId : undefined,
      amount: typeof body.amount === 'string' ? body.amount : undefined,
      currency: typeof body.currency === 'string' ? body.currency : undefined,
      paymentType: typeof body.paymentType === 'string' ? body.paymentType : undefined,
      paymentBrand: typeof body.paymentBrand === 'string' ? body.paymentBrand : undefined,
      resultCode,
      resultDescription,
      raw: body,
    };
  },
};

export { HyperPayError };
