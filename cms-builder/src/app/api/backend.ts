import type {
  Article,
  ArticleSummary,
  ApiAsset,
  ApiConsultationRequest,
  ApiBlock,
  ApiPage,
  ApiNavItem,
  ApiRevision,
  ApiDoctorShieldRequest,
  PracticeArea,
  PracticeAreaSummary,
  ArticleStatus,
  PageStatus,
  PracticeAreaStatus,
} from './types';
import type { HeroSlideRecord, SiteContent, SiteSettingsRecord } from '../../../../src/types';

type BackendArticle = {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  categoryAr: string;
  categoryEn: string;
  authorAr: string;
  authorEn: string;
  date: string;
  readTimeAr: string;
  readTimeEn: string;
  image: string;
  bodyAr: string;
  bodyEn: string;
  published: boolean;
  order: number;
};

type BackendPracticeArea = {
  id: string;
  slug: string;
  categorySlug: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  shortDescAr: string;
  shortDescEn: string;
  aboutAr: string[];
  aboutEn: string[];
  features: Array<{ ar: string; en: string; descAr: string; descEn: string }>;
  processSteps: Array<{ ar: string; en: string; descAr: string; descEn: string }>;
  useCases: Array<{ ar: string; en: string }>;
  faq: Array<{ qAr: string; qEn: string; aAr: string; aEn: string }>;
  imageUrl?: string | null;
  published: boolean;
  order: number;
};

type BackendPage = {
  id: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  status: 'published' | 'draft' | 'hidden';
  navVisible: boolean;
  blocksCount: number;
  author: string;
  createdAt: string;
  updatedAt: string;
};

type BackendNavItem = {
  id: string;
  pageId: string;
  labelEn: string;
  labelAr: string;
  url: string;
  desktopVisible: boolean;
  mobileVisible: boolean;
  order: number;
};

type BackendAsset = {
  id: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
  originalName: string;
  altAr?: string | null;
  altEn?: string | null;
  createdAt: string;
  updatedAt: string;
};

type BackendConsultationAttachment = {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  kind: 'image' | 'document' | 'audio';
};

type BackendConsultation = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idNumber: string;
  message: string;
  status: 'new' | 'reviewing' | 'responded' | 'closed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentAmount: string;
  voucherId: string;
  cardBrand: string;
  cardLast4: string;
  recordingUrl?: string | null;
  recordingName?: string | null;
  recordingMimeType?: string | null;
  recordingSize?: number | null;
  attachments: BackendConsultationAttachment[];
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
};

type BackendDoctorShieldRequest = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idNumber: string;
  specialty: string;
  city: string;
  employer: string;
  notes: string;
  hasBeenConvicted: 'yes' | 'no';
  status: 'new' | 'reviewing' | 'responded' | 'closed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentAmount: string;
  voucherId: string;
  paymentMethod: string;
  cardBrand: string;
  cardLast4: string;
  licenseFileUrl: string;
  licenseFileName: string;
  licenseFileMimeType: string;
  licenseFileSize: number | null;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
};

type BackendRevision = {
  id: string;
  pageId: string;
  label: string;
  status: PageStatus;
  blocks: ApiBlock[];
  createdAt: string;
  author: string;
  note: string;
};

const API_BASE = (import.meta.env.VITE_CMS_API_BASE_URL || '').replace(/\/+$/, '');

const nowIso = () => new Date().toISOString();

