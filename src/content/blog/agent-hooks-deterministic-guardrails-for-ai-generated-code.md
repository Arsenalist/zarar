---
title: "Don't rely on instructions, use Agent Hooks to enforce guardrails"
date: 2026-06-20T02:35Z
---

This post is for developers who use AGENTS.md or CLAUDE.md to provide guardrails for agent-generated code, but find that the agent sometimes ignores rules. if you want a deterministic check that will work 100% of the time, read on about agent hooks.

First, a clarification. Agent Hooks are different than [git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) which many developers are familiar with. The most popular Git hook might be the pre-commit hook which is called before you try to commit everything and is a popular place to do perhaps a `git pull` or some code formatting (e.g., prettier or `mix format`) to ensure your code is formatted as per the language's standards. The limitation of a pre-commit hook is that it gets executed well after you have generated the code and just before you think you're done (i.e., commit time).

Agent hooks are invoked when the agent (e.g., Claude Code) is doing work and allows developers to interject themselves into the agent's workflow, rather than after the work is done (e.g., code review). Here's a list of [Claude Code Hooks](https://code.claude.com/docs/en/hooks) which we'll refer to. As a caution, not all agents have the same hooks. Unlike [Skills where standard exist](https://agentskills.io/home), Hooks are a bit of a mess so you'll have to see what hooks your agent makes available to you. I'm going to be doing two deterministic checks which have bit me in the past:

1.  Ensure that the agent never uses a `<input>` tag directly because I want it to use the design components I have
2.  Ensure that the agent never tells me it's done while my design-system ratchet test is failing

These two fire at completely different points in the agent's lifecycle. The first runs _before_ the agent executes a tool; the second runs when the agent thinks it's finished.

Every hook gets a blob of JSON on stdin, and the shape of that blob depends on the event. That's what the `jq` calls below are digging into. I'll show you exactly what each hook receives so the paths the `jq` tool is using makes sense. I'm using `jq` but you could have written a Python script, a shell script or anything that the agent could call.

## 1\. No raw `<input>` tags

This one is a `PreToolUse` hook. PreToolUse fires right before Claude Code runs a tool, and it's the one place where you can actually stop the tool from happening by exiting with an error code other than `1` or `2`. Whatever you wrote to stderr when exiting with exit code `2` will be seen by the agent as feedback. Exit `1` only logs a warning and lets the tool through.

I want every form field to go through my own `<.cinput>` component, not a bare `<input>`. So I check the content the agent is about to write and block it if I see the tag. This goes in `.claude/settings.json`:

```
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.content // .tool_input.new_string // empty' | grep -q '<input' && { echo 'Use my <.cinput> design component, not a raw <input> tag.' >&2; exit 2; } || exit 0"
          }
        ]
      }
    ]
  }
}
```

Here's what the hook actually sees on stdin when the agent goes to write a file:

```
{
  "hook_event_name": "PreToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "lib/amplify_web/components/form.ex",
    "content": "...the code the agent wants to write..."
  },
  "session_id": "…", "cwd": "…", "transcript_path": "…"
}
```

That's why the `jq` pulls `.tool_input.content`. A `Write` puts the whole file under `content`, but an `Edit` puts it under `new_string` instead (with `old_string` alongside it), so I fall back to `.tool_input.new_string` to cover both. The agent never gets to put a raw `<input>` on disk as the write dies and my message tells it to go use the component instead.

What I could've done instead, but didn't trust:

-   Just writing "always use `<.cinput>`, never raw `<input>`" in CLAUDE.md. That's the exact thing the agent ignores half the time and the reason you're reading this.
-   An `mix credo` (or `eslint` or pick your language's linter) rule. Better, but it only catches the tag whenever something actually runs the linter, which the agent may not bother to do, and even then it's at lint/commit time, well after the code is already written.

## 2\. Don't let it stop until the ratchet test passes

This one's a `Stop` hook, which fires the moment the agent decides it's finished. It's the inverse of PreToolUse as instead of blocking an action before it happens, it refuses to let the agent end the turn at all. Exit `2` here means "no, keep working," and the stderr message tells it why.

I keep a ratchet test that locks in design-system decisions I've made at `test/amplify_web/design_system_ratchet_test.exs`. The thing that's bitten me most is the agent announcing it's done with that ratchet red. The agent may run tests it thinks it needs to verify it's work, but the ratchet test doesn't always get picked up as it's more of a "global" check rather than specific to a feature. So I gate the finish on exactly that test, not the whole suite (it's faster, and it's the decision I actually care about):

```
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "[ \"$(jq -r '.stop_hook_active')\" = true ] && exit 0; mix test test/amplify_web/design_system_ratchet_test.exs >/dev/null 2>&1 || { echo 'Design-system ratchet test is failing — fix it before you call it done.' >&2; exit 2; }"
          }
        ]
      }
    ]
  }
}
```

The stdin for a Stop hook is much thinner since there's no tool to inspect, just the fact that the agent wants to wrap up:

```
{
  "hook_event_name": "Stop",
  "stop_hook_active": false,
  "session_id": "…", "cwd": "…", "transcript_path": "…"
}
```

No `tool_input` here since there's no tool invocation happening. Stop hook runs my gate and decides whether the turn is allowed to end. So the `jq` only reaches for `.stop_hook_active`. Now the agent literally can't wrap up until the ratchet test is passing.

One important point that tripped me up: that `stop_hook_active` check at the front is not optional. Once a Stop hook has forced a continuation, that flag comes back `true` on the next stop, and if you don't bail out when you see it, a permanently-red ratchet will trap the agent in an infinite "fix → stop → blocked → fix" loop until you kill the session, so we must check the flag and let it stop.

What I could've done instead, but didn't trust:

-   CLAUDE.md ("always run the ratchet before saying you're done"). Ignored, same as everything else in this category.
-   A `PostToolUse` hook running the ratchet after every edit. It works, but it fires constantly mid-task when the code is legitimately half-finished, so it's slow and noisy. The Stop gate runs once, at the only moment that matters is when the agent claims it's done.
-   Leaving it to pre-commit or CI. Catches it eventually, but only at commit/push time, i.e., after the agent's already declared victory and I've moved on. That's the exact "too late" problem with the pre-commit hook I opened this post complaining about.

One more trap that applies to both is if `jq` fails silently. Get a path wrong (`.tool_input.content`, `.stop_hook_active`) and jq returns `null`, your check matches nothing, and the gate quietly does nothing while looking like it works. Test each one against a real hook payload before you trust it.

That's it. Two checks at two different points in the loop, both deterministic, both fire every single time and give you more confidence that the agent isn't going sideways by ignoring your MUST DO VERY IMPORTANT DON'T FORGET instructions in CLAUDE.md!
