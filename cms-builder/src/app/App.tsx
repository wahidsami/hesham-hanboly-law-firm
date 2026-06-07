import { useEffect, useState, type FormEvent } from "react";
import { Sidebar, type SidebarSection } from "./components/Sidebar";
import { Header, type Lang } from "./components/Header";
import { PagesIndex, type CMSPage } from "./components/PagesIndex";
import { InspectorPanel } from "./components/InspectorPanel";
import { PageBuilder } from "./components/builder/PageBuilder";
import { NavigationManager, type NavItem } from "./components/NavigationManager";
import { MediaLibrary } from "./components/MediaLibrary";
import { SettingsPanel } from "./components/SettingsPanel";
import { ArticlesModule } from "./components/articles/ArticlesModule";
import { PracticeAreasModule } from "./components/practice-areas/PracticeAreasModule";
import { backendApi } from "./api/backend";
import { LogIn, ShieldCheck } from "lucide-react";

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState<"cms" | "builder">("cms");
  const [activeSection, setActiveSection] = useState<SidebarSection>("pages");
  const [lang, setLang] = useState<Lang>("en");
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [loginUsername, setLoginUsername] = useState("admin");
  const [loginPassword, setLoginPassword] = useState("admin123");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  // CMS page list state (pages table)
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<CMSPage | null>(null);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [articleCount, setArticleCount] = useState(0);
  const [practiceAreaCount, setPracticeAreaCount] = useState(0);

  async function loadDashboardData() {
    const [loadedPages, loadedNavItems, loadedArticles, loadedPracticeAreas] = await Promise.all([
      backendApi.listPages(),
      backendApi.listNavigation(),
      backendApi.listArticles(),
      backendApi.listPracticeAreas(),
    ]);
    setPages(loadedPages.map((page) => ({
      id: page.id,
      titleEn: page.titleEn,
      titleAr: page.titleAr,
      slug: page.slug,
      status: page.status,
      navVisible: page.navVisible,
      lastUpdated: page.updatedAt,
      author: page.author,
      blocksCount: page.blocks.length,
    })));
    setNavItems(loadedNavItems);
    setArticleCount(loadedArticles.length);
    setPracticeAreaCount(loadedPracticeAreas.length);
  }

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const session = await backendApi.authMe();
        if (cancelled) return;
        if (session.authenticated) {
          setAuthenticated(true);
          setCurrentUser(session.username || "admin");
          try {
            await loadDashboardData();
          } catch {
            setPages([]);
            setNavItems([]);
          }
        } else {
          setAuthenticated(false);
          setCurrentUser("");
        }
      } catch {
        if (!cancelled) {
          setAuthenticated(false);
          setCurrentUser("");
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    }

    void checkSession();
    return () => { cancelled = true; };
  }, []);

  async function refreshPages() {
    const loadedPages = await backendApi.listPages();
    setPages(loadedPages.map((page) => ({
      id: page.id,
      titleEn: page.titleEn,
      titleAr: page.titleAr,
      slug: page.slug,
      status: page.status,
      navVisible: page.navVisible,
      lastUpdated: page.updatedAt,
      author: page.author,
      blocksCount: page.blocks.length,
    })));
    return loadedPages;
  }

  async function refreshNav() {
    const loadedNav = await backendApi.listNavigation();
    setNavItems(loadedNav);
    return loadedNav;
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    try {
      await backendApi.authLogin(loginUsername.trim(), loginPassword);
      const session = await backendApi.authMe();
      setAuthenticated(session.authenticated);
      setCurrentUser(session.username || loginUsername.trim());
      try {
        await loadDashboardData();
      } catch {
        setPages([]);
        setNavItems([]);
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Login failed");
      setAuthenticated(false);
      setCurrentUser("");
    }
  }

  async function handleLogout() {
    await backendApi.authLogout();
    setAuthenticated(false);
    setCurrentUser("");
    setPages([]);
    setNavItems([]);
    setSelectedPage(null);
  }

  async function handleCreatePage(titleEn: string, titleAr: string, slug: string) {
    await backendApi.createPage({ titleEn, titleAr, slug, status: 'draft', navVisible: false, seoTitleEn: titleEn, seoTitleAr: titleAr, seoDescEn: '', seoDescAr: '' });
    await refreshPages();
  }

  async function handleDuplicatePage(pageId: string) {
    const page = pages.find((item) => item.id === pageId);
    if (!page) return;
    await backendApi.duplicatePage({
      id: page.id,
      titleEn: page.titleEn,
      titleAr: page.titleAr,
      slug: page.slug,
      status: page.status,
      navVisible: page.navVisible,
      seoTitleEn: page.titleEn,
      seoTitleAr: page.titleAr,
      seoDescEn: '',
      seoDescAr: '',
      blocks: Array.from({ length: page.blocksCount }, (_, index) => ({
        id: `${page.id}-block-${index + 1}`,
        type: "rich-text",
        order: index + 1,
        data: {},
      })),
      createdAt: page.lastUpdated,
      updatedAt: page.lastUpdated,
      publishedAt: page.status === 'published' ? page.lastUpdated : null,
      author: page.author,
    });
    await refreshPages();
  }

  async function handleDeletePage(pageId: string) {
    const page = pages.find((item) => item.id === pageId);
    if (!page) return;
    await backendApi.deletePage(page.slug);
    await refreshPages();
    await refreshNav();
    if (selectedPage?.id === pageId) {
      setSelectedPage(null);
    }
  }

  async function handleToggleNav(pageId: string) {
    const page = pages.find((item) => item.id === pageId);
    if (!page) return;
    const nextVisible = !page.navVisible;
    await backendApi.savePage({
      id: page.id,
      titleEn: page.titleEn,
      titleAr: page.titleAr,
      slug: page.slug,
      status: page.status,
      navVisible: nextVisible,
      blocksCount: page.blocksCount,
      seoTitleEn: page.titleEn,
      seoTitleAr: page.titleAr,
      seoDescEn: '',
      seoDescAr: '',
      blocks: [],
      createdAt: page.lastUpdated,
      updatedAt: new Date().toISOString(),
      publishedAt: page.status === 'published' ? page.lastUpdated : null,
      author: page.author,
    });
    await refreshPages();
    const nextNav = nextVisible
      ? [...navItems, {
          id: `nav-${page.id}`,
          pageId: page.id,
          labelEn: page.titleEn,
          labelAr: page.titleAr,
          url: page.slug,
          desktopVisible: true,
          mobileVisible: true,
          order: navItems.length + 1,
        }]
      : navItems.filter((item) => item.pageId !== page.id);
    setNavItems(await backendApi.saveNavigation(nextNav));
  }

  async function handleOpenBuilder() {
    try {
      await refreshPages();
      await refreshNav();
    } catch {
      // keep existing data if refresh fails
    }
    setMode("builder");
  }

  if (mode === "builder") {
    return (
      <PageBuilder
        onBack={async () => {
          try {
            await refreshPages();
            await refreshNav();
          } catch {
            // keep existing data if refresh fails
          }
          setMode("cms");
        }}
        initialLang={lang}
        initialPages={pages.length > 0 ? pages.map((page) => ({
          id: page.id,
          titleEn: page.titleEn,
          titleAr: page.titleAr,
          slug: page.slug,
          status: page.status,
          navVisible: page.navVisible,
          seoTitleEn: page.titleEn,
          seoTitleAr: page.titleAr,
          seoDescEn: '',
          seoDescAr: '',
          blocks: [],
        })) : undefined}
        initialSelectedPageId={selectedPage?.id ?? pages[0]?.id ?? null}
      />
    );
  }

  if (authLoading) {
    return (
      <div className="size-full flex items-center justify-center" style={{ background: "var(--background)", fontFamily: "Inter, sans-serif" }}>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm" style={{ width: 420, maxWidth: "calc(100vw - 32px)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-2xl flex items-center justify-center" style={{ background: "rgba(196,127,23,0.12)", color: "var(--primary)" }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>Loading CMS…</div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Checking your admin session</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="size-full flex items-center justify-center" style={{ background: "var(--background)", fontFamily: "Inter, sans-serif" }}>
        <form onSubmit={handleLogin} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm" style={{ width: 480, maxWidth: "calc(100vw - 32px)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-2xl flex items-center justify-center" style={{ background: "rgba(196,127,23,0.12)", color: "var(--primary)" }}>
              <LogIn size={20} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)" }}>CMS Login</div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Sign in to manage pages, media, and content</div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>Username</span>
              <input value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} autoComplete="username" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>Password</span>
              <input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} autoComplete="current-password" type="password" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
            </label>
            {authError && (
              <div style={{ borderRadius: 12, padding: "10px 12px", background: "rgba(185,28,28,0.08)", color: "#B91C1C", fontSize: 12 }}>
                {authError}
              </div>
            )}
            <button type="submit" className="rounded-xl px-4 py-3 font-semibold" style={{ background: "var(--primary)", color: "#fff" }}>
              Sign in
            </button>
          </div>

          <div style={{ marginTop: 16, fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.6 }}>
            Test credentials:
            <span style={{ fontFamily: "DM Mono, monospace" }}> admin / admin123</span>
          </div>
        </form>
      </div>
    );
  }

  // Nav pages shape for NavigationManager
  const navPages = pages.map(p => ({
    id: p.id,
    titleEn: p.titleEn,
    titleAr: p.titleAr,
    slug: p.slug,
    status: p.status,
  }));

  function renderMain() {
    switch (activeSection) {
      case "pages":
        return (
          <PagesIndex
            pages={pages}
            lang={lang}
            onSelectPage={setSelectedPage}
            selectedPageId={selectedPage?.id ?? null}
            onCreatePage={handleCreatePage}
            onDuplicatePage={handleDuplicatePage}
            onDeletePage={handleDeletePage}
            onToggleNav={handleToggleNav}
          />
        );
      case "navigation":
        return (
          <NavigationManager
            navItems={navItems}
            allPages={navPages}
            onUpdate={async (items) => {
              const saved = await backendApi.saveNavigation(items);
              setNavItems(saved);
              const visiblePageIds = new Set(items.map((item) => item.pageId));
              setPages((prev) => prev.map((page) => ({ ...page, navVisible: visiblePageIds.has(page.id) })));
            }}
            lang={lang}
          />
        );
      case "articles":
        return <ArticlesModule lang={lang} onCountChange={setArticleCount} />;
      case "practice-areas":
        return <PracticeAreasModule lang={lang} onCountChange={setPracticeAreaCount} />;
      case "media":
        return <MediaLibrary lang={lang} />;
      case "settings":
        return <SettingsPanel />;
      default:
        return null;
    }
  }

  return (
    <div className="size-full flex flex-col overflow-hidden" style={{ background: "var(--background)" }}>
      <Header
        lang={lang}
        onToggleLang={() => setLang(l => l === "en" ? "ar" : "en")}
        section={activeSection}
        username={currentUser}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          active={activeSection}
          onSelect={s => { setActiveSection(s); setSelectedPage(null); }}
          pageCount={pages.length}
          articleCount={articleCount}
          practiceAreaCount={practiceAreaCount}
        />
        <main className="flex-1 overflow-hidden" style={{ background: "var(--background)" }}>
          {renderMain()}
        </main>
        {/* Inspector only shown for pages section */}
        {activeSection === "pages" && (
        <InspectorPanel
          page={selectedPage}
          lang={lang}
          onClose={() => setSelectedPage(null)}
          allPages={pages}
            onOpenBuilder={handleOpenBuilder}
          />
        )}
      </div>
    </div>
  );
}
