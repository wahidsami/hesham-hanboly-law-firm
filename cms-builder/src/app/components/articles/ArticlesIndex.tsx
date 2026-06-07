import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Plus, Filter, ChevronDown, ChevronUp,
  Eye, Edit3, Copy, Trash2, MoreHorizontal, Send,
  EyeOff, Archive, CheckSquare, Square, X,
  Clock, Globe, Calendar,
} from 'lucide-react';
import type { ArticleSummary, ArticleStatus } from '../../api/types';
import { ARTICLE_CATEGORIES } from '../../api/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATUS_CFG: Record<ArticleStatus, { label: string; bg: string; color: string; dot: string }> = {
  published: { label: 'Published', bg: '#E6F4EA', color: '#1A7B3C', dot: '#2DA457' },
  draft:     { label: 'Draft',     bg: '#EEF0F4', color: '#4A5060', dot: '#8A90A0' },
  archived:  { label: 'Archived',  bg: '#FFF4E5', color: '#8C4A00', dot: '#D4860A' },
};

function StatusBadge({ status }: { status: ArticleStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: cfg.bg, color: cfg.color, fontSize: 10, fontFamily: 'DM Mono, monospace', padding: '2px 7px', borderRadius: 10, fontWeight: 500, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ─── Row overflow menu ────────────────────────────────────────────────────────

function RowMenu({ article, onEdit, onPreview, onPublish, onUnpublish, onArchive, onDuplicate, onDelete }: {
  article: ArticleSummary;
  onEdit: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const menuItem = (icon: React.ReactNode, label: string, action: () => void, danger = false) => (
    <button
      key={label}
      onClick={() => { action(); setOpen(false); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px',
        background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
        color: danger ? '#B91C1C' : 'var(--foreground)',
        fontFamily: 'Inter, sans-serif', textAlign: 'left',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={e => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          setMenuPosition({ top: rect.top, left: rect.right - 4 });
          setOpen(v => !v);
        }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 4, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        createPortal(
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 999 }}
              onClick={() => setOpen(false)}
            />
            <div
              style={{
                position: 'fixed',
                zIndex: 1000,
                top: menuPosition?.top ?? 0,
                left: menuPosition?.left ?? 0,
                transform: 'translate(-100%, 0)',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 7,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                minWidth: 170,
                overflow: 'hidden',
              }}
            >
              {menuItem(<Edit3 size={12} />, 'Edit', onEdit)}
              {menuItem(<Eye size={12} />, 'Preview', onPreview)}
              {menuItem(<Copy size={12} />, 'Duplicate', onDuplicate)}
              <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
              {article.status !== 'published' && menuItem(<Send size={12} />, 'Publish', onPublish)}
              {article.status === 'published' && menuItem(<EyeOff size={12} />, 'Unpublish', onUnpublish)}
              {article.status !== 'archived' && menuItem(<Archive size={12} />, 'Archive', onArchive)}
              <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
              {menuItem(<Trash2 size={12} />, 'Delete', onDelete, true)}
            </div>
          </>,
          document.body,
        )
      )}
    </div>
  );
}

// ─── New article modal ────────────────────────────────────────────────────────

function NewArticleModal({ onConfirm, onClose }: {
  onConfirm: (titleEn: string, titleAr: string, slug: string) => void;
  onClose: () => void;
}) {
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  function deriveSlug(title: string) {
    return '/' + title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  }

  function handleTitleChange(v: string) {
    setTitleEn(v);
    if (!slugEdited) setSlug(deriveSlug(v));
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--input-background)', border: '1px solid var(--border)',
    borderRadius: 5, padding: '8px 10px', fontSize: 12, color: 'var(--foreground)',
    fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--card)', borderRadius: 10, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>New Article</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>English Title *</label>
            <input style={inputStyle} value={titleEn} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. UAE Corporate Law Update 2026" autoFocus
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#C47F17'; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Arabic Title *</label>
            <input style={{ ...inputStyle, direction: 'rtl', fontFamily: 'serif' }} value={titleAr} onChange={e => setTitleAr(e.target.value)} placeholder="مثلاً: تحديث قانون الشركات الإماراتي 2026" dir="rtl"
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#C47F17'; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
            />
          </div>
          <div>
            <label style={labelStyle}>URL Slug *</label>
            <input style={{ ...inputStyle, fontFamily: 'DM Mono, monospace' }} value={slug}
              onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
              placeholder="/article-slug"
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#C47F17'; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
            />
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 3 }}>
              alrashid-law.com/news{slug}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '8px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--input-background)', cursor: 'pointer', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif' }}>
              Cancel
            </button>
            <button
              onClick={() => titleEn.trim() && titleAr.trim() && slug.trim() && onConfirm(titleEn.trim(), titleAr.trim(), slug.trim())}
              disabled={!titleEn.trim() || !titleAr.trim() || !slug.trim()}
              style={{ flex: 1, padding: '8px', borderRadius: 5, border: 'none', background: titleEn.trim() && titleAr.trim() && slug.trim() ? 'var(--primary)' : 'var(--muted)', cursor: titleEn.trim() && titleAr.trim() && slug.trim() ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 600, color: titleEn.trim() && titleAr.trim() && slug.trim() ? '#fff' : 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}
            >
              Create &amp; Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ title, onConfirm, onClose }: { title: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--card)', borderRadius: 10, width: 380, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>Delete article?</div>
        <p style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5, margin: '0 0 16px' }}>
          "<span style={{ color: 'var(--foreground)' }}>{title}</span>" will be permanently deleted and cannot be recovered.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '8px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--input-background)', cursor: 'pointer', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '8px', borderRadius: 5, border: 'none', background: '#B91C1C', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface ArticlesIndexProps {
  articles: ArticleSummary[];
  lang: 'en' | 'ar';
  onEdit: (id: string) => void;
  onCreate: (titleEn: string, titleAr: string, slug: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

type SortField = 'updatedAt' | 'publishedAt' | 'titleEn' | 'categoryEn';
type SortDir = 'asc' | 'desc';

export function ArticlesIndex({ articles = [], lang, onEdit, onCreate, onPublish, onUnpublish, onArchive, onDuplicate, onDelete }: ArticlesIndexProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [showNewModal, setShowNewModal] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState<ArticleSummary | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const PER_PAGE = 10;

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...articles];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.titleEn.toLowerCase().includes(q) ||
        a.titleAr.includes(search) ||
        a.slug.toLowerCase().includes(q) ||
        a.authorEn.toLowerCase().includes(q) ||
        a.categoryEn.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter);
    if (categoryFilter !== 'all') result = result.filter(a => a.categoryEn === categoryFilter);
    if (dateFilter !== 'all') {
      const now = Date.now();
      const cutoff = dateFilter === 'today' ? 86400000 : dateFilter === 'week' ? 7 * 86400000 : 30 * 86400000;
      result = result.filter(a => now - new Date(a.updatedAt).getTime() <= cutoff);
    }
    result.sort((a, b) => {
      const va = (a as any)[sortField] || '';
      const vb = (b as any)[sortField] || '';
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return result;
  }, [articles, search, statusFilter, categoryFilter, dateFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Counts for filter badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: articles.length, published: 0, draft: 0, archived: 0 };
    articles.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return counts;
  }, [articles]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronDown size={10} style={{ opacity: 0.3 }} />;
    return sortDir === 'desc' ? <ChevronDown size={10} style={{ color: 'var(--primary)' }} /> : <ChevronUp size={10} style={{ color: 'var(--primary)' }} />;
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function selectPage() {
    setSelectedIds(new Set(paged.map(a => a.id)));
  }

  function clearSelection() { setSelectedIds(new Set()); }

  const hasSelection = selectedIds.size > 0;
  const allPageSelected = paged.length > 0 && paged.every(a => selectedIds.has(a.id));

  const activeFilters = [statusFilter !== 'all', categoryFilter !== 'all', dateFilter !== 'all'].filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Inter, sans-serif' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--card)', flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>Articles</div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 1 }}>
            {articles.length} article{articles.length !== 1 ? 's' : ''} · {statusCounts.published} published · {statusCounts.draft} draft
          </div>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 6, border: 'none', background: 'var(--primary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }}
        >
          <Plus size={13} /> New Article
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderBottom: '1px solid var(--border)', background: 'var(--card)', flexShrink: 0 }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', flex: 1, maxWidth: 360 }}>
          <Search size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search articles…"
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif', flex: 1 }}
          />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex' }}><X size={11} /></button>}
        </div>

        {/* Status quick filter tabs */}
        <div style={{ display: 'flex', gap: 1, background: 'var(--muted)', borderRadius: 6, padding: 2 }}>
          {(['all', 'published', 'draft', 'archived'] as const).map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{ padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'Inter, sans-serif',
                background: statusFilter === s ? 'var(--card)' : 'transparent',
                color: statusFilter === s ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: statusFilter === s ? 600 : 400,
                boxShadow: statusFilter === s ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                textTransform: 'capitalize',
              }}
            >
              {s === 'all' ? `All` : s}
              <span style={{ marginLeft: 4, fontSize: 9, fontFamily: 'DM Mono, monospace', opacity: 0.7 }}>
                {statusCounts[s] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 5, border: `1px solid ${activeFilters > 0 ? 'var(--primary)' : 'var(--border)'}`, background: activeFilters > 0 ? 'rgba(196,127,23,0.08)' : 'var(--input-background)', cursor: 'pointer', fontSize: 11, color: activeFilters > 0 ? 'var(--primary)' : 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}
        >
          <Filter size={11} /> Filters {activeFilters > 0 && <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700 }}>{activeFilters}</span>}
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div style={{ display: 'flex', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--muted)', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Category */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</label>
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 11, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
            >
              <option value="all">All categories</option>
              {ARTICLE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Date range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Updated</label>
            <div style={{ display: 'flex', gap: 1, background: 'var(--card)', borderRadius: 4, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {(['all', 'today', 'week', 'month'] as const).map(d => (
                <button key={d} onClick={() => { setDateFilter(d); setPage(1); }}
                  style={{ padding: '4px 9px', border: 'none', cursor: 'pointer', fontSize: 10, background: dateFilter === d ? 'var(--primary)' : 'transparent', color: dateFilter === d ? '#fff' : 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}
                >
                  {d === 'all' ? 'Any time' : d === 'today' ? 'Today' : d === 'week' ? 'This week' : 'This month'}
                </button>
              ))}
            </div>
          </div>

          {activeFilters > 0 && (
            <button onClick={() => { setCategoryFilter('all'); setDateFilter('all'); setPage(1); }}
              style={{ fontSize: 11, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Bulk action bar */}
      {hasSelection && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 20px', background: 'rgba(196,127,23,0.07)', borderBottom: '1px solid rgba(196,127,23,0.2)', flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--primary)' }}>{selectedIds.size} selected</span>
          <button onClick={clearSelection} style={{ fontSize: 11, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}>Clear</button>
          <button onClick={selectPage} style={{ fontSize: 11, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}>Select page</button>
          <div style={{ flex: 1 }} />
          <button onClick={() => { selectedIds.forEach(id => onPublish(id)); clearSelection(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 5, border: '1px solid rgba(45,164,87,0.3)', background: 'rgba(45,164,87,0.08)', cursor: 'pointer', fontSize: 11, color: '#1A7B3C', fontFamily: 'Inter, sans-serif' }}>
            <Send size={10} /> Publish all
          </button>
          <button onClick={() => { selectedIds.forEach(id => onArchive(id)); clearSelection(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--input-background)', cursor: 'pointer', fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}>
            <Archive size={10} /> Archive all
          </button>
          <button onClick={() => { selectedIds.forEach(id => { const a = articles.find(a => a.id === id); if (a) setDeletingArticle(a); }); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 5, border: '1px solid rgba(185,28,28,0.3)', background: 'rgba(185,28,28,0.06)', cursor: 'pointer', fontSize: 11, color: '#B91C1C', fontFamily: 'Inter, sans-serif' }}>
            <Trash2 size={10} /> Delete
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12, color: 'var(--muted-foreground)' }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={22} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)' }}>
              {search ? `No articles matching "${search}"` : 'No articles'}
            </div>
            <div style={{ fontSize: 12 }}>
              {search ? 'Try a different search term or clear the filters.' : 'Create your first article to get started.'}
            </div>
            {!search && (
              <button onClick={() => setShowNewModal(true)}
                style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: 'none', background: 'var(--primary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
                <Plus size={13} /> New Article
              </button>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 36 }} />
              <col style={{ width: '40%' }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 44 }} />
            </colgroup>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 8px 8px 20px' }}>
                  <button onClick={allPageSelected ? clearSelection : selectPage}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
                    {allPageSelected ? <CheckSquare size={14} style={{ color: 'var(--primary)' }} /> : <Square size={14} />}
                  </button>
                </th>
                {[
                  { label: 'Title', field: 'titleEn' as SortField },
                  { label: 'Status', field: null },
                  { label: 'Category', field: 'categoryEn' as SortField },
                  { label: 'Updated', field: 'updatedAt' as SortField },
                  { label: 'Published', field: 'publishedAt' as SortField },
                  { label: '', field: null },
                ].map(col => (
                  <th key={col.label}
                    onClick={col.field ? () => toggleSort(col.field!) : undefined}
                    style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', cursor: col.field ? 'pointer' : 'default', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {col.label}
                      {col.field && <SortIcon field={col.field} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((article, i) => (
                <tr key={article.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: selectedIds.has(article.id) ? 'rgba(196,127,23,0.04)' : i % 2 === 0 ? 'var(--card)' : 'var(--background)',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onClick={() => onEdit(article.id)}
                  onMouseEnter={e => { if (!selectedIds.has(article.id)) (e.currentTarget as HTMLTableRowElement).style.background = 'var(--muted)'; }}
                  onMouseLeave={e => { if (!selectedIds.has(article.id)) (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'var(--card)' : 'var(--background)'; }}
                >
                  {/* Checkbox */}
                  <td style={{ padding: '10px 8px 10px 20px' }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => toggleSelect(article.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
                      {selectedIds.has(article.id)
                        ? <CheckSquare size={14} style={{ color: 'var(--primary)' }} />
                        : <Square size={14} />}
                    </button>
                  </td>

                  {/* Title */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      {article.coverImageUrl && (
                        <div style={{ width: 44, height: 30, flexShrink: 0, borderRadius: 4, overflow: 'hidden', background: 'var(--muted)' }}>
                          <img src={article.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lang === 'en' ? article.titleEn : (article.titleAr || article.titleEn)}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {article.slug}
                        </div>
                        {article.titleAr && lang === 'en' && (
                          <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'rtl', textAlign: 'right' }}>
                            {article.titleAr}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '10px 12px' }}>
                    <StatusBadge status={article.status} />
                  </td>

                  {/* Category */}
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                      {lang === 'en' ? article.categoryEn : (article.categoryAr || article.categoryEn)}
                    </span>
                  </td>

                  {/* Updated */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--muted-foreground)' }}>
                      <Clock size={10} />
                      {relativeTime(article.updatedAt)}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', marginTop: 1, opacity: 0.7 }}>{article.authorEn}</div>
                  </td>

                  {/* Published */}
                  <td style={{ padding: '10px 12px' }}>
                    {article.publishedAt ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--muted-foreground)' }}>
                        <Calendar size={10} />
                        {formatDate(article.publishedAt)}
                      </div>
                    ) : (
                      <span style={{ fontSize: 10, color: 'var(--muted-foreground)', opacity: 0.5 }}>—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '10px 12px 10px 4px' }} onClick={e => e.stopPropagation()}>
                    <RowMenu
                      article={article}
                      onEdit={() => onEdit(article.id)}
                      onPreview={() => window.open(`https://alrashid-law.com/news${article.slug}`, '_blank')}
                      onPublish={() => onPublish(article.id)}
                      onUnpublish={() => onUnpublish(article.id)}
                      onArchive={() => onArchive(article.id)}
                      onDuplicate={() => onDuplicate(article.id)}
                      onDelete={() => setDeletingArticle(article)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderTop: '1px solid var(--border)', background: 'var(--card)', flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
            {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--input-background)', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 11, color: page === 1 ? 'var(--muted-foreground)' : 'var(--foreground)', opacity: page === 1 ? 0.4 : 1, fontFamily: 'Inter, sans-serif' }}>
              ← Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 30, height: 28, borderRadius: 4, border: page === p ? 'none' : '1px solid var(--border)', background: page === p ? 'var(--primary)' : 'var(--input-background)', cursor: 'pointer', fontSize: 11, color: page === p ? '#fff' : 'var(--foreground)', fontWeight: page === p ? 600 : 400, fontFamily: 'Inter, sans-serif' }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--input-background)', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 11, color: page === totalPages ? 'var(--muted-foreground)' : 'var(--foreground)', opacity: page === totalPages ? 0.4 : 1, fontFamily: 'Inter, sans-serif' }}>
              Next →
            </button>
          </div>
        </div>
      )}

      {/* New article modal */}
      {showNewModal && (
        <NewArticleModal
          onConfirm={(titleEn, titleAr, slug) => { onCreate(titleEn, titleAr, slug); setShowNewModal(false); }}
          onClose={() => setShowNewModal(false)}
        />
      )}

      {/* Delete confirm */}
      {deletingArticle && (
        <DeleteConfirm
          title={deletingArticle.titleEn}
          onConfirm={() => { onDelete(deletingArticle.id); setDeletingArticle(null); clearSelection(); }}
          onClose={() => setDeletingArticle(null)}
        />
      )}
    </div>
  );
}
