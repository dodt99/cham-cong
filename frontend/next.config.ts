import type { NextConfig } from "next";

// Khi phát triển, /api được chuyển tiếp sang backend Spring Boot để trình duyệt chỉ thấy một origin
// (cookie phiên + CSRF hoạt động mà không cần CORS). Khi triển khai, reverse proxy làm việc này.
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone",
  // frontend/ là một dự án độc lập nằm trong repo có lockfile khác ở gốc (v1).
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
