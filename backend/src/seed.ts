import { prisma } from './db';
import { createSeedContent } from '../../src/content/defaultContent';

export const seedDatabase = async () => {
  const seed = createSeedContent();

  if ((await prisma.heroSlide.count()) === 0) {
    await prisma.heroSlide.createMany({
      data: seed.heroSlides.map((slide, index) => ({
        id: slide.id,
        badgeAr: slide.badgeAr,
        badgeEn: slide.badgeEn,
        badgeIcon: slide.badgeIcon,
        titleArLine1: slide.titleArLine1,
        titleEnLine1: slide.titleEnLine1,
        titleArLine2: slide.titleArLine2,
        titleEnLine2: slide.titleEnLine2,
        descriptionAr: slide.descriptionAr,
        descriptionEn: slide.descriptionEn,
        ctaTextAr: slide.ctaTextAr,
        ctaTextEn: slide.ctaTextEn,
        actionType: slide.actionType,
        actionParam: slide.actionParam || null,
        image: slide.image,
        imageAltAr: slide.imageAltAr,
        imageAltEn: slide.imageAltEn,
        highlightBox: slide.highlightBox || null,
        order: index + 1,
      })),
    });
  }

  if ((await prisma.siteSettings.count()) === 0) {
    await prisma.siteSettings.create({
      data: {
        id: seed.siteSettings.id,
        logoImageUrl: seed.siteSettings.logoImageUrl,
        logoImageAltAr: seed.siteSettings.logoImageAltAr,
        logoImageAltEn: seed.siteSettings.logoImageAltEn,
        footerLogoImageUrl: seed.siteSettings.footerLogoImageUrl,
        footerLogoImageAltAr: seed.siteSettings.footerLogoImageAltAr,
        footerLogoImageAltEn: seed.siteSettings.footerLogoImageAltEn,
        navbarCtaAr: seed.siteSettings.navbarCtaAr,
        navbarCtaEn: seed.siteSettings.navbarCtaEn,
        doctorShieldBadgeAr: seed.siteSettings.doctorShieldBadgeAr,
        doctorShieldBadgeEn: seed.siteSettings.doctorShieldBadgeEn,
        doctorShieldTitleAr: seed.siteSettings.doctorShieldTitleAr,
        doctorShieldTitleEn: seed.siteSettings.doctorShieldTitleEn,
        doctorShieldSubtitleAr: seed.siteSettings.doctorShieldSubtitleAr,
        doctorShieldSubtitleEn: seed.siteSettings.doctorShieldSubtitleEn,
        doctorShieldDescAr: seed.siteSettings.doctorShieldDescAr,
        doctorShieldDescEn: seed.siteSettings.doctorShieldDescEn,
        doctorShieldBullet1Ar: seed.siteSettings.doctorShieldBullet1Ar,
        doctorShieldBullet1En: seed.siteSettings.doctorShieldBullet1En,
        doctorShieldBullet2Ar: seed.siteSettings.doctorShieldBullet2Ar,
        doctorShieldBullet2En: seed.siteSettings.doctorShieldBullet2En,
        doctorShieldBullet3Ar: seed.siteSettings.doctorShieldBullet3Ar,
        doctorShieldBullet3En: seed.siteSettings.doctorShieldBullet3En,
        doctorShieldBullet4Ar: seed.siteSettings.doctorShieldBullet4Ar,
        doctorShieldBullet4En: seed.siteSettings.doctorShieldBullet4En,
        doctorShieldButtonAr: seed.siteSettings.doctorShieldButtonAr,
        doctorShieldButtonEn: seed.siteSettings.doctorShieldButtonEn,
        doctorShieldCircleTitleAr: seed.siteSettings.doctorShieldCircleTitleAr,
        doctorShieldCircleTitleEn: seed.siteSettings.doctorShieldCircleTitleEn,
        doctorShieldCirclePriceAr: seed.siteSettings.doctorShieldCirclePriceAr,
        doctorShieldCirclePriceEn: seed.siteSettings.doctorShieldCirclePriceEn,
        doctorShieldCircleNoteAr: seed.siteSettings.doctorShieldCircleNoteAr,
        doctorShieldCircleNoteEn: seed.siteSettings.doctorShieldCircleNoteEn,
        aboutSectionBadgeAr: seed.siteSettings.aboutSectionBadgeAr,
        aboutSectionBadgeEn: seed.siteSettings.aboutSectionBadgeEn,
        aboutSectionTitleAr: seed.siteSettings.aboutSectionTitleAr,
        aboutSectionTitleEn: seed.siteSettings.aboutSectionTitleEn,
        aboutSectionDescAr: seed.siteSettings.aboutSectionDescAr,
        aboutSectionDescEn: seed.siteSettings.aboutSectionDescEn,
        aboutSectionCardTitleAr: seed.siteSettings.aboutSectionCardTitleAr,
        aboutSectionCardTitleEn: seed.siteSettings.aboutSectionCardTitleEn,
        aboutSectionCardDescAr: seed.siteSettings.aboutSectionCardDescAr,
        aboutSectionCardDescEn: seed.siteSettings.aboutSectionCardDescEn,
        aboutSectionButtonAr: seed.siteSettings.aboutSectionButtonAr,
        aboutSectionButtonEn: seed.siteSettings.aboutSectionButtonEn,
        statisticsBadgeAr: seed.siteSettings.statisticsBadgeAr,
        statisticsBadgeEn: seed.siteSettings.statisticsBadgeEn,
        statisticsNumber: seed.siteSettings.statisticsNumber,
        statisticsTitleAr: seed.siteSettings.statisticsTitleAr,
        statisticsTitleEn: seed.siteSettings.statisticsTitleEn,
        statisticsDescAr: seed.siteSettings.statisticsDescAr,
        statisticsDescEn: seed.siteSettings.statisticsDescEn,
        statisticsSupportAr: seed.siteSettings.statisticsSupportAr,
        statisticsSupportEn: seed.siteSettings.statisticsSupportEn,
        teamSectionBadgeAr: seed.siteSettings.teamSectionBadgeAr,
        teamSectionBadgeEn: seed.siteSettings.teamSectionBadgeEn,
        teamSectionTitleAr: seed.siteSettings.teamSectionTitleAr,
        teamSectionTitleEn: seed.siteSettings.teamSectionTitleEn,
        teamSectionDescAr: seed.siteSettings.teamSectionDescAr,
        teamSectionDescEn: seed.siteSettings.teamSectionDescEn,
        teamFounderBadgeAr: seed.siteSettings.teamFounderBadgeAr,
        teamFounderBadgeEn: seed.siteSettings.teamFounderBadgeEn,
        teamFounderNameAr: seed.siteSettings.teamFounderNameAr,
        teamFounderNameEn: seed.siteSettings.teamFounderNameEn,
        teamFounderRoleAr: seed.siteSettings.teamFounderRoleAr,
        teamFounderRoleEn: seed.siteSettings.teamFounderRoleEn,
        teamFounderIntroAr: seed.siteSettings.teamFounderIntroAr,
        teamFounderIntroEn: seed.siteSettings.teamFounderIntroEn,
        teamFounderImageUrl: seed.siteSettings.teamFounderImageUrl,
        teamFounderImageAltAr: seed.siteSettings.teamFounderImageAltAr,
        teamFounderImageAltEn: seed.siteSettings.teamFounderImageAltEn,
        teamSectionCtaAr: seed.siteSettings.teamSectionCtaAr,
        teamSectionCtaEn: seed.siteSettings.teamSectionCtaEn,
        contactSectionBadgeAr: seed.siteSettings.contactSectionBadgeAr,
        contactSectionBadgeEn: seed.siteSettings.contactSectionBadgeEn,
        contactSectionTitleAr: seed.siteSettings.contactSectionTitleAr,
        contactSectionTitleEn: seed.siteSettings.contactSectionTitleEn,
        contactSectionDescAr: seed.siteSettings.contactSectionDescAr,
        contactSectionDescEn: seed.siteSettings.contactSectionDescEn,
        contactSectionOfficeTitleAr: seed.siteSettings.contactSectionOfficeTitleAr,
        contactSectionOfficeTitleEn: seed.siteSettings.contactSectionOfficeTitleEn,
        contactSectionAddressHeadAr: seed.siteSettings.contactSectionAddressHeadAr,
        contactSectionAddressHeadEn: seed.siteSettings.contactSectionAddressHeadEn,
        contactSectionPhoneLabelAr: seed.siteSettings.contactSectionPhoneLabelAr,
        contactSectionPhoneLabelEn: seed.siteSettings.contactSectionPhoneLabelEn,
        contactSectionEmailLabelAr: seed.siteSettings.contactSectionEmailLabelAr,
        contactSectionEmailLabelEn: seed.siteSettings.contactSectionEmailLabelEn,
        contactSectionSecurityAr: seed.siteSettings.contactSectionSecurityAr,
        contactSectionSecurityEn: seed.siteSettings.contactSectionSecurityEn,
        contactSectionFormTitleAr: seed.siteSettings.contactSectionFormTitleAr,
        contactSectionFormTitleEn: seed.siteSettings.contactSectionFormTitleEn,
        contactSectionFormDescAr: seed.siteSettings.contactSectionFormDescAr,
        contactSectionFormDescEn: seed.siteSettings.contactSectionFormDescEn,
        aboutHeroBadgeAr: seed.siteSettings.aboutHeroBadgeAr,
        aboutHeroBadgeEn: seed.siteSettings.aboutHeroBadgeEn,
        aboutHeroTitleAr: seed.siteSettings.aboutHeroTitleAr,
        aboutHeroTitleEn: seed.siteSettings.aboutHeroTitleEn,
        aboutHeroDescAr: seed.siteSettings.aboutHeroDescAr,
        aboutHeroDescEn: seed.siteSettings.aboutHeroDescEn,
        teamHeroBadgeAr: seed.siteSettings.teamHeroBadgeAr,
        teamHeroBadgeEn: seed.siteSettings.teamHeroBadgeEn,
        teamHeroTitleAr: seed.siteSettings.teamHeroTitleAr,
        teamHeroTitleEn: seed.siteSettings.teamHeroTitleEn,
        teamHeroDescAr: seed.siteSettings.teamHeroDescAr,
        teamHeroDescEn: seed.siteSettings.teamHeroDescEn,
        contactHeroBadgeAr: seed.siteSettings.contactHeroBadgeAr,
        contactHeroBadgeEn: seed.siteSettings.contactHeroBadgeEn,
        contactHeroTitleAr: seed.siteSettings.contactHeroTitleAr,
        contactHeroTitleEn: seed.siteSettings.contactHeroTitleEn,
        contactHeroDescAr: seed.siteSettings.contactHeroDescAr,
        contactHeroDescEn: seed.siteSettings.contactHeroDescEn,
        footerDescriptionAr: seed.siteSettings.footerDescriptionAr,
        footerDescriptionEn: seed.siteSettings.footerDescriptionEn,
        addressAr: seed.siteSettings.addressAr,
        addressEn: seed.siteSettings.addressEn,
        email: seed.siteSettings.email,
        phone: seed.siteSettings.phone,
        copyrightAr: seed.siteSettings.copyrightAr,
        copyrightEn: seed.siteSettings.copyrightEn,
        footerBadgeAr: seed.siteSettings.footerBadgeAr,
        footerBadgeEn: seed.siteSettings.footerBadgeEn,
      },
    });
  }

  if ((await prisma.article.count()) === 0) {
    await prisma.article.createMany({
      data: seed.articles.map((article) => ({
        id: article.id,
        slug: article.slug,
        titleAr: article.titleAr,
        titleEn: article.titleEn,
        excerptAr: article.excerptAr,
        excerptEn: article.excerptEn,
        categoryAr: article.categoryAr,
        categoryEn: article.categoryEn,
        authorAr: article.authorAr,
        authorEn: article.authorEn,
        date: article.date,
        readTimeAr: article.readTimeAr,
        readTimeEn: article.readTimeEn,
        bodyAr: article.bodyAr,
        bodyEn: article.bodyEn,
        imageUrl: article.image,
        published: article.published,
        order: article.order,
      })),
    });
  }

  if ((await prisma.practiceArea.count()) === 0) {
    await prisma.practiceArea.createMany({
      data: seed.practiceAreas.map((practiceArea) => ({
        id: practiceArea.id,
        slug: practiceArea.slug,
        categorySlug: practiceArea.categorySlug,
        titleAr: practiceArea.titleAr,
        titleEn: practiceArea.titleEn,
        categoryAr: practiceArea.categoryAr,
        categoryEn: practiceArea.categoryEn,
        shortDescAr: practiceArea.shortDescAr,
        shortDescEn: practiceArea.shortDescEn,
        aboutAr: practiceArea.aboutAr,
        aboutEn: practiceArea.aboutEn,
        features: practiceArea.features,
        processSteps: practiceArea.processSteps,
        useCases: practiceArea.useCases,
        faq: practiceArea.faq,
        imageUrl: practiceArea.imageUrl || null,
        published: practiceArea.published,
        order: practiceArea.order,
      })),
    });
  }

  if ((await prisma.cmsPage.count()) === 0) {
    const pages = [
      { id: 'page-home', titleAr: 'الرئيسية', titleEn: 'Home', slug: '/', status: 'published', navVisible: true, blocksCount: 8, author: 'Sarah A.' },
      { id: 'page-about', titleAr: 'من نحن', titleEn: 'About Us', slug: '/about', status: 'published', navVisible: true, blocksCount: 5, author: 'Karim M.' },
      { id: 'page-services', titleAr: 'خدماتنا', titleEn: 'Our Services', slug: '/services', status: 'published', navVisible: true, blocksCount: 11, author: 'Sarah A.' },
      { id: 'page-team', titleAr: 'الفريق القانوني', titleEn: 'Legal Team', slug: '/team', status: 'draft', navVisible: false, blocksCount: 4, author: 'Omar H.' },
      { id: 'page-practice-areas', titleAr: 'مجالات الممارسة', titleEn: 'Practice Areas', slug: '/practice-areas', status: 'published', navVisible: true, blocksCount: 7, author: 'Sarah A.' },
      { id: 'page-news', titleAr: 'الأخبار والرؤى', titleEn: 'News & Insights', slug: '/news', status: 'draft', navVisible: false, blocksCount: 2, author: 'Lena K.' },
      { id: 'page-contact', titleAr: 'اتصل بنا', titleEn: 'Contact', slug: '/contact', status: 'published', navVisible: true, blocksCount: 4, author: 'Karim M.' },
      { id: 'page-privacy', titleAr: 'سياسة الخصوصية', titleEn: 'Privacy Policy', slug: '/privacy', status: 'hidden', navVisible: false, blocksCount: 1, author: 'Sarah A.' },
      { id: 'page-terms', titleAr: 'شروط الخدمة', titleEn: 'Terms of Service', slug: '/terms', status: 'hidden', navVisible: false, blocksCount: 1, author: 'Omar H.' },
      { id: 'page-faq', titleAr: 'الأسئلة الشائعة', titleEn: 'FAQ', slug: '/faq', status: 'draft', navVisible: false, blocksCount: 6, author: 'Lena K.' },
      { id: 'page-case-studies', titleAr: 'دراسات الحالة', titleEn: 'Case Studies', slug: '/case-studies', status: 'draft', navVisible: false, blocksCount: 0, author: 'Sarah A.' },
      { id: 'page-awards', titleAr: 'الجوائز والتقدير', titleEn: 'Awards & Recognition', slug: '/awards', status: 'published', navVisible: false, blocksCount: 3, author: 'Karim M.' },
    ];

    await prisma.cmsPage.createMany({
      data: pages.map((page) => ({
        ...page,
      })),
    });

    await prisma.navItem.createMany({
      data: pages
        .filter((page) => page.navVisible)
        .map((page, index) => ({
          id: `nav-${page.id}`,
          pageId: page.id,
          labelAr: page.titleAr,
          labelEn: page.titleEn,
          url: page.slug,
          desktopVisible: true,
          mobileVisible: true,
          order: index + 1,
        })),
    });
  }

  const teamPage = await prisma.cmsPage.findFirst({
    where: {
      OR: [{ slug: '/team' }, { slug: 'team' }],
    },
  });
  if (teamPage) {
    if (teamPage.status !== 'published' || teamPage.navVisible !== false) {
      await prisma.cmsPage.update({
        where: { id: teamPage.id },
        data: {
          status: 'published',
          navVisible: false,
        },
      });
    }

    const revisionCount = await prisma.cmsRevision.count({ where: { pageId: teamPage.id } });
    if (revisionCount === 0) {
      const teamBlocks = [
        {
          id: 'team-leadership',
          type: 'team',
          order: 1,
          data: {
            headingAr: 'الإدارة التنفيذية والقيادة',
            headingEn: 'Executive Leadership & Partners',
            subheadingAr: 'صناع القرار والسياسة الاستراتيجية',
            subheadingEn: 'Decision Makers & Strategic Advisors',
            items: [
              {
                id: 'leader-1',
                nameAr: 'المحامي / هشام بن حسن حنبولي',
                nameEn: 'Advocate / Hesham H. Hanboly',
                roleAr: 'مدير عام الشركة',
                roleEn: 'Managing Director of the Firm',
                bioAr: 'محامي ومستشار قانوني وعضو الهيئة السعودية للمحامين ومحكم معتمد. يمتلك خبرة قضائية عريقة في تحصين وصياغة الاستراتيجيات الوقائية للشركات والمجموعات الاستثمارية الكبرى.',
                bioEn: 'Attorney-at-Law, Legal Practitioner, member of the Saudi Bar Association, certified Arbitrator, and active advocate with long-standing experience in preventative corporate strategy.',
                imageUrl: seed.siteSettings.teamFounderImageUrl,
                credentials: [
                  'عضو الهيئة السعودية للمحامين',
                  'محكم قضائي معتمد لدى وزارة العدل',
                  'عضو لجنة المحامين بالغرفة التجارية بجدة',
                ],
              },
              {
                id: 'leader-2',
                nameAr: 'المحامي / عبد الله هشام حنبولي',
                nameEn: 'Advocate / Abdullah Hesham Hanboly',
                roleAr: 'نائب المدير العام',
                roleEn: 'Deputy Managing Director',
                bioAr: 'محامي ومستشار قانوني متخصّص في الاستشارات الوقائية وصياغة العقود المتطابقة مع الأنظمة المحلية والاتفاقيات الدولية.',
                bioEn: 'Legal consultant focused on preventative advisory and drafting agreements aligned with local regulations and international standards.',
                imageUrl: '/src/assets/images/deputy_abdullah_1780495865817.png',
                credentials: [
                  'عضو الهيئة السعودية للمحامين',
                  'متخصص في صياغة العقود الاستثمارية العابرة للحدود',
                ],
              },
              {
                id: 'leader-3',
                nameAr: 'المحامي / سامي هشام حنبولي',
                nameEn: 'Advocate / Sami Hesham Hanboly',
                roleAr: 'مدير فرع الشركة بالرياض',
                roleEn: 'Riyadh Branch Director',
                bioAr: 'محامي ومستشار قانوني يشرف على المرافعة والتمثيل وتوفير الدعم الوقائي والامتثال لشركاء النجاح في العاصمة الرياض.',
                bioEn: 'Legal practitioner overseeing advocacy, representation, and preventive compliance for clients in Riyadh.',
                imageUrl: '/src/assets/images/manager_sami_1780495881512.png',
                credentials: [
                  'بكالوريوس أنظمة - جامعة الملك عبدالعزيز',
                  'عضو الهيئة السعودية للمحامين',
                ],
              },
            ],
          },
        },
        {
          id: 'team-consultants',
          type: 'team',
          order: 2,
          data: {
            headingAr: 'المستشارون القانونيون',
            headingEn: 'Legal Consultants & Advisors',
            subheadingAr: 'نخبة مستشاري الأنظمة والتمثيل القضائي',
            subheadingEn: 'Embodiment of systemic counsel & litigation',
            items: [
              {
                id: 'consultant-1',
                nameAr: 'المحامي / عبدالرحمن سعد المرزوقي',
                nameEn: 'Advocate / Abdulrahman S. Al-Marzouqi',
                roleAr: 'محامٍ ومستشار قانوني',
                roleEn: 'Advocate & Legal Consultant',
                bioAr: 'مختص بتقديم الحلول القضائية الفعالة والامتثال النظامي.',
                bioEn: 'Specialist in effective judicial solutions and regulatory compliance.',
              },
              {
                id: 'consultant-2',
                nameAr: 'المحامية / شروق ياسر فيومي',
                nameEn: 'Advocate / Shouroq Yasser Fayoumi',
                roleAr: 'محامية ومستشارة قانونية',
                roleEn: 'Advocate & Legal Consultant',
                bioAr: 'تتمتع بخبرة رفيعة في المسارات العمالية للمنشآت.',
                bioEn: 'Experienced in employment and corporate workflows.',
              },
              {
                id: 'consultant-3',
                nameAr: 'المحامية / أميرة إبراهيم الغامدي',
                nameEn: 'Advocate / Amira Ibrahim Al-Ghamdi',
                roleAr: 'محامية ومستشارة قانونية',
                roleEn: 'Advocate & Legal Consultant',
                bioAr: 'متخصصة بالصياغة التعاقدية والاستشارة التجارية.',
                bioEn: 'Specializes in contractual drafting and commercial advisory.',
              },
              {
                id: 'consultant-4',
                nameAr: 'الدكتور / محمود صالح',
                nameEn: 'Dr. Mahmoud Saleh',
                roleAr: 'مستشار قانوني',
                roleEn: 'Senior Legal Advisor',
                bioAr: 'خبير قانوني متخصص في المنازعات الاستثمارية الدولية.',
                bioEn: 'Legal expert specializing in international investment disputes.',
              },
              {
                id: 'consultant-5',
                nameAr: 'المستشار / محمد كمال كامل',
                nameEn: 'Counsel / Mohamed Kamal Kamel',
                roleAr: 'أخصائي قانوني',
                roleEn: 'Senior Legal Specialist',
                bioAr: 'متخصص بنظم الشركات الاستثمارية وصياغة الهياكل القانونية.',
                bioEn: 'Specialist in investment company regulations and legal structuring.',
              },
            ],
          },
        },
        {
          id: 'team-staff',
          type: 'team',
          order: 3,
          data: {
            headingAr: 'فريق الدعم والإدارة',
            headingEn: 'Operations & Support Team',
            subheadingAr: 'كوادر التنظيم والمتابعة',
            subheadingEn: 'Operations and coordination specialists',
            items: [
              {
                id: 'staff-1',
                nameAr: 'المحامية / العنود خالد سعيد',
                nameEn: 'Advocate / Alanoud Khaled Saeed',
                roleAr: 'محامية متدربة',
                roleEn: 'Trainee Advocate',
                bioAr: 'حاصلة على بكالوريوس أنظمة وتتابع ملفات الموكلين والدراسات الأولية.',
                bioEn: 'Law graduate supporting client files and preliminary legal research.',
              },
              {
                id: 'staff-2',
                nameAr: 'الأستاذة / روابي العتيبي',
                nameEn: 'Ms. Rawabi Al-Otaibi',
                roleAr: 'إدارية',
                roleEn: 'Corporate Administrator',
                bioAr: 'تتولى تنسيق الملفات ومتابعة المواعيد والامتثال.',
                bioEn: 'Coordinates client records, schedules, and compliance tracking.',
              },
              {
                id: 'staff-3',
                nameAr: 'الأستاذة / شهد الجريد',
                nameEn: 'Ms. Shahad Al-Juraid',
                roleAr: 'إدارية',
                roleEn: 'Relations Administrator',
                bioAr: 'تدير العلاقات المهنية والبيانات السحابية والتقارير الدورية.',
                bioEn: 'Manages partner relations, cloud records, and periodic reports.',
              },
            ],
          },
        },
        {
          id: 'team-cta',
          type: 'cta',
          order: 4,
          data: {
            headingAr: 'ابدأ استشارتك القانونية معنا كشريك للنجاح',
            headingEn: 'Initiate Your Consultation with Your Lifetime Legal Partner',
            subheadingAr: 'خطوة آمنة نحو التميز الاستثماري والقضائي',
            subheadingEn: 'A strategic move toward corporate compliance & excellence',
            bodyAr: 'فريق قانوني بخبرة احترافية ورؤية استراتيجية لحماية مصالحك وتحقيق أهدافك التجارية وإزالة التبعات والتربص قبل قيام الخلاف المالي أو التعاقدي.',
            bodyEn: 'A legal team with strategic vision, safeguarding your interests and preempting transactional risk before disputes arise.',
            ctaPrimaryLabelAr: 'احجز استشارة وقائية فورية',
            ctaPrimaryLabelEn: 'Book Preventative Assessment',
            ctaPrimaryUrl: '/contact',
            ctaSecondaryLabelAr: 'تواصل معنا اليوم',
            ctaSecondaryLabelEn: 'Connect with Us Today',
            ctaSecondaryUrl: '/contact',
          },
        },
      ];

      await prisma.cmsRevision.create({
        data: {
          id: `rev-team-seed-${Date.now()}`,
          pageId: teamPage.id,
          label: 'Starter Team page content',
          status: 'draft',
          blocks: teamBlocks,
          author: 'CMS Seed',
          note: 'Seeded starter blocks for the Team page.',
        },
      });

      await prisma.cmsPage.update({
        where: { id: teamPage.id },
        data: { blocksCount: teamBlocks.length },
      });
    }

    const teamRevisions = await prisma.cmsRevision.findMany({
      where: { pageId: teamPage.id },
      orderBy: [{ createdAt: 'desc' }],
    });
    let latestSanitizedCount = 0;
    for (const revision of teamRevisions) {
      const blocks = Array.isArray(revision.blocks) ? revision.blocks : [];
      const sanitizedBlocks = blocks.filter((block) => !(block && typeof block === 'object' && (block as { id?: unknown }).id === 'team-intro'));
      if (sanitizedBlocks.length !== blocks.length) {
        await prisma.cmsRevision.update({
          where: { id: revision.id },
          data: { blocks: sanitizedBlocks },
        });
      }
      if (latestSanitizedCount === 0) {
        latestSanitizedCount = sanitizedBlocks.length;
      }
    }

    if (latestSanitizedCount > 0) {
      await prisma.cmsPage.update({
        where: { id: teamPage.id },
        data: { blocksCount: latestSanitizedCount },
      });
    }
  }
};
