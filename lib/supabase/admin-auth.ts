import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SupabaseAdminProfile = {
  id: string;
  email: string;
  role: "admin" | "owner";
  is_active: boolean;
};

export async function getCurrentSupabaseUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function getAdminProfile(user?: User | null) {
  const supabase = await createSupabaseServerClient();
  const currentUser = user ?? (await getCurrentSupabaseUser());

  if (!currentUser) {
    return null;
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("id, email, role, is_active")
    .eq("id", currentUser.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.warn("Supabase server admin profile check failed:", error.message);
    return null;
  }

  return data as SupabaseAdminProfile | null;
}

export async function requireAdmin(nextPath = "/dashboard") {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }

  const adminProfile = await getAdminProfile(user);

  if (!adminProfile) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}&error=access-denied`);
  }

  return { user, adminProfile };
}
