/**
 * Complaints — `/api/v1/complaints`.
 *
 * The backend decides who may see what: an HOA administrator sees every
 * complaint, everyone else sees only their own, and an anonymous complaint hides
 * its author from everyone but the author. Pages therefore never filter by
 * author themselves.
 *
 * `unit_id` is the integer id from `properties`, and the author always comes
 * from the access token, never from the request body.
 */
import { apiBlobRequest, apiRequest } from './apiClient.js';
import {
  buildQuery,
  readPage,
  toBoolean,
  toDecimal,
  toNumber,
  toStringOrNull,
} from './apiResponse.js';
import { toComplaintStatus } from './statusMap.js';

const BASE_PATH = '/api/v1/complaints';

export function toComplaint(record) {
  return {
    id: toNumber(record?.id),
    userId: toNumber(record?.user_id),
    unitId: toNumber(record?.unit_id),
    category: toStringOrNull(record?.category) ?? 'General',
    description: toStringOrNull(record?.description) ?? '',
    photoUrl: toStringOrNull(record?.photo_url),
    isAnonymous: toBoolean(record?.is_anonymous),
    status: toComplaintStatus(record?.status),
    rawStatus: toStringOrNull(record?.status),
    assignedTo: toStringOrNull(record?.assigned_to),
    resolvedAt: toStringOrNull(record?.resolved_at),
    createdAt: toStringOrNull(record?.created_at),
    updatedAt: toStringOrNull(record?.updated_at),
  };
}

/** `filters`: `{ page, pageSize, unitId, status, category }`. */
export async function listComplaints(filters = {}) {
  const status = filters.status ? toComplaintStatus(filters.status) : '';

  const payload = await apiRequest(
    `${BASE_PATH}${buildQuery({
      page: filters.page,
      page_size: filters.pageSize,
      unit_id: filters.unitId,
      status: status || undefined,
      category: filters.category,
    })}`,
  );

  return readPage(payload, 'complaints', toComplaint);
}

export async function getComplaint(complaintId) {
  return toComplaint(await apiRequest(`${BASE_PATH}/${encodeURIComponent(complaintId)}`));
}

/** File a complaint. The author is the access token's user. */
export async function createComplaint({ unitId, category, description, isAnonymous = false, photoUrl = null }) {
  const payload = await apiRequest(BASE_PATH, {
    method: 'POST',
    body: {
      unit_id: Number(unitId),
      category: String(category ?? '').trim(),
      description: String(description ?? '').trim(),
      is_anonymous: Boolean(isAnonymous),
      photo_url: photoUrl || null,
    },
  });

  return toComplaint(payload);
}

/** Attach a photo to a complaint (its author or an admin). Returns the updated complaint. */
export async function uploadComplaintPhoto(complaintId, file) {
  const form = new FormData();
  form.append('file', file);

  return toComplaint(
    await apiRequest(`${BASE_PATH}/${encodeURIComponent(complaintId)}/photo`, {
      method: 'POST',
      body: form,
    }),
  );
}

/** A complaint's photo as a Blob; only its author and admins may read it. */
export function fetchComplaintPhoto(complaintId) {
  return apiBlobRequest(`${BASE_PATH}/${encodeURIComponent(complaintId)}/photo`);
}

/** HOA administrators move a complaint along, optionally naming an assignee. */
export async function updateComplaintStatus(complaintId, { status, assignedTo }) {
  /* Accept a value or a display label; the API only takes the value. */
  const body = { status: toComplaintStatus(status) || status };
  if (assignedTo !== undefined) body.assigned_to = assignedTo || null;

  return toComplaint(
    await apiRequest(`${BASE_PATH}/${encodeURIComponent(complaintId)}/status`, {
      method: 'PATCH',
      body,
    }),
  );
}

/** Estate-wide figures; HOA administrators only. */
export async function getComplaintStats() {
  const payload = await apiRequest(`${BASE_PATH}/stats`);

  return {
    total: toNumber(payload?.total) ?? 0,
    byStatus: { ...(payload?.by_status ?? {}) },
    byCategory: { ...(payload?.by_category ?? {}) },
    resolutionRatePct: toDecimal(payload?.resolution_rate_pct) ?? 0,
    avgResolutionHours: toDecimal(payload?.avg_resolution_hours),
  };
}
