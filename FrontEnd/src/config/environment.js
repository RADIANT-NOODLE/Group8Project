const browserEnv = import.meta.env || {};
const nodeEnv = typeof process !== 'undefined' ? process.env || {} : {};

function readValue(name, fallback) {
  const value = browserEnv[name] ?? nodeEnv[name];
  return value === undefined || value === '' ? fallback : String(value);
}

function parseBoolean(value) {
  return String(value).trim().toLowerCase() !== 'false';
}

export const environment = Object.freeze({
  apiBaseUrl: readValue('VITE_API_BASE_URL', 'http://localhost:8000').replace(/\/+$/, ''),
  useMockAuth: parseBoolean(readValue('VITE_USE_MOCK_AUTH', 'false')),
});

export const authMode = environment.useMockAuth ? 'mock' : 'api';
