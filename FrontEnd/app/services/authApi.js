import { apiRequest } from './apiClient.js';

function registrationPayload(payload) {
  const firstName = String(payload.first_name ?? '').trim();
  const lastName = String(payload.last_name ?? '').trim();
  const fullName = String(payload.full_name ?? `${firstName} ${lastName}`).trim();

  const body = {
    full_name: fullName,
    email: String(payload.email ?? '').trim().toLowerCase(),
    password: payload.password,
    role: payload.role,
  };

  // Optional: only sent when the person entered one.
  const phone = String(payload.phone ?? '').trim();
  if (phone) body.phoneno = phone;

  return body;
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

/** Signed-in user updates their own name and phone number. */
export function updateProfile({ fullName, phone }) {
  return apiRequest('/api/v1/auth/me', {
    method: 'PATCH',
    body: {
      full_name: String(fullName ?? '').trim(),
      phoneno: String(phone ?? '').trim() || null,
    },
  });
}

/** Signed-in user changes their own password. */
export function changePassword({ currentPassword, newPassword }) {
  return apiRequest('/api/v1/auth/change-password', {
    method: 'POST',
    body: { current_password: currentPassword, new_password: newPassword },
  });
}

/**
 * Ask for a reset link. The API answers the same way whether or not the e-mail
 * has an account; `dev_reset_link` is only present in local development.
 */
export function forgotPassword(email) {
  return apiRequest('/api/v1/auth/forgot-password', {
    method: 'POST',
    token: null,
    body: { email: String(email ?? '').trim().toLowerCase() },
  });
}

/** Set a new password using the token from the reset link. */
export function resetPassword({ token, newPassword }) {
  return apiRequest('/api/v1/auth/reset-password', {
    method: 'POST',
    token: null,
    body: { token, new_password: newPassword },
  });
}
