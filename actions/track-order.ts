"use server";

import { getPublicTrackedOrder, type AdminOrder } from "@/lib/supabase/admin-orders";

export type TrackOrderActionState = {
  ok: boolean;
  message: string;
  order?: AdminOrder;
};

function formString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function trackOrder(_: unknown, formData: FormData): Promise<TrackOrderActionState> {
  const orderNumber = formString(formData, "orderNumber");
  const phone = formString(formData, "phone");

  if (!orderNumber || !phone) {
    return {
      ok: false,
      message: "অর্ডার নম্বর ও ফোন নম্বর লিখুন।"
    };
  }

  try {
    const order = await getPublicTrackedOrder(orderNumber, phone);

    if (!order) {
      return {
        ok: false,
        message: "এই অর্ডার নম্বর ও ফোন নম্বর দিয়ে কোনো অর্ডার পাওয়া যায়নি।"
      };
    }

    return {
      ok: true,
      message: "অর্ডার পাওয়া গেছে।",
      order
    };
  } catch (error) {
    console.error("Public order tracking failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "অর্ডার খুঁজে পাওয়া যায়নি। আবার চেষ্টা করুন।"
    };
  }
}