const requestUrl = (path: string) => `${API_BASE}${path}`;

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(requestUrl(path), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function requestForm<T>(path: string, formData: FormData, init?: RequestInit): Promise<T> {
  const response = await fetch(requestUrl(path), {
    credentials: 'include',
    ...init,
    method: init?.method || 'POST',
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function mapArticle(article: BackendArticle): Article {
  const now = nowIso();
  return {
    id: article.id,
    slug: article.slug,
    status: article.published ? 'published' : 'draft',
    titleEn: article.titleEn,
    titleAr: article.titleAr,
    excerptEn: article.excerptEn,
    excerptAr: article.excerptAr,
    categoryEn: article.categoryEn,
    categoryAr: article.categoryAr,
    authorEn: article.authorEn,
    authorAr: article.authorAr,
    readTimeEn: article.readTimeEn,
    readTimeAr: article.readTimeAr,
    bodyEn: article.bodyEn,
    bodyAr: article.bodyAr,
    coverImageUrl: article.image,
    coverAltEn: article.titleEn,
    coverAltAr: article.titleAr,
    seoTitleEn: article.titleEn,
    seoTitleAr: article.titleAr,
    seoDescEn: article.excerptEn,
    seoDescAr: article.excerptAr,
    createdAt: article.date ? `${article.date}T00:00:00.000Z` : now,
    updatedAt: now,
    publishedAt: article.published ? now : null,
    author: article.authorEn || article.authorAr || 'CMS Editor',
  };
}

function mapPracticeArea(area: BackendPracticeArea): PracticeArea {
  const now = nowIso();
  return {
    id: area.id,
    slug: area.slug,
    status: area.published ? 'published' : 'draft',
    order: area.order,
    titleEn: area.titleEn,
    titleAr: area.titleAr,
    categoryEn: area.categoryEn,
    categoryAr: area.categoryAr,
    shortDescEn: area.shortDescEn,
    shortDescAr: area.shortDescAr,
    coverImageUrl: area.imageUrl || '',
    coverAltEn: area.titleEn,
    coverAltAr: area.titleAr,
    iconName: area.categorySlug || 'Scale',
    about: {
      bodyEn: area.aboutEn.join('\n\n'),
      bodyAr: area.aboutAr.join('\n\n'),
    },
    features: area.features.map((item, index) => ({
      id: `${area.id}-feature-${index + 1}`,
      titleEn: item.en,
      titleAr: item.ar,
      descriptionEn: item.descEn,
      descriptionAr: item.descAr,
      icon: 'CheckCircle',
    })),
    steps: area.processSteps.map((item, index) => ({
      id: `${area.id}-step-${index + 1}`,
      number: index + 1,
      titleEn: item.en,
      titleAr: item.ar,
      descriptionEn: item.descEn,
      descriptionAr: item.descAr,
    })),
    useCases: area.useCases.map((item, index) => ({
      id: `${area.id}-usecase-${index + 1}`,
      titleEn: item.en,
      titleAr: item.ar,
      summaryEn: item.en,
      summaryAr: item.ar,
      industryEn: '',
      industryAr: '',
    })),
    faqs: area.faq.map((item, index) => ({
      id: `${area.id}-faq-${index + 1}`,
      questionEn: item.qEn,
      questionAr: item.qAr,
      answerEn: item.aEn,
      answerAr: item.aAr,
    })),
    seoTitleEn: area.titleEn,
    seoTitleAr: area.titleAr,
    seoDescEn: area.shortDescEn,
    seoDescAr: area.shortDescAr,
    createdAt: now,
    updatedAt: now,
    publishedAt: area.published ? now : null,
    author: 'CMS Editor',
  };
}

function articleToPayload(article: Article) {
  return {
    id: article.id,
    slug: article.slug,
    titleAr: article.titleAr,
    titleEn: article.titleEn,
    excerptAr: article.excerptAr,
    excerptEn: article.excerptEn,
    categoryAr: article.categoryAr,
    categoryEn: article.categoryEn,
    authorAr: article.authorAr,
    authorEn: article.authorEn,
    date: article.createdAt.slice(0, 10),
    readTimeAr: article.readTimeAr,
    readTimeEn: article.readTimeEn,
    imageUrl: article.coverImageUrl,
    bodyAr: article.bodyAr,
    bodyEn: article.bodyEn,
    published: article.status === 'published',
    order: 0,
  };
}

function practiceAreaToPayload(area: PracticeArea) {
  return {
    id: area.id,
    slug: area.slug,
    categorySlug: area.iconName || 'advisory',
    titleAr: area.titleAr,
    titleEn: area.titleEn,
    categoryAr: area.categoryAr,
    categoryEn: area.categoryEn,
    shortDescAr: area.shortDescAr,
    shortDescEn: area.shortDescEn,
    aboutAr: area.about.bodyAr.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean),
    aboutEn: area.about.bodyEn.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean),
    features: area.features.map((item) => ({ ar: item.titleAr, en: item.titleEn, descAr: item.descriptionAr, descEn: item.descriptionEn })),
    processSteps: area.steps.map((item) => ({ ar: item.titleAr, en: item.titleEn, descAr: item.descriptionAr, descEn: item.descriptionEn })),
    useCases: area.useCases.map((item) => ({ ar: item.titleAr, en: item.titleEn })),
    faq: area.faqs.map((item) => ({ qAr: item.questionAr, qEn: item.questionEn, aAr: item.answerAr, aEn: item.answerEn })),
    imageUrl: area.coverImageUrl || null,
    published: area.status === 'published',
    order: area.order,
  };
}

function mapPage(page: BackendPage): ApiPage {
  return {
    id: page.id,
    titleEn: page.titleEn,
    titleAr: page.titleAr,
    slug: page.slug,
    status: page.status,
    navVisible: page.navVisible,
    seoTitleEn: page.titleEn,
    seoTitleAr: page.titleAr,
    seoDescEn: '',
    seoDescAr: '',
    blocks: Array.from({ length: page.blocksCount }, (_, index) => ({
      id: `${page.id}-block-${index + 1}`,
      type: 'rich-text',
      order: index + 1,
      data: {},
    })),
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    publishedAt: page.status === 'published' ? page.updatedAt : null,
    author: page.author,
  };
}

function mapAsset(asset: BackendAsset): ApiAsset {
  return {
    id: asset.id,
    filename: asset.originalName,
    url: asset.url,
    thumbnailUrl: asset.url,
    type: asset.mimeType.startsWith('image/')
      ? 'image'
      : asset.mimeType.startsWith('video/')
        ? 'video'
        : 'document',
    mimeType: asset.mimeType,
    sizeBytes: asset.size,
    width: null,
    height: null,
    altEn: asset.altEn || '',
    altAr: asset.altAr || '',
    uploadedAt: asset.createdAt,
    uploadedBy: 'CMS Editor',
    usedInPages: [],
  };
}

function mapConsultation(request: BackendConsultation): ApiConsultationRequest {
  return {
    ...request,
    status: request.status,
    paymentStatus: request.paymentStatus,
    attachments: request.attachments || [],
  };
}

function mapDoctorShieldRequest(request: BackendDoctorShieldRequest): ApiDoctorShieldRequest {
  return {
    id: request.id,
    fullName: request.fullName,
    phone: request.phone,
    email: request.email,
    idNumber: request.idNumber,
    specialty: request.specialty,
    city: request.city,
    employer: request.employer,
    notes: request.notes,
    hasBeenConvicted: request.hasBeenConvicted,
    status: request.status,
    paymentStatus: request.paymentStatus,
    paymentAmount: request.paymentAmount,
    voucherId: request.voucherId,
    paymentMethod: request.paymentMethod,
    cardBrand: request.cardBrand,
    cardLast4: request.cardLast4,
    licenseFileUrl: request.licenseFileUrl,
    licenseFileName: request.licenseFileName,
    licenseFileMimeType: request.licenseFileMimeType,
    licenseFileSize: request.licenseFileSize,
    adminNotes: request.adminNotes,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

function mapRevision(revision: BackendRevision): ApiRevision {
  return {
    id: revision.id,
    pageId: revision.pageId,
    label: revision.label,
    status: revision.status,
    blocks: revision.blocks,
    createdAt: revision.createdAt,
    author: revision.author,
    note: revision.note,
  };
}

function createDraftArticle(titleEn: string, titleAr: string, slug: string): Article {
  const now = nowIso();
  return {
    id: slug.replace(/^\//, ''),
    slug,
    status: 'draft',
    titleEn,
    titleAr,
    excerptEn: 'Draft article excerpt',
    excerptAr: 'ملخص مبدئي للمقال',
    categoryEn: 'General',
    categoryAr: 'عام',
    authorEn: 'CMS Editor',
    authorAr: 'محرر النظام',
    readTimeEn: '1 min read',
    readTimeAr: '1 دقيقة قراءة',
    bodyEn: 'Draft article body',
    bodyAr: 'محتوى مبدئي للمقال',
    coverImageUrl: '',
    coverAltEn: titleEn,
    coverAltAr: titleAr,
    seoTitleEn: titleEn,
    seoTitleAr: titleAr,
    seoDescEn: 'Draft article description',
    seoDescAr: 'وصف مبدئي للمقال',
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    author: 'CMS Editor',
  };
}

function createDraftPracticeArea(titleEn: string, titleAr: string, slug: string): PracticeArea {
  const now = nowIso();
  return {
    id: slug.replace(/^\//, ''),
    slug,
    status: 'draft',
    order: 0,
    titleEn,
    titleAr,
    categoryEn: 'Advisory',
    categoryAr: 'استشارات',
    shortDescEn: 'Draft practice area description',
    shortDescAr: 'وصف مبدئي لمجال الممارسة',
    coverImageUrl: '',
    coverAltEn: titleEn,
    coverAltAr: titleAr,
    iconName: 'Scale',
    about: {
      bodyEn: 'Draft practice area about text',
      bodyAr: 'محتوى مبدئي لمجال الممارسة',
    },
    features: [
      { id: `${slug}-feature-1`, titleEn: 'Draft feature', titleAr: 'ميزة مبدئية', descriptionEn: 'Draft description', descriptionAr: 'وصف مبدئي', icon: 'CheckCircle' },
    ],
    steps: [
      { id: `${slug}-step-1`, number: 1, titleEn: 'Draft step', titleAr: 'خطوة مبدئية', descriptionEn: 'Draft step description', descriptionAr: 'وصف مبدئي للخطوة' },
    ],
    useCases: [
      { id: `${slug}-usecase-1`, titleEn: 'Draft use case', titleAr: 'حالة مبدئية', summaryEn: 'Draft use case summary', summaryAr: 'ملخص مبدئي', industryEn: 'General', industryAr: 'عام' },
    ],
    faqs: [
      { id: `${slug}-faq-1`, questionEn: 'Draft question?', questionAr: 'سؤال مبدئي؟', answerEn: 'Draft answer.', answerAr: 'إجابة مبدئية.' },
    ],
    seoTitleEn: titleEn,
    seoTitleAr: titleAr,
    seoDescEn: 'Draft practice area description',
    seoDescAr: 'وصف مبدئي لمجال الممارسة',
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    author: 'CMS Editor',
  };
}

export const backendApi = {
  authLogin: (username: string, password: string) =>
    requestJson<{ ok: true }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  authLogout: () =>
    requestJson<{ ok: true }>('/api/auth/logout', {
      method: 'POST',
    }),
  authMe: () =>
    requestJson<{ authenticated: boolean; username?: string }>('/api/auth/me'),
  getContent: () =>
    requestJson<SiteContent>('/api/content'),

  listArticles: async (): Promise<Article[]> => {
    const response = await requestJson<BackendArticle[]>('/api/admin/articles');
    return response.map(mapArticle);
  },
  createArticle: async (draft: Article): Promise<Article> => {
    await requestJson('/api/admin/articles', {
      method: 'POST',
      body: JSON.stringify(articleToPayload(draft)),
    });
    const articles = await requestJson<BackendArticle[]>('/api/admin/articles');
    return mapArticle(articles.find((item) => item.slug === draft.slug) || articles[0] || {
      id: draft.id,
      slug: draft.slug,
      titleAr: draft.titleAr,
      titleEn: draft.titleEn,
      excerptAr: draft.excerptAr,
      excerptEn: draft.excerptEn,
      categoryAr: draft.categoryAr,
      categoryEn: draft.categoryEn,
      authorAr: draft.authorAr,
      authorEn: draft.authorEn,
      date: draft.createdAt.slice(0, 10),
      readTimeAr: draft.readTimeAr,
      readTimeEn: draft.readTimeEn,
      image: draft.coverImageUrl,
      bodyAr: draft.bodyAr,
      bodyEn: draft.bodyEn,
      published: false,
      order: 0,
    });
  },
  saveArticle: async (article: Article): Promise<Article> => {
    await requestJson(`/api/admin/articles/${encodeURIComponent(article.slug)}`, {
      method: 'PUT',
      body: JSON.stringify(articleToPayload(article)),
    });
    const articles = await requestJson<BackendArticle[]>('/api/admin/articles');
    return mapArticle(articles.find((item) => item.slug === article.slug) || articles[0]);
  },
  deleteArticle: async (slug: string) => {
    await requestJson(`/api/admin/articles/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });
    return { ok: true as const };
  },
  duplicateArticle: async (article: Article): Promise<Article> => {
    const duplicateSlug = `${article.slug}-copy`;
    const duplicate = { ...article, id: duplicateSlug.replace(/^\//, ''), slug: duplicateSlug, status: 'draft' as ArticleStatus };
    return backendApi.createArticle(duplicate);
  },

  listPracticeAreas: async (): Promise<PracticeArea[]> => {
    const response = await requestJson<BackendPracticeArea[]>('/api/admin/practice-areas');
    return response.map(mapPracticeArea);
  },
  createPracticeArea: async (draft: PracticeArea): Promise<PracticeArea> => {
    await requestJson('/api/admin/practice-areas', {
      method: 'POST',
      body: JSON.stringify(practiceAreaToPayload(draft)),
    });
    const areas = await requestJson<BackendPracticeArea[]>('/api/admin/practice-areas');
    return mapPracticeArea(areas.find((item) => item.slug === draft.slug) || areas[0] || {
      id: draft.id,
      slug: draft.slug,
      categorySlug: draft.iconName,
      titleAr: draft.titleAr,
      titleEn: draft.titleEn,
      categoryAr: draft.categoryAr,
      categoryEn: draft.categoryEn,
      shortDescAr: draft.shortDescAr,
      shortDescEn: draft.shortDescEn,
      aboutAr: [draft.about.bodyAr],
      aboutEn: [draft.about.bodyEn],
      features: draft.features.map((item) => ({ ar: item.titleAr, en: item.titleEn, descAr: item.descriptionAr, descEn: item.descriptionEn })),
      processSteps: draft.steps.map((item) => ({ ar: item.titleAr, en: item.titleEn, descAr: item.descriptionAr, descEn: item.descriptionEn })),
      useCases: draft.useCases.map((item) => ({ ar: item.titleAr, en: item.titleEn })),
      faq: draft.faqs.map((item) => ({ qAr: item.questionAr, qEn: item.questionEn, aAr: item.answerAr, aEn: item.answerEn })),
      imageUrl: draft.coverImageUrl || null,
      published: false,
      order: 0,
    });
  },
  savePracticeArea: async (practiceArea: PracticeArea): Promise<PracticeArea> => {
    await requestJson(`/api/admin/practice-areas/${encodeURIComponent(practiceArea.slug)}`, {
      method: 'PUT',
      body: JSON.stringify(practiceAreaToPayload(practiceArea)),
    });
    const areas = await requestJson<BackendPracticeArea[]>('/api/admin/practice-areas');
    return mapPracticeArea(areas.find((item) => item.slug === practiceArea.slug) || areas[0]);
  },
  deletePracticeArea: async (slug: string) => {
    await requestJson(`/api/admin/practice-areas/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });
    return { ok: true as const };
  },
  duplicatePracticeArea: async (practiceArea: PracticeArea): Promise<PracticeArea> => {
    const duplicateSlug = `${practiceArea.slug}-copy`;
    const duplicate = { ...practiceArea, id: duplicateSlug.replace(/^\//, ''), slug: duplicateSlug, status: 'draft' as PracticeAreaStatus };
    return backendApi.createPracticeArea(duplicate);
  },
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
  listConsultations: async (): Promise<ApiConsultationRequest[]> => {
    const response = await requestJson<BackendConsultation[]>('/api/admin/consultations');
    return response.map(mapConsultation);
  },
  getConsultation: async (id: string): Promise<ApiConsultationRequest> => {
    const response = await requestJson<BackendConsultation>(`/api/admin/consultations/${encodeURIComponent(id)}`);
    return mapConsultation(response);
  },
  updateConsultation: async (id: string, patch: Partial<Pick<ApiConsultationRequest, 'status' | 'adminNotes'>>): Promise<ApiConsultationRequest> => {
    const response = await requestJson<BackendConsultation>(`/api/admin/consultations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return mapConsultation(response);
  },
  listDoctorShieldRequests: async (): Promise<ApiDoctorShieldRequest[]> => {
    const response = await requestJson<BackendDoctorShieldRequest[]>('/api/admin/doctor-shield-requests');
    return response.map(mapDoctorShieldRequest);
  },
  getDoctorShieldRequest: async (id: string): Promise<ApiDoctorShieldRequest> => {
    const response = await requestJson<BackendDoctorShieldRequest>(`/api/admin/doctor-shield-requests/${encodeURIComponent(id)}`);
    return mapDoctorShieldRequest(response);
  },
  updateDoctorShieldRequest: async (id: string, patch: Partial<Pick<ApiDoctorShieldRequest, 'status' | 'adminNotes'>>): Promise<ApiDoctorShieldRequest> => {
    const response = await requestJson<BackendDoctorShieldRequest>(`/api/admin/doctor-shield-requests/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return mapDoctorShieldRequest(response);
  },

  listPages: async (): Promise<ApiPage[]> => {
    const response = await requestJson<BackendPage[]>('/api/admin/pages');
    return response.map(mapPage);
  },
  createPage: async (page: Pick<ApiPage, 'titleEn' | 'titleAr' | 'slug'> & Partial<ApiPage>): Promise<ApiPage> => {
    const payload = {
      ...page,
      blocksCount: (page as Partial<ApiPage> & { blocksCount?: number }).blocksCount ?? page.blocks?.length ?? 0,
    };
    await requestJson('/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const pages = await requestJson<BackendPage[]>('/api/admin/pages');
    const match = pages.find((item) => item.slug === page.slug) || pages[0];
    return mapPage(match);
  },
  savePage: async (page: ApiPage): Promise<ApiPage> => {
    const payload = {
      ...page,
      blocksCount: page.blocks.length,
    };
    await requestJson(`/api/admin/pages/${encodeURIComponent(page.slug)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const pages = await requestJson<BackendPage[]>('/api/admin/pages');
    const match = pages.find((item) => item.slug === page.slug) || pages[0];
    return mapPage(match);
  },
  deletePage: async (slug: string) => {
    await requestJson(`/api/admin/pages/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });
    return { ok: true as const };
  },
  duplicatePage: async (page: ApiPage): Promise<ApiPage> => {
    const duplicateSlug = `${page.slug}-copy`;
    return backendApi.createPage({
      titleEn: `${page.titleEn} (Copy)`,
      titleAr: `${page.titleAr} (نسخة)`,
      slug: duplicateSlug,
      status: 'draft',
      navVisible: false,
      blocksCount: page.blocks.length,
      seoTitleEn: page.seoTitleEn,
      seoTitleAr: page.seoTitleAr,
      seoDescEn: page.seoDescEn,
      seoDescAr: page.seoDescAr,
    });
  },
  listNavigation: async (): Promise<ApiNavItem[]> => {
    const response = await requestJson<BackendNavItem[]>('/api/admin/navigation');
    return response.map((item) => ({
      id: item.id,
      pageId: item.pageId,
      labelEn: item.labelEn,
      labelAr: item.labelAr,
      url: item.url,
      desktopVisible: item.desktopVisible,
      mobileVisible: item.mobileVisible,
      order: item.order,
    }));
  },
  saveNavigation: async (items: ApiNavItem[]): Promise<ApiNavItem[]> => {
    const response = await requestJson<BackendNavItem[]>('/api/admin/navigation', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
    return response.map((item) => ({
      id: item.id,
      pageId: item.pageId,
      labelEn: item.labelEn,
      labelAr: item.labelAr,
      url: item.url,
      desktopVisible: item.desktopVisible,
      mobileVisible: item.mobileVisible,
      order: item.order,
    }));
  },
  listAssets: async (): Promise<ApiAsset[]> => {
    const response = await requestJson<BackendAsset[]>('/api/admin/assets');
    return response.map(mapAsset);
  },
  uploadAsset: async (file: File, altEn = '', altAr = ''): Promise<ApiAsset> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('altEn', altEn);
    formData.append('altAr', altAr);
    const response = await requestForm<{ asset: BackendAsset }>('/api/admin/uploads', formData);
    return mapAsset(response.asset);
  },
  saveAsset: async (id: string, patch: Partial<Pick<ApiAsset, 'altEn' | 'altAr' | 'filename'>>): Promise<ApiAsset> => {
    const response = await requestJson<BackendAsset>(`/api/admin/assets/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    });
    return mapAsset(response);
  },
  deleteAsset: async (id: string) => {
    await requestJson(`/api/admin/assets/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return { ok: true as const };
  },
  listRevisions: async (slug: string): Promise<ApiRevision[]> => {
    const response = await requestJson<BackendRevision[]>(`/api/admin/pages/${encodeURIComponent(slug)}/revisions`);
    return response.map(mapRevision);
  },
  saveRevision: async (
    slug: string,
    revision: Pick<ApiRevision, 'label' | 'status' | 'blocks' | 'author' | 'note'> & Partial<Pick<ApiRevision, 'id'>>,
  ): Promise<ApiRevision> => {
    const response = await requestJson<BackendRevision>(`/api/admin/pages/${encodeURIComponent(slug)}/revisions`, {
      method: 'POST',
      body: JSON.stringify(revision),
    });
    return mapRevision(response);
  },
  restoreRevision: async (slug: string, revisionId: string): Promise<ApiRevision> => {
    const response = await requestJson<BackendRevision>(`/api/admin/pages/${encodeURIComponent(slug)}/revisions/${encodeURIComponent(revisionId)}/restore`, {
      method: 'POST',
    });
    return mapRevision(response);
  },
};
