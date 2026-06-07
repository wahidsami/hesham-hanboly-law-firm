import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Plus, Trash2, Loader2, Save, Image as ImageIcon } from 'lucide-react';
import { backendApi } from '../../api/backend';
import { ImageAssetPicker } from '../shared/ImageAssetPicker';
import type { HeroSlideRecord, SiteSettingsRecord } from '../../../../../src/types';
import type { Lang } from '../Header';

interface HomePageEditorProps {
  pageTitle: string;
  pageSlug: string;
  lang: Lang;
}

function HomeField({
  label,
  value,
  onChange,
  multiline = false,
  dir = 'ltr',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  dir?: 'ltr' | 'rtl';
}) {
  const common = {
    width: '100%',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '11px 14px',
    background: 'var(--card)',
    color: 'var(--foreground)',
    fontFamily: dir === 'rtl' ? 'Cairo, sans-serif' : 'Poppins, sans-serif',
    fontSize: 13,
    resize: 'vertical' as const,
    boxSizing: 'border-box',
    direction: dir,
  };

  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} style={{ ...common, minHeight: 88 }} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} style={common} />
      )}
    </label>
  );
}

function Group({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section style={{ border: '1px solid var(--border)', borderRadius: 20, background: 'var(--card)', padding: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4, lineHeight: 1.6 }}>{description}</div>
      </div>
      {children}
    </section>
  );
}

function defaultHeroSlide(): HeroSlideRecord {
  const id = `hero-${Date.now()}`;
  return {
    id,
    badgeAr: 'الرئيسية',
    badgeEn: 'HOME',
    badgeIcon: 'Scale',
    titleArLine1: 'عنوان رئيسي',
    titleEnLine1: 'Main Title',
    titleArLine2: '',
    titleEnLine2: '',
    descriptionAr: '',
    descriptionEn: '',
    ctaTextAr: 'تواصل معنا',
    ctaTextEn: 'Contact Us',
    actionType: 'contact',
    actionParam: '',
    image: '',
    imageAltAr: '',
    imageAltEn: '',
  };
}

