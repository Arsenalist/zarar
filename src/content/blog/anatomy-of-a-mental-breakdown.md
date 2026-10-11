---
title: "The anatomy of a 2AM mental breakdown"
date: 2024-08-20T13:15Z
---

Note: this [made it on HN](https://news.ycombinator.com/item?id=41300368) somehow.

Around 2AM this morning I had a realization that this was the most stressed I have ever been. On verge of a complete breakdown.

Why? Because I noticed around 10PM that jumpcomedy.com was entirely broken with all HTTP POST calls made by RTK Query failing. Nothing worked and though I had deployed recent changes, none of them would cause this. I was at a complete loss as to where to look, especially as this is working locally. Posting on the usual Discords (NextJS, Vercel) is leading to dead silence. I'm alone and have to fix this issue which I didn't cause.

This isn't the first production defect I've introduced in my 25 years of working, but this is the first one where I had absolutely nobody to turn to in a time of crisis while customer complaints are piling up at a rate never seen before. No production support, no SRE, no Sr. Engineer, no manager to make it go away. Nothing. And here's the worst part: people who have taken a chance on me to the point where their entire small businesses depend on me are sad. Not only do I have no idea how to fix this, I'm also hurting people. This absolutely sucks. I felt shame, sorrow, and incompetence. Oh the incompetence and the imposter syndrome that comes with it.

The thoughts that were crossing my mind were bizarre: do I just shut this business down? Do I send a mass apology email to my customers and just ask them to pick a different event management provider? What do I do because I don't know where to look and it's been four hours already.

Enter Eminem. _Alright, calm down, relax, start breathin'_

I started breathing but it didn't help a damn as I still didn't know what the issue was. No matter how many `console.log()` statements I sprinkled around, nothing made sense. Was it the headers, the length of the API token, the sequence of calls...but it was just working. Why? WHY? WHY???? IS THIS HAPPENING? And why are GET and DELETE calls working?

It's OK. The world won't end. So what if your business entirely fails and you're paraded at the next tech conference as a case of what not to do. Oh well, that's your destiny, just deal with it BUT right now deal with this goddamn bug that you didn't cause but have to suffer through. The only clue I have is that it's working on localhost, which reminded me of that old joke where during a production outage the junior developer tells his boss, "but it's working on my machine". Well buddy, you're the junior developer. Also, you're a sack of shit. No, no, don't go there. There's plenty of time for self-reflection and self-hate later, but right now just see why those cursed POST calls are failing with:

_TypeError: failed to execute 'fetch' on 'window': …with a request object that has already been used_

Now that error message is a complete red herring and tells me nothing. It may as well have said, "The Lannisters refuse to pay their debts and flight UA763 from Miami is delayed".

Haha. I start making jokes to add some levity to the situation. It's not so bad, life is about nature and trees and sooner this business shuts down and you take a boat to a deserted island, the sooner you can start your memoirs and the first chapter of the memoir would be: _TypeError: failed to execute 'fetch'_.

My wife. Oh my poor wife. She offered me a cup of tea and ruffled my hair. "It's OK, big companies have production outages too". Ah, that's so sweet of her. I told her to go to bed while I question every major life decision leading up to this moment. Oh shit, what's this? It's customer emails piling up in my inbox. Lovely.

"Hey Zarar, I can't change the the price of my event"

"Hi Zarar, I'm trying to remove a promo code and it won't let me"

....

Please, can I just delete my email at this point and take a bus to the northern wilderness? Because I still have no clue what's going on and now I'm thinking maybe I should take that break to clear my head. You know, like they say in those self-help books, but what they don't say is that every five minutes I'm getting an email saying something's broken and my response is basically, "I apologize. Working on it". But I'm not working on it, I'm just staring at the screen putting debug statements where I feel Chrome Inspector is saying, "Bro you serious? You think there's a bug on _this_ line?"

Ah, what's this? A Chrome update came in today? Could that have caused it? Hmmm...hope, I see hope. DASHED. HOPE IS DASHED! This is reproducible in Firefox and Edge. Edge? Even Edge is like WTF. Back to console.log() and break points. Now I'm dealing with source maps and libraries that don't publish source maps so now I'm looking at code that looks like this:

```
eC=Math.random().toString(36).slice(2),eE="__reactFiber$"+eC,ex="__reactProps$"+eC,ez="__reactContainer$"+eC,eP="__reactEvents$"+eC,eN="__reactListeners$"+eC,e_="__reactHandles$"+eC,eL="__reactResources$"+eC,eT="__reactMarker$"+eC;
```

This is no good. Let me just try reverting to a version from a month ago. Nothing. Three months ago? Nothing. Still failing. A year ago? Zilch.

OK, so you re-ask the question what's happening in prod that's happening locally. Or vice-versa. Some candidates:

-   Sentry is disabled locally
-   Databases are pointing to docker instead of cloud providers
-   Cloudflare’s a proxy

Got rid of Sentry in production. Nothing. Pointed to PROD databases locally. Nothing. Disable Cloudflare. Makes no matter. Maybe I should take that break, if only to calculate the financial damage and the much more significant reputational damage.

What else is different? Maybe PostHog, I have the api\_key blanked out locally to reduce costs, so let me just add it to see what gives. Shot in the dark. 1 in a million chance. Let's do it.

WHAT?! REPRODUCED ON LOCALHOST. GIVE ME THAT FUCKING CUP OF TEA NOW!

Next commit: take out PostHog and everything is working.

At this point I'm thinking all the people I've recommended PostHog to as this "amazing tool which _shows_ you what your users are experiencing". How naive I was? Right now I hate PostHog more than anything and can't believe I was about to pay for that product (still a good product, I'm overreacting here). But still, in the moment I wanted to burn the company down.

But I did feel good about finding the defect because soon after many people reported the same:

[https://github.com/PostHog/posthog/issues/24471](https://github.com/PostHog/posthog/issues/24471)

[https://github.com/reduxjs/redux-toolkit/issues/4573](https://github.com/reduxjs/redux-toolkit/issues/4573)

So that was my night!

#### Subscribe to my blog

    

const signupForm = document.querySelector('.email-signup') const confirm = signupForm.querySelector('input\[name="confirm"\]') setTimeout(() => { confirm.value = "829389c2a9f0402"; }, 1000); signupForm.querySelector('input\[name="email"\]').addEventListener('input', () => { if(!confirm.value.includes("b8a3600e52f2ad4e1")) { confirm.value += "b8a3600e52f2ad4e1"; } }); signupForm.addEventListener('submit', (e) => { e.preventDefault(); fetch(signupForm.action, { method: signupForm.method, body: new FormData(signupForm), }).then(async (response) => { const message = document.createElement('i'); message.textContent = await response.text(); signupForm.replaceChildren(message); }); });

There's also the [RSS feed](/feed/).
