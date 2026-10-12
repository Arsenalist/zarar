# zarar.dev

Astro static site, deployed to Cloudflare Pages (build `npm run build`, output `dist`).

- `npm run dev`: local server
- Blog posts: `src/content/blog/<slug>.md` → `/<slug>/` (old Bear Blog URLs preserved)
- `draft: true` in frontmatter hides a post outside dev

## Proposals

`npm run proposal -- "Client name" ["Title"]` writes `src/content/proposals/<client>-<random>.md` and prints its URL.
The random suffix is the access control: proposals are never listed, excluded from sitemap/feeds, and served `noindex` (`public/_headers`).
Anyone with the link can read it. Delete the file when the proposal is done.
