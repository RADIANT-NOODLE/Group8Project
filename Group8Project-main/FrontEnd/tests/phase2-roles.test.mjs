import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

const roles = await import('../app/services/roleMap.js');
const navigation = await import('../app/services/navigation.js');

const ALL_ROLES = Object.values(roles.ROLES);

test('every backend role has a label, a landing route and a definition', () => {
  assert.deepEqual(ALL_ROLES, [
    'casual_visitor',
    'resident',
    'investor',
    'estate_agent',
    'hoa_admin',
    'service_provider',
  ]);

  for (const role of ALL_ROLES) {
    assert.ok(roles.roleLabel(role), `${role} needs a label`);
    assert.ok(roles.dashboardPathForRole(role).startsWith('/'), `${role} needs a route`);
  }

  assert.equal(roles.roleLabel('hoa_admin'), 'HOA Administrator');
  assert.equal(roles.dashboardPathForRole('service_provider'), '/dashboard');
  assert.equal(roles.dashboardPathForRole('casual_visitor'), '/');
});

test('legacy display strings normalise into the one vocabulary', () => {
  const legacy = {
    'HOA Admin': 'hoa_admin',
    HOA: 'hoa_admin',
    Administrator: 'hoa_admin',
    'Head Admin': 'hoa_admin',
    'Head Administrator': 'hoa_admin',
    'Property Owner': 'resident',
    Buyer: 'investor',
    agent: 'estate_agent',
    'Estate Agent': 'estate_agent',
    Visitor: 'casual_visitor',
    '  investor  ': 'investor',
  };

  for (const [input, expected] of Object.entries(legacy)) {
    assert.equal(roles.toRole(input), expected, `${input} should be ${expected}`);
  }

  assert.equal(roles.toRole('admin'), '');
  assert.equal(roles.toRole(''), '');
  assert.equal(roles.toRole(null), '');
  assert.equal(roles.isKnownRole('superuser'), false);
  assert.equal(roles.isKnownRole('resident'), true);
});

test('authorisation helpers use values, not labels', () => {
  assert.equal(roles.isAdministrator('hoa_admin'), true);
  assert.equal(roles.isAdministrator('HOA Admin'), true);
  assert.equal(roles.isAdministrator('resident'), false);
  assert.equal(roles.isSelfServiceRole('resident'), true);
  assert.equal(roles.isSelfServiceRole('hoa_admin'), false);
});

test('route access follows the matrix', () => {
  /* a role cannot open another role's workspace */
  assert.equal(roles.canAccessRoute('resident', '/agent-listings'), false);
  assert.equal(roles.canAccessRoute('resident', '/user-management'), false);
  assert.equal(roles.canAccessRoute('resident', '/property-approvals'), false);
  assert.equal(roles.canAccessRoute('investor', '/roi'), true);
  assert.equal(roles.canAccessRoute('resident', '/roi'), false);
  assert.equal(roles.canAccessRoute('estate_agent', '/agent-edit-listings'), true);
  assert.equal(roles.canAccessRoute('service_provider', '/head-admin'), false);

  /* shared screens are open to every signed-in role, including administrators */
  for (const path of ['/dashboard', '/profile', '/providers', '/announcements']) {
    for (const role of ALL_ROLES) {
      assert.equal(roles.canAccessRoute(role, path), true, `${role} should reach ${path}`);
    }
  }

  /* maintenance belongs to the administrators; AI valuation to investors */
  assert.equal(roles.canAccessRoute('resident', '/maintenance'), false);
  assert.equal(roles.canAccessRoute('hoa_admin', '/maintenance'), true);
  assert.equal(roles.canAccessRoute('investor', '/maintenance'), false);

  /* public pages */
  assert.equal(roles.canAccessRoute('', '/properties'), true);
  assert.equal(roles.canAccessRoute('resident', '/login'), true);

  /* a path nobody classified is refused, so a new screen must be declared */
  assert.equal(roles.canAccessRoute('hoa_admin', '/secret-screen'), false);
  assert.equal(roles.accessForPath('/secret-screen'), null);
});

test('the sidebar only ever links to screens the role may open', () => {
  for (const [role, links] of Object.entries(navigation.NAVIGATION_BY_ROLE)) {
    assert.ok(Array.isArray(links));
    for (const link of links) {
      assert.equal(
        roles.canAccessRoute(role, link.path),
        true,
        `${role} must not be offered ${link.path}`,
      );
    }
  }

  assert.equal(navigation.navigationForRole('not-a-role').length, 0);
  assert.ok(navigation.navigationForRole('resident').length > 0);
});

test('pages reach the session only through the session module', async () => {
  const LEGACY_SESSION_KEYS = [
    'valoraUser',
    'valoraLoggedIn',
    'valoraUserEmail',
    "'valora_user'",
    "'valora_token'",
    '"valora_user"',
    '"valora_token"',
  ];

  const pagesDirectory = new URL('../app/pages/', import.meta.url);
  const relativePaths = await readdir(pagesDirectory, { recursive: true });
  const pageFiles = relativePaths.filter((path) => path.endsWith('.jsx'));

  assert.ok(pageFiles.length > 20, `expected the whole page tree, saw ${pageFiles.length}`);

  const offenders = [];

  for (const pageFile of pageFiles) {
    const source = await readFile(new URL(pageFile, pagesDirectory), 'utf8');
    for (const key of LEGACY_SESSION_KEYS) {
      if (source.includes(key)) offenders.push(`${pageFile} uses ${key}`);
    }
  }

  assert.deepEqual(offenders, [], offenders.join('\n'));
});

test('every routed screen in App.jsx is classified and guarded', async () => {
  const source = await readFile(new URL('../app/App.jsx', import.meta.url), 'utf8');

  const routedPaths = [...source.matchAll(/^\s*path="([^"]+)"\s*$/gm)].map((match) => match[1]);
  assert.ok(routedPaths.length >= 25, `expected the full route table, saw ${routedPaths.length}`);

  const needsGuard = [];

  for (const path of routedPaths) {
    const access = roles.accessForPath(path);
    assert.notEqual(access, null, `${path} is not in the access matrix`);
    if (access !== roles.ACCESS_PUBLIC) needsGuard.push(path);
  }

  const guards =
    [...source.matchAll(/<RoleRoute\s+path="/g)].length +
    [...source.matchAll(/<ProtectedRoute>/g)].length;

  assert.equal(
    guards,
    needsGuard.length,
    `${needsGuard.length} non-public routes need a guard, found ${guards}`,
  );

  /* the bespoke admin guard is gone: administration is the hoa_admin role */
  assert.equal(source.includes('HeadAdminRoute'), false);
});
