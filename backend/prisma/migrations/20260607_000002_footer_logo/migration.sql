-- Add a dedicated footer logo so the footer can use a different mark than the header.
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "footerLogoImageUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "footerLogoImageAltAr" TEXT NOT NULL DEFAULT 'شعار التذييل لشركة هشام حسن حنبولي الدولية';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "footerLogoImageAltEn" TEXT NOT NULL DEFAULT 'Hesham H. Hanboly International footer logo';
