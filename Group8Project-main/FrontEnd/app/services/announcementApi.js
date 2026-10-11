/**
 * Announcements — `/api/v1/announcements`.
 *
 * Every signed-in role may read them; only HOA administrators may publish, edit
 * or delete, and the author comes from the access token.
 */
import { apiRequest } from './apiClient.js';
import { buildQuery, readPage, toNumber, toStringOrNull } from './apiResponse.js';

const BASE_PATH = '/api/v1/announcements';

export function toAnnouncement(record) {
  return {
    id: toNumber(record?.id),
    title: toStringOrNull(record?.title) ?? '',
    message: toStringOrNull(record?.message) ?? '',
    createdBy: toNumber(record?.created_by),
    expiresAt: toStringOrNull(record?.expires_at),
    createdAt: toStringOrNull(record?.created_at),
    updatedAt: toStringOrNull(record?.updated_at),
  };
}

/** `filters`: `{ page, pageSize, includeExpired }` (`includeExpired` is admin-only). */
export async function listAnnouncements(filters = {}) {
  const payload = await apiRequest(
    `${BASE_PATH}${buildQuery({
      page: filters.page,
      page_size: filters.pageSize,
      include_expired: filters.includeExpired ? true : undefined,
    })}`,
  );

  return readPage(payload, 'announcements', toAnnouncement);
}

export async function getAnnouncement(announcementId) {
  return toAnnouncement(await apiRequest(`${BASE_PATH}/${encodeURIComponent(announcementId)}`));
}

export async function createAnnouncement({ title, message, expiresAt }) {
  return toAnnouncement(
    await apiRequest(BASE_PATH, {
      method: 'POST',
      body: {
        title: String(title ?? '').trim(),
        message: String(message ?? '').trim(),
        expires_at: expiresAt ?? null,
      },
    }),
  );
}

/** `patch`: any of `title`, `message`, `expiresAt`. */
export async function updateAnnouncement(announcementId, patch = {}) {
  const body = {};

  if (patch.title !== undefined) body.title = String(patch.title).trim();
  if (patch.message !== undefined) body.message = String(patch.message).trim();
  if (patch.expiresAt !== undefined) body.expires_at = patch.expiresAt ?? null;

  return toAnnouncement(
    await apiRequest(`${BASE_PATH}/${encodeURIComponent(announcementId)}`, {
      method: 'PATCH',
      body,
    }),
  );
}

/** Answers `true` when the deletion was accepted (the endpoint replies 204). */
export async function deleteAnnouncement(announcementId) {
  await apiRequest(`${BASE_PATH}/${encodeURIComponent(announcementId)}`, { method: 'DELETE' });
  return true;
}
