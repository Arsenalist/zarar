---
title: "Four Ways to Plan Agent Work, and When to Switch"
date: 2026-06-22T18:27Z
---

This post is for developers who want to learn about the different planning approaches to take during agentic software development. This is my experience, and all of this could be wrong, but it does work for me.

The type of planning I reach for depends on the type of change being introduced, and I'll walk through these from the lightest to the heaviest. But picking the right approach up front is only part of it, as often I start in one mode and realize partway through that I've under-planned. The last section covers how I notice that and change direction mid-flight.

## Planning Approaches

Before walking through each approach, here's the whole idea in one chart. The way I see it, the effort of planning boils down to two things: 1) do I actually know what I want, and 2) how much breaks if I get it wrong? Everything below is just those two questions playing out.

![planning-approaches](/images/planning-approaches.webp)

### Simple changes

If a change is dead simple and you feel the chances of the agent messing it up is low to none, you can enter a direct prompt. The three most recent changes I made using this approach are:

-   Double the thickness of the border of the selected item on the product page
-   Change default radius of ad targeting from 15 km to 25 km
-   Use `<.stat>` component to display statistics instead of raw HTML on dashboard

These are all changes that have easy verification and are 1-15 lines of changes, if that. I find there is no need to get into any sort of complex planning mode here because you could even hand-roll these changes out easily.

### Agent plan mode

Most agents now ship with some sort of a plan mode which allows you to scope and bound the change before implementation. The plan mode can be invoked using `/plan` in Claude Code and other agents have similar, if not the exact, command. I reserve agent plan mode for changes where I know what I want to implement but where I want a "preview" of what the agent is about to do.

This doesn't need to be a heavy weight blow-by-blow plan, but something that gives me confidence that it's about to do the right things, and an opportunity for me to provide guardrails before it does it.

These are the three most recent changes I've requested an agent-driven plan for:

1.  The url is not a required field, but if it is provided, use the url path validator that we implemented recently which allows a / or a http(s) url to be used here.
2.  Add a clickable link next to subscriber count on campaign audience page that opens a modal showing a random sample of targeted subscribers with name and email filters.
3.  Remove the image\_aspect thumbnail mode setting for event images as we now derive what aspect ratio to use based on whether the event has single or multiple images

### Spec Driven Development Execution

There are changes where I know what I want but I:

1.  Expect a bigger blast radius across the codebase (e.g., more than 3-5 files)
2.  Want to spend more time on technical design and architecture
3.  Want a more comprehensive historical record on why the change was introduced

