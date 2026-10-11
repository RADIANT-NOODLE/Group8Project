import assert from 'node:assert/strict';
import test from 'node:test';

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
}

globalThis.window = { localStorage: new MemoryStorage() };

const auth = await import('../app/services/mockAuthService.js');

function registration(overrides = {}) {
  return {
    first_name: 'Jane',
    last_name: 'Resident',
    email: ' Jane@Example.com ',
    password: 'password8',
    role: 'resident',
    ...overrides,
  };
}

test.beforeEach(() => window.localStorage.clear());

test('register creates public user, mock token, and persistent session', async () => {
  const result = await auth.register(registration());

  assert.equal(result.token_type, 'bearer');
  assert.match(result.access_token, /^mock\./);
  assert.equal(result.user.full_name, 'Jane Resident');
  assert.equal(result.user.email, 'jane@example.com');
  assert.equal(result.user.role, 'resident');
  assert.equal('password' in result.user, false);
  assert.equal('password_hash' in result.user, false);

  const session = auth.getSession();
  assert.equal(session.token, result.access_token);
  assert.deepEqual(session.user, result.user);
});

test('mock users never store the plaintext password', async () => {
  const password = 'private-password8';
  await auth.register(registration({ password }));

  const rawUsers = window.localStorage.getItem(auth.mockAuthStorageKeys.users);
  assert.ok(rawUsers);
  assert.equal(rawUsers.includes(password), false);

  const [storedUser] = JSON.parse(rawUsers);
  assert.ok(storedUser.password_salt);
  assert.ok(storedUser.password_hash);
  assert.notEqual(storedUser.password_hash, password);
});

test('duplicate email is rejected case-insensitively', async () => {
  await auth.register(registration());

  await assert.rejects(
    () => auth.register(registration({ email: 'JANE@example.COM' })),
    (error) => error.code === 'EMAIL_EXISTS',
  );
});

test('login accepts correct password and rejects incorrect/unknown credentials generically', async () => {
  await auth.register(registration());
  auth.logout();

  const result = await auth.login({ email: 'JANE@EXAMPLE.COM', password: 'password8' });
  assert.equal(result.user.email, 'jane@example.com');

  await assert.rejects(
    () => auth.login({ email: 'jane@example.com', password: 'wrong-password' }),
    (error) => error.code === 'INVALID_CREDENTIALS' && error.message === 'Invalid email or password.',
  );
  await assert.rejects(
    () => auth.login({ email: 'missing@example.com', password: 'password8' }),
    (error) => error.code === 'INVALID_CREDENTIALS' && error.message === 'Invalid email or password.',
  );
});

test('logout clears session but keeps registered mock users', async () => {
  await auth.register(registration());
  auth.logout();

  assert.deepEqual(auth.getSession(), { token: null, user: null });
  assert.equal(JSON.parse(window.localStorage.getItem(auth.mockAuthStorageKeys.users)).length, 1);
});

test('all four VALORA roles can register and round-trip through the session', async () => {
  for (const [index, role] of auth.VALORA_ROLES.entries()) {
    window.localStorage.clear();
    const result = await auth.register(
      registration({ email: `role${index}@example.com`, role }),
    );
    assert.equal(result.user.role, role);
    assert.equal(auth.getSession().user.role, role);
  }
});

test('UI-only profile fields merge into the session without changing identity', async () => {
  const { user } = await auth.register(registration());

  const updated = auth.updateSessionUser({
    savedProperties: ['VAL-001'],
    recentlyViewed: ['VAL-002'],
    role: 'hoa_admin',
    email: 'attacker@example.com',
    id: 'someone-else',
  });

  assert.deepEqual(updated.savedProperties, ['VAL-001']);
  assert.deepEqual(updated.recentlyViewed, ['VAL-002']);

  /* identity survives a patch */
  assert.equal(updated.id, user.id);
  assert.equal(updated.email, 'jane@example.com');
  assert.equal(updated.role, 'resident');

  /* and the change is persisted, not just returned */
  const session = auth.getSession();
  assert.deepEqual(session.user.savedProperties, ['VAL-001']);
  assert.equal(session.user.role, 'resident');
});

test('updateSessionUser is a no-op when nobody is signed in', async () => {
  auth.logout();
  assert.equal(auth.updateSessionUser({ savedProperties: ['VAL-001'] }), null);
});

test('reading an in-progress session never cancels the sign-in being written', async () => {
  /*
   * Regression: the session is stored as two keys. Another tab's storage
   * listener reads between the token write and the profile write, so a read
   * that observes a half-written session must report "signed out" without
   * removing anything — otherwise the sign-in is destroyed.
   */
  window.localStorage.setItem(auth.mockAuthStorageKeys.token, 'mock.partial.signed-in');

  assert.deepEqual(auth.getSession(), { token: null, user: null });
  assert.equal(
    window.localStorage.getItem(auth.mockAuthStorageKeys.token),
    'mock.partial.signed-in',
    'a read must not remove the token',
  );

  /* The writer finishes, and the session is intact. */
  window.localStorage.setItem(
    auth.mockAuthStorageKeys.user,
    JSON.stringify({
      id: 'user-1',
      first_name: 'Jane',
      last_name: 'Resident',
      full_name: 'Jane Resident',
      email: 'jane@example.com',
      role: 'resident',
    }),
  );

  const session = auth.getSession();
  assert.equal(session.token, 'mock.partial.signed-in');
  assert.equal(session.user.email, 'jane@example.com');
});

test('invalid registration data and corrupt session are rejected safely', async () => {
  await assert.rejects(
    () => auth.register(registration({ password: 'short' })),
    (error) => error.code === 'VALIDATION_ERROR',
  );
  await assert.rejects(
    () => auth.register(registration({ role: 'admin' })),
    (error) => error.code === 'VALIDATION_ERROR',
  );

  window.localStorage.setItem(auth.mockAuthStorageKeys.token, 'bad-token');
  window.localStorage.setItem(auth.mockAuthStorageKeys.user, '{not-json');
  assert.deepEqual(auth.getSession(), { token: null, user: null });
});
