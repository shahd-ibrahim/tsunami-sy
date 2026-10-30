"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export type RoleType = "USER" | "RESELLER" | "ADMIN" | "SUPER_ADMIN";

export interface AuthenticatedUser {
  id: string;
  numericId: number;
  email: string;
  name: string;
  username?: string | null;
  image?: string | null;
  role: RoleType;
  phone?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  authProvider?: "EMAIL" | "GOOGLE";
  isVerified?: boolean;
  kycStatus?: string;
  isFrozen?: boolean;
}

interface UserContextValue {
  role: RoleType;
  setRole: (role: RoleType) => void;
  userId: string;
  numericId: number;
  userName: string;
  userEmail: string | null;
  currentUser: AuthenticatedUser | null;
  isVerified: boolean;
  kycStatus: string;
  walletBalance: number;
  isAuthLoading: boolean;
  isInitialized: boolean;
  refreshWallet: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateBalanceLocally: (newBalance: number) => void;
  saveSessionLocally: (user: AuthenticatedUser, token?: string, walletBalance?: number) => void;
  logout: () => Promise<void>;
}

const STORAGE_KEY_USER = "tsunami_auth_user";
const STORAGE_KEY_TOKEN = "tsunami_auth_token";
const STORAGE_KEY_WALLET = "tsunami_auth_wallet";

const UserRoleContext = createContext<UserContextValue | undefined>(undefined);

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleType>("USER");
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0.0);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Helper to persist session in localStorage & cookies (30 days)
  const saveSessionLocally = useCallback(
    (user: AuthenticatedUser, token?: string, balance?: number) => {
      setCurrentUser(user);
      setRoleState(user.role || "USER");
      setCookie("tsunami_role", user.role || "USER", 30);
      setCookie("tsunami_user_id", user.id, 30);

      if (token) {
        setCookie("next-auth.session-token", token, 30);
        setCookie("tsunami_session", token, 30);
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
          if (token) {
            localStorage.setItem(STORAGE_KEY_TOKEN, token);
          }
          if (typeof balance === "number") {
            setWalletBalance(balance);
            localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify({ balance }));
          }
        } catch {
          // Ignore localStorage quota errors
        }
      }
    },
    []
  );

  // Check authenticated session with real backend API
  const checkSession = useCallback(async (fallbackToken?: string | null) => {
    try {
      let token = fallbackToken;
      if (!token && typeof window !== "undefined") {
        try {
          token = localStorage.getItem(STORAGE_KEY_TOKEN);
        } catch {}
      }

      const headers: Record<string, string> = {
        "Cache-Control": "no-cache",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/auth/me", {
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          const freshUser = data.user as AuthenticatedUser;
          setCurrentUser(freshUser);
          setRoleState(freshUser.role || "USER");
          setCookie("tsunami_role", freshUser.role || "USER");
          setCookie("tsunami_user_id", freshUser.id);

          try {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(freshUser));
            if (data.token) {
              localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
            }
          } catch {}

          if (data.wallet) {
            const freshBalance = Number(data.wallet.balance) || 0;
            setWalletBalance(freshBalance);
            try {
              localStorage.setItem(
                STORAGE_KEY_WALLET,
                JSON.stringify({ balance: freshBalance })
              );
            } catch {}
          }
          setIsAuthLoading(false);
          return;
        }
      }

      // If server explicitly confirms unauthenticated (401 Unauthorized)
      if (res.status === 401) {
        // Only clear if server explicitly denied credentials
        setCurrentUser(null);
        setRoleState("USER");
        setWalletBalance(0);
        try {
          localStorage.removeItem(STORAGE_KEY_USER);
          localStorage.removeItem(STORAGE_KEY_TOKEN);
          localStorage.removeItem(STORAGE_KEY_WALLET);
        } catch {}
      }
    } catch (err) {
      // On temporary network errors or offline reconnects, NEVER clear existing cached session!
      console.warn("[UserRoleContext] Network glitch on session check; preserving cached session", err);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  // 1. Initial Synchronous Hydration Check on Initial App Mount
  useEffect(() => {
    let cachedUser: AuthenticatedUser | null = null;
    let cachedToken: string | null = null;
    let cachedBalance = 0;

    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem(STORAGE_KEY_USER);
        cachedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
        const walletStr = localStorage.getItem(STORAGE_KEY_WALLET);

        if (userStr) {
          const parsed = JSON.parse(userStr);
          if (parsed && parsed.id) {
            cachedUser = parsed;
          }
        }
        if (walletStr) {
          const parsedWallet = JSON.parse(walletStr);
          if (typeof parsedWallet.balance === "number") {
            cachedBalance = parsedWallet.balance;
          }
        }
      } catch {
        // Fallback
      }
    }

    // Immediately restore cached credentials with 0ms visual delay
    if (cachedUser) {
      setCurrentUser(cachedUser);
      setRoleState(cachedUser.role || "USER");
      setWalletBalance(cachedBalance);
    }

    setIsInitialized(true);

    // Verify session authoritatively in the background with cookies & tokens
    checkSession(cachedToken);
  }, [checkSession]);

  const setRole = (newRole: RoleType) => {
    setRoleState(newRole);
    setCookie("tsunami_role", newRole);
    if (currentUser) {
      const updatedUser = { ...currentUser, role: newRole };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
      } catch {}
    }
  };

  const userId = currentUser?.id || "";
  const numericId = currentUser?.numericId || 1001;
  const userName = currentUser?.name || "";
  const userEmail = currentUser?.email || null;

  const refreshWallet = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      let token: string | null = null;
      if (typeof window !== "undefined") {
        try {
          token = localStorage.getItem(STORAGE_KEY_TOKEN);
        } catch {}
      }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/wallet/balance?userId=${currentUser.id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const newBal = Number(data.balance) || 0;
        setWalletBalance(newBal);
        try {
          localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify({ balance: newBal }));
        } catch {}
      }
    } catch {
      // ignore
    }
  }, [currentUser?.id]);

  const refreshUser = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  // Periodic wallet polling only when user is authenticated
  useEffect(() => {
    if (currentUser?.id) {
      refreshWallet();
      const interval = setInterval(refreshWallet, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id, refreshWallet]);

  const updateBalanceLocally = (newBalance: number) => {
    setWalletBalance(newBalance);
    try {
      localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify({ balance: newBalance }));
    } catch {}
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}

    setCurrentUser(null);
    setRoleState("USER");
    setWalletBalance(0);

    try {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_WALLET);
    } catch {}

    removeCookie("next-auth.session-token");
    removeCookie("tsunami_session");
    removeCookie("tsunami_role");
    removeCookie("tsunami_user_id");

    toast.success("تم تسجيل الخروج بنجاح");
    window.location.href = "/login";
  };

  const isVerified = Boolean(
    currentUser?.isVerified ||
    currentUser?.kycStatus === "AUTO_VERIFIED" ||
    currentUser?.kycStatus === "APPROVED"
  );
  const kycStatus = currentUser?.kycStatus || (isVerified ? "APPROVED" : "NOT_SUBMITTED");

  return (
    <UserRoleContext.Provider
      value={{
        role,
        setRole,
        userId,
        numericId,
        userName,
        userEmail,
        currentUser,
        isVerified,
        kycStatus,
        walletBalance,
        isAuthLoading,
        isInitialized,
        refreshWallet,
        refreshUser,
        updateBalanceLocally,
        saveSessionLocally,
        logout,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
}
