export type Language = 'ar' | 'en';

export interface LocalizedText {
  ar: string;
  en: string;
}

export interface Service {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string; // Lucide icon name or component
  longDescriptionAr: string;
  longDescriptionEn: string;
  detailsAr: string[];
  detailsEn: string[];
}

export interface TeamMember {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  experienceAr: string;
  experienceEn: string;
  image: string;
  bioAr: string;
  bioEn: string;
  email: string;
  phone: string;
  credentialsAr: string[];
  credentialsEn: string[];
}

export interface CaseStudy {
  id: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  clientAr: string;
  clientEn: string;
  outcomeAr: string;
  outcomeEn: string;
  resultAr: string;
  resultEn: string;
  descriptionAr: string;
  descriptionEn: string;
  year: string;
}

export interface Testimonial {
  id: string;
  quoteAr: string;
  quoteEn: string;
  authorAr: string;
  authorEn: string;
  roleAr: string;
  roleEn: string;
  companyAr: string;
  companyEn: string;
  image: string;
  rating: number;
}

export interface Article {
  id: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  date: string;
  categoryAr: string;
  categoryEn: string;
  readTimeAr: string;
  readTimeEn: string;
  image: string;
  contentAr: string;
  contentEn: string;
  authorAr: string;
  authorEn: string;
}

export interface Booking {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceId: string;
  date: string;
  time: string;
  notes: string;
  status: 'pending' | 'confirmed';
}

export interface HeroSlide {
  id: string;
  badgeAr: string;
  badgeEn: string;
  badgeIcon: string; // Dynamic icon descriptor: 'Scale' | 'ShieldCheck' | 'Sparkles'
  titleArLine1: string;
  titleEnLine1: string;
  titleArLine2: string;
  titleEnLine2: string;
  descriptionAr: string;
  descriptionEn: string;
  ctaTextAr: string;
  ctaTextEn: string;
  actionType: 'about' | 'service-detail' | 'contact' | 'custom';
  actionParam?: string; // e.g. 'doctor-shield'
  image: string;
  imageAltAr: string;
  imageAltEn: string;
  highlightBox?: {
    priceAr: string;
    priceEn: string;
    noteAr: string;
    noteEn: string;
  };
}

export interface HeroSlideRecord extends HeroSlide {}

export interface ArticleRecord {
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
}

export interface PracticeAreaFeature {
  ar: string;
  en: string;
  descAr: string;
  descEn: string;
}

export interface PracticeAreaStep {
  ar: string;
  en: string;
  descAr: string;
  descEn: string;
}

export interface PracticeAreaFaq {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}

export interface PracticeAreaRecord {
  id: string;
  slug: string;
  categorySlug: 'advisory' | 'litigation' | 'transactional';
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  shortDescAr: string;
  shortDescEn: string;
  aboutAr: string[];
  aboutEn: string[];
  features: PracticeAreaFeature[];
  processSteps: PracticeAreaStep[];
  useCases: LocalizedText[];
  faq: PracticeAreaFaq[];
  imageUrl?: string;
  published: boolean;
  order: number;
}

export interface SiteContent {
  heroSlides: HeroSlideRecord[];
  articles: ArticleRecord[];
  practiceAreas: PracticeAreaRecord[];
  navigation: NavItemRecord[];
  siteSettings: SiteSettingsRecord;
}

export interface SiteSettingsRecord {
  id: string;
  logoImageUrl: string;
  logoImageAltAr: string;
  logoImageAltEn: string;
  footerLogoImageUrl: string;
  footerLogoImageAltAr: string;
  footerLogoImageAltEn: string;
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
}

export type CMSPageStatus = 'published' | 'draft' | 'hidden';

export interface CMSPageRecord {
  id: string;
  titleAr: string;
  titleEn: string;
  slug: string;
  status: CMSPageStatus;
  navVisible: boolean;
  blocksCount: number;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface NavItemRecord {
  id: string;
  pageId: string;
  labelAr: string;
  labelEn: string;
  url: string;
  desktopVisible: boolean;
  mobileVisible: boolean;
  order: number;
}

export interface CMSRevisionRecord {
  id: string;
  pageId: string;
  label: string;
  status: CMSPageStatus;
  blocks: unknown[];
  createdAt: string;
  author: string;
  note: string;
}

export interface CMSBlockRecord {
  id: string;
  type: string;
  collapsed?: boolean;
  data: Record<string, unknown>;
}

export interface CMSPublishedPageRecord extends CMSPageRecord {
  blocks: CMSBlockRecord[];
  seoTitleEn?: string;
  seoTitleAr?: string;
  seoDescEn?: string;
  seoDescAr?: string;
}
