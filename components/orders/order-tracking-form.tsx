"use client";

import { CheckCircle2, Loader2, PackageCheck, Phone, Search, Truck } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { trackOrder } from "@/actions/track-order";
import type { AdminOrder } from "@/lib/supabase/admin-orders";
import { formatCurrency, whatsappLink } from "@/utils/format";

const initialState = { ok: false, message: "", order: undefined as AdminOrder | undefined };

const orderStatusLabels: Record<AdminOrder["orderStatus"], string> = {
  pending: "পেন্ডিং",
  confirmed: "কনফার্মড",
  processing: "প্রসেসিং",
  shipped: "শিপড",
  delivered: "ডেলিভারড",
  cancelled: "বাতিল"
};

const paymentStatusLabels: Record<AdminOrder["paymentStatus"], string> = {
  pending: "পেন্ডিং",
  paid: "পেইড",
  failed: "ফেইলড",
  refunded: "রিফান্ডেড"
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("bn-BD", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function addressSummary(address: string) {
  const cleanAddress = address.trim().replace(/\s+/g, " ");
  if (cleanAddress.length <= 90) return cleanAddress;
  return `${cleanAddress.slice(0, 90)}...`;
}

function statusClass(status: string) {
  if (status === "delivered" || status === "paid") return "bg-[#E8F5E9] text-[#1B5E20]";
  if (status === "cancelled" || status === "failed") return "bg-red-50 text-red-700";
  if (status === "processing" || status === "shipped" || status === "confirmed") {
    return "bg-[#FFF8E1] text-[#8A5A00]";
  }
  return "bg-neutral-100 text-neutral-600";
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2E7D32] px-5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
      {pending ? "খোঁজা হচ্ছে..." : "অর্ডার খুঁজুন"}
    </button>
  );
}

function OrderResult({ order }: { order: AdminOrder }) {
  const supportHref = whatsappLink(`আমার অর্ডার ${order.orderNumber} সম্পর্কে জানতে চাই।`);

  return (
    <section className="rounded-3xl border border-[#CFE3C7] bg-white p-4 shadow-xl shadow-green-950/10 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-[#E8F5E9] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-3 py-1 text-xs font-black text-[#1B5E20]">
            <CheckCircle2 className="size-4" />
            অর্ডার পাওয়া গেছে
          </p>
          <h2 className="mt-3 break-words text-2xl font-black text-[#17351a]">{order.orderNumber}</h2>
          <p className="mt-1 text-sm font-semibold text-neutral-500">{formatDate(order.createdAt)}</p>
        </div>
        <a
          href={supportHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#1B5E20] px-5 text-sm font-black text-white transition hover:bg-[#17351a]"
        >
          <Phone className="size-4" />
          সাপোর্টে কথা বলুন
        </a>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#F7FBF7] p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#D99600]">Customer</p>
          <h3 className="mt-2 break-words text-lg font-black text-[#17351a]">{order.customerName}</h3>
          <p className="mt-1 break-words text-sm font-semibold text-neutral-700">{order.phone}</p>
          <p className="mt-2 break-words text-sm leading-6 text-neutral-600">{addressSummary(order.address)}</p>
        </div>
        <div className="rounded-2xl bg-[#F7FBF7] p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#D99600]">Status</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1.5 text-xs font-black ${statusClass(order.orderStatus)}`}>
              <Truck className="mr-1 inline size-4 align-[-3px]" />
              {orderStatusLabels[order.orderStatus]}
            </span>
            <span className={`rounded-full px-3 py-1.5 text-xs font-black ${statusClass(order.paymentStatus)}`}>
              {paymentStatusLabels[order.paymentStatus]}
            </span>
          </div>
          <p className="mt-4 text-2xl font-black text-[#1B5E20]">{formatCurrency(order.total)}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#E8F5E9]">
        <div className="flex items-center gap-2 border-b border-[#E8F5E9] px-4 py-3 font-black text-[#17351a]">
          <PackageCheck className="size-5 text-[#2E7D32]" />
          অর্ডার আইটেম
        </div>
        <div className="grid gap-3 p-4">
          {order.items.map((item) => (
            <div key={item.id} className="grid gap-2 rounded-2xl bg-[#FBFDFB] p-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <p className="break-words font-black text-[#17351a]">{item.productName}</p>
                <p className="mt-1 text-neutral-500">
                  {item.packageWeight || "-"} x {item.quantity}
                </p>
              </div>
              <div className="font-black text-[#1B5E20] sm:text-right">
                <p>{formatCurrency(item.lineTotal)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-2 rounded-2xl bg-[#F7FBF7] p-4 text-sm">
        <div className="flex justify-between gap-3"><span>সাবটোটাল</span><span>{formatCurrency(order.subtotal)}</span></div>
        <div className="flex justify-between gap-3"><span>ডেলিভারি</span><span>{formatCurrency(order.deliveryCharge)}</span></div>
        <div className="flex justify-between gap-3"><span>ডিসকাউন্ট</span><span>{formatCurrency(order.discountAmount)}</span></div>
        <div className="flex justify-between gap-3 border-t border-[#DDEEDD] pt-3 text-lg font-black text-[#17351a]">
          <span>মোট</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>
    </section>
  );
}

export function OrderTrackingForm({ defaultOrderNumber = "" }: { defaultOrderNumber?: string }) {
  const [state, formAction] = useActionState(trackOrder, initialState);

  return (
    <div className="grid gap-6">
      <form action={formAction} className="rounded-3xl border border-[#CFE3C7] bg-white p-5 shadow-xl shadow-green-950/10 sm:p-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px] md:items-end">
          <label className="grid gap-2 text-sm font-black text-[#17351a]">
            অর্ডার নম্বর
            <input
              name="orderNumber"
              required
              defaultValue={defaultOrderNumber}
              placeholder="PH-20260614-1234"
              className="min-h-12 rounded-2xl border border-[#CFE3C7] bg-[#FBFFF8] px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-neutral-400 focus:border-[#2E7D32] focus:bg-white focus:ring-4 focus:ring-[#E8F5E9]"
            />
          </label>
          <label className="grid gap-2 text-sm font-black text-[#17351a]">
            ফোন নম্বর
            <input
              name="phone"
              required
              placeholder="অর্ডারের ফোন নম্বর"
              className="min-h-12 rounded-2xl border border-[#CFE3C7] bg-[#FBFFF8] px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-neutral-400 focus:border-[#2E7D32] focus:bg-white focus:ring-4 focus:ring-[#E8F5E9]"
            />
          </label>
          <SubmitButton />
        </div>
        {state.message && !state.ok ? (
          <div className="mt-4 rounded-2xl border border-[#F7D7D7] bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {state.message}
          </div>
        ) : null}
      </form>

      {state.ok && state.order ? (
        <OrderResult order={state.order} />
      ) : (
        <div className="rounded-3xl border border-dashed border-[#CFE3C7] bg-[#F7FBF7] p-6 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-white text-[#2E7D32] shadow-sm">
            <PackageCheck className="size-6" />
          </div>
          <h2 className="mt-4 text-xl font-black text-[#17351a]">অর্ডার স্ট্যাটাস দেখুন</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">
            অর্ডার নম্বর এবং একই ফোন নম্বর দিলে আপনার অর্ডারের সর্বশেষ অবস্থা দেখা যাবে।
          </p>
        </div>
      )}
    </div>
  );
}
