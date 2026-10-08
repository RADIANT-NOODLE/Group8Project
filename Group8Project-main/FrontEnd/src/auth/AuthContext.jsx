import { createContext, useContext, useMemo, useState } from 'react';
import * as authService from './authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [initialSession] = useState(() => authService.getSession());
  const [user, setUser] = useState(initialSession.user);
  const [token, setToken] = useState(initialSession.token);
  const [isLoading, setIsLoading] = useState(false);

  async function register(payload) {
    setIsLoading(true);
    try {
      const result = await authService.register(payload);
      setUser(result.user);
      setToken(result.access_token);
      return result;
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email, password) {
    setIsLoading(true);
    try {
      const result = await authService.login({ email, password });
      setUser(result.user);
      setToken(result.access_token);
      return result;
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshUser() {
    setIsLoading(true);
    try {
      const refreshedUser = await authService.me();
      setUser(refreshedUser);
      return refreshedUser;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    authService.logout();
    setUser(null);
    setToken(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      authMode: authService.currentAuthMode,
      register,
      login,
      refreshUser,
      logout,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
