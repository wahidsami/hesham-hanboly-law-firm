/**
 * Mock API layer — simulates server responses with in-memory state.
 * Replace each function body with a real fetch() call when the backend is ready.
 * All functions are async and return ApiResponse<T> or throw ApiError.
 */

import type {
  ApiPage, ApiPageSummary, ApiBlock, ApiNavItem, ApiAsset, ApiRevision,
  ApiUser, LegacyArticle, LegacyPracticeArea,
  CreatePageRequest, UpdatePageRequest, CreateBlockRequest,
  UpdateBlockRequest, ReorderBlocksRequest, UpdateNavigationRequest,
  ApiResponse, BlockType,
  Article, ArticleSummary, CreateArticleRequest, UpdateArticleRequest,
  PracticeArea, PracticeAreaSummary, CreatePracticeAreaRequest, UpdatePracticeAreaRequest,
} from './types';

// ─── In-memory stores ─────────────────────────────────────────────────────────

let _pages: ApiPage[] = [
  {
    id: '1', titleEn: 'Home', titleAr: 'الرئيسية', slug: '/',
    status: 'published', navVisible: true,
    seoTitleEn: 'Al-Rashid & Partners — Leading Law Firm in the Gulf',
    seoTitleAr: 'الرشيد وشركاه — مكتب محاماة رائد في الخليج',
    seoDescEn: 'Expert legal services across corporate, litigation, and arbitration.', seoDescAr: '',
    blocks: [], createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-06-04T14:22:00Z',
    publishedAt: '2026-01-15T12:00:00Z', author: 'Sarah A.',
  },
  {
    id: '2', titleEn: 'About Us', titleAr: 'من نحن', slug: '/about',
    status: 'published', navVisible: true,
    seoTitleEn: 'About Al-Rashid & Partners', seoTitleAr: 'عن الرشيد وشركاه',
    seoDescEn: 'Founded in 1998, we serve clients across the MENA region.', seoDescAr: '',
    blocks: [], createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-06-03T09:10:00Z',
    publishedAt: '2026-01-15T12:00:00Z', author: 'Karim M.',
  },
];

let _navItems: ApiNavItem[] = [
  { id: 'nav-1', pageId: '1', labelEn: 'Home', labelAr: 'الرئيسية', url: '/', desktopVisible: true, mobileVisible: true, order: 0 },
  { id: 'nav-2', pageId: '2', labelEn: 'About Us', labelAr: 'من نحن', url: '/about', desktopVisible: true, mobileVisible: true, order: 1 },
];

let _assets: ApiAsset[] = [
  {
    id: 'asset-1', filename: 'hero-courtroom.jpg', type: 'image', mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=70',
    sizeBytes: 487200, width: 1920, height: 1080,
    altEn: 'Modern courtroom interior', altAr: 'قاعة محكمة حديثة',
    uploadedAt: '2026-05-10T10:00:00Z', uploadedBy: 'Sarah A.', usedInPages: ['1'],
  },
  {
    id: 'asset-2', filename: 'team-photo.jpg', type: 'image', mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=70',
    sizeBytes: 392400, width: 1600, height: 900,
    altEn: 'Legal team meeting', altAr: 'اجتماع الفريق القانوني',
    uploadedAt: '2026-05-12T14:30:00Z', uploadedBy: 'Karim M.', usedInPages: ['2'],
  },
  {
    id: 'asset-3', filename: 'dubai-skyline.jpg', type: 'image', mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=70',
    sizeBytes: 621800, width: 2400, height: 1350,
    altEn: 'Dubai skyline at dusk', altAr: 'أفق دبي عند الغسق',
    uploadedAt: '2026-05-14T09:15:00Z', uploadedBy: 'Sarah A.', usedInPages: [],
  },
  {
    id: 'asset-4', filename: 'scales-of-justice.jpg', type: 'image', mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&q=70',
    sizeBytes: 284000, width: 1200, height: 800,
    altEn: 'Scales of justice', altAr: 'ميزان العدالة',
    uploadedAt: '2026-05-16T11:45:00Z', uploadedBy: 'Omar H.', usedInPages: ['3'],
  },
  {
    id: 'asset-5', filename: 'contract-signing.jpg', type: 'image', mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=70',
    sizeBytes: 345600, width: 1400, height: 933,
    altEn: 'Contract signing meeting', altAr: 'اجتماع توقيع العقد',
    uploadedAt: '2026-05-18T16:00:00Z', uploadedBy: 'Lena K.', usedInPages: [],
  },
  {
    id: 'asset-6', filename: 'office-interior.jpg', type: 'image', mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=70',
    sizeBytes: 512000, width: 1800, height: 1200,
    altEn: 'Modern law firm office interior', altAr: 'مكتب محاماة حديث',
    uploadedAt: '2026-05-20T08:30:00Z', uploadedBy: 'Sarah A.', usedInPages: ['2', '4'],
  },
];

let _revisions: ApiRevision[] = [];

