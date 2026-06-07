import { useEffect, useState, useCallback, useRef } from 'react';
import { ArrowLeft, Globe, Eye, Check, Loader2 } from 'lucide-react';
import type { BuilderPage, Block, BlockType, Lang } from './types';
import { backendApi } from '../../api/backend';
import { makeBlock } from './defaultData';
import { LeftPanel } from './LeftPanel';
import { CenterCanvas, type Viewport } from './CenterCanvas';
import { RightPanel } from './RightPanel';
import { BlockLibraryModal } from './BlockLibraryModal';
import { HomePageEditor } from './HomePageEditor';

interface PageBuilderProps {
  onBack: () => void;
  initialLang?: Lang;
  initialPages?: BuilderPage[];
  initialSelectedPageId?: string | null;
}

export function PageBuilder({ onBack, initialLang = 'en', initialPages, initialSelectedPageId }: PageBuilderProps) {
  const seedPages = initialPages && initialPages.length > 0
    ? initialPages
    : [{
        id: 'page-untitled',
        titleEn: 'Untitled Page',
        titleAr: 'صفحة بلا عنوان',
        slug: '/untitled',
        status: 'draft' as const,
        navVisible: false,
        seoTitleEn: '',
        seoTitleAr: '',
        seoDescEn: '',
        seoDescAr: '',
        blocks: [],
      }];
  const [pages, setPages] = useState<BuilderPage[]>(seedPages);
  const [persistedPageIds, setPersistedPageIds] = useState<Set<string>>(new Set(seedPages.map((page) => page.id)));
  const [selectedPageId, setSelectedPageId] = useState(initialSelectedPageId ?? seedPages[0].id);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>(initialLang);
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);

  // Preview mode
  const [previewMode, setPreviewMode] = useState(false);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autosaveTimerRef = useRef<number | null>(null);
  const hydratedPageIdsRef = useRef<Set<string>>(new Set());

  // Save confirmation flash
  const [saved, setSaved] = useState(false);

  const selectedPage = pages.find(p => p.id === selectedPageId)!;
  const blocks = selectedPage.blocks;
  const selectedBlock = blocks.find(b => b.id === selectedBlockId) ?? null;
  const isPersistedPage = persistedPageIds.has(selectedPage.id);
  const isHomepage = ['/', 'home'].includes(selectedPage.slug) || selectedPage.titleEn.toLowerCase() === 'home';
  const normalizedPageSlug = selectedPage.slug.replace(/^\/+/, '').toLowerCase();

  const pageShortcuts = (() => {
    if (normalizedPageSlug === 'about') {
      return [
        { label: 'Hero copy', note: 'Use Home → Homepage settings', action: () => setSelectedPageId(pages.find((page) => page.slug === '/' || page.slug === 'home')?.id || selectedPageId) },
        { label: 'Company section', type: 'image-text' as BlockType },
        { label: 'Goals section', type: 'cards' as BlockType },
        { label: 'CTA section', type: 'cta' as BlockType },
      ];
    }
    if (normalizedPageSlug === 'team') {
      return [
        { label: 'Hero copy', note: 'Use Home → Homepage settings', action: () => setSelectedPageId(pages.find((page) => page.slug === '/' || page.slug === 'home')?.id || selectedPageId) },
        { label: 'Leadership section', type: 'team' as BlockType },
        { label: 'Intro section', type: 'rich-text' as BlockType },
        { label: 'CTA section', type: 'cta' as BlockType },
      ];
    }
    if (normalizedPageSlug === 'contact') {
      return [
        { label: 'Hero copy', note: 'Use Home → Homepage settings', action: () => setSelectedPageId(pages.find((page) => page.slug === '/' || page.slug === 'home')?.id || selectedPageId) },
        { label: 'Offices section', type: 'contact' as BlockType },
        { label: 'FAQ section', type: 'faq' as BlockType },
        { label: 'CTA section', type: 'cta' as BlockType },
      ];
    }
    return [];
  })();

  useEffect(() => {
    if (!selectedPage) {
      return;
    }

    if (selectedPage.blocks.length > 0) {
      hydratedPageIdsRef.current.add(selectedPage.id);
      return;
    }

    if (hydratedPageIdsRef.current.has(selectedPage.id)) {
      return;
    }

    let cancelled = false;

    async function hydratePageBlocks() {
      try {
        const revisions = await backendApi.listRevisions(selectedPage.slug);
        const latestRevision = revisions[0];
        if (!latestRevision || !Array.isArray(latestRevision.blocks) || latestRevision.blocks.length === 0 || cancelled) {
          return;
        }

        const hydratedBlocks = latestRevision.blocks
          .slice()
          .sort((left, right) => (left.order || 0) - (right.order || 0))
          .map((block) => ({
            id: block.id,
            type: block.type,
            collapsed: false,
            data: { ...block.data },
          }));

        hydratedPageIdsRef.current.add(selectedPage.id);
        setPages((prev) => prev.map((page) => (
          page.id === selectedPage.id
            ? { ...page, blocks: hydratedBlocks }
            : page
        )));
        setSelectedBlockId((current) => current || hydratedBlocks[0]?.id || null);
      } catch {
        // Keep the current in-memory editor state if the revision fetch fails.
      }
    }

    void hydratePageBlocks();

    return () => {
      cancelled = true;
    };
  }, [selectedPage?.id, selectedPage?.slug, selectedPage?.blocks.length]);

  // ── Page mutations ──────────────────────────────────────────────────────────
  function updatePage(id: string, patch: Partial<BuilderPage>) {
    setHasUnsavedChanges(true);
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  }

  async function persistPage(page: BuilderPage) {
    setIsAutoSaving(true);
    try {
      const saved = persistedPageIds.has(page.id)
        ? await backendApi.savePage({
            id: page.id,
            titleEn: page.titleEn,
            titleAr: page.titleAr,
            slug: page.slug,
            status: page.status,
            navVisible: page.navVisible,
            seoTitleEn: page.seoTitleEn,
            seoTitleAr: page.seoTitleAr,
            seoDescEn: page.seoDescEn,
            seoDescAr: page.seoDescAr,
            blocks: page.blocks.map((block, index) => ({
              id: block.id,
              type: block.type,
              order: index + 1,
              data: block.data,
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: page.status === 'published' ? new Date().toISOString() : null,
            author: 'CMS Editor',
          })
        : await backendApi.createPage({
            titleEn: page.titleEn,
            titleAr: page.titleAr,
            slug: page.slug,
            status: page.status,
            navVisible: page.navVisible,
            seoTitleEn: page.seoTitleEn,
            seoTitleAr: page.seoTitleAr,
            seoDescEn: page.seoDescEn,
            seoDescAr: page.seoDescAr,
            blocks: page.blocks.map((block, index) => ({
              id: block.id,
              type: block.type,
              order: index + 1,
              data: block.data,
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: page.status === 'published' ? new Date().toISOString() : null,
            author: 'CMS Editor',
          } as never);

      setPersistedPageIds((current) => new Set(current).add(saved.id));
      setPages((current) =>
        current.map((item) =>
          item.id === page.id
            ? {
                id: saved.id,
                titleEn: saved.titleEn,
                titleAr: saved.titleAr,
                slug: saved.slug,
                status: saved.status,
                navVisible: saved.navVisible,
                seoTitleEn: saved.seoTitleEn,
                seoTitleAr: saved.seoTitleAr,
                seoDescEn: saved.seoDescEn,
                seoDescAr: saved.seoDescAr,
                blocks: page.blocks,
              }
            : item
        )
      );
      setHasUnsavedChanges(false);
      return saved;
    } finally {
      setIsAutoSaving(false);
    }
  }

  async function newPage() {
    const slug = `/untitled-${Date.now()}`;
    const created = await backendApi.createPage({
      titleEn: 'Untitled Page',
      titleAr: 'صفحة بلا عنوان',
      slug,
      status: 'draft',
      navVisible: false,
      seoTitleEn: '',
      seoTitleAr: '',
      seoDescEn: '',
      seoDescAr: '',
      blocksCount: 0,
      blocks: [] as never,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: null,
      author: 'CMS Editor',
    } as never);
    const newP: BuilderPage = {
      id: created.id,
      titleEn: created.titleEn,
      titleAr: created.titleAr,
      slug: created.slug,
      status: created.status,
      navVisible: created.navVisible,
      seoTitleEn: created.seoTitleEn,
      seoTitleAr: created.seoTitleAr,
      seoDescEn: created.seoDescEn,
      seoDescAr: created.seoDescAr,
      blocks: [],
    };
    setPersistedPageIds((current) => new Set(current).add(created.id));
    setPages((prev) => [...prev, newP]);
    setSelectedPageId(created.id);
    setSelectedBlockId(null);
  }

  // ── Block mutations ─────────────────────────────────────────────────────────
  function addBlock(type: BlockType) {
    const block = makeBlock(type);
    updatePage(selectedPageId, { blocks: [...blocks, block] });
    setHasUnsavedChanges(true);
    setSelectedBlockId(block.id);
  }

  function focusOrAddBlock(type: BlockType) {
    const existing = blocks.find((block) => block.type === type);
    if (existing) {
      setSelectedBlockId(existing.id);
      return;
    }
    addBlock(type);
  }

  function deleteBlock(id: string) {
    updatePage(selectedPageId, { blocks: blocks.filter(b => b.id !== id) });
    setHasUnsavedChanges(true);
    if (selectedBlockId === id) setSelectedBlockId(null);
  }

  function duplicateBlock(id: string) {
    const src = blocks.find(b => b.id === id);
    if (!src) return;
    const copy: Block = { ...src, id: `${src.id}-copy-${Date.now()}`, data: { ...src.data } };
    const idx = blocks.findIndex(b => b.id === id);
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    updatePage(selectedPageId, { blocks: next });
    setHasUnsavedChanges(true);
    setSelectedBlockId(copy.id);
  }

  function toggleCollapse(id: string) {
    updatePage(selectedPageId, {
      blocks: blocks.map(b => b.id === id ? { ...b, collapsed: !b.collapsed } : b),
    });
    setHasUnsavedChanges(true);
  }

  const moveBlock = useCallback(
    (fromIndex: number, toIndex: number) => {
      setPages(prev =>
        prev.map(p => {
          if (p.id !== selectedPageId) return p;
          const next = [...p.blocks];
          const [removed] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, removed);
          setHasUnsavedChanges(true);
          return { ...p, blocks: next };
        })
      );
    },
    [selectedPageId]
  );

  function updateBlockData(id: string, data: Record<string, unknown>) {
    setHasUnsavedChanges(true);
    updatePage(selectedPageId, {
      blocks: blocks.map(b => b.id === id ? { ...b, data } : b),
    });
  }

  // ── Publishing actions ──────────────────────────────────────────────────────
  async function handleSaveDraft() {
    const currentPage = selectedPage;
    await persistPage(currentPage);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    await backendApi.saveRevision(selectedPage.slug, {
      label: `Draft saved — ${new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`,
      status: selectedPage.status,
      blocks: JSON.parse(JSON.stringify(selectedPage.blocks)),
      author: 'CMS Editor',
      note: 'Draft saved',
    });
  }

  function handlePublish() {
    updatePage(selectedPageId, { status: 'published' });
    setHasUnsavedChanges(true);
    void persistPage({ ...selectedPage, status: 'published' });
  }

  function handleUnpublish() {
    updatePage(selectedPageId, { status: 'draft' });
    setHasUnsavedChanges(true);
    void persistPage({ ...selectedPage, status: 'draft' });
  }

  function handlePreview() {
    setPreviewMode(true);
    setSelectedBlockId(null);
  }

  function handleExitPreview() {
    setPreviewMode(false);
  }

  useEffect(() => {
    if (previewMode || !hasUnsavedChanges) {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      if (!hasUnsavedChanges) {
        setIsAutoSaving(false);
      }
      return;
    }

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      if (selectedPage) {
        void persistPage(selectedPage);
      }
      autosaveTimerRef.current = null;
    }, 1200);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [hasUnsavedChanges, previewMode, selectedPage, persistPage]);

  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif', background: 'var(--background)' }}
    >
      {/* Builder header */}
      <header
        style={{
          height: 48,
          background: previewMode ? '#0D0E14' : 'var(--sidebar)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          flexShrink: 0,
          transition: 'background 0.2s',
        }}
      >
        <button
          onClick={previewMode ? handleExitPreview : onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 5, cursor: 'pointer', padding: '5px 10px',
            color: 'rgba(224,224,232,0.6)', fontFamily: 'Inter, sans-serif', fontSize: 12,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(224,224,232,0.6)'; }}
        >
          <ArrowLeft size={13} />
          {previewMode ? 'Exit Preview' : 'Back to CMS'}
        </button>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
              {lang === 'ar' ? selectedPage.titleAr : selectedPage.titleEn}
            </span>
            <span
              style={{
                fontSize: 9, fontFamily: 'DM Mono, monospace', padding: '2px 6px', borderRadius: 3,
                color: selectedPage.status === 'published' ? '#2DA457' : 'rgba(255,255,255,0.4)',
                background: selectedPage.status === 'published' ? 'rgba(45,164,87,0.15)' : 'rgba(255,255,255,0.08)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              {selectedPage.status}
            </span>
            <span
              style={{
                fontSize: 9,
                fontFamily: 'DM Mono, monospace',
                padding: '2px 6px',
                borderRadius: 3,
                color: isPersistedPage ? '#2DA457' : '#D4860A',
                background: isPersistedPage ? 'rgba(45,164,87,0.15)' : 'rgba(212,134,10,0.12)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {isPersistedPage ? 'CMS SAVED' : 'LOCAL DRAFT'}
            </span>
            {hasUnsavedChanges && (
              <span
                style={{
                  fontSize: 9,
                  fontFamily: 'DM Mono, monospace',
                  padding: '2px 6px',
                  borderRadius: 3,
                  color: '#D4860A',
                  background: 'rgba(212,134,10,0.12)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                UNSAVED CHANGES
              </span>
            )}
            {isAutoSaving && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 9,
                  fontFamily: 'DM Mono, monospace',
                  padding: '2px 6px',
                  borderRadius: 3,
                  color: '#5FA8FF',
                  background: 'rgba(95,168,255,0.12)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                <Loader2 size={10} style={{ animation: 'spin 0.9s linear infinite' }} />
                AUTO-SAVING
              </span>
            )}
            {previewMode && (
              <span style={{ fontSize: 10, color: '#2DA457', fontFamily: 'DM Mono, monospace', background: 'rgba(45,164,87,0.12)', padding: '2px 8px', borderRadius: 20, letterSpacing: '0.06em' }}>
                PREVIEW MODE
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Lang toggle */}
            <button
              onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 5, cursor: 'pointer', padding: '5px 10px',
                color: '#fff', fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 600,
              }}
            >
              <Globe size={12} />
              {lang.toUpperCase()}
            </button>

            {!previewMode && (
              <>
                {/* Preview button */}
                <button
                  onClick={handlePreview}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 5, cursor: 'pointer', padding: '5px 10px',
                    color: 'rgba(224,224,232,0.8)', fontFamily: 'Inter, sans-serif', fontSize: 12,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(224,224,232,0.8)'; }}
                >
                  <Eye size={13} />
                  Preview
                </button>

                {/* Save */}
                <button
                  onClick={handleSaveDraft}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: saved ? 'rgba(45,164,87,0.2)' : hasUnsavedChanges ? 'var(--sidebar-primary)' : 'rgba(255,255,255,0.12)',
                    border: 'none', borderRadius: 5, cursor: 'pointer', padding: '5px 14px',
                    color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                    transition: 'background 0.2s',
                  }}
                >
                  {saved ? <><Check size={13} /> Saved</> : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                </button>
              </>
            )}
          </div>
        </header>

      {/* Three-panel body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left panel — hidden in preview mode */}
        {!previewMode && (
          <LeftPanel
            pages={pages}
            selectedPageId={selectedPageId}
            onSelectPage={id => { setSelectedPageId(id); setSelectedBlockId(null); }}
            onNewPage={newPage}
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onMoveBlock={moveBlock}
            onToggleCollapse={toggleCollapse}
          onDuplicateBlock={duplicateBlock}
          onDeleteBlock={deleteBlock}
          onAddBlock={() => setShowBlockLibrary(true)}
          lang={lang}
          allowBlockEditing={!isHomepage}
          />
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {pageShortcuts.length > 0 && !previewMode && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px 12px', borderBottom: '1px solid var(--border)', background: 'var(--card)', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Quick sections
              </span>
              {pageShortcuts.map((shortcut) => (
                <button
                  key={shortcut.label}
                  type="button"
                  onClick={() => {
                    if ('action' in shortcut && shortcut.action) {
                      shortcut.action();
                      return;
                    }
                    if ('type' in shortcut && shortcut.type) {
                      focusOrAddBlock(shortcut.type);
                    }
                  }}
                  className="rounded-full border border-[#D8D1C7] bg-[#FBF7F0] px-3 py-2 text-xs font-semibold text-[#1E1E1E]"
                  title={shortcut.note}
                >
                  {shortcut.label}
                </button>
              ))}
            </div>
          )}

          {isHomepage ? (
            <HomePageEditor
              pageTitle={lang === 'ar' ? selectedPage.titleAr : selectedPage.titleEn}
              pageSlug={selectedPage.slug}
              lang={lang}
            />
          ) : (
            <CenterCanvas
              blocks={blocks}
              lang={lang}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              pageTitle={lang === 'ar' ? selectedPage.titleAr : selectedPage.titleEn}
              pageSlug={selectedPage.slug}
              previewMode={previewMode}
              viewport={viewport}
              onViewportChange={setViewport}
              onExitPreview={handleExitPreview}
            />
          )}
        </div>

        {/* Right panel — hidden in preview mode */}
        {!previewMode && (
          <RightPanel
            page={selectedPage}
            selectedBlock={selectedBlock}
            onUpdatePage={patch => updatePage(selectedPageId, patch)}
            onUpdateBlock={updateBlockData}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onPreview={handlePreview}
            onRestore={(blocks, status) => updatePage(selectedPageId, { blocks, status })}
          />
        )}
      </div>

      {showBlockLibrary && (
        <BlockLibraryModal
          onAdd={addBlock}
          onClose={() => setShowBlockLibrary(false)}
        />
      )}
    </div>
  );
}
