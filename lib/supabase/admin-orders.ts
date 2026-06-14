import "server-only";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import type { CartItem, OrderStatus, PaymentStatus } from "@/types";

export type PublicOrderItemInput = {
  productId: string;
  productSlug?: string;
  productName: string;
  imageUrl?: string;
  packageWeight?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type PublicOrderInput = {
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  source: "cart" | "direct" | "web";
  paymentMethod: "cod" | string;
  deliveryCharge: number;
  items: PublicOrderItemInput[];
};

export type AdminOrderItem = {
  id: string;
  productId?: string | null;
  productPackageId?: string | null;
  productSlug?: string | null;
  productName: string;
  imageUrl?: string | null;
  packageWeight?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  createdAt?: string;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string | null;
  source: string;
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt?: string;
  updatedAt?: string;
  items: AdminOrderItem[];
};

type SupabaseOrderItemRow = {
  id: string;
  product_id: string | null;
  product_package_id: string | null;
  product_slug: string | null;
  product_name: string;
  image_url: string | null;
  package_weight: string | null;
  unit_price: number | string;
  quantity: number;
  line_total: number | string;
  created_at: string | null;
};

type SupabaseOrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  note: string | null;
  source: string;
  subtotal: number | string;
  delivery_charge: number | string;
  discount_amount: number | string;
  total: number | string;
  payment_method: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string | null;
  updated_at: string | null;
  order_items?: SupabaseOrderItemRow[] | null;
};

type SupabaseCatalogPackageRow = {
  id: string;
  weight: string | null;
  price: number | string | null;
  is_active: boolean | null;
};

type SupabaseCatalogProductRow = {
  id: string;
  name: string;
  slug: string;
  published: boolean | null;
  is_active: boolean | null;
  product_packages?: SupabaseCatalogPackageRow[] | null;
};

type VerifiedOrderItem = PublicOrderItemInput & {
  productId: string;
  productPackageId: string;
  productSlug: string;
};

