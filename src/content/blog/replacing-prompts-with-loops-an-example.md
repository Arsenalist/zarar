---
title: "Replacing prompts with loops: an example"
date: 2026-09-04T21:08Z
---

Claude Code creator [Boris Cherny](https://www.youtube.com/watch?v=kRgdkOw82F0) made a bit of a stir when he said:

> “I don’t prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write loops.”

That was followed by [the "everything is a loop" essay by Geoffrey Huntley](https://ghuntley.com/loop/). It sounded sort of magical and I've been playing around with it since. Basically, you put a coding agent in a loop and let repeated attempts move the code towards a particular goal. I got the idea but the biggest source of skepticism for me was how to define the goal? How do we define the requirements that take us towards the goal, and why is this better than prompting?

Once you throw in ideas like multi-agent review, it can sound like you need a small orchestration platform before you can try any of this.

Turns out you don't. A useful loop can be one shell script built around a command you already run manually. Building on my last post about [improving test performance](https://bitbytebit.substack.com/p/speeding-up-elixir-test-suites), this post tackles a related problem: flaky tests which keep failing but pass on re-run. I was noticing a lot of these in my codebase and instead of trying to fix them using prompts, I wrote a loop.

This post covers how to use loops instead of prompting so that work can be divided between code and models instead of getting the models to do all the work. We'll also see how we can keep context clean, reduce token usage, use a second model for reviews, and see how to reuse this pattern for feature development.

## Start with the loop contract

This is the prompt I used to ask an agent to build the loop which would detect and fix flaky tests:

> Write a Bash script that runs `source .env && source .env.test && mise test`. When the suite fails, rerun `mise test --failed`, save complete logs to disk, and give Claude a bounded digest containing numbered ExUnit failure blocks, test names, file and line anchors, exceptions, stacktraces, and seed. Claude may edit application and test files, but must not edit the orchestrator, environment files, commit, push, or create a PR.
> 
> Send only Claude's resulting patch to Codex for an Elixir-specific review. Codex must return JSON matching `{verdict: "ok" | "changes_requested", findings: [{severity, file, line, message}]}`. Ask Claude to apply valid findings and repeat review until Codex returns `ok`, with a maximum of five review rounds.
> 
> Reset the clean streak after every full-suite failure. Stop after three consecutive full-suite passes or twenty full-suite runs. If fixes were made, create one branch, commit, push, and PR. If no failure occurs, create nothing. Start only from a clean, current default branch. Keep full logs outside model context and cap every artifact sent to a model.

The prompt describes a protocol where the Shell owns sequence, counters, file scope, exit codes, and side effects. Models handle work that needs judgment like diagnosing an failure, changing code, and reviewing a patch.

The [complete generated loop is here](https://gist.github.com/Arsenalist/de276782d29e0d3e44c829bda318927e). You can dig into the Bash code for details, but its main loop summarized for brevity is dead simple:

```
run full suite
  pass -> increment clean streak
  fail -> reset streak, rerun failures, build digest
          -> Claude fixes -> Codex reviews -> Claude applies findings

stop at three clean passes or twenty full runs
create one PR only if code changed
```

Here's a visual:

![The Loop](/images/loop.webp)

There are four key points to note in how this works:

1.  The code owning deterministic choices
2.  The model only getting a small and relevant piece of context instead of the session transcript
3.  Separation of coding and reviewer models
4.  The right exit/stop condition

Let's dig in.

## Put control flow in code

You could give one agent the full task and ask it to keep running tests until they pass, which is what many are generally used to. That makes the agent remember the run count, decide whether a focused pass disproves the original failure, remember to request review, and know when it may open a PR. All of those decisions and instructions are deterministic and LLMs are notoriously non-deterministic. Having an LLM do all that would pollute context and increase non-determinism, so we move this to code we can deterministically control.

You don't need to be an expert at Bash to do this since LLMs are simply awesome at generating Bash code.

With Bash power in hand, we do things like run the test command and if it fails, we reset the `PASS_STREAK` to zero. A successful command increments it. A counter stops the run at twenty to cap token usage. Clean runs don't create any PRs, but a changed tree followed by three clean passes creates one PR.

This pattern results in a smaller prompt/context for each model call, thus fewer ways for the model to deviate from its goal. The model does not need to remember the protocol (e.g., pass, fail, clean runs) because the script will call the next step as appropriate. The model instead works on a focused task with a small prompt, i.e., fixing one test (Claude) and reviewing the fix (Codex).

## Keep logs out of context

Large test suites can produce logs far bigger than the failure we're trying to detect. Async tests make naive tail parsing worse because output from several tests can be interleaved so you can't simply track the lines after a test failure to determine cause since the cause could be 50 lines later and two other tests could've run in between.

The script writes complete logs under `.git/test-stabilizer/`. It then builds a digest from numbered failure blocks, test names, `file:line` anchors, exceptions, stacktraces, final counts, and the random seed. The digest is capped at 64 KiB to manage context. If Claude needs more, it can use an anchor to read a small range from the source log. Essentially, we give it a limited piece to read but in the event it really needs more, it can access it.

The reviewer LLM (Codex) gets an exact patch rather than the test logs or conversation history. The orchestrator (the Bash script) is excluded from review.

This is where much of the token saving comes from. A long interactive session keeps accumulating old logs, explanations and tool output. The loop only gives the LLM with the artifacts needed for its current job. It repeats a small amount of static instruction instead of carrying the whole history forward, savings thousands of tokens.

## Use different models for different jobs

I've found success with one model reviewing another's work instead of a model reviewing its own, so in the loop I split the responsibility of writing and reviewing code to Claude and Codex, respectively. And Codex doesn't review the entire change, but only the resulting patch of a single iteration of the loop using an Elixir-specific checklist: process lifetime, mailbox ordering, ExUnit async safety, Ecto SQL Sandbox ownership, Mimic expectations, factories, shared state, time dependence, and assertions.

Warning: this paragraph of the post is Elixir-specific. One of the problems the loop caught was a LiveView process receiving a Swoosh `{:email, _}` message it did not handle. Claude isolated the mailer call as a fix, and then Codex checked the test semantics and found that assertions inside the mailer callback could be swallowed because the production function rescues callback errors. The follow-up fix sent the callback parameters to the test process and asserted there.

I have found this to be a good division of labour and have found Codex to be, in general, the stronger model (YMMV). The fixer follows one causal path and the reviewer starts from the patch and looks for ways the fix can be wrong. Using another model gives the review a separate context, different weights and whatever magic is inside these models. All that is good, but the stronger guarantee comes from its narrow input and strict output rather than executing the whole task in a single session.

Structured JSON also helps to keep the inter-model communication deterministic. The Shell can reject malformed output and easily check for an `ok` verdict, and route requested changes back to Claude. Free-form review prose would need another model call to interpret it and also introduce non-determinism. I settled on a structured returned by the Codex reviewer of:

```
{
  "verdict": "changes_requested",
  "findings": [
    {
      "severity": "high",
      "file": "lib/accounts.ex",
      "line": 42,
      "message": "Validate user input before saving."
    }
  ]
}
```

## Define success before starting

In my case, one passing focused rerun does not exonerate a flaky test, as it would only show the failure did not reproduce on that one run. So in the loop I made a rule that three consecutive full-suite passes are the acceptance condition. Any failure resets the streak back to 0 and we start the loop again. I also capped the total loop runs to 20 and 5 review rounds per loop iteration as hard limits to not exhaust tokens. Limits change the model's default behaviour of "keep trying until success" into a bounded task, and this also surfaces infrastructure failures quicker (fail fast, basically) and limit token spend.

Every loop, whether it be fixing flaky tests or developing a feature, needs the same pieces:

1.  One job per iteration.
2.  A deterministic verifier such as tests, compilation, linting, or a schema check.
3.  A small input artifact for each agent.
4.  An exact edit and review scope.
5.  Machine-readable handoffs between models.
6.  A success condition and an iteration limit.
7.  One explicit terminal action, such as opening a PR.

## The same pattern works for features

Replace "repair failed test" with "implement the next acceptance criterion" and the structure stays much the same:

```
read one requirement
implement smallest complete slice
run focused checks
review exact patch with another model
apply findings
run full quality gates
mark requirement complete
```

The agent can manage its work in a simple task file or a [Beads issue](https://github.com/gastownhall/beads), or anything else. I use [OpenSpec](https://openspec.dev/) to generate task lists for features I'm developing and then pass them onto the loop - my workflow is essentially to spend time deciding what to build and generating a task list, and then handing that task list to the loop. The implementation agent gets one requirement and relevant context, and the reviewer gets the patch and acceptance criteria. Perhaps this is a topic for a future post.

My view is that humans should make decisions that cannot be expressed as checks such as product trade-offs, destructive migrations, security boundaries, and changes with which could have several valid behaviours and don't cleanly fit into acceptance criteria. Loops work best when success is observable and the next action can be selected from an exit code, a diff, or structured output.

If you want to try out loops, I'd say start with a workflow you already do "manually". Write its stop condition first, move its mechanical decisions into Shell, and give models only the parts that require judgment. With LLMs, writing loops in Bash are easy, which means orchestrators are easy.
