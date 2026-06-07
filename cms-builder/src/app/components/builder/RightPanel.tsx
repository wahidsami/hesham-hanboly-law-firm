import { useEffect, useId, useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, Globe, Eye, EyeOff, Search, AlertTriangle } from 'lucide-react';
import { PublishingPanel } from './PublishingPanel';
import { RevisionPanel } from './RevisionPanel';
import { backendApi } from '../../api/backend';
import { ImageAssetPicker } from '../shared/ImageAssetPicker';
import type { Block, BuilderPage, Lang, FAQItem, CardItem, StatItem, TestimonialItem, TeamMember, GalleryImage } from './types';
import { BLOCK_TYPE_LABELS } from './types';

// ─── Block validation ─────────────────────────────────────────────────────────

function getBlockWarnings(block: Block): string[] {
  const d = block.data as Record<string, string>;
  const warnings: string[] = [];
  switch (block.type) {
    case 'hero':
      if (!d.headingEn?.trim()) warnings.push('Missing English heading');
      if (!d.headingAr?.trim()) warnings.push('Missing Arabic heading');
      break;
    case 'rich-text':
      if (!d.bodyEn?.trim()) warnings.push('Missing English body text');
      if (!d.bodyAr?.trim()) warnings.push('Missing Arabic body text');
      break;
    case 'image-text':
      if (!d.headingEn?.trim()) warnings.push('Missing English heading');
      if (!d.headingAr?.trim()) warnings.push('Missing Arabic heading');
      if (!d.imageUrl?.trim()) warnings.push('Missing image URL');
      break;
    case 'cta':
      if (!d.headingEn?.trim()) warnings.push('Missing English heading');
      if (!d.headingAr?.trim()) warnings.push('Missing Arabic heading');
      if (!d.ctaUrl?.trim()) warnings.push('Missing CTA URL');
      break;
    case 'contact':
      if (!d.headingEn?.trim()) warnings.push('Missing English heading');
      if (!d.email?.trim()) warnings.push('Missing contact email');
      break;
  }
  return warnings;
}

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

// ─── Shared form atoms ────────────────────────────────────────────────────────
function Field({
  label, value, onChange, multiline = false, mono = false, rtl = false, placeholder = '',
}: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; mono?: boolean; rtl?: boolean; placeholder?: string;
}) {
  const base: React.CSSProperties = {
    width: '100%', background: 'var(--input-background)', border: '1px solid transparent',
    borderRadius: 4, fontSize: 12, color: 'var(--foreground)', fontFamily: mono ? 'DM Mono, monospace' : 'Inter, sans-serif',
    resize: 'vertical', padding: '7px 9px', direction: rtl ? 'rtl' : 'ltr', boxSizing: 'border-box',
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...base, minHeight: 80 }}
          onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = '#C47F17'; }}
          onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'transparent'; }}
        />
      ) : (
        <input
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...base }}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C47F17'; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'transparent'; }}
        />
      )}
    </div>
  );
}

