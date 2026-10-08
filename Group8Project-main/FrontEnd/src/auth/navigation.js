const AUTH_PAGE_PATHS = new Set(['/login', '/register']);

function readSearchParams(search = '') {
  const normalizedSearch = String(search || '');
  return new URLSearchParams(normalizedSearch.startsWith('?') ? normalizedSearch : `?${normalizedSearch}`);
}

export function getSafeNextPath(search = '') {
  const nextPath = readSearchParams(search).get('next');

  if (
    !nextPath ||
    !nextPath.startsWith('/') ||
    nextPath.startsWith('//') ||
    AUTH_PAGE_PATHS.has(nextPath)
  ) {
    return '/app';
  }

  return nextPath;
}

export function getLoginPath(nextPath = '/app') {
  const safeNextPath = getSafeNextPath(`?next=${encodeURIComponent(nextPath)}`);
  return `/login?next=${encodeURIComponent(safeNextPath)}`;
}

export function getLoginNotice(search = '') {
  const notice = readSearchParams(search).get('notice');
  if (notice === 'signed-out') return 'You have signed out safely.';
  if (notice === 'session-ended') return 'Your session ended. Please sign in again.';
  return '';
}
