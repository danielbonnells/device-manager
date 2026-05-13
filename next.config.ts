import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    devIndicators: false,
    output: "standalone",
      env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'https://llenno.com',
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  }
};

export default nextConfig;
