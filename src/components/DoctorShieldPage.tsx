import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Scale, 
  Briefcase, 
  Activity, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  Check, 
  Lock, 
  Users, 
  HelpCircle,
  Clock,
  MapPin,
  ClipboardList,
  Building,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';
import { contentClient } from '../content/contentClient';
import type { CMSPublishedPageRecord } from '../types';

interface DoctorShieldPageProps {
  onScrollToContact?: () => void;
  onBackToHome?: () => void;
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
}

export default function DoctorShieldPage({ onScrollToContact, onBackToHome }: DoctorShieldPageProps) {
  const { language, direction, t } = useLanguage();
  const { content } = useSiteContent();
  const siteSettings = content?.siteSettings;
  const [doctorShieldCmsPage, setDoctorShieldCmsPage] = useState<CMSPublishedPageRecord | null>(null);
  
  // Section 2: Overview Scroll State
  const [activeOverviewTab, setActiveOverviewTab] = useState<number>(0);
  
  // Section 3: Target Groups State
  const [activeTargetTab, setActiveTargetTab] = useState<number>(0);

  // Section 4: How It Works active step
  const [activeWorkStep, setActiveWorkStep] = useState<number>(0);

  // Section 6: Subscription Form & Payment states
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    idNumber: '',
    specialty: '',
    city: '',
    employer: '',
    notes: '',
    hasBeenConvicted: 'no',
    agreed: false
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paymentStep, setPaymentStep] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('applepay');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionLoading, setSubmissionLoading] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string>('');
  const [lastVoucherId, setLastVoucherId] = useState<string>('');

  // Section 7: FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Refs for navigation inside page
  const paymentSectionRef = useRef<HTMLDivElement>(null);
  const overviewSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDoctorShieldPage() {
      try {
        const page = await contentClient.getCmsPage('doctor-shield');
        if (!cancelled) {
          setDoctorShieldCmsPage(page);
        }
      } catch {
        if (!cancelled) {
          setDoctorShieldCmsPage(null);
        }
      }
    }

    void loadDoctorShieldPage();
    return () => {
      cancelled = true;
    };
  }, []);

  const doctorShieldBlocks = useMemo(() => doctorShieldCmsPage?.blocks ?? [], [doctorShieldCmsPage]);
  const doctorShieldHeroBlock = useMemo(() => doctorShieldBlocks.find((block) => block.type === 'hero') ?? null, [doctorShieldBlocks]);
  const doctorShieldOverviewBlocks = useMemo(() => doctorShieldBlocks.filter((block) => block.type === 'cards').slice(0, 3), [doctorShieldBlocks]);
  const doctorShieldTargetBlocks = useMemo(() => doctorShieldBlocks.filter((block) => block.type === 'cards').slice(3, 5), [doctorShieldBlocks]);
  const doctorShieldHowBlock = useMemo(() => doctorShieldBlocks.find((block) => block.type === 'rich-text') ?? null, [doctorShieldBlocks]);
  const doctorShieldFaqBlock = useMemo(() => doctorShieldBlocks.find((block) => block.type === 'faq') ?? null, [doctorShieldBlocks]);
  const doctorShieldCtaBlock = useMemo(() => doctorShieldBlocks.find((block) => block.type === 'cta') ?? null, [doctorShieldBlocks]);

  const overviewSteps = useMemo(() => {
    const firstOverview = doctorShieldOverviewBlocks[0]?.data ?? {};
    const secondOverview = doctorShieldOverviewBlocks[1]?.data ?? {};
    const thirdOverview = doctorShieldOverviewBlocks[2]?.data ?? {};

    const fallback = [
      {
        num: '01 / 03',
        title: t('الهدف من الخدمة', 'The Service Goal'),
        desc: t(
          'تقديم دعم قانوني شامل ومرافقة وقائية فورية للأطباء والكوادر الطبية في مواجهة قضايا الأخطاء الطبية، والادعاءات المهنية، والمساءلات التحقيقية بكفاءة متناهية لحماية مستقبلهم المهني.',
          'Delivering absolute legal advocacy and immediate protective guidance for physicians and clinical professionals facing medical malpractice lawsuits, professional claims, or investigative inquiries.'
        ),
        iconColor: '#A56A1E',
        badge: t('حماية طبية متينة', 'Robust Medical Shield')
      },
      {
        num: '02 / 03',
        title: t('الخدمة السنوية ومكوناتها', 'The Annual Coverage'),
        desc: t(
          'تشتمل التغطية طيلة فترة الاشتراك السنوي على: التمثيل القانوني الكامل أمام اللجان الشرعية والقضائية، حضور جلسات التحقيق الرسمية بالنيابة عنك، صياغة المذكرات الجوابية والاعتراضات بلغة نظامية محكمة، وتوفير استشارات قانونية سريعة على مدار الساعة.',
          'During your annual subscription, coverage includes: full legal representation before medical committees and tribunals, attending formal investigation hearings, preparing airtight rebuttals and appeals, and 24/7 priority professional consultations.'
        ),
        list: [
          t('التمثيل القانوني الكامل في المنازعات', 'Complete litigation Representation'),
          t('حضور جلسات التحقيق والادعاء بالنيابة', 'Attending formal investigation sessions'),
          t('إعداد اللوائح والمذكرات القانونية الجوابية', 'Drafting of legal briefs and objections'),
          t('الاستشارات القانونية المتخصصة والفورية', '24/7 priority specialized inquiries')
        ],
        iconColor: '#7A563D',
        badge: t('مزايا الاشتراك', 'Subscription Scope')
      },
      {
        num: '03 / 03',
        title: t('المدة والتكلفة والضريبة', 'Term & Investment cost'),
        desc: t(
          'عقد سنوي مستقر ومستمر لحمايتك القانونية. تبلغ كلفة الاشتراك السنوي الشامل لدرع "سند الطبيب" ٢٣٠٠ ريال سعودي فقط، وهي قيمة ثابتة ومقرة وشاملة لضريبة القيمة المضافة بالكامل دون أي رسوم مستترة.',
          'A comprehensive, year-round corporate program designed to ensure peace of mind. The annual membership cost for the "Doctor Shield" program is only 2,300 SAR, a flat fee fully inclusive of Value Added Tax (VAT) with no hidden administrative fees.'
        ),
        price: t('٢٣٠٠ ريال سعودي سنويًا', '2,300 SAR annually'),
        vatText: t('شامل ضريبة القيمة المضافة مسبقًا', 'Value Added Tax (VAT) fully included'),
        iconColor: '#121212',
        badge: t('قيمة سنوية واضحة', 'Transparent Annual Cost')
      }
    ];

    if (!doctorShieldOverviewBlocks.length) return fallback;

    return [
      {
        num: '01 / 03',
        title: t(toStringValue(firstOverview.headingAr, fallback[0].title), toStringValue(firstOverview.headingEn, fallback[0].title)),
        desc: t(toStringValue(firstOverview.bodyAr, fallback[0].desc), toStringValue(firstOverview.bodyEn, fallback[0].desc)),
        iconColor: '#A56A1E',
        badge: t(toStringValue(firstOverview.subheadingAr, fallback[0].badge), toStringValue(firstOverview.subheadingEn, fallback[0].badge))
      },
      {
        num: '02 / 03',
        title: t(toStringValue(secondOverview.headingAr, fallback[1].title), toStringValue(secondOverview.headingEn, fallback[1].title)),
        desc: t(toStringValue(secondOverview.bodyAr, fallback[1].desc), toStringValue(secondOverview.bodyEn, fallback[1].desc)),
        list: toStringList(secondOverview.items).length > 0
          ? toStringList(secondOverview.items)
          : fallback[1].list,
        iconColor: '#7A563D',
        badge: t(toStringValue(secondOverview.subheadingAr, fallback[1].badge), toStringValue(secondOverview.subheadingEn, fallback[1].badge))
      },
      {
        num: '03 / 03',
        title: t(toStringValue(thirdOverview.headingAr, fallback[2].title), toStringValue(thirdOverview.headingEn, fallback[2].title)),
        desc: t(toStringValue(thirdOverview.bodyAr, fallback[2].desc), toStringValue(thirdOverview.bodyEn, fallback[2].desc)),
        price: t(toStringValue(thirdOverview.ctaPrimaryLabelAr, fallback[2].price), toStringValue(thirdOverview.ctaPrimaryLabelEn, fallback[2].price)),
        vatText: t(toStringValue(thirdOverview.ctaSecondaryLabelAr, fallback[2].vatText), toStringValue(thirdOverview.ctaSecondaryLabelEn, fallback[2].vatText)),
        iconColor: '#121212',
        badge: t(toStringValue(thirdOverview.subheadingAr, fallback[2].badge), toStringValue(thirdOverview.subheadingEn, fallback[2].badge))
      }
    ];
  }, [doctorShieldOverviewBlocks, t]);

  const targetClasses = useMemo(() => {
    const fallback = [
      {
        tabName: t('الفئة الأساسية (أ)', 'Primary Healthcare (Group A)'),
        classes: [
          { title: t('الأطباء البشريون', 'Medical Doctors'), desc: t('الاستشاريون والأخصائيون والأطباء المقيمون بكافة تصنيفاتهم الهندسية والعلاجية.', 'Consultants, specialists, and residents across all clinical medical branches.') },
          { title: t('أطباء الأسنان', 'Dentists'), desc: t('استشاريو وأطباء جراحة الفم والأسنان وتقويم وتجميل المارسات الطبية.', 'Dental surgeons, orthodontists, and cosmetic oral surgery practitioners.') },
          { title: t('الصيادلة', 'Pharmacists'), desc: t('صيادلة المستشفيات والمنشآت الدوائية والسريرية لتلافي المسؤولية الدوائية.', 'Pharmacists and pharmacological managers seeking to neutralize drug delivery liability.') },
          { title: t('أخصائيو التخدير', 'Anesthesiologists'), desc: t('كوادر التخدير لخصوصية المهنة ودقة مطالبات الأداء المصاحبة للجراحة.', 'Anesthesiology specialists and critical care staff facing high-pressure claims.') },
          { title: t('الفنيون الصحيون', 'Health Technicians'), desc: t('الكوادر والأخصائيون والمساعدون الفنيون في الأشعة والمختبرات والمعدات.', 'Radiologists, laboratory specialists, and medical diagnostics technicians.') }
        ]
      },
      {
        tabName: t('الفئة التكميلية (ب)', 'Clinical Practice (Group B)'),
        classes: [
          { title: t('الأخصائيون النفسيون', 'Psychologists'), desc: t('أخصائيو العلاج السلوكي والنفسي والاستشارات الإرشادية والاجتماعية.', 'Mental health practitioners, behavioral therapists, and counseling professionals.') },
          { title: t('أخصائيو التغذية', 'Nutritionists'), desc: t('أخصائيو التغذية السريرية والعلاجية في المشافي والمراكز الطبية والمراكز الرياضية.', 'Clinical nutritionists, therapeutic dietitians, and organic health advisors.') },
          { title: t('التمريض', 'Nursing Staff'), desc: t('رؤساء وأطقم وخدمات التمريض في أقسام الطوارئ والعمليات وأجنحة المرضى.', 'Head nurses and active nursing staff in ICUs, emergency rooms, and surgical units.') },
          { title: t('العلاج الحركي', 'Kinesitherapy & Physio'), desc: t('أخصائيو العلاج الطبيعي والتأهيل الحركي والبدني من مجهودات الإصابات.', 'Physiotherapy specialists and physical rehabilitation clinical providers.') },
          { title: t('معالجو النطق والسمع', 'Speech & Hearing'), desc: t('أخصائيو السمعيات وصعوبات التخاطب والنطق المعتمدون بالمملكة.', 'Audiological specialists and licensed speech therapy advisors in Saudi Arabia.') },
          { title: t('الفيزياء الطبية', 'Medical Physics'), desc: t('الخبراء والتقنيون المعنيون بالمعاملات الإشعاعية والنووية العلاجية.', 'Medical physicists and radiation safety operators overseeing diagnostic tech.') }
        ]
      }
    ];

    if (!doctorShieldTargetBlocks.length) return fallback;
    return doctorShieldTargetBlocks.map((block, index) => ({
      tabName: t(toStringValue(block.data?.headingAr, fallback[index]?.tabName ?? ''), toStringValue(block.data?.headingEn, fallback[index]?.tabName ?? '')),
      classes: Array.isArray(block.data?.items) && block.data.items.length > 0
        ? (block.data.items as Array<Record<string, unknown>>).map((item) => ({
            title: language === 'ar' ? toStringValue(item.titleAr, '') : toStringValue(item.titleEn, ''),
            desc: language === 'ar' ? toStringValue(item.descAr, '') : toStringValue(item.descEn, ''),
          })).filter((item) => item.title || item.desc)
        : fallback[index]?.classes ?? []
    }));
  }, [doctorShieldTargetBlocks, language, t]);

  const howItWorksSteps = useMemo(() => {
    const fallback = [
      {
        title: t('١. إدراج البيانات الطبية', '1. Med Data Entry'),
        desc: t('يتم تعبئة استمارة التسجيل بمعلومات دقيقة تشمل الهوية أو الإقامة والتخصص الطبي وجهة العمل والترخيص.', 'Submit your onboarding file including medical license specialty, National ID or Iqama, and company name.')
      },
      {
        title: t('٢. إصدار وكالة رسمية', '2. Power of Attorney'),
        desc: t('إصدار وكالة شرعية نظامية موثقة باسم محامي الشركة وفريقها لتمكينهم من المرافعة المباشرة أمام الدوائر.', 'Issue a formal certified power of attorney enabling our licensed firm and litigation lawyers to represent you.')
      },
      {
        title: t('٣. دراسة الحالة الكاملة', '3. Merit Analysis Study'),
        desc: t('عند نشوء أي شكوى أو نزاع، يعقد المجلس القانوني للشركة جلسة فورية لدراسة الملف الصحي وتفنيد الوقائع.', 'In the event of an active complaint, our legal panel immediately studies your clinical charts and file details.')
      },
      {
        title: t('٤. تقديم الاستشارة الوقائية', '4. Rendering Legal Advice'),
        desc: t('تزويد الكادر الطبي بخارطة طريق واضحة بالإجراءات الاحترازية التي يتعين عليه اتخاذها وتخفيف الموقف.', 'Equipping the clinical practitioner with a comprehensive roadmap of protective statements and steps.')
      },
      {
        title: t('٥. إعداد المذكرات الجوابية', '5. Brief Drafting'),
        desc: t('صياغة الردود الشافية والاعتراضات بلغة قانونية رصينة ومطابقة للمرسوم والأنظمة الصحية.', 'Formulating responses, statutory briefs, and complaints in elite legal prose complying with Saudi Health regulations.')
      },
      {
        title: t('٦. المتابعة حتى الإغلاق', '6. Advocacy to Closure'),
        desc: t('الترافع المباشر والحضور أمام اللجان والنيابة العامة والمحاكم المختصة ومتابعة القضية حتى تسويتها بالكامل.', 'Vigorous advocacy and attendance before the Public Prosecutor, committees, and supreme courts to absolute settlement.')
      }
    ];

    if (!doctorShieldHowBlock) return fallback;
    const items = Array.isArray(doctorShieldHowBlock.data?.items)
      ? (doctorShieldHowBlock.data.items as Array<Record<string, unknown>>)
      : [];
    if (items.length === 0) return fallback;
    return items.map((item, index) => ({
      title: t(toStringValue(item.titleAr, fallback[index]?.title ?? ''), toStringValue(item.titleEn, fallback[index]?.title ?? '')),
      desc: t(toStringValue(item.descAr, fallback[index]?.desc ?? ''), toStringValue(item.descEn, fallback[index]?.desc ?? '')),
    }));
  }, [doctorShieldHowBlock, t]);

  const faqList = useMemo(() => {
    const fallback = [
      {
        q: t('هل الاشتراك في خدمة سند الطبيب سنوي؟', 'Is the Doctor Shield program annual?'),
        a: t('نعم، الاشتراك عبارة عن برنامج سنوي متكامل يحصل بموجبه المشترك على رعاية وحماية قانونية شاملة لمدة ١٢ شهراً قابلة للتجديد بشكل تلقائي.', 'Yes, it is a fully integrated annual corporate program granting you comprehensive 12-month legal shield. Membership is easily renewable.')
      },
      {
        q: t('هل يشمل الاشتراك حضور التحقيقات بالنيابة عني؟', 'Does it cover attending investigations on my behalf?'),
        a: t('بالتأكيد، فور تفويض الموكل للمكتب نقوم بإصدار تمثيل وحضور جلسات التحقيق الرسمية أمام الشؤون الصحية أو النيابة العامة لضمان سير التحقيق وفق المجرى السليم.', 'Absolutely. Upon commissioning the firm, our attorneys formally represent and attend official investigation hearings at MOH (Ministry of Health) or Public Prosecution.')
      }
    ];
    if (!doctorShieldFaqBlock) return fallback;
    const items = Array.isArray(doctorShieldFaqBlock.data?.items)
      ? (doctorShieldFaqBlock.data.items as Array<Record<string, unknown>>)
      : [];
    if (items.length === 0) return fallback;
    return items.map((item, index) => ({
      q: t(toStringValue(item.questionAr, fallback[index]?.q ?? ''), toStringValue(item.questionEn, fallback[index]?.q ?? '')),
      a: t(toStringValue(item.answerAr, fallback[index]?.a ?? ''), toStringValue(item.answerEn, fallback[index]?.a ?? '')),
    }));
  }, [doctorShieldFaqBlock, t]);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = ref.current.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Handle Form Verification
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = t('يجب إدخال الاسم الكامل', 'Full name is required');
    if (!formData.phone.trim()) errors.phone = t('يجب إدخال رقم الجوال', 'Phone number is required');
    if (!formData.email.trim()) errors.email = t('يجب إدخال البريد الإلكتروني', 'Email is required');
    if (!formData.idNumber.trim()) errors.idNumber = t('يجب إدخال رقم الهوية أو الإقامة', 'National ID / Iqama is required');
    if (!formData.specialty.trim()) errors.specialty = t('يجب إدخال التخصص الطبي', 'Medical specialty is required');
    if (!formData.agreed) errors.agreed = t('يجب الموافقة على الشروط والأحكام', 'You must agree to the terms');

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setPaymentStep(true);
  };

  const handleFinalPaymentSubmit = async () => {
    if (submissionLoading) {
      return;
    }

    const voucherId = `DS-${Date.now()}`;
    setSubmissionLoading(true);
    setSubmissionError('');

    try {
      await contentClient.submitDoctorShieldRequest({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        idNumber: formData.idNumber.trim(),
        specialty: formData.specialty.trim(),
        city: formData.city.trim(),
        employer: formData.employer.trim(),
        notes: formData.notes.trim(),
        hasBeenConvicted: formData.hasBeenConvicted,
        voucherId,
        paymentAmount: '2,300 SAR',
        paymentStatus: 'paid',
        paymentMethod: selectedPaymentMethod,
        cardBrand: selectedPaymentMethod,
        cardLast4: '0000',
      });
      setLastVoucherId(voucherId);
      setIsSubmitted(true);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : t('فشل إرسال الطلب.', 'Failed to submit request.'));
    } finally {
      setSubmissionLoading(false);
    }
  };

  return (
    <div className="pt-24 bg-[#F1ECE3] min-h-screen text-[#121212] font-sans overflow-hidden" style={{ direction }}>
      
      {/* SECTION 1 — HERO SECTION */}
      <section className="relative min-h-[500px] lg:h-[70vh] lg:max-h-[600px] flex items-center bg-[#F8F5EF] border-b border-[#D8D1C7] overflow-hidden">
        {/* Subtle royal design geometry background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 60 M 30 -15 L -15 30 M 75 15 L 15 75" fill="none" stroke="#7A563D" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-pattern)" />
          </svg>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-10 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Call to Active Text */}
            <div className="lg:col-span-7 flex flex-col items-start gap-4 sm:gap-6 text-start">
              
              <motion.span 
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A56A1E]/10 text-[#A56A1E] text-xs font-bold uppercase tracking-widest border border-[#A56A1E]/15"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{t(
                  siteSettings?.doctorShieldBadgeAr || toStringValue(doctorShieldHeroBlock?.data?.badgeAr, 'خدمة قانونية متخصصة'),
                  siteSettings?.doctorShieldBadgeEn || toStringValue(doctorShieldHeroBlock?.data?.badgeEn, 'Specialized Legal Program')
                )}</span>
              </motion.span>

              <div className="space-y-2">
                <motion.h1 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#7A563D] tracking-tight font-serif"
                >
                  {t(
                    siteSettings?.doctorShieldTitleAr || toStringValue(doctorShieldHeroBlock?.data?.headingAr, 'سند الطبيب'),
                    siteSettings?.doctorShieldTitleEn || toStringValue(doctorShieldHeroBlock?.data?.headingEn, 'Doctor Shield')
                  )}
                </motion.h1>
                <motion.h2 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-lg sm:text-2xl font-bold text-[#121212]/80 font-serif"
                >
                  {t(
                    siteSettings?.doctorShieldSubtitleAr || toStringValue(doctorShieldHeroBlock?.data?.subheadingAr, 'درعك القانوني في ممارسة المهنة'),
                    siteSettings?.doctorShieldSubtitleEn || toStringValue(doctorShieldHeroBlock?.data?.subheadingEn, 'Your Legal Shield in Professional Practice')
                  )}
                </motion.h2>
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-base text-[#4B4B4B] font-light leading-relaxed max-w-xl text-justify"
              >
                  {t(
                    siteSettings?.doctorShieldDescAr || toStringValue(doctorShieldHeroBlock?.data?.bodyAr, 'مشروع قانوني وحمائي فريد من نوعه وحصري في المملكة العربية السعودية، يوفر درعًا شاملًا وحماية قانونية سنوية متكاملة للكوادر الطبية والعاملين في القطاع الصحي والتشريعي من مطالبات المسؤولية المدنية والعيوب السريرية.'),
                    siteSettings?.doctorShieldDescEn || toStringValue(doctorShieldHeroBlock?.data?.bodyEn, 'An exclusive, highly specialized annual program in the Kingdom of Saudi Arabia, offering absolute peace of mind and fully integrated legal defense for clinicians and medical experts against litigation risk and malpractice claims.')
                  )}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap gap-4 pt-2 w-full sm:w-auto"
              >
                <button
                  onClick={() => scrollToRef(paymentSectionRef)}
                  className="px-8 py-3.5 rounded-xl bg-[#7A563D] hover:bg-[#946B4B] text-white text-xs font-bold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 "
                >
                  {t(
                    siteSettings?.doctorShieldButtonAr || toStringValue(doctorShieldHeroBlock?.data?.ctaPrimaryLabelAr, 'ابدأ الاشتراك الآن'),
                    siteSettings?.doctorShieldButtonEn || toStringValue(doctorShieldHeroBlock?.data?.ctaPrimaryLabelEn, 'Subscribe Now')
                  )}
                </button>
                <button
                  onClick={() => scrollToRef(overviewSectionRef)}
                  className="px-8 py-3.5 rounded-xl border border-[#7A563D]/40 hover:bg-[#7A563D]/5 text-[#7A563D] text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer"
                >
                  {t(
                    toStringValue(doctorShieldHeroBlock?.data?.ctaSecondaryLabelAr, 'معرفة المزيد'),
                    toStringValue(doctorShieldHeroBlock?.data?.ctaSecondaryLabelEn, 'Learn More')
                  )}
                </button>
              </motion.div>

            </div>

            {/* Custom Gold Line Illustration */}
            <div className="lg:col-span-5 flex justify-center product-image relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[400px] md:h-[400px]"
              >
                {/* SVG Luxury Emblem */}
                <svg className="w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer Orbit Line */}
                  <circle cx="200" cy="200" r="180" stroke="#A56A1E" strokeWidth="0.75" strokeDasharray="5 5" className="animate-[spin_100s_linear_infinite]" />
                  <circle cx="200" cy="200" r="160" stroke="#7A563D" strokeWidth="0.5" strokeOpacity="0.3" />
                  
                  {/* Elegant Polyhedral background circles */}
                  <circle cx="200" cy="200" r="140" fill="#7A563D" fillOpacity="0.02" />
                  <circle cx="200" cy="200" r="120" stroke="#A56A1E" strokeWidth="1.5" strokeOpacity="0.5" />
                  
                  {/* Subtle Corner Markers */}
                  <line x1="200" y1="20" x2="200" y2="350" stroke="#A56A1E" strokeWidth="0.25" strokeOpacity="0.4" />
                  <line x1="20" y1="200" x2="380" y2="200" stroke="#A56A1E" strokeWidth="0.25" strokeOpacity="0.4" />

                  {/* Shield Silhouette Layer (Primary) */}
                  <path 
                    d="M200 80 C260 80 290 110 300 160 C300 240 230 300 200 320 C170 300 100 240 100 160 C110 110 140 80 200 80 Z" 
                    fill="#F8F5EF" 
                    stroke="#7A563D" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="drop-shadow-lg"
                  />

                  {/* Inner Shield Accent */}
                  <path 
                    d="M200 95 C248 95 272 120 280 160 C280 220 225 275 200 295 C175 275 120 220 120 160 C128 120 152 95 200 95 Z" 
                    stroke="#A56A1E" 
                    strokeWidth="1.5" 
                    strokeDasharray="3 3" 
                  />

                  {/* Custom Stethoscope vector drawing */}
                  <path 
                    d="M160 140 C140 180 140 220 200 250 C260 220 260 180 240 140" 
                    stroke="#7A563D" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    fill="none" 
                  />
                  <circle cx="160" cy="135" r="5" fill="#7A563D" />
                  <circle cx="240" cy="135" r="5" fill="#7A563D" />

                  <path 
                    d="M200 250 V270 C200 280 215 285 225 275" 
                    stroke="#A56A1E" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    fill="none" 
                  />
                  {/* Heart Pulse over stethoscope */}
                  <path 
                    d="M165 200 H185 L190 185 L195 215 L200 195 L205 205 L210 200 H235" 
                    stroke="#7A563D" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    fill="none" 
                  />

                  {/* Medical Cross Symbol (Floating Center Point) */}
                  <path 
                    d="M188 135 H212 M200 123 V147" 
                    stroke="#A56A1E" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />

                  {/* Small legal seal stamp design bottom right */}
                  <circle cx="310" cy="270" r="30" fill="#F8F5EF" stroke="#7A563D" strokeWidth="1" />
                  <circle cx="310" cy="270" r="26" stroke="#A56A1E" strokeWidth="0.5" strokeDasharray="3 1" />
                  <path d="M302 265 L310 273 L318 265" stroke="#7A563D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <path d="M310 257 V273" stroke="#7A563D" strokeWidth="1.5" strokeLinecap="round" />
                  <span className="text-[6px] font-mono select-none" style={{ position: 'absolute', top: '265px', left: '298px' }}></span>

                  {/* Small Elegant Dots for decoration */}
                  <circle cx="80" cy="100" r="3" fill="#A56A1E" />
                  <circle cx="320" cy="100" r="3" fill="#7A563D" />
                  <circle cx="100" cy="300" r="2.5" fill="#7A563D" />
                  <circle cx="300" cy="320" r="3.5" fill="#A56A1E" />
                </svg>

                {/* Micro interactive Badge elements */}
                <div className="absolute top-1/4 right-[5%] bg-white border border-[#D8D1C7] rounded-lg px-3 py-1.5 shadow-sm hidden sm:flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '6s' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-[#121212]/80">{t('مسؤولية طبية محصنة', 'Malpractice Shield Active')}</span>
                </div>

                <div className="absolute bottom-1/4 left-[5%] bg-white border border-[#D8D1C7] rounded-lg px-3 py-1.5 shadow-sm hidden sm:flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '4.5s' }}>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A56A1E]" />
                  <span className="text-[10px] font-bold text-[#121212]/80">{t('٢٣٠٠ ريال سنويًا', '2,300 SAR / Yr')}</span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2 — OVERVIEW SCROLL BLOCK */}
      <section 
        ref={overviewSectionRef} 
        className="py-20 bg-[#F1ECE3] border-b border-[#D8D1C7]"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-start space-y-4 mb-16 max-w-3xl">
            <span className="text-xs font-semibold text-[#A56A1E] uppercase tracking-wider block">
              {t(
                toStringValue(doctorShieldOverviewBlocks[0]?.data?.subheadingAr, 'نظرة عامة مقتضبة'),
                toStringValue(doctorShieldOverviewBlocks[0]?.data?.subheadingEn, 'COMPACT OVERVIEW')
              )}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#7A563D] tracking-tight font-serif">
              {t(
                toStringValue(doctorShieldOverviewBlocks[0]?.data?.headingAr, 'تفاصيل البرنامج الوقائي'),
                toStringValue(doctorShieldOverviewBlocks[0]?.data?.headingEn, 'Proactive Shield Operations')
              )}
            </h2>
            <div className="h-[2px] w-16 bg-[#A56A1E] mt-3" />
          </div>

          {/* Scrollytelling Interactive Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            
            {/* Left Visual Area - Sticky Panel */}
            <div className="lg:col-span-5 h-[320px] lg:h-auto lg:sticky lg:top-[120px] rounded-3xl bg-[#F8F5EF] border border-[#D8D1C7] p-8 flex flex-col justify-between overflow-hidden shadow-xs relative">
              {/* Abs Geometric Details */}
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Scale className="w-64 h-64 text-[#A56A1E]" />
              </div>

              {/* Step indicator */}
              <div className="flex justify-between items-center relative z-10">
                <span className="text-xs font-bold text-[#A56A1E] bg-[#A56A1E]/10 px-3 py-1.5 rounded-full border border-[#A56A1E]/15">
                  {overviewSteps[activeOverviewTab].badge}
                </span>
                <span className="text-sm font-mono font-medium text-[#7A563D]/80">
                  {overviewSteps[activeOverviewTab].num}
                </span>
              </div>

              {/* Dynamic Graphic */}
              <div className="py-6 flex flex-col items-center justify-center text-center relative z-10 grow min-h-[140px]">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeOverviewTab}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-4"
                  >
                    {activeOverviewTab === 0 ? (
                      <>
                        <Shield className="w-16 h-16 stroke-[1.5] text-[#A56A1E] opacity-90" />
                        <span className="text-xs font-mono tracking-wider uppercase text-[#121212]/60">{t('درع الأخطاء المهنية', 'DEFENSE MODEL v1.0')}</span>
                      </>
                    ) : activeOverviewTab === 1 ? (
                      <>
                        <Briefcase className="w-16 h-16 stroke-[1.5] text-[#7A563D] opacity-95" />
                        <span className="text-xs font-mono tracking-wider uppercase text-[#121212]/60">{t('تغطية المرافعة والادعاء', 'LITIGATION MODULE v2.0')}</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-16 h-16 stroke-[1.5] text-[#121212] opacity-80" />
                        <span className="text-xs font-mono tracking-wider uppercase text-[#121212]/60">{t('الامتثال المالي المتكامل', 'PRICING MODEL v3.0')}</span>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Visual slide dots */}
              <div className="flex justify-center gap-2 relative z-10">
                {overviewSteps.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setActiveOverviewTab(dotIdx)}
                    className={`h-2 rounded-full transition-all duration-300 ${activeOverviewTab === dotIdx ? 'w-8 bg-[#A56A1E]' : 'w-2 bg-[#D8D1C7] hover:bg-[#A56A1E]/50'}`}
                    aria-label={`Slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Information Scroll Items */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {overviewSteps.map((step, idx) => {
                const isActive = activeOverviewTab === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveOverviewTab(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveOverviewTab(idx);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`w-full text-start p-8 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer outline-none ${
                      isActive 
                        ? 'bg-white border-[#A56A1E] shadow-sm' 
                        : 'bg-[#F8F5EF] border-[#D8D1C7] hover:border-[#7A563D]/40'
                    }`}
                  >
                    {/* Top step sequence indicators */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold font-serif ${
                      isActive ? 'bg-[#A56A1E] text-white' : 'bg-[#D8D1C7]/30 text-[#7A563D]'
                    }`}>
                      {idx + 1}
                    </div>

                    <div className="space-y-3 w-full">
                      <div className="flex justify-between items-center w-full">
                        <h3 className={`text-md sm:text-lg font-bold tracking-tight font-serif ${isActive ? 'text-[#A56A1E]' : 'text-[#7A563D]'}`}>
                          {step.title}
                        </h3>
                        <span className="text-xs text-[#121212]/40 font-mono hidden sm:inline">{step.num}</span>
                      </div>
                      
                      <p className="text-sm text-[#4B4B4B] font-light leading-relaxed text-justify">
                        {step.desc}
                      </p>

                      {/* Expandable Step specific list */}
                      {isActive && step.list && (
                        <div className="pt-2 border-t border-[#D8D1C7]/30 mt-3 space-y-2 animate-fadeIn">
                          {step.list.map((item, lIdx) => (
                            <div key={lIdx} className="flex items-center gap-2 text-xs text-[#121212]/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A56A1E]" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Expandable Step specific pricing tier */}
                      {isActive && step.price && (
                        <div className="pt-3 border-t border-[#D8D1C7]/30 mt-3 flex flex-wrap justify-between items-center gap-2 animate-fadeIn bg-[#7A563D]/5 p-3 rounded-lg">
                          <div>
                            <div className="text-sm font-extrabold text-[#7A563D]">{step.price}</div>
                            <div className="text-[10px] text-[#A56A1E] font-medium uppercase mt-0.5">{step.vatText}</div>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              scrollToRef(paymentSectionRef);
                            }}
                            className="bg-[#7A563D] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#946B4B] transition-colors"
                          >
                            {t('احجز درعك', 'Secure Shield')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3 — الفئات المستهدفة (Target Categories) */}
      <section className="py-20 sm:py-28 bg-[#FFFFFF] border-b border-[#D8D1C7]/45">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-start space-y-4 mb-16 max-w-3xl">
            <span className="text-xs font-semibold text-[#A56A1E] uppercase tracking-wider block">
              {t('من يشملهم درع الكادر الطبية', 'WHO WE SAFEGUARD')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#7A563D] tracking-tight font-serif">
              {t('الفئات الطبية المستهدفة بالبرنامج', 'Protected Clinical Profiles')}
            </h2>
            <p className="text-base text-[#4B4B4B] font-light leading-relaxed max-w-xl">
              {t(
                'نهيئ تغطيتنا الوقائية والدفاعية المتخصصة لتشمل طائفة واسعة ومنظمة من الممارسين والكوادر السريرية والتشخيصية بالمملكة.',
                'Our specialized defensive solutions are designed to cover a broad spectrum of clinical practitioners and diagnostic experts nationwide.'
              )}
            </p>
            <div className="h-[2px] w-16 bg-[#A56A1E] mt-3" />
          </div>

          {/* Group Tabs controllers */}
          <div className="flex border-b border-[#D8D1C7]/40 mb-10 overflow-x-auto gap-2">
            {targetClasses.map((group, gIdx) => (
              <button
                key={gIdx}
                onClick={() => setActiveTargetTab(gIdx)}
                className={`py-3.5 px-6 font-bold text-xs tracking-wider uppercase border-b-2 transition-all duration-300 shrink-0 cursor-pointer ${
                  activeTargetTab === gIdx 
                    ? 'border-[#A56A1E] text-[#A56A1E]' 
                    : 'border-transparent text-[#4B4B4B] hover:text-[#7A563D]'
                }`}
              >
                {group.tabName}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Dynamic Grid representing the Active Tab's Categories */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {targetClasses[activeTargetTab].classes.map((prof, pIdx) => (
                <div
                  key={pIdx}
                  className="bg-[#F8F5EF] rounded-2xl p-6 border border-[#D8D1C7]/40 hover:border-[#A56A1E] transition-all duration-300 flex items-start gap-4 shadow-xs"
                >
                  <div className="p-3 bg-[#A56A1E]/10 rounded-xl text-[#A56A1E] shrink-0">
                    <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="space-y-1.5 text-start">
                    <h3 className="text-sm font-extrabold text-[#7A563D]">{prof.title}</h3>
                    <p className="text-xs text-[#5B5B5B] leading-relaxed font-light text-justify">{prof.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky/Final Highlights Card */}
            <div className="lg:col-span-1 bg-[#7A563D] rounded-3xl p-8 border border-[#7A563D] text-white flex flex-col justify-between space-y-8 relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                <Users className="w-48 h-48" />
              </div>

              <div className="space-y-4 text-start relative z-10">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/50 block">
                  {t('امتثال كامل للتصنيف الطبي', 'Saudi Commission Certified')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif leading-tight">
                  {t('هل تنتمي لإحدى هذه الفئات الطبية؟', 'Do You Belong To These Clinical Sectors?')}
                </h3>
                <p className="text-xs text-white/70 font-light leading-relaxed text-justify">
                  {t(
                    'إذا كانت وظيفتك أو تخصصك يندرج تحت التصنيفات المهنية الطبية السريرية المذكورة بالمملكة، فإن درع "سند الطبيب" هو ضمانك الأمثل لممارسة خالية من القلق القضائي.',
                    'If your practice involves therapeutic, surgical, or specialized diagnosis, the "Doctor Shield" program is your definitive security companion against litigation.'
                  )}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 relative z-10">
                <button
                  type="button"
                  onClick={() => scrollToRef(paymentSectionRef)}
                  className="w-full bg-[#F8F5EF] text-[#7A563D] hover:bg-white p-3.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-xs group"
                >
                  <span>{t('ابدأ حجز اشتراكك', 'Start Membership')}</span>
                  {direction === 'rtl' ? (
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4 — HOW IT WORKS */}
      <section className="py-20 bg-[#F1ECE3] border-b border-[#D8D1C7]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-start space-y-4 mb-16 max-w-3xl">
            <span className="text-xs font-semibold text-[#A56A1E] uppercase tracking-wider block">
              {t('منهجية حنبولي للامتثال', 'TACTICAL EXECUTION')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#7A563D] tracking-tight font-serif">
              {t('آلية تفعيل الحماية القانونية', 'The 6-Step Defense Timeline')}
            </h2>
            <div className="h-[2px] w-16 bg-[#A56A1E] mt-3" />
          </div>

          {/* Interactive Legal Process Timeline - Progress line */}
          <div className="relative mt-12 mb-16 px-4">
            
            {/* Animated Progress Line background */}
            <div className="absolute top-[21px] left-8 right-8 h-1 bg-[#D8D1C7]/30 rounded-full hidden md:block">
              {/* Active filled segment */}
              <div 
                className="h-full bg-[#A56A1E] transition-all duration-500 rounded-full"
                style={{ 
                  width: `${(activeWorkStep / (howItWorksSteps.length - 1)) * 100}%`
                }}
              />
            </div>

            {/* Timeline Steps controllers */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
              {howItWorksSteps.map((step, idx) => {
                const isActive = activeWorkStep === idx;
                const isPassed = idx < activeWorkStep;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveWorkStep(idx)}
                    className="flex flex-col items-start md:items-center text-start md:text-center group transition-all duration-300 outline-none w-full cursor-pointer"
                  >
                    
                    {/* Circle Node */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 mb-4 font-mono text-xs font-bold font-serif ${
                      isActive 
                        ? 'bg-[#A56A1E] border-[#A56A1E] text-white scale-110 shadow-md shadow-[#A56A1E]/10' 
                        : isPassed
                          ? 'bg-[#7A563D] border-[#7A563D] text-white'
                          : 'bg-[#F8F5EF] border-[#D8D1C7] text-[#4B4B4B] group-hover:border-[#7A563D]/60'
                    }`}>
                      {isActive ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    {/* Step label text */}
                    <span className={`text-xs font-extrabold max-w-[120px] transition-colors duration-300 ${
                      isActive ? 'text-[#A56A1E]' : 'text-[#7A563D] group-hover:text-[#A56A1E]'
                    }`}>
                      {step.title.substring(2)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Step Panel Display with transitions */}
            <div className="mt-12 bg-[#F8F5EF] rounded-3xl p-8 border border-[#D8D1C7] shadow-xs text-start relative max-w-4xl mx-auto">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="text-8xl font-serif font-black text-[#A56A1E] select-none">0{activeWorkStep + 1}</span>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeWorkStep}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-[#A56A1E] bg-[#A56A1E]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    {t('المرحلة الإجرائية', 'PROCEDURAL STAGE')} {activeWorkStep + 1}
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#7A563D] font-serif">
                    {howItWorksSteps[activeWorkStep].title}
                  </h3>
                  
                  <p className="text-sm text-[#4B4B4B] font-light leading-relaxed max-w-2xl text-justify">
                    {howItWorksSteps[activeWorkStep].desc}
                  </p>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      disabled={activeWorkStep === 0}
                      onClick={() => setActiveWorkStep(prev => Math.max(0, prev - 1))}
                      className="p-2 sm:px-4 py-2 text-xs rounded-xl border border-[#D8D1C7] text-[#7A563D] font-bold hover:bg-[#7A563D]/5 disabled:opacity-40 select-none cursor-pointer"
                    >
                      {t('السابق', 'Previous')}
                    </button>
                    <button
                      type="button"
                      disabled={activeWorkStep === howItWorksSteps.length - 1}
                      onClick={() => setActiveWorkStep(prev => Math.min(howItWorksSteps.length - 1, prev + 1))}
                      className="p-2 sm:px-4 py-2 text-xs rounded-xl bg-[#7A563D] text-white font-bold hover:bg-[#946B4B] disabled:opacity-40 select-none cursor-pointer"
                    >
                      {t('التالي', 'Next')}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5 — PRICING */}
      <section className="py-20 sm:py-28 bg-[#FFFFFF] border-b border-[#D8D1C7]/40 relative">
        {/* Background geometry for prestige card framing */}
        <div className="absolute left-[5%] bottom-[10%] opacity-5 hidden lg:block">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="#A56A1E" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-bold text-[#A56A1E] uppercase tracking-widest block">
              {t(
                siteSettings?.doctorShieldCircleNoteAr || 'استثمار وقائي شفاف',
                siteSettings?.doctorShieldCircleNoteEn || 'TRANSPARENT MEMBERSHIP'
              )}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#7A563D] font-serif tracking-tight">
              {t(
                siteSettings?.doctorShieldCircleTitleAr || 'رسوم الاشتراك السنوي المناسبة',
                siteSettings?.doctorShieldCircleTitleEn || 'Protect Your Medical Career'
              )}
            </h2>
            <div className="h-[2px] w-12 bg-[#A56A1E] mx-auto mt-3" />
          </div>

          {/* Luxury Pricing Card */}
          <div className="max-w-md mx-auto">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              className="bg-[#F8F5EF] rounded-3xl border-2 border-[#A56A1E] shadow-md p-8 sm:p-10 relative flex flex-col justify-between space-y-8 text-center"
            >
              {/* Recommended luxury ribbon tag */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#A56A1E] text-white text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full shadow-xs">
                {t(
                  siteSettings?.doctorShieldCircleTitleAr || 'العقد القانوني المتكامل',
                  siteSettings?.doctorShieldCircleTitleEn || 'ANNUAL INTEGRATED SHIELD'
                )}
              </div>

              {/* Title & price layout */}
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase text-[#7A563D] tracking-wider block">
                  {t(
                    siteSettings?.doctorShieldCircleTitleAr || 'سند الطبيب',
                    siteSettings?.doctorShieldCircleTitleEn || 'DOCTOR SHIELD MEMBERSHIP'
                  )}
                </span>
                
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-black font-serif text-[#121212] tracking-tight">
                      {toStringValue(siteSettings?.doctorShieldCirclePriceAr, '٢٣٠٠')}
                    </span>
                    <span className="text-lg font-bold text-[#7A563D]">
                      {t('ريال سعودي', 'SAR')}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#A56A1E] bg-[#A56A1E]/10 py-1 px-3 rounded-full inline-block">
                    {t(
                      siteSettings?.doctorShieldCircleNoteAr || 'شامل ضريبة القيمة المضافة',
                      siteSettings?.doctorShieldCircleNoteEn || 'VAT fully included'
                    )}
                  </span>
                </div>

                <p className="text-xs text-[#5B5B5B] font-light leading-relaxed px-2">
                  {t(
                    'تأمين وقائي ممتد على مدار ١٢ شهراً، يضمن لك مرافقة مستشارين ومحامين رياديين طيلة فترة ممارسة عملك الطبي بلا قلق.',
                    'Year-round legal protection coverage for 12 months, ensuring specialized defense in high-pressure medical operations.'
                  )}
                </p>
              </div>

              {/* Bullet Features */}
              <div className="border-t border-[#D8D1C7]/40 pt-6 space-y-4 text-start">
                <span className="text-xs font-bold uppercase text-[#7A563D] tracking-wider block">
                  {t('المزايا المشمولة بالبرنامج:', 'Included program benefits:')}
                </span>

                <div className="grid grid-cols-1 gap-3 px-1">
                  {[
                    t(siteSettings?.doctorShieldBullet1Ar || 'تمثيل قانوني كامل أمام قضائنا واللجان', siteSettings?.doctorShieldBullet1En || 'Complete legal representation before committees'),
                    t(siteSettings?.doctorShieldBullet2Ar || 'استشارات فورية متخصصة ومقترحات سريعة', siteSettings?.doctorShieldBullet2En || 'On-demand priority professional counseling'),
                    t(siteSettings?.doctorShieldBullet3Ar || 'متابعة مستمرة للقضايا ومجرياتها بالنيابة', siteSettings?.doctorShieldBullet3En || 'Constant litigation and file case monitoring'),
                    t(siteSettings?.doctorShieldBullet4Ar || 'إعداد وصياغة لوائح ومذكرات الاعتراضات الجوابية', siteSettings?.doctorShieldBullet4En || 'Drafting of airtight formal briefs and exceptions')
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs text-[#121212]/80">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="font-light">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Card CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => scrollToRef(paymentSectionRef)}
                  className="w-full bg-[#7A563D] hover:bg-[#946B4B] text-white p-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                >
                  {t(
                    siteSettings?.doctorShieldButtonAr || 'اشترك الآن',
                    siteSettings?.doctorShieldButtonEn || 'Subscribe Now'
                  )}
                </button>
                <span className="text-[10px] text-[#5B5B5B]/60 block mt-3 font-light">
                  {t('إجراءات تسجيل آمنة وسهلة بالكامل', '100% secure statutory registration and setup')}
                </span>
              </div>

            </motion.div>
          </div>

        </div>
      </section>

      {/* SECTION 6 — SUBSCRIPTION & PAYMENT */}
      <section 
        ref={paymentSectionRef} 
        className="py-20 sm:py-28 bg-[#F1ECE3] border-b border-[#D8D1C7] relative"
      >
        <div className="absolute right-0 top-0 opacity-[0.015] pointer-events-none">
          {/* Subtle logo seal background */}
          <Shield className="w-96 h-96" />
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-start space-y-4 mb-16 max-w-3xl">
            <span className="text-xs font-semibold text-[#A56A1E] uppercase tracking-wider block">
              {t(
                toStringValue(doctorShieldCtaBlock?.data?.subheadingAr, 'بوابة الاشتراك الرقمية'),
                toStringValue(doctorShieldCtaBlock?.data?.subheadingEn, 'SECURE PORTAL')
              )}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#7A563D] tracking-tight font-serif">
              {t(
                toStringValue(doctorShieldCtaBlock?.data?.headingAr, 'تسجيل البيانات والتعاقد الآمن'),
                toStringValue(doctorShieldCtaBlock?.data?.headingEn, 'Subscription & Secure Order Checkout')
              )}
            </h2>
            <div className="h-[2px] w-16 bg-[#A56A1E] mt-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left side: Subscription Form (Transitioned with Payment Step) */}
            <div className="lg:col-span-8 bg-[#F8F5EF] rounded-3xl border border-[#D8D1C7] p-8 sm:p-10 shadow-xs relative">
              
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  // Step 3: SUCCESS PANEL
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 text-center space-y-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-12 h-12 stroke-[1.5]" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-[#7A563D] font-serif">{t('مرحبًا بك في حصن سند الطبيب', 'Welcome to the Sanctuary')}</h3>
                    
                    <p className="text-sm text-[#4B4B4B] font-light max-w-lg mx-auto leading-relaxed">
                      {t(
                        'لقد تم تفعيل وحجز ملف اشتراكك بنجاح! تم استلام رسوم الاشتراك ٢٣٠٠ ريال وتفويض الفريق المختص. سيتواصل معك أحد مستشارينا القانونيين البارزين خلال الساعات القادمة لاستخراج الوكالة وحيازة المستندات.',
                        'Your corporate protection has been successfully initiated! We have secured your onboarding profile and the 2,300 SAR subscription investment. An executive legal representative from Hesham Hanboly International will contact you within the next hours.'
                      )}
                    </p>
                    {lastVoucherId && (
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-[#D8D1C7] bg-white px-4 py-3 text-sm text-[#7A563D] font-semibold">
                        <FileText className="w-4 h-4 text-[#A56A1E]" />
                        <span>{t('مرجع الحجز:', 'Booking reference:')}</span>
                        <span className="font-mono">{lastVoucherId}</span>
                      </div>
                    )}

                    <div className="pt-4 flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSubmitted(false);
                          setPaymentStep(false);
                          setSelectedPaymentMethod('applepay');
                          setSubmissionError('');
                          setSubmissionLoading(false);
                          setLastVoucherId('');
                          setFormErrors({});
                          setFormData({
                            fullName: '',
                            phone: '',
                            email: '',
                            idNumber: '',
                            specialty: '',
                            city: '',
                            employer: '',
                            notes: '',
                            hasBeenConvicted: 'no',
                            agreed: false
                          });
                        }}
                        className="px-6 py-3 rounded-lg border border-[#7A563D] text-[#7A563D] text-xs font-bold hover:bg-[#7A563D]/5 transition-all"
                      >
                        {t('تسجيل اشتراك جديد', 'New Registration')}
                      </button>
                      <button
                        type="button"
                        onClick={onBackToHome}
                        className="px-6 py-3 rounded-lg bg-[#7A563D] text-white text-xs font-bold hover:bg-[#946B4B] transition-all"
                      >
                        {t('العودة للرئيسية', 'Return Home')}
                      </button>
                    </div>
                  </motion.div>
                ) : paymentStep ? (
                  // Step 2: PAYMENT METHOD CHOICE UI only
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: direction === 'rtl' ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction === 'rtl' ? 30 : -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8 text-start"
                  >
                    <div className="flex items-center gap-2 pb-4 border-b border-[#D8D1C7]/30">
                      <Lock className="w-4 h-4 text-[#A56A1E]" />
                      <span className="text-xs font-bold text-[#A56A1E] uppercase tracking-wider">{t('بوابة دفع غشيمة محصنة', 'SECURE SYSTEM CHANNELS')}</span>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[#7A563D]">{t('اختر وسيلة الدفع المفضلة', 'Select Payment Channel')}</h3>
                      <p className="text-xs text-[#5B5B5B] font-light leading-relaxed">
                        {t(
                          'تتم المعاملة عبر بنية سداد مرموقة ومتوافقة مع المعايير المصرفية الوطنية لقضاء العمليات بموثوقية تامة.',
                          'Transactions are governed layout only underneath regulatory safe sandboxes and financial models.'
                        )}
                      </p>
                    </div>

                    {/* Integrated Payment Methods Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Apple Pay card logic */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('applepay')}
                        className={`p-5 rounded-2xl border-2 transition-all flex justify-between items-center bg-white ${
                          selectedPaymentMethod === 'applepay' ? 'border-[#A56A1E]' : 'border-[#D8D1C7]/50 hover:border-[#7A563D]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black rounded-lg text-white flex items-center justify-center font-bold text-xs">
                            
                          </div>
                          <span className="text-xs font-bold text-[#121212]">{t('Apple Pay', 'Apple Pay')}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedPaymentMethod === 'applepay' ? 'border-[#A56A1E] bg-[#A56A1E]' : 'border-[#D8D1C7]'
                        }`}>
                          {selectedPaymentMethod === 'applepay' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>

                      {/* Mada credit card logic */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('mada')}
                        className={`p-5 rounded-2xl border-2 transition-all flex justify-between items-center bg-white ${
                          selectedPaymentMethod === 'mada' ? 'border-[#A56A1E]' : 'border-[#D8D1C7]/50 hover:border-[#7A563D]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-13 bg-blue-100 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-blue-900 border border-blue-200">
                            mada
                          </div>
                          <span className="text-xs font-bold text-[#121212]">{t('مدى (البطاقة الوطنية)', 'Mada Portal')}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedPaymentMethod === 'mada' ? 'border-[#A56A1E] bg-[#A56A1E]' : 'border-[#D8D1C7]'
                        }`}>
                          {selectedPaymentMethod === 'mada' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>

                      {/* Visa card type */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('visa')}
                        className={`p-5 rounded-2xl border-2 transition-all flex justify-between items-center bg-white ${
                          selectedPaymentMethod === 'visa' ? 'border-[#A56A1E]' : 'border-[#D8D1C7]/50 hover:border-[#7A563D]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-900/10 rounded-lg flex items-center justify-center font-bold text-xs text-blue-900">
                            VISA
                          </div>
                          <span className="text-xs font-bold text-[#121212]">{t('فيزا كارد', 'Visa')}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedPaymentMethod === 'visa' ? 'border-[#A56A1E] bg-[#A56A1E]' : 'border-[#D8D1C7]'
                        }`}>
                          {selectedPaymentMethod === 'visa' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>

                      {/* Mastercard choice */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('mastercard')}
                        className={`p-5 rounded-2xl border-2 transition-all flex justify-between items-center bg-white ${
                          selectedPaymentMethod === 'mastercard' ? 'border-[#A56A1E]' : 'border-[#D8D1C7]/50 hover:border-[#7A563D]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center font-bold text-xs text-orange-600">
                            MC
                          </div>
                          <span className="text-xs font-bold text-[#121212]">{t('ماستر كارد', 'Mastercard')}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedPaymentMethod === 'mastercard' ? 'border-[#A56A1E] bg-[#A56A1E]' : 'border-[#D8D1C7]'
                        }`}>
                          {selectedPaymentMethod === 'mastercard' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>

                    </div>

                    {/* Return back buttons and pay actions combo */}
                    <div className="pt-6 border-t border-[#D8D1C7]/45 flex flex-wrap gap-4 items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setPaymentStep(false)}
                        className="px-6 py-3.5 rounded-xl border border-[#7A563D] text-[#7A563D] text-xs font-bold hover:bg-[#7A563D]/5 transition-colors cursor-pointer"
                      >
                        {t('رجوع للبيانات', 'Back to Profile')}
                      </button>

                      <button
                        type="button"
                        onClick={handleFinalPaymentSubmit}
                        disabled={submissionLoading}
                        className="px-8 py-3.5 rounded-xl bg-[#7A563D] text-white text-xs font-bold hover:bg-[#946B4B] transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>{submissionLoading ? t('جارٍ الإرسال…', 'Submitting…') : t('ادفع الآن ٢٣٠٠ ريال', 'Pay 2,300 SAR Now')}</span>
                      </button>
                    </div>
                    {submissionError && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {submissionError}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  // Step 1: PROFILE / SUBSCRIPTION FORM fields
                  <motion.form
                    key="form"
                    onSubmit={handleProceedToPayment}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 text-start"
                  >
                    <div className="text-start pb-4 border-b border-[#D8D1C7]/40">
                      <span className="text-xs font-bold text-[#A56A1E] uppercase tracking-wider block mb-1">
                        {t('بيانات العقد الطبي', 'MEMBER REGISTRATION')}
                      </span>
                      <p className="text-xs text-[#5B5B5B] font-light">
                        {t('يرجى كتابة كافة الخانات بدقة لتمكين الكادر من إلحاق ملفك بالسجل القضائي للمحاماة.', 'Enter profiles carefully so legal counsels are matched to your clinical license.')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name input */}
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-[#7A563D] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#A56A1E]" />
                          <span>{t('الاسم الكامل *', 'Full Name *')}</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder={t('د. خالد محمد أحمد', 'Dr. Khaled Mohammed')}
                          className="w-full px-4 py-3 text-xs bg-white border border-[#D8D1C7] rounded-xl focus:border-[#A56A1E] focus:outline-none transition-colors placeholder-[#121212]/30"
                        />
                        {formErrors.fullName && <p className="text-[10px] text-red-500">{formErrors.fullName}</p>}
                      </div>

                      {/* Phone input */}
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-[#7A563D] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#A56A1E]" />
                          <span>{t('رقم الجوال *', 'Phone Number *')}</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="05xxxxxxxx"
                          className="w-full px-4 py-3 text-xs bg-white border border-[#D8D1C7] rounded-xl focus:border-[#A56A1E] focus:outline-none transition-colors placeholder-[#121212]/30"
                        />
                        {formErrors.phone && <p className="text-[10px] text-red-500">{formErrors.phone}</p>}
                      </div>

                      {/* Email Input */}
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-[#7A563D] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#A56A1E]" />
                          <span>{t('البريد الإلكتروني *', 'Email address *')}</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="name@healthcare.com"
                          className="w-full px-4 py-3 text-xs bg-white border border-[#D8D1C7] rounded-xl focus:border-[#A56A1E] focus:outline-none transition-colors placeholder-[#121212]/30"
                        />
                        {formErrors.email && <p className="text-[10px] text-red-500">{formErrors.email}</p>}
                      </div>

                      {/* National ID / Iqama */}
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-[#7A563D] flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#A56A1E]" />
                          <span>{t('رقم الهوية / الإقامة *', 'National ID / Iqama *')}</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.idNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                          placeholder="1xxxxxxxxxx"
                          className="w-full px-4 py-3 text-xs bg-white border border-[#D8D1C7] rounded-xl focus:border-[#A56A1E] focus:outline-none transition-colors placeholder-[#121212]/30"
                        />
                        {formErrors.idNumber && <p className="text-[10px] text-red-500">{formErrors.idNumber}</p>}
                      </div>

                      {/* Specialty input */}
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-[#7A563D] flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#A56A1E]" />
                          <span>{t('التخصص الطبي *', 'Medical Specialty *')}</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.specialty}
                          onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                          placeholder={t('جراحة أطفال، طب الطوارئ الخ', 'Pediatrics, ER Medicine, etc.')}
                          className="w-full px-4 py-3 text-xs bg-white border border-[#D8D1C7] rounded-xl focus:border-[#A56A1E] focus:outline-none transition-colors placeholder-[#121212]/30"
                        />
                        {formErrors.specialty && <p className="text-[10px] text-red-500">{formErrors.specialty}</p>}
                      </div>

                      {/* City input */}
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-[#7A563D] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#A56A1E]" />
                          <span>{t('المدينة', 'City')}</span>
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder={t('جدة، الرياض، الخبر الخ', 'Jeddah, Riyadh, etc.')}
                          className="w-full px-4 py-3 text-xs bg-white border border-[#D8D1C7] rounded-xl focus:border-[#A56A1E] focus:outline-none transition-colors placeholder-[#121212]/30"
                        />
                      </div>

                      {/* Workplace / Employer */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-extrabold text-[#7A563D] flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-[#A56A1E]" />
                          <span>{t('جهة العمل والمستشفى', 'Workplace / Hospital Details')}</span>
                        </label>
                        <input
                          type="text"
                          value={formData.employer}
                          onChange={(e) => setFormData(prev => ({ ...prev, employer: e.target.value }))}
                          placeholder={t('مستشفى الملك فيصل التخصصي الخ', 'King Faisal Hospital & Research Centre')}
                          className="w-full px-4 py-3 text-xs bg-white border border-[#D8D1C7] rounded-xl focus:border-[#A56A1E] focus:outline-none transition-colors placeholder-[#121212]/30"
                        />
                      </div>

                      {/* Convicted before query (Yes or No) */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-extrabold text-[#7A563D] flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-[#A56A1E]" />
                          <span>{t('هل تم الحكم عليك في قضية طبية قبل الان؟ *', 'Have you been convicted in a medical case before? *')}</span>
                        </label>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, hasBeenConvicted: 'yes' }))}
                            className={`flex-1 py-3.5 text-xs font-bold rounded-xl border transition-all duration-300 cursor-pointer ${
                              formData.hasBeenConvicted === 'yes'
                                ? 'bg-[#7A563D] text-white border-[#7A563D] shadow-sm'
                                : 'bg-white text-[#121212]/70 border-[#D8D1C7] hover:border-[#7A563D]/40'
                            }`}
                          >
                            {t('نعم', 'Yes')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, hasBeenConvicted: 'no' }))}
                            className={`flex-1 py-3.5 text-xs font-bold rounded-xl border transition-all duration-300 cursor-pointer ${
                              formData.hasBeenConvicted === 'no'
                                ? 'bg-[#7A563D] text-white border-[#7A563D] shadow-sm'
                                : 'bg-white text-[#121212]/70 border-[#D8D1C7] hover:border-[#7A563D]/40'
                            }`}
                          >
                            {t('لا', 'No')}
                          </button>
                        </div>
                      </div>

                      {/* Notes area */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-extrabold text-[#7A563D] flex items-center gap-1.5">
                          <ClipboardList className="w-3.5 h-3.5 text-[#A56A1E]" />
                          <span>{t('ملاحظات إضافية أو طلبات خاصة', 'Notes / Custom Demands')}</span>
                        </label>
                        <textarea
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder={t('صف أي وضع عيادي طارئ أو تفاصيل عن تراخيص الهيئة الطبية', 'Describe clinical scenarios or active defense inquiries')}
                          className="w-full px-4 py-3 text-xs bg-white border border-[#D8D1C7] rounded-xl focus:border-[#A56A1E] focus:outline-none transition-colors resize-none placeholder-[#121212]/30"
                        />
                      </div>
                    </div>

                    {/* Checkbox agreed */}
                    <div className="relative flex items-start gap-3 pt-2">
                      <div className="flex items-center h-5">
                        <input
                          id="terms-agreed"
                          type="checkbox"
                          required
                          checked={formData.agreed}
                          onChange={(e) => setFormData(prev => ({ ...prev, agreed: e.target.checked }))}
                          className="w-4 h-4 text-[#A56A1E] border-[#D8D1C7] rounded-md focus:ring-[#A56A1E]"
                        />
                      </div>
                      <label htmlFor="terms-agreed" className="text-xs font-light text-[#5B5B5B] select-none text-start">
                        {t(
                          'أقر بدقة البيانات وموافقتي الكاملة على الشروط والأحكام الخاصة ببند سند الطبيب.',
                          'I attest to the validity of the parameters and acknowledge complete alignment with program terms.'
                        )}
                      </label>
                    </div>
                    {formErrors.agreed && <p className="text-[10px] text-red-500 mt-1">{formErrors.agreed}</p>}

                    {/* Step submit check triggers */}
                    <div className="pt-4 border-t border-[#D8D1C7]/40 text-start">
                      <button
                        type="submit"
                        className="px-8 py-3.5 rounded-xl bg-[#7A563D] hover:bg-[#946B4B] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer"
                      >
                        {t('انتقل للدفع', 'Proceed to Payment')}
                      </button>
                    </div>

                  </motion.form>
                )}
              </AnimatePresence>

            </div>

            {/* Right side: Sticky Order Summary */}
            <div className="lg:col-span-4 lg:sticky lg:top-[120px] bg-[#F8F5EF] rounded-3xl border border-[#D8D1C7] p-8 space-y-6 shadow-xs text-start">
              <h3 className="text-md sm:text-lg font-bold text-[#7A563D] pb-3 border-b border-[#D8D1C7]/40 font-serif">
                {t('ملخص طلب الاشتراك', 'Order Details Summary')}
              </h3>

              <div className="space-y-4">
                
                {/* Basic Item */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5B5B5B] font-light">{t('البرنامج المعتمد:', 'Selected Program:')}</span>
                  <span className="font-bold text-[#7A563D]">{t('سند الطبيب المتكامل', 'Integrated Doctor Shield')}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5B5B5B] font-light">{t('مدة العقد للرعاية:', 'Active Shield Term:')}</span>
                  <span className="font-bold text-[#7A563D]">{t('سنة واحدة (١٢ شهراً)', '1 Year (12 Months)')}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5B5B5B] font-light">{t('الضريبة المحلية (ZATCA):', 'Local VAT Tax:')}</span>
                  <span className="font-light text-[#A56A1E] font-mono">{t('مشمولة مسبقاً (١٥٪)', '15% Included')}</span>
                </div>

                {/* Main line separator */}
                <div className="h-[1px] bg-[#D8D1C7]/40 my-2" />

                {/* Total row */}
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-[#7A563D]">{t('المبلغ الإجمالي السنوي:', 'Total Annual Cost:')}</span>
                    <span className="text-[10px] text-emerald-600 block">{t('لا مبالغ مستترة أو رسوم دفاعية', 'No hidden filing fees')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black font-serif text-[#121212] tracking-tight">٢٣٠٠</span>
                    <span className="text-xs font-bold text-[#7A563D] ml-1">{t('ريال درهم', 'SAR')}</span>
                  </div>
                </div>

              </div>

              {/* Secure attributes footer */}
              <div className="p-4 rounded-xl bg-white border border-[#D8D1C7]/40 space-y-2.5">
                <div className="flex items-center gap-2 text-[10px] text-[#5B5B5B] font-light">
                  <Lock className="w-3.5 h-3.5 text-[#A56A1E] shrink-0" />
                  <span>{t('تشفير المعاملات الرقمية بالكامل SSL', 'Airtight Transaction Protection SSL')}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#5B5B5B] font-light">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#7A563D] shrink-0" />
                  <span>{t('مضمون من حنبولي الدولية للمحاماة', 'Backed by Hesham Hanboly International')}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* SECTION 7 — FAQ ACCORDION */}
      <section className="py-20 sm:py-28 bg-[#FFFFFF] border-b border-[#D8D1C7]/40">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-16">
            <span className="text-xs font-bold text-[#A56A1E] uppercase tracking-widest block">
              {t(
                toStringValue(doctorShieldFaqBlock?.data?.subheadingAr, 'أسئلة شائعة وتوضيحات'),
                toStringValue(doctorShieldFaqBlock?.data?.subheadingEn, 'PROGRAM ACCORDION')
              )}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#7A563D] font-serif tracking-tight">
              {t(
                toStringValue(doctorShieldFaqBlock?.data?.headingAr, 'إجابات وحقائق حول سند الطبيب'),
                toStringValue(doctorShieldFaqBlock?.data?.headingEn, 'Frequently Answered Inquiries')
              )}
            </h2>
            <div className="h-[2px] w-12 bg-[#A56A1E] mx-auto mt-3" />
          </div>

          <div className="space-y-4">
            {faqList.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#F8F5EF] rounded-2xl border border-[#D8D1C7]/50 overflow-hidden transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-start flex justify-between items-center gap-4 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-extrabold text-[#7A563D] flex items-center gap-2">
                      <HelpCircle className="w-4.5 h-4.5 text-[#A56A1E] shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown className={`w-5 h-5 text-[#A56A1E] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#4B4B4B] font-light leading-relaxed border-t border-[#D8D1C7]/30 text-justify">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 8 — FINAL CTA */}
      <section className="py-20 bg-[#7A563D] text-white relative overflow-hidden text-center">
        {/* Subtle geometric lines */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="0" x2="90%" y2="100%" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="90%" y1="0" x2="10%" y2="100%" stroke="#FFFFFF" strokeWidth="1" />
          </svg>
        </div>

        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          
          <span className="text-xs font-bold uppercase tracking-widest text-[#F1ECE3]/60 block">
            {t('أمانك الطبي بين أيدٍ أمينة مرخصة', 'CERTIFIED PRESTIGE COUNSEL')}
          </span>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-white leading-tight">
              {t('احصل على الحماية القانونية التي تستحقها', 'Acquire the Ultimate Shield Today')}
            </h2>
            <p className="text-sm sm:text-md text-[#F1ECE3]/80 font-light max-w-2xl mx-auto leading-relaxed">
              {t(
                'فريقنا ومحامونا المرخصون على أهبة الاستعداد لإدارة المخاطر وتفنيد الدفوع المرافقة لمهنتك بأسلوب وقائي متفوق.',
                'Our elite licensed litigators are fully mobilized. Secure your professional boundaries and pursue your medical duties with peaceful reassurance.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => scrollToRef(paymentSectionRef)}
              className="px-8 py-4 rounded-xl bg-[#A56A1E] hover:bg-[#b87c2b] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              {t('ابدأ اشتراكك السنوي المضمون', 'Join Program Now')}
            </button>
            <button
              onClick={onScrollToContact}
              className="px-8 py-4 rounded-xl border border-white/35 hover:bg-white/5 text-[#F1ECE3] text-xs font-semibold tracking-wider transition-all cursor-pointer"
            >
              {t('تواصل معنا للاستفسار', 'Consult Our Advisors')}
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
