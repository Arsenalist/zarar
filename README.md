# zarar.dev

Astro static site, deployed to Cloudflare Pages (build `npm run build`, output `dist`).

- `npm run dev`: local server
- Blog posts: `src/content/blog/<slug>.md` → `/<slug>/` (old Bear Blog URLs preserved)
- `draft: true` in frontmatter hides a post outside dev

## Private docs

`npm run doc -- "Title" ["Prepared for"]` writes `src/content/docs/<uuid>.md` and prints its URL, `/docs/<uuid>/`.
The UUID is the access control: docs are never listed or linked, excluded from sitemap/feeds, and served `noindex` (`public/_headers`).
Anyone with the link can read it. Delete the file when the doc is no longer needed.
