"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";

const slides = [
  "https://images.unsplash.com/photo-1621293954908-907159247fc8?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?q=80&w=1200&auto=format&fit=crop"
];

export function StorySlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="container-page grid gap-8 py-16 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="text-sm font-semibold text-[#2E7D32]">ফার্মের গল্প</p>
        <h2 className="mt-3 text-3xl font-bold leading-tight text-[#17351a]">
          মাটির ঘ্রাণ, স্বচ্ছ পরিচর্যা, আর প্রিমিয়াম প্যাকেজিং
        </h2>
        <p className="mt-4 text-base leading-8 text-neutral-600">
          আমরা স্থানীয় কৃষকদের সঙ্গে কাজ করি, পরিপক্ব আম সংগ্রহ করি এবং প্রতিটি
          চালান হাতে পরীক্ষা করি। তাই Premium Harvest-এর প্রতিটি অর্ডার থাকে
          সতেজ, সুন্দর এবং উপহার দেওয়ার মতো প্রস্তুত।
        </p>
        <ButtonLink href="/about" variant="secondary" className="mt-6">
          আমাদের সম্পর্কে জানুন
        </ButtonLink>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#E8F5E9]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[activeSlide]}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slides[activeSlide]}
              alt="Premium Harvest farm"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority={activeSlide === 0}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`স্লাইড ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                activeSlide === index ? "w-8 bg-white" : "w-2.5 bg-white/60 hover:bg-white/85"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
