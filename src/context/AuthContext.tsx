"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { SafeUser } from "@/types/domain";

export interface AuthContextType {
  user: SafeUser | null;
  role: "AUTHOR" | "ADMIN" | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (
    email: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string; user?: SafeUser; role?: "AUTHOR" | "ADMIN" }>;
  register: (params: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    city?: string;
  }) => Promise<{ success: boolean; error?: string; user?: SafeUser; role?: "AUTHOR" }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  hasRole: (requiredRole: "AUTHOR" | "ADMIN") => boolean;
  canAccessAuthor: (authorId: string | null) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshSessionRef = useRef<() => Promise<boolean>>(() => Promise.resolve(false));

  const clearTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Silent refresh scheduled ~12 minutes (before 15m expiration)
  const scheduleSilentRefresh = useCallback(
    (expiresInSeconds = 900) => {
      clearTimer();
      const refreshDelayMs = Math.max(10_000, (expiresInSeconds - 120) * 1000);
      refreshTimerRef.current = setTimeout(() => {
        refreshSessionRef.current().catch(() => {});
      }, refreshDelayMs);
    },
    [clearTimer]
  );

  // Initial check on mount
  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/session", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          if (data.accessToken) {
            setAccessToken(data.accessToken);
          }
          scheduleSilentRefresh(data.expiresIn || 900);
          return;
        }
      }
      setUser(null);
      setAccessToken(null);
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [scheduleSilentRefresh]);

  useEffect(() => {
    checkSession();
    return () => clearTimer();
  }, [checkSession, clearTimer]);

  // Cross-tab synchronization via localStorage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "bookleaf_auth_event") {
        if (e.newValue === "logout") {
          setUser(null);
          setAccessToken(null);
          clearTimer();
          router.replace("/login");
        } else if (e.newValue === "login") {
          checkSession();
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [checkSession, clearTimer, router]);

  // Refresh Session via Refresh Token
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setAccessToken(data.accessToken);
          scheduleSilentRefresh(data.expiresIn || 900);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }, [scheduleSilentRefresh]);

  refreshSessionRef.current = refreshSession;

  // Login Handler
  const login = async (
    loginEmail: string,
    loginPass: string
  ): Promise<{ success: boolean; error?: string; user?: SafeUser; role?: "AUTHOR" | "ADMIN" }> => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
        credentials: "same-origin",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Invalid email or password",
        };
      }

      setUser(data.user);
      setAccessToken(data.accessToken);
      scheduleSilentRefresh(data.expiresIn || 900);

      // Notify other browser tabs
      try {
        localStorage.setItem("bookleaf_auth_event", `login_${Date.now()}`);
      } catch {}

      return {
        success: true,
        user: data.user,
        role: data.role,
      };
    } catch {
      return {
        success: false,
        error: "Network error while signing in. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Register Handler (Author Sign Up)
  const register = async (params: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    city?: string;
  }): Promise<{ success: boolean; error?: string; user?: SafeUser; role?: "AUTHOR" }> => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        credentials: "same-origin",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || data.details?.[0]?.message || "Registration failed",
        };
      }

      setUser(data.user);
      setAccessToken(data.accessToken);
      scheduleSilentRefresh(data.expiresIn || 900);

      try {
        localStorage.setItem("bookleaf_auth_event", `register_${Date.now()}`);
      } catch {}

      return {
        success: true,
        user: data.user,
        role: "AUTHOR",
      };
    } catch {
      return {
        success: false,
        error: "Network error while creating account. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout Handler
  const logout = async (): Promise<void> => {
    try {
      clearTimer();
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
    } finally {
      setUser(null);
      setAccessToken(null);
      try {
        localStorage.setItem("bookleaf_auth_event", "logout");
      } catch {}
      router.replace("/login");
      router.refresh();
    }
  };

  const hasRole = (requiredRole: "AUTHOR" | "ADMIN"): boolean => {
    return user?.role === requiredRole;
  };

  const canAccessAuthor = (targetAuthorId: string | null): boolean => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    return Boolean(targetAuthorId && user.author_id === targetAuthorId);
  };

  const value: AuthContextType = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isLoading,
    accessToken,
    login,
    register,
    logout,
    refreshSession,
    hasRole,
    canAccessAuthor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
