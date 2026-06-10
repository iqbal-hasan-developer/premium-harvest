"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(images[0]);
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#E8F5E9]">
        <Image src={active} alt={name} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {images.map((image) => (
          <button
            type="button"
            key={image}
            onClick={() => setActive(image)}
            className={`relative aspect-square overflow-hidden rounded-xl border ${
              active === image ? "border-[#2E7D32]" : "border-transparent"
            }`}
          >
            <Image src={image} alt={name} fill sizes="120px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
