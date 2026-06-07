import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Scale, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight,
  X 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';
import { serviceCategories } from '../data/servicesData';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection: (sectionId: string) => void;
  onNavigateToService?: (slug: string) => void;
}

export default function MegaMenu({ isOpen, onClose, onNavigateToSection, onNavigateToService }: MegaMenuProps) {
  const { direction, language, t } = useLanguage();
  const { content } = useSiteContent();
  const practiceAreas = (content?.practiceAreas || []).filter((item) => item.published);

  const categoryTitle = (
    categorySlug: 'advisory' | 'litigation' | 'transactional',
    fallbackAr: string,
    fallbackEn: string,
  ) => {
    const firstItem = practiceAreas.find((item) => item.categorySlug === categorySlug);
    return language === 'ar'
      ? firstItem?.categoryAr || fallbackAr
      : firstItem?.categoryEn || fallbackEn;
  };

  const sections = [
    {
      title: categoryTitle('advisory', serviceCategories.advisory.ar, serviceCategories.advisory.en),
      icon: MessageSquare,
      subsections: practiceAreas.filter((item) => item.categorySlug === 'advisory'),
    },
    {
      title: categoryTitle('litigation', serviceCategories.litigation.ar, serviceCategories.litigation.en),
      icon: Scale,
      subsections: practiceAreas.filter((item) => item.categorySlug === 'litigation'),
    },
    {
      title: categoryTitle('transactional', serviceCategories.transactional.ar, serviceCategories.transactional.en),
      icon: Briefcase,
      subsections: practiceAreas.filter((item) => item.categorySlug === 'transactional'),
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for click away dismissal */}
          <div 
            onClick={onClose} 
            className="fixed inset-0 top-[80px] z-30 bg-[#121212]/15 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto cursor-default hidden lg:block"
          />

          {/* Desktop Mega Menu View */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 -translate-x-1/2 top-[80px] w-full max-w-6xl bg-[#F8F5EF] rounded-[32px] border border-[#A56A1E]/15 shadow-[0_25px_60px_-15px_rgba(30,30,30,0.15)] p-10 z-40 hidden lg:block pointer-events-auto"
            style={{ direction }}
          >
            {/* Elegant Background Grid Decors */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-[32px] overflow-hidden">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <line x1="33%" y1="0" x2="33%" y2="100%" stroke="#A56A1E" strokeWidth="1" />
                <line x1="66%" y1="0" x2="66%" y2="100%" stroke="#A56A1E" strokeWidth="1" />
                <circle cx="33%" cy="25%" r="6" fill="#A56A1E" />
                <circle cx="66%" cy="75%" r="4" fill="#A56A1E" />
              </svg>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 separator-cols">
              {sections.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <div 
                    key={idx}
                    className="space-y-6 p-4 rounded-2xl hover:bg-white/45 hover:border-[#A56A1E]/10 border border-transparent transition-all duration-300 group"
                  >
                    {/* Header of Section */}
                    <div className="flex items-start gap-4 pb-4 border-b border-[#D8D1C7]/40">
                      <div className="p-3 bg-[#A56A1E]/10 rounded-xl text-[#A56A1E] group-hover:bg-[#A56A1E] group-hover:text-white transition-all duration-500 shadow-xs">
                        <Icon className="w-5 h-5 stroke-[1.5]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base sm:text-lg font-extrabold text-[#1E1E1E] tracking-tight group-hover:text-[#A56A1E] transition-colors duration-300">
                          {section.title}
                        </h4>
                        <div className="h-[2px] w-8 bg-[#A56A1E]/40 group-hover:w-16 transition-all duration-500" />
                      </div>
                    </div>

                    {/* Subsections list with fully dynamic links */}
                    <div className="space-y-1">
                      {section.subsections.map((sub, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => {
                            if (onNavigateToService) {
                              onNavigateToService(sub.slug);
                            } else {
                              onNavigateToSection('services');
                            }
                            onClose();
                          }}
                          className={`w-full text-start flex items-center justify-between py-1.5 px-3 rounded-lg text-sm text-[#5B5B5B] hover:text-[#A56A1E] hover:bg-[#A56A1E]/[0.06] transition-all duration-300 group/link cursor-pointer`}
                        >
                          <span className={`font-light transition-transform duration-300 ${language === 'ar' ? 'group-hover/link:translate-x-[-4px]' : 'group-hover/link:translate-x-[4px]'}`}>
                            {language === 'ar' ? sub.titleAr : sub.titleEn}
                          </span>
                          {language === 'ar' ? (
                            <ChevronLeft className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 text-[#A56A1E] transition-all duration-300 shrink-0 transform translate-x-1 group-hover/link:translate-x-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 text-[#A56A1E] transition-all duration-300 shrink-0 transform -translate-x-1 group-hover/link:translate-x-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Premium Line bar of global luxury brand signature */}
            <div className="mt-8 pt-5 border-t border-[#D8D1C7]/30 flex justify-between items-center text-xs text-[#5B5B5B]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A56A1E]/60 animate-pulse" />
                <span className="font-light">
                  {t(
                    'الامتثال القضائي والسيادة القانونية الشاملة بالمملكة العربية السعودية',
                    'Comprehensive Judicial Compliance & Strategic Regulations in Saudi Arabia'
                  )}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="text-[#A56A1E] hover:text-[#7B5A42] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>{t('إغلاق القائمة', 'Close')}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
