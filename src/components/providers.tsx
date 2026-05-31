"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { authApi } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { User } from "@/types";

// ─── Auth Context ─────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: null;
  isLoading: boolean;
  setAuth: (user: User, token?: string) => void;
  clearAuth: () => void;
  refreshUser: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  isLoading: true,
  setAuth: () => {},
  clearAuth: () => {},
  refreshUser: async () => null,
});

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await authApi.me();
      const currentUser = getAuthUser(res.data);
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const res = await authApi.me();
        const currentUser = getAuthUser(res.data);
        if (mounted) setUser(currentUser);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    bootstrap();

    return () => {
      mounted = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const setAuth = (newUser: User) => {
    setUser(newUser);
  };

  const clearAuth = () => {
    setUser(null);
  };

  const value: AuthState = { user, token: null, isLoading, setAuth, clearAuth, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Query Client ─────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

// ─── Providers ───────────────────────────────────────────────

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
