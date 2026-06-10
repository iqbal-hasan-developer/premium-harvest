"use client";

import { AuthGuard } from "@/components/admin/auth-guard";
import { DashboardShell } from "@/components/admin/dashboard-shell";
import { AuthProvider } from "@/hooks/use-auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <DashboardShell>{children}</DashboardShell>
      </AuthGuard>
    </AuthProvider>
  );
}
