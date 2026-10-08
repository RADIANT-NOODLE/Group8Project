import { apiRequest } from './client.js';

function registrationPayload(payload) {
  const firstName = String(payload.first_name ?? '').trim();
  const lastName = String(payload.last_name ?? '').trim();
  const fullName = String(payload.full_name ?? `${firstName} ${lastName}`).trim();

  return {
    full_name: fullName,
    email: String(payload.email ?? '').trim().toLowerCase(),
    password: payload.password,
    role: payload.role,
  };
}

export function register(payload) {
  return apiRequest('/api/v1/auth/register', {
    method: 'POST',
    token: null,
    body: registrationPayload(payload),
  });
}

export function login(payload) {
  return apiRequest('/api/v1/auth/login', {
    method: 'POST',
    token: null,
    body: {
      email: String(payload.email ?? '').trim().toLowerCase(),
      password: payload.password,
    },
  });
}

export function me(token) {
  return apiRequest('/api/v1/auth/me', {
    method: 'GET',
    token,
  });
}
