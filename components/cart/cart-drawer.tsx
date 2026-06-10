"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CartOrderForm } from "@/components/cart/cart-order-form";
import { useCart } from "@/components/cart/cart-provider";
import type { CartItem } from "@/types";
import { formatBanglaNumber, formatCurrency } from "@/utils/format";

type CheckoutSnapshot = {
  items: CartItem[];
  subtotal: number;
};

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    itemCount,
    subtotal
  } = useCart();
  const [checkoutSnapshot, setCheckoutSnapshot] = useState<CheckoutSnapshot | null>(null);

  const handleClose = useCallback(() => {
    setCheckoutSnapshot(null);
    closeCart();
  }, [closeCart]);

  function startCheckout() {
    setCheckoutSnapshot({ items, subtotal });
  }

  function handleOrderSuccess() {
    clearCart();
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose, isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button
            type="button"
            aria-label="কার্ট বন্ধ করুন"
            className="absolute inset-0 h-full w-full bg-[#17351a]/40 backdrop-blur-sm cursor-pointer"
            onClick={handleClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] min-h-[62vh] flex-col rounded-t-3xl border border-[#CFE3C7] bg-[#FBFFF8] shadow-2xl shadow-green-950/25 sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:rounded-l-3xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#E8F5E9] bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D99600]">Premium Harvest</p>
                <h2 id="cart-drawer-title" className="mt-1 text-2xl font-black text-[#17351a]">
                  আপনার কার্ট
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {itemCount ? `${formatBanglaNumber(itemCount)}টি প্যাক যোগ করা হয়েছে` : "আপনার পছন্দের আম যোগ করুন"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="কার্ট বন্ধ করুন"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20] transition hover:bg-[#d6edd8] cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {checkoutSnapshot ? (
              <CartOrderForm
                items={checkoutSnapshot.items}
                subtotal={checkoutSnapshot.subtotal}
                onCancel={() => setCheckoutSnapshot(null)}
                onSuccess={handleOrderSuccess}
              />
            ) : items.length ? (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                  <div className="grid gap-3">
                    {items.map((item) => (
                      <article
                        key={`${item.productId}-${item.selectedPackageWeight}`}
                        className="rounded-2xl border border-[#E8F5E9] bg-white p-3 shadow-sm"
                      >
                        <div className="grid grid-cols-[72px_1fr] gap-3">
                          <div className="relative h-20 overflow-hidden rounded-xl bg-[#E8F5E9]">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} fill sizes="72px" className="object-cover" />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="line-clamp-2 text-sm font-black text-[#17351a]">{item.name}</h3>
                                <p className="mt-1 text-xs font-semibold text-neutral-500">
                                  {item.selectedPackageWeight} প্যাক
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(item.productId, item.selectedPackageWeight)}
                                aria-label="মুছে ফেলুন"
                                className="grid size-9 shrink-0 place-items-center rounded-full bg-red-50 text-red-700 transition hover:bg-red-100 cursor-pointer"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3">
                              <div className="flex h-10 items-center overflow-hidden rounded-full border border-[#C8E6C9] bg-[#F7FBF7]">
                                <button
                                  type="button"
                                  onClick={() => decreaseQuantity(item.productId, item.selectedPackageWeight)}
                                  aria-label="পরিমাণ কমান"
                                  className="grid size-10 place-items-center text-[#1B5E20] transition hover:bg-[#E8F5E9] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Minus className="size-4" />
                                </button>
                                <span className="min-w-9 text-center text-sm font-black text-[#17351a]">
                                  {formatBanglaNumber(item.quantity)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => increaseQuantity(item.productId, item.selectedPackageWeight)}
                                  aria-label="পরিমাণ বাড়ান"
                                  className="grid size-10 place-items-center text-[#1B5E20] transition hover:bg-[#E8F5E9] cursor-pointer"
                                >
                                  <Plus className="size-4" />
                                </button>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-neutral-500">{formatCurrency(item.selectedPackagePrice)}</p>
                                <p className="text-sm font-black text-[#1B5E20]">{formatCurrency(item.lineTotal)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#E8F5E9] bg-white px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-4 text-lg font-black text-[#17351a]">
                    <span>সাবটোটাল</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                    <button
                      type="button"
                      onClick={startCheckout}
                      className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#2E7D32] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#1B5E20] cursor-pointer"
                    >
                    অর্ডার সম্পন্ন করুন
                  </button>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      href="/shop"
                      onClick={handleClose}
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#E8F5E9] px-4 text-sm font-bold text-[#1B5E20] transition hover:bg-[#d6edd8]"
                    >
                      আরও আম দেখুন
                    </Link>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100 cursor-pointer"
                    >
                      কার্ট খালি করুন
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid flex-1 place-items-center px-6 py-10 text-center">
                <div>
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20]">
                    <ShoppingBag className="size-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-[#17351a]">আপনার কার্ট এখনো খালি</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-neutral-600">
                    পছন্দের আম যোগ করে অর্ডার শুরু করুন।
                  </p>
                  <Link
                    href="/shop"
                    onClick={handleClose}
                    className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#2E7D32] px-6 text-sm font-black text-white transition hover:bg-[#1B5E20]"
                  >
                    আম দেখুন
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
