"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAdmin, loading, pathname, router]);

  if (loading || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F7FBF7] text-[#1B5E20]">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm">
          <Loader2 className="size-5 animate-spin" />
          যাচাই করা হচ্ছে
        </div>
      </div>
    );
  }

  return children;
}
