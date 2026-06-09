import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Landmark, Send, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MessageSquare, Scale, Briefcase } from 'lucide-react';
import Logo from './Logo';
import MegaMenu from './MegaMenu';
import { useLanguage } from '../contexts/LanguageContext';
import { serviceCategories } from '../data/servicesData';
import { useSiteContent } from '../content/ContentContext';
import type { NavItemRecord } from '../types';

interface NavbarProps {
  currentView?: 'home' | 'about' | 'team' | 'contact' | 'articles' | 'article-detail' | 'service-detail' | 'cms-page' | 'admin';
  onNavigate?: (view: 'home' | 'about' | 'team' | 'contact' | 'articles' | 'article-detail' | 'service-detail' | 'cms-page' | 'admin', param?: string) => void;
}

export default function Navbar({ currentView = 'home', onNavigate }: NavbarProps) {
  const { language, setLanguage, direction, t } = useLanguage();
  const { content } = useSiteContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isMobileMegaOpen, setIsMobileMegaOpen] = useState(false);
  const [mobileActiveSub, setMobileActiveSub] = useState<number | null>(null);
  
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigationItems = content?.navigation ?? [];
  const coreNavEntries = [
    { key: 'home', targets: ['', 'home', '/'], fallbackAr: 'الرئيسية', fallbackEn: 'Home', defaultOrder: 1 },
    { key: 'about', targets: ['about'], fallbackAr: 'من نحن', fallbackEn: 'About Us', defaultOrder: 2 },
    { key: 'services', targets: ['services'], fallbackAr: 'خدماتنا', fallbackEn: 'Our Services', defaultOrder: 3 },
    { key: 'practice-areas', targets: ['practice-areas'], fallbackAr: 'مجالات الممارسات', fallbackEn: 'Practice Areas', defaultOrder: 4 },
    { key: 'contact', targets: ['contact'], fallbackAr: 'اتصل بنا', fallbackEn: 'Contact', defaultOrder: 5 },
  ] as const;

  const normalizeNavTarget = (value: string) => value.replace(/^#/, '').replace(/^\/+|\/+$/g, '').toLowerCase();

  const findNavigationItem = (targets: string[]) =>
    navigationItems.find((item) => {
      const normalizedUrl = normalizeNavTarget(item.url || '');
      return targets.some((target) => normalizedUrl === normalizeNavTarget(target));
    }) as NavItemRecord | undefined;

  const getNavigationConfig = (targets: string[], fallbackAr: string, fallbackEn: string, defaultOrder: number) => {
    const item = findNavigationItem(targets);
    const primaryTarget = targets[0] || '';
    const fallbackUrl =
      primaryTarget === '' || primaryTarget === 'home'
        ? '/'
        : `/${primaryTarget}`;
    return {
      key: item?.id || targets[0] || fallbackEn,
      url: item?.url || fallbackUrl,
      label: language === 'ar' ? item?.labelAr || fallbackAr : item?.labelEn || fallbackEn,
      desktopVisible: item ? item.desktopVisible : true,
      mobileVisible: item ? item.mobileVisible : true,
      order: item ? item.order : defaultOrder,
    };
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  const navLinks = [
    ...coreNavEntries.map((entry) => getNavigationConfig(entry.targets as string[], entry.fallbackAr, entry.fallbackEn, entry.defaultOrder)),
    ...[...navigationItems]
      .sort((left, right) => left.order - right.order)
      .filter((item) => {
        const normalizedUrl = normalizeNavTarget(item.url || '');
        return !coreNavEntries.some((entry) => entry.targets.some((target) => normalizeNavTarget(target) === normalizedUrl));
      })
      .map((item) => ({
        key: item.id,
        url: item.url,
        label: language === 'ar' ? item.labelAr : item.labelEn,
        desktopVisible: item.desktopVisible,
        mobileVisible: item.mobileVisible,
        order: item.order,
      })),
  ].sort((left, right) => left.order - right.order);


  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    setIsMegaOpen(false);
    setIsMobileMegaOpen(false);
    setMobileActiveSub(null);
    
    if (id === 'about') {
      if (onNavigate) {
        onNavigate('about', 'about-hero');
      }
      return;
    }

    if (id === 'team') {
      if (onNavigate) {
        onNavigate('team');
      }
      return;
    }

    if (id === 'articles') {
      if (onNavigate) {
        onNavigate('articles');
      }
      return;
    }

    if (id === 'contact') {
      if (onNavigate) {
        onNavigate('contact');
      }
      return;
    }

    if (onNavigate) {
      onNavigate('home', id);
    }
  };

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    setIsMegaOpen(true);
  };

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setIsMegaOpen(false);
    }, 200);
  };

  const practiceAreas = (content?.practiceAreas || []).filter((item) => item.published);
  const logoUrl = content?.siteSettings.logoImageUrl || '';
  const logoAlt = language === 'ar'
    ? content?.siteSettings.logoImageAltAr || 'شعار شركة هشام حسن حنبولي الدولية'
    : content?.siteSettings.logoImageAltEn || 'Hesham H. Hanboly International logo';
  const navbarCta = language === 'ar' ? content?.siteSettings.navbarCtaAr : content?.siteSettings.navbarCtaEn;
  const mobileSectionTitle = (categorySlug: 'advisory' | 'litigation' | 'transactional') => {
    const firstItem = practiceAreas.find((item) => item.categorySlug === categorySlug);
    const fallback = serviceCategories[categorySlug];
    return language === 'ar' ? firstItem?.categoryAr || fallback.ar : firstItem?.categoryEn || fallback.en;
  };

  const mobileSections = [
    {
      title: mobileSectionTitle('advisory'),
      icon: MessageSquare,
      subsections: practiceAreas.filter((item) => item.categorySlug === 'advisory'),
    },
    {
      title: mobileSectionTitle('litigation'),
      icon: Scale,
      subsections: practiceAreas.filter((item) => item.categorySlug === 'litigation'),
    },
    {
      title: mobileSectionTitle('transactional'),
      icon: Briefcase,
      subsections: practiceAreas.filter((item) => item.categorySlug === 'transactional'),
    },
  ];

  const navigateByUrl = (url: string) => {
    const normalized = url.replace(/^#/, '').replace(/^\/+|\/+$/g, '').toLowerCase();
    setIsMobileMenuOpen(false);
    setIsMegaOpen(false);
    setIsMobileMegaOpen(false);
    setMobileActiveSub(null);
    if (['', 'home', 'hero'].includes(normalized)) {
      scrollToSection('hero');
      return;
    }
    if (normalized === 'about') {
      scrollToSection('about');
      return;
    }
    if (normalized === 'services') {
      scrollToSection('services');
      return;
    }
    if (normalized === 'practice-areas') {
      if (onNavigate) {
        onNavigate('cms-page', normalized);
      }
      return;
    }
    if (normalized === 'contact') {
      scrollToSection('contact');
      return;
    }
    if (onNavigate) {
      onNavigate('cms-page', normalized);
    }
  };

  return (
    <>
      <header
        id="firm-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isScrolled || currentView !== 'home'
            ? 'h-[80px] bg-[#F1ECE3]/90 backdrop-blur-md border-b border-[#D8D1C7]'
            : 'h-[96px] bg-transparent border-b border-[#D8D1C7]/30'
        }`}
        style={{ direction }}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-full max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
          
          {/* Logo Brand Brand Area */}
          <div 
            onClick={() => scrollToSection('hero')}
            className="cursor-pointer group flex items-center"
          >
            <Logo 
              lang={language} 
              variant="dark" 
              showText={true} 
              emblemSize={isScrolled ? 'h-12 w-[160px] sm:w-[190px]' : 'h-14 w-[190px] sm:w-[230px]'}
              logoUrl={logoUrl}
              logoAlt={logoAlt}
              className="transition-all duration-300 hover:opacity-90"
            />
          </div>

          {/* Luxury Minimalist Central Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center gap-8 xl:gap-10 h-full">
            {navLinks.filter((link) => link.desktopVisible).map((link) => {
              const normalizedUrl = normalizeNavTarget(link.url || '');
              const isServicesDropdown = normalizedUrl === 'services';
              const isHome = ['home', 'hero', ''].includes(normalizedUrl);

              if (isServicesDropdown) {
                return (
                  <div
                    key={link.key}
                    onMouseEnter={handleMouseEnter}
                    className="relative flex items-center h-full"
                  >
                    <button
                      onClick={() => scrollToSection('services')}
                      className={`text-[#1E1E1E] hover:text-[#A56A1E] font-medium text-sm transition-all duration-300 relative py-2 cursor-pointer flex items-center gap-1.5 h-full ${
                        isMegaOpen ? 'text-[#A56A1E]' : ''
                      }`}
                    >
                      <span>{language === 'ar' ? link.labelAr : link.labelEn}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMegaOpen ? 'rotate-180 text-[#A56A1E]' : ''}`} />
                    </button>
                  </div>
                );
              }

              return (
                <button
                  key={link.key}
                  onClick={() => {
                    if (isHome) {
                      scrollToSection('hero');
                      return;
                    }
                    navigateByUrl(link.url);
                  }}
                  className="text-[#1E1E1E] hover:text-[#A56A1E] font-medium text-sm transition-all duration-300 relative py-2 cursor-pointer after:content-[''] after:absolute after:bottom-[30%] after:left-0 after:right-0 after:h-[1.5px] after:bg-[#A56A1E] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
                >
                  {language === 'ar' ? link.labelAr : link.labelEn}
                </button>
              );
            })}
          </nav>

          {/* Right Section Consultation CTA */}
          <div className="flex items-center gap-3 sm:gap-4 font-sans">
            
            <button
              onClick={() => scrollToSection('contact')}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#7B5A42] hover:bg-[#946B4B] text-white font-medium text-xs tracking-wide transition-all duration-300 shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{navbarCta || t('طلب استشارة', 'Book Counsel')}</span>
            </button>

            {/* Language Switch Button */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 rounded-md border border-[#7B5A42]/30 text-[#7B5A42] hover:bg-[#7B5A42] hover:text-white font-bold text-xs transition-all duration-300 cursor-pointer"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#1E1E1E] hover:text-[#A56A1E] transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

          {/* Embedded Desktop Mega Menu Portal Positioner */}
          <div 
            onMouseEnter={handleMouseEnter}
            className="absolute left-0 right-0"
          >
            <MegaMenu 
              isOpen={isMegaOpen} 
              onClose={() => setIsMegaOpen(false)} 
              onNavigateToSection={scrollToSection}
              onNavigateToService={(slug) => {
                if (onNavigate) {
                  onNavigate('service-detail', slug);
                }
              }}
            />
          </div>

        </div>
      </header>

      {/* Mobile Menu Backdrop & Drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ease-in-out ${
          isMobileMenuOpen 
            ? 'translate-y-0 opacity-100 touch-none pointer-events-auto' 
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ direction }}
      >
        <div className="absolute inset-x-0 top-0 bg-[#F8F5EF] pt-24 px-6 pb-10 border-b border-[#D8D1C7] shadow-xl flex flex-col gap-6 max-h-screen overflow-y-auto">
          <div className="flex flex-col gap-3 pt-6">
            {navLinks.filter((link) => link.mobileVisible).map((link) => {
              const normalizedUrl = normalizeNavTarget(link.url || '');
              const isServicesDropdown = normalizedUrl === 'services';
              const isHome = ['home', 'hero', ''].includes(normalizedUrl);

              if (isServicesDropdown) {
                return (
                  <div key={link.key} className="border-b border-[#D8D1C7]/40 py-2.5">
                    <button
                      onClick={() => {
                        setMobileActiveSub(null);
                        setIsMobileMegaOpen((current) => !current);
                      }}
                      className="w-full text-start text-[#1E1E1E] hover:text-[#A56A1E] text-base font-bold cursor-pointer flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#A56A1E]" />
                        <span>{language === 'ar' ? link.labelAr : link.labelEn}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-[#A56A1E] transition-transform duration-300 ${isMobileMegaOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Expandable Accordion on mobile */}
                    {isMobileMegaOpen && (
                      <div className={`mt-4 ${language === 'ar' ? 'mr-4 pr-2 border-r-2' : 'ml-4 pl-2 border-l-2'} border-[#A56A1E]/20 space-y-4`}>
                        {mobileSections.map((sec, sIdx) => {
                          const IconSub = sec.icon;
                          const isSubOpen = mobileActiveSub === sIdx;
                          return (
                            <div key={sIdx} className="space-y-2">
                              <button
                                onClick={() => setMobileActiveSub(isSubOpen ? null : sIdx)}
                                className="w-full text-start text-sm font-extrabold text-[#7B5A42] flex items-center justify-between py-1 px-2 hover:bg-[#A56A1E]/5 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <IconSub className="w-4 h-4 text-[#A56A1E]" />
                                  <span>{sec.title}</span>
                                </div>
                                <span className="text-xs text-[#A56A1E]/80">{isSubOpen ? '−' : '＋'}</span>
                              </button>

                              {isSubOpen && (
                                <div className={`space-y-1.5 ${language === 'ar' ? 'mr-6' : 'ml-6'}`}>
                                  {sec.subsections.map((sub, ssIdx) => (
                                    <button
                                      key={ssIdx}
                                      onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsMobileMegaOpen(false);
                                        setMobileActiveSub(null);
                                        if (onNavigate) {
                                          onNavigate('service-detail', sub.slug);
                                        }
                                      }}
                                      className="w-full text-start py-2 px-3 text-xs text-[#5B5B5B] hover:text-[#A56A1E] hover:bg-[#A56A1E]/5 rounded-lg border-b border-[#D8D1C7]/20 flex justify-between items-center"
                                    >
                                      <span>{language === 'ar' ? sub.titleAr : sub.titleEn}</span>
                                      {language === 'ar' ? (
                                        <ChevronLeft className="w-3.5 h-3.5 text-[#A56A1E]/50" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5 text-[#A56A1E]/50" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={link.key}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsMobileMegaOpen(false);
                    setMobileActiveSub(null);
                    if (isHome) {
                      scrollToSection('hero');
                      return;
                    }
                    navigateByUrl(link.url);
                  }}
                  className="text-start text-[#1E1E1E] hover:text-[#A56A1E] text-base font-bold py-2.5 border-b border-[#D8D1C7]/40 cursor-pointer flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#A56A1E]" />
                    <span>{language === 'ar' ? link.labelAr : link.labelEn}</span>
                  </div>
                  {language === 'ar' ? (
                    <ChevronLeft className="w-5 h-5 text-[#A56A1E]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#A56A1E]" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsMobileMegaOpen(false);
              setMobileActiveSub(null);
              scrollToSection('contact');
            }}
            className="w-full py-3.5 rounded-xl bg-[#7B5A42] hover:bg-[#946B4B] text-white font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-2 text-sm shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>{t('طلب استشارة قانونية رائدة', 'Request Elite Legal Counsel')}</span>
          </button>
        </div>
      </div>
    </>
  );
}
