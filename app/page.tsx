import type { Metadata } from "next";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { Hero } from "@/components/sections/hero";
import { Specialty } from "@/components/sections/specialty";
import { StorySlider } from "@/components/sections/story-slider";
import { PageTransition } from "@/components/motion-shell";
import { getFeaturedProducts } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "প্রিমিয়াম অর্গানিক আম",
  description:
    "Premium Harvest Ltd থেকে বাংলাদেশি প্রিমিয়াম আম অর্ডার করুন। বাগান থেকে বাছাই করা আম, নিরাপদ প্যাকেজিং, সহজ অর্ডার ও নির্ভরযোগ্য ডেলিভারি।",
  path: "/"
});

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <PageTransition>
      <Hero />
      <FeaturedProducts products={featuredProducts} />
      <Specialty />
      <StorySlider />
    </PageTransition>
  );
}
