"use client";

import { Eye, Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  getAdminOrderManagerData,
  updateAdminOrderStatus,
  updateAdminPaymentStatus
} from "@/actions/admin-orders";
import type { AdminOrder } from "@/lib/supabase/admin-orders";
import type { OrderStatus, PaymentStatus } from "@/types";
import { formatCurrency } from "@/utils/format";

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "পেন্ডিং",
  confirmed: "কনফার্মড",
  processing: "প্রসেসিং",
  shipped: "শিপড",
  delivered: "ডেলিভারড",
  cancelled: "বাতিল"
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "পেন্ডিং",
  paid: "পেইড",
  failed: "ফেইলড",
  refunded: "রিফান্ডেড"
};

const orderStatuses = Object.keys(orderStatusLabels) as OrderStatus[];
const paymentStatuses = Object.keys(paymentStatusLabels) as PaymentStatus[];

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

function ItemChips({ order }: { order: AdminOrder }) {
  const visibleItems = order.items.slice(0, 2);
  const extraCount = order.items.length - visibleItems.length;

  if (!visibleItems.length) {
    return <span className="text-neutral-500">-</span>;
  }

  return (
    <div className="flex max-w-[320px] flex-wrap gap-1.5">
      {visibleItems.map((item) => (
        <span key={item.id} className="max-w-full truncate rounded-full bg-[#E8F5E9] px-2.5 py-1 text-xs font-semibold text-[#1B5E20]">
          {item.productName}
          {item.packageWeight ? ` - ${item.packageWeight}` : ""} x {item.quantity}
        </span>
      ))}
      {extraCount > 0 ? (
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
          +{extraCount} more
        </span>
      ) : null}
    </div>
  );
}

function MobileItemSummary({ order }: { order: AdminOrder }) {
  if (!order.items.length) {
    return <p className="text-sm text-neutral-500">-</p>;
  }

  return (
    <div className="grid gap-1.5">
      {order.items.slice(0, 3).map((item) => (
        <p key={item.id} className="text-sm font-semibold leading-6 text-[#17351a]">
          {item.productName}
          {item.packageWeight ? ` (${item.packageWeight})` : ""} x {item.quantity}
        </p>
      ))}
      {order.items.length > 3 ? (
        <p className="text-xs font-bold text-neutral-500">আরও {order.items.length - 3}টি পণ্য</p>
      ) : null}
    </div>
  );
}

