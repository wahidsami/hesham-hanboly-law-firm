import { X, LayoutTemplate, AlignLeft, Image, LayoutGrid, BarChart2, Megaphone, Quote, Users, Phone, HelpCircle, ImagePlus, Code2 } from 'lucide-react';
import type { BlockType } from './types';

interface BlockLibraryModalProps {
  onAdd: (type: BlockType) => void;
  onClose: () => void;
}

const BLOCK_DEFS: { type: BlockType; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { type: 'hero', label: 'Hero Banner', desc: 'Full-width hero with heading, subtitle, and CTAs', icon: LayoutTemplate, color: '#12131C' },
  { type: 'rich-text', label: 'Rich Text', desc: 'Multi-paragraph text with heading', icon: AlignLeft, color: '#3B5BDB' },
  { type: 'image-text', label: 'Image + Text', desc: 'Side-by-side image and content block', icon: Image, color: '#0CA678' },
  { type: 'cards', label: 'Cards / Grid', desc: 'Grid of feature or service cards', icon: LayoutGrid, color: '#7048E8' },
  { type: 'stats', label: 'Statistics', desc: 'Key metrics and numbers on dark background', icon: BarChart2, color: '#E67700' },
  { type: 'cta', label: 'CTA Banner', desc: 'Full-width call to action with a button', icon: Megaphone, color: '#C47F17' },
  { type: 'testimonials', label: 'Testimonials', desc: 'Client quotes with attribution', icon: Quote, color: '#087F5B' },
  { type: 'team', label: 'Team / Profiles', desc: 'Team member grid with photos and bios', icon: Users, color: '#1098AD' },
  { type: 'contact', label: 'Contact Section', desc: 'Contact info and enquiry form', icon: Phone, color: '#364FC7' },
  { type: 'faq', label: 'FAQ Repeater', desc: 'Add/remove accordion Q&A rows', icon: HelpCircle, color: '#862E9C' },
  { type: 'gallery', label: 'Gallery', desc: 'Photo gallery grid with captions', icon: ImagePlus, color: '#C92A2A' },
  { type: 'custom', label: 'Custom Block', desc: 'Raw HTML / embed code block', icon: Code2, color: '#495057' },
];

export function BlockLibraryModal({ onAdd, onClose }: BlockLibraryModalProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 10,
          width: 680,
          maxWidth: '90vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
          fontFamily: 'Inter, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>Add Block</h2>
            <p style={{ fontSize: 12, color: 'var(--muted-foreground)', margin: '2px 0 0' }}>Choose a block type to add to the page</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 4, display: 'flex', borderRadius: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Grid */}
        <div style={{ overflowY: 'auto', padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {BLOCK_DEFS.map((def) => {
            const Icon = def.icon;
            return (
              <button
                key={def.type}
                onClick={() => { onAdd(def.type); onClose(); }}
                style={{
                  background: 'var(--input-background)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = def.color;
                  (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--input-background)';
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 6,
                    background: def.color + '18',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={16} style={{ color: def.color }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{def.label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>{def.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
