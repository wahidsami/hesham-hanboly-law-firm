import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createSeedContent } from './defaultContent';
import type { ArticleRecord, HeroSlideRecord, NavItemRecord, PracticeAreaRecord, SiteContent } from '../types';

const DATABASE_PATH = path.resolve(process.cwd(), 'content-db.json');
const seedSiteSettings = createSeedContent().siteSettings;

const sortByOrder = <T extends { order: number }>(items: T[]) =>
  [...items].sort((left, right) => left.order - right.order);

const normalizeContent = (content: SiteContent): SiteContent => ({
  heroSlides: sortByOrder(content.heroSlides),
  articles: sortByOrder(content.articles),
  practiceAreas: sortByOrder(content.practiceAreas),
  navigation: sortByOrder(content.navigation || []),
  siteSettings: content.siteSettings || seedSiteSettings,
});

const ensureUniqueOrders = <T extends { order: number }>(items: T[]) =>
  items
    .map((item, index) => ({
      ...item,
      order: Number.isFinite(item.order) ? item.order : index + 1,
    }))
    .sort((left, right) => left.order - right.order)
    .map((item, index) => ({
      ...item,
      order: index + 1,
    }));

export async function readDatabase(): Promise<SiteContent> {
  try {
    const raw = await readFile(DATABASE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as SiteContent;
    return normalizeContent({
      heroSlides: ensureUniqueOrders(parsed.heroSlides || []),
      articles: ensureUniqueOrders(parsed.articles || []),
      practiceAreas: ensureUniqueOrders(parsed.practiceAreas || []),
      navigation: ensureUniqueOrders((parsed.navigation || []) as NavItemRecord[]),
      siteSettings: parsed.siteSettings || seedSiteSettings,
    });
  } catch {
    const seed = normalizeContent(createSeedContent());
    await writeDatabase(seed);
    return seed;
  }
}

export async function writeDatabase(content: SiteContent): Promise<void> {
  await mkdir(path.dirname(DATABASE_PATH), { recursive: true });
  const normalized = normalizeContent({
    heroSlides: ensureUniqueOrders(content.heroSlides),
    articles: ensureUniqueOrders(content.articles),
    practiceAreas: ensureUniqueOrders(content.practiceAreas),
    navigation: ensureUniqueOrders(content.navigation || []),
    siteSettings: content.siteSettings || seedSiteSettings,
  });
  await writeFile(DATABASE_PATH, JSON.stringify(normalized, null, 2), 'utf8');
}

export async function upsertHeroSlide(heroSlide: HeroSlideRecord): Promise<SiteContent> {
  const content = await readDatabase();
  const nextHeroSlides = content.heroSlides.filter((item) => item.id !== heroSlide.id);
  nextHeroSlides.push(heroSlide);
  const next = { ...content, heroSlides: ensureUniqueOrders(nextHeroSlides) };
  await writeDatabase(next);
  return next;
}

export async function upsertArticle(article: ArticleRecord): Promise<SiteContent> {
  const content = await readDatabase();
  const nextArticles = content.articles.filter((item) => item.id !== article.id && item.slug !== article.slug);
  nextArticles.push(article);
  const next = { ...content, articles: ensureUniqueOrders(nextArticles) };
  await writeDatabase(next);
  return next;
}

export async function deleteArticle(slug: string): Promise<SiteContent> {
  const content = await readDatabase();
  const next = {
    ...content,
    articles: content.articles.filter((item) => item.slug !== slug && item.id !== slug),
  };
  await writeDatabase(next);
  return next;
}

export async function upsertPracticeArea(practiceArea: PracticeAreaRecord): Promise<SiteContent> {
  const content = await readDatabase();
  const nextPracticeAreas = content.practiceAreas.filter(
    (item) => item.id !== practiceArea.id && item.slug !== practiceArea.slug,
  );
  nextPracticeAreas.push(practiceArea);
  const next = { ...content, practiceAreas: ensureUniqueOrders(nextPracticeAreas) };
  await writeDatabase(next);
  return next;
}

export async function deletePracticeArea(slug: string): Promise<SiteContent> {
  const content = await readDatabase();
  const next = {
    ...content,
    practiceAreas: content.practiceAreas.filter((item) => item.slug !== slug && item.id !== slug),
  };
  await writeDatabase(next);
  return next;
}

export const getArticleBySlug = async (slug: string) => {
  const content = await readDatabase();
  return content.articles.find((article) => article.slug === slug || article.id === slug);
};

export const getPracticeAreaBySlug = async (slug: string) => {
  const content = await readDatabase();
  return content.practiceAreas.find((practiceArea) => practiceArea.slug === slug || practiceArea.id === slug);
};
