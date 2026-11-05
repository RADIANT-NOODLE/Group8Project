import assert from 'node:assert/strict';
import test from 'node:test';

const { AUTH_MESSAGES, getLoginErrorMessage } = await import('../app/services/authErrorMessages.js');

test('being blocked shows the reason the server gave', () => {
  const message = 'Too many failed login attempts. Please try again in 15 minutes.';
  assert.equal(getLoginErrorMessage({ status: 429, message }), message);
});

test('being blocked still explains itself if the server gave no reason', () => {
  assert.equal(getLoginErrorMessage({ status: 429 }), AUTH_MESSAGES.tooManyAttempts);
});

test('the other login errors are unchanged', () => {
  assert.equal(getLoginErrorMessage({ status: 401 }), AUTH_MESSAGES.invalidCredentials);
  assert.equal(getLoginErrorMessage({ status: 422 }), AUTH_MESSAGES.loginValidation);
  assert.equal(getLoginErrorMessage({ status: 0 }), AUTH_MESSAGES.connection);
  assert.equal(getLoginErrorMessage({ status: 500 }), AUTH_MESSAGES.loginFallback);
});
