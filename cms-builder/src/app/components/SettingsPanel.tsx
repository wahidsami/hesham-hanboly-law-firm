import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, ExternalLink } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth: boolean;
  params?: { name: string; in: 'path' | 'query' | 'body'; type: string; required: boolean; description: string }[];
  response?: string;
}

interface EndpointGroup { title: string; endpoints: Endpoint[]; }

// ─── Data ─────────────────────────────────────────────────────────────────────

const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    title: 'Authentication',
    endpoints: [
      { method: 'POST', path: '/api/auth/login', description: 'Authenticate with username and password. Sets an HTTP-only session cookie.', auth: false, params: [{ name: 'username', in: 'body', type: 'string', required: true, description: 'Admin username' }, { name: 'password', in: 'body', type: 'string', required: true, description: 'Admin password' }], response: '{ ok: true }' },
      { method: 'POST', path: '/api/auth/logout', description: 'Clear the active session cookie.', auth: true, response: '{ ok: true }' },
      { method: 'GET', path: '/api/auth/me', description: 'Return the current auth state from the session cookie.', auth: true, response: '{ authenticated: boolean, username?: string }' },
    ],
  },
  {
    title: 'Public Pages',
    endpoints: [
      { method: 'GET', path: '/api/pages', description: 'List all published pages (no blocks). Public endpoint.', auth: false, response: '{ data: ApiPageSummary[], meta: { total } }' },
      { method: 'GET', path: '/api/pages/:slug', description: 'Return a single published page with its blocks.', auth: false, params: [{ name: 'slug', in: 'path', type: 'string', required: true, description: 'Page slug (e.g. /about)' }], response: '{ data: ApiPage }' },
    ],
  },
  {
    title: 'Admin — Pages',
    endpoints: [
      { method: 'GET', path: '/api/admin/pages', description: 'List all pages regardless of status. Requires auth.', auth: true, response: '{ data: ApiPageSummary[], meta: { total } }' },
      { method: 'POST', path: '/api/admin/pages', description: 'Create a new page in draft status.', auth: true, params: [{ name: 'titleEn', in: 'body', type: 'string', required: true, description: 'English title' }, { name: 'titleAr', in: 'body', type: 'string', required: true, description: 'Arabic title' }, { name: 'slug', in: 'body', type: 'string', required: true, description: 'URL slug starting with /' }], response: '{ data: ApiPage }' },
      { method: 'PUT', path: '/api/admin/pages/:slug', description: 'Update page metadata (title, slug, SEO, status, navVisible).', auth: true, response: '{ data: ApiPage }' },
      { method: 'DELETE', path: '/api/admin/pages/:slug', description: 'Permanently delete a page and all its blocks.', auth: true, response: '{ data: { ok: true } }' },
      { method: 'PUT', path: '/api/admin/pages/:slug/publish', description: 'Publish or unpublish a page. Pass { publish: true/false } in body.', auth: true, params: [{ name: 'publish', in: 'body', type: 'boolean', required: true, description: 'true to publish, false to unpublish' }], response: '{ data: ApiPage }' },
    ],
  },
  {
    title: 'Admin — Blocks',
    endpoints: [
      { method: 'POST', path: '/api/admin/pages/:slug/blocks', description: 'Append a new block to a page.', auth: true, params: [{ name: 'type', in: 'body', type: 'BlockType', required: true, description: 'Block type identifier' }, { name: 'data', in: 'body', type: 'object', required: false, description: 'Block field data' }], response: '{ data: ApiBlock }' },
      { method: 'PUT', path: '/api/admin/pages/:slug/blocks/:blockId', description: 'Update a block\'s data fields.', auth: true, params: [{ name: 'data', in: 'body', type: 'object', required: true, description: 'Full block data payload' }], response: '{ data: ApiBlock }' },
      { method: 'DELETE', path: '/api/admin/pages/:slug/blocks/:blockId', description: 'Remove a block from a page.', auth: true, response: '{ data: { ok: true } }' },
      { method: 'PUT', path: '/api/admin/pages/:slug/reorder-blocks', description: 'Reorder all blocks by providing an ordered array of block IDs.', auth: true, params: [{ name: 'blockIds', in: 'body', type: 'string[]', required: true, description: 'Ordered array of block IDs' }], response: '{ data: ApiBlock[] }' },
    ],
  },
  {
    title: 'Admin — Navigation',
    endpoints: [
      { method: 'GET', path: '/api/admin/navigation', description: 'Get the full ordered navigation items list.', auth: true, response: '{ data: ApiNavItem[] }' },
      { method: 'PUT', path: '/api/admin/navigation', description: 'Replace the entire navigation list. Sends the full ordered array.', auth: true, params: [{ name: 'items', in: 'body', type: 'ApiNavItem[]', required: true, description: 'Full ordered nav item array' }], response: '{ data: ApiNavItem[] }' },
    ],
  },
  {
    title: 'Admin — Assets',
    endpoints: [
      { method: 'GET', path: '/api/admin/assets', description: 'List all uploaded assets with metadata.', auth: true, response: '{ data: ApiAsset[], meta: { total } }' },
      { method: 'POST', path: '/api/admin/uploads', description: 'Upload a new asset. Send as multipart/form-data.', auth: true, params: [{ name: 'file', in: 'body', type: 'File', required: true, description: 'Binary file data' }, { name: 'altEn', in: 'body', type: 'string', required: false, description: 'English alt text' }, { name: 'altAr', in: 'body', type: 'string', required: false, description: 'Arabic alt text' }], response: '{ data: ApiAsset }' },
      { method: 'PUT', path: '/api/admin/assets/:id', description: 'Update asset metadata (alt text, filename).', auth: true, response: '{ data: ApiAsset }' },
      { method: 'DELETE', path: '/api/admin/assets/:id', description: 'Delete an asset.', auth: true, response: '{ data: { ok: true } }' },
    ],
  },
  {
    title: 'Admin — Consultations',
    endpoints: [
      { method: 'GET', path: '/api/admin/consultations', description: 'List all consultation requests in newest-first order.', auth: true, response: '{ data: ConsultationRequest[] }' },
      { method: 'GET', path: '/api/admin/consultations/:id', description: 'Fetch the full detail record for a single consultation request.', auth: true, params: [{ name: 'id', in: 'path', type: 'string', required: true, description: 'Consultation request id' }], response: '{ data: ConsultationRequest }' },
      { method: 'PATCH', path: '/api/admin/consultations/:id', description: 'Update consultation status and internal notes.', auth: true, params: [{ name: 'status', in: 'body', type: 'ConsultationStatus', required: false, description: 'new | reviewing | responded | closed' }, { name: 'adminNotes', in: 'body', type: 'string', required: false, description: 'Internal notes visible to the team' }], response: '{ data: ConsultationRequest }' },
    ],
  },
  {
    title: 'Admin — Overview Analytics',
    endpoints: [
      { method: 'POST', path: '/api/analytics/events', description: 'Record a public website page view or CTA click. Public endpoint.', auth: false, params: [{ name: 'type', in: 'body', type: 'page_view | cta_click', required: false, description: 'Event type' }, { name: 'visitorId', in: 'body', type: 'string', required: false, description: 'Persistent visitor identifier from localStorage' }, { name: 'sessionId', in: 'body', type: 'string', required: false, description: 'Session identifier from sessionStorage' }, { name: 'path', in: 'body', type: 'string', required: true, description: 'Visited path or target path' }], response: '{ ok: true }' },
      { method: 'GET', path: '/api/admin/analytics/overview', description: 'Return dashboard overview metrics, chart data, top pages, referrers, geo, and recent activity.', auth: true, params: [{ name: 'range', in: 'query', type: '7d | 30d | 90d | all', required: false, description: 'Time range for the report' }], response: '{ summary, timeline, topPages, topReferrers, topCountries, topDevices, topBrowsers, recentActivity, content }' },
    ],
  },
  {
    title: 'Admin — Doctor Shield Requests',
    endpoints: [
      { method: 'POST', path: '/api/doctor-shield-requests', description: 'Store a new Doctor Shield request submitted from the public program form as multipart/form-data, including the license image upload.', auth: false, params: [{ name: 'fullName', in: 'body', type: 'string', required: true, description: 'Request holder name' }, { name: 'phone', in: 'body', type: 'string', required: true, description: 'Contact number' }, { name: 'email', in: 'body', type: 'string', required: true, description: 'Email address' }, { name: 'idNumber', in: 'body', type: 'string', required: true, description: 'Saudi ID or Iqama number' }, { name: 'specialty', in: 'body', type: 'string', required: true, description: 'Medical specialty' }, { name: 'licenseFile', in: 'body', type: 'File', required: true, description: 'Current SCFHS license image' }], response: '{ data: DoctorShieldRequest }' },
      { method: 'GET', path: '/api/admin/doctor-shield-requests', description: 'List all Doctor Shield requests in newest-first order.', auth: true, response: '{ data: DoctorShieldRequest[] }' },
      { method: 'GET', path: '/api/admin/doctor-shield-requests/:id', description: 'Fetch the full detail record for a single Doctor Shield request.', auth: true, params: [{ name: 'id', in: 'path', type: 'string', required: true, description: 'Doctor Shield request id' }], response: '{ data: DoctorShieldRequest }' },
      { method: 'PATCH', path: '/api/admin/doctor-shield-requests/:id', description: 'Update Doctor Shield request status and internal notes.', auth: true, params: [{ name: 'status', in: 'body', type: 'ConsultationStatus', required: false, description: 'new | reviewing | responded | closed' }, { name: 'adminNotes', in: 'body', type: 'string', required: false, description: 'Internal notes visible to the team' }], response: '{ data: DoctorShieldRequest }' },
    ],
  },
  {
    title: 'Admin — Revisions',
    endpoints: [
      { method: 'GET', path: '/api/admin/pages/:slug/revisions', description: 'Get the revision history for a page (newest first).', auth: true, response: '{ data: ApiRevision[] }' },
      { method: 'POST', path: '/api/admin/pages/:slug/revisions', description: 'Create a manual snapshot of the current page state.', auth: true, params: [{ name: 'note', in: 'body', type: 'string', required: true, description: 'Human-readable snapshot label' }], response: '{ data: ApiRevision }' },
      { method: 'POST', path: '/api/admin/pages/:slug/revisions/:revId/restore', description: 'Restore a page to a previous revision. Saves a new snapshot first.', auth: true, response: '{ data: ApiPage }' },
    ],
  },
  {
    title: 'Legacy Endpoints (preserved)',
    endpoints: [
      { method: 'GET', path: '/api/content', description: 'Legacy global site content (hero copy, contact info). Preserved for frontend compatibility.', auth: false, response: '{ data: { heroTitleEn, heroTitleAr, contactEmail } }' },
      { method: 'GET', path: '/api/articles', description: 'List published articles (legacy news/insights).', auth: false, response: '{ data: LegacyArticle[], meta: { total } }' },
      { method: 'GET', path: '/api/articles/:slug', description: 'Get a single article by slug.', auth: false, response: '{ data: LegacyArticle }' },
      { method: 'GET', path: '/api/practice-areas', description: 'List all practice areas.', auth: false, response: '{ data: LegacyPracticeArea[] }' },
      { method: 'GET', path: '/api/practice-areas/:slug', description: 'Get a single practice area by slug.', auth: false, response: '{ data: LegacyPracticeArea }' },
    ],
  },
];

