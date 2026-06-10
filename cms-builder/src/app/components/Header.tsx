import { Bell, Search, Globe, ChevronDown, ExternalLink, LogOut, User } from "lucide-react";

export type Lang = "en" | "ar";

interface HeaderProps {
  lang: Lang;
  onToggleLang: () => void;
  section: string;
  username?: string;
  onLogout?: () => void;
}

const sectionLabels: Record<string, string> = {
  overview: "Overview",
  pages: "Pages",
  navigation: "Navigation",
  articles: "Articles",
  "practice-areas": "Practice Areas",
  media: "Media Library",
  settings: "Site Settings",
};

export function Header({ lang, onToggleLang, section, username, onLogout }: HeaderProps) {
  return (
    <header
      className="flex items-center px-6 gap-4 flex-shrink-0"
      style={{
        height: 56,
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 flex-1">
        <span style={{ color: "var(--muted-foreground)", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
          CMS
        </span>
        <ChevronDown size={12} style={{ color: "var(--muted-foreground)", transform: "rotate(-90deg)" }} />
        <span style={{ color: "var(--foreground)", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500 }}>
          {sectionLabels[section] ?? section}
        </span>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded transition-colors"
          style={{
            background: "var(--input-background)",
            border: "none",
            cursor: "pointer",
            color: "var(--muted-foreground)",
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
          }}
          onClick={() => {}}
        >
          <Search size={13} />
          <span>Quick search…</span>
          <span
            className="rounded px-1 py-0.5"
            style={{
              background: "var(--muted)",
              fontFamily: "DM Mono, monospace",
              fontSize: 10,
              color: "var(--muted-foreground)",
            }}
          >
            ⌘K
          </span>
        </button>

        {/* Lang toggle */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
          style={{
            background: "var(--accent)",
            border: "1px solid rgba(196,127,23,0.2)",
            cursor: "pointer",
            fontFamily: "DM Mono, monospace",
            fontSize: 11,
            fontWeight: 500,
            color: "var(--accent-foreground)",
          }}
          title="Toggle language"
        >
          <Globe size={12} />
          <span>{lang === "en" ? "EN" : "AR"}</span>
          <span style={{ opacity: 0.4 }}>→</span>
          <span>{lang === "en" ? "AR" : "EN"}</span>
        </button>

        {/* Preview site */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--muted-foreground)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,0,0,0.18)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
          }}
        >
          <ExternalLink size={12} />
          Preview Site
        </button>

        {/* Notifications */}
        <button
          className="relative flex items-center justify-center rounded"
          style={{
            width: 32,
            height: 32,
            background: "transparent",
            border: "1px solid var(--border)",
            cursor: "pointer",
            color: "var(--muted-foreground)",
          }}
        >
          <Bell size={14} />
          <span
            className="absolute rounded-full"
            style={{
              width: 7,
              height: 7,
              background: "var(--primary)",
              top: 6,
              right: 6,
            }}
          />
        </button>

        {username && onLogout && (
          <div className="flex items-center gap-2 pl-2 ml-1 border-l" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "var(--muted)" }}>
              <User size={12} style={{ color: "var(--muted-foreground)" }} />
              <span style={{ fontSize: 12, color: "var(--foreground)", fontWeight: 600 }}>{username}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--muted-foreground)",
              }}
            >
              <LogOut size={12} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
