"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { GalleryImage } from "@/types";

const heights = {
  short: "h-56",
  medium: "h-72",
  tall: "h-96"
};

export function LightboxGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<GalleryImage | null>(null);

  return (
    <>
      <div className="masonry">
        {images.map((image) => (
          <button
            type="button"
            key={image.id}
            onClick={() => setActive(image)}
            className={`masonry-item group relative w-full overflow-hidden rounded-2xl bg-[#E8F5E9] text-left ${
              heights[image.height || "medium"]
            }`}
          >
            <Image src={image.imageUrl} alt={image.title} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 text-sm font-semibold text-white">
              {image.title}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <button
              type="button"
              aria-label="বন্ধ করুন"
              className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white text-[#17351a]"
              onClick={() => setActive(null)}
            >
              <X className="size-5" />
            </button>
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              className="relative h-[76vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white"
              onClick={(event) => event.stopPropagation()}
            >
              <Image src={active.imageUrl} alt={active.title} fill sizes="90vw" className="object-cover" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
