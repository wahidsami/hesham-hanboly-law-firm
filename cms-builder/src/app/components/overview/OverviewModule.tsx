import { useEffect, useMemo, useState, type ElementType } from 'react';
import { ArrowUpRight, BarChart3, Clock3, MousePointerClick, Users } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    backendApi.getAnalyticsOverview(range)
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
  }, [range]);

  const topPage = overview?.summary.topPage;
  const topReferrer = overview?.summary.topReferrer;

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
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label={lang === 'ar' ? 'الزيارات' : 'Visits'}
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
