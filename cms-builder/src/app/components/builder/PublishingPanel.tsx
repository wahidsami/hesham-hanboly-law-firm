import { useState } from 'react';
import { Check, X, AlertCircle, Clock, Send, Eye, FileText, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import type { BuilderPage } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckItem {
  key: string;
  label: string;
  detail: string;
  pass: boolean;
}

interface LogEntry {
  id: string;
  action: string;
  user: string;
  ts: string; // ISO
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

function makeLog(): LogEntry[] {
  const now = Date.now();
  return [
    { id: '1', action: 'Page created', user: 'Sarah A.', ts: new Date(now - 5 * 86400000).toISOString() },
    { id: '2', action: 'Content added', user: 'Karim M.', ts: new Date(now - 3 * 86400000).toISOString() },
    { id: '3', action: 'Draft saved', user: 'Sarah A.', ts: new Date(now - 2 * 3600000).toISOString() },
  ];
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CFG = {
  published: { label: 'Published', bg: '#E6F4EA', color: '#1A7B3C', dot: '#2DA457' },
  draft:     { label: 'Draft',     bg: '#EEF0F4', color: '#4A5060', dot: '#8A90A0' },
  hidden:    { label: 'Hidden',    bg: '#FFF4E5', color: '#8C4A00', dot: '#D4860A' },
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface PublishingPanelProps {
  page: BuilderPage;
  onSaveDraft: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onPreview: () => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PublishingPanel({ page, onSaveDraft, onPublish, onUnpublish, onPreview }: PublishingPanelProps) {
  const [log, setLog] = useState<LogEntry[]>(makeLog);
  const [showLog, setShowLog] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────
  const checks: CheckItem[] = [
    {
      key: 'titleEn',
      label: 'Page title (EN)',
      detail: page.titleEn.trim() ? page.titleEn : 'Title is empty',
      pass: !!page.titleEn.trim(),
    },
    {
      key: 'titleAr',
      label: 'Page title (AR)',
      detail: page.titleAr.trim() ? page.titleAr : 'Arabic title is empty',
      pass: !!page.titleAr.trim(),
    },
    {
      key: 'slug',
      label: 'URL slug',
      detail: page.slug && page.slug.startsWith('/') ? page.slug : 'Must start with /',
      pass: !!page.slug && page.slug.startsWith('/'),
    },
    {
      key: 'seo',
      label: 'SEO meta title',
      detail: page.seoTitleEn.trim() ? page.seoTitleEn : 'SEO title is empty',
      pass: !!page.seoTitleEn.trim(),
    },
    {
      key: 'blocks',
      label: 'Has content blocks',
      detail: page.blocks.length > 0 ? `${page.blocks.length} block${page.blocks.length !== 1 ? 's' : ''}` : 'Add at least one block',
      pass: page.blocks.length > 0,
    },
  ];

  const allPass = checks.every(c => c.pass);
  const passCount = checks.filter(c => c.pass).length;
  const cfg = STATUS_CFG[page.status];

  function addLog(action: string) {
    setLog(prev => [
      { id: Date.now().toString(), action, user: 'Sarah A.', ts: new Date().toISOString() },
      ...prev,
    ].slice(0, 8));
  }

  function handleSaveDraft() {
    onSaveDraft();
    addLog('Draft saved');
  }

  function handlePublish() {
    onPublish();
    addLog('Page published');
  }

  function handleUnpublish() {
    onUnpublish();
    addLog('Page unpublished');
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Section label */}
      <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 0 8px', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
        Publishing
      </div>

      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Current status</span>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: cfg.bg, color: cfg.color,
            fontSize: 11, fontFamily: 'DM Mono, monospace', fontWeight: 500,
            padding: '3px 8px', borderRadius: 20,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
          {cfg.label}
        </span>
      </div>

      {/* Validation checklist */}
      <div style={{ background: 'var(--input-background)', borderRadius: 7, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--foreground)' }}>Validation</span>
          <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: allPass ? '#1A7B3C' : 'var(--muted-foreground)' }}>
            {passCount}/{checks.length}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: 'var(--muted)' }}>
          <div
            style={{
              height: '100%',
              width: `${(passCount / checks.length) * 100}%`,
              background: allPass ? '#2DA457' : passCount >= 3 ? '#C47F17' : '#D11B3A',
              transition: 'width 0.3s, background 0.3s',
            }}
          />
        </div>

        {checks.map((c, i) => (
          <div
            key={c.key}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              borderBottom: i < checks.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div
              style={{
                width: 18, height: 18, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: c.pass ? '#E6F4EA' : '#FEE2E2',
              }}
            >
              {c.pass
                ? <Check size={10} style={{ color: '#1A7B3C' }} strokeWidth={2.5} />
                : <X size={10} style={{ color: '#B91C1C' }} strokeWidth={2.5} />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--foreground)' }}>{c.label}</div>
              <div style={{ fontSize: 10, color: c.pass ? 'var(--muted-foreground)' : '#B91C1C', fontFamily: 'DM Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.detail}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Readiness callout */}
      {!allPass && (
        <div style={{ display: 'flex', gap: 8, padding: '9px 10px', background: '#FFF8EC', border: '1px solid rgba(196,127,23,0.25)', borderRadius: 6, marginBottom: 14 }}>
          <AlertCircle size={14} style={{ color: '#C47F17', flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 11, color: '#7A4D0A', lineHeight: 1.5 }}>
            Fix {checks.length - passCount} issue{checks.length - passCount !== 1 ? 's' : ''} before publishing.
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {/* Save draft */}
        <button
          onClick={handleSaveDraft}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', padding: '8px', borderRadius: 5,
            background: 'var(--input-background)', border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: 12, fontWeight: 500,
            color: 'var(--foreground)', fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,0,0,0.2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
        >
          <FileText size={13} />
          Save Draft
        </button>

        {/* Preview */}
        <button
          onClick={onPreview}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', padding: '8px', borderRadius: 5,
            background: 'var(--input-background)', border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: 12, fontWeight: 500,
            color: 'var(--foreground)', fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,0,0,0.2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
        >
          <Eye size={13} />
          Preview Draft
        </button>

        {/* Publish / Unpublish */}
        {page.status === 'published' ? (
          <button
            onClick={handleUnpublish}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '9px', borderRadius: 5,
              background: 'var(--muted)', border: '1px solid var(--border)',
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
              color: 'var(--foreground)', fontFamily: 'Inter, sans-serif',
            }}
          >
            <Zap size={13} />
            Unpublish Page
          </button>
        ) : (
          <button
            onClick={allPass ? handlePublish : undefined}
            title={!allPass ? 'Fix validation errors first' : 'Publish page'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '9px', borderRadius: 5, border: 'none',
              background: allPass ? 'var(--primary)' : 'var(--muted)',
              cursor: allPass ? 'pointer' : 'not-allowed',
              fontSize: 12, fontWeight: 600,
              color: allPass ? '#fff' : 'var(--muted-foreground)',
              fontFamily: 'Inter, sans-serif',
              opacity: allPass ? 1 : 0.6,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { if (allPass) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
            onMouseLeave={e => { if (allPass) (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            <Send size={13} />
            Publish Page
          </button>
        )}
      </div>

      {/* Activity log */}
      <div>
        <button
          onClick={() => setShowLog(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
            fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={11} /> Activity
          </span>
          {showLog ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showLog && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {log.map((entry, i) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '7px 0',
                  borderBottom: i < log.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted-foreground)', flexShrink: 0, marginTop: 4 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--foreground)', fontWeight: 500 }}>{entry.action}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 1 }}>
                    {entry.user} · {relativeTime(entry.ts)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
