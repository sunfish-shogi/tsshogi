/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  base: "./",
  build: {
    chunkSizeWarningLimit: 5000000,
  },
  test: {
    dir: "./src/tests",
    globals: true,
  },
});
