import { useEffect, useMemo, useState, type ElementType } from 'react';
import { ArrowUpRight, BarChart3, Clock3, Globe, MousePointerClick, Users } from 'lucide-react';
import { backendApi } from '../../api/backend';
import type { AnalyticsOverviewResponse, AnalyticsRange } from '../../api/types';

interface OverviewModuleProps {
  lang: 'en' | 'ar';
}

const RANGE_OPTIONS: Array<{ value: AnalyticsRange; labelEn: string; labelAr: string }> = [
  { value: '7d', labelEn: '7 days', labelAr: '٧ أيام' },
  { value: '30d', labelEn: '30 days', labelAr: '٣٠ يوماً' },
  { value: '90d', labelEn: '90 days', labelAr: '٩٠ يوماً' },
  { value: 'all', labelEn: 'All time', labelAr: 'كل الفترة' },
];

const formatCompact = (value: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

const formatDateLabel = (value: string, lang: 'en' | 'ar') =>
  new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${value}T00:00:00Z`));

const normalizeCountry = (value: string) => value.trim().toLowerCase();

const COUNTRY_POINTS: Record<string, { x: number; y: number }> = {
  'saudi arabia': { x: 665, y: 285 },
  'united arab emirates': { x: 680, y: 285 },
  'qatar': { x: 670, y: 280 },
  'kuwait': { x: 645, y: 255 },
  'bahrain': { x: 655, y: 275 },
  'oman': { x: 700, y: 325 },
  'egypt': { x: 575, y: 255 },
  'jordan': { x: 610, y: 230 },
  'lebanon': { x: 620, y: 210 },
  'turkey': { x: 575, y: 185 },
  'united states': { x: 160, y: 210 },
  'canada': { x: 150, y: 120 },
  'mexico': { x: 170, y: 300 },
  'brazil': { x: 250, y: 360 },
  'argentina': { x: 240, y: 430 },
  'united kingdom': { x: 465, y: 165 },
  'ireland': { x: 450, y: 160 },
  'france': { x: 490, y: 185 },
  'germany': { x: 520, y: 170 },
  'spain': { x: 470, y: 205 },
  'italy': { x: 520, y: 205 },
  'netherlands': { x: 500, y: 165 },
  'belgium': { x: 495, y: 175 },
  'sweden': { x: 520, y: 125 },
  'india': { x: 735, y: 235 },
  'pakistan': { x: 690, y: 225 },
  'bangladesh': { x: 780, y: 250 },
  'china': { x: 810, y: 180 },
  'japan': { x: 880, y: 190 },
  'south korea': { x: 860, y: 185 },
  'indonesia': { x: 820, y: 360 },
  'australia': { x: 860, y: 410 },
  'south africa': { x: 560, y: 420 },
};

const WORLD_MAP_PATHS = [
  'M110 150C120 120 175 95 240 105C275 110 300 135 295 165C290 190 270 205 240 205C205 205 170 220 140 210C100 196 95 175 110 150Z',
  'M210 225C230 210 255 215 270 230C290 250 285 285 270 315C255 345 240 390 220 430C205 458 182 445 185 415C190 360 175 300 182 270C188 245 197 232 210 225Z',
  'M360 110C410 85 500 80 590 95C690 112 745 150 760 195C775 240 740 265 705 275C670 285 646 302 620 300C590 298 575 277 540 280C500 283 470 305 440 295C405 285 372 270 350 245C325 217 320 158 360 110Z',
  'M515 305C540 290 580 292 610 305C632 315 655 340 650 365C645 392 615 410 590 407C560 404 530 390 512 370C495 350 493 320 515 305Z',
  'M770 365C790 350 820 350 850 360C875 368 888 385 885 405C882 425 860 438 835 438C805 438 775 423 765 405C755 388 754 375 770 365Z',
];

const WORLD_MAP_MAX_Y = 500;

function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: ElementType;
  accent: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-3xl border border-[#D8D1C7] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">{label}</p>
          <div className="mt-3 text-3xl font-extrabold text-[#1E1E1E]">{value}</div>
          {subtitle && <p className="mt-2 text-sm text-[#5B5B5B]">{subtitle}</p>}
        </div>
        <div className="rounded-2xl p-3" style={{ background: `${accent}14`, color: accent }}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function RankedList({
  title,
  items,
  lang,
}: {
  title: string;
  items: AnalyticsOverviewResponse['topPages'];
  lang: 'en' | 'ar';
}) {
  return (
    <div className="rounded-3xl border border-[#D8D1C7] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Analytics</p>
          <h3 className="mt-2 text-xl font-extrabold text-[#1E1E1E]">{title}</h3>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#D8D1C7] bg-[#FBF7F0] px-4 py-5 text-sm text-[#5B5B5B]">
            {lang === 'ar' ? 'لا توجد بيانات بعد.' : 'No data yet.'}
          </p>
        ) : (
          items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="rounded-2xl border border-[#EFE5D6] bg-[#FBF8F2] px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[#1E1E1E]">{item.label}</div>
                  {item.subtitle && <div className="mt-1 text-xs text-[#6A6A6A]">{item.subtitle}</div>}
                </div>
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#A56A1E]">
                  <span>{formatCompact(item.value)}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function OverviewModule({ lang }: OverviewModuleProps) {
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [countryFilter, setCountryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null);

  const countryOptions = useMemo(() => {
    const options = [
      { value: '', labelEn: 'All countries', labelAr: 'كل الدول' },
      { value: 'Saudi Arabia', labelEn: 'Saudi Arabia', labelAr: 'السعودية' },
    ];
    const seen = new Set(options.map((option) => option.value));
    (overview?.topCountries || []).forEach((item) => {
      if (!item.label || item.label === 'Unknown' || seen.has(item.label)) return;
      seen.add(item.label);
      options.push({
        value: item.label,
        labelEn: item.label,
        labelAr: item.label,
      });
    });
    return options.slice(0, 8);
  }, [overview?.topCountries]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    backendApi.getAnalyticsOverview(range, countryFilter)
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load overview.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [range, countryFilter]);

  const topPage = overview?.summary.topPage;
  const topReferrer = overview?.summary.topReferrer;
  const outsideSaudiArabiaVisits = Math.max(0, (overview?.summary.visits || 0) - (overview?.geo.saudiArabiaVisits || 0));
  const geoTotalVisits = Math.max(0, overview?.summary.visits || 0);
  const geoSaudiPercent = geoTotalVisits > 0 ? ((overview?.geo.saudiArabiaVisits || 0) / geoTotalVisits) * 100 : 0;
  const geoOutsidePercent = Math.max(0, 100 - geoSaudiPercent);
  const worldMapMarkers = useMemo(
    () =>
      (overview?.topCountries || [])
        .map((item) => {
          const position = COUNTRY_POINTS[normalizeCountry(item.label)];
          if (!position) return null;
          return {
            ...position,
            label: item.label,
            value: item.value,
          };
        })
        .filter((item): item is { x: number; y: number; label: string; value: number } => Boolean(item))
        .sort((left, right) => right.value - left.value)
        .slice(0, 8),
    [overview?.topCountries],
  );

  const timelineMax = useMemo(() => {
    const values = overview?.timeline.map((item) => Math.max(item.visits, item.sessions, item.uniqueVisitors)) || [0];
    return Math.max(1, ...values);
  }, [overview?.timeline]);

  return (
    <div className="h-full overflow-y-auto bg-[#F8F5EF]">
      <div className="mx-auto max-w-[1600px] px-6 py-6 space-y-6">
        <div className="rounded-[28px] border border-[#D8D1C7] bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#A56A1E]">Overview</p>
              <h1 className="mt-2 text-3xl font-extrabold text-[#1E1E1E]">
                {lang === 'ar' ? 'نظرة عامة على نشاط الموقع' : 'Website activity overview'}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#5B5B5B]">
                {lang === 'ar'
                  ? 'لوحة تشغيل حيّة تعرض الزيارات، أكثر الصفحات مشاهدة، مصادر الزيارات، الأجهزة، والطلبات الواردة، مع قراءة واضحة للنشاط اليومي.'
                  : 'A live operations dashboard showing traffic, popular pages, referrers, devices, and incoming requests with a clear daily activity view.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {RANGE_OPTIONS.map((option) => {
                const active = option.value === range;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRange(option.value)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                      active ? 'bg-[#A56A1E] text-white shadow-sm' : 'border border-[#D8D1C7] bg-[#FBF8F2] text-[#7B5A42] hover:border-[#A56A1E]/50'
                    }`}
                  >
                    {lang === 'ar' ? option.labelAr : option.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {countryOptions.map((option) => {
              const active = option.value === countryFilter;
              return (
                <button
                  key={option.value || 'all-countries'}
                  type="button"
                  onClick={() => setCountryFilter(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    active ? 'bg-[#1F6B5F] text-white shadow-sm' : 'border border-[#D8D1C7] bg-[#FBF8F2] text-[#7B5A42] hover:border-[#1F6B5F]/50'
                  }`}
                >
                  {lang === 'ar' ? option.labelAr : option.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label={lang === 'ar' ? 'الزيارات العالمية' : 'Worldwide visits'}
            value={loading ? '—' : formatCompact(overview?.summary.visits || 0)}
            icon={BarChart3}
            accent="#A56A1E"
            subtitle={lang === 'ar' ? 'صفحات تم تحميلها' : 'Page views recorded'}
          />
          <MetricCard
            label={lang === 'ar' ? 'الزوار الفريدون' : 'Unique visitors'}
            value={loading ? '—' : formatCompact(overview?.summary.uniqueVisitors || 0)}
            icon={Users}
            accent="#7B5A42"
            subtitle={lang === 'ar' ? 'هوية الزائر/الجلسة' : 'Distinct visitor identities'}
          />
          <MetricCard
            label={lang === 'ar' ? 'زيارات السعودية' : 'Saudi Arabia visits'}
            value={loading ? '—' : formatCompact(overview?.geo.saudiArabiaVisits || 0)}
            icon={ArrowUpRight}
            accent="#1F6B5F"
            subtitle={lang === 'ar' ? 'الزيارات القادمة من السعودية' : 'Visits from Saudi Arabia'}
          />
          <MetricCard
            label={lang === 'ar' ? 'الزيارات خارج السعودية' : 'Outside Saudi Arabia'}
            value={loading ? '—' : formatCompact(outsideSaudiArabiaVisits)}
            icon={ArrowUpRight}
            accent="#4F6B9A"
            subtitle={lang === 'ar' ? 'الزيارات القادمة من بقية الدول' : 'Visits from the rest of the world'}
          />
          <MetricCard
            label={lang === 'ar' ? 'الجلسات' : 'Sessions'}
            value={loading ? '—' : formatCompact(overview?.summary.sessions || 0)}
            icon={Clock3}
            accent="#C47F17"
            subtitle={lang === 'ar' ? 'جلسات نشطة في النطاق' : 'Active sessions in the selected range'}
          />
          <MetricCard
            label={lang === 'ar' ? 'متوسط الصفحات/جلسة' : 'Avg pages/session'}
            value={loading ? '—' : (overview?.summary.avgPagesPerSession || 0).toFixed(2)}
            icon={MousePointerClick}
            accent="#2F6B5D"
            subtitle={lang === 'ar' ? 'مؤشر تفاعل سريع' : 'Engagement depth'}
          />
        </div>

        <div className="rounded-3xl border border-[#D8D1C7] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">
                {lang === 'ar' ? 'خريطة العالم' : 'World map'}
              </p>
              <h2 className="mt-2 text-xl font-extrabold text-[#1E1E1E]">
                {lang === 'ar' ? 'توزيع الزيارات الجغرافية' : 'Geographic traffic distribution'}
              </h2>
            </div>
            <div className="text-sm text-[#5B5B5B]">
              {lang === 'ar' ? 'أقوى الدول بحسب الزيارات' : 'Top countries by visit volume'}
            </div>
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr] xl:items-center">
            <div className="rounded-[28px] border border-[#EFE5D6] bg-[#FBF8F2] p-4">
              <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#FAF4E9_0%,#F4EBDD_100%)]">
                <svg viewBox="0 0 1000 500" className="h-[300px] w-full" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <filter id="map-shadow">
                      <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#8B6A47" floodOpacity="0.16" />
                    </filter>
                  </defs>
                  <g fill="#E8DDCB" opacity="0.9" filter="url(#map-shadow)">
                    {WORLD_MAP_PATHS.map((path, index) => (
                      <path key={index} d={path} />
                    ))}
                  </g>
                  <g stroke="#D9CBB6" strokeWidth="2" opacity="0.45">
                    <line x1="0" y1="125" x2="1000" y2="125" />
                    <line x1="0" y1="250" x2="1000" y2="250" />
                    <line x1="0" y1="375" x2="1000" y2="375" />
                    <line x1="125" y1="0" x2="125" y2="500" />
                    <line x1="375" y1="0" x2="375" y2="500" />
                    <line x1="625" y1="0" x2="625" y2="500" />
                    <line x1="875" y1="0" x2="875" y2="500" />
                  </g>
                </svg>
                {worldMapMarkers.map((marker) => (
                  <div
                    key={marker.label}
                    className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
                    style={{
                      left: `${marker.x / 10}%`,
                      top: `${(marker.y / 500) * 100}%`,
                    }}
                  >
                    <div
                      className="rounded-full border-2 border-white shadow-lg"
                      style={{
                        width: `${Math.max(10, Math.min(28, 10 + marker.value * 2))}px`,
                        height: `${Math.max(10, Math.min(28, 10 + marker.value * 2))}px`,
                        background: 'radial-gradient(circle at 35% 35%, #D3F5EE 0%, #1F6B5F 55%, #134E46 100%)',
                      }}
                    />
                    <div className="rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-[#1E1E1E] shadow-sm">
                      {marker.label} • {formatCompact(marker.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: lang === 'ar' ? 'السعودية' : 'Saudi Arabia',
                  value: overview?.geo.saudiArabiaVisits || 0,
                  color: '#1F6B5F',
                },
                {
                  label: lang === 'ar' ? 'بقية العالم' : 'Rest of world',
                  value: outsideSaudiArabiaVisits,
                  color: '#4F6B9A',
                },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-[#EFE5D6] bg-[#FBF8F2] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="text-sm font-semibold text-[#1E1E1E]">{item.label}</div>
                    </div>
                    <div className="text-sm font-extrabold text-[#1E1E1E]">{formatCompact(item.value)}</div>
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-[#EFE5D6] bg-[#FBF8F2] p-4">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#7B5A42]">
                  {lang === 'ar' ? 'مجموع الزيارات' : 'Total visits'}
                </div>
                <div className="mt-2 text-3xl font-extrabold text-[#1E1E1E]">
                  {formatCompact(geoTotalVisits)}
                </div>
                <div className="mt-2 text-sm text-[#5B5B5B]">
                  {lang === 'ar'
                    ? 'يتم احتسابها من الزيارات المسجلة عبر الطرف الأول.'
                    : 'Calculated from first-party tracked visits.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-[#D8D1C7] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">
                  {lang === 'ar' ? 'توزيع الزيارات' : 'Traffic split'}
                </p>
                <h2 className="mt-2 text-xl font-extrabold text-[#1E1E1E]">
                  {lang === 'ar' ? 'السعودية مقابل بقية العالم' : 'Saudi Arabia vs. the rest of the world'}
                </h2>
              </div>
              <div className="text-sm text-[#5B5B5B]">
                {lang === 'ar' ? 'اعتماداً على بيانات الطرف الأول' : 'Based on first-party analytics'}
              </div>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr] lg:items-center">
              <div className="flex items-center justify-center">
                <div
                  className="relative flex h-56 w-56 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#1F6B5F 0 ${geoSaudiPercent}%, #4F6B9A ${geoSaudiPercent}% 100%)`,
                  }}
                >
                  <div className="flex h-[68%] w-[68%] flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(216,209,199,0.8)]">
                    <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">
                      {lang === 'ar' ? 'إجمالي الزيارات' : 'Total visits'}
                    </div>
                    <div className="mt-2 text-4xl font-extrabold text-[#1E1E1E]">
                      {formatCompact(geoTotalVisits)}
                    </div>
                    <div className="mt-2 text-sm text-[#5B5B5B]">
                      {lang === 'ar' ? 'السعودية • خارج السعودية' : 'Saudi Arabia • Outside Saudi Arabia'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  {
                    label: lang === 'ar' ? 'السعودية' : 'Saudi Arabia',
                    value: overview?.geo.saudiArabiaVisits || 0,
                    percent: geoSaudiPercent,
                    color: '#1F6B5F',
                  },
                  {
                    label: lang === 'ar' ? 'خارج السعودية' : 'Outside Saudi Arabia',
                    value: outsideSaudiArabiaVisits,
                    percent: geoOutsidePercent,
                    color: '#4F6B9A',
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#EFE5D6] bg-[#FBF8F2] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <div className="text-sm font-semibold text-[#1E1E1E]">{item.label}</div>
                      </div>
                      <div className="text-sm font-extrabold text-[#1E1E1E]">{formatCompact(item.value)}</div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E9E0D3]">
                      <div className="h-full rounded-full" style={{ width: `${Math.max(4, item.percent)}%`, backgroundColor: item.color }} />
                    </div>
                    <div className="mt-2 text-xs text-[#5B5B5B]">
                      {item.percent.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-3xl border border-[#D8D1C7] bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">
                {lang === 'ar' ? 'مؤشرات المحتوى' : 'Content context'}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: lang === 'ar' ? 'الصفحات' : 'Pages', value: overview?.content.pages || 0 },
                  { label: lang === 'ar' ? 'المقالات' : 'Articles', value: overview?.content.articles || 0 },
                  { label: lang === 'ar' ? 'المجالات' : 'Practice areas', value: overview?.content.practiceAreas || 0 },
                  { label: lang === 'ar' ? 'الاستشارات' : 'Consultations', value: overview?.content.consultations || 0 },
                  { label: lang === 'ar' ? 'سند الطبيب' : 'Doctor Shield', value: overview?.content.doctorShieldRequests || 0 },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#EFE5D6] bg-[#FBF8F2] p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#7B5A42]">{item.label}</div>
                    <div className="mt-2 text-2xl font-extrabold text-[#1E1E1E]">{formatCompact(item.value)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-[#D8D1C7] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Traffic trend</p>
                <h2 className="mt-2 text-xl font-extrabold text-[#1E1E1E]">
                  {lang === 'ar' ? 'اتجاه الزيارات اليومية' : 'Daily visit trend'}
                </h2>
              </div>
              <div className="text-sm text-[#5B5B5B]">
                {lang === 'ar' ? 'أحدث البيانات من الجلسات الفعلية' : 'Live first-party session data'}
              </div>
            </div>
            <div className="mt-6 flex h-72 items-end gap-2 rounded-3xl border border-[#EFE5D6] bg-[#FBF8F2] p-4">
              {overview?.timeline.length ? overview.timeline.map((point) => {
                const visitsHeight = `${Math.max(6, (point.visits / timelineMax) * 100)}%`;
                const sessionsHeight = `${Math.max(6, (point.sessions / timelineMax) * 100)}%`;
                const uniqueHeight = `${Math.max(6, (point.uniqueVisitors / timelineMax) * 100)}%`;
                return (
                  <div key={point.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div className="flex h-full w-full items-end justify-center gap-1">
                      <div className="w-2 rounded-full bg-[#A56A1E]" style={{ height: visitsHeight }} title={`${point.visits} visits`} />
                      <div className="w-2 rounded-full bg-[#7B5A42]" style={{ height: sessionsHeight }} title={`${point.sessions} sessions`} />
                      <div className="w-2 rounded-full bg-[#C47F17]" style={{ height: uniqueHeight }} title={`${point.uniqueVisitors} visitors`} />
                    </div>
                    <div className="text-[10px] font-semibold text-[#6A6A6A]">{formatDateLabel(point.date, lang)}</div>
                  </div>
                );
              }) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-[#5B5B5B]">
                  {loading ? (lang === 'ar' ? 'جارٍ التحميل…' : 'Loading…') : (lang === 'ar' ? 'لا توجد بيانات نشاط بعد.' : 'No analytics data yet.')}
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#5B5B5B]">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#A56A1E]" />{lang === 'ar' ? 'زيارات' : 'Visits'}</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#7B5A42]" />{lang === 'ar' ? 'جلسات' : 'Sessions'}</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#C47F17]" />{lang === 'ar' ? 'زوار' : 'Visitors'}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-[#D8D1C7] bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Top insights</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-2xl bg-[#FBF8F2] p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#7B5A42]">
                    {lang === 'ar' ? 'أكثر صفحة' : 'Top page'}
                  </div>
                  <div className="mt-2 text-base font-extrabold text-[#1E1E1E]">{topPage?.title || (lang === 'ar' ? 'لا يوجد' : 'None yet')}</div>
                  <div className="mt-1 text-sm text-[#5B5B5B]">
                    {topPage ? `${topPage.path} • ${formatCompact(topPage.views)} ${lang === 'ar' ? 'مشاهدة' : 'views'}` : ''}
                  </div>
                </div>
                <div className="rounded-2xl bg-[#FBF8F2] p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#7B5A42]">
                    {lang === 'ar' ? 'أكثر مصدر إحالة' : 'Top referrer'}
                  </div>
                  <div className="mt-2 text-base font-extrabold text-[#1E1E1E]">{topReferrer?.referrer || (lang === 'ar' ? 'مباشر' : 'Direct')}</div>
                  <div className="mt-1 text-sm text-[#5B5B5B]">
                    {topReferrer ? `${formatCompact(topReferrer.visits)} ${lang === 'ar' ? 'زيارة' : 'visits'}` : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#D8D1C7] bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">
                {lang === 'ar' ? 'مؤشرات المحتوى' : 'Content context'}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: lang === 'ar' ? 'الصفحات' : 'Pages', value: overview?.content.pages || 0 },
                  { label: lang === 'ar' ? 'المقالات' : 'Articles', value: overview?.content.articles || 0 },
                  { label: lang === 'ar' ? 'المجالات' : 'Practice areas', value: overview?.content.practiceAreas || 0 },
                  { label: lang === 'ar' ? 'الاستشارات' : 'Consultations', value: overview?.content.consultations || 0 },
                  { label: lang === 'ar' ? 'سند الطبيب' : 'Doctor Shield', value: overview?.content.doctorShieldRequests || 0 },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#EFE5D6] bg-[#FBF8F2] p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#7B5A42]">{item.label}</div>
                    <div className="mt-2 text-2xl font-extrabold text-[#1E1E1E]">{formatCompact(item.value)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <RankedList
            title={lang === 'ar' ? 'أكثر الصفحات زيارة' : 'Top pages'}
            items={overview?.topPages || []}
            lang={lang}
          />
          <RankedList
            title={lang === 'ar' ? 'أكثر المصادر' : 'Top referrers'}
            items={overview?.topReferrers || []}
            lang={lang}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <RankedList
            title={lang === 'ar' ? 'الدول/المناطق' : 'Countries & regions'}
            items={overview?.topCountries || []}
            lang={lang}
          />
          <RankedList
            title={lang === 'ar' ? 'الأجهزة' : 'Devices'}
            items={overview?.topDevices || []}
            lang={lang}
          />
          <RankedList
            title={lang === 'ar' ? 'المتصفحات' : 'Browsers'}
            items={overview?.topBrowsers || []}
            lang={lang}
          />
        </div>

        <div className="rounded-3xl border border-[#D8D1C7] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Recent activity</p>
              <h2 className="mt-2 text-xl font-extrabold text-[#1E1E1E]">
                {lang === 'ar' ? 'آخر الأحداث' : 'Recent activity'}
              </h2>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#EFE5D6]">
            {overview?.recentActivity.length ? overview.recentActivity.map((item) => (
              <div key={item.id} className="grid gap-3 border-b border-[#EFE5D6] bg-[#FBF8F2] px-4 py-3 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#1E1E1E]">
                    <span className="rounded-full bg-[#A56A1E]/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A56A1E]">
                      {item.type === 'page_view' ? (lang === 'ar' ? 'زيارة' : 'View') : (lang === 'ar' ? 'نقرة' : 'CTA')}
                    </span>
                    <span>{item.title || item.path}</span>
                  </div>
                  <div className="mt-1 text-xs text-[#5B5B5B]">
                    {item.path} • {item.referrer} • {item.country}/{item.region} • {item.deviceType} • {item.browserName}
                  </div>
                </div>
                <div className="text-xs text-[#5B5B5B] md:text-right">
                  {new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-GB', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(item.createdAt))}
                </div>
              </div>
            )) : (
              <div className="px-4 py-6 text-sm text-[#5B5B5B]">
                {loading ? (lang === 'ar' ? 'جارٍ التحميل…' : 'Loading…') : (lang === 'ar' ? 'لا توجد أحداث حديثة بعد.' : 'No recent events yet.')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