In these cases, I will use a tool like [OpenSpec](https://openspec.dev/) or [Superpowers](https://github.com/obra/Superpowers) to create a more comprehensive plan which will consider customer needs, technical designs and post-implementation documentation.

I'm a big fan of OpenSpec entirely because of how lightweight and non-prescriptive it is. I will start with an `/ospx:propose` command which will create the high-level proposal, a Gherkin-based spec which can be used as invariants by agents for future changes, a technical design and a task list for review. I will spend perhaps 10-30 minutes reviewing the plan and tweaking it before going into execution.

These are the three most recent changes I've done using `/opsx:propose`:

1.  Centralize object-level authorization in a shared on\_mount hook and replace the per-LiveView/IDOR-open object checks with one shared hook
2.  Create deep links from the order email customer receives to the refund page for that order's items, while brand settings and not showing user refund links when not applicable to the item they purchased
3.  Derive a brand's default URL slug from brand name with a mnemonic suffix when URL slug collisions occur (use an existing Elixir library to create suffixes - not random numbers like currently)

The above cases do a significant refactor (1), touch a crucial part of the customer experience which is the email they get (2) and change the internals of how we calculate public-facing URLs (3). These all affect the technical design of the feature to a degree where I want to review the impact in detail to ensure SRP, DRY etc are followed to my liking.

### Spec Driven Development Brainstorming

In all the above cases so far, I have known what I want the outcome and design to be at some level. In many other cases, I find myself in a position where:

1.  I don't know what exact customer experience I'd like and but have a general sense of what outcome I want
2.  I have many options on how to implement a particular feature, and am not sure which is the right approach for me as I haven't weighed the trade-offs
3.  I haven't implemented something like this before and need to come up with an approach which will help me narrow down scope and create MVPs

The OpenSpec equivalent to this is `/opsx:explore` and the Superpowers equivalent is `/brainstorm`.

I find myself reaching for this planning approach a lot as it goes wide by diverging across different concerns before attempting to converge. In these case I don't want to arrive at a solution quickly but want to uncover risks, align on the best customer experience, whittle down MVPs, and explore trade-offs and architectural patterns. I may spend hours to days in this mode going back and forth, and only after I'm comfortable I'll convert the chat history into an `/opsx:propose`.

These are the three most recent changes I've initiated using `/opsx:explore` and where I spend at least a full day in this mode before hammering out a spec:

1.  Currently, admins must set an absolute price on every combination individually (e.g., 3 sizes x 3 colors = 9 prices to manage). Changing the base price requires updating all combinations manually. This doesn't match the Uber Eats-style additive pricing model the modifier system was designed to support, where each option value has a +/- price adjustment and the final price is computed automatically. Let's make this easier for admins by specifying base price and providing adjustments per combination. This change affects payouts, reports, analytics and possibly other areas of the app.
2.  I want to extend the role-based system by having customers create their own roles instead of pre-defined set of roles. They should also be able to map permissions to users (not just roles). I will later also seek to add object-level authorization (instead of just account based)
3.  Let merchants connect external email-marketing providers (Mailchimp, Squarespace) so that mailing-list signups and opted-in customers are automatically pushed to the merchant's own audience on those platforms.

As you can probably see, these are big changes with wide ranging impacts to multiple app modules. I see myself as not necessarily knowing what the solution here will be, and want to spend a lot of time branching out and exploring before aligning on a direction. Direct prompting is entirely useless here, agent planning mode is insufficient, and even creating a spec for immediate execution seems risky.

## Changing Direction Mid-Flight

Everything above assumes I pick the right planning mode up front. In practice the more useful skill is noticing, partway through, that I picked too light a mode and bumping up a tier before I've wasted too much time. Here's what I watch for.

**Switching from simplistic prompts to agent plan mode** The giveaway is when the diff surprises me. I asked to swap raw HTML for the <.stat> component on the dashboard, expecting a handful of lines, and the agent starts reaching into how the dashboard loads its data. The moment a "1-15 line" change touches a file I didn't picture, I stop and re-issue it as a /plan so I can see the full scope before it runs.

**Switching from agent plan mode to spec execution** This happens when the plan coming back is bigger than the preview I expected. I asked for the optional-url-validator change expecting a bounded plan, and instead it touches five or six files, or contains a design decision I can't make in thirty seconds, e.g., where the validation should live, whether it's shared or a one-time use. When a "preview" turns into something I need to review for SRP and DRY, plan mode is no longer good enough and I need a spec to review.

**Switching from spec execution to brainstorming** The clearest signal is that I'm starting to extensively rewrite the spec instead of just reviewing it. If I sit down to tweak an `/opsx:propose` output and keep changing the approach, or worse, I keep changing the Gherkin invariant because I don't actually know what the correct behaviour should be, then I admit defeat and go into brainstorming/explore mode. I find that if I don't do this, I end up baking my confusion into the code.

## Conclusion

Your mileage may vary on these and you may have an entirely different approach, and that's completely fine. The type of tools available to us has exponentially increased over the last three years, and there's no single "right" way of approaching things. The key is to de-risk the implementation at the right juncture so that what you end up producing conforms to your mental model of how the software internally works, and the changeability of those internals as customer needs invariably shift.
