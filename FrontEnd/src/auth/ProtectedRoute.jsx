import { useEffect } from 'react';
import { navigate } from '../router/Router.jsx';
import { useAuth } from './AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;
  return children;
}
