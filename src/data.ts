import { Service, TeamMember, CaseStudy, Testimonial, Article, HeroSlide } from './types';

export const servicesData: Service[] = [
  {
    id: 'commercial',
    titleAr: 'القضايا التجارية والمنازعات',
    titleEn: 'Commercial Litigation & Disputes',
    descriptionAr: 'تمثيل الشركات والتحالفات الاستثمارية في النزاعات العقدية، مسائل الإفلاس، والمسؤولية التقصيرية لحماية أصولكم الاستراتيجية.',
    descriptionEn: 'Representing multinational conglomerates and sovereign funds in complex breach of contract, insolvency, and corporate liability suits.',
    icon: 'Briefcase',
    longDescriptionAr: 'نوفر منصة قوية للترافع والدفاع عن مصالح الشركات في نزاعات العقود ومسؤوليات الشركاء وتنفيذ الأحكام القضائية المعقدة محلياً ودولياً بحلول بالغة الدقة والاحتكام لمستجدات الأنظمة التجارية الحديثة.',
    longDescriptionEn: 'We deliver exceptional trial representation for high-value contractual disputes, shareholder liabilities, and regulatory enforcement actions in local courts and international tribunals.',
    detailsAr: [
      'الترافع في القضايا المالية المعقدة والشركات المتعثرة',
      'حماية حقوق الملكية الفكرية والعلامات التجارية للشركات',
      'نزاعات تصفية الشركات والاندماج والاستحواذ العدائي',
      'التقاضي الضريبي والزكوي والجمكي المتكامل'
    ],
    detailsEn: [
      'Litigating complex cross-border commercial and insolvency cases',
      'Protection of corporate intellectual property and brand trademarks',
      'Shareholder appraisal disputes and hostile takeover defenses',
      'Integrated tax, Zakat, and customs regulatory defense'
    ]
  },
  {
    id: 'arbitration',
    titleAr: 'التحكيم وتسوية المنازعات',
    titleEn: 'Arbitration & Conflict Resolution',
    descriptionAr: 'قضايا التحكيم التجاري المعقدة وتطبيق القواعد الدولية والمحلية لتوفير تسويات نافذة ذات جودة وأثر قانوني مضمون.',
    descriptionEn: 'Formidable international trade and construction arbitration using local, ICC, and GCC institutional frameworks.',
    icon: 'Scale',
    longDescriptionAr: 'نمتلك رصيداً بارزاً من صياغة ومباشرة إجراءات التحكيم كأعضاء محكمين معتمدين أو كأطراف دفاع أمام الهيئات واللجان شبه القضائية ومحكمة التحكيم الدولية للحد من مخاطر التقاضي وضمان سرعة الحسم.',
    longDescriptionEn: 'Our certified dispute neutrals and lead counsel possess deep experience litigating before local arbitral centers, the ICC, and international tribunals, securing assets efficiently.',
    detailsAr: [
      'تنفيذ وتسييل أحكام التحكيم المحلية والأجنبية بالمملكة',
      'التمثيل أمام هيئات التحكيم بمركز التحكيم التجاري السعودي',
      'صياغة شروط ومشارطات التحكيم الاستباقية في العقود الكبرى',
      'فض المنازعات والوساطة في قطاعات الطاقة والتعدين'
    ],
    detailsEn: [
      'Enforcing and annulling foreign and domestic arbitral awards',
      'Representation before the Saudi Center for Commercial Arbitration (SCCA)',
      'Drafting bulletproof arbitration and multi-tier conflict clauses',
      'Energy, mining, and strategic natural resource mediation'
    ]
  },
  {
    id: 'corporate',
    titleAr: 'تأسيس الشركات والاستشاري والـ MISA',
    titleEn: 'Corporate Structuring & MISA Investment',
    descriptionAr: 'توجيه المستثمرين الأجانب لتأسيس الكيانات، الحصول على رخص وزارة الاستثمار، والامتثال للأنظمة المحلية والاندماجات الكبرى.',
    descriptionEn: 'Guiding global enterprises and startups in securing MISA foreign ownership licenses, joint ventures, and total regulatory alignment.',
    icon: 'Building2',
    longDescriptionAr: 'نعد ركيزة أساسية لعمليات تأسيس وتحويل الشركات في المملكة وخارجها، ونقدم الدعم الاستشاري للمجموعات في استيفاء شروط الرخص الأجنبية ودعم التحالفات التجارية لتمكين الأعمال من النمو بموثوقية.',
    longDescriptionEn: 'We enable global brands to enter Saudi Arabia and the GCC market seamlessly, structuring joint ventures, limited liability entities, and securing fast-track investment approvals.',
    detailsAr: [
      'إصدار وتعديل تراخيص وزارة الاستثمار (MISA) بمرونة وسرعة',
      'إدارة صفقات الاندماج والاستحواذ (M&A) وفحص النفي للجهالة',
      'صياغة اتفاقيات الحوكمة ولوائح تنظيم العمل والمجالس الإدارية',
      'تمثيل الشركات في الاكتتابات العامة وتقديم الاستشارات السهمية'
    ],
    detailsEn: [
      'Fast-track issuance and remodeling of MISA investment licenses',
      'Comprehensive M&A due diligence, share purchases, and joint ventures',
      'Corporate governance guidelines and executive board alignment',
      'Capital markets, corporate IPO preparations, and secondary listings'
    ]
  },
  {
    id: 'realestate',
    titleAr: 'قضايا التطوير العقاري والإنشاءات',
    titleEn: 'Real Estate & Infrastructure Law',
    descriptionAr: 'حيازة الأراضي، عقود الفيديك، منازعات المقاولات، وتخطيط وهيكلة الصناديق الاستثمارية لرواد التطوير العمراني بمشاريع المملكة الكبرى.',
    descriptionEn: 'Land tenure, FIDIC infrastructure contracting, zoning regulations, and structuring premium real estate investment funds.',
    icon: 'Landmark',
    longDescriptionAr: 'من خلال مواكبة المشاريع الكبرى ورؤية المملكة 2030، نتولى صياغة ومراجعة عقود البنية التحتية والمقاولات، ونحل نزاعات التعديات وصكوك الملكية المعقدة بامتياز.',
    longDescriptionEn: 'Responding directly to GCC mega-projects, we advise premium developers, investment funds, and contractors on land acquisitions, planning permits, and FIDIC-compliant construction delivery.',
    detailsAr: [
      'تحرير وصياغة عقود الفيديك (FIDIC) والإنشاءات الاستراتيجية',
      'التقاضي في نزاعات ملكية وصكوك الأراضي والحدود والفسوحات',
      'تقديم المشورة لصناديق الاستثمار العقارية والتمويل الإسكاني',
      'حل نزاعات المطورين العقاريين والمقاولين لضمان استمرارية التشييد'
    ],
    detailsEn: [
      'Drafting and negotiating complex FIDIC and bespoke engineering contracts',
      'Zoning law, title deed regularization, and property boundary litigation',
      'Advising real estate investment trusts (REITs) and institutional lenders',
      'Dispute resolution between premium master developers and sub-contractors'
    ]
  },
  {
    id: 'advisory',
    titleAr: 'الاستشارات الوقائية وحوكمة المخاطر',
    titleEn: 'Preventative Advisory & Compliance',
    descriptionAr: 'صياغة الاستراتيجيات الاستباقية لتحصين المجموعات كشريك قانوني دوري يحمي الكيان من التبعات التشريعية والمخالفات المليونية.',
    descriptionEn: 'Bespoke strategic counsel shielding holding organizations with reliable audit checklists to preemptively mitigate litigation risk.',
    icon: 'Shield',
    longDescriptionAr: 'الوقاية هي الحجر الأساس لاستدامة الكيانات الاقتصادية. نقدم خدمات الفحص القانوني النافي للجهالة، ومراقبة الالتزام، والتوجيه القانوني السريع لمجالس الإدارة لحل المصاعب قبل نشوئها.',
    longDescriptionEn: 'Proactive juridical immunity saves enterprises substantial operational fallout. We develop continuous risk reviews, compliance audits, and legal guides that dynamic business environments require.',
    detailsAr: [
      'خدمة "المستشار القانوني الخارجي المخصص" للشركات الكبرى',
      'تقييم مخاطر العقود والشراكات الأجنبية الجديدة وصياغتها',
      'برامج امتثال مخصصة لمكافحة الاحتكار ومكافحة التستر التجاري',
      'حماية سرية البيانات والامتثال للأمن السيبراني والتشريعات الرقمية'
    ],
    detailsEn: [
      'Strategic retained "Outside General Counsel" services',
      'Pre-execution risk audits of multi-billion SAR international agreements',
      'Anti-trust, anti-money laundering, and trade cover-up compliance programs',
      'Cybersecurity, data governance, and technology framework alignment'
    ]
  },
  {
    id: 'labor',
    titleAr: 'القضايا العمالية والتنظيمية',
    titleEn: 'Labor & Employment Regulatory Law',
    descriptionAr: 'هيكلة عقود الموظفين التنفيذيين، فض نزاعات العمل، وحماية مصالح الشركات لدى اللجان العمالية بما يطابق مستجدات وزارة الموارد البشرية.',
    descriptionEn: 'Structuring executive labor contracts, handling employee separations, and defense before employment tribunals.',
    icon: 'Users',
    longDescriptionAr: 'ندير الملفات العمالية والحساسة بحكمة تضمن الحفاظ على سمعة الكيان التجاري وحماية حدوده المالية من الدعاوى الكيدية وتعزيز امتثاله لنظام العمل ولوائح الموارد البشرية بالمملكة.',
    longDescriptionEn: 'We address sophisticated labor cases and trade secrets protections with high discretion, aligning institutional human resources with the latest regulatory mandates of GOSI and MHRSD.',
    detailsAr: [
      'صياغة عقود التنفيذيين ومكافآت نهاية الخدمة وشروط عدم المنافسة',
      'تمثيل الشركات الكبرى أمام الهيئات واللجان الابتدائية والعليا لتسوية نزاعات العمل',
      'التحقيقات الداخلية للمؤسسات وصياغة لوائح تنظيم العمل والجزاءات',
      'إجراءات الامتثال لسياسات التوطين والتوظيف الدولي المعقدة'
    ],
    detailsEn: [
      'Drafting executive employment agreements and robust non-compete covenants',
      'Representing enterprise employers before labor resolution committees',
      'Conducting sensitive internal workplace investigations and policy updates',
      'Advising on nationalization (Saudization) targets and specialized cross-border talent'
    ]
  },
  {
    id: 'banking',
    titleAr: 'القضايا البنكية والمالية الرقمية',
    titleEn: 'Banking & Digital Finance Regulation',
    descriptionAr: 'صناعة التكنولوجيا المالية، حل النزاعات التمويلية المعقدة، والتوافق مع قوانين البنك المركزي ولجان الفصل في المخالفات المصرفية.',
    descriptionEn: 'FinTech innovations, debt restructurings, and institutional representation before central bank regulatory adjudicators.',
    icon: 'TrendingUp',
    longDescriptionAr: 'نمثل البنوك، شركات التمويل، ومنصات التقنية المالية الصاعدة في تحصيل وتسييل الضمانات وإعداد مستندات التمويل المشترك وصياغة سياسات الامتثال النقدي وفق المعايير المصرفية الوطنية.',
    longDescriptionEn: 'We guide digital asset firms, private lenders, and corporate borrowers through complex debt syndication, regulatory reporting, and critical proceedings before banking dispute dispute committees.',
    detailsAr: [
      'الترافع أمام لجنة الفصل في المخالفات والمنازعات المصرفية السندات وصكوك الدين',
      'هيكلة عقود التمويل الإسلامي، التورق، الاستصناع والإجارة',
      'دعم ترخيص منصات التقنية المالية والتمويل الجماعي لدى "ساما"',
      'متابعة ومباشرة قضايا الأوراق التجارية والمشتقات المالية بكفاءة عالية'
    ],
    detailsEn: [
      'Representation before SAMA Banking Disputes and Debt Adjudication Committees',
      'Structuring Islamic finance solutions, Sukuk issuances, and Murabaha protocols',
      'Regulated sandbox licensing for Sandbox/FinTech startups with SAMA and CMA',
      'Executing commercial debt collection, guarantees, and maritime asset claims'
    ]
  },
  {
    id: 'wealth',
    titleAr: 'إدارة الثروات وحماية الأوقاف',
    titleEn: 'Wealth Management & Family Offices',
    descriptionAr: 'هيكلة الشركات العائلية الكبرى، صياغة ميتشاقات العائلة، وتأسيس الأوقاف المبتكرة لضمان انتقال مستدام ومنظم للثروات عادلاً.',
    descriptionEn: 'Harnessing legal vehicles for succession planning, family office constitution drafting, and multi-generational trust allocations.',
    icon: 'Award',
    longDescriptionAr: 'نقدم حلولاً مخصصة تلائم العائلات التجارية العريقة لحفظ الإرث التجاري، وصياغة الدساتير العائلية وتجنب نزاعات الإرث من خلال الأوقاف المؤسسية وهيكلة الملكية لضمان بقائها للأجيال المتعاقبة.',
    longDescriptionEn: 'We partner with prominent Gulf conglomerates to design governance charts, write binding family rules, and create robust endowment structures preserving the legacy against generational fragmentation.',
    detailsAr: [
      'صياغة وإعداد مواثيق ودساتير الشركات العائلية وفصل الملكية عن الإدارة',
      'تأسيس وتسجيل الأوقاف الأهلية والمشتركة وفق أنظمة الهيئة العامة للأوقاف',
      'فض نزاعات التركات الكبرى وتقسيم الأصول بحلول ودية وقضائية متزنة',
      'إعادة هيكلة وحساب توزيع الأصول والحصص العقارية لعوائل الأعمال'
    ],
    detailsEn: [
      'Drafting custom family business charters to resolve ownership-management overlaps',
      'Establishing registered charitable and civil endowments with national regulatory bodies',
      'Resolving complex high-value estates via balanced mediation or structured distribution',
      'Restructuring asset portfolios and family offices for international tax and wealth resilience'
    ]
  }
];

