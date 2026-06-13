"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type AdminProfile = {
  id: string;
  email: string;
  role: "admin" | "owner";
  is_active: boolean;
};

type SignInResult = {
  ok: boolean;
  message?: string;
};

type AuthContextValue = {
  user: User | null;
  adminProfile: AdminProfile | null;
  adminRole: AdminProfile["role"] | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
};

const ADMIN_ACCESS_DENIED = "এই অ্যাকাউন্টের অ্যাডমিন অ্যাক্সেস নেই।";
const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchAdminProfile(userId: string): Promise<AdminProfile | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, email, role, is_active")
    .eq("id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.warn("Supabase admin profile check failed:", error.message);
    return null;
  }

  return data as AdminProfile | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    setAdminProfile(null);
  }, []);

  const setSessionUser = useCallback(
    async (nextUser: User | null) => {
      if (!nextUser) {
        setUser(null);
        setAdminProfile(null);
        return;
      }

      const nextAdminProfile = await fetchAdminProfile(nextUser.id);

      if (!nextAdminProfile) {
        await signOut();
        return;
      }

      setUser(nextUser);
      setAdminProfile(nextAdminProfile);
    },
    [signOut]
  );

  useEffect(() => {
    let active = true;
    const supabase = createSupabaseBrowserClient();

    supabase.auth
      .getUser()
      .then(async ({ data }) => {
        if (!active) return;
        await setSessionUser(data.user);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void setSessionUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [setSessionUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.user) {
        return { ok: false, message: "ইমেইল বা পাসওয়ার্ড সঠিক নয়" };
      }

      const nextAdminProfile = await fetchAdminProfile(data.user.id);

      if (!nextAdminProfile) {
        await signOut();
        return { ok: false, message: ADMIN_ACCESS_DENIED };
      }

      setUser(data.user);
      setAdminProfile(nextAdminProfile);

      return { ok: true };
    },
    [signOut]
  );

  const value = useMemo(
    () => ({
      user,
      adminProfile,
      adminRole: adminProfile?.role ?? null,
      loading,
      isAdmin: Boolean(user && adminProfile?.is_active),
      signIn,
      signOut,
      logout: signOut
    }),
    [adminProfile, loading, signIn, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
