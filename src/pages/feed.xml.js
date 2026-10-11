import rss from '@astrojs/rss';
import { published, excerpt } from '../posts';

export async function GET(context) {
  const posts = await published('blog');
  return rss({
    title: "Zarar's blog",
    description: 'Elixir, AI-assisted engineering and the system around the code.',
    site: context.site,
    items: posts.map((p) => ({ title: p.data.title, pubDate: p.data.date, link: `/${p.id}/`, description: excerpt(p.body) })),
  });
}
