import crypto from 'node:crypto';
import type { IncomingHttpHeaders } from 'node:http';
import { Prisma } from '@prisma/client';
import { prisma } from './db';

export type AnalyticsEventType = 'page_view' | 'cta_click';
export type AnalyticsRange = '7d' | '30d' | '90d' | 'all';

type AnalyticsVisitorRow = {
  id: string;
  visitorId: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  firstReferrer: string;
  firstReferrerHost: string;
  firstLocale: string;
  country: string;
  region: string;
  city: string;
  deviceType: string;
  browserName: string;
  osName: string;
  userAgent: string;
  visitsCount: number;
  ctaClicksCount: number;
};

type AnalyticsSessionRow = {
  id: string;
  sessionId: string;
  visitorId: string;
  startedAt: Date;
  lastSeenAt: Date;
  landingPath: string;
  landingTitle: string;
  landingReferrer: string;
  landingReferrerHost: string;
  locale: string;
  country: string;
  region: string;
  city: string;
  deviceType: string;
  browserName: string;
  osName: string;
  userAgent: string;
  pageViewsCount: number;
  ctaClicksCount: number;
};

type AnalyticsEventRow = {
  id: string;
  sessionId: string;
  visitorId: string;
  type: AnalyticsEventType;
  name: string;
  path: string;
  title: string;
  referrer: string;
  referrerHost: string;
  locale: string;
  country: string;
  region: string;
  city: string;
  deviceType: string;
  browserName: string;
  osName: string;
  userAgent: string;
  screenWidth: number | null;
  screenHeight: number | null;
  createdAt: Date;
};

export interface AnalyticsEventInput {
  visitorId?: string;
  sessionId?: string;
  type?: AnalyticsEventType;
  name?: string;
  path: string;
  title?: string;
  referrer?: string;
  locale?: string;
  screenWidth?: number | null;
  screenHeight?: number | null;
}

export interface AnalyticsOverviewRange {
  range: AnalyticsRange;
}

export interface AnalyticsOverviewSummary {
  visits: number;
  uniqueVisitors: number;
  sessions: number;
  avgPagesPerSession: number;
  topPage: { path: string; title: string; views: number } | null;
  topReferrer: { referrer: string; visits: number } | null;
}

export interface AnalyticsOverviewRow {
  label: string;
  value: number;
}

export interface AnalyticsOverviewTimelinePoint {
  date: string;
  visits: number;
  uniqueVisitors: number;
  sessions: number;
}

export interface AnalyticsOverviewItem {
  label: string;
  value: number;
  subtitle?: string;
}

export interface AnalyticsOverviewRecentItem {
  id: string;
  type: AnalyticsEventType;
  name: string;
  path: string;
  title: string;
  referrer: string;
  locale: string;
  country: string;
  region: string;
  city: string;
  deviceType: string;
  browserName: string;
  osName: string;
  createdAt: string;
}

export interface AnalyticsOverviewResponse {
  summary: AnalyticsOverviewSummary;
  timeline: AnalyticsOverviewTimelinePoint[];
  topPages: AnalyticsOverviewItem[];
  topReferrers: AnalyticsOverviewItem[];
  topCountries: AnalyticsOverviewItem[];
  topDevices: AnalyticsOverviewItem[];
  topBrowsers: AnalyticsOverviewItem[];
  recentActivity: AnalyticsOverviewRecentItem[];
  content: {
    pages: number;
    articles: number;
    practiceAreas: number;
    consultations: number;
    doctorShieldRequests: number;
  };
}

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeHost = (value: string) => {
  const trimmed = normalizeText(value);
  if (!trimmed) return '';
  try {
    return new URL(trimmed).host.toLowerCase();
  } catch {
    return trimmed.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
  }
};

const detectDeviceType = (userAgent: string, width?: number | null) => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
  if (ua.includes('mobi') || ua.includes('iphone') || ua.includes('android')) return 'mobile';
  if (typeof width === 'number') {
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
  }
  return 'desktop';
};

const detectBrowserName = (userAgent: string) => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('chrome/') && !ua.includes('edg/')) return 'Chrome';
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('opera/') || ua.includes('opr/')) return 'Opera';
  return 'Other';
};

