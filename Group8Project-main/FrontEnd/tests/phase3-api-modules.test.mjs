/**
 * Phase 3 data layer — contract tests.
 *
 * Each module is checked against the API the backend actually exposes: URL,
 * method, bearer token, request payload and the mapping back into page shapes.
 * `fetch` is stubbed, so these run with no server and no database; the live
 * round-trip (complaints saved and read back from PostgreSQL) is verified
 * separately, against a running API.
 */
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

const { ApiError } = await import('../app/services/apiClient.js');
const statusMap = await import('../app/services/statusMap.js');
const propertyApi = await import('../app/services/propertyApi.js');
const complaintApi = await import('../app/services/complaintApi.js');
const listingApi = await import('../app/services/listingApi.js');
const workOrderApi = await import('../app/services/workOrderApi.js');
const announcementApi = await import('../app/services/announcementApi.js');
const providerApi = await import('../app/services/providerApi.js');
const analyticsApi = await import('../app/services/analyticsApi.js');

const BASE = 'http://api.valora.test';
const TOKEN = 'phase3-contract-token';

function jsonResponse(data, status = 200) {
  /* 204 must not carry a body. */
  if (status === 204) return new Response(null, { status });

  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/*
 * The API client wraps any error thrown by fetch as a connection failure, which
 * would hide a broken expectation. Assertions are collected here instead and
 * reported by the afterEach hook, so a bad URL reads as a bad URL.
 */
let requestFailures = [];

/** Assert the request the module made, then answer with `data`. */
function expectRequest(assertions, data, status = 200) {
  fetchHandler = async (url, options) => {
    try {
      assertions(url, options);
    } catch (error) {
      requestFailures.push(error);
    }

    return jsonResponse(data, status);
  };
}

test.beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem('valora_token', TOKEN);
  requestFailures = [];
  fetchHandler = () => {
    throw new Error('Unexpected fetch call');
  };
});

test.afterEach(() => {
  const failures = requestFailures;
  requestFailures = [];

  assert.deepEqual(
    failures.map((failure) => failure.message),
    [],
    'the request the module sent did not match the contract',
  );
});

/* ---------------------------------------------------------------- status map */

test('statuses: values, legacy labels and unknown values', () => {
  assert.deepEqual(
    statusMap.COMPLAINT_STATUSES.map((status) => status.value),
    ['submitted', 'under_review', 'in_progress', 'resolved', 'closed'],
  );

  assert.equal(statusMap.toComplaintStatus('under_review'), 'under_review');
  assert.equal(statusMap.toComplaintStatus('Under Review'), 'under_review');
  assert.equal(statusMap.toComplaintStatus('New'), 'submitted');
  assert.equal(statusMap.toComplaintStatus('in_progress'), 'in_progress');
  assert.equal(statusMap.complaintStatusLabel('in_progress'), 'In progress');
  assert.equal(statusMap.complaintStatusTone('resolved'), 'done');

  assert.equal(statusMap.toWorkOrderStatus('Contacted'), 'assigned');
  assert.equal(statusMap.workOrderStatusLabel('completed'), 'Completed');

  /* an unknown value is surfaced, not silently rewritten to the first option */
  assert.equal(statusMap.toComplaintStatus('awaiting_parts'), '');
  assert.equal(statusMap.complaintStatusLabel('awaiting_parts'), 'awaiting_parts');
});

/* ----------------------------------------------------------------- properties */

test('properties: list maps the page and sends only the given filters', async () => {
  expectRequest(
    (url, options) => {
      assert.equal(url, `${BASE}/api/v1/properties?page=2&page_size=10&bedrooms=3`);
      assert.equal(options.method, 'GET');
      assert.equal(options.headers.get('Authorization'), `Bearer ${TOKEN}`);
    },
    {
      count: 1,
      page: 2,
      page_size: 10,
      properties: [
        {
          id: 1,
          unit_no: 'A12',
          complex_name: 'Valora Estate',
          street_address: '12 Main Road',
          suburb: 'Bryanston',
          size_m2: '128.00',
          bedrooms: 3,
          bathrooms: 2,
        },
      ],
    },
  );

  const page = await propertyApi.listProperties({ page: 2, pageSize: 10, bedrooms: 3 });

  assert.equal(page.count, 1);
  assert.deepEqual(page.items[0], {
    id: 1,
    unitNo: 'A12',
    complexName: 'Valora Estate',
    streetAddress: '12 Main Road',
    suburb: 'Bryanston',
    sizeM2: 128,
    bedrooms: 3,
    bathrooms: 2,
    imageUrl: null,
    photos: [],
  });
});

