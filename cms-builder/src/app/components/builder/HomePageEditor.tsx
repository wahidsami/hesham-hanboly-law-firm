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
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  dir?: 'ltr' | 'rtl';
  placeholder?: string;
  rows?: number;
}) {
  const common = {
    width: '100%',
    border: '1px solid #D8D1C7',
    borderRadius: 12,
    padding: '10px 14px',
    background: '#FFFFFF',
    color: '#1E1E1E',
    fontFamily: dir === 'rtl' ? 'Cairo, sans-serif' : 'Poppins, sans-serif',
    fontSize: 13,
    lineHeight: 1.5,
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
    direction: dir,
    outline: 'none',
  };

  return (
    <label style={{ display: 'grid', gap: 6, minWidth: 0, width: '100%' }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#8A6B52',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          direction: dir,
          textAlign: dir === 'rtl' ? 'right' : 'left',
          whiteSpace: 'normal',
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{
            ...common,
            minHeight: Math.max(rows * 26 + 20, 110),
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
          className="focus:border-[#A56A1E] focus:ring-1 focus:ring-[#A56A1E]/30"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={common}
          className="focus:border-[#A56A1E] focus:ring-1 focus:ring-[#A56A1E]/30"
        />
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

function MiniGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section style={{ border: '1px solid var(--border)', borderRadius: 18, background: 'rgba(255,255,255,0.72)', padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--foreground)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 3, lineHeight: 1.55 }}>{description}</div>
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
  const [settingsSyncedAt, setSettingsSyncedAt] = useState<number | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlideRecord[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsRecord | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [logoPickerOpen, setLogoPickerOpen] = useState(false);
  const [footerLogoPickerOpen, setFooterLogoPickerOpen] = useState(false);
  const [footerPreviewTheme, setFooterPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [teamPickerOpen, setTeamPickerOpen] = useState(false);
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
      window.dispatchEvent(new Event('site-content-updated'));
      localStorage.setItem('site-content-updated', String(Date.now()));
      setSettingsSyncedAt(Date.now());
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
                  scrollToSection(section.ref);
                }}
                className="rounded-full border border-[#D8D1C7] bg-[#FBF7F0] px-4 py-2 text-xs font-semibold text-[#1E1E1E] transition hover:border-[#A56A1E] hover:text-[#A56A1E]"
              >
                {section.label}
              </button>
            ))}
          </div>
        </section>

        <section ref={heroSectionRef} className="rounded-[28px] border border-[#D8D1C7] bg-white p-6 shadow-sm">
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

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="flex flex-col gap-3 min-w-0">
              {heroSlides.map((slide, index) => {
                const isSelected = slide.id === selectedSlideId;
                return (
                  <div
                    key={slide.id}
                    onClick={() => setSelectedSlideId(slide.id)}
                    role="button"
                    tabIndex={0}
                    className="flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition cursor-pointer"
                    style={{
                      borderColor: isSelected ? '#A56A1E' : '#D8D1C7',
                      background: isSelected ? 'rgba(165,106,30,0.08)' : '#FBF7F0',
                    }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#A56A1E] shadow-xs">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-[#1E1E1E]">{slide.titleEnLine1 || slide.titleArLine1 || `Slide ${index + 1}`}</div>
                      <div className="truncate text-xs text-[#6F6F7A]">{slide.badgeEn || slide.badgeAr || 'Homepage slide'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeSlide(slide.id);
                      }}
                      className="shrink-0 rounded-full p-2 text-[#8A6B52] transition hover:bg-white hover:text-red-600"
                      title={lang === 'ar' ? 'حذف الشريحة' : 'Delete slide'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
              {heroSlides.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#D8D1C7] bg-[#FFFDF9] p-4 text-center text-sm text-[#6F6F7A]">
                  {lang === 'ar' ? 'لا توجد شرائح حالياً. أضف شريحة للبدء.' : 'No slides yet. Add the first slide to start editing.'}
                </div>
              )}
              <button
                type="button"
                onClick={saveHeroSlides}
                disabled={savingHero || heroSlides.length === 0}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#121212] px-4 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingHero ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {lang === 'ar' ? 'حفظ شرائح البانر' : 'Save hero slides'}
              </button>
            </div>

            {selectedSlide ? (
              <div className="flex flex-col rounded-[24px] border border-[#D8D1C7] bg-[#FCFAF6] p-5 md:p-6 lg:p-7 shadow-xs min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E0D3] pb-5">
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">
                      {lang === 'ar' ? 'الشريحة المحددة' : 'Selected slide'}
                    </div>
                    <h3 className="mt-1 text-xl lg:text-2xl font-extrabold text-[#1E1E1E] truncate">
                      {selectedSlide.titleEnLine1 || selectedSlide.titleArLine1 || (lang === 'ar' ? 'شريحة بدون عنوان' : 'Untitled slide')}
                    </h3>
                    <p className="mt-1 text-xs text-[#6F6F7A]">
                      ID: <span className="font-mono text-[#1E1E1E]">{selectedSlide.id}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#D8D1C7] bg-white px-3.5 py-2 text-xs font-semibold text-[#1E1E1E] shadow-xs transition hover:border-[#A56A1E] hover:text-[#A56A1E]"
                    >
                      <ImageIcon className="h-4 w-4 text-[#A56A1E]" />
                      {lang === 'ar' ? 'اختيار من مكتبة الوسائط' : 'Media library'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSlide(selectedSlide.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      title={lang === 'ar' ? 'حذف الشريحة' : 'Delete slide'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {lang === 'ar' ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-[#E8E0D3] bg-white p-1.5">
                  {[
                    ['content', lang === 'ar' ? 'المحتوى والنصوص' : 'Content'],
                    ['image', lang === 'ar' ? 'الصورة والوسائط' : 'Image'],
                    ['advanced', lang === 'ar' ? 'إعدادات متقدمة' : 'Advanced'],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setHeroEditorSection(id as typeof heroEditorSection)}
                      className="rounded-xl px-4 py-2 text-xs font-bold transition"
                      style={{
                        background: heroEditorSection === id ? '#121212' : 'transparent',
                        color: heroEditorSection === id ? '#fff' : '#4B4B4B',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex-1 min-w-0">
                  {heroEditorSection === 'content' && (
                    <div className="space-y-5">
                      {/* Badge Group */}
                      <div className="rounded-2xl border border-[#E8E0D3] bg-white p-5 shadow-xs">
                        <div className="mb-4 border-b border-[#F4EFE6] pb-3">
                          <h4 className="text-sm font-bold text-[#1E1E1E]">
                            {lang === 'ar' ? 'شارة الشريحة' : 'Slide Badge'}
                          </h4>
                          <p className="text-xs text-[#6F6F7A] mt-0.5">
                            {lang === 'ar' ? 'الشارة العلوية المصغرة المعروضة أعلى العنوان الرئيسي' : 'Small top badge displayed above the main headline'}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <HomeField
                            label={lang === 'ar' ? 'الشارة (باللغة الإنجليزية)' : 'Badge (English)'}
                            value={selectedSlide.badgeEn}
                            onChange={(value) => updateSlide(selectedSlide.id, { badgeEn: value })}
                            placeholder="e.g. MEDICAL DEFENSE"
                            dir="ltr"
                          />
                          <HomeField
                            label={lang === 'ar' ? 'الشارة (باللغة العربية)' : 'Badge (Arabic)'}
                            value={selectedSlide.badgeAr}
                            onChange={(value) => updateSlide(selectedSlide.id, { badgeAr: value })}
                            placeholder="مثال: الحماية الطبية"
                            dir="rtl"
                          />
                        </div>
                      </div>

                      {/* Titles Group */}
                      <div className="rounded-2xl border border-[#E8E0D3] bg-white p-5 shadow-xs">
                        <div className="mb-4 border-b border-[#F4EFE6] pb-3">
                          <h4 className="text-sm font-bold text-[#1E1E1E]">
                            {lang === 'ar' ? 'عناوين الشريحة' : 'Slide Titles'}
                          </h4>
                          <p className="text-xs text-[#6F6F7A] mt-0.5">
                            {lang === 'ar' ? 'السطران الأول والثاني للعنوان الرئيسي للشريحة' : 'First and second lines of the hero title'}
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <HomeField
                              label={lang === 'ar' ? 'العنوان - السطر 1 (بالإنجليزية)' : 'Title Line 1 (English)'}
                              value={selectedSlide.titleEnLine1}
                              onChange={(value) => updateSlide(selectedSlide.id, { titleEnLine1: value })}
                              placeholder="e.g. DOCTOR SHIELD"
                              dir="ltr"
                            />
                            <HomeField
                              label={lang === 'ar' ? 'العنوان - السطر 1 (بالعربية)' : 'Title Line 1 (Arabic)'}
                              value={selectedSlide.titleArLine1}
                              onChange={(value) => updateSlide(selectedSlide.id, { titleArLine1: value })}
                              placeholder="مثال: درع الطبيب"
                              dir="rtl"
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <HomeField
                              label={lang === 'ar' ? 'العنوان - السطر 2 (بالإنجليزية)' : 'Title Line 2 (English)'}
                              value={selectedSlide.titleEnLine2}
                              onChange={(value) => updateSlide(selectedSlide.id, { titleEnLine2: value })}
                              placeholder="e.g. COMPREHENSIVE MEDICAL DEFENSE"
                              dir="ltr"
                            />
                            <HomeField
                              label={lang === 'ar' ? 'العنوان - السطر 2 (بالعربية)' : 'Title Line 2 (Arabic)'}
                              value={selectedSlide.titleArLine2}
                              onChange={(value) => updateSlide(selectedSlide.id, { titleArLine2: value })}
                              placeholder="مثال: حماية قانونية شاملة للكوادر الصحية"
                              dir="rtl"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description Group */}
                      <div className="rounded-2xl border border-[#E8E0D3] bg-white p-5 shadow-xs">
                        <div className="mb-4 border-b border-[#F4EFE6] pb-3">
                          <h4 className="text-sm font-bold text-[#1E1E1E]">
                            {lang === 'ar' ? 'وصف الشريحة' : 'Slide Description'}
                          </h4>
                          <p className="text-xs text-[#6F6F7A] mt-0.5">
                            {lang === 'ar' ? 'النص التعريفي والتفصيلي المعروض أسفل العنوان' : 'Detailed paragraph copy shown below the headline'}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <HomeField
                            label={lang === 'ar' ? 'الوصف (باللغة الإنجليزية)' : 'Description (English)'}
                            value={selectedSlide.descriptionEn}
                            onChange={(value) => updateSlide(selectedSlide.id, { descriptionEn: value })}
                            placeholder="Enter English description..."
                            multiline
                            dir="ltr"
                            rows={4}
                          />
                          <HomeField
                            label={lang === 'ar' ? 'الوصف (باللغة العربية)' : 'Description (Arabic)'}
                            value={selectedSlide.descriptionAr}
                            onChange={(value) => updateSlide(selectedSlide.id, { descriptionAr: value })}
                            placeholder="اكتب الوصف باللغة العربية..."
                            multiline
                            dir="rtl"
                            rows={4}
                          />
                        </div>
                      </div>

                      {/* CTA Group */}
                      <div className="rounded-2xl border border-[#E8E0D3] bg-white p-5 shadow-xs">
                        <div className="mb-4 border-b border-[#F4EFE6] pb-3">
                          <h4 className="text-sm font-bold text-[#1E1E1E]">
                            {lang === 'ar' ? 'زر الإجراء (CTA)' : 'Call to Action Button (CTA)'}
                          </h4>
                          <p className="text-xs text-[#6F6F7A] mt-0.5">
                            {lang === 'ar' ? 'النص المعروض على زر الإجراء في الشريحة' : 'Button label text displayed on the slide'}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <HomeField
                            label={lang === 'ar' ? 'نص الزر (بالإنجليزية)' : 'Button Label (English)'}
                            value={selectedSlide.ctaTextEn}
                            onChange={(value) => updateSlide(selectedSlide.id, { ctaTextEn: value })}
                            placeholder="e.g. Subscribe Now"
                            dir="ltr"
                          />
                          <HomeField
                            label={lang === 'ar' ? 'نص الزر (بالعربية)' : 'Button Label (Arabic)'}
                            value={selectedSlide.ctaTextAr}
                            onChange={(value) => updateSlide(selectedSlide.id, { ctaTextAr: value })}
                            placeholder="مثال: اشترك الآن"
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {heroEditorSection === 'image' && (
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-[#E8E0D3] bg-white p-5 shadow-xs space-y-5">
                        <div className="border-b border-[#F4EFE6] pb-3">
                          <h4 className="text-sm font-bold text-[#1E1E1E]">
                            {lang === 'ar' ? 'صورة الشريحة' : 'Slide Image'}
                          </h4>
                          <p className="text-xs text-[#6F6F7A] mt-0.5">
                            {lang === 'ar' ? 'معاينة الصورة وروابط الوسائط والنصوص البديلة' : 'Image preview, media library selection, and accessibility tags'}
                          </p>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-[#D8D1C7] bg-[#FAF7F1]">
                          {selectedSlide.image ? (
                            <div className="flex flex-col items-center justify-center p-4">
                              <img
                                src={selectedSlide.image}
                                alt={selectedSlide.imageAltEn || selectedSlide.imageAltAr || 'Slide preview'}
                                className="max-h-72 w-auto max-w-full rounded-xl object-contain shadow-xs"
                              />
                            </div>
                          ) : (
                            <div className="flex h-56 flex-col items-center justify-center gap-2 text-[#8A8A8A]">
                              <ImageIcon className="h-8 w-8 text-[#D8D1C7]" />
                              <span className="text-xs font-semibold">
                                {lang === 'ar' ? 'لم يتم تحديد صورة بعد' : 'No image selected'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <HomeField
                            label={lang === 'ar' ? 'رابط الصورة' : 'Image URL'}
                            value={selectedSlide.image}
                            onChange={(value) => updateSlide(selectedSlide.id, { image: value })}
                            placeholder="https://... or /assets/..."
                            dir="ltr"
                          />
                          <div>
                            <button
                              type="button"
                              onClick={() => setPickerOpen(true)}
                              className="inline-flex items-center gap-2 rounded-xl border border-[#D8D1C7] bg-[#FBF7F0] px-4 py-2.5 text-xs font-bold text-[#1E1E1E] transition hover:border-[#A56A1E] hover:text-[#A56A1E]"
                            >
                              <ImageIcon className="h-4 w-4 text-[#A56A1E]" />
                              {lang === 'ar' ? 'اختيار من مكتبة الوسائط' : 'Choose image from media library'}
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-[#F4EFE6] pt-4">
                          <div className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-[#8A6B52]">
                            {lang === 'ar' ? 'النص البديل للصورة (SEO وإمكانية الوصول)' : 'Image Alt Text (SEO & Accessibility)'}
                          </div>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <HomeField
                              label={lang === 'ar' ? 'النص البديل (بالإنجليزية)' : 'Image Alt (English)'}
                              value={selectedSlide.imageAltEn}
                              onChange={(value) => updateSlide(selectedSlide.id, { imageAltEn: value })}
                              placeholder="e.g. Doctor Shield healthcare defense"
                              dir="ltr"
                            />
                            <HomeField
                              label={lang === 'ar' ? 'النص البديل (بالعربية)' : 'Image Alt (Arabic)'}
                              value={selectedSlide.imageAltAr}
                              onChange={(value) => updateSlide(selectedSlide.id, { imageAltAr: value })}
                              placeholder="مثال: خدمة درع الطبيب للحماية القانونية"
                              dir="rtl"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {heroEditorSection === 'advanced' && (
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-[#E8E0D3] bg-white p-5 shadow-xs space-y-5">
                        <div className="border-b border-[#F4EFE6] pb-3">
                          <h4 className="text-sm font-bold text-[#1E1E1E]">
                            {lang === 'ar' ? 'الإعدادات المتقدمة والإجراءات' : 'Advanced & Navigation Settings'}
                          </h4>
                          <p className="text-xs text-[#6F6F7A] mt-0.5">
                            {lang === 'ar' ? 'معرّف الشريحة، نوع التوجيه، ومعرّفات الربط' : 'Slide ID, action routing, and badge icons'}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <label style={{ display: 'grid', gap: 6, minWidth: 0, width: '100%' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#8A6B52', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                              {lang === 'ar' ? 'معرّف الشريحة (ID)' : 'Slide Identifier (ID)'}
                            </span>
                            <input
                              value={selectedSlide.id}
                              onChange={(e) => {
                                const nextId = e.target.value;
                                setHeroSlides((curr) => curr.map((s) => (s.id === selectedSlide.id ? { ...s, id: nextId } : s)));
                                setSelectedSlideId(nextId);
                              }}
                              className="w-full rounded-xl border border-[#D8D1C7] bg-[#FCFAF6] px-3.5 py-2.5 text-xs font-mono text-[#1E1E1E] focus:border-[#A56A1E] focus:outline-none"
                            />
                          </label>

                          <label style={{ display: 'grid', gap: 6, minWidth: 0, width: '100%' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#8A6B52', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                              {lang === 'ar' ? 'أيقونة الشارة' : 'Badge Icon'}
                            </span>
                            <select
                              value={selectedSlide.badgeIcon || 'Scale'}
                              onChange={(e) => updateSlide(selectedSlide.id, { badgeIcon: e.target.value })}
                              className="w-full rounded-xl border border-[#D8D1C7] bg-white px-3.5 py-2.5 text-xs font-medium text-[#1E1E1E] focus:border-[#A56A1E] focus:outline-none"
                            >
                              <option value="Scale">Scale (ميزان العدالة)</option>
                              <option value="ShieldCheck">ShieldCheck (درع الحماية)</option>
                              <option value="Sparkles">Sparkles (تميز وقيمة)</option>
                              <option value="MessageSquare">MessageSquare (استشارة وتواصل)</option>
                            </select>
                          </label>

                          <label style={{ display: 'grid', gap: 6, minWidth: 0, width: '100%' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#8A6B52', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                              {lang === 'ar' ? 'نوع الإجراء (Action Type)' : 'Action Type'}
                            </span>
                            <select
                              value={selectedSlide.actionType || 'contact'}
                              onChange={(e) => updateSlide(selectedSlide.id, { actionType: e.target.value as HeroSlideRecord['actionType'] })}
                              className="w-full rounded-xl border border-[#D8D1C7] bg-white px-3.5 py-2.5 text-xs font-medium text-[#1E1E1E] focus:border-[#A56A1E] focus:outline-none"
                            >
                              <option value="about">About (صفحة من نحن)</option>
                              <option value="service-detail">Service Detail (تفاصيل الخدمة)</option>
                              <option value="contact">Contact (تواصل معنا)</option>
                              <option value="custom">Custom (مخصص)</option>
                            </select>
                          </label>

                          <HomeField
                            label={lang === 'ar' ? 'معرّف الإجراء / الرابط (Action Param)' : 'Action Parameter'}
                            value={selectedSlide.actionParam || ''}
                            onChange={(value) => updateSlide(selectedSlide.id, { actionParam: value })}
                            placeholder="e.g. doctor-shield or section-id"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#E8E0D3] pt-5">
                  <button
                    type="button"
                    onClick={saveHeroSlides}
                    disabled={savingHero}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#A56A1E] px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#8F5916] disabled:opacity-50"
                  >
                    {savingHero ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {lang === 'ar' ? 'حفظ تعديلات الشريحة' : 'Save hero slides'}
                  </button>
                  <div className="text-xs text-[#6F6F7A]">
                    {heroSlides.length} {lang === 'ar' ? 'شرائح إجمالاً' : 'slides total'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[#D8D1C7] bg-white p-8 text-center shadow-sm">
                <div className="text-2xl font-black text-[#1E1E1E]">No hero slide selected</div>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#5B5B5B]">
                  Add a slide on the left to start editing the homepage hero image and copy.
                </p>
              </div>
            )}
          </div>
        </section>

        {siteSettings && (
          <section className="space-y-6 rounded-[28px] border border-[#D8D1C7] bg-white p-6 shadow-sm">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Homepage copy</div>
              <h3 className="mt-1 text-2xl font-extrabold text-[#1E1E1E]">Homepage blocks in frontend order</h3>
              <p className="mt-2 text-sm leading-6 text-[#5B5B5B]">
                Each card below matches a block on the public homepage. Hero has image editing; the other blocks control the live text and labels shown in the frontend layout.
              </p>
            </div>

            <Group title="Navbar / Footer" description="These texts control the visible CTA and footer copy on the public site.">
              <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
                <MiniGroup title="Header logo" description="Used in the top navbar. The footer can use a separate version if needed.">
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-[#D8D1C7] bg-[#FBF7F0]">
                      {siteSettings.logoImageUrl ? (
                        <img
                          src={siteSettings.logoImageUrl}
                          alt={lang === 'ar' ? siteSettings.logoImageAltAr : siteSettings.logoImageAltEn}
                          className="h-40 w-full object-contain bg-white p-4"
                        />
                      ) : (
                        <div className="flex h-40 items-center justify-center text-sm text-[#8A8A8A]">No logo selected</div>
                      )}
                    </div>
                    <HomeField
                      label="Logo image URL"
                      value={siteSettings.logoImageUrl || ''}
                      onChange={(value) => setSiteSettings({ ...siteSettings, logoImageUrl: value })}
                    />
                    <HomeField
                      label="Logo alt (EN)"
                      value={siteSettings.logoImageAltEn || ''}
                      onChange={(value) => setSiteSettings({ ...siteSettings, logoImageAltEn: value })}
                    />
                    <HomeField
                      label="Logo alt (AR)"
                      value={siteSettings.logoImageAltAr || ''}
                      onChange={(value) => setSiteSettings({ ...siteSettings, logoImageAltAr: value })}
                      dir="rtl"
                    />
                    <button
                      type="button"
                      onClick={() => setLogoPickerOpen(true)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8D1C7] bg-white px-4 py-3 text-sm font-semibold text-[#1E1E1E]"
                    >
                      Choose logo from media library
                    </button>
                  </div>
                </MiniGroup>
                <MiniGroup title="Footer logo" description="Use a different version for the footer if the footer is on a dark background. If empty, the header logo is used as a fallback.">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#D8D1C7] bg-[#FBF7F0] px-3 py-2">
                      <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A56A1E]">
                        {lang === 'ar' ? 'تبديل المعاينة' : 'Preview theme'}
                      </div>
                      <div className="inline-flex rounded-xl border border-[#D8D1C7] bg-white p-1">
                        {(['dark', 'light'] as const).map((theme) => (
                          <button
                            key={theme}
                            type="button"
                            onClick={() => setFooterPreviewTheme(theme)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              footerPreviewTheme === theme
                                ? 'bg-[#121212] text-white'
                                : 'bg-transparent text-[#1E1E1E]'
                            }`}
                          >
                            {theme === 'dark'
                              ? (lang === 'ar' ? 'داكن' : 'Dark')
                              : (lang === 'ar' ? 'فاتح' : 'Light')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-[#D8D1C7] bg-[#FBF7F0] p-3">
                      <div className={`rounded-xl px-4 py-5 ${footerPreviewTheme === 'dark' ? 'bg-[#121212]' : 'bg-[#F1ECE3]'}`}>
                        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#A56A1E]">Footer preview</div>
                        <div className={`flex items-center justify-between gap-4 pb-4 ${footerPreviewTheme === 'dark' ? 'border-b border-white/10' : 'border-b border-[#D8D1C7]'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`rounded-full px-3 py-1 text-[11px] font-semibold ${footerPreviewTheme === 'dark' ? 'border border-white/10 bg-white/5 text-white/70' : 'border border-[#D8D1C7] bg-white text-[#1E1E1E]/70'}`}>Logo</div>
                            <div className={`text-[11px] ${footerPreviewTheme === 'dark' ? 'text-white/55' : 'text-[#5B5B5B]'}`}>
                              {lang === 'ar'
                                ? footerPreviewTheme === 'dark'
                                  ? 'معاينة داكنة للتذييل'
                                  : 'معاينة فاتحة للتذييل'
                                : footerPreviewTheme === 'dark'
                                  ? 'Dark footer preview'
                                  : 'Light footer preview'}
                            </div>
                          </div>
                          <div className={`text-[11px] font-semibold ${footerPreviewTheme === 'dark' ? 'text-white/45' : 'text-[#8A8A8A]'}`}>
                            {lang === 'ar'
                              ? footerPreviewTheme === 'dark'
                                ? 'الشريط السفلي'
                                : 'الشريط السفلي الفاتح'
                              : footerPreviewTheme === 'dark'
                                ? 'Footer bar'
                                : 'Light footer bar'}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 py-4">
                          {(siteSettings.footerLogoImageUrl || siteSettings.logoImageUrl) ? (
                            <img
                              src={siteSettings.footerLogoImageUrl || siteSettings.logoImageUrl}
                              alt={lang === 'ar'
                                ? siteSettings.footerLogoImageAltAr || siteSettings.logoImageAltAr
                                : siteSettings.footerLogoImageAltEn || siteSettings.logoImageAltEn}
                              className="h-16 max-w-[220px] object-contain"
                            />
                          ) : (
                            <div className={`flex h-16 w-full items-center justify-center rounded-xl border border-dashed text-sm ${footerPreviewTheme === 'dark' ? 'border-white/10 text-white/40' : 'border-[#D8D1C7] text-[#8A8A8A]'}`}>
                              {lang === 'ar' ? 'لا يوجد شعار للتذييل بعد' : 'No footer logo yet'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <HomeField
                      label="Footer logo image URL"
                      value={siteSettings.footerLogoImageUrl || ''}
                      onChange={(value) => setSiteSettings({ ...siteSettings, footerLogoImageUrl: value })}
                    />
                    <HomeField
                      label="Footer logo alt (EN)"
                      value={siteSettings.footerLogoImageAltEn || ''}
                      onChange={(value) => setSiteSettings({ ...siteSettings, footerLogoImageAltEn: value })}
                    />
                    <HomeField
                      label="Footer logo alt (AR)"
                      value={siteSettings.footerLogoImageAltAr || ''}
                      onChange={(value) => setSiteSettings({ ...siteSettings, footerLogoImageAltAr: value })}
                      dir="rtl"
                    />
                    <button
                      type="button"
                      onClick={() => setFooterLogoPickerOpen(true)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8D1C7] bg-white px-4 py-3 text-sm font-semibold text-[#1E1E1E]"
                    >
                      Choose footer logo from media library
                    </button>
                  </div>
                </MiniGroup>
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
              </div>
            </Group>

            <section ref={settingsRefs.about}>
              <Group title="About section" description="Controls the homepage About area without changing the public layout.">
                <div className="grid gap-4 xl:grid-cols-2">
                  <MiniGroup title="Section identity" description="The heading and badge that introduce the About block.">
                    <div className="grid gap-4 md:grid-cols-2">
                      <HomeField label="Badge (EN)" value={siteSettings.aboutSectionBadgeEn} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionBadgeEn: value })} />
                      <HomeField label="Badge (AR)" value={siteSettings.aboutSectionBadgeAr} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionBadgeAr: value })} dir="rtl" />
                      <HomeField label="Title (EN)" value={siteSettings.aboutSectionTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionTitleEn: value })} />
                      <HomeField label="Title (AR)" value={siteSettings.aboutSectionTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionTitleAr: value })} dir="rtl" />
                    </div>
                  </MiniGroup>
                  <MiniGroup title="Main copy" description="Long-form body copy shown in the About area.">
                    <div className="grid gap-4">
                      <HomeField label="Description (EN)" value={siteSettings.aboutSectionDescEn} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionDescEn: value })} multiline />
                      <HomeField label="Description (AR)" value={siteSettings.aboutSectionDescAr} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionDescAr: value })} multiline dir="rtl" />
                    </div>
                  </MiniGroup>
                  <MiniGroup title="Card content" description="The small card beside the About text.">
                    <div className="grid gap-4 md:grid-cols-2">
                      <HomeField label="Card title (EN)" value={siteSettings.aboutSectionCardTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionCardTitleEn: value })} />
                      <HomeField label="Card title (AR)" value={siteSettings.aboutSectionCardTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionCardTitleAr: value })} dir="rtl" />
                      <HomeField label="Card desc (EN)" value={siteSettings.aboutSectionCardDescEn} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionCardDescEn: value })} multiline />
                      <HomeField label="Card desc (AR)" value={siteSettings.aboutSectionCardDescAr} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionCardDescAr: value })} multiline dir="rtl" />
                    </div>
                  </MiniGroup>
                  <MiniGroup title="Action" description="The button that closes the About section.">
                    <div className="grid gap-4 md:grid-cols-2">
                      <HomeField label="Button (EN)" value={siteSettings.aboutSectionButtonEn} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionButtonEn: value })} />
                      <HomeField label="Button (AR)" value={siteSettings.aboutSectionButtonAr} onChange={(value) => setSiteSettings({ ...siteSettings, aboutSectionButtonAr: value })} dir="rtl" />
                    </div>
                  </MiniGroup>
                </div>
              </Group>
            </section>

            <section ref={settingsRefs.statistics}>
              <Group title="Statistics" description="Controls the data callouts on the homepage.">
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

            <section ref={settingsRefs.team}>
              <Group title="Meet our legal counsel" description="Controls the homepage team block text.">
                <div className="mb-4 rounded-2xl border border-[#E8E0D3] bg-[#FBF7F0] px-4 py-3 text-sm text-[#5B5B5B]">
                  This section drives the homepage card labeled “Meet our legal counsel” and keeps the public layout unchanged.
                </div>
                <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
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
                  <MiniGroup title="Portrait image" description="This image appears in the team section card on the homepage.">
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-2xl border border-[#D8D1C7] bg-white">
                        {siteSettings.teamFounderImageUrl ? (
                          <img
                            src={siteSettings.teamFounderImageUrl}
                            alt={lang === 'ar' ? siteSettings.teamFounderImageAltAr || siteSettings.teamFounderNameAr : siteSettings.teamFounderImageAltEn || siteSettings.teamFounderNameEn}
                            className="h-56 w-full object-contain bg-[#FAF7F1]"
                          />
                        ) : (
                          <div className="flex h-56 items-center justify-center text-sm text-[#8A8A8A]">No team image selected</div>
                        )}
                      </div>
                      <HomeField
                        label="Image URL"
                        value={siteSettings.teamFounderImageUrl || ''}
                        onChange={(value) => setSiteSettings({ ...siteSettings, teamFounderImageUrl: value })}
                      />
                      <HomeField
                        label="Image alt (EN)"
                        value={siteSettings.teamFounderImageAltEn || ''}
                        onChange={(value) => setSiteSettings({ ...siteSettings, teamFounderImageAltEn: value })}
                      />
                      <HomeField
                        label="Image alt (AR)"
                        value={siteSettings.teamFounderImageAltAr || ''}
                        onChange={(value) => setSiteSettings({ ...siteSettings, teamFounderImageAltAr: value })}
                        dir="rtl"
                      />
                      <button
                        type="button"
                        onClick={() => setTeamPickerOpen(true)}
                        className="w-full rounded-xl border border-[#D8D1C7] bg-[#FBF7F0] px-4 py-3 text-sm font-semibold text-[#1E1E1E]"
                      >
                        Choose image from media library
                      </button>
                    </div>
                  </MiniGroup>
                </div>
              </Group>
            </section>

            <section ref={settingsRefs.contact}>
              <Group title="Contact section" description="Controls the homepage contact block text without affecting the public form layout.">
                <div className="grid gap-4 xl:grid-cols-2">
                  <MiniGroup title="Section header" description="The visible heading and badge shown above the contact block.">
                    <div className="grid gap-4 md:grid-cols-2">
                      <HomeField label="Badge (EN)" value={siteSettings.contactSectionBadgeEn} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionBadgeEn: value })} />
                      <HomeField label="Badge (AR)" value={siteSettings.contactSectionBadgeAr} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionBadgeAr: value })} dir="rtl" />
                      <HomeField label="Title (EN)" value={siteSettings.contactSectionTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionTitleEn: value })} />
                      <HomeField label="Title (AR)" value={siteSettings.contactSectionTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionTitleAr: value })} dir="rtl" />
                      <HomeField label="Description (EN)" value={siteSettings.contactSectionDescEn} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionDescEn: value })} multiline />
                      <HomeField label="Description (AR)" value={siteSettings.contactSectionDescAr} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionDescAr: value })} multiline dir="rtl" />
                    </div>
                  </MiniGroup>
                  <MiniGroup title="Office copy" description="Text used for the office/contact card on the homepage.">
                    <div className="grid gap-4 md:grid-cols-2">
                      <HomeField label="Office title (EN)" value={siteSettings.contactSectionOfficeTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionOfficeTitleEn: value })} />
                      <HomeField label="Office title (AR)" value={siteSettings.contactSectionOfficeTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionOfficeTitleAr: value })} dir="rtl" />
                      <HomeField label="Form title (EN)" value={siteSettings.contactSectionFormTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionFormTitleEn: value })} />
                      <HomeField label="Form title (AR)" value={siteSettings.contactSectionFormTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionFormTitleAr: value })} dir="rtl" />
                      <HomeField label="Form desc (EN)" value={siteSettings.contactSectionFormDescEn} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionFormDescEn: value })} multiline />
                      <HomeField label="Form desc (AR)" value={siteSettings.contactSectionFormDescAr} onChange={(value) => setSiteSettings({ ...siteSettings, contactSectionFormDescAr: value })} multiline dir="rtl" />
                    </div>
                  </MiniGroup>
                </div>
              </Group>
            </section>

            <section ref={settingsRefs.doctorShield}>
              <Group title="Doctor Shield promo" description="Controls the special Doctor Shield promo block on the homepage.">
                <div className="grid gap-4 xl:grid-cols-2">
                  <MiniGroup title="Promo intro" description="Badge, heading, subtitle, and supporting description.">
                    <div className="grid gap-4 md:grid-cols-2">
                      <HomeField label="Badge (EN)" value={siteSettings.doctorShieldBadgeEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldBadgeEn: value })} />
                      <HomeField label="Badge (AR)" value={siteSettings.doctorShieldBadgeAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldBadgeAr: value })} dir="rtl" />
                      <HomeField label="Title (EN)" value={siteSettings.doctorShieldTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldTitleEn: value })} />
                      <HomeField label="Title (AR)" value={siteSettings.doctorShieldTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldTitleAr: value })} dir="rtl" />
                      <HomeField label="Subtitle (EN)" value={siteSettings.doctorShieldSubtitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldSubtitleEn: value })} multiline />
                      <HomeField label="Subtitle (AR)" value={siteSettings.doctorShieldSubtitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldSubtitleAr: value })} multiline dir="rtl" />
                      <HomeField label="Description (EN)" value={siteSettings.doctorShieldDescEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldDescEn: value })} multiline />
                      <HomeField label="Description (AR)" value={siteSettings.doctorShieldDescAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldDescAr: value })} multiline dir="rtl" />
                    </div>
                  </MiniGroup>
                  <MiniGroup title="CTA and pricing" description="The button label and the circular price callout.">
                    <div className="grid gap-4 md:grid-cols-2">
                      <HomeField label="Button (EN)" value={siteSettings.doctorShieldButtonEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldButtonEn: value })} />
                      <HomeField label="Button (AR)" value={siteSettings.doctorShieldButtonAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldButtonAr: value })} dir="rtl" />
                      <HomeField label="Circle title (EN)" value={siteSettings.doctorShieldCircleTitleEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldCircleTitleEn: value })} />
                      <HomeField label="Circle title (AR)" value={siteSettings.doctorShieldCircleTitleAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldCircleTitleAr: value })} dir="rtl" />
                      <HomeField label="Circle price (EN)" value={siteSettings.doctorShieldCirclePriceEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldCirclePriceEn: value })} />
                      <HomeField label="Circle price (AR)" value={siteSettings.doctorShieldCirclePriceAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldCirclePriceAr: value })} dir="rtl" />
                      <HomeField label="Circle note (EN)" value={siteSettings.doctorShieldCircleNoteEn} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldCircleNoteEn: value })} />
                      <HomeField label="Circle note (AR)" value={siteSettings.doctorShieldCircleNoteAr} onChange={(value) => setSiteSettings({ ...siteSettings, doctorShieldCircleNoteAr: value })} dir="rtl" />
                    </div>
                  </MiniGroup>
                </div>
              </Group>
            </section>

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
              {settingsSyncedAt && !savingSettings && (
                <span className="rounded-full border border-[#CFE8D6] bg-[#EEF8F1] px-3 py-1 text-xs font-semibold text-[#2F7D46]">
                  Saved & synced
                </span>
              )}
            </div>
          </section>
        )}
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

      {teamPickerOpen && siteSettings && (
        <ImageAssetPicker
          open={teamPickerOpen}
          title="Choose team portrait image"
          initialUrl={siteSettings.teamFounderImageUrl}
          initialAltEn={siteSettings.teamFounderImageAltEn}
          onClose={() => setTeamPickerOpen(false)}
          onSelect={(asset, nextAltEn) => {
            setSiteSettings({
              ...siteSettings,
              teamFounderImageUrl: asset.url,
              teamFounderImageAltEn: nextAltEn,
              teamFounderImageAltAr: asset.altAr || siteSettings.teamFounderImageAltAr,
            });
          }}
          />
      )}

      {logoPickerOpen && siteSettings && (
        <ImageAssetPicker
          open={logoPickerOpen}
          title="Choose logo image"
          initialUrl={siteSettings.logoImageUrl}
          initialAltEn={siteSettings.logoImageAltEn}
          initialAltAr={siteSettings.logoImageAltAr}
          onClose={() => setLogoPickerOpen(false)}
          onSelect={(asset, nextAltEn, nextAltAr) => {
            setSiteSettings({
              ...siteSettings,
              logoImageUrl: asset.url,
              logoImageAltEn: nextAltEn,
              logoImageAltAr: nextAltAr,
            });
          }}
          />
      )}

      {footerLogoPickerOpen && siteSettings && (
        <ImageAssetPicker
          open={footerLogoPickerOpen}
          title="Choose footer logo image"
          initialUrl={siteSettings.footerLogoImageUrl || siteSettings.logoImageUrl}
          initialAltEn={siteSettings.footerLogoImageAltEn || siteSettings.logoImageAltEn}
          initialAltAr={siteSettings.footerLogoImageAltAr || siteSettings.logoImageAltAr}
          onClose={() => setFooterLogoPickerOpen(false)}
          onSelect={(asset, nextAltEn, nextAltAr) => {
            setSiteSettings({
              ...siteSettings,
              footerLogoImageUrl: asset.url,
              footerLogoImageAltEn: nextAltEn,
              footerLogoImageAltAr: nextAltAr,
            });
          }}
        />
      )}
    </div>
  );
}
