// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zarar.dev',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.includes('/p/') })],
});
