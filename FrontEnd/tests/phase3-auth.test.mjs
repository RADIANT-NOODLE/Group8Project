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

const auth = await import('../src/auth/mockAuthService.js');

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
