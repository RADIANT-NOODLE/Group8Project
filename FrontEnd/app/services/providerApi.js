/**
 * Service providers and their reviews — `/api/v1/providers`.
 *
 * Reading needs a signed-in user; creating, editing and verifying need an HOA
 * administrator; only residents may leave a review, and one resident may review
 * a provider once (the backend enforces both).
 */
import { apiRequest } from './apiClient.js';
import { buildQuery, readCollection, toBoolean, toDecimal, toNumber, toStringOrNull } from './apiResponse.js';

const BASE_PATH = '/api/v1/providers';

export function toProvider(record) {
  return {
    id: toNumber(record?.id),
    fullName: toStringOrNull(record?.full_name) ?? '',
    trade: toStringOrNull(record?.trade) ?? '',
    phone: toStringOrNull(record?.phone),
    email: toStringOrNull(record?.email),
    avgRating: toDecimal(record?.avg_rating),
    totalReviews: toNumber(record?.total_reviews) ?? 0,
    verified: toBoolean(record?.verified),
    emergencyAvailable: toBoolean(record?.emergency_available),
  };
}

export function toReview(record) {
  return {
    id: toNumber(record?.id),
    userId: toNumber(record?.user_id),
    providerId: toNumber(record?.provider_id),
    rating: toNumber(record?.rating),
    comment: toStringOrNull(record?.comment),
    createdAt: toStringOrNull(record?.created_at),
  };
}

/** `filters`: `{ trade, verified, emergencyAvailable }`. */
export async function listProviders(filters = {}) {
  const payload = await apiRequest(
    `${BASE_PATH}${buildQuery({
      trade: filters.trade,
      verified: filters.verified === undefined ? undefined : Boolean(filters.verified),
      emergency_available:
        filters.emergencyAvailable === undefined ? undefined : Boolean(filters.emergencyAvailable),
    })}`,
  );

  return readCollection(payload, 'providers', toProvider);
}

export async function getMyProviderProfile() {
  return toProvider(await apiRequest(`${BASE_PATH}/me`));
}

export async function getProvider(providerId) {
  return toProvider(await apiRequest(`${BASE_PATH}/${encodeURIComponent(providerId)}`));
}

export async function createProvider({ fullName, trade, phone, email, verified, emergencyAvailable }) {
  return toProvider(
    await apiRequest(BASE_PATH, {
      method: 'POST',
      body: {
        full_name: fullName,
        trade,
        phone,
        email,
        verified: Boolean(verified),
        emergency_available: Boolean(emergencyAvailable),
      },
    }),
  );
}

/** `patch`: any of `fullName`, `trade`, `phone`, `email`, `verified`, `emergencyAvailable`. */
export async function updateProvider(providerId, patch = {}) {
  const body = {};

  if (patch.fullName !== undefined) body.full_name = patch.fullName;
  if (patch.trade !== undefined) body.trade = patch.trade;
  if (patch.phone !== undefined) body.phone = patch.phone;
  if (patch.email !== undefined) body.email = patch.email;
  if (patch.verified !== undefined) body.verified = Boolean(patch.verified);
  if (patch.emergencyAvailable !== undefined) {
    body.emergency_available = Boolean(patch.emergencyAvailable);
  }

  return toProvider(
    await apiRequest(`${BASE_PATH}/${encodeURIComponent(providerId)}`, { method: 'PATCH', body }),
  );
}

export async function listProviderReviews(providerId) {
  const payload = await apiRequest(
    `${BASE_PATH}/${encodeURIComponent(providerId)}/reviews`,
  );

  return readCollection(payload, 'reviews', toReview);
}

export async function createProviderReview(providerId, { rating, comment }) {
  return toReview(
    await apiRequest(`${BASE_PATH}/${encodeURIComponent(providerId)}/reviews`, {
      method: 'POST',
      body: { rating: Number(rating), comment: comment || null },
    }),
  );
}
