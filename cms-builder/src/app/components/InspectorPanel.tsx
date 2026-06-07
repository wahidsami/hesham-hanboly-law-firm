import { X, FileText, Globe, Calendar, User, Layers, Hash, Edit2, BarChart2, TrendingUp } from "lucide-react";
import type { CMSPage } from "./PagesIndex";
import type { Lang } from "./Header";

interface InspectorPanelProps {
  page: CMSPage | null;
  lang: Lang;
  onClose: () => void;
  allPages: CMSPage[];
  onOpenBuilder?: () => void;
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div
      className="rounded p-3"
      style={{ background: "var(--input-background)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span style={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
        <Icon size={12} style={{ color: "var(--muted-foreground)" }} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "Inter, sans-serif", color: "var(--foreground)", lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

export function InspectorPanel({ page, lang, onClose, allPages, onOpenBuilder }: InspectorPanelProps) {
  const publishedCount = allPages.filter((p) => p.status === "published").length;
  const draftCount = allPages.filter((p) => p.status === "draft").length;
  const hiddenCount = allPages.filter((p) => p.status === "hidden").length;
  const navVisibleCount = allPages.filter((p) => p.navVisible).length;

  return (
    <aside
      className="flex flex-col h-full overflow-hidden"
      style={{
        width: 264,
        minWidth: 264,
        background: "var(--card)",
        borderLeft: "1px solid var(--border)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {page ? (
        // Page detail view
        <>
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>Page Details</span>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 2, display: "flex", borderRadius: 4 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; }}
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-auto px-4 py-4" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Titles */}
            <div>
              <div style={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Title
              </div>
              <div
                className="rounded p-3"
                style={{ background: "var(--input-background)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6 }}
              >
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 2 }}>English</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{page.titleEn}</div>
                </div>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 6 }}>
                  <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 2 }}>Arabic</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", direction: "rtl", textAlign: "right", fontFamily: "serif" }}>
                    {page.titleAr}
                  </div>
                </div>
              </div>
            </div>

            {/* Meta fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <MetaRow icon={Hash} label="Slug" value={page.slug} mono />
              <MetaRow icon={FileText} label="Status" value={page.status.charAt(0).toUpperCase() + page.status.slice(1)} />
              <MetaRow icon={Globe} label="Nav Visible" value={page.navVisible ? "Yes" : "No"} />
              <MetaRow icon={Layers} label="Blocks" value={String(page.blocksCount)} mono />
              <MetaRow icon={User} label="Last edited by" value={page.author} />
              <MetaRow icon={Calendar} label="Last updated" value={new Date(page.lastUpdated).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Actions
              </div>
              <button
                onClick={onOpenBuilder}
                className="flex items-center gap-2 w-full px-3 py-2 rounded"
                style={{
                  background: "var(--primary)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#fff",
                  fontFamily: "Inter, sans-serif",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
              >
                <Edit2 size={12} />
                Open Page Builder
              </button>
              <button
                className="flex items-center gap-2 w-full px-3 py-2 rounded"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--foreground)",
                  fontFamily: "Inter, sans-serif",
                  justifyContent: "center",
                }}
              >
                <Globe size={12} />
                {page.status === "published" ? "Unpublish" : "Publish"}
              </button>
            </div>
          </div>
        </>
      ) : (
        // Overview / stats
        <>
          <div
            className="flex items-center px-4 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>Overview</span>
          </div>

          <div className="flex-1 overflow-auto px-4 py-4" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <StatCard label="Published" value={publishedCount} icon={TrendingUp} />
              <StatCard label="Draft" value={draftCount} icon={FileText} />
              <StatCard label="Hidden" value={hiddenCount} icon={BarChart2} />
              <StatCard label="In Nav" value={navVisibleCount} icon={Globe} />
            </div>

            {/* Status breakdown bar */}
            <div>
              <div style={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Status breakdown
              </div>
              <div className="rounded overflow-hidden" style={{ height: 8, display: "flex", background: "var(--muted)" }}>
                <div style={{ width: `${(publishedCount / allPages.length) * 100}%`, background: "#2DA457" }} />
                <div style={{ width: `${(draftCount / allPages.length) * 100}%`, background: "#8A90A0" }} />
                <div style={{ width: `${(hiddenCount / allPages.length) * 100}%`, background: "#D4860A" }} />
              </div>
              <div className="flex items-center gap-3 mt-2">
                {[
                  { label: "Published", color: "#2DA457", count: publishedCount },
                  { label: "Draft", color: "#8A90A0", count: draftCount },
                  { label: "Hidden", color: "#D4860A", count: hiddenCount },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span className="rounded-full" style={{ width: 6, height: 6, background: item.color, display: "inline-block" }} />
                    <span style={{ fontSize: 10, color: "var(--muted-foreground)", fontFamily: "DM Mono, monospace" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div>
              <div style={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Recently Updated
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {allPages
                  .slice()
                  .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                  .slice(0, 4)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 rounded px-2.5 py-2"
                      style={{ background: "var(--input-background)" }}
                    >
                      <div
                        className="rounded-sm flex-shrink-0"
                        style={{ width: 4, height: 28, background: p.status === "published" ? "#2DA457" : p.status === "draft" ? "#8A90A0" : "#D4860A" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {lang === "en" ? p.titleEn : p.titleAr}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted-foreground)", fontFamily: "DM Mono, monospace" }}>
                          {new Date(p.lastUpdated).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Lang hint */}
            <div
              className="rounded p-3"
              style={{ background: "var(--accent)", border: "1px solid rgba(196,127,23,0.15)" }}
            >
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--accent-foreground)", marginBottom: 4 }}>
                Bilingual CMS
              </div>
              <div style={{ fontSize: 11, color: "var(--accent-foreground)", opacity: 0.75, lineHeight: 1.5 }}>
                All pages support Arabic + English content. Use the language toggle to switch preview language.
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={13} style={{ color: "var(--muted-foreground)", marginTop: 1, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 1 }}>{label}</div>
        <div
          style={{
            fontSize: 12,
            color: "var(--foreground)",
            fontFamily: mono ? "DM Mono, monospace" : "Inter, sans-serif",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
