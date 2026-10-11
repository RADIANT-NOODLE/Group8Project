/**
 * Listings — `/api/v1/listings`.
 *
 * Reading is public. Creating and editing need an estate agent or HOA
 * administrator, and the agent is taken from the access token, never the body:
 * a page must not send `agent_id`. An agent may only edit their own listings,
 * which the backend enforces.
 *
 * There is no photo upload endpoint yet, so `photoUrl` carries a URL that was
 * produced elsewhere; do not send base64 data here.
 */
import { apiRequest } from './apiClient.js';
import { buildQuery, readPage, toDecimal, toNumber, toStringOrNull } from './apiResponse.js';
import { toStatus, LISTING_STATUSES } from './statusMap.js';

const BASE_PATH = '/api/v1/listings';

export function toListing(record) {
  return {
    id: toNumber(record?.id),
    unitId: toNumber(record?.unit_id),
    agentId: toNumber(record?.agent_id),
    price: toDecimal(record?.price),
    description: toStringOrNull(record?.description),
    photoUrl: toStringOrNull(record?.photo_url),
    status: toStringOrNull(record?.status),
    views: toNumber(record?.views),
    createdAt: toStringOrNull(record?.created_at),
    updatedAt: toStringOrNull(record?.updated_at),
  };
}

/** `filters`: `{ page, pageSize, status, unitId, agentId, minPrice, maxPrice }`. */
export async function listListings(filters = {}) {
  const status = filters.status ? toStatus(LISTING_STATUSES, filters.status) : '';

  const payload = await apiRequest(
    `${BASE_PATH}${buildQuery({
      page: filters.page,
      page_size: filters.pageSize,
      status: status || undefined,
      unit_id: filters.unitId,
      agent_id: filters.agentId,
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
    })}`,
    { token: filters.token },
  );

  return readPage(payload, 'listings', toListing);
}

export async function getListing(listingId) {
  return toListing(await apiRequest(`${BASE_PATH}/${encodeURIComponent(listingId)}`, { token: null }));
}

/** The signed-in agent's own listings. */
export function listMyListings(agentId, filters = {}) {
  return listListings({ ...filters, agentId });
}

export async function createListing({ unitId, price, description, photoUrl }) {
  return toListing(
    await apiRequest(BASE_PATH, {
      method: 'POST',
      body: {
        unit_id: Number(unitId),
        price,
        description: description || null,
        photo_url: photoUrl || null,
      },
    }),
  );
}

/** `patch`: any of `price`, `description`, `photoUrl`, `status`. */
export async function updateListing(listingId, patch = {}) {
  const body = {};

  if (patch.price !== undefined) body.price = patch.price;
  if (patch.description !== undefined) body.description = patch.description || null;
  if (patch.photoUrl !== undefined) body.photo_url = patch.photoUrl || null;
  if (patch.status !== undefined) body.status = toStatus(LISTING_STATUSES, patch.status) || patch.status;

  return toListing(
    await apiRequest(`${BASE_PATH}/${encodeURIComponent(listingId)}`, { method: 'PATCH', body }),
  );
}
