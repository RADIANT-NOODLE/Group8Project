/**
 * Where the app lets you go: the sidebar's navigation map per role, plus the
 * helpers the auth pages use to send a visitor somewhere safe.
 *
 * Every path in the map must also be allowed for that role in `roleMap.js`
 * (`canAccessRoute`); a test asserts that, so the menu can never offer a screen
 * the guard would refuse.
 */
import { DASHBOARD_PATH, ESTATE_AGENT_PATH, HOA_ADMIN_PATH, ROLES } from './roleMap.js';

export const NAVIGATION_BY_ROLE = Object.freeze({
  [ROLES.resident]: Object.freeze([
    Object.freeze({ label: 'Dashboard', path: DASHBOARD_PATH, icon: 'dashboard' }),
    Object.freeze({ label: 'AI Valuation', path: '/valuation', icon: 'valuation' }),
    Object.freeze({ label: 'Request to Sell/Rent', path: '/request-to-sell', icon: 'request' }),
    Object.freeze({ label: 'My Complaints', path: '/complaints', icon: 'complaint' }),
    Object.freeze({ label: 'Service Provider Directory', path: '/providers', icon: 'providers' }),
    Object.freeze({ label: 'Community Announcements', path: '/announcements', icon: 'announcement' }),
  ]),

  [ROLES.estateAgent]: Object.freeze([
    Object.freeze({ label: 'Dashboard', path: ESTATE_AGENT_PATH, icon: 'dashboard' }),
    Object.freeze({ label: 'My Listings', path: '/agent-listings', icon: 'property' }),
    Object.freeze({ label: 'Edit Listings', path: '/agent-edit-listings', icon: 'request' }),
    Object.freeze({ label: 'Inquiries', path: '/agent-inquiries', icon: 'complaint' }),
    Object.freeze({ label: 'AI Valuation', path: '/valuation', icon: 'valuation' }),
    Object.freeze({ label: 'Service Provider Directory', path: '/providers', icon: 'providers' }),
    Object.freeze({ label: 'Community Announcements', path: '/announcements', icon: 'announcement' }),
  ]),

  [ROLES.hoaAdmin]: Object.freeze([
    Object.freeze({ label: 'Dashboard', path: HOA_ADMIN_PATH, icon: 'dashboard' }),
    Object.freeze({ label: 'Property Requests', path: '/property-requests', icon: 'property' }),
    Object.freeze({ label: 'Approved Properties', path: '/property-approvals', icon: 'property' }),
    Object.freeze({ label: 'Resident Complaints', path: '/resident-complaints', icon: 'complaint' }),
    Object.freeze({ label: 'Inquiries', path: '/agent-inquiries', icon: 'request' }),
    Object.freeze({ label: 'Maintenance', path: '/maintenance', icon: 'maintenance' }),
    Object.freeze({ label: 'Service Provider Directory', path: '/providers', icon: 'providers' }),
    Object.freeze({ label: 'Community Announcements', path: '/community-announcements', icon: 'announcement' }),
  ]),

  /* A provider has no workspace yet (connection plan, Phase 4 item 6). */
  [ROLES.serviceProvider]: Object.freeze([
    Object.freeze({ label: 'Service Provider Directory', path: '/providers', icon: 'providers' }),
    Object.freeze({ label: 'Community Announcements', path: '/announcements', icon: 'announcement' }),
  ]),

  /* Visitors never sign in, so they have no menu. */
  [ROLES.casualVisitor]: Object.freeze([]),
});

/** The sidebar links for a role; an unknown role gets an empty menu. */
export function navigationForRole(value) {
  return NAVIGATION_BY_ROLE[value] ?? [];
}

const AUTH_PAGE_PATHS = new Set(['/login', '/register']);

function readSearchParams(search = '') {
  const normalizedSearch = String(search || '');
  return new URLSearchParams(normalizedSearch.startsWith('?') ? normalizedSearch : `?${normalizedSearch}`);
}

/**
 * The `?next=` target a sign-in should return to, or `fallback` when there is
 * none or it points somewhere unsafe (an absolute URL, a protocol-relative URL,
 * or another auth page).
 */
export function getSafeNextPath(search = '', fallback = DASHBOARD_PATH) {
  const nextPath = readSearchParams(search).get('next');

  if (
    !nextPath ||
    !nextPath.startsWith('/') ||
    nextPath.startsWith('//') ||
    AUTH_PAGE_PATHS.has(nextPath)
  ) {
    return fallback;
  }

  return nextPath;
}

export function getLoginPath(nextPath = DASHBOARD_PATH) {
  const safeNextPath = getSafeNextPath(`?next=${encodeURIComponent(nextPath)}`);
  return `/login?next=${encodeURIComponent(safeNextPath)}`;
}

export function getLoginNotice(search = '') {
  const notice = readSearchParams(search).get('notice');
  if (notice === 'signed-out') return 'You have signed out safely.';
  if (notice === 'session-ended') return 'Your session ended. Please sign in again.';
  return '';
}
