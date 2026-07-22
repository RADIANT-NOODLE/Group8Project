import { authMode, environment } from '../config/environment.js';
import * as authApi from '../api/authApi.js';
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

  return {
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

  if (!token || !user?.id || !user?.email || !user?.role) {
    clearSession();
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
