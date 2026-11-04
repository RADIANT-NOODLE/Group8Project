/**
 * notificationApi.js — Valora notification inbox API client.
 */
import { apiRequest } from "./apiClient.js";

const BASE = "/api/v1/notifications";

/** Fetch the authenticated user's notification inbox. */
export async function listNotifications(limit = 50) {
  return apiRequest(`${BASE}?limit=${limit}`);
}

/** Mark specific notifications as read. */
export async function markRead(notificationIds) {
  return apiRequest(`${BASE}/mark-read`, { method: "POST", body: { notification_ids: notificationIds } });
}

/** Mark all notifications as read. */
export async function markAllRead() {
  return apiRequest(`${BASE}/mark-all-read`, { method: "POST", body: {} });
}

/** Get the user's notification preferences. */
export async function getPreferences() {
  return apiRequest(`${BASE}/preferences`);
}

/** Update one or more notification preference toggles. */
export async function updatePreferences(prefs) {
  return apiRequest(`${BASE}/preferences`, { method: "PATCH", body: prefs });
}
