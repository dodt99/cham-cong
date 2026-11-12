import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // v2 có bộ test riêng trong frontend/ và backend/.
    exclude: ["**/node_modules/**", "frontend/**", "backend/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