export const teamMembersData: TeamMember[] = [
  {
    id: 'hesham',
    nameAr: 'هشام حنبلي',
    nameEn: 'Hesham Hanboly',
    roleAr: 'المؤسس والشريك المدير',
    roleEn: 'Founder & Managing Partner',
    experienceAr: 'خبرة تفوق ٢٢ عاماً في الاستشارات والتقاضي',
    experienceEn: '22+ Years of Prestige Jurisprudence & Counsel',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&h=600&q=80',
    bioAr: 'يعد المستشار هشام حنبلي مرجعاً رئيسياً لقضايا الاستثمار الأجنبي وتأسيس وتصفية الشركات في المملكة والمنطقة. على مدار مسيرته المهنية الممتدة، نجح في قيادة تسويات مالية وتجارية لجهات حكومية وخاصة عريقة بقيم تجاوزت مئات الملايين من الريالات. يتميز بنظرته الاستراتيجية وتكامله مع أحدث التشريعات السعودية والإقليمية.',
    bioEn: 'Advocate Hesham Hanboly is a seminal legal authority recognized across Saudi Arabia and the GCC for complex commercial dispute management, regulatory steering, and FDI consultation. Having representation for both massive state agencies and prominent private corporations, his strategic expertise has successfully arbitrated and litigated assets worth over 1B SAR.',
    email: 'h.hanboly@hanbolylaw.com',
    phone: '+966 11 405 9290',
    credentialsAr: [
      'عضو الهيئة السعودية للمحامين',
      'محكم دولي معتمد بوزارة العدل',
      'مستشار قانوني معتمد لدى عديد من الغرف التجارية والإقليمية',
      'بكالوريوس الأنظمة والقانون بمراتب الشرف'
    ],
    credentialsEn: [
      'Regulated Member of the Saudi Bar Association (SBA)',
      'Certified Arbitrator registered with the Ministry of Justice',
      'Senior Legal Retainer to premium national chambers and industrial conglomerates',
      'LLB in Corporate Law and Jurisprudence with Distinction'
    ]
  },
  {
    id: 'raed',
    nameAr: 'د. رائد السديري',
    nameEn: 'Dr. Raed Al-Sudairy',
    roleAr: 'مشرف قسم التحكيم والنزاعات العقدية',
    roleEn: 'Head of Arbitration & Treaty Disputes',
    experienceAr: 'أكثر من ١٥ عاماً في التحكيم وقضايا الإنشاءات',
    experienceEn: '15+ Years of International construction arbitration',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=600&q=80',
    bioAr: 'حصل الدكتور رائد على الدكتوراه في التحكيم التجاري من جامعة السوربون بباريس، وقاد بعض أكبر قضايا التحكيم العقاري والإنشائي بمشاريع البنية التحتية في الخليج. يتقن التعامل مع عقود الفيديك ومشارطات تسوية النزاعات الهندسية بكفاءة استثنائية.',
    bioEn: 'Dr. Raed earned his Ph.D. in International Dispute Resolution from Sorbonne University, Paris. He has directed several of the GCC’s largest construction, EPC, and infrastructure arbitral proceedings under SCCA, DIAC, and ICC codes, specializing in FIDIC disputes.',
    email: 'r.sudairy@hanbolylaw.com',
    phone: '+966 11 405 9291',
    credentialsAr: [
      'دكتوراه في التحكيم الدولي (جامعة السوربون، باريس)',
      'عضو مجمع المحكمين المعتمدين ببريطانيا (CIArb)',
      'مستشار مسجل لدى محاكم دبي المالية والسعودية العامة'
    ],
    credentialsEn: [
      'Ph.D. in International Arbitration (Sorbonne University, Paris)',
      'Fellow of the Chartered Institute of Arbitrators (FCIArb), UK',
      'Registered Counsel at elite Gulf commercial arbitration centers'
    ]
  },
  {
    id: 'nadine',
    nameAr: 'أ. نادين التميمي',
    nameEn: 'Nadine Al-Tamimi',
    roleAr: 'رئيسة شؤون الشركات والاستثمار الأجنبي',
    roleEn: 'Director of Corporate M&A and FDI',
    experienceAr: 'شغل مناصب استشارية وتنفيذية على مدى ١٢ عاماً',
    experienceEn: '12+ Years Directing FDI Inbound Investments',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=600&q=80',
    bioAr: 'تتولى الأستاذة نادين التنسيق المالي والقانوني لملفات الاستحواذ والاندماج بالمكتب، ولديها شراكات عمل وثيقة مع غرف وزارة الاستثمار وهيئة التجارة الخارجية لتسهيل دخول التحالفات الأجنبية للسوق السعودي بيسر وسهولة ورؤية متوافقة.',
    bioEn: 'Nadine counsels blue-chip brands, FinTechs, and PE enterprises entering the Saudi economic workspace under Vision 2030 initiatives. She specializes in corporate due diligence, MISA business compliance, antitrust clearance, and corporate restructuring.',
    email: 'n.tamimi@hanbolylaw.com',
    phone: '+966 11 405 9292',
    credentialsAr: [
      'ماجستير القانون التجاري الدولي (جامعة جورجتاون، واشنطن)',
      'مسؤولة ملف الامتثال للشركات المساهمة المدرجة هيئة السوق المالية',
      'مستشار قانوني أول لتأسيس الشركات الأجنبية برخص MISA'
    ],
    credentialsEn: [
      'LLM in International Business Law (Georgetown University, Washington D.C.)',
      'Accredited Compliance Adviser in Capital Markets & CMA Directives',
      'Senior Lead Officer for MISA setup and economic governance'
    ]
  },
  {
    id: 'faisal',
    nameAr: 'أ. فيصل بن سعود',
    nameEn: 'Faisal Bin Saud',
    roleAr: 'كبير مستشاري التقاضي العقاري والمالي',
    roleEn: 'Senior Executive Counsel, Property & Finance',
    experienceAr: 'خبرة مهنية في المحاكم العامة واللجان المصرفية ٢٠ عاماً',
    experienceEn: '20+ Years Representation in National Disputes',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&h=600&q=80',
    bioAr: 'التقاضي ذو الأثر وصياغة المذكرات الإعجازية هو شغف الأستاذ فيصل. نجح في تفكيك قضايا نزاع صكوك بالغة التعقيد وحقن أموال عملاء المكتب المصرفية بفضل تراكم معرفي عميق بقوانين التنفيذ وعقارات المملكة وحقوق الدائنين.',
    bioEn: 'Faisal drives major commercial property litigation, debt collection, and financial security defense. His comprehensive understanding of Saudi judicial history, local real estate reforms, and Banking Committee procedures gives client advocacy a supreme advantage.',
    email: 'f.saud@hanbolylaw.com',
    phone: '+966 11 405 9293',
    credentialsAr: [
      'عضو مؤسس لجمعية القانون العقاري بالرياض',
      'مدرب مرخص ومحامٍ مجاز أمام محكمة الاستئناف والمحكمة العليا',
      'مستشار معتمد في صياغة عقود التطوير والإيجار الحكيم لوزارة الإسكان'
    ],
    credentialsEn: [
      'Co-founding Contributor to Riyadh Real Estate Law League',
      'Licensed Advocate with rights of audience before the High Court of Appeal',
      'Accredited Drafting Specialist for institutional leasehold-reit projects'
    ]
  }
];