let _articles: Article[] = [
  {
    id: 'art-1',
    slug: 'uae-commercial-law-amendments-2026',
    status: 'published',
    titleEn: 'Key Amendments to UAE Commercial Law in 2026',
    titleAr: 'التعديلات الرئيسية على قانون التجارة الإماراتي في 2026',
    excerptEn: 'The UAE Ministry of Economy has introduced sweeping reforms to the Commercial Transactions Law, affecting everything from contract enforcement to electronic signatures.',
    excerptAr: 'أدخلت وزارة الاقتصاد الإماراتية إصلاحات شاملة على قانون المعاملات التجارية، تؤثر على كل شيء من تطبيق العقود إلى التوقيعات الإلكترونية.',
    categoryEn: 'Corporate Law',
    categoryAr: 'قانون الشركات',
    authorEn: 'Omar Al-Rashid',
    authorAr: 'عمر الرشيد',
    readTimeEn: '6 min read',
    readTimeAr: '6 دقائق قراءة',
    bodyEn: `## Overview\n\nThe 2026 amendments to the UAE Commercial Transactions Law represent the most significant overhaul since the original legislation was enacted. Businesses operating across the Emirates must familiarise themselves with the new provisions before they come into full effect in Q3 2026.\n\n## Key Changes\n\n### Electronic Contracting\n\nThe revised law formally recognises blockchain-based smart contracts as legally binding instruments, provided they meet specified authentication standards issued by the Telecommunications and Digital Government Regulatory Authority (TDRA).\n\n### Arbitration Clauses\n\nParties to commercial contracts may now designate DIAC or ADGM as their seat of arbitration without needing to separately incorporate a governing law clause — the seat will imply the applicable procedural law.\n\n### Payment Terms\n\nStatutory payment periods for B2B transactions have been tightened from 60 to 45 days, with interest accruing automatically at the Central Bank benchmark rate plus 2%.\n\n## Practical Implications\n\nLegal teams should audit existing master service agreements and distribution contracts to ensure compliance with the new payment and dispute resolution provisions. Template updates should be prioritised for contracts governing cross-border supply chains within the GCC.\n\n## Conclusion\n\nAl-Rashid & Partners is available to advise on the implications of these amendments for your specific sector. Contact our Corporate Law team for a complimentary review of your standard contract templates.`,
    bodyAr: `## نظرة عامة\n\nتمثل تعديلات 2026 على قانون المعاملات التجارية الإماراتي أكبر مراجعة شاملة منذ صدور التشريع الأصلي. يجب على الشركات العاملة في الإمارات التعرف على الأحكام الجديدة قبل دخولها حيز التنفيذ الكامل في الربع الثالث من عام 2026.\n\n## التغييرات الرئيسية\n\n### التعاقد الإلكتروني\n\nيعترف القانون المعدل رسمياً بالعقود الذكية القائمة على تقنية البلوكتشين كأدوات ملزمة قانونياً، شريطة استيفائها معايير المصادقة المحددة الصادرة عن هيئة تنظيم الاتصالات والحكومة الرقمية.\n\n## الاستنتاج\n\nالرشيد وشركاه على استعداد لتقديم المشورة بشأن تداعيات هذه التعديلات على قطاعكم المحدد.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80',
    coverAltEn: 'Legal documents and scales of justice',
    coverAltAr: 'وثائق قانونية وميزان العدالة',
    seoTitleEn: 'UAE Commercial Law Amendments 2026 | Al-Rashid & Partners',
    seoTitleAr: 'تعديلات قانون التجارة الإماراتي 2026 | الرشيد وشركاه',
    seoDescEn: 'Expert analysis of the 2026 UAE Commercial Transactions Law amendments and their impact on businesses.',
    seoDescAr: 'تحليل متخصص لتعديلات قانون المعاملات التجارية الإماراتي 2026 وتأثيرها على الأعمال.',
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-06-01T14:00:00Z',
    publishedAt: '2026-06-01T14:00:00Z',
    author: 'Omar H.',
  },
  {
    id: 'art-2',
    slug: 'arbitration-trends-gulf-2026',
    status: 'published',
    titleEn: 'Arbitration Trends Reshaping Gulf Dispute Resolution',
    titleAr: 'اتجاهات التحكيم التي تعيد تشكيل حل النزاعات في الخليج',
    excerptEn: 'Regional arbitration centres are posting record caseloads as parties increasingly prefer confidential and faster alternatives to litigation.',
    excerptAr: 'تسجل مراكز التحكيم الإقليمية أعداداً قياسية من القضايا مع تفضيل الأطراف بشكل متزايد للبدائل السرية والأسرع للتقاضي.',
    categoryEn: 'Arbitration',
    categoryAr: 'التحكيم',
    authorEn: 'Karim Mansour',
    authorAr: 'كريم منصور',
    readTimeEn: '8 min read',
    readTimeAr: '8 دقائق قراءة',
    bodyEn: `## The Arbitration Boom\n\nThe Gulf region's major arbitration centres — DIAC, ADCCAC, and the DIFC-LCIA — collectively handled over 2,400 cases in 2025, a 34% year-on-year increase. This surge reflects broader confidence in arbitration as a reliable mechanism for cross-border disputes.\n\n## DIAC's 2022 Rules: Two Years On\n\nThe 2022 DIAC Arbitration Rules, now fully embedded in practice, have proved particularly popular for construction and infrastructure disputes. The expedited procedure (Article 32) has reduced average time-to-award from 18 months to under 9 months for qualifying disputes below AED 5 million.\n\n## Emergency Arbitrator\n\nThe emergency arbitrator mechanism has been invoked 47 times in the past 12 months, predominantly in technology licensing and private equity disputes — sectors where speed of interim relief is critical.\n\n## Prediction\n\nWith the UAE's new PPP legislation and anticipated sovereign wealth fund joint ventures, we expect infrastructure arbitration filings to increase by a further 25% through 2027.`,
    bodyAr: `## ازدهار التحكيم\n\nتناولت مراكز التحكيم الرئيسية في منطقة الخليج — دياك وأدكاك ومركز دبي المالي الدولي — ما مجموعه أكثر من 2400 قضية في عام 2025، بزيادة قدرها 34% على أساس سنوي.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80',
    coverAltEn: 'Modern courtroom and legal proceedings',
    coverAltAr: 'قاعة محكمة حديثة وإجراءات قانونية',
    seoTitleEn: 'Gulf Arbitration Trends 2026 | Al-Rashid & Partners',
    seoTitleAr: 'اتجاهات التحكيم الخليجي 2026 | الرشيد وشركاه',
    seoDescEn: 'Analysis of arbitration trends and caseload growth at Gulf regional arbitration centres.',
    seoDescAr: 'تحليل اتجاهات التحكيم ونمو أعداد القضايا في مراكز التحكيم الإقليمية الخليجية.',
    createdAt: '2026-04-22T10:00:00Z',
    updatedAt: '2026-05-15T09:30:00Z',
    publishedAt: '2026-05-15T09:30:00Z',
    author: 'Karim M.',
  },
  {
    id: 'art-3',
    slug: 'difc-employment-law-update',
    status: 'published',
    titleEn: 'DIFC Employment Law: What the 2025 Amendments Mean for Employers',
    titleAr: 'قانون العمل في مركز دبي المالي: ما تعنيه تعديلات 2025 لأصحاب العمل',
    excerptEn: 'The DIFC Authority amended its Employment Law in late 2025. Employers have until June 2026 to update offer letters, policies, and non-compete agreements.',
    excerptAr: 'عدّلت سلطة مركز دبي المالي قانون العمل في أواخر عام 2025. يتعين على أصحاب العمل تحديث عروض العمل والسياسات واتفاقيات عدم المنافسة بحلول يونيو 2026.',
    categoryEn: 'Employment',
    categoryAr: 'قانون العمل',
    authorEn: 'Lena Khoury',
    authorAr: 'لينا خوري',
    readTimeEn: '5 min read',
    readTimeAr: '5 دقائق قراءة',
    bodyEn: `## Summary of Amendments\n\nThe DIFC Employment Law (Amendment) No. 4 of 2025 introduces three main changes that affect day-to-day HR operations.\n\n### 1. Non-Compete Clauses\n\nThe maximum enforceable non-compete period has been reduced from 12 to 6 months. Clauses exceeding this duration will be read down rather than voided entirely, providing welcome certainty for employers.\n\n### 2. Gratuity Calculation\n\nEnd-of-service gratuity is now calculated on the employee's basic salary plus any fixed allowances, aligning DIFC practice with the broader UAE Federal Labour Law approach.\n\n### 3. Remote Work Provisions\n\nEmployers must now include explicit provisions in offer letters or contracts for roles that are permanently remote, specifying jurisdiction, equipment obligations, and data handling requirements.\n\n## Action Items\n\n- Review all non-compete clauses before 30 June 2026\n- Update payroll systems to include fixed allowances in gratuity calculations\n- Issue addenda to remote employees' contracts`,
    bodyAr: `## ملخص التعديلات\n\nيُدخل قانون العمل في مركز دبي المالي (تعديل) رقم 4 لعام 2025 ثلاثة تغييرات رئيسية تؤثر على العمليات اليومية لإدارة الموارد البشرية.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80',
    coverAltEn: 'Business meeting and employment contract',
    coverAltAr: 'اجتماع عمل وعقد توظيف',
    seoTitleEn: 'DIFC Employment Law Amendments 2025 | Al-Rashid & Partners',
    seoTitleAr: 'تعديلات قانون عمل مركز دبي المالي 2025 | الرشيد وشركاه',
    seoDescEn: 'A practical guide to the 2025 DIFC Employment Law amendments for employers.',
    seoDescAr: 'دليل عملي لتعديلات قانون عمل مركز دبي المالي 2025 لأصحاب العمل.',
    createdAt: '2026-03-15T11:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
    publishedAt: '2026-03-20T10:00:00Z',
    author: 'Lena K.',
  },
  {
    id: 'art-4',
    slug: 'real-estate-off-plan-protections',
    status: 'draft',
    titleEn: 'Off-Plan Property Protections: What Buyers Need to Know',
    titleAr: 'حماية العقارات على الخريطة: ما يحتاج المشترون إلى معرفته',
    excerptEn: 'RERA\'s enhanced off-plan regulations introduce escrow account audits and developer performance bonds. Buyers now have stronger rights than ever.',
    excerptAr: 'تُدخل لوائح الوحدات على الخريطة المحسّنة الصادرة عن مؤسسة التنظيم العقاري عمليات تدقيق على حسابات الضمان وسندات أداء المطورين.',
    categoryEn: 'Real Estate',
    categoryAr: 'قانون العقارات',
    authorEn: 'Sarah Al-Rashid',
    authorAr: 'سارة الرشيد',
    readTimeEn: '7 min read',
    readTimeAr: '7 دقائق قراءة',
    bodyEn: `## Background\n\nOff-plan property sales in Dubai reached AED 94 billion in 2025, representing 58% of all residential transactions — a record high. With increased volume comes increased risk of developer default, making buyer protections more important than ever.\n\n## New RERA Requirements\n\n### Escrow Account Audits\n\nDevelopers must now submit quarterly independent audits of project escrow accounts to RERA. Audit reports must be made available to all registered purchasers within 14 days of completion.\n\n### Performance Bonds\n\nFor projects exceeding AED 200 million in gross development value, developers must obtain a performance bond equal to 10% of the total escrow value from an approved financial institution.\n\n## Buyer Remedies\n\nThe amended regulations introduce a new 90-day cure period for developer defaults, after which purchasers may elect to cancel and receive a full refund plus 12% per annum from the date of breach.`,
    bodyAr: '',
    coverImageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    coverAltEn: 'Dubai skyline with real estate developments',
    coverAltAr: 'أفق دبي مع مشاريع التطوير العقاري',
    seoTitleEn: '',
    seoTitleAr: '',
    seoDescEn: '',
    seoDescAr: '',
    createdAt: '2026-05-28T09:00:00Z',
    updatedAt: '2026-06-03T16:00:00Z',
    publishedAt: null,
    author: 'Sarah A.',
  },
  {
    id: 'art-5',
    slug: 'ip-protection-uae-startups',
    status: 'draft',
    titleEn: 'Protecting IP in the UAE: A Startup Founder\'s Guide',
    titleAr: 'حماية الملكية الفكرية في الإمارات: دليل مؤسسي الشركات الناشئة',
    excerptEn: 'From trademark registration to trade secret clauses, here is how early-stage companies can protect their core assets in the GCC market.',
    excerptAr: 'من تسجيل العلامات التجارية إلى بنود الأسرار التجارية، إليك كيف يمكن للشركات في مراحلها الأولى حماية أصولها الأساسية في سوق دول مجلس التعاون.',
    categoryEn: 'Intellectual Property',
    categoryAr: 'الملكية الفكرية',
    authorEn: 'Karim Mansour',
    authorAr: 'كريم منصور',
    readTimeEn: '9 min read',
    readTimeAr: '9 دقائق قراءة',
    bodyEn: '',
    bodyAr: '',
    coverImageUrl: '',
    coverAltEn: '',
    coverAltAr: '',
    seoTitleEn: '',
    seoTitleAr: '',
    seoDescEn: '',
    seoDescAr: '',
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-04T11:00:00Z',
    publishedAt: null,
    author: 'Karim M.',
  },
  {
    id: 'art-6',
    slug: 'tax-residency-uae-individuals',
    status: 'archived',
    titleEn: 'UAE Tax Residency for Individuals: The 2024 Cabinet Resolution',
    titleAr: 'الإقامة الضريبية في الإمارات للأفراد: قرار مجلس الوزراء 2024',
    excerptEn: 'Cabinet Resolution No. 85 of 2022 established formal criteria for individual tax residency in the UAE for the first time.',
    excerptAr: 'أرسى قرار مجلس الوزراء رقم 85 لعام 2022 معايير رسمية للإقامة الضريبية الفردية في الإمارات لأول مرة.',
    categoryEn: 'Tax',
    categoryAr: 'الضرائب',
    authorEn: 'Omar Al-Rashid',
    authorAr: 'عمر الرشيد',
    readTimeEn: '4 min read',
    readTimeAr: '4 دقائق قراءة',
    bodyEn: '## Overview\n\nThis article has been archived as the 2024 updates supersede this guidance. Please refer to our updated 2025 Tax Residency guide.',
    bodyAr: '',
    coverImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    coverAltEn: 'Office building representing UAE corporate environment',
    coverAltAr: 'مبنى مكاتب يمثل بيئة الأعمال الإماراتية',
    seoTitleEn: '',
    seoTitleAr: '',
    seoDescEn: '',
    seoDescAr: '',
    createdAt: '2024-09-10T08:00:00Z',
    updatedAt: '2025-01-15T09:00:00Z',
    publishedAt: '2024-09-20T10:00:00Z',
    author: 'Omar H.',
  },
];

