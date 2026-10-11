import rss from '@astrojs/rss';
import { published, excerpt } from '../../posts';

export async function GET(context) {
  const notes = await published('notes');
  return rss({
    title: "Zarar's notes",
    description: 'Short notes from Zarar Siddiqi.',
    site: context.site,
    items: notes.map((n) => ({ title: n.data.title, pubDate: n.data.date, link: `/notes/${n.id}/`, description: excerpt(n.body) })),
  });
}
