import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import { Prisma } from '@prisma/client';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import { config } from './config';
import {
  clearAuthCookie,
  currentSession,
  loginWithUsernamePassword,
  logoutCurrentSession,
  requireAdmin,
  setAuthCookie,
} from './auth';
import { ensureAdminUser, ensureDatabaseSchema, prisma } from './db';
import {
  articleToRecord,
  cmsPageToRecord,
  deleteCmsPage,
  deleteMediaAsset,
  listMediaAssets,
  listCmsRevisions,
  listArticles,
  listCmsPages,
  listHeroSlides,
  listNavigationItems,
  listPracticeAreas,
  listPublishedArticles,
  listPublishedPracticeAreas,
  normalizeArticleInput,
  normalizePracticeAreaInput,
  saveCmsPage,
  saveCmsRevision,
  saveNavigationItems,
  restoreCmsRevision,
  updateMediaAsset,
  practiceAreaToRecord,
  siteSettingsToRecord,
  toSiteContent,
} from './content';
import { uploadBufferToS3 } from './uploads';
import { seedDatabase } from './seed';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });
const distPath = path.resolve(process.cwd(), 'dist');
const localUploadsPath = path.resolve(process.cwd(), 'backend', 'uploads');

app.use(express.json({ limit: '8mb' }));
app.use('/uploads', express.static(localUploadsPath));

const asyncHandler =
  (handler: express.RequestHandler): express.RequestHandler =>
  (request, response, next) =>
    Promise.resolve(handler(request, response, next)).catch(next);

const sendError = (response: express.Response, error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const status =
    message.includes('required') ||
    message.includes('must') ||
    message.includes('exists') ||
    message.includes('Invalid')
      ? 400
      : 500;
  response.status(status).json({ error: message });
};

const loadArticleBySlug = async (slug: string) =>
  prisma.article.findUnique({
    where: { slug },
  });

const loadPracticeAreaBySlug = async (slug: string) =>
  prisma.practiceArea.findUnique({
    where: { slug },
  });

const loadCmsPageBySlug = async (slug: string) => {
  const trimmedSlug = slug.trim();
  const slugCandidates = trimmedSlug.startsWith('/')
    ? [trimmedSlug, trimmedSlug.slice(1)]
    : [trimmedSlug, `/${trimmedSlug}`];

  for (const candidate of slugCandidates) {
    const page = await prisma.cmsPage.findUnique({
      where: { slug: candidate },
    });
    if (page) {
      return page;
    }
  }

  return null;
};

const sanitizeCmsPageBlocks = (slug: string, blocks: unknown[]) => {
  const normalizedSlug = slug.replace(/^\/+/, '').toLowerCase();
  if (!Array.isArray(blocks)) {
    return [];
  }

  if (normalizedSlug !== 'team') {
    return blocks;
  }

  return blocks.filter((block) => {
    if (!block || typeof block !== 'object') {
      return true;
    }
    const typedBlock = block as { id?: unknown; type?: unknown };
    return typedBlock.id !== 'team-intro';
  });
};

const assertUniqueArticleSlug = async (slug: string, currentId?: string) => {
  const conflict = await prisma.article.findUnique({ where: { slug } });
  if (conflict && conflict.id !== currentId) {
    throw new Error('Article slug already exists.');
  }
};

const assertUniquePracticeAreaSlug = async (slug: string, currentId?: string) => {
  const conflict = await prisma.practiceArea.findUnique({ where: { slug } });
  if (conflict && conflict.id !== currentId) {
    throw new Error('Practice area slug already exists.');
  }
};

