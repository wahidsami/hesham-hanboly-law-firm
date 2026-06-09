import fs from 'node:fs/promises';
import path from 'node:path';
import type { Asset, Article, HeroSlide, PracticeArea } from '@prisma/client';
import { prisma } from './db';
import { slugify } from './utils/slugify';
import type {
  ArticleRecord,
  CMSPageRecord,
  CMSRevisionRecord,
  NavItemRecord,
  HeroSlideRecord,
  LocalizedText,
  PracticeAreaFaq,
  PracticeAreaFeature,
  PracticeAreaRecord,
  PracticeAreaStep,
  SiteSettingsRecord,
  SiteContent,
} from '../../src/types';

const normalizePublicAssetPath = (value?: string | null) => {
  if (typeof value !== 'string') {
    return value || '';
  }

  return value.startsWith('/src/assets/images/')
    ? value.replace('/src/assets/images/', '/images/')
    : value;
};

const normalizeBlockAssetPaths = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return normalizePublicAssetPath(value);
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

type ArticleInput = Partial<ArticleRecord> & { image?: string; imageUrl?: string; originalSlug?: string };
type PracticeAreaInput = Partial<PracticeAreaRecord> & { imageUrl?: string | null; originalSlug?: string };
type CmsPageInput = Partial<CMSPageRecord>;
type NavItemInput = Partial<NavItemRecord>;
type HeroSlideInput = Partial<HeroSlideRecord>;
type CmsRevisionInput = Partial<CMSRevisionRecord> & { blocks?: unknown[] };
type SiteSettingsRow = {
  id: string;
  logoImageUrl: string | null;
  logoImageAltAr: string | null;
  logoImageAltEn: string | null;
  footerLogoImageUrl: string | null;
  footerLogoImageAltAr: string | null;
  footerLogoImageAltEn: string | null;
  navbarCtaAr: string | null;
  navbarCtaEn: string | null;
  doctorShieldBadgeAr: string | null;
  doctorShieldBadgeEn: string | null;
  doctorShieldTitleAr: string | null;
  doctorShieldTitleEn: string | null;
  doctorShieldSubtitleAr: string | null;
  doctorShieldSubtitleEn: string | null;
  doctorShieldDescAr: string | null;
  doctorShieldDescEn: string | null;
  doctorShieldBullet1Ar: string | null;
  doctorShieldBullet1En: string | null;
  doctorShieldBullet2Ar: string | null;
  doctorShieldBullet2En: string | null;
  doctorShieldBullet3Ar: string | null;
  doctorShieldBullet3En: string | null;
  doctorShieldBullet4Ar: string | null;
  doctorShieldBullet4En: string | null;
  doctorShieldButtonAr: string | null;
  doctorShieldButtonEn: string | null;
  doctorShieldCircleTitleAr: string | null;
  doctorShieldCircleTitleEn: string | null;
  doctorShieldCirclePriceAr: string | null;
  doctorShieldCirclePriceEn: string | null;
  doctorShieldCircleNoteAr: string | null;
  doctorShieldCircleNoteEn: string | null;
  aboutSectionBadgeAr: string | null;
  aboutSectionBadgeEn: string | null;
  aboutSectionTitleAr: string | null;
  aboutSectionTitleEn: string | null;
  aboutSectionDescAr: string | null;
  aboutSectionDescEn: string | null;
  aboutSectionCardTitleAr: string | null;
  aboutSectionCardTitleEn: string | null;
  aboutSectionCardDescAr: string | null;
  aboutSectionCardDescEn: string | null;
  aboutSectionButtonAr: string | null;
  aboutSectionButtonEn: string | null;
  statisticsBadgeAr: string | null;
  statisticsBadgeEn: string | null;
  statisticsNumber: string | null;
  statisticsTitleAr: string | null;
  statisticsTitleEn: string | null;
  statisticsDescAr: string | null;
  statisticsDescEn: string | null;
  statisticsSupportAr: string | null;
  statisticsSupportEn: string | null;
  teamSectionBadgeAr: string | null;
  teamSectionBadgeEn: string | null;
  teamSectionTitleAr: string | null;
  teamSectionTitleEn: string | null;
  teamSectionDescAr: string | null;
  teamSectionDescEn: string | null;
  teamFounderBadgeAr: string | null;
  teamFounderBadgeEn: string | null;
  teamFounderNameAr: string | null;
  teamFounderNameEn: string | null;
  teamFounderRoleAr: string | null;
  teamFounderRoleEn: string | null;
  teamFounderIntroAr: string | null;
  teamFounderIntroEn: string | null;
  teamFounderImageUrl: string | null;
  teamFounderImageAltAr: string | null;
  teamFounderImageAltEn: string | null;
  teamSectionCtaAr: string | null;
  teamSectionCtaEn: string | null;
  contactSectionBadgeAr: string | null;
  contactSectionBadgeEn: string | null;
  contactSectionTitleAr: string | null;
  contactSectionTitleEn: string | null;
  contactSectionDescAr: string | null;
  contactSectionDescEn: string | null;
  contactSectionOfficeTitleAr: string | null;
  contactSectionOfficeTitleEn: string | null;
  contactSectionAddressHeadAr: string | null;
  contactSectionAddressHeadEn: string | null;
  contactSectionPhoneLabelAr: string | null;
  contactSectionPhoneLabelEn: string | null;
  contactSectionEmailLabelAr: string | null;
  contactSectionEmailLabelEn: string | null;
  contactSectionSecurityAr: string | null;
  contactSectionSecurityEn: string | null;
  contactSectionFormTitleAr: string | null;
  contactSectionFormTitleEn: string | null;
  contactSectionFormDescAr: string | null;
  contactSectionFormDescEn: string | null;
  aboutHeroBadgeAr: string | null;
  aboutHeroBadgeEn: string | null;
  aboutHeroTitleAr: string | null;
  aboutHeroTitleEn: string | null;
  aboutHeroDescAr: string | null;
  aboutHeroDescEn: string | null;
  teamHeroBadgeAr: string | null;
  teamHeroBadgeEn: string | null;
  teamHeroTitleAr: string | null;
  teamHeroTitleEn: string | null;
  teamHeroDescAr: string | null;
  teamHeroDescEn: string | null;
  contactHeroBadgeAr: string | null;
  contactHeroBadgeEn: string | null;
  contactHeroTitleAr: string | null;
  contactHeroTitleEn: string | null;
  contactHeroDescAr: string | null;
  contactHeroDescEn: string | null;
  footerDescriptionAr: string | null;
  footerDescriptionEn: string | null;
  addressAr: string | null;
  addressEn: string | null;
  email: string | null;
  phone: string | null;
  copyrightAr: string | null;
  copyrightEn: string | null;
  footerBadgeAr: string | null;
  footerBadgeEn: string | null;
};
type MediaAssetRecord = {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  type: 'image' | 'document' | 'video';
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altEn: string;
  altAr: string;
  uploadedAt: string;
  uploadedBy: string;
  usedInPages: string[];
};
type ConsultationAttachmentRecord = {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  kind: 'image' | 'document' | 'audio';
};
type ConsultationRequestRecord = {
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
  attachments: ConsultationAttachmentRecord[];
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
};

