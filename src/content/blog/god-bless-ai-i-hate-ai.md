---
title: "God bless AI, I hate AI"
date: 2026-05-21T22:09Z
---

I had to rewrite an app which used the [exchangelib](https://github.com/ecederstrand/exchangelib) Python library to Go. All was going smooth until I started manual testing and kept getting a 401. It turned out that the asmx Exchange URL was returning a domain which was being hashed during auth checks by the [ntlm GO lib](https://github.com/Azure/go-ntlmssp). The GO Lib assumes that that's the domain the user wants to login with. This was different than the domain I was trying to authenticate with. I didn't figure this out - the agent did, and I honestly think it saved me 4 hours of debugging time because for me to find this out on my own, I'd have to actually compare hashed versions of signatures/domains to figure it out.

God bless AI. I also hate AI.
