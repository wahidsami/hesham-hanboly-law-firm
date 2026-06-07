import type { Block, Lang, FAQItem, CardItem, StatItem, TestimonialItem, TeamMember, GalleryImage } from './types';
import { useState } from 'react';
import { MapPin, Phone, Mail, ChevronDown, Code2 } from 'lucide-react';

interface BlockPreviewProps {
  block: Block;
  lang: Lang;
  isSelected: boolean;
  onClick: () => void;
}

export function BlockPreview({ block, lang, isSelected, onClick }: BlockPreviewProps) {
  const ar = lang === 'ar';

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        position: 'relative',
        outline: isSelected ? '2px solid #C47F17' : '2px solid transparent',
        outlineOffset: -2,
        cursor: 'pointer',
        transition: 'outline 0.15s',
      }}
    >
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10,
            background: '#C47F17',
            color: '#fff',
            fontSize: 10,
            fontFamily: 'DM Mono, monospace',
            fontWeight: 600,
            padding: '2px 8px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {block.type}
        </div>
      )}
      <BlockRenderer block={block} lang={lang} ar={ar} />
    </div>
  );
}

function BlockRenderer({ block, lang, ar }: { block: Block; lang: Lang; ar: boolean }) {
  const d = block.data;
  switch (block.type) {
    case 'hero': return <HeroRender d={d} ar={ar} />;
    case 'rich-text': return <RichTextRender d={d} ar={ar} />;
    case 'image-text': return <ImageTextRender d={d} ar={ar} />;
    case 'cards': return <CardsRender d={d} ar={ar} lang={lang} />;
    case 'stats': return <StatsRender d={d} ar={ar} />;
    case 'cta': return <CTARender d={d} ar={ar} />;
    case 'testimonials': return <TestimonialsRender d={d} ar={ar} />;
    case 'team': return <TeamRender d={d} ar={ar} />;
    case 'contact': return <ContactRender d={d} ar={ar} />;
    case 'faq': return <FAQRender d={d} ar={ar} />;
    case 'gallery': return <GalleryRender d={d} ar={ar} />;
    case 'custom': return <CustomRender d={d} />;
    default: return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Unknown block</div>;
  }
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function HeroRender({ d, ar }: { d: Record<string, string>; ar: boolean }) {
  return (
    <div
      style={{
        background: d.bgColor || '#12131C',
        position: 'relative',
        overflow: 'hidden',
        direction: ar ? 'rtl' : 'ltr',
      }}
    >
      {d.imageUrl && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src={d.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} />
        </div>
      )}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '80px 48px' }}>
        <div style={{ width: 48, height: 3, background: '#C47F17', marginBottom: 24 }} />
        <h1
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.15,
            marginBottom: 20,
            maxWidth: 640,
          }}
        >
          {ar ? d.headingAr : d.headingEn}
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', lineHeight: 1.65, marginBottom: 36, maxWidth: 520 }}>
          {ar ? d.subheadingAr : d.subheadingEn}
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: ar ? 'flex-end' : 'flex-start' }}>
          <span style={{ background: '#C47F17', color: '#fff', padding: '12px 24px', borderRadius: 4, fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'inline-block' }}>
            {ar ? d.ctaPrimaryLabelAr : d.ctaPrimaryLabelEn}
          </span>
          <span style={{ border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '12px 24px', borderRadius: 4, fontSize: 14, fontWeight: 500, fontFamily: 'Inter, sans-serif', display: 'inline-block' }}>
            {ar ? d.ctaSecondaryLabelAr : d.ctaSecondaryLabelEn}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── RICH TEXT ───────────────────────────────────────────────────────────────
