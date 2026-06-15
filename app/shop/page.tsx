import type { Metadata } from "next";
import Image from "next/image";
import { ProductSearch } from "@/components/shop/product-search";
import { getProducts } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "শপ",
  description: "Premium Harvest Ltd-এর প্রিমিয়াম আম, প্যাকেজ সাইজ, দাম ও অর্ডার অপশন দেখুন। বাংলাদেশে মৌসুমি আম সহজে অর্ডার করুন।",
  path: "/shop"
});

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <section className="relative isolate grid min-h-[240px] overflow-hidden bg-[#17351a] py-14 text-white sm:min-h-[320px] sm:py-20">
        <Image
          src="/shop-banner.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0F2F16]/75 via-[#1B5E20]/52 to-[#D99600]/18" />
        <div className="absolute inset-0 -z-10 bg-radial-[ellipse_at_center] from-[#17351a]/50 via-transparent to-transparent" />
        <div className="container-page m-auto max-w-4xl text-center">
          <h1 className="text-3xl font-black leading-tight text-white drop-shadow-md sm:text-5xl">
            প্রিমিয়াম আমের শপ
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-white/90 drop-shadow-sm sm:text-lg sm:leading-8">
            মৌসুমের সেরা আম, স্পষ্ট দাম, সহজ অর্ডার এবং দ্রুত ডেলিভারি।
          </p>
        </div>
      </section>
      {/* <PageHero
        title="প্রিমিয়াম আমের শপ"
        description="মৌসুমের সেরা আম, স্পষ্ট দাম, সহজ অর্ডার এবং দ্রুত ডেলিভারি।"
        image={imageUrls.basket}
      /> */}
      <ProductSearch products={products} />
    </>
  );
}