test('properties: the resident unit is resolved from unit_no', async () => {
  expectRequest(
    (url) => assert.equal(url, `${BASE}/api/v1/properties?page_size=100`),
    {
      count: 2,
      page: 1,
      page_size: 100,
      properties: [
        { id: 4, unit_no: 'B07' },
        { id: 9, unit_no: 'a12' },
      ],
    },
  );

  assert.equal(await propertyApi.findUnitIdByUnitNo('A12'), 9);
  assert.equal(await propertyApi.findUnitIdByUnitNo(''), null);
  assert.equal(await propertyApi.findUnitIdByUnitNo(null), null);
});

test('properties: a 404 keeps the status and the API message', async () => {
  expectRequest(
    () => {},
    { detail: 'Property with id 999 was not found.' },
    404,
  );

  await assert.rejects(
    () => propertyApi.getProperty(999),
    (error) =>
      error instanceof ApiError &&
      error.status === 404 &&
      error.message === 'Property with id 999 was not found.',
  );
});

/* ----------------------------------------------------------------- complaints */

test('complaints: list sends filters and maps the records', async () => {
  expectRequest(
    (url) => {
      assert.equal(url, `${BASE}/api/v1/complaints?unit_id=1&status=under_review`);
    },
    {
      count: 1,
      page: 1,
      page_size: 20,
      complaints: [
        {
          id: 7,
          user_id: 1,
          unit_id: 1,
          category: 'Security',
          description: 'Gate motor trips at night.',
          photo_url: null,
          is_anonymous: false,
          status: 'under_review',
          assigned_to: null,
          resolved_at: null,
          created_at: '2026-10-11T18:15:00Z',
          updated_at: '2026-10-11T18:15:00Z',
        },
      ],
    },
  );

  const page = await complaintApi.listComplaints({
    unitId: 1,
    /* a display label must still reach the API as its value */
    status: 'Under Review',
  });

  assert.equal(page.count, 1);
  assert.equal(page.items[0].id, 7);
  assert.equal(page.items[0].status, 'under_review');
  assert.equal(page.items[0].rawStatus, 'under_review');
  assert.equal(page.items[0].isAnonymous, false);
  assert.equal(page.items[0].createdAt, '2026-10-11T18:15:00Z');
});

test('complaints: create sends the unit as an integer and never an author', async () => {
  expectRequest(
    (url, options) => {
      assert.equal(url, `${BASE}/api/v1/complaints`);
      assert.equal(options.method, 'POST');

      const body = JSON.parse(options.body);
      assert.deepEqual(body, {
        unit_id: 1,
        category: 'Security',
        description: 'Gate motor trips at night.',
        is_anonymous: false,
        photo_url: null,
      });
      assert.equal('user_id' in body, false);
      assert.equal('status' in body, false);
    },
    {
      id: 12,
      unit_id: 1,
      category: 'Security',
      description: 'Gate motor trips at night.',
      status: 'submitted',
    },
    201,
  );

  const complaint = await complaintApi.createComplaint({
    unitId: '1',
    category: 'Security',
    description: '  Gate motor trips at night.  ',
  });

  assert.equal(complaint.id, 12);
  assert.equal(complaint.status, 'submitted');
});

