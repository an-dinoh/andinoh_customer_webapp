"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { session, USER_KEY } from "@/utils/api";
import { authApi, profileApi } from "@/services/api";
import type { AuthSession, CustomerProfile, RegisterRequest, SessionUser } from "@/types/api";
import { queryCache } from "@/utils/queryCache";
import { deviceInfo } from "@/utils/device";

/**
 * Who is signed in (Customer guide 3). The app works signed out too: browsing, quotes and guest
 * checkout don't need an account, so nothing here blocks rendering.
 *
 * After sign-in the customer profile (points, tier, photo, email_verified) is loaded from
 * /customers/profile/; guest bookings with the same email move into the account on the server.
 */

interface AuthContextType {
  user: SessionUser | null;
  profile: CustomerProfile | null;
  isAuthenticated: boolean;
  /** True until a stored session has been checked. */
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (body: Omit<RegisterRequest, "device_name" | "platform" | "os_version" | "app_version">) => Promise<void>;
  /** Stores a session from registration, Google or a password change. */
  adoptSession: (tokens: AuthSession) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: CustomerProfile) => void;
  /** Updates the stored session user (e.g. inspector_status after applying). */
  updateUser: (patch: Partial<SessionUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setProfile(await profileApi.get());
  }, []);

  // Restore a stored session on load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!session.access() && !session.refresh()) return;
        const stored = localStorage.getItem(USER_KEY);
        if (stored) setUser(JSON.parse(stored));
        await loadProfile();
      } catch {
        if (!cancelled) {
          session.clear();
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loadProfile]);

  // The HTTP client signs out when a session can't be refreshed; follow it here.
  useEffect(() => {
    const onSignedOut = () => { setUser(null); setProfile(null); };
    window.addEventListener("andinoh:signed-out", onSignedOut);
    return () => window.removeEventListener("andinoh:signed-out", onSignedOut);
  }, []);

  const adoptSession = useCallback(async (tokens: AuthSession) => {
    queryCache.clear(); // never show one account's cached pages to another
    session.store(tokens.access_token, tokens.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(tokens.user));
    setUser(tokens.user);
    await loadProfile().catch(() => setProfile(null));
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    await adoptSession(await authApi.login({ email, password, ...deviceInfo() }));
  }, [adoptSession]);

  const register = useCallback<AuthContextType["register"]>(async (body) => {
    await adoptSession(await authApi.register({ ...body, ...deviceInfo() }));
  }, [adoptSession]);

  const logout = useCallback(async () => {
    const refresh = session.refresh();
    if (refresh) await authApi.logout(refresh).catch(() => undefined);
    session.clear();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session.access() && !session.refresh()) return;
    await loadProfile().catch(() => undefined);
  }, [loadProfile]);

  const updateUser = useCallback((patch: Partial<SessionUser>) => {
    setUser(u => {
      if (!u) return u;
      const next = { ...u, ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    profile,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    register,
    adoptSession,
    logout,
    refreshProfile,
    setProfile,
    updateUser,
  }), [user, profile, isLoading, signIn, register, adoptSession, logout, refreshProfile, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
