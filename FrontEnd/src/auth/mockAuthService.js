const MOCK_USERS_KEY = 'valora_mock_users';
const TOKEN_KEY = 'valora_token';
const USER_KEY = 'valora_user';
const MOCK_REQUEST_DELAY_MS = 450;

export const VALORA_ROLES = Object.freeze([
  'resident',
  'investor',
  'estate_agent',
  'hoa_admin',
]);

export class AuthError extends Error {
  constructor(message, code = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new AuthError('Browser storage is unavailable.', 'STORAGE_UNAVAILABLE');
  }
  return window.localStorage;
}

function safeParse(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readUsers() {
  const users = safeParse(getStorage().getItem(MOCK_USERS_KEY), []);
  return Array.isArray(users) ? users : [];
}

function writeUsers(users) {
  getStorage().setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

function simulateRequestDelay() {
  return new Promise((resolve) => globalThis.setTimeout(resolve, MOCK_REQUEST_DELAY_MS));
}

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `mock-user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function createSalt() {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle) {
    throw new AuthError('Secure hashing is unavailable.', 'CRYPTO_UNAVAILABLE');
  }

  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(digest));
}

function toPublicUser(user) {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  };
}

function createMockToken(user) {
  const payload = {
    sub: user.id,
    role: user.role,
    mock: true,
    issued_at: Date.now(),
  };
  const encoded = btoa(JSON.stringify(payload))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
  return `mock.${encoded}.${createId()}`;
}

function saveSession(result) {
  const storage = getStorage();
  storage.setItem(TOKEN_KEY, result.access_token);
  storage.setItem(USER_KEY, JSON.stringify(result.user));
}

function validateRegistration(input) {
  const firstName = String(input.first_name ?? '').trim();
  const lastName = String(input.last_name ?? '').trim();
  const fullName = String(input.full_name ?? `${firstName} ${lastName}`).trim();
  const email = normalizeEmail(input.email);
  const password = String(input.password ?? '');
  const role = String(input.role ?? '');

  if (!fullName) throw new AuthError('Full name is required.', 'VALIDATION_ERROR');
  if (!email) throw new AuthError('Email address is required.', 'VALIDATION_ERROR');
  if (password.length < 8) {
    throw new AuthError('Password must be at least 8 characters.', 'VALIDATION_ERROR');
  }
  if (!VALORA_ROLES.includes(role)) {
    throw new AuthError('Select a valid VALORA role.', 'VALIDATION_ERROR');
  }

  return { firstName, lastName, fullName, email, password, role };
}

export async function register(input) {
  const registration = validateRegistration(input);
  await simulateRequestDelay();
  const users = readUsers();

  if (users.some((user) => user.email === registration.email)) {
    throw new AuthError('An account with this email already exists.', 'EMAIL_EXISTS');
  }

  const passwordSalt = createSalt();
  const passwordHash = await hashPassword(registration.password, passwordSalt);
  const storedUser = {
    id: createId(),
    first_name: registration.firstName,
    last_name: registration.lastName,
    full_name: registration.fullName,
    email: registration.email,
    role: registration.role,
    password_salt: passwordSalt,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  };

  writeUsers([...users, storedUser]);

  const result = {
    access_token: createMockToken(storedUser),
    token_type: 'bearer',
    user: toPublicUser(storedUser),
  };
  saveSession(result);
  return result;
}

export async function login({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  await simulateRequestDelay();
  const plainPassword = String(password ?? '');
  const users = readUsers();
  const storedUser = users.find((user) => user.email === normalizedEmail);

  if (!storedUser) {
    throw new AuthError('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  const suppliedHash = await hashPassword(plainPassword, storedUser.password_salt);
  if (suppliedHash !== storedUser.password_hash) {
    throw new AuthError('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  const result = {
    access_token: createMockToken(storedUser),
    token_type: 'bearer',
    user: toPublicUser(storedUser),
  };
  saveSession(result);
  return result;
}

export function logout() {
  const storage = getStorage();
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
}

export function getSession() {
  const storage = getStorage();
  const token = storage.getItem(TOKEN_KEY);
  const user = safeParse(storage.getItem(USER_KEY), null);

  if (!token || !user?.id || !user?.email || !VALORA_ROLES.includes(user.role)) {
    logout();
    return { token: null, user: null };
  }

  return { token, user };
}

export const mockAuthStorageKeys = Object.freeze({
  users: MOCK_USERS_KEY,
  token: TOKEN_KEY,
  user: USER_KEY,
});