test('complaints: status updates use the value, and stats map their totals', async () => {
  expectRequest(
    (url, options) => {
      assert.equal(url, `${BASE}/api/v1/complaints/7/status`);
      assert.equal(options.method, 'PATCH');
      assert.deepEqual(JSON.parse(options.body), {
        status: 'resolved',
        assigned_to: 'Dlamini Plumbing',
      });
    },
    { id: 7, status: 'resolved', assigned_to: 'Dlamini Plumbing' },
  );

  const updated = await complaintApi.updateComplaintStatus(7, {
    status: 'Resolved',
    assignedTo: 'Dlamini Plumbing',
  });
  assert.equal(updated.status, 'resolved');
  assert.equal(updated.assignedTo, 'Dlamini Plumbing');

  expectRequest(
    (url) => assert.equal(url, `${BASE}/api/v1/complaints/stats`),
    {
      total: 4,
      by_status: { submitted: 3, resolved: 1 },
      by_category: { Security: 4 },
      resolution_rate_pct: '25.00',
      avg_resolution_hours: null,
    },
  );

  const stats = await complaintApi.getComplaintStats();
  assert.equal(stats.total, 4);
  assert.equal(stats.resolutionRatePct, 25);
  assert.equal(stats.avgResolutionHours, null);
  assert.deepEqual(stats.byStatus, { submitted: 3, resolved: 1 });
});

/* ------------------------------------------------------------------- listings */

test('listings: my listings are filtered by the signed-in agent', async () => {
  expectRequest(
    (url) => assert.equal(url, `${BASE}/api/v1/listings?page_size=50&agent_id=3`),
    { count: 0, page: 1, page_size: 50, listings: [] },
  );

  const page = await listingApi.listMyListings(3, { pageSize: 50 });
  assert.equal(page.count, 0);
  assert.deepEqual(page.items, []);
});

test('listings: create never sends an agent id, update maps status to its value', async () => {
  expectRequest(
    (url, options) => {
      assert.equal(url, `${BASE}/api/v1/listings`);
      assert.equal(options.method, 'POST');

      const body = JSON.parse(options.body);
      assert.deepEqual(body, {
        unit_id: 5,
        price: '2450000.00',
        description: 'Sunny two bedroom.',
        photo_url: null,
      });
      assert.equal('agent_id' in body, false);
    },
    { id: 3, unit_id: 5, agent_id: 3, price: '2450000.00', status: 'active' },
    201,
  );

  const created = await listingApi.createListing({
    unitId: 5,
    price: '2450000.00',
    description: 'Sunny two bedroom.',
  });
  assert.equal(created.id, 3);
  assert.equal(created.price, 2450000);

  expectRequest(
    (url, options) => {
      assert.equal(url, `${BASE}/api/v1/listings/3`);
      assert.equal(options.method, 'PATCH');
      assert.deepEqual(JSON.parse(options.body), { status: 'withdrawn', price: 2300000 });
    },
    { id: 3, status: 'withdrawn', price: '2300000.00' },
  );

  const updated = await listingApi.updateListing(3, { status: 'Withdrawn', price: 2300000 });
  assert.equal(updated.status, 'withdrawn');
});

/* ---------------------------------------------------------------- work orders */

test('work orders: assign and rate send the agreed payloads', async () => {
  expectRequest(
    (url, options) => {
      assert.equal(url, `${BASE}/api/v1/work-orders`);
      assert.equal(options.method, 'POST');
      assert.deepEqual(JSON.parse(options.body), {
        complaint_id: 7,
        provider_id: 2,
        job_cost: 1450.5,
        estimated_completion_date: null,
      });
    },
    { id: 1, complaint_id: 7, provider_id: 2, status: 'assigned' },
    201,
  );

  const created = await workOrderApi.createWorkOrder({
    complaintId: 7,
    providerId: 2,
    jobCost: 1450.5,
  });
  assert.equal(created.status, 'assigned');

  expectRequest(
    (url, options) => {
      assert.equal(url, `${BASE}/api/v1/work-orders/1/rating`);
      assert.deepEqual(JSON.parse(options.body), { rating: 5 });
    },
    { id: 1, resident_rating: 5, status: 'completed' },
  );

  const rated = await workOrderApi.rateWorkOrder(1, 5);
  assert.equal(rated.residentRating, 5);
  assert.equal(rated.status, 'completed');
});

test('work orders: list maps filters and page size', async () => {
  expectRequest(
    (url) => assert.equal(url, `${BASE}/api/v1/work-orders?status=in_progress`),
    { count: 0, page: 1, page_size: 20, work_orders: [] },
  );

  assert.equal((await workOrderApi.listWorkOrders({ status: 'In Progress' })).count, 0);
});

