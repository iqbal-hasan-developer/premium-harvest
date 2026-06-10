"use server";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { contactSchema } from "@/lib/validations";

export async function createContactMessage(_: unknown, formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "তথ্য যাচাই করা যায়নি"
    };
  }

  const db = getAdminDb();
  if (!db) {
    return {
      ok: true,
      message: "ডেমো মোডে বার্তা গ্রহণ করা হয়েছে। Firebase সেট করলে Firestore-এ সংরক্ষণ হবে।"
    };
  }

  await db.collection("contacts").add({
    ...parsed.data,
    createdAt: FieldValue.serverTimestamp()
  });

  return { ok: true, message: "আপনার বার্তা পাঠানো হয়েছে।" };
}
