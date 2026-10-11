/**
 * Phase 5 — hardening.
 *
 * Guards the things Phase 1–3 fixed so they cannot quietly come back, and pins
 * the work that is still outstanding instead of pretending it is done:
 *
 *   1. browser storage is a `services/` concern (an explicit debt list names
 *      the files still to be wired, so a *new* offender fails the suite),
 *   2. a plaintext password never reaches storage,
 *   3. the login and register inputs stay programmatically labelled,
 *   4. the route guard reads the session store, and signing in/out moves it,
 *   5. authorisation compares role values, never display strings,
 *   6. no page raises a browser alert/prompt/confirm dialog.
 */
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

process.env.VITE_USE_MOCK_AUTH = 'true';

class MemoryStorage {
  #items = new Map();

  getItem(key) {
    return this.#items.has(key) ? this.#items.get(key) : null;
  }

  setItem(key, value) {
    this.#items.set(key, String(value));
  }

  removeItem(key) {
    this.#items.delete(key);
  }

  clear() {
    this.#items.clear();
  }

  entries() {
    return [...this.#items.entries()];
  }
}

globalThis.window = { localStorage: new MemoryStorage() };

const APP_ROOT = new URL('../app/', import.meta.url);

async function readSource(relativePath) {
  return readFile(new URL(relativePath, APP_ROOT), 'utf8');
}

async function listAppFiles() {
  const paths = await readdir(APP_ROOT, { recursive: true });
  return paths.filter((path) => path.endsWith('.js') || path.endsWith('.jsx'));
}

/*
 * Browser storage outside `services/`.
 *
 * Phase 3 moved the complaints module onto the API. The rest is still on
 * `localStorage`; those files are named here (plan §Phase 3 §6) so this test
 * keeps shrinking the list rather than ignoring the rule. Wiring one of them
 * means deleting its line — and any file NOT on this list fails immediately.
 */
const STORAGE_DEBT = [
  'data/inquiryStorage.js',
  'data/propertyRequests.js',
  'data/propertyStorage.js',
  'pages/EstateAgent/AgentListings.jsx',
  'pages/Maintenance/Maintenance.jsx',
];

test('browser storage stays inside services/, except the named debt', async () => {
  const files = await listAppFiles();
  const offenders = [];

  for (const file of files) {
    const normalised = file.replaceAll('\\', '/');
    if (normalised.startsWith('services/')) continue;

    const source = await readSource(normalised);
    if (!source.includes('localStorage')) continue;
    if (STORAGE_DEBT.includes(normalised)) continue;

    offenders.push(normalised);
  }

  assert.deepEqual(
    offenders,
    [],
    `localStorage must live in app/services/; new offenders: ${offenders.join(', ')}`,
  );

  /* The debt list must not name files that have already been wired. */
  const stale = [];

  for (const file of STORAGE_DEBT) {
    const source = await readSource(file);
    if (!source.includes('localStorage')) stale.push(file);
  }

  assert.deepEqual(
    stale,
    [],
    `these files are wired already; remove them from STORAGE_DEBT: ${stale.join(', ')}`,
  );
});

/* ------------------------------------------------------------------ passwords */

test('a plaintext password never reaches browser storage', async () => {
  const password = 'plaintext-must-not-survive-9';
  const auth = await import('../app/services/mockAuthService.js');

  window.localStorage.clear();

  await auth.register({
    first_name: 'Jane',
    last_name: 'Resident',
    email: 'hardening@example.com',
    password,
    role: 'resident',
  });

  const stored = window.localStorage.entries();
  assert.ok(stored.length > 0, 'registration should have stored a session');

  for (const [key, value] of stored) {
    assert.equal(
      String(value).includes(password),
      false,
      `the plaintext password was found in "${key}"`,
    );
  }

  /* the password still works, so it was hashed rather than dropped */
  auth.logout();
  const result = await auth.login({ email: 'hardening@example.com', password });
  assert.equal(result.user.email, 'hardening@example.com');
});

/* --------------------------------------------------------------- form labelling */

test('the login and register inputs stay programmatically labelled', async () => {
  for (const page of ['pages/Auth/Login.jsx', 'pages/Auth/Register.jsx']) {
    const source = await readSource(page);

    const inputs = [...source.matchAll(/<input\b[\s\S]*?\/>/g)].map((match) => match[0]);
    assert.ok(inputs.length > 0, `${page} should contain inputs`);

    const labelled = [...source.matchAll(/htmlFor="([^"]+)"/g)].map((match) => match[1]);

    for (const input of inputs) {
      const id = input.match(/id="([^"]+)"/)?.[1];
      assert.ok(id, `${page}: every input needs an id (${input.slice(0, 60)}…)`);
      assert.ok(
        labelled.includes(id),
        `${page}: no <label htmlFor="${id}"> for the input with id "${id}"`,
      );
      assert.ok(
        /autoComplete="/.test(input),
        `${page}: input "${id}" should declare autoComplete`,
      );
    }

    assert.ok(
      /type="password"/.test(source),
      `${page}: the password field must be type="password"`,
    );
  }

  /* the register form must not offer a role the public API will refuse */
  const register = await readSource('pages/Auth/Register.jsx');
  assert.equal(/<select/.test(register), false, 'registration has no role picker');
});

