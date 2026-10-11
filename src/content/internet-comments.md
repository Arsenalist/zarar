---
title: "Internet comments"
---

## [Responding to man who runs agents for the sake of it](https://news.ycombinator.com/item?id=47328901)

Am I supposed to be impressed by this? I think people are now just using agents for the sake of it. I'm perfectly happy running two simple agents, one for writing and one for reviewing. I don't need to go be writing code at faster than light speed. Just focusing on the spec, and watching the agent as it does its work and intervening when it goes sideways is perfectly fine with me. I'm doing 5-7x productivity easily, and don't need more than that.

I also spend most of my time reviewing the spec to make sure the design is right. Once I'm done, the coding agent can take 10 minutes or 30 minutes. I'm not really in that much of a rush.

## [Responding to HN commenter comparing apples to oranges when talking about social media addiction](https://news.ycombinator.com/item?id=46964271)

I see where you are coming from, but this is different because:

1.  The restaurant isn't lacing your food with cocaine
2.  The author is incentivizing reading, which is generally a good thing

You are right, it is our job to control our information diet but when the ability to control is diminished through the consumption, then we have a problem which doesn't fit into the model of "get your shit together".

There's also a social responsibility you inherit when you start selling products that have harmful side-effects. Auto manufacturers have to comply with emission testing, drug makers have to prove efficacy, air conditioning manufacturers have to adhere to air quality standards etc. What do social media companies have to do? Very little if anything, and that's the problem. We've yet to find a counter-balance that works and protects the consumer, so we're in this era where we're trying to find out what we can do, but the landscape is changing so fast that we're trying to hit a moving target.

## [Getting some good intel out of Hologram creator on Hologram use-cases](https://old.reddit.com/r/elixir/comments/1qjiqka/hologram_now_has_sustainable_funding/o11r85j/), 2025-01-22

Your seating chart with drag/drop and lots of client interaction is exactly the kind of use case Hologram was built for. The core difference from LiveView is where your UI logic runs - LiveView keeps it on the server (100-200ms roundtrips), while Hologram compiles your Elixir to JavaScript and runs it directly in the browser. For drag/drop, seat selection, and hover states, this means instant response without writing JS hooks. You stay in Elixir the whole time.

Keeping state on the client also means no server memory per UI session and no context-switching between languages. With LiveView, UI state can be lost during deployments or crashes, and the app can stop working entirely during connection interruptions - and internet isn't perfect everywhere. In Hologram, the UI keeps working locally. When you need the server - saving seat assignments, authentication - you use async Commands that run server-side while the UI stays responsive.

There's also the WebSocket question - they can be blocked by corporate firewalls, proxies, and some network configurations. Hologram uses HTTP/2 persistent connections instead, which work everywhere, pass through proxies seamlessly, and are easier to debug with standard browser tools.

For JS libraries like PixiJS or Choice.js, we're building JavaScript interop for exactly that. The design is already finalized and discussed here: https://elixirforum.com/t/time-for-hologram-javascript-interop-what-would-you-like-to-see/72518

It's the next item on the dev plan - we're releasing Erlang functions ported during the JS initiative in a couple of days, then JS interop is up next.

The interop will let you call into existing JS libraries from Elixir code. Over time, the community will also be able to write Elixir wrappers around popular JS libraries and share them as deps.

Long-term, the goal is native Hologram APIs for things like Canvas and Web APIs. This brings benefits like better testing capabilities - for example, you could write unit tests in Elixir that verify canvas rendering without a browser. But JS interop gives us the escape hatch we need today.

## [Responding to Anti-AI Guy](https://www.linkedin.com/feed/update/urn:li:activity:7417407420798406656?commentUrn=urn%3Ali%3Acomment%3A%28activity%3A7417407420798406656%2C7417572407453966336%29&replyUrn=urn%3Ali%3Acomment%3A%28activity%3A7417407420798406656%2C7417672868601311232%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287417572407453966336%2Curn%3Ali%3Aactivity%3A7417407420798406656%29&dashReplyUrn=urn%3Ali%3Afsd_comment%3A%287417672868601311232%2Curn%3Ali%3Aactivity%3A7417407420798406656%29), 2025-01-15

I've also seen a car crash but that doesn't mean I don't drive. What you are doing is mentioning an outlier case and treating it like it's the norm. Even before Opus 4.5 which is a step change in correctness, the AutoCodeBenchmark last summer was nothing short of mind-blowing. You have developers across major companies reporting 2-3x productivity increases, and upwards of 80% (if not higher) code written using AI. These are people who write brownfield code that serves millions of people. My personal experience aligns with that as well.

I don't know what you mean by "AI bros have admitted that AI-generated code is garbage, and now fashion themselves alchemists that can turn garbage into gold". GIGO is a truism that says nothing new, which is what you seem to be bringing up.

Even strong-manning your argument that there are people who don't care about quality and only care about results, leads us nowhere. Are you suggesting we have an industry booming that promises to convert AI Slop to good code using AI? I guess there might be, but is that really the main story these days?

Perhaps to prove your point you can write a prompt about building a SaaS app, and then write one yourself and compare the results.
