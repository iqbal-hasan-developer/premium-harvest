"use server";

import {
  getAdminContactMessages,
  updateContactMessageStatus,
  type ContactMessageStatus
} from "@/lib/supabase/admin-contacts";

type ActionResult = {
  ok: boolean;
  message: string;
};

export async function getAdminContactManagerData() {
  return getAdminContactMessages();
}

export async function updateAdminContactMessageStatus(
  messageId: string,
  status: ContactMessageStatus
): Promise<ActionResult> {
  try {
    await updateContactMessageStatus(messageId, status);
    return { ok: true, message: "মেসেজ স্ট্যাটাস আপডেট হয়েছে।" };
  } catch (error) {
    console.error("Supabase admin contact status update failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "মেসেজ স্ট্যাটাস আপডেট করা যায়নি।"
    };
  }
}
