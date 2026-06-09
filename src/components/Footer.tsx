import React from 'react';
import { Landmark, MapPin, Phone, Mail } from 'lucide-react';
import Logo from './Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';
import type { NavItemRecord } from '../types';

interface FooterProps {
  currentView?: 'home' | 'about' | 'team' | 'contact' | 'articles' | 'article-detail' | 'service-detail' | 'cms-page' | 'admin';
  onNavigate?: (view: 'home' | 'about' | 'team' | 'contact' | 'articles' | 'article-detail' | 'service-detail' | 'cms-page' | 'admin', sectionId?: string) => void;
}

export default function Footer({ currentView = 'home', onNavigate }: FooterProps) {
  const { direction, language, t } = useLanguage();
  const { content } = useSiteContent();
  const currentYear = language === 'ar' ? '٢٠٢٦' : '2026';
  const footerSettings = content?.siteSettings;
  const logoUrl = footerSettings?.logoImageUrl || '';
  const logoAlt = language === 'ar'
    ? footerSettings?.logoImageAltAr || 'شعار شركة هشام حسن حنبولي الدولية'
    : footerSettings?.logoImageAltEn || 'Hesham H. Hanboly International logo';
  const footerLogoUrl = footerSettings?.footerLogoImageUrl || footerSettings?.logoImageUrl || '';
  const footerLogoAlt = language === 'ar'
    ? footerSettings?.footerLogoImageAltAr || footerSettings?.logoImageAltAr || 'شعار شركة هشام حسن حنبولي الدولية'
    : footerSettings?.footerLogoImageAltEn || footerSettings?.logoImageAltEn || 'Hesham H. Hanboly International logo';
  const navigationItems = content?.navigation ?? [];
  const coreNavTargets = new Set(['home', 'hero', '/', 'about', 'services', 'practice-areas', 'team', 'articles', 'contact']);
  const extraNavigationItems = navigationItems.filter((item) => !coreNavTargets.has(item.url.replace(/^#/, '').replace(/^\/+|\/+$/g, '').toLowerCase()));

  const normalizeNavTarget = (value: string) => value.replace(/^#/, '').replace(/^\/+|\/+$/g, '').toLowerCase();

  const findNavigationItem = (targets: string[]) =>
    navigationItems.find((item) => {
      const normalizedUrl = normalizeNavTarget(item.url || '');
      return targets.some((target) => normalizedUrl === normalizeNavTarget(target));
    }) as NavItemRecord | undefined;

  const getNavigationConfig = (targets: string[], fallbackAr: string, fallbackEn: string, defaultOrder: number) => {
    const item = findNavigationItem(targets);
    return {
      label: language === 'ar' ? item?.labelAr || fallbackAr : item?.labelEn || fallbackEn,
      visible: item ? (item.desktopVisible || item.mobileVisible) : true,
      order: item ? item.order : defaultOrder,
    };
  };

  const handleScrollTo = (id: string) => {
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

  const footerLinks = [
    {
      id: 'hero',
      ...getNavigationConfig(['home', 'hero', '/'], t('الرئيسية', 'Home'), t('الرئيسية', 'Home'), 0),
    },
    {
      id: 'about',
      ...getNavigationConfig(['about'], t('عن الشركة', 'About'), t('عن الشركة', 'About'), 1),
    },
    {
      id: 'services',
      ...getNavigationConfig(['services', 'practice-areas'], t('مجالات عملنا', 'Practice Areas'), t('مجالات عملنا', 'Practice Areas'), 2),
    },
    {
      id: 'team',
      ...getNavigationConfig(['team'], t('فريق عملنا', 'Our Team'), t('فريق عملنا', 'Our Team'), 3),
    },
    {
      id: 'articles',
      ...getNavigationConfig(['articles'], t('المقالات', 'Insights'), t('المقالات', 'Insights'), 4),
    },
    {
      id: 'contact',
      ...getNavigationConfig(['contact'], t('تواصل معنا', 'Contact Us'), t('تواصل معنا', 'Contact Us'), 5),
    },
  ].sort((left, right) => left.order - right.order);

  const navigateByUrl = (url: string) => {
    const normalized = url.replace(/^#/, '').replace(/^\/+|\/+$/g, '').toLowerCase();
    if (['', 'home', 'hero'].includes(normalized)) {
      handleScrollTo('hero');
      return;
    }
    if (normalized === 'about') {
      handleScrollTo('about');
      return;
    }
    if (normalized === 'services' || normalized === 'practice-areas') {
      handleScrollTo('services');
      return;
    }
    if (normalized === 'team') {
      handleScrollTo('team');
      return;
    }
    if (normalized === 'articles') {
      handleScrollTo('articles');
      return;
    }
    if (normalized === 'contact') {
      handleScrollTo('contact');
      return;
    }
    if (onNavigate) {
      onNavigate('cms-page', normalized);
    }
  };

  return (
    <footer 
      id="firm-footer" 
      className="bg-[#121212] text-gray-300 pt-16 pb-12 border-t border-[#A56A1E]/30 relative z-20 text-start"
      style={{ direction }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Upper Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          
          {/* Column 1: Brand Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-start">
            <div 
              onClick={() => handleScrollTo('hero')}
              className="flex items-center justify-start cursor-pointer"
            >
              <Logo 
                lang={language} 
                variant="light" 
                showText={true} 
                emblemSize="h-14 w-[180px] sm:h-16 sm:w-[220px]" 
                logoUrl={footerLogoUrl}
                logoAlt={footerLogoAlt}
                className="transition-all duration-300 hover:opacity-90"
              />
            </div>

            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-md text-justify">
              {language === 'ar'
                ? footerSettings?.footerDescriptionAr || t(
                    'شركة هشام حسن حنبولي الدولية للاستشارات القانونية والمحاماة هي إحدى شركات المحاماة الرائدة في المملكة العربية السعودية، وحاصلة على تراخيص مزاولة المهنة والتمثيل القضائي من وزارة العدل بامتثال وقائي متكامل لحماية كيانات الاستثمار ومؤسسات التشييد والأعمال.',
                    'Hesham H. Hanboly International Co. for Legal Consultations and Advocacy is a leading, specialized powerhouse law firm in Saudi Arabia, fully licensed by the Ministry of Justice for advocacy and judicial protection, providing elite corporate shield and preventative compliance for multinational enterprises.'
                  )
                : footerSettings?.footerDescriptionEn || t(
                    'شركة هشام حسن حنبولي الدولية للاستشارات القانونية والمحاماة هي إحدى شركات المحاماة الرائدة في المملكة العربية السعودية، وحاصلة على تراخيص مزاولة المهنة والتمثيل القضائي من وزارة العدل بامتثال وقائي متكامل لحماية كيانات الاستثمار ومؤسسات التشييد والأعمال.',
                    'Hesham H. Hanboly International Co. for Legal Consultations and Advocacy is a leading, specialized powerhouse law firm in Saudi Arabia, fully licensed by the Ministry of Justice for advocacy and judicial protection, providing elite corporate shield and preventative compliance for multinational enterprises.'
                  )}
            </p>
          </div>

          {/* Column 2: Index Links (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className={`text-xs font-semibold text-[#A56A1E] uppercase tracking-wider ${language === 'ar' ? 'border-r pr-3' : 'border-l pl-3'} border-[#A56A1E]`}>
              {t('روابط سريعة', 'QUICK LINKS')}
            </h4>
            
            <ul className="space-y-3 text-sm text-gray-400">
              {footerLinks.filter((link) => link.visible).map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleScrollTo(link.id)}
                    className="hover:text-[#A56A1E] text-start font-light transition-colors duration-300 cursor-pointer focus:outline-none"
                  >
                    • {link.label}
                  </button>
                </li>
              ))}
              {extraNavigationItems.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => navigateByUrl(link.url)}
                    className="hover:text-[#A56A1E] text-start font-light transition-colors duration-300 cursor-pointer focus:outline-none"
                  >
                    • {language === 'ar' ? link.labelAr : link.labelEn}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Channels (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className={`text-xs font-semibold text-[#A56A1E] uppercase tracking-wider ${language === 'ar' ? 'border-r pr-3' : 'border-l pl-3'} border-[#A56A1E]`}>
              {t('مكتب الإدارة والاتصال', 'HEADQUARTERS & CONTACT')}
            </h4>
            
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#A56A1E] shrink-0 mt-0.5" />
                <span className="font-light leading-relaxed">
                  {language === 'ar'
                    ? footerSettings?.addressAr || t('جدة - الروضة، شارع نهضة العلم', 'Jeddah - Al-Rawdah, Nahdat Al-Elm Street')
                    : footerSettings?.addressEn || t('جدة - الروضة، شارع نهضة العلم', 'Jeddah - Al-Rawdah, Nahdat Al-Elm Street')}
                </span>
              </li>

              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#A56A1E] shrink-0" />
                <a href={`mailto:${footerSettings?.email || 'mec_law@hotmail.com'}`} className="hover:text-white transition-colors font-mono">
                  {footerSettings?.email || 'mec_law@hotmail.com'}
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#A56A1E] shrink-0" />
                <a href={`tel:${footerSettings?.phone || '920004713'}`} className="hover:text-white transition-colors font-mono" style={{ direction: 'ltr' }}>
                  {footerSettings?.phone || '920004713'}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright Area */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-start">
            <span>
              {language === 'ar'
                ? footerSettings?.copyrightAr || t(
                    `© ٢٠٢٦ شركة هشام حسن حنبولي الدولية للاستشارات القانونية والمحاماة. جميع الحقوق محفوظة.`,
                    `© ${currentYear} Hesham H. Hanboly International Law Co. All Rights Reserved.`
                  )
                : footerSettings?.copyrightEn || t(
                    `© ٢٠٢٦ شركة هشام حسن حنبولي الدولية للاستشارات القانونية والمحاماة. جميع الحقوق محفوظة.`,
                    `© ${currentYear} Hesham H. Hanboly International Law Co. All Rights Reserved.`
                  )}
            </span>
            <span className="hidden md:inline text-white/10">|</span>
            <span className="flex items-center gap-1.5 justify-center">
              <Landmark className="w-3.5 h-3.5 text-[#A56A1E]" />
              <span>
                {language === 'ar'
                  ? footerSettings?.footerBadgeAr || t(
                      'مكتب مرخص لمزاولة المحاماة بوزارة العدل بالمملكة العربية السعودية',
                      'Licensed Practice for Advocacy & Defense by the Ministry of Justice, Saudi Arabia'
                    )
                  : footerSettings?.footerBadgeEn || t(
                      'مكتب مرخص لمزاولة المحاماة بوزارة العدل بالمملكة العربية السعودية',
                      'Licensed Practice for Advocacy & Defense by the Ministry of Justice, Saudi Arabia'
                    )}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hover:text-white transition-colors cursor-pointer select-none">
              {t('شروط الاستخدام', 'Terms of Use')}
            </span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer select-none">
              {t('سياسة الخصوصية والأمان', 'Privacy Policy & security')}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