const saveArticle = async (originalSlug: string | undefined, body: unknown) => {
  const existing = originalSlug ? await loadArticleBySlug(originalSlug) : null;
  const payload = normalizeArticleInput(body as Parameters<typeof normalizeArticleInput>[0]);
  await assertUniqueArticleSlug(payload.slug!, existing?.id);

  if (existing) {
    const updated = await prisma.article.update({
      where: { id: existing.id },
      data: {
        slug: payload.slug,
        titleAr: payload.titleAr!,
        titleEn: payload.titleEn!,
        excerptAr: payload.excerptAr!,
        excerptEn: payload.excerptEn!,
        categoryAr: payload.categoryAr!,
        categoryEn: payload.categoryEn!,
        authorAr: payload.authorAr!,
        authorEn: payload.authorEn!,
        date: payload.date!,
        readTimeAr: payload.readTimeAr!,
        readTimeEn: payload.readTimeEn!,
        bodyAr: payload.bodyAr!,
        bodyEn: payload.bodyEn!,
        imageUrl: payload.imageUrl!,
        published: Boolean(payload.published),
        order: Number(payload.order || 0),
      },
    });
    return articleToRecord(updated);
  }

  const created = await prisma.article.create({
    data: {
      slug: payload.slug!,
      titleAr: payload.titleAr!,
      titleEn: payload.titleEn!,
      excerptAr: payload.excerptAr!,
      excerptEn: payload.excerptEn!,
      categoryAr: payload.categoryAr!,
      categoryEn: payload.categoryEn!,
      authorAr: payload.authorAr!,
      authorEn: payload.authorEn!,
      date: payload.date!,
      readTimeAr: payload.readTimeAr!,
      readTimeEn: payload.readTimeEn!,
      bodyAr: payload.bodyAr!,
      bodyEn: payload.bodyEn!,
      imageUrl: payload.imageUrl!,
      published: Boolean(payload.published),
      order: Number(payload.order || 0),
    },
  });
  return articleToRecord(created);
};

const savePracticeArea = async (originalSlug: string | undefined, body: unknown) => {
  const existing = originalSlug ? await loadPracticeAreaBySlug(originalSlug) : null;
  const payload = normalizePracticeAreaInput(body as Parameters<typeof normalizePracticeAreaInput>[0]);
  await assertUniquePracticeAreaSlug(payload.slug!, existing?.id);

  if (existing) {
    const updated = await prisma.practiceArea.update({
      where: { id: existing.id },
      data: {
        slug: payload.slug,
        categorySlug: payload.categorySlug!,
        titleAr: payload.titleAr!,
        titleEn: payload.titleEn!,
        categoryAr: payload.categoryAr!,
        categoryEn: payload.categoryEn!,
        shortDescAr: payload.shortDescAr!,
        shortDescEn: payload.shortDescEn!,
        aboutAr: payload.aboutAr,
        aboutEn: payload.aboutEn,
        features: payload.features,
        processSteps: payload.processSteps,
        useCases: payload.useCases,
        faq: payload.faq,
        imageUrl: payload.imageUrl,
        published: Boolean(payload.published),
        order: Number(payload.order || 0),
      },
    });
    return practiceAreaToRecord(updated);
  }

  const created = await prisma.practiceArea.create({
    data: {
      slug: payload.slug!,
      categorySlug: payload.categorySlug!,
      titleAr: payload.titleAr!,
      titleEn: payload.titleEn!,
      categoryAr: payload.categoryAr!,
      categoryEn: payload.categoryEn!,
      shortDescAr: payload.shortDescAr!,
      shortDescEn: payload.shortDescEn!,
      aboutAr: payload.aboutAr,
      aboutEn: payload.aboutEn,
      features: payload.features,
      processSteps: payload.processSteps,
      useCases: payload.useCases,
      faq: payload.faq,
      imageUrl: payload.imageUrl,
      published: Boolean(payload.published),
      order: Number(payload.order || 0),
    },
  });
  return practiceAreaToRecord(created);
};

