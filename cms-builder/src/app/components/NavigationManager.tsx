import { useState, useCallback } from 'react';
import {
  Plus, GripVertical, Trash2, Monitor, Smartphone, Globe,
  Search, X, ChevronDown, Menu, ExternalLink, Check,
} from 'lucide-react';
import type { Lang } from './Header';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  pageId: string;
  labelEn: string;
  labelAr: string;
  url: string;
  desktopVisible: boolean;
  mobileVisible: boolean;
}

export interface NavPage {
  id: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  status: 'published' | 'draft' | 'hidden';
}

interface NavigationManagerProps {
  navItems: NavItem[];
  allPages: NavPage[];
  onUpdate: (items: NavItem[]) => void;
  lang: Lang;
}

// ─── Draggable row ────────────────────────────────────────────────────────────

function NavRow({
  item, index, lang, onChange, onRemove, onMove, draggingIndex, onDragStart, onDragEnd,
}: {
  item: NavItem;
  index: number;
  lang: Lang;
  onChange: (patch: Partial<NavItem>) => void;
  onRemove: () => void;
  onMove: (from: number, to: number) => void;
  draggingIndex: number | null;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
}) {
  const inputStyle: React.CSSProperties = {
    background: 'var(--input-background)',
    border: '1px solid transparent',
    borderRadius: 4,
    padding: '5px 8px',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    color: 'var(--foreground)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const VisToggle = ({ active, icon: Icon, label, onToggle }: { active: boolean; icon: React.ElementType; label: string; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      title={`${active ? 'Visible' : 'Hidden'} on ${label}`}
      style={{
        background: active ? 'rgba(196,127,23,0.12)' : 'var(--muted)',
        border: `1px solid ${active ? 'rgba(196,127,23,0.35)' : 'transparent'}`,
        borderRadius: 4,
        cursor: 'pointer',
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: active ? '#C47F17' : 'var(--muted-foreground)',
        flexShrink: 0,
        transition: 'all 0.15s',
      }}
    >
      <Icon size={13} />
    </button>
  );

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        if (draggingIndex !== null && draggingIndex !== index) {
          onMove(draggingIndex, index);
        }
        onDragEnd();
      }}
      style={{
        opacity: draggingIndex === index ? 0.3 : 1,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 7,
        marginBottom: 6,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'border-color 0.1s',
      }}
    >
      {/* Drag handle */}
      <div
        draggable
        onDragStart={() => onDragStart(index)}
        onDragEnd={onDragEnd}
        style={{ cursor: 'grab', color: 'var(--muted-foreground)', display: 'flex', flexShrink: 0 }}
      >
        <GripVertical size={14} />
      </div>

      {/* Status dot */}
      <div
        title={item.url}
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#2DA457',
          flexShrink: 0,
        }}
      />

      {/* Labels */}
      <div style={{ flex: 1, display: 'flex', gap: 6, minWidth: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>EN</div>
          <input
            value={item.labelEn}
            onChange={e => onChange({ labelEn: e.target.value })}
            style={inputStyle}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#C47F17'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'transparent'; }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AR</div>
          <input
            value={item.labelAr}
            onChange={e => onChange({ labelAr: e.target.value })}
            dir="rtl"
            style={{ ...inputStyle, textAlign: 'right', fontFamily: 'serif' }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#C47F17'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'transparent'; }}
          />
        </div>
      </div>

      {/* URL */}
      <div
        style={{
          fontSize: 11,
          fontFamily: 'DM Mono, monospace',
          color: 'var(--muted-foreground)',
          background: 'var(--input-background)',
          borderRadius: 4,
          padding: '5px 8px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          maxWidth: 100,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={item.url}
      >
        {item.url}
      </div>

      {/* Visibility toggles */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <VisToggle active={item.desktopVisible} icon={Monitor} label="Desktop" onToggle={() => onChange({ desktopVisible: !item.desktopVisible })} />
        <VisToggle active={item.mobileVisible} icon={Smartphone} label="Mobile" onToggle={() => onChange({ mobileVisible: !item.mobileVisible })} />
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 4, display: 'flex', borderRadius: 4, flexShrink: 0 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#D11B3A'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Desktop nav preview ──────────────────────────────────────────────────────

function DesktopNavPreview({ items, lang }: { items: NavItem[]; lang: Lang }) {
  const visible = items.filter(i => i.desktopVisible);
  const ar = lang === 'ar';
  return (
    <div
      style={{
        background: '#12131C',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Label */}
      <div style={{ padding: '7px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Monitor size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
        <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Desktop Preview</span>
      </div>
      {/* Nav bar */}
      <div
        style={{
          padding: '0 20px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          direction: ar ? 'rtl' : 'ltr',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: 2, background: '#C47F17' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif', letterSpacing: '0.04em' }}>
            {ar ? 'الرشيد وشركاه' : 'Al-Rashid & Partners'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {visible.length === 0 ? (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>No visible items</span>
          ) : (
            visible.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '6px 10px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.72)',
                  fontFamily: 'Inter, sans-serif',
                  borderRadius: 4,
                  cursor: 'default',
                  transition: 'color 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.72)'; }}
              >
                {ar ? item.labelAr : item.labelEn}
              </div>
            ))
          )}
        </div>
        <div style={{ background: '#C47F17', color: '#fff', padding: '6px 12px', borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
          {ar ? 'احجز استشارة' : 'Book Consultation'}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile nav preview ───────────────────────────────────────────────────────

function MobileNavPreview({ items, lang }: { items: NavItem[]; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const visible = items.filter(i => i.mobileVisible);
  const ar = lang === 'ar';
  return (
    <div style={{ background: '#12131C', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ padding: '7px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Smartphone size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
        <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mobile Preview</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif' }}>
          click ≡ to toggle
        </span>
      </div>
      {/* Header bar */}
      <div
        style={{ padding: '0 16px', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: ar ? 'rtl' : 'ltr' }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
          {ar ? 'الرشيد وشركاه' : 'Al-Rashid'}
        </span>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4 }}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {/* Dropdown */}
      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', direction: ar ? 'rtl' : 'ltr' }}>
          {visible.length === 0 ? (
            <div style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>
              No visible items
            </div>
          ) : (
            visible.map(item => (
              <div
                key={item.id}
                style={{ padding: '11px 16px', fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <span>{ar ? item.labelAr : item.labelEn}</span>
                <ChevronDown size={12} style={{ transform: ar ? 'rotate(90deg)' : 'rotate(-90deg)', opacity: 0.4 }} />
              </div>
            ))
          )}
          <div style={{ padding: '12px 16px' }}>
            <span style={{ background: '#C47F17', color: '#fff', padding: '8px 16px', borderRadius: 4, fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'inline-block' }}>
              {ar ? 'احجز استشارة' : 'Book Consultation'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page picker modal ────────────────────────────────────────────────────────

function PagePickerModal({
  allPages, navItems, onAdd, onClose,
}: {
  allPages: NavPage[];
  navItems: NavItem[];
  onAdd: (page: NavPage) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const inNavIds = new Set(navItems.map(n => n.pageId));
  const filtered = allPages.filter(p =>
    p.titleEn.toLowerCase().includes(query.toLowerCase()) ||
    p.titleAr.includes(query) ||
    p.slug.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '80px 20px 0' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--card)', borderRadius: 8, width: 340, boxShadow: '0 16px 48px rgba(0,0,0,0.2)', border: '1px solid var(--border)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
          <input
            autoFocus
            placeholder="Search pages…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif' }}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 0, display: 'flex' }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {filtered.map(page => {
            const inNav = inNavIds.has(page.id);
            return (
              <button
                key={page.id}
                onClick={() => { if (!inNav) { onAdd(page); onClose(); } }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  background: 'none', border: 'none', cursor: inNav ? 'default' : 'pointer',
                  textAlign: 'left', borderBottom: '1px solid var(--border)',
                  opacity: inNav ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!inNav) (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {page.titleEn}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace', marginTop: 1 }}>
                    {page.slug}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 9, fontFamily: 'DM Mono, monospace', padding: '2px 5px', borderRadius: 3, textTransform: 'uppercase',
                    color: page.status === 'published' ? '#1A7B3C' : '#4A5060',
                    background: page.status === 'published' ? '#E6F4EA' : '#EEF0F4',
                  }}>
                    {page.status}
                  </span>
                  {inNav && <Check size={13} style={{ color: '#2DA457' }} />}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '20px 14px', textAlign: 'center', fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}>
              No pages found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function NavigationManagerInner({ navItems, allPages, onUpdate, lang }: NavigationManagerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [previewLang, setPreviewLang] = useState<Lang>(lang);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const moveItem = useCallback((from: number, to: number) => {
    const next = [...navItems];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    onUpdate(next);
  }, [navItems, onUpdate]);

  function changeItem(id: string, patch: Partial<NavItem>) {
    onUpdate(navItems.map(item => item.id === id ? { ...item, ...patch } : item));
  }

  function removeItem(id: string) {
    onUpdate(navItems.filter(item => item.id !== id));
  }

  function addPage(page: NavPage) {
    const newItem: NavItem = {
      id: `nav-${Date.now()}`,
      pageId: page.id,
      labelEn: page.titleEn,
      labelAr: page.titleAr,
      url: page.slug,
      desktopVisible: true,
      mobileVisible: true,
    };
    onUpdate([...navItems, newItem]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: 'var(--card)' }}
      >
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>Navigation Manager</h2>
          <p style={{ fontSize: 12, color: 'var(--muted-foreground)', margin: '2px 0 0' }}>
            {navItems.length} item{navItems.length !== 1 ? 's' : ''} · drag to reorder
          </p>
        </div>

        {/* Preview lang toggle */}
        <div style={{ display: 'flex', background: 'var(--input-background)', borderRadius: 5, padding: 2 }}>
          {(['en', 'ar'] as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => setPreviewLang(l)}
              style={{
                padding: '4px 10px', border: 'none', borderRadius: 4, cursor: 'pointer',
                fontSize: 11, fontFamily: 'DM Mono, monospace', fontWeight: 600,
                background: previewLang === l ? '#fff' : 'transparent',
                color: previewLang === l ? 'var(--foreground)' : 'var(--muted-foreground)',
                boxShadow: previewLang === l ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {l === 'en' ? '🇬🇧 EN' : '🇸🇦 AR'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowPicker(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            background: 'var(--primary)', border: 'none', borderRadius: 6,
            cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        >
          <Plus size={13} strokeWidth={2.5} />
          Add Page
        </button>
      </div>

      {/* Body: two columns */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: items list */}
        <div style={{ flex: '0 0 58%', overflowY: 'auto', padding: '20px 24px' }}>

          {/* Column headers */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px 10px', marginBottom: 4 }}
          >
            <div style={{ width: 14 }} />
            <div style={{ width: 10 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Labels (EN / AR)
              </span>
            </div>
            <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 100, textAlign: 'center' }}>URL</span>
            <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 64, textAlign: 'center' }}>Visibility</span>
            <div style={{ width: 28 }} />
          </div>

          {navItems.length === 0 ? (
            <div
              style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted-foreground)', fontSize: 13, background: 'var(--muted)', borderRadius: 8, border: '1px dashed var(--border)' }}
            >
              <Globe size={28} style={{ opacity: 0.3, marginBottom: 10 }} />
              <div style={{ fontWeight: 500, marginBottom: 4 }}>No navigation items yet</div>
              <div style={{ fontSize: 12 }}>Click "Add Page" to add pages to the navigation.</div>
            </div>
          ) : (
            navItems.map((item, index) => (
              <NavRow
                key={item.id}
                item={item}
                index={index}
                lang={previewLang}
                onChange={patch => changeItem(item.id, patch)}
                onRemove={() => removeItem(item.id)}
                onMove={moveItem}
                draggingIndex={draggingIndex}
                onDragStart={(rowIndex) => setDraggingIndex(rowIndex)}
                onDragEnd={() => setDraggingIndex(null)}
              />
            ))
          )}

          {navItems.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => setShowPicker(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%',
                  padding: '9px', borderRadius: 6,
                  background: 'var(--accent)', border: '1px dashed rgba(196,127,23,0.4)',
                  cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  color: 'var(--accent-foreground)', fontFamily: 'Inter, sans-serif',
                }}
              >
                <Plus size={13} /> Add another page
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: 'var(--border)', flexShrink: 0 }} />

        {/* Right: live preview */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: 'var(--background)' }}>
          <div
            style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}
          >
            Live Preview
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <DesktopNavPreview items={navItems} lang={previewLang} />
            <MobileNavPreview items={navItems} lang={previewLang} />
          </div>

          {/* Legend */}
          <div style={{ marginTop: 20, padding: '14px', background: 'var(--card)', borderRadius: 7, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
              Visibility controls
            </div>
            {[
              { icon: Monitor, label: 'Desktop', desc: 'Shown in the full-width navigation bar' },
              { icon: Smartphone, label: 'Mobile', desc: 'Shown in the hamburger dropdown menu' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <Icon size={13} style={{ color: 'var(--muted-foreground)', marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif' }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page picker modal */}
      {showPicker && (
        <PagePickerModal
          allPages={allPages}
          navItems={navItems}
          onAdd={addPage}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

export function NavigationManager(props: NavigationManagerProps) {
  return <NavigationManagerInner {...props} />;
}
