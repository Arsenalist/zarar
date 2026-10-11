---
title: "No Lie Logs"
date: 2024-12-25T01:46Z
---

My new year's resolution is that I want better alerts. I'm using [Better Stack](https://betterstack.com/) for log storage and want to live in a world where every time there's a worthy error, I get pinged. I only want the word "error" to appear in the logs if it's actually something that needs attention. So this Christmas Eve I started going through the logs just searching for "error" and seeing what comes back.

I was happy that most of the stuff that came back were actually bugs. For example, `String.trim()` being called on a `nil` item. An email address not being parsed because it had two periods in the TLD (e.g., hotmail.co.uk). That kind of stuff which I can easily clean up on the way to No Lie Logs. Some of the stuff were things that could've been handled using an info or warning log, so reclassifying things also helped tone down the fake errors.

There's few things worse in an application that's trying to be observable than seeing something that looks like a problem turning out not to be a problem. I get the relief of not having a real problem but false negatives are a huge time waste (and an indicator of technical debt). I suppose that's startup life, you can't have it all so you make trade-offs and one of the trade-offs I had made was speed over observability, which in hindsight served me well. But now I want to clean the logs up to the point where they’re bloody pristine.
