import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-[#2E7D32] text-white shadow-sm hover:bg-[#1B5E20]",
  secondary: "bg-[#E8F5E9] text-[#1B5E20] hover:bg-[#d6edd8]",
  ghost: "bg-white/80 text-[#1B5E20] hover:bg-white",
  danger: "bg-red-50 text-red-700 hover:bg-red-100"
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = ""
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
