export interface ServiceItem {
  slug: string;
  titleAr: string;
  titleEn: string;
  categorySlug: 'advisory' | 'litigation' | 'transactional';
  categoryAr: string;
  categoryEn: string;
  shortDescAr: string;
  shortDescEn: string;
  aboutAr: string[];
  aboutEn: string[];
  features: { ar: string; en: string; descAr: string; descEn: string }[];
  processSteps: { ar: string; en: string; descAr: string; descEn: string }[];
  useCases: { ar: string; en: string }[];
  faq: { qAr: string; qEn: string; aAr: string; aEn: string }[];
}

export const serviceCategories = {
  advisory: {
    ar: 'استشارات قانونية للأفراد والجهات الخاصة',
    en: 'Legal Advisory for Corporates & Individuals'
  },
  litigation: {
    ar: 'القضايا وتسوية النزاعات',
    en: 'Litigation & Conflict Resolution'
  },
  transactional: {
    ar: 'إتمام المعاملات بكافة أنواعها',
    en: 'Transactional Execution & Advisory'
  }
};

// Raw definitions to power 20 dynamic pages via dynamic generation or precise customization
export const rawServices: Omit<ServiceItem, 'categoryAr' | 'categoryEn' | 'aboutAr' | 'aboutEn' | 'features' | 'processSteps' | 'useCases' | 'faq'>[] = [
  // القسم الأول
  {
    slug: 'commercial-consultations',
    titleAr: 'استشارات القضايا التجارية',
    titleEn: 'Commercial Disputes Advisory',
    categorySlug: 'advisory',
    shortDescAr: 'تمكين وحماية الشركات والمؤسسات من خلال تقديم استشارات وقائية صلبة وتكييف تعاقدي حصين.',
    shortDescEn: 'Empowering and shielding commercial enterprises through rigorous preventative advice and contractual fortification.'
  },
  {
    slug: 'financial-consultations',
    titleAr: 'استشارات القضايا المالية',
    titleEn: 'Corporate Finance Advisory',
    categorySlug: 'advisory',
    shortDescAr: 'دراسة وتحصين المراكز المالية وصياغة الهياكل الاستثمارية المتينة لضمان استقرار التدفقات النقدية والالتزامات.',
    shortDescEn: 'Analyzing and securing corporate financial positions, mitigating structural exposure, and ensuring fiscal stability.'
  },
  {
    slug: 'banking-insurance',
    titleAr: 'استشارات قضايا البنوك والتأمين',
    titleEn: 'Banking & Insurance Advisory',
    categorySlug: 'advisory',
    shortDescAr: 'حلول وقائية متقدمة وممتثلة للأنظمة المصرفية والتكافلية مع لجان تسوية المنازعات التمويلية.',
    shortDescEn: 'Advanced preventative solutions compliant with banking frameworks and dispute settlement committees.'
  },
  {
    slug: 'civil-cases',
    titleAr: 'استشارات القضايا المدنية',
    titleEn: 'Civil Code Advisory',
    categorySlug: 'advisory',
    shortDescAr: 'صون الالتزامات والعهود وضمان الحقوق والمسؤوليات الناشئة عن المعاوضات والعقود المدنية.',
    shortDescEn: 'Safeguarding obligations, pledges, and responsibilities stemming from civil agreements and contracts.'
  },
  {
    slug: 'family-consultations',
    titleAr: 'استشارات الأحوال الشخصية والتركات',
    titleEn: 'Family Trusts & Succession Planning',
    categorySlug: 'advisory',
    shortDescAr: 'صياغة مواثيق الأسر والتركات وتأسيس الأوقاف والوصايا بالمنهجية الفقهية والشرعية المنضبطة.',
    shortDescEn: 'Structuring elite family trust charters, wills, and endowing estates in absolute harmony with Islamic jurisprudence.'
  },
  {
    slug: 'labor-consultations',
    titleAr: 'إعداد استشارات ولوائح وأنظمة العمل',
    titleEn: 'Employment & Corporate Compliance',
    categorySlug: 'advisory',
    shortDescAr: 'صياغة لوائح تنظيم العمل المعتمدة وتحصين المنشآت من النزاعات العمالية العرضية والتنظيمية.',
    shortDescEn: 'Structuring approved interior corporate work policies, preventing disruptive employee claims.'
  },
  {
    slug: 'real-estate-consultations',
    titleAr: 'استشارات قانونية في المجال العقاري',
    titleEn: 'Property Development & Real Estate',
    categorySlug: 'advisory',
    shortDescAr: 'متابعة الصفقات وحوكمة المشروعات العقارية الكبرى وضمان سلامة الإفراغات وتراخيص التطوير.',
    shortDescEn: 'Governing massive real estate joint-ventures, facilitating secure acquisition, titles, and development licenses.'
  },
  {
    slug: 'customs-tax-consultations',
    titleAr: 'استشارات الجمارك والضرائب',
    titleEn: 'Customs Duty & Tax Advisory',
    categorySlug: 'advisory',
    shortDescAr: 'ضمان أعلى درجات الامتثال الضريبي والزكوي والتعامل السليم مع حالات الفحص والاعتراض الجمركي.',
    shortDescEn: 'Ensuring absolute compliance with ZATCA rules, avoiding systemic exposure during custom clearance.'
  },
  {
    slug: 'ports-maritime-consultations',
    titleAr: 'استشارات أنظمة الموانئ والمرافق والجمارك',
    titleEn: 'Customs, Maritime & Port Regulations',
    categorySlug: 'advisory',
    shortDescAr: 'حوكمة الشحن البحري وعقود النقل وحل منازعات المرافق والموانئ وفق الأنظمة البحرية الدولية والمحلية.',
    shortDescEn: 'Navigating shipping and maritime charters, resolving harbor conflicts according to international and local treaties.'
  },
  {
    slug: 'doctor-shield',
    titleAr: 'سند الطبيب',
    titleEn: 'Doctor Shield',
    categorySlug: 'advisory',
    shortDescAr: 'مشروع فريد من نوعه في المملكة يوفر حماية قانونية سنوية متكاملة للكوادر الطبية والعاملين في القطاع الصحي.',
    shortDescEn: 'A unique annual integrated legal protection program for medical professionals and healthcare workers in Saudi Arabia.'
  },

  // القسم الثاني
  {
    slug: 'commercial-litigation',
    titleAr: 'القضايا التجارية',
    titleEn: 'Commercial Litigation',
    categorySlug: 'litigation',
    shortDescAr: 'المرافعات والتمثيل القضائي أمام المحاكم التجارية في النزاعات التعاقدية ومطالبات الشركاء وتصفية الشركات.',
    shortDescEn: 'Representing prestigious corporations in contractual disputes, shareholder deadlocks, and firm liquidations.'
  },
  {
    slug: 'financial-litigation',
    titleAr: 'القضايا المالية',
    titleEn: 'Financial Claims',
    categorySlug: 'litigation',
    shortDescAr: 'تحصيل ديون الشركات وإدارة دعاوى المطالبات المالية المعقدة والتمثيل أمام اللجان المختصة لتسوية المطالبات.',
    shortDescEn: 'Enforcing financial claims and debt retrievals for corporations before specialized Saudi judicial panels.'
  },
  {
    slug: 'criminal-cases',
    titleAr: 'القضايا الجنائية',
    titleEn: 'White-Collar & Corporate Criminal Law',
    categorySlug: 'litigation',
    shortDescAr: 'الترافع لحماية الكيانات من جرائم غسل الأموال، والرشوة، والتزوير، وجرائم المعلوماتية والشركات.',
    shortDescEn: 'Strategic defense against white-collar corporate crimes, money laundering, bribery, forgery, and data breaches.'
  },
  {
    slug: 'civil-litigation',
    titleAr: 'القضايا المدنية',
    titleEn: 'Civil & General Litigation',
    categorySlug: 'litigation',
    shortDescAr: 'المرافعة الفعالة في نزاعات التعويضات والأضرار وإثبات الحقوق وحل الخلافات العقدية للأفراد والمؤسسات.',
    shortDescEn: 'Exquisite advocacy in compensation, tort liability, contract breaches, and property disputes.'
  },
  {
    slug: 'family-litigation',
    titleAr: 'قضايا الأحوال الشخصية والتركات',
    titleEn: 'Succession & Estates Litigation',
    categorySlug: 'litigation',
    shortDescAr: 'التمثيل القضائي في دعاوى تصفية التركات وتوزيع الأصول بالطرق القضائية والشرعية المنضبطة لمنع تشتت الثروة.',
    shortDescEn: 'Representing partners and heirs in estate distribution, avoiding wealth dilution through cohesive litigation.'
  },
  {
    slug: 'enforcement-judgments',
    titleAr: 'تنفيذ الأحكام',
    titleEn: 'Enforcement of Judgments',
    categorySlug: 'litigation',
    shortDescAr: 'متابعة طلبات تنفيذ الأحكام والقرارات والتحصيلات السريعة أمام دوائر محاكم التنفيذ بالمملكة.',
    shortDescEn: 'Aggressively pursuing judgment executions, financial recoveries, and asset attachments before Saudi Enforcement Courts.'
  },
  {
    slug: 'labor-litigation',
    titleAr: 'القضايا العمالية',
    titleEn: 'Labor & Workplace Disputes',
    categorySlug: 'litigation',
    shortDescAr: 'التمثيل أمام المحاكم العمالية في قضايا التعويض الفسخ والامتيازات وحقوق الهيئات التنفيذية العليا.',
    shortDescEn: 'Pristine representation in wrongful terminations, wage audits, and senior executive severance settlements.'
  },
  {
    slug: 'banking-customs-disputes',
    titleAr: 'قضايا المنازعات المصرفية والجمركية',
    titleEn: 'Banking & Customs Adjudication',
    categorySlug: 'litigation',
    shortDescAr: 'المنازعات البنكية والاعتمادات المستندية وخاضعي الرقابة والضرائب أمام اللجان الضريبية والجمركية والمصرفية.',
    shortDescEn: 'Adjudicating banking facility disagreements, customs assessments, and letters of credit before ZATCA committees.'
  },

  // القسم الثالث
  {
    slug: 'company-formation',
    titleAr: 'تأسيس الشركات وهيكلتها',
    titleEn: 'Corporate Structuring & Incorporation',
    categorySlug: 'transactional',
    shortDescAr: 'تحويل المؤسسات الفردية وصياغة عقود التأسيس الشاملة للشركات وهيكلتها الضريبية والقانونية بالمملكة.',
    shortDescEn: 'Converting sole proprietorships, drafting articles of association, and optimizing legal and tax structures.'
  },
  {
    slug: 'investment-licensing',
    titleAr: 'تراخيص الاستثمار',
    titleEn: 'MISA Foreign Direct Investment Licensing',
    categorySlug: 'transactional',
    shortDescAr: 'استخراج وتعديل تراخيص وزارة الاستثمار (MISA) وتأسيس فروع الشركات الأجنبية ووضع الاستراتيجية المناسبة.',
    shortDescEn: 'Securing, renewing, and converting foreign direct investment licenses under MISA for multinational players.'
  },
  {
    slug: 'legal-studies',
    titleAr: 'إعداد الدراسات القانونية',
    titleEn: 'Bespoke Juridical Studies & Auditing',
    categorySlug: 'transactional',
    shortDescAr: 'صياغة المذكرات القانونية الشاملة للأنظمة وصياغة دراسات تقييم المخاطر وتجنب التعارض التنظيمي.',
    shortDescEn: 'Drafting rigorous compliance manuals, risk analysis reports, and preempting regulatory violations.'
  }
];

