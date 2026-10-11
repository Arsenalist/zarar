---
title: "Excited about Zero Sync"
date: 2024-10-12T15:09Z
---

I followed the announcement of [onestack.dev](https://onestack.dev/) which is embracing what I think of as the idea of a "complete stack", a singular project for all your data services, iOS/Android apps, and web. It's an ambitious project which uses [Tamagui](https://tamagui.dev/) for styling and [zerosync.dev](https://zerosync.dev/) for data retrieval and caching. This is the first time I'm introduced to an idea like Zero Sync which claims to only retrieve the "changed" data to calling code. This idea has been executed well in [Phoenix LiveView](https://hexdocs.pm/phoenix_live_view/Phoenix.LiveView.html), also via web sockets, but it's limited to UI state, not data.

How Zero Sync does this is a little magical, but here's the gist of it:

![how-it-works](/images/how-it-works.svg)

Adding an intermediary client, a web socket and another caching layer seems like a lot of complexity to introduce, I would add similar layers anyway for certain use-cases that I deal with. To make sure apps are responsive, we often need to be smart about what to render, and the biggest cost of rendering isn't the render but the data retrieval.

In my current example, multiple people are scanning tickets at the door on different devices. I want to show the latest set of tickets (scanned or not scanned) to all people, so I end up retrieving the entire set of tickets on each scan, so that everyone has a consistent view of who has checked in. To avoid retrieving all the tickets every time, I'd track what changed for each person scanning (on the services side) and then send the delta to the client which would be smart enough to render. There would be logic on the backend side to figure out what changed, and logic on the front-end to display the delta.

This seems doable, but "what changed" is different in different use cases and requires it to be figured out for each case. Zero Sync claims to abstract this problem away by letting me focus on writing SQL queries, and it figuring out how it needs to consult its internal cache while ensuring consistency. This is a bold claim because I no longer have to worry about figuring out what changed based on business rules, timing, cache invalidation etc - I just have to write SQL.

If this is executed well I can see this making a lot of developers re-think their architectures because, let's face it, nobody wants to be dealing with cache invalidation and everyone wants performant applications. The downside of course is that you're committing to a pretty intrusive library, and this looks like a one-door(ish) decision. I'm thinking that much like how using NextJS committed you to a stack (and perhaps even Vercel), this would be similarly worth it.

Definitely worth a proof of concept implementation before writing all that use-case specific code.