export function HomePageEditor({ pageTitle, pageSlug, lang }: HomePageEditorProps) {
  const [loading, setLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [heroSlides, setHeroSlides] = useState<HeroSlideRecord[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsRecord | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState<'navbar' | 'about' | 'statistics' | 'team' | 'contact' | 'doctorShield'>('navbar');
  const [heroEditorSection, setHeroEditorSection] = useState<'content' | 'image' | 'advanced'>('content');
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const settingsRefs = {
    navbar: useRef<HTMLElement | null>(null),
    about: useRef<HTMLElement | null>(null),
    statistics: useRef<HTMLElement | null>(null),
    team: useRef<HTMLElement | null>(null),
    contact: useRef<HTMLElement | null>(null),
    doctorShield: useRef<HTMLElement | null>(null),
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const content = await backendApi.getContent();
        if (cancelled) return;
        setHeroSlides(content.heroSlides || []);
        setSiteSettings(content.siteSettings);
        setSelectedSlideId((current) => current || content.heroSlides?.[0]?.id || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSlide = useMemo(
    () => heroSlides.find((slide) => slide.id === selectedSlideId) || heroSlides[0] || null,
    [heroSlides, selectedSlideId],
  );

  const sectionLinks = [
    { id: 'hero', label: 'Hero slides', ref: heroSectionRef },
    { id: 'navbar', label: 'Navbar / Footer', ref: settingsRefs.navbar },
    { id: 'about', label: 'About section', ref: settingsRefs.about },
    { id: 'statistics', label: 'Statistics', ref: settingsRefs.statistics },
    { id: 'team', label: 'Meet our legal counsel', ref: settingsRefs.team },
    { id: 'contact', label: 'Contact section', ref: settingsRefs.contact },
    { id: 'doctorShield', label: 'Doctor Shield', ref: settingsRefs.doctorShield },
  ] as const;

  function scrollToSection(ref: RefObject<HTMLElement | null>) {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateSlide(id: string, patch: Partial<HeroSlideRecord>) {
    setHeroSlides((current) => current.map((slide) => (slide.id === id ? { ...slide, ...patch } : slide)));
  }

  async function saveHeroSlides() {
    setSavingHero(true);
    try {
      await backendApi.saveHeroSlides(heroSlides);
    } finally {
      setSavingHero(false);
    }
  }

  async function saveSiteSettings() {
    if (!siteSettings) return;
    setSavingSettings(true);
    try {
      await backendApi.saveSiteSettings(siteSettings);
    } finally {
      setSavingSettings(false);
    }
  }

  function addSlide() {
    const next = defaultHeroSlide();
    setHeroSlides((current) => [...current, next]);
    setSelectedSlideId(next.id);
  }

  function removeSlide(id: string) {
    setHeroSlides((current) => {
      const next = current.filter((slide) => slide.id !== id);
      setSelectedSlideId((currentId) => next.find((slide) => slide.id === currentId)?.id || next[0]?.id || null);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex items-center gap-3 text-[var(--primary)]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Loading homepage editor…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto" style={{ background: 'linear-gradient(180deg, #F7F2E9 0%, #F1ECE3 100%)' }}>
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-6 py-6">
        <section className="rounded-[28px] border border-[#D8D1C7] bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Homepage editor</div>
              <h2 className="mt-2 text-2xl font-extrabold text-[#1E1E1E]">{pageTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5B5B5B]">
                This editor controls the live homepage content without changing the public layout. Use it to update the hero images and the homepage copy blocks.
              </p>
            </div>
            <div className="rounded-2xl border border-[#D8D1C7] bg-[#FBF7F0] px-4 py-3 text-sm text-[#5B5B5B]">
              <div className="font-semibold text-[#1E1E1E]">Route</div>
              <div className="mt-1 font-mono">{pageSlug}</div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-[#E8E0D3] pt-4">
            {sectionLinks.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  if (section.id === 'hero') {
                    scrollToSection(section.ref);
                    return;
                  }
                  setActiveSettingsSection(section.id === 'team' ? 'team' : section.id === 'doctorShield' ? 'doctorShield' : section.id as typeof activeSettingsSection);
                  scrollToSection(section.ref);
                }}
                className="rounded-full border border-[#D8D1C7] bg-[#FBF7F0] px-4 py-2 text-xs font-semibold text-[#1E1E1E] transition hover:border-[#A56A1E] hover:text-[#A56A1E]"
              >
                {section.label}
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside ref={heroSectionRef} className="rounded-[28px] border border-[#D8D1C7] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Hero slides</div>
                <div className="mt-1 text-sm text-[#5B5B5B]">{heroSlides.length} slide{heroSlides.length === 1 ? '' : 's'}</div>
              </div>
              <button type="button" onClick={addSlide} className="inline-flex items-center gap-2 rounded-xl bg-[#A56A1E] px-4 py-2 text-sm font-bold text-white">
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {heroSlides.map((slide, index) => {
                const isSelected = slide.id === selectedSlideId;
                return (
                  <div
                    key={slide.id}
                    onClick={() => setSelectedSlideId(slide.id)}
                    role="button"
                    tabIndex={0}
                    className="flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition"
                    style={{
                      borderColor: isSelected ? '#A56A1E' : '#D8D1C7',
                      background: isSelected ? 'rgba(165,106,30,0.08)' : '#FBF7F0',
                    }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#A56A1E]">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-[#1E1E1E]">{slide.titleEnLine1 || `Slide ${index + 1}`}</div>
                      <div className="truncate text-xs text-[#5B5B5B]">{slide.badgeEn || slide.badgeAr || 'Homepage slide'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeSlide(slide.id);
                      }}
                      className="rounded-full p-2 text-[#8A6B52] transition hover:bg-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
              {heroSlides.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#D8D1C7] bg-[#FFFDF9] p-4 text-sm text-[#5B5B5B]">
                  No slides yet. Add the first slide to start editing the homepage banner.
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={saveHeroSlides}
              disabled={savingHero || heroSlides.length === 0}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#121212] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingHero ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save hero slides
            </button>
          </aside>

          <main className="space-y-6">
            {selectedSlide ? (
              <section className="rounded-[28px] border border-[#D8D1C7] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Selected slide</div>
                    <h3 className="mt-1 text-2xl font-extrabold text-[#1E1E1E]">Edit slide content and image</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="rounded-xl border border-[#D8D1C7] bg-[#FBF7F0] px-4 py-2 text-sm font-semibold text-[#1E1E1E]"
                  >
                    Choose image from media library
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-[#E8E0D3] bg-[#FBF7F0] p-2">
                  {[
                    ['content', 'Content'],
                    ['image', 'Image'],
                    ['advanced', 'Advanced'],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setHeroEditorSection(id as typeof heroEditorSection)}
                      className="rounded-full px-4 py-2 text-xs font-semibold transition"
                      style={{
                        background: heroEditorSection === id ? '#121212' : 'transparent',
                        color: heroEditorSection === id ? '#fff' : '#1E1E1E',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="space-y-4">
                    {heroEditorSection === 'content' && (
                      <div className="rounded-3xl border border-[#D8D1C7] bg-[#FBF7F0] p-4">
                        <div className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Slide content</div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <HomeField label={lang === 'ar' ? 'الشارة بالعربية' : 'Badge (Arabic)'} value={selectedSlide.badgeAr} onChange={(value) => updateSlide(selectedSlide.id, { badgeAr: value })} dir="rtl" />
                          <HomeField label={lang === 'ar' ? 'Badge in English' : 'Badge (English)'} value={selectedSlide.badgeEn} onChange={(value) => updateSlide(selectedSlide.id, { badgeEn: value })} />
                          <HomeField label={lang === 'ar' ? 'العنوان السطر الأول' : 'Title line 1'} value={selectedSlide.titleEnLine1} onChange={(value) => updateSlide(selectedSlide.id, { titleEnLine1: value })} />
                          <HomeField label={lang === 'ar' ? 'العنوان السطر الثاني' : 'Title line 2'} value={selectedSlide.titleEnLine2} onChange={(value) => updateSlide(selectedSlide.id, { titleEnLine2: value })} />
                          <HomeField label={lang === 'ar' ? 'الوصف' : 'Description'} value={selectedSlide.descriptionEn} onChange={(value) => updateSlide(selectedSlide.id, { descriptionEn: value })} multiline />
                          <HomeField label={lang === 'ar' ? 'وصف عربي' : 'Arabic description'} value={selectedSlide.descriptionAr} onChange={(value) => updateSlide(selectedSlide.id, { descriptionAr: value })} multiline dir="rtl" />
                          <HomeField label={lang === 'ar' ? 'زر الإجراء' : 'CTA label'} value={selectedSlide.ctaTextEn} onChange={(value) => updateSlide(selectedSlide.id, { ctaTextEn: value })} />
                          <HomeField label={lang === 'ar' ? 'زر الإجراء بالعربية' : 'CTA label (Arabic)'} value={selectedSlide.ctaTextAr} onChange={(value) => updateSlide(selectedSlide.id, { ctaTextAr: value })} dir="rtl" />
                        </div>
                      </div>
                    )}

                    {heroEditorSection === 'image' && (
                      <div className="space-y-4 rounded-3xl border border-[#D8D1C7] bg-[#FBF7F0] p-4">
                        <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Slide image</div>
                        <div className="overflow-hidden rounded-2xl border border-[#D8D1C7] bg-white">
                          {selectedSlide.image ? (
                            <img src={selectedSlide.image} alt={selectedSlide.imageAltEn || selectedSlide.imageAltAr} className="h-56 w-full object-contain bg-[#FAF7F1]" />
                          ) : (
                            <div className="flex h-56 items-center justify-center text-sm text-[#8A8A8A]">No image selected</div>
                          )}
                        </div>
                        <HomeField label={lang === 'ar' ? 'رابط الصورة' : 'Image URL'} value={selectedSlide.image} onChange={(value) => updateSlide(selectedSlide.id, { image: value })} />
                        <button type="button" onClick={() => setPickerOpen(true)} className="rounded-xl border border-[#D8D1C7] bg-white px-4 py-3 text-sm font-semibold text-[#1E1E1E]">
                          Choose image from media library
                        </button>
                      </div>
                    )}

                    {heroEditorSection === 'advanced' && (
                      <div className="grid gap-4 rounded-3xl border border-[#D8D1C7] bg-[#FBF7F0] p-4">
                        <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Advanced</div>
                        <HomeField label={lang === 'ar' ? 'معرّف الإجراء' : 'Action param'} value={selectedSlide.actionParam || ''} onChange={(value) => updateSlide(selectedSlide.id, { actionParam: value })} />
                        <HomeField label={lang === 'ar' ? 'نص الصورة البديل' : 'Image alt'} value={selectedSlide.imageAltEn} onChange={(value) => updateSlide(selectedSlide.id, { imageAltEn: value })} />
                        <HomeField label={lang === 'ar' ? 'وصف الصورة البديل بالعربية' : 'Image alt (Arabic)'} value={selectedSlide.imageAltAr} onChange={(value) => updateSlide(selectedSlide.id, { imageAltAr: value })} dir="rtl" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={saveHeroSlides} disabled={savingHero} className="inline-flex items-center gap-2 rounded-xl bg-[#A56A1E] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
                    {savingHero ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save slide changes
                  </button>
                </div>
              </section>
            ) : (
              <section className="rounded-[28px] border border-dashed border-[#D8D1C7] bg-white p-8 text-center shadow-sm">
                <div className="text-2xl font-black text-[#1E1E1E]">No hero slide selected</div>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#5B5B5B]">
                  Add a slide on the left to start editing the homepage hero image and copy.
                </p>
              </section>
            )}

            {siteSettings && (
              <section className="space-y-6 rounded-[28px] border border-[#D8D1C7] bg-white p-6 shadow-sm">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Homepage copy</div>
                  <h3 className="mt-1 text-2xl font-extrabold text-[#1E1E1E]">Section text and button labels</h3>
                </div>

                <div className="flex flex-wrap gap-2 rounded-2xl border border-[#E8E0D3] bg-[#FBF7F0] p-2">
                  {[
                    ['navbar', 'Navbar / Footer'],
                    ['about', 'About'],
                    ['statistics', 'Statistics'],
                    ['team', 'Meet our legal counsel'],
                    ['contact', 'Contact'],
                    ['doctorShield', 'Doctor Shield'],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveSettingsSection(id as typeof activeSettingsSection)}
                      className="rounded-full px-4 py-2 text-xs font-semibold transition"
                      style={{
                        background: activeSettingsSection === id ? '#121212' : 'transparent',
                        color: activeSettingsSection === id ? '#fff' : '#1E1E1E',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {activeSettingsSection === 'navbar' && (
                  <section ref={settingsRefs.navbar}>
                  <Group title="Navbar / Footer" description="These texts control the visible CTA and footer copy on the public site.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <HomeField label="Navbar CTA (EN)" value={siteSettings.navbarCtaEn} onChange={(value) => setSiteSettings({ ...siteSettings, navbarCtaEn: value })} />
                    <HomeField label="Navbar CTA (AR)" value={siteSettings.navbarCtaAr} onChange={(value) => setSiteSettings({ ...siteSettings, navbarCtaAr: value })} dir="rtl" />
                    <HomeField label="Footer description (EN)" value={siteSettings.footerDescriptionEn} onChange={(value) => setSiteSettings({ ...siteSettings, footerDescriptionEn: value })} multiline />
                    <HomeField label="Footer description (AR)" value={siteSettings.footerDescriptionAr} onChange={(value) => setSiteSettings({ ...siteSettings, footerDescriptionAr: value })} multiline dir="rtl" />
                    <HomeField label="Address (EN)" value={siteSettings.addressEn} onChange={(value) => setSiteSettings({ ...siteSettings, addressEn: value })} />
                    <HomeField label="Address (AR)" value={siteSettings.addressAr} onChange={(value) => setSiteSettings({ ...siteSettings, addressAr: value })} dir="rtl" />
                    <HomeField label="Phone" value={siteSettings.phone} onChange={(value) => setSiteSettings({ ...siteSettings, phone: value })} />
                    <HomeField label="Email" value={siteSettings.email} onChange={(value) => setSiteSettings({ ...siteSettings, email: value })} />
                  </div>
                  </Group>
                  </section>
                )}

                {activeSettingsSection === 'about' && (
                  <section ref={settingsRefs.about}>
                  <Group title="About section" description="Controls the homepage About area.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <HomeField label="Badge (EN)" value={siteSettings.aboutSectionBadgeEn} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionBadgeEn: value })} />
                    <HomeField label="Badge (AR)" value={siteSettings.aboutSectionBadgeAr} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionBadgeAr: value })} dir="rtl" />
                    <HomeField label="Title (EN)" value={siteSettings.aboutSectionTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionTitleEn: value })} />
                    <HomeField label="Title (AR)" value={siteSettings.aboutSectionTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionTitleAr: value })} dir="rtl" />
                    <HomeField label="Description (EN)" value={siteSettings.aboutSectionDescEn} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionDescEn: value })} multiline />
                    <HomeField label="Description (AR)" value={siteSettings.aboutSectionDescAr} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionDescAr: value })} multiline dir="rtl" />
                    <HomeField label="Card title (EN)" value={siteSettings.aboutSectionCardTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionCardTitleEn: value })} />
                    <HomeField label="Card title (AR)" value={siteSettings.aboutSectionCardTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionCardTitleAr: value })} dir="rtl" />
                    <HomeField label="Card desc (EN)" value={siteSettings.aboutSectionCardDescEn} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionCardDescEn: value })} multiline />
                    <HomeField label="Card desc (AR)" value={siteSettings.aboutSectionCardDescAr} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionCardDescAr: value })} multiline dir="rtl" />
                    <HomeField label="Button (EN)" value={siteSettings.aboutSectionButtonEn} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionButtonEn: value })} />
                    <HomeField label="Button (AR)" value={siteSettings.aboutSectionButtonAr} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionButtonAr: value })} dir="rtl" />
                  </div>
                  </Group>
                  </section>
                )}

                {activeSettingsSection === 'statistics' && (
                  <section ref={settingsRefs.statistics}>
                  <Group title="Statistics section" description="Controls the data callouts on the homepage.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <HomeField label="Badge (EN)" value={siteSettings.statisticsBadgeEn} onChange={(value) => setSiteSettings({ ...siteSettings, statisticsBadgeEn: value })} />
                    <HomeField label="Badge (AR)" value={siteSettings.statisticsBadgeAr} onChange={(value) => setSiteSettings({ ...siteSettings, statisticsBadgeAr: value })} dir="rtl" />
                    <HomeField label="Number" value={siteSettings.statisticsNumber} onChange={(value) => setSiteSettings({ ...siteSettings, statisticsNumber: value })} />
                    <HomeField label="Title (EN)" value={siteSettings.statisticsTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, statisticsTitleEn: value })} />
                    <HomeField label="Title (AR)" value={siteSettings.statisticsTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, statisticsTitleAr: value })} dir="rtl" />
                    <HomeField label="Description (EN)" value={siteSettings.statisticsDescEn} onChange={(value) => setSiteSettings({ ...siteSettings, statisticsDescEn: value })} multiline />
                    <HomeField label="Description (AR)" value={siteSettings.statisticsDescAr} onChange={(value) => setSiteSettings({ ...siteSettings, statisticsDescAr: value })} multiline dir="rtl" />
                    <HomeField label="Support (EN)" value={siteSettings.statisticsSupportEn} onChange={(value) => setSiteSettings({ ...siteSettings, statisticsSupportEn: value })} />
                    <HomeField label="Support (AR)" value={siteSettings.statisticsSupportAr} onChange={(value) => setSiteSettings({ ...siteSettings, statisticsSupportAr: value })} dir="rtl" />
                  </div>
                  </Group>
                  </section>
                )}

                {activeSettingsSection === 'team' && (
                  <section ref={settingsRefs.team}>
                  <Group title="Meet our legal counsel" description="Controls the homepage team block text.">
                  <div className="mb-4 rounded-2xl border border-[#E8E0D3] bg-[#FBF7F0] px-4 py-3 text-sm text-[#5B5B5B]">
                    This section drives the homepage card labeled “Meet our legal counsel” and keeps the public layout unchanged.
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <HomeField label="Badge (EN)" value={siteSettings.teamSectionBadgeEn} onChange={(value) => setSiteSettings({ ...siteSettings, teamSectionBadgeEn: value })} />
                    <HomeField label="Badge (AR)" value={siteSettings.teamSectionBadgeAr} onChange={(value) => setSiteSettings({ ...siteSettings, teamSectionBadgeAr: value })} dir="rtl" />
                    <HomeField label="Title (EN)" value={siteSettings.teamSectionTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, teamSectionTitleEn: value })} />
                    <HomeField label="Title (AR)" value={siteSettings.teamSectionTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, teamSectionTitleAr: value })} dir="rtl" />
                    <HomeField label="Description (EN)" value={siteSettings.teamSectionDescEn} onChange={(value) => setSiteSettings({ ...siteSettings, teamSectionDescEn: value })} multiline />
                    <HomeField label="Description (AR)" value={siteSettings.teamSectionDescAr} onChange={(value) => setSiteSettings({ ...siteSettings, teamSectionDescAr: value })} multiline dir="rtl" />
                    <HomeField label="CTA (EN)" value={siteSettings.teamSectionCtaEn} onChange={(value) => setSiteSettings({ ...siteSettings, teamSectionCtaEn: value })} />
                    <HomeField label="CTA (AR)" value={siteSettings.teamSectionCtaAr} onChange={(value) => setSiteSettings({ ...siteSettings, teamSectionCtaAr: value })} dir="rtl" />
                  </div>
                  </Group>
                  </section>
                )}

                {activeSettingsSection === 'contact' && (
                  <section ref={settingsRefs.contact}>
                  <Group title="Contact section" description="Controls the homepage contact block text.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <HomeField label="Badge (EN)" value={siteSettings.contactSectionBadgeEn} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionBadgeEn: value })} />
                    <HomeField label="Badge (AR)" value={siteSettings.contactSectionBadgeAr} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionBadgeAr: value })} dir="rtl" />
                    <HomeField label="Title (EN)" value={siteSettings.contactSectionTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionTitleEn: value })} />
                    <HomeField label="Title (AR)" value={siteSettings.contactSectionTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionTitleAr: value })} dir="rtl" />
                    <HomeField label="Description (EN)" value={siteSettings.contactSectionDescEn} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionDescEn: value })} multiline />
                    <HomeField label="Description (AR)" value={siteSettings.contactSectionDescAr} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionDescAr: value })} multiline dir="rtl" />
                    <HomeField label="Office title (EN)" value={siteSettings.contactSectionOfficeTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionOfficeTitleEn: value })} />
                    <HomeField label="Office title (AR)" value={siteSettings.contactSectionOfficeTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionOfficeTitleAr: value })} dir="rtl" />
                    <HomeField label="Form title (EN)" value={siteSettings.contactSectionFormTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionFormTitleEn: value })} />
                    <HomeField label="Form title (AR)" value={siteSettings.contactSectionFormTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionFormTitleAr: value })} dir="rtl" />
                    <HomeField label="Form desc (EN)" value={siteSettings.contactSectionFormDescEn} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionFormDescEn: value })} multiline />
                    <HomeField label="Form desc (AR)" value={siteSettings.contactSectionFormDescAr} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionFormDescAr: value })} multiline dir="rtl" />
                  </div>
                  </Group>
                  </section>
                )}

                {activeSettingsSection === 'doctorShield' && (
                  <section ref={settingsRefs.doctorShield}>
                  <Group title="Doctor Shield promo" description="Controls the special Doctor Shield promo block on the homepage.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <HomeField label="Badge (EN)" value={siteSettings.doctorShieldBadgeEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldBadgeEn: value })} />
                    <HomeField label="Badge (AR)" value={siteSettings.doctorShieldBadgeAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldBadgeAr: value })} dir="rtl" />
                    <HomeField label="Title (EN)" value={siteSettings.doctorShieldTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldTitleEn: value })} />
                    <HomeField label="Title (AR)" value={siteSettings.doctorShieldTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldTitleAr: value })} dir="rtl" />
                    <HomeField label="Subtitle (EN)" value={siteSettings.doctorShieldSubtitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldSubtitleEn: value })} multiline />
                    <HomeField label="Subtitle (AR)" value={siteSettings.doctorShieldSubtitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldSubtitleAr: value })} multiline dir="rtl" />
                    <HomeField label="Description (EN)" value={siteSettings.doctorShieldDescEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldDescEn: value })} multiline />
                    <HomeField label="Description (AR)" value={siteSettings.doctorShieldDescAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldDescAr: value })} multiline dir="rtl" />
                    <HomeField label="Button (EN)" value={siteSettings.doctorShieldButtonEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldButtonEn: value })} />
                    <HomeField label="Button (AR)" value={siteSettings.doctorShieldButtonAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldButtonAr: value })} dir="rtl" />
                    <HomeField label="Circle title (EN)" value={siteSettings.doctorShieldCircleTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldCircleTitleEn: value })} />
                    <HomeField label="Circle title (AR)" value={siteSettings.doctorShieldCircleTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldCircleTitleAr: value })} dir="rtl" />
                    <HomeField label="Circle price (EN)" value={siteSettings.doctorShieldCirclePriceEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldCirclePriceEn: value })} />
                    <HomeField label="Circle price (AR)" value={siteSettings.doctorShieldCirclePriceAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldCirclePriceAr: value })} dir="rtl" />
                    <HomeField label="Circle note (EN)" value={siteSettings.doctorShieldCircleNoteEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldCircleNoteEn: value })} />
                    <HomeField label="Circle note (AR)" value={siteSettings.doctorShieldCircleNoteAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldCircleNoteAr: value })} dir="rtl" />
                  </div>
                  </Group>
                  </section>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={saveSiteSettings}
                    disabled={savingSettings}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#121212] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save homepage settings
                  </button>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {selectedSlide && (
        <ImageAssetPicker
          open={pickerOpen}
          title="Choose homepage slide image"
          initialUrl={selectedSlide.image}
          initialAltEn={selectedSlide.imageAltEn}
          onClose={() => setPickerOpen(false)}
          onSelect={(asset, nextAltEn) => {
            updateSlide(selectedSlide.id, {
              image: asset.url,
              imageAltEn: nextAltEn,
              imageAltAr: asset.altAr || selectedSlide.imageAltAr,
            });
          }}
        />
      )}
    </div>
  );
}
