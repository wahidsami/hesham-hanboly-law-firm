import React from 'react';
import { Shield, Sparkles, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';

interface DoctorShieldAdProps {
  onNavigateToAd: () => void;
}

export default function DoctorShieldAd({ onNavigateToAd }: DoctorShieldAdProps) {
  const { language, direction, t } = useLanguage();
  const { content } = useSiteContent();
  const siteSettings = content?.siteSettings;

  return (
    <section 
      className="py-16 bg-[#FBEFDF] border-y border-[#D8D1C7]/60 overflow-hidden relative"
      style={{ direction }}
    >
      {/* Decorative vectors */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none select-none">
        <Shield className="w-96 p-2 h-96 text-[#7A563D]" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-3xl border border-[#D8D1C7] shadow-xl p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text / Info */}
          <div className="lg:col-span-8 flex flex-col items-start text-start space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A56A1E]/10 text-[#A56A1E] text-xs font-bold uppercase tracking-widest border border-[#A56A1E]/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t(siteSettings?.doctorShieldBadgeAr || 'جديد وحصري', siteSettings?.doctorShieldBadgeEn || 'NEW & EXCLUSIVE')}</span>
            </span>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-[#7A563D] tracking-tight font-serif leading-tight">
                {t(
                  siteSettings?.doctorShieldTitleAr || 'برنامج سند الطبيب الوقائي',
                  siteSettings?.doctorShieldTitleEn || 'Doctor Shield Protective Program'
                )}
              </h2>
              <p className="text-md sm:text-lg font-bold text-[#121212]/85">
                {t(
                  siteSettings?.doctorShieldSubtitleAr || 'درعك القانوني وحمايتك القضائية الشاملة طوال العام الكلينيكي',
                  siteSettings?.doctorShieldSubtitleEn || 'Your Ultimate Legal Companion Throughout the Practice Year'
                )}
              </p>
            </div>

            <p className="text-sm text-[#5B5B5B] font-light leading-relaxed max-w-2xl text-justify">
              {t(
                siteSettings?.doctorShieldDescAr || 'مشروع قانوني سنوي مبتكر مصمم خصيصاً للكوادر الطبية والممارسين الصحيين في المملكة العربية السعودية.',
                siteSettings?.doctorShieldDescEn || 'A pioneering legal protective program custom-engineered for physicians and medical professionals in Saudi Arabia.'
              )}
            </p>

            {/* Quick value bullets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-2">
              <div className="flex items-center gap-2.5 text-xs text-[#121212]/90">
                <CheckCircle className="w-4 h-4 text-[#A56A1E] shrink-0" />
                <span className="font-semibold">{t(siteSettings?.doctorShieldBullet1Ar || 'تمثيل قانوني وحضور التحقيقات بالنيابة عنك', siteSettings?.doctorShieldBullet1En || 'Full representation and hearing attendance')}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#121212]/90">
                <CheckCircle className="w-4 h-4 text-[#A56A1E] shrink-0" />
                <span className="font-semibold">{t(siteSettings?.doctorShieldBullet2Ar || 'دعم استشاري فوري وشبكة مخصصة ٢٤/٧', siteSettings?.doctorShieldBullet2En || '24/7 priority emergency legal hotline')}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#121212]/90">
                <CheckCircle className="w-4 h-4 text-[#A56A1E] shrink-0" />
                <span className="font-semibold">{t(siteSettings?.doctorShieldBullet3Ar || 'قيمة سنوية ثابتة وميسرة ٢٣٠٠ ريال فقط', siteSettings?.doctorShieldBullet3En || 'Clear annual cost of only 2,300 SAR')}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#121212]/90">
                <CheckCircle className="w-4 h-4 text-[#A56A1E] shrink-0" />
                <span className="font-semibold">{t(siteSettings?.doctorShieldBullet4Ar || 'شامل ضريبة القيمة المضافة بالكامل دون رسوم إضافية', siteSettings?.doctorShieldBullet4En || 'VAT fully pre-included, no hidden filing fees')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap gap-4 w-full sm:w-auto">
              <button
                onClick={onNavigateToAd}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#7A563D] hover:bg-[#946B4B] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>{t(siteSettings?.doctorShieldButtonAr || 'تفاصيل الخدمة والاشتراك الفوري', siteSettings?.doctorShieldButtonEn || 'Explore Details & Register')}</span>
                {direction === 'rtl' ? (
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </div>
          </div>

          {/* Right graphics / Interactive Badge */}
          <div className="lg:col-span-4 flex justify-center items-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-[#7A563D]/5 border-2 border-[#A56A1E]/20 flex items-center justify-center p-6 bg-radial-gradient">
              {/* Spinning background circle */}
              <div className="absolute inset-0 border border-dashed border-[#7A563D]/30 rounded-full animate-[spin_40s_linear_infinite]" />
              
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-white border border-[#D8D1C7] shadow-lg flex flex-col justify-center items-center text-center p-4 relative z-10">
                <Shield className="w-10 h-10 text-[#A56A1E] mb-2 stroke-[1.5]" />
                <span className="text-xs font-serif font-extrabold text-[#7A563D]">{t(siteSettings?.doctorShieldCircleTitleAr || 'سند الطبيب', siteSettings?.doctorShieldCircleTitleEn || 'Doctor Shield')}</span>
                <span className="text-[10px] text-[#A56A1E] font-semibold mt-1 tracking-wider">{t(siteSettings?.doctorShieldCirclePriceAr || '٢٣٠٠ ريال / سنة', siteSettings?.doctorShieldCirclePriceEn || '2,300 SAR / Yr')}</span>
                <span className="text-[8px] text-[#121212]/40 mt-0.5">{t(siteSettings?.doctorShieldCircleNoteAr || 'شامل الضريبة', siteSettings?.doctorShieldCircleNoteEn || 'VAT Included')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
