import { useEffect, useState } from 'react';
import {
  ArrowLeft, Globe, Check, Save, Send, EyeOff, AlertCircle,
  AlertTriangle, Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  Eye, X,
} from 'lucide-react';
import { backendApi } from '../../api/backend';
import type {
  PracticeArea, PracticeAreaStatus, PracticeFeature,
  PracticeStep, PracticeUseCase, PracticeFAQ,
} from '../../api/types';
import { PRACTICE_AREA_CATEGORIES } from '../../api/types';
import { ImageAssetPicker } from '../shared/ImageAssetPicker';

type Lang = 'en' | 'ar';

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Shared form atoms ────────────────────────────────────────────────────────

function Field({ label, value, onChange, multiline, mono, rtl, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; mono?: boolean; rtl?: boolean; placeholder?: string; required?: boolean;
}) {
  const empty = required && !value.trim();
  const base: React.CSSProperties = {
    width: '100%', background: 'var(--input-background)',
    border: `1px solid ${empty ? '#D97706' : 'transparent'}`,
    borderRadius: 5, fontSize: 12, color: 'var(--foreground)',
    fontFamily: mono ? 'DM Mono, monospace' : rtl ? 'serif' : 'Inter, sans-serif',
    resize: 'vertical', padding: '8px 10px',
    direction: rtl ? 'rtl' : 'ltr', boxSizing: 'border-box', outline: 'none',
    transition: 'border-color 0.15s',
  };
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <label style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
        {required && <span style={{ fontSize: 8, color: empty ? '#D97706' : '#aaa', fontFamily: 'DM Mono, monospace' }}>req</span>}
        {empty && <AlertTriangle size={9} style={{ color: '#D97706' }} />}
      </div>
      {multiline
        ? <textarea value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={{ ...base, minHeight: 72 }}
            onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#C47F17'; }}
            onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = empty ? '#D97706' : 'transparent'; }}
          />
        : <input value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={base}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#C47F17'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = empty ? '#D97706' : 'transparent'; }}
          />}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 0 8px', borderBottom: '1px solid var(--border)', marginBottom: 14 }}>{label}</div>;
}

