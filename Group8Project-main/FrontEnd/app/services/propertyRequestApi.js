/**
 * Property sale / rent requests — `/api/v1/property-requests`.
 *
 * A resident or investor asks the HOA to sell or rent a unit. The HOA approves
 * or rejects it, then assigns an approved estate agent. Estate agents only see
 * the requests assigned to them and everyone else only sees their own; the
 * backend decides, pages never filter by author.
 */
import { apiRequest } from './apiClient.js';
import { buildQuery, readPage, toDecimal, toNumber, toStringOrNull } from './apiResponse.js';

const BASE_PATH = '/api/v1/property-requests';

/** API status value -> the label the HOA and agent screens show and compare. */
export const REQUEST_STATUS_LABELS = Object.freeze({
  pending_review: 'Pending HOA Review',
  approved: 'Approved - Awaiting Agent Assignment',
  assigned: 'Assigned to Estate Agent',
  rejected: 'Rejected',
});

function requestTypeLabel(value) {
  const type = String(value ?? '').toLowerCase();
  if (type === 'sell') return 'Sell';
  if (type === 'rent') return 'Rent';
  return '';
}

function propertyAddress(record) {
  return [record?.unit_no && `Unit ${record.unit_no}`, record?.complex_name, record?.street_address, record?.suburb]
    .filter(Boolean)
    .join(', ');
}

export function toPropertyRequest(record) {
  const status = toStringOrNull(record?.status);
  const askingPrice = toDecimal(record?.asking_price);
  const sizeM2 = toDecimal(record?.size_m2);

  return {
    id: toNumber(record?.id),
    requesterId: toNumber(record?.requester_id),
    requesterName: toStringOrNull(record?.requester_name) ?? '',
    requesterEmail: toStringOrNull(record?.requester_email) ?? '',
    requesterRole: toStringOrNull(record?.requester_role) ?? '',
    /* `propertyId` is the unit id as text: the agent screens key local listing data by it. */
    propertyId: record?.unit_id == null ? '' : String(record.unit_id),
    unitId: toNumber(record?.unit_id),
    unitNo: toStringOrNull(record?.unit_no) ?? '',
    complexName: toStringOrNull(record?.complex_name) ?? '',
    propertyAddress: propertyAddress(record),
    propertyType: '',
    bedrooms: record?.bedrooms ?? '',
    bathrooms: record?.bathrooms ?? '',
    propertySize: sizeM2 == null ? '' : `${sizeM2} m²`,
    requestType: requestTypeLabel(record?.request_type),
    askingPrice: askingPrice ?? '',
    rentalPeriod: toStringOrNull(record?.rental_period) ?? '',
    financialInformation: toStringOrNull(record?.financial_information) ?? '',
    additionalDetails: toStringOrNull(record?.additional_details) ?? '',
    status: REQUEST_STATUS_LABELS[status] ?? status ?? '',
    rawStatus: status,
    hoaDecision: status === 'rejected' ? 'Rejected' : status === 'pending_review' ? '' : 'Approved',
    rejectionReason: toStringOrNull(record?.rejection_reason) ?? '',
    assignedAgentId: record?.assigned_agent_id == null ? '' : String(record.assigned_agent_id),
    assignedAgentName: toStringOrNull(record?.assigned_agent_name) ?? '',
    assignedAt: toStringOrNull(record?.assigned_at) ?? '',
    createdAt: toStringOrNull(record?.created_at) ?? '',
    updatedAt: toStringOrNull(record?.updated_at) ?? '',
  };
}

/** `filters`: `{ page, pageSize, status, unitId }`. `status` is an API value. */
export async function listPropertyRequests(filters = {}) {
  const payload = await apiRequest(
    `${BASE_PATH}${buildQuery({
      page: filters.page,
      page_size: filters.pageSize ?? 100,
      status: filters.status,
      unit_id: filters.unitId,
    })}`,
  );

  return readPage(payload, 'requests', toPropertyRequest);
}

export async function getPropertyRequest(requestId) {
  return toPropertyRequest(await apiRequest(`${BASE_PATH}/${encodeURIComponent(requestId)}`));
}

/** Parse "R1,250,000" / "12 500.50" into a number the API accepts. */
export function parsePrice(value) {
  const number = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(number) ? number : 0;
}

export async function createPropertyRequest({
  unitId,
  requestType,
  askingPrice,
  rentalPeriod,
  financialInformation,
  additionalDetails,
}) {
  return toPropertyRequest(
    await apiRequest(BASE_PATH, {
      method: 'POST',
      body: {
        unit_id: Number(unitId),
        request_type: String(requestType ?? '').toLowerCase(),
        asking_price: parsePrice(askingPrice),
        rental_period: rentalPeriod || null,
        financial_information: String(financialInformation ?? '').trim() || null,
        additional_details: String(additionalDetails ?? '').trim() || null,
      },
    }),
  );
}

export async function approvePropertyRequest(requestId) {
  return toPropertyRequest(
    await apiRequest(`${BASE_PATH}/${encodeURIComponent(requestId)}/approve`, { method: 'POST' }),
  );
}

export async function rejectPropertyRequest(requestId, reason) {
  return toPropertyRequest(
    await apiRequest(`${BASE_PATH}/${encodeURIComponent(requestId)}/reject`, {
      method: 'POST',
      body: { reason },
    }),
  );
}

export async function assignEstateAgent(requestId, agentId) {
  return toPropertyRequest(
    await apiRequest(`${BASE_PATH}/${encodeURIComponent(requestId)}/assign-agent`, {
      method: 'POST',
      body: { agent_id: Number(agentId) },
    }),
  );
}
