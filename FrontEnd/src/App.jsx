import { useEffect } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AppHomePage from './pages/AppHomePage.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import { useAuth } from './auth/index.js';
import { navigate, usePathname } from './router/Router.jsx';

const routes = {
  '/login': LoginPage,
  '/register': RegisterPage,
  '/app': AppHomePage,
};

const publicOnlyRoutes = new Set(['/login', '/register']);

export default function App() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (pathname === '/' || !routes[pathname]) {
      navigate(isAuthenticated ? '/app' : '/login', { replace: true });
      return;
    }

    if (isAuthenticated && publicOnlyRoutes.has(pathname)) {
      navigate('/app', { replace: true });
    }
  }, [pathname, isAuthenticated]);

  if (pathname === '/app') {
    return (
      <ProtectedRoute>
        <AppHomePage />
      </ProtectedRoute>
    );
  }

  const Page = routes[pathname] ?? LoginPage;
  return <Page />;
}
