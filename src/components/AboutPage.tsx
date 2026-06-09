import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Scale, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Compass, 
  Globe, 
  Users, 
  FileText, 
  Handshake, 
  Shield, 
  Network, 
  Crown, 
  ChevronDown, 
  Quote, 
  Send,
  MessageSquare,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';
import { contentClient } from '../content/contentClient';
import type { CMSPublishedPageRecord } from '../types';

interface AboutPageProps {
  onScrollToContact: () => void;
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function splitParagraphs(value: unknown): string[] {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function AboutPage({ onScrollToContact }: AboutPageProps) {
  const { direction, language, t } = useLanguage();
  const { content } = useSiteContent();
  const siteSettings = content?.siteSettings;
  const [aboutCmsPage, setAboutCmsPage] = useState<CMSPublishedPageRecord | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Smooth scroll back to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadCmsAbout() {
      try {
        const page = await contentClient.getCmsPage('about');
        if (!cancelled) setAboutCmsPage(page);
      } catch {
        if (!cancelled) setAboutCmsPage(null);
      }
    }
    void loadCmsAbout();
    return () => {
      cancelled = true;
    };
  }, []);

  const aboutBlocks = useMemo(() => aboutCmsPage?.blocks ?? [], [aboutCmsPage]);
  const goalsBlock = useMemo(() => aboutBlocks.find((block) => block.type === 'cards'), [aboutBlocks]);
  const companyBlock = useMemo(() => aboutBlocks.find((block) => block.type === 'image-text'), [aboutBlocks]);
  const richTextBlocks = useMemo(() => aboutBlocks.filter((block) => block.type === 'rich-text'), [aboutBlocks]);
  const visionBlock = useMemo(() => richTextBlocks[0] ?? null, [richTextBlocks]);
  const missionBlock = useMemo(() => richTextBlocks[1] ?? richTextBlocks[0] ?? null, [richTextBlocks]);
  const aboutCtaBlock = useMemo(() => aboutBlocks.find((block) => block.type === 'cta'), [aboutBlocks]);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      const totalScrollable = scrollWidth - clientWidth;
      if (totalScrollable <= 0) return;
      const absoluteScroll = Math.abs(scrollLeft);
      const progress = Math.min(100, Math.max(0, (absoluteScroll / totalScrollable) * 100));
      setScrollProgress(progress);
    }
  };

  const scrollSlider = (dir: 'next' | 'prev') => {
    if (containerRef.current) {
      const scrollStep = containerRef.current.clientWidth * 0.85;
      const isRtl = direction === 'rtl';
      let amount = 0;
      if (isRtl) {
        amount = dir === 'next' ? -scrollStep : scrollStep;
      } else {
        amount = dir === 'next' ? scrollStep : -scrollStep;
      }
      containerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const fallbackGoals = [
    {
      title: t('تأصيل الثقافة القانونية', 'Rooting Legal Culture'),
      desc: t(
        'نشر وتأصيل الثقافة القانونية في المملكة العربية السعودية وفق أسس علمية متينة.',
        'Disseminating and rooting legal culture in the Kingdom of Saudi Arabia based on robust academic foundations.'
      ),
      icon: Scale,
    },
    {
      title: t('تأهيل الكفاءات الوطنية', 'Qualifying National Talents'),
      desc: t(
        'تبسيط العمل القانوني وتأهيل المحامين السعوديين المتدربين باكتساب الخبرات والمهارات القانونية الرفيعة.',
        'Simplifying legal workflow and qualifying Saudi trainee advocates by helping them acquire high-level legal expertise and skills.'
      ),
      icon: GraduationCap,
    },
    {
      title: t('إعداد الدراسات والبحوث', 'Preparing Legal Studies & Research'),
      desc: t(
        'تشجيع المختصين والمهتمين بالعمل القانوني لإعداد الدراسات والبحوث القانونية العميقة لخدمة المجتمع القانوني.',
        'Encouraging specialists and those interested in legal work to conduct deep legal studies and research to serve the judicial community.'
      ),
      icon: BookOpen,
    },
    {
      title: t('استراتيجيات النهوض المهني', 'Strategic Professional Growth'),
      desc: t(
        'اقتراح استراتيجيات النهوض بالعمل القانوني وتوسيع دائرة النشاط والتوجيه بمختلف الدول العربية الشقيقة.',
        'Proposing strategies for the advancement of legal work and expanding the circle of operations and counseling across sisterly Arab countries.'
      ),
      icon: TrendingUp,
    },
    {
      title: t('البرامج التوعوية والتعليمية', 'Awareness & Educational Programs'),
      desc: t(
        'التعاون من خلال دورات مخصصة لتدريب وتنمية مهارات المحامين المهنية والأخلاقية.',
        'Collaborating through specialized courses to train and develop advocates\' professional and ethical competencies.'
      ),
      icon: Award,
    },
    {
      title: t('تيسير الالتحاق بالمهنة', 'Facilitating Professional Admission'),
      desc: t(
        'مساعدة الكفاءات الشابة والراغبين بالالتحاق بالعمل القانوني لتحقيق أهدافهم بأبسط الطرق الفعالة.',
        'Supporting young talents and aspiring practitioners to join the legal sector and achieve their goals through simple, efficient routes.'
      ),
      icon: Compass,
    },
    {
      title: t('تنمية العلاقات الدولية', 'Cultivating International Relations'),
      desc: t(
        'بناء شراكات وتنمية العلاقات الدولية المتبادلة بين المؤسسات القانونية العربية وفتح قنوات الاتصال.',
        'Structuring partnerships and cultivating international mutual relations among Arab judicial entities and extending communication channels.'
      ),
      icon: Globe,
    },
    {
      title: t('تبادل الخبرات والنقاشات', 'Knowledge & Discussion Exchange'),
      desc: t(
        'عقد الندوات والمؤتمرات وتبادل التجارب الناجحة بين كبار المحامين والمستشارين على مستوى الوطن العربي.',
        'Convening symposia, conferences, and exchanging successful milestones among senior lawyers and consultants across the Arab world.'
      ),
      icon: Users,
    },
    {
      title: t('إصدار الأبحاث الشرعية والقانونية', 'Publishing Sharia & Legal Papers'),
      desc: t(
        'المساهمة بنشر البحوث والمقالات المتخصصة التي ينتفع بها المجتمع الإسلامي كافة.',
        'Contributing to the publication of specialized academic essays and articles that benefit the wider Islamic community.'
      ),
      icon: FileText,
    },
    {
      title: t('إبرام الاتفاقيات الإقليمية', 'Executing Regional Agreements'),
      desc: t(
        'التعاون الوثيق مع المراكز القانونية المعتمدة وإبرام الاتفاقيات الاستشارية مع دول العالم العربي والغربي.',
        'Fostering tight collaboration with accredited judicial centers and executing consulting treaties with Arab and Western nations.'
      ),
      icon: Handshake,
    },
    {
      title: t('المرافعة وحماية المصالح', 'Advocacy & Interest Protection'),
      desc: t(
        'المرافعة والمدافعة في كافة القضايا والدعاوى والمنازعات الناشئة بواسطة الأفراد أو الشركات أو الجهات الحكومية أو الدول.',
        'Advocating and defending in all lawsuits, cases, and disputes raised by individuals, companies, government bodies, or states.'
      ),
      icon: Shield,
    },
    {
      title: t('تكامل المكاتب الوطنية', 'National Firm Integration'),
      desc: t(
        'تدعيم سبل التعاون والارتباط مع كافة مكاتب المحاماة السعودية المعتمدة وتبادل الآراء وصقل المخرجات.',
        'Strengthening cooperation and integration links with all accredited Saudi law practices, exchanging views, and refining outcomes.'
      ),
      icon: Network,
    },
    {
      title: t('الارتقاء برصانة ومقام المهنة', 'Elevating Stature & Nobility'),
      desc: t(
        'العمل الدائم على الارتقاء بمقام مهنة المحاماة ومستويات أدائها ونزاهتها داخل وخارج المملكة العربية السعودية.',
        'Persistently striving to elevate the stature of advocacy, its performance standards, and absolute integrity within and outside Saudi Arabia.'
      ),
      icon: Crown,
    },
  ];

  const goals = useMemo(() => {
    const items = Array.isArray(goalsBlock?.data?.items)
      ? (goalsBlock.data.items as Array<Record<string, unknown>>)
      : [];
    if (items.length === 0) {
      return fallbackGoals;
    }

    return items.map((item, index) => ({
      title: language === 'ar'
        ? toStringValue(item.titleAr, fallbackGoals[index % fallbackGoals.length].title)
        : toStringValue(item.titleEn, fallbackGoals[index % fallbackGoals.length].title),
      desc: language === 'ar'
        ? toStringValue(item.descAr, '')
        : toStringValue(item.descEn, ''),
      icon: fallbackGoals[index % fallbackGoals.length].icon,
    }));
  }, [fallbackGoals, goalsBlock, language]);

  const companyParagraphsAr = useMemo(() => splitParagraphs(companyBlock?.data?.bodyAr), [companyBlock]);
  const companyParagraphsEn = useMemo(() => splitParagraphs(companyBlock?.data?.bodyEn), [companyBlock]);
  const visionParagraphsAr = useMemo(() => splitParagraphs(visionBlock?.data?.bodyAr), [visionBlock]);
  const visionParagraphsEn = useMemo(() => splitParagraphs(visionBlock?.data?.bodyEn), [visionBlock]);
  const missionParagraphsAr = useMemo(() => splitParagraphs(missionBlock?.data?.bodyAr), [missionBlock]);
  const missionParagraphsEn = useMemo(() => splitParagraphs(missionBlock?.data?.bodyEn), [missionBlock]);

  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div 
      className="bg-[#F1ECE3] overflow-hidden leading-relaxed text-[#1E1E1E] selection:bg-[#7B5A42] selection:text-white" 
      style={{ direction }}
    >
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section 
        id="about-hero" 
        className="relative min-h-screen flex items-center justify-center bg-[#121212] py-24 sm:py-32 overflow-hidden"
      >
        {/* Parallax Background Visual Layout */}
        <div className="absolute inset-0 z-0 opacity-45">
          <img 
            src="/images/luxury_legal_office_1780491575816.png" 
            alt="Corporate Legal Interior" 
            className="w-full h-full object-cover scale-105 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-transparent to-[#121212]" />
        </div>

        {/* Ambient Floating Particles */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-[20%] left-[15%] w-1.5 h-1.5 bg-[#A56A1E] rounded-full blur-[1px] animate-ping opacity-60" style={{ animationDuration: '4s' }} />
          <div className="absolute top-[45%] right-[20%] w-2 h-2 bg-[#7B5A42] rounded-full blur-[2px] animate-pulse opacity-60" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-[30%] left-[40%] w-1 h-1 bg-[#A56A1E] rounded-full opacity-40 animate-ping" style={{ animationDuration: '5s' }} />
          
          {/* Subtle gold lines of prestige design */}
          <svg className="w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="0" x2="10%" y2="100%" stroke="#A56A1E" strokeWidth="0.5" />
            <line x1="90%" y1="0" x2="90%" y2="100%" stroke="#A56A1E" strokeWidth="0.5" />
            <circle cx="90%" cy="20%" r="4" fill="#A56A1E" />
            <circle cx="10%" cy="70%" r="3" fill="#A56A1E" />
          </svg>
        </div>

        {/* Cinematic Content Wrapper */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center space-y-8 select-none">
          
          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Small Label with Glow */}
            <div className="inline-flex items-center gap-2 self-center px-4 py-1.5 bg-[#A56A1E]/15 border border-[#A56A1E]/30 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#A56A1E] animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#F1ECE3] uppercase">
                {t(
                  siteSettings?.aboutHeroBadgeAr || 'بصمة السيادة والامتثال الدولي • عن الشركة',
                  siteSettings?.aboutHeroBadgeEn || 'IMPRINT OF SOVEREIGNTY & INTERNATIONAL COMPLIANCE • ABOUT US'
                )}
              </span>
            </div>

            {/* Main Premium Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight">
              {t(
                siteSettings?.aboutHeroTitleAr || 'شركة هشام حسن حنبولي الدولية',
                siteSettings?.aboutHeroTitleEn || 'Hesham Hanboly International'
              )}
              <span className="block mt-3 text-transparent bg-clip-text bg-gradient-to-l from-[#A56A1E] to-[#D8D1C7] font-extrabold text-3xl sm:text-4xl lg:text-5xl">
                {t('للاستشارات القانونية والمحاماة', 'for Legal Consultations and Advocacy')}
              </span>
            </h1>

            {/* Subtext Paragraph */}
            <p className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-gray-300 font-light leading-relaxed text-center">
              {t(
                siteSettings?.aboutHeroDescAr || 'خبرة قانونية احترافية تجمع بين الرؤية الاستراتيجية والمعايير الدولية لتقديم خدمات قانونية متكاملة للأفراد والشركات. نصون نموّك، ونُحصّن تعاقداتِك الوقائية بجودة تحكيمية مشهود لها بالتميز والموثوقية المطلقة.',
                siteSettings?.aboutHeroDescEn || 'Professional legal expertise combining strategic vision and international standards to deliver comprehensive legal services to individuals and enterprises. We safeguard your growth and shield your preventative contracts with celebrated arbitral quality of absolute trust and excellence.'
              )}
            </p>
          </motion.div>

          {/* Subtitle / Scroller Animation Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1, duration: 1 }}
            className="pt-12 flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => handleScrollToSection('about-company')}
          >
            <span className="text-xs tracking-widest text-[#A56A1E] font-medium">
              {t('سيرة وتطلعات المؤسسة', 'BIOGRAPHY & VISION OF THE FIRM')}
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ChevronDown className="w-5 h-5 text-[#A56A1E]" />
            </motion.div>
          </motion.div>

        </div>
      </section>


      {/* 2. ABOUT COMPANY SECTION */}
      <section 
        id="about-company" 
        className="py-24 sm:py-32 bg-[#F8F5EF] relative border-b border-[#D8D1C7]/50"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Side: Modern image composition as requested */}
            <div className="lg:col-span-5 relative order-last lg:order-first">
              {/* Luxury Frame Lines */}
              <div className={`absolute -top-4 ${language === 'ar' ? '-left-4' : '-right-4'} w-24 h-24 border-t-2 ${language === 'ar' ? 'border-l-2' : 'border-r-2'} border-[#A56A1E]/30 rounded-tl-xl pointer-events-none`} />
              <div className={`absolute -bottom-4 ${language === 'ar' ? '-right-4' : '-left-4'} w-24 h-24 border-b-2 ${language === 'ar' ? 'border-r-2' : 'border-l-2'} border-[#A56A1E]/30 rounded-br-xl pointer-events-none`} />

              <div className="rounded-xl overflow-hidden aspect-[4/5] bg-[#F1ECE3] shadow-2xl border border-[#D8D1C7] relative group">
                <img 
                  src="/images/luxury_books_meeting_1780493103320.png" 
                  alt="Modern executive legal room" 
                  className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/40 via-transparent to-transparent" />
              </div>
            </div>

            {/* Right Side: Typography Editorial details */}
            <div className="lg:col-span-7 space-y-8 text-start">
              
              <div className="space-y-4">
                <span className={`text-xs font-bold text-[#A56A1E] uppercase tracking-wider block ${language === 'ar' ? 'border-r-2 pr-3' : 'border-l-2 pl-3'} border-[#A56A1E]`}>
                  {t(
                    toStringValue(companyBlock?.data?.subheadingAr, 'مستشارينا الوطنيين وبنية الكفاءات'),
                    toStringValue(companyBlock?.data?.subheadingEn, 'OUR NATIONAL ADVISORS & TALENT INFRASTRUCTURE')
                  )}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#1E1E1E] leading-tight">
                  {t(
                    toStringValue(companyBlock?.data?.headingAr, 'أعضاء الشركة • الشريك القانوني للمستقبل'),
                    toStringValue(companyBlock?.data?.headingEn, 'OUR ASSOCIATES • STRATEGIC LEGAL PARTNER FOR THE FUTURE')
                  )}
                </h2>
              </div>

              <p className="text-[#4B4B4B] text-base leading-relaxed text-justify font-light">
                {t(
                  companyParagraphsAr[0] || toStringValue(companyBlock?.data?.bodyAr, 'تضم شركة هشام حسن حنبولي الدولية للاستشارات القانونية والمحاماة نخبة من المحامين والمستشارين القانونيين ذوي الكفاءة والخبرة في الناحيتين العلمية والعملية كلا في تخصصه، وذلك من أجل تقديم خدمة متميزة لعملائنا في كافة المجالات والنواحي القانونية المرتبطة بالشركات والأفراد. نحن نقف مع النظم التشريعية الصادرة وندرس أبعاد القضية بعناية استراتيجية.'),
                  companyParagraphsEn[0] || toStringValue(companyBlock?.data?.bodyEn, 'Hesham H. Hanboly International Law Firm & Legal Consultants incorporates an elite league of highly efficient, extensively experienced lawyers and legal practitioners across Sharia and conventional domains, each specialized to deliver outstanding service to our clients in all commercial and individual legal spheres. We align precisely with legislative systems and examine case dynamics with strategic care.')
                )}
              </p>

              {/* Supporting Highlight Luxury Glass Card */}
              <motion.div 
                whileHover={{ y: -6, boxShadow: "0 20px 40px -15px rgba(165,106,30,0.15)" }}
                className="p-6 sm:p-8 rounded-xl bg-[#F1ECE3]/85 border border-[#A56A1E]/30 backdrop-blur-md relative overflow-hidden transition-all duration-300 group"
              >
                {/* Custom inner glow and soft gradient lines */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#A56A1E]/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A56A1E] animate-ping" />
                    <h4 className="text-lg font-extrabold text-[#7B5A42]">
                      {t(
                        toStringValue(companyBlock?.data?.ctaPrimaryLabelAr, 'رعاية قانونية مستدامة'),
                        toStringValue(companyBlock?.data?.ctaPrimaryLabelEn, 'Sustainable Legal Care')
                      )}
                    </h4>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-[#1E1E1E] font-bold leading-relaxed">
                      {t(
                        companyParagraphsAr[1] || 'تعرفوا على مجموعة من أفضل محامين جدة تحت إشراف المحامي هشام حسن حنبولي',
                        companyParagraphsEn[1] || 'Consult with a group of Jeddah’s top-tier advocates under direct stewardship of Advocate Hesham H. Hanboly'
                      )}
                    </p>
                    <p className="text-xs sm:text-sm text-[#4B4B4B] font-light leading-relaxed text-justify">
                      {t(
                        companyParagraphsAr[2] || 'محامي ومدير عام المركز ومحكم معتمد وعضو لجنة المحامين بالغرفة التجارية بمحافظة جدة. قيادة قضائية واثقة تصيغ معالم التحصين التجاري باقتدار.',
                        companyParagraphsEn[2] || 'Advocate, Managing Director, certified Arbitrator, and member of the Lawyers’ Committee at the Jeddah Chamber of Commerce. A confident judicial leadership structuring corporate defensive strategy with authority.'
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>

            </div>

          </div>
        </div>
      </section>


      {/* 3. VISION SECTION (Dark Cinematic Luxury) */}
      <section 
        id="about-vision" 
        className="py-24 sm:py-32 bg-[#121212] text-[#F1ECE3] relative overflow-hidden border-b border-[#A56A1E]/30"
      >
        {/* Abstract Gold Legal Line Art Background */}
        <div className="absolute inset-0 opacity-[0.12] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#A56A1E" strokeWidth="0.75" />
            <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#A56A1E" strokeWidth="0.75" />
            <circle cx="20%" cy="40%" r="5" fill="#A56A1E" />
            <circle cx="80%" cy="80%" r="8" fill="#A56A1E" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#A56A1E" strokeWidth="0.5" strokeDasharray="6 6" />
          </svg>
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-[#A56A1E] tracking-widest uppercase block">
              {t(
                toStringValue(visionBlock?.data?.subheadingAr, 'نصنع بصمتنا في صرح العدالة والتمثيل الدولي'),
                toStringValue(visionBlock?.data?.subheadingEn, 'MARKING OUR LEGACY IN JUSTICE & GLOBAL REPRESENTATION')
              )}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              {t(
                toStringValue(visionBlock?.data?.headingAr, 'رؤيـتـنـا الاستراتيجية'),
                toStringValue(visionBlock?.data?.headingEn, 'OUR STRATEGIC VISION')
              )}
            </h2>
            <div className="h-[2px] w-16 bg-[#A56A1E] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start justify-between">
            
            {/* Editorial Paragraphs Block (8 cols) */}
            <div className="lg:col-span-8 space-y-6 text-start">
              
              <p className="text-sm sm:text-base leading-relaxed text-justify text-gray-300 font-light">
                {t(
                  visionParagraphsAr[0] || toStringValue(visionBlock?.data?.bodyAr, 'تتمثل رؤية الشركة في أن تكون الوجهة القضائية للمواطنين السعوديين وملتقى المحامين السعوديين والمتقاضين من كافة الجنسيات في كافة احتياجاتهم القانونية بأن تتبوأ الشركة مكاناً إقليمياً ودولياً رائداً في مجال المحاماة والاستشارات القانونية. وعبر تأمين خبراء قانونيون متخصصون مشهود لهم بالكفاءة والجودة والتميز، نضمن انسجام الشركة مع أفضل الممارسات القانونية العالمية وتلبيتها الدائمة لمعايير النزاهة والموضوعية والمهنية والاستقلالية التامة في عملها.'),
                  visionParagraphsEn[0] || toStringValue(visionBlock?.data?.bodyEn, 'Our ultimate vision is to stand as the primary judicial destination for Saudi citizens, and a unified forum for Saudi attorneys and litigants of all cultures in all their legal needs, securing a leading regional and international posture in advocacy and research. By sourcing specialized experts of celebrated competence and excellence, we construct full cohesion with global best practices, meeting rigorous criteria of integrity, objectivity, professionalism, and absolute independence.')
                )}
              </p>

              <blockquote className={`border-[#A56A1E] ${language === 'ar' ? 'border-r-4 pr-5' : 'border-l-4 pl-5'} py-2 my-6 text-[#A56A1E] text-base sm:text-lg font-bold leading-relaxed text-justify bg-white/5 rounded-md`}>
                {t(
                  visionParagraphsAr[1] || '« نسعى لتوفير جميع متطلبات نجاح العمل القانوني من خلال تقديم البيئة الملائمة للعمل والمعلومات المطلوبة برصانة مهنية مطلقة للوصول إلى النتائج المرغوبة بيسر وأمان. »',
                  visionParagraphsEn[1] || '“We strive to deliver all requirements for legal success by offering the ideal operational workspace and premium knowledge-bases with absolute professional rigor to accomplish desired outcomes with security and ease.”'
                )}
              </blockquote>

              <p className="text-xs sm:text-sm leading-relaxed text-justify text-gray-400 font-light">
                {t(
                  visionParagraphsAr[2] || 'ومن ثم فإن الشركة هي نتاج التفكير العميق في تأسيس مؤسسة قانونية دولية خاصة مستقلة مستندة في نظامها على القيم الإسلامية السامية التي أسس دعائمها الملك المؤسس/ عبد العزيز آل سعود (يرحمه الله) ولكي تكون الشركة رافداً ورائداً ينضم لمنظومة المؤسسات القانونية الدولية الهادفة والداعمة لنشر الفكر والثقافة القانونية في بلادنا وليكون للمملكة العربية السعودية دور بارز في المجال القانوني أسوة بإخواننا في العالم الإسلامي وفي دول مجلس التعاون الخليجي.',
                  visionParagraphsEn[2] || 'Consequently, the firm is the crown of deep deliberation in establishing a private, independent international legal institution grounded physically on the lofty Islamic values laid down by the Founder King Abdulaziz Al Saud (may God rest his soul in peace); built to serve as a leading tributary in the network of international legal bodies promoting legal intelligence in our nation, and guaranteeing a luminous global role for Saudi Arabia alongside our peers in the GCC.'
                )}
              </p>

            </div>

            {/* Quote Cards Visual Aspect (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="p-8 rounded-xl bg-white/5 border border-white/15 backdrop-blur-md relative overflow-hidden text-start">
                <Quote className={`w-12 h-12 text-[#A56A1E]/15 absolute -top-1 ${language === 'ar' ? '-left-1 -rotate-12' : '-right-1 rotate-12'}`} />
                <h4 className="text-sm font-bold text-[#A56A1E] mb-2 uppercase font-mono tracking-wider">
                  {t('ركائز الرؤية', 'VISION FOUNDATIONS')}
                </h4>
                <div className="space-y-3 pt-3 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A56A1E]" />
                    <span>{t('النزاهة والوصول لأقوى المناهج القانونية العالمية', 'Absolute integrity and sourcing global methodologies')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A56A1E]" />
                    <span>{t('مواكبة التغير المستمر في الاقتصاد والتشريعات السعودية', 'Evolving in sync with rapid Saudi economic & regulatory transformation')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A56A1E]" />
                    <span>{t('تدريب متكامل لأجيال المستقبل من الكوادر القانونية', 'Comprehensive training for upcoming generations of legal practitioners')}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-[#A56A1E]/10 to-transparent border border-[#A56A1E]/35 text-start">
                  <p className="text-xs text-gray-400 leading-relaxed text-justify">
                    {t(
                    companyParagraphsAr[1] || '* تتبنى إدارة الشركة فلسفة الفهم الشامل لحماية الأمن التعاقدي ورأس المال الأجنبي تماشياً مع مبادرات التنمية الاقتصادية الشاملة بالمملكة.',
                    companyParagraphsEn[1] || '* Our management adopts a multi-dimensional philosophy in defensive transactional design and safeguarding foreign investments in alignment with Saudi Vision industrial initiatives.'
                    )}
                  </p>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* 4. MISSION SECTION (Light Luxury Alternating Timeline-inspired) */}
      <section 
        id="about-mission" 
        className="py-24 sm:py-32 bg-[#F1ECE3] relative border-b border-[#D8D1C7]"
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-20 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-[#A56A1E] uppercase tracking-widest block">
              {t(
                toStringValue(missionBlock?.data?.subheadingAr, 'نلتزم بتقديم العون وترسيخ قواعد الإنصاف'),
                toStringValue(missionBlock?.data?.subheadingEn, 'COMMITTED TO DELIVERING ASSISTANCE & CONSOLIDATING JUSTICE')
              )}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1E1E]">
              {t(
                toStringValue(missionBlock?.data?.headingAr, 'رسـالـتـنـا'),
                toStringValue(missionBlock?.data?.headingEn, 'OUR MISSION')
              )}
            </h2>
            <div className="h-[2px] w-12 bg-[#A56A1E] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Typography Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-start">
              
              <p className="text-base sm:text-lg leading-relaxed text-justify text-[#1E1E1E] font-medium">
                {t(
                  missionParagraphsAr[0] || toStringValue(missionBlock?.data?.bodyAr, 'تتمثل رسالة الشركة في السعي من خلال سنوات العمل المهني الممتدة لترسيخ قواعد مركز قانوني وطني يستند نظامه الأساسي إلى قواعد الشريعة السمحاء لدرء المفاسد عن المجتمع السعودي وجلب المصالح له، ومن ثم تقديم خدمات قانونية شاملة وحقيقية وملموسة ذات جودة نوعية عالية.'),
                  missionParagraphsEn[0] || toStringValue(missionBlock?.data?.bodyEn, 'Our mission is focused on leveraging our extensive professional tenure to entrench the pillars of a premier national legal center, grounded constitutionally on Sharia values to prevent harm and bring prosperity to the Saudi community, subsequently rendering comprehensive, physical legal solutions of ultimate qualitative standards.')
                )}
              </p>

              <blockquote className={`border-[#7B5A42] ${language === 'ar' ? 'border-r-4 pr-5' : 'border-l-4 pl-5'} py-1 text-xs sm:text-sm text-[#4B4B4B] leading-relaxed text-justify bg-[#F8F5EF] p-4 rounded-md`}>
                {t(
                  missionParagraphsAr[1] || 'نسهم حثيثاً في تطور الحياة والنشاطات القانونية لفض النزاعات بين الأفراد والشركات في مجالات الحياة المتسارعة والمتطورة في وسائلها وأنواعها وأدواتها لضمان ثبات ونمو الحراك الاستثماري.',
                  missionParagraphsEn[1] || 'We actively participate in the evolution of legal practices, resolving disputes among individuals and corporate systems across accelerating, highly modern transactional environments, thereby cementing the growth and sustainability of investment dynamics.'
                )}
              </blockquote>

              <p className="text-sm text-[#4B4B4B] leading-relaxed font-light text-justify">
                {t(
                  missionParagraphsAr[2] || 'ومن ثم فإن الشركة تسعى لتكون مرساة لقواعد العدالة والإنصاف بزيادة الوعي الثقافي القانوني لدى كافة أفراد المجتمع السعودي والشركات والأعمال في المملكة الشامخة وخارجها.',
                  missionParagraphsEn[2] || 'The firm operates tirelessly to establish a safe anchor for equity and justice by empowering legal literacy across all tiers of the Saudi community, corporate entities, and global associations working within our sovereign bounds and beyond.'
                )}
              </p>

            </div>

            {/* Visual Timeline composition (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className={`relative ${language === 'ar' ? 'pl-6 pr-0' : 'pl-0 pr-6'} space-y-8 before:content-[''] before:absolute ${language === 'ar' ? 'before:right-3' : 'before:left-3'} before:top-2 before:bottom-2 before:w-[1.5px] before:bg-[#D8D1C7]`}>
                
                {/* Timeline item 1 */}
                <div className={`relative ${language === 'ar' ? 'pr-8 pl-0' : 'pl-8 pr-0'}`}>
                  <div className={`absolute ${language === 'ar' ? 'right-1' : 'left-1'} leading-none top-1 w-4 h-4 rounded-full bg-[#A56A1E] border-4 border-[#F1ECE3]`} />
                  <h4 className="text-sm font-extrabold text-[#1E1E1E]">{t('ترسيخ القواعد الشرعية والأنظمة', 'Entrenching Sharia & Regulations')}</h4>
                  <p className="text-xs text-[#4B4B4B] mt-1 font-light text-justify">
                    {t(
                      'بناء أمن تعاقدي يتفق مع الشريعة السمحاء والأنظمة القانونية الصادرة بالمملكة.',
                      'Securing contracts that seamlessly align with Saudi regulations and ethical codes.'
                    )}
                  </p>
                </div>

                {/* Timeline item 2 */}
                <div className={`relative ${language === 'ar' ? 'pr-8 pl-0' : 'pl-8 pr-0'}`}>
                  <div className={`absolute ${language === 'ar' ? 'right-1' : 'left-1'} leading-none top-1 w-4 h-4 rounded-full bg-[#7B5A42] border-4 border-[#F1ECE3]`} />
                  <h4 className="text-sm font-extrabold text-[#1E1E1E]">{t('خدمات قانونية شاملة وملموسة', 'Comprehensive & Direct Solutions')}</h4>
                  <p className="text-xs text-[#4B4B4B] mt-1 font-light text-justify">
                    {t(
                      'تقديم حلول حقيقية ذات جودة نوعية عالية تكون دائماً في متناول أيدي أفراد المجتمع.',
                      'Providing realistic, top-tier judicial resolutions designed to safeguard community rights.'
                    )}
                  </p>
                </div>

                {/* Timeline item 3 */}
                <div className={`relative ${language === 'ar' ? 'pr-8 pl-0' : 'pl-8 pr-0'}`}>
                  <div className={`absolute ${language === 'ar' ? 'right-1' : 'left-1'} leading-none top-1 w-4 h-4 rounded-full bg-[#A56A1E] border-4 border-[#F1ECE3]`} />
                  <h4 className="text-sm font-extrabold text-[#1E1E1E]">{t('مرساة لقواعد العدل والمساواة', 'Anchor for Equity and Parity')}</h4>
                  <p className="text-xs text-[#4B4B4B] mt-1 font-light text-justify">
                    {t(
                      'حسم الخلافات عبر تسوية النزاعات وزيادة مستويات الوعي بالامتثال الوقائي المستدام.',
                      'Resolving complex legal conflicts, settling disputes, and expanding awareness of preventative shielding.'
                    )}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* 5. GOALS SECTION (Interactive Premium Legal Goals) */}
      <section 
        id="about-goals" 
        className="py-24 sm:py-32 bg-[#F8F5EF] relative overflow-hidden"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center space-y-4 mb-20 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-[#A56A1E] uppercase tracking-widest block">
              {t(
                toStringValue(aboutCtaBlock?.data?.subheadingAr, 'رؤية واعية تصيغ جودة الغايات والخدمات'),
                toStringValue(aboutCtaBlock?.data?.subheadingEn, 'A VISUAL PERCEPTION ARCHITECTING MAGNIFICENT OBJECTIVES')
              )}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#1E1E1E]">
              {t(
                toStringValue(aboutCtaBlock?.data?.headingAr, 'أهـدافـنـا'),
                toStringValue(aboutCtaBlock?.data?.headingEn, 'OUR CORPORATE OBJECTIVES')
              )}
            </h2>
            <p className="text-base text-[#4B4B4B] font-light max-w-xl mx-auto leading-relaxed">
              {t(
                toStringValue(aboutCtaBlock?.data?.bodyAr, 'في شركة المحامي هشام حنبولي الدولية نسعى لتحقيق مجموعة من الأهداف الرئيسية.'),
                toStringValue(aboutCtaBlock?.data?.bodyEn, 'At Hesham Hanboly International Law Firm, we actively seek to accomplish key strategic goals.')
              )}
            </p>
            <div className="h-[2px] w-12 bg-[#A56A1E] mx-auto mt-4" />
          </div>

          {/* Premium Self-contained CSS for scrollbar hiding */}
          <style dangerouslySetInnerHTML={{__html: `
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}} />

          {/* Premium Slide Carousel Frame */}
          <div className="relative">
            
            {/* Navigation and Indicators Control Bar */}
            <div className="flex flex-row justify-between items-center mb-8 max-w-7xl mx-auto px-1">
              {/* Back/Forward circles */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => scrollSlider('prev')}
                  className="p-3 rounded-full border border-[#D8D1C7] text-[#1E1E1E] hover:bg-[#A56A1E] hover:text-white hover:border-[#A56A1E] transition-all duration-300 cursor-pointer shadow-xs active:scale-95 bg-[#F1ECE3]/40"
                  aria-label={t('السابق', 'Previous')}
                >
                  {direction === 'rtl' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => scrollSlider('next')}
                  className="p-3 rounded-full border border-[#D8D1C7] text-[#1E1E1E] hover:bg-[#A56A1E] hover:text-white hover:border-[#A56A1E] transition-all duration-300 cursor-pointer shadow-xs active:scale-95 bg-[#F1ECE3]/40"
                  aria-label={t('التالي', 'Next')}
                >
                  {direction === 'rtl' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </button>
              </div>

              {/* Fractional Status */}
              <div className="text-xs font-mono font-bold text-[#A56A1E] tracking-wider bg-[#A56A1E]/10 px-3 py-1.5 rounded-md border border-[#A56A1E]/15">
                {t(`تمرير تفاعلي • ${goals.length} أهداف رئيسية`, `Swipe To Explore • ${goals.length} Principal Objectives`)}
              </div>
            </div>

            {/* Scrollable track viewport */}
            <div 
              ref={containerRef}
              onScroll={handleScroll}
              className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 pt-4 -mx-4 px-4 scroll-smooth"
            >
              {goals.map((goal, idx) => {
                const IconComponent = goal.icon;
                return (
                  <div
                    key={idx}
                    className="w-[85%] sm:w-[46%] lg:w-[31%] shrink-0 snap-start"
                  >
                    <motion.div
                      whileHover={{ 
                        y: -8, 
                        boxShadow: "0 20px 40px -12px rgba(165,106,30,0.12)",
                        borderColor: "rgba(165,106,30,0.6)"
                      }}
                      className="h-full rounded-xl p-8 bg-[#F1ECE3]/80 border border-[#D8D1C7] flex flex-col justify-between text-start group transition-all duration-300 relative overflow-hidden min-h-[240px]"
                    >
                      <div className="space-y-6">
                        <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#A56A1E]/5 rounded-full blur-xl group-hover:bg-[#A56A1E]/10 transition-all duration-300" />
                        
                        <div className="p-3 bg-white border border-[#D8D1C7] rounded-xl text-[#A56A1E] w-12 h-12 flex items-center justify-center group-hover:bg-[#A56A1E] group-hover:text-white group-hover:border-[#A56A1E] transition-all duration-500">
                          <IconComponent className="w-6 h-6 stroke-[1.5] group-hover:scale-110 transition-transform duration-300" />
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-lg font-bold text-[#1E1E1E] group-hover:text-[#A56A1E] transition-colors duration-300 leading-tight">
                            {goal.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#4B4B4B] font-light leading-relaxed text-justify">
                            {goal.desc}
                          </p>
                        </div>
                      </div>

                      <div className={`h-[2px] w-0 bg-[#A56A1E] absolute bottom-0 ${language === 'ar' ? 'right-0' : 'left-0'} group-hover:w-full transition-all duration-500`} />
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* Scroll Progress Bar tracker */}
            <div className="mt-4 w-full h-[3px] bg-[#D8D1C7]/40 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-[#A56A1E] transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(10, scrollProgress)}%` }}
              />
            </div>

          </div>

        </div>
      </section>


      {/* 6. EXECUTIVE CTA SECTION */}
      <section 
        className="py-24 bg-[#121212] text-white relative overflow-hidden border-t-2 border-[#A56A1E]/40"
      >
        {/* Soft geometric design */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#A56A1E]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-[#7B5A42]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {t(
              toStringValue(aboutCtaBlock?.data?.headingAr, 'ابدأ رحلتك القانونية معنا'),
              toStringValue(aboutCtaBlock?.data?.headingEn, 'Begin Your Legal Journey With Us')
            )}
          </h2>
          
          <p className="text-base text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
            {t(
              toStringValue(aboutCtaBlock?.data?.bodyAr, 'فريق قانوني بخبرة احترافية ورؤية استراتيجية واضحة لحماية مصالحك المباشرة وتحقيق أهدافك التنموية والاستثمارية في ربوع المملكة وخارجها.'),
              toStringValue(aboutCtaBlock?.data?.bodyEn, 'A professional judicial vanguard of clear strategic vision, dedicated to sheltering your interests, and fulfilling your corporate expansion and investment goals across Saudi Arabia and worldwide.')
            )}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            
            <button
              onClick={onScrollToContact}
              className="w-full sm:w-auto px-8 py-4 rounded-lg bg-[#A56A1E] hover:bg-[#946B4B] text-white font-extrabold text-sm transition-all duration-300 hover:shadow-lg shadow-sm cursor-pointer flex items-center justify-center gap-3"
            >
              <Send className="w-4 h-4" />
              <span>{t(
                toStringValue(aboutCtaBlock?.data?.ctaPrimaryLabelAr, 'احجز استشارة ريادية'),
                toStringValue(aboutCtaBlock?.data?.ctaPrimaryLabelEn, 'Book Executive Assessment')
              )}</span>
            </button>

            <button
              onClick={onScrollToContact}
              className="w-full sm:w-auto px-8 py-4 rounded-lg bg-transparent hover:bg-white/5 border border-white/20 hover:border-white/50 text-[#F1ECE3] font-bold text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t(
                toStringValue(aboutCtaBlock?.data?.ctaSecondaryLabelAr, 'تواصل معنا الآن'),
                toStringValue(aboutCtaBlock?.data?.ctaSecondaryLabelEn, 'Connect With Us Now')
              )}</span>
            </button>

          </div>

        </div>
      </section>

    </div>
  );
}
