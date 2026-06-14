"use server";

import {
  getAdminOrders,
  updateOrderStatuses,
  type AdminOrder
} from "@/lib/supabase/admin-orders";
import type { OrderStatus, PaymentStatus } from "@/types";

type ActionResult = {
  ok: boolean;
  message: string;
};

export async function getAdminOrderManagerData(): Promise<AdminOrder[]> {
  return getAdminOrders();
}

export async function updateAdminOrderStatus(
  orderId: string,
  orderStatus: OrderStatus
): Promise<ActionResult> {
  try {
    await updateOrderStatuses(orderId, { orderStatus });
    return { ok: true, message: "Order status updated." };
  } catch (error) {
    console.error("Supabase admin order status update failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Order status could not be updated."
    };
  }
}

export async function updateAdminPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<ActionResult> {
  try {
    await updateOrderStatuses(orderId, { paymentStatus });
    return { ok: true, message: "Payment status updated." };
  } catch (error) {
    console.error("Supabase admin payment status update failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Payment status could not be updated."
    };
  }
}
