export const AUTH_MESSAGES = Object.freeze({
  invalidCredentials: 'Invalid email or password.',
  emailExists: 'An account with this email already exists.',
  loginValidation: 'Check your email and password, then try again.',
  registrationValidation: 'Check your account details, then try again.',
  connection: 'Unable to connect to the authentication service. Please try again.',
  loginFallback: 'Unable to sign in. Please try again.',
  tooManyAttempts: 'Too many failed login attempts. Please try again in 15 minutes.',
  registrationFallback: 'Unable to create your account. Please try again.',
  resetLinkInvalid: 'This password reset link is invalid or has expired. Request a new one.',
  passwordFallback: 'Unable to update the password. Please try again.',
  forgotFallback: 'Unable to send the reset link. Please try again.',
});

export function getLoginErrorMessage(error) {
  if (error?.code === 'INVALID_CREDENTIALS' || error?.status === 401) {
    return AUTH_MESSAGES.invalidCredentials;
  }
  if (error?.status === 422) return AUTH_MESSAGES.loginValidation;
  if (error?.status === 429) return error?.message || AUTH_MESSAGES.tooManyAttempts;
  if (error?.status === 0) return AUTH_MESSAGES.connection;
  return AUTH_MESSAGES.loginFallback;
}

export function getRegistrationErrorMessage(error) {
  if (error?.code === 'EMAIL_EXISTS' || error?.status === 409) {
    return AUTH_MESSAGES.emailExists;
  }
  /* The API names the rule that failed (e.g. the password policy); show that. */
  if (error?.status === 422) {
    return cleanValidationMessage(error.message) || AUTH_MESSAGES.registrationValidation;
  }
  if (error?.status === 0) return AUTH_MESSAGES.connection;
  return AUTH_MESSAGES.registrationFallback;
}

/** Messages for change-password and reset-password calls. */
export function getPasswordErrorMessage(error) {
  if (error?.status === 422) {
    return cleanValidationMessage(error.message) || AUTH_MESSAGES.passwordFallback;
  }
  if (error?.status === 401 || error?.status === 409) {
    return error.message || AUTH_MESSAGES.passwordFallback;
  }
  if (error?.status === 0) return AUTH_MESSAGES.connection;
  return AUTH_MESSAGES.passwordFallback;
}

export function getResetPasswordErrorMessage(error) {
  if (error?.status === 401) return AUTH_MESSAGES.resetLinkInvalid;
  return getPasswordErrorMessage(error);
}

/** FastAPI prefixes validation messages with "Value error, "; drop it. */
function cleanValidationMessage(message) {
  const text = String(message ?? '').replace(/Value error,\s*/gi, '').trim();
  return text && !/^request failed/i.test(text) ? text : '';
}