function RichTextRender({ d, ar }: { d: Record<string, string>; ar: boolean }) {
  return (
    <div style={{ background: '#fff', padding: '72px 48px', direction: ar ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ width: 32, height: 2, background: '#C47F17', marginBottom: 20 }} />
        <h2 style={{ fontSize: 28, fontWeight: 600, color: '#0D0D12', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>
          {ar ? d.headingAr : d.headingEn}
        </h2>
        {(ar ? d.bodyAr : d.bodyEn)?.split('\n\n').map((para: string, i: number) => (
          <p key={i} style={{ fontSize: 15, color: '#444', fontFamily: 'Inter, sans-serif', lineHeight: 1.75, marginBottom: 16 }}>
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── IMAGE + TEXT ─────────────────────────────────────────────────────────────
function ImageTextRender({ d, ar }: { d: Record<string, string>; ar: boolean }) {
  const imageRight = d.layout === 'image-right';
  const textCol = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
      <div style={{ width: 32, height: 2, background: '#C47F17', marginBottom: 16 }} />
      <h2 style={{ fontSize: 26, fontWeight: 600, color: '#0D0D12', fontFamily: 'Inter, sans-serif', marginBottom: 16, lineHeight: 1.3 }}>
        {ar ? d.headingAr : d.headingEn}
      </h2>
      <p style={{ fontSize: 15, color: '#555', fontFamily: 'Inter, sans-serif', lineHeight: 1.7, marginBottom: 24 }}>
        {ar ? d.bodyAr : d.bodyEn}
      </p>
      {d.ctaPrimaryLabelEn && (
        <span style={{ alignSelf: 'flex-start', background: '#C47F17', color: '#fff', padding: '10px 20px', borderRadius: 4, fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'inline-block' }}>
          {ar ? d.ctaPrimaryLabelAr : d.ctaPrimaryLabelEn}
        </span>
      )}
    </div>
  );
  const imgCol = (
    <div style={{ flex: 1 }}>
      <img src={d.imageUrl} alt={d.imageAlt || ''} style={{ width: '100%', height: 340, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
    </div>
  );
  const cols = imageRight ? [textCol, imgCol] : [imgCol, textCol];
  if (ar) cols.reverse();
  return (
    <div style={{ background: '#fff', padding: '72px 48px', direction: ar ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 48, alignItems: 'center' }}>
        {cols[0]}
        {cols[1]}
      </div>
    </div>
  );
}

// ─── CARDS ───────────────────────────────────────────────────────────────────
const CARD_ICONS: Record<string, string> = {
  briefcase: '⚖', scale: '⚖', building: '🏛', landmark: '🏦', users: '👥', lightbulb: '💡',
};

function CardsRender({ d, ar, lang }: { d: Record<string, unknown>; ar: boolean; lang: Lang }) {
  const items = (d.items as CardItem[]) || [];
  const cols = (d.columns as number) || 3;
  return (
    <div style={{ background: '#F3F3F0', padding: '72px 48px', direction: ar ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ width: 32, height: 2, background: '#C47F17', margin: ar ? '0 auto 16px' : '0 auto 16px' }} />
          <h2 style={{ fontSize: 28, fontWeight: 600, color: '#0D0D12', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
            {ar ? String(d.headingAr || '') : String(d.headingEn || '')}
          </h2>
          <p style={{ fontSize: 15, color: '#666', fontFamily: 'Inter, sans-serif' }}>
            {ar ? String(d.subheadingAr || '') : String(d.subheadingEn || '')}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>
          {items.map((item) => (
            <div key={item.id} style={{ background: '#fff', borderRadius: 6, padding: '28px 24px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{CARD_ICONS[item.icon] || '◆'}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0D0D12', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
                {ar ? item.titleAr : item.titleEn}
              </div>
              <div style={{ fontSize: 13, color: '#666', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                {ar ? item.descAr : item.descEn}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STATS ───────────────────────────────────────────────────────────────────
function StatsRender({ d, ar }: { d: Record<string, unknown>; ar: boolean }) {
  const items = (d.items as StatItem[]) || [];
  return (
    <div style={{ background: '#12131C', padding: '56px 48px', direction: ar ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 24 }}>
        {items.map((item) => (
          <div key={item.id} style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: '#C47F17', fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>
              {item.value}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'DM Mono, monospace', marginTop: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {ar ? item.labelAr : item.labelEn}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CTA BANNER ──────────────────────────────────────────────────────────────
function CTARender({ d, ar }: { d: Record<string, string>; ar: boolean }) {
  const bg = d.bgColor || '#C47F17';
  const dark = bg === '#C47F17' || bg === '#12131C';
  return (
    <div style={{ background: bg, padding: '64px 48px', textAlign: 'center', direction: ar ? 'rtl' : 'ltr' }}>
      <h2 style={{ fontSize: 30, fontWeight: 700, color: dark ? '#fff' : '#0D0D12', fontFamily: 'Inter, sans-serif', marginBottom: 12, maxWidth: 600, margin: '0 auto 12px' }}>
        {ar ? d.headingAr : d.headingEn}
      </h2>
      <p style={{ fontSize: 16, color: dark ? 'rgba(255,255,255,0.75)' : '#444', fontFamily: 'Inter, sans-serif', marginBottom: 32 }}>
        {ar ? d.bodyAr : d.bodyEn}
      </p>
      <span style={{ background: dark ? '#fff' : '#12131C', color: dark ? '#12131C' : '#fff', padding: '13px 28px', borderRadius: 4, fontSize: 14, fontWeight: 700, fontFamily: 'Inter, sans-serif', display: 'inline-block' }}>
        {ar ? d.ctaPrimaryLabelAr : d.ctaPrimaryLabelEn}
      </span>
    </div>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
function TestimonialsRender({ d, ar }: { d: Record<string, unknown>; ar: boolean }) {
  const items = (d.items as TestimonialItem[]) || [];
  return (
    <div style={{ background: '#fff', padding: '72px 48px', direction: ar ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ width: 32, height: 2, background: '#C47F17', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 28, fontWeight: 600, color: '#0D0D12', fontFamily: 'Inter, sans-serif' }}>
            {ar ? String(d.headingAr || '') : String(d.headingEn || '')}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: 24 }}>
          {items.map((item) => (
            <div key={item.id} style={{ background: '#F8F8F6', borderRadius: 8, padding: '28px 24px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 36, color: '#C47F17', lineHeight: 1, marginBottom: 12, fontFamily: 'Georgia, serif' }}>"</div>
              <p style={{ fontSize: 14, color: '#333', fontFamily: 'Inter, sans-serif', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                {ar ? item.quoteAr : item.quoteEn}
              </p>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0D0D12', fontFamily: 'Inter, sans-serif' }}>{item.author}</div>
                <div style={{ fontSize: 12, color: '#888', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
                  {ar ? item.roleAr : item.roleEn}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TEAM ─────────────────────────────────────────────────────────────────────
function TeamRender({ d, ar }: { d: Record<string, unknown>; ar: boolean }) {
  const items = (d.items as TeamMember[]) || [];
  return (
    <div style={{ background: '#F3F3F0', padding: '72px 48px', direction: ar ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ width: 32, height: 2, background: '#C47F17', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 28, fontWeight: 600, color: '#0D0D12', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
            {ar ? String(d.headingAr || '') : String(d.headingEn || '')}
          </h2>
          <p style={{ fontSize: 14, color: '#666', fontFamily: 'Inter, sans-serif' }}>
            {ar ? String(d.subheadingAr || '') : String(d.subheadingEn || '')}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`, gap: 20 }}>
          {items.map((member) => (
            <div key={member.id} style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
              <img src={member.imageUrl} alt={member.nameEn} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0D0D12', fontFamily: 'Inter, sans-serif' }}>
                  {ar ? member.nameAr : member.nameEn}
                </div>
                <div style={{ fontSize: 12, color: '#C47F17', fontFamily: 'Inter, sans-serif', marginTop: 2, marginBottom: 8 }}>
                  {ar ? member.roleAr : member.roleEn}
                </div>
                <div style={{ fontSize: 12, color: '#666', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                  {ar ? member.bioAr : member.bioEn}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CONTACT ─────────────────────────────────────────────────────────────────
function ContactRender({ d, ar }: { d: Record<string, string>; ar: boolean }) {
  return (
    <div style={{ background: '#fff', padding: '72px 48px', direction: ar ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 64 }}>
        <div style={{ flex: '0 0 300px' }}>
          <div style={{ width: 32, height: 2, background: '#C47F17', marginBottom: 16 }} />
          <h2 style={{ fontSize: 26, fontWeight: 600, color: '#0D0D12', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
            {ar ? d.headingAr : d.headingEn}
          </h2>
          <p style={{ fontSize: 14, color: '#666', fontFamily: 'Inter, sans-serif', marginBottom: 32 }}>
            {ar ? d.subheadingAr : d.subheadingEn}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: Mail, val: d.email },
              { icon: Phone, val: d.phone },
              { icon: MapPin, val: ar ? d.addressAr : d.address },
            ].map(({ icon: Icon, val }) => (
              <div key={val} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Icon size={15} style={{ color: '#C47F17', marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#444', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {['Full Name', 'Email Address'].map((label) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: '#888', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>{label}</div>
                <div style={{ height: 38, background: '#F3F3F0', borderRadius: 4, border: '1px solid rgba(0,0,0,0.08)' }} />
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#888', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Subject</div>
            <div style={{ height: 38, background: '#F3F3F0', borderRadius: 4, border: '1px solid rgba(0,0,0,0.08)' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#888', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Message</div>
            <div style={{ height: 100, background: '#F3F3F0', borderRadius: 4, border: '1px solid rgba(0,0,0,0.08)' }} />
          </div>
          <span style={{ alignSelf: 'flex-start', background: '#C47F17', color: '#fff', padding: '10px 24px', borderRadius: 4, fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'inline-block' }}>
            {ar ? 'إرسال الرسالة' : 'Send Message'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function FAQRender({ d, ar }: { d: Record<string, unknown>; ar: boolean }) {
  const items = (d.items as FAQItem[]) || [];
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);
  return (
    <div style={{ background: '#F3F3F0', padding: '72px 48px', direction: ar ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ width: 32, height: 2, background: '#C47F17', marginBottom: 16 }} />
        <h2 style={{ fontSize: 28, fontWeight: 600, color: '#0D0D12', fontFamily: 'Inter, sans-serif', marginBottom: 40 }}>
          {ar ? String(d.headingAr || '') : String(d.headingEn || '')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {items.map((item, i) => {
            const open = openId === item.id;
            return (
              <div key={item.id} style={{ borderTop: i === 0 ? '1px solid rgba(0,0,0,0.1)' : 'none', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenId(open ? null : item.id); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: ar ? 'right' : 'left', gap: 16 }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0D0D12', fontFamily: 'Inter, sans-serif' }}>
                    {ar ? item.questionAr : item.questionEn}
                  </span>
                  <ChevronDown size={16} style={{ flexShrink: 0, color: '#888', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {open && (
                  <div style={{ paddingBottom: 18, paddingTop: 0 }}>
                    <p style={{ fontSize: 14, color: '#555', fontFamily: 'Inter, sans-serif', lineHeight: 1.7, margin: 0 }}>
                      {ar ? item.answerAr : item.answerEn}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── GALLERY ─────────────────────────────────────────────────────────────────
function GalleryRender({ d, ar }: { d: Record<string, unknown>; ar: boolean }) {
  const items = (d.items as GalleryImage[]) || [];
  return (
    <div style={{ background: '#fff', padding: '72px 48px', direction: ar ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ width: 32, height: 2, background: '#C47F17', marginBottom: 16 }} />
        <h2 style={{ fontSize: 28, fontWeight: 600, color: '#0D0D12', fontFamily: 'Inter, sans-serif', marginBottom: 32 }}>
          {ar ? String(d.headingAr || '') : String(d.headingEn || '')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {items.map((img, i) => (
            <div key={img.id} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', gridColumn: i === 0 ? 'span 1' : 'auto' }}>
              <img src={img.imageUrl} alt={img.captionEn} style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', padding: '24px 16px 12px' }}>
                <span style={{ fontSize: 12, color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  {ar ? img.captionAr : img.captionEn}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOM ──────────────────────────────────────────────────────────────────
function CustomRender({ d }: { d: Record<string, string> }) {
  return (
    <div style={{ background: '#F8F8F8', padding: '48px', textAlign: 'center', borderTop: '2px dashed #CBD5E1', borderBottom: '2px dashed #CBD5E1' }}>
      <Code2 size={32} style={{ color: '#94A3B8', marginBottom: 12 }} />
      <div style={{ fontSize: 13, color: '#64748B', fontFamily: 'DM Mono, monospace', marginBottom: 12 }}>Custom HTML Block</div>
      <div style={{ display: 'inline-block', textAlign: 'left', background: '#1E293B', color: '#94A3B8', padding: '16px 20px', borderRadius: 6, fontSize: 11, fontFamily: 'DM Mono, monospace', lineHeight: 1.7, maxWidth: 480 }}>
        {d.htmlContent?.split('\n').map((line, i) => (
          <div key={i}>{line || ' '}</div>
        ))}
      </div>
    </div>
  );
}
