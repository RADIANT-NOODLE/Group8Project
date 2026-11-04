/**
 * Analytics — the Living Score is the only analytics the backend actually owns.
 *
 * `GET /api/v1/properties/{unit_id}/living-score` is deterministic and public.
 * ROI, AI training data and estate-wide analytics have no backend yet, so the
 * pages that show them must say so rather than invent numbers; this module
 * deliberately exposes nothing that would suggest otherwise.
 */
import { apiRequest } from './apiClient.js';
import { toDecimal, toNumber } from './apiResponse.js';

export function toLivingScore(record) {
  return {
    unitId: toNumber(record?.property_id),
    score: toNumber(record?.score),
    communityHealthFactor: toDecimal(record?.community_health_factor),
    maintenanceFactor: toDecimal(record?.maintenance_factor),
    providerReliabilityFactor: toDecimal(record?.provider_reliability_factor),
    complaintsConsidered: toNumber(record?.complaints_considered) ?? 0,
    workOrdersConsidered: toNumber(record?.work_orders_considered) ?? 0,
  };
}

export async function getLivingScore(unitId) {
  return toLivingScore(
    await apiRequest(`/api/v1/properties/${encodeURIComponent(unitId)}/living-score`, {
      token: null,
    }),
  );
}
