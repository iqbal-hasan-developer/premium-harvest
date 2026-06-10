"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, MessageCircle, Minus, Plus, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { OrderForm } from "@/components/forms/order-form";
import type { Product, ProductPackage } from "@/types";
import { formatBanglaNumber, formatCurrency, getProductPackages, whatsappLink } from "@/utils/format";

type ProductOrderPanelProps = {
  product: Product;
};

const deliveryCharge = 0;

export function ProductOrderPanel({ product }: ProductOrderPanelProps) {
  const { addItem } = useCart();
  const packages = useMemo(() => getProductPackages(product), [product]);
  const initialPackageIndex = Math.max(
    0,
    packages.findIndex((item) => item.recommended)
  );
  const [selectedIndex, setSelectedIndex] = useState(initialPackageIndex);
  const [quantity, setQuantity] = useState(1);
  const [orderOpen, setOrderOpen] = useState(false);
  const selectedPackage = packages[selectedIndex] ?? packages[0];
  const subtotal = selectedPackage.price * quantity;
  const totalPrice = subtotal + deliveryCharge;
  const whatsappMessage = `${product.name} অর্ডার করতে চাই। প্যাকেজ: ${selectedPackage.weight}, পরিমাণ: ${formatBanglaNumber(quantity)}টি, মোট: ${formatCurrency(totalPrice)}।`;

  function handleAddToCart() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      selectedPackageWeight: selectedPackage.weight,
      selectedPackagePrice: selectedPackage.price,
      quantity
    });
  }

  return (
    <>
      <div className="grid gap-5">
        <section aria-labelledby="package-selection" className="rounded-2xl border border-[#E8F5E9] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#2E7D32]">Package Selection</p>
              <h2 id="package-selection" className="mt-1 text-xl font-bold text-[#17351a]">প্যাকেজ নির্বাচন করুন</h2>
            </div>
            <span className="rounded-full bg-[#FDF6E3] px-3 py-1 text-xs font-bold text-[#8A5A00]">সহজ অর্ডার</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {packages.map((item, index) => {
              const selected = index === selectedIndex;
              return (
                <motion.button
                  key={`${item.weight}-${item.price}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative min-h-32 rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-[#2E7D32] bg-[#F1FAF2] shadow-lg shadow-green-900/10"
                      : "border-[#E8F5E9] bg-white hover:border-[#A5D6A7] hover:bg-[#F7FBF7]"
                  }`}
                >
                  {item.recommended ? (
                    <span className="absolute right-3 top-3 rounded-full bg-[#2E7D32] px-2.5 py-1 text-[11px] font-bold text-white">
                      জনপ্রিয়
                    </span>
                  ) : null}
                  <span className={`grid size-7 place-items-center rounded-full border ${selected ? "border-[#2E7D32] bg-[#2E7D32] text-white" : "border-[#C8E6C9] text-transparent"}`}>
                    <Check className="size-4" />
                  </span>
                  <span className="mt-4 block text-lg font-bold text-[#17351a]">{item.weight} প্যাক</span>
                  <span className="mt-2 block text-2xl font-black text-[#1B5E20]">{formatCurrency(item.price)}</span>
                </motion.button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E8F5E9] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#2E7D32]">পরিমাণ</p>
              <h2 className="mt-1 text-xl font-bold text-[#17351a]">কয়টি প্যাক নেবেন?</h2>
            </div>
            <div className="flex h-12 items-center overflow-hidden rounded-full border border-[#C8E6C9] bg-[#F7FBF7]">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="grid size-12 place-items-center text-[#1B5E20] transition hover:bg-[#E8F5E9]"
                aria-label="পরিমাণ কমান"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-12 text-center text-lg font-black text-[#17351a]">{formatBanglaNumber(quantity)}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(50, value + 1))}
                className="grid size-12 place-items-center text-[#1B5E20] transition hover:bg-[#E8F5E9]"
                aria-label="পরিমাণ বাড়ান"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
          <motion.div
            key={`${selectedPackage.weight}-${quantity}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl bg-[#F7FBF7] px-4 py-3 text-sm font-semibold text-[#17351a]"
          >
            {selectedPackage.weight} প্যাক x {formatBanglaNumber(quantity)} = {formatCurrency(subtotal)}
          </motion.div>
        </section>

        <OrderSummary
          product={product}
          selectedPackage={selectedPackage}
          quantity={quantity}
          totalPrice={totalPrice}
          onOrder={() => setOrderOpen(true)}
          onAddToCart={handleAddToCart}
          whatsappMessage={whatsappMessage}
        />
      </div>

      <AnimatePresence>
        {orderOpen ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-modal-title"
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-6"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#2E7D32]">Order Form</p>
                  <h2 id="order-modal-title" className="mt-1 text-2xl font-bold text-[#17351a]">অর্ডার করুন</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderOpen(false)}
                  className="grid size-10 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20] transition hover:bg-[#d6edd8]"
                  aria-label="ফর্ম বন্ধ করুন"
                >
                  <X className="size-5" />
                </button>
              </div>
              <OrderForm
                product={product}
                selectedPackage={selectedPackage}
                quantity={quantity}
                deliveryCharge={deliveryCharge}
                totalPrice={totalPrice}
                onSuccess={() => setOrderOpen(false)}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function OrderSummary({
  product,
  selectedPackage,
  quantity,
  totalPrice,
  onOrder,
  onAddToCart,
  whatsappMessage
}: {
  product: Product;
  selectedPackage: ProductPackage;
  quantity: number;
  totalPrice: number;
  onOrder: () => void;
  onAddToCart: () => void;
  whatsappMessage: string;
}) {
  return (
    <motion.aside
      layout
      className="sticky bottom-4 z-20 rounded-2xl border border-[#C8E6C9] bg-white/95 p-4 shadow-xl shadow-green-950/10 backdrop-blur sm:p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#2E7D32]">Order Summary</p>
          <h2 className="mt-1 text-xl font-bold text-[#17351a]">অর্ডার সারাংশ</h2>
        </div>
        <span className="rounded-full bg-[#E8F5E9] px-3 py-1 text-xs font-bold text-[#1B5E20]">{product.name}</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-neutral-700">
        <div className="flex items-center justify-between gap-3">
          <span>নির্বাচিত প্যাকেজ</span>
          <span className="font-bold text-[#17351a]">{selectedPackage.weight} প্যাক</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>পরিমাণ</span>
          <span className="font-bold text-[#17351a]">{formatBanglaNumber(quantity)}টি</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>ডেলিভারি চার্জ</span>
          <span className="font-bold text-[#17351a]">পরবর্তীতে জানানো হবে</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[#E8F5E9] pt-3 text-lg font-black text-[#17351a]">
          <span>মোট মূল্য</span>
          <motion.span key={totalPrice} initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
            {formatCurrency(totalPrice)}
          </motion.span>
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={onOrder}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2E7D32] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1B5E20] cursor-pointer"
        >
          <ShoppingBag className="size-4" />
          অর্ডার করুন
        </button>
        <button
          type="button"
          onClick={onAddToCart}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FDF6E3] px-4 md:px-0 py-3 text-sm font-bold text-[#17351a] shadow-sm transition hover:bg-[#F5E7B6] cursor-pointer"
        >
          <ShoppingCart className="size-4" />
          কার্টে যোগ করুন
        </button>
        <a
          href={whatsappLink(whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#E8F5E9] px-4 py-3 text-sm font-bold text-[#1B5E20] transition hover:bg-[#d6edd8]"
        >
          <MessageCircle className="size-4" />
          WhatsApp অর্ডার
        </a>
      </div>
    </motion.aside>
  );
}
