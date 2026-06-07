import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Calendar, Clock, Copy, Hash, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';
import { extractMarkdownHeadings } from './MarkdownRenderer';
import MarkdownRenderer from './MarkdownRenderer';

interface ArticleDetailsPageProps {
  articleId: string;
  onBackToArticles: () => void;
  onNavigateToArticle: (id: string) => void;
  onScrollToContact: () => void;
}

const authorTitle = {
  ar: 'مؤلف/محرر المقال',
  en: 'Article author / editor',
} as const;

const managerSummary = {
  ar: 'يقدم المكتب محتوى قانونيًا متكاملًا مبنيًا على خبرة عملية في الشركات والتحكيم والامتثال. يمكن حفظ المقالة والعودة إليها لاحقًا أو نسخ رابطها بسهولة.',
  en: 'The firm publishes practical legal content across corporate law, arbitration, and compliance. You can save the article, return to it later, or copy its link instantly.',
} as const;

export default function ArticleDetailsPage({
  articleId,
  onBackToArticles,
  onNavigateToArticle,
  onScrollToContact,
}: ArticleDetailsPageProps) {
  const { language, direction, t } = useLanguage();
  const { content } = useSiteContent();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [articleId]);

  const article = (content?.articles || [])
    .filter((item) => item.published)
    .sort((left, right) => left.order - right.order)
    .find((item) => item.slug === articleId) || (content?.articles || [])[0];

  if (!article) {
    return (
      <div className="min-h-screen bg-[#F1ECE3] px-4 py-20 text-[#1E1E1E]" style={{ direction }}>
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#D8D1C7] bg-white p-8">
          <p className="text-sm font-bold text-[#A56A1E]">Articles</p>
          <h1 className="mt-2 text-3xl font-extrabold">Loading article…</h1>
        </div>
      </div>
    );
  }

  const body = language === 'ar' ? article.bodyAr : article.bodyEn;
  const excerpt = language === 'ar' ? article.excerptAr : article.excerptEn;
  const category = language === 'ar' ? article.categoryAr : article.categoryEn;
  const title = language === 'ar' ? article.titleAr : article.titleEn;
  const author = language === 'ar' ? article.authorAr : article.authorEn;
  const readTime = language === 'ar' ? article.readTimeAr : article.readTimeEn;
  const headings = extractMarkdownHeadings(body);

  const shareCurrent = async () => {
    if (navigator.share) {
      await navigator.share({
        title,
        url: window.location.href,
      });
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    alert(t('تم نسخ رابط المقالة', 'Article link copied'));
  };

  const saveForLater = () => {
    const storageKey = 'saved_articles';
    const savedArticles = JSON.parse(localStorage.getItem(storageKey) || '[]') as string[];
    if (!savedArticles.includes(article.slug)) {
      localStorage.setItem(storageKey, JSON.stringify([article.slug, ...savedArticles]));
    }
    alert(t('تم حفظ المقالة للرجوع إليها لاحقًا', 'Article saved for later'));
  };

  const relatedArticles = (content?.articles || [])
    .filter((item) => item.published && item.slug !== article.slug)
    .sort((left, right) => left.order - right.order)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F1ECE3] text-[#1E1E1E]" style={{ direction }}>
      <section className="relative overflow-hidden bg-[#121212] py-24 text-white sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(165,106,30,0.2)_0%,transparent_70%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <button
            onClick={onBackToArticles}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90"
          >
            {language === 'ar' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {t('العودة إلى المقالات', 'Back to articles')}
          </button>

          <div className="max-w-5xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#A56A1E]/35 bg-[#A56A1E]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#F4E4D3]">
              <Hash className="h-3.5 w-3.5" />
              {category}
            </span>

            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#E2DCD3]">
              <span className="inline-flex items-center gap-2">
                <User className="h-4 w-4 text-[#A56A1E]" />
                {author}
              </span>
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#A56A1E]" />
                {article.date}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#A56A1E]" />
                {readTime}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="space-y-8">
              <div className="overflow-hidden rounded-[28px] border border-[#D8D1C7] bg-white shadow-sm">
                <img
                  src={article.image}
                  alt={title}
                  className="w-full max-h-[720px] object-contain bg-[#F8F5EF]"
                />
              </div>

              <div className="rounded-3xl border border-[#D8D1C7] bg-[#FBF7F0] px-6 py-5 shadow-sm">
                <p className="text-sm leading-8 text-[#1E1E1E] sm:text-[1.05rem]">
                  {excerpt}
                </p>
              </div>

              <article className="rounded-3xl border border-[#D8D1C7] bg-white p-6 sm:p-8 shadow-sm">
                <MarkdownRenderer value={body} />
              </article>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-28">
              <div className="rounded-3xl border border-[#D8D1C7] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">
                      <Hash className="mr-1 inline h-3.5 w-3.5" />
                      {t('محتوى المقال الرئيسي', 'Main article content')}
                    </p>
                    <h2 className="mt-2 text-xl font-extrabold text-[#1E1E1E]">
                      {t('العناوين الرئيسية', 'Headings')}
                    </h2>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#E6DFD4] pt-4">
                  {headings.length > 0 ? (
                    <nav className="space-y-2 text-sm">
                      {headings.map((heading, index) => (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          className={`block rounded-xl px-3 py-2 transition-colors hover:bg-[#F8F5EF] ${
                            heading.level === 1 ? 'font-bold text-[#A56A1E]' : 'text-[#4B4B4B]'
                          } ${heading.level === 3 ? 'ps-6 text-xs' : ''}`}
                        >
                          {index + 1}. {heading.text}
                        </a>
                      ))}
                    </nav>
                  ) : (
                    <p className="text-sm leading-7 text-[#4B4B4B]">
                      {t('لا توجد عناوين فرعية داخل هذا المقال بعد.', 'No subheadings were added to this article yet.')}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-[#D8D1C7] bg-[#F8F5EF] p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">
                  {t('مدير / مؤلف المقال', 'Article author / manager')}
                </p>
                <h3 className="mt-2 text-2xl font-extrabold text-[#1E1E1E]">{author}</h3>
                <p className="mt-3 text-sm leading-7 text-[#4B4B4B]">
                  {language === 'ar'
                    ? 'محتوى قانوني وتحريري متخصص، مع إمكانية العودة للمقال أو حفظ الرابط للرجوع السريع إليه لاحقًا.'
                    : 'Specialized legal and editorial content, with a built-in option to save the link for quick return later.'}
                </p>
                <div className="mt-4 rounded-2xl border border-[#E6DFD4] bg-white p-4">
                  <p className="text-sm font-bold text-[#1E1E1E]">{authorTitle[language]}</p>
                  <p className="mt-1 text-sm text-[#4B4B4B]">{managerSummary[language]}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareCurrent}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#D8D1C7] bg-white px-4 py-3 text-sm font-bold text-[#1E1E1E] shadow-sm transition-colors hover:border-[#A56A1E]/40"
                >
                  <Copy className="h-4 w-4" />
                  {t('نسخ الرابط', 'Copy link')}
                </button>
                <button
                  onClick={saveForLater}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#D8D1C7] bg-white px-4 py-3 text-sm font-bold text-[#1E1E1E] shadow-sm transition-colors hover:border-[#A56A1E]/40"
                >
                  <Bookmark className="h-4 w-4" />
                  {t('حفظ المقالة للرجوع', 'Save for later')}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {relatedArticles.length > 0 && (
        <section className="border-y border-[#D8D1C7] bg-[#F8F5EF] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">
                {t('مقالات ذات صلة', 'Related articles')}
              </p>
              <h2 className="mt-2 text-3xl font-extrabold">{t('تابع القراءة', 'Keep reading')}</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedArticles.map((related) => (
                <button
                  key={related.slug}
                  onClick={() => onNavigateToArticle(related.slug)}
                  className="overflow-hidden rounded-2xl border border-[#D8D1C7] bg-white text-start transition-transform hover:-translate-y-1"
                >
                  <img src={related.image} alt={related.titleAr} className="aspect-video w-full object-cover" />
                  <div className="space-y-3 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A56A1E]">
                      {language === 'ar' ? related.categoryAr : related.categoryEn}
                    </p>
                    <h3 className="text-lg font-extrabold text-[#1E1E1E]">
                      {language === 'ar' ? related.titleAr : related.titleEn}
                    </h3>
                    <p className="text-sm text-[#4B4B4B] line-clamp-3">
                      {language === 'ar' ? related.excerptAr : related.excerptEn}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
