import type { Product } from "@/types";
import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { FadeUp } from "@/components/motion-shell";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="container-page py-16">
      <SectionHeading
        eyebrow="মৌসুমের পছন্দ"
        title="বাছাই করা প্রিমিয়াম আম"
        description="মিষ্টতা, ঘ্রাণ ও মান যাচাই করে প্রতিটি পণ্য তালিকাভুক্ত করা হয়েছে।"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <FadeUp key={product.id} delay={index * 0.08}>
            <ProductCard product={product} />
          </FadeUp>
        ))}
      </div>
      <div className="mt-8 text-center">
        <ButtonLink href="/shop" variant="secondary">
          সব পণ্য দেখুন
        </ButtonLink>
      </div>
    </section>
  );
}
