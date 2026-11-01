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

/**
 * Password policy. Keep in step with `app/common/validators.py` on the backend,
 * which is the one that actually enforces it.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72;
const SPECIAL_CHARACTERS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

export const PASSWORD_RULES = Object.freeze([
  Object.freeze({
    id: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  }),
  Object.freeze({
    id: 'lowercase',
    label: 'A lowercase letter',
    test: (value) => /[a-z]/.test(value),
  }),
  Object.freeze({
    id: 'uppercase',
    label: 'An uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  }),
  Object.freeze({
    id: 'number',
    label: 'A number',
    test: (value) => /\d/.test(value),
  }),
  Object.freeze({
    id: 'special',
    label: 'A special character (e.g. ! @ # $ %)',
    test: (value) => [...value].some((character) => SPECIAL_CHARACTERS.includes(character)),
  }),
  Object.freeze({
    id: 'spaces',
    label: 'No spaces',
    test: (value) => !/\s/.test(value),
  }),
]);

/** Every rule with whether the password currently meets it (drives the live checklist). */
export function checkPasswordRules(value = '') {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(value),
  }));
}

export function validateRegistrationPassword(value) {
  if (!value) return 'Password is required.';

  const unmet = PASSWORD_RULES.filter((rule) => !rule.test(value));
  if (unmet.length) {
    return `Password needs: ${unmet.map((rule) => rule.label.toLowerCase()).join(', ')}.`;
  }

  if (new TextEncoder().encode(value).length > PASSWORD_MAX_BYTES) {
    return `Password must be no longer than ${PASSWORD_MAX_BYTES} bytes.`;
  }

  return '';
}

/** Same rules apply to a new password chosen when changing or resetting one. */
export const validateNewPassword = validateRegistrationPassword;

/** Optional phone number; same rule as `validate_phone` on the backend. */
export function validatePhone(value) {
  const phone = String(value ?? '').trim();
  if (!phone) return '';
  if (!/^[+(]?[0-9][0-9 ()-]{5,18}[0-9]$/.test(phone)) {
    return 'Enter a valid phone number, for example +27 82 123 4567.';
  }
  return '';
}
