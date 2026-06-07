import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import type { Lang } from "./Header";

export interface CMSPage {
  id: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  status: "published" | "draft" | "hidden";
  navVisible: boolean;
  lastUpdated: string;
  author: string;
  blocksCount: number;
}

const STATUS_CONFIG = {
  published: { label: "Published", bg: "#E6F4EA", color: "#1A7B3C", dot: "#2DA457" },
  draft: { label: "Draft", bg: "#EEF0F4", color: "#4A5060", dot: "#8A90A0" },
  hidden: { label: "Hidden", bg: "#FFF4E5", color: "#8C4A00", dot: "#D4860A" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusChip({ status }: { status: CMSPage["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
      style={{
        background: cfg.bg,
        fontFamily: "DM Mono, monospace",
        fontSize: 11,
        fontWeight: 500,
        color: cfg.color,
        whiteSpace: "nowrap",
      }}
    >
      <span className="rounded-full" style={{ width: 5, height: 5, background: cfg.dot, flexShrink: 0, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

interface PagesIndexProps {
  lang: Lang;
  pages: CMSPage[];
  onSelectPage: (page: CMSPage | null) => void;
  selectedPageId: string | null;
  onCreatePage: (titleEn: string, titleAr: string, slug: string) => Promise<void>;
  onDuplicatePage: (pageId: string) => Promise<void>;
  onDeletePage: (pageId: string) => Promise<void>;
  onToggleNav: (pageId: string) => Promise<void>;
}

const PAGE_SIZE = 8;

function NewPageModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (titleEn: string, titleAr: string, slug: string) => void;
  onClose: () => void;
}) {
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  function deriveSlug(value: string) {
    return "/" + value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  }

  function handleTitleChange(value: string) {
    setTitleEn(value);
    if (!slugEdited) {
      setSlug(deriveSlug(value));
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ width: 420, background: "var(--card)", borderRadius: 10, border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>Create page</div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>Add a bilingual page record to the CMS.</div>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 10, fontFamily: "DM Mono, monospace", color: "var(--muted-foreground)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>English Title *</label>
            <input value={titleEn} onChange={(e) => handleTitleChange(e.target.value)} style={{ width: "100%", background: "var(--input-background)", border: "1px solid var(--border)", borderRadius: 5, padding: "8px 10px", fontSize: 12, color: "var(--foreground)", outline: "none" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontFamily: "DM Mono, monospace", color: "var(--muted-foreground)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Arabic Title *</label>
            <input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} dir="rtl" style={{ width: "100%", background: "var(--input-background)", border: "1px solid var(--border)", borderRadius: 5, padding: "8px 10px", fontSize: 12, color: "var(--foreground)", outline: "none", fontFamily: "serif" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontFamily: "DM Mono, monospace", color: "var(--muted-foreground)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Slug *</label>
            <input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }} style={{ width: "100%", background: "var(--input-background)", border: "1px solid var(--border)", borderRadius: 5, padding: "8px 10px", fontSize: 12, color: "var(--foreground)", outline: "none", fontFamily: "DM Mono, monospace" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "9px 12px", borderRadius: 5, border: "1px solid var(--border)", background: "var(--input-background)", cursor: "pointer", fontSize: 12, color: "var(--foreground)" }}>Cancel</button>
            <button disabled={!titleEn.trim() || !titleAr.trim() || !slug.trim()} onClick={() => onConfirm(titleEn.trim(), titleAr.trim(), slug.trim())} style={{ flex: 1, padding: "9px 12px", borderRadius: 5, border: "none", background: titleEn.trim() && titleAr.trim() && slug.trim() ? "var(--primary)" : "var(--muted)", cursor: titleEn.trim() && titleAr.trim() && slug.trim() ? "pointer" : "not-allowed", fontSize: 12, color: titleEn.trim() && titleAr.trim() && slug.trim() ? "#fff" : "var(--muted-foreground)", fontWeight: 600 }}>Create Page</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PagesIndex({ pages, lang, onSelectPage, selectedPageId, onCreatePage, onDuplicatePage, onDeletePage, onToggleNav }: PagesIndexProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CMSPage["status"]>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  const filtered = useMemo(() => {
    let list = pages;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.titleEn.toLowerCase().includes(q) ||
          p.titleAr.includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }
    return list;
  }, [pages, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const allPageSelected = pageItems.length > 0 && pageItems.every((p) => selectedIds.has(p.id));
  const someSelected = pageItems.some((p) => selectedIds.has(p.id));

  function toggleAll() {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageItems.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageItems.forEach((p) => next.add(p.id));
        return next;
      });
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function deletePage(id: string) {
    void onDeletePage(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (selectedPageId === id) onSelectPage(null);
    setOpenMenuId(null);
  }

  function toggleNav(id: string) {
    void onToggleNav(id);
  }

  function bulkDelete() {
    selectedIds.forEach((id) => { void onDeletePage(id); });
    setSelectedIds(new Set());
    if (selectedPageId && selectedIds.has(selectedPageId)) onSelectPage(null);
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "Inter, sans-serif" }} onClick={() => { setOpenMenuId(null); setShowFilterMenu(false); }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex-1">
          <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>Pages</h1>
          <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: 0, marginTop: 1 }}>
            {filtered.length} page{filtered.length !== 1 ? "s" : ""}
            {statusFilter !== "all" && ` · ${statusFilter}`}
          </p>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              {selectedIds.size} selected
            </span>
            <button
              onClick={bulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
              style={{
                background: "#FEE2E2",
                border: "none",
                cursor: "pointer",
                color: "#B91C1C",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              <Trash2 size={12} />
              Delete selected
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted-foreground)",
              pointerEvents: "none",
            }}
          />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search pages…"
            style={{
              paddingLeft: 30,
              paddingRight: 10,
              paddingTop: 6,
              paddingBottom: 6,
              background: "var(--input-background)",
              border: "1px solid transparent",
              borderRadius: "var(--radius)",
              fontSize: 12,
              color: "var(--foreground)",
              outline: "none",
              width: 200,
              fontFamily: "Inter, sans-serif",
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--primary)"; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "transparent"; }}
          />
        </div>

        {/* Filter */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowFilterMenu((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded"
            style={{
              background: statusFilter !== "all" ? "var(--accent)" : "var(--input-background)",
              border: statusFilter !== "all" ? "1px solid rgba(196,127,23,0.2)" : "1px solid transparent",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 500,
              color: statusFilter !== "all" ? "var(--accent-foreground)" : "var(--muted-foreground)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <Filter size={12} />
            {statusFilter === "all" ? "All Status" : STATUS_CONFIG[statusFilter].label}
            <ChevronDown size={11} />
          </button>
          {showFilterMenu && (
            <div
              className="absolute right-0 mt-1 rounded shadow-lg py-1 z-20"
              style={{ background: "var(--card)", border: "1px solid var(--border)", minWidth: 140, top: "100%" }}
            >
              {(["all", "published", "draft", "hidden"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setCurrentPage(1); setShowFilterMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left transition-colors"
                  style={{
                    background: statusFilter === s ? "var(--muted)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "var(--foreground)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {s === "all" ? "All Status" : STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* New Page */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-opacity"
          style={{
            background: "var(--primary)",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            color: "#fff",
            fontFamily: "Inter, sans-serif",
          }}
          onClick={() => setShowNewModal(true)}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
        >
          <Plus size={13} strokeWidth={2.5} />
          New Page
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ position: "sticky", top: 0, background: "var(--background)", zIndex: 5 }}>
            <tr>
              <th style={{ width: 44, padding: "10px 0 10px 20px" }}>
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allPageSelected; }}
                  onChange={toggleAll}
                  style={{ cursor: "pointer", accentColor: "var(--primary)" }}
                />
              </th>
              <th
                className="text-left"
                style={{ padding: "10px 16px", fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", fontFamily: "DM Mono, monospace", letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}
              >
                <span className="flex items-center gap-1">Title <ArrowUpDown size={10} /></span>
              </th>
              <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", fontFamily: "DM Mono, monospace", letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                Status
              </th>
              <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", fontFamily: "DM Mono, monospace", letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                Nav
              </th>
              <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", fontFamily: "DM Mono, monospace", letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                Blocks
              </th>
              <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", fontFamily: "DM Mono, monospace", letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                Last Updated
              </th>
              <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", fontFamily: "DM Mono, monospace", letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: "1px solid var(--border)", textAlign: "right" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((page) => {
              const isSelected = selectedIds.has(page.id);
              const isActive = selectedPageId === page.id;
              return (
                <tr
                  key={page.id}
                  onClick={() => onSelectPage(isActive ? null : page)}
                  style={{
                    background: isActive ? "rgba(196,127,23,0.04)" : isSelected ? "rgba(0,0,0,0.02)" : "transparent",
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLTableRowElement).style.background = "rgba(0,0,0,0.025)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLTableRowElement).style.background = isSelected ? "rgba(0,0,0,0.02)" : "transparent";
                  }}
                >
                  {/* Checkbox */}
                  <td style={{ padding: "12px 0 12px 20px" }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(page.id)}
                      style={{ cursor: "pointer", accentColor: "var(--primary)" }}
                    />
                  </td>

                  {/* Title */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>
                        {lang === "en" ? page.titleEn : page.titleAr}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "DM Mono, monospace" }}>
                        {lang === "en" ? page.titleAr : page.titleEn}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "DM Mono, monospace", marginTop: 1 }}>
                        {page.slug}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "12px 16px" }}>
                    <StatusChip status={page.status} />
                  </td>

                  {/* Nav visibility */}
                  <td style={{ padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleNav(page.id)}
                      title={page.navVisible ? "Visible in nav" : "Hidden from nav"}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: page.navVisible ? "var(--primary)" : "var(--muted-foreground)",
                        display: "flex",
                        alignItems: "center",
                        padding: 4,
                        borderRadius: 4,
                        opacity: page.navVisible ? 1 : 0.45,
                      }}
                    >
                      {page.navVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  </td>

                  {/* Blocks count */}
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        fontFamily: "DM Mono, monospace",
                        fontSize: 12,
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {page.blocksCount}
                    </span>
                  </td>

                  {/* Last updated */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <span style={{ fontSize: 12, color: "var(--foreground)" }}>{formatDate(page.lastUpdated)}</span>
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{page.author}</span>
                    </div>
                  </td>

                  {/* Row actions */}
                  <td style={{ padding: "12px 16px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Preview"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 5, borderRadius: 4, display: "flex" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--muted)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                      >
                        <ExternalLink size={13} />
                      </button>
                      <button
                        title="Duplicate"
                        onClick={() => void onDuplicatePage(page.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 5, borderRadius: 4, display: "flex" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--muted)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                      >
                        <Copy size={13} />
                      </button>
                      <div className="relative">
                        <button
                          title="More actions"
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === page.id ? null : page.id); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 5, borderRadius: 4, display: "flex" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--muted)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                        >
                          <MoreHorizontal size={13} />
                        </button>
                        {openMenuId === page.id && (
                          <div
                            className="absolute rounded shadow-lg py-1 z-30"
                            style={{
                              right: 0,
                              top: "calc(100% + 4px)",
                              background: "var(--card)",
                              border: "1px solid var(--border)",
                              minWidth: 140,
                            }}
                          >
                            <button
                              onClick={() => deletePage(page.id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-left"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 12,
                                color: "#B91C1C",
                                fontFamily: "Inter, sans-serif",
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FEE2E2"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                            >
                              <Trash2 size={12} />
                              Delete page
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {pageItems.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16"
            style={{ color: "var(--muted-foreground)", fontFamily: "Inter, sans-serif" }}
          >
            <Search size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: 13, margin: 0 }}>No pages match your filters</p>
            <button
              onClick={() => { setSearch(""); setStatusFilter("all"); }}
              style={{ marginTop: 8, fontSize: 12, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {showNewModal && (
        <NewPageModal
          onConfirm={async (titleEn, titleAr, slug) => {
            await onCreatePage(titleEn, titleAr, slug);
            setShowNewModal(false);
          }}
          onClose={() => setShowNewModal(false)}
        />
      )}

      {/* Pagination */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderTop: "1px solid var(--border)", background: "var(--background)" }}
      >
        <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "DM Mono, monospace" }}>
          Page {currentPage} of {totalPages} · {filtered.length} results
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center rounded"
            style={{
              width: 28,
              height: 28,
              background: "none",
              border: "1px solid var(--border)",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.35 : 1,
              color: "var(--foreground)",
            }}
          >
            <ChevronLeft size={13} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setCurrentPage(n)}
              className="flex items-center justify-center rounded"
              style={{
                width: 28,
                height: 28,
                background: n === currentPage ? "var(--primary)" : "none",
                border: n === currentPage ? "none" : "1px solid var(--border)",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "DM Mono, monospace",
                color: n === currentPage ? "#fff" : "var(--foreground)",
                fontWeight: n === currentPage ? 600 : 400,
              }}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center rounded"
            style={{
              width: 28,
              height: 28,
              background: "none",
              border: "1px solid var(--border)",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.35 : 1,
              color: "var(--foreground)",
            }}
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
