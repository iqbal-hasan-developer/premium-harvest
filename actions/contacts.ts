"use server";

import { createPublicContactMessage } from "@/lib/supabase/admin-contacts";
import { contactSchema } from "@/lib/validations";

export type ContactActionState = {
  ok: boolean;
  message: string;
};

export async function createContactMessage(_: unknown, formData: FormData): Promise<ContactActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "তথ্য যাচাই করা যায়নি।"
    };
  }

  try {
    await createPublicContactMessage(parsed.data);
    return { ok: true, message: "আপনার বার্তা পাঠানো হয়েছে।" };
  } catch (error) {
    console.error("Supabase contact message insert failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "বার্তা পাঠানো যায়নি। আবার চেষ্টা করুন।"
    };
  }
}
