import type { Metadata } from "next";
import { DashboardClientShell } from "@/components/admin/dashboard-client-shell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientShell>{children}</DashboardClientShell>;
}
