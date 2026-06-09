// ─── Shared enums ─────────────────────────────────────────────────────────────

export type PageStatus = 'published' | 'draft' | 'hidden';
export type Lang = 'en' | 'ar';
export type BlockType =
  | 'hero' | 'rich-text' | 'image-text' | 'cards' | 'stats' | 'cta'
  | 'testimonials' | 'team' | 'contact' | 'faq' | 'gallery' | 'custom';
export type ConsultationStatus = 'new' | 'reviewing' | 'responded' | 'closed';
export type ConsultationPaymentStatus = 'pending' | 'paid' | 'refunded';

// ─── Block ────────────────────────────────────────────────────────────────────

export interface ApiBlock {
  id: string;
  type: BlockType;
  order: number;
  data: Record<string, unknown>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export interface ApiPage {
  id: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  status: PageStatus;
  navVisible: boolean;
  blocksCount?: number;
  seoTitleEn: string;
  seoTitleAr: string;
  seoDescEn: string;
  seoDescAr: string;
  blocks: ApiBlock[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  author: string;
}

export type ApiPageSummary = Omit<ApiPage, 'blocks'> & { blocksCount: number };

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface ApiNavItem {
  id: string;
  pageId: string;
  labelEn: string;
  labelAr: string;
  url: string;
  desktopVisible: boolean;
  mobileVisible: boolean;
  order: number;
}

// ─── Asset ────────────────────────────────────────────────────────────────────

export type AssetType = 'image' | 'document' | 'video';

export interface ApiAsset {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  type: AssetType;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altEn: string;
  altAr: string;
  uploadedAt: string;
  uploadedBy: string;
  usedInPages: string[]; // page IDs
}

// ─── Revision ─────────────────────────────────────────────────────────────────

export interface ApiRevision {
  id: string;
  pageId: string;
  label: string;
  status: PageStatus;
  blocks: ApiBlock[];
  createdAt: string;
  author: string;
  note: string;
}

// ─── Consultation Requests ───────────────────────────────────────────────────

export interface ApiConsultationAttachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  kind: 'image' | 'document' | 'audio';
}

export interface ApiConsultationRequest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idNumber: string;
  message: string;
  status: ConsultationStatus;
  paymentStatus: ConsultationPaymentStatus;
  paymentAmount: string;
  voucherId: string;
  cardBrand: string;
  cardLast4: string;
  recordingUrl?: string | null;
  recordingName?: string | null;
  recordingMimeType?: string | null;
  recordingSize?: number | null;
  attachments: ApiConsultationAttachment[];
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiDoctorShieldRequest {
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
  status: ConsultationStatus;
  paymentStatus: ConsultationPaymentStatus;
  paymentAmount: string;
  voucherId: string;
  paymentMethod: string;
  cardBrand: string;
  cardLast4: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatarUrl?: string;
}

// ─── Article ──────────────────────────────────────────────────────────────────

export type ArticleStatus = 'published' | 'draft' | 'archived';

export const ARTICLE_CATEGORIES = [
  'Corporate Law', 'Litigation', 'Real Estate', 'Arbitration',
  'Employment', 'Intellectual Property', 'Tax', 'Regulatory', 'General',
] as const;

export type ArticleCategory = typeof ARTICLE_CATEGORIES[number];

export interface Article {
  id: string;
  slug: string;
  status: ArticleStatus;
  // Bilingual fields
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  categoryEn: ArticleCategory | string;
  categoryAr: string;
  authorEn: string;
  authorAr: string;
  readTimeEn: string;
  readTimeAr: string;
  bodyEn: string;  // Markdown
  bodyAr: string;  // Markdown
  // Cover image
  coverImageUrl: string;
  coverAltEn: string;
  coverAltAr: string;
  // Meta
  seoTitleEn: string;
  seoTitleAr: string;
  seoDescEn: string;
  seoDescAr: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  author: string; // cms user
}

export type ArticleSummary = Omit<Article, 'bodyEn' | 'bodyAr'>;

export interface CreateArticleRequest {
  titleEn: string;
  titleAr?: string;
  slug: string;
}

export interface UpdateArticleRequest extends Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'author'>> {}

// ─── Practice Area ────────────────────────────────────────────────────────────

export type PracticeAreaStatus = 'published' | 'draft' | 'archived';

export const PRACTICE_AREA_CATEGORIES = [
  'Corporate & Commercial',
  'Dispute Resolution',
  'Real Estate',
  'Employment & Labour',
  'Banking & Finance',
  'Intellectual Property',
  'Regulatory & Compliance',
  'Family & Private Client',
  'Construction & Infrastructure',
  'Tax & Zakat',
] as const;

export type PracticeAreaCategory = typeof PRACTICE_AREA_CATEGORIES[number];

// Reusable bilingual text pair
export interface BilingualText {
  en: string;
  ar: string;
}

// A single feature/bullet point
export interface PracticeFeature {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon?: string; // lucide icon name
}

// A step in a process
export interface PracticeStep {
  id: string;
  number: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
}

// A use-case / client scenario
export interface PracticeUseCase {
  id: string;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  industryEn: string;
  industryAr: string;
}

// An FAQ entry
export interface PracticeFAQ {
  id: string;
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
}

// The "About" rich-text block (bilingual)
export interface PracticeAbout {
  bodyEn: string; // markdown
  bodyAr: string; // markdown
}

export interface PracticeArea {
  id: string;
  slug: string;
  status: PracticeAreaStatus;
  order: number; // display order in listings
  // Bilingual core fields
  titleEn: string;
  titleAr: string;
  categoryEn: string;
  categoryAr: string;
  shortDescEn: string;
  shortDescAr: string;
  // Cover
  coverImageUrl: string;
  coverAltEn: string;
  coverAltAr: string;
  iconName: string; // lucide icon name for the card/listing
  // Structured sections
  about: PracticeAbout;
  features: PracticeFeature[];
  steps: PracticeStep[];
  useCases: PracticeUseCase[];
  faqs: PracticeFAQ[];
  // SEO
  seoTitleEn: string;
  seoTitleAr: string;
  seoDescEn: string;
  seoDescAr: string;
  // Meta
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  author: string;
}

export type PracticeAreaSummary = Omit<PracticeArea, 'about' | 'features' | 'steps' | 'useCases' | 'faqs'>;

export interface CreatePracticeAreaRequest {
  titleEn: string;
  slug: string;
}

export interface UpdatePracticeAreaRequest extends Partial<Omit<PracticeArea, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'author'>> {}

// ─── Legacy content (preserved for frontend compatibility) ────────────────────

export interface LegacyArticle {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  publishedAt: string;
  category: string;
}

export interface LegacyPracticeArea {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
}

// ─── Request / Response shapes ────────────────────────────────────────────────

export interface CreatePageRequest {
  titleEn: string;
  titleAr: string;
  slug: string;
  status?: PageStatus;
}

export interface UpdatePageRequest {
  titleEn?: string;
  titleAr?: string;
  slug?: string;
  status?: PageStatus;
  navVisible?: boolean;
  seoTitleEn?: string;
  seoTitleAr?: string;
  seoDescEn?: string;
  seoDescAr?: string;
}

export interface CreateBlockRequest {
  type: BlockType;
  data?: Record<string, unknown>;
  afterBlockId?: string;
}

export interface UpdateBlockRequest {
  data: Record<string, unknown>;
}

export interface ReorderBlocksRequest {
  blockIds: string[]; // ordered list
}

export interface UpdateNavigationRequest {
  items: Omit<ApiNavItem, 'order'>[];
}

export interface UploadAssetResponse {
  asset: ApiAsset;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
  };
}

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, string>;
}