// ─── Article helpers ───────────────────────────────────────────────────────────

function articleSummary(a: Article): ArticleSummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { bodyEn, bodyAr, ...rest } = a;
  return rest;
}

// ─── Article API ───────────────────────────────────────────────────────────────

// GET /api/admin/articles
export async function adminGetArticles(): Promise<ApiResponse<ArticleSummary[]>> {
  await delay();
  return { data: _articles.map(articleSummary), meta: { total: _articles.length } };
}

// GET /api/admin/articles/:slug
export async function adminGetArticle(slug: string): Promise<ApiResponse<Article>> {
  await delay();
  const article = _articles.find(a => a.slug === slug);
  if (!article) throw { error: 'Not found', code: 'ARTICLE_NOT_FOUND' };
  return { data: article };
}

// POST /api/admin/articles
export async function adminCreateArticle(req: CreateArticleRequest): Promise<ApiResponse<Article>> {
  await delay();
  const now = new Date().toISOString();
  const article: Article = {
    id: `art-${Date.now()}`,
    slug: req.slug,
    status: 'draft',
    titleEn: req.titleEn,
    titleAr: req.titleAr ?? '',
    excerptEn: '', excerptAr: '',
    categoryEn: 'General', categoryAr: 'عام',
    authorEn: 'Sarah Al-Rashid', authorAr: 'سارة الرشيد',
    readTimeEn: '', readTimeAr: '',
    bodyEn: '', bodyAr: '',
    coverImageUrl: '', coverAltEn: '', coverAltAr: '',
    seoTitleEn: '', seoTitleAr: '', seoDescEn: '', seoDescAr: '',
    createdAt: now, updatedAt: now, publishedAt: null, author: 'Sarah A.',
  };
  _articles = [article, ..._articles];
  return { data: article };
}

// PUT /api/admin/articles/:slug
export async function adminUpdateArticle(slug: string, req: UpdateArticleRequest): Promise<ApiResponse<Article>> {
  await delay();
  const idx = _articles.findIndex(a => a.slug === slug);
  if (idx === -1) throw { error: 'Not found', code: 'ARTICLE_NOT_FOUND' };
  const updated = { ..._articles[idx], ...req, updatedAt: new Date().toISOString() };
  _articles = _articles.map((a, i) => i === idx ? updated : a);
  return { data: updated };
}

// PUT /api/admin/articles/:slug/publish
export async function adminPublishArticle(slug: string, publish: boolean): Promise<ApiResponse<Article>> {
  await delay();
  const idx = _articles.findIndex(a => a.slug === slug);
  if (idx === -1) throw { error: 'Not found', code: 'ARTICLE_NOT_FOUND' };
  const now = new Date().toISOString();
  const updated = {
    ..._articles[idx],
    status: (publish ? 'published' : 'draft') as Article['status'],
    publishedAt: publish ? now : _articles[idx].publishedAt,
    updatedAt: now,
  };
  _articles = _articles.map((a, i) => i === idx ? updated : a);
  return { data: updated };
}

// DELETE /api/admin/articles/:slug
export async function adminDeleteArticle(slug: string): Promise<ApiResponse<{ ok: boolean }>> {
  await delay();
  _articles = _articles.filter(a => a.slug !== slug);
  return { data: { ok: true } };
}

// POST /api/admin/articles/:slug/duplicate
export async function adminDuplicateArticle(slug: string): Promise<ApiResponse<Article>> {
  await delay();
  const src = _articles.find(a => a.slug === slug);
  if (!src) throw { error: 'Not found', code: 'ARTICLE_NOT_FOUND' };
  const now = new Date().toISOString();
  const copy: Article = {
    ...JSON.parse(JSON.stringify(src)),
    id: `art-${Date.now()}`,
    slug: `${src.slug}-copy-${Date.now()}`,
    status: 'draft',
    titleEn: `${src.titleEn} (Copy)`,
    titleAr: src.titleAr ? `${src.titleAr} (نسخة)` : '',
    publishedAt: null,
    createdAt: now, updatedAt: now,
  };
  _articles = [copy, ..._articles];
  return { data: copy };
}

// Expose store
export function getArticlesStore(): Article[] { return _articles; }
export function updateArticlesStore(articles: Article[]) { _articles = articles; }

// ─── Practice Areas data ──────────────────────────────────────────────────────

