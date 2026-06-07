# CMS Builder Wiring Plan

## Summary
`cms-builder/` is a real bilingual CMS dashboard prototype generated from Figma, but it still uses `src/app/api/mock.ts` for data. The goal is to wire this UI to the real backend while keeping the public website layouts unchanged.

The CMS should become the admin workspace for:
- Pages + block builder
- Articles
- Practice Areas
- Navigation
- Media Library
- Revisions / publishing
- Auth-gated access

## Phase 1 — Contract Alignment
- Treat `src/app/components/SettingsPanel.tsx` as the API contract reference.
- Align `src/app/api/types.ts` with the real backend data model for:
  - pages
  - blocks
  - navigation items
  - assets
  - revisions
  - articles
  - practice areas
- Keep Arabic + English as first-class fields everywhere:
  - page titles
  - SEO
  - block labels
  - block content
  - nav labels
  - asset alt text

## Phase 2 — Replace Mock API
- Replace `src/app/api/mock.ts` with a typed API client.
- Wire authentication to:
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Wire the builder content endpoints to:
  - `GET /api/pages`
  - `GET /api/pages/:slug`
  - `GET /api/admin/pages`
  - `POST /api/admin/pages`
  - `PUT /api/admin/pages/:slug`
  - `DELETE /api/admin/pages/:slug`
  - `POST /api/admin/pages/:slug/blocks`
  - `PUT /api/admin/pages/:slug/blocks/:blockId`
  - `DELETE /api/admin/pages/:slug/blocks/:blockId`
  - `PUT /api/admin/pages/:slug/reorder-blocks`
  - `PUT /api/admin/pages/:slug/publish`
  - `PUT /api/admin/navigation`
  - `GET /api/admin/assets`
  - `POST /api/admin/uploads`
- Preserve the legacy public endpoints used by the current website:
  - `GET /api/content`
  - `GET /api/articles`
  - `GET /api/articles/:slug`
  - `GET /api/practice-areas`
  - `GET /api/practice-areas/:slug`

## Phase 3 — Wire Modules
### Pages / Builder
- Connect `PagesIndex`, `PageBuilder`, `InspectorPanel`, `NavigationManager`, `RevisionPanel`, and `PublishingPanel`.
- Keep the current website layouts untouched; the builder controls data and block structure, not visual redesign.
- Persist page creation, editing, block add/remove/reorder, preview, draft/publish, and revision restore.

### Articles
- Wire `src/app/components/articles/*` to real CRUD/publish/duplicate/delete endpoints.
- Keep the public article page layout unchanged.
- Use bilingual fields and real repeaters/editor controls instead of raw JSON inputs where possible.

### Practice Areas
- Wire `src/app/components/practice-areas/*` to real CRUD/publish/duplicate/delete endpoints.
- Keep the public practice-area page layout unchanged.
- Ensure FAQ, steps, features, and use-cases are edited as add/remove collections.

### Media + Navigation
- Replace mock assets with real upload/list/update/delete behavior.
- Track Arabic + English alt text and asset usage.
- Make nav visibility a page-level toggle plus ordered nav manager.

## Phase 4 — Backend Integration
- Extend the real backend to store:
  - pages
  - blocks
  - navigation items
  - assets
  - revisions
  - auth sessions
- Keep the existing frontend as the visual source of truth.
- Map new CMS pages into the current route system without changing page layouts.
- Preserve existing public routes like About, Team, Contact, Articles, Practice Areas, and Doctor Shield during migration.

## Test Plan
- Verify auth-gated access to the dashboard.
- Verify pages/articles/practice areas support search, filters, pagination, and status chips.
- Verify create/edit/duplicate/delete/publish flows persist to the backend.
- Verify FAQ and other repeaters support add/remove row editing.
- Verify block reorder, preview, and revision restore work end-to-end.
- Verify bilingual fields are required and rendered correctly.
- Verify public website layouts remain unchanged while content updates from the CMS.

## Assumptions
- `cms-builder/` becomes the dedicated admin/CMS workspace.
- The mock API is replaced, not kept in parallel, once wiring starts.
- The dashboard must remain bilingual and must not redesign the current public frontend.
