import React from 'react';
import { Eye, Award, Target, Landmark, ShieldCheck, Scale, Compass } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';

interface AboutProps {
  onExploreAbout?: () => void;
}

export default function About({ onExploreAbout }: AboutProps) {
  const { direction, language, t } = useLanguage();
  const { content } = useSiteContent();
  const siteSettings = content?.siteSettings;
  
  const values = [
    {
      title: t('رؤيتنا', 'Our Vision'),
      content: t(
        'نطمح لأن نكون الوجهة القضائية للمواطنين وملتقى المحامين والمتقاضين من كافة الجنسيات في كافة احتياجاتهم القانونية بنفوذ إقليمي ودولي.',
        'We aspire to stand as an ultimate judicial reference for individuals and corporations, meeting elite multi-layer legal needs with powerful regional and worldwide influence.'
      ),
      icon: Eye,
    },
    {
      title: t('رسالتنا', 'Our Mission'),
      content: t(
        'السعي من خلال سنوات العمل لترسيخ قواعد مركز قانوني وطني يستند نظامه الأساسي لقواعد الشريعة السمحاء لدرء المفاسد وجلب المصالح.',
        'Leveraging decades of litigation mastery to solidify a national legal practice built upon impeccable moral frameworks to safeguard corporate interests.'
      ),
      icon: Landmark,
    },
    {
      title: t('أهدافنا الرئيسية', 'Key Objectives'),
      content: t(
        'نعمل جاهدين لتأصيل الثقافة القانونية وتبسيط الممارسات وبناء أجيال واعدة من الكوادر الوطنية المتمرسة باكتساب الخبرات.',
        'Diligently working to root high legal awareness, streamline dynamic court executions, and build a world-class generation of highly qualified practitioners.'
      ),
      icon: Target,
    },
  ];

  const handleScrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = contactSection.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-0" style={{ direction }}>
      
      {/* 1. ABOUT SECTION */}
      <section 
        id="about" 
        className="py-20 sm:py-28 bg-[#F8F5EF] relative border-b border-[#D8D1C7]/40"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Right Text Block */}
            <div className="lg:col-span-7 space-y-6 text-start">
              
              <div className="inline-flex items-center gap-1.5 border-b border-[#A56A1E] pb-1 self-start">
                <span className="text-xs uppercase font-semibold text-[#A56A1E] tracking-wider">
                  {t(
                    siteSettings?.aboutSectionBadgeAr || 'من نحن • الشريك القانوني للمستقبل',
                    siteSettings?.aboutSectionBadgeEn || 'ABOUT US • YOUR STRATEGIC LEGAL PARTNER'
                  )}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1E1E] tracking-tight leading-snug">
                {t(
                  siteSettings?.aboutSectionTitleAr || 'رواد حل النزاعات وحماية الاستثمارات بالمملكة والشرق الأوسط',
                  siteSettings?.aboutSectionTitleEn || 'Pioneers in Dispute Resolution & Asset Protection across the GCC'
                )}
              </h2>
              
              <p className="text-[#4B4B4B] text-base leading-relaxed text-justify font-light">
                {t(
                  siteSettings?.aboutSectionDescAr || 'تأسس مكتب هشام حسن حنبولي للمحاماة والاستشارات القانونية شريكاً موثوقاً وصاحب ريادة حثيثة في صيانة المصالح وتوفير الاستشارات المتكاملة للجهات والمجموعات الاستثمارية الرائدة. طريقتنا تعتمد على صياغة أطر آمنة تضمن التحصين القانوني الوقائي وحسم التبعات والعراقيل القضائية قبل بدئها.',
                  siteSettings?.aboutSectionDescEn || 'Hesham H. Hanboly Law Firm was established as a premier hub, and a trusted, tireless pioneer in defending valuable organizational assets, providing fully comprehensive legal consultations for market leaders. Our methodology centers on architecting bulletproof frameworks to guarantee defensive shield and dissolve litigation risks before they ever arise.'
                )}
              </p>

              <p className="text-[#4B4B4B] text-sm leading-relaxed text-justify font-light">
                {t(
                  'نحن نعمل بالتكامل مع توجهات مجالس الإدارات وكبار المستثمرين لبناء أنظمة تعاقدية رخصية، مستندين في ذلك إلى قاعدة صلبة من الفهم القضائي ليكون نجاح حلفائنا ركناً أساسياً في ثقتنا المهنية بالرياض والمنطقة الشرقية وجدة.',
                  'We construct compliant, strategic joint frameworks with high-net-worth investors and board of directors, grounded on deep judiciary expertise, making our clients’ absolute success the ultimate measurement of our professional reputation across Riyadh, Jeddah, and the Eastern Province.'
                )}
              </p>

              <div className="pt-4 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-[#A56A1E]">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs font-bold font-mono">
                    {t('حماية قانونية وقائية شاملة', 'Preventative Corporate Shielding')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#A56A1E]">
                  <Scale className="w-5 h-5" />
                  <span className="text-xs font-bold font-mono">
                    {t('تمثيل قضائي ذو أثر استراتيجي', 'Strategic High-impact Advocacy')}
                  </span>
                </div>
              </div>

              {onExploreAbout && (
                <div className="pt-4">
                  <button
                    onClick={onExploreAbout}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#A56A1E] hover:bg-[#946B4B] text-white text-xs font-bold transition-all duration-300 shadow-xs cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>{t('تصفّح صفحة من نحن التفصيلية', 'Explore Detailed About Us')}</span>
                    <span className="font-sans">{language === 'ar' ? '←' : '→'}</span>
                  </button>
                </div>
              )}

            </div>

            {/* Left Image / Badge Info Block */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-lg bg-[#F1ECE3] p-8 sm:p-10 border border-[#D8D1C7] text-start space-y-6 relative overflow-hidden">
                <div className={`absolute top-0 ${language === 'ar' ? 'left-0 transform -translate-x-1/4' : 'right-0 transform translate-x-1/4'} -translate-y-1/4 text-[#A56A1E]/5 pointer-events-none select-none`}>
                  <Scale className="w-48 h-48" />
                </div>
                
                <h3 className="text-xl font-bold text-[#1E1E1E]">
                  {t(
                    siteSettings?.aboutSectionCardTitleAr || 'رعاية قضائية بمستوى نخبة الأعمال',
                    siteSettings?.aboutSectionCardTitleEn || 'Elite Enterprise Legal Guard'
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-[#4B4B4B] leading-relaxed font-light text-justify">
                  {t(
                    siteSettings?.aboutSectionCardDescAr || 'عبر مسيرة متكاملة حافلة بالحلول القانونية، نضع رعاية شؤون الموكلين التجارية والتنظيمية في طليعة التزامنا، مما يتيح لكبار المدراء التنفيذيين التركيز على دفع مسيرة التوسع والتشييد واثقين تماماً من متانة حمايتهم العقدية.',
                    siteSettings?.aboutSectionCardDescEn || 'Through an extensive track record of legal solutions, we place our clients’ commercial, transactional, and regulatory compliance at the absolute pinnacle of our values, freeing corporate leaders to drive scale with reliance on our secure protection.'
                  )}
                </p>

                <div className="h-[1px] bg-[#D8D1C7]" />

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A56A1E]" />
                    <span className="text-xs text-[#1E1E1E] font-medium">
                      {t('الالتزام بأعلى معايير السرية المطلقة', 'Uncompromised Absolute Class-A Secrecy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A56A1E]" />
                    <span className="text-xs text-[#1E1E1E] font-medium">
                      {t('تقديم مشورات فورية مدعومة بنظم الرصد الحديثة', 'Realtime Audits & Legal Watch Advisory')}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleScrollToContact}
                    className="w-full py-3 rounded-lg bg-[#7B5A42] hover:bg-[#946B4B] text-white text-xs font-bold transition-all duration-300 cursor-pointer"
                  >
                    {t(
                      siteSettings?.aboutSectionButtonAr || 'اطلب استشارتك الوقائية الفورية',
                      siteSettings?.aboutSectionButtonEn || 'Book Preventative Assessment Immediately'
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. VISION / MISSION / GOALS SECTION */}
      <section 
        id="vision-mission-goals" 
        className="py-20 bg-[#F1ECE3] relative"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16 max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-[#A56A1E] uppercase tracking-wider block">
              {t('الأهداف والمحاور الرئيسية للشركة', 'CORE CORPORATE OBJECTIVES')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight">
              {t('الركائز والتوجهات التي نقود بها خدماتنا', 'The Values Powering Our Litigation Shield')}
            </h2>
            <div className="h-[1.5px] w-12 bg-[#A56A1E] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={idx} 
                  className="rounded-xl p-8 bg-[#F8F5EF] border border-[#D8D1C7] hover:border-[#A56A1E]/60 transition-all duration-300 flex flex-col items-start justify-between text-start group hover:shadow-md hover:-translate-y-1 cursor-pointer"
                  onClick={onExploreAbout}
                >
                  <div className="w-full">
                    <div className="p-3 bg-[#A56A1E]/10 rounded-lg text-[#A56A1E] mb-6 inline-block group-hover:bg-[#7B5A42] group-hover:text-white transition-colors duration-300">
                      <IconComponent className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1E1E1E] mb-4">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#4B4B4B] leading-relaxed font-light text-justify">
                      {item.content}
                    </p>
                  </div>
                  <div className="pt-4 text-xs font-bold text-[#A56A1E] flex items-center gap-1.5 mt-4">
                    <span>{t('اقرأ التفاصيل الكاملة', 'Read Complete Details')}</span>
                    <span className="font-sans">{language === 'ar' ? '←' : '→'}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}
