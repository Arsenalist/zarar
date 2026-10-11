---
title: "Take a guess at what this icon in Confluence means"
date: 2024-08-14T13:57Z
---

![numbering](/images/zarar-1723642119.png)

Scroll down for the answer.

...

...

...

...

...

It's the icon to insert a numbered column in a table. Like, WTF?

Confluence had a first-mover(ish) advantage in the document collaboration space but it's come to naught. It never implemented multi-user concurrent collaboration and instead focused more on version control, which is useful but not how people collaborate to create documents. Essentially, it started as a wiki and remained a wiki. This in itself isn't necessarily a bad strategy, but if you're catering to developers, product managers and the like, a wiki solves about 50% of the use cases.

The never responded to Google Docs-type tools and stayed in the "edit and share" mode rather than pivot to a collaboration tool. This was a strategic mistake since tools like Google Docs, Quip, Coda and Notion now dominate the market and Atlassian is nowhere to be found. If you're using Confluence it's because your org already uses Jira and Confluence sort of comes with it.

Atlassian appears to have focused more on integrating their product with other Atlassian products. Again, not a bad strategy but if you're going to opt for a walled-garden, but you better be making amazing products (kind of like Apple) or else it's just a poor user experience. I also find that by focusing on internal tool integration, they haven't kept up with what's happening outside the walls. For example, Confluence still lacks good Markdown support, has poorly structured URLs and doesn't have a publish-to-web feature.

I guess my frustration comes from my having to contrast my experience on consulting projects in big orgs which love Atlassian, to what I do in my side projects. But hey, the market echos my sentiment:

![atlassian-stock-price](/images/zarar-1723647575.png)

#### Subscribe to my blog

    

const signupForm = document.querySelector('.email-signup') const confirm = signupForm.querySelector('input\[name="confirm"\]') setTimeout(() => { confirm.value = "829389c2a9f0402"; }, 1000); signupForm.querySelector('input\[name="email"\]').addEventListener('input', () => { if(!confirm.value.includes("b8a3600e52f2ad4e1")) { confirm.value += "b8a3600e52f2ad4e1"; } }); signupForm.addEventListener('submit', (e) => { e.preventDefault(); fetch(signupForm.action, { method: signupForm.method, body: new FormData(signupForm), }).then(async (response) => { const message = document.createElement('i'); message.textContent = await response.text(); signupForm.replaceChildren(message); }); });

There's also the [RSS feed](/feed/).