// ─── Method badge ─────────────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, { bg: string; color: string }> = {
  GET:    { bg: '#EEF4FF', color: '#1D4ED8' },
  POST:   { bg: '#F0FDF4', color: '#15803D' },
  PUT:    { bg: '#FFF7ED', color: '#C2410C' },
  DELETE: { bg: '#FFF1F2', color: '#BE123C' },
  PATCH:  { bg: '#FAF5FF', color: '#7E22CE' },
};

function MethodBadge({ method }: { method: string }) {
  const c = METHOD_COLORS[method] ?? { bg: '#F4F4F5', color: '#71717A' };
  return (
    <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: c.bg, color: c.color, letterSpacing: '0.04em', flexShrink: 0 }}>
      {method}
    </span>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }
  return (
    <button
      onClick={handleCopy}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', padding: '2px 4px', borderRadius: 3 }}
      title="Copy"
    >
      {copied ? <Check size={11} style={{ color: '#2DA457' }} /> : <Copy size={11} />}
    </button>
  );
}

// ─── Endpoint row ─────────────────────────────────────────────────────────────

function EndpointRow({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <MethodBadge method={ep.method} />
        <span style={{ flex: 1, fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ep.path}
        </span>
        {ep.auth && (
          <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', background: 'var(--muted)', padding: '1px 5px', borderRadius: 3, flexShrink: 0 }}>
            AUTH
          </span>
        )}
        {open ? <ChevronUp size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} /> : <ChevronDown size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />}
      </button>

      {open && (
        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 11, color: 'var(--muted-foreground)', lineHeight: 1.5, margin: 0 }}>{ep.description}</p>

          {ep.params && ep.params.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Parameters</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {ep.params.map(p => (
                  <div key={p.name} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 11 }}>
                    <code style={{ fontFamily: 'DM Mono, monospace', color: 'var(--foreground)', fontWeight: 600, flexShrink: 0 }}>{p.name}</code>
                    <span style={{ fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', fontSize: 10, flexShrink: 0 }}>{p.type}</span>
                    {p.required && <span style={{ fontSize: 9, color: '#B91C1C', fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>required</span>}
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ep.response && (
            <div>
              <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Response</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--muted)', borderRadius: 5, padding: '6px 10px' }}>
                <code style={{ flex: 1, fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--foreground)' }}>{ep.response}</code>
                <CopyButton text={ep.response} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SettingsPanel() {
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(['Authentication', 'Public Pages']));
  const [search, setSearch] = useState('');

  function toggleGroup(title: string) {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  }

  const filteredGroups = ENDPOINT_GROUPS.map(g => ({
    ...g,
    endpoints: g.endpoints.filter(ep =>
      !search || ep.path.toLowerCase().includes(search.toLowerCase()) || ep.description.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(g => g.endpoints.length > 0 || !search);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--card)', flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)', marginBottom: 2 }}>API Reference</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
          Al-Rashid & Partners CMS — complete endpoint contract
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px' }}>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter endpoints…"
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter, sans-serif', flex: 1 }}
          />
        </div>
      </div>

      {/* Notice */}
      <div style={{ padding: '8px 20px', background: 'rgba(45,164,87,0.06)', borderBottom: '1px solid rgba(45,164,87,0.15)', flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: '#1A7B3C', lineHeight: 1.5 }}>
          Articles and practice areas are now wired through <code style={{ fontFamily: 'DM Mono, monospace', fontSize: 10 }}>src/app/api/backend.ts</code>.
          Pages, navigation, and media are now moving to the live backend as well.
          Doctor Shield requests now have their own inbox and API surface alongside consultations.
          Revision snapshots are also persisted through the backend instead of the mock store.
          The live backend uses cookie-based auth, so the login flow should send <code style={{ fontFamily: 'DM Mono, monospace', fontSize: 10 }}>username</code> and <code style={{ fontFamily: 'DM Mono, monospace', fontSize: 10 }}>password</code>.
        </div>
      </div>

      {/* Endpoint groups */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredGroups.map(group => {
          const isOpen = openGroups.has(group.title);
          const isLegacy = group.title.startsWith('Legacy');
          return (
            <div key={group.title} style={{ borderBottom: '2px solid var(--border)' }}>
              <button
                onClick={() => toggleGroup(group.title)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 16px', background: isOpen ? 'var(--card)' : 'var(--muted)',
                  border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                }}
              >
                <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: isLegacy ? 'var(--muted-foreground)' : 'var(--foreground)' }}>
                  {group.title}
                </span>
                <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace' }}>
                  {group.endpoints.length} endpoint{group.endpoints.length !== 1 ? 's' : ''}
                </span>
                {isOpen ? <ChevronUp size={13} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronDown size={13} style={{ color: 'var(--muted-foreground)' }} />}
              </button>
              {isOpen && (
                <div style={{ background: 'var(--card)' }}>
                  {group.endpoints.map(ep => <EndpointRow key={`${ep.method}-${ep.path}`} ep={ep} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
