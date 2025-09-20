// @ts-check
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: [
      "node_modules",
      "docs/webapp*",
      "dist",
      "dist_electron",
      "coverage",
      ".gitignore",
    ],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      "prettier",
    ],
    rules: {
      "no-console": "error",
      "no-debugger": "error",
      "no-irregular-whitespace": "off",
    },
  }
);
