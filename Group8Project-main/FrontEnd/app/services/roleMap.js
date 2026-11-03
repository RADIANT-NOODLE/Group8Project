/**
 * The single role vocabulary for the VALORA frontend.
 *
 * Every role value here is the backend's own role string (`app/common/enums.py`),
 * so a role never has to be translated before it is sent to or read from the API.
 * Display labels exist for text only: authorisation always compares values.
 */

export const ROLES = Object.freeze({
  casualVisitor: 'casual_visitor',
  resident: 'resident',
  estateAgent: 'estate_agent',
  hoaAdmin: 'hoa_admin',
  serviceProvider: 'service_provider',
});

/** The route that renders a signed-in user's dashboard. */
export const DASHBOARD_PATH = '/dashboard';
export const HOA_ADMIN_PATH = '/hoa-admin'; 
export const HEAD_ADMIN_PATH = '/head-admin';
export const ESTATE_AGENT_PATH = '/agent-dashboard';

/** The public landing route for roles with no signed-in area. */
export const PUBLIC_HOME_PATH = '/';

/** Roles the public registration form is allowed to create. */
export const SELF_SERVICE_ROLES = Object.freeze([ROLES.resident]);

export const ROLE_DEFINITIONS = Object.freeze([
  Object.freeze({
    value: ROLES.resident,
    label: 'Resident',
    description: 'Follow the context and updates that matter around your home.',
    dashboardPath: DASHBOARD_PATH,
  }),
  Object.freeze({
    value: ROLES.estateAgent,
    label: 'Estate Agent',
    description: 'Manage listings and enquiries for the estate.',
    dashboardPath: ESTATE_AGENT_PATH,
  }),
  Object.freeze({
    value: ROLES.hoaAdmin,
    label: 'HOA Administrator',
    description: 'Run the estate: approvals, residents and community health.',
    dashboardPath: HOA_ADMIN_PATH,
  }),
  Object.freeze({
    value: ROLES.headAdmin || 'head_admin',
    label: 'Head Administrator',
    description: 'System administration.',
    dashboardPath: HEAD_ADMIN_PATH,
  }),
  Object.freeze({
    value: ROLES.casualVisitor,
    label: 'Visitor',
    description: 'Browse the public property pages only.',
    dashboardPath: PUBLIC_HOME_PATH,
  }),
]);

export const ROLE_VALUES = Object.freeze(ROLE_DEFINITIONS.map((role) => role.value));

/**
 * Older VALORA screens and stored sessions used display strings such as
 * "HOA Admin" or "Buyer". They are accepted here, once, so no page has to
 * carry its own compatibility list.
 */
const LEGACY_ROLE_ALIASES = Object.freeze({
  hoa: ROLES.hoaAdmin,
  'hoa admin': ROLES.hoaAdmin,
  'hoa administrator': ROLES.hoaAdmin,
  administrator: ROLES.hoaAdmin,
  'head admin': ROLES.hoaAdmin,
  headadministrator: ROLES.hoaAdmin,
  'head administrator': ROLES.hoaAdmin,
  'property owner': ROLES.resident,
  owner: ROLES.resident,
  agent: ROLES.estateAgent,
  'estate agent': ROLES.estateAgent,
  provider: ROLES.serviceProvider,
  'service provider': ROLES.serviceProvider,
  visitor: ROLES.casualVisitor,
  'casual visitor': ROLES.casualVisitor,
});

const UNKNOWN_ROLE = Object.freeze({
  value: '',
  label: 'VALORA member',
  description: 'A VALORA account holder.',
  dashboardPath: DASHBOARD_PATH,
});

/** Normalise any role value (API value or legacy display string) to a known value, or "". */
export function toRole(value) {
  const normalised = String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalised) return '';

  if (ROLE_VALUES.includes(normalised)) return normalised;
  return LEGACY_ROLE_ALIASES[normalised] ?? '';
}

export function isKnownRole(value) {
  return toRole(value) !== '';
}

export function getRoleDefinition(value) {
  const role = toRole(value);
  return ROLE_DEFINITIONS.find((definition) => definition.value === role) ?? UNKNOWN_ROLE;
}