const collectReferencedUrls = (value: unknown, urls: Set<string>) => {
  if (!value) {
    return;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed && /^(\/uploads\/|https?:\/\/|\/src\/assets\/)/.test(trimmed)) {
      urls.add(trimmed);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectReferencedUrls(item, urls));
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
      if (typeof entry === 'string') {
        const trimmed = entry.trim();
        if (trimmed && (key === 'imageUrl' || key === 'image' || key === 'url' || key === 'thumbnailUrl' || key.endsWith('ImageUrl'))) {
          urls.add(trimmed);
        }
        return;
      }

      collectReferencedUrls(entry, urls);
    });
  }
};

const requireText = (value: unknown, fieldName: string) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} is required in both languages.`);
  }
  return value.trim();
};

const requireArray = <T>(value: unknown, fieldName: string): T[] => {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array.`);
  }
  return value as T[];
};

const validateTextArray = (value: unknown, fieldName: string) =>
  requireArray<unknown>(value, fieldName).map((item, index) => requireText(item, `${fieldName}[${index}]`));

const requireLocalizedObject = (value: unknown, fieldName: string) => {
  if (!value || typeof value !== 'object') {
    throw new Error(`${fieldName} must be an object.`);
  }
  return value as Record<string, unknown>;
};

export const articleToRecord = (article: Article): ArticleRecord => ({
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
  date: article.date,
  readTimeAr: article.readTimeAr,
  readTimeEn: article.readTimeEn,
  image: normalizePublicAssetPath(article.imageUrl),
  bodyAr: article.bodyAr,
  bodyEn: article.bodyEn,
  published: article.published,
  order: article.order,
});

export const practiceAreaToRecord = (practiceArea: PracticeArea): PracticeAreaRecord => ({
  id: practiceArea.id,
  slug: practiceArea.slug,
  categorySlug: practiceArea.categorySlug as PracticeAreaRecord['categorySlug'],
  titleAr: practiceArea.titleAr,
  titleEn: practiceArea.titleEn,
  categoryAr: practiceArea.categoryAr,
  categoryEn: practiceArea.categoryEn,
  shortDescAr: practiceArea.shortDescAr,
  shortDescEn: practiceArea.shortDescEn,
  aboutAr: practiceArea.aboutAr as string[],
  aboutEn: practiceArea.aboutEn as string[],
  features: practiceArea.features as PracticeAreaFeature[],
  processSteps: practiceArea.processSteps as PracticeAreaStep[],
  useCases: practiceArea.useCases as LocalizedText[],
  faq: practiceArea.faq as PracticeAreaFaq[],
  imageUrl: normalizePublicAssetPath(practiceArea.imageUrl) || undefined,
  published: practiceArea.published,
  order: practiceArea.order,
});

export const cmsPageToRecord = (page: { id: string; titleAr: string; titleEn: string; slug: string; status: string; navVisible: boolean; blocksCount: number; author: string; createdAt: Date; updatedAt: Date }): CMSPageRecord => ({
  id: page.id,
  titleAr: page.titleAr,
  titleEn: page.titleEn,
  slug: page.slug,
  status: (page.slug.replace(/^\/+/, '').toLowerCase() === 'team'
    ? 'published'
    : (page.status as CMSPageRecord['status']) || 'draft'),
  navVisible: page.navVisible,
  blocksCount: page.blocksCount,
  author: page.author,
  createdAt: page.createdAt.toISOString(),
  updatedAt: page.updatedAt.toISOString(),
});

export const navItemToRecord = (navItem: { id: string; pageId: string; labelAr: string; labelEn: string; url: string; desktopVisible: boolean; mobileVisible: boolean; order: number; }): NavItemRecord => ({
  id: navItem.id,
  pageId: navItem.pageId,
  labelAr: navItem.labelAr,
  labelEn: navItem.labelEn,
  url: navItem.url,
  desktopVisible: navItem.desktopVisible,
  mobileVisible: navItem.mobileVisible,
  order: navItem.order,
});

export const cmsRevisionToRecord = (revision: {
  id: string;
  pageId: string;
  label: string;
  status: string;
  blocks: unknown;
  author: string;
  note: string;
  createdAt: Date;
}): CMSRevisionRecord => ({
  id: revision.id,
  pageId: revision.pageId,
  label: revision.label,
  status: (revision.status as CMSRevisionRecord['status']) || 'draft',
  blocks: Array.isArray(revision.blocks) ? (revision.blocks.map((block) => normalizeBlockAssetPaths(block)) as unknown[]) : [],
  createdAt: revision.createdAt.toISOString(),
  author: revision.author,
  note: revision.note,
});

export const mediaAssetToRecord = (asset: Asset, usedInPages: string[] = []): MediaAssetRecord => ({
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
  uploadedAt: asset.createdAt.toISOString(),
  uploadedBy: 'CMS Editor',
  usedInPages,
});

