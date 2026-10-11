---
title: "I'm done with cross-browser testing"
date: 2026-05-23T16:04Z
---

I have completely stopped testing in anything other than Chrome on Mac and it hasn't affected me at all. I don't test in Edge, Safari or Firefox and have not encountered any notable issues by not doing so.

This is a big deal because I've spent decades trying to make things work in IE (6, 7, 10, 11) and have always had to test in multiple browsers before releasing something. The fact that I can now just verify the UI in [Tidewave](https://tidewave.ai/) in two minutes and be confident that it'll just work in different browsers and layouts is awesome.

The three major rendering engines and their share is below (the table is AI generated via Claude)

| Engine | Origin | Browsers using it | Approx. global share |
| --- | --- | --- | --- |
| Blink | Google (forked from WebKit, 2013) | Chrome, Edge, Opera, Brave, Samsung Internet, Vivaldi, Arc | ~75–79% (Chromium ecosystem combined) |
| WebKit | Apple | Safari; all iOS browsers (Chrome, Firefox, Edge on iOS are forced to use it) | ~14–17% |
| Gecko | Mozilla (Rust-based since Quantum) | Firefox, Tor Browser, LibreWolf | ~2–3% |

The main question is how likely is a feature you pick to work everywhere?

| Tier | What it means | Last 2 yrs of releases | Last 1 yr of releases | Examples |
| --- | --- | --- | --- | --- |
| **Mature features** (2.5+ years old) | Shipped in every engine over 30 months ago, long enough that even users on older browsers have it. Officially: _Baseline widely available_. | ~100% | ~100% | grid, flexbox, fetch, `:has()`, container queries, subgrid |
| **Interop priorities** (this year's focus) | Features Apple, Google, Microsoft, and Mozilla agreed to ship in lockstep this year. They land in all engines around the same time. | 95%+ | 99% (preview builds) | view transitions, anchor positioning, navigation API, `@scope` |
| **Recent features** (under 2.5 years old) | In the latest version of every engine, but not old enough to count on for users who haven't updated. Officially: _Baseline newly available_. | 60 to 80% | ~95% | URLPattern, scrollend, sideways writing modes |
| **One-engine features** (missing somewhere) | At least one engine never implemented it. Usually device APIs that Chromium shipped but Safari and Firefox declined. | <30% | <30% | Web Bluetooth, Web Serial, File System Access |

For the top three tiers, testing in a single engine is a reasonable proxy for testing all three. The exceptions are device APIs where Chromium ships alone, but other that that, I feel you can safely save on testing effort, especially if you're constrained for resources. In a dumpster fire of a world, this is good news.
