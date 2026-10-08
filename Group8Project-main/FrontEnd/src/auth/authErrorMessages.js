export const AUTH_MESSAGES = Object.freeze({
  invalidCredentials: 'Invalid email or password.',
  emailExists: 'An account with this email already exists.',
  loginValidation: 'Check your email and password, then try again.',
  registrationValidation: 'Check your account details, then try again.',
  connection: 'Unable to connect to the authentication service. Please try again.',
  loginFallback: 'Unable to sign in. Please try again.',
  registrationFallback: 'Unable to create your account. Please try again.',
});

export function getLoginErrorMessage(error) {
  if (error?.code === 'INVALID_CREDENTIALS' || error?.status === 401) {
    return AUTH_MESSAGES.invalidCredentials;
  }
  if (error?.status === 422) return AUTH_MESSAGES.loginValidation;
  if (error?.status === 0) return AUTH_MESSAGES.connection;
  return AUTH_MESSAGES.loginFallback;
}

export function getRegistrationErrorMessage(error) {
  if (error?.code === 'EMAIL_EXISTS' || error?.status === 409) {
    return AUTH_MESSAGES.emailExists;
  }
  if (error?.status === 422) return AUTH_MESSAGES.registrationValidation;
  if (error?.status === 0) return AUTH_MESSAGES.connection;
  return AUTH_MESSAGES.registrationFallback;
}
