/**
 * Shared helpers for turning the API's snake_case payloads into the camelCase
 * shapes the pages use.
 *
 * Every API module keeps the same contract with the pages: a list call answers
 * `{ count, page, pageSize, items }` and a single record is a plain object.
 * Pages therefore never see a backend field name.
 */

/** A number, or `null` when the API omitted the value. */
export function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/** The API sends decimals as strings ("128.00"); the UI wants a number. */
export function toDecimal(value) {
  return toNumber(value);
}

export function toStringOrNull(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text ? text : null;
}

export function toBoolean(value) {
  return value === true;
}

/**
 * Read one of the API's paginated envelopes.
 *
 * `key` is the collection field the endpoint uses ("complaints", "listings", …)
 * and `mapItem` converts one record. A response without the expected collection
 * is a bug worth seeing, so it throws rather than silently returning nothing.
 */
export function readPage(payload, key, mapItem) {
  if (!payload || typeof payload !== 'object') {
    throw new Error(`The API did not return a ${key} page.`);
  }

  const records = payload[key];
  if (!Array.isArray(records)) {
    throw new Error(`The API response has no "${key}" list.`);
  }

  return {
    count: toNumber(payload.count) ?? records.length,
    page: toNumber(payload.page) ?? 1,
    pageSize: toNumber(payload.page_size) ?? records.length,
    items: records.map(mapItem),
  };
}

/**
 * Read an envelope that carries a collection but no paging (providers, reviews).
 */
export function readCollection(payload, key, mapItem) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload[key])) {
    throw new Error(`The API response has no "${key}" list.`);
  }

  return {
    count: toNumber(payload.count) ?? payload[key].length,
    items: payload[key].map(mapItem),
  };
}

/** Build a query string, dropping empty filters so the URL stays readable. */
export function buildQuery(params = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    query.set(key, String(value));
  }

  const text = query.toString();
  return text ? `?${text}` : '';
}
