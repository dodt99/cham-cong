import path from "node:path";
import { defineConfig } from "vitest/config";

const root = path.resolve(__dirname, "../..");

export default defineConfig({
  root,
  test: {
    environment: "node",
    include: ["tools/golden/generate.golden.ts"],
    env: { TZ: "Asia/Ho_Chi_Minh" },
  },
  resolve: { alias: { "@": root } },
});