const consultationRowToRecord = (row: Record<string, unknown>): ConsultationRequestRecord => ({
  id: String(row.id || ''),
  fullName: String(row.fullName || ''),
  phone: String(row.phone || ''),
  email: String(row.email || ''),
  idNumber: String(row.idNumber || ''),
  message: String(row.message || ''),
  status: (String(row.status || 'new') as ConsultationRequestRecord['status']),
  paymentStatus: (String(row.paymentStatus || 'pending') as ConsultationRequestRecord['paymentStatus']),
  paymentAmount: String(row.paymentAmount || '80.00 SAR'),
  voucherId: String(row.voucherId || ''),
  cardBrand: String(row.cardBrand || 'card'),
  cardLast4: String(row.cardLast4 || ''),
  recordingUrl: typeof row.recordingUrl === 'string' ? row.recordingUrl : null,
  recordingName: typeof row.recordingName === 'string' ? row.recordingName : null,
  recordingMimeType: typeof row.recordingMimeType === 'string' ? row.recordingMimeType : null,
  recordingSize: typeof row.recordingSize === 'number' ? row.recordingSize : null,
  attachments: Array.isArray(row.attachments)
    ? (row.attachments as ConsultationAttachmentRecord[])
    : [],
  adminNotes: String(row.adminNotes || ''),
  createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt || new Date().toISOString()),
  updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt || new Date().toISOString()),
});

export const heroSlideToRecord = (heroSlide: HeroSlide): HeroSlideRecord => ({
  id: heroSlide.id,
  badgeAr: heroSlide.badgeAr,
  badgeEn: heroSlide.badgeEn,
  badgeIcon: heroSlide.badgeIcon,
  titleArLine1: heroSlide.titleArLine1,
  titleEnLine1: heroSlide.titleEnLine1,
  titleArLine2: heroSlide.titleArLine2,
  titleEnLine2: heroSlide.titleEnLine2,
  descriptionAr: heroSlide.descriptionAr,
  descriptionEn: heroSlide.descriptionEn,
  ctaTextAr: heroSlide.ctaTextAr,
  ctaTextEn: heroSlide.ctaTextEn,
  actionType: heroSlide.actionType as HeroSlideRecord['actionType'],
  actionParam: heroSlide.actionParam || undefined,
  image: heroSlide.image,
  imageAltAr: heroSlide.imageAltAr,
  imageAltEn: heroSlide.imageAltEn,
  highlightBox: heroSlide.highlightBox ? (heroSlide.highlightBox as HeroSlideRecord['highlightBox']) : undefined,
});

