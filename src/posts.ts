import { getCollection, type CollectionEntry } from 'astro:content';

export async function published<C extends 'blog'>(name: C) {
  const all = (await getCollection(name)) as CollectionEntry<C>[];
  return all.filter((p) => import.meta.env.DEV || !p.data.draft).sort((a, b) => +b.data.date - +a.data.date);
}

// First paragraph of the markdown body, stripped of markup, for list excerpts.
export function excerpt(body = '', len = 280) {
  const para = body.split(/\n\s*\n/).find((p) => /^[A-Za-z"'“]/.test(p.trim())) ?? '';
  const text = para.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').trim();
  return text.length > len ? text.slice(0, len).replace(/\s+\S*$/, '') + ' […]' : text;
}
