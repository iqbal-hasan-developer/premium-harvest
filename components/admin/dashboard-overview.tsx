"use client";

import { ClipboardList, ImageIcon, Loader2, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminDashboardOverviewData } from "@/actions/admin-dashboard";
import type { AdminDashboardOverviewData, DashboardStatCard } from "@/lib/supabase/admin-dashboard";
import type { AdminOrder } from "@/lib/supabase/admin-orders";
import { formatCurrency } from "@/utils/format";

const statIcons = {
  products: Package,
  orders: ShoppingBag,
  gallery: ImageIcon,
  contacts: ClipboardList
} satisfies Record<DashboardStatCard["key"], typeof Package>;

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function itemSummary(order: AdminOrder) {
  if (!order.items.length) return "-";
  return order.items
    .map((item) => `${item.productName}${item.packageWeight ? ` (${item.packageWeight})` : ""} x ${item.quantity}`)
    .join(", ");
}

function statusClass(status: string) {
  if (status === "delivered" || status === "paid") return "bg-[#E8F5E9] text-[#1B5E20]";
  if (status === "cancelled" || status === "failed") return "bg-red-50 text-red-700";
  if (status === "processing" || status === "shipped" || status === "confirmed") {
    return "bg-[#FFF8E1] text-[#8A5A00]";
  }
  return "bg-neutral-100 text-neutral-600";
}

export function DashboardOverview() {
  const [data, setData] = useState<AdminDashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        setData(await getAdminDashboardOverviewData());
      } catch (error) {
        console.error("Failed to load dashboard overview", error);
        setData(null);
        setError(error instanceof Error ? error.message : "Dashboard data could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const stats = data?.stats ?? [];
  const recentOrders = data?.recentOrders ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#17351a]">ড্যাশবোর্ড ওভারভিউ</h1>
      <p className="mt-2 text-sm text-neutral-600">Premium Harvest-এর সাম্প্রতিক কার্যক্রম।</p>

      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading && !stats.length
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="size-12 animate-pulse rounded-full bg-[#E8F5E9]" />
                  <div className="flex-1">
                    <div className="h-3 w-24 animate-pulse rounded-full bg-neutral-100" />
                    <div className="mt-3 h-8 w-16 animate-pulse rounded-full bg-neutral-100" />
                  </div>
                </div>
              </div>
            ))
          : stats.map((stat) => {
              const Icon = statIcons[stat.key];
              return (
                <div key={stat.key} className="rounded-2xl border border-[#E8F5E9] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-neutral-500">{stat.label}</p>
                      <p className="mt-2 text-3xl font-black text-[#1B5E20]">{stat.value}</p>
                      <p className="mt-2 text-xs font-semibold text-neutral-500">{stat.subtext}</p>
                    </div>
                    <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                      <Icon className="size-5" />
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      <section className="mt-8 rounded-2xl border border-[#E8F5E9] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#17351a]">সাম্প্রতিক অর্ডার</h2>
            <p className="mt-1 text-sm text-neutral-500">Supabase orders থেকে সর্বশেষ অর্ডারগুলো।</p>
          </div>
          <Link
            href="/dashboard/orders"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#E8F5E9] px-4 text-sm font-bold text-[#1B5E20] transition hover:bg-[#d6edd8]"
          >
            সব অর্ডার দেখুন
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="text-neutral-500">
              <tr>
                <th className="py-3">Order</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Loading...
                    </span>
                  </td>
                </tr>
              ) : null}
              {!loading && recentOrders.length ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-[#E8F5E9] align-top">
                    <td className="py-3 font-black text-[#17351a]">{order.orderNumber}</td>
                    <td className="font-semibold text-[#17351a]">{order.customerName}</td>
                    <td>{order.phone}</td>
                    <td className="max-w-sm">
                      <p className="line-clamp-2 leading-6">{itemSummary(order)}</p>
                    </td>
                    <td className="font-black text-[#1B5E20]">{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                ))
              ) : null}
              {!loading && !recentOrders.length ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20]">
                        <ShoppingBag className="size-5" />
                      </div>
                      <p className="mt-3 font-bold text-[#17351a]">এখনও কোনো অর্ডার নেই।</p>
                      <p className="mt-1 text-sm text-neutral-500">নতুন অর্ডার এলে এখানে দেখা যাবে।</p>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
