/**
 * Work orders — `/api/v1/work-orders`.
 *
 * An HOA administrator assigns a complaint to a service provider; the resident
 * who raised the complaint rates the finished job, which feeds the Living
 * Score. Listing, creating and updating are administrator-only, so a page that
 * shows these controls must hide them for other roles (the guard is the
 * backend's, this is presentation).
 */
import { apiRequest } from './apiClient.js';
import { buildQuery, readPage, toDecimal, toNumber, toStringOrNull } from './apiResponse.js';
import { toStatus, toWorkOrderStatus, WORK_ORDER_STATUSES } from './statusMap.js';

const BASE_PATH = '/api/v1/work-orders';

export function toWorkOrder(record) {
  return {
    id: toNumber(record?.id),
    complaintId: toNumber(record?.complaint_id),
    providerId: toNumber(record?.provider_id),
    assignedAt: toStringOrNull(record?.assigned_at),
    resolvedAt: toStringOrNull(record?.resolved_at),
    jobCost: toDecimal(record?.job_cost),
    residentRating: toNumber(record?.resident_rating),
    completionNotes: toStringOrNull(record?.completion_notes),
    status: toWorkOrderStatus(record?.status),
    rawStatus: toStringOrNull(record?.status),
    estimatedCompletionDate: toStringOrNull(record?.estimated_completion_date),
    actualCompletionDate: toStringOrNull(record?.actual_completion_date),
    createdAt: toStringOrNull(record?.created_at),
    updatedAt: toStringOrNull(record?.updated_at),
  };
}

/** `filters`: `{ page, pageSize, complaintId, providerId, status }`. */
export async function listWorkOrders(filters = {}) {
  const status = filters.status ? toStatus(WORK_ORDER_STATUSES, filters.status) : '';

  const payload = await apiRequest(
    `${BASE_PATH}${buildQuery({
      page: filters.page,
      page_size: filters.pageSize,
      complaint_id: filters.complaintId,
      provider_id: filters.providerId,
      status: status || undefined,
    })}`,
  );

  return readPage(payload, 'work_orders', toWorkOrder);
}

export async function getWorkOrder(workOrderId) {
  return toWorkOrder(await apiRequest(`${BASE_PATH}/${encodeURIComponent(workOrderId)}`));
}

/** Assign a provider to a complaint (HOA administrators). */
export async function createWorkOrder({ complaintId, providerId, jobCost, estimatedCompletionDate }) {
  return toWorkOrder(
    await apiRequest(BASE_PATH, {
      method: 'POST',
      body: {
        complaint_id: Number(complaintId),
        provider_id: Number(providerId),
        job_cost: jobCost ?? null,
        estimated_completion_date: estimatedCompletionDate ?? null,
      },
    }),
  );
}

/** `patch`: any of `status`, `jobCost`, `completionNotes`, `estimatedCompletionDate`. */
export async function updateWorkOrder(workOrderId, patch = {}) {
  const body = {};

  if (patch.status !== undefined) {
    body.status = toStatus(WORK_ORDER_STATUSES, patch.status) || patch.status;
  }
  if (patch.jobCost !== undefined) body.job_cost = patch.jobCost;
  if (patch.completionNotes !== undefined) body.completion_notes = patch.completionNotes || null;
  if (patch.estimatedCompletionDate !== undefined) {
    body.estimated_completion_date = patch.estimatedCompletionDate || null;
  }

  return toWorkOrder(
    await apiRequest(`${BASE_PATH}/${encodeURIComponent(workOrderId)}`, { method: 'PATCH', body }),
  );
}

/** The resident rates a completed job 1–5. */
export async function rateWorkOrder(workOrderId, rating) {
  return toWorkOrder(
    await apiRequest(`${BASE_PATH}/${encodeURIComponent(workOrderId)}/rating`, {
      method: 'POST',
      body: { rating: Number(rating) },
    }),
  );
}
