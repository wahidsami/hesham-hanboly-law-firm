import React from 'react';
import { ShieldCheck, Scale, Award, Mail, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';

interface TeamProps {
  onExploreTeam?: () => void;
}

export default function Team({ onExploreTeam }: TeamProps) {
  const { language, direction, t } = useLanguage();
  const { content } = useSiteContent();
  const siteSettings = content?.siteSettings;

  const credentials = [
    t('مرخص للترافع أمام ديوان المظالم وكافة المحاكم السعودية العليا', 'Licensed advocate admitted to the Board of Grievances & all Saudi Supreme Courts'),
    t('مستشار قانوني للعديد من المجموعات الاستثمارية ومجالس الإدارة بالمنطقة', 'Board-level counsel to several regional conglomerates & investment groups'),
    t('متخصص في حوكمة الشركات وإعادة الهيكلة والتصفية القضائية للمؤسسات الكبرى', 'Specialist in Corporate Governance, restructuring, & legal liquidations of major entities'),
    t('خبرة عريقة تمتد سنوات في منازعات البناء والتشييد والتحالفات التجارية الدولية', 'Decades-long legacy in construction disputes & dynamic global trade alliances'),
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
    <section 
      id="team" 
      className="py-20 sm:py-28 bg-[#FFFFFF] relative border-b border-[#D8D1C7]/40"
      style={{ direction }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-20 max-w-3xl mx-auto">
          <span className="text-xs font-semibold text-[#A56A1E] uppercase tracking-wider block">
            {t(
              siteSettings?.teamSectionBadgeAr || 'صناع القرار وعمود القوة القضائية',
              siteSettings?.teamSectionBadgeEn || 'JUDICIAL DECISION MAKERS & LEADERS'
            )}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1E1E] tracking-tight">
            {t(
              siteSettings?.teamSectionTitleAr || 'تعرف على مستشارينا القانونيين',
              siteSettings?.teamSectionTitleEn || 'MEET OUR LEGAL COUNSEL'
            )}
          </h2>
          <div className="h-[2px] w-12 bg-[#A56A1E] mx-auto mt-4" />
          <p className="text-[#4B4B4B] text-base font-light max-w-xl mx-auto leading-relaxed">
            {t(
              siteSettings?.teamSectionDescAr || 'نخبة من الكفاءات القانونية التي تقود ملفات الدفاع وتوفر المشورة الرصينة للشركات والأفراد.',
              siteSettings?.teamSectionDescEn || 'An elite league of legal practitioners spearheading advocacy & rendering bulletproof advisory for enterprises and individuals.'
            )}
          </p>
        </div>

        {/* Feature Executive Profile Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Right Column: Custom Stylized Portrait Image */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className={`absolute -top-4 ${language === 'ar' ? '-right-4' : '-left-4'} w-24 h-24 border-t-2 ${language === 'ar' ? 'border-r-2' : 'border-l-2'} border-[#A56A1E]/45 rounded-tr-lg pointer-events-none`} />
            <div className={`absolute -bottom-4 ${language === 'ar' ? '-left-4' : '-right-4'} w-24 h-24 border-b-2 ${language === 'ar' ? 'border-l-2' : 'border-r-2'} border-[#A56A1E]/45 rounded-bl-lg pointer-events-none`} />
            
              <div className="rounded-xl overflow-hidden aspect-[4/5] w-full max-w-[400px] shadow-xl border border-[#D8D1C7] relative group bg-[#F8F5EF]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/80 via-transparent to-transparent z-10" />
                <img
                src={siteSettings?.teamFounderImageUrl || '/images/founder_hesham_hanboly_1780491593879.png'}
                alt={t(
                  siteSettings?.teamFounderImageAltAr || siteSettings?.teamFounderNameAr || 'المحامي / هشام بن حسن حنبولي',
                  siteSettings?.teamFounderImageAltEn || siteSettings?.teamFounderNameEn || 'Advocate / Hesham bin Hasan Hanboly'
                )}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-103"
              />
              <div className={`absolute bottom-6 ${language === 'ar' ? 'right-6 text-right' : 'left-6 text-left'} z-20 text-white select-none`}>
                <span className="text-[#A56A1E] text-xs uppercase font-semibold tracking-wider block mb-1">
                  {t(
                    siteSettings?.teamFounderBadgeAr || 'المؤسس والشريك المدير',
                    siteSettings?.teamFounderBadgeEn || 'Founder & Managing Partner'
                  )}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold">
                  {t(
                    siteSettings?.teamFounderNameAr || 'المحامي / هشام بن حسن حنبولي',
                    siteSettings?.teamFounderNameEn || 'Advocate / Hesham H. Hanboly'
                  )}
                </h3>
                <p className="text-xs text-[#F1ECE3] opacity-90 mt-1">
                  {t(
                    siteSettings?.teamFounderRoleAr || 'مدير عام الشركة',
                    siteSettings?.teamFounderRoleEn || 'Managing Director'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Left Column: Credentials and biography summary */}
          <div className="lg:col-span-7 space-y-8 text-start">
            
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-[#A56A1E] uppercase tracking-wide block">
                {t(
                  siteSettings?.teamFounderBadgeAr || 'مستشار تمثيل وقائي معتمد',
                  siteSettings?.teamFounderBadgeEn || 'CERTIFIED PREVENTATIVE COUNSEL'
                )}
              </span>
              <h3 className="text-2xl font-bold text-[#1E1E1E]">
                {t(
                  siteSettings?.teamFounderNameAr || 'المحامي / هشام بن حسن حنبولي',
                  siteSettings?.teamFounderNameEn || 'Advocate / Hesham H. Hanboly'
                )}
              </h3>
              <p className="text-sm font-semibold text-[#7B5A42]">
                {t(
                  siteSettings?.teamFounderRoleAr || 'مدير عام الشركة • مستشار قانوني ممارس',
                  siteSettings?.teamFounderRoleEn || 'Managing Director • Active Senior Legal Consultant'
                )}
              </p>
              
              <p className="text-[#4B4B4B] text-base leading-relaxed font-light text-justify">
                {t(
                  siteSettings?.teamFounderIntroAr || 'يقود المستشار هشام بن حسن حنبولي أعمال الشركة بتوجيه استراتيجي متميز يجمع بين فهم الواقع الاقتصادي وصحيح الأحكام القضائية والنظم الصادرة بالمملكة.',
                  siteSettings?.teamFounderIntroEn || 'Senior Counsel Hesham H. Hanboly leads the firm with a strategic, high-impact approach, bridging economic realities with regulatory environments across the Kingdom.'
                )}
              </p>
            </div>

            {/* List of Accreditations */}
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-[#A56A1E] uppercase tracking-wide block">
                {t('أبرز الاعتمادات وملفات التميز', 'PRINCIPAL ACCREDITATIONS & ACHIEVEMENTS')}
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {credentials.map((cred, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-lg bg-[#F8F5EF] border border-[#D8D1C7]/60 flex items-start gap-3"
                  >
                    <ShieldCheck className="w-5 h-5 text-[#A56A1E] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-[#1E1E1E] font-medium leading-relaxed text-justify">
                      {cred}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleScrollToContact}
                className="px-6 py-3 rounded-lg bg-[#7B5A42] hover:bg-[#946B4B] text-white font-bold text-xs transition-all duration-300 cursor-pointer"
              >
                {t('تواصل مباشر للاستشارات النخبوية', 'Direct Consultation Hub')}
              </button>
              {onExploreTeam && (
                <button
                onClick={onExploreTeam}
                className="px-6 py-3 rounded-lg bg-transparent hover:bg-[#A56A1E]/5 text-[#A56A1E] border border-[#A56A1E]/30 font-bold text-xs transition-all duration-300 cursor-pointer"
              >
                  {t(
                    siteSettings?.teamSectionCtaAr || 'تصفّح فريق العمل بالكامل',
                    siteSettings?.teamSectionCtaEn || 'Explore Full Team Members'
                  )}
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