export const siteSettingsToRecord = (siteSettings: {
  id: string;
  logoImageUrl?: string | null;
  logoImageAltAr?: string | null;
  logoImageAltEn?: string | null;
  footerLogoImageUrl?: string | null;
  footerLogoImageAltAr?: string | null;
  footerLogoImageAltEn?: string | null;
  navbarCtaAr: string;
  navbarCtaEn: string;
  doctorShieldBadgeAr: string;
  doctorShieldBadgeEn: string;
  doctorShieldTitleAr: string;
  doctorShieldTitleEn: string;
  doctorShieldSubtitleAr: string;
  doctorShieldSubtitleEn: string;
  doctorShieldDescAr: string;
  doctorShieldDescEn: string;
  doctorShieldBullet1Ar: string;
  doctorShieldBullet1En: string;
  doctorShieldBullet2Ar: string;
  doctorShieldBullet2En: string;
  doctorShieldBullet3Ar: string;
  doctorShieldBullet3En: string;
  doctorShieldBullet4Ar: string;
  doctorShieldBullet4En: string;
  doctorShieldButtonAr: string;
  doctorShieldButtonEn: string;
  doctorShieldCircleTitleAr: string;
  doctorShieldCircleTitleEn: string;
  doctorShieldCirclePriceAr: string;
  doctorShieldCirclePriceEn: string;
  doctorShieldCircleNoteAr: string;
  doctorShieldCircleNoteEn: string;
  aboutSectionBadgeAr: string;
  aboutSectionBadgeEn: string;
  aboutSectionTitleAr: string;
  aboutSectionTitleEn: string;
  aboutSectionDescAr: string;
  aboutSectionDescEn: string;
  aboutSectionCardTitleAr: string;
  aboutSectionCardTitleEn: string;
  aboutSectionCardDescAr: string;
  aboutSectionCardDescEn: string;
  aboutSectionButtonAr: string;
  aboutSectionButtonEn: string;
  statisticsBadgeAr: string;
  statisticsBadgeEn: string;
  statisticsNumber: string;
  statisticsTitleAr: string;
  statisticsTitleEn: string;
  statisticsDescAr: string;
  statisticsDescEn: string;
  statisticsSupportAr: string;
  statisticsSupportEn: string;
  teamSectionBadgeAr: string;
  teamSectionBadgeEn: string;
  teamSectionTitleAr: string;
  teamSectionTitleEn: string;
  teamSectionDescAr: string;
  teamSectionDescEn: string;
  teamFounderBadgeAr: string;
  teamFounderBadgeEn: string;
  teamFounderNameAr: string;
  teamFounderNameEn: string;
  teamFounderRoleAr: string;
  teamFounderRoleEn: string;
  teamFounderIntroAr: string;
  teamFounderIntroEn: string;
  teamFounderImageUrl: string;
  teamFounderImageAltAr: string;
  teamFounderImageAltEn: string;
  teamSectionCtaAr: string;
  teamSectionCtaEn: string;
  contactSectionBadgeAr: string;
  contactSectionBadgeEn: string;
  contactSectionTitleAr: string;
  contactSectionTitleEn: string;
  contactSectionDescAr: string;
  contactSectionDescEn: string;
  contactSectionOfficeTitleAr: string;
  contactSectionOfficeTitleEn: string;
  contactSectionAddressHeadAr: string;
  contactSectionAddressHeadEn: string;
  contactSectionPhoneLabelAr: string;
  contactSectionPhoneLabelEn: string;
  contactSectionEmailLabelAr: string;
  contactSectionEmailLabelEn: string;
  contactSectionSecurityAr: string;
  contactSectionSecurityEn: string;
  contactSectionFormTitleAr: string;
  contactSectionFormTitleEn: string;
  contactSectionFormDescAr: string;
  contactSectionFormDescEn: string;
  aboutHeroBadgeAr: string;
  aboutHeroBadgeEn: string;
  aboutHeroTitleAr: string;
  aboutHeroTitleEn: string;
  aboutHeroDescAr: string;
  aboutHeroDescEn: string;
  teamHeroBadgeAr: string;
  teamHeroBadgeEn: string;
  teamHeroTitleAr: string;
  teamHeroTitleEn: string;
  teamHeroDescAr: string;
  teamHeroDescEn: string;
  contactHeroBadgeAr: string;
  contactHeroBadgeEn: string;
  contactHeroTitleAr: string;
  contactHeroTitleEn: string;
  contactHeroDescAr: string;
  contactHeroDescEn: string;
  footerDescriptionAr: string;
  footerDescriptionEn: string;
  addressAr: string;
  addressEn: string;
  email: string;
  phone: string;
  copyrightAr: string;
  copyrightEn: string;
  footerBadgeAr: string;
  footerBadgeEn: string;
}): SiteSettingsRecord => ({
  id: siteSettings.id,
  logoImageUrl: normalizePublicAssetPath(siteSettings.logoImageUrl) || '',
  logoImageAltAr: siteSettings.logoImageAltAr || 'شعار شركة هشام حسن حنبولي الدولية',
  logoImageAltEn: siteSettings.logoImageAltEn || 'Hesham H. Hanboly International logo',
  footerLogoImageUrl: normalizePublicAssetPath(siteSettings.footerLogoImageUrl) || '',
  footerLogoImageAltAr: siteSettings.footerLogoImageAltAr || 'شعار التذييل لشركة هشام حسن حنبولي الدولية',
  footerLogoImageAltEn: siteSettings.footerLogoImageAltEn || 'Hesham H. Hanboly International footer logo',
  navbarCtaAr: siteSettings.navbarCtaAr,
  navbarCtaEn: siteSettings.navbarCtaEn,
  doctorShieldBadgeAr: siteSettings.doctorShieldBadgeAr,
  doctorShieldBadgeEn: siteSettings.doctorShieldBadgeEn,
  doctorShieldTitleAr: siteSettings.doctorShieldTitleAr,
  doctorShieldTitleEn: siteSettings.doctorShieldTitleEn,
  doctorShieldSubtitleAr: siteSettings.doctorShieldSubtitleAr,
  doctorShieldSubtitleEn: siteSettings.doctorShieldSubtitleEn,
  doctorShieldDescAr: siteSettings.doctorShieldDescAr,
  doctorShieldDescEn: siteSettings.doctorShieldDescEn,
  doctorShieldBullet1Ar: siteSettings.doctorShieldBullet1Ar,
  doctorShieldBullet1En: siteSettings.doctorShieldBullet1En,
  doctorShieldBullet2Ar: siteSettings.doctorShieldBullet2Ar,
  doctorShieldBullet2En: siteSettings.doctorShieldBullet2En,
  doctorShieldBullet3Ar: siteSettings.doctorShieldBullet3Ar,
  doctorShieldBullet3En: siteSettings.doctorShieldBullet3En,
  doctorShieldBullet4Ar: siteSettings.doctorShieldBullet4Ar,
  doctorShieldBullet4En: siteSettings.doctorShieldBullet4En,
  doctorShieldButtonAr: siteSettings.doctorShieldButtonAr,
  doctorShieldButtonEn: siteSettings.doctorShieldButtonEn,
  doctorShieldCircleTitleAr: siteSettings.doctorShieldCircleTitleAr,
  doctorShieldCircleTitleEn: siteSettings.doctorShieldCircleTitleEn,
  doctorShieldCirclePriceAr: siteSettings.doctorShieldCirclePriceAr,
  doctorShieldCirclePriceEn: siteSettings.doctorShieldCirclePriceEn,
  doctorShieldCircleNoteAr: siteSettings.doctorShieldCircleNoteAr,
  doctorShieldCircleNoteEn: siteSettings.doctorShieldCircleNoteEn,
  aboutSectionBadgeAr: siteSettings.aboutSectionBadgeAr,
  aboutSectionBadgeEn: siteSettings.aboutSectionBadgeEn,
  aboutSectionTitleAr: siteSettings.aboutSectionTitleAr,
  aboutSectionTitleEn: siteSettings.aboutSectionTitleEn,
  aboutSectionDescAr: siteSettings.aboutSectionDescAr,
  aboutSectionDescEn: siteSettings.aboutSectionDescEn,
  aboutSectionCardTitleAr: siteSettings.aboutSectionCardTitleAr,
  aboutSectionCardTitleEn: siteSettings.aboutSectionCardTitleEn,
  aboutSectionCardDescAr: siteSettings.aboutSectionCardDescAr,
  aboutSectionCardDescEn: siteSettings.aboutSectionCardDescEn,
  aboutSectionButtonAr: siteSettings.aboutSectionButtonAr,
  aboutSectionButtonEn: siteSettings.aboutSectionButtonEn,
  statisticsBadgeAr: siteSettings.statisticsBadgeAr,
  statisticsBadgeEn: siteSettings.statisticsBadgeEn,
  statisticsNumber: siteSettings.statisticsNumber,
  statisticsTitleAr: siteSettings.statisticsTitleAr,
  statisticsTitleEn: siteSettings.statisticsTitleEn,
  statisticsDescAr: siteSettings.statisticsDescAr,
  statisticsDescEn: siteSettings.statisticsDescEn,
  statisticsSupportAr: siteSettings.statisticsSupportAr,
  statisticsSupportEn: siteSettings.statisticsSupportEn,
  teamSectionBadgeAr: siteSettings.teamSectionBadgeAr,
  teamSectionBadgeEn: siteSettings.teamSectionBadgeEn,
  teamSectionTitleAr: siteSettings.teamSectionTitleAr,
  teamSectionTitleEn: siteSettings.teamSectionTitleEn,
  teamSectionDescAr: siteSettings.teamSectionDescAr,
  teamSectionDescEn: siteSettings.teamSectionDescEn,
  teamFounderBadgeAr: siteSettings.teamFounderBadgeAr,
  teamFounderBadgeEn: siteSettings.teamFounderBadgeEn,
  teamFounderNameAr: siteSettings.teamFounderNameAr,
  teamFounderNameEn: siteSettings.teamFounderNameEn,
  teamFounderRoleAr: siteSettings.teamFounderRoleAr,
  teamFounderRoleEn: siteSettings.teamFounderRoleEn,
  teamFounderIntroAr: siteSettings.teamFounderIntroAr,
  teamFounderIntroEn: siteSettings.teamFounderIntroEn,
  teamFounderImageUrl: normalizePublicAssetPath(siteSettings.teamFounderImageUrl) || '/images/founder_hesham_hanboly_1780491593879.png',
  teamFounderImageAltAr: siteSettings.teamFounderImageAltAr || 'المحامي / هشام بن حسن حنبولي',
  teamFounderImageAltEn: siteSettings.teamFounderImageAltEn || 'Advocate / Hesham H. Hanboly',
  teamSectionCtaAr: siteSettings.teamSectionCtaAr,
  teamSectionCtaEn: siteSettings.teamSectionCtaEn,
  contactSectionBadgeAr: siteSettings.contactSectionBadgeAr,
  contactSectionBadgeEn: siteSettings.contactSectionBadgeEn,
  contactSectionTitleAr: siteSettings.contactSectionTitleAr,
  contactSectionTitleEn: siteSettings.contactSectionTitleEn,
  contactSectionDescAr: siteSettings.contactSectionDescAr,
  contactSectionDescEn: siteSettings.contactSectionDescEn,
  contactSectionOfficeTitleAr: siteSettings.contactSectionOfficeTitleAr,
  contactSectionOfficeTitleEn: siteSettings.contactSectionOfficeTitleEn,
  contactSectionAddressHeadAr: siteSettings.contactSectionAddressHeadAr,
  contactSectionAddressHeadEn: siteSettings.contactSectionAddressHeadEn,
  contactSectionPhoneLabelAr: siteSettings.contactSectionPhoneLabelAr,
  contactSectionPhoneLabelEn: siteSettings.contactSectionPhoneLabelEn,
  contactSectionEmailLabelAr: siteSettings.contactSectionEmailLabelAr,
  contactSectionEmailLabelEn: siteSettings.contactSectionEmailLabelEn,
  contactSectionSecurityAr: siteSettings.contactSectionSecurityAr,
  contactSectionSecurityEn: siteSettings.contactSectionSecurityEn,
  contactSectionFormTitleAr: siteSettings.contactSectionFormTitleAr,
  contactSectionFormTitleEn: siteSettings.contactSectionFormTitleEn,
  contactSectionFormDescAr: siteSettings.contactSectionFormDescAr,
  contactSectionFormDescEn: siteSettings.contactSectionFormDescEn,
  aboutHeroBadgeAr: siteSettings.aboutHeroBadgeAr,
  aboutHeroBadgeEn: siteSettings.aboutHeroBadgeEn,
  aboutHeroTitleAr: siteSettings.aboutHeroTitleAr,
  aboutHeroTitleEn: siteSettings.aboutHeroTitleEn,
  aboutHeroDescAr: siteSettings.aboutHeroDescAr,
  aboutHeroDescEn: siteSettings.aboutHeroDescEn,
  teamHeroBadgeAr: siteSettings.teamHeroBadgeAr,
  teamHeroBadgeEn: siteSettings.teamHeroBadgeEn,
  teamHeroTitleAr: siteSettings.teamHeroTitleAr,
  teamHeroTitleEn: siteSettings.teamHeroTitleEn,
  teamHeroDescAr: siteSettings.teamHeroDescAr,
  teamHeroDescEn: siteSettings.teamHeroDescEn,
  contactHeroBadgeAr: siteSettings.contactHeroBadgeAr,
  contactHeroBadgeEn: siteSettings.contactHeroBadgeEn,
  contactHeroTitleAr: siteSettings.contactHeroTitleAr,
  contactHeroTitleEn: siteSettings.contactHeroTitleEn,
  contactHeroDescAr: siteSettings.contactHeroDescAr,
  contactHeroDescEn: siteSettings.contactHeroDescEn,
  footerDescriptionAr: siteSettings.footerDescriptionAr,
  footerDescriptionEn: siteSettings.footerDescriptionEn,
  addressAr: siteSettings.addressAr,
  addressEn: siteSettings.addressEn,
  email: siteSettings.email,
  phone: siteSettings.phone,
  copyrightAr: siteSettings.copyrightAr,
  copyrightEn: siteSettings.copyrightEn,
  footerBadgeAr: siteSettings.footerBadgeAr,
  footerBadgeEn: siteSettings.footerBadgeEn,
});

