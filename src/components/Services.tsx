import React from 'react';
import { Scale, Briefcase, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';
import { serviceCategories } from '../data/servicesData';

interface ServicesProps {
  onNavigateToService?: (slug: string) => void;
}

export default function Services({ onNavigateToService }: ServicesProps) {
  const { language, direction, t } = useLanguage();
  const { content } = useSiteContent();
  const practiceAreaItems = (content?.practiceAreas || []).filter((item) => item.published);

  const practiceAreaCards = [
    {
      id: 'consulting',
      categorySlug: 'advisory' as const,
      titleAr: serviceCategories.advisory.ar,
      titleEn: serviceCategories.advisory.en,
      icon: Scale,
    },
    {
      id: 'cases',
      categorySlug: 'litigation' as const,
      titleAr: serviceCategories.litigation.ar,
      titleEn: serviceCategories.litigation.en,
      icon: Briefcase,
    },
    {
      id: 'transactions',
      categorySlug: 'transactional' as const,
      titleAr: serviceCategories.transactional.ar,
      titleEn: serviceCategories.transactional.en,
      icon: FileText,
    },
  ];

  const handleLearnMore = () => {
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
      id="services" 
      className="py-20 sm:py-28 bg-[#FFFFFF] relative border-b border-[#D8D1C7]/40"
      style={{ direction }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-start space-y-4 mb-16 max-w-3xl">
          <span className="text-xs font-semibold text-[#A56A1E] uppercase tracking-wider block">
            {t('كيف يمكننا مساعدتك', 'HOW WE ASSIST YOU')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1E1E] tracking-tight">
            {t('مجالات عملنا', 'PRACTICE AREAS')}
          </h2>
          <p className="text-base text-[#4B4B4B] font-light leading-relaxed max-w-2xl">
            {t(
              'نسعى لتقديم أفضل خدمات قانونية وأدق استشارات ومقترحات لكافة عملائنا.',
              'Committed to delivering flawless legal strategies, ultimate counseling, and bespoke resolutions for our clients.'
            )}
          </p>
          <div className="h-[2px] w-16 bg-[#A56A1E] mt-4" />
        </div>

        {/* 3-Column Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {practiceAreaCards.map((service) => {
            const IconComponent = service.icon;
            const subServices = practiceAreaItems.filter((practiceArea) => practiceArea.categorySlug === service.categorySlug);
            const featuredItem = subServices[0];
            const title = language === 'ar'
              ? featuredItem?.categoryAr || service.titleAr
              : featuredItem?.categoryEn || service.titleEn;
            const description = language === 'ar'
              ? featuredItem?.shortDescAr || t(
                'نقدم لعملائنا استشارات قانونية شاملة في جميع النواحي القانونية بما في ذلك شؤون تجارية، وعمالية، وإدارية، وجزائية، وأحوال شخصية وغيرها من الاستشارات.',
                'We deliver fully comprehensive statutory advice addressing commercial, corporate, labor, customs, taxation, criminal, civil, and family trust regulations.'
              )
              : featuredItem?.shortDescEn || t(
                'نقدم لعملائنا استشارات قانونية شاملة في جميع النواحي القانونية بما في ذلك شؤون تجارية، وعمالية، وإدارية، وجزائية، وأحوال شخصية وغيرها من الاستشارات.',
                'We deliver fully comprehensive statutory advice addressing commercial, corporate, labor, customs, taxation, criminal, civil, and family trust regulations.'
              );

            return (
              <div
                key={service.id}
                className="bg-[#F8F5EF] rounded-xl p-8 sm:p-10 border border-[#D8D1C7]/60 hover:border-[#A56A1E] transition-all duration-300 flex flex-col justify-between space-y-8 shadow-xs hover:shadow-md hover:-translate-y-1 group"
              >
                <div className="space-y-5 text-start">
                  {/* Luxury Outlined Icon */}
                  <div className="w-12 h-12 rounded-lg bg-[#A56A1E]/10 flex items-center justify-center text-[#A56A1E] group-hover:bg-[#7B5A42] group-hover:text-white transition-colors duration-300">
                    <IconComponent className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1E1E1E] group-hover:text-[#A56A1E] transition-colors duration-300 leading-tight">
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#4B4B4B] leading-relaxed font-light text-justify">
                    {description}
                  </p>

                  {/* Luxury sub-list segment detailing sisters and specific domains */}
                  <div className="pt-4 border-t border-[#D8D1C7]/30 space-y-3">
                    <span className="text-xs font-bold text-[#A56A1E] tracking-wider block uppercase">
                      {t('أبرز مجالات الاختصاص', 'CORRESPONDING DOMAINS')}
                    </span>
                    
                    <div className="space-y-1.5 pl-1 pr-1">
                      {subServices.slice(0, 4).map((subItem) => (
                        <button
                          key={subItem.slug}
                          onClick={() => {
                            if (onNavigateToService) {
                              onNavigateToService(subItem.slug);
                            }
                          }}
                          className="w-full text-start text-xs text-[#5B5B5B] hover:text-[#A56A1E] transition-colors py-1 flex items-center gap-2 cursor-pointer group/item"
                        >
                          <span className="w-1 h-1 rounded-full bg-[#A56A1E] group-hover/item:w-2 transition-all shrink-0" />
                          <span className="truncate">{language === 'ar' ? subItem.titleAr : subItem.titleEn}</span>
                        </button>
                      ))}
                      {subServices.length > 4 && (
                        <div className="text-xs text-[#7B5A42] font-semibold pt-1 italic">
                          {t(`+ تصفح ${subServices.length - 4} تخصصات إضافية متوفرة`, `+ explore ${subServices.length - 4} other sectors`)}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Learn More Button */}
                <div className="pt-4 border-t border-[#D8D1C7]/40 text-start">
                  <button
                    onClick={() => {
                      if (subServices.length > 0 && onNavigateToService) {
                        onNavigateToService(subServices[0].slug);
                      } else {
                        handleLearnMore();
                      }
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#7B5A42] hover:text-[#946B4B] transition-colors cursor-pointer"
                  >
                    <span>{t('تصفح كافة التخصصات', 'View All Specialties')}</span>
                    {language === 'ar' ? (
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