function LangTabs({ lang, onSet }: { lang: Lang; onSet: (l: Lang) => void }) {
  return (
    <div style={{ display: 'flex', background: 'var(--muted)', borderRadius: 5, padding: 2, marginBottom: 16 }}>
      {(['en', 'ar'] as Lang[]).map(l => (
        <button key={l} onClick={() => onSet(l)}
          style={{ flex: 1, padding: '5px 0', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontFamily: 'DM Mono, monospace', fontWeight: 600, background: lang === l ? '#fff' : 'transparent', color: lang === l ? 'var(--foreground)' : 'var(--muted-foreground)', boxShadow: lang === l ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
          {l === 'en' ? '🇬🇧 EN' : '🇸🇦 AR'}
        </button>
      ))}
    </div>
  );
}

// ─── Cover image uploader (inline) ───────────────────────────────────────────

function CoverUploader({ url, onUrlChange, altEn, onAltEn, altAr, onAltAr }: {
  url: string; onUrlChange: (v: string) => void;
  altEn: string; onAltEn: (v: string) => void;
  altAr: string; onAltAr: (v: string) => void;
}) {
  const [urlInput, setUrlInput] = useState(url);
  const [showAlt, setShowAlt] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const iStyle: React.CSSProperties = { width: '100%', background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 5, padding: '7px 10px', fontSize: 12, color: 'var(--foreground)', fontFamily: 'DM Mono, monospace', outline: 'none', boxSizing: 'border-box' };

  useEffect(() => {
    setUrlInput(url);
  }, [url]);

  async function uploadAndUse(file: File) {
    try {
      setUploading(true);
      const asset = await backendApi.uploadAsset(file, altEn.trim(), altAr.trim());
      onUrlChange(asset.url);
      onAltEn(asset.altEn || altEn);
      onAltAr(asset.altAr || altAr);
      setUrlInput(asset.url);
    } catch (error) {
      console.error('Practice area cover upload failed', error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {url ? (
        <div style={{ position: 'relative', borderRadius: 7, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={url} alt={altEn} style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block', background: 'var(--muted)' }} />
          </div>
          <button onClick={() => { onUrlChange(''); setUrlInput(''); }}
            style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <X size={11} />
          </button>
        </div>
      ) : (
        <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={async e => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) await uploadAndUse(file); }}
          onClick={() => document.getElementById('pa-cover-input')?.click()}
          style={{ height: 90, border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 7, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer', background: 'var(--muted)', marginBottom: 10, opacity: uploading ? 0.7 : 1, pointerEvents: uploading ? 'none' : 'auto' }}>
          <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{uploading ? 'Uploading…' : 'Drop or click to upload'}</span>
        </div>
      )}
      <input
        id="pa-cover-input"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={async e => { const f = e.target.files?.[0]; if (f) await uploadAndUse(f); e.target.value = ''; }}
      />
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <button
          onClick={() => document.getElementById('pa-cover-input')?.click()}
          style={{ padding: '7px 10px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--card)', cursor: 'pointer', fontSize: 11, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
        >
          Upload new image
        </button>
        <button
          onClick={() => setShowPicker(true)}
          style={{ padding: '7px 10px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--card)', cursor: 'pointer', fontSize: 11, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
        >
          Choose from media library
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <input value={urlInput} onChange={e => setUrlInput(e.target.value)} onBlur={() => onUrlChange(urlInput)} placeholder="Or paste URL…" style={iStyle} />
        {urlInput !== url && <button onClick={() => onUrlChange(urlInput)} style={{ padding: '7px 10px', borderRadius: 5, border: 'none', background: 'var(--primary)', cursor: 'pointer', fontSize: 11, color: '#fff', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>Apply</button>}
      </div>
      <button onClick={() => setShowAlt(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif', padding: '2px 0', marginBottom: showAlt ? 8 : 0 }}>
        {showAlt ? <ChevronUp size={10} /> : <ChevronDown size={10} />} Alt text
      </button>
      {showAlt && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label style={{ display: 'block', fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alt EN</label>
            <input value={altEn} onChange={e => onAltEn(e.target.value)} style={iStyle} placeholder="Describe image in English" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alt AR</label>
            <input value={altAr} onChange={e => onAltAr(e.target.value)} style={{ ...iStyle, direction: 'rtl', fontFamily: 'serif' }} dir="rtl" placeholder="صف الصورة بالعربية" />
          </div>
        </div>
      )}

      <ImageAssetPicker
        open={showPicker}
        title="Choose cover image"
        initialAltEn={altEn}
        initialAltAr={altAr}
        initialUrl={url}
        onClose={() => setShowPicker(false)}
        onSelect={(asset, nextAltEn, nextAltAr) => {
          onUrlChange(asset.url);
          onAltEn(nextAltEn);
          onAltAr(nextAltAr);
          setUrlInput(asset.url);
        }}
      />
    </div>
  );
}

// ─── Markdown editor (simple) ─────────────────────────────────────────────────

function MdEditor({ value, onChange, rtl, placeholder }: { value: string; onChange: (v: string) => void; rtl?: boolean; placeholder?: string }) {
  const [preview, setPreview] = useState(false);
  function renderMd(md: string): string {
    return md
      .replace(/^## (.+)$/gm, '<h2 style="font-size:15px;font-weight:700;margin:16px 0 6px;color:var(--foreground)">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:600;margin:12px 0 4px;color:var(--foreground)">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li style="margin:3px 0">$1</li>')
      .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul style="margin:8px 0 8px 18px;list-style:disc">${m}</ul>`)
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  }
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)' }}>Markdown · {words} words</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setPreview(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)', background: preview ? 'var(--card)' : 'transparent', cursor: 'pointer', fontSize: 10, color: preview ? 'var(--foreground)' : 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}>
          <Eye size={10} /> {preview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {preview
        ? <div style={{ minHeight: 180, padding: '12px 14px', fontSize: 12, lineHeight: 1.7, color: 'var(--foreground)', background: 'var(--card)', direction: rtl ? 'rtl' : 'ltr', fontFamily: rtl ? 'serif' : 'Inter, sans-serif' }}
            dangerouslySetInnerHTML={{ __html: value ? renderMd(value) : '<span style="color:var(--muted-foreground);font-style:italic">Nothing to preview.</span>' }} />
        : <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ display: 'block', width: '100%', minHeight: 180, padding: '12px 14px', border: 'none', background: 'var(--card)', outline: 'none', resize: 'vertical', fontSize: 11, fontFamily: rtl ? 'serif' : 'DM Mono, monospace', color: 'var(--foreground)', direction: rtl ? 'rtl' : 'ltr', lineHeight: 1.7, boxSizing: 'border-box' }} />
      }
    </div>
  );
}

// ─── Features section ─────────────────────────────────────────────────────────

function FeaturesSection({ items, onChange, lang }: { items: PracticeFeature[]; onChange: (v: PracticeFeature[]) => void; lang: Lang }) {
  function addItem() {
    onChange([...items, { id: uid(), titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '', icon: 'CheckCircle' }]);
  }
  function removeItem(id: string) { onChange(items.filter(i => i.id !== id)); }
  function updateItem(id: string, patch: Partial<PracticeFeature>) {
    onChange(items.map(i => i.id === id ? { ...i, ...patch } : i));
  }
  function moveItem(idx: number, dir: -1 | 1) {
    const next = [...items];
    const [removed] = next.splice(idx, 1);
    next.splice(idx + dir, 0, removed);
    onChange(next);
  }

  return (
    <div>
      {items.map((item, idx) => (
        <div key={item.id} style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 7, padding: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <GripVertical size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', flex: 1 }}>Feature {idx + 1}</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {idx > 0 && <button onClick={() => moveItem(idx, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '2px 3px', display: 'flex' }}><ChevronUp size={11} /></button>}
              {idx < items.length - 1 && <button onClick={() => moveItem(idx, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '2px 3px', display: 'flex' }}><ChevronDown size={11} /></button>}
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '2px 3px', display: 'flex' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#B91C1C'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}>
                <Trash2 size={11} />
              </button>
            </div>
          </div>
          {lang === 'en' ? (
            <>
              <Field label="Title (EN)" value={item.titleEn} onChange={v => updateItem(item.id, { titleEn: v })} required placeholder="e.g. Company Formation" />
              <Field label="Description (EN)" value={item.descriptionEn} onChange={v => updateItem(item.id, { descriptionEn: v })} multiline placeholder="Brief feature description…" />
            </>
          ) : (
            <>
              <Field label="Title (AR)" value={item.titleAr} onChange={v => updateItem(item.id, { titleAr: v })} rtl required placeholder="مثلاً: تأسيس الشركات" />
              <Field label="Description (AR)" value={item.descriptionAr} onChange={v => updateItem(item.id, { descriptionAr: v })} multiline rtl placeholder="وصف موجز للميزة…" />
            </>
          )}
        </div>
      ))}
      <button onClick={addItem}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', padding: '8px', borderRadius: 6, border: '1px dashed var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}>
        <Plus size={12} /> Add Feature
      </button>
    </div>
  );
}

// ─── Steps section ────────────────────────────────────────────────────────────

function StepsSection({ items, onChange, lang }: { items: PracticeStep[]; onChange: (v: PracticeStep[]) => void; lang: Lang }) {
  function addItem() {
    onChange([...items, { id: uid(), number: items.length + 1, titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '' }]);
  }
  function removeItem(id: string) {
    onChange(items.filter(i => i.id !== id).map((item, idx) => ({ ...item, number: idx + 1 })));
  }
  function updateItem(id: string, patch: Partial<PracticeStep>) {
    onChange(items.map(i => i.id === id ? { ...i, ...patch } : i));
  }
  function moveItem(idx: number, dir: -1 | 1) {
    const next = [...items];
    const [removed] = next.splice(idx, 1);
    next.splice(idx + dir, 0, removed);
    onChange(next.map((item, i) => ({ ...item, number: i + 1 })));
  }

  return (
    <div>
      {items.map((item, idx) => (
        <div key={item.id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: 'DM Mono, monospace', flexShrink: 0, marginTop: 2 }}>
            {item.number}
          </div>
          <div style={{ flex: 1, background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 7, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', flex: 1 }}>Step {item.number}</span>
              <div style={{ display: 'flex', gap: 2 }}>
                {idx > 0 && <button onClick={() => moveItem(idx, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '2px 3px', display: 'flex' }}><ChevronUp size={11} /></button>}
                {idx < items.length - 1 && <button onClick={() => moveItem(idx, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '2px 3px', display: 'flex' }}><ChevronDown size={11} /></button>}
                <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '2px 3px', display: 'flex' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#B91C1C'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}>
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
            {lang === 'en' ? (
              <>
                <Field label="Step Title (EN)" value={item.titleEn} onChange={v => updateItem(item.id, { titleEn: v })} required placeholder="e.g. Initial Consultation" />
                <Field label="Description (EN)" value={item.descriptionEn} onChange={v => updateItem(item.id, { descriptionEn: v })} multiline placeholder="What happens in this step…" />
              </>
            ) : (
              <>
                <Field label="Step Title (AR)" value={item.titleAr} onChange={v => updateItem(item.id, { titleAr: v })} rtl required placeholder="مثلاً: الاستشارة الأولية" />
                <Field label="Description (AR)" value={item.descriptionAr} onChange={v => updateItem(item.id, { descriptionAr: v })} multiline rtl placeholder="ما يحدث في هذه الخطوة…" />
              </>
            )}
          </div>
        </div>
      ))}
      <button onClick={addItem}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', padding: '8px', borderRadius: 6, border: '1px dashed var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}>
        <Plus size={12} /> Add Step
      </button>
    </div>
  );
}

// ─── Use cases section ────────────────────────────────────────────────────────

function UseCasesSection({ items, onChange, lang }: { items: PracticeUseCase[]; onChange: (v: PracticeUseCase[]) => void; lang: Lang }) {
  function addItem() { onChange([...items, { id: uid(), titleEn: '', titleAr: '', summaryEn: '', summaryAr: '', industryEn: '', industryAr: '' }]); }
  function removeItem(id: string) { onChange(items.filter(i => i.id !== id)); }
  function updateItem(id: string, patch: Partial<PracticeUseCase>) { onChange(items.map(i => i.id === id ? { ...i, ...patch } : i)); }

  return (
    <div>
      {items.map((item, idx) => (
        <div key={item.id} style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 7, padding: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', flex: 1 }}>Use Case {idx + 1}</span>
            <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#B91C1C'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}>
              <Trash2 size={11} />
            </button>
          </div>
          {lang === 'en' ? (
            <>
              <Field label="Title (EN)" value={item.titleEn} onChange={v => updateItem(item.id, { titleEn: v })} required placeholder="e.g. GCC Market Entry" />
              <Field label="Industry (EN)" value={item.industryEn} onChange={v => updateItem(item.id, { industryEn: v })} placeholder="e.g. Technology" />
              <Field label="Summary (EN)" value={item.summaryEn} onChange={v => updateItem(item.id, { summaryEn: v })} multiline placeholder="Brief case description without confidential details…" />
            </>
          ) : (
            <>
              <Field label="Title (AR)" value={item.titleAr} onChange={v => updateItem(item.id, { titleAr: v })} rtl required placeholder="مثلاً: الدخول إلى سوق الخليج" />
              <Field label="Industry (AR)" value={item.industryAr} onChange={v => updateItem(item.id, { industryAr: v })} rtl placeholder="مثلاً: التكنولوجيا" />
              <Field label="Summary (AR)" value={item.summaryAr} onChange={v => updateItem(item.id, { summaryAr: v })} multiline rtl placeholder="وصف موجز للحالة…" />
            </>
          )}
        </div>
      ))}
      <button onClick={addItem}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', padding: '8px', borderRadius: 6, border: '1px dashed var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}>
        <Plus size={12} /> Add Use Case
      </button>
    </div>
  );
}

// ─── FAQ section ──────────────────────────────────────────────────────────────

function FAQSection({ items, onChange, lang }: { items: PracticeFAQ[]; onChange: (v: PracticeFAQ[]) => void; lang: Lang }) {
  function addItem() { onChange([...items, { id: uid(), questionEn: '', questionAr: '', answerEn: '', answerAr: '' }]); }
  function removeItem(id: string) { onChange(items.filter(i => i.id !== id)); }
  function updateItem(id: string, patch: Partial<PracticeFAQ>) { onChange(items.map(i => i.id === id ? { ...i, ...patch } : i)); }
  function moveItem(idx: number, dir: -1 | 1) {
    const next = [...items];
    const [removed] = next.splice(idx, 1);
    next.splice(idx + dir, 0, removed);
    onChange(next);
  }

  return (
    <div>
      {items.length === 0 && (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 11 }}>
          No FAQ items yet. Add questions clients frequently ask about this practice area.
        </div>
      )}
      {items.map((item, idx) => (
        <div key={item.id} style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 7, padding: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
            <GripVertical size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', flex: 1 }}>FAQ {idx + 1}</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {idx > 0 && <button onClick={() => moveItem(idx, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '2px 3px', display: 'flex' }}><ChevronUp size={11} /></button>}
              {idx < items.length - 1 && <button onClick={() => moveItem(idx, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '2px 3px', display: 'flex' }}><ChevronDown size={11} /></button>}
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '2px 3px', display: 'flex' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#B91C1C'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}>
                <Trash2 size={11} />
              </button>
            </div>
          </div>
          {lang === 'en' ? (
            <>
              <Field label="Question (EN)" value={item.questionEn} onChange={v => updateItem(item.id, { questionEn: v })} required placeholder="What question does a client ask?" />
              <Field label="Answer (EN)" value={item.answerEn} onChange={v => updateItem(item.id, { answerEn: v })} multiline required placeholder="Clear, concise answer (no legal jargon)…" />
            </>
          ) : (
            <>
              <Field label="Question (AR)" value={item.questionAr} onChange={v => updateItem(item.id, { questionAr: v })} rtl required placeholder="ما السؤال الذي يطرحه العميل؟" />
              <Field label="Answer (AR)" value={item.answerAr} onChange={v => updateItem(item.id, { answerAr: v })} multiline rtl required placeholder="إجابة واضحة وموجزة…" />
            </>
          )}
        </div>
      ))}
      <button onClick={addItem}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', padding: '8px', borderRadius: 6, border: '1px dashed var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}>
        <Plus size={12} /> Add FAQ Item
      </button>
    </div>
  );
}

// ─── Section accordion ────────────────────────────────────────────────────────

function SectionAccordion({ title, badge, children, defaultOpen = true }: {
  title: string; badge?: string | number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, marginBottom: 14, overflow: 'hidden' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--muted)', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--foreground)' }}>{title}</span>
        {badge !== undefined && <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', background: 'var(--card)', padding: '1px 6px', borderRadius: 10 }}>{badge}</span>}
        {open ? <ChevronUp size={13} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronDown size={13} style={{ color: 'var(--muted-foreground)' }} />}
      </button>
      {open && <div style={{ padding: 14 }}>{children}</div>}
    </div>
  );
}

// ─── Publish checklist ────────────────────────────────────────────────────────

function PublishChecklist({ pa }: { pa: PracticeArea }) {
  const checks = [
    { key: 'titleEn', label: 'English title', pass: !!pa.titleEn.trim() },
    { key: 'titleAr', label: 'Arabic title', pass: !!pa.titleAr.trim() },
    { key: 'slug', label: 'URL slug', pass: !!pa.slug.startsWith('/') },
    { key: 'descEn', label: 'English description', pass: !!pa.shortDescEn.trim() },
    { key: 'descAr', label: 'Arabic description', pass: !!pa.shortDescAr.trim() },
    { key: 'cover', label: 'Cover image', pass: !!pa.coverImageUrl.trim() },
    { key: 'about', label: 'About body (EN)', pass: pa.about.bodyEn.trim().length >= 50 },
    { key: 'features', label: 'Has features', pass: pa.features.length > 0 },
  ];
  const passCount = checks.filter(c => c.pass).length;
  const allPass = passCount === checks.length;
  return (
    <div style={{ background: 'var(--input-background)', borderRadius: 7, overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--foreground)' }}>Publish checklist</span>
        <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: allPass ? '#1A7B3C' : 'var(--muted-foreground)' }}>{passCount}/{checks.length}</span>
      </div>
      <div style={{ height: 2, background: 'var(--muted)' }}>
        <div style={{ height: '100%', width: `${(passCount / checks.length) * 100}%`, background: allPass ? '#2DA457' : passCount >= 5 ? '#C47F17' : '#D11B3A', transition: 'width 0.3s, background 0.3s' }} />
      </div>
      {checks.map((c, i) => (
        <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderBottom: i < checks.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.pass ? '#E6F4EA' : '#FEE2E2' }}>
            {c.pass ? <Check size={8} strokeWidth={3} style={{ color: '#1A7B3C' }} /> : <X size={8} strokeWidth={3} style={{ color: '#B91C1C' }} />}
          </div>
          <span style={{ fontSize: 10, color: c.pass ? 'var(--foreground)' : '#B91C1C', fontWeight: c.pass ? 400 : 500 }}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Right sidebar ────────────────────────────────────────────────────────────

function EditorSidebar({ pa, onChange, onSaveDraft, onPublish, onUnpublish, saved }: {
  pa: PracticeArea;
  onChange: (patch: Partial<PracticeArea>) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  saved: boolean;
}) {
  const allPass = !!(pa.titleEn.trim() && pa.titleAr.trim() && pa.slug.startsWith('/') && pa.shortDescEn.trim() && pa.shortDescAr.trim() && pa.coverImageUrl.trim() && pa.about.bodyEn.trim().length >= 50 && pa.features.length > 0);

  const STATUS_CFG: Record<PracticeAreaStatus, { label: string; bg: string; color: string; dot: string }> = {
    published: { label: 'Published', bg: '#E6F4EA', color: '#1A7B3C', dot: '#2DA457' },
    draft:     { label: 'Draft',     bg: '#EEF0F4', color: '#4A5060', dot: '#8A90A0' },
    archived:  { label: 'Archived',  bg: '#FFF4E5', color: '#8C4A00', dot: '#D4860A' },
  };
  const cfg = STATUS_CFG[pa.status];
  const btnBase: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '8px', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' };
  const selStyle: React.CSSProperties = { width: '100%', background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 5, padding: '7px 9px', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif', cursor: 'pointer', outline: 'none' };

  return (
    <aside style={{ width: 258, minWidth: 258, borderLeft: '1px solid var(--border)', background: 'var(--card)', overflowY: 'auto', flexShrink: 0 }}>
      <div style={{ padding: '14px 16px' }}>
        <SectionLabel label="Status" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Current</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: cfg.bg, color: cfg.color, fontSize: 10, fontFamily: 'DM Mono, monospace', padding: '3px 8px', borderRadius: 10 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
            {cfg.label}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <button onClick={onSaveDraft}
            style={{ ...btnBase, background: saved ? 'rgba(45,164,87,0.15)' : 'var(--input-background)', border: '1px solid var(--border)', color: saved ? '#1A7B3C' : 'var(--foreground)', fontWeight: 500, transition: 'background 0.2s' }}>
            {saved ? <><Check size={12} /> Saved</> : <><Save size={12} /> Save Draft</>}
          </button>
          {pa.status !== 'published' ? (
            <button onClick={allPass ? onPublish : undefined} title={!allPass ? 'Fix checklist items first' : undefined}
              style={{ ...btnBase, background: allPass ? 'var(--primary)' : 'var(--muted)', border: 'none', color: allPass ? '#fff' : 'var(--muted-foreground)', fontWeight: 600, opacity: allPass ? 1 : 0.6, cursor: allPass ? 'pointer' : 'not-allowed' }}>
              <Send size={12} /> Publish
            </button>
          ) : (
            <button onClick={onUnpublish}
              style={{ ...btnBase, background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600 }}>
              <EyeOff size={12} /> Unpublish
            </button>
          )}
        </div>

        {!allPass && (
          <div style={{ display: 'flex', gap: 7, padding: '8px 10px', background: '#FFF8EC', border: '1px solid rgba(196,127,23,0.25)', borderRadius: 6, marginBottom: 14 }}>
            <AlertCircle size={13} style={{ color: '#C47F17', flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 10, color: '#7A4D0A', lineHeight: 1.5 }}>Complete the checklist before publishing.</span>
          </div>
        )}

        <PublishChecklist pa={pa} />

        <SectionLabel label="Details" />
        <div style={{ marginBottom: 13 }}>
          <label style={{ display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Category (EN)</label>
          <select value={pa.categoryEn} onChange={e => onChange({ categoryEn: e.target.value })} style={selStyle}>
            {PRACTICE_AREA_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Field label="Category (AR)" value={pa.categoryAr} onChange={v => onChange({ categoryAr: v })} rtl placeholder="مثلاً: الشركات والتجارة" />
        <div style={{ marginBottom: 13 }}>
          <label style={{ display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Display Order</label>
          <input type="number" value={pa.order} onChange={e => onChange({ order: parseInt(e.target.value) || 1 })} min={1}
            style={{ width: '100%', background: 'var(--input-background)', border: '1px solid transparent', borderRadius: 5, padding: '7px 10px', fontSize: 12, color: 'var(--foreground)', fontFamily: 'DM Mono, monospace', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <SectionLabel label="SEO" />
        <Field label="SEO Title (EN)" value={pa.seoTitleEn} onChange={v => onChange({ seoTitleEn: v })} placeholder="Auto from title" />
        <Field label="Meta Desc (EN)" value={pa.seoDescEn} onChange={v => onChange({ seoDescEn: v })} multiline placeholder="150–160 char summary" />
        <Field label="SEO Title (AR)" value={pa.seoTitleAr} onChange={v => onChange({ seoTitleAr: v })} rtl placeholder="عنوان SEO بالعربية" />
        <Field label="Meta Desc (AR)" value={pa.seoDescAr} onChange={v => onChange({ seoDescAr: v })} multiline rtl placeholder="ملخص 150-160 حرف" />

        <SectionLabel label="Info" />
        {[['Created', formatDate(pa.createdAt)], ['Updated', formatDate(pa.updatedAt)], ['Author', pa.author]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{k}</span>
            <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--foreground)' }}>{v}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─── Main editor ──────────────────────────────────────────────────────────────

interface PracticeAreaEditorProps {
  pa: PracticeArea;
  onBack: () => void;
  onSave: (pa: PracticeArea) => void;
  onPublish: () => void;
  onUnpublish: () => void;
  initialLang?: Lang;
}

export function PracticeAreaEditor({ pa: initialPa, onBack, onSave, onPublish, onUnpublish, initialLang = 'en' }: PracticeAreaEditorProps) {
  const [pa, setPa] = useState<PracticeArea>(initialPa);
  const [lang, setLang] = useState<Lang>(initialLang);
  const [saved, setSaved] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  function patch(p: Partial<PracticeArea>) {
    setPa(prev => ({ ...prev, ...p, updatedAt: new Date().toISOString() }));
    setSaved(false);
  }

  function handleTitleEnChange(v: string) {
    const slug = slugEdited ? pa.slug : '/' + v.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    patch({ titleEn: v, slug });
  }

  function handleSaveDraft() {
    onSave({ ...pa, updatedAt: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handlePublish() {
    const updated = { ...pa, status: 'published' as PracticeAreaStatus, publishedAt: new Date().toISOString() };
    setPa(updated);
    onSave(updated);
    onPublish();
  }

  function handleUnpublish() {
    const updated = { ...pa, status: 'draft' as PracticeAreaStatus };
    setPa(updated);
    onSave(updated);
    onUnpublish();
  }

  const STATUS_LABELS: Record<PracticeAreaStatus, string> = { published: 'Published', draft: 'Draft', archived: 'Archived' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Inter, sans-serif', background: 'var(--background)' }}>
      {/* Header */}
      <header style={{ height: 48, background: 'var(--card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0 }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid var(--border)', borderRadius: 5, cursor: 'pointer', padding: '5px 10px', color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif', fontSize: 12 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}>
          <ArrowLeft size={13} /> Back to Practice Areas
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lang === 'ar' ? (pa.titleAr || pa.titleEn) : pa.titleEn}
          </span>
          <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', padding: '2px 6px', borderRadius: 3, color: pa.status === 'published' ? '#2DA457' : 'rgba(100,100,120,0.7)', background: pa.status === 'published' ? 'rgba(45,164,87,0.12)' : 'rgba(0,0,0,0.06)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
            {STATUS_LABELS[pa.status]}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--muted)', border: 'none', borderRadius: 5, cursor: 'pointer', padding: '5px 10px', color: 'var(--foreground)', fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 600 }}>
            <Globe size={12} /> {lang.toUpperCase()}
          </button>
          <button onClick={handleSaveDraft}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: saved ? 'rgba(45,164,87,0.15)' : 'var(--primary)', border: 'none', borderRadius: 5, cursor: 'pointer', padding: '5px 14px', color: saved ? '#1A7B3C' : '#fff', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, transition: 'background 0.2s' }}>
            {saved ? <><Check size={12} /> Saved</> : <><Save size={12} /> Save</>}
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {/* Language switcher */}
          <div style={{ display: 'inline-flex', background: 'var(--muted)', borderRadius: 6, padding: 2, marginBottom: 24 }}>
            {(['en', 'ar'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: '5px 16px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'DM Mono, monospace', fontWeight: 600, background: lang === l ? 'var(--card)' : 'transparent', color: lang === l ? 'var(--foreground)' : 'var(--muted-foreground)', boxShadow: lang === l ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
                {l === 'en' ? '🇬🇧 English' : '🇸🇦 Arabic'}
              </button>
            ))}
          </div>

          {/* Core identity */}
          <SectionAccordion title="Identity & Cover" badge="Core">
            {lang === 'en' ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Practice Area Title (EN) *
                  </label>
                  <input value={pa.titleEn} onChange={e => handleTitleEnChange(e.target.value)} placeholder="e.g. Real Estate Law"
                    style={{ width: '100%', border: 'none', borderBottom: `2px solid ${pa.titleEn ? 'var(--border)' : '#D97706'}`, background: 'transparent', outline: 'none', padding: '6px 0', boxSizing: 'border-box', fontSize: 20, fontWeight: 700, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif' }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>URL Slug *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--muted)', borderRadius: 5, padding: '6px 10px' }}>
                    <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>alrashid-law.com/practice-areas</span>
                    <input value={pa.slug} onChange={e => { patch({ slug: e.target.value }); setSlugEdited(true); }}
                      style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--foreground)' }} />
                  </div>
                </div>
                <Field label="Short Description (EN) *" value={pa.shortDescEn} onChange={v => patch({ shortDescEn: v })} multiline required placeholder="2–3 sentence summary shown in listings and the service card…" />
              </>
            ) : (
              <div style={{ direction: 'rtl' }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, direction: 'ltr' }}>Practice Area Title (AR) *</label>
                  <input value={pa.titleAr} onChange={e => patch({ titleAr: e.target.value })} placeholder="مثلاً: قانون العقارات" dir="rtl"
                    style={{ width: '100%', border: 'none', borderBottom: `2px solid ${pa.titleAr ? 'var(--border)' : '#D97706'}`, background: 'transparent', outline: 'none', padding: '6px 0', boxSizing: 'border-box', fontSize: 20, fontWeight: 700, color: 'var(--foreground)', fontFamily: 'serif', direction: 'rtl' }} />
                </div>
                <Field label="Short Description (AR) *" value={pa.shortDescAr} onChange={v => patch({ shortDescAr: v })} multiline rtl required placeholder="ملخص من جملتين إلى ثلاث جمل يظهر في القوائم…" />
                <div style={{ padding: '10px 14px', background: 'var(--muted)', borderRadius: 6, fontSize: 11, color: 'var(--muted-foreground)', direction: 'ltr' }}>
                  Cover image and URL slug are shared across both languages. Edit them in the English tab.
                </div>
              </div>
            )}

            {lang === 'en' && (
              <div style={{ marginTop: 4 }}>
                <label style={{ display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Cover Image</label>
                <CoverUploader url={pa.coverImageUrl} onUrlChange={v => patch({ coverImageUrl: v })} altEn={pa.coverAltEn} onAltEn={v => patch({ coverAltEn: v })} altAr={pa.coverAltAr} onAltAr={v => patch({ coverAltAr: v })} />
              </div>
            )}
          </SectionAccordion>

          {/* About */}
          <SectionAccordion title="About" badge="Rich text">
            <LangTabs lang={lang} onSet={setLang} />
            {lang === 'en'
              ? <MdEditor value={pa.about.bodyEn} onChange={v => patch({ about: { ...pa.about, bodyEn: v } })} placeholder="Introduce this practice area — who you serve, your approach, key differentiators…" />
              : <MdEditor value={pa.about.bodyAr} onChange={v => patch({ about: { ...pa.about, bodyAr: v } })} rtl placeholder="قدّم هذا المجال — من تخدم، نهجك، المميزات الرئيسية…" />}
          </SectionAccordion>

          {/* Features */}
          <SectionAccordion title="Services & Features" badge={pa.features.length}>
            <LangTabs lang={lang} onSet={setLang} />
            <FeaturesSection items={pa.features} onChange={v => patch({ features: v })} lang={lang} />
          </SectionAccordion>

          {/* Process steps */}
          <SectionAccordion title="Process Steps" badge={pa.steps.length} defaultOpen={false}>
            <LangTabs lang={lang} onSet={setLang} />
            <StepsSection items={pa.steps} onChange={v => patch({ steps: v })} lang={lang} />
          </SectionAccordion>

          {/* Use cases */}
          <SectionAccordion title="Use Cases" badge={pa.useCases.length} defaultOpen={false}>
            <LangTabs lang={lang} onSet={setLang} />
            <UseCasesSection items={pa.useCases} onChange={v => patch({ useCases: v })} lang={lang} />
          </SectionAccordion>

          {/* FAQ */}
          <SectionAccordion title="FAQ" badge={pa.faqs.length} defaultOpen={false}>
            <LangTabs lang={lang} onSet={setLang} />
            <FAQSection items={pa.faqs} onChange={v => patch({ faqs: v })} lang={lang} />
          </SectionAccordion>
        </div>

        {/* Sidebar */}
        <EditorSidebar pa={pa} onChange={patch} onSaveDraft={handleSaveDraft} onPublish={handlePublish} onUnpublish={handleUnpublish} saved={saved} />
      </div>
    </div>
  );
}
