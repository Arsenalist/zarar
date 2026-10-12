import { defineConfig } from "cf/config";

// Assets-only Worker: Astro builds static HTML into dist/, no server code.
export default defineConfig({
  worker: {
    name: "zarar-dev",
    compatibilityDate: "2026-10-01",
    domains: ["zarar.dev"],
    assets: { htmlHandling: "force-trailing-slash", notFoundHandling: "404-page" },
  },
});
