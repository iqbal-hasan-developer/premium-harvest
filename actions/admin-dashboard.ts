"use server";

import {
  getAdminDashboardOverviewData as getDashboardOverviewData,
  type AdminDashboardOverviewData
} from "@/lib/supabase/admin-dashboard";

export async function getAdminDashboardOverviewData(): Promise<AdminDashboardOverviewData> {
  return getDashboardOverviewData();
}
