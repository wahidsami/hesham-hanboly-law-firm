import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Statistics from './components/Statistics';
import Team from './components/Team';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AboutPage from './components/AboutPage';
import TeamPage from './components/TeamPage';
import ContactPage from './components/ContactPage';
import ArticlesPage from './components/ArticlesPage';
import ArticleDetailsPage from './components/ArticleDetailsPage';
import ServiceDetailsPage from './components/ServiceDetailsPage';
import DoctorShieldPage from './components/DoctorShieldPage';
import CmsPageRenderer from './components/CmsPageRenderer';
import DoctorShieldAd from './components/DoctorShieldAd';
import { useLanguage } from './contexts/LanguageContext';
import AdminDashboard from './components/FigmaAdminDashboard';
import { contentClient } from './content/contentClient';

const ANALYTICS_VISITOR_KEY = 'hh-visitor-id';
const ANALYTICS_SESSION_KEY = 'hh-session-id';

const getAnalyticsPath = (
  view: 'home' | 'about' | 'team' | 'contact' | 'articles' | 'article-detail' | 'service-detail' | 'cms-page' | 'admin',
  articleSlug: string,
  serviceSlug: string,
  cmsSlug: string,
) => {
  if (view === 'home') return { path: '/', title: 'Home' };
  if (view === 'about') return { path: '/about', title: 'About Us' };
  if (view === 'team') return { path: '/team', title: 'Team' };
  if (view === 'contact') return { path: '/contact', title: 'Contact' };
  if (view === 'articles') return { path: '/articles', title: 'Articles' };
  if (view === 'article-detail') return { path: `/articles/${articleSlug}`, title: articleSlug };
  if (view === 'service-detail') return { path: serviceSlug === 'doctor-shield' ? '/doctor-shield' : `/practice-areas/${serviceSlug}`, title: serviceSlug };
  if (view === 'cms-page') return { path: `/${cmsSlug.replace(/^\/+/, '')}`, title: cmsSlug };
  return { path: '/admin', title: 'Admin' };
};

const getOrCreateStorageId = (storage: Storage, key: string) => {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const next = crypto.randomUUID();
  storage.setItem(key, next);
  return next;
};

