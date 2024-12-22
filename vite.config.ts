import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "eccodes-ts",
      fileName: (format) => `eccodes-ts.${format === "es" ? "mjs" : "cjs"}`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["child_process", "util", "readline"],
    },
  },
  plugins: [
    dts({
      include: ["src/**/*.ts"],
      outDir: "dist/types",
      copyDtsFiles: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@types": path.resolve(__dirname, "./src/types"),
    },
  },
});
