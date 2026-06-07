# Hesham Hanboly Law Firm Website

Premium bilingual law-firm website with a protected content dashboard for articles and practice areas.

## Run locally

1. Install dependencies: `npm install`
2. Create a PostgreSQL database named `hisham_hanboly_cms`
3. Set environment values in `.env.local`:
   - `DATABASE_URL`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - optional S3 upload settings for media
4. Start the app: `npm run dev`

`npm run dev` starts the Vite-powered site and the Express + Prisma backend in one process.

## Admin

- Visit `/admin`
- Log in with the credentials from `.env.local`
- Edit or create:
  - homepage hero slides
  - navbar and footer site settings
  - articles
  - practice areas
  - publish status
  - display order
  - uploaded images
- All content fields are bilingual, so Arabic and English text must be filled when adding or editing records.

## Content storage

- Content is stored in PostgreSQL through Prisma in `backend/`.
- The database seeds automatically from the current site content on first run.
- Uploaded media is stored in S3-compatible storage, while PostgreSQL keeps URLs and metadata.
