/**
 * The one place a signed-in person is read from.
 *
 * `authService` owns the storage contract (`valora_token` + `valora_user`); this
 * module keeps a single in-memory snapshot of it so components react to a sign-in
 * or sign-out instead of re-reading `localStorage` on every render.
 */
import { useSyncExternalStore } from 'react';

import * as authService from './authService.js';
import { isAdministrator, roleLabel, toRole } from './roleMap.js';

const EMPTY_SESSION = Object.freeze({ token: null, user: null });

let snapshot = readStorage();

const listeners = new Set();

let cachedUser = null;
let cachedRawUser = null;

function readStorage() {
  try {
    return authService.getSession();
  } catch {
    return EMPTY_SESSION;
  }
}

function sameSession(current, next) {
  if (current === next) return true;
  if (!current || !next) return false;

  return (
    current.token === next.token &&
    current.user?.id === next.user?.id &&
    current.user?.email === next.user?.email &&
    current.user?.role === next.user?.role &&
    current.user?.full_name === next.user?.full_name
  );
}

function publish(next) {
  if (sameSession(snapshot, next)) return snapshot;

  snapshot = next;
  listeners.forEach((listener) => listener());
  return snapshot;
}

/** Re-read storage and notify subscribers when the session actually changed. */
export function refreshSession() {
  return publish(readStorage());
}

export function getSessionSnapshot() {
  return snapshot;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * The signed-in user in the shape the dashboard screens expect: the API's
 * `id` / `full_name` / `email` / `role` plus the display helpers they render.
 * Returns `null` when nobody is signed in.
 */
export function getSessionUser(rawUser = getSessionSnapshot().user) {
  if (!rawUser || (!rawUser.id && !rawUser.user_id)) return null;

  // MEMOIZATION : If the rawUser has not changed, return the cached user
  if (cachedRawUser === rawUser) return cachedUser;
  const fullName = String(rawUser.full_name ?? '').trim();
  const nameParts = fullName.split(/\s+/).filter(Boolean);

  const firstName = String(rawUser.first_name ?? nameParts[0] ?? '').trim();
  const lastName = String(rawUser.last_name ?? nameParts.slice(1).join(' ')).trim();

  const initials = (
    `${firstName.charAt(0)}${lastName.charAt(0)}` || fullName.slice(0, 2)
  ).toUpperCase();

  const role = toRole(rawUser.role);

  cachedRawUser = rawUser;
  cachedUser = {
    id: rawUser.id || rawUser.user_id,
    full_name: fullName,
    firstName,
    lastName,
    fullName: fullName || 'VALORA User',
    name: fullName || 'VALORA User',
    initials,
    role,
    roleLabel: roleLabel(role),
    isAdministrator: isAdministrator(role),
  };

  return cachedUser;
}

/** The signed-in user's access token, or null. Read fresh from storage. */
export function getSessionToken() {
  return readStorage().token;
}

/**
 * The stored profile in the shape the older screens were written against
 * (`firstName`, `fullName`, `status` beside the API fields), or null when
 * nobody is signed in. Read fresh from storage, so it is safe outside React.
 */
export function getStoredUser() {
  const { user } = readStorage();
  if (!user) return null;

  return {
    ...user,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: user.full_name,
    status: user.hoa_approved ? 'Approved' : 'Pending',
  };
}

/**
 * Merge UI-only profile fields into the cached session user and notify every
 * subscriber. Returns the updated session user, or null when signed out.
 */
export function updateSessionUser(patch) {
  const updated = authService.updateSessionUser(patch);
  refreshSession();
  return updated ? getSessionUser(updated) : null;
}

export async function login(credentials) {
  const result = await authService.login(credentials);
  refreshSession();
  return result;
}

export async function register(payload) {
  const result = await authService.register(payload);
  refreshSession();
  return result;
}

export function logout() {
  authService.logout();
  refreshSession();
}

/**
 * Subscribe a component to the session. `isAuthenticated` is the only thing a
 * route guard should use; `refresh()` re-reads storage after an outside change.
 */
export function useSession() {
  const session = useSyncExternalStore(subscribe, getSessionSnapshot);

  return {
    token: session.token,
    user: getSessionUser(session.user),
    isAuthenticated: Boolean(session.token && (session.user?.id || session.user?.user_id)),
    login,
    register,
    logout,
    refresh: refreshSession,
  };
}

/* Keep other browser tabs in step: signing out in one tab signs out everywhere. */
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (event) => {
    if (!event.key || event.key === 'valora_token' || event.key === 'valora_user') {
      refreshSession();
    }
  });
}
