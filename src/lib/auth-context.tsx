"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ─── Types ──────────────────────────────────────────────────────────────

type User = { email: string; name: string };

type AuthContextType = {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
};

// ─── Context ────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "nocturne-auth";

function loadUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // silently fail
  }
}

// ─── Provider ───────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(loadUser());
    setHydrated(true);
  }, []);

  const login = useCallback((email: string, name: string) => {
    const u = { email, name };
    setUser(u);
    saveUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveUser(null);
  }, []);

  const isLoggedIn = hydrated && !!user;

  const value = useMemo<AuthContextType>(
    () => ({ user, login, logout, isLoggedIn }),
    [user, login, logout, isLoggedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
