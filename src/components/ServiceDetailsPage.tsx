import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Briefcase, ChevronDown, ChevronUp, MessageSquare, Scale } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';

interface ServiceDetailsPageProps {
  slug: string;
  onNavigateToService: (slug: string) => void;
  onScrollToContact: () => void;
  onBackToHome?: () => void;
}

export default function ServiceDetailsPage({
  slug,
  onNavigateToService,
  onScrollToContact,
  onBackToHome,
}: ServiceDetailsPageProps) {
  const { language, direction, t } = useLanguage();
  const { content } = useSiteContent();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOpenFaq(null);
  }, [slug]);

  const practiceArea = useMemo(
    () =>
      (content?.practiceAreas || [])
        .filter((item) => item.published)
        .sort((left, right) => left.order - right.order)
        .find((item) => item.slug === slug) || (content?.practiceAreas || [])[0],
    [content, slug],
  );

  if (!practiceArea) {
    return (
      <div className="min-h-screen bg-[#F1ECE3] px-4 py-20 text-[#1E1E1E]" style={{ direction }}>
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#D8D1C7] bg-white p-8">
          Loading practice area…
        </div>
      </div>
    );
  }

  const relatedPracticeAreas = (content?.practiceAreas || [])
    .filter((item) => item.published && item.slug !== practiceArea.slug)
    .filter((item) => item.categorySlug === practiceArea.categorySlug)
    .sort((left, right) => left.order - right.order)
    .slice(0, 3);

  const categoryMeta = {
    advisory: { icon: MessageSquare, label: t('الاستشارات', 'Advisory') },
    litigation: { icon: Scale, label: t('التقاضي', 'Litigation') },
    transactional: { icon: Briefcase, label: t('المعاملات', 'Transactions') },
  }[practiceArea.categorySlug];

  const CategoryIcon = categoryMeta.icon;

  return (
    <div className="min-h-screen bg-[#F1ECE3] text-[#1E1E1E]" style={{ direction }}>
      <section className="relative overflow-hidden bg-[#121212] py-28 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(165,106,30,0.18)_0%,transparent_70%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold"
              >
                {language === 'ar' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                {t('العودة للرئيسية', 'Back home')}
              </button>
            )}
            <span className="inline-flex items-center gap-2 rounded-full border border-[#A56A1E]/30 bg-[#A56A1E]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E5D5C5]">
              <CategoryIcon className="h-4 w-4" />
              {practiceArea.categoryAr}
            </span>
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl">
            {practiceArea.titleAr}
          </h1>
          <p className="max-w-3xl text-lg text-[#E2DCD3]">{practiceArea.shortDescAr}</p>

          <button
            onClick={onScrollToContact}
            className="rounded-xl bg-[#A56A1E] px-5 py-3 text-sm font-bold text-white"
          >
            {t('تواصل معنا الآن', 'Contact us')}
          </button>

          {practiceArea.imageUrl && (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
              <img
                src={practiceArea.imageUrl}
                alt={practiceArea.titleAr}
                className="w-full max-h-[640px] object-contain bg-[#F8F5EF]"
              />
            </div>
          )}
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6 rounded-3xl border border-[#D8D1C7] bg-white p-6 sm:p-10 shadow-sm">
              <h2 className="text-2xl font-extrabold">{t('ما الذي نقدمه في هذه الخدمة؟', 'What we provide')}</h2>
              <div className="space-y-4 text-[#4B4B4B] leading-8">
                {(language === 'ar' ? practiceArea.aboutAr : practiceArea.aboutEn).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-[#D8D1C7] bg-[#F8F5EF] p-6 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">
                {t('أبرز نقاط القوة', 'Key strengths')}
              </p>
              <div className="space-y-3">
                {practiceArea.features.slice(0, 6).map((feature, index) => (
                  <div key={index} className="rounded-2xl border border-[#D8D1C7] bg-white p-4">
                    <h3 className="font-bold text-[#1E1E1E]">{language === 'ar' ? feature.ar : feature.en}</h3>
                    <p className="mt-1 text-sm text-[#4B4B4B]">{language === 'ar' ? feature.descAr : feature.descEn}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#D8D1C7] bg-[#F8F5EF] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">
              {t('آلية العمل', 'Our process')}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold">{t('كيف ننجز الملف؟', 'How the file moves forward')}</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {practiceArea.processSteps.map((step, index) => (
              <div key={index} className="rounded-2xl border border-[#D8D1C7] bg-white p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#A56A1E] text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="font-extrabold text-[#1E1E1E]">{language === 'ar' ? step.ar : step.en}</h3>
                <p className="mt-2 text-sm text-[#4B4B4B]">{language === 'ar' ? step.descAr : step.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">
              {t('من يستفيد؟', 'Who benefits')}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold">{t('جهات وملفات مناسبة لهذه الخدمة', 'Use cases and beneficiaries')}</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {practiceArea.useCases.map((useCase, index) => (
              <div key={index} className="rounded-2xl border border-[#D8D1C7] bg-white p-5">
                <p className="font-semibold">{language === 'ar' ? useCase.ar : useCase.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#D8D1C7] bg-[#F8F5EF] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">
              {t('الأسئلة الشائعة', 'FAQ')}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold">{t('أسئلة متكررة حول الخدمة', 'Common questions')}</h2>
          </div>

          <div className="space-y-4">
            {practiceArea.faq.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="overflow-hidden rounded-2xl border border-[#D8D1C7] bg-white">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
                  >
                    <span className="font-bold">{language === 'ar' ? item.qAr : item.qEn}</span>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-[#A56A1E]" /> : <ChevronDown className="h-5 w-5 text-[#A56A1E]" />}
                  </button>
                  {isOpen && (
                    <div className="border-t border-[#D8D1C7] px-5 py-4 text-sm leading-7 text-[#4B4B4B]">
                      {language === 'ar' ? item.aAr : item.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {relatedPracticeAreas.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">
                {t('خدمات ذات صلة', 'Related practice areas')}
              </p>
              <h2 className="mt-2 text-3xl font-extrabold">{t('استكشف خدمات أخرى', 'Explore more services')}</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedPracticeAreas.map((related) => (
                <button
                  key={related.slug}
                  onClick={() => onNavigateToService(related.slug)}
                  className="rounded-2xl border border-[#D8D1C7] bg-white p-6 text-start transition-transform hover:-translate-y-1"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A56A1E]">{related.categoryAr}</p>
                  <h3 className="mt-2 text-xl font-extrabold">{related.titleAr}</h3>
                  <p className="mt-3 text-sm text-[#4B4B4B]">{related.shortDescAr}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#121212] py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E5D5C5]">
              {t('هل أنت جاهز؟', 'Ready to proceed?')}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold">{t('دعنا نراجع ملفك الآن', 'Let’s review your file now')}</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={onScrollToContact} className="rounded-xl bg-[#A56A1E] px-5 py-3 text-sm font-bold text-white">
              {t('تواصل معنا', 'Contact us')}
            </button>
            {onBackToHome && (
              <button onClick={onBackToHome} className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white">
                {t('العودة للرئيسية', 'Back home')}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
