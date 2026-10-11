---
title: "DORA: AI boosting productivity, hindering delivery"
date: 2024-11-21T15:26Z
---

The [new DORA report](https://services.google.com/fh/files/misc/2024_final_dora_report.pdf) got released and has 30 pages dedicated to AI adoption. One particular finding stuck out to me: an increase in AI adoption was correlated with an increase in code quality, quicker code reviews, decrease in code complexity, decrease in technical debt and improved documentation. However, it was also correlated with a decrease in the key DORA metrics of lead time, throughput and change failure rate, while having no positive impact on product performance.

This is counter intuitive because you would imagine improving your software development process would lead to better software delivery performance. After all, if you're writing better code, having that code reviewed faster, you'd think that it would have some notable downstream impacts. Turns out it's not and the authors hypothesize that:

> ...the fundamental paradigm shift that AI has produced in terms of respondent productivity and code generation speed may have caused the field to forget one of DORA’s most basic principles—the importance of small batch sizes. That is, since AI allows respondents to produce a much greater amount of code in the same amount of time, it is possible, even likely, that changelists are growing in size. DORA has consistently shown that larger changes are slower and more prone to creating instability.

Basically, a rush to the red light effect where the deployment process of organizations isn't keeping up with the increase in developer productivity, leading to larger changes which lead to riskier deploys. This is fascinating to me and confirms one of my long-held beliefs (biases?) that keeping change size small is central to continuous delivery since, as all things being equal:

1.  Smaller the change, the lower the risk
2.  Smaller the change, the more changes you need to make, the better you become at making changes
3.  Larger the change, the more coordination required, making the change more expensive, thus reducing the incentive to make the change

The positive impact of smaller batch sizes in increasing quality and performance is best highlighted in [Reinertsen's work](https://www.goodreads.com/book/show/6278270-the-principles-of-product-development-flow) which is summed up neatly in this [HBR article from 2012](https://hbr.org/2012/05/six-myths-of-product-development) and the DORA authors have been hammering that point home for years.

I don't know if they have enough data to confirm this hypotheses but it is a reasonable one. I'd like to take it a step further and hypothesize that this is only a short-term trend. It is relatively easy for developers to adopt AI tools since it can be as simple as opening up a new browser window. However, for pipelines and deployment processes it will be slower since it requires deeper changes to platform-level toolsets which span beyond individuals to teams and departments. We may be seeing a lag between the "left" and "right" side of the delivery process and I think this is a short-run problem which will go away sooner than expected because of the urgency around AI.

For example, though the report doesn't explicitly link the two, earlier in the document they do point out that organizations are:

> ...willing to forgo the typical huge bureaucracy involved in adopting new technology because they felt an urgency to adopt AI, questioning "what if our competitor takes those actions before us"

Sidebar: This reminds me of the JDK Version Index which is conceptually similar to the [Big Mac Index](https://en.wikipedia.org/wiki/Big_Mac_Index) and a quick indicator of how far behind an organization is with industry. Big companies are usually around 4-5 (sometimes more) behind what the widely accepted JDK version is. I remember when JDK 1.5 came out with generics, lot of gigs I had insisted on sticking around with 1.4 for years because there just wasn't enough impetus to change something seen as so core. Similar stories can be heard about Java 8 and Java 17.

AI is different and the adoption speed is going to be faster since there is a perceived foregoing of tangible benefits if you don't. It's amazing how lumbering organizations who always cite their size and "oh we're so complex" as reasons not to adapt quickly, when faced with a crisis (or perceived crisis), are able to suddenly slice through the red tape to get stuff done ([Shock Doctrine, anyone?](https://www.goodreads.com/book/show/1237300.The_Shock_Doctrine)).

Covid responses are a great example of this. Unfortunately, in my experience whatever process waste that was slashed during Covid has crept back in. Though I doubt anything will drive the impetus to change as Covid did, AI looks to have similar impact so DORA's findings of AI's positive impact on developer not translating to software delivery performance may just be a short-term phenomenon.
