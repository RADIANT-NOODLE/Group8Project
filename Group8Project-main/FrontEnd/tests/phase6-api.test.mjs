import assert from 'node:assert/strict';
import test from 'node:test';

process.env.VITE_USE_MOCK_AUTH = 'false';
process.env.VITE_API_BASE_URL = 'http://api.valora.test';

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

let fetchHandler;
globalThis.fetch = (...args) => fetchHandler(...args);

const authService = await import('../src/auth/authService.js');
const { ApiError, getApiBaseUrl } = await import('../src/api/client.js');

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function publicUser(overrides = {}) {
  return {
    id: 'user-1',
    full_name: 'Jane Resident',
    email: 'jane@example.com',
    role: 'resident',
    ...overrides,
  };
}

test.beforeEach(() => {
  window.localStorage.clear();
  fetchHandler = () => {
    throw new Error('Unexpected fetch call');
  };
});

test('environment selects API mode and configured base URL', () => {
  assert.equal(authService.currentAuthMode, 'api');
  assert.equal(authService.isMockAuth, false);
  assert.equal(getApiBaseUrl(), 'http://api.valora.test');
});

test('real registration sends agreed backend payload and stores session', async () => {
  fetchHandler = async (url, options) => {
    assert.equal(url, 'http://api.valora.test/api/v1/auth/register');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.get('Authorization'), null);
    assert.equal(options.headers.get('Content-Type'), 'application/json');
    assert.deepEqual(JSON.parse(options.body), {
      full_name: 'Jane Resident',
      email: 'jane@example.com',
      password: 'password8',
      role: 'resident',
    });
    return jsonResponse({
      access_token: 'real-register-token',
      token_type: 'bearer',
      user: publicUser(),
    }, 201);
  };

  const result = await authService.register({
    first_name: ' Jane ',
    last_name: ' Resident ',
    email: ' JANE@EXAMPLE.COM ',
    password: 'password8',
    role: 'resident',
  });

  assert.equal(result.access_token, 'real-register-token');
  assert.equal(result.user.first_name, 'Jane');
  assert.equal(result.user.last_name, 'Resident');
  assert.equal(window.localStorage.getItem('valora_token'), 'real-register-token');
  assert.equal(JSON.parse(window.localStorage.getItem('valora_user')).email, 'jane@example.com');
  assert.equal(window.localStorage.getItem('valora_user').includes('password8'), false);
});

test('real login sends normalized credentials and stores returned user', async () => {
  fetchHandler = async (url, options) => {
    assert.equal(url, 'http://api.valora.test/api/v1/auth/login');
    assert.equal(options.headers.get('Authorization'), null);
    assert.deepEqual(JSON.parse(options.body), {
      email: 'jane@example.com',
      password: 'password8',
    });
    return jsonResponse({
      access_token: 'real-login-token',
      token_type: 'bearer',
      user: publicUser(),
    });
  };

  const result = await authService.login({
    email: ' JANE@EXAMPLE.COM ',
    password: 'password8',
  });

  assert.equal(result.access_token, 'real-login-token');
  assert.equal(authService.getSession().user.role, 'resident');
});

test('token-only login automatically calls /me with bearer token', async () => {
  const calls = [];
  fetchHandler = async (url, options) => {
    calls.push(url);
    if (url.endsWith('/login')) {
      return jsonResponse({ access_token: 'token-needing-me', token_type: 'bearer' });
    }
    assert.equal(url, 'http://api.valora.test/api/v1/auth/me');
    assert.equal(options.method, 'GET');
    assert.equal(options.headers.get('Authorization'), 'Bearer token-needing-me');
    return jsonResponse(publicUser());
  };

  const result = await authService.login({ email: 'jane@example.com', password: 'password8' });
  assert.deepEqual(calls, [
    'http://api.valora.test/api/v1/auth/login',
    'http://api.valora.test/api/v1/auth/me',
  ]);
  assert.equal(result.user.email, 'jane@example.com');
});

test('me refreshes public user using stored bearer token', async () => {
  window.localStorage.setItem('valora_token', 'stored-real-token');
  window.localStorage.setItem('valora_user', JSON.stringify(publicUser()));

  fetchHandler = async (url, options) => {
    assert.equal(url, 'http://api.valora.test/api/v1/auth/me');
    assert.equal(options.headers.get('Authorization'), 'Bearer stored-real-token');
    return jsonResponse(publicUser({ full_name: 'Jane Updated' }));
  };

  const user = await authService.me();
  assert.equal(user.full_name, 'Jane Updated');
  assert.equal(JSON.parse(window.localStorage.getItem('valora_user')).full_name, 'Jane Updated');
});

test('backend errors preserve status and readable messages', async () => {
  fetchHandler = async () => jsonResponse({ detail: 'Email already registered.' }, 409);

  await assert.rejects(
    () => authService.register({
      first_name: 'Jane',
      last_name: 'Resident',
      email: 'jane@example.com',
      password: 'password8',
      role: 'resident',
    }),
    (error) => error instanceof ApiError && error.status === 409 && error.message === 'Email already registered.',
  );

  fetchHandler = async () => jsonResponse({
    detail: [{ loc: ['body', 'email'], msg: 'Enter a valid email address.', type: 'value_error' }],
  }, 422);

  await assert.rejects(
    () => authService.login({ email: 'bad', password: 'password8' }),
    (error) => error.status === 422 && error.message === 'Enter a valid email address.',
  );
});

test('network failures become a safe API connection error', async () => {
  fetchHandler = async () => {
    throw new TypeError('connection refused');
  };

  await assert.rejects(
    () => authService.login({ email: 'jane@example.com', password: 'password8' }),
    (error) => error instanceof ApiError && error.status === 0 && error.message === 'Unable to connect to the VALORA API.',
  );
});

test('real logout clears session storage', () => {
  window.localStorage.setItem('valora_token', 'real-token');
  window.localStorage.setItem('valora_user', JSON.stringify(publicUser()));
  authService.logout();
  assert.deepEqual(authService.getSession(), { token: null, user: null });
});
