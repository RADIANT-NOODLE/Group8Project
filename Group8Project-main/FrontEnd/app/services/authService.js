import { authMode, environment } from './environment.js';
import * as authApi from './authApi.js';
import * as mockAuthService from './mockAuthService.js';

const TOKEN_KEY = 'valora_token';
const USER_KEY = 'valora_user';

export const currentAuthMode = authMode;
export const isMockAuth = environment.useMockAuth;

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('Browser storage is unavailable.');
  }
  return window.localStorage;
}

function safeParse(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeUser(source = {}, fallback = {}) {
  const fullName = String(
    source.full_name ??
      fallback.full_name ??
      `${source.first_name ?? fallback.first_name ?? ''} ${source.last_name ?? fallback.last_name ?? ''}`,
  ).trim();
  const nameParts = fullName.split(/\s+/).filter(Boolean);

  /*
   * The API's public user is the base of the cached profile, so UI-only
   * fields a page has added (saved properties, recently viewed) survive a
   * re-read. `fallback` is never spread: it can be a registration payload
   * and must not put a password in storage.
   */
  return {
    ...source,
    id: source.id ?? fallback.id,
    first_name: String(source.first_name ?? fallback.first_name ?? nameParts[0] ?? '').trim(),
    last_name: String(source.last_name ?? fallback.last_name ?? nameParts.slice(1).join(' ')).trim(),
    full_name: fullName,
    email: String(source.email ?? fallback.email ?? '').trim().toLowerCase(),
    role: String(source.role ?? fallback.role ?? '').trim(),
  };
}

function validateAuthResult(result) {
  if (!result?.access_token) {
    throw new Error('The authentication response did not include an access token.');
  }
  if (!result.user?.id || !result.user?.email || !result.user?.role) {
    throw new Error('The authentication response did not include a valid user.');
  }
  return result;
}

function saveSession(result) {
  const validated = validateAuthResult(result);
  const storage = getStorage();
  storage.setItem(TOKEN_KEY, validated.access_token);
  storage.setItem(USER_KEY, JSON.stringify(validated.user));
  return validated;
}

function clearSession() {
  const storage = getStorage();
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
}

async function normalizeApiAuthResponse(response, fallback) {
  const accessToken = response?.access_token ?? response?.token;
  let userSource = response?.user;

  if (!userSource && response?.id && response?.email) {
    userSource = response;
  }
  if (!userSource && accessToken) {
    userSource = await authApi.me(accessToken);
  }

  return {
    access_token: accessToken,
    token_type: response?.token_type ?? 'bearer',
    user: normalizeUser(userSource, fallback),
  };
}

export function getSession() {
  if (isMockAuth) return mockAuthService.getSession();

  const storage = getStorage();
  const token = storage.getItem(TOKEN_KEY);
  const user = safeParse(storage.getItem(USER_KEY));

  /*
   * Reading must never write: the session is two keys, so a concurrent reader
   * (another tab's storage listener) can observe the instant between the token
   * write and the profile write. Clearing here would cancel a valid sign-in.
   * Only logout() removes the session.
   */
  if (!token || !user?.id || !user?.email || !user?.role) {
    return { token: null, user: null };
  }

  return { token, user: normalizeUser(user) };
}

export async function register(payload) {
  if (isMockAuth) return mockAuthService.register(payload);

  const response = await authApi.register(payload);
  const result = await normalizeApiAuthResponse(response, payload);
  return saveSession(result);
}

export async function login({ email, password }) {
  if (isMockAuth) return mockAuthService.login({ email, password });

  const response = await authApi.login({ email, password });
  const result = await normalizeApiAuthResponse(response, { email });
  return saveSession(result);
}

/**
 * Merge UI-only profile fields (saved properties, recently viewed) into the
 * cached session user. This is the only way a page may write to the session, so
 * there is exactly one storage contract (`valora_token` + `valora_user`).
 * Returns the updated user, or null when nobody is signed in.
 */
export function updateSessionUser(patch = {}) {
  if (isMockAuth) return mockAuthService.updateSessionUser(patch);

  const storage = getStorage();
  const stored = safeParse(storage.getItem(USER_KEY));

  if (!stored?.id) return null;

  /* Identity fields are re-applied last, so a patch can never change
   * id, email or role. */
  const updated = normalizeUser(
    { ...stored, ...patch, id: stored.id, email: stored.email, role: stored.role },
    stored,
  );
  storage.setItem(USER_KEY, JSON.stringify(updated));
  return updated;
}

export async function me() {
  const session = getSession();
  if (!session.token) throw new Error('No active authentication session.');
  if (isMockAuth) return session.user;

  const user = normalizeUser(await authApi.me(session.token), session.user);
  getStorage().setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  if (isMockAuth) {
    mockAuthService.logout();
    return;
  }
  clearSession();
}

