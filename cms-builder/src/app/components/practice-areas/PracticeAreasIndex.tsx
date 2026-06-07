import { useState, useMemo } from 'react';
import {
  Search, Plus, Filter, Eye, Edit3, Copy, Trash2,
  MoreHorizontal, Send, EyeOff, Archive,
  CheckSquare, Square, X, ChevronDown, ChevronUp,
  Briefcase, Scale, Building, Users, Globe,
  Shield, BookOpen, FileText, Landmark, Coins,
} from 'lucide-react';
import type { PracticeAreaSummary, PracticeAreaStatus } from '../../api/types';
import { PRACTICE_AREA_CATEGORIES } from '../../api/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATUS_CFG: Record<PracticeAreaStatus, { label: string; bg: string; color: string; dot: string }> = {
  published: { label: 'Published', bg: '#E6F4EA', color: '#1A7B3C', dot: '#2DA457' },
  draft:     { label: 'Draft',     bg: '#EEF0F4', color: '#4A5060', dot: '#8A90A0' },
  archived:  { label: 'Archived',  bg: '#FFF4E5', color: '#8C4A00', dot: '#D4860A' },
};

function StatusBadge({ status }: { status: PracticeAreaStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: cfg.bg, color: cfg.color, fontSize: 10, fontFamily: 'DM Mono, monospace', padding: '2px 7px', borderRadius: 10, fontWeight: 500, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase, Scale, Building, Users, Globe,
  Shield, BookOpen, FileText, Landmark, Coins,
};

function PracticeIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name] ?? Scale;
  return <Icon size={size} />;
}

// ─── Section completeness pill ────────────────────────────────────────────────

function SectionDots({ pa }: { pa: PracticeAreaSummary }) {
  const sections = [
    { key: 'title', done: !!pa.titleEn && !!pa.titleAr },
    { key: 'desc', done: !!pa.shortDescEn && !!pa.shortDescAr },
    { key: 'cover', done: !!pa.coverImageUrl },
    { key: 'seo', done: !!pa.seoTitleEn },
  ];
  const done = sections.filter(s => s.done).length;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }} title={`${done}/${sections.length} sections complete`}>
      {sections.map(s => (
        <span key={s.key} style={{ width: 6, height: 6, borderRadius: '50%', background: s.done ? '#2DA457' : 'var(--border)', display: 'inline-block' }} />
      ))}
      <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', marginLeft: 2 }}>{done}/{sections.length}</span>
    </div>
  );
}

// ─── Row menu ─────────────────────────────────────────────────────────────────