/* ------------------------------------------------------------------ route guard */

test('the route guard reads the session store, not storage directly', async () => {
  const app = await readSource('App.jsx');

  assert.ok(/useSession\(\)/.test(app), 'the guard should read the session store');
  assert.ok(/isAuthenticated/.test(app), 'the guard should gate on isAuthenticated');
  assert.ok(/to="\/login"/.test(app), 'a signed-out visitor goes to /login');
  assert.equal(
    /localStorage/.test(app),
    false,
    'App.jsx must not read browser storage itself',
  );

  const profile = await readSource('pages/Profile.jsx');
  assert.equal(
    /valora_(token|user)"|valoraUser|valoraLoggedIn/.test(profile),
    false,
    'no page may invent its own session keys',
  );
});

test('signing in and out moves the session the guard depends on', async () => {
  const session = await import('../app/services/session.js');
  const auth = await import('../app/services/mockAuthService.js');

  window.localStorage.clear();
  session.refreshSession();
  assert.equal(session.getSessionSnapshot().token, null);
  assert.equal(session.getSessionSnapshot().user, null);

  await session.login({ email: 'guard@example.com', password: 'password8' }).catch(async () => {
    /* first run: register, then log in */
    await session.register({
      first_name: 'Guard',
      last_name: 'Tester',
      email: 'guard@example.com',
      password: 'password8',
      role: 'resident',
    });
  });

  const snapshot = session.getSessionSnapshot();
  assert.ok(snapshot.token, 'a successful sign-in must publish a token');

  const user = session.getSessionUser(snapshot.user);
  assert.equal(user.role, 'resident');
  assert.equal(user.roleLabel, 'Resident');
  assert.equal(user.isAdministrator, false);

  session.logout();
  assert.equal(session.getSessionSnapshot().token, null);
  assert.equal(auth.getSession().token, null, 'logout must clear storage too');
});

/* ------------------------------------------------------------ role vocabulary */

/* -------------------------------------------------------- auth form integrity */

/*
 * The login and register fields each render exactly one input. A previous
 * cleanup merged the label rule, the control rule and the field wrapper into
 * one selector list, which gave the wrapper `div.auth-field` the control's
 * box — a second, empty input-shaped box behind every field, with the real
 * input overlapping it. These tests keep the three apart.
 */

test('each auth field renders exactly one labelled input', async () => {
  const forms = {
    'pages/Auth/Login.jsx': ['email', 'password'],
    'pages/Auth/Register.jsx': ['firstName', 'lastName', 'email', 'password'],
  };

  for (const [page, fieldIds] of Object.entries(forms)) {
    const source = await readSource(page);
    const inputs = [...source.matchAll(/<input\b[\s\S]*?\/>/g)].map((match) => match[0]);

    assert.equal(
      inputs.length,
      fieldIds.length,
      `${page}: expected ${fieldIds.length} inputs, found ${inputs.length}`,
    );

    /* Fields must not come from a loop or a conditional that could double them. */
    const formBody = source.split('<form')[1]?.split('</form>')[0] ?? '';
    assert.equal(/\.map\(|\.flatMap\(|visibleFields/.test(formBody), false, `${page}: fields must not be rendered from a list`);

    for (const id of fieldIds) {
      assert.equal(
        (source.match(new RegExp(`id="${id}"`, 'g')) ?? []).length,
        1,
        `${page}: id "${id}" must appear exactly once`,
      );
      assert.equal(
        inputs.filter((tag) => tag.includes(`id="${id}"`)).length,
        1,
        `${page}: exactly one <input> for "${id}"`,
      );
      assert.equal(
        (source.match(new RegExp(`htmlFor="${id}"`, 'g')) ?? []).length,
        1,
        `${page}: exactly one <label htmlFor="${id}">`,
      );
    }
  }

  /* Each form is mounted once, so React cannot render two copies of a field. */
  const app = await readSource('App.jsx');
  for (const path of ['/login', '/register']) {
    assert.equal(
      (app.match(new RegExp(`path="${path}"`, 'g')) ?? []).length,
      1,
      `App.jsx must route ${path} exactly once`,
    );
  }
});

test('auth CSS keeps labels, controls and the field wrapper apart', async () => {
  const css = await readSource('pages/Auth/Auth.css');

  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    /* strip comments: a comment inside a selector list means a dangling comma */
    raw: match[1],
    selectors: match[1]
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .split(',')
      .map((selector) => selector.trim())
      .filter(Boolean),
    body: match[2],
  }));

  for (const rule of rules) {
    /* a selector list broken by a comment = a rule that applies to something it should not */
    assert.equal(
      /,\s*(?:\/\*[\s\S]*?\*\/\s*)+[^,{}]*\{/.test(`${rule.raw}{`),
      false,
      `a comment sits inside a selector list (dangling comma): ${rule.raw.trim().slice(0, 60)}`,
    );

    const controlRule = rule.selectors.some((selector) => /\binput\b|select/.test(selector));
    const labelRule = rule.selectors.some((selector) => /label/.test(selector));

    if (controlRule) {
      for (const selector of rule.selectors) {
        /* the wrapper is a layout box, not an input: styling it as one paints a phantom field */
        assert.equal(
          selector === '.auth-field' || selector === '.form-group',
          false,
          `the field wrapper "${selector}" must not be styled as a control`,
        );
      }

      /* nothing that can stack one input over another */
      for (const forbidden of ['position: absolute', 'position:absolute', 'z-index', 'opacity: 0']) {
        assert.equal(
          rule.body.includes(forbidden),
          false,
          `a control rule uses "${forbidden}" — stacked inputs start here`,
        );
      }
    }

    if (labelRule && !controlRule) {
      for (const forbidden of ['border:', 'background:', 'border-radius:', 'height:']) {
        assert.equal(
          rule.body.includes(forbidden),
          false,
          `label rule "${rule.selectors.join(', ')}" carries the control box (${forbidden.trim()})`,
        );
      }
    }
  }
});