export const loadSiteSettingsRow = async () => {
  const rows = await prisma.$queryRawUnsafe<SiteSettingsRow[]>(
    'SELECT * FROM "SiteSettings" ORDER BY "updatedAt" DESC LIMIT 1',
  );
  return rows[0] ?? null;
};

export const normalizeArticleInput = (input: ArticleInput): ArticleInput => {
  const titleAr = requireText(input.titleAr, 'titleAr');
  const titleEn = requireText(input.titleEn, 'titleEn');
  const slug = slugify(input.slug?.trim() || titleEn || titleAr);
  const published = Boolean(input.published);

  const requireOrEmpty = (value: unknown) =>
    typeof value === 'string' && value.trim().length > 0 ? value.trim() : '';

  return {
    ...input,
    slug,
    titleAr,
    titleEn,
    excerptAr: published ? requireText(input.excerptAr, 'excerptAr') : requireOrEmpty(input.excerptAr),
    excerptEn: published ? requireText(input.excerptEn, 'excerptEn') : requireOrEmpty(input.excerptEn),
    categoryAr: published ? requireText(input.categoryAr, 'categoryAr') : requireOrEmpty(input.categoryAr),
    categoryEn: published ? requireText(input.categoryEn, 'categoryEn') : requireOrEmpty(input.categoryEn),
    authorAr: published ? requireText(input.authorAr, 'authorAr') : requireOrEmpty(input.authorAr),
    authorEn: published ? requireText(input.authorEn, 'authorEn') : requireOrEmpty(input.authorEn),
    date: requireOrEmpty(input.date) || new Date().toISOString().slice(0, 10),
    readTimeAr: published ? requireText(input.readTimeAr, 'readTimeAr') : requireOrEmpty(input.readTimeAr),
    readTimeEn: published ? requireText(input.readTimeEn, 'readTimeEn') : requireOrEmpty(input.readTimeEn),
    bodyAr: published ? requireText(input.bodyAr, 'bodyAr') : requireOrEmpty(input.bodyAr),
    bodyEn: published ? requireText(input.bodyEn, 'bodyEn') : requireOrEmpty(input.bodyEn),
    imageUrl: published ? requireText(input.imageUrl || input.image, 'imageUrl') : requireOrEmpty(input.imageUrl || input.image),
    published,
    order: Number.isFinite(Number(input.order)) ? Number(input.order) : 0,
  };
};