let _practiceAreas: PracticeArea[] = [
  {
    id: 'pa-1',
    slug: 'corporate-commercial',
    status: 'published',
    order: 1,
    titleEn: 'Corporate & Commercial Law',
    titleAr: 'قانون الشركات والتجارة',
    categoryEn: 'Corporate & Commercial',
    categoryAr: 'الشركات والتجارة',
    shortDescEn: 'End-to-end corporate advisory for Gulf-region businesses — from company formation and M&A to joint ventures and corporate governance.',
    shortDescAr: 'استشارات قانونية متكاملة للشركات في منطقة الخليج — من تأسيس الشركات والاندماجات والاستحواذات إلى المشاريع المشتركة وحوكمة الشركات.',
    coverImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    coverAltEn: 'Modern corporate law firm office',
    coverAltAr: 'مكتب محاماة مؤسسي حديث',
    iconName: 'Briefcase',
    about: {
      bodyEn: `## About This Practice\n\nOur Corporate & Commercial practice advises businesses at every stage of the corporate lifecycle — from initial incorporation and shareholder agreements through to complex cross-border M&A transactions and eventual restructurings.\n\nWe act for a diverse range of clients including listed companies, sovereign wealth funds, family-owned conglomerates, and international corporations entering the GCC market for the first time.\n\n## Our Approach\n\nWe combine deep knowledge of UAE and GCC commercial law with an understanding of international business norms. Our team works closely with clients' in-house legal functions to provide commercially focused advice that enables transactions and manages risk — rather than creating it.`,
      bodyAr: `## حول هذه الممارسة\n\nتقدم ممارستنا في مجال قانون الشركات والتجارة المشورة للشركات في كل مرحلة من مراحل دورة حياتها — من التأسيس الأولي واتفاقيات المساهمين وحتى معاملات الاندماج والاستحواذ العابرة للحدود والإعادة الهيكلية.\n\nنعمل مع مجموعة متنوعة من العملاء تشمل الشركات المدرجة وصناديق الثروة السيادية والتكتلات العائلية والشركات الدولية التي تدخل سوق دول مجلس التعاون الخليجي لأول مرة.`,
    },
    features: [
      { id: 'f1', titleEn: 'Company Formation', titleAr: 'تأسيس الشركات', descriptionEn: 'Mainland, free zone, and offshore entity setup across all seven Emirates and key free zones including DIFC, ADGM, and JAFZA.', descriptionAr: 'إعداد كيانات البر الرئيسي والمناطق الحرة وخارج المنطقة في جميع الإمارات السبع والمناطق الحرة الرئيسية.', icon: 'Building2' },
      { id: 'f2', titleEn: 'Mergers & Acquisitions', titleAr: 'الاندماجات والاستحواذات', descriptionEn: 'Full-cycle M&A advisory including due diligence, transaction structuring, SPA negotiation, and post-closing integration.', descriptionAr: 'استشارات الاندماج والاستحواذ على كامل الدورة بما فيها العناية الواجبة وهيكلة المعاملة والتفاوض على اتفاقية البيع والشراء.', icon: 'GitMerge' },
      { id: 'f3', titleEn: 'Joint Ventures', titleAr: 'المشاريع المشتركة', descriptionEn: 'Structuring and drafting JV agreements, partnership arrangements, and consortium agreements for cross-border projects.', descriptionAr: 'هيكلة وصياغة اتفاقيات المشاريع المشتركة وترتيبات الشراكة والاتفاقيات التجمعية للمشاريع العابرة للحدود.', icon: 'Users' },
      { id: 'f4', titleEn: 'Corporate Governance', titleAr: 'حوكمة الشركات', descriptionEn: 'Board advisory, governance frameworks, compliance programmes, and shareholder dispute resolution.', descriptionAr: 'استشارات مجلس الإدارة وأطر الحوكمة وبرامج الامتثال وحل نزاعات المساهمين.', icon: 'Shield' },
    ],
    steps: [
      { id: 's1', number: 1, titleEn: 'Initial Consultation', titleAr: 'الاستشارة الأولية', descriptionEn: 'We meet to understand your business objectives, jurisdiction requirements, and preferred transaction timeline.', descriptionAr: 'نجتمع لفهم أهداف عملك ومتطلبات الاختصاص القضائي والجدول الزمني المفضل للمعاملة.' },
      { id: 's2', number: 2, titleEn: 'Due Diligence & Structuring', titleAr: 'العناية الواجبة والهيكلة', descriptionEn: 'Our team conducts thorough legal due diligence and advises on the optimal structure to achieve your commercial objectives.', descriptionAr: 'يجري فريقنا عناية واجبة قانونية شاملة ويقدم المشورة بشأن الهيكل الأمثل لتحقيق أهدافك التجارية.' },
      { id: 's3', number: 3, titleEn: 'Drafting & Negotiation', titleAr: 'الصياغة والتفاوض', descriptionEn: 'We prepare all transaction documents and lead or support negotiations with counterparties and their counsel.', descriptionAr: 'نُعدّ جميع وثائق المعاملة ونقود أو ندعم المفاوضات مع الأطراف المقابلة ومستشاريها.' },
      { id: 's4', number: 4, titleEn: 'Closing & Registration', titleAr: 'الإغلاق والتسجيل', descriptionEn: 'We manage all regulatory filings, government registrations, and post-closing formalities to ensure a clean completion.', descriptionAr: 'نُدير جميع الإيداعات التنظيمية والتسجيلات الحكومية والإجراءات الشكلية بعد الإغلاق لضمان إتمام نظيف.' },
    ],
    useCases: [
      { id: 'uc1', titleEn: 'GCC Market Entry', titleAr: 'الدخول إلى سوق دول مجلس التعاون', summaryEn: 'Advised a European technology company on its UAE entity setup, securing a DIFC licence and negotiating its first local distribution agreements.', summaryAr: 'قدمنا المشورة لشركة تكنولوجيا أوروبية بشأن تأسيس كيانها في الإمارات وتأمين ترخيص مركز دبي المالي والتفاوض على أول اتفاقيات توزيع محلية.', industryEn: 'Technology', industryAr: 'التكنولوجيا' },
      { id: 'uc2', titleEn: 'Family Business Restructuring', titleAr: 'إعادة هيكلة الأعمال العائلية', summaryEn: 'Restructured a multi-generational UAE family conglomerate, separating operational and holding structures and implementing a family governance charter.', summaryAr: 'أعدنا هيكلة تكتل عائلي إماراتي متعدد الأجيال وفصلنا هياكل التشغيل والشركات القابضة وطبّقنا ميثاق حوكمة الأسرة.', industryEn: 'Diversified', industryAr: 'متنوع' },
    ],
    faqs: [
      { id: 'faq1', questionEn: 'What is the minimum share capital for a UAE LLC?', questionAr: 'ما الحد الأدنى لرأس المال لشركة ذات مسؤولية محدودة في الإمارات؟', answerEn: 'As of the 2021 UAE Commercial Companies Law, there is no prescribed minimum share capital for a mainland LLC. However, certain regulated activities and free zone authorities may impose their own minimum capital requirements.', answerAr: 'وفقًا لقانون الشركات التجارية الإماراتي لعام 2021، لا يوجد حد أدنى مقرر لرأس المال لشركة ذات مسؤولية محدودة في البر الرئيسي. ومع ذلك، قد تفرض بعض الأنشطة المنظمة وسلطات المناطق الحرة متطلبات رأس مال أدنى خاصة بها.' },
      { id: 'faq2', questionEn: 'Can a foreign company own 100% of a UAE entity?', questionAr: 'هل يمكن لشركة أجنبية أن تمتلك 100% من كيان إماراتي؟', answerEn: 'Yes. The 2021 amendments to the UAE Commercial Companies Law permit 100% foreign ownership for mainland companies in most sectors, subject to approval from the relevant licensing authority. Some strategic sectors remain subject to foreign ownership restrictions.', answerAr: 'نعم. تسمح تعديلات 2021 على قانون الشركات التجارية الإماراتي بالملكية الأجنبية بنسبة 100% للشركات في البر الرئيسي في معظم القطاعات، مع خضوعها لموافقة جهة الترخيص ذات الصلة.' },
    ],
    seoTitleEn: 'Corporate & Commercial Law | Al-Rashid & Partners',
    seoTitleAr: 'قانون الشركات والتجارة | الرشيد وشركاه',
    seoDescEn: 'Expert corporate and commercial legal advice for businesses in the UAE and GCC — M&A, company formation, joint ventures, and governance.',
    seoDescAr: 'استشارات قانونية متخصصة في الشركات والتجارة للشركات في الإمارات ودول مجلس التعاون.',
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-05-20T14:00:00Z',
    publishedAt: '2026-01-10T12:00:00Z',
    author: 'Sarah A.',
  },
  {
    id: 'pa-2',
    slug: 'dispute-resolution',
    status: 'published',
    order: 2,
    titleEn: 'Litigation & Dispute Resolution',
    titleAr: 'التقاضي وحل النزاعات',
    categoryEn: 'Dispute Resolution',
    categoryAr: 'حل النزاعات',
    shortDescEn: 'Experienced advocates representing clients before UAE courts, DIFC courts, and major arbitration centres across the Gulf.',
    shortDescAr: 'محامون ذوو خبرة يمثلون العملاء أمام المحاكم الإماراتية ومحاكم مركز دبي المالي ومراكز التحكيم الكبرى في الخليج.',
    coverImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80',
    coverAltEn: 'Courtroom interior representing litigation',
    coverAltAr: 'قاعة المحكمة تمثل التقاضي',
    iconName: 'Scale',
    about: {
      bodyEn: `## About This Practice\n\nOur Litigation & Dispute Resolution team handles commercial disputes across the full spectrum of forums available in the UAE and wider Gulf region.\n\nWe appear in UAE onshore courts (Dubai, Abu Dhabi, Sharjah), the DIFC Courts, the ADGM Courts, and in arbitrations before DIAC, ICC, LCIA, and ad-hoc tribunals.\n\n## Why Choose Arbitration?\n\nFor cross-border commercial disputes, arbitration typically offers greater enforceability (via the New York Convention), confidentiality, and the ability to select arbitrators with specialist expertise. Our team advises clients on the most appropriate dispute resolution mechanism at the contract drafting stage.`,
      bodyAr: `## حول هذه الممارسة\n\nيتولى فريق التقاضي وحل النزاعات لدينا النزاعات التجارية في جميع المنتديات المتاحة في الإمارات وأوسع منطقة الخليج.\n\nنمثل العملاء في المحاكم الإماراتية البرية (دبي وأبوظبي والشارقة) ومحاكم مركز دبي المالي العالمي ومحاكم سوق أبوظبي العالمي وفي التحكيم أمام مراكز دياك والغرفة التجارية الدولية ومركز لندن للتحكيم الدولي.`,
    },
    features: [
      { id: 'f1', titleEn: 'Court Litigation', titleAr: 'التقاضي أمام المحاكم', descriptionEn: 'Representation before all UAE onshore courts and specialist financial courts (DIFC, ADGM).', descriptionAr: 'التمثيل أمام جميع المحاكم الإماراتية البرية والمحاكم المالية المتخصصة.', icon: 'Gavel' },
      { id: 'f2', titleEn: 'International Arbitration', titleAr: 'التحكيم الدولي', descriptionEn: 'Representation in DIAC, ICC, LCIA, ICSID, and ad-hoc arbitrations seated in Dubai, Abu Dhabi, and international centres.', descriptionAr: 'التمثيل في تحكيمات دياك والغرفة التجارية الدولية ومركز لندن للتحكيم ومركز إيكسيد وتحكيمات خاصة.', icon: 'Globe' },
      { id: 'f3', titleEn: 'Enforcement', titleAr: 'التنفيذ', descriptionEn: 'Recognition and enforcement of foreign judgments and arbitral awards across the UAE and GCC.', descriptionAr: 'الاعتراف وتنفيذ الأحكام الأجنبية وقرارات التحكيم في الإمارات ودول مجلس التعاون.', icon: 'CheckCircle' },
      { id: 'f4', titleEn: 'Mediation & ADR', titleAr: 'الوساطة وحلول بديلة', descriptionEn: 'Expert neutral mediation services and advisory on pre-litigation settlement strategies.', descriptionAr: 'خدمات الوساطة المحايدة المتخصصة والاستشارات حول استراتيجيات التسوية قبل التقاضي.', icon: 'Handshake' },
    ],
    steps: [
      { id: 's1', number: 1, titleEn: 'Case Assessment', titleAr: 'تقييم القضية', descriptionEn: 'We conduct a rapid assessment of the merits, jurisdiction options, available remedies, and likely timeline and cost.', descriptionAr: 'نجري تقييمًا سريعًا للمزايا وخيارات الاختصاص القضائي والسبل المتاحة والجدول الزمني المحتمل والتكلفة.' },
      { id: 's2', number: 2, titleEn: 'Strategy & Forum Selection', titleAr: 'الاستراتيجية واختيار المنتدى', descriptionEn: 'We recommend the optimal dispute forum (court or arbitration) and develop a litigation strategy aligned with your commercial objectives.', descriptionAr: 'نوصي بالمنتدى الأمثل للنزاع وننشئ استراتيجية تقاضٍ تتماشى مع أهدافك التجارية.' },
      { id: 's3', number: 3, titleEn: 'Proceedings', titleAr: 'الإجراءات', descriptionEn: 'We manage all aspects of the proceedings — pleadings, evidence, hearings, and expert coordination.', descriptionAr: 'ندير جميع جوانب الإجراءات — المرافعات والأدلة والجلسات وتنسيق الخبراء.' },
      { id: 's4', number: 4, titleEn: 'Award & Enforcement', titleAr: 'الحكم والتنفيذ', descriptionEn: 'We obtain judgment or award and, where necessary, pursue enforcement across jurisdictions to recover for our clients.', descriptionAr: 'نحصل على الحكم أو القرار وعند الضرورة نتابع التنفيذ عبر الاختصاصات القضائية لاسترداد حقوق عملائنا.' },
    ],
    useCases: [
      { id: 'uc1', titleEn: 'Construction Dispute — AED 180M Claim', titleAr: 'نزاع إنشائي — مطالبة بـ 180 مليون درهم', summaryEn: 'Successfully represented a UAE developer in a DIAC arbitration against a main contractor, recovering AED 180 million in delay damages.', summaryAr: 'مثّلنا بنجاح مطوّرًا إماراتيًا في تحكيم دياك ضد مقاول رئيسي واسترددنا 180 مليون درهم كتعويضات عن التأخير.', industryEn: 'Construction', industryAr: 'الإنشاء' },
    ],
    faqs: [
      { id: 'faq1', questionEn: 'How long does litigation in Dubai courts typically take?', questionAr: 'كم يستغرق التقاضي في محاكم دبي عادةً؟', answerEn: 'First-instance proceedings in Dubai courts typically take 12–24 months. Appeal proceedings add a further 6–18 months. DIFC Courts are generally faster, with first-instance hearings often concluding within 6–12 months.', answerAr: 'تستغرق إجراءات الدرجة الأولى في محاكم دبي عادةً 12-24 شهرًا. تضيف إجراءات الاستئناف 6-18 شهرًا إضافية. محاكم مركز دبي المالي أسرع بوجه عام.' },
      { id: 'faq2', questionEn: 'Are foreign arbitral awards enforceable in the UAE?', questionAr: 'هل قرارات التحكيم الأجنبية قابلة للتنفيذ في الإمارات؟', answerEn: 'Yes. The UAE acceded to the New York Convention on the Recognition and Enforcement of Foreign Arbitral Awards in 2006. Subject to limited public policy grounds, foreign arbitral awards are generally enforceable through the UAE courts.', answerAr: 'نعم. انضمت الإمارات إلى اتفاقية نيويورك للاعتراف وتنفيذ قرارات التحكيم الأجنبية في عام 2006.' },
    ],
    seoTitleEn: 'Litigation & Dispute Resolution | Al-Rashid & Partners',
    seoTitleAr: 'التقاضي وحل النزاعات | الرشيد وشركاه',
    seoDescEn: 'Expert litigation and arbitration services across UAE courts, DIFC, and international arbitration centres.',
    seoDescAr: 'خدمات تقاضي وتحكيم متخصصة في محاكم الإمارات ومركز دبي المالي ومراكز التحكيم الدولية.',
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-05-18T10:00:00Z',
    publishedAt: '2026-01-10T12:00:00Z',
    author: 'Karim M.',
  },
  {
    id: 'pa-3',
    slug: 'real-estate',
    status: 'published',
    order: 3,
    titleEn: 'Real Estate Law',
    titleAr: 'قانون العقارات',
    categoryEn: 'Real Estate',
    categoryAr: 'العقارات',
    shortDescEn: 'Comprehensive real estate legal services covering commercial transactions, development projects, and property finance across the UAE.',
    shortDescAr: 'خدمات قانونية عقارية شاملة تغطي المعاملات التجارية ومشاريع التطوير وتمويل العقارات في جميع أنحاء الإمارات.',
    coverImageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    coverAltEn: 'Dubai skyline representing real estate market',
    coverAltAr: 'أفق دبي يمثل سوق العقارات',
    iconName: 'Building',
    about: {
      bodyEn: `## About This Practice\n\nOur Real Estate practice covers the full spectrum of property transactions in the UAE — from straightforward residential purchases to complex commercial developments and real estate finance structures.\n\nWe advise developers, investors, lenders, and occupiers on acquisitions, sales, leases, development agreements, strata titling, and property-related disputes.`,
      bodyAr: `## حول هذه الممارسة\n\nتغطي ممارستنا العقارية الطيف الكامل لمعاملات الملكية في الإمارات — من المشتريات السكنية المباشرة إلى التطويرات التجارية المعقدة وهياكل تمويل العقارات.`,
    },
    features: [
      { id: 'f1', titleEn: 'Acquisitions & Sales', titleAr: 'الاستحواذات والمبيعات', descriptionEn: 'Due diligence, SPA drafting, and title transfer for commercial and residential properties.', descriptionAr: 'العناية الواجبة وصياغة اتفاقية البيع والشراء ونقل الملكية للعقارات التجارية والسكنية.', icon: 'Home' },
      { id: 'f2', titleEn: 'Development Projects', titleAr: 'مشاريع التطوير', descriptionEn: 'Development management agreements, contractor appointments, off-plan regulatory compliance, and Oqood registration.', descriptionAr: 'اتفاقيات إدارة التطوير وتعيينات المقاولين والامتثال التنظيمي للوحدات على الخريطة وتسجيل عقود.', icon: 'Construction' },
      { id: 'f3', titleEn: 'Real Estate Finance', titleAr: 'تمويل العقارات', descriptionEn: 'Mortgage structuring, Islamic finance facilities, and security documentation for lenders and borrowers.', descriptionAr: 'هيكلة الرهون العقارية والتمويل الإسلامي ووثائق الضمان للمقرضين والمقترضين.', icon: 'Banknote' },
    ],
    steps: [
      { id: 's1', number: 1, titleEn: 'Title Verification', titleAr: 'التحقق من الملكية', descriptionEn: 'We conduct DLD searches and review all title documents, encumbrances, and service charge liabilities.', descriptionAr: 'نجري عمليات بحث في دائرة الأراضي والأملاك ونراجع جميع وثائق الملكية والأعباء ومستحقات الخدمة.' },
      { id: 's2', number: 2, titleEn: 'Transaction Structuring', titleAr: 'هيكلة المعاملة', descriptionEn: 'Advising on optimal ownership structure, including SPV/company ownership vs. individual title.', descriptionAr: 'تقديم المشورة بشأن هيكل الملكية الأمثل بما في ذلك ملكية الشركة الخاصة مقابل الملكية الفردية.' },
      { id: 's3', number: 3, titleEn: 'Documentation', titleAr: 'التوثيق', descriptionEn: 'Drafting and negotiating the SPA, lease, or development agreement and all ancillary documents.', descriptionAr: 'صياغة والتفاوض على اتفاقية البيع والشراء أو عقد الإيجار أو اتفاقية التطوير وجميع الوثائق المساعدة.' },
      { id: 's4', number: 4, titleEn: 'Registration & Transfer', titleAr: 'التسجيل والنقل', descriptionEn: 'Managing DLD registration, NOC procurement, and mortgage registration or discharge.', descriptionAr: 'إدارة تسجيل دائرة الأراضي والحصول على شهادة عدم الممانعة وتسجيل الرهن العقاري أو الإفراج عنه.' },
    ],
    useCases: [],
    faqs: [
      { id: 'faq1', questionEn: 'Can foreigners purchase freehold property in Dubai?', questionAr: 'هل يمكن للأجانب شراء عقارات تملك حر في دبي؟', answerEn: 'Yes, in designated freehold areas as gazetted by the Dubai Land Department. These include popular areas such as Dubai Marina, Downtown Dubai, Palm Jumeirah, and Jumeirah Lake Towers.', answerAr: 'نعم، في المناطق المخصصة للتملك الحر كما حددتها دائرة الأراضي والأملاك في دبي. وتشمل مناطق شهيرة مثل مرسى دبي ووسط مدينة دبي ونخلة جميرا.' },
    ],
    seoTitleEn: 'Real Estate Law UAE | Al-Rashid & Partners',
    seoTitleAr: 'قانون العقارات الإماراتي | الرشيد وشركاه',
    seoDescEn: 'Full-service real estate legal advice for developers, investors, and lenders across the UAE property market.',
    seoDescAr: 'استشارات قانونية عقارية متكاملة للمطورين والمستثمرين والمقرضين في سوق العقارات الإماراتية.',
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-06-02T09:00:00Z',
    publishedAt: '2026-01-10T12:00:00Z',
    author: 'Omar H.',
  },
  {
    id: 'pa-4',
    slug: 'employment-labour',
    status: 'draft',
    order: 4,
    titleEn: 'Employment & Labour Law',
    titleAr: 'قانون العمل والعمال',
    categoryEn: 'Employment & Labour',
    categoryAr: 'العمل والعمال',
    shortDescEn: 'Advisory and contentious employment services for employers and senior employees operating under UAE Federal Labour Law and the DIFC Employment Law.',
    shortDescAr: 'خدمات عمالية استشارية وخصومية لأصحاب العمل وكبار الموظفين العاملين في إطار قانون العمل الاتحادي الإماراتي وقانون العمل في مركز دبي المالي.',
    coverImageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80',
    coverAltEn: 'Professional employment law meeting',
    coverAltAr: 'اجتماع احترافي لقانون العمل',
    iconName: 'Users',
    about: { bodyEn: '', bodyAr: '' },
    features: [],
    steps: [],
    useCases: [],
    faqs: [],
    seoTitleEn: '',
    seoTitleAr: '',
    seoDescEn: '',
    seoDescAr: '',
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-06-04T11:00:00Z',
    publishedAt: null,
    author: 'Lena K.',
  },
];

