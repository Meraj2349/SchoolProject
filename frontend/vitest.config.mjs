import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react({ include: /\.(js|jsx)$/ })],
  // Components use JSX inside .js files (Next.js convention).
  esbuild: { loader: "jsx", include: /src\/.*\.jsx?$/, exclude: [] },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    // Run in the school's timezone so date bugs (UTC vs local day) show up.
    env: { TZ: "Asia/Dhaka" },
    globals: true,
    setupFiles: ["./test/setup.js"],
    include: ["src/**/*.test.{js,jsx}"],
  },
});
