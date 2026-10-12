// Usage: npm run doc -- "Title" ["Prepared for"]
// Creates src/content/docs/<uuid>.md; the UUID is the only thing keeping the URL private.
import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const [title, preparedFor] = process.argv.slice(2);
if (!title) { console.error('Usage: npm run doc -- "Title" ["Prepared for"]'); process.exit(1); }

const id = randomUUID();
const path = `src/content/docs/${id}.md`;
const front = [`title: ${JSON.stringify(title)}`, `date: ${new Date().toISOString().slice(0, 10)}`];
if (preparedFor) front.push(`preparedFor: ${JSON.stringify(preparedFor)}`);

writeFileSync(path, `---\n${front.join('\n')}\n---\n\n## Summary\n\n`);
console.log(`${path}\nURL: https://zarar.dev/docs/${id}/`);
