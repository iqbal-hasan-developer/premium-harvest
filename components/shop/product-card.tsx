"use client";

import { ShoppingBag, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ProductCardPackageSelector } from "@/components/shop/product-card-package-selector";
import { ButtonLink } from "@/components/ui/button";
import type { Product } from "@/types";
import { formatCurrency, getStartingPrice } from "@/utils/format";

export function ProductCard({ product }: { product: Product }) {
  const [packageSelectorOpen, setPackageSelectorOpen] = useState(false);
  const productImage = product.images[0] || "/shop-banner.webp";

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8F5E9] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-900/10">
        <Link href={`/shop/${product.slug}`} className="relative block aspect-[4/3] shrink-0 overflow-hidden bg-[#E8F5E9]">
          <Image
            src={productImage}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 flex-1 line-clamp-2 text-lg font-bold text-[#17351a]">{product.name}</h3>
            <p className="shrink-0 rounded-full bg-[#E8F5E9] px-3 py-1 text-sm font-bold text-[#1B5E20]">
              {formatCurrency(getStartingPrice(product))} থেকে
            </p>
          </div>
          <p className="mt-2 line-clamp-3 w-full text-sm leading-6 text-neutral-600">{product.shortDescription}</p>
          <div className="mt-auto grid gap-2 pt-5 lg:grid-cols-2">
            <ButtonLink
              href={`/shop/${product.slug}`}
              variant="primary"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#2E7D32] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1B5E20]"
            >
              <ShoppingBag className="size-4" />
              অর্ডার করুন
            </ButtonLink>
            <button
              type="button"
              onClick={() => setPackageSelectorOpen(true)}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#C8E6C9] bg-white px-3 md:px-0 py-2 text-sm font-bold text-[#1B5E20] transition hover:bg-[#F7FBF7] cursor-pointer"
            >
              <ShoppingCart className="size-4" />
              কার্টে যোগ করুন
            </button>
          </div>
        </div>
      </article>
      <ProductCardPackageSelector
        product={product}
        open={packageSelectorOpen}
        onClose={() => setPackageSelectorOpen(false)}
      />
    </>
  );
}