const validateArrayOfLocalizedTexts = (value: unknown, fieldName: string) => {
  const items = requireArray<Record<string, unknown>>(value, fieldName);
  return items.map((item, index) => {
    const entry = requireLocalizedObject(item, `${fieldName}[${index}]`);
    const ar = requireText(entry.ar, `${fieldName}[${index}].ar`);
    const en = requireText(entry.en, `${fieldName}[${index}].en`);
    return { ar, en };
  });
};

const validatePairedParagraphs = (aboutAr: unknown, aboutEn: unknown) => {
  const arParagraphs = validateTextArray(aboutAr, 'aboutAr');
  const enParagraphs = validateTextArray(aboutEn, 'aboutEn');

  if (arParagraphs.length !== enParagraphs.length) {
    throw new Error('aboutAr and aboutEn must contain the same number of paragraphs.');
  }

  return { aboutAr: arParagraphs, aboutEn: enParagraphs };
};

const validateArrayOfTwoLangText = (value: unknown, fieldName: string) => {
  const items = requireArray<Record<string, unknown>>(value, fieldName);
  return items.map((item, index) => {
    const entry = requireLocalizedObject(item, `${fieldName}[${index}]`);
    return {
      ar: requireText(entry.ar, `${fieldName}[${index}].ar`),
      en: requireText(entry.en, `${fieldName}[${index}].en`),
      descAr: requireText(entry.descAr, `${fieldName}[${index}].descAr`),
      descEn: requireText(entry.descEn, `${fieldName}[${index}].descEn`),
    };
  });
};

const validateFaq = (value: unknown) => {
  const items = requireArray<Record<string, unknown>>(value, 'faq');
  return items.map((item, index) => {
    const entry = requireLocalizedObject(item, `faq[${index}]`);
    return {
      qAr: requireText(entry.qAr, `faq[${index}].qAr`),
      qEn: requireText(entry.qEn, `faq[${index}].qEn`),
      aAr: requireText(entry.aAr, `faq[${index}].aAr`),
      aEn: requireText(entry.aEn, `faq[${index}].aEn`),
    };
  });
};

export const normalizePracticeAreaInput = (input: PracticeAreaInput): PracticeAreaInput => {
  const titleAr = requireText(input.titleAr, 'titleAr');
  const titleEn = requireText(input.titleEn, 'titleEn');
  const slug = slugify(input.slug?.trim() || titleEn || titleAr);

  return {
    ...input,
    slug,
    categorySlug: (input.categorySlug || 'advisory') as PracticeAreaRecord['categorySlug'],
    titleAr,
    titleEn,
    categoryAr: requireText(input.categoryAr, 'categoryAr'),
    categoryEn: requireText(input.categoryEn, 'categoryEn'),
    shortDescAr: requireText(input.shortDescAr, 'shortDescAr'),
    shortDescEn: requireText(input.shortDescEn, 'shortDescEn'),
    ...validatePairedParagraphs(input.aboutAr, input.aboutEn),
    features: validateArrayOfTwoLangText(input.features, 'features'),
    processSteps: validateArrayOfTwoLangText(input.processSteps, 'processSteps'),
    useCases: validateArrayOfLocalizedTexts(input.useCases, 'useCases'),
    faq: validateFaq(input.faq),
    imageUrl: typeof input.imageUrl === 'string' && input.imageUrl.trim() ? input.imageUrl.trim() : null,
    published: Boolean(input.published),
    order: Number.isFinite(Number(input.order)) ? Number(input.order) : 0,
  };
};

export const normalizeCmsPageInput = (input: CmsPageInput): CmsPageInput => {
  const titleAr = requireText(input.titleAr, 'titleAr');
  const titleEn = requireText(input.titleEn, 'titleEn');
  const slug = slugify(input.slug?.trim() || titleEn || titleAr);
  return {
    ...input,
    titleAr,
    titleEn,
    slug,
    status: (input.status || 'draft') as CMSPageRecord['status'],
    navVisible: Boolean(input.navVisible),
    blocksCount: Number.isFinite(Number(input.blocksCount)) ? Number(input.blocksCount) : 0,
    author: typeof input.author === 'string' && input.author.trim() ? input.author.trim() : 'CMS Editor',
  };
};

export const toSiteContent = async (): Promise<SiteContent> => {
  const [heroSlides, articles, practiceAreas, siteSettings, cmsPages, navigationItems] = await Promise.all([
    prisma.heroSlide.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.article.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.practiceArea.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    }),
    loadSiteSettingsRow(),
    prisma.cmsPage.findMany({
      select: {
        id: true,
        status: true,
        navVisible: true,
      },
    }),
    prisma.navItem.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  const publicPageIds = new Set(
    cmsPages.filter((page) => page.status === 'published' && page.navVisible).map((page) => page.id),
  );

  return {
    heroSlides: heroSlides.map(heroSlideToRecord),
    articles: articles.map(articleToRecord),
    practiceAreas: practiceAreas.map(practiceAreaToRecord),
    navigation: navigationItems.filter((navItem) => publicPageIds.has(navItem.pageId)).map(navItemToRecord),
    siteSettings: siteSettings
      ? siteSettingsToRecord(siteSettings as unknown as Parameters<typeof siteSettingsToRecord>[0])
      : siteSettingsToRecord({
        id: 'main',
        logoImageUrl: '',
        logoImageAltAr: 'شعار شركة هشام حسن حنبولي الدولية',
        logoImageAltEn: 'Hesham H. Hanboly International logo',
        footerLogoImageUrl: '',
        footerLogoImageAltAr: 'شعار التذييل لشركة هشام حسن حنبولي الدولية',
        footerLogoImageAltEn: 'Hesham H. Hanboly International footer logo',
        navbarCtaAr: 'طلب استشارة',
        navbarCtaEn: 'Book Counsel',
        teamFounderImageUrl: '/images/founder_hesham_hanboly_1780491593879.png',
        teamFounderImageAltAr: 'المحامي / هشام بن حسن حنبولي',
        teamFounderImageAltEn: 'Advocate / Hesham H. Hanboly',
          aboutHeroBadgeAr: '',
          aboutHeroBadgeEn: '',
          aboutHeroTitleAr: '',
          aboutHeroTitleEn: '',
          aboutHeroDescAr: '',
          aboutHeroDescEn: '',
          teamHeroBadgeAr: '',
          teamHeroBadgeEn: '',
          teamHeroTitleAr: '',
          teamHeroTitleEn: '',
          teamHeroDescAr: '',
          teamHeroDescEn: '',
          contactHeroBadgeAr: '',
          contactHeroBadgeEn: '',
          contactHeroTitleAr: '',
          contactHeroTitleEn: '',
          contactHeroDescAr: '',
          contactHeroDescEn: '',
          footerDescriptionAr: '',
          footerDescriptionEn: '',
          addressAr: '',
          addressEn: '',
          email: '',
          phone: '',
          copyrightAr: '',
          copyrightEn: '',
          footerBadgeAr: '',
          footerBadgeEn: '',
        }),
  };
};

