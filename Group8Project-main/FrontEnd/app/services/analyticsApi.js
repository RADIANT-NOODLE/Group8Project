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

// ─────────────────────────────────────────────────────────────────────────────
// Estate Health — 5-pillar Living Score (v1.0.0, from VANTAGE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map one pillar component from the backend shape to the UI shape.
 * ``score`` is a string or null — null means "not enough evidence yet",
 * which is why it renders as words rather than as a zero.
 */
export function toComponent(c) {
  return {
    key: c.key,
    label: c.label,
    weight: Number(c.weight),
    status: c.status,
    score: c.score !== null && c.score !== undefined ? Number(c.score) : null,
    benchmark: c.benchmark ?? "",
    contribution: c.contribution !== null ? Number(c.contribution) : null,
    lostPoints: c.lost_points !== null ? Number(c.lost_points) : null,
    explanation: c.explanation ?? "",
    recommendation: c.recommendation ?? null,
    // Convenience: measured = score is a real number
    measured: c.status === "measured" && c.score !== null,
  };
}

export function toEstateHealth(record) {
  if (!record) return null;
  return {
    engineVersion: record.engine_version,
    asOf: record.as_of,
    windowStart: record.window_start,
    windowEnd: record.window_end,
    overallScore: record.overall_score !== null ? Number(record.overall_score) : null,
    status: record.status,                    // "scored" | "insufficient_data"
    measuredWeight: Number(record.measured_weight),
    unitCount: toNumber(record.unit_count) ?? 0,
    components: (record.components ?? []).map(toComponent),
    drivers: (record.drivers ?? []).map(toComponent),
  };
}

/** Fetch the full 5-pillar estate health score. */
export async function getEstateHealth() {
  return toEstateHealth(await apiRequest("/api/v1/analytics/estate-health"));
}
