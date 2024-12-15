import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: [
      "**/node_modules/**",
      "**/test/**",
      "**/tests/**",
      "**/examples/**",
      "**/nbs/**",
      "vite.config.ts",
      "vitest.config.ts",
      "**/dist/**",
      "**/*.nb.ts",
      "**/*.config.ts",
      "**/coverage/**",
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  }
);
