import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({ title: z.string(), date: z.coerce.date(), draft: z.boolean().default(false) }),
});

// Private docs are reachable only by their unguessable UUID: never listed, never in sitemap/feeds, noindex.
const docs = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    preparedFor: z.string().optional(),
  }),
});

export const collections = { blog, docs };