export const caseStudiesData: CaseStudy[] = [
  {
    id: 'case-1',
    titleAr: 'تسوية نزاع تجاري لشركة تشييد كبرى بقيمة ١٢٠ مليون ريال',
    titleEn: 'Landmark Settlement of 120M SAR Construction Dispute',
    categoryAr: 'فض المنازعات والتحكيم العقدية',
    categoryEn: 'Dispute Resolution & EPC EPC',
    clientAr: 'تحالف مقاولات ومطور عقاري محلي',
    clientEn: 'Heavy Infrastructure Consortium & Master Developer',
    outcomeAr: 'تسوية ودية ممتازة خارج المحكمة والحفاظ على الشراكة الاستراتيجية',
    outcomeEn: 'Successful multi-tier mediation protecting assets and joint ventures',
    resultAr: 'استعادة مستحقات مالية بنسبة ٩٤٪ وجدولة الأصول المتنازع عليها دون إيقاف المشروع.',
    resultEn: 'Restored 94% of outstanding receivables and commercialized disputed elements.',
    descriptionAr: 'قضية بالغة التعقيد شملت تداخلاً في عقود الفيديك وبنود البنية التحتية، قادينا جولات وساطة متلاحقة مكللة بالنجاح دون اللجوء للمحاكم التقليدية لضمان أسرع وقت وأقل تكلفة.',
    descriptionEn: 'The team managed multi-tiered negotiations, combining engineering audits and strict project governance, settling the deep contractual impasse in record time to bypass trial disruptions.',
    year: '2025'
  },
  {
    id: 'case-2',
    titleAr: 'تأسيس الاندماج والكيان الاستثماري لشركة أغذية أوروبية عملاقة',
    titleEn: 'FDI Corporate Setup for a European Food Giant',
    categoryAr: 'تأسيس الشركات والاستثمارات الأجنبية',
    categoryEn: 'Corporate Structuring & MISA Licensing',
    clientAr: 'مجموعة صناعات غذائية رائدة بالاتحاد الأوروبي',
    clientEn: 'Global Food Processing Conglomerate (EU)',
    outcomeAr: 'تأسيس وحصول الكيان على التراخيص برأس مال استثماري بلغ ٨٥ مليوناً',
    outcomeEn: 'Full MISA licensing and joint venture mapping with 85 Million SAR capital',
    resultAr: 'الحصول على المظلات الاستثمارية الميسرة وبدء سلسلة التوريد بالمملكة بامتياز في ٧ أسابيع فقط.',
    resultEn: 'Successfully acquired foreign ownership license and corporate registrations in 7 weeks.',
    descriptionAr: 'من خلال ممارسة مرنة، قمنا بصياغة هيكل الشركة في المملكة العربية السعودية بما يتوافق مع قيود الحوكمة المحلية، واستصدار تراخيص MISA وتفادي عقبات التستر والاندماج الاقتصادي.',
    descriptionEn: 'Structured the local Saudi entity, drafted complex shareholder deeds, secured MISA foreign direct investment license under tight administrative timelines to seed the GCC expansion.',
    year: '2025'
  },
  {
    id: 'case-3',
    titleAr: 'إلغاء حكم استحقاق وهمي ومحاربة التستر بقيمة ٤٥ مليون ريال',
    titleEn: 'Annulling a 45 Million SAR Fraudulent Debt Performance',
    categoryAr: 'التقاضي والاستئناف التجاري المالي',
    categoryEn: 'Commercial Litigation & Debt Defense',
    clientAr: 'مجموعة طبية عائلية ومجلس إدارتها',
    clientEn: 'Prestigious Family-Owned Medical Equipment Group',
    outcomeAr: 'صدور حكم نهائي من محكمة الاستئناف برد الدعوى وبطلان المطالبة نهائياً',
    outcomeEn: 'High-court victory annulling the claim and enforcing counter-restitution',
    resultAr: 'تبرئة ذمة العميل بنسبة ١٠٠٪ والرفع الجنائي لمرتكب التلفيق والمساعدة بالنظام.',
    resultEn: 'Complete exoneration of the corporate client, lifting of executive freezes.',
    descriptionAr: 'دعوى كيدية قائمة على أوراق تجارية مزورة وتواطؤ قديم من موظف سابق. تمكن خبراء التقاضي لدينا من نقض الأدلة عبر اختبارات المعاينة الفنية للخطوط وشهادة الشهود وإثبات البطلان.',
    descriptionEn: 'Through thorough handwriting forensics, digital accounting audits, and strategic litigation techniques, we dismantled a major fraudulent claim and won the appeal for our business client.',
    year: '2026'
  }
];

