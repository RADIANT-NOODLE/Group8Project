import { environment } from './environment.js';

const TOKEN_KEY = 'valora_token';

export const SESSION_EXPIRED_EVENT = 'valora:session-expired';

/* A wrong current password also answers 401, but the login itself is still fine. */
const WRONG_PASSWORD_PATHS = ['/api/v1/auth/change-password'];

/** Tell the app the stored login was refused. The session module decides what to do. */
function reportRefusedLogin(pathname, usedToken) {
  if (!usedToken || typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  if (WRONG_PASSWORD_PATHS.some((path) => String(pathname).startsWith(path))) return;

  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { token: usedToken } }));
}

export class ApiError extends Error {
  constructor(message, { status = 0, data = null, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getStoredToken() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function buildUrl(pathname) {
  const path = String(pathname).startsWith('/') ? pathname : `/${pathname}`;
  return `${environment.apiBaseUrl}${path}`;
}

function extractErrorMessage(data, fallback) {
  if (typeof data === 'string' && data.trim()) return data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.detail === 'string') return data.detail;
  if (Array.isArray(data?.detail) && data.detail.length) {
    return data.detail
      .map((item) => item?.msg || item?.message)
      .filter(Boolean)
      .join(' ') || fallback;
  }
  return fallback;
}

async function parseResponse(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      throw new ApiError('The server returned invalid JSON.', {
        status: response.status,
        data: text,
      });
    }
  }

  return text;
}

export async function apiRequest(pathname, options = {}) {
  const {
    method = 'GET',
    body,
    token = undefined,
    headers: customHeaders = {},
    signal,
  } = options;

  const headers = new Headers({ Accept: 'application/json', ...customHeaders });
  const authToken = token === undefined ? getStoredToken() : token;
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);

  let requestBody;
  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      requestBody = body;
    } else {
      headers.set('Content-Type', 'application/json');
      requestBody = JSON.stringify(body);
    }
  }

  let response;
  try {
    response = await fetch(buildUrl(pathname), {
      method,
      headers,
      body: requestBody,
      signal,
    });
  } catch (error) {
    throw new ApiError('Unable to connect to the VALORA API.', { cause: error });
  }

  // a token passed in by the caller (login, register) is not the stored login
  if (response.status === 401 && token === undefined) reportRefusedLogin(pathname, authToken);

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(data, `Request failed with status ${response.status}.`),
      { status: response.status, data },
    );
  }

  return data;
}

/** A file from the API (e.g. a photo that needs the user's login), as a Blob. */
export async function apiBlobRequest(pathname) {
  const headers = new Headers();
  const authToken = getStoredToken();
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);

  let response;
  try {
    response = await fetch(buildUrl(pathname), { headers });
  } catch (error) {
    throw new ApiError('Unable to connect to the VALORA API.', { cause: error });
  }

  if (response.status === 401) reportRefusedLogin(pathname, authToken);

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}.`, { status: response.status });
  }

  return response.blob();
}

export function getApiBaseUrl() {
  return environment.apiBaseUrl;
}
