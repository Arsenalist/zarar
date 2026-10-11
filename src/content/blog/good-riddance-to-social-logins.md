---
title: "Good riddance to Auth0 and social logins"
date: 2025-11-21T16:35Z
---

Three months ago I got rid of social logins, fired Auth0 and made the decision to use Magic Links (easy in [Phoenix](https://hexdocs.pm/phoenix/mix_phx_gen_auth.html) - hello `mix phx.gen.auth`).

I had made the decision to go with Auth0 after I had implemented by own social logins to FB and Google, and wanted to support GitHub, in addition to regular username/passwords. I had grand ideas on how I'd use Auth0 to manage permissions and implement their "Actions" by implementing manage middleware, create user journeys which route people this way and that way, but most of all it was about security. I didn't want to get into the business of managing passwords and and tokens, and wanted to focus on value-added feature, you know, things people pay for.

But here I am a year later reversing it all, and these are some reasons why. These are in no particular order.

1.  85% of customers just use regular email/passwords so the additional options on login just confuse them. I wanted to make things easier for people and had thought I would reduce signup friction if I added social logins. This was an incorrect assumption.
2.  People mistakenly login use the email from their regular email/password combo to login to social logins which they also have an account, and it's chaos to manage that, especially from a customer support standpoint.
3.  I didn't have to manage keys from Meta, Google and the like, e.g., policy updates, token expirations, other random "Required Actions" being thrown at me in the Meta Developer Portal where each page takes 20 seconds to load.
4.  I had overestimated how much work implementing your own security system would be, but Phoenix 1.8 made it dead simple to implement Magic Links and with the help of Claude, the whole thing took a weekend to go from zero to in-production.
5.  I liked the idea of outsourcing authentication to a user's email provider (usually Gmail) and let it be the weakest link in the chain. They think about this stuff all the time so I don't need to. They basically implement MFA for me.
6.  I didn't want to incur a needless cost. Though I'm on Auth0's "Startup Program", they can jack up fees any time and I didn't like that unpredictability. I'm startup poor.
7.  Managing permissions in a separate system was too complex. I'm using RBAC which isn't hard to implement, and crossing network and system boundaries just to see "does this user have access?" seemed overkill. I did shove all the permissions in the JWT via an action, but any update to those permissions required pulling that information again, and my users update permissions all the time. Too much work to sync state and it felt needlessly complex.
8.  Implementing resource-based authorization turned out to be much simpler using Elixir's [LetMe library](https://github.com/woylie/let_me). Just give me a database I can query over an API I have to call - so much simpler. The UI to manage was also snappier to implement in LiveView as we're avoiding REST calls.
9.  There was very little control when using Auth0's Universal Login on how you'd like to customize the screen. I realize login screens have to be simple, but just putting some other links was hard. Just having the ability to customize branding isn't enough.
10.  Lot of users were confused by the redirect to a "different" site even though I had a custom domain going. The older users felt like they had done something wrong when the header of the site changed.
11.  I implemented account spoofing but it was a pain as I couldn't just decrypt the token from Auth0 as they don't provide the secret to do so (rightfully so, I suppose). I had a really funky workaround for operations people to fix customer issues via spoofing. My implementation could've been better, but it's still unnecessary code complexity.
12.  I hate Meta and Google and want to steer my users away from them, not towards them.
13.  I felt I could secure customer data by using proper system admin, storage and encryption practices, and didn't feel I was getting any additional security benefit by outsourcing this info to an external provider. I had overestimated how complex this was to manage (knock on wood). I felt having a good cloud and storage provider was more important than having a good identity management provider.

All in all, learned a lot through this whole process and Auth0 did help me get off the ground quickly back when Phoenix 1.8 wasn't released. Maybe this is just another case of Elixir/Phoenix making development a joy more than an indictment on hiring identity providers.