export const testimonialsData: Testimonial[] = [
  {
    id: 'test-1',
    quoteAr: 'مكتب هشام حنبلي ليس مجرد مستشار قانوني، بل هو شريك استراتيجي حقيقي. تميز الفريق بالرد السريع والقدرة الفائقة على قراءة مخاطر الصفقات وتفاديها.',
    quoteEn: 'Hesham Hanboly Law Firm acts as a core strategic partner. Their responsive experts demonstrate incredible foresight in identifying contract risks and resolving them before they grow.',
    authorAr: 'المهندس عبد العزيز الراجحي',
    authorEn: 'Eng. Abdulaziz Al-Rajhi',
    roleAr: 'نائب الرئيس التنفيذي للشؤون القانونية',
    roleEn: 'VP of Corporate Legal Affairs',
    companyAr: 'مجموعة الراجحي للصناعات والإنشاءات',
    companyEn: 'Al-Rajhi Industrial & Construction Group',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    rating: 5
  },
  {
    id: 'test-2',
    quoteAr: 'The precision with which Nadine Al-Tamimi and the team executed our corporate restructuring and foreign trade licenses in Riyadh was absolutely stellar. Exemplary professionalism.',
    quoteEn: 'The precision with which Nadine Al-Tamimi and the team executed our corporate restructuring and foreign trade licenses in Riyadh was absolutely stellar. Exemplary professionalism.',
    authorAr: 'ماركوس شولتز',
    authorEn: 'Marcus Scholtz',
    roleAr: 'العضو المنتدب للاستثمار الخليجي',
    roleEn: 'Managing Director of MENA Projects',
    companyAr: 'برلين هيدرو تكنولوجي المحدودة',
    companyEn: 'Berlin Hydro Technologies GmbH',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80',
    rating: 5
  },
  {
    id: 'test-3',
    quoteAr: 'وجهنا المستشار هشام في نزاع تحكيمي شائك فأنقذ شراكتنا واسترجع مستحقاتنا دون خسارة سمعتنا التجارية. نوصي بالمكتب وبشدة لكل شركة تبحث عن امتياز قانوني.',
    quoteEn: 'Advocate Hesham guided us in a sensitive arbitration. He saved our long partnership and reclaimed payments without risking corporate prestige. Highly recommended commercial counsels.',
    authorAr: 'د. ياسمين بكر',
    authorEn: 'Dr. Yasmin Baker',
    roleAr: 'الرئيس التنفيذي للتطوير والريادة',
    roleEn: 'CEO & Founder',
    companyAr: 'مجموعة بكر للاستشارات الطبية والعلمية',
    companyEn: 'Baker Scientific & Health Group',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
    rating: 5
  }
];