/* ------------------------------------------------------------- announcements */

test('announcements: create and delete', async () => {
  expectRequest(
    (url, options) => {
      assert.equal(url, `${BASE}/api/v1/announcements`);
      assert.equal(options.method, 'POST');
      assert.deepEqual(JSON.parse(options.body), {
        title: 'Water shutdown',
        message: 'Tuesday 09:00–13:00.',
        category: 'General',
        is_published: true,
        expires_at: null,
      });
    },
    { id: 4, title: 'Water shutdown', message: 'Tuesday 09:00–13:00.', created_by: 2 },
    201,
  );

  const created = await announcementApi.createAnnouncement({
    title: 'Water shutdown',
    message: 'Tuesday 09:00–13:00.',
  });
  assert.equal(created.id, 4);
  assert.equal(created.createdBy, 2);

  expectRequest(
    (url, options) => {
      assert.equal(url, `${BASE}/api/v1/announcements/4`);
      assert.equal(options.method, 'DELETE');
    },
    null,
    204,
  );

  assert.equal(await announcementApi.deleteAnnouncement(4), true);
});

/* ----------------------------------------------------------------- providers */

test('providers: filters, reviews and the rating payload', async () => {
  expectRequest(
    (url) => assert.equal(url, `${BASE}/api/v1/providers?trade=plumber&verified=true`),
    {
      count: 1,
      providers: [
        {
          id: 2,
          full_name: 'Dlamini Plumbing',
          trade: 'plumber',
          phone: '0115551234',
          email: 'info@dlamini.example',
          avg_rating: '4.50',
          total_reviews: 3,
          verified: true,
          emergency_available: false,
        },
      ],
    },
  );

  const providers = await providerApi.listProviders({ trade: 'plumber', verified: true });
  assert.equal(providers.count, 1);
  assert.equal(providers.items[0].avgRating, 4.5);
  assert.equal(providers.items[0].verified, true);
  assert.equal(providers.items[0].emergencyAvailable, false);

  expectRequest(
    (url, options) => {
      assert.equal(url, `${BASE}/api/v1/providers/2/reviews`);
      assert.equal(options.method, 'POST');
      assert.deepEqual(JSON.parse(options.body), { rating: 4, comment: 'Quick and tidy.' });
    },
    { id: 9, user_id: 1, provider_id: 2, rating: 4, comment: 'Quick and tidy.' },
    201,
  );

  const review = await providerApi.createProviderReview(2, { rating: 4, comment: 'Quick and tidy.' });
  assert.equal(review.rating, 4);
});

/* ----------------------------------------------------------------- analytics */

test('analytics: the Living Score is mapped for the page', async () => {
  expectRequest(
    (url) => assert.equal(url, `${BASE}/api/v1/properties/1/living-score`),
    {
      property_id: 1,
      score: 84,
      community_health_factor: '100.00',
      maintenance_factor: '75.00',
      provider_reliability_factor: '70.00',
      complaints_considered: 3,
      work_orders_considered: 2,
    },
  );

  const score = await analyticsApi.getLivingScore(1);
  assert.equal(score.score, 84);
  assert.equal(score.maintenanceFactor, 75);
  assert.equal(score.complaintsConsidered, 3);
});

test('every module sends the bearer token and never a body on a GET', async () => {
  const seen = [];

  fetchHandler = async (url, options) => {
    seen.push({ url, method: options.method, auth: options.headers.get('Authorization'), body: options.body });
    return jsonResponse({ count: 0, page: 1, page_size: 20, properties: [], complaints: [], listings: [], work_orders: [], announcements: [], providers: [], reviews: [] });
  };

  await propertyApi.listProperties();
  await complaintApi.listComplaints();
  await listingApi.listListings();
  await workOrderApi.listWorkOrders();
  await announcementApi.listAnnouncements();
  await providerApi.listProviders();

  assert.equal(seen.length, 6);
  for (const request of seen) {
    assert.equal(request.method, 'GET');
    assert.equal(request.auth, `Bearer ${TOKEN}`);
    assert.equal(request.body, undefined);
  }
});
