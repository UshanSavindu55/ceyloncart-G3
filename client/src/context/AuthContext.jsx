import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearAuthToken, fetchCurrentUser, loginUser, registerUser, setAuthToken } from '../services/api';

const AuthContext = createContext(null);
const CURRENT_USER_STORAGE_KEY = 'ceyloncart-current-user';

function readStoredValue(key, fallback) {
  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write issues.
  }
}

function removeStoredValue(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage remove issues.
  }
}

function sanitizeUser(user) {
  if (!user || typeof user !== 'object' || Array.isArray(user)) {
    return null;
  }

  const id = typeof user.id === 'string' || typeof user.id === 'number' ? String(user.id).trim() : '';
  const fullName = typeof user.fullName === 'string' ? user.fullName.trim() : '';
  const email = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';

  if (!id || !fullName || !email) {
    return null;
  }

  return {
    id,
    fullName,
    email,
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => sanitizeUser(readStoredValue(CURRENT_USER_STORAGE_KEY, null)));

  useEffect(() => {
    async function hydrateCurrentUser() {
      try {
        const response = await fetchCurrentUser();
        const user = sanitizeUser(response?.user);

        if (user) {
          setCurrentUser(user);
          writeStoredValue(CURRENT_USER_STORAGE_KEY, user);
        } else {
          clearAuthToken();
          removeStoredValue(CURRENT_USER_STORAGE_KEY);
          setCurrentUser(null);
        }
      } catch {
        clearAuthToken();
        removeStoredValue(CURRENT_USER_STORAGE_KEY);
        setCurrentUser(null);
      }
    }

    hydrateCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      writeStoredValue(CURRENT_USER_STORAGE_KEY, currentUser);
    } else {
      removeStoredValue(CURRENT_USER_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = useCallback(async ({ email, password }) => {
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedPassword = typeof password === 'string' ? password : '';

    if (!normalizedEmail || !normalizedPassword) {
      return { success: false, message: 'Email and password are required.' };
    }

    try {
      const { token, user } = await loginUser({ email: normalizedEmail, password: normalizedPassword });

      if (!token || !user) {
        return { success: false, message: 'Invalid server response during login.' };
      }

      const nextUser = sanitizeUser(user);
      setAuthToken(token);
      setCurrentUser(nextUser);
      writeStoredValue(CURRENT_USER_STORAGE_KEY, nextUser);

      return { success: true, user: nextUser };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed. Please try again.' };
    }
  }, []);

  const register = useCallback(async ({ fullName, email, password }) => {
    const normalizedFullName = typeof fullName === 'string' ? fullName.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedPassword = typeof password === 'string' ? password : '';

    if (!normalizedFullName || !normalizedEmail || !normalizedPassword) {
      return { success: false, message: 'All fields are required.' };
    }

    try {
      const { token, user } = await registerUser({ fullName: normalizedFullName, email: normalizedEmail, password: normalizedPassword });

      if (!token || !user) {
        return { success: false, message: 'Invalid server response during registration.' };
      }

      const nextUser = sanitizeUser(user);
      setAuthToken(token);
      setCurrentUser(nextUser);
      writeStoredValue(CURRENT_USER_STORAGE_KEY, nextUser);

      return { success: true, user: nextUser };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    removeStoredValue(CURRENT_USER_STORAGE_KEY);
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      logout,
    }),
    [currentUser, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}