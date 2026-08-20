import type { ArticleRecord, CMSPublishedPageRecord, DoctorShieldRequestRecord, HeroSlideRecord, PracticeAreaRecord, SiteContent, SiteSettingsRecord, ConsultationRequestRecord } from '../types';

export class ApiError extends Error {
  public code?: string;
  public details?: any;
  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string; message?: string; code?: string } | null;
    const errorMsg = payload?.message || payload?.error || `Request failed: ${response.status}`;
    throw new ApiError(errorMsg, payload?.error || payload?.code, payload);
  }

  return response.json() as Promise<T>;
};

const requestFormData = async <T>(url: string, formData: FormData): Promise<T> => {
  const response = await fetch(url, {
    credentials: 'include',
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string; message?: string; code?: string } | null;
    const errorMsg = payload?.message || payload?.error || `Request failed: ${response.status}`;
    throw new ApiError(errorMsg, payload?.error || payload?.code, payload);
  }

  return response.json() as Promise<T>;
};

export const contentClient = {
  getContent: () => requestJson<SiteContent>('/api/content'),
  getCmsPage: async (slug: string) => {
    const trimmed = slug.trim();
    const attempts = trimmed.startsWith('/')
      ? [trimmed, trimmed.slice(1)]
      : [trimmed, `/${trimmed}`];

    let lastError: unknown = null;
    for (const attempt of attempts) {
      try {
        return await requestJson<CMSPublishedPageRecord>(`/api/pages/${encodeURIComponent(attempt)}`);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Page not found');
  },
  login: (username: string, password: string) =>
    requestJson<{ ok: true }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => requestJson<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
  me: () => requestJson<{ authenticated: boolean; username?: string }>('/api/auth/me'),
  saveArticle: (article: ArticleRecord, originalSlug?: string) =>
    requestJson<SiteContent>(`/api/admin/articles/${encodeURIComponent(originalSlug || article.slug)}`, {
      method: 'PUT',
      body: JSON.stringify(article),
    }),
  createArticle: (article: ArticleRecord) =>
    requestJson<SiteContent>('/api/admin/articles', {
      method: 'POST',
      body: JSON.stringify(article),
    }),
  deleteArticle: (slug: string) =>
    requestJson<SiteContent>(`/api/admin/articles/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    }),
  savePracticeArea: (practiceArea: PracticeAreaRecord, originalSlug?: string) =>
    requestJson<SiteContent>(`/api/admin/practice-areas/${encodeURIComponent(originalSlug || practiceArea.slug)}`, {
      method: 'PUT',
      body: JSON.stringify(practiceArea),
    }),
  createPracticeArea: (practiceArea: PracticeAreaRecord) =>
    requestJson<SiteContent>('/api/admin/practice-areas', {
      method: 'POST',
      body: JSON.stringify(practiceArea),
    }),
  deletePracticeArea: (slug: string) =>
    requestJson<SiteContent>(`/api/admin/practice-areas/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    }),
  saveHeroSlides: (heroSlides: HeroSlideRecord[]) =>
    requestJson<SiteContent>('/api/admin/hero-slides', {
      method: 'PUT',
      body: JSON.stringify({ heroSlides }),
    }),
  saveSiteSettings: (siteSettings: SiteSettingsRecord) =>
    requestJson<SiteContent>('/api/admin/site-settings', {
      method: 'PUT',
      body: JSON.stringify(siteSettings),
    }),
  uploadAsset: (file: File, altAr?: string, altEn?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (altAr) formData.append('altAr', altAr);
    if (altEn) formData.append('altEn', altEn);
    return requestFormData<{ asset: { id: string; url: string; key: string } }>('/api/admin/uploads', formData);
  },
  submitConsultation: (payload: {
    fullName: string;
    phone: string;
    email: string;
    idNumber: string;
    message: string;
    voucherId: string;
    paymentAmount: string;
    paymentStatus: string;
    cardBrand: string;
    cardLast4: string;
    attachments?: File[];
    recording?: File | null;
  }) => {
    const formData = new FormData();
    formData.append('fullName', payload.fullName);
    formData.append('phone', payload.phone);
    formData.append('email', payload.email);
    formData.append('idNumber', payload.idNumber);
    formData.append('message', payload.message);
    formData.append('voucherId', payload.voucherId);
    formData.append('paymentAmount', payload.paymentAmount);
    formData.append('paymentStatus', payload.paymentStatus);
    formData.append('cardBrand', payload.cardBrand);
    formData.append('cardLast4', payload.cardLast4);
    payload.attachments?.forEach((file) => {
      formData.append('attachments', file);
    });
    if (payload.recording) {
      formData.append('recording', payload.recording);
    }
    return requestFormData<{ consultation: ConsultationRequestRecord }>('/api/consultations', formData);
  },
  submitDoctorShieldRequest: (payload: {
    fullName: string;
    phone: string;
    email: string;
    idNumber: string;
    specialty: string;
    city: string;
    employer: string;
    notes: string;
    hasBeenConvicted: 'yes' | 'no';
    licenseFile: File;
  }) =>
    requestFormData<{ doctorShieldRequest: DoctorShieldRequestRecord }>('/api/doctor-shield-requests', (() => {
      const formData = new FormData();
      formData.append('fullName', payload.fullName);
      formData.append('phone', payload.phone);
      formData.append('email', payload.email);
      formData.append('idNumber', payload.idNumber);
      formData.append('specialty', payload.specialty);
      formData.append('city', payload.city);
      formData.append('employer', payload.employer);
      formData.append('notes', payload.notes);
      formData.append('hasBeenConvicted', payload.hasBeenConvicted);
      formData.append('licenseFile', payload.licenseFile);
      return formData;
    })()),
  createDoctorShieldCheckout: (
    doctorShieldRequestId: string,
    payload: {
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
    },
  ) =>
    requestJson<{
      doctorShieldRequest: DoctorShieldRequestRecord;
      paymentTransaction: {
        id: string;
        paymentStatus: string;
        checkoutId: string | null;
        integrity: string | null;
        resourcePath: string | null;
      };
      checkout?: {
        checkoutId: string;
        resourcePath: string | null;
        integrity: string | null;
        paymentBrand: string | null;
        amount: number;
        currency: string;
        paymentType: string;
      };
      alreadyInProgress?: boolean;
    }>(`/api/doctor-shield-requests/${encodeURIComponent(doctorShieldRequestId)}/payment`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifyDoctorShieldPayment: (
    payload: {
      resourcePath: string;
    },
  ) =>
    requestJson<{
      verified: boolean;
      state: 'paid' | 'pending' | 'failed';
      doctorShieldRequest: DoctorShieldRequestRecord;
      paymentTransaction?: {
        id: string;
        merchantTransactionId: string;
        paymentStatus: string;
        checkoutId: string | null;
        integrity: string | null;
        resourcePath: string | null;
        amount: number;
        currency: string;
        paymentType: string;
        paymentBrand: string;
      };
      verificationSummary?: {
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
    }>(`/api/doctor-shield-requests/payment/verify?resourcePath=${encodeURIComponent(payload.resourcePath)}`, {
      method: 'GET',
    }),
  trackAnalyticsEvent: (payload: {
    visitorId?: string;
    sessionId?: string;
    type?: 'page_view' | 'cta_click';
    name?: string;
    path: string;
    title?: string;
    referrer?: string;
    locale?: string;
    screenWidth?: number;
    screenHeight?: number;
  }) =>
    requestJson<{ ok: true }>('/api/analytics/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
