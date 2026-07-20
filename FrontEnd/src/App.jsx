import { useEffect } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AppHomePage from './pages/AppHomePage.jsx';
import { navigate, usePathname } from './router/Router.jsx';

const routes = {
  '/login': LoginPage,
  '/register': RegisterPage,
  '/app': AppHomePage,
};

export default function App() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/' || !routes[pathname]) {
      navigate('/login', { replace: true });
    }
  }, [pathname]);

  const Page = routes[pathname] ?? LoginPage;
  return <Page />;
}
