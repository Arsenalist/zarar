import { defineWranglerConfig } from "wrangler/experimental-config";

// cf detects Astro and expects an adapter (unsupported for Astro 6+ in the cf beta), so this
// folder hides the framework: cf just uploads the already-built ../dist as static assets.
export default defineWranglerConfig({
  assetsDirectory: "../dist",
});
