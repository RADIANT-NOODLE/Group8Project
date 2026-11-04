/**
 * notificationApi.js — Valora notification inbox API client.
 */
import { apiClient } from "./apiClient.js";

const BASE = "/notifications";

/** Fetch the authenticated user's notification inbox. */
export async function listNotifications(limit = 50) {
  return apiClient.get(`${BASE}?limit=${limit}`);
}

/** Mark specific notifications as read. */
export async function markRead(notificationIds) {
  return apiClient.post(`${BASE}/mark-read`, { notification_ids: notificationIds });
}

/** Mark all notifications as read. */
export async function markAllRead() {
  return apiClient.post(`${BASE}/mark-all-read`, {});
}

/** Get the user's notification preferences. */
export async function getPreferences() {
  return apiClient.get(`${BASE}/preferences`);
}

/** Update one or more notification preference toggles. */
export async function updatePreferences(prefs) {
  return apiClient.patch(`${BASE}/preferences`, prefs);
}
