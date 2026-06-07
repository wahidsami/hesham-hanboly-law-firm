import type { ArticleRecord, CMSPublishedPageRecord, HeroSlideRecord, PracticeAreaRecord, SiteContent, SiteSettingsRecord } from '../types';

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
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || `Request failed: ${response.status}`);
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
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || `Request failed: ${response.status}`);
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
};
