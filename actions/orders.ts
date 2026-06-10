"use server";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { cartOrderSchema, orderSchema } from "@/lib/validations";

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: "NULL_VALUE" }
  | { timestampValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

function toFirestoreValue(value: unknown): FirestoreValue {
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === "boolean") return { booleanValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (value && typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value as Record<string, unknown>)
            .filter(([, entryValue]) => entryValue !== undefined)
            .map(([key, entryValue]) => [key, toFirestoreValue(entryValue)])
        )
      }
    };
  }
  return { nullValue: "NULL_VALUE" };
}

async function createOrderWithRest(data: Record<string, unknown>) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    return false;
  }

  const fields: Record<string, FirestoreValue> = Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, toFirestoreValue(value)])
  );

  fields.createdAt = { timestampValue: new Date().toISOString() };

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields })
    }
  );

  return response.ok;
}

function formString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function createOrder(_: unknown, formData: FormData) {
  const parsed = orderSchema.safeParse({
    productId: formData.get("productId"),
    productName: formData.get("productName"),
    selectedPackage: formData.get("selectedPackage"),
    packageWeight: formData.get("packageWeight"),
    packagePrice: formData.get("packagePrice"),
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    quantity: formData.get("quantity"),
    deliveryCharge: formData.get("deliveryCharge") || 0,
    totalPrice: formData.get("totalPrice"),
    note: formData.get("note") || undefined
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "তথ্য যাচাই করা যায়নি"
    };
  }

  const totalPrice = parsed.data.packagePrice * parsed.data.quantity + parsed.data.deliveryCharge;
  if (parsed.data.totalPrice !== totalPrice) {
    return {
      ok: false,
      message: "মোট মূল্য মিলছে না। প্যাকেজ আবার নির্বাচন করুন।"
    };
  }

  const db = getAdminDb();
  const orderPayload = {
    productId: parsed.data.productId,
    productName: parsed.data.productName,
    selectedPackage: parsed.data.selectedPackage,
    packageWeight: parsed.data.packageWeight,
    packagePrice: parsed.data.packagePrice,
    customerName: parsed.data.customerName,
    phone: parsed.data.phone,
    address: parsed.data.address,
    quantity: parsed.data.quantity,
    deliveryCharge: parsed.data.deliveryCharge,
    totalPrice,
    status: "pending",
    ...(parsed.data.note ? { note: parsed.data.note } : {})
  };

  if (!db) {
    const saved = await createOrderWithRest(orderPayload);

    if (saved) {
      return { ok: true, message: "আপনার অর্ডার সফলভাবে জমা হয়েছে।" };
    }

    return {
      ok: false,
      message: "অর্ডার সংরক্ষণ করা যায়নি। Firebase rules ও config যাচাই করুন।"
    };
  }

  await db.collection("orders").add({
    ...orderPayload,
    createdAt: FieldValue.serverTimestamp()
  });

  return { ok: true, message: "আপনার অর্ডার সফলভাবে জমা হয়েছে।" };
}
export async function createCartOrder(_: unknown, formData: FormData) {
  let items: unknown = [];

  try {
    const rawItems = formData.get("items");
    items = typeof rawItems === "string" ? JSON.parse(rawItems) : [];
  } catch {
    return {
      ok: false,
      message: "কার্টের তথ্য যাচাই করা যায়নি। আবার চেষ্টা করুন।"
    };
  }

  const parsed = cartOrderSchema.safeParse({
    items,
    customerName: formString(formData, "customerName"),
    phone: formString(formData, "phone"),
    address: formString(formData, "address"),
    paymentMethod: formData.get("paymentMethod") || "cod",
    subtotal: formData.get("subtotal"),
    total: formData.get("total"),
    note: formString(formData, "note") || undefined
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "তথ্য যাচাই করা যায়নি"
    };
  }

  const hasInvalidLineTotal = parsed.data.items.some(
    (item) => item.lineTotal !== item.selectedPackagePrice * item.quantity
  );
  const subtotal = parsed.data.items.reduce((sum, item) => sum + item.lineTotal, 0);

  if (hasInvalidLineTotal || parsed.data.subtotal !== subtotal || parsed.data.total !== subtotal) {
    return {
      ok: false,
      message: "মোট মূল্য মিলছে না। কার্ট আবার যাচাই করুন।"
    };
  }

  const totalQuantity = parsed.data.items.reduce((sum, item) => sum + item.quantity, 0);
  const productName = parsed.data.items.map((item) => item.name).join(", ").slice(0, 180);
  const orderPayload = {
    source: "cart",
    items: parsed.data.items,
    customerName: parsed.data.customerName,
    phone: parsed.data.phone,
    address: parsed.data.address,
    paymentMethod: parsed.data.paymentMethod,
    subtotal,
    total: subtotal,
    totalPrice: subtotal,
    productId: "cart",
    productName,
    selectedPackage: `${parsed.data.items.length} cart item${parsed.data.items.length > 1 ? "s" : ""}`,
    packageWeight: `${parsed.data.items.length} item${parsed.data.items.length > 1 ? "s" : ""}`,
    packagePrice: subtotal,
    quantity: totalQuantity,
    deliveryCharge: 0,
    status: "pending",
    ...(parsed.data.note ? { note: parsed.data.note } : {})
  };

  const db = getAdminDb();

  if (!db) {
    const saved = await createOrderWithRest(orderPayload);

    if (saved) {
      return { ok: true, message: "আপনার অর্ডার গ্রহণ করা হয়েছে।" };
    }

    return {
      ok: false,
      message: "অর্ডার সম্পন্ন করা যায়নি। Firebase config ও rules যাচাই করুন।"
    };
  }

  await db.collection("orders").add({
    ...orderPayload,
    createdAt: FieldValue.serverTimestamp()
  });

  return { ok: true, message: "আপনার অর্ডার গ্রহণ করা হয়েছে।" };
}
