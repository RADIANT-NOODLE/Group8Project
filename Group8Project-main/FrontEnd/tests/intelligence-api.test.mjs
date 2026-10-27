import assert from 'node:assert/strict';
import test from 'node:test';

process.env.VITE_USE_MOCK_AUTH = 'false';
process.env.VITE_API_BASE_URL = 'http://api.valora.test';

class MemoryStorage {
  #items = new Map();
  getItem(key) { return this.#items.get(key) ?? null; }
  setItem(key, value) { this.#items.set(key, String(value)); }
  removeItem(key) { this.#items.delete(key); }
}

globalThis.window = { localStorage: new MemoryStorage() };
globalThis.window.localStorage.setItem('valora_token', 'intelligence-test-token');

const requests = [];
globalThis.fetch = async (url, options) => {
  requests.push({ url: String(url), options });
  const payload = String(url).endsWith('/ask')
    ? { answer: 'There are two open complaints.', evidence: ['Complaint records: 2 open of 5.'] }
    : {
      scope: 'Maple Court',
      as_of: '2026-10-27T18:00:00Z',
      role: 'hoa_admin',
      units_count: 4,
      complaints_total: 5,
      open_complaints: 2,
      resolved_complaints: 3,
      work_orders_total: 3,
      active_work_orders: 1,
      overdue_work_orders: 0,
      findings: [],
      recent_records: [],
    };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

const { askIntelligence, getIntelligence } = await import('../app/services/intelligenceApi.js');

test('summary reads the scoped Intelligence endpoint with the bearer token', async () => {
  requests.length = 0;
  const controller = new AbortController();
  const result = await getIntelligence({ signal: controller.signal });

  assert.equal(result.scope, 'Maple Court');
  assert.equal(requests[0].url, 'http://api.valora.test/api/v1/analytics/intelligence');
  assert.equal(requests[0].options.headers.get('Authorization'), 'Bearer intelligence-test-token');
  assert.equal(requests[0].options.signal, controller.signal);
});

test('Ask VALORA sends the question and returns evidence', async () => {
  requests.length = 0;
  const result = await askIntelligence('How many complaints are open?');

  assert.equal(requests[0].url, 'http://api.valora.test/api/v1/analytics/intelligence/ask');
  assert.equal(requests[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(requests[0].options.body), {
    question: 'How many complaints are open?',
  });
  assert.equal(result.evidence.length, 1);
});
