"use server";

import { createSupabaseOrder, normalizeCartItem } from "@/lib/supabase/admin-orders";
import { cartOrderSchema, orderSchema } from "@/lib/validations";

type OrderActionResult = {
  ok: boolean;
  message: string;
  orderNumber?: string;
};

function formString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function parseCartItems(formData: FormData) {
  const rawItems = formData.get("items");
  if (typeof rawItems !== "string") return [];
  return JSON.parse(rawItems) as unknown;
}

export async function createOrder(_: unknown, formData: FormData): Promise<OrderActionResult> {
  try {
    const parsed = orderSchema.safeParse({
      productId: formData.get("productId"),
      productSlug: formData.get("productSlug") || undefined,
      productImage: formData.get("productImage") || undefined,
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
        message: parsed.error.issues[0]?.message || "Order information could not be validated."
      };
    }

    const lineTotal = parsed.data.packagePrice * parsed.data.quantity;
    const total = lineTotal + parsed.data.deliveryCharge;

    if (parsed.data.totalPrice !== total) {
      return {
        ok: false,
        message: "Order total does not match. Please select the package again."
      };
    }

    const orderNumber = await createSupabaseOrder({
      customerName: parsed.data.customerName,
      phone: parsed.data.phone,
      address: parsed.data.address,
      note: parsed.data.note,
      source: "direct",
      paymentMethod: "cod",
      deliveryCharge: parsed.data.deliveryCharge,
      items: [
        {
          productId: parsed.data.productId,
          productSlug: parsed.data.productSlug,
          productName: parsed.data.productName,
          imageUrl: parsed.data.productImage,
          packageWeight: parsed.data.packageWeight,
          unitPrice: parsed.data.packagePrice,
          quantity: parsed.data.quantity,
          lineTotal
        }
      ]
    });

    return {
      ok: true,
      message: `Order received successfully. Order number: ${orderNumber}`,
      orderNumber
    };
  } catch (error) {
    console.error("Supabase direct order create failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Order could not be saved."
    };
  }
}

export async function createCartOrder(_: unknown, formData: FormData): Promise<OrderActionResult> {
  let items: unknown = [];

  try {
    items = parseCartItems(formData);
  } catch {
    return {
      ok: false,
      message: "Cart information could not be validated. Please try again."
    };
  }

  try {
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
        message: parsed.error.issues[0]?.message || "Order information could not be validated."
      };
    }

    const hasInvalidLineTotal = parsed.data.items.some(
      (item) => item.lineTotal !== item.selectedPackagePrice * item.quantity
    );
    const subtotal = parsed.data.items.reduce((sum, item) => sum + item.selectedPackagePrice * item.quantity, 0);

    if (hasInvalidLineTotal || parsed.data.subtotal !== subtotal || parsed.data.total !== subtotal) {
      return {
        ok: false,
        message: "Cart total does not match. Please review your cart and try again."
      };
    }

    const orderNumber = await createSupabaseOrder({
      customerName: parsed.data.customerName,
      phone: parsed.data.phone,
      address: parsed.data.address,
      note: parsed.data.note,
      source: "cart",
      paymentMethod: parsed.data.paymentMethod,
      deliveryCharge: 0,
      items: parsed.data.items.map(normalizeCartItem)
    });

    return {
      ok: true,
      message: `Order received successfully. Order number: ${orderNumber}`,
      orderNumber
    };
  } catch (error) {
    console.error("Supabase cart order create failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Order could not be completed."
    };
  }
}
