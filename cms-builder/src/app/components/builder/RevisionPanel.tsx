import { useEffect, useState } from 'react';
import { Clock, RotateCcw, ChevronDown, ChevronUp, Eye, Check, X, AlertCircle } from 'lucide-react';
import type { BuilderPage } from './types';
import type { ApiRevision } from '../../api/types';
import { backendApi } from '../../api/backend';

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

const STATUS_DOT: Record<string, string> = {
  published: '#2DA457', draft: '#8A90A0', hidden: '#D4860A',
};

// ─── Revision entry ───────────────────────────────────────────────────────────

function RevisionEntry({ rev, isActive, onPreview, onRestore, restoringId }: {
  rev: ApiRevision;
  isActive: boolean;
  onPreview: () => void;
  onRestore: () => void;
  restoringId: string | null;
}) {
  const [hovered, setHovered] = useState(false);
  const isRestoring = restoringId === rev.id;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0',
        borderBottom: '1px solid var(--border)',
        background: isActive ? 'rgba(196,127,23,0.05)' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      {/* Timeline dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3, flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? 'var(--primary)' : 'var(--muted-foreground)', flexShrink: 0 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--foreground)' }}>{rev.note}</span>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9,
              fontFamily: 'DM Mono, monospace', padding: '1px 5px', borderRadius: 10,
              background: 'var(--muted)', color: 'var(--muted-foreground)',
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: STATUS_DOT[rev.status] ?? '#999', display: 'inline-block' }} />
            {rev.status}
          </span>
          {isActive && (
            <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--primary)', background: 'rgba(196,127,23,0.12)', padding: '1px 6px', borderRadius: 10 }}>
              CURRENT
            </span>
          )}
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>
          {rev.author} · {relativeTime(rev.createdAt)} · {rev.blocks.length} block{rev.blocks.length !== 1 ? 's' : ''}
        </div>

        {/* Actions — visible on hover */}
        {(hovered || isRestoring) && (
          <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
            <button
              onClick={onPreview}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 8px', borderRadius: 4,
                background: 'var(--input-background)', border: '1px solid var(--border)',
                cursor: 'pointer', fontSize: 10, color: 'var(--muted-foreground)',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}
            >
              <Eye size={10} /> Preview
            </button>
            {!isActive && (
              <button
                onClick={onRestore}
                disabled={!!restoringId}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 8px', borderRadius: 4,
                  background: isRestoring ? 'rgba(196,127,23,0.15)' : 'var(--input-background)',
                  border: `1px solid ${isRestoring ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: restoringId ? 'not-allowed' : 'pointer', fontSize: 10,
                  color: isRestoring ? 'var(--primary)' : 'var(--muted-foreground)',
                  fontFamily: 'Inter, sans-serif', opacity: restoringId && !isRestoring ? 0.4 : 1,
                }}
              >
                <RotateCcw size={10} /> {isRestoring ? 'Restoring…' : 'Restore'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Snapshot button ──────────────────────────────────────────────────────────

function SnapshotForm({ onSave, onCancel }: { onSave: (note: string) => void; onCancel: () => void }) {
  const [note, setNote] = useState('Manual snapshot');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 0 12px', borderBottom: '1px solid var(--border)' }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)' }}>Snapshot label</label>
      <input
        value={note}
        onChange={e => setNote(e.target.value)}
        style={{
          background: 'var(--input-background)', border: '1px solid var(--border)',
          borderRadius: 5, padding: '6px 9px', fontSize: 12, color: 'var(--foreground)',
          fontFamily: 'Inter, sans-serif', outline: 'none',
        }}
        autoFocus
      />
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '6px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--input-background)', cursor: 'pointer', fontSize: 11, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif' }}>
          Cancel
        </button>
        <button
          onClick={() => note.trim() && onSave(note.trim())}
          style={{ flex: 1, padding: '6px', borderRadius: 5, border: 'none', background: 'var(--primary)', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ─── Preview modal ────────────────────────────────────────────────────────────

function RevisionPreviewModal({ rev, onClose, onRestore }: {
  rev: ApiRevision;
  onClose: () => void;
  onRestore: () => void;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--card)', borderRadius: 10, width: 480, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <Clock size={14} style={{ color: 'var(--muted-foreground)', marginRight: 8 }} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>Revision: {rev.note}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
            <X size={15} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: 16, flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 12 }}>
            {rev.author} · {new Date(rev.createdAt).toLocaleString('en-GB')} · Status: {rev.status}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rev.blocks.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', padding: '20px 0', textAlign: 'center' }}>
                No blocks in this revision
              </div>
            )}
            {rev.blocks.map((block, i) => (
              <div key={block.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--muted)', borderRadius: 6 }}>
                <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', width: 18, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 12, color: 'var(--foreground)', fontWeight: 500 }}>
                  {(block.data as any)?.headingEn || (block.data as any)?.titleEn || block.type}
                </span>
                <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', marginLeft: 'auto' }}>{block.type}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--input-background)', cursor: 'pointer', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif' }}>
            Close
          </button>
          <button onClick={() => { onRestore(); onClose(); }} style={{ padding: '7px 14px', borderRadius: 5, border: 'none', background: 'var(--primary)', cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
            <RotateCcw size={12} /> Restore this version
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface RevisionPanelProps {
  page: BuilderPage;
  onRestore: (blocks: BuilderPage['blocks'], status: BuilderPage['status']) => void;
}

export function RevisionPanel({ page, onRestore }: RevisionPanelProps) {
  const [revisions, setRevisions] = useState<ApiRevision[]>([]);
  const [showSnapshotForm, setShowSnapshotForm] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [previewingRev, setPreviewingRev] = useState<ApiRevision | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<ApiRevision | null>(null);
  const [showAll, setShowAll] = useState(false);

  const displayedRevisions = showAll ? revisions : revisions.slice(0, 5);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const loaded = await backendApi.listRevisions(page.slug);
        if (!cancelled) {
          setRevisions(loaded);
        }
      } catch {
        if (!cancelled) {
          setRevisions([]);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [page.slug]);

  async function handleSnapshot(note: string) {
    const rev = await backendApi.saveRevision(page.slug, {
      label: `${note} — ${new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`,
      status: page.status,
      blocks: JSON.parse(JSON.stringify(page.blocks)),
      author: 'CMS Editor',
      note,
    });
    setRevisions((current) => [rev, ...current]);
    setShowSnapshotForm(false);
  }

  async function handleRestore(rev: ApiRevision) {
    setRestoringId(rev.id);
    await new Promise(r => setTimeout(r, 600));
    const restored = await backendApi.restoreRevision(page.slug, rev.id);
    onRestore(restored.blocks as unknown as BuilderPage['blocks'], restored.status);
    const refresh = await backendApi.listRevisions(page.slug);
    setRevisions(refresh);
    setRestoringId(null);
    setRestoreConfirm(null);
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Section header */}
      <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 0 8px', borderBottom: '1px solid var(--border)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Revision History</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>{revisions.length} snapshot{revisions.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Save snapshot */}
      {!showSnapshotForm ? (
        <button
          onClick={() => setShowSnapshotForm(true)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', padding: '7px', borderRadius: 5,
            background: 'var(--input-background)', border: '1px dashed var(--border)',
            cursor: 'pointer', fontSize: 11, color: 'var(--muted-foreground)',
            fontFamily: 'Inter, sans-serif', marginBottom: 12, transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}
        >
          <Clock size={11} /> Save current snapshot
        </button>
      ) : (
        <SnapshotForm onSave={handleSnapshot} onCancel={() => setShowSnapshotForm(false)} />
      )}

      {/* Empty state */}
      {revisions.length === 0 && (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted-foreground)' }}>
          <Clock size={24} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
          <div style={{ fontSize: 12 }}>No revision history yet.</div>
          <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>Snapshots are created automatically on publish, or manually above.</div>
        </div>
      )}

      {/* Revision list */}
      {revisions.length > 0 && (
        <div style={{ position: 'relative' }}>
          {/* Vertical timeline line */}
          <div style={{ position: 'absolute', left: 3, top: 0, bottom: 0, width: 1, background: 'var(--border)' }} />
          <div style={{ paddingLeft: 4 }}>
            {displayedRevisions.map((rev, i) => (
              <RevisionEntry
                key={rev.id}
                rev={rev}
                isActive={i === 0}
                onPreview={() => setPreviewingRev(rev)}
                onRestore={() => setRestoreConfirm(rev)}
                restoringId={restoringId}
              />
            ))}
          </div>

          {revisions.length > 5 && (
            <button
              onClick={() => setShowAll(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}
            >
              {showAll ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showAll ? 'Show less' : `Show ${revisions.length - 5} older…`}
            </button>
          )}
        </div>
      )}

      {/* Restore confirm */}
      {restoreConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--card)', borderRadius: 10, width: 360, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AlertCircle size={18} style={{ color: '#C47F17', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>Restore this version?</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5, margin: '0 0 16px' }}>
              This will replace the current page content with the snapshot from "{restoreConfirm.note}". The current state will be saved as a new snapshot first.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setRestoreConfirm(null)} style={{ flex: 1, padding: '8px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--input-background)', cursor: 'pointer', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif' }}>
                Cancel
              </button>
              <button onClick={() => handleRestore(restoreConfirm)} style={{ flex: 1, padding: '8px', borderRadius: 5, border: 'none', background: 'var(--primary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <RotateCcw size={12} /> Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewingRev && (
        <RevisionPreviewModal
          rev={previewingRev}
          onClose={() => setPreviewingRev(null)}
          onRestore={() => { setRestoreConfirm(previewingRev); setPreviewingRev(null); }}
        />
      )}
    </div>
  );
}