// ─── Practice Area helpers ────────────────────────────────────────────────────

function practiceAreaSummary(pa: PracticeArea): PracticeAreaSummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { about, features, steps, useCases, faqs, ...rest } = pa;
  return rest;
}

// ─── Practice Area API ────────────────────────────────────────────────────────

// GET /api/admin/practice-areas
export async function adminGetPracticeAreas(): Promise<ApiResponse<PracticeAreaSummary[]>> {
  await delay();
  const sorted = [..._practiceAreas].sort((a, b) => a.order - b.order);
  return { data: sorted.map(practiceAreaSummary), meta: { total: _practiceAreas.length } };
}

// GET /api/admin/practice-areas/:slug
export async function adminGetPracticeArea(slug: string): Promise<ApiResponse<PracticeArea>> {
  await delay();
  const pa = _practiceAreas.find(p => p.slug === slug);
  if (!pa) throw { error: 'Not found', code: 'PRACTICE_AREA_NOT_FOUND' };
  return { data: pa };
}

// POST /api/admin/practice-areas
export async function adminCreatePracticeArea(req: CreatePracticeAreaRequest): Promise<ApiResponse<PracticeArea>> {
  await delay();
  const now = new Date().toISOString();
  const pa: PracticeArea = {
    id: `pa-${Date.now()}`,
    slug: req.slug,
    status: 'draft',
    order: _practiceAreas.length + 1,
    titleEn: req.titleEn,
    titleAr: '',
    categoryEn: 'Corporate & Commercial',
    categoryAr: '',
    shortDescEn: '', shortDescAr: '',
    coverImageUrl: '', coverAltEn: '', coverAltAr: '',
    iconName: 'Scale',
    about: { bodyEn: '', bodyAr: '' },
    features: [], steps: [], useCases: [], faqs: [],
    seoTitleEn: '', seoTitleAr: '', seoDescEn: '', seoDescAr: '',
    createdAt: now, updatedAt: now, publishedAt: null, author: 'Sarah A.',
  };
  _practiceAreas = [pa, ..._practiceAreas];
  return { data: pa };
}

