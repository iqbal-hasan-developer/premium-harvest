import { FeaturedProducts } from "@/components/sections/featured-products";
import { Hero } from "@/components/sections/hero";
import { Specialty } from "@/components/sections/specialty";
import { StorySlider } from "@/components/sections/story-slider";
import { PageTransition } from "@/components/motion-shell";
import { getFeaturedProducts } from "@/lib/data";

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