export const articlesData: Article[] = [
  {
    id: 'art-1',
    titleAr: 'تعديلات نظام الشركات السعودي الجديد وأثره على الشراكات الأجنبية ٢٠٢٦',
    titleEn: 'The 2026 Saudi Corporate Law Amendments & Foreign Enterprise Impact',
    excerptAr: 'نناقش في هذا الطرح التسهيلات الممنوحة لتسجيل شركات الشخص الواحد الأجنبية، وقواعد المسؤولية التضامنية والتعديلات الجوهرية على حصص رأس المال.',
    excerptEn: 'An executive analysis on the newly introduced single-member foreign corporate vehicles, capital thresholds, and revised limited liability constraints.',
    date: '2026-05-18',
    categoryAr: 'أنظمة الاستثمار والشركات',
    categoryEn: 'Corporate Law Reforms',
    readTimeAr: 'قراءة ٥ دقائق',
    readTimeEn: '5 min read',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    contentAr: 'شهد الربع الأول من عام ٢٠٢٦ صدور تعديلات جوهرية تدعم ديناميكيات رؤية المملكة ٢٠٣٠، بهدف رفع معدلات الاستثمار الداخلي وتسهيل إجراءات الاندماج والاستحواذ. تشمل هذه القوانين تيسير شروط الائتمان وحماية صغار المساهمين وإتاحة مرونة أكبر لمجالس الإدارات لصياغة دساتير حوكمة غير مقيدة بأطر روتينية قديمة.',
    contentEn: 'The first quarter of 2026 marked a pivotal shift in Saudi Arabia’s business framework. Driven by Vision 2030, these legal updates streamline incoming FDI, remove traditional red tape for secondary liability, and optimize strategic compliance for international joint ventures.',
    authorAr: 'المحامية نادين التميمي',
    authorEn: 'Nadine Al-Tamimi, Esq'
  },
  {
    id: 'art-2',
    titleAr: 'استراتيجيات فض النزاعات الهندسية في عقود الفيديك الكبرى بالخليج',
    titleEn: 'Dispute Avoidance & Mediation in GCC Megaproject Infrastructure Contracts',
    excerptAr: 'آليات مجلس فض الخلافات (DAB) وكيفية التعامل مع مطالبات التأخير وتجاوز التكاليف في ضوء مشاريع البنية التحتية التنموية العملاقة.',
    excerptEn: 'Applying Dispute Adjudication Board (DAB) rules effectively to mitigate delayed delivery fines and unallocated resource pricing under FIDIC clauses.',
    date: '2026-04-12',
    categoryAr: 'عقود الإنشاءات والتحكيم',
    categoryEn: 'Arbitration & Construction',
    readTimeAr: 'قراءة ٧ دقائق',
    readTimeEn: '7 min read',
    image: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=800&q=80',
    contentAr: 'تشييد المدن المستعرضة والمطارات الجديدة يتطلب استباق النزاعات بقواعد تعاقدية بالغة الصلابة والمرونة. يستعرض هذا البحث كيف ساهم اختيار هيئة التحكيم المحلية ذات القواعد المرنة بمركز التحكيم التجاري السعودي في تقليص فترات جمود المشاريع المالية بنسبة ٥٠٪ مقارنة بالتحكيم الممتد في الخارج.',
    contentEn: 'Construction of super-scale economic centers demands proactive contractual immunity. This research article reveals how opting for localized arbitral pathways like the SCCA decreases financial project deadlock by 50% compared to traditional overseas tribunals.',
    authorAr: 'د. رائد السديري',
    authorEn: 'Dr. Raed Al-Sudairy'
  },
  {
    id: 'art-3',
    titleAr: 'دليل حوكمة الشركات العائلية: انتقال القيادة الآمن دون مخاطر التصفية',
    titleEn: 'Ultimate Guide to Family Business Governance & Leadership Succession',
    excerptAr: 'كيف تساهم المواثيق العائلية والأوقاف في حظر التفتت المالي وتنظيم إدارة الأجيال الثانية والثالثة لحصص الشراكة والمسؤولية.',
    excerptEn: 'How institutional business charters and secure civil endowments prevent capital dilution and maintain coherent operational leadership.',
    date: '2026-03-30',
    categoryAr: 'إدارة الثروات والأوقاف',
    categoryEn: 'Succession & Wealth Trusts',
    readTimeAr: 'قراءة ٦ دقائق',
    readTimeEn: '6 min read',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    contentAr: 'تعد النزاعات العائلية من أكبر مسببات زوال الشركات الكبرى تداولاً. تكمن القوة في فصل ملكية الأصول عن الإدارة المهنية، وهو الجيل الجديد من صياغة الهياكل بالأوقاف الخيرية والأهلية الموثقة بوزارة الموارد البشرية والعدل لضمان استدامة الأرباح والحد من تشتيت القرار.',
    contentEn: 'Family disputes remain the primary catalyst for the fragmentation of multi-billion dollar enterprises. Securing succession plans early, configuring professional board splits, and deploying legal family covenants establishes robust safeguards for future generations.',
    authorAr: 'المستشار هشام حنبلي',
    authorEn: 'Hesham Hanboly, Advocate'
  }
];

