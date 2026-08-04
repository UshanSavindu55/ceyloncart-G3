import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const USERS_STORAGE_KEY = 'ceyloncart-users';
const CURRENT_USER_STORAGE_KEY = 'ceyloncart-current-user';

const DEFAULT_USERS = [
  {
    id: 'user-1',
    fullName: 'Ayesha Perera',
    email: 'ayesha@example.com',
    password: 'Ceylon1234!',
  },
  {
    id: 'user-2',
    fullName: 'Kasun Silva',
    email: 'kasun@example.com',
    password: 'SriLanka2026!',
  },
];

function readStoredValue(key, fallback) {
  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
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

function readStoredUsers() {
  const storedUsers = readStoredValue(USERS_STORAGE_KEY, null);

  if (!Array.isArray(storedUsers) || storedUsers.length === 0) {
    return DEFAULT_USERS;
  }

  const normalizedUsers = storedUsers
    .map((user) => {
      if (!user || typeof user !== 'object' || Array.isArray(user)) {
        return null;
      }

      const id = typeof user.id === 'string' || typeof user.id === 'number' ? String(user.id).trim() : '';
      const fullName = typeof user.fullName === 'string' ? user.fullName.trim() : '';
      const email = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
      const password = typeof user.password === 'string' ? user.password : '';

      if (!id || !fullName || !email || !password) {
        return null;
      }

      return {
        id,
        fullName,
        email,
        password,
      };
    })
    .filter(Boolean);

  return normalizedUsers.length > 0 ? normalizedUsers : DEFAULT_USERS;
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => readStoredUsers());
  const [currentUser, setCurrentUser] = useState(() => sanitizeUser(readStoredValue(CURRENT_USER_STORAGE_KEY, null)));

  useEffect(() => {
    try {
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // Ignore storage write issues.
    }
  }, [users]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
    } catch {
      // Ignore storage write issues.
    }
  }, [currentUser]);

  const login = useCallback(
    ({ email, password }) => {
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      const normalizedPassword = typeof password === 'string' ? password : '';

      if (!normalizedEmail || !normalizedPassword) {
        return { success: false, message: 'Email and password are required.' };
      }

      const matchedUser = users.find(
        (user) => user.email.toLowerCase() === normalizedEmail && user.password === normalizedPassword,
      );

      if (!matchedUser) {
        return { success: false, message: 'Invalid email or password.' };
      }

      const nextUser = sanitizeUser(matchedUser);
      setCurrentUser(nextUser);

      return { success: true, user: nextUser };
    },
    [users],
  );

  const register = useCallback(
    ({ fullName, email, password }) => {
      const normalizedFullName = typeof fullName === 'string' ? fullName.trim() : '';
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      const normalizedPassword = typeof password === 'string' ? password : '';

      if (!normalizedFullName || !normalizedEmail || !normalizedPassword) {
        return { success: false, message: 'All fields are required.' };
      }

      if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
        return { success: false, message: 'An account with that email already exists.' };
      }

      const newUser = {
        id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `user-${Date.now()}`,
        fullName: normalizedFullName,
        email: normalizedEmail,
        password: normalizedPassword,
      };

      setUsers((currentUsers) => [...currentUsers, newUser]);
      const nextUser = sanitizeUser(newUser);
      setCurrentUser(nextUser);

      return { success: true, user: nextUser };
    },
    [users],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({
      users,
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      logout,
    }),
    [currentUser, login, logout, register, users],
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