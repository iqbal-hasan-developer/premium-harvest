import type { Metadata } from "next";
import Image from "next/image";
import { LightboxGallery } from "@/components/gallery/lightbox-gallery";
import { getGalleryImages } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "গ্যালারি",
  description: "Premium Harvest Ltd বাগান, আম সংগ্রহ, প্যাকেজিং ও প্রিমিয়াম mango delivery অভিজ্ঞতার ছবি দেখুন।",
  path: "/gallery"
});

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <>
      <section className="relative isolate grid min-h-[240px] overflow-hidden bg-[#17351a] py-14 text-white sm:min-h-[320px] sm:py-20">
        <Image
          src="/gallery-banner.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0F2F16]/72 via-[#1B5E20]/48 to-[#D99600]/16" />
        <div className="absolute inset-0 -z-10 bg-radial-[ellipse_at_center] from-[#17351a]/52 via-transparent to-transparent" />
        <div className="container-page m-auto max-w-4xl text-center">
          <h1 className="text-3xl font-black leading-tight text-white drop-shadow-md sm:text-5xl">
            আমাদের গ্যালারি
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-white/90 drop-shadow-sm sm:text-lg sm:leading-8">
            বাগান, সংগ্রহ, প্যাকেজিং ও প্রিমিয়াম আমের সতেজ মুহূর্তগুলো দেখুন।
          </p>
        </div>
      </section>
      {/* <PageHero
        title="আমাদের গ্যালারি"
        description="বাগান, সংগ্রহ, প্যাকিং এবং ডেলিভারির মুহূর্তগুলো এক জায়গায়।"
        image={imageUrls.farm}
      /> */}
      <section className="container-page py-12">
        <LightboxGallery images={images} />
      </section>
    </>
  );
}
