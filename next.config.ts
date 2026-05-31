import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/register",
        destination: "/auth/register",
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/api/webhooks/mercadopago",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};
export default nextConfig;

