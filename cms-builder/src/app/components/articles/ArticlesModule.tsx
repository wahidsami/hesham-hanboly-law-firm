import { useEffect, useState } from 'react';
import type { Article, ArticleSummary } from '../../api/types';
import { backendApi } from '../../api/backend';
import { ArticlesIndex } from './ArticlesIndex';
import { ArticleEditor } from './ArticleEditor';

interface ArticlesModuleProps {
  lang: 'en' | 'ar';
  onCountChange?: (count: number) => void;
}

type View = { type: 'index' } | { type: 'editor'; articleId: string };

export function ArticlesModule({ lang, onCountChange }: ArticlesModuleProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [view, setView] = useState<View>({ type: 'index' });

  async function refresh() {
    const loaded = await backendApi.listArticles() as Article[];
    setArticles(loaded);
    onCountChange?.(loaded.length);
  }

  useEffect(() => {
    void refresh();
  }, []);

  function summaries(): ArticleSummary[] {
    return articles.map(({ bodyEn, bodyAr, ...rest }) => rest);
  }

  function createDraftArticle(titleEn: string, titleAr: string, slug: string): Article {
    const now = new Date().toISOString();
    return {
      id: slug.replace(/^\//, ''),
      slug,
      status: 'draft',
      titleEn,
      titleAr,
      excerptEn: 'Draft article excerpt',
      excerptAr: 'ملخص مبدئي للمقال',
      categoryEn: 'General',
      categoryAr: 'عام',
      authorEn: 'CMS Editor',
      authorAr: 'محرر النظام',
      readTimeEn: '1 min read',
      readTimeAr: '1 دقيقة قراءة',
      bodyEn: 'Draft article body',
      bodyAr: 'محتوى مبدئي للمقال',
      coverImageUrl: '',
      coverAltEn: titleEn,
      coverAltAr: titleAr,
      seoTitleEn: titleEn,
      seoTitleAr: titleAr,
      seoDescEn: 'Draft article description',
      seoDescAr: 'وصف مبدئي للمقال',
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
      author: 'CMS Editor',
    };
  }

  async function handleCreate(titleEn: string, titleAr: string, slug: string) {
    const draft = createDraftArticle(titleEn, titleAr, slug);
    const created = await backendApi.createArticle(draft);
    await refresh();
    setView({ type: 'editor', articleId: created.id });
  }

  async function handleSave(updated: Article) {
    await backendApi.saveArticle(updated);
    await refresh();
  }

  async function handlePublish(id: string) {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    await backendApi.saveArticle({ ...article, status: 'published', publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await refresh();
  }

  async function handleUnpublish(id: string) {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    await backendApi.saveArticle({ ...article, status: 'draft', publishedAt: null, updatedAt: new Date().toISOString() });
    await refresh();
  }

  async function handleArchive(id: string) {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    await backendApi.saveArticle({ ...article, status: 'draft', updatedAt: new Date().toISOString() });
    await refresh();
  }

  async function handleDuplicate(id: string) {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    const duplicateSlug = `${article.slug}-copy`;
    const duplicate = {
      ...article,
      id: duplicateSlug.replace(/^\//, ''),
      slug: duplicateSlug,
      status: 'draft' as const,
      publishedAt: null,
      updatedAt: new Date().toISOString(),
    };
    const created = await backendApi.createArticle(duplicate);
    await refresh();
    setView({ type: 'editor', articleId: created.id });
  }

  async function handleDelete(id: string) {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    await backendApi.deleteArticle(article.slug);
    await refresh();
    if (view.type === 'editor' && view.articleId === id) {
      setView({ type: 'index' });
    }
  }

  if (view.type === 'editor') {
    const article = articles.find(a => a.id === view.articleId);
    if (!article) return <div>Article not found.</div>;
    return (
      <ArticleEditor
        article={article}
        onBack={() => setView({ type: 'index' })}
        onSave={handleSave}
        onPublish={() => { void handlePublish(article.id); }}
        onUnpublish={() => { void handleUnpublish(article.id); }}
        initialLang={lang}
      />
    );
  }

  return (
    <ArticlesIndex
      articles={summaries()}
      lang={lang}
      onEdit={id => setView({ type: 'editor', articleId: id })}
      onCreate={handleCreate}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
      onArchive={handleArchive}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
    />
  );
}
