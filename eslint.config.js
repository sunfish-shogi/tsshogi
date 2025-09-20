// eslint.config.js
// @ts-check
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default defineConfig([
  {
    ignores: ["dist/**", "node_modules/**", "sample/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "error",
      "no-debugger": "error",
      "no-irregular-whitespace": "off",
    },
  },
  prettier,
]);