// Reconstruct metadata dynamically with elite Arabic/English legal context for every page
export const getServicePageData = (slug: string): ServiceItem => {
  const raw = rawServices.find(s => s.slug === slug) || rawServices[0];
  const cat = serviceCategories[raw.categorySlug];

  // Tailored features dynamically generated or contextualized to practice area
  const baseFeatures = [
    {
      ar: 'تقييم الموقف القانوني',
      en: 'Primary Legal Auditing',
      descAr: 'دراسة وتحليل شامل ومعمق لكافة المستندات والخلفية القانونية لتحديد نقاط القوة والضعف مبكراً.',
      descEn: 'Comprehensive deep audit of primary contracts and context to detect institutional strengths and weaknesses early.'
    },
    {
      ar: 'الاستشارة والتحصين الوقائي',
      en: 'Preventative Counseling',
      descAr: 'طرح الحلول البديلة والبدائل الآمنة لتقليل احتمالات حدوث أي تصادم قضائي أو مالي مستقبلي.',
      descEn: 'Designing bulletproof alternative transactional pathways to steer completely clear of active disputes.'
    },
    {
      ar: 'الصياغة القانونية المحكمة',
      en: 'Rigorous Contractual Drafting',
      descAr: 'تحرير العقود والمذكرات القانونية بلغة تشريعية رصينة تمنع التأويل وتضمن حقوق ومصالح العميل.',
      descEn: 'Formulating legal briefs and declarations in precision-engineered text that eliminates interpretive ambiguity.'
    },
    {
      ar: 'التمثيل والتمكين القضائي',
      en: 'Executive Judicial Advocacy',
      descAr: 'تمثيل العميل وقضاياه بأعلى مستويات المصداقية والحضور القوي أمام كافة الهيئات القضائية واللجان.',
      descEn: 'Representing stakes before diverse regulators and supreme judiciary channels with profound expertise.'
    },
    {
      ar: 'حوكمة الامتثال والأنظمة',
      en: 'Regulatory Framework Compliance',
      descAr: 'مطابقة خطط وأعمال العميل مع الأنظمة السعودية واللوائح التنفيذية النافذة لوزارة العدل والجهات الحكومية.',
      descEn: 'Formulating corporate strategy in perfect sync with updated Saudi Arabian Council of Ministers resolutions.'
    },
    {
      ar: 'المتابعة والتقارير الدورية',
      en: 'Intelligent Case Reporting',
      descAr: 'إبقاء الشريك على اطلاع دوري ومستمر بكافة التطورات التشريعية والقضائية والوقائعية.',
      descEn: 'Equipping our corporate client with regular systemic updates and strategic roadmap notifications.'
    }
  ];

  // Let's customize features for unique sections
  if (raw.slug === 'legal-studies') {
    baseFeatures[0] = { ar: 'جمع وتحصيل البيانات', en: 'Data Synthesis & Gathering', descAr: 'استقصاء وجمع الحقائق المرتبطة بدراسة النظم ومصادر القوانين بجدة والرياض.', descEn: 'Investigating and compiling historical factors, legislative backgrounds, and custom regional guidelines.' };
    baseFeatures[1] = { ar: 'التحليل والتحصين المفاهيمي', en: 'Juridical Text Analysis', descAr: 'تحليل دقيق للأوامر الملكية واللوائح الحكومية والقرارات الوزارية المقارنة.', descEn: 'Critical analysis of Royal Decrees, Ministerial resolutions, and comparative jurisprudences.' };
    baseFeatures[2] = { ar: 'تقييم وتوجيه المخاطر', en: 'Risk Mitigation Modeling', descAr: 'توقع احتمالات التعارض الإجرائي ووضع الحلول البديلة لتلافيها.', descEn: 'Forecasting potential execution delays and offering mitigation workarounds.' };
  }

  const baseProcess = [
    {
      ar: 'استلام الطلب والتعاقد',
      en: 'Intake & File Activation',
      descAr: 'الحصول على تفاصيل القضية ومراجعة المستندات الأولية بهوية إلكترونية آمنة وسرية.',
      descEn: 'Secure onboarding, executing non-disclosure agreements, and activating client records.'
    },
    {
      ar: 'دراسة الموقف القانوني',
      en: 'Rigorous Merits Analysis',
      descAr: 'عقد جلسة بحث متخصصة بين المستشاريين والمحامين لاستكشاف ثغرات ونقاط القوة في المسألة القانونية.',
      descEn: 'Collaborating in professional council meetings to explore precedent statutes and legal angles.'
    },
    {
      ar: 'وضع الخطة الوقائية والاستراتيجية',
      en: 'Strategic Roadmap Design',
      descAr: 'بناء خارطة طريق محكمة للمرافعة والتمثيل أو صياغة البنود والوثائق المطلوبة لدرء النزاع.',
      descEn: 'Formulating an optimized approach, including defense maps or proactive contractual shields.'
    },
    {
      ar: 'تحرير النصوص والمذكرات',
      en: 'Drafting & Quality Refinement',
      descAr: 'صياغة المذكرات الجوابية أو الاستشارات التفصيلية ومراجعتها من قبل المدير العام.',
      descEn: 'Drafting responses, briefs, or compliance outlines, undergoing intensive advisory board review.'
    },
    {
      ar: 'التشاور والتعديل النهائي',
      en: 'Client Consultation & Alignment',
      descAr: 'عرض المخرجات على الشركاء والمستثمرين لضمان تطابق الأهداف الواقعية مع الحلول النظامية.',
      descEn: 'Briefing our client to review drafts and align our operational mechanics on the ground.'
    },
    {
      ar: 'تفعيل المخرج أو التمثيل القضائي',
      en: 'Execution & Courtroom Launch',
      descAr: 'إيداع المذكرات في منصة ناجز التابعة لوزارة العدل أو تسليم المنتج النهائي محصناً.',
      descEn: 'Filing submissions via Najiz portal, presenting oral arguments, or handing over certified briefs.'
    }
  ];

  const useCases = [
    { ar: 'الشركات التجارية والاستثمارية', en: 'Commercial Conglomerates & Enterprises' },
    { ar: 'المستثمرون المحليون والدوليون', en: 'In-State & Global Direct Investors' },
    { ar: 'المؤسسات العائلية والشركات الناشئة', en: 'Elite Family Offices & Fast-Growth Startups' },
    { ar: 'الأفراد ذوي الملاءة المالية العالية', en: 'High Net-Worth Private Individuals' },
    { ar: 'الجهات الحكومية وشبه الحكومية', en: 'Public Entities & Government Bodies' }
  ];

  const faq = [
    {
      qAr: `كيف تضمن شركة حنبولي تحصين مصالحنا في ${raw.titleAr}؟`,
      qEn: `How does Hanboly secure our position regarding ${raw.titleEn}?`,
      aAr: `نعتمد على مبدأ الوقاية القانونية المسبقة وصنع استراتيجيات واقية تدرس الثغرات المحتملة في البيئة الاستشارية والقضائية قبل فوات الأوان وتحت الإشراف المباشر للمدير العام.`,
      aEn: `We employ aggressive defensive legal design, analyzing prospective procedural pitfalls in the Saudi court ecosystem before they manifest into active disputes.`
    },
    {
      qAr: 'ما هي مؤهلات الكادر الذي سيتولى دراسة ملف القضية أو الاستشارة؟',
      qEn: 'What are the credentials of the legal staff assigned to my file?',
      aAr: 'يضم فريقنا نخبة من المحامين المرخصين والمستشارين من حملة الشهادات العليا وأعضاء الهيئة السعودية للمحامين وبخبرة تمتد لعقود في حسم المنازعات التجارية والاستثمارية المعقدة.',
      aEn: 'Your file is governed by licensed practitioners, members of the Saudi Bar Association, holding detailed litigation and transactional expertise under active supervision of Advocate Hesham Hanboly.'
    },
    {
      qAr: 'هل تقدم خدماتكم لشركاء النجاح في كل من الرياض وجدة؟',
      qEn: 'Are services rendered globally and across both Riyadh and Jeddah branches?',
      aAr: 'نعم، نوفر تغطية قضائية واستشارية متكاملة لعملاء الشركة عبر فرع بجدة بالمقر الرئيسي أو الفرع الإداري بالرياض وبقية مناطق المملكة بكفاءة وامتثال شامل.',
      aEn: 'Yes, both of our fully operational branches in Jeddah and Riyadh coordinate in real-time, providing flawless litigation and dispute management nationwide.'
    },
    {
      qAr: 'ما هو متوسط الوقت المستغرق لإنجاز الدراسات أو المسار الجنائي والتجاري؟',
      qEn: 'What is the average timeline to complete a briefing or activate a defense?',
      aAr: 'يختلف ذلك بحسب حجم الملف ونوع الخدمة، ولكن كقاعدة عمل صارمة يتم تسليم المذكرات والاستشارات الأولية في غضون ٢ إلى ٥ أيام عمل على أقصى تقدير من استكمال الأوراق.',
      aEn: 'While dynamic and dependant on volume, draft reviews or emergency filings are processed and compiled within 2 to 5 business days from full record onboarding.'
    },
    {
      qAr: 'كيف نتعامل مع سرية وأمان البيانات المقدمة لشركة حنبولي؟',
      qEn: 'How is data confidentiality handled?',
      aAr: 'نلتزم التزاماً مطلقاً وسرياً بحماية كافة أسرار الموكلين التجارية والشخصية بناءً على لوائح نظام المحاماة وقواعد السلوك المهني بالمملكة العربية السعودية وبموجب اتفاقيات سرية موقعة.',
      aEn: 'We adhere to the absolute highest levels of professional secrecy. Under the Saudi Code of Advocacy Ethics, all corporate strategies, records, and briefs are cryptographically restricted.'
    }
  ];

  return {
    slug: raw.slug,
    titleAr: raw.titleAr,
    titleEn: raw.titleEn,
    categorySlug: raw.categorySlug,
    categoryAr: cat.ar,
    categoryEn: cat.en,
    shortDescAr: raw.shortDescAr,
    shortDescEn: raw.shortDescEn,
    aboutAr: [
      `تعتبر خدمة (${raw.titleAr}) أحد الركائز والأعمدة الجوهرية التي تميزت بها شركة هشام حسن حنبولي الدولية للاستشارات القانونية والمحاماة. نسخر في هذا الباب الكفاءة الفقهية والخبرة القضائية المتراكمة على مدى قرابة العقود الثلاثة لتسوية النزاعات وتحقيق غايات الأمان الوقائي للشركات والأفراد والجهات الاستشارية والتمويلية بالمملكة العربي السعودية.`,
      `من خلال مراجعة القضايا وصياغة الحلول القانونية المبتكرة ومرافقة المستثمرين، يؤمن فريقنا الوقاية المطلوبة لإطراف التعامل لتلافي التعطيل المالي أو الخلاف الصادم، ممتثلين بالكامل مع غايات وتوجهات رؤية المملكة ٢٠٣٠ لتعزيز جودة ونزاهة البيئة الاستثمارية والقضائية والعدلية.`
    ],
    aboutEn: [
      `The practice of (${raw.titleEn}) sits at the absolute core of Hesham H. Hanboly International Firm’s elite competencies. We leverage deep-rooted judicial wisdom and extensive local precedence built over decades to provide prestige litigation and preemptive advisory services for corporate giants, startups, and families across Saudi Arabia.`,
      `By structuring sophisticated alternative resolutions and aligning operational strategies, our attorneys secure seamless business continuity and shield dynamic commerce from financial or contractual friction, driving growth in alignment with Saudi Vision 2030.`
    ],
    features: baseFeatures,
    processSteps: baseProcess,
    useCases: useCases,
    faq: faq
  };
};

export const getRelatedServices = (currentSlug: string): ServiceItem[] => {
  const current = rawServices.find(s => s.slug === currentSlug) || rawServices[0];
  const related = rawServices.filter(s => s.categorySlug === current.categorySlug && s.slug !== currentSlug);
  
  // Return top 3 related ones, wrapped in full dynamic structures
  return related.slice(0, 3).map(r => getServicePageData(r.slug));
};
