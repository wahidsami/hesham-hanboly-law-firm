import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, Search, Grid, List, X, Check, Trash2, Edit3,
  Image as ImageIcon, FileText, Video, ExternalLink,
  AlertCircle, ChevronDown,
} from 'lucide-react';
import { backendApi } from '../api/backend';
import type { ApiAsset } from '../api/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  image: ImageIcon, document: FileText, video: Video,
};

const TYPE_LABELS: Record<string, string> = {
  image: 'Image', document: 'Document', video: 'Video',
};

// ─── Asset card ───────────────────────────────────────────────────────────────

function AssetCard({ asset, selected, onSelect, onEdit }: {
  asset: ApiAsset;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}) {
  const isImage = asset.type === 'image';

  return (
    <div
      onClick={onSelect}
      style={{
        background: 'var(--card)',
        border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: selected ? '0 0 0 3px rgba(196,127,23,0.15)' : 'none',
        position: 'relative',
      }}
    >
      {/* Thumbnail */}
      <div style={{ aspectRatio: '16/9', background: 'var(--muted)', position: 'relative', overflow: 'hidden' }}>
        {isImage ? (
          <img
            src={asset.thumbnailUrl}
            alt={asset.altEn || asset.filename}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            {(() => { const Icon = TYPE_ICONS[asset.type] || FileText; return <Icon size={32} style={{ color: 'var(--muted-foreground)' }} />; })()}
          </div>
        )}

        {/* Selection check */}
        <div
          style={{
            position: 'absolute', top: 6, left: 6,
            width: 20, height: 20, borderRadius: '50%',
            background: selected ? 'var(--primary)' : 'rgba(255,255,255,0.8)',
            border: `2px solid ${selected ? 'var(--primary)' : 'rgba(0,0,0,0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          {selected && <Check size={11} strokeWidth={3} style={{ color: '#fff' }} />}
        </div>

        {/* Usage badge */}
        {asset.usedInPages.length > 0 && (
          <div
            style={{
              position: 'absolute', bottom: 6, right: 6,
              background: 'rgba(0,0,0,0.65)', borderRadius: 4,
              padding: '2px 6px', fontSize: 9,
              color: '#fff', fontFamily: 'DM Mono, monospace', letterSpacing: '0.04em',
            }}
          >
            {asset.usedInPages.length} page{asset.usedInPages.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '8px 10px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {asset.filename}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 }}>
          <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace' }}>
            {formatBytes(asset.sizeBytes)}
            {asset.width ? ` · ${asset.width}×${asset.height}` : ''}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
              color: 'var(--muted-foreground)', borderRadius: 3, display: 'flex', alignItems: 'center',
            }}
            title="Edit metadata"
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}
          >
            <Edit3 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Asset row (list view) ────────────────────────────────────────────────────

function AssetRow({ asset, selected, onSelect, onEdit }: {
  asset: ApiAsset;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}) {
  const Icon = TYPE_ICONS[asset.type] || FileText;

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 12px',
        background: selected ? 'rgba(196,127,23,0.06)' : 'transparent',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'var(--muted)'; }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      {/* Checkbox */}
      <div
        style={{
          width: 16, height: 16, borderRadius: 3, flexShrink: 0,
          background: selected ? 'var(--primary)' : 'transparent',
          border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {selected && <Check size={10} strokeWidth={3} style={{ color: '#fff' }} />}
      </div>

      {/* Thumbnail or icon */}
      <div style={{ width: 40, height: 28, flexShrink: 0, borderRadius: 4, overflow: 'hidden', background: 'var(--muted)' }}>
        {asset.type === 'image'
          ? <img src={asset.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Icon size={14} style={{ color: 'var(--muted-foreground)' }} /></div>
        }
      </div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {asset.filename}
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace' }}>
          {asset.altEn || <span style={{ opacity: 0.5 }}>No alt text</span>}
        </div>
      </div>

      {/* Size */}
      <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', width: 70, textAlign: 'right', flexShrink: 0 }}>
        {formatBytes(asset.sizeBytes)}
      </span>

      {/* Date */}
      <span style={{ fontSize: 10, color: 'var(--muted-foreground)', width: 90, textAlign: 'right', flexShrink: 0 }}>
        {formatDate(asset.uploadedAt)}
      </span>

      {/* Usage */}
      <span style={{ fontSize: 10, color: 'var(--muted-foreground)', width: 60, textAlign: 'right', flexShrink: 0 }}>
        {asset.usedInPages.length > 0 ? `${asset.usedInPages.length} page${asset.usedInPages.length !== 1 ? 's' : ''}` : '—'}
      </span>

      {/* Edit */}
      <button
        onClick={e => { e.stopPropagation(); onEdit(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: 'var(--muted-foreground)', borderRadius: 3, flexShrink: 0 }}
        title="Edit"
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}
      >
        <Edit3 size={12} />
      </button>
    </div>
  );
}

// ─── Upload dropzone ──────────────────────────────────────────────────────────

function UploadZone({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFilesSelected(files);
  }, [onFilesSelected]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 8,
        padding: '28px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        cursor: 'pointer',
        background: dragging ? 'rgba(196,127,23,0.04)' : 'var(--muted)',
        transition: 'border-color 0.15s, background 0.15s',
        textAlign: 'center',
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <Upload size={18} style={{ color: 'var(--primary)' }} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)' }}>
          {dragging ? 'Drop to upload' : 'Click or drag files here'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>
          PNG, JPG, GIF, PDF, MP4 — max 20 MB each
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={e => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFilesSelected(files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditModal({ asset, onSave, onDelete, onClose }: {
  asset: ApiAsset;
  onSave: (patch: Partial<Pick<ApiAsset, 'altEn' | 'altAr' | 'filename'>>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [filename, setFilename] = useState(asset.filename);
  const [altEn, setAltEn] = useState(asset.altEn);
  const [altAr, setAltAr] = useState(asset.altAr);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--input-background)', border: '1px solid var(--border)',
    borderRadius: 5, padding: '7px 10px', fontSize: 12, color: 'var(--foreground)',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
    outline: 'none',
  };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', marginBottom: 4, display: 'block' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--card)', borderRadius: 10, width: 440, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>Edit Asset</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Preview */}
        {asset.type === 'image' && (
          <div style={{ height: 160, background: 'var(--muted)', overflow: 'hidden' }}>
            <img src={asset.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        )}

        {/* Fields */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>Filename</label>
            <input style={inputStyle} value={filename} onChange={e => setFilename(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Alt text (English)</label>
            <input style={inputStyle} value={altEn} onChange={e => setAltEn(e.target.value)} placeholder="Describe the image in English" />
          </div>
          <div>
            <label style={labelStyle}>Alt text (Arabic)</label>
            <input style={{ ...inputStyle, direction: 'rtl', fontFamily: 'serif' }} value={altAr} onChange={e => setAltAr(e.target.value)} placeholder="صف الصورة بالعربية" dir="rtl" />
          </div>

          {/* File info */}
          <div style={{ background: 'var(--muted)', borderRadius: 6, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              ['Size', formatBytes(asset.sizeBytes)],
              ['Uploaded', `${formatDate(asset.uploadedAt)} by ${asset.uploadedBy}`],
              ['Used in', asset.usedInPages.length > 0 ? `${asset.usedInPages.length} page(s)` : 'Not used'],
              ...(asset.width ? [['Dimensions', `${asset.width} × ${asset.height}px`]] : []),
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{k}</span>
                <span style={{ fontSize: 10, color: 'var(--foreground)', fontFamily: 'DM Mono, monospace' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* External link */}
          <a href={asset.url} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--primary)', textDecoration: 'none' }}
          >
            <ExternalLink size={11} /> View original
          </a>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
          {confirmDelete ? (
            <>
              <span style={{ flex: 1, fontSize: 11, color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={12} /> Confirm delete?
              </span>
              <button onClick={() => setConfirmDelete(false)} style={{ padding: '7px 14px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--input-background)', cursor: 'pointer', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif' }}>
                Cancel
              </button>
              <button onClick={onDelete} style={{ padding: '7px 14px', borderRadius: 5, border: 'none', background: '#B91C1C', cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setConfirmDelete(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', borderRadius: 5, border: '1px solid rgba(185,28,28,0.3)', background: 'rgba(185,28,28,0.06)', cursor: 'pointer', fontSize: 12, color: '#B91C1C', fontFamily: 'Inter, sans-serif' }}
              >
                <Trash2 size={12} /> Delete
              </button>
              <div style={{ flex: 1 }} />
              <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--input-background)', cursor: 'pointer', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif' }}>
                Cancel
              </button>
              <button
                onClick={() => { onSave({ filename, altEn, altAr }); onClose(); }}
                style={{ padding: '7px 14px', borderRadius: 5, border: 'none', background: 'var(--primary)', cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Upload progress item ─────────────────────────────────────────────────────

interface UploadJob { id: string; filename: string; progress: number; done: boolean; error?: string; }

// ─── Main component ───────────────────────────────────────────────────────────

interface MediaLibraryProps {
  lang?: 'en' | 'ar';
}

export function MediaLibrary({ lang = 'en' }: MediaLibraryProps) {
  const [assets, setAssets] = useState<ApiAsset[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'document' | 'video'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingAsset, setEditingAsset] = useState<ApiAsset | null>(null);
  const [uploadJobs, setUploadJobs] = useState<UploadJob[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const loaded = await backendApi.listAssets();
        if (!cancelled) {
          setAssets(loaded);
        }
      } catch {
        if (!cancelled) {
          setAssets([]);
        }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  // Derived
  const filtered = assets.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.filename.toLowerCase().includes(q) || a.altEn.toLowerCase().includes(q) || a.altAr.includes(search);
    }
    return true;
  });

  const hasSelection = selectedIds.size > 0;

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(filtered.map(a => a.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleDeleteSelected() {
    for (const id of selectedIds) {
      await backendApi.deleteAsset(id);
    }
    setAssets(prev => prev.filter(a => !selectedIds.has(a.id)));
    setSelectedIds(new Set());
  }

  async function handleEdit(patch: Partial<Pick<ApiAsset, 'altEn' | 'altAr' | 'filename'>>) {
    if (!editingAsset) return;
    const data = await backendApi.saveAsset(editingAsset.id, patch);
    setAssets(prev => prev.map(a => a.id === data.id ? data : a));
  }

  async function handleDelete() {
    if (!editingAsset) return;
    await backendApi.deleteAsset(editingAsset.id);
    setAssets(prev => prev.filter(a => a.id !== editingAsset.id));
    setEditingAsset(null);
  }

  async function handleFilesSelected(files: File[]) {
    const jobs: UploadJob[] = files.map(f => ({ id: `job-${Date.now()}-${f.name}`, filename: f.name, progress: 0, done: false }));
    setUploadJobs(prev => [...jobs, ...prev]);

    for (const job of jobs) {
      // Simulate progress
      const intervals = [20, 45, 70, 90];
      for (const pct of intervals) {
        await new Promise(r => setTimeout(r, 150));
        setUploadJobs(prev => prev.map(j => j.id === job.id ? { ...j, progress: pct } : j));
      }

      try {
        const file = files.find(f => f.name === job.filename)!;
        const asset = await backendApi.uploadAsset(file);
        setAssets(prev => [asset, ...prev]);
        setUploadJobs(prev => prev.map(j => j.id === job.id ? { ...j, progress: 100, done: true } : j));
      } catch {
        setUploadJobs(prev => prev.map(j => j.id === job.id ? { ...j, error: 'Upload failed', done: true } : j));
      }
    }

    // Clear done jobs after a delay
    setTimeout(() => setUploadJobs(prev => prev.filter(j => !j.done)), 3000);
  }

  const totalSize = assets.reduce((sum, a) => sum + a.sizeBytes, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Inter, sans-serif' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
        borderBottom: '1px solid var(--border)', background: 'var(--card)', flexShrink: 0,
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', flex: 1, maxWidth: 320 }}>
          <Search size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets…"
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif', flex: 1 }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
              <X size={11} />
            </button>
          )}
        </div>

        {/* Type filter */}
        <div style={{ display: 'flex', gap: 2 }}>
          {(['all', 'image', 'document', 'video'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 11,
                background: typeFilter === t ? 'var(--primary)' : 'var(--muted)',
                color: typeFilter === t ? '#fff' : 'var(--muted-foreground)',
                fontFamily: 'Inter, sans-serif', fontWeight: typeFilter === t ? 600 : 400,
                transition: 'all 0.15s', textTransform: 'capitalize',
              }}
            >
              {t === 'all' ? `All (${assets.length})` : `${TYPE_LABELS[t]}s`}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Stats */}
        <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace' }}>
          {filtered.length} asset{filtered.length !== 1 ? 's' : ''} · {formatBytes(totalSize)} total
        </span>

        {/* View toggle */}
        <div style={{ display: 'flex', background: 'var(--muted)', borderRadius: 5, padding: 2, gap: 1 }}>
          {([['grid', Grid], ['list', List]] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                display: 'flex', alignItems: 'center', padding: '4px 7px', borderRadius: 4, border: 'none', cursor: 'pointer',
                background: viewMode === mode ? 'var(--card)' : 'transparent',
                color: viewMode === mode ? 'var(--foreground)' : 'var(--muted-foreground)',
                boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Icon size={13} />
            </button>
          ))}
        </div>
      </div>

      {/* Selection bar */}
      {hasSelection && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px',
          background: 'rgba(196,127,23,0.08)', borderBottom: '1px solid rgba(196,127,23,0.2)', flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--primary)' }}>
            {selectedIds.size} selected
          </span>
          <button onClick={clearSelection} style={{ fontSize: 11, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Clear
          </button>
          <button onClick={selectAll} style={{ fontSize: 11, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Select all ({filtered.length})
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleDeleteSelected}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 5, border: '1px solid rgba(185,28,28,0.3)', background: 'rgba(185,28,28,0.06)', cursor: 'pointer', fontSize: 11, color: '#B91C1C', fontFamily: 'Inter, sans-serif' }}
          >
            <Trash2 size={11} /> Delete {selectedIds.size} asset{selectedIds.size !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Upload jobs */}
      {uploadJobs.length > 0 && (
        <div style={{ padding: '8px 16px', background: 'var(--card)', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {uploadJobs.map(job => (
            <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, background: 'var(--muted)', borderRadius: 4, overflow: 'hidden', height: 4 }}>
                <div style={{ width: `${job.progress}%`, height: '100%', background: job.error ? '#B91C1C' : 'var(--primary)', transition: 'width 0.15s' }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {job.filename}
              </span>
              {job.done && !job.error && <Check size={12} style={{ color: '#2DA457', flexShrink: 0 }} />}
              {job.error && <AlertCircle size={12} style={{ color: '#B91C1C', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      )}

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Upload dropzone */}
        <div style={{ marginBottom: 16 }}>
          <UploadZone onFilesSelected={handleFilesSelected} />
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12, color: 'var(--muted-foreground)' }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon size={22} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)' }}>
              {search ? `No assets matching "${search}"` : 'No assets yet'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
              {search ? 'Try a different search term.' : 'Upload images, PDFs, or videos above.'}
            </div>
          </div>
        )}

        {/* Grid or list */}
        {filtered.length > 0 && viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {filtered.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                selected={selectedIds.has(asset.id)}
                onSelect={() => toggleSelect(asset.id)}
                onEdit={() => setEditingAsset(asset)}
              />
            ))}
          </div>
        )}

        {filtered.length > 0 && viewMode === 'list' && (
          <div style={{ background: 'var(--card)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {/* List header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 12px', background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 16 }} />
              <div style={{ width: 40 }} />
              <span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', width: 70, textAlign: 'right' }}>Size</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', width: 90, textAlign: 'right' }}>Uploaded</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', width: 60, textAlign: 'right' }}>Usage</span>
              <div style={{ width: 22 }} />
            </div>
            {filtered.map(asset => (
              <AssetRow
                key={asset.id}
                asset={asset}
                selected={selectedIds.has(asset.id)}
                onSelect={() => toggleSelect(asset.id)}
                onEdit={() => setEditingAsset(asset)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingAsset && (
        <EditModal
          asset={editingAsset}
          onSave={handleEdit}
          onDelete={handleDelete}
          onClose={() => setEditingAsset(null)}
        />
      )}
    </div>
  );
}
