import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { SUPABASE_STORAGE_BUCKETS } from "@/lib/supabase/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const missingEnv = [
    !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !supabaseAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
    !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null
  ].filter(Boolean);

  if (missingEnv.length || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      {
        ok: false,
        service: "supabase",
        missingEnv,
        serviceRoleConfigured: Boolean(serviceRoleKey),
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { count, error } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "supabase",
        envConfigured: true,
        serviceRoleConfigured: true,
        publicRead: {
          ok: false,
          table: "categories",
          error: error.message
        },
        buckets: SUPABASE_STORAGE_BUCKETS,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    service: "supabase",
    envConfigured: true,
    serviceRoleConfigured: true,
    publicRead: {
      ok: true,
      table: "categories",
      activeCategoryCount: count ?? 0
    },
    buckets: SUPABASE_STORAGE_BUCKETS,
    timestamp: new Date().toISOString()
  });
}
