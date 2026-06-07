import React, { useEffect, useMemo, useState } from 'react';
import { contentClient } from '../content/contentClient';
import { useSiteContent } from '../content/ContentContext';
import { slugify } from '../content/utils';
import type {
  ArticleRecord,
  HeroSlideRecord,
  PracticeAreaFeature,
  PracticeAreaFaq,
  PracticeAreaRecord,
  PracticeAreaStep,
  LocalizedText,
  SiteSettingsRecord,
} from '../types';
import MarkdownRenderer from './MarkdownRenderer';

type AdminTab = 'homepage' | 'articles' | 'practice-areas';
type HomepagePanel =
  | 'overview'
  | 'hero'
  | 'about'
  | 'services'
  | 'doctor-shield'
  | 'statistics'
  | 'team'
  | 'contact'
  | 'site-settings'
  | 'about-hero'
  | 'team-hero'
  | 'contact-hero';

const emptyHeroSlide = (): HeroSlideRecord => ({
  id: 'about-company',
  badgeAr: '',
  badgeEn: '',
  badgeIcon: 'Scale',
  titleArLine1: '',
  titleEnLine1: '',
  titleArLine2: '',
  titleEnLine2: '',
  descriptionAr: '',
  descriptionEn: '',
  ctaTextAr: '',
  ctaTextEn: '',
  actionType: 'contact',
  actionParam: '',
  image: '',
  imageAltAr: '',
  imageAltEn: '',
  highlightBox: undefined,
});

const emptyArticle = (): ArticleRecord => ({
  id: '',
  slug: '',
  titleAr: '',
  titleEn: '',
  excerptAr: '',
  excerptEn: '',
  categoryAr: '',
  categoryEn: '',
  authorAr: '',
  authorEn: '',
  date: new Date().toISOString().slice(0, 10),
  readTimeAr: 'قراءة ٥ دقائق',
  readTimeEn: '5 min read',
  image: '/src/assets/images/luxury_legal_office_1780491575816.png',
  bodyAr: '',
  bodyEn: '',
  published: false,
  order: 1,
});

const emptyPracticeArea = (): PracticeAreaRecord => ({
  id: '',
  slug: '',
  categorySlug: 'advisory',
  titleAr: '',
  titleEn: '',
  categoryAr: '',
  categoryEn: '',
  shortDescAr: '',
  shortDescEn: '',
  imageUrl: '',
  aboutAr: [''],
  aboutEn: [''],
  features: [],
  processSteps: [],
  useCases: [],
  faq: [],
  published: true,
  order: 1,
});

const safeParse = <T,>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const toTextAreaValue = (value: unknown) => JSON.stringify(value, null, 2);

const ensureFilled = (value: string, label: string) => {
  if (!value.trim()) {
    throw new Error(`${label} is required in both languages.`);
  }
};

