import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./apps/web", import.meta.url)) } },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    restoreMocks: true,
    clearMocks: true,
    testTimeout: 15_000,
    env: { NODE_ENV: "test", ECPAY_ENV: "sandbox" },
  },
});