const detectOsName = (userAgent: string) => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac os') || ua.includes('macintosh')) return 'macOS';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) return 'iOS';
  if (ua.includes('linux')) return 'Linux';
  return 'Other';
};

const getHeaderValue = (headers: IncomingHttpHeaders, names: string[]) => {
  for (const name of names) {
    const value = headers[name.toLowerCase()];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
};

const getGeoFromHeaders = (headers: IncomingHttpHeaders) => ({
  country: getHeaderValue(headers, ['cf-ipcountry', 'x-vercel-ip-country', 'x-country']) || 'Unknown',
  region: getHeaderValue(headers, ['cf-region', 'x-vercel-ip-country-region', 'x-region']) || 'Unknown',
  city: getHeaderValue(headers, ['cf-ipcity', 'x-vercel-ip-city', 'x-city']) || 'Unknown',
});

const getLocale = (value: string | undefined, headers: IncomingHttpHeaders) => {
  const headerLocale = getHeaderValue(headers, ['accept-language']);
  return normalizeText(value) || headerLocale.split(',')[0]?.trim() || 'en';
};

const rangeToStart = (range: AnalyticsRange) => {
  if (range === 'all') return null;
  const days = Number(range.replace(/[^0-9]/g, '')) || 30;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return start;
};

const safeDateLabel = (date: Date) => date.toISOString().slice(0, 10);

const getAnalyticsRows = async (range: AnalyticsRange) => {
  const start = rangeToStart(range);
  const pageViewWhere = start ? Prisma.sql`WHERE "createdAt" >= ${start}` : Prisma.empty;
  const sessionWhere = start ? Prisma.sql`WHERE "lastSeenAt" >= ${start}` : Prisma.empty;
  const visitorWhere = start ? Prisma.sql`WHERE "lastSeenAt" >= ${start}` : Prisma.empty;
  const events = await prisma.$queryRaw<AnalyticsEventRow[]>(Prisma.sql`
    SELECT *
    FROM "AnalyticsEvent"
    ${pageViewWhere}
    ORDER BY "createdAt" DESC
  `);
  const sessions = await prisma.$queryRaw<AnalyticsSessionRow[]>(Prisma.sql`
    SELECT *
    FROM "AnalyticsSession"
    ${sessionWhere}
    ORDER BY "lastSeenAt" DESC
  `);
  const visitors = await prisma.$queryRaw<AnalyticsVisitorRow[]>(Prisma.sql`
    SELECT *
    FROM "AnalyticsVisitor"
    ${visitorWhere}
    ORDER BY "lastSeenAt" DESC
  `);
  return { events, sessions, visitors };
};

export const recordAnalyticsEvent = async (input: AnalyticsEventInput, headers: IncomingHttpHeaders) => {
  const visitorId = normalizeText(input.visitorId) || crypto.randomUUID();
  const sessionId = normalizeText(input.sessionId) || crypto.randomUUID();
  const type = input.type || 'page_view';
  const referrer = normalizeText(input.referrer);
  const referrerHost = normalizeHost(referrer);
  const locale = getLocale(input.locale, headers);
  const userAgent = getHeaderValue(headers, ['user-agent']);
  const screenWidth = typeof input.screenWidth === 'number' ? input.screenWidth : null;
  const screenHeight = typeof input.screenHeight === 'number' ? input.screenHeight : null;
  const deviceType = detectDeviceType(userAgent, screenWidth);
  const browserName = detectBrowserName(userAgent);
  const osName = detectOsName(userAgent);
  const geo = getGeoFromHeaders(headers);
  const path = normalizeText(input.path) || '/';
  const title = normalizeText(input.title);
  const name = normalizeText(input.name);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `
        INSERT INTO "AnalyticsVisitor" (
          "id", "visitorId", "firstSeenAt", "lastSeenAt", "firstReferrer", "firstReferrerHost", "firstLocale",
          "country", "region", "city", "deviceType", "browserName", "osName", "userAgent", "visitsCount", "ctaClicksCount"
        ) VALUES (
          $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $3, $4, $5,
          $6, $7, $8, $9, $10, $11, $12, 0, 0
        )
        ON CONFLICT ("visitorId") DO UPDATE SET
          "lastSeenAt" = CURRENT_TIMESTAMP,
          "visitsCount" = "AnalyticsVisitor"."visitsCount" + CASE WHEN $13 = 'page_view' THEN 1 ELSE 0 END,
          "ctaClicksCount" = "AnalyticsVisitor"."ctaClicksCount" + CASE WHEN $13 = 'cta_click' THEN 1 ELSE 0 END
      `,
      crypto.randomUUID(),
      visitorId,
      referrer,
      referrerHost,
      locale,
      geo.country,
      geo.region,
      geo.city,
      deviceType,
      browserName,
      osName,
      userAgent,
      type,
    );

    await tx.$executeRawUnsafe(
      `
        INSERT INTO "AnalyticsSession" (
          "id", "sessionId", "visitorId", "startedAt", "lastSeenAt", "landingPath", "landingTitle",
          "landingReferrer", "landingReferrerHost", "locale", "country", "region", "city", "deviceType",
          "browserName", "osName", "userAgent", "pageViewsCount", "ctaClicksCount"
        ) VALUES (
          $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $4, $5,
          $6, $7, $8, $9, $10, $11, $12,
          $13, $14, $15, 0, 0
        )
        ON CONFLICT ("sessionId") DO UPDATE SET
          "lastSeenAt" = CURRENT_TIMESTAMP,
          "pageViewsCount" = "AnalyticsSession"."pageViewsCount" + CASE WHEN $16 = 'page_view' THEN 1 ELSE 0 END,
          "ctaClicksCount" = "AnalyticsSession"."ctaClicksCount" + CASE WHEN $16 = 'cta_click' THEN 1 ELSE 0 END
      `,
      crypto.randomUUID(),
      sessionId,
      visitorId,
      path,
      title,
      referrer,
      referrerHost,
      locale,
      geo.country,
      geo.region,
      geo.city,
      deviceType,
      browserName,
      osName,
      userAgent,
      type,
    );

    await tx.$executeRawUnsafe(
      `
        INSERT INTO "AnalyticsEvent" (
          "id", "sessionId", "visitorId", "type", "name", "path", "title", "referrer", "referrerHost",
          "locale", "country", "region", "city", "deviceType", "browserName", "osName", "userAgent",
          "screenWidth", "screenHeight", "createdAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, CURRENT_TIMESTAMP
        )
      `,
      crypto.randomUUID(),
      sessionId,
      visitorId,
      type,
      name,
      path,
      title,
      referrer,
      referrerHost,
      locale,
      geo.country,
      geo.region,
      geo.city,
      deviceType,
      browserName,
      osName,
      userAgent,
      screenWidth,
      screenHeight,
    );
  });

  return { ok: true as const };
};