export default function App() {
  type AppView = 'home' | 'about' | 'team' | 'contact' | 'articles' | 'article-detail' | 'service-detail' | 'cms-page' | 'admin';
  const getInitialRoute = (): { view: AppView; articleSlug: string; serviceSlug: string; cmsSlug: string } => {
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    if (pathname === '/admin') return { view: 'admin', articleSlug: 'appeal-secrets', serviceSlug: 'commercial-consultations', cmsSlug: '' };
    if (pathname === '/about') return { view: 'about', articleSlug: 'appeal-secrets', serviceSlug: 'commercial-consultations', cmsSlug: '' };
    if (pathname === '/team') return { view: 'team', articleSlug: 'appeal-secrets', serviceSlug: 'commercial-consultations', cmsSlug: '' };
    if (pathname === '/contact') return { view: 'contact', articleSlug: 'appeal-secrets', serviceSlug: 'commercial-consultations', cmsSlug: '' };
    if (pathname === '/articles') return { view: 'articles', articleSlug: 'appeal-secrets', serviceSlug: 'commercial-consultations', cmsSlug: '' };
    if (pathname.startsWith('/articles/')) return { view: 'article-detail', articleSlug: pathname.split('/')[2], serviceSlug: 'commercial-consultations', cmsSlug: '' };
    if (pathname === '/doctor-shield' || pathname === '/practice-areas/doctor-shield')
      return { view: 'service-detail', articleSlug: 'appeal-secrets', serviceSlug: 'doctor-shield', cmsSlug: '' };
    if (pathname.startsWith('/practice-areas/'))
      return { view: 'service-detail', articleSlug: 'appeal-secrets', serviceSlug: pathname.split('/')[2], cmsSlug: '' };
    if (pathname !== '/') return { view: 'cms-page', articleSlug: 'appeal-secrets', serviceSlug: 'commercial-consultations', cmsSlug: pathname.replace(/^\/+/, '') };
    return { view: 'home', articleSlug: 'appeal-secrets', serviceSlug: 'commercial-consultations', cmsSlug: '' };
  };

  const initialRoute = getInitialRoute();
  const [currentView, setCurrentView] = useState<AppView>(initialRoute.view);
  const [selectedArticleId, setSelectedArticleId] = useState<string>(initialRoute.articleSlug);
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string>(initialRoute.serviceSlug);
  const [selectedCmsSlug, setSelectedCmsSlug] = useState<string>(initialRoute.cmsSlug);
  const [analyticsVisitorId, setAnalyticsVisitorId] = useState('');
  const [analyticsSessionId, setAnalyticsSessionId] = useState('');
  const { language } = useLanguage();

  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = getInitialRoute();
      setCurrentView(nextRoute.view);
      setSelectedArticleId(nextRoute.articleSlug);
      setSelectedServiceSlug(nextRoute.serviceSlug);
      setSelectedCmsSlug(nextRoute.cmsSlug);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setAnalyticsVisitorId(getOrCreateStorageId(window.localStorage, ANALYTICS_VISITOR_KEY));
    setAnalyticsSessionId(getOrCreateStorageId(window.sessionStorage, ANALYTICS_SESSION_KEY));
  }, []);

  const analyticsRoute = useMemo(
    () => getAnalyticsPath(currentView, selectedArticleId, selectedServiceSlug, selectedCmsSlug),
    [currentView, selectedArticleId, selectedServiceSlug, selectedCmsSlug],
  );

  useEffect(() => {
    if (!analyticsVisitorId || !analyticsSessionId || currentView === 'admin') return;
    void contentClient.trackAnalyticsEvent({
      visitorId: analyticsVisitorId,
      sessionId: analyticsSessionId,
      type: 'page_view',
      path: analyticsRoute.path,
      title: analyticsRoute.title,
      locale: language,
      referrer: document.referrer || '',
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    }).catch(() => undefined);
  }, [analyticsVisitorId, analyticsSessionId, analyticsRoute.path, analyticsRoute.title, currentView]);

  // Handle centralized routing transitions
  const navigateTo = (
    view: AppView,
    param?: string
  ) => {
    setCurrentView(view);

    if (view === 'service-detail' && param) {
      setSelectedServiceSlug(param);
    }

    if (view === 'article-detail' && param) {
      setSelectedArticleId(param);
    }

    if (view === 'cms-page' && param) {
      setSelectedCmsSlug(param);
    }

    const path =
      view === 'home'
        ? '/'
        : view === 'about'
          ? '/about'
          : view === 'team'
            ? '/team'
            : view === 'contact'
              ? '/contact'
        : view === 'articles'
                ? '/articles'
                  : view === 'article-detail' && param
                  ? `/articles/${param}`
                  : view === 'service-detail' && param
                    ? (param === 'doctor-shield' ? '/doctor-shield' : `/practice-areas/${param}`)
                    : view === 'cms-page' && param
                      ? `/${param.replace(/^\/+/, '')}`
                    : '/admin';

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }

    if (view === 'home' && param) {
      setTimeout(() => {
        if (param === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const targetId = param;
        const element = document.getElementById(targetId);
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
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F1ECE3] selection:bg-[#7B5A42] selection:text-white">
      
      {/* 1. Fixed Navbar */}
      {currentView !== 'admin' && <Navbar currentView={currentView} onNavigate={navigateTo} />}

      <main>
        {currentView === 'admin' ? (
          <AdminDashboard />
        ) : currentView === 'home' ? (
          <>
            {/* 2. Hero Section */}
            <Hero onNavigate={navigateTo} />

            {/* 3 & 4. About Section and Vision/Mission/Goals Section */}
            <About onExploreAbout={() => navigateTo('about', 'about-hero')} />

            {/* 5. Practice Areas Section with dynamic links hook */}
            <Services onNavigateToService={(slug) => navigateTo('service-detail', slug)} />

            {/* Doctor Shield Advertising/Promotion Block */}
            <DoctorShieldAd onNavigateToAd={() => navigateTo('service-detail', 'doctor-shield')} />

            {/* 6. Statistics Section */}
            <Statistics />

            {/* 7. Team Section */}
            <Team onExploreTeam={() => navigateTo('team')} />

            {/* 9. Contact + Newsletter Section */}
            <Contact />
          </>
        ) : currentView === 'about' ? (
          /* Detailed Luxury Standalone Page */
          <AboutPage onScrollToContact={() => navigateTo('contact')} />
        ) : currentView === 'team' ? (
          /* Standalone Standout Team page with executive profiling */
          <TeamPage onScrollToContact={() => navigateTo('contact')} onBackToHome={() => navigateTo('home')} />
        ) : currentView === 'contact' ? (
          /* Standalone Contact page with interactive elements */
          <ContactPage onScrollToContact={() => navigateTo('contact')} onBackToHome={() => navigateTo('home')} />
        ) : currentView === 'articles' ? (
          /* Standalone Articles/Blog publication page */
          <ArticlesPage 
            onScrollToContact={() => navigateTo('contact')} 
            onSelectArticle={(id) => {
              setSelectedArticleId(id);
              navigateTo('article-detail', id);
            }}
          />
        ) : currentView === 'article-detail' ? (
          /* Premium Standing Article Details Page */
          <ArticleDetailsPage 
            articleId={selectedArticleId}
            onBackToArticles={() => navigateTo('articles')}
            onNavigateToArticle={(id) => {
              navigateTo('article-detail', id);
            }}
            onScrollToContact={() => navigateTo('contact')}
          />
        ) : selectedServiceSlug === 'doctor-shield' ? (
          <DoctorShieldPage
            onScrollToContact={() => navigateTo('contact')}
            onBackToHome={() => navigateTo('home')}
          />
        ) : currentView === 'cms-page' ? (
          <CmsPageRenderer
            slug={selectedCmsSlug}
            onBackToHome={() => navigateTo('home')}
            onScrollToContact={() => navigateTo('contact')}
          />
        ) : (
          /* Dynamic Service Details Portal */
          <ServiceDetailsPage
            slug={selectedServiceSlug}
            onNavigateToService={(slug) => navigateTo('service-detail', slug)}
            onScrollToContact={() => navigateTo('contact')}
            onBackToHome={() => navigateTo('home')}
          />
        )}
      </main>

      {/* 10. Footer Section */}
      {currentView !== 'admin' && <Footer currentView={currentView} onNavigate={navigateTo} />}
      
    </div>
  );
}
