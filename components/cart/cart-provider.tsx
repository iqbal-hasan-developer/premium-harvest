"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/types";

type AddCartItemInput = Omit<CartItem, "lineTotal">;

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (productId: string, selectedPackageWeight: string) => void;
  increaseQuantity: (productId: string, selectedPackageWeight: string) => void;
  decreaseQuantity: (productId: string, selectedPackageWeight: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CART_STORAGE_KEY = "premium-harvest-cart";
const CartContext = createContext<CartContextValue | null>(null);

function withLineTotal(item: AddCartItemInput): CartItem {
  const quantity = Math.max(1, item.quantity);
  return {
    ...item,
    quantity,
    lineTotal: item.selectedPackagePrice * quantity
  };
}

function normalizeItems(items: CartItem[]) {
  return items
    .filter((item) => item.productId && item.selectedPackageWeight && item.quantity > 0)
    .map((item) => ({
      ...item,
      quantity: Math.max(1, item.quantity),
      lineTotal: item.selectedPackagePrice * Math.max(1, item.quantity)
    }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(normalizeItems(JSON.parse(saved) as CartItem[]));
      }
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Cart remains usable in memory if localStorage is unavailable.
    }
  }, [hydrated, items]);

  const addItem = useCallback((item: AddCartItemInput) => {
    setItems((currentItems) => {
      const nextItem = withLineTotal(item);
      const existingIndex = currentItems.findIndex(
        (currentItem) =>
          currentItem.productId === nextItem.productId &&
          currentItem.selectedPackageWeight === nextItem.selectedPackageWeight
      );

      if (existingIndex === -1) {
        return [...currentItems, nextItem];
      }

      return currentItems.map((currentItem, index) => {
        if (index !== existingIndex) return currentItem;
        const quantity = currentItem.quantity + nextItem.quantity;
        return {
          ...currentItem,
          quantity,
          lineTotal: currentItem.selectedPackagePrice * quantity
        };
      });
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, selectedPackageWeight: string) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => !(item.productId === productId && item.selectedPackageWeight === selectedPackageWeight)
      )
    );
  }, []);

  const increaseQuantity = useCallback((productId: string, selectedPackageWeight: string) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.productId !== productId || item.selectedPackageWeight !== selectedPackageWeight) return item;
        const quantity = item.quantity + 1;
        return { ...item, quantity, lineTotal: item.selectedPackagePrice * quantity };
      })
    );
  }, []);

  const decreaseQuantity = useCallback((productId: string, selectedPackageWeight: string) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.productId !== productId || item.selectedPackageWeight !== selectedPackageWeight) return item;
          const quantity = item.quantity - 1;
          return { ...item, quantity, lineTotal: item.selectedPackagePrice * quantity };
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((value) => !value), []);

  const itemCount = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((total, item) => total + item.lineTotal, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      isOpen,
      addItem,
      removeItem,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
      itemCount,
      subtotal
    }),
    [addItem, clearCart, closeCart, decreaseQuantity, increaseQuantity, isOpen, itemCount, items, openCart, removeItem, subtotal, toggleCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
