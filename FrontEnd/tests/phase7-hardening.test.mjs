import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  AUTH_MESSAGES,
  getLoginErrorMessage,
  getRegistrationErrorMessage,
} from '../src/auth/authErrorMessages.js';
import {
  validateEmail,
  validateRegistrationPassword,
  validateRequired,
} from '../src/utils/validation.js';

const loginSource = await readFile(new URL('../src/pages/LoginPage.jsx', import.meta.url), 'utf8');
const registerSource = await readFile(new URL('../src/pages/RegisterPage.jsx', import.meta.url), 'utf8');
const fieldSource = await readFile(new URL('../src/components/FormField.jsx', import.meta.url), 'utf8');
const buttonSource = await readFile(new URL('../src/components/SubmitButton.jsx', import.meta.url), 'utf8');
const contextSource = await readFile(new URL('../src/auth/AuthContext.jsx', import.meta.url), 'utf8');
const routerSource = await readFile(new URL('../src/router/Router.jsx', import.meta.url), 'utf8');
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');

test('auth failures map to consistent user-facing messages', () => {
  assert.equal(getLoginErrorMessage({ code: 'INVALID_CREDENTIALS' }), AUTH_MESSAGES.invalidCredentials);
  assert.equal(getLoginErrorMessage({ status: 401, message: 'raw backend text' }), AUTH_MESSAGES.invalidCredentials);
  assert.equal(getLoginErrorMessage({ status: 422 }), AUTH_MESSAGES.loginValidation);
  assert.equal(getLoginErrorMessage({ status: 0 }), AUTH_MESSAGES.connection);
  assert.equal(getLoginErrorMessage(new Error('internal detail')), AUTH_MESSAGES.loginFallback);

  assert.equal(getRegistrationErrorMessage({ code: 'EMAIL_EXISTS' }), AUTH_MESSAGES.emailExists);
  assert.equal(getRegistrationErrorMessage({ status: 409, message: 'raw backend text' }), AUTH_MESSAGES.emailExists);
  assert.equal(getRegistrationErrorMessage({ status: 422 }), AUTH_MESSAGES.registrationValidation);
  assert.equal(getRegistrationErrorMessage({ status: 0 }), AUTH_MESSAGES.connection);
  assert.equal(getRegistrationErrorMessage(new Error('internal detail')), AUTH_MESSAGES.registrationFallback);
});

test('client validation messages are deterministic', () => {
  assert.equal(validateEmail(''), 'Email address is required.');
  assert.equal(validateEmail('bad'), 'Enter a valid email address.');
  assert.equal(validateEmail(' person@example.com '), '');
  assert.equal(validateRequired(' ', 'First name'), 'First name is required.');
  assert.equal(validateRegistrationPassword('short'), 'Password must be at least 8 characters.');
});

test('every authentication input has a programmatic label and required semantics', () => {
  for (const label of ['Email', 'Password']) {
    assert.match(loginSource, new RegExp(`label="${label}"`));
  }
  for (const label of ['First Name', 'Last Name', 'Email', 'Password']) {
    assert.match(registerSource, new RegExp(`label="${label}"`));
  }
  assert.match(registerSource, /<legend>Your Role<\/legend>/);
  assert.match(registerSource, /aria-required="true"/);
  assert.match(fieldSource, /<label htmlFor=\{id\}>\{label\}<\/label>/);
  assert.match(fieldSource, /required=\{required\}/);
  assert.match(fieldSource, /aria-required=\{required\}/);
});

test('loading button exposes disabled, busy, and live status', () => {
  assert.match(buttonSource, /disabled=\{isLoading\}/);
  assert.match(buttonSource, /aria-disabled=\{isLoading\}/);
  assert.match(buttonSource, /aria-busy=\{isLoading\}/);
  assert.match(buttonSource, /aria-live="polite"/);
});

test('auth pages do not persist credentials or use storage directly', () => {
  for (const source of [loginSource, registerSource, contextSource]) {
    assert.doesNotMatch(source, /localStorage|sessionStorage/);
  }
  assert.equal((loginSource.match(/password: ''/g) || []).length >= 3, true);
  assert.equal((registerSource.match(/password: ''/g) || []).length >= 3, true);
});

test('non-functional auth controls are excluded from the demo', () => {
  assert.doesNotMatch(loginSource, /remember_me|Remember me|Forgot password/);
});

test('programmatic navigation cannot outrun router subscription', () => {
  assert.match(routerSource, /ROUTE_CHANGE_EVENT/);
  assert.match(routerSource, /queueMicrotask\(\(\) => window\.dispatchEvent/);
  assert.match(routerSource, /addEventListener\(ROUTE_CHANGE_EVENT, updatePath\)/);
});

test('README provides the group setup and verification commands', () => {
  assert.match(readme, /docker compose up -d --build db api/);
  assert.match(readme, /npm run dev/);
  assert.match(readme, /npm (run )?test/);
  assert.match(readme, /npm run build/);
});
