// Usage: npm run proposal -- "Acme Corp" ["Proposal title"]
// Creates src/content/proposals/<client>-<random>.md; the random suffix is the only thing keeping the URL private.
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const [client, title = `Proposal for ${client}`] = process.argv.slice(2);
if (!client) { console.error('Usage: npm run proposal -- "Client name" ["Title"]'); process.exit(1); }

const slug = `${client.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${randomBytes(8).toString('hex')}`;
const today = new Date().toISOString().slice(0, 10);
const valid = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
const path = `src/content/proposals/${slug}.md`;

writeFileSync(path, `---
title: ${JSON.stringify(title)}
client: ${JSON.stringify(client)}
date: ${today}
validUntil: ${valid}
---

## Context

What you told me, in my words, so we both know I understood it.

## Scope

What I'll deliver:

- 

Out of scope:

- 

## Timeline

| Milestone | When |
| --- | --- |
|  |  |

## Price

Fixed price: **$X CAD** + HST.

50% to start, 50% on delivery.

## Terms

- Work starts on receipt of the deposit.
- Changes to scope are quoted separately before any work begins.
- You own everything I build for you once paid in full.
`);
console.log(`${path}\nURL: https://zarar.dev/p/${slug}/`);
