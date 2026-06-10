import { useState, useCallback, useEffect } from 'react';
import {
  ArrowLeft, Globe, Eye, Check, Send, FileText, EyeOff,
  AlertCircle, AlertTriangle, Upload, X, Bold, Italic,
  List, Hash, Quote, Link as LinkIcon, Image as ImageIcon,
  Clock, Calendar, Save, ChevronDown, ChevronUp, ArrowDown,
} from 'lucide-react';
import { backendApi } from '../../api/backend';
import type { Article, ArticleStatus } from '../../api/types';
import { ARTICLE_CATEGORIES } from '../../api/types';
import { ImageAssetPicker } from '../shared/ImageAssetPicker';

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = 'en' | 'ar';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function readTimeFromBody(body: string): string {
  const words = body.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

type MarkdownHeading = { level: number; text: string };

function extractMarkdownHeadings(value: string): MarkdownHeading[] {
  return value
    .split('\n')
    .map((line) => {
      const match = /^(#{1,3})\s+(.+)$/.exec(line.trim());
      if (!match) {
        return null;
      }
      return {
        level: match[1].length,
        text: match[2].trim(),
      };
    })
    .filter((heading): heading is MarkdownHeading => Boolean(heading));
}

function slugify(title: string): string {
  return '/' + title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function Field({ label, value, onChange, multiline, mono, rtl, placeholder, required, warn }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; mono?: boolean; rtl?: boolean; placeholder?: string;
  required?: boolean; warn?: boolean;
}) {
  const isEmpty = required && !value.trim();
  const border = isEmpty ? '1px solid #D97706' : warn ? '1px solid #D97706' : '1px solid transparent';
  const base: React.CSSProperties = {
    width: '100%', background: 'var(--input-background)', border,
    borderRadius: 5, fontSize: 12, color: 'var(--foreground)',
    fontFamily: mono ? 'DM Mono, monospace' : rtl ? 'serif' : 'Inter, sans-serif',
    resize: 'vertical', padding: '8px 10px',
    direction: rtl ? 'rtl' : 'ltr', boxSizing: 'border-box', outline: 'none',
    transition: 'border-color 0.15s',
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <label style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </label>
        {required && <span style={{ fontSize: 8, color: isEmpty ? '#D97706' : '#aaa', fontFamily: 'DM Mono, monospace' }}>required</span>}
        {isEmpty && <AlertTriangle size={9} style={{ color: '#D97706' }} />}
      </div>
      {multiline ? (
        <textarea value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)}
          style={{ ...base, minHeight: 80 }}
          onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#C47F17'; }}
          onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = isEmpty ? '#D97706' : 'transparent'; }}
        />
      ) : (
        <input value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)}
          style={base}
          onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#C47F17'; }}
          onBlur={e => { (e.target as HTMLInputElement).style.borderColor = isEmpty ? '#D97706' : 'transparent'; }}
        />
      )}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 0 8px', borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
      {label}
    </div>
  );
}

function EditorCard({ title, subtitle, children, rtl = false }: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  rtl?: boolean;
}) {
  return (
    <section style={{
      border: '1px solid var(--border)',
      borderRadius: 10,
      background: 'var(--card)',
      padding: 18,
      direction: rtl ? 'rtl' : 'ltr',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {title}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>
          {subtitle}
        </div>
      </div>
      {children}
    </section>
  );
}

function TwoColumnFields({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 14 }}>
      {left}
      {right}
    </div>
  );
}

// ─── Markdown editor ──────────────────────────────────────────────────────────

