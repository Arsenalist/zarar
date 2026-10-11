---
title: "Scope discipline when AI makes building fast"
date: 2025-12-23T15:53Z
---

I needed to show users contextual messages, e.g., banners for announcements, modals for important actions, tours for onboarding. I already use PostHog for analytics and PostHog allows the user to create apps which can provide this functionality while being tightly integrated with their analytics capabilities.

But I built my own system instead. Here's why, and why the hardest part wasn't building but knowing when to stop.

## The Business Problem

I run an event management platform. Venues use it to sell tickets, manage events, run marketing campaigns, create ads etc. The product has grown sophi . New features ship, but users don't find them.

This isn't a documentation problem as users don't read docs. It's not an email problem either. Announcement emails get 20% open rates if you're lucky. The features exist and users need them. They just don't know they're there.

The real problem breaks down into specifics:

**Feature discovery.** I ship something new, maybe a better way to handle refunds or a new analytics dashboard. The users who would benefit most never click on it because they don't know it exists.

**Contextual nudges.** A user logs in through SSO but hasn't set a password. That's fine for now, but if SSO breaks they're locked out. I want to prompt them to set a password, but only when it's relevant, not in an email they'll ignore.

**Onboarding flows.** New users need guidance. Not a wall of text. Step by step tours that show them where things are. "Click here to create your first event. Now add tickets. Now publish."

**Multi-tenant complexity.** This isn't a simple user model. I have accounts (the venue), users within accounts (staff), and customers (ticket buyers). A message might be relevant to one account but not another. Dismissing a message as one user shouldn't dismiss it for your colleague.

**Non-intrusive UX.** Whatever I build needs to be easy to dismiss. Remember that the user dismissed it. Not show it again. Respect their attention.

These requirements shaped everything that followed.

## Why PostHog Was a Serious Candidate

PostHog is the obvious choice due to it already being used and providing a way to track user behavior. It has capabilities that you can extend for this kind of thing and the AI was quick to suggest building a PostHog custom app which extended it's core features to delivery on the following using these approaches:

**Surveys** work as modal-style messages. Create a popover or modal, target by URL or user properties, built-in dismiss tracking. No code needed for basic use cases.

**Feature flags with payloads** could drive banner content. The flag controls who sees the message. The payload contains the content. Evaluate client-side and render.

```
const flag = posthog.getFeatureFlag('welcome-banner')
const payload = posthog.getFeatureFlagPayload('welcome-banner')
// payload: { title: "Welcome!", content: "...", style: "info" }
```

**Site Apps** let you write custom JavaScript that runs in PostHog's context. Full control if surveys and flags aren't enough.

I seriously considered this path. PostHog handles targeting UI, cohort management, percentage rollouts. That's real value. The code was also already there and it was tempting to go with this but a pause was needed.

## Why PostHog Didn't Work

The problems started when I mapped PostHog's features to my actual requirements.

**No dismissal tracking for feature flags.** Surveys track dismissals automatically. Feature flags don't. If I use flags for banners, I'd need to:

1.  Send a custom event when user dismisses: `posthog.capture('message_dismissed', { message_id: 'xyz' })`
2.  Create a cohort of users who have that event
3.  Exclude that cohort from the feature flag
4.  Repeat for every message

That's a lot of manual cohort management. It gets messy fast.

**No per-account targeting.** PostHog targets users, not accounts. My multi-tenant model needs messages scoped to specific accounts. User A on Account X dismisses a message. User A on Account Y should still see it. User B on Account X should also still see it.

PostHog would require setting account\_id as a user property, then creating cohorts per account. That doesn't scale to hundreds of accounts.

**No path-based targeting for feature flags.** Surveys can target by URL. Feature flags can't. I'd need to check the path client-side:

```
if (window.location.pathname.startsWith('/dashboard')) {
  const flag = posthog.getFeatureFlag('dashboard-message')
}
```

That works, but now I'm writing conditional logic in JavaScript for every message. The targeting that should be configuration becomes code.

