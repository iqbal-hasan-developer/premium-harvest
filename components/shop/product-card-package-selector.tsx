"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { trackAddToCart } from "@/lib/analytics/meta-pixel";
import type { Product } from "@/types";
import { formatBanglaNumber, formatCurrency, getProductPackages } from "@/utils/format";

type ProductCardPackageSelectorProps = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

export function ProductCardPackageSelector({ product, open, onClose }: ProductCardPackageSelectorProps) {
  const { addItem } = useCart();
  const packages = useMemo(() => getProductPackages(product), [product]);
  const initialPackageIndex = Math.max(
    0,
    packages.findIndex((item) => item.recommended)
  );
  const [selectedIndex, setSelectedIndex] = useState(initialPackageIndex);
  const [quantity, setQuantity] = useState(1);
  const selectedPackage = packages[selectedIndex] ?? packages[0];
  const totalPrice = selectedPackage.price * quantity;

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;
    setSelectedIndex(initialPackageIndex);
    setQuantity(1);
  }, [initialPackageIndex, open]);

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
    trackAddToCart({
      content_ids: [product.id || product.slug],
      content_name: product.name,
      content_type: "product",
      value: selectedPackage.price * quantity,
      num_items: quantity
    });
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[65]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button
            type="button"
            aria-label="বন্ধ করুন"
            onClick={onClose}
            className="absolute inset-0 h-full w-full bg-[#17351a]/35 backdrop-blur-sm"
          />
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`package-selector-${product.id}`}
              initial={{ y: 28, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 28, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="pointer-events-auto max-h-[86vh] w-full overflow-y-auto rounded-t-3xl border border-[#CFE3C7] bg-[#FBFFF8] p-5 shadow-2xl shadow-green-950/25 sm:max-h-[88vh] sm:w-[min(520px,calc(100%-32px))] sm:rounded-3xl sm:p-6"
            >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D99600]">Premium Harvest</p>
                <h2 id={`package-selector-${product.id}`} className="mt-1 text-2xl font-black text-[#17351a]">
                  প্যাকেজ নির্বাচন করুন
                </h2>
                <p className="mt-1 text-sm font-semibold text-neutral-600">{product.name}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="বন্ধ করুন"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20] transition hover:bg-[#d6edd8]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {packages.map((item, index) => {
                const selected = index === selectedIndex;
                return (
                  <button
                    key={`${item.weight}-${item.price}`}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`relative rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-[#2E7D32] bg-[#F1FAF2] shadow-lg shadow-green-900/10"
                        : "border-[#E8F5E9] bg-white hover:border-[#A5D6A7] hover:bg-[#F7FBF7]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-[#17351a]">{item.weight}</span>
                          {item.recommended ? (
                            <span className="rounded-full bg-[#2E7D32] px-2.5 py-1 text-[11px] font-bold text-white">
                              জনপ্রিয়
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm font-bold text-[#1B5E20]">{formatCurrency(item.price)}</p>
                      </div>
                      <span className={`grid size-8 place-items-center rounded-full border ${selected ? "border-[#2E7D32] bg-[#2E7D32] text-white" : "border-[#C8E6C9] text-transparent"}`}>
                        <Check className="size-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-[#E8F5E9] bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#2E7D32]">পরিমাণ</p>
                  <p className="mt-1 text-lg font-black text-[#17351a]">{formatCurrency(totalPrice)}</p>
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
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2E7D32] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#1B5E20]"
            >
              <ShoppingCart className="size-4" />
              কার্টে যোগ করুন
            </button>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