function ImageField({
  label,
  value,
  onChange,
  placeholder = '',
  altLabel,
  altValue,
  onAltChange,
  onCommit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  altLabel?: string;
  altValue?: string;
  onAltChange?: (v: string) => void;
  onCommit?: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputId = useId();
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <input
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            width: '100%',
            background: 'var(--input-background)',
            border: '1px solid transparent',
            borderRadius: 4,
            fontSize: 12,
            color: 'var(--foreground)',
            fontFamily: 'DM Mono, monospace',
            padding: '7px 9px',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          style={{
            padding: '7px 10px',
            borderRadius: 4,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            cursor: 'pointer',
            fontSize: 11,
            color: 'var(--foreground)',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          Library
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          onClick={() => document.getElementById(fileInputId)?.click()}
          style={{
            padding: '7px 10px',
            borderRadius: 4,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            cursor: 'pointer',
            fontSize: 11,
            color: 'var(--foreground)',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          Upload
        </button>
        <input
          id={fileInputId}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) {
              try {
                const asset = await backendApi.uploadAsset(file, altValue || '', '');
                onChange(asset.url);
                if (onAltChange && altLabel) onAltChange(altValue || asset.altEn || '');
                if (onCommit) window.setTimeout(onCommit, 0);
              } catch (error) {
                console.error('Image upload failed', error);
              }
            }
            event.target.value = '';
          }}
        />
      </div>
      {altLabel && onAltChange && (
        <div style={{ marginTop: 8 }}>
          <label style={{ display: 'block', fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            {altLabel}
          </label>
          <input
            value={altValue || ''}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder={altLabel}
            style={{
              width: '100%',
              background: 'var(--input-background)',
              border: '1px solid transparent',
              borderRadius: 4,
              fontSize: 12,
              color: 'var(--foreground)',
              fontFamily: 'DM Mono, monospace',
              padding: '7px 9px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}
      <ImageAssetPicker
        open={pickerOpen}
        title={label}
        initialUrl={value}
        initialAltEn={altValue || ''}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset, nextAltEn) => {
          onChange(asset.url);
          if (onAltChange && altLabel) onAltChange(nextAltEn);
          if (onCommit) window.setTimeout(onCommit, 0);
        }}
      />
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '10px 0 6px', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
      {label}
    </div>
  );
}

function LangTabs({ lang, onSet }: { lang: Lang; onSet: (l: Lang) => void }) {
  return (
    <div style={{ display: 'flex', background: 'var(--input-background)', borderRadius: 5, padding: 2, marginBottom: 16 }}>
      {(['en', 'ar'] as Lang[]).map((l) => (
              <button
                type="button"
                key={l}
                onClick={() => onSet(l)}
          style={{
            flex: 1, padding: '5px 0', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontFamily: 'DM Mono, monospace', fontWeight: 600,
            background: lang === l ? '#fff' : 'transparent',
            color: lang === l ? 'var(--foreground)' : 'var(--muted-foreground)',
            boxShadow: lang === l ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {l === 'en' ? '🇬🇧 EN' : '🇸🇦 AR'}
        </button>
      ))}
    </div>
  );
}

// ─── Block forms ──────────────────────────────────────────────────────────────
function HeroForm({ d, update, formLang, setFormLang, onCommit }: { d: Record<string, string>; update: (k: string, v: string) => void; formLang: Lang; setFormLang: (l: Lang) => void; onCommit?: () => void }) {
  return (
    <>
      <LangTabs lang={formLang} onSet={setFormLang} />
      <SectionLabel label="Content" />
      {formLang === 'en' ? (
        <>
          <Field label="Heading (EN)" value={d.headingEn} onChange={(v) => update('headingEn', v)} />
          <Field label="Subheading (EN)" value={d.subheadingEn} onChange={(v) => update('subheadingEn', v)} multiline />
          <Field label="Primary CTA Label (EN)" value={d.ctaPrimaryLabelEn} onChange={(v) => update('ctaPrimaryLabelEn', v)} />
          <Field label="Secondary CTA Label (EN)" value={d.ctaSecondaryLabelEn} onChange={(v) => update('ctaSecondaryLabelEn', v)} />
        </>
      ) : (
        <>
          <Field label="Heading (AR)" value={d.headingAr} onChange={(v) => update('headingAr', v)} rtl />
          <Field label="Subheading (AR)" value={d.subheadingAr} onChange={(v) => update('subheadingAr', v)} multiline rtl />
          <Field label="Primary CTA Label (AR)" value={d.ctaPrimaryLabelAr} onChange={(v) => update('ctaPrimaryLabelAr', v)} rtl />
          <Field label="Secondary CTA Label (AR)" value={d.ctaSecondaryLabelAr} onChange={(v) => update('ctaSecondaryLabelAr', v)} rtl />
        </>
      )}
      <SectionLabel label="Settings" />
      <Field label="Primary CTA URL" value={d.ctaPrimaryUrl} onChange={(v) => update('ctaPrimaryUrl', v)} mono />
      <Field label="Secondary CTA URL" value={d.ctaSecondaryUrl} onChange={(v) => update('ctaSecondaryUrl', v)} mono />
      <ImageField label="Image" value={d.imageUrl} onChange={(v) => update('imageUrl', v)} placeholder="Paste or choose an image…" onCommit={onCommit} />
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
          Background Color
        </label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="color" value={d.bgColor || '#12131C'} onChange={(e) => update('bgColor', e.target.value)} style={{ width: 32, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 2 }} />
          <input value={d.bgColor || '#12131C'} onChange={(e) => update('bgColor', e.target.value)} style={{ flex: 1, background: 'var(--input-background)', border: '1px solid transparent', borderRadius: 4, padding: '6px 8px', fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'var(--foreground)' }} />
        </div>
      </div>
    </>
  );
}

function RichTextForm({ d, update, formLang, setFormLang }: { d: Record<string, string>; update: (k: string, v: string) => void; formLang: Lang; setFormLang: (l: Lang) => void }) {
  return (
    <>
      <LangTabs lang={formLang} onSet={setFormLang} />
      <SectionLabel label="Content" />
      {formLang === 'en' ? (
        <>
          <Field label="Heading (EN)" value={d.headingEn} onChange={(v) => update('headingEn', v)} />
          <Field label="Body (EN)" value={d.bodyEn} onChange={(v) => update('bodyEn', v)} multiline placeholder="Paragraphs separated by blank lines…" />
        </>
      ) : (
        <>
          <Field label="Heading (AR)" value={d.headingAr} onChange={(v) => update('headingAr', v)} rtl />
          <Field label="Body (AR)" value={d.bodyAr} onChange={(v) => update('bodyAr', v)} multiline rtl placeholder="فقرات مفصولة بأسطر فارغة…" />
        </>
      )}
    </>
  );
}

function ImageTextForm({ d, update, formLang, setFormLang, onCommit }: { d: Record<string, string>; update: (k: string, v: string) => void; formLang: Lang; setFormLang: (l: Lang) => void; onCommit?: () => void }) {
  return (
    <>
      <LangTabs lang={formLang} onSet={setFormLang} />
      <SectionLabel label="Content" />
      {formLang === 'en' ? (
        <>
          <Field label="Heading (EN)" value={d.headingEn} onChange={(v) => update('headingEn', v)} />
          <Field label="Body (EN)" value={d.bodyEn} onChange={(v) => update('bodyEn', v)} multiline />
          <Field label="CTA Label (EN)" value={d.ctaPrimaryLabelEn} onChange={(v) => update('ctaPrimaryLabelEn', v)} />
        </>
      ) : (
        <>
          <Field label="Heading (AR)" value={d.headingAr} onChange={(v) => update('headingAr', v)} rtl />
          <Field label="Body (AR)" value={d.bodyAr} onChange={(v) => update('bodyAr', v)} multiline rtl />
          <Field label="CTA Label (AR)" value={d.ctaPrimaryLabelAr} onChange={(v) => update('ctaPrimaryLabelAr', v)} rtl />
        </>
      )}
      <SectionLabel label="Media & Layout" />
      <ImageField
        label="Image"
        value={d.imageUrl}
        onChange={(v) => update('imageUrl', v)}
        placeholder="Paste or choose an image…"
        altLabel="Image Alt Text"
        altValue={d.imageAlt}
        onAltChange={(v) => update('imageAlt', v)}
        onCommit={onCommit}
      />
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Image Position</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['image-left', 'image-right'] as const).map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => update('layout', opt)}
              style={{
                flex: 1, padding: '6px 0', border: `1px solid ${d.layout === opt ? '#C47F17' : 'var(--border)'}`,
                borderRadius: 4, background: d.layout === opt ? 'var(--accent)' : 'var(--input-background)',
                cursor: 'pointer', fontSize: 11, fontFamily: 'Inter, sans-serif',
                color: d.layout === opt ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
              }}
            >
              {opt === 'image-left' ? '◧ Left' : '◨ Right'}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function CardsForm({ d, update, formLang, setFormLang }: { d: Record<string, unknown>; update: (k: string, v: unknown) => void; formLang: Lang; setFormLang: (l: Lang) => void }) {
  const items = (d.items as CardItem[]) || [];
  return (
    <>
      <LangTabs lang={formLang} onSet={setFormLang} />
      <SectionLabel label="Section Header" />
      {formLang === 'en' ? (
        <>
          <Field label="Heading (EN)" value={String(d.headingEn || '')} onChange={(v) => update('headingEn', v)} />
          <Field label="Subheading (EN)" value={String(d.subheadingEn || '')} onChange={(v) => update('subheadingEn', v)} />
        </>
      ) : (
        <>
          <Field label="Heading (AR)" value={String(d.headingAr || '')} onChange={(v) => update('headingAr', v)} rtl />
          <Field label="Subheading (AR)" value={String(d.subheadingAr || '')} onChange={(v) => update('subheadingAr', v)} rtl />
        </>
      )}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Columns</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {[2, 3, 4].map((n) => (
            <button type="button" key={n} onClick={() => update('columns', n)} style={{ flex: 1, padding: '6px 0', border: `1px solid ${d.columns === n ? '#C47F17' : 'var(--border)'}`, borderRadius: 4, background: d.columns === n ? 'var(--accent)' : 'var(--input-background)', cursor: 'pointer', fontSize: 12, fontFamily: 'DM Mono, monospace', color: d.columns === n ? 'var(--accent-foreground)' : 'var(--muted-foreground)' }}>{n}</button>
          ))}
        </div>
      </div>
      <SectionLabel label={`Cards (${items.length})`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => (
          <div key={item.id} style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace' }}>Card {i + 1}</span>
              <button type="button" onClick={() => update('items', items.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 0, display: 'flex' }}><Trash2 size={11} /></button>
            </div>
            {formLang === 'en' ? (
              <>
                <Field label="Title (EN)" value={item.titleEn} onChange={(v) => { const next = [...items]; next[i] = { ...item, titleEn: v }; update('items', next); }} />
                <Field label="Description (EN)" value={item.descEn} onChange={(v) => { const next = [...items]; next[i] = { ...item, descEn: v }; update('items', next); }} multiline />
              </>
            ) : (
              <>
                <Field label="Title (AR)" value={item.titleAr} onChange={(v) => { const next = [...items]; next[i] = { ...item, titleAr: v }; update('items', next); }} rtl />
                <Field label="Description (AR)" value={item.descAr} onChange={(v) => { const next = [...items]; next[i] = { ...item, descAr: v }; update('items', next); }} multiline rtl />
              </>
            )}
          </div>
        ))}
        <button type="button" onClick={() => update('items', [...items, { id: uid(), titleEn: 'New Card', titleAr: 'بطاقة جديدة', descEn: 'Description', descAr: 'الوصف', icon: 'briefcase' }])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 5, background: 'transparent', border: '1px dashed var(--border)', cursor: 'pointer', fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}>
          <Plus size={12} /> Add Card
        </button>
      </div>
    </>
  );
}

function StatsForm({ d, update }: { d: Record<string, unknown>; update: (k: string, v: unknown) => void }) {
  const items = (d.items as StatItem[]) || [];
  return (
    <>
      <SectionLabel label={`Stats (${items.length})`} />
      {items.map((item, i) => (
        <div key={item.id} style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace' }}>Stat {i + 1}</span>
            <button type="button" onClick={() => update('items', items.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 0, display: 'flex' }}><Trash2 size={11} /></button>
          </div>
          <Field label="Value" value={item.value} onChange={(v) => { const next = [...items]; next[i] = { ...item, value: v }; update('items', next); }} mono />
          <Field label="Label (EN)" value={item.labelEn} onChange={(v) => { const next = [...items]; next[i] = { ...item, labelEn: v }; update('items', next); }} />
          <Field label="Label (AR)" value={item.labelAr} onChange={(v) => { const next = [...items]; next[i] = { ...item, labelAr: v }; update('items', next); }} rtl />
        </div>
      ))}
      <button type="button" onClick={() => update('items', [...items, { id: uid(), value: '0', labelEn: 'New Stat', labelAr: 'إحصائية جديدة' }])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '8px', borderRadius: 5, background: 'transparent', border: '1px dashed var(--border)', cursor: 'pointer', fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}>
        <Plus size={12} /> Add Stat
      </button>
    </>
  );
}

function CTAForm({ d, update, formLang, setFormLang }: { d: Record<string, string>; update: (k: string, v: string) => void; formLang: Lang; setFormLang: (l: Lang) => void }) {
  return (
    <>
      <LangTabs lang={formLang} onSet={setFormLang} />
      <SectionLabel label="Content" />
      {formLang === 'en' ? (
        <>
          <Field label="Heading (EN)" value={d.headingEn} onChange={(v) => update('headingEn', v)} />
          <Field label="Body (EN)" value={d.bodyEn} onChange={(v) => update('bodyEn', v)} multiline />
          <Field label="CTA Label (EN)" value={d.ctaPrimaryLabelEn} onChange={(v) => update('ctaPrimaryLabelEn', v)} />
        </>
      ) : (
        <>
          <Field label="Heading (AR)" value={d.headingAr} onChange={(v) => update('headingAr', v)} rtl />
          <Field label="Body (AR)" value={d.bodyAr} onChange={(v) => update('bodyAr', v)} multiline rtl />
          <Field label="CTA Label (AR)" value={d.ctaPrimaryLabelAr} onChange={(v) => update('ctaPrimaryLabelAr', v)} rtl />
        </>
      )}
      <SectionLabel label="Settings" />
      <Field label="CTA URL" value={d.ctaPrimaryUrl} onChange={(v) => update('ctaPrimaryUrl', v)} mono />
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Background</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="color" value={d.bgColor || '#C47F17'} onChange={(e) => update('bgColor', e.target.value)} style={{ width: 32, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 2 }} />
          <input value={d.bgColor || '#C47F17'} onChange={(e) => update('bgColor', e.target.value)} style={{ flex: 1, background: 'var(--input-background)', border: '1px solid transparent', borderRadius: 4, padding: '6px 8px', fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'var(--foreground)' }} />
        </div>
      </div>
    </>
  );
}

function TestimonialsForm({ d, update, formLang, setFormLang }: { d: Record<string, unknown>; update: (k: string, v: unknown) => void; formLang: Lang; setFormLang: (l: Lang) => void }) {
  const items = (d.items as TestimonialItem[]) || [];
  return (
    <>
      <LangTabs lang={formLang} onSet={setFormLang} />
      <SectionLabel label="Section Header" />
      {formLang === 'en'
        ? <Field label="Heading (EN)" value={String(d.headingEn || '')} onChange={(v) => update('headingEn', v)} />
        : <Field label="Heading (AR)" value={String(d.headingAr || '')} onChange={(v) => update('headingAr', v)} rtl />
      }
      <SectionLabel label={`Testimonials (${items.length})`} />
      {items.map((item, i) => (
        <div key={item.id} style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace' }}>Quote {i + 1}</span>
            <button type="button" onClick={() => update('items', items.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 0, display: 'flex' }}><Trash2 size={11} /></button>
          </div>
          <Field label="Author" value={item.author} onChange={(v) => { const next = [...items]; next[i] = { ...item, author: v }; update('items', next); }} />
          {formLang === 'en' ? (
            <>
              <Field label="Quote (EN)" value={item.quoteEn} onChange={(v) => { const next = [...items]; next[i] = { ...item, quoteEn: v }; update('items', next); }} multiline />
              <Field label="Role (EN)" value={item.roleEn} onChange={(v) => { const next = [...items]; next[i] = { ...item, roleEn: v }; update('items', next); }} />
            </>
          ) : (
            <>
              <Field label="Quote (AR)" value={item.quoteAr} onChange={(v) => { const next = [...items]; next[i] = { ...item, quoteAr: v }; update('items', next); }} multiline rtl />
              <Field label="Role (AR)" value={item.roleAr} onChange={(v) => { const next = [...items]; next[i] = { ...item, roleAr: v }; update('items', next); }} rtl />
            </>
          )}
        </div>
      ))}
      <button type="button" onClick={() => update('items', [...items, { id: uid(), quoteEn: 'Quote here', quoteAr: 'الاقتباس هنا', author: 'Client Name', roleEn: 'Role', roleAr: 'الدور' }])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '8px', borderRadius: 5, background: 'transparent', border: '1px dashed var(--border)', cursor: 'pointer', fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}>
        <Plus size={12} /> Add Testimonial
      </button>
    </>
  );
}

function TeamForm({ d, update, formLang, setFormLang, onCommit }: { d: Record<string, unknown>; update: (k: string, v: unknown) => void; formLang: Lang; setFormLang: (l: Lang) => void; onCommit?: () => void }) {
  const items = (d.items as TeamMember[]) || [];
  const [draftItems, setDraftItems] = useState<TeamMember[]>(items);

  useEffect(() => {
    setDraftItems(items);
  }, [items]);

  function commitItems(nextItems: TeamMember[]) {
    setDraftItems(nextItems);
    update('items', nextItems);
    if (onCommit) window.setTimeout(onCommit, 0);
  }

  return (
    <>
      <LangTabs lang={formLang} onSet={setFormLang} />
      <SectionLabel label="Section Header" />
      {formLang === 'en' ? (
        <>
          <Field label="Heading (EN)" value={String(d.headingEn || '')} onChange={(v) => update('headingEn', v)} />
          <Field label="Subheading (EN)" value={String(d.subheadingEn || '')} onChange={(v) => update('subheadingEn', v)} />
        </>
      ) : (
        <>
          <Field label="Heading (AR)" value={String(d.headingAr || '')} onChange={(v) => update('headingAr', v)} rtl />
          <Field label="Subheading (AR)" value={String(d.subheadingAr || '')} onChange={(v) => update('subheadingAr', v)} rtl />
        </>
      )}
      <SectionLabel label={`Members (${draftItems.length})`} />
      {draftItems.map((member, i) => (
        <div key={member.id} style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace' }}>Member {i + 1}</span>
            <button type="button" onClick={() => commitItems(draftItems.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 0, display: 'flex' }}><Trash2 size={11} /></button>
          </div>
          <ImageField
            label="Photo"
            value={member.imageUrl}
            onChange={(v) => { const next = [...draftItems]; next[i] = { ...member, imageUrl: v }; commitItems(next); }}
            placeholder="Paste or choose a photo…"
            onCommit={onCommit}
          />
          {formLang === 'en' ? (
            <>
              <Field label="Name (EN)" value={member.nameEn} onChange={(v) => { const next = [...draftItems]; next[i] = { ...member, nameEn: v }; commitItems(next); }} />
              <Field label="Role (EN)" value={member.roleEn} onChange={(v) => { const next = [...draftItems]; next[i] = { ...member, roleEn: v }; commitItems(next); }} />
              <Field label="Bio (EN)" value={member.bioEn} onChange={(v) => { const next = [...draftItems]; next[i] = { ...member, bioEn: v }; commitItems(next); }} multiline />
            </>
          ) : (
            <>
              <Field label="Name (AR)" value={member.nameAr} onChange={(v) => { const next = [...draftItems]; next[i] = { ...member, nameAr: v }; commitItems(next); }} rtl />
              <Field label="Role (AR)" value={member.roleAr} onChange={(v) => { const next = [...draftItems]; next[i] = { ...member, roleAr: v }; commitItems(next); }} rtl />
              <Field label="Bio (AR)" value={member.bioAr} onChange={(v) => { const next = [...draftItems]; next[i] = { ...member, bioAr: v }; commitItems(next); }} multiline rtl />
            </>
          )}
        </div>
      ))}
      <button type="button" onClick={() => commitItems([...draftItems, { id: uid(), nameEn: 'Team Member', nameAr: 'عضو الفريق', roleEn: 'Partner', roleAr: 'شريك', bioEn: '', bioAr: '', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&auto=format' }])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '8px', borderRadius: 5, background: 'transparent', border: '1px dashed var(--border)', cursor: 'pointer', fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}>
        <Plus size={12} /> Add Member
      </button>
    </>
  );
}

function ContactForm({ d, update, formLang, setFormLang }: { d: Record<string, string>; update: (k: string, v: string) => void; formLang: Lang; setFormLang: (l: Lang) => void }) {
  return (
    <>
      <LangTabs lang={formLang} onSet={setFormLang} />
      <SectionLabel label="Content" />
      {formLang === 'en' ? (
        <>
          <Field label="Heading (EN)" value={d.headingEn} onChange={(v) => update('headingEn', v)} />
          <Field label="Subheading (EN)" value={d.subheadingEn} onChange={(v) => update('subheadingEn', v)} />
        </>
      ) : (
        <>
          <Field label="Heading (AR)" value={d.headingAr} onChange={(v) => update('headingAr', v)} rtl />
          <Field label="Subheading (AR)" value={d.subheadingAr} onChange={(v) => update('subheadingAr', v)} rtl />
        </>
      )}
      <SectionLabel label="Contact Info" />
      <Field label="Email" value={d.email} onChange={(v) => update('email', v)} mono />
      <Field label="Phone" value={d.phone} onChange={(v) => update('phone', v)} mono />
      <Field label="Address (EN)" value={d.address} onChange={(v) => update('address', v)} multiline />
      <Field label="Address (AR)" value={d.addressAr} onChange={(v) => update('addressAr', v)} multiline rtl />
    </>
  );
}

// ─── FAQ REPEATER ─────────────────────────────────────────────────────────────
function FAQForm({ d, update, formLang, setFormLang }: { d: Record<string, unknown>; update: (k: string, v: unknown) => void; formLang: Lang; setFormLang: (l: Lang) => void }) {
  const items = (d.items as FAQItem[]) || [];

  function updateItem(index: number, patch: Partial<FAQItem>) {
    const next = items.map((item, i) => i === index ? { ...item, ...patch } : item);
    update('items', next);
  }

  function removeItem(index: number) {
    update('items', items.filter((_, i) => i !== index));
  }

  function addItem() {
    update('items', [...items, {
      id: uid(),
      questionEn: 'New Question',
      questionAr: 'سؤال جديد',
      answerEn: 'Answer here…',
      answerAr: 'الإجابة هنا…',
    }]);
  }

  return (
    <>
      <LangTabs lang={formLang} onSet={setFormLang} />
      <SectionLabel label="Section Header" />
      {formLang === 'en'
        ? <Field label="Heading (EN)" value={String(d.headingEn || '')} onChange={(v) => update('headingEn', v)} />
        : <Field label="Heading (AR)" value={String(d.headingAr || '')} onChange={(v) => update('headingAr', v)} rtl />
      }
      <SectionLabel label={`Questions (${items.length})`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, i) => (
          <div
            key={item.id}
            style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}
          >
            {/* Row header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
              <GripVertical size={12} style={{ color: 'var(--muted-foreground)', cursor: 'grab' }} />
              <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace' }}>
                Q{i + 1}
              </span>
              <button
                onClick={() => removeItem(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 2, display: 'flex', borderRadius: 3 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#D11B3A'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}
              >
                <Trash2 size={12} />
              </button>
            </div>
            {/* Fields */}
            <div style={{ padding: '10px' }}>
              {formLang === 'en' ? (
                <>
                  <Field
                    label="Question (EN)"
                    value={item.questionEn}
                    onChange={(v) => updateItem(i, { questionEn: v })}
                  />
                  <Field
                    label="Answer (EN)"
                    value={item.answerEn}
                    onChange={(v) => updateItem(i, { answerEn: v })}
                    multiline
                  />
                </>
              ) : (
                <>
                  <Field
                    label="Question (AR)"
                    value={item.questionAr}
                    onChange={(v) => updateItem(i, { questionAr: v })}
                    rtl
                  />
                  <Field
                    label="Answer (AR)"
                    value={item.answerAr}
                    onChange={(v) => updateItem(i, { answerAr: v })}
                    multiline
                    rtl
                  />
                </>
              )}
            </div>
          </div>
        ))}
        <button
          onClick={addItem}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px', borderRadius: 6,
            background: 'var(--accent)', border: '1px dashed rgba(196,127,23,0.4)',
            cursor: 'pointer', fontSize: 12, fontWeight: 500,
            color: 'var(--accent-foreground)', fontFamily: 'Inter, sans-serif',
          }}
        >
          <Plus size={13} /> Add Question
        </button>
      </div>
    </>
  );
}

function GalleryForm({ d, update, formLang, setFormLang, onCommit }: { d: Record<string, unknown>; update: (k: string, v: unknown) => void; formLang: Lang; setFormLang: (l: Lang) => void; onCommit?: () => void }) {
  const items = (d.items as GalleryImage[]) || [];
  return (
    <>
      <LangTabs lang={formLang} onSet={setFormLang} />
      <SectionLabel label="Section Header" />
      {formLang === 'en'
        ? <Field label="Heading (EN)" value={String(d.headingEn || '')} onChange={(v) => update('headingEn', v)} />
        : <Field label="Heading (AR)" value={String(d.headingAr || '')} onChange={(v) => update('headingAr', v)} rtl />
      }
      <SectionLabel label={`Images (${items.length})`} />
      {items.map((img, i) => (
        <div key={img.id} style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace' }}>Image {i + 1}</span>
            <button type="button" onClick={() => update('items', items.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 0, display: 'flex' }}><Trash2 size={11} /></button>
          </div>
          <ImageField
            label="Image"
            value={img.imageUrl}
            onChange={(v) => { const next = [...items]; next[i] = { ...img, imageUrl: v }; update('items', next); }}
            placeholder="Paste or choose an image…"
            onCommit={onCommit}
          />
          {formLang === 'en'
            ? <Field label="Caption (EN)" value={img.captionEn} onChange={(v) => { const next = [...items]; next[i] = { ...img, captionEn: v }; update('items', next); }} />
            : <Field label="Caption (AR)" value={img.captionAr} onChange={(v) => { const next = [...items]; next[i] = { ...img, captionAr: v }; update('items', next); }} rtl />
          }
        </div>
      ))}
        <button type="button" onClick={() => update('items', [...items, { id: uid(), imageUrl: '', captionEn: 'Image', captionAr: 'صورة' }])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '8px', borderRadius: 5, background: 'transparent', border: '1px dashed var(--border)', cursor: 'pointer', fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}>
        <Plus size={12} /> Add Image
      </button>
    </>
  );
}

function CustomForm({ d, update }: { d: Record<string, string>; update: (k: string, v: string) => void }) {
  return (
    <>
      <SectionLabel label="HTML Content" />
      <Field label="HTML" value={d.htmlContent} onChange={(v) => update('htmlContent', v)} multiline mono placeholder="<!-- Your custom HTML here -->" />
    </>
  );
}

// ─── Page settings panel ──────────────────────────────────────────────────────
function PageSettingsPanel({ page, onUpdate }: { page: BuilderPage; onUpdate: (patch: Partial<BuilderPage>) => void }) {
  const [formLang, setFormLang] = useState<Lang>('en');
  return (
    <>
      <LangTabs lang={formLang} onSet={setFormLang} />
      <SectionLabel label="Page Title" />
      <Field label="Title (EN)" value={page.titleEn} onChange={(v) => onUpdate({ titleEn: v })} />
      <Field label="Title (AR)" value={page.titleAr} onChange={(v) => onUpdate({ titleAr: v })} rtl />
      <SectionLabel label="URL & Visibility" />
      <Field label="Slug" value={page.slug} onChange={(v) => onUpdate({ slug: v })} mono />
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Status</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['published', 'draft', 'hidden'] as const).map((s) => (
            <button key={s} onClick={() => onUpdate({ status: s })} style={{ flex: 1, padding: '6px 0', border: `1px solid ${page.status === s ? '#C47F17' : 'var(--border)'}`, borderRadius: 4, background: page.status === s ? 'var(--accent)' : 'var(--input-background)', cursor: 'pointer', fontSize: 10, fontFamily: 'DM Mono, monospace', color: page.status === s ? 'var(--accent-foreground)' : 'var(--muted-foreground)', textTransform: 'uppercase' }}>
              {s === 'published' ? 'Pub' : s === 'hidden' ? 'Hid' : 'Dft'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif' }}>Show in Navigation</div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}>Appears in top nav</div>
        </div>
        <button
          onClick={() => onUpdate({ navVisible: !page.navVisible })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: page.navVisible ? '#C47F17' : 'var(--muted-foreground)' }}
        >
          {page.navVisible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
      <SectionLabel label="SEO" />
      {formLang === 'en' ? (
        <>
          <Field label="SEO Title (EN)" value={page.seoTitleEn} onChange={(v) => onUpdate({ seoTitleEn: v })} />
          <Field label="Meta Description (EN)" value={page.seoDescEn} onChange={(v) => onUpdate({ seoDescEn: v })} multiline />
        </>
      ) : (
        <>
          <Field label="SEO Title (AR)" value={page.seoTitleAr} onChange={(v) => onUpdate({ seoTitleAr: v })} rtl />
          <Field label="Meta Description (AR)" value={page.seoDescAr} onChange={(v) => onUpdate({ seoDescAr: v })} multiline rtl />
        </>
      )}
    </>
  );
}

// ─── Main RightPanel ──────────────────────────────────────────────────────────
interface RightPanelProps {
  page: BuilderPage;
  selectedBlock: Block | null;
  onUpdatePage: (patch: Partial<BuilderPage>) => void;
  onUpdateBlock: (id: string, data: Record<string, unknown>) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onPreview: () => void;
  onRestore: (blocks: BuilderPage['blocks'], status: BuilderPage['status']) => void;
}

type PageTab = 'settings' | 'publishing' | 'history';

export function RightPanel({ page, selectedBlock, onUpdatePage, onUpdateBlock, onSaveDraft, onPublish, onUnpublish, onPreview, onRestore }: RightPanelProps) {
  const [formLang, setFormLang] = useState<Lang>('en');
  const [pageTab, setPageTab] = useState<PageTab>('settings');

  function updateBlockField(key: string, value: unknown) {
    if (!selectedBlock) return;
    onUpdateBlock(selectedBlock.id, { ...selectedBlock.data, [key]: value });
  }

  const d = selectedBlock?.data ?? {};
  const blockWarnings = selectedBlock ? getBlockWarnings(selectedBlock) : [];

  function renderBlockForm() {
    if (!selectedBlock) return null;
    switch (selectedBlock.type) {
      case 'hero': return <HeroForm d={d as Record<string, string>} update={updateBlockField} formLang={formLang} setFormLang={setFormLang} onCommit={onSaveDraft} />;
      case 'rich-text': return <RichTextForm d={d as Record<string, string>} update={updateBlockField} formLang={formLang} setFormLang={setFormLang} />;
      case 'image-text': return <ImageTextForm d={d as Record<string, string>} update={updateBlockField} formLang={formLang} setFormLang={setFormLang} onCommit={onSaveDraft} />;
      case 'cards': return <CardsForm d={d} update={updateBlockField} formLang={formLang} setFormLang={setFormLang} />;
      case 'stats': return <StatsForm d={d} update={updateBlockField} />;
      case 'cta': return <CTAForm d={d as Record<string, string>} update={updateBlockField} formLang={formLang} setFormLang={setFormLang} />;
      case 'testimonials': return <TestimonialsForm d={d} update={updateBlockField} formLang={formLang} setFormLang={setFormLang} />;
      case 'team': return <TeamForm d={d} update={updateBlockField} formLang={formLang} setFormLang={setFormLang} onCommit={onSaveDraft} />;
      case 'contact': return <ContactForm d={d as Record<string, string>} update={updateBlockField} formLang={formLang} setFormLang={setFormLang} />;
      case 'faq': return <FAQForm d={d} update={updateBlockField} formLang={formLang} setFormLang={setFormLang} />;
      case 'gallery': return <GalleryForm d={d} update={updateBlockField} formLang={formLang} setFormLang={setFormLang} onCommit={onSaveDraft} />;
      case 'custom': return <CustomForm d={d as Record<string, string>} update={updateBlockField} />;
      default: return <div style={{ color: 'var(--muted-foreground)', fontSize: 12, padding: 16 }}>No settings for this block.</div>;
    }
  }

  const PAGE_TABS: { id: PageTab; label: string }[] = [
    { id: 'settings', label: 'Settings' },
    { id: 'publishing', label: 'Publish' },
    { id: 'history', label: 'History' },
  ];

  return (
    <aside
      style={{
        width: 280, minWidth: 280,
        display: 'flex', flexDirection: 'column',
        background: 'var(--card)', borderLeft: '1px solid var(--border)',
        fontFamily: 'Inter, sans-serif', overflow: 'hidden',
      }}
    >
      {/* Panel header */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)', flex: 1 }}>
            {selectedBlock ? BLOCK_TYPE_LABELS[selectedBlock.type] : 'Page Settings'}
          </div>
          {blockWarnings.length > 0 && (
            <div
              title={blockWarnings.join('\n')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, background: 'rgba(196,127,23,0.12)', cursor: 'help' }}
            >
              <AlertTriangle size={10} style={{ color: '#C47F17' }} />
              <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#C47F17', fontWeight: 600 }}>{blockWarnings.length}</span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 1 }}>
          {selectedBlock ? `Block · ${selectedBlock.id}` : page.slug}
        </div>
      </div>

      {/* Block warning banner */}
      {selectedBlock && blockWarnings.length > 0 && (
        <div style={{ padding: '8px 16px', background: 'rgba(196,127,23,0.07)', borderBottom: '1px solid rgba(196,127,23,0.2)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <AlertTriangle size={12} style={{ color: '#C47F17', flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              {blockWarnings.map((w, i) => (
                <div key={i} style={{ fontSize: 10, color: '#7A4D0A', lineHeight: 1.6 }}>· {w}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Page-level tabs (only when no block selected) */}
      {!selectedBlock && (
        <div style={{ display: 'flex', background: 'var(--muted)', margin: '10px 16px 0', borderRadius: 5, padding: 2, flexShrink: 0 }}>
          {PAGE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setPageTab(tab.id)}
              style={{
                flex: 1, padding: '5px 0', border: 'none', borderRadius: 4, cursor: 'pointer',
                fontSize: 11, fontFamily: 'DM Mono, monospace', fontWeight: 600,
                background: pageTab === tab.id ? 'var(--card)' : 'transparent',
                color: pageTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                boxShadow: pageTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Scrollable form area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {selectedBlock ? (
          renderBlockForm()
        ) : pageTab === 'settings' ? (
          <PageSettingsPanel page={page} onUpdate={onUpdatePage} />
        ) : pageTab === 'publishing' ? (
          <PublishingPanel
            page={page}
            onSaveDraft={onSaveDraft}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
            onPreview={onPreview}
          />
        ) : (
          <RevisionPanel page={page} onRestore={onRestore} />
        )}
      </div>
    </aside>
  );
}
