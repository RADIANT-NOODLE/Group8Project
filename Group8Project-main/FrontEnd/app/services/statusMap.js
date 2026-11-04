/**
 * The backend's status vocabularies, in one place.
 *
 * `app/common/enums.py` owns these values. Pages render the label and send the
 * value, so no page carries its own list and no page compares display strings.
 * Older screens and stored rows used display strings ("Under Review", "New");
 * `toStatus` accepts those once, here, and nothing else has to.
 */

function freezeOptions(options) {
  return Object.freeze(
    options.map((option) => Object.freeze({ ...option })),
  );
}

export const COMPLAINT_STATUSES = freezeOptions([
  { value: 'submitted', label: 'Submitted', tone: 'open' },
  { value: 'under_review', label: 'Under review', tone: 'active' },
  { value: 'in_progress', label: 'In progress', tone: 'active' },
  { value: 'resolved', label: 'Resolved', tone: 'done' },
  { value: 'denied', label: 'Denied', tone: 'closed' },
]);

export const WORK_ORDER_STATUSES = freezeOptions([
  { value: 'assigned', label: 'Assigned', tone: 'open' },
  { value: 'in_progress', label: 'In progress', tone: 'active' },
  { value: 'completed', label: 'Completed', tone: 'done' },
  { value: 'cancelled', label: 'Cancelled', tone: 'closed' },
]);

export const LISTING_STATUSES = freezeOptions([
  { value: 'active', label: 'Published', tone: 'done' },
  { value: 'sold', label: 'Sold', tone: 'closed' },
  { value: 'rented', label: 'Rented', tone: 'closed' },
  { value: 'withdrawn', label: 'Withdrawn', tone: 'closed' },
]);

/** Status values by name, so pages compare against `COMPLAINT_STATUS.resolved`, never a typed string. */
function valuesByName(options) {
  return Object.freeze(Object.fromEntries(options.map((option) => [option.value, option.value])));
}

export const COMPLAINT_STATUS = valuesByName(COMPLAINT_STATUSES);
export const WORK_ORDER_STATUS = valuesByName(WORK_ORDER_STATUSES);

/**
 * Categories the complaint form offers. The API stores any 2–50 character
 * string (`complaints.category`), so this list is the frontend's own choice and
 * exists only so the form and any future filter agree on the spellings.
 */
export const COMPLAINT_CATEGORIES = Object.freeze([
  'Security',
  'Maintenance',
  'Noise',
  'Cleaning',
  'Parking',
  'Other',
]);

const COMPLAINT_STATUS_ALIASES = Object.freeze({
  new: 'submitted',
  open: 'submitted',
  'under review': 'under_review',
  'in progress': 'in_progress',
  'in-progress': 'in_progress',
  complete: 'resolved',
  completed: 'resolved',
});

const WORK_ORDER_STATUS_ALIASES = Object.freeze({
  contacted: 'assigned',
  'in progress': 'in_progress',
  'in-progress': 'in_progress',
  dismissed: 'cancelled',
});

/**
 * Normalise any value or legacy display string to a status value from
 * `options`, or `''` when it is not one of them.
 */
export function toStatus(options, value) {
  const normalised = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ');

  if (!normalised) return '';

  const direct = options.find(
    (option) => option.value === normalised || option.label.toLowerCase() === normalised,
  );
  if (direct) return direct.value;

  const aliases = options === COMPLAINT_STATUSES
    ? COMPLAINT_STATUS_ALIASES
    : options === WORK_ORDER_STATUSES
      ? WORK_ORDER_STATUS_ALIASES
      : {};

  return aliases[normalised] ?? '';
}

export function statusLabel(options, value, fallback = 'Unknown') {
  const status = toStatus(options, value);
  if (!status) return fallback;

  return options.find((option) => option.value === status).label;
}

export function statusTone(options, value) {
  const status = toStatus(options, value);
  return options.find((option) => option.value === status)?.tone ?? 'unknown';
}

/** An unknown status is shown as-is rather than hidden, so a new backend value is visible. */
export function toComplaintStatus(value) {
  return toStatus(COMPLAINT_STATUSES, value);
}

export function complaintStatusLabel(value) {
  const status = toComplaintStatus(value);
  return status ? statusLabel(COMPLAINT_STATUSES, status) : String(value ?? 'Unknown');
}

export function complaintStatusTone(value) {
  return statusTone(COMPLAINT_STATUSES, value);
}

export function toWorkOrderStatus(value) {
  return toStatus(WORK_ORDER_STATUSES, value);
}

export function workOrderStatusLabel(value) {
  const status = toWorkOrderStatus(value);
  return status ? statusLabel(WORK_ORDER_STATUSES, status) : String(value ?? 'Unknown');
}

export function workOrderStatusTone(value) {
  return statusTone(WORK_ORDER_STATUSES, value);
}

export function listingStatusLabel(value) {
  const status = toStatus(LISTING_STATUSES, value);
  return status ? statusLabel(LISTING_STATUSES, status) : String(value ?? 'Unknown');
}
