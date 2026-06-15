"use client";

import { ArrowLeft, CheckCircle2, Loader2, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createCartOrder } from "@/actions/orders";
import { trackPurchase } from "@/lib/analytics/meta-pixel";
import type { CartItem } from "@/types";
import { formatBanglaNumber, formatCurrency } from "@/utils/format";

type CartOrderFormProps = {
  items: CartItem[];
  subtotal: number;
  onCancel: () => void;
  onSuccess: () => void;
  onClose: () => void;
};

const initialState = { ok: false, message: "", orderNumber: undefined as string | undefined };

function SubmitOrderButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2E7D32] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
      {pending ? "অর্ডার হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
    </button>
  );
}

export function CartOrderForm({ items, subtotal, onCancel, onSuccess, onClose }: CartOrderFormProps) {
  const [state, formAction] = useActionState(createCartOrder, initialState);
  const successHandled = useRef(false);
  const hasInvalidCart = !items.length || subtotal <= 0 || items.some((item) => item.lineTotal !== item.selectedPackagePrice * item.quantity);

  useEffect(() => {
    if (!state.ok || successHandled.current) return;
    successHandled.current = true;
    trackPurchase({
      content_ids: items.map((item) => item.productId || item.slug),
      contents: items.map((item) => ({
        id: item.productId || item.slug,
        quantity: item.quantity,
        item_price: item.selectedPackagePrice
      })),
      num_items: items.reduce((total, item) => total + item.quantity, 0),
      order_id: state.orderNumber,
      order_number: state.orderNumber,
      value: subtotal
    });
    onSuccess();
  }, [items, onSuccess, state.ok, state.orderNumber, subtotal]);

  if (state.ok) {
    return (
      <div className="grid min-h-[46vh] place-items-center px-5 py-8 text-center sm:px-6">
        <div>
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20]">
            <CheckCircle2 className="size-8" />
          </div>
          <h3 className="mt-5 text-2xl font-black text-[#17351a]">অর্ডার গ্রহণ করা হয়েছে</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-neutral-600">
            Premium Harvest টিম দ্রুত আপনার সাথে যোগাযোগ করবে।
          </p>
          {state.orderNumber ? (
            <p className="mx-auto mt-3 rounded-full bg-[#E8F5E9] px-4 py-2 text-sm font-black text-[#1B5E20]">
              Order: {state.orderNumber}
            </p>
          ) : null}
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {state.orderNumber ? (
              <Link
                href={`/track-order?orderNumber=${encodeURIComponent(state.orderNumber)}`}
                onClick={onClose}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2E7D32] px-6 text-sm font-black text-white transition hover:bg-[#1B5E20]"
              >
                <Search className="size-4" />
                অর্ডার ট্র্যাক করুন
              </Link>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#E8F5E9] px-6 text-sm font-black text-[#1B5E20] transition hover:bg-[#d6edd8]"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-1 flex-col overflow-hidden">
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="subtotal" value={subtotal} />
      <input type="hidden" name="total" value={subtotal} />

      <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={onCancel}
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#1B5E20] transition hover:text-[#17351a]"
        >
          <ArrowLeft className="size-4" />
          কার্টে ফিরে যান
        </button>

        <div className="rounded-2xl border border-[#E8F5E9] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D99600]">Cart Order</p>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-3 text-neutral-600">
              <span>প্যাক সংখ্যা</span>
              <span className="font-bold text-[#17351a]">{formatBanglaNumber(items.length)}টি</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[#E8F5E9] pt-2 text-base font-black text-[#17351a]">
              <span>মোট</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <input
            name="customerName"
            required
            placeholder="আপনার নাম"
            className="rounded-xl border border-[#E8F5E9] bg-white px-4 py-3 outline-none focus:border-[#2E7D32]"
          />
          <input
            name="phone"
            required
            placeholder="ফোন নম্বর"
            className="rounded-xl border border-[#E8F5E9] bg-white px-4 py-3 outline-none focus:border-[#2E7D32]"
          />
          <textarea
            name="address"
            required
            placeholder="পূর্ণ ঠিকানা"
            rows={3}
            className="rounded-xl border border-[#E8F5E9] bg-white px-4 py-3 outline-none focus:border-[#2E7D32]"
          />
          <label className="rounded-xl border border-[#C8E6C9] bg-[#F7FBF7] p-4 text-sm font-bold text-[#17351a]">
            <span className="flex items-center gap-3">
              <input name="paymentMethod" type="radio" value="cod" defaultChecked className="size-4 accent-[#2E7D32]" />
              ক্যাশ অন ডেলিভারি
            </span>
          </label>
          <textarea
            name="note"
            placeholder="নোট (ঐচ্ছিক)"
            rows={2}
            className="rounded-xl border border-[#E8F5E9] bg-white px-4 py-3 outline-none focus:border-[#2E7D32]"
          />

          {state.message && !state.ok ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {state.message}
            </p>
          ) : null}
          {hasInvalidCart ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              কার্টের মূল্য যাচাই করা যাচ্ছে না। কার্ট আবার আপডেট করুন।
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-[#E8F5E9] bg-white px-5 py-4 sm:px-6">
        <SubmitOrderButton disabled={hasInvalidCart} />
      </div>
    </form>
  );
}
