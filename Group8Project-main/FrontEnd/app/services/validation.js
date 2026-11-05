const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value) {
  const email = value.trim();

  if (!email) return 'Email address is required.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  return '';
}

/* Keep these two in step with `schemas/inquiry.py` on the backend. */
const CONTACT_NAME_PATTERN = /^\p{L}+(?:[ '’.-]+\p{L}+)*\.?$/u;
const CONTACT_EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

/** Someone's name on a public form: letters, with spaces, hyphens and apostrophes between them. */
export function validateContactName(value) {
  const name = String(value ?? '').trim().replace(/\s+/g, ' ');

  if (!name) return 'Please enter your name.';
  if (!CONTACT_NAME_PATTERN.test(name) || (name.match(/\p{L}/gu) || []).length < 2) {
    return 'Enter your name using letters only.';
  }
  return '';
}

/** An email on a public form: unlike validateEmail, `name@example.c` does not pass. */
export function validateContactEmail(value) {
  const email = String(value ?? '').trim();

  if (!email) return 'Please enter your email address.';
  if (!CONTACT_EMAIL_PATTERN.test(email)) {
    return 'Enter a valid email address, for example name@example.com.';
  }
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

/**
 * South African phone number: +27 or a leading 0, then nine digits that do not
 * start with 0. Spaces, dashes and brackets are allowed. Same rule as
 * `validate_phone` on the backend, which stores the number as +27XXXXXXXXX.
 */
const SA_PHONE_PATTERN = /^(?:\+27|0)[1-9][0-9]{8}$/;

export const PHONE_FORMAT_MESSAGE =
  'Enter a South African phone number, for example 082 123 4567 or +27 82 123 4567.';

/** Optional phone number (profile edits): empty is allowed, anything else must match. */
export function validatePhone(value) {
  const phone = String(value ?? '').trim();
  if (!phone) return '';
  if (!SA_PHONE_PATTERN.test(phone.replace(/[\s()-]/g, ''))) {
    return PHONE_FORMAT_MESSAGE;
  }
  return '';
}

/** Registration: a phone number must be given, in the same format. */
export function validateRequiredPhone(value) {
  if (!String(value ?? '').trim()) return 'Please enter your phone number.';
  return validatePhone(value);
}
