import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CircleDot, LoaderCircle, Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { contentClient } from '../content/contentClient';
import type { CMSBlockRecord, CMSPublishedPageRecord } from '../types';

interface CmsPageRendererProps {
  slug: string;
  onBackToHome: () => void;
  onScrollToContact: () => void;
}

const iconForCard = (name?: string) => {
  const lowered = (name || '').toLowerCase();
  if (lowered.includes('scale')) return '⚖';
  if (lowered.includes('briefcase')) return '▣';
  if (lowered.includes('building')) return '▤';
  if (lowered.includes('users')) return '◌';
  if (lowered.includes('shield')) return '⛨';
  return '•';
};

function blockParagraphs(text: string) {
  return text.split(/\n\s*\n/).filter(Boolean);
}

function BlockShell({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <section className={`py-16 sm:py-20 ${accent ? 'bg-[#F8F5EF]' : 'bg-[#F1ECE3]'} border-b border-[#D8D1C7]/40`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export default function CmsPageRenderer({ slug, onBackToHome, onScrollToContact }: CmsPageRendererProps) {
  const { direction, language, t } = useLanguage();
  const [page, setPage] = useState<CMSPublishedPageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadPage() {
      setLoading(true);
      setError(null);
      try {
        const next = await contentClient.getCmsPage(slug);
        if (!cancelled) setPage(next);
      } catch (nextError) {
        if (!cancelled) setError(nextError instanceof Error ? nextError.message : 'Page not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPage();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const heroBlock = useMemo(() => page?.blocks?.find((block) => block.type === 'hero') ?? null, [page]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ direction }}>
        <div className="flex items-center gap-3 text-[#7B5A42]">
          <LoaderCircle className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">{t('جارٍ تحميل الصفحة…', 'Loading page…')}</span>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" style={{ direction }}>
        <div className="max-w-xl w-full rounded-3xl border border-[#D8D1C7] bg-white p-8 text-center shadow-sm">
          <div className="text-2xl font-extrabold text-[#1E1E1E] mb-3">
            {t('الصفحة غير متوفرة', 'Page not found')}
          </div>
          <p className="text-sm text-[#5B5B5B] leading-relaxed">
            {t(
              'لم نتمكن من العثور على الصفحة المطلوبة داخل نظام إدارة المحتوى.',
              'We could not find the requested page in the CMS.'
            )}
          </p>
          <button
            onClick={onBackToHome}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7B5A42] px-4 py-3 text-white font-semibold"
          >
            {direction === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{t('العودة للرئيسية', 'Back to Home')}</span>
          </button>
        </div>
      </div>
    );
  }

  const renderBlock = (block: CMSBlockRecord, index: number) => {
    const data = block.data || {};
    const isEven = index % 2 === 1;

    switch (block.type) {
      case 'hero':
        return (
          <section
            key={block.id}
            className="relative min-h-[60vh] flex items-center justify-center py-24 overflow-hidden border-b border-[#A56A1E]/20"
            style={{ background: (data.bgColor as string) || '#121212', direction }}
          >
            {typeof data.imageUrl === 'string' && data.imageUrl ? (
              <div className="absolute inset-0 opacity-30">
                <img src={data.imageUrl} alt={typeof data.imageAlt === 'string' ? data.imageAlt : ''} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              </div>
            ) : null}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center space-y-5">
              <div className="inline-flex px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-white/80 uppercase tracking-[0.2em]">
                {language === 'ar' ? (data.badgeAr as string) || page.titleAr : (data.badgeEn as string) || page.titleEn}
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
                {language === 'ar' ? (data.headingAr as string) || page.titleAr : (data.headingEn as string) || page.titleEn}
              </h2>
              <p className="max-w-3xl mx-auto text-base sm:text-lg text-white/80 leading-relaxed">
                {language === 'ar' ? (data.subheadingAr as string) || '' : (data.subheadingEn as string) || ''}
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {(data.ctaPrimaryLabelEn || data.ctaPrimaryLabelAr) && (
                  <button onClick={onScrollToContact} className="rounded-xl bg-[#A56A1E] px-5 py-3 text-white font-semibold">
                    {language === 'ar' ? (data.ctaPrimaryLabelAr as string) || 'تواصل معنا' : (data.ctaPrimaryLabelEn as string) || 'Contact Us'}
                  </button>
                )}
                {(data.ctaSecondaryLabelEn || data.ctaSecondaryLabelAr) && (
                  <a href={typeof data.ctaSecondaryUrl === 'string' ? data.ctaSecondaryUrl : '#'} className="rounded-xl border border-white/20 px-5 py-3 text-white font-semibold">
                    {language === 'ar' ? (data.ctaSecondaryLabelAr as string) || '' : (data.ctaSecondaryLabelEn as string) || ''}
                  </a>
                )}
              </div>
            </div>
          </section>
        );
      case 'rich-text':
        return (
          <BlockShell key={block.id} accent={isEven}>
            <div className="max-w-4xl mx-auto space-y-6">
              <h3 className="text-3xl font-extrabold text-[#1E1E1E]">
                {language === 'ar' ? (data.headingAr as string) || '' : (data.headingEn as string) || ''}
              </h3>
              <div className="space-y-4 text-base leading-8 text-[#4B4B4B]">
                {blockParagraphs(language === 'ar' ? (data.bodyAr as string) || '' : (data.bodyEn as string) || '').map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </BlockShell>
        );
      case 'image-text':
        return (
          <BlockShell key={block.id} accent={isEven}>
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${direction === 'rtl' ? 'lg:[direction:rtl]' : ''}`}>
              <div className="space-y-6">
                <h3 className="text-3xl font-extrabold text-[#1E1E1E]">{language === 'ar' ? (data.headingAr as string) || '' : (data.headingEn as string) || ''}</h3>
                <div className="space-y-4 text-base leading-8 text-[#4B4B4B]">
                  {blockParagraphs(language === 'ar' ? (data.bodyAr as string) || '' : (data.bodyEn as string) || '').map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex}>{paragraph}</p>
                  ))}
                </div>
                {(data.ctaPrimaryLabelAr || data.ctaPrimaryLabelEn) && (
                  <button onClick={onScrollToContact} className="rounded-xl bg-[#7B5A42] px-5 py-3 text-white font-semibold">
                    {language === 'ar' ? (data.ctaPrimaryLabelAr as string) || 'تواصل معنا' : (data.ctaPrimaryLabelEn as string) || 'Contact Us'}
                  </button>
                )}
              </div>
              <div className="rounded-3xl overflow-hidden shadow-xl border border-[#D8D1C7]">
                <img src={typeof data.imageUrl === 'string' ? data.imageUrl : ''} alt={typeof data.imageAlt === 'string' ? data.imageAlt : ''} className="w-full h-[360px] object-cover" />
              </div>
            </div>
          </BlockShell>
        );
      case 'cards':
        return (
          <BlockShell key={block.id} accent={isEven}>
            <div className="space-y-4 mb-10 max-w-3xl">
              <h3 className="text-3xl font-extrabold text-[#1E1E1E]">{language === 'ar' ? (data.headingAr as string) || '' : (data.headingEn as string) || ''}</h3>
              <p className="text-[#4B4B4B]">{language === 'ar' ? (data.subheadingAr as string) || '' : (data.subheadingEn as string) || ''}</p>
            </div>
            <div className={`grid gap-6 ${Number(data.columns || 3) >= 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {Array.isArray(data.items) && data.items.map((item: Record<string, unknown>) => (
                <div key={String(item.id || Math.random())} className="rounded-2xl bg-white border border-[#D8D1C7] p-6 shadow-sm">
                  <div className="text-2xl text-[#A56A1E] mb-4">{iconForCard(String(item.icon || ''))}</div>
                  <h4 className="text-lg font-bold text-[#1E1E1E] mb-3">{language === 'ar' ? String(item.titleAr || '') : String(item.titleEn || '')}</h4>
                  <p className="text-sm leading-7 text-[#4B4B4B]">{language === 'ar' ? String(item.descAr || '') : String(item.descEn || '')}</p>
                </div>
              ))}
            </div>
          </BlockShell>
        );
      case 'stats':
        return (
          <BlockShell key={block.id} accent={isEven}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.isArray(data.items) && data.items.map((item: Record<string, unknown>) => (
                <div key={String(item.id || Math.random())} className="rounded-2xl bg-white border border-[#D8D1C7] p-6 text-center shadow-sm">
                  <div className="text-3xl font-black text-[#A56A1E] mb-2">{String(item.value || '')}</div>
                  <div className="text-sm text-[#4B4B4B]">{language === 'ar' ? String(item.labelAr || '') : String(item.labelEn || '')}</div>
                </div>
              ))}
            </div>
          </BlockShell>
        );
      case 'cta':
        return (
          <section key={block.id} className="py-20 bg-[#121212] text-white border-b border-[#A56A1E]/20" style={{ direction }}>
            <div className="w-full max-w-5xl mx-auto px-4 text-center space-y-6">
              <h3 className="text-3xl sm:text-4xl font-extrabold">{language === 'ar' ? (data.headingAr as string) || '' : (data.headingEn as string) || ''}</h3>
              <p className="text-white/80 leading-relaxed max-w-3xl mx-auto">{language === 'ar' ? (data.bodyAr as string) || '' : (data.bodyEn as string) || ''}</p>
              <button onClick={onScrollToContact} className="rounded-xl bg-[#A56A1E] px-6 py-3 font-semibold">
                {language === 'ar' ? (data.ctaPrimaryLabelAr as string) || 'تواصل معنا' : (data.ctaPrimaryLabelEn as string) || 'Contact Us'}
              </button>
            </div>
          </section>
        );
      case 'faq':
        return (
          <BlockShell key={block.id} accent={isEven}>
            <div className="space-y-6 max-w-4xl mx-auto">
              <h3 className="text-3xl font-extrabold text-[#1E1E1E]">{language === 'ar' ? (data.headingAr as string) || '' : (data.headingEn as string) || ''}</h3>
              <div className="space-y-3">
                {Array.isArray(data.items) && data.items.map((item: Record<string, unknown>) => (
                  <details key={String(item.id || Math.random())} className="rounded-2xl border border-[#D8D1C7] bg-white p-5">
                    <summary className="cursor-pointer list-none font-semibold text-[#1E1E1E]">{language === 'ar' ? String(item.questionAr || '') : String(item.questionEn || '')}</summary>
                    <div className="mt-3 text-[#4B4B4B] leading-8">{language === 'ar' ? String(item.answerAr || '') : String(item.answerEn || '')}</div>
                  </details>
                ))}
              </div>
            </div>
          </BlockShell>
        );
      case 'team':
        return (
          <BlockShell key={block.id} accent={isEven}>
            <div className="space-y-6 mb-10">
              <h3 className="text-3xl font-extrabold text-[#1E1E1E]">{language === 'ar' ? (data.headingAr as string) || '' : (data.headingEn as string) || ''}</h3>
              <p className="text-[#4B4B4B] max-w-3xl">{language === 'ar' ? (data.subheadingAr as string) || '' : (data.subheadingEn as string) || ''}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(data.items) && data.items.map((item: Record<string, unknown>) => (
                <div key={String(item.id || Math.random())} className="rounded-3xl border border-[#D8D1C7] bg-white overflow-hidden shadow-sm">
                  {typeof item.imageUrl === 'string' && item.imageUrl ? <img src={item.imageUrl} alt={language === 'ar' ? String(item.nameAr || '') : String(item.nameEn || '')} className="w-full h-72 object-cover" /> : null}
                  <div className="p-6 space-y-3">
                    <h4 className="text-xl font-bold text-[#1E1E1E]">{language === 'ar' ? String(item.nameAr || '') : String(item.nameEn || '')}</h4>
                    <div className="text-sm font-semibold text-[#A56A1E]">{language === 'ar' ? String(item.roleAr || '') : String(item.roleEn || '')}</div>
                    <p className="text-sm leading-7 text-[#4B4B4B]">{language === 'ar' ? String(item.bioAr || '') : String(item.bioEn || '')}</p>
                  </div>
                </div>
              ))}
            </div>
          </BlockShell>
        );
      case 'contact':
        return (
          <BlockShell key={block.id} accent={isEven}>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl bg-white border border-[#D8D1C7] p-6">
                <Mail className="w-6 h-6 text-[#A56A1E] mb-3" />
                <div className="text-sm font-semibold text-[#A56A1E] mb-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</div>
                <div className="text-sm text-[#1E1E1E]">{String(data.email || '')}</div>
              </div>
              <div className="rounded-3xl bg-white border border-[#D8D1C7] p-6">
                <Phone className="w-6 h-6 text-[#A56A1E] mb-3" />
                <div className="text-sm font-semibold text-[#A56A1E] mb-1">{language === 'ar' ? 'الهاتف' : 'Phone'}</div>
                <div className="text-sm text-[#1E1E1E]">{String(data.phone || '')}</div>
              </div>
              <div className="rounded-3xl bg-white border border-[#D8D1C7] p-6">
                <MapPin className="w-6 h-6 text-[#A56A1E] mb-3" />
                <div className="text-sm font-semibold text-[#A56A1E] mb-1">{language === 'ar' ? 'العنوان' : 'Address'}</div>
                <div className="text-sm text-[#1E1E1E]">{language === 'ar' ? String(data.addressAr || data.address || '') : String(data.addressEn || data.address || '')}</div>
              </div>
            </div>
          </BlockShell>
        );
      case 'gallery':
        return (
          <BlockShell key={block.id} accent={isEven}>
            <div className="space-y-6 mb-8">
              <h3 className="text-3xl font-extrabold text-[#1E1E1E]">{language === 'ar' ? (data.headingAr as string) || '' : (data.headingEn as string) || ''}</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.isArray(data.items) && data.items.map((item: Record<string, unknown>) => (
                <figure key={String(item.id || Math.random())} className="rounded-2xl overflow-hidden bg-white border border-[#D8D1C7] shadow-sm">
                  {typeof item.imageUrl === 'string' ? <img src={item.imageUrl} alt={language === 'ar' ? String(item.captionAr || '') : String(item.captionEn || '')} className="w-full h-56 object-cover" /> : null}
                  <figcaption className="p-4 text-sm text-[#4B4B4B]">{language === 'ar' ? String(item.captionAr || '') : String(item.captionEn || '')}</figcaption>
                </figure>
              ))}
            </div>
          </BlockShell>
        );
      case 'custom':
        return (
          <BlockShell key={block.id} accent={isEven}>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: String(data.htmlContent || '') }} />
          </BlockShell>
        );
      default:
        return (
          <BlockShell key={block.id} accent={isEven}>
            <div className="rounded-2xl border border-dashed border-[#D8D1C7] bg-white p-8 text-center text-[#5B5B5B]">
              {t('نوع كتلة غير مدعوم بعد', 'Unsupported block type')}
            </div>
          </BlockShell>
        );
    }
  };

  return (
    <div className="bg-[#F1ECE3] overflow-hidden leading-relaxed text-[#1E1E1E]" style={{ direction }}>
      {heroBlock ? renderBlock(heroBlock, 0) : (
        <section className="relative min-h-[50vh] flex items-center justify-center bg-[#121212] text-white py-24 border-b border-[#A56A1E]/20">
          <div className="w-full max-w-5xl mx-auto px-4 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/80">
              <CircleDot className="w-3 h-3" />
              <span>{language === 'ar' ? page.titleAr : page.titleEn}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black">{language === 'ar' ? page.titleAr : page.titleEn}</h1>
          </div>
        </section>
      )}
      {page.blocks.filter((block) => block.type !== 'hero').map((block, index) => renderBlock(block, index + 1))}
      <section className="py-20 bg-[#121212] text-white text-center">
        <div className="w-full max-w-5xl mx-auto px-4 space-y-5">
          <h3 className="text-3xl sm:text-4xl font-extrabold">{t('هل تحتاج إلى استشارة؟', 'Need a consultation?')}</h3>
          <p className="text-white/80 max-w-3xl mx-auto leading-relaxed">{t('يمكنك دائماً العودة إلى صفحة التواصل لحجز موعد مع فريقنا.', 'You can always head back to the contact page to book a meeting with our team.')}</p>
          <button onClick={onScrollToContact} className="rounded-xl bg-[#A56A1E] px-6 py-3 font-semibold">
            {t('تواصل معنا', 'Contact Us')}
          </button>
        </div>
      </section>
    </div>
  );
}
