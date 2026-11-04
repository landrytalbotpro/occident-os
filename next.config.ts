import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Permite abrir el servidor de desarrollo desde el móvil en la red local
  allowedDevOrigins: ["192.168.1.137", "192.168.1.*"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [{ source: "/", destination: "/dashboard", permanent: false }];
  },
};

export default nextConfig;