/* ------------------------------------------------------------ browser dialogs */

test('no page raises a browser alert, prompt or confirm dialog', async () => {
  const files = await listAppFiles();
  const offenders = [];

  const DIALOG_CALL = /\b(alert|prompt|confirm)\s*\(/;

  for (const file of files) {
    const normalised = file.replaceAll('\\', '/');
    const source = await readSource(normalised);

    if (DIALOG_CALL.test(source)) offenders.push(normalised);
  }

  assert.deepEqual(
    offenders,
    [],
    [
      'browser dialogs block the page, cannot be styled and cannot be tested.',
      'Use components/InlineMessage for results and components/ConfirmPrompt',
      `for destructive actions. Offenders: ${offenders.join(', ')}`,
    ].join(' '),
  );
});

test('every route that can destroy something asks for confirmation inline', async () => {
  const confirmable = [
    'pages/EstateAgent/AgentEditListings.jsx',
    'pages/Property/PropertyApprovals.jsx',
    'pages/Property/PropertyRequests.jsx',
  ];

  for (const page of confirmable) {
    const source = await readSource(page);

    assert.ok(
      /<ConfirmPrompt/.test(source),
      `${page} removes or rejects records, so it must confirm with <ConfirmPrompt>`,
    );
  }
});

test('authorisation never compares display strings', async () => {
  const files = await listAppFiles();
  const offenders = [];

  for (const file of files) {
    const normalised = file.replaceAll('\\', '/');
    const source = await readSource(normalised);

    /* comparisons against the legacy display values */
    if (
      /[!=]==?\s*"(Resident|Investor|Estate Agent|HOA Admin|Head Admin|Administrator|Service Provider|Property Owner|Buyer)"/.test(
        source,
      )
    ) {
      offenders.push(`${normalised} compares a role against a display string`);
    }
  }

  assert.deepEqual(offenders, [], offenders.join('\n'));
});

test('every page that shows a status uses the shared vocabulary', async () => {
  const statusMap = await import('../app/services/statusMap.js');

  const files = await listAppFiles();
  const offenders = [];

  for (const file of files) {
    const normalised = file.replaceAll('\\', '/');
    if (normalised.startsWith('services/')) continue;

    const source = await readSource(normalised);

    /* A page spelling out a backend status value means it guessed the vocabulary. */
    if (/(===|!==)\s*"(submitted|under_review|in_progress|resolved|closed|assigned|cancelled)"/.test(source)) {
      offenders.push(normalised);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `use services/statusMap.js instead of comparing status values directly: ${offenders.join(', ')}`,
  );

  /* the shared helpers answer in both directions */
  assert.equal(statusMap.toComplaintStatus('Closed'), 'closed');
  assert.equal(statusMap.complaintStatusLabel('closed'), 'Closed');
  assert.equal(statusMap.toStatus(statusMap.WORK_ORDER_STATUSES, 'cancelled'), 'cancelled');
});
