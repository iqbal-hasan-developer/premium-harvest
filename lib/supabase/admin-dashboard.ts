import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { getAdminRecentOrders, type AdminOrder } from "@/lib/supabase/admin-orders";

export type DashboardStatCard = {
  key: "products" | "orders" | "gallery" | "contacts";
  label: string;
  value: number;
  subtext: string;
};

export type AdminDashboardOverviewData = {
  stats: DashboardStatCard[];
  recentOrders: AdminOrder[];
};

async function getTableCount(
  table: "products" | "orders" | "gallery" | "contact_messages",
  label: string,
  filters: Array<{ column: string; value: string | boolean }> = []
) {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true });

  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`${label} count failed: ${error.message}`);
  }

  return count ?? 0;
}

export async function getAdminDashboardOverviewData(): Promise<AdminDashboardOverviewData> {
  await requireAdmin("/dashboard");

  const [
    totalProducts,
    activeProducts,
    totalOrders,
    pendingOrders,
    totalGallery,
    publishedGallery,
    totalContacts,
    unreadContacts,
    recentOrders
  ] = await Promise.all([
    getTableCount("products", "Products"),
    getTableCount("products", "Active products", [{ column: "is_active", value: true }]),
    getTableCount("orders", "Orders"),
    getTableCount("orders", "Pending orders", [{ column: "order_status", value: "pending" }]),
    getTableCount("gallery", "Gallery"),
    getTableCount("gallery", "Published gallery", [{ column: "published", value: true }]),
    getTableCount("contact_messages", "Contact messages"),
    getTableCount("contact_messages", "Unread contact messages", [{ column: "status", value: "unread" }]),
    getAdminRecentOrders(8, "/dashboard")
  ]);

  return {
    stats: [
      {
        key: "products",
        label: "মোট পণ্য",
        value: totalProducts,
        subtext: `${activeProducts} সক্রিয় পণ্য`
      },
      {
        key: "orders",
        label: "মোট অর্ডার",
        value: totalOrders,
        subtext: `${pendingOrders} pending order`
      },
      {
        key: "gallery",
        label: "গ্যালারি ছবি",
        value: totalGallery,
        subtext: `${publishedGallery} প্রকাশিত ছবি`
      },
      {
        key: "contacts",
        label: "কন্টাক্ট মেসেজ",
        value: totalContacts,
        subtext: `${unreadContacts} অপঠিত মেসেজ`
      }
    ],
    recentOrders
  };
}
