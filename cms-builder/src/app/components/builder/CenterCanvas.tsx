import { useRef, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, X as XIcon } from 'lucide-react';
import type { Block, Lang } from './types';
import { BlockPreview } from './BlockPreview';

export type Viewport = 'desktop' | 'tablet' | 'mobile';

interface CenterCanvasProps {
  blocks: Block[];
  lang: Lang;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  pageTitle: string;
  pageSlug: string;
  previewMode?: boolean;
  viewport?: Viewport;
  onViewportChange?: (v: Viewport) => void;
  onExitPreview?: () => void;
}

const VIEWPORT_WIDTHS: Record<Viewport, number | null> = {
  desktop: null,   // no constraint
  tablet:  768,
  mobile:  390,
};

const VIEWPORT_ICONS: Record<Viewport, React.ElementType> = {
  desktop: Monitor,
  tablet:  Tablet,
  mobile:  Smartphone,
};

export function CenterCanvas({
  blocks, lang, selectedBlockId, onSelectBlock,
  pageTitle, pageSlug,
  previewMode = false,
  viewport = 'desktop',
  onViewportChange,
  onExitPreview,
}: CenterCanvasProps) {
  const selectedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedBlockId]);

  const maxWidth = VIEWPORT_WIDTHS[viewport];
  const canvasWidth = maxWidth ? maxWidth : 900;

  return (
    <div
      className="flex-1 overflow-hidden flex flex-col"
      style={{ background: previewMode ? '#1A1B24' : '#E8E8E6' }}
    >
      {/* Toolbar */}
      <div
        style={{
          background: previewMode ? '#12131C' : 'var(--card)',
          borderBottom: `1px solid ${previewMode ? 'rgba(255,255,255,0.06)' : 'var(--border)'}`,
          padding: '0 16px',
          height: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        {previewMode ? (
          <>
            {/* Preview mode toolbar */}
            <span
              style={{
                fontSize: 10, fontFamily: 'DM Mono, monospace', fontWeight: 600,
                color: '#2DA457', background: 'rgba(45,164,87,0.12)',
                padding: '2px 8px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase',
              }}
            >
              ● Preview
            </span>

            {/* Viewport selector */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              {(['desktop', 'tablet', 'mobile'] as Viewport[]).map(v => {
                const Icon = VIEWPORT_ICONS[v];
                const active = viewport === v;
                return (
                  <button
                    key={v}
                    onClick={() => onViewportChange?.(v)}
                    title={v.charAt(0).toUpperCase() + v.slice(1)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 5, border: 'none',
                      background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                      cursor: 'pointer', color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                      fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: active ? 500 : 400,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}
                  >
                    <Icon size={13} />
                    <span style={{ textTransform: 'capitalize' }}>{v}</span>
                    {VIEWPORT_WIDTHS[v] && (
                      <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', opacity: 0.55 }}>
                        {VIEWPORT_WIDTHS[v]}px
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Exit preview */}
            <button
              onClick={onExitPreview}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 5,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                fontSize: 11, fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; }}
            >
              <XIcon size={12} />
              Exit Preview
            </button>
          </>
        ) : (
          <>
            {/* Edit mode toolbar */}
            <div
              style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--input-background)', borderRadius: 5,
                padding: '4px 10px', maxWidth: 360,
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace' }}>
                {lang === 'ar' ? '←' : '→'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--foreground)', fontFamily: 'DM Mono, monospace', flex: 1 }}>
                alrashid-law.com{pageSlug}
              </span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}>
              {lang === 'en' ? 'English' : 'Arabic'} · {blocks.length} block{blocks.length !== 1 ? 's' : ''}
            </span>
          </>
        )}
      </div>

      {/* Scrollable canvas */}
      <div
        style={{ flex: 1, overflowY: 'auto', padding: previewMode ? '24px 0' : '20px' }}
        onClick={() => !previewMode && onSelectBlock(null)}
      >
        {/* Viewport size indicator for non-desktop */}
        {previewMode && viewport !== 'desktop' && (
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>
              {viewport.toUpperCase()} · {VIEWPORT_WIDTHS[viewport]}px
            </span>
          </div>
        )}

        <div
          style={{
            maxWidth: canvasWidth,
            margin: '0 auto',
            background: '#fff',
            boxShadow: previewMode
              ? '0 8px 40px rgba(0,0,0,0.4)'
              : '0 2px 24px rgba(0,0,0,0.12)',
            borderRadius: viewport === 'mobile' ? 24 : 6,
            overflow: 'hidden',
            transition: 'max-width 0.3s ease, border-radius 0.3s ease',
          }}
        >
          {/* Browser chrome (edit mode only) */}
          {!previewMode && (
            <div
              style={{
                background: '#F0F0EE', height: 36, display: 'flex', alignItems: 'center',
                gap: 6, padding: '0 12px', borderBottom: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840', display: 'inline-block' }} />
              <div style={{ flex: 1, background: '#fff', borderRadius: 4, padding: '3px 10px', marginLeft: 8, fontSize: 11, color: '#888', fontFamily: 'DM Mono, monospace' }}>
                alrashid-law.com{pageSlug}
              </div>
            </div>
          )}

          {/* Mobile status bar (preview mode + mobile viewport) */}
          {previewMode && viewport === 'mobile' && (
            <div style={{ background: '#12131C', height: 28, display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: '#fff', fontFamily: 'DM Mono, monospace' }}>9:41</span>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontFamily: 'DM Mono, monospace' }}>●●●●</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontFamily: 'DM Mono, monospace' }}>WiFi</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontFamily: 'DM Mono, monospace' }}>100%</span>
              </div>
            </div>
          )}

          {/* Block renders */}
          {blocks.length === 0 ? (
            <div style={{ padding: '80px 40px', textAlign: 'center', color: '#999', fontFamily: 'Inter, sans-serif' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>+</div>
              <div style={{ fontSize: 14 }}>No blocks yet — add one from the panel on the left</div>
            </div>
          ) : (
            blocks.map(block => (
              <div
                key={block.id}
                ref={block.id === selectedBlockId ? selectedRef : undefined}
                style={{ display: block.collapsed ? 'none' : 'block' }}
              >
                <BlockPreview
                  block={block}
                  lang={lang}
                  isSelected={!previewMode && block.id === selectedBlockId}
                  onClick={previewMode ? () => {} : () => onSelectBlock(block.id === selectedBlockId ? null : block.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