**No tours.** PostHog has nothing like driver.js. No step-by-step walkthroughs. I'd integrate driver.js separately and use feature flags to control when tours trigger. At that point I'm building half the system myself anyway.

**Server-side control.** My app is Phoenix LiveView. I've worked hard to keep logic server-side. Adding PostHog's JavaScript SDK for messaging means rendering decisions happen in the browser. State lives in two places. Debugging gets harder.

**The dependency question.** PostHog is great today. But SaaS products change pricing, get acquired, pivot. Messaging is core infrastructure for my product. If PostHog changed their pricing model or discontinued a feature, I'd need to rebuild under pressure. Owning it from the start avoids that risk.

My decision: custom for system messages and tours, PostHog for surveys and A/B tests where their tooling genuinely adds value. Hybrid approach and the right tool for the job.

This was an example of AI confidently providing very reasonable sounding options, but without someone sitting down and mapping the requirements to the solution with a view to long-term maintenance, one would have easily gone down a reasonable but dangerous path. In my view, software engineering knowledge is key and without that chaos will ensue. It's why I'm genuinely liking the _Product Engineer_ title which is being thrown around. Maybe more on that some other time

## Brainstorming with AI

I used Claude to brainstorm the system. This is where things got dangerous.

The initial ideas list was ambitious:

-   Snooze and remind later with configurable intervals
-   Message dependencies (show X only after Y is dismissed)
-   Role-based targeting
-   Feature flag integration
-   Time-bounded messages with start and end dates
-   Event-triggered auto-dismissal
-   Multiple dismiss behaviors (close, complete, snooze)

AI is good at generating possibilities. Too good. Every feature seemed reasonable and each one addressed a real use case. The ideas kept expanding the deeper I went into exploration.

Here's the thing about AI-assisted development: it makes building fast. Features that would take days take hours and even though this sounds like a benefit, it's actually a trap.

When building is slow, you naturally filter ideas. "That would take a week" is a forcing function for scope and you have a tendency to avoid it. When building is fast, that filter disappears and it becomes an extra hour. Suddenly, you realize that you've been going back-and-forth on things you may not need because it's so easy to cover this case and that case.

I had to keep asking myself one question: Is this the problem that I wanted to solve when I started this feature?

The problem was users not knowing about new features. That's it. Show a message. Let them dismiss it. Everything else is optimization for problems I don't have yet.

The ideas list is just that, a bunch of half-thought ideas, not a backlog. Not a roadmap. Not a commitment. When someone says "you should add snooze functionality" I can say "that's on the ideas list" without it meaning anything about when or if I'll build it.

Backlogs should be short. If it's not solving the current problem it doesn't belong there.

## The Temptation of Clean Code

The hardest moment wasn't writing features, but trying to figure out the code I was going to delete even though it worked. As an example, Claude had generated a complete implementation of snooze functionality. The schema changes were done, the UI was wired up and test cases were written as well. The code was clean:

```
defp handle_messaging_event("snooze_message", %{"message-id" => id, "days" => days}, socket) do
  scope = socket.assigns[:current_scope]
  account_id = socket.assigns[:messaging_account_id]
  snooze_until = DateTime.add(DateTime.utc_now(), String.to_integer(days), :day)

  Messaging.snooze_message(id, scope, account_id, snooze_until)

  updated_messages = remove_message_from_assigns(socket.assigns.app_messages, id)
  {:halt, assign(socket, :app_messages, updated_messages)}
end
```

It looked good and it worked. I was so close to having this capability and was tempted to just commit it and move on.

But I didn't need it, at least not right now and just because the code is in front of you doesn't mean you have to take it. That's the real danger of AI-assisted development. It's not that the code is bad. Often it's excellent. The danger is that good code is seductive. You want to keep it. You rationalize why you might need it someday. You commit it "just in case."

This is the moment where you have to view clean code as technical debt, not because there's something wrong with the code, but because it adds to your maintenance burden without an immediate benefit. The potential benefit is in the future and once you discount it by time, it becomes a bad idea to keep it. Especially when it was so easy to generate in the first place.

## MVP Scope

What I kept:

