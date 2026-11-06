/**
 * analyticsApi.js — Analytics API client for Valora.
 *
 * Rule: **the backend calculates, React displays.**
 * Nothing here derives, re-weights, averages or interpolates a score.
 * The endpoint returns the engine's result exactly as it was computed.
 */
import { apiRequest } from "./apiClient.js";
import { toDecimal, toNumber } from "./apiResponse.js";

// ─────────────────────────────────────────────────────────────────────────────
// Legacy per-property Living Score (3-pillar)
// ─────────────────────────────────────────────────────────────────────────────

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
    await apiRequest(`/api/v1/properties/${encodeURIComponent(unitId)}/living-score`),
  );
}
