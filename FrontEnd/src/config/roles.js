export const VALORA_ROLE_OPTIONS = Object.freeze([
  Object.freeze({
    value: 'resident',
    label: 'Resident',
    description: 'Follow the context and updates that matter around your home.',
  }),
  Object.freeze({
    value: 'investor',
    label: 'Investor',
    description: 'Prepare for clearer property and growth insights over time.',
  }),
  Object.freeze({
    value: 'estate_agent',
    label: 'Estate Agent',
    description: 'Explore the future listing and local-market perspective.',
  }),
  Object.freeze({
    value: 'hoa_admin',
    label: 'HOA Administrator',
    description: 'Prepare for future private-community coordination tools.',
  }),
]);

export const VALORA_ROLE_VALUES = Object.freeze(
  VALORA_ROLE_OPTIONS.map(({ value }) => value),
);

export function getValoraRole(value) {
  return VALORA_ROLE_OPTIONS.find((role) => role.value === value) ?? Object.freeze({
    value: 'member',
    label: 'VALORA member',
    description: 'A VALORA account holder.',
  });
}

export function getValoraRoleLabel(value) {
  return getValoraRole(value).label;
}
