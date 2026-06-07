import { useEffect, useState } from 'react';
import type { PracticeArea, PracticeAreaSummary } from '../../api/types';
import { backendApi } from '../../api/backend';
import { PracticeAreasIndex } from './PracticeAreasIndex';
import { PracticeAreaEditor } from './PracticeAreaEditor';

interface PracticeAreasModuleProps {
  lang: 'en' | 'ar';
  onCountChange?: (count: number) => void;
}

type View = { type: 'index' } | { type: 'editor'; practiceAreaId: string };

export function PracticeAreasModule({ lang, onCountChange }: PracticeAreasModuleProps) {
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [view, setView] = useState<View>({ type: 'index' });

  async function refresh() {
    const loaded = await backendApi.listPracticeAreas();
    setPracticeAreas(loaded);
    onCountChange?.(loaded.length);
  }

  useEffect(() => {
    void refresh();
  }, []);

  function summaries(): PracticeAreaSummary[] {
    return practiceAreas.map(({ about, features, steps, useCases, faqs, ...rest }) => rest);
  }

  function createDraftPracticeArea(titleEn: string, titleAr: string, slug: string): PracticeArea {
    const now = new Date().toISOString();
    return {
      id: slug.replace(/^\//, ''),
      slug,
      status: 'draft',
      order: practiceAreas.length + 1,
      titleEn,
      titleAr,
      categoryEn: 'Advisory',
      categoryAr: 'استشارات',
      shortDescEn: 'Draft practice area description',
      shortDescAr: 'وصف مبدئي لمجال الممارسة',
      coverImageUrl: '',
      coverAltEn: titleEn,
      coverAltAr: titleAr,
      iconName: 'Scale',
      about: {
        bodyEn: 'Draft practice area about text',
        bodyAr: 'محتوى مبدئي لمجال الممارسة',
      },
      features: [
        { id: `${slug}-feature-1`, titleEn: 'Draft feature', titleAr: 'ميزة مبدئية', descriptionEn: 'Draft description', descriptionAr: 'وصف مبدئي', icon: 'CheckCircle' },
      ],
      steps: [
        { id: `${slug}-step-1`, number: 1, titleEn: 'Draft step', titleAr: 'خطوة مبدئية', descriptionEn: 'Draft step description', descriptionAr: 'وصف مبدئي للخطوة' },
      ],
      useCases: [
        { id: `${slug}-usecase-1`, titleEn: 'Draft use case', titleAr: 'حالة مبدئية', summaryEn: 'Draft use case summary', summaryAr: 'ملخص مبدئي', industryEn: 'General', industryAr: 'عام' },
      ],
      faqs: [
        { id: `${slug}-faq-1`, questionEn: 'Draft question?', questionAr: 'سؤال مبدئي؟', answerEn: 'Draft answer.', answerAr: 'إجابة مبدئية.' },
      ],
      seoTitleEn: titleEn,
      seoTitleAr: titleAr,
      seoDescEn: 'Draft practice area description',
      seoDescAr: 'وصف مبدئي لمجال الممارسة',
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
      author: 'CMS Editor',
    };
  }

  async function handleCreate(titleEn: string, titleAr: string, slug: string) {
    const draft = createDraftPracticeArea(titleEn, titleAr, slug);
    const created = await backendApi.createPracticeArea(draft);
    await refresh();
    setView({ type: 'editor', practiceAreaId: created.id });
  }

  async function handleSave(updated: PracticeArea) {
    await backendApi.savePracticeArea(updated);
    await refresh();
  }

  async function handlePublish(id: string) {
    const pa = practiceAreas.find(p => p.id === id);
    if (!pa) return;
    await backendApi.savePracticeArea({ ...pa, status: 'published', publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await refresh();
  }

  async function handleUnpublish(id: string) {
    const pa = practiceAreas.find(p => p.id === id);
    if (!pa) return;
    await backendApi.savePracticeArea({ ...pa, status: 'draft', publishedAt: null, updatedAt: new Date().toISOString() });
    await refresh();
  }

  async function handleArchive(id: string) {
    const pa = practiceAreas.find(p => p.id === id);
    if (!pa) return;
    await backendApi.savePracticeArea({ ...pa, status: 'draft', updatedAt: new Date().toISOString() });
    await refresh();
  }

  async function handleDuplicate(id: string) {
    const pa = practiceAreas.find(p => p.id === id);
    if (!pa) return;
    const duplicateSlug = `${pa.slug}-copy`;
    const duplicate = { ...pa, id: duplicateSlug.replace(/^\//, ''), slug: duplicateSlug, status: 'draft' as const, publishedAt: null, updatedAt: new Date().toISOString() };
    const created = await backendApi.createPracticeArea(duplicate);
    await refresh();
    setView({ type: 'editor', practiceAreaId: created.id });
  }

  async function handleDelete(id: string) {
    const pa = practiceAreas.find(p => p.id === id);
    if (!pa) return;
    await backendApi.deletePracticeArea(pa.slug);
    await refresh();
    if (view.type === 'editor' && view.practiceAreaId === id) {
      setView({ type: 'index' });
    }
  }

  if (view.type === 'editor') {
    const pa = practiceAreas.find(p => p.id === view.practiceAreaId);
    if (!pa) return <div>Practice area not found.</div>;
    return (
      <PracticeAreaEditor
        pa={pa}
        onBack={() => setView({ type: 'index' })}
        onSave={handleSave}
        onPublish={() => handlePublish(pa.id)}
        onUnpublish={() => handleUnpublish(pa.id)}
        initialLang={lang}
      />
    );
  }

  return (
    <PracticeAreasIndex
      areas={summaries()}
      lang={lang}
      onEdit={id => setView({ type: 'editor', practiceAreaId: id })}
      onCreate={handleCreate}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
      onArchive={handleArchive}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
    />
  );
}
