CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adminUserId" TEXT NOT NULL,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "altAr" TEXT,
    "altEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "badgeAr" TEXT NOT NULL,
    "badgeEn" TEXT NOT NULL,
    "badgeIcon" TEXT NOT NULL,
    "titleArLine1" TEXT NOT NULL,
    "titleEnLine1" TEXT NOT NULL,
    "titleArLine2" TEXT NOT NULL,
    "titleEnLine2" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "ctaTextAr" TEXT NOT NULL,
    "ctaTextEn" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "actionParam" TEXT,
    "image" TEXT NOT NULL,
    "imageAltAr" TEXT NOT NULL,
    "imageAltEn" TEXT NOT NULL,
    "highlightBox" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "navbarCtaAr" TEXT NOT NULL,
    "navbarCtaEn" TEXT NOT NULL,
    "footerDescriptionAr" TEXT NOT NULL,
    "footerDescriptionEn" TEXT NOT NULL,
    "addressAr" TEXT NOT NULL,
    "addressEn" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "copyrightAr" TEXT NOT NULL,
    "copyrightEn" TEXT NOT NULL,
    "footerBadgeAr" TEXT NOT NULL,
    "footerBadgeEn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "excerptAr" TEXT NOT NULL,
    "excerptEn" TEXT NOT NULL,
    "categoryAr" TEXT NOT NULL,
    "categoryEn" TEXT NOT NULL,
    "authorAr" TEXT NOT NULL,
    "authorEn" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "readTimeAr" TEXT NOT NULL,
    "readTimeEn" TEXT NOT NULL,
    "bodyAr" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PracticeArea" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "categoryAr" TEXT NOT NULL,
    "categoryEn" TEXT NOT NULL,
    "shortDescAr" TEXT NOT NULL,
    "shortDescEn" TEXT NOT NULL,
    "aboutAr" JSONB NOT NULL,
    "aboutEn" JSONB NOT NULL,
    "features" JSONB NOT NULL,
    "processSteps" JSONB NOT NULL,
    "useCases" JSONB NOT NULL,
    "faq" JSONB NOT NULL,
    "imageUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeArea_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");
CREATE UNIQUE INDEX "AdminSession_token_key" ON "AdminSession"("token");
CREATE UNIQUE INDEX "Asset_key_key" ON "Asset"("key");
CREATE UNIQUE INDEX "HeroSlide_id_key" ON "HeroSlide"("id");
CREATE UNIQUE INDEX "SiteSettings_id_key" ON "SiteSettings"("id");
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE UNIQUE INDEX "PracticeArea_slug_key" ON "PracticeArea"("slug");

ALTER TABLE "AdminSession"
ADD CONSTRAINT "AdminSession_adminUserId_fkey"
FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