function MarkdownEditor({ value, onChange, rtl, placeholder }: {
  value: string; onChange: (v: string) => void; rtl?: boolean; placeholder?: string;
}) {
  const [preview, setPreview] = useState(false);

  function insertMarkdown(before: string, after = '') {
    const ta = document.getElementById(rtl ? 'md-ar' : 'md-en') as HTMLTextAreaElement | null;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    setTimeout(() => {
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
      ta.focus();
    }, 10);
  }

  function assignAsHeadline() {
    const ta = document.getElementById(rtl ? 'md-ar' : 'md-en') as HTMLTextAreaElement | null;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const hasSelection = end > start;

    if (hasSelection) {
      const selected = value.slice(start, end).trim().replace(/\s+/g, ' ');
      const next = value.slice(0, start) + `## ${selected}` + value.slice(end);
      onChange(next);
      setTimeout(() => {
        ta.selectionStart = start + 3;
        ta.selectionEnd = start + 3 + selected.length;
        ta.focus();
      }, 10);
      return;
    }

    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEndIndex = value.indexOf('\n', end);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const line = value.slice(lineStart, lineEnd).trim();
    if (!line) return;
    const next = value.slice(0, lineStart) + `## ${line}` + value.slice(lineEnd);
    onChange(next);
    setTimeout(() => {
      ta.selectionStart = lineStart + 3;
      ta.selectionEnd = lineStart + 3 + line.length;
      ta.focus();
    }, 10);
  }

  // Simple markdown to HTML for preview
  function renderMarkdown(md: string): string {
    return md
      .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:700;margin:16px 0 6px;color:var(--foreground)">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-size:16px;font-weight:700;margin:20px 0 8px;color:var(--foreground)">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="font-size:20px;font-weight:700;margin:24px 0 10px;color:var(--foreground)">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid var(--primary);margin:10px 0;padding:6px 12px;color:var(--muted-foreground);font-style:italic">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li style="margin:4px 0;color:var(--foreground)">$1</li>')
      .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul style="margin:8px 0 8px 20px;list-style:disc">${m}</ul>`)
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  }

  const toolbarBtns = [
    { icon: <Hash size={12} />, title: 'Heading', action: () => insertMarkdown('## ') },
    { icon: <ArrowDown size={12} />, title: 'Assign as headline', action: assignAsHeadline },
    { icon: <Bold size={12} />, title: 'Bold', action: () => insertMarkdown('**', '**') },
    { icon: <Italic size={12} />, title: 'Italic', action: () => insertMarkdown('*', '*') },
    { icon: <List size={12} />, title: 'List', action: () => insertMarkdown('- ') },
    { icon: <Quote size={12} />, title: 'Quote', action: () => insertMarkdown('> ') },
    { icon: <LinkIcon size={12} />, title: 'Link', action: () => insertMarkdown('[', '](https://)') },
  ];

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '5px 8px', background: 'var(--muted)', borderBottom: '1px solid var(--border)', direction: rtl ? 'rtl' : 'ltr', flexDirection: rtl ? 'row-reverse' : 'row' }}>
        {toolbarBtns.map((btn, i) => (
          <button key={i} onClick={btn.action} title={btn.title}
            style={{ display: 'flex', alignItems: 'center', padding: '4px 7px', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted-foreground)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--card)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}
          >
            {btn.icon}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)' }}>
          {wordCount} words
        </span>
        <button onClick={() => setPreview(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)', background: preview ? 'var(--card)' : 'transparent', cursor: 'pointer', fontSize: 10, color: preview ? 'var(--foreground)' : 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}>
          <Eye size={10} /> {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor or preview */}
      {preview ? (
        <div
          style={{ minHeight: 280, padding: '14px 16px', fontSize: 13, lineHeight: 1.7, color: 'var(--foreground)', direction: rtl ? 'rtl' : 'ltr', fontFamily: rtl ? 'serif' : 'Inter, sans-serif', background: 'var(--card)', overflowY: 'auto' }}
          dangerouslySetInnerHTML={{ __html: value ? renderMarkdown(value) : `<span style="color:var(--muted-foreground);font-style:italic">Nothing to preview yet.</span>` }}
        />
      ) : (
        <textarea
          id={rtl ? 'md-ar' : 'md-en'}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            display: 'block', width: '100%', minHeight: 280, padding: '14px 16px',
            border: 'none', background: 'var(--card)', outline: 'none', resize: 'vertical',
            fontSize: 12, fontFamily: rtl ? 'serif' : 'DM Mono, monospace',
            color: 'var(--foreground)', direction: rtl ? 'rtl' : 'ltr',
            lineHeight: 1.7, boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  );
}

// ─── Cover image uploader ─────────────────────────────────────────────────────

function CoverImageUploader({ url, onUrlChange, altEn, onAltEnChange, altAr, onAltArChange }: {
  url: string; onUrlChange: (v: string) => void;
  altEn: string; onAltEnChange: (v: string) => void;
  altAr: string; onAltArChange: (v: string) => void;
}) {
  const [urlInput, setUrlInput] = useState(url);
  const [dragging, setDragging] = useState(false);
  const [showAlt, setShowAlt] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setUrlInput(url);
  }, [url]);

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--input-background)', border: '1px solid var(--border)',
    borderRadius: 5, padding: '7px 10px', fontSize: 12, color: 'var(--foreground)',
    fontFamily: 'DM Mono, monospace', outline: 'none', boxSizing: 'border-box',
  };

  async function uploadAndUse(file: File) {
    try {
      setUploading(true);
      const asset = await backendApi.uploadAsset(file, altEn.trim(), altAr.trim());
      onUrlChange(asset.url);
      onAltEnChange(asset.altEn || altEn);
      onAltArChange(asset.altAr || altAr);
      setUrlInput(asset.url);
    } catch (error) {
      console.error('Article cover upload failed', error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {/* Preview */}
      {url ? (
        <div style={{ position: 'relative', borderRadius: 7, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={url} alt={altEn} style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block', background: 'var(--muted)' }} />
          </div>
          <button onClick={() => { onUrlChange(''); setUrlInput(''); }}
            style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <X size={11} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={async e => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) await uploadAndUse(file);
          }}
          style={{ height: 100, border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 7, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', background: dragging ? 'rgba(196,127,23,0.04)' : 'var(--muted)', marginBottom: 10, transition: 'border-color 0.15s', opacity: uploading ? 0.7 : 1, pointerEvents: uploading ? 'none' : 'auto' }}
          onClick={() => document.getElementById('cover-file-input')?.click()}
        >
          <ImageIcon size={20} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
          <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
            {uploading ? 'Uploading…' : 'Drop image or click to upload'}
          </span>
        </div>
      )}

      <input
        id="cover-file-input"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={async e => {
          const file = e.target.files?.[0];
          if (file) await uploadAndUse(file);
          e.target.value = '';
        }}
      />

      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button
          onClick={() => document.getElementById('cover-file-input')?.click()}
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

      {/* URL input */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input value={urlInput} onChange={e => setUrlInput(e.target.value)} onBlur={() => onUrlChange(urlInput)}
          placeholder="Or paste image URL…" style={inputStyle} />
        {urlInput !== url && (
          <button onClick={() => onUrlChange(urlInput)}
            style={{ padding: '7px 10px', borderRadius: 5, border: 'none', background: 'var(--primary)', cursor: 'pointer', fontSize: 11, color: '#fff', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
            Apply
          </button>
        )}
      </div>

      {/* Alt text toggle */}
      <button onClick={() => setShowAlt(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif', padding: '2px 0' }}>
        {showAlt ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        Alt text (accessibility)
      </button>

      {showAlt && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Alt (EN)</label>
            <input value={altEn} onChange={e => onAltEnChange(e.target.value)} placeholder="Describe the image in English" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Alt (AR)</label>
            <input value={altAr} onChange={e => onAltArChange(e.target.value)} placeholder="صف الصورة بالعربية" style={{ ...inputStyle, direction: 'rtl', fontFamily: 'serif' }} dir="rtl" />
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
          onAltEnChange(nextAltEn);
          onAltArChange(nextAltAr);
          setUrlInput(asset.url);
        }}
      />
    </div>
  );
}

// ─── Publish checklist ────────────────────────────────────────────────────────

interface CheckItem { key: string; label: string; pass: boolean; detail: string; }

function PublishChecklist({ article }: { article: Article }) {
  const checks: CheckItem[] = [
    { key: 'titleEn', label: 'English title', pass: !!article.titleEn.trim(), detail: article.titleEn.trim() || 'Required' },
    { key: 'titleAr', label: 'Arabic title', pass: !!article.titleAr.trim(), detail: article.titleAr.trim() || 'Required' },
    { key: 'slug', label: 'URL slug', pass: !!article.slug.startsWith('/'), detail: article.slug || 'Must start with /' },
    { key: 'excerptEn', label: 'English excerpt', pass: !!article.excerptEn.trim(), detail: article.excerptEn.trim() || 'Required for SEO' },
    { key: 'excerptAr', label: 'Arabic excerpt', pass: !!article.excerptAr.trim(), detail: article.excerptAr.trim() || 'Required for SEO' },
    { key: 'cover', label: 'Cover image', pass: !!article.coverImageUrl.trim(), detail: article.coverImageUrl ? 'Set' : 'Missing' },
    { key: 'bodyEn', label: 'English body', pass: article.bodyEn.trim().length >= 100, detail: article.bodyEn.trim().length >= 100 ? `${article.bodyEn.trim().split(/\s+/).length} words` : 'Too short (< 100 chars)' },
    { key: 'bodyAr', label: 'Arabic body', pass: article.bodyAr.trim().length >= 50, detail: article.bodyAr.trim().length >= 50 ? `${article.bodyAr.trim().split(/\s+/).length} words` : 'Too short' },
    { key: 'altEn', label: 'Cover alt (EN)', pass: !!article.coverAltEn.trim(), detail: article.coverAltEn.trim() || 'Missing — accessibility' },
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
        <div style={{ height: '100%', width: `${(passCount / checks.length) * 100}%`, background: allPass ? '#2DA457' : passCount >= 6 ? '#C47F17' : '#D11B3A', transition: 'width 0.3s, background 0.3s' }} />
      </div>
      {checks.map((c, i) => (
        <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderBottom: i < checks.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.pass ? '#E6F4EA' : '#FEE2E2' }}>
            {c.pass
              ? <Check size={9} strokeWidth={3} style={{ color: '#1A7B3C' }} />
              : <X size={9} strokeWidth={3} style={{ color: '#B91C1C' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--foreground)' }}>{c.label}</div>
            <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: c.pass ? 'var(--muted-foreground)' : '#B91C1C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {c.detail}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Sidebar right ────────────────────────────────────────────────────────────

function EditorSidebar({ article, lang, onChange, onSaveDraft, onPublish, onUnpublish, saved }: {
  article: Article;
  lang: Lang;
  onChange: (patch: Partial<Article>) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  saved: boolean;
}) {
  const allChecksPass = !!(
    article.titleEn.trim() && article.titleAr.trim() && article.slug.startsWith('/') &&
    article.excerptEn.trim() && article.excerptAr.trim() &&
    article.coverImageUrl.trim() && article.bodyEn.trim().length >= 100 &&
    article.bodyAr.trim().length >= 50 && article.coverAltEn.trim()
  );

  const STATUS_CFG: Record<ArticleStatus, { label: string; bg: string; color: string; dot: string }> = {
    published: { label: 'Published', bg: '#E6F4EA', color: '#1A7B3C', dot: '#2DA457' },
    draft:     { label: 'Draft',     bg: '#EEF0F4', color: '#4A5060', dot: '#8A90A0' },
    archived:  { label: 'Archived',  bg: '#FFF4E5', color: '#8C4A00', dot: '#D4860A' },
  };
  const cfg = STATUS_CFG[article.status];
  const currentHeadings = extractMarkdownHeadings(lang === 'ar' ? article.bodyAr : article.bodyEn);

  const btnBase: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '8px', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' };

  const selectStyle: React.CSSProperties = {
    width: '100%', background: 'var(--input-background)', border: '1px solid var(--border)',
    borderRadius: 5, padding: '7px 9px', fontSize: 12, color: 'var(--foreground)',
    fontFamily: 'Inter, sans-serif', cursor: 'pointer', outline: 'none',
  };

  return (
    <aside style={{ width: 260, minWidth: 260, borderLeft: '1px solid var(--border)', background: 'var(--card)', overflowY: 'auto', flexShrink: 0 }}>
      <div style={{ padding: '14px 16px' }}>

        {/* Status */}
        <SectionLabel label="Status" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Current</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: cfg.bg, color: cfg.color, fontSize: 10, fontFamily: 'DM Mono, monospace', padding: '3px 8px', borderRadius: 10 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
            {cfg.label}
          </span>
        </div>
        {article.publishedAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12, fontSize: 10, color: 'var(--muted-foreground)' }}>
            <Calendar size={10} />
            {formatDate(article.publishedAt)}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <button onClick={onSaveDraft}
            style={{ ...btnBase, background: saved ? 'rgba(45,164,87,0.15)' : 'var(--input-background)', border: '1px solid var(--border)', color: saved ? '#1A7B3C' : 'var(--foreground)', fontWeight: 500, transition: 'background 0.2s' }}>
            {saved ? <><Check size={12} /> Saved</> : <><Save size={12} /> Save Draft</>}
          </button>

          {article.status !== 'published' ? (
            <button onClick={allChecksPass ? onPublish : undefined} title={!allChecksPass ? 'Fix checklist items first' : undefined}
              style={{ ...btnBase, background: allChecksPass ? 'var(--primary)' : 'var(--muted)', border: 'none', color: allChecksPass ? '#fff' : 'var(--muted-foreground)', fontWeight: 600, opacity: allChecksPass ? 1 : 0.6, cursor: allChecksPass ? 'pointer' : 'not-allowed' }}>
              <Send size={12} /> Publish Article
            </button>
          ) : (
            <button onClick={onUnpublish}
              style={{ ...btnBase, background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600 }}>
              <EyeOff size={12} /> Unpublish
            </button>
          )}
        </div>

        {!allChecksPass && (
          <div style={{ display: 'flex', gap: 7, padding: '8px 10px', background: '#FFF8EC', border: '1px solid rgba(196,127,23,0.25)', borderRadius: 6, marginBottom: 14 }}>
            <AlertCircle size={13} style={{ color: '#C47F17', flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 10, color: '#7A4D0A', lineHeight: 1.5 }}>Complete the checklist before publishing.</span>
          </div>
        )}

        {/* Checklist */}
        <PublishChecklist article={article} />

        {/* Headings outline */}
        <SectionLabel label="Headings" />
        <div style={{ border: '1px solid var(--border)', borderRadius: 6, background: 'var(--input-background)', marginBottom: 14, overflow: 'hidden' }}>
          {currentHeadings.length > 0 ? (
            currentHeadings.map((heading, index) => (
              <div
                key={`${heading.text}-${index}`}
                style={{
                  display: 'flex',
                  gap: 8,
                  padding: '8px 10px',
                  borderBottom: index < currentHeadings.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#A56A1E', paddingTop: 2 }}>
                  H{heading.level}
                </span>
                <span style={{
                  fontSize: 11,
                  color: 'var(--foreground)',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                }}>
                  {heading.text}
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '10px 12px', fontSize: 11, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
              No headlines were assigned yet. Select a sentence in the editor and click the arrow button to turn it into a headline.
            </div>
          )}
        </div>

        {/* Metadata */}
        <SectionLabel label="Details" />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Category (EN)</label>
          <select value={article.categoryEn} onChange={e => onChange({ categoryEn: e.target.value })} style={selectStyle}>
            {ARTICLE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Field label="Category (AR)" value={article.categoryAr} onChange={v => onChange({ categoryAr: v })} rtl placeholder="مثلاً: قانون الشركات" />
        <Field label="Author (EN)" value={article.authorEn} onChange={v => onChange({ authorEn: v })} placeholder="e.g. Omar Al-Rashid" required />
        <Field label="Author (AR)" value={article.authorAr} onChange={v => onChange({ authorAr: v })} rtl placeholder="مثلاً: عمر الرشيد" />
        <Field label="Read Time (EN)" value={article.readTimeEn} onChange={v => onChange({ readTimeEn: v })} placeholder="e.g. 6 min read" />
        <Field label="Read Time (AR)" value={article.readTimeAr} onChange={v => onChange({ readTimeAr: v })} rtl placeholder="مثلاً: 6 دقائق قراءة" />

        {/* SEO */}
        <SectionLabel label="SEO" />
        <Field label="SEO Title (EN)" value={article.seoTitleEn} onChange={v => onChange({ seoTitleEn: v })} placeholder="Auto-generated from title" />
        <Field label="Meta Desc (EN)" value={article.seoDescEn} onChange={v => onChange({ seoDescEn: v })} multiline placeholder="150–160 character summary" />
        <Field label="SEO Title (AR)" value={article.seoTitleAr} onChange={v => onChange({ seoTitleAr: v })} rtl placeholder="عنوان SEO بالعربية" />
        <Field label="Meta Desc (AR)" value={article.seoDescAr} onChange={v => onChange({ seoDescAr: v })} multiline rtl placeholder="ملخص 150–160 حرف" />

        {/* Timestamps */}
        <SectionLabel label="Info" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['Created', formatDate(article.createdAt)],
            ['Updated', formatDate(article.updatedAt)],
            ['Author', article.author],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{k}</span>
              <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--foreground)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── Main editor ──────────────────────────────────────────────────────────────

interface ArticleEditorProps {
  article: Article;
  onBack: () => void;
  onSave: (article: Article) => void;
  onPublish: (slug: string) => void;
  onUnpublish: (slug: string) => void;
  initialLang?: Lang;
}

export function ArticleEditor({ article: initialArticle, onBack, onSave, onPublish, onUnpublish, initialLang = 'en' }: ArticleEditorProps) {
  const [article, setArticle] = useState<Article>(initialArticle);
  const [lang, setLang] = useState<Lang>(initialLang);
  const [saved, setSaved] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  function patch(p: Partial<Article>) {
    setArticle(prev => ({ ...prev, ...p, updatedAt: new Date().toISOString() }));
    setSaved(false);
  }

  function handleTitleEnChange(v: string) {
    setArticle(prev => ({
      ...prev,
      titleEn: v,
      slug: slugEdited ? prev.slug : slugify(v),
      updatedAt: new Date().toISOString(),
    }));
    setSaved(false);
  }

  function handleSaveDraft() {
    onSave({ ...article, updatedAt: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handlePublish() {
    const updated = { ...article, status: 'published' as ArticleStatus, publishedAt: new Date().toISOString() };
    setArticle(updated);
    onSave(updated);
    onPublish(article.slug);
  }

  function handleUnpublish() {
    const updated = { ...article, status: 'draft' as ArticleStatus };
    setArticle(updated);
    onSave(updated);
    onUnpublish(article.slug);
  }

  // Auto-calculate read time when body changes
  useEffect(() => {
    if (article.bodyEn) {
      const rt = readTimeFromBody(article.bodyEn);
      if (rt !== article.readTimeEn) {
        setArticle(prev => ({ ...prev, readTimeEn: rt }));
      }
    }
  }, [article.bodyEn]);

  const STATUS_LABELS: Record<ArticleStatus, string> = {
    published: 'Published', draft: 'Draft', archived: 'Archived',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Inter, sans-serif', background: 'var(--background)' }}>
      {/* Header */}
      <header style={{ height: 48, background: 'var(--card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0 }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid var(--border)', borderRadius: 5, cursor: 'pointer', padding: '5px 10px', color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif', fontSize: 12 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}
        >
          <ArrowLeft size={13} /> Back to Articles
        </button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lang === 'ar' ? (article.titleAr || article.titleEn) : article.titleEn}
          </span>
          <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', padding: '2px 6px', borderRadius: 3, color: article.status === 'published' ? '#2DA457' : 'rgba(100,100,120,0.7)', background: article.status === 'published' ? 'rgba(45,164,87,0.12)' : 'rgba(0,0,0,0.06)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
            {STATUS_LABELS[article.status]}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Unsaved indicator */}
          {!saved && article.updatedAt !== initialArticle.updatedAt && (
            <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace' }}>Unsaved changes</span>
          )}

          {/* Lang toggle */}
          <button onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--muted)', border: 'none', borderRadius: 5, cursor: 'pointer', padding: '5px 10px', color: 'var(--foreground)', fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 600 }}>
            <Globe size={12} /> {lang.toUpperCase()}
          </button>

          {/* Save */}
          <button onClick={handleSaveDraft}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: saved ? 'rgba(45,164,87,0.15)' : 'var(--primary)', border: 'none', borderRadius: 5, cursor: 'pointer', padding: '5px 14px', color: saved ? '#1A7B3C' : '#fff', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, transition: 'background 0.2s' }}>
            {saved ? <><Check size={12} /> Saved</> : <><Save size={12} /> Save</>}
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', maxWidth: 860, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ display: 'inline-flex', background: 'var(--muted)', borderRadius: 6, padding: 2 }}>
              {(['en', 'ar'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ padding: '5px 16px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'DM Mono, monospace', fontWeight: 600, background: lang === l ? 'var(--card)' : 'transparent', color: lang === l ? 'var(--foreground)' : 'var(--muted-foreground)', boxShadow: lang === l ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
                  {l === 'en' ? '🇬🇧 English focus' : '🇸🇦 Arabic focus'}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace' }}>
              Both languages are edited together below.
            </span>
          </div>

          <EditorCard title="Shared settings" subtitle="These fields apply to the article once." rtl={lang === 'ar'}>
            <TwoColumnFields
              left={
                <Field
                  label="URL Slug *"
                  value={article.slug}
                  onChange={v => { patch({ slug: v }); setSlugEdited(true); }}
                  placeholder="/article-slug"
                  mono
                />
              }
              right={
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Cover Image</label>
                  <CoverImageUploader
                    url={article.coverImageUrl}
                    onUrlChange={v => patch({ coverImageUrl: v })}
                    altEn={article.coverAltEn}
                    onAltEnChange={v => patch({ coverAltEn: v })}
                    altAr={article.coverAltAr}
                    onAltArChange={v => patch({ coverAltAr: v })}
                  />
                </div>
              }
            />
          </EditorCard>

          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
            <EditorCard title="English content" subtitle="Write the English version." rtl={false}>
              <Field
                label="Title (English) *"
                value={article.titleEn}
                onChange={v => handleTitleEnChange(v)}
                placeholder="Article title in English…"
                required
              />
              <Field
                label="Excerpt (English) *"
                value={article.excerptEn}
                onChange={v => patch({ excerptEn: v })}
                multiline
                required
                placeholder="A 1–2 sentence summary that appears in article listings and social sharing…"
              />
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Body (English) * — Markdown</label>
                  {article.bodyEn && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--muted-foreground)' }}>
                      <Clock size={10} /> {readTimeFromBody(article.bodyEn)}
                    </div>
                  )}
                </div>
                <MarkdownEditor value={article.bodyEn} onChange={v => patch({ bodyEn: v })} placeholder="Write the article body in Markdown. Use ## for headings, **bold**, *italic*, - for lists…" />
              </div>
              <Field label="SEO Title (EN)" value={article.seoTitleEn} onChange={v => patch({ seoTitleEn: v })} placeholder="Auto-generated from title" />
              <Field label="Meta Desc (EN)" value={article.seoDescEn} onChange={v => patch({ seoDescEn: v })} multiline placeholder="150–160 character summary" />
            </EditorCard>

            <EditorCard title="Arabic content" subtitle="Write the Arabic version." rtl>
              <Field
                label="Title (Arabic) *"
                value={article.titleAr}
                onChange={v => patch({ titleAr: v })}
                placeholder="عنوان المقال بالعربية…"
                rtl
                required
              />
              <Field
                label="Excerpt (Arabic) *"
                value={article.excerptAr}
                onChange={v => patch({ excerptAr: v })}
                multiline
                rtl
                required
                placeholder="ملخص المقال بجملة أو جملتين…"
              />
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Body (Arabic) * — Markdown</label>
                  {article.bodyAr && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--muted-foreground)' }}>
                      <Clock size={10} /> {readTimeFromBody(article.bodyAr)}
                    </div>
                  )}
                </div>
                <MarkdownEditor value={article.bodyAr} onChange={v => patch({ bodyAr: v })} rtl placeholder="اكتب محتوى المقال بالعربية…" />
              </div>
              <Field label="SEO Title (AR)" value={article.seoTitleAr} onChange={v => patch({ seoTitleAr: v })} rtl placeholder="عنوان SEO بالعربية" />
              <Field label="Meta Desc (AR)" value={article.seoDescAr} onChange={v => patch({ seoDescAr: v })} multiline rtl placeholder="ملخص 150–160 حرف" />
            </EditorCard>
          </div>

          <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--muted)', borderRadius: 6, fontSize: 11, color: 'var(--muted-foreground)' }}>
            Shared fields are edited once. Titles, excerpts, body text, and SEO fields are shown side by side so you can work in both languages together.
          </div>
        </div>

        {/* Sidebar */}
        <EditorSidebar
          article={article}
          lang={lang}
          onChange={patch}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          saved={saved}
        />
      </div>
    </div>
  );
}