// PUT /api/admin/practice-areas/:slug
export async function adminUpdatePracticeArea(slug: string, req: UpdatePracticeAreaRequest): Promise<ApiResponse<PracticeArea>> {
  await delay();
  const idx = _practiceAreas.findIndex(p => p.slug === slug);
  if (idx === -1) throw { error: 'Not found', code: 'PRACTICE_AREA_NOT_FOUND' };
  const updated = { ..._practiceAreas[idx], ...req, updatedAt: new Date().toISOString() };
  _practiceAreas = _practiceAreas.map((p, i) => i === idx ? updated : p);
  return { data: updated };
}

// PUT /api/admin/practice-areas/:slug/publish
export async function adminPublishPracticeArea(slug: string, publish: boolean): Promise<ApiResponse<PracticeArea>> {
  await delay();
  const idx = _practiceAreas.findIndex(p => p.slug === slug);
  if (idx === -1) throw { error: 'Not found', code: 'PRACTICE_AREA_NOT_FOUND' };
  const now = new Date().toISOString();
  const updated = {
    ..._practiceAreas[idx],
    status: (publish ? 'published' : 'draft') as PracticeArea['status'],
    publishedAt: publish ? now : _practiceAreas[idx].publishedAt,
    updatedAt: now,
  };
  _practiceAreas = _practiceAreas.map((p, i) => i === idx ? updated : p);
  return { data: updated };
}

