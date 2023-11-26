/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    chunkSizeWarningLimit: 5000000,
  },
  test: {
    dir: "./src/tests",
    globals: true,
  },
});
