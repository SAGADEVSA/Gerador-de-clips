import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string | null;
}

interface AuthResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'clipforge_token';
const USER_KEY = 'clipforge_user';

const parseUser = (value: string | null): User | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => parseUser(localStorage.getItem(USER_KEY)));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const saveAuth = useCallback((auth: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    setToken(auth.token);
    setUser(auth.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const authFetch = useCallback(
    async (input: RequestInfo, init: RequestInit = {}) => {
      const headers = new Headers(init.headers || undefined);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return fetch(input, { ...init, headers });
    },
    [token]
  );

  const fetchMe = useCallback(
    async (currentToken: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        });

        if (!response.ok) {
          logout();
          return;
        }

        const result = await response.json();
        setUser(result.user);
      } catch {
        logout();
      }
    },
    [logout]
  );

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken && !user) {
      fetchMe(storedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchMe, user]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || 'Falha ao efetuar login');
    }

    const auth = (await response.json()) as AuthResponse;
    saveAuth(auth);
    return auth.user;
  }, [saveAuth]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    setError(null);
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, name })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || 'Falha ao registrar usuário');
    }

    const auth = (await response.json()) as AuthResponse;
    saveAuth(auth);
    return auth.user;
  }, [saveAuth]);

  return {
    user,
    token,
    loading,
    error,
    setError,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout,
    authFetch
  };
};