// DELETE /api/admin/practice-areas/:slug
export async function adminDeletePracticeArea(slug: string): Promise<ApiResponse<{ ok: boolean }>> {
  await delay();
  _practiceAreas = _practiceAreas.filter(p => p.slug !== slug);
  return { data: { ok: true } };
}

// POST /api/admin/practice-areas/:slug/duplicate
export async function adminDuplicatePracticeArea(slug: string): Promise<ApiResponse<PracticeArea>> {
  await delay();
  const src = _practiceAreas.find(p => p.slug === slug);
  if (!src) throw { error: 'Not found', code: 'PRACTICE_AREA_NOT_FOUND' };
  const now = new Date().toISOString();
  const copy: PracticeArea = {
    ...JSON.parse(JSON.stringify(src)),
    id: `pa-${Date.now()}`,
    slug: `${src.slug}-copy`,
    status: 'draft',
    titleEn: `${src.titleEn} (Copy)`,
    titleAr: src.titleAr ? `${src.titleAr} (نسخة)` : '',
    publishedAt: null,
    order: _practiceAreas.length + 1,
    createdAt: now, updatedAt: now,
  };
  _practiceAreas = [copy, ..._practiceAreas];
  return { data: copy };
}

// Expose store
export function getPracticeAreasStore(): PracticeArea[] { return _practiceAreas; }
export function updatePracticeAreasStore(areas: PracticeArea[]) { _practiceAreas = areas; }

const _currentUser: ApiUser = {
  id: 'user-1', name: 'Sarah A.', email: 'sarah@alrashid-law.com', role: 'admin',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms = 120): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function pageSummary(p: ApiPage): ApiPageSummary {
  const { blocks, ...rest } = p;
  return { ...rest, blocksCount: blocks.length };
}

