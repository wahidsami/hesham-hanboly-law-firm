import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle, 
  Building, 
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Briefcase,
  Compass,
  Clock
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';
import { contentClient } from '../content/contentClient';
import type { CMSPublishedPageRecord } from '../types';

interface ContactPageProps {
  onScrollToContact?: () => void;
  onBackToHome?: () => void;
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export default function ContactPage({ onScrollToContact, onBackToHome }: ContactPageProps) {
  const { direction, language, t } = useLanguage();
  const { content } = useSiteContent();
  const siteSettings = content?.siteSettings;
  const [contactCmsPage, setContactCmsPage] = useState<CMSPublishedPageRecord | null>(null);

  // Smooth scroll back to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCmsContact() {
      try {
        const page = await contentClient.getCmsPage('contact');
        if (!cancelled) {
          setContactCmsPage(page);
        }
      } catch {
        if (!cancelled) {
          setContactCmsPage(null);
        }
      }
    }

    void loadCmsContact();
    return () => {
      cancelled = true;
    };
  }, []);

  const [activeOfficeIndex, setActiveOfficeIndex] = useState(0);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.email) {
      alert(t('الرجاء تعبئة الحقول الأساسية (الاسم، الجوال، والبريد الإلكتروني)', 'Please fill in the primary fields (Full Name, Phone, and Email)'));
      return;
    }
    setFormSubmitted(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const contactBlocks = useMemo(
    () => contactCmsPage?.blocks?.filter((block) => block.type === 'contact') ?? [],
    [contactCmsPage]
  );

  const offices = useMemo(() => {
    const mapped = contactBlocks.slice(0, 2).map((block, index) => ({
      key: block.id,
      name: t(
        toStringValue(block.data?.officeNameAr ?? block.data?.headingAr, index === 0 ? 'مكتب جدة الرئيسي' : 'فرع الرياض'),
        toStringValue(block.data?.officeNameEn ?? block.data?.headingEn, index === 0 ? 'Jeddah Main Office (HQ)' : 'Riyadh Branch')
      ),
      phone: toStringValue(block.data?.phone, index === 0 ? '012 6636716 / 920004713' : '0112101333 / 0112101555'),
      address: t(
        toStringValue(block.data?.addressAr, index === 0
          ? 'حي الروضة ١، شارع نهضة التعليم، متفرع من شارع التحلية، مجمع صفوة الأعمال، فيلا رقم ٦'
          : 'طريق الملك عبد العزيز، تقاطع شارع أبي الحسن المحدّث، مبنى الرومي - مدخل رقم واحد'
        ),
        toStringValue(block.data?.addressEn, index === 0
          ? 'Al-Rawdah 1 District, Nahdat Al-Taleem St, off Tahlia St, Safwah Business Center, Villa No. 6'
          : 'King Abdulaziz Road, intersection with Abi Al-Hasan Al-Muhaddith St, Al-Rumi Building - Entrance 1'
        )
      ),
      workHours: t(
        toStringValue(block.data?.workHoursAr, 'الأحد - الخميس: ٨:٣٠ ص - ٥:٣٠ م'),
        toStringValue(block.data?.workHoursEn, 'Sunday - Thursday: 8:30 AM - 5:30 PM')
      ),
      email: toStringValue(block.data?.email, 'mec_law@hotmail.com'),
    }));

    if (mapped.length > 0) return mapped;

    return [
      {
        key: 'fallback-jeddah',
        name: t('مكتب جدة الرئيسي', 'Jeddah Main Office (HQ)'),
        phone: '012 6636716 / 920004713',
        address: t(
          'حي الروضة ١، شارع نهضة التعليم، متفرع من شارع التحلية، مجمع صفوة الأعمال، فيلا رقم ٦',
          'Al-Rawdah 1 District, Nahdat Al-Taleem St, off Tahlia St, Safwah Business Center, Villa No. 6'
        ),
        workHours: t('الأحد - الخميس: ٨:٣٠ ص - ٥:٣٠ م', 'Sunday - Thursday: 8:30 AM - 5:30 PM'),
        email: 'mec_law@hotmail.com',
      },
      {
        key: 'fallback-riyadh',
        name: t('فرع الرياض', 'Riyadh Branch'),
        phone: '0112101333 / 0112101555',
        address: t(
          'طريق الملك عبد العزيز، تقاطع شارع أبي الحسن المحدّث، مبنى الرومي - مدخل رقم واحد',
          'King Abdulaziz Road, intersection with Abi Al-Hasan Al-Muhaddith St, Al-Rumi Building - Entrance 1'
        ),
        workHours: t('الأحد - الخميس: ٨:٣٠ ص - ٥:٣٠ م', 'Sunday - Thursday: 8:30 AM - 5:30 PM'),
        email: 'mec_law@hotmail.com',
      },
    ];
  }, [contactBlocks, t]);

  const isRtl = direction === 'rtl';
  const textAlignClass = isRtl ? 'text-right' : 'text-left';

  return (
    <div 
      className="min-h-screen bg-[#F1ECE3] overflow-x-hidden font-sans select-none text-[#1E1E1E]" 
      style={{ direction }}
    >
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-[#121212] py-24 text-white overflow-hidden border-b border-[#A56A1E]/30">
        
        {/* Luxury Background Layers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(165,106,30,0.18)_0%,transparent_75%)] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F1ECE3] to-transparent pointer-events-none opacity-100 z-10" />
        
        {/* Floating gold lines decor */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="15%" y1="0" x2="25%" y2="100%" stroke="#A56A1E" strokeWidth="1" />
            <line x1="85%" y1="0" x2="75%" y2="100%" stroke="#A56A1E" strokeWidth="1" />
            <circle cx="35%" cy="40%" r="4" fill="#A56A1E" />
            <circle cx="65%" cy="70%" r="3" fill="#A56A1E" />
          </svg>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 space-y-6 text-center lg:text-start">
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1.5 rounded-full bg-[#A56A1E]/15 border border-[#A56A1E]/30 text-xs text-[#E5D5C5] font-semibold tracking-wider uppercase"
            >
              <span className="w-2 h-2 rounded-full bg-[#A56A1E] animate-pulse" />
              <span>
                {t(
                  siteSettings?.contactHeroBadgeAr || 'تواصل معنا',
                  siteSettings?.contactHeroBadgeEn || 'CONTACT US'
                )}
              </span>
            </motion.div>

            {onBackToHome && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 self-center lg:self-auto px-4 py-1.5 rounded-lg border border-white/20 hover:border-white/50 text-white hover:bg-white/5 text-xs font-bold transition-all duration-300 cursor-pointer"
              >
                {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{t('العودة للرئيسية', 'Back to Home')}</span>
              </motion.button>
            )}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            {t(
              siteSettings?.contactHeroTitleAr || 'خبراء قانونيون على استعداد لخدمتك',
              siteSettings?.contactHeroTitleEn || 'Strategic Counselors Prepared to Defend'
            )}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-[2px] w-16 bg-[#A56A1E] mx-auto lg:mx-0"
          />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-[#E2DCD3] text-base sm:text-lg lg:text-xl font-light max-w-3xl leading-relaxed text-justify lg:text-start"
          >
            {t(
              siteSettings?.contactHeroDescAr || 'تواصل معنا للحصول على استشارات قانونية احترافية وخدمات قانونية متخصصة للأفراد والشركات في جميع أنحاء المملكة.',
              siteSettings?.contactHeroDescEn || 'Reach out for refined legal consultations and bespoke representation, serving corporate players and prestigious individuals throughout the Kingdom.'
            )}
          </motion.p>

        </div>
      </section>


      {/* 2. NATIONWIDE CONTACT INFORMATION SECTION */}
      <section className="py-20 bg-[#F8F5EF] relative border-b border-[#D8D1C7]/40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-semibold text-[#A56A1E] uppercase tracking-wider block">
              {t(
                siteSettings?.contactSectionBadgeAr || 'نحن حيث يتواجد عملاؤنا ومصالحهم الاستثمارية',
                siteSettings?.contactSectionBadgeEn || 'ESTABLISHING LEGAL SECURE INFRASTRUCTURES NATIONWIDE'
              )}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E]">
              {t(
                siteSettings?.contactSectionTitleAr || 'نقدم خدماتنا في جميع أنحاء المملكة',
                siteSettings?.contactSectionTitleEn || 'Advocacy Rendered Across the Kingdom'
              )}
            </h2>
            <p className="text-sm sm:text-base text-[#4B4B4B] font-light leading-relaxed max-w-3xl mx-auto">
              {t(
                siteSettings?.contactSectionDescAr || 'يسعدنا التوجيه والإجابة على كافة استفساراتكم القانونية بدقة وسرية تامة.',
                siteSettings?.contactSectionDescEn || 'We are pleased to guide and answer all your legal inquiries with precision and utter confidentiality.'
              )}
            </p>
            <div className="h-[1.5px] w-12 bg-[#A56A1E] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 - Phone */}
            <motion.div
              whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(165,106,30,0.1)' }}
              className={`rounded-2xl p-8 bg-white border border-[#D8D1C7] ${textAlignClass} flex flex-col justify-between group relative overflow-hidden transition-all duration-300`}
            >
              <div className="space-y-6">
                <div className={`flex justify-between items-center ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-12 h-12 rounded-xl bg-[#A56A1E]/10 flex items-center justify-center text-[#A56A1E] group-hover:bg-[#A56A1E] group-hover:text-white transition-all duration-500">
                    <Phone className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#A56A1E] tracking-wider uppercase bg-[#A56A1E]/10 px-2 py-1 rounded">
                    {t('متاح دائماً', 'RESPONSIVE LINES')}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#1E1E1E]">{t('الجوال والاتصال', 'Phone & Multi-Lines')}</h3>
                  <div className="space-y-2 text-sm text-[#5B5B5B]">
                    <div>
                      <span className="font-semibold text-[#1E1E1E] text-xs block text-[#A56A1E]">{t('الرياض:', 'Riyadh:')}</span>
                      <a href="tel:0112101333" className="font-mono text-xs sm:text-sm hover:text-[#A56A1E] block">0112101333</a>
                      <a href="tel:0112101555" className="font-mono text-xs sm:text-sm hover:text-[#A56A1E] block">0112101555</a>
                    </div>
                    <div className="pt-2 border-t border-[#D8D1C7]/30">
                      <span className="font-semibold text-[#1E1E1E] text-xs block text-[#A56A1E]">{t('جدة والهاتف الموحد:', 'Jeddah & Unified Line:')}</span>
                      <a href="tel:0126636716" className="font-mono text-xs sm:text-sm hover:text-[#A56A1E] block">012 6636716</a>
                      <a href="tel:920004713" className="font-mono text-xs sm:text-sm hover:text-[#A56A1E] block">920004713</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`h-[2px] w-0 bg-[#A56A1E] absolute bottom-0 ${isRtl ? 'right-0' : 'left-0'} group-hover:w-full transition-all duration-500`} />
            </motion.div>

            {/* Card 2 - Email */}
            <motion.div
              whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(165,106,30,0.1)' }}
              className={`rounded-2xl p-8 bg-white border border-[#D8D1C7] ${textAlignClass} flex flex-col justify-between group relative overflow-hidden transition-all duration-300`}
            >
              <div className="space-y-6">
                <div className={`flex justify-between items-center ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-12 h-12 rounded-xl bg-[#A56A1E]/10 flex items-center justify-center text-[#A56A1E] group-hover:bg-[#A56A1E] group-hover:text-white transition-all duration-500">
                    <Mail className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#A56A1E] tracking-wider uppercase bg-[#A56A1E]/10 px-2 py-1 rounded">
                    {t('رسمي ومؤتمن', 'SECURED PORTAL')}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#1E1E1E]">{t('البريد الإلكتروني', 'Email Correspondences')}</h3>
                  <div className="space-y-1 text-sm text-[#5B5B5B]">
                    <span className="text-xs font-semibold text-[#A56A1E] block">{t('المراسلات الرسمية والاستفسارات:', 'Corporate Dispatch & Inquiries:')}</span>
                    <a href="mailto:mec_law@hotmail.com" className="font-mono text-sm hover:text-[#A56A1E] block select-all">mec_law@hotmail.com</a>
                    <p className="text-xs text-[#5B5B5B] font-light pt-4 leading-relaxed">
                      {t(
                        '* تتم مراجعة كافة الطلبات والمراسلات بدقة فائقة من إدارة الامتثال بفرع الرياض وجدة بصفة دورية لضمان سرعة الاستجابة.',
                        '* All incoming briefings and records are processed under strict oversight from our corporate compliance team to guarantee efficient routing and confidentiality.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`h-[2px] w-0 bg-[#A56A1E] absolute bottom-0 ${isRtl ? 'right-0' : 'left-0'} group-hover:w-full transition-all duration-500`} />
            </motion.div>

            {/* Card 3 - Address */}
            <motion.div
              whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(165,106,30,0.1)' }}
              className={`rounded-2xl p-8 bg-white border border-[#D8D1C7] ${textAlignClass} flex flex-col justify-between group relative overflow-hidden transition-all duration-300`}
            >
              <div className="space-y-6">
                <div className={`flex justify-between items-center ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-12 h-12 rounded-xl bg-[#A56A1E]/10 flex items-center justify-center text-[#A56A1E] group-hover:bg-[#A56A1E] group-hover:text-white transition-all duration-500">
                    <MapPin className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#A56A1E] tracking-wider uppercase bg-[#A56A1E]/10 px-2 py-1 rounded">
                    {t('الفروع الرئيسية', 'PRINCIPAL DOMS')}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#1E1E1E]">{t('العناوين الرسمية', 'Offices & Locations')}</h3>
                  <div className="space-y-2 text-xs sm:text-sm text-[#4B4B4B] font-light">
                    <div>
                      <span className="font-semibold text-[#1E1E1E] text-xs block text-[#A56A1E]">{t('فرع الرياض:', 'Riyadh Branch:')}</span>
                      <p className="leading-relaxed">{t('طريق الملك عبد العزيز، تقاطع شارع أبي الحسن المحدّث، مبنى الرومي - مدخل رقم واحد', 'King Abdulaziz Road, intersection with Abi Al-Hasan Al-Muhaddith St, Al-Rumi Building - Entrance 1')}</p>
                    </div>
                    <div className="pt-2 border-t border-[#D8D1C7]/35">
                      <span className="font-semibold text-[#1E1E1E] text-xs block text-[#A56A1E]">{t('مقر جدة:', 'Jeddah HQ:')}</span>
                      <p className="leading-relaxed">{t('حي الروضة ١، شارع نهضة التعليم، متفرع من شارع التحلية، مجمع صفوة الأعمال، فيلا رقم ٦', 'Al-Rawdah 1 District, Nahdat Al-Taleem St, off Tahlia St, Safwah Business Center, Villa No. 6')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`h-[2px] w-0 bg-[#A56A1E] absolute bottom-0 ${isRtl ? 'right-0' : 'left-0'} group-hover:w-full transition-all duration-500`} />
            </motion.div>

          </div>

        </div>
      </section>


      {/* 3. INTERACTIVE MAP + CONTACT FORM SECTION */}
      <section className="py-20 sm:py-28 bg-[#F1ECE3] relative border-b border-[#D8D1C7]/40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* LEFT SIDE: Beautiful visual interactive map with switches */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="rounded-2xl p-6 bg-white border border-[#D8D1C7] shadow-sm space-y-6">
                
                {/* Switcher header tabs */}
                <div className="flex gap-2 p-1.5 bg-[#F1ECE3] rounded-xl">
                  {offices.map((office, index) => (
                    <button
                      key={office.key}
                      onClick={() => setActiveOfficeIndex(index)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeOfficeIndex === index
                          ? 'bg-[#A56A1E] text-white shadow-xs'
                          : 'text-[#5B5B5B] hover:text-[#1E1E1E]'
                      }`}
                    >
                      {office.name}
                    </button>
                  ))}
                </div>

                {/* Simulated interactive premium visual legal map of Saudi Arabia */}
                <div className="relative aspect-video w-full rounded-xl bg-[#F8F5EF] border border-[#D8D1C7]/55 overflow-hidden flex items-center justify-center p-4">
                  {/* Subtle Grid Art Decor */}
                  <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#1E1E1E" strokeWidth="0.5" />
                      <line x1="40%" y1="0" x2="40%" y2="100%" stroke="#1E1E1E" strokeWidth="0.5" />
                      <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#1E1E1E" strokeWidth="0.5" />
                      <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#1E1E1E" strokeWidth="0.5" />
                      <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#1E1E1E" strokeWidth="0.5" />
                      <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#1E1E1E" strokeWidth="0.5" />
                    </svg>
                  </div>

                  {/* Elegant abstracted Map Vector outline of KSA */}
                  <svg viewBox="0 0 400 300" className="w-[85%] h-auto text-[#D8D1C7] fill-transparent stroke-[#A56A1E]/20 stroke-2 opacity-55">
                    <path d="M 60,110 C 80,70 120,40 180,30 C 260,20 320,50 360,100 C 380,130 390,170 370,210 C 350,240 310,270 250,280 C 180,290 120,290 80,260 C 40,230 30,170 40,140 Z" />
                    {/* Riyadh Inner Core */}
                    <circle cx="210" cy="140" r="45" fill="#A56A1E" fillOpacity="0.04" stroke="#A56A1E" strokeOpacity="0.1" strokeDasharray="2 2" />
                    {/* Jeddah western coast */}
                    <circle cx="90" cy="200" r="40" fill="#A56A1E" fillOpacity="0.04" stroke="#A56A1E" strokeOpacity="0.1" strokeDasharray="2 2" />
                  </svg>

                  {/* Pin 1: Jeddah Link */}
                  {offices.slice(0, 2).map((office, index) => (
                    <div
                      key={office.key}
                      onClick={() => setActiveOfficeIndex(index)}
                      className={`absolute ${
                        index === 0 ? 'left-[24%] top-[65%]' : 'left-[54%] top-[46%]'
                      } transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group text-center`}
                    >
                      <span className={`absolute -inset-2.5 rounded-full bg-[#A56A1E]/30 animate-ping duration-1000 ${activeOfficeIndex === index ? 'inline-flex' : 'hidden'}`} />
                      <div className={`w-6 h-6 rounded-full border-2 bg-[#F8F5EF] mx-auto flex items-center justify-center shadow-md transition-all ${activeOfficeIndex === index ? 'border-[#A56A1E] scale-110' : 'border-[#D8D1C7] hover:border-[#A56A1E]'}`}>
                        <MapPin className={`w-3.5 h-3.5 ${activeOfficeIndex === index ? 'text-[#A56A1E]' : 'text-gray-400'}`} />
                      </div>
                      <span className="absolute left-1/2 -translate-x-1/2 top-7 font-bold text-[10px] text-[#1E1E1E] bg-[#F8F5EF] py-0.5 px-1.5 rounded border border-[#D8D1C7] whitespace-nowrap shadow-xs">
                        {office.name}
                      </span>
                    </div>
                  ))}

                </div>

                {/* Displaying selected office info details directly inside map component */}
                <div className={`space-y-4 pt-4 border-t border-[#D8D1C7]/40 ${textAlignClass}`}>
                  <h4 className="text-[#A56A1E] font-extrabold text-base flex items-center gap-2 select-text justify-start">
                    <Building className="w-5 h-5 shrink-0" />
                    <span>{offices[activeOfficeIndex]?.name}</span>
                  </h4>

                  <div className="space-y-3 text-xs sm:text-sm text-[#4B4B4B]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#A56A1E]/60 mt-0.5 shrink-0" />
                      <p className="font-light leading-relaxed text-justify select-text">{offices[activeOfficeIndex]?.address}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#A56A1E]/60 shrink-0" />
                      <span className="font-mono select-text">{offices[activeOfficeIndex]?.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#A56A1E]/60 shrink-0" />
                      <span>{offices[activeOfficeIndex]?.workHours}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT SIDE: Luxury Contact Form with fields focus animations */}
            <div className={`lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-[#D8D1C7] ${textAlignClass} shadow-sm relative overflow-hidden`}>
              <div className="absolute top-0 left-0 w-24 h-24 bg-[#A56A1E]/5 rounded-full blur-xl pointer-events-none" />

              {formSubmitted ? (
                <div className="py-16 px-4 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-[#A56A1E]/15 flex items-center justify-center text-[#A56A1E] animate-bounce">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1E1E1E]">
                    {t('تم تقديم استفسارك القانوني بنجاح', 'Your Inquiry Received Successfully')}
                  </h3>
                  <p className="text-sm text-[#5B5B5B] max-w-lg mx-auto leading-relaxed">
                    {t(
                      `شكراً لثقتكم واختياركم لمجموعتنا. لقد تم تسجيل طلبكم برقم تتبع آمن وسيتم تحويله فوراً لكبير المستشارين بفرع ${offices[activeOfficeIndex]?.name || 'جدة'} لمراجعة التفاصيل، والاتصال بكم عبر الهاتف ${formData.phone} أو البريد الإلكتروني في غضون ٢٤ ساعة كحد أقصى.`,
                      `Thank you for placing your trust in our firm. Your inquiry has been successfully logged into our secure dispatch systems. A senior counsel from our ${offices[activeOfficeIndex]?.name || 'Jeddah Head Office'} will review your file detail and get in touch with you at ${formData.phone} or your email address within 24 hours.`
                    )}
                  </p>
                  
                  <button
                    onClick={() => {
                      setFormData({
                        fullName: '',
                        phone: '',
                        email: '',
                        message: ''
                      });
                      setFormSubmitted(false);
                    }}
                    className="px-8 py-3 rounded-lg bg-[#A56A1E] hover:bg-[#946B4B] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    {t('تقديم استفسار قانوني آخر', 'Submit Another Case Brief')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2 border-b border-[#D8D1C7]/40 pb-4">
                    <h3 className="text-xl font-extrabold text-[#1E1E1E]">{t('تواصل معنا', 'Brief Our Experts')}</h3>
                    <p className="text-xs sm:text-sm text-[#5B5B5B] font-light">
                      {t('أرسل استفسارك القانوني الآن وسيقوم مستشار القانوني بالرد والاتصال بكم.', 'Send us your specific case scope. An expert lawyer will evaluate and coordinate with you immediately.')}
                    </p>
                  </div>

                  {/* Field: Full Name */}
                  <div className="space-y-2">
                    <label htmlFor="fullname-field" className="text-xs font-semibold text-[#1E1E1E] block">
                      {t('الاسم بالكامل', 'Full Name')} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      id="fullname-field"
                      name="fullName"
                      required
                      placeholder={t('أدخل الاسم الثلاثي بالكامل', 'Provide your full legal name')}
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Field: Email */}
                    <div className="space-y-2">
                      <label htmlFor="email-field" className="text-xs font-semibold text-[#1E1E1E] block">
                        {t('البريد الإلكتروني', 'Email')} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="email"
                        id="email-field"
                        name="email"
                        required
                        placeholder="example@domain.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] transition-all duration-300 font-mono text-left"
                        style={{ direction: 'ltr' }}
                      />
                    </div>

                    {/* Field: Phone */}
                    <div className="space-y-2">
                      <label htmlFor="phone-field" className="text-xs font-semibold text-[#1E1E1E] block">
                        {t('الجوال', 'Mobile Number')} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="tel"
                        id="phone-field"
                        name="phone"
                        required
                        placeholder={t('05xxxxxxxx', '05xxxxxxxx')}
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] transition-all duration-300 font-mono text-left"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  {/* Field: Message */}
                  <div className="space-y-2">
                    <label htmlFor="message-field" className="text-xs font-semibold text-[#1E1E1E] block">
                      {t('أخبرنا باستفسارك القانوني', 'State Your Legal Inquiry')}
                    </label>
                    <textarea 
                      id="message-field"
                      name="message"
                      rows={5}
                      placeholder={t(
                        'صف هنا طبيعة استفسارك بالتفصيل (مثل: قضايا عمالية، استثمار دولي، تأسيس شركات) لنتمكن من توجيه الطلب للمحامي الأكفأ بمشكلتكم.',
                        'Detail the nature of your concern (e.g. corporate liquidation, cross-border commercial laws, arbitration, labor regulations) so we can assign the most specialized legal specialist to your file.'
                      )}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] transition-all duration-300 font-light leading-relaxed"
                    />
                  </div>

                  {/* Action row with submit button */}
                  <div className="pt-2 text-left space-y-3">
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#A56A1E] hover:bg-[#946B4B] text-white font-extrabold text-sm transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(165,106,30,0.25)] hover:shadow-lg hover:shadow-[#A56A1E]/25 transform active:scale-98 cursor-pointer"
                    >
                      <Send className={`w-4 h-4 ${isRtl ? 'ml-1' : 'mr-1'}`} />
                      <span>{t('إرسال الاستفسار', 'Submit Brief')}</span>
                    </button>
                    
                    <p className={`text-[11px] text-[#5B5B5B] font-light leading-relaxed ${textAlignClass}`}>
                      {t(
                        'بمجرد ارسالك، سيصلنا استفسارك وسنتواصل معك في أقرب فرصة.',
                        'By submitting this brief, your request goes directly to our secure central archive to initiate senior analysis.'
                      )}
                    </p>
                  </div>

                </form>
              )}

            </div>

          </div>

        </div>
      </section>


      {/* 4. EXECUTIVE CONSULTATION CTA */}
      <section className="relative py-24 bg-[#121212] text-white overflow-hidden text-center lg:text-start">
        {/* Soft gold lighting glow, charcoal overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(165,106,30,0.18)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className={`text-xs font-bold text-[#A56A1E] tracking-widest uppercase block ${isRtl ? 'border-r-2 pr-3' : 'border-l-2 pl-3'} border-[#A56A1E]`}>
                {t(
                  siteSettings?.contactSectionOfficeTitleAr || 'الحماية الوقائية وحل الخلافات الكبرى',
                  siteSettings?.contactSectionOfficeTitleEn || 'PREVENTATIVE SAFEGUARDS & MAJOR DISPUTE RESOLUTIONS'
                )}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                {t(
                  siteSettings?.contactSectionFormTitleAr || 'ابدأ استشارتك القانونية اليوم',
                  siteSettings?.contactSectionFormTitleEn || 'Initiate Your Specialized Consultations Today'
                )}
              </h2>
              <p className="text-sm sm:text-base text-gray-300 font-light max-w-2xl leading-relaxed text-justify lg:text-start">
                {t(
                  siteSettings?.contactSectionFormDescAr || 'فريق قانوني بخبرة احترافية ورؤية استراتيجية لحماية مصالحك وتحقيق أهدافك. نقدم خدماتنا بفرعي جدة والرياض لخدمة جميع شركاء النجاح بالمملكة.',
                  siteSettings?.contactSectionFormDescEn || 'A trusted legal league with exquisite expertise and dynamic foresight shielding your interests. Active branches in Riyadh & Jeddah are fully equipped to serve you.'
                )}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 justify-end">
              <button 
                onClick={onScrollToContact}
                className="px-8 py-3.5 rounded-xl bg-[#A56A1E] hover:bg-[#946B4B] text-white text-xs font-bold font-sans transition-all duration-300 shadow-[0_10px_35px_rgba(165,106,30,0.3)] shadow-[#A56A1E]/25 text-center cursor-pointer active:scale-98"
              >
                {t('احجز استشارة', 'Schedule Consultation')}
              </button>
              
              <button 
                onClick={onScrollToContact}
                className="px-8 py-3.5 rounded-xl bg-transparent hover:bg-white/5 text-white border border-white/20 hover:border-white/40 text-xs font-bold font-sans transition-all duration-300 text-center cursor-pointer"
              >
                {t('تواصل معنا', 'Contact Us Today')}
              </button>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
