"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase/client";
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

export function OrderForm({ product, selectedPackage, quantity, deliveryCharge = 0, totalPrice, onSuccess }: OrderFormProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const orderPayload = {
      productId: product.id,
      productName: product.name,
      selectedPackage: `${selectedPackage.weight} প্যাক - ${selectedPackage.price} টাকা`,
      packageWeight: selectedPackage.weight,
      packagePrice: selectedPackage.price,
      customerName: String(formData.get("customerName") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      quantity,
      deliveryCharge,
      totalPrice,
      note: String(formData.get("note") || "").trim(),
      status: "pending",
      createdAt: serverTimestamp()
    };

    if (orderPayload.customerName.length < 2 || orderPayload.phone.length < 8 || orderPayload.address.length < 8) {
      toast.error("নাম, ফোন নম্বর ও পূর্ণ ঠিকানা সঠিকভাবে লিখুন।");
      setSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, "orders"), orderPayload);
      toast.success("আপনার অর্ডার সফলভাবে জমা হয়েছে।");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create order", error);
      toast.error("অর্ডার সংরক্ষণ করা যায়নি। Firestore rules deploy করা আছে কিনা যাচাই করুন।");
    } finally {
      setSubmitting(false);
    }
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
