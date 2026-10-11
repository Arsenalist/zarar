---
title: "Row Embedded Cache: KISS at its finest"
date: 2024-08-08T04:03Z
---

Note: [Hacker News thread](https://news.ycombinator.com/item?id=41191125) crushing this pattern.

I've been experimenting with a new pattern of caching which uses `jsonb` types in Postgres to cache all relations of a particular record, within that record. It sounds sacrilegious but hear me out, I actually think this is a pretty useful pattern in many cases.

Here's the use-case:

-   I have an `Order` object with relations and sub-relations: items, items.variants, items.variants.product etc. There's about 15 of them and some of them are 4 levels deep.
-   Orders are often shown in lists on many pages, and what needs to be displayed comes from the relations and other expensive calculations (e.g., total calculations, shipping costs)
-   I don't want to have execute expensive LEFT JOINS especially as this data rarely changes (mostly on refunds)

I had previously tried a couple different approaches:

-   **NextJS:** Use NextJS server side caching using `fetch()` which worked until pagination got involved and then it became too complicated as the pagination query parameters weren't deterministically resolving to a set of orders
    
-   **Redis:** Used a Redis cache for each order. This felt like overkill because it made multiple network calls to display a simple list. It made for this sort of code:
    

```
 const expanded_orders = []
 for (const order of orders) {
   const cached = getFromCache(o.id)
   expanded_order.push(cached ? cached : getFromDb(o.id))
 }
```

It's straightforward enough but I don't want to be doing a cache check every time for each object. Can this be made simpler?

[KISS](https://en.wikipedia.org/wiki/KISS_principle) to the rescue. I did the simplest thing I could think of: retrieve the expanded order right after it's created and store in a `cache` JSONB field in Postgres as part of the `orders` table. It's always guaranteed to be there and the code to retrieve cached values is dead simple: `order.cache.order_total`

It's not a silver bullet, nor is it sophisticated or technically impressive, but it is simple enough to make client code clean and makes cache invalidation easy: you have to update the record you're invalidating the cache for and don't have to dance through network traffic.

The downside is that the record size does increase as order info in JSON is stored inside the order row, but it's an acceptable tradeoff for the simplicity it brings to retrieval and display.

#### Subscribe to my blog

    

const signupForm = document.querySelector('.email-signup') const confirm = signupForm.querySelector('input\[name="confirm"\]') setTimeout(() => { confirm.value = "829389c2a9f0402"; }, 1000); signupForm.querySelector('input\[name="email"\]').addEventListener('input', () => { if(!confirm.value.includes("b8a3600e52f2ad4e1")) { confirm.value += "b8a3600e52f2ad4e1"; } }); signupForm.addEventListener('submit', (e) => { e.preventDefault(); fetch(signupForm.action, { method: signupForm.method, body: new FormData(signupForm), }).then(async (response) => { const message = document.createElement('i'); message.textContent = await response.text(); signupForm.replaceChildren(message); }); });

There's also the [RSS feed](/feed/).
