import React from 'react';
import { Scale } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';

export default function Statistics() {
  const { direction, t } = useLanguage();
  const { content } = useSiteContent();
  const siteSettings = content?.siteSettings;

  return (
    <section 
      id="statistics" 
      className="py-20 sm:py-24 bg-[#E9E2D5] relative overflow-hidden border-b border-[#D8D1C7]"
      style={{ direction }}
    >
      {/* Abstract large watermark decoration */}
      <div className="absolute left-10 md:left-24 top-1/2 -translate-y-1/2 text-[#A56A1E]/5 pointer-events-none select-none">
        <Scale className="w-64 h-64 stroke-[1]" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
          
          {/* Main big numbers */}
          <div className="text-start md:w-1/2 space-y-4">
            <span className="text-[#A56A1E] text-xs sm:text-sm font-semibold uppercase tracking-wider block">
              {t(
                siteSettings?.statisticsBadgeAr || 'إنجازات تدعو للفخر والاعتماد',
                siteSettings?.statisticsBadgeEn || 'PROUD TRACK RECORD OF SUCCESS'
              )}
            </span>
            
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-[#1E1E1E] leading-none tracking-tight">
              {siteSettings?.statisticsNumber || t('+3000', '+3,000')}
            </h2>
            
            <p className="text-xl sm:text-2xl font-bold text-[#7B5A42]">
              {t(
                siteSettings?.statisticsTitleAr || 'عمل قانوني ناجح',
                siteSettings?.statisticsTitleEn || 'Successful Judicial Operations'
              )}
            </p>
          </div>

          {/* Supporting Text */}
          <div className="md:w-1/2 rounded-lg p-6 sm:p-8 bg-[#F1ECE3]/60 border border-[#D8D1C7] text-start">
            <p className="text-[#1E1E1E] text-base leading-relaxed font-light text-justify">
              {t(
                siteSettings?.statisticsDescAr || 'هذه النتائج الاستثنائية هي ثمرة عمل كادر متناغم ومؤهل من أعضاء شركة هشام حسن حنبولي الدولية للاستشارات القانونية والمحاماة، حيث يكرس كل مستشار ومساعد خبراته الممتدة لصناعة الفارق وحماية حقوق عملائنا الكرام.',
                siteSettings?.statisticsDescEn || 'These distinguished results are the fruit of collaborative, specialized legal performance by Hesham H. Hanboly International members, where each senior counsel compromises no detail to protect the supreme statutory and civil rights of our distinguished clients.'
              )}
            </p>
            <div className="mt-4 flex items-center gap-2 text-[#A56A1E] text-xs font-bold font-mono">
              <span>
                {t(
                  siteSettings?.statisticsSupportAr || 'تغطية قضائية متكاملة في المحاكم العامة، العمالية، والتجارية',
                  siteSettings?.statisticsSupportEn || 'Sovereign coverage in Supreme, Appellate, Labor, and Commercial tribunals'
                )}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
