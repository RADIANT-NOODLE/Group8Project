const browserEnv = import.meta.env || {};
const nodeEnv = typeof process !== 'undefined' ? process.env || {} : {};

function readValue(name, fallback) {
  const value = browserEnv[name] ?? nodeEnv[name];
  return value === undefined || value === '' ? fallback : String(value);
}

function parseBoolean(value) {
  return String(value).trim().toLowerCase() !== 'false';
}

/*
 * With no VITE_API_BASE_URL set, the API is assumed to run on port 8000 of the
 * machine that served the page: localhost on the computer itself, and the
 * computer's network address (e.g. 10.0.0.9) when the site is opened on a phone.
 */
function defaultApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return 'http://127.0.0.1:8000';
}

export const environment = Object.freeze({
  apiBaseUrl: readValue('VITE_API_BASE_URL', defaultApiBaseUrl()).replace(/\/+$/, ''),
  useMockAuth: parseBoolean(readValue('VITE_USE_MOCK_AUTH', 'false')),
});

export const authMode = environment.useMockAuth ? 'mock' : 'api';