function snapshotRevision(page: ApiPage, note: string): ApiRevision {
  return {
    id: `rev-${Date.now()}`,
    pageId: page.id,
    label: `${note} — ${new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`,
    status: page.status,
    blocks: JSON.parse(JSON.stringify(page.blocks)),
    createdAt: new Date().toISOString(),
    author: _currentUser.name,
    note,
  };
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────
// POST /api/auth/login
export async function authLogin(email: string, _password: string): Promise<ApiResponse<{ user: ApiUser; token: string }>> {
  await delay();
  return { data: { user: _currentUser, token: 'mock-jwt-token-alrashid-2026' } };
}

// POST /api/auth/logout
export async function authLogout(): Promise<ApiResponse<{ ok: boolean }>> {
  await delay();
  return { data: { ok: true } };
}

// GET /api/auth/me
export async function authMe(): Promise<ApiResponse<ApiUser>> {
  await delay();
  return { data: _currentUser };
}

// ─── Legacy content endpoints ─────────────────────────────────────────────────
// GET /api/content
export async function getContent(): Promise<ApiResponse<{ heroTitleEn: string; heroTitleAr: string; contactEmail: string }>> {
  await delay();
  return { data: { heroTitleEn: 'Excellence in Law', heroTitleAr: 'التميز في القانون', contactEmail: 'info@alrashid-law.com' } };
}

// GET /api/articles
export async function getArticles(): Promise<ApiResponse<LegacyArticle[]>> {
  await delay();
  const articles: LegacyArticle[] = [
    { id: 'a1', slug: 'uae-commercial-law-2026', titleEn: 'UAE Commercial Law Updates 2026', titleAr: 'تحديثات قانون التجارة الإماراتي 2026', excerptEn: 'Key amendments to the Commercial Transactions Law...', excerptAr: 'التعديلات الرئيسية على قانون المعاملات التجارية...', publishedAt: '2026-05-20T10:00:00Z', category: 'Corporate' },
    { id: 'a2', slug: 'arbitration-trends-gulf', titleEn: 'Arbitration Trends in the Gulf', titleAr: 'اتجاهات التحكيم في الخليج', excerptEn: 'Regional arbitration centres are seeing record caseloads...', excerptAr: 'تشهد مراكز التحكيم الإقليمية أعباء قضايا قياسية...', publishedAt: '2026-04-15T09:00:00Z', category: 'Litigation' },
  ];
  return { data: articles, meta: { total: 2 } };
}

// GET /api/articles/:slug
export async function getArticle(slug: string): Promise<ApiResponse<LegacyArticle>> {
  await delay();
  const { data } = await getArticles();
  const article = data.find(a => a.slug === slug);
  if (!article) throw { error: 'Not found', code: 'ARTICLE_NOT_FOUND' };
  return { data: article };
}

// GET /api/practice-areas
export async function getPracticeAreas(): Promise<ApiResponse<LegacyPracticeArea[]>> {
  await delay();
  const areas: LegacyPracticeArea[] = [
    { id: 'pa1', slug: 'corporate-law', titleEn: 'Corporate Law', titleAr: 'قانون الشركات', descriptionEn: 'M&A, joint ventures, company formations across the GCC.', descriptionAr: 'الاندماج والاستحواذ، المشاريع المشتركة، تأسيس الشركات في دول مجلس التعاون.', icon: 'Briefcase' },
    { id: 'pa2', slug: 'litigation', titleEn: 'Litigation & Dispute Resolution', titleAr: 'التقاضي وحل النزاعات', descriptionEn: 'Representing clients before UAE and DIFC courts.', descriptionAr: 'تمثيل العملاء أمام محاكم الإمارات ومحاكم مركز دبي المالي العالمي.', icon: 'Scale' },
    { id: 'pa3', slug: 'real-estate', titleEn: 'Real Estate Law', titleAr: 'قانون العقارات', descriptionEn: 'Commercial and residential transactions, development projects.', descriptionAr: 'المعاملات التجارية والسكنية، مشاريع التطوير.', icon: 'Building' },
  ];
  return { data: areas };
}

// GET /api/practice-areas/:slug
export async function getPracticeArea(slug: string): Promise<ApiResponse<LegacyPracticeArea>> {
  await delay();
  const { data } = await getPracticeAreas();
  const area = data.find(a => a.slug === slug);
  if (!area) throw { error: 'Not found', code: 'PRACTICE_AREA_NOT_FOUND' };
  return { data: area };
}

// ─── Page endpoints ───────────────────────────────────────────────────────────
// GET /api/pages  (public — published only, no blocks)
export async function getPages(): Promise<ApiResponse<ApiPageSummary[]>> {
  await delay();
  return { data: _pages.filter(p => p.status === 'published').map(pageSummary), meta: { total: _pages.filter(p => p.status === 'published').length } };
}

// GET /api/pages/:slug  (public — published only, with blocks)
export async function getPage(slug: string): Promise<ApiResponse<ApiPage>> {
  await delay();
  const page = _pages.find(p => p.slug === slug && p.status === 'published');
  if (!page) throw { error: 'Not found', code: 'PAGE_NOT_FOUND' };
  return { data: page };
}

// GET /api/admin/pages  (admin — all pages)
export async function adminGetPages(): Promise<ApiResponse<ApiPageSummary[]>> {
  await delay();
  return { data: _pages.map(pageSummary), meta: { total: _pages.length } };
}

// POST /api/admin/pages
export async function adminCreatePage(req: CreatePageRequest): Promise<ApiResponse<ApiPage>> {
  await delay();
  const page: ApiPage = {
    id: `page-${Date.now()}`, ...req,
    status: req.status ?? 'draft', navVisible: false,
    seoTitleEn: '', seoTitleAr: '', seoDescEn: '', seoDescAr: '',
    blocks: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    publishedAt: null, author: _currentUser.name,
  };
  _pages = [..._pages, page];
  return { data: page };
}

// PUT /api/admin/pages/:slug
export async function adminUpdatePage(slug: string, req: UpdatePageRequest): Promise<ApiResponse<ApiPage>> {
  await delay();
  const idx = _pages.findIndex(p => p.slug === slug);
  if (idx === -1) throw { error: 'Not found', code: 'PAGE_NOT_FOUND' };
  const updated = { ..._pages[idx], ...req, updatedAt: new Date().toISOString() };
  _pages = _pages.map((p, i) => i === idx ? updated : p);
  return { data: updated };
}

// DELETE /api/admin/pages/:slug
export async function adminDeletePage(slug: string): Promise<ApiResponse<{ ok: boolean }>> {
  await delay();
  _pages = _pages.filter(p => p.slug !== slug);
  return { data: { ok: true } };
}

// POST /api/admin/pages/:slug/blocks
export async function adminCreateBlock(slug: string, req: CreateBlockRequest): Promise<ApiResponse<ApiBlock>> {
  await delay();
  const idx = _pages.findIndex(p => p.slug === slug);
  if (idx === -1) throw { error: 'Not found', code: 'PAGE_NOT_FOUND' };
  const block: ApiBlock = { id: `block-${Date.now()}`, type: req.type, order: _pages[idx].blocks.length, data: req.data ?? {} };
  const updated = { ..._pages[idx], blocks: [..._pages[idx].blocks, block], updatedAt: new Date().toISOString() };
  _pages = _pages.map((p, i) => i === idx ? updated : p);
  return { data: block };
}

// PUT /api/admin/pages/:slug/blocks/:blockId
export async function adminUpdateBlock(slug: string, blockId: string, req: UpdateBlockRequest): Promise<ApiResponse<ApiBlock>> {
  await delay();
  const pageIdx = _pages.findIndex(p => p.slug === slug);
  if (pageIdx === -1) throw { error: 'Not found', code: 'PAGE_NOT_FOUND' };
  const blockIdx = _pages[pageIdx].blocks.findIndex(b => b.id === blockId);
  if (blockIdx === -1) throw { error: 'Not found', code: 'BLOCK_NOT_FOUND' };
  const updatedBlock = { ..._pages[pageIdx].blocks[blockIdx], data: req.data };
  const updatedBlocks = _pages[pageIdx].blocks.map((b, i) => i === blockIdx ? updatedBlock : b);
  _pages = _pages.map((p, i) => i === pageIdx ? { ...p, blocks: updatedBlocks, updatedAt: new Date().toISOString() } : p);
  return { data: updatedBlock };
}

// DELETE /api/admin/pages/:slug/blocks/:blockId
export async function adminDeleteBlock(slug: string, blockId: string): Promise<ApiResponse<{ ok: boolean }>> {
  await delay();
  const idx = _pages.findIndex(p => p.slug === slug);
  if (idx === -1) throw { error: 'Not found', code: 'PAGE_NOT_FOUND' };
  const updated = { ..._pages[idx], blocks: _pages[idx].blocks.filter(b => b.id !== blockId), updatedAt: new Date().toISOString() };
  _pages = _pages.map((p, i) => i === idx ? updated : p);
  return { data: { ok: true } };
}

// PUT /api/admin/pages/:slug/reorder-blocks
export async function adminReorderBlocks(slug: string, req: ReorderBlocksRequest): Promise<ApiResponse<ApiBlock[]>> {
  await delay();
  const idx = _pages.findIndex(p => p.slug === slug);
  if (idx === -1) throw { error: 'Not found', code: 'PAGE_NOT_FOUND' };
  const blockMap = new Map(_pages[idx].blocks.map(b => [b.id, b]));
  const reordered = req.blockIds.map((id, order) => ({ ...blockMap.get(id)!, order })).filter(Boolean);
  _pages = _pages.map((p, i) => i === idx ? { ...p, blocks: reordered, updatedAt: new Date().toISOString() } : p);
  return { data: reordered };
}

// PUT /api/admin/pages/:slug/publish
export async function adminPublishPage(slug: string, publish: boolean): Promise<ApiResponse<ApiPage>> {
  await delay();
  const idx = _pages.findIndex(p => p.slug === slug);
  if (idx === -1) throw { error: 'Not found', code: 'PAGE_NOT_FOUND' };
  const status = publish ? 'published' : 'draft';
  const publishedAt = publish ? new Date().toISOString() : _pages[idx].publishedAt;
  const updated = { ..._pages[idx], status, publishedAt, updatedAt: new Date().toISOString() };
  _pages = _pages.map((p, i) => i === idx ? updated : p);
  // Auto-snapshot revision on publish
  if (publish) _revisions = [snapshotRevision(updated, 'Published'), ..._revisions].slice(0, 20);
  return { data: updated };
}

// ─── Navigation endpoint ──────────────────────────────────────────────────────
// GET /api/admin/navigation
export async function adminGetNavigation(): Promise<ApiResponse<ApiNavItem[]>> {
  await delay();
  return { data: _navItems };
}

// PUT /api/admin/navigation
export async function adminUpdateNavigation(req: UpdateNavigationRequest): Promise<ApiResponse<ApiNavItem[]>> {
  await delay();
  _navItems = req.items.map((item, order) => ({ ...item, order }));
  return { data: _navItems };
}

// ─── Asset endpoints ──────────────────────────────────────────────────────────
// GET /api/admin/assets
export async function adminGetAssets(): Promise<ApiResponse<ApiAsset[]>> {
  await delay();
  return { data: _assets, meta: { total: _assets.length } };
}

// POST /api/admin/uploads
export async function adminUploadAsset(file: File, altEn = '', altAr = ''): Promise<ApiResponse<ApiAsset>> {
  await delay(600);
  // In production, upload to S3/R2. Here we create a fake object URL.
  const fakeUrl = `https://cdn.alrashid-law.com/uploads/${Date.now()}-${file.name}`;
  const asset: ApiAsset = {
    id: `asset-${Date.now()}`, filename: file.name,
    url: fakeUrl, thumbnailUrl: fakeUrl,
    type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
    mimeType: file.type, sizeBytes: file.size,
    width: null, height: null,
    altEn, altAr,
    uploadedAt: new Date().toISOString(), uploadedBy: _currentUser.name, usedInPages: [],
  };
  _assets = [..._assets, asset];
  return { data: asset };
}

// PUT /api/admin/assets/:id
export async function adminUpdateAsset(id: string, patch: Partial<Pick<ApiAsset, 'altEn' | 'altAr' | 'filename'>>): Promise<ApiResponse<ApiAsset>> {
  await delay();
  const idx = _assets.findIndex(a => a.id === id);
  if (idx === -1) throw { error: 'Not found', code: 'ASSET_NOT_FOUND' };
  const updated = { ..._assets[idx], ...patch };
  _assets = _assets.map((a, i) => i === idx ? updated : a);
  return { data: updated };
}

// DELETE /api/admin/assets/:id
export async function adminDeleteAsset(id: string): Promise<ApiResponse<{ ok: boolean }>> {
  await delay();
  _assets = _assets.filter(a => a.id !== id);
  return { data: { ok: true } };
}

// ─── Revision endpoints ───────────────────────────────────────────────────────
// GET /api/admin/pages/:slug/revisions
export async function adminGetRevisions(slug: string): Promise<ApiResponse<ApiRevision[]>> {
  await delay();
  const page = _pages.find(p => p.slug === slug);
  if (!page) throw { error: 'Not found', code: 'PAGE_NOT_FOUND' };
  return { data: _revisions.filter(r => r.pageId === page.id) };
}

// POST /api/admin/pages/:slug/revisions  (create snapshot)
export async function adminSnapshotRevision(slug: string, note: string): Promise<ApiResponse<ApiRevision>> {
  await delay();
  const page = _pages.find(p => p.slug === slug);
  if (!page) throw { error: 'Not found', code: 'PAGE_NOT_FOUND' };
  const rev = snapshotRevision(page, note);
  _revisions = [rev, ..._revisions].slice(0, 20);
  return { data: rev };
}

// POST /api/admin/pages/:slug/revisions/:revId/restore
export async function adminRestoreRevision(slug: string, revId: string): Promise<ApiResponse<ApiPage>> {
  await delay();
  const pageIdx = _pages.findIndex(p => p.slug === slug);
  if (pageIdx === -1) throw { error: 'Not found', code: 'PAGE_NOT_FOUND' };
  const rev = _revisions.find(r => r.id === revId);
  if (!rev) throw { error: 'Not found', code: 'REVISION_NOT_FOUND' };
  const restored = { ..._pages[pageIdx], blocks: JSON.parse(JSON.stringify(rev.blocks)), status: rev.status, updatedAt: new Date().toISOString() };
  _pages = _pages.map((p, i) => i === pageIdx ? restored : p);
  _revisions = [snapshotRevision(restored, 'Restored'), ..._revisions].slice(0, 20);
  return { data: restored };
}

// Expose store for direct state access in UI (avoids needing to call API in-app)
export function getAssetsStore(): ApiAsset[] { return _assets; }
export function getRevisionsStore(pageId: string): ApiRevision[] { return _revisions.filter(r => r.pageId === pageId); }
export function addRevisionToStore(rev: ApiRevision) { _revisions = [rev, ..._revisions].slice(0, 20); }