const ORDER_SELECT = `
  id,
  order_number,
  customer_name,
  phone,
  address,
  note,
  source,
  subtotal,
  delivery_charge,
  discount_amount,
  total,
  payment_method,
  order_status,
  payment_status,
  created_at,
  updated_at,
  order_items (
    id,
    product_id,
    product_package_id,
    product_slug,
    product_name,
    image_url,
    package_weight,
    unit_price,
    quantity,
    line_total,
    created_at
  )
`;

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function nullableUuid(value: string | null | undefined) {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

async function verifyOrderItems(inputItems: PublicOrderItemInput[]): Promise<VerifiedOrderItem[]> {
  if (!inputItems.length) {
    throw new Error("Order must include at least one item.");
  }

  const submittedProductIds = inputItems.map((item) => item.productId);
  const productIds = Array.from(
    new Set(submittedProductIds.map((item) => nullableUuid(item)).filter((item): item is string => Boolean(item)))
  );

  if (productIds.length !== new Set(submittedProductIds).size) {
    throw new Error("One or more order products are not available.");
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      published,
      is_active,
      product_packages (
        id,
        weight,
        price,
        is_active
      )
    `)
    .in("id", productIds);

  if (error) throw new Error(error.message);

  const productsById = new Map(((data || []) as SupabaseCatalogProductRow[]).map((product) => [product.id, product]));

  return inputItems.map((item) => {
    const productId = nullableUuid(item.productId);
    const product = productId ? productsById.get(productId) : null;

    if (!product || product.published !== true || product.is_active === false) {
      throw new Error(`${item.productName || "Product"} is not available.`);
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new Error("Order quantity is not valid.");
    }

    const packageWeight = item.packageWeight?.trim();
    const packageRecord = (product.product_packages || []).find(
      (packageItem) => packageItem.is_active !== false && packageItem.weight === packageWeight
    );

    if (!packageRecord) {
      throw new Error(`${product.name} package is not available.`);
    }

    const packagePrice = toNumber(packageRecord.price);

    if (packagePrice <= 0 || packagePrice !== item.unitPrice) {
      throw new Error(`${product.name} price has changed. Please refresh and try again.`);
    }

    return {
      ...item,
      productId: product.id,
      productPackageId: packageRecord.id,
      productSlug: product.slug,
      productName: product.name,
      packageWeight: packageWeight || packageRecord.weight || undefined,
      unitPrice: packagePrice,
      lineTotal: packagePrice * item.quantity
    };
  });
}

function mapOrder(row: SupabaseOrderRow): AdminOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    note: row.note,
    source: row.source,
    subtotal: toNumber(row.subtotal),
    deliveryCharge: toNumber(row.delivery_charge),
    discountAmount: toNumber(row.discount_amount),
    total: toNumber(row.total),
    paymentMethod: row.payment_method,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
    items: (row.order_items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productPackageId: item.product_package_id,
      productSlug: item.product_slug,
      productName: item.product_name,
      imageUrl: item.image_url,
      packageWeight: item.package_weight,
      unitPrice: toNumber(item.unit_price),
      quantity: item.quantity,
      lineTotal: toNumber(item.line_total),
      createdAt: item.created_at || undefined
    }))
  };
}

function randomOrderSuffix() {
  return Math.floor(1000 + Math.random() * 9000);
}

async function generateOrderNumber() {
  const supabase = createSupabaseAdminClient();
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = `PH-${datePart}-${randomOrderSuffix()}`;
    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .eq("order_number", candidate)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return candidate;
  }

  return `PH-${datePart}-${Date.now().toString().slice(-6)}`;
}

export function normalizeCartItem(item: Omit<CartItem, "image"> & { image?: string }): PublicOrderItemInput {
  return {
    productId: item.productId,
    productSlug: item.slug,
    productName: item.name,
    imageUrl: item.image,
    packageWeight: item.selectedPackageWeight,
    unitPrice: item.selectedPackagePrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal
  };
}

export async function createSupabaseOrder(input: PublicOrderInput) {
  const supabase = createSupabaseAdminClient();
  const verifiedItems = await verifyOrderItems(input.items);
  const subtotal = verifiedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const deliveryCharge = Math.max(0, input.deliveryCharge || 0);
  const total = subtotal + deliveryCharge;
  const orderNumber = await generateOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: input.customerName,
      phone: input.phone,
      address: input.address,
      note: input.note || null,
      source: input.source,
      subtotal,
      delivery_charge: deliveryCharge,
      discount_amount: 0,
      total,
      payment_method: input.paymentMethod || "cod",
      order_status: "pending",
      payment_status: "pending"
    })
    .select("id, order_number")
    .single();

  if (orderError) throw new Error(orderError.message);

  const { error: itemsError } = await supabase.from("order_items").insert(
    verifiedItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_package_id: item.productPackageId,
      product_slug: item.productSlug || null,
      product_name: item.productName,
      image_url: item.imageUrl || null,
      package_weight: item.packageWeight || null,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      line_total: item.unitPrice * item.quantity
    }))
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error(itemsError.message);
  }

  revalidatePath("/dashboard/orders");
  return order.order_number as string;
}

async function getOrders(limit?: number, nextPath = "/dashboard/orders") {
  await requireAdmin(nextPath);
  const supabase = createSupabaseAdminClient();

  let request = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });

  if (limit) {
    request = request.limit(limit);
  }

  const { data, error } = await request;

  if (error) {
    console.warn("Supabase admin orders read failed:", error.message);
    throw new Error(error.message);
  }

  return ((data || []) as SupabaseOrderRow[]).map(mapOrder);
}

export async function getAdminOrders() {
  return getOrders();
}

export async function getAdminRecentOrders(limit = 8, nextPath = "/dashboard") {
  return getOrders(limit, nextPath);
}

export async function getPublicTrackedOrder(orderNumber: string, phone: string) {
  const cleanOrderNumber = orderNumber.trim();
  const cleanPhone = phone.trim();

  if (!cleanOrderNumber || !cleanPhone) return null;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("order_number", cleanOrderNumber)
    .eq("phone", cleanPhone)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return mapOrder(data as SupabaseOrderRow);
}

export async function updateOrderStatuses(orderId: string, input: {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
}) {
  await requireAdmin("/dashboard/orders");
  const supabase = createSupabaseAdminClient();
  const payload: Record<string, string> = {};

  if (input.orderStatus) payload.order_status = input.orderStatus;
  if (input.paymentStatus) payload.payment_status = input.paymentStatus;

  if (!Object.keys(payload).length) return;

  const { error } = await supabase.from("orders").update(payload).eq("id", orderId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/orders");
}