function RowMenu({ pa, onEdit, onDuplicate, onPublish, onUnpublish, onArchive, onDelete }: {
  pa: PracticeAreaSummary;
  onEdit: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  const item = (icon: React.ReactNode, label: string, action: () => void, danger = false) => (
    <button key={label} onClick={() => { action(); setOpen(false); }}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: danger ? '#B91C1C' : 'var(--foreground)', fontFamily: 'Inter, sans-serif', textAlign: 'left' }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 4, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 20, marginTop: 4, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 7, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 170, overflow: 'hidden' }}>
            {item(<Edit3 size={12} />, 'Edit', onEdit)}
            {item(<Eye size={12} />, 'Preview public page', () => window.open(`https://alrashid-law.com/practice-areas/${pa.slug}`, '_blank'))}
            {item(<Copy size={12} />, 'Duplicate', onDuplicate)}
            <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
            {pa.status !== 'published' && item(<Send size={12} />, 'Publish', onPublish)}
            {pa.status === 'published' && item(<EyeOff size={12} />, 'Unpublish', onUnpublish)}
            {pa.status !== 'archived' && item(<Archive size={12} />, 'Archive', onArchive)}
            <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
            {item(<Trash2 size={12} />, 'Delete', onDelete, true)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── New PA modal ─────────────────────────────────────────────────────────────

function NewPracticeAreaModal({ onConfirm, onClose }: {
  onConfirm: (titleEn: string, titleAr: string, slug: string) => void;
  onClose: () => void;
}) {
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  function handleTitle(v: string) {
    setTitleEn(v);
    if (!slugEdited) setSlug('/' + v.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'));
  }

  const iStyle: React.CSSProperties = { width: '100%', background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 5, padding: '8px 10px', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' };
  const lStyle: React.CSSProperties = { display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--card)', borderRadius: 10, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>New Practice Area</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={lStyle}>English Title *</label>
            <input style={iStyle} value={titleEn} onChange={e => handleTitle(e.target.value)} placeholder="e.g. Banking & Finance Law" autoFocus
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#C47F17'; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
            />
          </div>
          <div>
            <label style={lStyle}>Arabic Title *</label>
            <input style={{ ...iStyle, direction: 'rtl', fontFamily: 'serif' }} value={titleAr} onChange={e => setTitleAr(e.target.value)} placeholder="مثلاً: قانون البنوك والتمويل" dir="rtl"
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#C47F17'; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
            />
          </div>
          <div>
            <label style={lStyle}>URL Slug *</label>
            <input style={{ ...iStyle, fontFamily: 'DM Mono, monospace' }} value={slug}
              onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
              placeholder="/practice-area-slug"
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#C47F17'; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
            />
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 3 }}>alrashid-law.com/practice-areas{slug}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '8px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--input-background)', cursor: 'pointer', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
            <button onClick={() => titleEn.trim() && titleAr.trim() && slug.trim() && onConfirm(titleEn.trim(), titleAr.trim(), slug.trim())} disabled={!titleEn.trim() || !titleAr.trim() || !slug.trim()}
              style={{ flex: 1, padding: '8px', borderRadius: 5, border: 'none', background: titleEn.trim() && titleAr.trim() && slug.trim() ? 'var(--primary)' : 'var(--muted)', cursor: titleEn.trim() && titleAr.trim() && slug.trim() ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 600, color: titleEn.trim() && titleAr.trim() && slug.trim() ? '#fff' : 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}>
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
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>Delete practice area?</div>
        <p style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5, margin: '0 0 16px' }}>
          "<span style={{ color: 'var(--foreground)' }}>{title}</span>" will be permanently deleted.
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

export interface PracticeAreasIndexProps {
  areas: PracticeAreaSummary[];
  lang: 'en' | 'ar';
  onEdit: (id: string) => void;
  onCreate: (titleEn: string, titleAr: string, slug: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PracticeAreasIndex({ areas = [], lang, onEdit, onCreate, onPublish, onUnpublish, onArchive, onDuplicate, onDelete }: PracticeAreasIndexProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PracticeAreaStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showNewModal, setShowNewModal] = useState(false);
  const [deletingArea, setDeletingArea] = useState<PracticeAreaSummary | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<'order' | 'titleEn' | 'updatedAt'>('order');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: areas.length, published: 0, draft: 0, archived: 0 };
    areas.forEach(a => { c[a.status] = (c[a.status] || 0) + 1; });
    return c;
  }, [areas]);

  const filtered = useMemo(() => {
    let result = [...areas];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => a.titleEn.toLowerCase().includes(q) || a.titleAr.includes(search) || a.categoryEn.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter);
    if (categoryFilter !== 'all') result = result.filter(a => a.categoryEn === categoryFilter);
    result.sort((a, b) => {
      const va = String((a as any)[sortField] ?? '');
      const vb = String((b as any)[sortField] ?? '');
      return sortDir === 'asc' ? va.localeCompare(vb, undefined, { numeric: true }) : vb.localeCompare(va, undefined, { numeric: true });
    });
    return result;
  }, [areas, search, statusFilter, categoryFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const allPageSelected = paged.length > 0 && paged.every(a => selectedIds.has(a.id));
  const hasSelection = selectedIds.size > 0;
  const activeFilters = [statusFilter !== 'all', categoryFilter !== 'all'].filter(Boolean).length;

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function SortBtn({ field, label }: { field: typeof sortField; label: string }) {
    const active = sortField === field;
    return (
      <button onClick={() => { if (active) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortDir('asc'); } }}
        style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, color: active ? 'var(--primary)' : 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif', padding: '8px 12px' }}>
        {label}
        {active ? (sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : <ChevronDown size={10} style={{ opacity: 0.3 }} />}
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--card)', flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>Practice Areas</div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 1 }}>
            {areas.length} area{areas.length !== 1 ? 's' : ''} · {statusCounts.published} published · {statusCounts.draft} draft
          </div>
        </div>
        <button onClick={() => setShowNewModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 6, border: 'none', background: 'var(--primary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
          <Plus size={13} /> New Practice Area
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderBottom: '1px solid var(--border)', background: 'var(--card)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', flex: 1, maxWidth: 340 }}>
          <Search size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search practice areas…"
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif', flex: 1 }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex' }}><X size={11} /></button>}
        </div>

        <div style={{ display: 'flex', gap: 1, background: 'var(--muted)', borderRadius: 6, padding: 2 }}>
          {(['all', 'published', 'draft', 'archived'] as const).map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{ padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'Inter, sans-serif', background: statusFilter === s ? 'var(--card)' : 'transparent', color: statusFilter === s ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: statusFilter === s ? 600 : 400, boxShadow: statusFilter === s ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', textTransform: 'capitalize' }}>
              {s === 'all' ? 'All' : s}
              <span style={{ marginLeft: 4, fontSize: 9, fontFamily: 'DM Mono, monospace', opacity: 0.7 }}>{statusCounts[s] ?? 0}</span>
            </button>
          ))}
        </div>

        <button onClick={() => setShowFilters(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 5, border: `1px solid ${activeFilters > 0 ? 'var(--primary)' : 'var(--border)'}`, background: activeFilters > 0 ? 'rgba(196,127,23,0.08)' : 'var(--input-background)', cursor: 'pointer', fontSize: 11, color: activeFilters > 0 ? 'var(--primary)' : 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}>
          <Filter size={11} /> Filters {activeFilters > 0 && <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700 }}>{activeFilters}</span>}
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div style={{ display: 'flex', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--muted)', flexShrink: 0, alignItems: 'center' }}>
          <label style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</label>
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 11, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
            <option value="all">All categories</option>
            {PRACTICE_AREA_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {activeFilters > 0 && (
            <button onClick={() => { setCategoryFilter('all'); setPage(1); }}
              style={{ fontSize: 11, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}>
              Clear
            </button>
          )}
        </div>
      )}

      {/* Bulk bar */}
      {hasSelection && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 20px', background: 'rgba(196,127,23,0.07)', borderBottom: '1px solid rgba(196,127,23,0.2)', flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--primary)' }}>{selectedIds.size} selected</span>
          <button onClick={() => setSelectedIds(new Set())} style={{ fontSize: 11, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}>Clear</button>
          <div style={{ flex: 1 }} />
          <button onClick={() => { selectedIds.forEach(id => onPublish(id)); setSelectedIds(new Set()); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 5, border: '1px solid rgba(45,164,87,0.3)', background: 'rgba(45,164,87,0.08)', cursor: 'pointer', fontSize: 11, color: '#1A7B3C', fontFamily: 'Inter, sans-serif' }}>
            <Send size={10} /> Publish all
          </button>
          <button onClick={() => { const first = areas.find(a => selectedIds.has(a.id)); if (first) setDeletingArea(first); }}
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
              <Scale size={22} style={{ opacity: 0.4 }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)' }}>
              {search ? `No results for "${search}"` : 'No practice areas yet'}
            </div>
            <div style={{ fontSize: 12 }}>{search ? 'Try a different term.' : 'Create your first practice area.'}</div>
            {!search && (
              <button onClick={() => setShowNewModal(true)}
                style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: 'none', background: 'var(--primary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
                <Plus size={13} /> New Practice Area
              </button>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 36 }} />
              <col style={{ width: '38%' }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 44 }} />
            </colgroup>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 8px 8px 20px' }}>
                  <button onClick={allPageSelected ? () => setSelectedIds(new Set()) : () => setSelectedIds(new Set(paged.map(a => a.id)))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
                    {allPageSelected ? <CheckSquare size={14} style={{ color: 'var(--primary)' }} /> : <Square size={14} />}
                  </button>
                </th>
                <th style={{ textAlign: 'left' }}><SortBtn field="titleEn" label="Practice Area" /></th>
                <th style={{ textAlign: 'left' }}><SortBtn field="order" label="Status" /></th>
                <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>Category</th>
                <th style={{ textAlign: 'left' }}><SortBtn field="updatedAt" label="Updated" /></th>
                <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>Complete</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {paged.map((pa, i) => (
                <tr key={pa.id}
                  style={{ borderBottom: '1px solid var(--border)', background: selectedIds.has(pa.id) ? 'rgba(196,127,23,0.04)' : i % 2 === 0 ? 'var(--card)' : 'var(--background)', cursor: 'pointer', transition: 'background 0.1s' }}
                  onClick={() => onEdit(pa.id)}
                  onMouseEnter={e => { if (!selectedIds.has(pa.id)) (e.currentTarget as HTMLTableRowElement).style.background = 'var(--muted)'; }}
                  onMouseLeave={e => { if (!selectedIds.has(pa.id)) (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'var(--card)' : 'var(--background)'; }}
                >
                  <td style={{ padding: '10px 8px 10px 20px' }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => toggleSelect(pa.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
                      {selectedIds.has(pa.id) ? <CheckSquare size={14} style={{ color: 'var(--primary)' }} /> : <Square size={14} />}
                    </button>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--muted)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        {pa.coverImageUrl
                          ? <img src={pa.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                          : <PracticeIcon name={pa.iconName} size={15} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lang === 'en' ? pa.titleEn : (pa.titleAr || pa.titleEn)}
                        </div>
                        <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', marginTop: 1 }}>
                          /practice-areas{pa.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}><StatusBadge status={pa.status} /></td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                      {lang === 'en' ? pa.categoryEn : (pa.categoryAr || pa.categoryEn)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{relativeTime(pa.updatedAt)}</div>
                    <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', opacity: 0.7, marginTop: 1 }}>{pa.author}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}><SectionDots pa={pa} /></td>
                  <td style={{ padding: '10px 12px 10px 4px' }} onClick={e => e.stopPropagation()}>
                    <RowMenu pa={pa} onEdit={() => onEdit(pa.id)} onDuplicate={() => onDuplicate(pa.id)}
                      onPublish={() => onPublish(pa.id)} onUnpublish={() => onUnpublish(pa.id)}
                      onArchive={() => onArchive(pa.id)} onDelete={() => setDeletingArea(pa)} />
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
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--input-background)', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 11, color: 'var(--foreground)', opacity: page === 1 ? 0.4 : 1, fontFamily: 'Inter, sans-serif' }}>← Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--input-background)', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 11, color: 'var(--foreground)', opacity: page === totalPages ? 0.4 : 1, fontFamily: 'Inter, sans-serif' }}>Next →</button>
          </div>
        </div>
      )}

      {showNewModal && <NewPracticeAreaModal onConfirm={(titleEn, titleAr, slug) => { onCreate(titleEn, titleAr, slug); setShowNewModal(false); }} onClose={() => setShowNewModal(false)} />}
      {deletingArea && <DeleteConfirm title={deletingArea.titleEn} onConfirm={() => { onDelete(deletingArea.id); setDeletingArea(null); setSelectedIds(new Set()); }} onClose={() => setDeletingArea(null)} />}
    </div>
  );
}