export function roleLabel(value) {
  return getRoleDefinition(value).label;
}

/** The route a role lands on after signing in. */
export function dashboardPathForRole(value) {
  return getRoleDefinition(value).dashboardPath;
}

/** HOA administrators own the estate-administration screens. */
export function isAdministrator(value) {
  return toRole(value) === ROLES.hoaAdmin;
}

/** Public sign-up may only create these roles. */
export function isSelfServiceRole(value) {
  return SELF_SERVICE_ROLES.includes(toRole(value));
}

/* ------------------------------------------------------------------
   Route access

   Which role may open which screen, in one place. The route guard in
   App.jsx and the sidebar navigation both read this, so a link can
   never point at a screen the role is not allowed to open.
------------------------------------------------------------------ */
export const ACCESS_PUBLIC = 'public';
export const ACCESS_SHARED = 'shared';

/** Open to anyone, signed in or not. */
const PUBLIC_PATHS = Object.freeze([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/registration-pending',
  '/properties',
  '/property/:propertyId',
  /* The catch-all route the router falls back to is not a screen. */
  '*',
]);

/** Open to every signed-in role. */
const SHARED_PATHS = Object.freeze([
  '/dashboard',
  '/profile',
  '/providers',
  '/announcements',
  '/community-announcements',
  
]);

/** Screens that belong to one role's workspace. Keyed by role value, so the
 *  index below can be built without a second lookup. */
const ESTATE_ADMIN_PATHS = Object.freeze([
  '/hoa-admin',
  '/property-management',
  '/maintenance',
  '/resident-directory',
  '/resident-complaints',
  '/property-requests',
  '/property-approvals',
  '/registration-requests',
  '/create-agent',
]);

export const ROLE_PATHS = Object.freeze({
  /* Residents log and rate their own maintenance requests on /maintenance. */
  [ROLES.resident]: Object.freeze(['/valuation', '/request-to-sell', '/complaints', '/maintenance']),
  [ROLES.estateAgent]: Object.freeze([
    '/agent-dashboard',
    '/agent-listings',
    '/agent-edit-listings',
    '/agent-inquiries',
    '/valuation',
  ]),
  [ROLES.hoaAdmin]: ESTATE_ADMIN_PATHS,
  /* The head administrator runs everything the HOA does, plus user management. */
  head_admin: Object.freeze([...ESTATE_ADMIN_PATHS, '/head-admin', '/user-management']),
  [ROLES.serviceProvider]: Object.freeze([]),
  [ROLES.casualVisitor]: Object.freeze([]),
});

/** path → the roles allowed to open it, built from ROLE_PATHS. */
export const PATH_ROLES = Object.freeze(
  Object.entries(ROLE_PATHS).reduce((index, [role, paths]) => {
    for (const path of paths) {
      index[path] = Object.freeze([...(index[path] ?? []), role]);
    }
    return index;
  }, {}),
);

/** Every path this module knows about, in one list (used by the route inventory test). */
export const CLASSIFIED_PATHS = Object.freeze([
  ...PUBLIC_PATHS,
  ...SHARED_PATHS,
  ...Object.keys(PATH_ROLES),
]);

export function isPublicPath(path) {
  return PUBLIC_PATHS.includes(path);
}

/**
 * `ACCESS_PUBLIC`, `ACCESS_SHARED`, the role values allowed to open the path,
 * or `null` when the path is not part of the inventory.
 */
export function accessForPath(path) {
  if (PUBLIC_PATHS.includes(path)) return ACCESS_PUBLIC;
  if (SHARED_PATHS.includes(path)) return ACCESS_SHARED;
  return PATH_ROLES[path] ?? null;
}

/**
 * May this role open this screen? A path outside the inventory is refused, so
 * a new page has to be classified before it can be routed.
 */
export function canAccessRoute(value, path) {
  const access = accessForPath(path);

  if (access === null) return false;
  if (access === ACCESS_PUBLIC || access === ACCESS_SHARED) return true;
  return access.includes(toRole(value));
}

/** The workspace a role lands on (also used when a route is refused). */
export function defaultRouteForRole(value) {
  return dashboardPathForRole(value);
}