const ensureJsonArray = <T,>(value: string, label: string): T[] => {
  const parsed = safeParse<T[]>(value, []);
  if (!Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON array.`);
  }
  return parsed;
};

const validateArticlePayload = (article: ArticleRecord) => {
  ensureFilled(article.titleAr, 'Article title (Arabic)');
  ensureFilled(article.titleEn, 'Article title (English)');

  if (article.published) {
    ensureFilled(article.excerptAr, 'Article excerpt (Arabic)');
    ensureFilled(article.excerptEn, 'Article excerpt (English)');
    ensureFilled(article.categoryAr, 'Article category (Arabic)');
    ensureFilled(article.categoryEn, 'Article category (English)');
    ensureFilled(article.authorAr, 'Article author (Arabic)');
    ensureFilled(article.authorEn, 'Article author (English)');
    ensureFilled(article.readTimeAr, 'Article read time (Arabic)');
    ensureFilled(article.readTimeEn, 'Article read time (English)');
    ensureFilled(article.bodyAr, 'Article body (Arabic)');
    ensureFilled(article.bodyEn, 'Article body (English)');
    ensureFilled(article.image, 'Article image URL');
  }
};

const validatePracticeAreaPayload = (
  practiceArea: PracticeAreaRecord,
  aboutArJson: string,
  aboutEnJson: string,
  featuresJson: string,
  processStepsJson: string,
  useCasesJson: string,
  faqJson: string,
) => {
  ensureFilled(practiceArea.titleAr, 'Practice area title (Arabic)');
  ensureFilled(practiceArea.titleEn, 'Practice area title (English)');
  ensureFilled(practiceArea.categoryAr, 'Practice area category (Arabic)');
  ensureFilled(practiceArea.categoryEn, 'Practice area category (English)');
  ensureFilled(practiceArea.shortDescAr, 'Practice area short description (Arabic)');
  ensureFilled(practiceArea.shortDescEn, 'Practice area short description (English)');

  const aboutAr = ensureJsonArray<string>(aboutArJson, 'aboutAr');
  const aboutEn = ensureJsonArray<string>(aboutEnJson, 'aboutEn');
  if (aboutAr.length !== aboutEn.length) {
    throw new Error('aboutAr and aboutEn must have the same number of paragraphs.');
  }
  aboutAr.forEach((value, index) => ensureFilled(value, `aboutAr[${index}]`));
  aboutEn.forEach((value, index) => ensureFilled(value, `aboutEn[${index}]`));

  const features = ensureJsonArray<PracticeAreaFeature>(featuresJson, 'features');
  const processSteps = ensureJsonArray<PracticeAreaStep>(processStepsJson, 'processSteps');
  const useCases = ensureJsonArray<LocalizedText>(useCasesJson, 'useCases');
  const faq = ensureJsonArray<PracticeAreaFaq>(faqJson, 'faq');

  features.forEach((item, index) => {
    ensureFilled(item.ar, `features[${index}].ar`);
    ensureFilled(item.en, `features[${index}].en`);
    ensureFilled(item.descAr, `features[${index}].descAr`);
    ensureFilled(item.descEn, `features[${index}].descEn`);
  });
  processSteps.forEach((item, index) => {
    ensureFilled(item.ar, `processSteps[${index}].ar`);
    ensureFilled(item.en, `processSteps[${index}].en`);
    ensureFilled(item.descAr, `processSteps[${index}].descAr`);
    ensureFilled(item.descEn, `processSteps[${index}].descEn`);
  });
  useCases.forEach((item, index) => {
    ensureFilled(item.ar, `useCases[${index}].ar`);
    ensureFilled(item.en, `useCases[${index}].en`);
  });
  faq.forEach((item, index) => {
    ensureFilled(item.qAr, `faq[${index}].qAr`);
    ensureFilled(item.qEn, `faq[${index}].qEn`);
    ensureFilled(item.aAr, `faq[${index}].aAr`);
    ensureFilled(item.aEn, `faq[${index}].aEn`);
  });
};

const getArticleChecklist = (article: ArticleRecord) => {
  const items = [
    { label: 'Arabic title', ready: Boolean(article.titleAr.trim()) },
    { label: 'English title', ready: Boolean(article.titleEn.trim()) },
    { label: 'Arabic excerpt', ready: Boolean(article.excerptAr.trim()) },
    { label: 'English excerpt', ready: Boolean(article.excerptEn.trim()) },
    { label: 'Arabic body', ready: Boolean(article.bodyAr.trim()) },
    { label: 'English body', ready: Boolean(article.bodyEn.trim()) },
    { label: 'Image', ready: Boolean(article.image.trim()) },
    { label: 'Arabic author', ready: Boolean(article.authorAr.trim()) },
    { label: 'English author', ready: Boolean(article.authorEn.trim()) },
  ];

  return items;
};

const getPracticeAreaChecklist = (
  practiceArea: PracticeAreaRecord,
  aboutArText: string,
  aboutEnText: string,
  featuresText: string,
  processStepsText: string,
  useCasesText: string,
  faqText: string,
) => {
  const items = [
    { label: 'Arabic title', ready: Boolean(practiceArea.titleAr.trim()) },
    { label: 'English title', ready: Boolean(practiceArea.titleEn.trim()) },
    { label: 'Arabic category', ready: Boolean(practiceArea.categoryAr.trim()) },
    { label: 'English category', ready: Boolean(practiceArea.categoryEn.trim()) },
    { label: 'Arabic short description', ready: Boolean(practiceArea.shortDescAr.trim()) },
    { label: 'English short description', ready: Boolean(practiceArea.shortDescEn.trim()) },
    { label: 'About paragraphs', ready: aboutArText.trim() !== '[]' && aboutEnText.trim() !== '[]' },
    { label: 'Features', ready: featuresText.trim() !== '[]' },
    { label: 'Process steps', ready: processStepsText.trim() !== '[]' },
    { label: 'Use cases', ready: useCasesText.trim() !== '[]' },
    { label: 'FAQ', ready: faqText.trim() !== '[]' },
  ];

  return items;
};

type ListButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active: boolean;
};

const ListButton = ({ active, className, ...rest }: ListButtonProps) => (
  <button
    {...rest}
    className={`w-full rounded-xl border px-4 py-3 text-start transition-all ${
      active ? 'border-[#A56A1E] bg-[#A56A1E]/10' : 'border-[#D8D1C7] bg-white hover:border-[#A56A1E]/40'
    } ${className || ''}`}
  />
);

export default function AdminDashboard() {
  const { content, refresh } = useSiteContent();
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('homepage');
  const [homepagePanel, setHomepagePanel] = useState<HomepagePanel>('overview');
  const [selectedHeroSlideId, setSelectedHeroSlideId] = useState<string | null>(null);
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [selectedPracticeSlug, setSelectedPracticeSlug] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [heroSlidesForm, setHeroSlidesForm] = useState<HeroSlideRecord[]>([]);
  const [siteSettingsForm, setSiteSettingsForm] = useState<SiteSettingsRecord>({
    id: 'main',
    navbarCtaAr: '',
    navbarCtaEn: '',
    doctorShieldBadgeAr: '',
    doctorShieldBadgeEn: '',
    doctorShieldTitleAr: '',
    doctorShieldTitleEn: '',
    doctorShieldSubtitleAr: '',
    doctorShieldSubtitleEn: '',
    doctorShieldDescAr: '',
    doctorShieldDescEn: '',
    doctorShieldBullet1Ar: '',
    doctorShieldBullet1En: '',
    doctorShieldBullet2Ar: '',
    doctorShieldBullet2En: '',
    doctorShieldBullet3Ar: '',
    doctorShieldBullet3En: '',
    doctorShieldBullet4Ar: '',
    doctorShieldBullet4En: '',
    doctorShieldButtonAr: '',
    doctorShieldButtonEn: '',
    doctorShieldCircleTitleAr: '',
    doctorShieldCircleTitleEn: '',
    doctorShieldCirclePriceAr: '',
    doctorShieldCirclePriceEn: '',
    doctorShieldCircleNoteAr: '',
    doctorShieldCircleNoteEn: '',
    aboutSectionBadgeAr: '',
    aboutSectionBadgeEn: '',
    aboutSectionTitleAr: '',
    aboutSectionTitleEn: '',
    aboutSectionDescAr: '',
    aboutSectionDescEn: '',
    aboutSectionCardTitleAr: '',
    aboutSectionCardTitleEn: '',
    aboutSectionCardDescAr: '',
    aboutSectionCardDescEn: '',
    aboutSectionButtonAr: '',
    aboutSectionButtonEn: '',
    statisticsBadgeAr: '',
    statisticsBadgeEn: '',
    statisticsNumber: '',
    statisticsTitleAr: '',
    statisticsTitleEn: '',
    statisticsDescAr: '',
    statisticsDescEn: '',
    statisticsSupportAr: '',
    statisticsSupportEn: '',
    teamSectionBadgeAr: '',
    teamSectionBadgeEn: '',
    teamSectionTitleAr: '',
    teamSectionTitleEn: '',
    teamSectionDescAr: '',
    teamSectionDescEn: '',
    teamFounderBadgeAr: '',
    teamFounderBadgeEn: '',
    teamFounderNameAr: '',
    teamFounderNameEn: '',
    teamFounderRoleAr: '',
    teamFounderRoleEn: '',
    teamFounderIntroAr: '',
    teamFounderIntroEn: '',
    teamSectionCtaAr: '',
    teamSectionCtaEn: '',
    contactSectionBadgeAr: '',
    contactSectionBadgeEn: '',
    contactSectionTitleAr: '',
    contactSectionTitleEn: '',
    contactSectionDescAr: '',
    contactSectionDescEn: '',
    contactSectionOfficeTitleAr: '',
    contactSectionOfficeTitleEn: '',
    contactSectionAddressHeadAr: '',
    contactSectionAddressHeadEn: '',
    contactSectionPhoneLabelAr: '',
    contactSectionPhoneLabelEn: '',
    contactSectionEmailLabelAr: '',
    contactSectionEmailLabelEn: '',
    contactSectionSecurityAr: '',
    contactSectionSecurityEn: '',
    contactSectionFormTitleAr: '',
    contactSectionFormTitleEn: '',
    contactSectionFormDescAr: '',
    contactSectionFormDescEn: '',
    aboutHeroBadgeAr: '',
    aboutHeroBadgeEn: '',
    aboutHeroTitleAr: '',
    aboutHeroTitleEn: '',
    aboutHeroDescAr: '',
    aboutHeroDescEn: '',
    teamHeroBadgeAr: '',
    teamHeroBadgeEn: '',
    teamHeroTitleAr: '',
    teamHeroTitleEn: '',
    teamHeroDescAr: '',
    teamHeroDescEn: '',
    contactHeroBadgeAr: '',
    contactHeroBadgeEn: '',
    contactHeroTitleAr: '',
    contactHeroTitleEn: '',
    contactHeroDescAr: '',
    contactHeroDescEn: '',
    footerDescriptionAr: '',
    footerDescriptionEn: '',
    addressAr: '',
    addressEn: '',
    email: '',
    phone: '',
    copyrightAr: '',
    copyrightEn: '',
    footerBadgeAr: '',
    footerBadgeEn: '',
  });
  const [articleForm, setArticleForm] = useState<ArticleRecord>(emptyArticle());
  const [practiceForm, setPracticeForm] = useState<PracticeAreaRecord>(emptyPracticeArea());
  const [practiceAboutAr, setPracticeAboutAr] = useState(JSON.stringify([''], null, 2));
  const [practiceAboutEn, setPracticeAboutEn] = useState(JSON.stringify([''], null, 2));
  const [practiceFeatures, setPracticeFeatures] = useState('[]');
  const [practiceProcessSteps, setPracticeProcessSteps] = useState('[]');
  const [practiceUseCases, setPracticeUseCases] = useState('[]');
  const [practiceFaq, setPracticeFaq] = useState('[]');
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [articleImageFile, setArticleImageFile] = useState<File | null>(null);
  const [practiceImageFile, setPracticeImageFile] = useState<File | null>(null);
  const [articleAltAr, setArticleAltAr] = useState('');
  const [articleAltEn, setArticleAltEn] = useState('');
  const [practiceAltAr, setPracticeAltAr] = useState('');
  const [practiceAltEn, setPracticeAltEn] = useState('');
  const [uploadingAsset, setUploadingAsset] = useState(false);

  const articles = content?.articles || [];
  const practiceAreas = content?.practiceAreas || [];

  useEffect(() => {
    void contentClient
      .me()
      .then((session) => {
        setAuthenticated(session.authenticated);
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (selectedArticleSlug && !articles.some((article) => article.slug === selectedArticleSlug)) {
      setSelectedArticleSlug(null);
    }
  }, [articles, selectedArticleSlug]);

  useEffect(() => {
    if (selectedPracticeSlug && !practiceAreas.some((practiceArea) => practiceArea.slug === selectedPracticeSlug)) {
      setSelectedPracticeSlug(null);
    }
  }, [practiceAreas, selectedPracticeSlug]);

  const selectedArticle = useMemo(
    () => articles.find((article) => article.slug === selectedArticleSlug) || null,
    [articles, selectedArticleSlug],
  );

  const selectedPracticeArea = useMemo(
    () => practiceAreas.find((practiceArea) => practiceArea.slug === selectedPracticeSlug) || null,
    [practiceAreas, selectedPracticeSlug],
  );

  const selectedHeroSlide = useMemo(
    () => heroSlidesForm.find((slide) => slide.id === selectedHeroSlideId) || heroSlidesForm[0] || null,
    [heroSlidesForm, selectedHeroSlideId],
  );

  const articleChecklist = useMemo(() => getArticleChecklist(articleForm), [articleForm]);
  const completedArticleFields = articleChecklist.filter((item) => item.ready).length;
  const articleCompletionPercent = Math.round((completedArticleFields / articleChecklist.length) * 100);
  const practiceChecklist = useMemo(
    () =>
      getPracticeAreaChecklist(
        practiceForm,
        practiceAboutAr,
        practiceAboutEn,
        practiceFeatures,
        practiceProcessSteps,
        practiceUseCases,
        practiceFaq,
      ),
    [practiceForm, practiceAboutAr, practiceAboutEn, practiceFeatures, practiceProcessSteps, practiceUseCases, practiceFaq],
  );
  const completedPracticeFields = practiceChecklist.filter((item) => item.ready).length;
  const practiceCompletionPercent = Math.round((completedPracticeFields / practiceChecklist.length) * 100);
  const homepagePanelLabel: Record<HomepagePanel, string> = {
    overview: 'Overview',
    hero: 'Hero carousel',
    about: 'About section',
    services: 'Practice areas',
    'doctor-shield': 'Doctor Shield ad',
    statistics: 'Statistics',
    team: 'Team section',
    contact: 'Contact section',
    'site-settings': 'Header & footer',
    'about-hero': 'About page hero',
    'team-hero': 'Team page hero',
    'contact-hero': 'Contact page hero',
  };

  useEffect(() => {
    if (content?.heroSlides?.length) {
      setHeroSlidesForm(content.heroSlides);
      setSelectedHeroSlideId((current) => current || content.heroSlides[0].id);
    }
  }, [content?.heroSlides]);

  useEffect(() => {
    if (content?.siteSettings) {
      setSiteSettingsForm(content.siteSettings);
    }
  }, [content?.siteSettings]);

  useEffect(() => {
    if (selectedArticle) {
      setArticleForm(selectedArticle);
      setArticleAltAr(selectedArticle.titleAr);
      setArticleAltEn(selectedArticle.titleEn);
      setArticleImageFile(null);
    }
  }, [selectedArticle]);

  useEffect(() => {
    if (selectedPracticeArea) {
      setPracticeForm(selectedPracticeArea);
      setPracticeAltAr(selectedPracticeArea.titleAr);
      setPracticeAltEn(selectedPracticeArea.titleEn);
      setPracticeImageFile(null);
      setPracticeAboutAr(toTextAreaValue(selectedPracticeArea.aboutAr));
      setPracticeAboutEn(toTextAreaValue(selectedPracticeArea.aboutEn));
      setPracticeFeatures(toTextAreaValue(selectedPracticeArea.features));
      setPracticeProcessSteps(toTextAreaValue(selectedPracticeArea.processSteps));
      setPracticeUseCases(toTextAreaValue(selectedPracticeArea.useCases));
      setPracticeFaq(toTextAreaValue(selectedPracticeArea.faq));
    }
  }, [selectedPracticeArea]);

  useEffect(() => {
    if (selectedHeroSlide) {
      setHeroImageFile(null);
    }
  }, [selectedHeroSlide]);

  const login = async () => {
    setLoginError(null);
    try {
      await contentClient.login(username, password);
      setAuthenticated(true);
      setStatusMessage('Logged in successfully.');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const logout = async () => {
    await contentClient.logout();
    setAuthenticated(false);
  };

  const saveHeroSlides = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      if (!heroSlidesForm.length) {
        throw new Error('At least one hero slide is required.');
      }

      heroSlidesForm.forEach((slide) => {
        ensureFilled(slide.badgeAr, `${slide.id} badge (Arabic)`);
        ensureFilled(slide.badgeEn, `${slide.id} badge (English)`);
        ensureFilled(slide.titleArLine1, `${slide.id} title line 1 (Arabic)`);
        ensureFilled(slide.titleEnLine1, `${slide.id} title line 1 (English)`);
        ensureFilled(slide.titleArLine2, `${slide.id} title line 2 (Arabic)`);
        ensureFilled(slide.titleEnLine2, `${slide.id} title line 2 (English)`);
        ensureFilled(slide.descriptionAr, `${slide.id} description (Arabic)`);
        ensureFilled(slide.descriptionEn, `${slide.id} description (English)`);
        ensureFilled(slide.ctaTextAr, `${slide.id} CTA (Arabic)`);
        ensureFilled(slide.ctaTextEn, `${slide.id} CTA (English)`);
        ensureFilled(slide.image, `${slide.id} image`);
        ensureFilled(slide.imageAltAr, `${slide.id} image alt (Arabic)`);
        ensureFilled(slide.imageAltEn, `${slide.id} image alt (English)`);
      });

      await contentClient.saveHeroSlides(
        heroSlidesForm.map((slide, index) => ({
          ...slide,
          order: index + 1,
          actionParam: slide.actionParam || '',
        })),
      );
      await refresh();
      setStatusMessage('Homepage hero slides saved successfully.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to save homepage slides');
    } finally {
      setSaving(false);
    }
  };

  const saveSiteSettings = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      ensureFilled(siteSettingsForm.navbarCtaAr, 'Navbar CTA (Arabic)');
      ensureFilled(siteSettingsForm.navbarCtaEn, 'Navbar CTA (English)');
      ensureFilled(siteSettingsForm.doctorShieldBadgeAr, 'Doctor Shield badge (Arabic)');
      ensureFilled(siteSettingsForm.doctorShieldBadgeEn, 'Doctor Shield badge (English)');
      ensureFilled(siteSettingsForm.doctorShieldTitleAr, 'Doctor Shield title (Arabic)');
      ensureFilled(siteSettingsForm.doctorShieldTitleEn, 'Doctor Shield title (English)');
      ensureFilled(siteSettingsForm.doctorShieldSubtitleAr, 'Doctor Shield subtitle (Arabic)');
      ensureFilled(siteSettingsForm.doctorShieldSubtitleEn, 'Doctor Shield subtitle (English)');
      ensureFilled(siteSettingsForm.doctorShieldDescAr, 'Doctor Shield description (Arabic)');
      ensureFilled(siteSettingsForm.doctorShieldDescEn, 'Doctor Shield description (English)');
      ensureFilled(siteSettingsForm.doctorShieldBullet1Ar, 'Doctor Shield bullet 1 (Arabic)');
      ensureFilled(siteSettingsForm.doctorShieldBullet1En, 'Doctor Shield bullet 1 (English)');
      ensureFilled(siteSettingsForm.doctorShieldBullet2Ar, 'Doctor Shield bullet 2 (Arabic)');
      ensureFilled(siteSettingsForm.doctorShieldBullet2En, 'Doctor Shield bullet 2 (English)');
      ensureFilled(siteSettingsForm.doctorShieldBullet3Ar, 'Doctor Shield bullet 3 (Arabic)');
      ensureFilled(siteSettingsForm.doctorShieldBullet3En, 'Doctor Shield bullet 3 (English)');
      ensureFilled(siteSettingsForm.doctorShieldBullet4Ar, 'Doctor Shield bullet 4 (Arabic)');
      ensureFilled(siteSettingsForm.doctorShieldBullet4En, 'Doctor Shield bullet 4 (English)');
      ensureFilled(siteSettingsForm.doctorShieldButtonAr, 'Doctor Shield button (Arabic)');
      ensureFilled(siteSettingsForm.doctorShieldButtonEn, 'Doctor Shield button (English)');
      ensureFilled(siteSettingsForm.doctorShieldCircleTitleAr, 'Doctor Shield circle title (Arabic)');
      ensureFilled(siteSettingsForm.doctorShieldCircleTitleEn, 'Doctor Shield circle title (English)');
      ensureFilled(siteSettingsForm.doctorShieldCirclePriceAr, 'Doctor Shield circle price (Arabic)');
      ensureFilled(siteSettingsForm.doctorShieldCirclePriceEn, 'Doctor Shield circle price (English)');
      ensureFilled(siteSettingsForm.doctorShieldCircleNoteAr, 'Doctor Shield circle note (Arabic)');
      ensureFilled(siteSettingsForm.doctorShieldCircleNoteEn, 'Doctor Shield circle note (English)');
      ensureFilled(siteSettingsForm.aboutHeroBadgeAr, 'About badge (Arabic)');
      ensureFilled(siteSettingsForm.aboutHeroBadgeEn, 'About badge (English)');
      ensureFilled(siteSettingsForm.aboutHeroTitleAr, 'About title (Arabic)');
      ensureFilled(siteSettingsForm.aboutHeroTitleEn, 'About title (English)');
      ensureFilled(siteSettingsForm.aboutHeroDescAr, 'About description (Arabic)');
      ensureFilled(siteSettingsForm.aboutHeroDescEn, 'About description (English)');
      ensureFilled(siteSettingsForm.teamHeroBadgeAr, 'Team badge (Arabic)');
      ensureFilled(siteSettingsForm.teamHeroBadgeEn, 'Team badge (English)');
      ensureFilled(siteSettingsForm.teamHeroTitleAr, 'Team title (Arabic)');
      ensureFilled(siteSettingsForm.teamHeroTitleEn, 'Team title (English)');
      ensureFilled(siteSettingsForm.teamHeroDescAr, 'Team description (Arabic)');
      ensureFilled(siteSettingsForm.teamHeroDescEn, 'Team description (English)');
      ensureFilled(siteSettingsForm.contactHeroBadgeAr, 'Contact badge (Arabic)');
      ensureFilled(siteSettingsForm.contactHeroBadgeEn, 'Contact badge (English)');
      ensureFilled(siteSettingsForm.contactHeroTitleAr, 'Contact title (Arabic)');
      ensureFilled(siteSettingsForm.contactHeroTitleEn, 'Contact title (English)');
      ensureFilled(siteSettingsForm.contactHeroDescAr, 'Contact description (Arabic)');
      ensureFilled(siteSettingsForm.contactHeroDescEn, 'Contact description (English)');
      ensureFilled(siteSettingsForm.footerDescriptionAr, 'Footer description (Arabic)');
      ensureFilled(siteSettingsForm.footerDescriptionEn, 'Footer description (English)');
      ensureFilled(siteSettingsForm.addressAr, 'Address (Arabic)');
      ensureFilled(siteSettingsForm.addressEn, 'Address (English)');
      ensureFilled(siteSettingsForm.email, 'Email');
      ensureFilled(siteSettingsForm.phone, 'Phone');
      ensureFilled(siteSettingsForm.copyrightAr, 'Copyright (Arabic)');
      ensureFilled(siteSettingsForm.copyrightEn, 'Copyright (English)');
      ensureFilled(siteSettingsForm.footerBadgeAr, 'Footer badge (Arabic)');
      ensureFilled(siteSettingsForm.footerBadgeEn, 'Footer badge (English)');

      await contentClient.saveSiteSettings(siteSettingsForm);
      await refresh();
      setStatusMessage('Site settings saved successfully.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to save site settings');
    } finally {
      setSaving(false);
    }
  };

  const updateHeroSlide = (slideId: string, updater: (slide: HeroSlideRecord) => HeroSlideRecord) => {
    setHeroSlidesForm((current) => current.map((slide) => (slide.id === slideId ? updater(slide) : slide)));
  };

  const addHeroSlide = () => {
    const slideId = `hero-slide-${heroSlidesForm.length + 1}`;
    const nextSlide = {
      ...emptyHeroSlide(),
      id: slideId,
      badgeAr: 'محتوى رئيسي',
      badgeEn: 'Featured Section',
      titleArLine1: 'عنوان جديد',
      titleEnLine1: 'New Title',
      titleArLine2: 'سطر ثانٍ',
      titleEnLine2: 'Second line',
      descriptionAr: 'وصف جديد للمحتوى الرئيسي.',
      descriptionEn: 'New main content description.',
      ctaTextAr: 'اعرف المزيد',
      ctaTextEn: 'Learn more',
      imageAltAr: 'صورة رئيسية',
      imageAltEn: 'Hero image',
    };
    setHeroSlidesForm((current) => [...current, nextSlide]);
    setSelectedHeroSlideId(slideId);
  };

  const deleteHeroSlide = (slideId: string) => {
    setHeroSlidesForm((current) => current.filter((slide) => slide.id !== slideId));
    setSelectedHeroSlideId((current) => {
      if (current !== slideId) {
        return current;
      }
      const next = heroSlidesForm.find((slide) => slide.id !== slideId);
      return next?.id || null;
    });
  };

  const renderHomepageEditor = () => {
    const renderOverview = () => (
      <div className="grid gap-4 xl:grid-cols-2">
        {[
          {
            key: 'hero',
            title: 'Hero carousel',
            description: 'Edit the homepage banner slides, images, and CTAs.',
          },
          {
            key: 'site-settings',
            title: 'Header & footer',
            description: 'Edit the navbar CTA, footer text, address, and copyright.',
          },
          {
            key: 'about-hero',
            title: 'About page hero',
            description: 'Edit the About page badge, title, and intro copy.',
          },
          {
            key: 'team-hero',
            title: 'Team page hero',
            description: 'Edit the Team page badge, title, and intro copy.',
          },
          {
            key: 'contact-hero',
            title: 'Contact page hero',
            description: 'Edit the Contact page badge, title, and intro copy.',
          },
        ].map((section) => (
          <button
            key={section.key}
            onClick={() => setHomepagePanel(section.key as HomepagePanel)}
            className="rounded-3xl border border-[#D8D1C7] bg-[#FBF7F0] p-5 text-left transition-all hover:border-[#A56A1E]/60 hover:bg-[#A56A1E]/5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Homepage block</p>
            <h3 className="mt-2 text-xl font-extrabold text-[#1E1E1E]">{section.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#4B4B4B]">{section.description}</p>
            <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-[#7B5A42]">
              Open editor
            </span>
          </button>
        ))}
      </div>
    );

    const renderInfoPanel = (
      title: string,
      eyebrow: string,
      description: string,
      buttonLabel: string,
      onButtonClick: () => void,
    ) => (
      <div className="rounded-3xl border border-[#D8D1C7] bg-white p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">{eyebrow}</p>
        <h3 className="text-2xl font-extrabold text-[#1E1E1E]">{title}</h3>
        <p className="text-sm leading-relaxed text-[#4B4B4B]">{description}</p>
        <button onClick={onButtonClick} className="rounded-xl bg-[#A56A1E] px-4 py-2 text-sm font-bold text-white">
          {buttonLabel}
        </button>
      </div>
    );

    const renderHeroEditor = () => (
      <div className="space-y-6">
        {selectedHeroSlide ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={selectedHeroSlide.id}
                onChange={(event) => {
                  const nextId = event.target.value;
                  setHeroSlidesForm((currentSlides) =>
                    currentSlides.map((slide) =>
                      slide.id === selectedHeroSlide.id ? { ...slide, id: nextId } : slide,
                    ),
                  );
                  setSelectedHeroSlideId(nextId);
                }}
                placeholder="slide id"
                className="rounded-xl border border-[#D8D1C7] px-4 py-3"
              />
              <select
                value={selectedHeroSlide.badgeIcon}
                onChange={(event) =>
                  updateHeroSlide(selectedHeroSlide.id, (current) => ({
                    ...current,
                    badgeIcon: event.target.value,
                  }))
                }
                className="rounded-xl border border-[#D8D1C7] px-4 py-3"
              >
                <option value="Scale">Scale</option>
                <option value="ShieldCheck">ShieldCheck</option>
                <option value="Sparkles">Sparkles</option>
                <option value="MessageSquare">MessageSquare</option>
              </select>
              <input
                value={selectedHeroSlide.badgeAr}
                onChange={(event) =>
                  updateHeroSlide(selectedHeroSlide.id, (current) => ({ ...current, badgeAr: event.target.value }))
                }
                placeholder="Arabic badge"
                className="rounded-xl border border-[#D8D1C7] px-4 py-3"
              />
              <input
                value={selectedHeroSlide.badgeEn}
                onChange={(event) =>
                  updateHeroSlide(selectedHeroSlide.id, (current) => ({ ...current, badgeEn: event.target.value }))
                }
                placeholder="English badge"
                className="rounded-xl border border-[#D8D1C7] px-4 py-3"
              />
              <input
                value={selectedHeroSlide.titleArLine1}
                onChange={(event) =>
                  updateHeroSlide(selectedHeroSlide.id, (current) => ({ ...current, titleArLine1: event.target.value }))
                }
                placeholder="Arabic title line 1"
                className="rounded-xl border border-[#D8D1C7] px-4 py-3"
              />
              <input
                value={selectedHeroSlide.titleEnLine1}
                onChange={(event) =>
                  updateHeroSlide(selectedHeroSlide.id, (current) => ({ ...current, titleEnLine1: event.target.value }))
                }
                placeholder="English title line 1"
                className="rounded-xl border border-[#D8D1C7] px-4 py-3"
              />
              <input
                value={selectedHeroSlide.titleArLine2}
                onChange={(event) =>
                  updateHeroSlide(selectedHeroSlide.id, (current) => ({ ...current, titleArLine2: event.target.value }))
                }
                placeholder="Arabic title line 2"
                className="rounded-xl border border-[#D8D1C7] px-4 py-3"
              />
              <input
                value={selectedHeroSlide.titleEnLine2}
                onChange={(event) =>
                  updateHeroSlide(selectedHeroSlide.id, (current) => ({ ...current, titleEnLine2: event.target.value }))
                }
                placeholder="English title line 2"
                className="rounded-xl border border-[#D8D1C7] px-4 py-3"
              />
              <textarea
                value={selectedHeroSlide.descriptionAr}
                onChange={(event) =>
                  updateHeroSlide(selectedHeroSlide.id, (current) => ({ ...current, descriptionAr: event.target.value }))
                }
                placeholder="Arabic description"
                rows={4}
                className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2"
              />
              <textarea
                value={selectedHeroSlide.descriptionEn}
                onChange={(event) =>
                  updateHeroSlide(selectedHeroSlide.id, (current) => ({ ...current, descriptionEn: event.target.value }))
                }
                placeholder="English description"
                rows={4}
                className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2"
              />
              <input
                value={selectedHeroSlide.ctaTextAr}
                onChange={(event) =>
                  updateHeroSlide(selectedHeroSlide.id, (current) => ({ ...current, ctaTextAr: event.target.value }))
                }
                placeholder="Arabic CTA"
                className="rounded-xl border border-[#D8D1C7] px-4 py-3"
              />
              <input
                value={selectedHeroSlide.ctaTextEn}
                onChange={(event) =>
                  updateHeroSlide(selectedHeroSlide.id, (current) => ({ ...current, ctaTextEn: event.target.value }))
                }
                placeholder="English CTA"
                className="rounded-xl border border-[#D8D1C7] px-4 py-3"
              />
              <select
                value={selectedHeroSlide.actionType}
                onChange={(event) =>
                  updateHeroSlide(selectedHeroSlide.id, (current) => ({
                    ...current,
                    actionType: event.target.value as HeroSlideRecord['actionType'],
                  }))
                }
                className="rounded-xl border border-[#D8D1C7] px-4 py-3"
              >
                <option value="about">About</option>
                <option value="service-detail">Service detail</option>
                <option value="contact">Contact</option>
                <option value="custom">Custom</option>
              </select>
              <input
                value={selectedHeroSlide.actionParam || ''}
                onChange={(event) =>
                  updateHeroSlide(selectedHeroSlide.id, (current) => ({
                    ...current,
                    actionParam: event.target.value,
                  }))
                }
                placeholder="Action param"
                className="rounded-xl border border-[#D8D1C7] px-4 py-3"
              />
              <input
                value={selectedHeroSlide.image}
                onChange={(event) =>
                  updateHeroSlide(selectedHeroSlide.id, (current) => ({ ...current, image: event.target.value }))
                }
                placeholder="Image URL"
                className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2"
              />
              <div className="grid gap-3 md:grid-cols-3 md:col-span-2">
                <input
                  value={selectedHeroSlide.imageAltAr}
                  onChange={(event) =>
                    updateHeroSlide(selectedHeroSlide.id, (current) => ({
                      ...current,
                      imageAltAr: event.target.value,
                    }))
                  }
                  placeholder="Arabic image alt"
                  className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                />
                <input
                  value={selectedHeroSlide.imageAltEn}
                  onChange={(event) =>
                    updateHeroSlide(selectedHeroSlide.id, (current) => ({
                      ...current,
                      imageAltEn: event.target.value,
                    }))
                  }
                  placeholder="English image alt"
                  className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                />
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setHeroImageFile(event.target.files?.[0] || null)}
                    className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <button
                    type="button"
                    disabled={uploadingAsset || !heroImageFile}
                    onClick={() => heroImageFile && uploadImage(heroImageFile, 'hero')}
                    className="rounded-xl bg-[#121212] px-4 py-3 font-bold text-white disabled:opacity-50"
                  >
                    Upload
                  </button>
                </div>
              </div>
              {selectedHeroSlide.image && (
                <div className="overflow-hidden rounded-2xl border border-[#D8D1C7] bg-[#F8F5EF] md:col-span-2">
                  <img
                    src={selectedHeroSlide.image}
                    alt={selectedHeroSlide.imageAltEn || selectedHeroSlide.imageAltAr}
                    className="h-56 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                disabled={saving}
                onClick={saveHeroSlides}
                className="rounded-xl bg-[#A56A1E] px-5 py-3 font-bold text-white disabled:opacity-50"
              >
                Save homepage
              </button>
              <button
                disabled={saving}
                onClick={addHeroSlide}
                className="rounded-xl border border-[#A56A1E] px-5 py-3 font-bold text-[#A56A1E] disabled:opacity-50"
              >
                Add slide
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#D8D1C7] bg-[#FFFDF9] p-4 text-sm text-[#4B4B4B]">
            <p className="font-bold text-[#1E1E1E]">No hero slides yet.</p>
            <p className="mt-1">Create the first slide to make the homepage banner editable.</p>
            <button
              type="button"
              onClick={addHeroSlide}
              className="mt-3 rounded-xl bg-[#A56A1E] px-4 py-2 text-xs font-bold text-white"
            >
              Create first slide
            </button>
          </div>
        )}
      </div>
    );

    const renderSiteSettingsEditor = () => (
      <div className="space-y-6 rounded-3xl border border-[#D8D1C7] bg-[#FBF7F0] p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Site settings</p>
          <h3 className="mt-2 text-2xl font-extrabold text-[#1E1E1E]">Navbar + Footer</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input value={siteSettingsForm.navbarCtaAr} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, navbarCtaAr: event.target.value }))} placeholder="Arabic navbar CTA" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.navbarCtaEn} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, navbarCtaEn: event.target.value }))} placeholder="English navbar CTA" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.aboutHeroBadgeAr} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, aboutHeroBadgeAr: event.target.value }))} placeholder="About badge Arabic" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.aboutHeroBadgeEn} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, aboutHeroBadgeEn: event.target.value }))} placeholder="About badge English" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.aboutHeroTitleAr} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, aboutHeroTitleAr: event.target.value }))} placeholder="About title Arabic" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.aboutHeroTitleEn} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, aboutHeroTitleEn: event.target.value }))} placeholder="About title English" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <textarea value={siteSettingsForm.aboutHeroDescAr} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, aboutHeroDescAr: event.target.value }))} placeholder="About description Arabic" rows={3} className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2" />
          <textarea value={siteSettingsForm.aboutHeroDescEn} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, aboutHeroDescEn: event.target.value }))} placeholder="About description English" rows={3} className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2" />
          <input value={siteSettingsForm.teamHeroBadgeAr} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, teamHeroBadgeAr: event.target.value }))} placeholder="Team badge Arabic" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.teamHeroBadgeEn} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, teamHeroBadgeEn: event.target.value }))} placeholder="Team badge English" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.teamHeroTitleAr} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, teamHeroTitleAr: event.target.value }))} placeholder="Team title Arabic" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.teamHeroTitleEn} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, teamHeroTitleEn: event.target.value }))} placeholder="Team title English" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <textarea value={siteSettingsForm.teamHeroDescAr} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, teamHeroDescAr: event.target.value }))} placeholder="Team description Arabic" rows={3} className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2" />
          <textarea value={siteSettingsForm.teamHeroDescEn} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, teamHeroDescEn: event.target.value }))} placeholder="Team description English" rows={3} className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2" />
          <input value={siteSettingsForm.contactHeroBadgeAr} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, contactHeroBadgeAr: event.target.value }))} placeholder="Contact badge Arabic" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.contactHeroBadgeEn} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, contactHeroBadgeEn: event.target.value }))} placeholder="Contact badge English" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.contactHeroTitleAr} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, contactHeroTitleAr: event.target.value }))} placeholder="Contact title Arabic" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.contactHeroTitleEn} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, contactHeroTitleEn: event.target.value }))} placeholder="Contact title English" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <textarea value={siteSettingsForm.contactHeroDescAr} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, contactHeroDescAr: event.target.value }))} placeholder="Contact description Arabic" rows={3} className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2" />
          <textarea value={siteSettingsForm.contactHeroDescEn} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, contactHeroDescEn: event.target.value }))} placeholder="Contact description English" rows={3} className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2" />
          <textarea value={siteSettingsForm.footerDescriptionAr} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, footerDescriptionAr: event.target.value }))} placeholder="Arabic footer description" rows={3} className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2" />
          <textarea value={siteSettingsForm.footerDescriptionEn} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, footerDescriptionEn: event.target.value }))} placeholder="English footer description" rows={3} className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2" />
          <input value={siteSettingsForm.addressAr} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, addressAr: event.target.value }))} placeholder="Arabic address" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.addressEn} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, addressEn: event.target.value }))} placeholder="English address" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.email} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.phone} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.footerBadgeAr} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, footerBadgeAr: event.target.value }))} placeholder="Arabic footer badge" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.footerBadgeEn} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, footerBadgeEn: event.target.value }))} placeholder="English footer badge" className="rounded-xl border border-[#D8D1C7] px-4 py-3" />
          <input value={siteSettingsForm.copyrightAr} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, copyrightAr: event.target.value }))} placeholder="Arabic copyright" className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2" />
          <input value={siteSettingsForm.copyrightEn} onChange={(event) => setSiteSettingsForm((current) => ({ ...current, copyrightEn: event.target.value }))} placeholder="English copyright" className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2" />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            disabled={saving}
            onClick={saveSiteSettings}
            className="rounded-xl bg-[#A56A1E] px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            Save site settings
          </button>
        </div>
      </div>
    );

    if (homepagePanel === 'overview') {
      return renderOverview();
    }

    if (homepagePanel === 'hero') {
      return renderHeroEditor();
    }

    if (homepagePanel === 'site-settings') {
      return renderSiteSettingsEditor();
    }

    if (homepagePanel === 'about-hero') {
      return renderInfoPanel(
        'Homepage about hero',
        'About page hero',
        'Edit the badge, title, and intro copy used at the top of the About page.',
        'Open site settings',
        () => setHomepagePanel('site-settings'),
      );
    }

    if (homepagePanel === 'team-hero') {
      return renderInfoPanel(
        'Homepage team hero',
        'Team page hero',
        'Edit the badge, title, and intro copy used at the top of the Team page.',
        'Open site settings',
        () => setHomepagePanel('site-settings'),
      );
    }

    if (homepagePanel === 'contact-hero') {
      return renderInfoPanel(
        'Homepage contact hero',
        'Contact page hero',
        'Edit the badge, title, and intro copy used at the top of the Contact page.',
        'Open site settings',
        () => setHomepagePanel('site-settings'),
      );
    }

    if (homepagePanel === 'services') {
      return renderInfoPanel(
        'Homepage practice areas block',
        'Practice areas',
        'This block is powered by the editable Practice Areas editor.',
        'Open Practice Areas',
        () => setActiveTab('practice-areas'),
      );
    }

    if (homepagePanel === 'doctor-shield') {
      return renderInfoPanel(
        'Homepage Doctor Shield promo',
        'Doctor Shield',
        'This promo block is editable from Site settings.',
        'Open site settings',
        () => setHomepagePanel('site-settings'),
      );
    }

    if (homepagePanel === 'statistics') {
      return renderInfoPanel(
        'Homepage statistics block',
        'Statistics',
        'This block is currently static in `src/components/Statistics.tsx`.',
        'Open site settings',
        () => setHomepagePanel('site-settings'),
      );
    }

    if (homepagePanel === 'team') {
      return renderInfoPanel(
        'Homepage team block',
        'Team section',
        'This block is currently static in `src/components/Team.tsx`.',
        'Open site settings',
        () => setHomepagePanel('site-settings'),
      );
    }

    if (homepagePanel === 'contact') {
      return renderInfoPanel(
        'Homepage contact block',
        'Contact section',
        'This block is currently static in `src/components/Contact.tsx`.',
        'Open site settings',
        () => setHomepagePanel('site-settings'),
      );
    }

    return renderInfoPanel(
      'Homepage block',
      'Homepage',
      'Pick a block from the left to edit it.',
      'Open overview',
      () => setHomepagePanel('overview'),
    );
  };

  const saveArticle = async (mode: 'create' | 'update', nextPublished = articleForm.published) => {
    setSaving(true);
    setStatusMessage(null);

    try {
      const payload: ArticleRecord = {
        ...articleForm,
        published: nextPublished,
        id: articleForm.id || articleForm.slug || slugify(articleForm.titleEn || articleForm.titleAr),
        slug: articleForm.slug || slugify(articleForm.titleEn || articleForm.titleAr),
        order: Number(articleForm.order) || 1,
      };

      validateArticlePayload(payload);

      const nextContent =
        mode === 'create'
          ? await contentClient.createArticle(payload)
          : await contentClient.saveArticle(payload, selectedArticle?.slug);

      setStatusMessage(`Article ${mode === 'create' ? 'created' : 'saved'} successfully.`);
      await refresh();
      setSelectedArticleSlug(payload.slug);
      if (nextContent.articles.length) {
        const updated = nextContent.articles.find((item) => item.slug === payload.slug);
        if (updated) {
          setArticleForm(updated);
        }
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to save article');
    } finally {
      setSaving(false);
    }
  };

  const deleteCurrentArticle = async () => {
    if (!selectedArticle) {
      return;
    }

    setSaving(true);
    try {
      await contentClient.deleteArticle(selectedArticle.slug);
      setSelectedArticleSlug(null);
      await refresh();
      setStatusMessage('Article deleted.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to delete article');
    } finally {
      setSaving(false);
    }
  };

  const savePracticeArea = async (mode: 'create' | 'update') => {
    setSaving(true);
    setStatusMessage(null);

    try {
      const payload: PracticeAreaRecord = {
        ...practiceForm,
        id: practiceForm.id || `practice-${practiceForm.slug || slugify(practiceForm.titleEn || practiceForm.titleAr)}`,
        slug: practiceForm.slug || slugify(practiceForm.titleEn || practiceForm.titleAr),
        aboutAr: safeParse<string[]>(practiceAboutAr, practiceForm.aboutAr),
        aboutEn: safeParse<string[]>(practiceAboutEn, practiceForm.aboutEn),
        features: safeParse<PracticeAreaFeature[]>(practiceFeatures, practiceForm.features),
        processSteps: safeParse<PracticeAreaStep[]>(practiceProcessSteps, practiceForm.processSteps),
        useCases: safeParse<LocalizedText[]>(practiceUseCases, practiceForm.useCases),
        faq: safeParse<PracticeAreaFaq[]>(practiceFaq, practiceForm.faq),
        order: Number(practiceForm.order) || 1,
      };

      validatePracticeAreaPayload(
        payload,
        practiceAboutAr,
        practiceAboutEn,
        practiceFeatures,
        practiceProcessSteps,
        practiceUseCases,
        practiceFaq,
      );

      await (mode === 'create'
        ? contentClient.createPracticeArea(payload)
        : contentClient.savePracticeArea(payload, selectedPracticeArea?.slug));

      setStatusMessage(`Practice area ${mode === 'create' ? 'created' : 'saved'} successfully.`);
      await refresh();
      setSelectedPracticeSlug(payload.slug);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to save practice area');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File, target: 'article' | 'practice' | 'hero') => {
    setUploadingAsset(true);
    setStatusMessage(null);

    try {
      const result = await contentClient.uploadAsset(
        file,
        target === 'article' ? articleAltAr : practiceAltAr,
        target === 'article' ? articleAltEn : practiceAltEn,
      );
      if (target === 'article') {
        setArticleForm((current) => ({ ...current, image: result.asset.url }));
        setArticleImageFile(null);
      } else if (target === 'hero' && selectedHeroSlideId) {
        updateHeroSlide(selectedHeroSlideId, (current) => ({ ...current, image: result.asset.url }));
        setHeroImageFile(null);
      } else {
        setPracticeForm((current) => ({ ...current, imageUrl: result.asset.url }));
        setPracticeImageFile(null);
      }
      setStatusMessage('Image uploaded successfully.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadingAsset(false);
    }
  };

  const deleteCurrentPracticeArea = async () => {
    if (!selectedPracticeArea) {
      return;
    }

    setSaving(true);
    try {
      await contentClient.deletePracticeArea(selectedPracticeArea.slug);
      setSelectedPracticeSlug(null);
      await refresh();
      setStatusMessage('Practice area deleted.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to delete practice area');
    } finally {
      setSaving(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F1ECE3] flex items-center justify-center px-4">
        <div className="rounded-3xl border border-[#D8D1C7] bg-white p-8 shadow-sm">
          Loading admin…
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#F1ECE3] flex items-center justify-center px-4" style={{ direction: 'rtl' }}>
        <div className="w-full max-w-md rounded-3xl border border-[#D8D1C7] bg-white p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#A56A1E] uppercase tracking-[0.3em]">Admin Access</p>
            <h1 className="text-3xl font-extrabold text-[#1E1E1E]">Dashboard Login</h1>
            <p className="text-sm text-[#4B4B4B]">Sign in to edit articles and practice areas.</p>
          </div>

          <div className="space-y-4">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3 outline-none focus:border-[#A56A1E]"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3 outline-none focus:border-[#A56A1E]"
            />
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button
              onClick={login}
              className="w-full rounded-xl bg-[#A56A1E] px-4 py-3 font-bold text-white hover:bg-[#946B4B]"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1ECE3] px-4 py-6 text-[#1E1E1E]" style={{ direction: 'rtl' }}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-[#D8D1C7] bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#A56A1E]">Content Studio</p>
            <h1 className="text-3xl font-extrabold">Edit the website content</h1>
            <p className="text-sm text-[#4B4B4B]">Manage homepage hero slides, articles, and practice areas from one place.</p>
            <p className="mt-1 text-sm font-semibold text-[#7B5A42]">
              Every item must include both Arabic and English content.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setActiveTab('homepage')} className="rounded-xl border px-4 py-2 font-semibold">
              Homepage
            </button>
            <button onClick={() => setActiveTab('articles')} className="rounded-xl border px-4 py-2 font-semibold">
              Articles
            </button>
            <button onClick={() => setActiveTab('practice-areas')} className="rounded-xl border px-4 py-2 font-semibold">
              Practice Areas
            </button>
            <button onClick={logout} className="rounded-xl bg-[#121212] px-4 py-2 font-semibold text-white">
              Logout
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="rounded-2xl border border-[#A56A1E]/20 bg-[#A56A1E]/10 px-4 py-3 text-sm text-[#7B5A42]">
            {statusMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4 rounded-3xl border border-[#D8D1C7] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">
                {activeTab === 'homepage' ? 'Homepage' : activeTab === 'articles' ? 'Articles' : 'Practice Areas'}
              </h2>
              <button
                onClick={() => {
                  if (activeTab === 'homepage') {
                    addHeroSlide();
                  } else if (activeTab === 'articles') {
                    const article = emptyArticle();
                    article.order = articles.length + 1;
                    setArticleForm(article);
                    setArticleAltAr('');
                    setArticleAltEn('');
                    setArticleImageFile(null);
                    setSelectedArticleSlug(null);
                  } else {
                    const practiceArea = emptyPracticeArea();
                    practiceArea.order = practiceAreas.length + 1;
                    setPracticeForm(practiceArea);
                    setPracticeAltAr('');
                    setPracticeAltEn('');
                    setPracticeImageFile(null);
                    setPracticeAboutAr(JSON.stringify([''], null, 2));
                    setPracticeAboutEn(JSON.stringify([''], null, 2));
                    setPracticeFeatures('[]');
                    setPracticeProcessSteps('[]');
                    setPracticeUseCases('[]');
                    setPracticeFaq('[]');
                    setSelectedPracticeSlug(null);
                  }
                }}
                className="rounded-lg bg-[#A56A1E] px-3 py-2 text-xs font-bold text-white"
              >
                {activeTab === 'homepage' ? 'New slide' : 'New'}
              </button>
            </div>
            {activeTab === 'homepage' ? renderHomepageEditor() : activeTab === 'articles' ? (
              <div className="space-y-3">
                {articles.map((article) => (
                  <ListButton
                    key={article.slug}
                    active={selectedArticle?.slug === article.slug}
                    onClick={() => setSelectedArticleSlug(article.slug)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold">{article.titleAr}</span>
                        <span className={`rounded-full px-2 py-1 text-[10px] ${article.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-[#4B4B4B]">{article.slug}</p>
                    </div>
                  </ListButton>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {practiceAreas.map((practiceArea) => (
                  <ListButton
                    key={practiceArea.slug}
                    active={selectedPracticeArea?.slug === practiceArea.slug}
                    onClick={() => setSelectedPracticeSlug(practiceArea.slug)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold">{practiceArea.titleAr}</span>
                        <span className={`rounded-full px-2 py-1 text-[10px] ${practiceArea.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {practiceArea.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-[#4B4B4B]">{practiceArea.slug}</p>
                    </div>
                  </ListButton>
                ))}
              </div>
            )}
          </aside>

          <main className="space-y-6 rounded-3xl border border-[#D8D1C7] bg-white p-6 shadow-sm">
            {activeTab === 'homepage' ? renderHomepageEditor() : activeTab === 'articles' ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    value={articleForm.titleAr}
                    onChange={(event) => setArticleForm((current) => ({ ...current, titleAr: event.target.value, slug: current.slug || slugify(event.target.value) }))}
                    placeholder="Arabic title"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <input
                    value={articleForm.titleEn}
                    onChange={(event) => setArticleForm((current) => ({ ...current, titleEn: event.target.value, slug: current.slug || slugify(event.target.value) }))}
                    placeholder="English title"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <input
                    value={articleForm.slug}
                    onChange={(event) => setArticleForm((current) => ({ ...current, slug: slugify(event.target.value), id: current.id || slugify(event.target.value) }))}
                    placeholder="slug"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <input
                    value={articleForm.date}
                    onChange={(event) => setArticleForm((current) => ({ ...current, date: event.target.value }))}
                    placeholder="YYYY-MM-DD"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <input
                    value={articleForm.categoryAr}
                    onChange={(event) => setArticleForm((current) => ({ ...current, categoryAr: event.target.value }))}
                    placeholder="Arabic category"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <input
                    value={articleForm.categoryEn}
                    onChange={(event) => setArticleForm((current) => ({ ...current, categoryEn: event.target.value }))}
                    placeholder="English category"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <input
                    value={articleForm.authorAr}
                    onChange={(event) => setArticleForm((current) => ({ ...current, authorAr: event.target.value }))}
                    placeholder="Arabic author"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <input
                    value={articleForm.authorEn}
                    onChange={(event) => setArticleForm((current) => ({ ...current, authorEn: event.target.value }))}
                    placeholder="English author"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <input
                    value={articleForm.readTimeAr}
                    onChange={(event) => setArticleForm((current) => ({ ...current, readTimeAr: event.target.value }))}
                    placeholder="Arabic read time"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <input
                    value={articleForm.readTimeEn}
                    onChange={(event) => setArticleForm((current) => ({ ...current, readTimeEn: event.target.value }))}
                    placeholder="English read time"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <div className="space-y-3 md:col-span-2">
                    <input
                      value={articleForm.image}
                      onChange={(event) => setArticleForm((current) => ({ ...current, image: event.target.value }))}
                      placeholder="Image URL"
                      className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3"
                    />
                    <div className="grid gap-3 md:grid-cols-3">
                      <input
                        value={articleAltAr}
                        onChange={(event) => setArticleAltAr(event.target.value)}
                        placeholder="Arabic image alt text"
                        className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                      />
                      <input
                        value={articleAltEn}
                        onChange={(event) => setArticleAltEn(event.target.value)}
                        placeholder="English image alt text"
                        className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                      />
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => setArticleImageFile(event.target.files?.[0] || null)}
                          className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3"
                        />
                        <button
                          type="button"
                          disabled={uploadingAsset || !articleImageFile}
                          onClick={() => articleImageFile && uploadImage(articleImageFile, 'article')}
                          className="rounded-xl bg-[#121212] px-4 py-3 font-bold text-white disabled:opacity-50"
                        >
                          Upload
                        </button>
                      </div>
                    </div>
                    {articleForm.image && (
                      <div className="overflow-hidden rounded-2xl border border-[#D8D1C7] bg-[#F8F5EF]">
                        <img src={articleForm.image} alt={articleAltEn || articleAltAr || articleForm.titleEn} className="h-48 w-full object-cover" />
                      </div>
                    )}
                    <p className="text-xs text-[#4B4B4B]">
                      Content is bilingual, so keep Arabic and English text filled before saving.
                    </p>
                  </div>
                  <input
                    value={articleForm.excerptAr}
                    onChange={(event) => setArticleForm((current) => ({ ...current, excerptAr: event.target.value }))}
                    placeholder="Arabic excerpt"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2"
                  />
                  <input
                    value={articleForm.excerptEn}
                    onChange={(event) => setArticleForm((current) => ({ ...current, excerptEn: event.target.value }))}
                    placeholder="English excerpt"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2"
                  />
                </div>

                <label className="space-y-2 block">
                  <span className="text-sm font-bold">Arabic body (Markdown)</span>
                  <textarea
                    value={articleForm.bodyAr}
                    onChange={(event) => setArticleForm((current) => ({ ...current, bodyAr: event.target.value }))}
                    rows={10}
                    className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3 font-mono text-sm"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm font-bold">English body (Markdown)</span>
                  <textarea
                    value={articleForm.bodyEn}
                    onChange={(event) => setArticleForm((current) => ({ ...current, bodyEn: event.target.value }))}
                    rows={10}
                    className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3 font-mono text-sm"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={articleForm.published}
                      onChange={(event) => setArticleForm((current) => ({ ...current, published: event.target.checked }))}
                    />
                    Published
                  </label>
                  <input
                    value={articleForm.order}
                    onChange={(event) => setArticleForm((current) => ({ ...current, order: Number(event.target.value) }))}
                    type="number"
                    className="w-24 rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    disabled={saving}
                    onClick={() => saveArticle(selectedArticle ? 'update' : 'create')}
                    className="rounded-xl bg-[#A56A1E] px-5 py-3 font-bold text-white disabled:opacity-50"
                >
                  {articleForm.published ? 'Save article' : 'Save draft'}
                </button>
                <button
                  disabled={saving}
                  onClick={() => saveArticle(selectedArticle ? 'update' : 'create', true)}
                  className="rounded-xl border border-[#A56A1E] px-5 py-3 font-bold text-[#A56A1E] disabled:opacity-50"
                >
                  Publish now
                </button>
                <button
                  disabled={saving || !selectedArticle}
                  onClick={deleteCurrentArticle}
                  className="rounded-xl border border-red-200 px-5 py-3 font-bold text-red-600 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>

                <div className="rounded-2xl border border-[#D8D1C7] bg-[#FBF7F0] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Readiness</p>
                      <h4 className="mt-1 text-lg font-extrabold text-[#1E1E1E]">
                        {articleForm.published ? 'Publishing checklist' : 'Draft checklist'}
                      </h4>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#A56A1E]">
                      {articleCompletionPercent}%
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {articleChecklist.map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-xl border px-3 py-2 text-sm ${
                          item.ready
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.ready ? '✓' : '•'} {item.label}
                      </div>
                    ))}
                  </div>

                  {!articleForm.published && (
                    <p className="mt-3 text-xs leading-6 text-[#4B4B4B]">
                      Drafts can be saved early. Finish the checklist, then use <span className="font-bold text-[#A56A1E]">Publish now</span>.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-[#D8D1C7] bg-[#F8F5EF] p-4">
                  <p className="mb-3 text-sm font-bold">Preview</p>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-extrabold">{articleForm.titleAr || articleForm.titleEn}</h3>
                    <MarkdownRenderer value={articleForm.bodyAr || articleForm.bodyEn} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    value={practiceForm.titleAr}
                    onChange={(event) => setPracticeForm((current) => ({ ...current, titleAr: event.target.value, slug: current.slug || slugify(event.target.value) }))}
                    placeholder="Arabic title"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <input
                    value={practiceForm.titleEn}
                    onChange={(event) => setPracticeForm((current) => ({ ...current, titleEn: event.target.value, slug: current.slug || slugify(event.target.value) }))}
                    placeholder="English title"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <input
                    value={practiceForm.slug}
                    onChange={(event) => setPracticeForm((current) => ({ ...current, slug: slugify(event.target.value), id: current.id || slugify(event.target.value) }))}
                    placeholder="slug"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <select
                    value={practiceForm.categorySlug}
                    onChange={(event) =>
                      setPracticeForm((current) => ({
                        ...current,
                        categorySlug: event.target.value as PracticeAreaRecord['categorySlug'],
                      }))
                    }
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  >
                    <option value="advisory">advisory</option>
                    <option value="litigation">litigation</option>
                    <option value="transactional">transactional</option>
                  </select>
                  <input
                    value={practiceForm.categoryAr}
                    onChange={(event) => setPracticeForm((current) => ({ ...current, categoryAr: event.target.value }))}
                    placeholder="Arabic category"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <input
                    value={practiceForm.categoryEn}
                    onChange={(event) => setPracticeForm((current) => ({ ...current, categoryEn: event.target.value }))}
                    placeholder="English category"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                  <input
                    value={practiceForm.shortDescAr}
                    onChange={(event) => setPracticeForm((current) => ({ ...current, shortDescAr: event.target.value }))}
                    placeholder="Arabic short description"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2"
                  />
                  <input
                    value={practiceForm.shortDescEn}
                    onChange={(event) => setPracticeForm((current) => ({ ...current, shortDescEn: event.target.value }))}
                    placeholder="English short description"
                    className="rounded-xl border border-[#D8D1C7] px-4 py-3 md:col-span-2"
                  />
                  <div className="space-y-3 md:col-span-2">
                    <input
                      value={practiceForm.imageUrl || ''}
                      onChange={(event) => setPracticeForm((current) => ({ ...current, imageUrl: event.target.value }))}
                      placeholder="Image URL"
                      className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3"
                    />
                    <div className="grid gap-3 md:grid-cols-3">
                      <input
                        value={practiceAltAr}
                        onChange={(event) => setPracticeAltAr(event.target.value)}
                        placeholder="Arabic image alt text"
                        className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                      />
                      <input
                        value={practiceAltEn}
                        onChange={(event) => setPracticeAltEn(event.target.value)}
                        placeholder="English image alt text"
                        className="rounded-xl border border-[#D8D1C7] px-4 py-3"
                      />
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => setPracticeImageFile(event.target.files?.[0] || null)}
                          className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3"
                        />
                        <button
                          type="button"
                          disabled={uploadingAsset || !practiceImageFile}
                          onClick={() => practiceImageFile && uploadImage(practiceImageFile, 'practice')}
                          className="rounded-xl bg-[#121212] px-4 py-3 font-bold text-white disabled:opacity-50"
                        >
                          Upload
                        </button>
                      </div>
                    </div>
                    {practiceForm.imageUrl && (
                      <div className="overflow-hidden rounded-2xl border border-[#D8D1C7] bg-[#F8F5EF]">
                        <img src={practiceForm.imageUrl} alt={practiceAltEn || practiceAltAr || practiceForm.titleEn} className="h-48 w-full object-cover" />
                      </div>
                    )}
                    <p className="text-xs text-[#4B4B4B]">
                      Keep Arabic and English content aligned for every practice area.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 block">
                    <span className="text-sm font-bold">About Arabic (JSON array)</span>
                    <textarea
                      value={practiceAboutAr}
                      onChange={(event) => setPracticeAboutAr(event.target.value)}
                      rows={7}
                      className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3 font-mono text-sm"
                    />
                  </label>
                  <label className="space-y-2 block">
                    <span className="text-sm font-bold">About English (JSON array)</span>
                    <textarea
                      value={practiceAboutEn}
                      onChange={(event) => setPracticeAboutEn(event.target.value)}
                      rows={7}
                      className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3 font-mono text-sm"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 block">
                    <span className="text-sm font-bold">Features (JSON)</span>
                    <textarea
                      value={practiceFeatures}
                      onChange={(event) => setPracticeFeatures(event.target.value)}
                      rows={10}
                      className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3 font-mono text-sm"
                    />
                  </label>
                  <label className="space-y-2 block">
                    <span className="text-sm font-bold">Process steps (JSON)</span>
                    <textarea
                      value={practiceProcessSteps}
                      onChange={(event) => setPracticeProcessSteps(event.target.value)}
                      rows={10}
                      className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3 font-mono text-sm"
                    />
                  </label>
                  <label className="space-y-2 block">
                    <span className="text-sm font-bold">Use cases (JSON)</span>
                    <textarea
                      value={practiceUseCases}
                      onChange={(event) => setPracticeUseCases(event.target.value)}
                      rows={8}
                      className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3 font-mono text-sm"
                    />
                  </label>
                  <label className="space-y-2 block">
                    <span className="text-sm font-bold">FAQ (JSON)</span>
                    <textarea
                      value={practiceFaq}
                      onChange={(event) => setPracticeFaq(event.target.value)}
                      rows={8}
                      className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3 font-mono text-sm"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={practiceForm.published}
                      onChange={(event) => setPracticeForm((current) => ({ ...current, published: event.target.checked }))}
                    />
                    Published
                  </label>
                  <input
                    value={practiceForm.order}
                    onChange={(event) => setPracticeForm((current) => ({ ...current, order: Number(event.target.value) }))}
                    type="number"
                    className="w-24 rounded-xl border border-[#D8D1C7] px-4 py-3"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    disabled={saving}
                    onClick={() => savePracticeArea(selectedPracticeArea ? 'update' : 'create')}
                    className="rounded-xl bg-[#A56A1E] px-5 py-3 font-bold text-white disabled:opacity-50"
                  >
                    Save practice area
                  </button>
                  <button
                    disabled={saving || !selectedPracticeArea}
                    onClick={deleteCurrentPracticeArea}
                    className="rounded-xl border border-red-200 px-5 py-3 font-bold text-red-600 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>

                <div className="rounded-2xl border border-[#D8D1C7] bg-[#FBF7F0] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A56A1E]">Readiness</p>
                      <h4 className="mt-1 text-lg font-extrabold text-[#1E1E1E]">
                        {practiceForm.published ? 'Publishing checklist' : 'Draft checklist'}
                      </h4>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#A56A1E]">
                      {practiceCompletionPercent}%
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {practiceChecklist.map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-xl border px-3 py-2 text-sm ${
                          item.ready
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.ready ? '✓' : '•'} {item.label}
                      </div>
                    ))}
                  </div>

                  {!practiceForm.published && (
                    <p className="mt-3 text-xs leading-6 text-[#4B4B4B]">
                      Drafts can be saved first. Finish the checklist, then use <span className="font-bold text-[#A56A1E]">Publish now</span>.
                    </p>
                  )}
                </div>
                </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
