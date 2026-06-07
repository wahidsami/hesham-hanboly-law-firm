import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, ShieldCheck, Sparkles, Scale, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';
import { heroSlidesData } from '../data';

interface HeroProps {
  onNavigate: (view: 'home' | 'about' | 'team' | 'contact' | 'articles' | 'article-detail' | 'service-detail', param?: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Scale: <Scale className="w-3.5 h-3.5 text-[#A56A1E]" />,
  ShieldCheck: <ShieldCheck className="w-3.5 h-3.5 text-[#A56A1E]" />,
  Sparkles: <Sparkles className="w-3.5 h-3.5 text-[#A56A1E]" />,
  MessageSquare: <MessageSquare className="w-3.5 h-3.5 text-[#A56A1E]" />,
};

export default function Hero({ onNavigate }: HeroProps) {
  const { language, direction, t } = useLanguage();
  const { content } = useSiteContent();
  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Map our dynamic, scalable slides data array to current UI parameters based on active locale
  const sourceSlides = content?.heroSlides?.length ? content.heroSlides : heroSlidesData;
  const slides = sourceSlides.map(rawSlide => ({
    id: rawSlide.id,
    badge: language === 'ar' ? rawSlide.badgeAr : rawSlide.badgeEn,
    badgeIcon: ICON_MAP[rawSlide.badgeIcon] || <Scale className="w-3.5 h-3.5 text-[#A56A1E]" />,
    titleLine1: language === 'ar' ? rawSlide.titleArLine1 : rawSlide.titleEnLine1,
    titleLine2: language === 'ar' ? rawSlide.titleArLine2 : rawSlide.titleEnLine2,
    description: language === 'ar' ? rawSlide.descriptionAr : rawSlide.descriptionEn,
    ctaText: language === 'ar' ? rawSlide.ctaTextAr : rawSlide.ctaTextEn,
    image: rawSlide.image,
    imageAlt: language === 'ar' ? rawSlide.imageAltAr : rawSlide.imageAltEn,
    highlightBox: rawSlide.highlightBox ? {
      price: language === 'ar' ? rawSlide.highlightBox.priceAr : rawSlide.highlightBox.priceEn,
      note: language === 'ar' ? rawSlide.highlightBox.noteAr : rawSlide.highlightBox.noteEn,
    } : undefined,
    action: () => {
      onNavigate(rawSlide.actionType as any, rawSlide.actionParam);
    }
  }));


  // Apple-style carousel timing logic with dynamic hover pausing and interactive synchronization.
  useEffect(() => {
    if (isHovered) return;
    const stepTime = 100; // poll every 100ms
    const totalTime = 6000; // 6 seconds duration
    const increment = (stepTime / totalTime) * 100;

    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setActiveSlide(prev => (prev + 1) % slides.length);
          return 0;
        }
        return p + increment;
      });
    }, stepTime);

    return () => clearInterval(timer);
  }, [isHovered, activeSlide]);

  const handleSlideSelect = (idx: number) => {
    setActiveSlide(idx);
    setProgress(0);
  };

  const handleScrollToNextSection = () => {
    const nextSection = document.getElementById('about');
    if (nextSection) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = nextSection.getBoundingClientRect().top;
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
      id="hero" 
      className="relative h-[85vh] min-h-[660px] md:min-h-[720px] bg-[#F1ECE3] overflow-hidden select-none"
      style={{ direction }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 
        Subtle legal geometric line vectors behind text.
        Barely visible opacity 3% with slow animated orbits or rotations.
      */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-3 overflow-hidden select-none">
        <svg className="w-full h-full animate-[spin_120s_linear_infinite]" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <circle cx="400" cy="400" r="300" stroke="#7A563D" strokeWidth="1.5" fill="none" strokeDasharray="5 15" />
          <circle cx="400" cy="400" r="200" stroke="#7A563D" strokeWidth="1" fill="none" />
          <path d="M 100 400 A 300 300 0 0 1 700 400" stroke="#7A563D" strokeWidth="1" fill="none" strokeDasharray="3 3" />
          <path d="M 400 100 A 300 300 0 0 1 400 700" stroke="#946B4B" strokeWidth="1" strokeDasharray="10 10" fill="none" />
        </svg>
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none opacity-3 overflow-hidden select-none">
        <svg className="w-full h-full animate-[pulse_10s_ease-in-out_infinite]" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <circle cx="400" cy="400" r="350" stroke="#A56A1E" strokeWidth="0.5" fill="none" />
          <polygon points="400,200 450,300 400,400 350,300" stroke="#A56A1E" strokeWidth="1" fill="none" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* CAROUSEL SLIDES */}
      <div className="relative w-full h-full">
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlide;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                isActive 
                  ? 'opacity-100 scale-100 pointer-events-all z-10' 
                  : 'opacity-0 scale-[1.03] pointer-events-none z-0'
              }`}
            >
              
              {/* MOBILE LAYOUT CONTENT (Shown on screens smaller than lg) */}
              <div 
                className="block lg:hidden absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                {/* Responsive Dark Ambient Hue Overlay for perfect readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/98 via-[#121212]/80 to-[#121212]/55 flex flex-col justify-center items-center text-center px-6 py-12">
                  <div className="max-w-xl space-y-5 text-white flex flex-col items-center">
                    
                    {/* Badge */}
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#A56A1E]/20 text-[#E9C394] ring-1 ring-[#A56A1E]/40 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                      {slide.badgeIcon}
                      <span>{slide.badge}</span>
                    </span>

                    {/* Titles */}
                    <div className="space-y-1">
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                        {slide.titleLine1}
                      </h2>
                      <p className="text-sm font-semibold text-[#E9C394]">
                        {slide.titleLine2}
                      </p>
                    </div>

                    {/* Highlight Box for Doctor Shield (Slide 2) */}
                    {slide.highlightBox && (
                      <div className="py-2.5 px-6 rounded-xl bg-[#7A563D]/40 border border-[#A56A1E]/40 inline-flex flex-col items-center text-center">
                        <span className="text-sm font-extrabold text-[#E9C394]">{slide.highlightBox.price}</span>
                        <span className="text-[10px] text-white/70">{slide.highlightBox.note}</span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed text-justify max-w-md drop-shadow">
                      {slide.description}
                    </p>

                    {/* Action button */}
                    <div className="pt-2">
                      <button
                        onClick={slide.action}
                        className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#A56A1E] hover:bg-[#C98B35] text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <span>{slide.ctaText}</span>
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

              {/* DESKTOP LAYOUT CONTENT (Shown on lg and above screens) */}
              <div className="hidden lg:block w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center h-full">
                  
                  {/* Left Column / Title Content */}
                  <div className="lg:col-span-7 flex flex-col justify-center items-start text-start space-y-6 sm:space-y-8">
                    
                    {/* Badge Element with smooth entry animation */}
                    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#A56A1E]/12 border border-[#A56A1E]/25 rounded-lg transition-all duration-700 delay-100 transform ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      {slide.badgeIcon}
                      <span className="text-xs font-bold text-[#A56A1E] tracking-wider">
                        {slide.badge}
                      </span>
                    </div>

                    {/* Header Lines */}
                    <div className={`space-y-2 transition-all duration-700 delay-200 transform ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <h1 className="text-4xl lg:text-5xl font-black text-[#1E1E1E] leading-tight font-serif drop-shadow-sm">
                        {slide.titleLine1}
                      </h1>
                      <p className="text-[#A56A1E] text-lg font-bold tracking-tight">
                        {slide.titleLine2}
                      </p>
                    </div>

                    {/* Special Subscription Badge Box for Slide 2 */}
                    {slide.highlightBox && (
                      <div className={`py-3 px-6 rounded-2xl bg-white border border-[#D8D1C7] shadow-sm inline-flex flex-col items-start transition-all duration-700 delay-300 transform ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <span className="text-base font-black text-[#7A563D]">{slide.highlightBox.price}</span>
                        <span className="text-[11px] text-[#A56A1E] font-medium mt-0.5">{slide.highlightBox.note}</span>
                      </div>
                    )}

                    {/* Secondary Description Paragraph */}
                    <p className={`text-[#4B4B4B] text-sm leading-relaxed font-light text-justify max-w-2xl transition-all duration-700 delay-300 transform ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      {slide.description}
                    </p>

                    {/* Primary Interactive CTA */}
                    <div className={`pt-2 transition-all duration-700 delay-400 transform ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <button
                        onClick={slide.action}
                        className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#7B5A42] hover:bg-[#946B4B] text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <span>{slide.ctaText}</span>
                        {direction === 'rtl' ? (
                          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        ) : (
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        )}
                      </button>
                    </div>

                  </div>

                  {/* Right Column / Framed Image */}
                  <div className="lg:col-span-5 relative flex items-center justify-center">
                    {/* Multi-layered border framing decoration (Saudi luxury geometric signature) */}
                    <div className={`absolute -top-4 ${language === 'ar' ? '-right-4' : '-left-4'} w-24 h-24 border-t ${language === 'ar' ? 'border-r' : 'border-l'} border-[#A56A1E]/70 rounded-tr pointer-events-none z-10 transition-all duration-700 delay-200 transform ${isActive ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`} />
                    <div className={`absolute -bottom-4 ${language === 'ar' ? '-left-4' : '-right-4'} w-24 h-24 border-b ${language === 'ar' ? 'border-l' : 'border-r'} border-[#A56A1E]/70 rounded-bl pointer-events-none z-10 transition-all duration-700 delay-200 transform ${isActive ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`} />
                    
                    {/* Visual aspect wrap box */}
                    <div className="rounded-2xl overflow-hidden aspect-[4/5] w-full max-w-sm shadow-2xl border border-[#D8D1C7] bg-[#F8F5EF] relative">
                      
                      {/* Image element with dynamic fade+scale on transition cycle */}
                      <img
                        src={slide.image}
                        alt={slide.imageAlt}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-transform duration-1000 ${isActive ? 'scale-100' : 'scale-[1.06]'}`}
                      />

                      {/* Small visual card details overlay */}
                      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#121212]/75 to-transparent p-6 text-white text-start transition-all duration-700 delay-350 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        {slide.id === 'about-company' && (
                          <>
                            <span className="text-[10px] uppercase tracking-widest text-[#F1ECE3]/90">
                              {t('جدة • المملكة العربية السعودية', 'JEDDAH • SAUDI ARABIA')}
                            </span>
                            <p className="text-xs font-semibold mt-0.5">
                              {t('حماية متكاملة للأعمال والشركات الكبرى', 'Engineered to protect business & institutional assets')}
                            </p>
                          </>
                        )}
                        {slide.id === 'sanad-al-tabeeb' && (
                          <>
                            <span className="text-[10px] uppercase tracking-widest text-[#F1ECE3]/90">
                              {t('حماية طبية متخصصة', 'SPECIALIZED MEDICINE DEFENSE')}
                            </span>
                            <p className="text-xs font-semibold mt-0.5">
                              {t('درع الأمان القانوني الشامل طوال مسيرتك المهنية', 'Securing your license & noble clinical human message')}
                            </p>
                          </>
                        )}
                        {slide.id === 'featured-service' && (
                          <>
                            <span className="text-[10px] uppercase tracking-widest text-[#F1ECE3]/90">
                              {t('طلب استشارات ٢٤/٧', '24/7 CONSULTING DECK')}
                            </span>
                            <p className="text-xs font-semibold mt-0.5">
                              {t('خبرات قانونية نوعية لحل الأزمات وحماية الاستثمارات', 'Qualitative advice engineered for complex decisions')}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* CAROUSEL NAVIGATION & DETAILED PROGRESS ENGINE */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex flex-col justify-center items-center gap-3">
        
        {/* Navigation Dots Container */}
        <div className="flex items-center gap-3.5">
          {slides.map((_, idx) => {
            const isActive = idx === activeSlide;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSlideSelect(idx)}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 relative cursor-pointer outline-none ${
                  isActive 
                    ? 'border-[#A56A1E] bg-transparent scale-110' 
                    : 'border-[#E9E4DC] bg-[#E9E4DC]/40 hover:bg-[#E9E4DC] hover:border-[#E8E8E8]'
                }`}
                title={t(`شريحة ${idx + 1}`, `Slide ${idx + 1}`)}
              >
                {/* Active Inner dot pointer */}
                {isActive && (
                  <span className="absolute inset-[2.5px] rounded-full bg-[#A56A1E] animate-[ping_2.5s_infinite_ease-in-out]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic linear countdown bar with premium indexing */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#A56A1E]">
            0{activeSlide + 1} / 03
          </span>
          <div className="w-24 h-[2.5px] bg-[#E9E4DC]/80 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 bottom-0 bg-[#A56A1E] transition-all duration-100 ease-linear"
              style={{ 
                width: `${progress}%`,
                right: direction === 'rtl' ? 0 : 'auto',
                left: direction === 'rtl' ? 'auto' : 0
              }}
            />
          </div>
        </div>

        {/* Elegant arrow-driven visual indicator to proceed */}
        <button 
          onClick={handleScrollToNextSection}
          className="flex flex-col items-center mt-3 text-[10px] text-[#A56A1E]/80 hover:text-[#A56A1E] hover:opacity-100 transition-opacity border-none outline-none cursor-pointer"
        >
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </button>

      </div>
    </section>
  );
}