export const listHeroSlides = async () =>
  (await prisma.heroSlide.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })).map(heroSlideToRecord);

export const listArticles = async () =>
  (await prisma.article.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })).map(articleToRecord);

export const listPracticeAreas = async () =>
  (await prisma.practiceArea.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })).map(practiceAreaToRecord);

export const listPublishedArticles = async () =>
  (await prisma.article.findMany({
    where: { published: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })).map(articleToRecord);

export const listPublishedPracticeAreas = async () =>
  (await prisma.practiceArea.findMany({
    where: { published: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })).map(practiceAreaToRecord);

export const listCmsPages = async () =>
  (await prisma.cmsPage.findMany({
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
  })).map(cmsPageToRecord);

export const listNavigationItems = async () =>
  (await prisma.navItem.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })).map(navItemToRecord);

export const listCmsRevisions = async (pageId: string) =>
  (await prisma.cmsRevision.findMany({
    where: { pageId },
    orderBy: [{ createdAt: 'desc' }],
  })).map(cmsRevisionToRecord);

export const listMediaAssets = async () =>
  {
    const [assets, cmsPages, revisions, heroSlides, siteSettings] = await Promise.all([
      prisma.asset.findMany({
        orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
      }),
      prisma.cmsPage.findMany({
        select: {
          id: true,
          slug: true,
          titleAr: true,
          titleEn: true,
        },
      }),
      prisma.cmsRevision.findMany({
        orderBy: [{ createdAt: 'desc' }],
        select: {
          pageId: true,
          blocks: true,
        },
      }),
      prisma.heroSlide.findMany({
        select: {
          image: true,
        },
      }),
      prisma.siteSettings.findFirst({
        select: {
          teamFounderImageUrl: true,
        },
      }),
    ]);

    const usageByUrl = new Map<string, Set<string>>();
    const rememberUsage = (url: unknown, pageId: string) => {
      if (typeof url !== 'string') {
        return;
      }
      const trimmed = url.trim();
      if (!trimmed) {
        return;
      }
      const existing = usageByUrl.get(trimmed) || new Set<string>();
      existing.add(pageId);
      usageByUrl.set(trimmed, existing);
    };

    const latestBlocksByPage = new Map<string, unknown[]>();
    for (const revision of revisions) {
      if (!latestBlocksByPage.has(revision.pageId)) {
        latestBlocksByPage.set(revision.pageId, Array.isArray(revision.blocks) ? revision.blocks : []);
      }
    }

    for (const page of cmsPages) {
      const blocks = latestBlocksByPage.get(page.id) || [];
      const blockUrls = new Set<string>();
      blocks.forEach((block) => collectReferencedUrls(block, blockUrls));
      blockUrls.forEach((url) => rememberUsage(url, page.id));
    }

    heroSlides.forEach((slide, index) => {
      rememberUsage(slide.image, `hero-slide-${index + 1}`);
    });

    if (siteSettings?.logoImageUrl) {
      rememberUsage(siteSettings.logoImageUrl, 'site-settings-logo');
    }
    if (siteSettings?.footerLogoImageUrl) {
      rememberUsage(siteSettings.footerLogoImageUrl, 'site-settings-footer-logo');
    }
    if (siteSettings?.teamFounderImageUrl) {
      rememberUsage(siteSettings.teamFounderImageUrl, 'site-settings-team');
    }

    return assets.map((asset) => mediaAssetToRecord(asset, Array.from(usageByUrl.get(asset.url) || [])));
  };

export const saveCmsPage = async (originalSlug: string | undefined, body: unknown) => {
  const existing = originalSlug ? await prisma.cmsPage.findUnique({ where: { slug: originalSlug } }) : null;
  const hasBlocksCount = typeof body === 'object' && body !== null && Object.prototype.hasOwnProperty.call(body, 'blocksCount');
  const payload = normalizeCmsPageInput(body as CmsPageInput);
  const blocksCount = hasBlocksCount
    ? Number((body as { blocksCount?: unknown }).blocksCount || 0)
    : Number(existing?.blocksCount ?? 0);
  const normalizedSlug = String(payload.slug || '').replace(/^\/+/, '').toLowerCase();
  const forcedStatus = normalizedSlug === 'team' ? 'published' : String(payload.status || 'draft');

  if (existing) {
    const updated = await prisma.cmsPage.update({
      where: { id: existing.id },
      data: {
        titleAr: payload.titleAr!,
        titleEn: payload.titleEn!,
        slug: payload.slug!,
        status: forcedStatus,
        navVisible: Boolean(payload.navVisible),
        blocksCount,
        author: payload.author || 'CMS Editor',
      },
    });
    return cmsPageToRecord(updated);
  }

  const created = await prisma.cmsPage.create({
    data: {
      id: `page-${slugify(payload.slug || payload.titleEn || payload.titleAr)}`,
      titleAr: payload.titleAr!,
      titleEn: payload.titleEn!,
      slug: payload.slug!,
      status: forcedStatus,
      navVisible: Boolean(payload.navVisible),
      blocksCount,
      author: payload.author || 'CMS Editor',
    },
  });
  return cmsPageToRecord(created);
};

export const deleteCmsPage = async (slug: string) => {
  const page = await prisma.cmsPage.findUnique({ where: { slug } });
  if (!page) {
    return false;
  }
  await prisma.navItem.deleteMany({ where: { pageId: page.id } });
  await prisma.cmsPage.delete({ where: { id: page.id } });
  return true;
};

