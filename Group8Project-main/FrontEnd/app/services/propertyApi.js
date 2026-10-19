/**
 * Properties — `GET|POST /api/v1/properties`.
 *
 * Public reads: the landing page, the property list and one property. A unit id
 * is an integer (`properties.unit_id`), never the old `VAL-001` display code.
 */
import { apiRequest } from './apiClient.js';
import { buildQuery, readPage, toDecimal, toNumber, toStringOrNull } from './apiResponse.js';

const BASE_PATH = '/api/v1/properties';

export function toProperty(record) {
  return {
    id: toNumber(record?.id),
    unitNo: toStringOrNull(record?.unit_no),
    complexName: toStringOrNull(record?.complex_name),
    streetAddress: toStringOrNull(record?.street_address),
    suburb: toStringOrNull(record?.suburb),
    sizeM2: toDecimal(record?.size_m2),
    bedrooms: toNumber(record?.bedrooms),
    bathrooms: toNumber(record?.bathrooms),
  };
}

/** `filters`: `{ page, pageSize, bedrooms, bathrooms, minSizeM2, maxSizeM2 }`. */
export async function listProperties(filters = {}) {
  const payload = await apiRequest(
    `${BASE_PATH}${buildQuery({
      page: filters.page,
      page_size: filters.pageSize,
      bedrooms: filters.bedrooms,
      bathrooms: filters.bathrooms,
      min_size_m2: filters.minSizeM2,
      max_size_m2: filters.maxSizeM2,
    })}`,
    { token: filters.token },
  );

  return readPage(payload, 'properties', toProperty);
}

export async function getProperty(unitId) {
  return toProperty(await apiRequest(`${BASE_PATH}/${encodeURIComponent(unitId)}`, { token: null }));
}

/**
 * Resolve the signed-in resident's unit.
 *
 * `GET /auth/me` returns `unit_no` ("A12") but nothing links a user record to a
 * unit id, so the id is matched against the property list. This is a stand-in
 * for the real user↔unit link; when the backend exposes one, only this function
 * changes.
 */
export async function findUnitIdByUnitNo(unitNo, { pageSize = 100, token } = {}) {
  const wanted = toStringOrNull(unitNo);
  if (!wanted) return null;

  const { items } = await listProperties({ pageSize, token });
  const match = items.find(
    (property) => String(property.unitNo ?? '').toLowerCase() === wanted.toLowerCase(),
  );

  return match ? match.id : null;
}

/** HOA admins register a unit. */
export function createProperty({ unitNo, complexName, streetAddress, suburb, sizeM2, bedrooms, bathrooms }) {
  return apiRequest(BASE_PATH, {
    method: 'POST',
    body: {
      unit_no: unitNo,
      complex_name: complexName,
      street_address: streetAddress,
      suburb: suburb ?? null,
      size_m2: sizeM2 ?? null,
      bedrooms: bedrooms ?? null,
      bathrooms: bathrooms ?? null,
    },
  }).then(toProperty);
}
