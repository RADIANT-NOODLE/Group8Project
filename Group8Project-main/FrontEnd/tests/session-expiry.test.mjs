import assert from 'node:assert/strict';
import test from 'node:test';

/* apiClient reads the stored token from window, so give it a minimal one. */
const stored = new Map();
const events = new EventTarget();
globalThis.window = {
  localStorage: {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, value),
    removeItem: (key) => stored.delete(key),
  },
  location: { protocol: 'http:', hostname: '127.0.0.1' },
  addEventListener: events.addEventListener.bind(events),
  removeEventListener: events.removeEventListener.bind(events),
  dispatchEvent: events.dispatchEvent.bind(events),
};

const { apiRequest, apiBlobRequest, SESSION_EXPIRED_EVENT } = await import('../app/services/apiClient.js');

const reported = [];
events.addEventListener(SESSION_EXPIRED_EVENT, (event) => reported.push(event.detail.token));

function answer(status) {
  globalThis.fetch = async () => new Response(JSON.stringify({ detail: 'x' }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function call(path, options, request = apiRequest) {
  reported.length = 0;
  await request(path, options).catch(() => {});
  return [...reported];
}

test('a refused stored login is reported, with the token that was refused', async () => {
  stored.set('valora_token', 'old-token');
  answer(401);
  assert.deepEqual(await call('/api/v1/complaints'), ['old-token']);
  assert.deepEqual(await call('/api/v1/complaints/1/photo', undefined, apiBlobRequest), ['old-token']);
});

test('the request still fails for the page that made it', async () => {
  stored.set('valora_token', 'old-token');
  answer(401);
  await assert.rejects(apiRequest('/api/v1/complaints'), (error) => error.status === 401);
});

test('a wrong current password does not count as an expired login', async () => {
  stored.set('valora_token', 'good-token');
  answer(401);
  assert.deepEqual(await call('/api/v1/auth/change-password', { method: 'POST' }), []);
});

test('a wrong password while logging in does not count', async () => {
  stored.set('valora_token', 'old-token');
  answer(401);
  assert.deepEqual(await call('/api/v1/auth/login', { method: 'POST', token: null }), []);
});

test('nothing is reported when nobody was logged in', async () => {
  stored.delete('valora_token');
  answer(401);
  assert.deepEqual(await call('/api/v1/properties'), []);
});

test('other failures and successes are not reported', async () => {
  stored.set('valora_token', 'good-token');
  for (const status of [200, 403, 404, 500]) {
    answer(status);
    assert.deepEqual(await call('/api/v1/complaints'), [], `status ${status}`);
  }
});
