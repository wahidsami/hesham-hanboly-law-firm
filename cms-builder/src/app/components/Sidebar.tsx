import {
  LayoutGrid,
  Navigation2,
  FileText,
  Scale,
  Image,
  Settings,
  ChevronRight,
  Layers,
} from "lucide-react";

export type SidebarSection =
  | "pages"
  | "navigation"
  | "articles"
  | "practice-areas"
  | "media"
  | "settings";

interface SidebarProps {
  active: SidebarSection;
  onSelect: (s: SidebarSection) => void;
  pageCount: number;
  articleCount: number;
  practiceAreaCount: number;
}

const navItems: { id: SidebarSection; label: string; icon: React.ElementType; badge?: number | ((counts: { pages: number; articles: number; practiceAreas: number }) => number) }[] = [
  { id: "pages", label: "Pages", icon: LayoutGrid, badge: (counts) => counts.pages },
  { id: "navigation", label: "Navigation", icon: Navigation2 },
  { id: "articles", label: "Articles", icon: FileText, badge: (counts) => counts.articles },
  { id: "practice-areas", label: "Practice Areas", icon: Scale, badge: (counts) => counts.practiceAreas },
  { id: "media", label: "Media Library", icon: Image },
  { id: "settings", label: "Site Settings", icon: Settings },
];

export function Sidebar({ active, onSelect, pageCount, articleCount, practiceAreaCount }: SidebarProps) {
  const counts = { pages: pageCount, articles: articleCount, practiceAreas: practiceAreaCount };

  return (
    <aside
      className="flex flex-col h-full"
      style={{ background: "var(--sidebar)", width: 224, minWidth: 224, borderRight: "1px solid var(--sidebar-border)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5"
        style={{ height: 56, borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <div
          className="flex items-center justify-center rounded"
          style={{ width: 28, height: 28, background: "var(--sidebar-primary)" }}
        >
          <Layers size={15} color="#fff" strokeWidth={2} />
        </div>
        <span
          style={{
            color: "var(--sidebar-foreground)",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.01em",
          }}
        >
          ContentOS
        </span>
      </div>

      {/* Section label */}
      <div
        className="px-5 pt-5 pb-2"
        style={{
          color: "rgba(224,224,232,0.35)",
          fontFamily: "DM Mono, monospace",
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Content
      </div>

      {/* Nav items */}
      <nav className="flex flex-col px-3 gap-0.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded transition-colors text-left"
              style={{
                background: isActive ? "var(--sidebar-accent)" : "transparent",
                color: isActive ? "var(--sidebar-foreground)" : "rgba(224,224,232,0.55)",
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                cursor: "pointer",
                border: "none",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--sidebar-foreground)";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(224,224,232,0.55)";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }
              }}
            >
              <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className="rounded-full px-1.5 py-0.5"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(224,224,232,0.5)",
                    fontFamily: "DM Mono, monospace",
                    fontSize: 10,
                    lineHeight: 1,
                  }}
                >
                  {typeof item.badge === "function" ? item.badge(counts) : item.badge}
                </span>
              )}
              {isActive && (
                <ChevronRight size={12} style={{ opacity: 0.4 }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4"
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{ width: 28, height: 28, background: "rgba(196,127,23,0.2)" }}
          >
            <span style={{ color: "var(--sidebar-primary)", fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600 }}>
              SA
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ color: "var(--sidebar-foreground)", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>
              Sarah Al-Rashid
            </div>
            <div style={{ color: "rgba(224,224,232,0.35)", fontFamily: "Inter, sans-serif", fontSize: 11, lineHeight: 1.3 }}>
              Admin
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