export const getAnalyticsOverview = async (range: AnalyticsRange = '30d'): Promise<AnalyticsOverviewResponse> => {
  const { events, sessions, visitors } = await getAnalyticsRows(range);
  const pageViews = events.filter((event) => event.type === 'page_view');
  const ctaClicks = events.filter((event) => event.type === 'cta_click');
  const totalVisits = pageViews.length;
  const uniqueVisitors = visitors.length;
  const totalSessions = sessions.length;
  const avgPagesPerSession = totalSessions > 0 ? Number((totalVisits / totalSessions).toFixed(2)) : 0;

  const buildTopList = (keySelector: (row: AnalyticsEventRow | AnalyticsSessionRow | AnalyticsVisitorRow) => string, rows: Array<AnalyticsEventRow | AnalyticsSessionRow | AnalyticsVisitorRow>, fallback = 'Unknown') => {
    const counts = new Map<string, number>();
    rows.forEach((row) => {
      const key = keySelector(row) || fallback;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 6);
  };

  const pageCounts = new Map<string, { title: string; views: number; visitors: Set<string> }>();
  pageViews.forEach((event) => {
    const key = event.path || '/';
    const item = pageCounts.get(key) || { title: event.title || key, views: 0, visitors: new Set<string>() };
    item.title = item.title || event.title || key;
    item.views += 1;
    item.visitors.add(event.visitorId);
    pageCounts.set(key, item);
  });

  const topPageEntry = Array.from(pageCounts.entries()).sort((left, right) => right[1].views - left[1].views)[0];

  const referrerCounts = new Map<string, number>();
  pageViews.forEach((event) => {
    const referrer = event.referrerHost || event.referrer || 'Direct';
    referrerCounts.set(referrer, (referrerCounts.get(referrer) || 0) + 1);
  });

  const timelineMap = new Map<string, AnalyticsOverviewTimelinePoint>();
  pageViews.forEach((event) => {
    const key = safeDateLabel(new Date(event.createdAt));
    const current = timelineMap.get(key) || { date: key, visits: 0, uniqueVisitors: 0, sessions: 0 };
    current.visits += 1;
    timelineMap.set(key, current);
  });
  const sessionTimelineMap = new Map<string, Set<string>>();
  const visitorTimelineMap = new Map<string, Set<string>>();
  sessions.forEach((session) => {
    const key = safeDateLabel(new Date(session.startedAt));
    const sessionSet = sessionTimelineMap.get(key) || new Set<string>();
    sessionSet.add(session.sessionId);
    sessionTimelineMap.set(key, sessionSet);
    const visitorSet = visitorTimelineMap.get(key) || new Set<string>();
    visitorSet.add(session.visitorId);
    visitorTimelineMap.set(key, visitorSet);
  });
  for (const [date, sessionSet] of sessionTimelineMap.entries()) {
    const current = timelineMap.get(date) || { date, visits: 0, uniqueVisitors: 0, sessions: 0 };
    current.sessions = sessionSet.size;
    current.uniqueVisitors = visitorTimelineMap.get(date)?.size || 0;
    timelineMap.set(date, current);
  }

  const timeline = Array.from(timelineMap.values()).sort((left, right) => left.date.localeCompare(right.date));
  const topPages = Array.from(pageCounts.entries())
    .map(([path, item]) => ({
      label: item.title || path,
      value: item.views,
      subtitle: `${item.visitors.size} unique visitors • ${path}`,
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 8);
  const topReferrers = Array.from(referrerCounts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 8);
  const topCountries = buildTopList((row) => row.country, pageViews, 'Unknown');
  const topDevices = buildTopList((row) => row.deviceType, pageViews, 'Unknown');
  const topBrowsers = buildTopList((row) => row.browserName, pageViews, 'Unknown');

  const recentActivity = events
    .slice(0, 12)
    .map((event) => ({
      id: event.id,
      type: event.type,
      name: event.name,
      path: event.path,
      title: event.title,
      referrer: event.referrerHost || event.referrer || 'Direct',
      locale: event.locale,
      country: event.country || 'Unknown',
      region: event.region || 'Unknown',
      city: event.city || 'Unknown',
      deviceType: event.deviceType || 'Unknown',
      browserName: event.browserName || 'Unknown',
      osName: event.osName || 'Unknown',
      createdAt: event.createdAt.toISOString(),
    }));

  const [pages, articles, practiceAreas, consultations, doctorShieldRequests] = await Promise.all([
    prisma.cmsPage.count(),
    prisma.article.count(),
    prisma.practiceArea.count(),
    prisma.consultationRequest.count(),
    prisma.doctorShieldRequest.count(),
  ]);

  return {
    summary: {
      visits: totalVisits,
      uniqueVisitors,
      sessions: totalSessions,
      avgPagesPerSession,
      topPage: topPageEntry
        ? { path: topPageEntry[0], title: topPageEntry[1].title, views: topPageEntry[1].views }
        : null,
      topReferrer: topReferrers[0]
        ? { referrer: topReferrers[0].label, visits: topReferrers[0].value }
        : null,
    },
    timeline,
    topPages,
    topReferrers,
    topCountries,
    topDevices,
    topBrowsers,
    recentActivity,
    content: {
      pages,
      articles,
      practiceAreas,
      consultations,
      doctorShieldRequests,
    },
  };
};