export const saveCmsRevision = async (pageId: string, body: unknown) => {
  const input = body as CmsRevisionInput;
  const normalizedBlocks = Array.isArray(input.blocks)
    ? input.blocks.map((block) => normalizeBlockAssetPaths(block))
    : [];
  const created = await prisma.cmsRevision.create({
    data: {
      id: typeof input.id === 'string' && input.id.trim() ? input.id.trim() : `rev-${Date.now()}`,
      pageId,
      label: typeof input.label === 'string' && input.label.trim() ? input.label.trim() : 'Manual snapshot',
      status: typeof input.status === 'string' ? input.status : 'draft',
      blocks: normalizedBlocks,
      author: typeof input.author === 'string' && input.author.trim() ? input.author.trim() : 'CMS Editor',
      note: typeof input.note === 'string' && input.note.trim() ? input.note.trim() : 'Manual snapshot',
    },
  });
  return cmsRevisionToRecord(created);
};

export const restoreCmsRevision = async (pageId: string, revisionId: string) => {
  const revision = await prisma.cmsRevision.findFirst({
    where: { id: revisionId, pageId },
  });
  if (!revision) {
    throw new Error('Revision not found.');
  }

  const restored = await prisma.cmsRevision.create({
    data: {
      id: `rev-${Date.now()}`,
      pageId,
      label: `Restored from ${revision.label}`,
      status: revision.status,
      blocks: revision.blocks,
      author: 'CMS Editor',
      note: `Restored from ${revision.label}`,
    },
  });

  return cmsRevisionToRecord(restored);
};

export const saveNavigationItems = async (items: NavItemInput[]) => {
  const normalized = items.map((item, index) => ({
    id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `nav-${Date.now()}-${index}`,
    pageId: String(item.pageId || '').trim(),
    labelAr: String(item.labelAr || '').trim(),
    labelEn: String(item.labelEn || '').trim(),
    url: String(item.url || '').trim(),
    desktopVisible: Boolean(item.desktopVisible),
    mobileVisible: Boolean(item.mobileVisible),
    order: Number.isFinite(Number(item.order)) ? Number(item.order) : index + 1,
  }));

  const visiblePageIds = normalized.filter((item) => item.pageId).map((item) => item.pageId);

  await prisma.$transaction(async (tx) => {
    await tx.navItem.deleteMany({});
    if (normalized.length > 0) {
      await tx.navItem.createMany({ data: normalized });
    }

    await tx.cmsPage.updateMany({
      where: {},
      data: { navVisible: false },
    });

    if (visiblePageIds.length > 0) {
      await tx.cmsPage.updateMany({
        where: { id: { in: visiblePageIds } },
        data: { navVisible: true },
      });
    }
  });
  return listNavigationItems();
};

export const updateMediaAsset = async (assetId: string, body: unknown) => {
  const payload = body as Record<string, unknown>;
  const existing = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!existing) {
    throw new Error('Asset not found.');
  }

  const updated = await prisma.asset.update({
    where: { id: assetId },
    data: {
      originalName: typeof payload.filename === 'string' && payload.filename.trim() ? payload.filename.trim() : existing.originalName,
      altEn: typeof payload.altEn === 'string' ? payload.altEn : existing.altEn,
      altAr: typeof payload.altAr === 'string' ? payload.altAr : existing.altAr,
    },
  });

  return mediaAssetToRecord(updated);
};

export const deleteMediaAsset = async (assetId: string) => {
  const existing = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!existing) {
    return false;
  }

  const localPath = path.resolve(process.cwd(), 'backend', existing.key.replace(/^uploads[\\/]/, 'uploads/'));
  await fs.unlink(localPath).catch(() => undefined);
  await prisma.asset.delete({ where: { id: assetId } });
  return true;
};

export const listConsultations = async () => {
  const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
    SELECT *
    FROM "ConsultationRequest"
    ORDER BY "createdAt" DESC, "updatedAt" DESC
  `);
  return rows.map((row) => consultationRowToRecord(row));
};

export const getConsultationById = async (id: string) => {
  const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
    SELECT *
    FROM "ConsultationRequest"
    WHERE "id" = $1
    LIMIT 1
  `, id);
  const row = rows[0];
  return row ? consultationRowToRecord(row) : null;
};

export const createConsultation = async (payload: {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idNumber: string;
  message: string;
  status: ConsultationRequestRecord['status'];
  paymentStatus: ConsultationRequestRecord['paymentStatus'];
  paymentAmount: string;
  voucherId: string;
  cardBrand: string;
  cardLast4: string;
  recordingUrl?: string | null;
  recordingName?: string | null;
  recordingMimeType?: string | null;
  recordingSize?: number | null;
  attachments: ConsultationAttachmentRecord[];
  adminNotes?: string;
}) => {
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "ConsultationRequest" (
        "id", "fullName", "phone", "email", "idNumber", "message",
        "status", "paymentStatus", "paymentAmount", "voucherId", "cardBrand", "cardLast4",
        "recordingUrl", "recordingName", "recordingMimeType", "recordingSize",
        "attachments", "adminNotes", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16,
        $17::jsonb, $18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `,
    payload.id,
    payload.fullName,
    payload.phone,
    payload.email,
    payload.idNumber,
    payload.message,
    payload.status,
    payload.paymentStatus,
    payload.paymentAmount,
    payload.voucherId,
    payload.cardBrand,
    payload.cardLast4,
    payload.recordingUrl ?? null,
    payload.recordingName ?? null,
    payload.recordingMimeType ?? null,
    payload.recordingSize ?? null,
    JSON.stringify(payload.attachments),
    payload.adminNotes || '',
  );

  return getConsultationById(payload.id);
};

export const updateConsultation = async (id: string, patch: { status?: string; adminNotes?: string }) => {
  const existing = await getConsultationById(id);
  if (!existing) {
    throw new Error('Consultation request not found.');
  }

  await prisma.$executeRawUnsafe(
    `
      UPDATE "ConsultationRequest"
      SET
        "status" = COALESCE($2, "status"),
        "adminNotes" = COALESCE($3, "adminNotes"),
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $1
    `,
    id,
    patch.status ?? null,
    patch.adminNotes ?? null,
  );

  return getConsultationById(id);
};
