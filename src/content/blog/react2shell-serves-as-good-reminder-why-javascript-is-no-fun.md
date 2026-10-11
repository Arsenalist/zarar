---
title: "React2Shell serves as good reminder why JavaScript is no fun"
date: 2025-12-07T20:47Z
---

Got this email from Vercel after the JavaScript ecosystem [had another moment](https://aws.amazon.com/blogs/security/china-nexus-cyber-threat-groups-rapidly-exploit-react2shell-vulnerability-cve-2025-55182/).

![nextjs-react-shell](/images/nextjs-react-shell.webp)

I understand the urgency of the matter, but blocking deployments is a step too far as I don't even have RSC enabled, and need to make changes to the app. This isn't a simple upgrade as I was on Next 14 and React 18. The peer-dependency situation is hell as there are many libraries that have hardcoded dependencies to React 18. In some cases you can use `legacy-peer-deps=true` to get around things, but in others you have to update critical libraries that you had no real need to do, e.g., PixiJS 7 -> 8, and those have breaking changes. Not to mention the code mods that need to be applied from Next 14 to 15 only leave you with a sense of dread. But a weekend later, all is done.

What this experience reminded me of is why I got out of the JavaScript world and switched to Elixir/Phoenix (about 80% migration done). Half the time I was chasing library upgrades and framework changes, rather than focusing on actual valuable work. Since I've shifted away from it, it's not an exaggeration that boilerplate plus maintenance of libraries has gone from taking about 30-50% of time down to about 5%.

All the JavaScript frameworks ultimately either:

1.  Aim to manage state so that reactive experiences can be easier to develop.
2.  Want to provide some performance optimization (e.g., SSR)

Compared to how Phoenix/LiveView does it, they've all failed. Every. Single. One. There is ton of boilerplate and your app is always worried about the next breaking change some library which doesn't care about backward compatibility is about to publish, leaving you behind.

You can't avoid JavaScript but I've found exiting the React/JavaSCript ecosystem has made for a healthier programming lifestyle.
