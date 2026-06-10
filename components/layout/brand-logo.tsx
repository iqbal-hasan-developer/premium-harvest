import Image from "next/image";
import { siteConfig } from "@/lib/constants";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const logoSizes = {
  sm: "h-10 w-20",
  md: "h-22 w-40",
  lg: "h-16 w-40"
};

export function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  return (
    <span className={`relative inline-block shrink-0 overflow-hidden rounded-xl ${logoSizes[size]} ${className}`}>
      <Image
        src={siteConfig.logo}
        alt={`${siteConfig.name} logo`}
        fill
        sizes="(max-width: 640px) 96px, 160px"
        className="object-contain"
        priority={size === "lg"}
      />
    </span>
  );
}