-   Banners and modals (two display types cover most cases)
-   Path-based targeting (show message only on certain pages)
-   Function-based targeting (custom Elixir rules for complex conditions)
-   Per-user and per-account dismissals (remember who saw what)

What I cut:

-   Snooze and remind later (just dismiss it)
-   Role-based targeting (function rules can check roles if needed)
-   Message dependencies (not needed for announcing features)
-   Feature flag integration (can add later)
-   Time-bounded messages (same)

The JSON targeting field was my escape hatch. It means I can add role targeting, feature flags, and dependencies later without database migrations. I'm not saying no to these features. I'm saying not yet. And "not yet" is fine because none of them solve the problem of telling users about new features.

## Implementation

Two patterns carry the system.

**Global event handling with attach\_hook.** This is where AI genuinely helped. I needed dismiss events to work from any LiveView without adding handlers to each one. Claude suggested `attach_hook` for handle\_event:

```
def on_mount(:default, _params, session, socket) do
  if connected?(socket) do
    socket
    |> assign(:app_messages, %{})
    |> assign(:messaging_account_id, session["account_id"])
    |> attach_hook(:messaging_params, :handle_params, &handle_messaging_params/3)
    |> attach_hook(:messaging_events, :handle_event, &handle_messaging_event/3)
  end
end

defp handle_messaging_event("dismiss_message", %{"message-id" => message_id}, socket) do
  scope = socket.assigns[:current_scope]
  account_id = socket.assigns[:messaging_account_id]

  if scope && account_id do
    Messaging.dismiss_message(message_id, scope, account_id)
  end

  updated_messages = remove_message_from_assigns(socket.assigns.app_messages, message_id)
  {:halt, assign(socket, :app_messages, updated_messages)}
end

defp handle_messaging_event(_event, _params, socket), do: {:cont, socket}
```

The elegance here is the fallthrough. Events this hook doesn't care about return `{:cont, socket}` and flow to the LiveView's own handlers. Events it does handle return `{:halt, socket}` and stop there. One module handles all messaging events globally. Individual LiveViews don't know messaging exists.

This pattern is powerful. Add the `on_mount` to a `live_session` and every page in that session gets messaging. No changes to individual LiveViews. No copy-paste of event handlers. The layout renders banners and modals from `@app_messages`. The hook handles dismissals. Everything works.

**Function-based rules.** This is where the power lives. I'm in a functional programming environment so everything should boil down to a simple function call with no side effects:

```
def evaluate(func_name, scope, _account_id, _message_id) do
  case func_name do
    "has_no_password" -> has_no_password(scope)
    _ -> :show
  end
end

def has_no_password(scope) do
  case scope do
    %{unified_user: %{hashed_password: nil}} -> :show
    _ -> :hide
  end
end
```

Adding a new rule means adding a function. The function receives context (user, account, message) and returns `:show` or `:hide`. No configuration files. No complex DSL. Just functions.

Need to check if a user has created events? Write a function. Need to check subscription tier? Write a function. The `MessageRules` module becomes a library of predicates that the messaging system evaluates.

## Lessons

**Right tool for the right job.** I didn't replace PostHog entirely. I use it for surveys and A/B tests where their tooling adds value. For core messaging that touches my domain model, custom won. The hybrid approach means I get the best of both.

**AI makes scope discipline harder, not easier.** Claude will build whatever you ask for. That's the problem. The speed removes the natural friction that used to prevent scope creep. You have to actively ask: is this the current problem I'm solving? If not, it goes on the ideas list, not the backlog.

**Good code is seductive.** The hardest code to delete is code that works. AI generates clean, functional implementations quickly. The temptation is to keep them. Resist. Just because it's in front of you doesn't mean you have to take it.

**Technical patterns matter.** The `on_mount` hook and `attach_hook` pattern solved a hard problem: how do you add cross-cutting behavior to every LiveView without modifying each one? Understanding LiveView's lifecycle deeply made this possible.

**Functions over configuration.** In a functional language, the most flexible targeting system is just a function. No complex rule engines. No JSON DSL. Just scope in, show or hide out. Everything else is syntax sugar over that core idea.
