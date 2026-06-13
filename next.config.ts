import type { NextConfig } from "next";

const supabaseHostname = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/commons/**"
      },
      {
        protocol: "https",
        hostname: "commons.wikimedia.org",
        pathname: "/wiki/Special:FilePath/**"
      },
      {
        protocol: "https",
        hostname: "tds-images.thedailystar.net",
        pathname: "/sites/default/files/**"
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**"
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**"
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**"
            }
          ]
        : [])
    ]
  }
};

export default nextConfig;
