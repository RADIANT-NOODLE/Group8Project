/**
 * User administration — `/api/v1/users`. HOA administrators only.
 */
import { apiRequest } from './apiClient.js';

/** Every account, newest first. The API sends snake_case records; callers read them as-is. */
export async function listUsers() {
  const payload = await apiRequest('/api/v1/users/');
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  return [];
}

/** An HOA administrator creates an approved estate agent account with a temporary password. */
export async function createEstateAgent({ fullName, email, password, phone }) {
  return apiRequest('/api/v1/users/estate-agents', {
    method: 'POST',
    body: {
      full_name: String(fullName ?? '').trim(),
      email: String(email ?? '').trim(),
      password,
      phoneno: String(phone ?? '').trim() || null,
    },
  });
}

/** Approve a pending account so the person can sign in. */
export function approveUser(userId) {
  return apiRequest(`/api/v1/users/${encodeURIComponent(userId)}/approve`, { method: 'POST' });
}

/** Take approval away again (back to pending). */
export function revokeUser(userId) {
  return apiRequest(`/api/v1/users/${encodeURIComponent(userId)}/revoke`, { method: 'POST' });
}

/** Reject / remove an account. This deletes it. */
export function rejectUser(userId) {
  return apiRequest(`/api/v1/users/${encodeURIComponent(userId)}/reject`, { method: 'POST' });
}

const ROLE_LABELS = {
  resident: 'Resident',
  estate_agent: 'Estate Agent',
  hoa_admin: 'HOA Admin',
  head_admin: 'Head Admin',
  service_provider: 'Service Provider',
  casual_visitor: 'Visitor',
};

export function roleLabel(role) {
  return ROLE_LABELS[String(role ?? '').toLowerCase()] ?? String(role ?? '');
}