const saveSiteSettings = async (body: unknown) => {
  const input = body as Record<string, unknown>;
  const payload = {
    id: 'main',
    logoImageUrl: String(input.logoImageUrl || ''),
    logoImageAltAr: String(input.logoImageAltAr || ''),
    logoImageAltEn: String(input.logoImageAltEn || ''),
    footerLogoImageUrl: String(input.footerLogoImageUrl || ''),
    footerLogoImageAltAr: String(input.footerLogoImageAltAr || ''),
    footerLogoImageAltEn: String(input.footerLogoImageAltEn || ''),
    navbarCtaAr: String(input.navbarCtaAr || ''),
    navbarCtaEn: String(input.navbarCtaEn || ''),
    doctorShieldBadgeAr: String(input.doctorShieldBadgeAr || ''),
    doctorShieldBadgeEn: String(input.doctorShieldBadgeEn || ''),
    doctorShieldTitleAr: String(input.doctorShieldTitleAr || ''),
    doctorShieldTitleEn: String(input.doctorShieldTitleEn || ''),
    doctorShieldSubtitleAr: String(input.doctorShieldSubtitleAr || ''),
    doctorShieldSubtitleEn: String(input.doctorShieldSubtitleEn || ''),
    doctorShieldDescAr: String(input.doctorShieldDescAr || ''),
    doctorShieldDescEn: String(input.doctorShieldDescEn || ''),
    doctorShieldBullet1Ar: String(input.doctorShieldBullet1Ar || ''),
    doctorShieldBullet1En: String(input.doctorShieldBullet1En || ''),
    doctorShieldBullet2Ar: String(input.doctorShieldBullet2Ar || ''),
    doctorShieldBullet2En: String(input.doctorShieldBullet2En || ''),
    doctorShieldBullet3Ar: String(input.doctorShieldBullet3Ar || ''),
    doctorShieldBullet3En: String(input.doctorShieldBullet3En || ''),
    doctorShieldBullet4Ar: String(input.doctorShieldBullet4Ar || ''),
    doctorShieldBullet4En: String(input.doctorShieldBullet4En || ''),
    doctorShieldButtonAr: String(input.doctorShieldButtonAr || ''),
    doctorShieldButtonEn: String(input.doctorShieldButtonEn || ''),
    doctorShieldCircleTitleAr: String(input.doctorShieldCircleTitleAr || ''),
    doctorShieldCircleTitleEn: String(input.doctorShieldCircleTitleEn || ''),
    doctorShieldCirclePriceAr: String(input.doctorShieldCirclePriceAr || ''),
    doctorShieldCirclePriceEn: String(input.doctorShieldCirclePriceEn || ''),
    doctorShieldCircleNoteAr: String(input.doctorShieldCircleNoteAr || ''),
    doctorShieldCircleNoteEn: String(input.doctorShieldCircleNoteEn || ''),
    aboutSectionBadgeAr: String(input.aboutSectionBadgeAr || ''),
    aboutSectionBadgeEn: String(input.aboutSectionBadgeEn || ''),
    aboutSectionTitleAr: String(input.aboutSectionTitleAr || ''),
    aboutSectionTitleEn: String(input.aboutSectionTitleEn || ''),
    aboutSectionDescAr: String(input.aboutSectionDescAr || ''),
    aboutSectionDescEn: String(input.aboutSectionDescEn || ''),
    aboutSectionCardTitleAr: String(input.aboutSectionCardTitleAr || ''),
    aboutSectionCardTitleEn: String(input.aboutSectionCardTitleEn || ''),
    aboutSectionCardDescAr: String(input.aboutSectionCardDescAr || ''),
    aboutSectionCardDescEn: String(input.aboutSectionCardDescEn || ''),
    aboutSectionButtonAr: String(input.aboutSectionButtonAr || ''),
    aboutSectionButtonEn: String(input.aboutSectionButtonEn || ''),
    statisticsBadgeAr: String(input.statisticsBadgeAr || ''),
    statisticsBadgeEn: String(input.statisticsBadgeEn || ''),
    statisticsNumber: String(input.statisticsNumber || ''),
    statisticsTitleAr: String(input.statisticsTitleAr || ''),
    statisticsTitleEn: String(input.statisticsTitleEn || ''),
    statisticsDescAr: String(input.statisticsDescAr || ''),
    statisticsDescEn: String(input.statisticsDescEn || ''),
    statisticsSupportAr: String(input.statisticsSupportAr || ''),
    statisticsSupportEn: String(input.statisticsSupportEn || ''),
    teamSectionBadgeAr: String(input.teamSectionBadgeAr || ''),
    teamSectionBadgeEn: String(input.teamSectionBadgeEn || ''),
    teamSectionTitleAr: String(input.teamSectionTitleAr || ''),
    teamSectionTitleEn: String(input.teamSectionTitleEn || ''),
    teamSectionDescAr: String(input.teamSectionDescAr || ''),
    teamSectionDescEn: String(input.teamSectionDescEn || ''),
    teamFounderBadgeAr: String(input.teamFounderBadgeAr || ''),
    teamFounderBadgeEn: String(input.teamFounderBadgeEn || ''),
    teamFounderNameAr: String(input.teamFounderNameAr || ''),
    teamFounderNameEn: String(input.teamFounderNameEn || ''),
    teamFounderRoleAr: String(input.teamFounderRoleAr || ''),
    teamFounderRoleEn: String(input.teamFounderRoleEn || ''),
    teamFounderIntroAr: String(input.teamFounderIntroAr || ''),
    teamFounderIntroEn: String(input.teamFounderIntroEn || ''),
    teamFounderImageUrl: String(input.teamFounderImageUrl || ''),
    teamFounderImageAltAr: String(input.teamFounderImageAltAr || ''),
    teamFounderImageAltEn: String(input.teamFounderImageAltEn || ''),
    teamSectionCtaAr: String(input.teamSectionCtaAr || ''),
    teamSectionCtaEn: String(input.teamSectionCtaEn || ''),
    contactSectionBadgeAr: String(input.contactSectionBadgeAr || ''),
    contactSectionBadgeEn: String(input.contactSectionBadgeEn || ''),
    contactSectionTitleAr: String(input.contactSectionTitleAr || ''),
    contactSectionTitleEn: String(input.contactSectionTitleEn || ''),
    contactSectionDescAr: String(input.contactSectionDescAr || ''),
    contactSectionDescEn: String(input.contactSectionDescEn || ''),
    contactSectionOfficeTitleAr: String(input.contactSectionOfficeTitleAr || ''),
    contactSectionOfficeTitleEn: String(input.contactSectionOfficeTitleEn || ''),
    contactSectionAddressHeadAr: String(input.contactSectionAddressHeadAr || ''),
    contactSectionAddressHeadEn: String(input.contactSectionAddressHeadEn || ''),
    contactSectionPhoneLabelAr: String(input.contactSectionPhoneLabelAr || ''),
    contactSectionPhoneLabelEn: String(input.contactSectionPhoneLabelEn || ''),
    contactSectionEmailLabelAr: String(input.contactSectionEmailLabelAr || ''),
    contactSectionEmailLabelEn: String(input.contactSectionEmailLabelEn || ''),
    contactSectionSecurityAr: String(input.contactSectionSecurityAr || ''),
    contactSectionSecurityEn: String(input.contactSectionSecurityEn || ''),
    contactSectionFormTitleAr: String(input.contactSectionFormTitleAr || ''),
    contactSectionFormTitleEn: String(input.contactSectionFormTitleEn || ''),
    contactSectionFormDescAr: String(input.contactSectionFormDescAr || ''),
    contactSectionFormDescEn: String(input.contactSectionFormDescEn || ''),
    aboutHeroBadgeAr: String(input.aboutHeroBadgeAr || ''),
    aboutHeroBadgeEn: String(input.aboutHeroBadgeEn || ''),
    aboutHeroTitleAr: String(input.aboutHeroTitleAr || ''),
    aboutHeroTitleEn: String(input.aboutHeroTitleEn || ''),
    aboutHeroDescAr: String(input.aboutHeroDescAr || ''),
    aboutHeroDescEn: String(input.aboutHeroDescEn || ''),
    teamHeroBadgeAr: String(input.teamHeroBadgeAr || ''),
    teamHeroBadgeEn: String(input.teamHeroBadgeEn || ''),
    teamHeroTitleAr: String(input.teamHeroTitleAr || ''),
    teamHeroTitleEn: String(input.teamHeroTitleEn || ''),
    teamHeroDescAr: String(input.teamHeroDescAr || ''),
    teamHeroDescEn: String(input.teamHeroDescEn || ''),
    contactHeroBadgeAr: String(input.contactHeroBadgeAr || ''),
    contactHeroBadgeEn: String(input.contactHeroBadgeEn || ''),
    contactHeroTitleAr: String(input.contactHeroTitleAr || ''),
    contactHeroTitleEn: String(input.contactHeroTitleEn || ''),
    contactHeroDescAr: String(input.contactHeroDescAr || ''),
    contactHeroDescEn: String(input.contactHeroDescEn || ''),
    footerDescriptionAr: String(input.footerDescriptionAr || ''),
    footerDescriptionEn: String(input.footerDescriptionEn || ''),
    addressAr: String(input.addressAr || ''),
    addressEn: String(input.addressEn || ''),
    email: String(input.email || ''),
    phone: String(input.phone || ''),
    copyrightAr: String(input.copyrightAr || ''),
    copyrightEn: String(input.copyrightEn || ''),
    footerBadgeAr: String(input.footerBadgeAr || ''),
    footerBadgeEn: String(input.footerBadgeEn || ''),
  };

  const payloadWithTimestamp = {
    ...payload,
    updatedAt: new Date(),
  };

  const columns = Object.keys(payloadWithTimestamp);
  const columnFragments = columns.map((column) => Prisma.raw(`"${column}"`));
  const valueFragments = columns.map((column) => Prisma.sql`${payloadWithTimestamp[column as keyof typeof payloadWithTimestamp]}`);
  const updateFragments = columns
    .filter((column) => column !== 'id')
    .map((column) => Prisma.sql`${Prisma.raw(`"${column}"`)} = EXCLUDED.${Prisma.raw(`"${column}"`)}`);

  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "SiteSettings" (${Prisma.join(columnFragments)})
      VALUES (${Prisma.join(valueFragments)})
      ON CONFLICT ("id") DO UPDATE SET ${Prisma.join(updateFragments)}, "updatedAt" = CURRENT_TIMESTAMP
    `,
  );
};

const reseedDatabase = async () => {
  await prisma.adminSession.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.practiceArea.deleteMany({});
  await seedDatabase();
};

app.post(
  '/api/auth/login',
  asyncHandler(async (request, response) => {
    const { username, password } = request.body as { username?: string; password?: string };
    if (!username || !password) {
      response.status(400).json({ error: 'Username and password are required.' });
      return;
    }

    const login = await loginWithUsernamePassword(username, password);
    if (!login) {
      response.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    setAuthCookie(response, login.token);
    response.json({ ok: true });
  }),
);

app.post(
  '/api/auth/logout',
  asyncHandler(async (request, response) => {
    await logoutCurrentSession(request);
    clearAuthCookie(response);
    response.json({ ok: true });
  }),
);

app.get(
  '/api/auth/me',
  asyncHandler(async (request, response) => {
    const user = await currentSession(request);
    if (!user) {
      response.json({ authenticated: false });
      return;
    }

    response.json({ authenticated: true, username: user.username });
  }),
);

app.get(
  '/api/content',
  asyncHandler(async (_request, response) => {
    response.json(await toSiteContent());
  }),
);

app.get(
  '/api/hero-slides',
  asyncHandler(async (_request, response) => {
    response.json(await listHeroSlides());
  }),
);

app.get(
  '/api/articles',
  asyncHandler(async (_request, response) => {
    response.json(await listPublishedArticles());
  }),
);

app.get(
  '/api/articles/:slug',
  asyncHandler(async (request, response) => {
    const article = await loadArticleBySlug(request.params.slug);
    if (!article || !article.published) {
      response.status(404).json({ error: 'Article not found' });
      return;
    }

    response.json(articleToRecord(article));
  }),
);

app.get(
  '/api/practice-areas',
  asyncHandler(async (_request, response) => {
    response.json(await listPublishedPracticeAreas());
  }),
);

app.get(
  '/api/practice-areas/:slug',
  asyncHandler(async (request, response) => {
    const practiceArea = await loadPracticeAreaBySlug(request.params.slug);
    if (!practiceArea || !practiceArea.published) {
      response.status(404).json({ error: 'Practice area not found' });
      return;
    }

    response.json(practiceAreaToRecord(practiceArea));
  }),
);

app.get(
  '/api/pages',
  asyncHandler(async (_request, response) => {
    response.json(await listCmsPages());
  }),
);

app.get(
  '/api/pages/:slug',
  asyncHandler(async (request, response) => {
    const page = await loadCmsPageBySlug(request.params.slug);
    if (!page || page.status === 'hidden') {
      response.status(404).json({ error: 'Page not found' });
      return;
    }
    const revisions = await listCmsRevisions(page.id);
    const latestRevision = revisions[0];
    response.json({
      ...cmsPageToRecord(page),
      blocks: sanitizeCmsPageBlocks(request.params.slug, latestRevision?.blocks || []),
    });
  }),
);

app.get(
  '/api/admin/articles',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json(await listArticles());
  }),
);

app.post(
  '/api/admin/articles',
  requireAdmin,
  asyncHandler(async (request, response) => {
    await saveArticle(undefined, request.body);
    response.json(await toSiteContent());
  }),
);

app.put(
  '/api/admin/articles/:slug',
  requireAdmin,
  asyncHandler(async (request, response) => {
    await saveArticle(request.params.slug, request.body);
    response.json(await toSiteContent());
  }),
);

app.delete(
  '/api/admin/articles/:slug',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const article = await loadArticleBySlug(request.params.slug);
    if (!article) {
      response.status(404).json({ error: 'Article not found' });
      return;
    }

    await prisma.article.delete({ where: { id: article.id } });
    response.json(await toSiteContent());
  }),
);

app.get(
  '/api/admin/practice-areas',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json(await listPracticeAreas());
  }),
);

app.post(
  '/api/admin/practice-areas',
  requireAdmin,
  asyncHandler(async (request, response) => {
    await savePracticeArea(undefined, request.body);
    response.json(await toSiteContent());
  }),
);

app.put(
  '/api/admin/practice-areas/:slug',
  requireAdmin,
  asyncHandler(async (request, response) => {
    await savePracticeArea(request.params.slug, request.body);
    response.json(await toSiteContent());
  }),
);

app.delete(
  '/api/admin/practice-areas/:slug',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const practiceArea = await loadPracticeAreaBySlug(request.params.slug);
    if (!practiceArea) {
      response.status(404).json({ error: 'Practice area not found' });
      return;
    }

    await prisma.practiceArea.delete({ where: { id: practiceArea.id } });
    response.json(await toSiteContent());
  }),
);

app.get(
  '/api/admin/pages',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json(await listCmsPages());
  }),
);

app.post(
  '/api/admin/pages',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const created = await saveCmsPage(undefined, request.body);
    response.json(created);
  }),
);

app.put(
  '/api/admin/pages/:slug',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const updated = await saveCmsPage(request.params.slug, request.body);
    response.json(updated);
  }),
);

app.delete(
  '/api/admin/pages/:slug',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const deleted = await deleteCmsPage(request.params.slug);
    if (!deleted) {
      response.status(404).json({ error: 'Page not found' });
      return;
    }

    response.json({ ok: true });
  }),
);

app.get(
  '/api/admin/pages/:slug/revisions',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const page = await loadCmsPageBySlug(request.params.slug);
    if (!page) {
      response.status(404).json({ error: 'Page not found' });
      return;
    }

    const revisions = await listCmsRevisions(page.id);
    response.json(
      revisions.map((revision) => ({
        ...revision,
        blocks: sanitizeCmsPageBlocks(request.params.slug, revision.blocks || []),
      }))
    );
  }),
);

app.post(
  '/api/admin/pages/:slug/revisions',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const page = await loadCmsPageBySlug(request.params.slug);
    if (!page) {
      response.status(404).json({ error: 'Page not found' });
      return;
    }

    response.json(await saveCmsRevision(page.id, request.body));
  }),
);

app.post(
  '/api/admin/pages/:slug/revisions/:revId/restore',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const page = await loadCmsPageBySlug(request.params.slug);
    if (!page) {
      response.status(404).json({ error: 'Page not found' });
      return;
    }

    response.json(await restoreCmsRevision(page.id, request.params.revId));
  }),
);

app.get(
  '/api/admin/navigation',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json(await listNavigationItems());
  }),
);

app.put(
  '/api/admin/navigation',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const payload = request.body as { items?: unknown };
    const items = Array.isArray(payload.items) ? (payload.items as Parameters<typeof saveNavigationItems>[0]) : [];
    response.json(await saveNavigationItems(items));
  }),
);

app.get(
  '/api/admin/assets',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json(await listMediaAssets());
  }),
);

app.put(
  '/api/admin/assets/:id',
  requireAdmin,
  asyncHandler(async (request, response) => {
    response.json(await updateMediaAsset(request.params.id, request.body));
  }),
);

app.delete(
  '/api/admin/assets/:id',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const deleted = await deleteMediaAsset(request.params.id);
    if (!deleted) {
      response.status(404).json({ error: 'Asset not found' });
      return;
    }

    response.json({ ok: true });
  }),
);

app.post(
  '/api/admin/uploads',
  requireAdmin,
  upload.single('file'),
  asyncHandler(async (request, response) => {
    if (!request.file) {
      response.status(400).json({ error: 'File is required.' });
      return;
    }

    const asset = await uploadBufferToS3({
      buffer: request.file.buffer,
      originalName: request.file.originalname,
      mimeType: request.file.mimetype,
      size: request.file.size,
      altAr: typeof request.body.altAr === 'string' ? request.body.altAr : undefined,
      altEn: typeof request.body.altEn === 'string' ? request.body.altEn : undefined,
    });

    response.json({ asset });
  }),
);

app.post(
  '/api/admin/seed',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    await reseedDatabase();
    response.json(await toSiteContent());
  }),
);

app.get(
  '/api/admin/hero-slides',
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json(await listHeroSlides());
  }),
);

app.put(
  '/api/admin/hero-slides',
  requireAdmin,
  asyncHandler(async (request, response) => {
    const payload = request.body as { heroSlides?: unknown };
    const heroSlides = Array.isArray(payload.heroSlides) ? payload.heroSlides : [];

    if (heroSlides.length === 0) {
      response.status(400).json({ error: 'At least one hero slide is required.' });
      return;
    }

    const normalizedSlides = heroSlides.map((rawSlide, index) => {
      const slide = rawSlide as Record<string, unknown>;
      if (typeof slide.id !== 'string' || !slide.id.trim()) {
        throw new Error('Hero slide id is required.');
      }

      return {
        id: slide.id,
        badgeAr: String(slide.badgeAr || ''),
        badgeEn: String(slide.badgeEn || ''),
        badgeIcon: String(slide.badgeIcon || ''),
        titleArLine1: String(slide.titleArLine1 || ''),
        titleEnLine1: String(slide.titleEnLine1 || ''),
        titleArLine2: String(slide.titleArLine2 || ''),
        titleEnLine2: String(slide.titleEnLine2 || ''),
        descriptionAr: String(slide.descriptionAr || ''),
        descriptionEn: String(slide.descriptionEn || ''),
        ctaTextAr: String(slide.ctaTextAr || ''),
        ctaTextEn: String(slide.ctaTextEn || ''),
        actionType: String(slide.actionType || 'contact'),
        actionParam: typeof slide.actionParam === 'string' && slide.actionParam.trim() ? slide.actionParam.trim() : null,
        image: String(slide.image || ''),
        imageAltAr: String(slide.imageAltAr || ''),
        imageAltEn: String(slide.imageAltEn || ''),
        highlightBox: slide.highlightBox ?? null,
        order: index + 1,
      };
    });

    await prisma.heroSlide.deleteMany({});
    await prisma.heroSlide.createMany({ data: normalizedSlides });

    response.json(await toSiteContent());
  }),
);

app.put(
  '/api/admin/site-settings',
  requireAdmin,
  asyncHandler(async (request, response) => {
    await saveSiteSettings(request.body);
    response.json(await toSiteContent());
  }),
);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  sendError(response, error);
});

const createDevServer = async (): Promise<ViteDevServer> =>
  createViteServer({
    configFile: path.resolve(process.cwd(), 'vite.config.ts'),
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
  });

const listenOnAvailablePort = async (startingPort: number, retries = 10): Promise<number> => {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const port = startingPort + attempt;
    try {
      await new Promise<void>((resolve, reject) => {
        const server = app.listen(port);
        server.once('listening', () => resolve());
        server.once('error', (error: NodeJS.ErrnoException) => {
          server.close();
          reject(error);
        });
      });
      return port;
    } catch (error) {
      if (!(error instanceof Error) || (error as NodeJS.ErrnoException).code !== 'EADDRINUSE' || attempt === retries) {
        throw error;
      }
    }
  }

  return startingPort;
};

const start = async () => {
  await ensureDatabaseSchema();
  await ensureAdminUser();
  await seedDatabase();

  if (config.isDev) {
    const vite = await createDevServer();
    app.use(vite.middlewares);

    app.use('*', asyncHandler(async (request, response) => {
      const templatePath = path.resolve(process.cwd(), 'index.html');
      const template = await fs.readFile(templatePath, 'utf8');
      const html = await vite.transformIndexHtml(request.originalUrl, template);
      response.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    }));
  } else {
    app.use(express.static(distPath));
    app.use('*', asyncHandler(async (_request, response) => {
      const indexPath = path.join(distPath, 'index.html');
      response.status(200).send(await fs.readFile(indexPath, 'utf8'));
    }));
  }

  const port = await listenOnAvailablePort(config.port);
  console.log(`Backend listening on http://localhost:${port}`);
};

void start();
