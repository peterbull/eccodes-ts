import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    coverage: {
      provider: "istanbul",
      exclude: [
        "**/node_modules/**",
        "**/test/**",
        "**/examples/**",
        "**/nbs/**",
        "vite.config.ts",
        "**/dist/**",
      ],
    },
  },
});
