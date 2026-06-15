"use client";

import { CheckCircle2, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { createOrder } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { trackPurchase } from "@/lib/analytics/meta-pixel";
import type { Product, ProductPackage } from "@/types";
import { formatBanglaNumber, formatCurrency } from "@/utils/format";

type OrderFormProps = {
  product: Product;
  selectedPackage: ProductPackage;
  quantity: number;
  deliveryCharge?: number;
  totalPrice: number;
  onSuccess?: () => void;
};

export function OrderForm({
  product,
  selectedPackage,
  quantity,
  deliveryCharge = 0,
  totalPrice,
  onSuccess
}: OrderFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    formData.set("productId", product.id);
    formData.set("productSlug", product.slug);
    formData.set("productImage", product.images[0] || "");
    formData.set("productName", product.name);
    formData.set("selectedPackage", `${selectedPackage.weight} প্যাক - ${selectedPackage.price} টাকা`);
    formData.set("packageWeight", selectedPackage.weight);
    formData.set("packagePrice", String(selectedPackage.price));
    formData.set("quantity", String(quantity));
    formData.set("deliveryCharge", String(deliveryCharge));
    formData.set("totalPrice", String(totalPrice));

    const customerName = String(formData.get("customerName") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const address = String(formData.get("address") || "").trim();

    if (customerName.length < 2 || phone.length < 8 || address.length < 8) {
      toast.error("নাম, ফোন নম্বর ও পূর্ণ ঠিকানা সঠিকভাবে লিখুন।");
      setSubmitting(false);
      return;
    }

    try {
      const result = await createOrder(null, formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.orderNumber ? `অর্ডার সফল হয়েছে: ${result.orderNumber}` : result.message);
      trackPurchase({
        content_ids: [product.id || product.slug],
        contents: [
          {
            id: product.id || product.slug,
            quantity,
            item_price: selectedPackage.price
          }
        ],
        content_name: product.name,
        content_type: "product",
        num_items: quantity,
        order_id: result.orderNumber,
        order_number: result.orderNumber,
        value: totalPrice
      });
      setSuccessOrderNumber(result.orderNumber || "");
    } catch (error) {
      console.error("Failed to create order", error);
      toast.error("অর্ডার সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  }

  if (successOrderNumber) {
    return (
      <div className="grid gap-5 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20]">
          <CheckCircle2 className="size-8" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-[#17351a]">অর্ডার গ্রহণ করা হয়েছে</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-600">
            Premium Harvest টিম দ্রুত আপনার সাথে যোগাযোগ করবে।
          </p>
        </div>
        <p className="mx-auto rounded-full bg-[#E8F5E9] px-4 py-2 text-sm font-black text-[#1B5E20]">
          Order: {successOrderNumber}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href={`/track-order?orderNumber=${encodeURIComponent(successOrderNumber)}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2E7D32] px-5 text-sm font-black text-white transition hover:bg-[#1B5E20]"
          >
            <Search className="size-4" />
            অর্ডার ট্র্যাক করুন
          </Link>
          <button
            type="button"
            onClick={onSuccess}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#E8F5E9] px-5 text-sm font-black text-[#1B5E20] transition hover:bg-[#d6edd8]"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="rounded-xl border border-[#E8F5E9] bg-[#F7FBF7] p-4">
        <p className="text-sm font-semibold text-[#2E7D32]">নির্বাচিত অর্ডার</p>
        <div className="mt-3 grid gap-2 text-sm text-neutral-700">
          <div className="flex items-center justify-between gap-3">
            <span>{selectedPackage.weight} প্যাক</span>
            <span className="font-semibold text-[#17351a]">{formatCurrency(selectedPackage.price)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>পরিমাণ</span>
            <span className="font-semibold text-[#17351a]">{formatBanglaNumber(quantity)} টি</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[#E8F5E9] pt-2 text-base font-bold text-[#17351a]">
            <span>মোট</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="customerName" required placeholder="আপনার নাম" className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]" />
        <input name="phone" required placeholder="ফোন নম্বর" className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]" />
      </div>
      <textarea name="address" required placeholder="পূর্ণ ঠিকানা" rows={3} className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]" />
      <textarea name="note" placeholder="নোট (ঐচ্ছিক)" rows={2} className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]" />
      <Button type="submit" disabled={submitting} className="w-full cursor-pointer">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {submitting ? "পাঠানো হচ্ছে" : "অর্ডার জমা দিন"}
      </Button>
    </form>
  );
}