export function SupabaseOrdersManager() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [pending, startTransition] = useTransition();

  async function loadOrders() {
    setLoading(true);
    try {
      setOrders(await getAdminOrderManagerData());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Orders could not be loaded.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
      const matchesQuery =
        !term ||
        `${order.orderNumber} ${order.customerName} ${order.phone} ${itemSummary(order)}`
          .toLowerCase()
          .includes(term);

      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);
  const emptyStateText = orders.length ? "মিল পাওয়া যায়নি।" : "এখনও কোনো অর্ডার নেই।";

  function changeOrderStatus(order: AdminOrder, orderStatus: OrderStatus) {
    startTransition(async () => {
      const result = await updateAdminOrderStatus(order.id, orderStatus);
      if (result.ok) {
        toast.success(result.message);
        await loadOrders();
      } else {
        toast.error(result.message);
      }
    });
  }

  function changePaymentStatus(order: AdminOrder, paymentStatus: PaymentStatus) {
    startTransition(async () => {
      const result = await updateAdminPaymentStatus(order.id, paymentStatus);
      if (result.ok) {
        toast.success(result.message);
        await loadOrders();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="grid min-w-0 gap-4">
      <div className="rounded-2xl border border-[#E8F5E9] bg-white p-3 shadow-sm sm:p-4">
        <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#2E7D32]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="অর্ডার নম্বর, ফোন, কাস্টমার বা পণ্য খুঁজুন"
              className="h-12 w-full rounded-full border border-[#E8F5E9] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#2E7D32]"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | OrderStatus)}
            className="h-12 w-full rounded-full border border-[#E8F5E9] bg-[#F7FBF7] px-4 text-sm font-semibold text-[#17351a] outline-none"
          >
            <option value="all">সব স্ট্যাটাস</option>
            {orderStatuses.map((status) => (
              <option key={status} value={status}>{orderStatusLabels[status]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="hidden min-w-0 overflow-hidden rounded-2xl border border-[#E8F5E9] bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[150px]" />
              <col className="w-[210px]" />
              <col className="w-[130px]" />
              <col className="w-[250px]" />
              <col className="w-[120px]" />
              <col className="w-[140px]" />
              <col className="w-[130px]" />
              <col className="w-[150px]" />
              <col className="w-[80px]" />
            </colgroup>
            <thead className="text-neutral-500">
              <tr>
                <th className="px-5 py-4">অর্ডার</th>
                <th className="px-3 py-4">কাস্টমার</th>
                <th className="px-3 py-4">ফোন</th>
                <th className="px-3 py-4">পণ্য</th>
                <th className="px-3 py-4">মোট</th>
                <th className="px-3 py-4">অর্ডার স্ট্যাটাস</th>
                <th className="px-3 py-4">পেমেন্ট</th>
                <th className="px-3 py-4">তারিখ</th>
                <th className="px-3 py-4 text-center">ডিটেইলস</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-neutral-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      লোড হচ্ছে...
                    </span>
                  </td>
                </tr>
              ) : null}
              {!loading && !filteredOrders.length ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <div className="mx-auto max-w-sm rounded-2xl bg-[#F7FBF7] px-6 py-8 text-center">
                      <p className="text-base font-black text-[#17351a]">{emptyStateText}</p>
                    </div>
                  </td>
                </tr>
              ) : null}
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-[#E8F5E9] align-middle transition hover:bg-[#F7FBF7]">
                  <td className="px-5 py-4">
                    <p className="break-words font-black text-[#17351a]">{order.orderNumber}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-neutral-400">{order.source}</p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="break-words font-bold text-[#17351a]">{order.customerName}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">{order.address}</p>
                  </td>
                  <td className="px-3 py-4 font-semibold text-neutral-700">{order.phone}</td>
                  <td className="px-3 py-4">
                    <ItemChips order={order} />
                  </td>
                  <td className="px-3 py-4 text-base font-black text-[#1B5E20]">{formatCurrency(order.total)}</td>
                  <td className="px-3 py-4">
                    <select
                      value={order.orderStatus}
                      onChange={(event) => changeOrderStatus(order, event.target.value as OrderStatus)}
                      disabled={pending}
                      className="h-10 w-full rounded-full border border-[#E8F5E9] bg-[#F7FBF7] px-3 text-sm outline-none disabled:opacity-60"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>{orderStatusLabels[status]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-4">
                    <select
                      value={order.paymentStatus}
                      onChange={(event) => changePaymentStatus(order, event.target.value as PaymentStatus)}
                      disabled={pending}
                      className="h-10 w-full rounded-full border border-[#E8F5E9] bg-[#F7FBF7] px-3 text-sm outline-none disabled:opacity-60"
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>{paymentStatusLabels[status]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-4 text-neutral-600">{formatDate(order.createdAt)}</td>
                  <td className="px-3 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="mx-auto grid size-10 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20] transition hover:bg-[#d6edd8]"
                      aria-label={`View ${order.orderNumber}`}
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {loading ? (
          <div className="rounded-2xl border border-[#E8F5E9] bg-white px-4 py-8 text-center text-neutral-500 shadow-sm">
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              লোড হচ্ছে...
            </span>
          </div>
        ) : null}
        {!loading && !filteredOrders.length ? (
          <div className="rounded-2xl border border-[#E8F5E9] bg-white px-5 py-10 text-center shadow-sm">
            <p className="text-base font-black text-[#17351a]">{emptyStateText}</p>
          </div>
        ) : null}
        {filteredOrders.map((order) => (
          <article
            key={order.id}
            className="w-full rounded-2xl border border-[#DDEEDD] bg-white p-4 shadow-[0_14px_34px_rgba(23,53,26,0.08)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-500">অর্ডার নম্বর</p>
                <h2 className="mt-1 break-words text-lg font-black text-[#17351a]">{order.orderNumber}</h2>
              </div>
              <p className="shrink-0 rounded-full bg-[#E8F5E9] px-3 py-1 text-sm font-black text-[#1B5E20]">
                {formatCurrency(order.total)}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[#F7FBF7] p-3 text-sm">
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-500">কাস্টমার</p>
                <p className="mt-1 break-words font-bold text-[#17351a]">{order.customerName}</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-500">ফোন</p>
                <p className="mt-1 break-words font-bold text-[#17351a]">{order.phone}</p>
              </div>
              <div className="col-span-2 min-w-0">
                <p className="text-xs font-bold text-neutral-500">তারিখ</p>
                <p className="mt-1 text-neutral-700">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold text-neutral-500">পণ্য</p>
              <div className="mt-2 rounded-2xl border border-[#E8F5E9] bg-[#FBFDFB] p-3">
                <MobileItemSummary order={order} />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-bold text-neutral-500">
                অর্ডার স্ট্যাটাস
                <select
                  value={order.orderStatus}
                  onChange={(event) => changeOrderStatus(order, event.target.value as OrderStatus)}
                  disabled={pending}
                  className="h-12 w-full rounded-full border border-[#E8F5E9] bg-[#F7FBF7] px-4 text-sm font-semibold text-[#17351a] outline-none disabled:opacity-60"
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>{orderStatusLabels[status]}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-bold text-neutral-500">
                পেমেন্ট স্ট্যাটাস
                <select
                  value={order.paymentStatus}
                  onChange={(event) => changePaymentStatus(order, event.target.value as PaymentStatus)}
                  disabled={pending}
                  className="h-12 w-full rounded-full border border-[#E8F5E9] bg-[#F7FBF7] px-4 text-sm font-semibold text-[#17351a] outline-none disabled:opacity-60"
                >
                  {paymentStatuses.map((status) => (
                    <option key={status} value={status}>{paymentStatusLabels[status]}</option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(order)}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1B5E20] px-4 text-sm font-bold text-white transition hover:bg-[#17351a]"
            >
              <Eye className="size-4" />
              বিস্তারিত দেখুন
            </button>
          </article>
        ))}
      </div>

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-end bg-[#17351a]/45 p-3 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true">
          <div className="mx-auto max-h-[calc(100vh-24px)] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:max-h-[calc(100vh-48px)] sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E8F5E9] pb-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D99600]">অর্ডার বিস্তারিত</p>
                <h2 className="mt-1 break-words text-xl font-black text-[#17351a]">{selectedOrder.orderNumber}</h2>
                <p className="mt-1 text-sm text-neutral-500">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20] transition hover:bg-[#d6edd8]"
                aria-label="Close order details"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
              <div className="rounded-2xl border border-[#E8F5E9] p-4">
                <h3 className="font-bold text-[#17351a]">কাস্টমার তথ্য</h3>
                <div className="mt-3 grid gap-2 text-sm leading-6 text-neutral-700">
                  <p className="break-words"><span className="font-semibold text-neutral-500">নাম:</span> {selectedOrder.customerName}</p>
                  <p className="break-words"><span className="font-semibold text-neutral-500">ফোন:</span> {selectedOrder.phone}</p>
                  <p className="break-words"><span className="font-semibold text-neutral-500">ঠিকানা:</span> {selectedOrder.address}</p>
                  <p className="break-words"><span className="font-semibold text-neutral-500">নোট:</span> {selectedOrder.note || "-"}</p>
                  <p><span className="font-semibold text-neutral-500">পেমেন্ট মেথড:</span> {selectedOrder.paymentMethod}</p>
                  <p><span className="font-semibold text-neutral-500">অর্ডার স্ট্যাটাস:</span> {orderStatusLabels[selectedOrder.orderStatus]}</p>
                  <p><span className="font-semibold text-neutral-500">পেমেন্ট স্ট্যাটাস:</span> {paymentStatusLabels[selectedOrder.paymentStatus]}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E8F5E9] p-4">
                <h3 className="font-bold text-[#17351a]">পণ্য</h3>
                <div className="mt-3 grid gap-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="grid min-w-0 gap-2 rounded-xl bg-[#F7FBF7] p-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto]">
                      <div className="min-w-0">
                        <p className="break-words font-bold text-[#17351a]">{item.productName}</p>
                        <p className="text-neutral-500">{item.packageWeight || "-"} x {item.quantity}</p>
                      </div>
                      <div className="text-left font-bold text-[#1B5E20] sm:text-right">
                        <p>{formatCurrency(item.unitPrice)}</p>
                        <p>{formatCurrency(item.lineTotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-2 border-t border-[#E8F5E9] pt-4 text-sm">
                  <div className="flex justify-between gap-3"><span>সাবটোটাল</span><span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                  <div className="flex justify-between gap-3"><span>ডেলিভারি</span><span>{formatCurrency(selectedOrder.deliveryCharge)}</span></div>
                  <div className="flex justify-between gap-3"><span>ডিসকাউন্ট</span><span>{formatCurrency(selectedOrder.discountAmount)}</span></div>
                  <div className="flex justify-between gap-3 text-lg font-black text-[#17351a]"><span>মোট</span><span>{formatCurrency(selectedOrder.total)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
