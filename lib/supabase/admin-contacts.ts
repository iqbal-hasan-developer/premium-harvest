import "server-only";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/admin-auth";

export type ContactMessageStatus = "unread" | "read" | "archived";

export type AdminContactMessage = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  message: string;
  status: ContactMessageStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicContactMessageInput = {
  name: string;
  phone: string;
  email?: string | null;
  message: string;
};

type SupabaseContactMessageRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  status: ContactMessageStatus;
  created_at: string | null;
  updated_at: string | null;
};

const CONTACT_SELECT = "id, name, phone, email, message, status, created_at, updated_at";

function mapContactMessage(row: SupabaseContactMessageRow): AdminContactMessage {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    status: row.status,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined
  };
}

function revalidateContactPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/contacts");
}

export async function createPublicContactMessage(input: PublicContactMessageInput) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: input.name,
    phone: input.phone,
    email: input.email || null,
    message: input.message,
    status: "unread"
  });

  if (error) throw new Error(error.message);

  revalidateContactPaths();
}

export async function getAdminContactMessages() {
  await requireAdmin("/dashboard/contacts");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select(CONTACT_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data || []) as SupabaseContactMessageRow[]).map(mapContactMessage);
}

export async function updateContactMessageStatus(messageId: string, status: ContactMessageStatus) {
  await requireAdmin("/dashboard/contacts");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ status })
    .eq("id", messageId);

  if (error) throw new Error(error.message);

  revalidateContactPaths();
}
