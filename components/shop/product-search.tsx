"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/shop/product-card";

export function ProductSearch({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      `${product.name} ${product.description}`.toLowerCase().includes(term)
    );
  }, [products, query]);

  return (
    <section className="container-page py-12">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#2E7D32]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="পছন্দের আম খুঁজুন"
          className="h-13 w-full rounded-full border border-[#E8F5E9] bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#2E7D32] focus:ring-4 focus:ring-[#E8F5E9]"
        />
      </label>

      {filtered.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl bg-[#E8F5E9] p-8 text-center text-[#1B5E20]">
          কোনো পণ্য পাওয়া যায়নি।
        </div>
      )}
    </section>
  );
}
