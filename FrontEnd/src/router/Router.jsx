import { useEffect, useState } from 'react';

const ROUTE_CHANGE_EVENT = 'valora:navigate';

export function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const updatePath = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', updatePath);
    window.addEventListener(ROUTE_CHANGE_EVENT, updatePath);
    return () => {
      window.removeEventListener('popstate', updatePath);
      window.removeEventListener(ROUTE_CHANGE_EVENT, updatePath);
    };
  }, []);

  return pathname;
}

export function navigate(to, { replace = false } = {}) {
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({}, '', to);

  // ProtectedRoute can navigate during its first effect before the parent
  // router effect subscribes. Deferring notification prevents a blank page.
  queueMicrotask(() => window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT)));
}

export function AppLink({ to, children, className }) {
  function handleClick(event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigate(to);
  }

  return (
    <a href={to} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
