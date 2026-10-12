import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({ title: z.string(), date: z.coerce.date(), draft: z.boolean().default(false) }),
});

// Proposals are reachable only by their unguessable slug: never listed, never in sitemap/feeds, noindex.
const proposals = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/proposals' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    date: z.coerce.date(),
    validUntil: z.coerce.date(),
  }),
});

export const collections = { blog, proposals };
