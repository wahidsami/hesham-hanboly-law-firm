import { useState } from 'react';
import {
  Plus, GripVertical, ChevronDown, ChevronRight, Copy, Trash2,
  LayoutTemplate, AlignLeft, Image, LayoutGrid, BarChart2, Megaphone,
  Quote, Users, Phone, HelpCircle, ImagePlus, Code2, Eye, EyeOff, FilePlus,
} from 'lucide-react';
import type { BuilderPage, Block, BlockType, Lang } from './types';
import { BLOCK_TYPE_LABELS } from './types';

const BLOCK_ICONS: Record<BlockType, React.ElementType> = {
  'hero': LayoutTemplate, 'rich-text': AlignLeft, 'image-text': Image,
  'cards': LayoutGrid, 'stats': BarChart2, 'cta': Megaphone,
  'testimonials': Quote, 'team': Users, 'contact': Phone,
  'faq': HelpCircle, 'gallery': ImagePlus, 'custom': Code2,
};

interface LeftPanelProps {
  pages: BuilderPage[];
  selectedPageId: string;
  onSelectPage: (id: string) => void;
  onNewPage: () => void;
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
  onToggleCollapse: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onAddBlock: () => void;
  lang: Lang;
  allowBlockEditing?: boolean;
}

interface DragItem { id: string; index: number; }

function DraggableBlockRow({
  block, index, isSelected, onSelect, onMove, onToggleCollapse, onDuplicate, onDelete,
  draggingIndex, onDragStart, onDragEnd,
}: {
  block: Block; index: number; isSelected: boolean;
  onSelect: () => void; onMove: (from: number, to: number) => void;
  onToggleCollapse: () => void; onDuplicate: () => void; onDelete: () => void;
  draggingIndex: number | null;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
}) {
  const Icon = BLOCK_ICONS[block.type];
  const isDragging = draggingIndex === index;

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
        opacity: isDragging ? 0.35 : 1,
        borderBottom: '1px solid var(--border)',
        background: isSelected ? 'rgba(196,127,23,0.06)' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      <div
        className="flex items-center gap-1.5 px-2 py-2"
        style={{ cursor: 'pointer' }}
        onClick={onSelect}
      >
        {/* Drag handle */}
        <div
          draggable
          onDragStart={() => onDragStart(index)}
          onDragEnd={onDragEnd}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'grab', color: 'var(--muted-foreground)', padding: '0 2px', flexShrink: 0, display: 'flex' }}
        >
          <GripVertical size={13} />
        </div>

        {/* Collapse toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 0, display: 'flex', flexShrink: 0 }}
        >
          {block.collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        </button>

        {/* Icon */}
        <Icon size={13} style={{ color: isSelected ? '#C47F17' : 'var(--muted-foreground)', flexShrink: 0 }} />

        {/* Label */}
        <span
          style={{
            flex: 1, fontSize: 12, fontFamily: 'Inter, sans-serif',
            fontWeight: isSelected ? 500 : 400,
            color: isSelected ? 'var(--foreground)' : 'var(--foreground)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {BLOCK_TYPE_LABELS[block.type]}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onDuplicate}
            title="Duplicate"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '2px 3px', borderRadius: 3, display: 'flex' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}
          >
            <Copy size={11} />
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '2px 3px', borderRadius: 3, display: 'flex' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#D11B3A'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function LeftPanel({
  pages, selectedPageId, onSelectPage, onNewPage,
  blocks, selectedBlockId, onSelectBlock, onMoveBlock, onToggleCollapse,
  onDuplicateBlock, onDeleteBlock, onAddBlock, lang,
  allowBlockEditing = true,
}: LeftPanelProps) {
  const selectedPage = pages.find((p) => p.id === selectedPageId);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Pages section */}
      <div style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px 8px' }}>
          <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Pages
          </span>
          <button
            onClick={onNewPage}
            title="New page"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 2, display: 'flex', borderRadius: 3 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'; }}
          >
            <FilePlus size={13} />
          </button>
        </div>
        <div style={{ paddingBottom: 6 }}>
          {pages.map((page) => {
            const active = page.id === selectedPageId;
            return (
              <button
                key={page.id}
                onClick={() => onSelectPage(page.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px',
                  background: active ? 'rgba(196,127,23,0.08)' : 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderLeft: active ? '2px solid #C47F17' : '2px solid transparent',
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)'; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
              >
                {page.navVisible
                  ? <Eye size={11} style={{ color: active ? '#C47F17' : 'var(--muted-foreground)', flexShrink: 0 }} />
                  : <EyeOff size={11} style={{ color: 'var(--muted-foreground)', flexShrink: 0, opacity: 0.4 }} />
                }
                <span style={{ flex: 1, fontSize: 12, fontWeight: active ? 500 : 400, color: active ? 'var(--foreground)' : 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lang === 'ar' ? page.titleAr : page.titleEn}
                </span>
                <span
                  style={{
                    fontSize: 9, fontFamily: 'DM Mono, monospace',
                    color: page.status === 'published' ? '#1A7B3C' : page.status === 'hidden' ? '#8C4A00' : '#4A5060',
                    background: page.status === 'published' ? '#E6F4EA' : page.status === 'hidden' ? '#FFF4E5' : '#EEF0F4',
                    padding: '1px 5px', borderRadius: 3,
                  }}
                >
                  {page.status === 'published' ? 'PUB' : page.status === 'hidden' ? 'HID' : 'DRF'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Block tree */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px 6px', flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Blocks · {blocks.length}
          </span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {blocks.length === 0 ? (
            <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 12 }}>
              No blocks yet
            </div>
          ) : (
            blocks.map((block, index) => (
              <DraggableBlockRow
                key={block.id}
                block={block}
                index={index}
                isSelected={block.id === selectedBlockId}
                onSelect={() => onSelectBlock(block.id === selectedBlockId ? null : block.id)}
                onMove={onMoveBlock}
                onToggleCollapse={() => onToggleCollapse(block.id)}
                onDuplicate={() => onDuplicateBlock(block.id)}
                onDelete={() => onDeleteBlock(block.id)}
                draggingIndex={draggingIndex}
                onDragStart={(index) => setDraggingIndex(index)}
                onDragEnd={() => setDraggingIndex(null)}
              />
            ))
          )}
        </div>
        {/* Add block button */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {allowBlockEditing ? (
            <button
              onClick={onAddBlock}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px', borderRadius: 6,
                background: 'var(--accent)', border: '1px dashed rgba(196,127,23,0.4)',
                cursor: 'pointer', fontSize: 12, fontWeight: 500,
                color: 'var(--accent-foreground)', fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FDF3DC'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; }}
            >
              <Plus size={13} />
              Add Block
            </button>
          ) : (
            <div style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: '10px 12px', background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.5 }}>
              Homepage content is edited in the center panel. Use the Hero slides and section copy editor there.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