export const heroSlidesData: HeroSlide[] = [
  {
    id: 'about-company',
    badgeAr: 'من نحن',
    badgeEn: 'ABOUT US',
    badgeIcon: 'Scale',
    titleArLine1: 'شركة هشام حسن حنبولي الدولية',
    titleEnLine1: 'Hesham H. Hanboly International',
    titleArLine2: 'للاستشارات القانونية والمحاماة',
    titleEnLine2: 'Co. for Legal Consultations & Advocacy',
    descriptionAr: 'شركة هشام حسن حنبولي الدولية للاستشارات القانونية والمحاماة هي إحدى شركات المحاماة الكبرى في المملكة، وتضم نخبة من المحامين والمستشارين القانونيين ذوي الكفاءة والخبرة في مختلف التخصصات القانونية.',
    descriptionEn: 'Hesham H. Hanboly International Co. for Legal Consultations and Advocacy is a premier powerhouse law firm in the Kingdom, combining an elite elite of highly specialized advocates, defense arbiters, and legal consultants.',
    ctaTextAr: 'اعرف المزيد',
    ctaTextEn: 'Learn More',
    actionType: 'about',
    actionParam: 'about-hero',
    image: '/images/luxury_legal_office_1780491575816.png',
    imageAltAr: 'مكتب شركة هشام حسن حنبولي الدولية',
    imageAltEn: 'Hesham H. Hanboly Law Offices'
  },
  {
    id: 'sanad-al-tabeeb',
    badgeAr: 'خدمة متخصصة',
    badgeEn: 'SPECIALIZED SERVICE',
    badgeIcon: 'ShieldCheck',
    titleArLine1: 'سند الطبيب',
    titleEnLine1: 'Doctor Shield',
    titleArLine2: 'درعك القانوني في ممارسة المهنة',
    titleEnLine2: 'Your Protective Legal Companion',
    descriptionAr: 'برنامج سنوي متخصص يوفر حماية قانونية متكاملة للأطباء والكوادر الصحية، ويشمل التمثيل القانوني والاستشارات والمتابعة القضائية.',
    descriptionEn: 'A comprehensive professional protective scheme custom-engineered for physicians and health practitioners in Saudi Arabia. Practice with absolute clarity and legal confidence.',
    highlightBox: {
      priceAr: '٢٣٠٠ ريال سنوياً',
      priceEn: '2,300 SAR / Year',
      noteAr: 'شامل ضريبة القيمة المضافة',
      noteEn: 'VAT Fully Included'
    },
    ctaTextAr: 'اشترك الآن',
    ctaTextEn: 'Subscribe Now',
    actionType: 'service-detail',
    actionParam: 'doctor-shield',
    image: '/images/saudi_doctor_shield_1780660866668.png',
    imageAltAr: 'سند الطبيب - حماية قانونية للأطباء',
    imageAltEn: 'Doctor Shield Legal Protection'
  },
  {
    id: 'featured-service',
    badgeAr: 'خدمة مميزة',
    badgeEn: 'FEATURED SERVICE',
    badgeIcon: 'Sparkles',
    titleArLine1: 'استشارة قانونية متخصصة',
    titleEnLine1: 'Specialized Legal Consultation',
    titleArLine2: 'حلول فورية ومحكمة ومدروسة',
    titleEnLine2: 'Precise and Expert Legal Solutions',
    descriptionAr: 'احصل على استشارة قانونية احترافية من نخبة من المحامين والمستشارين القانونيين في مختلف التخصصات.',
    descriptionEn: 'Acquire high-caliber consulting from our firm\'s top partners and legal theorists tailored to maximize business protection and strategic safety.',
    ctaTextAr: 'طلب استشارة',
    ctaTextEn: 'Request Consultation',
    actionType: 'contact',
    image: '/images/premium_consultation_1780660885439.png',
    imageAltAr: 'استشارة قانونية متخصصة',
    imageAltEn: 'Specialized Legal Consultations'
  }
];

