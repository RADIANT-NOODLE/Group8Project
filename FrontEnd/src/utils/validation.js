const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value) {
  const email = value.trim();

  if (!email) return 'Email address is required.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  return '';
}

export function validateRequired(value, label) {
  return value.trim() ? '' : `${label} is required.`;
}

export function validateRegistrationPassword(value) {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  return '';
}
