/**
 * Browser storage for UI-only data: preferences such as the collapsed sidebar,
 * and the screens that still keep their records in the browser (landing-page
 * copy, AI dataset settings, analytics fallbacks).
 *
 * Pages call these helpers instead of touching `localStorage`, so storage stays
 * a `services/` concern and a blocked or missing store never throws in a page.
 * The signed-in session is not kept here: that is `authService` / `session`.
 */

function getStore() {
  try {
    return typeof window !== 'undefined' ? window.localStorage ?? null : null;
  } catch {
    return null;
  }
}

export function readStoredItem(key) {
  try {
    return getStore()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** Returns false when the value could not be stored (quota, private mode). */
export function writeStoredItem(key, value) {
  try {
    getStore()?.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStoredItem(key) {
  try {
    getStore()?.removeItem(key);
  } catch {
    /* nothing stored, nothing to remove */
  }
}

export function listStoredKeys() {
  const store = getStore();
  if (!store) return [];

  try {
    return Array.from({ length: store.length }, (_, index) => store.key(index)).filter(Boolean);
  } catch {
    return [];
  }
}
