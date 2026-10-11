---
title: "Enforcing Invariants in AI-Generated Code with ADRs and Contracts"
date: 2026-06-30T17:20Z
---

I had earlier written about [using Hooks](https://zarar.dev/agent-hooks-deterministic-guardrails-for-ai-generated-code/) to enforce certain rules in AI-generated code. The idea was to use deterministic checks rather than prose-based guidance which can't be enforced at time of generation. A hook here is just a script that runs at a point in the agent's lifecycle and can block it from continuing. The broader idea is to enforce invariants and in this post I will show how we can use:

1.  Classic [Architectural Decision Records](https://github.com/architecture-decision-record/architecture-decision-record) (ADRs) to record and enforce invariants
2.  Use the [RFC 2119](https://www.rfc-editor.org/info/rfc2119/) keywords like SHALL and MUST to record and enforce invariants

But first, what is an invariant? Borrowed from [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design), an invariant is a rule that must always hold true for your system to be in a valid state. It's a promise the code makes to itself that this condition is never allowed to break. An LLM will produce code that looks correct yet quietly violates a rule you assumed was safe, and it has no inherent memory of the constraints your system depends on. The job, then, is to encode those invariants where the AI can't ignore them, so that generated code is forced to honour them.

## Architecture Decision Records as Invariants

Decisions you have made about your architecture can be thought of as invariants that need to be followed. As you incrementally make decisions, we need to ensure they are recorded so agents can treat them as invariants (i.e., rules to be followed). ADRs provide a structured method to do this. To take advantage of them, we need to:

1.  Figure out when we need to record one
2.  Actually record it
3.  Point agents to treat the ADRs as invariants

### Knowing when to record one

The hardest part is knowing when to record one. Architectural decisions rarely announce themselves as they slip by inside an ordinary coding session when you pick one storage approach over another, add a major dependency, introduce a new abstraction, or replace an established pattern. To catch these, I use an [ADR auto-suggest skill](https://gist.github.com/Arsenalist/598adc63a039e40a255dd7938830545a) that watches the shape of a conversation and flags an architectural inflection point as it happens. It looks for the tell-tale signals. An "X vs Y" comparison, "replace X with Y" or "deprecate X" language, the introduction of a new system service, or any pattern-setting choice that future work will inherit. It deliberately ignores bug fixes, styling, and behaviour-preserving refactors so it doesn't fire on noise. The skill never writes the record itself and its only job is to recognize the moment and steer me toward the `/adr` command. It runs passively most of the time, but I can also invoke it manually whenever I want a second opinion on whether a decision I'm about to make deserves to be recorded.

### Recording it

Once a decision is worth capturing, the [`/adr` command](https://gist.github.com/Arsenalist/877ed26bdfa356fa23c1298fdd0dada6) does the mechanical work. It finds the next sequential ID, creates a new `NNNN-short-kebab-title.md` file, and fills in the frontmatter and template: a **Context** section for the "why now", a **Decision** stated in a sentence or two, the **Options considered** with their trade-offs, and the **Consequences** that follow. The ADR is staged alongside the related feature commit, so there's history next to the related code rather than in a separate commit ([example ADR here](https://gist.github.com/Arsenalist/ffac80a538cfc96ba5277b155692e1b2)). Just as importantly, the command keeps an index page current with a table of live decisions and one for superseded decisions, so there is always a single, ordered map of every invariant the architecture has committed to.

### Treating ADRs as invariants

Recording a decision is pointless if agents never read it and the index page is the entry point to all such decisions. I point the agent at it so that before touching anything architectural it consults the relevant ADRs and treats their Decision sections as hard constraints. I add a deterministic check in the same spirit as the [Hooks](https://zarar.dev/agent-hooks-deterministic-guardrails-for-ai-generated-code/) from before that verifies the ADRs were actually consulted before code is allowed through. The check confirms that any change touching an area governed by an ADR references that ADR, and fails the run otherwise. This closes the loop: the decision is recorded, surfaced, and then _enforced_, so an invariant can't be silently violated simply because the agent didn't bother to look.

Below is a `Stop` hook which runs when the agent thinks it's finished. Like every Claude Code hook it receives a blob of JSON on stdin, which is where the path to the session transcript comes from. Each ADR declares the paths it governs as a `scope` list of globs in its frontmatter, and the hook compares the files changed in the working tree against those globs. If a changed file falls under an ADR's scope, that ADR has to have been opened during the session, which I detect by scanning the transcript for the ADR's file path. If a governed file was touched but its ADR was never read, the hook exits non-zero and hands the agent the reason, forcing it to go back and consult the record before it can stop.

```
#!/usr/bin/env bash
# .claude/hooks/check-adrs.sh - runs on Stop
transcript=$(jq -r '.transcript_path')   # hook input arrives as JSON on stdin
changed=$(git diff --name-only HEAD)

for adr in site/internal/src/content/docs/adrs/[0-9]*.md; do
  # read the scope globs from the ADR's frontmatter, one per line
  for scope in $(yq --front-matter=extract '.scope[]' "$adr"); do
    for file in $changed; do
      if [[ $file == $scope ]] && ! grep -qF "$adr" "$transcript"; then
        echo "BLOCKED: $file is governed by $adr, which was never consulted." >&2
        exit 2                           # non-zero -> agent must address it
      fi
    done
  done
done
```

It doesn't try to judge whether the code honours the decision, only that the decision was read. That alone removes the most common problem which is when an agent ignores a constraint. This leaves the RFC 2119 to do more semantic checks as described below.

## RFC 2119 Keywords as Invariants

Where an ADR records a decision, [RFC 2119](https://www.rfc-editor.org/info/rfc2119/) keywords record behaviour. Words like MUST, MUST NOT, SHALL, SHOULD and MAY turn a requirement into a rule and pairing them with a Gherkin style given/when/then makes each rule concrete enough to check. Written this way a requirement stops being a suggestion and becomes an invariant the code has to satisfy.

### Keeping the spec in sync

A spec is only an invariant if it matches the behaviour of the code. The real risk with spec-driven work is drift, where you change your mind during implementation and the spec becomes out of date. I use [OpenSpec](https://openspec.dev/) mostly for this reason. It produces the spec as part of planning and rewrites it after the fact when the implementation diverges, so the keywords and scenarios stay in sync. [Here's an example](https://gist.github.com/Arsenalist/9765b6c853b8b894f857515b5bd320b8) of a spec it generated that conforms to the RFC. A single requirement reads like this.

```
#### Requirement: Fulfillment record creation

The system SHALL create a fulfillment record when an order is completed.
Each record MUST have a unique identifier.

Scenario: Order completed with an add-on
  WHEN an order containing an add-on is marked complete
  THEN a fulfillment record is created for that add-on
  AND the record is assigned a unique id
```

The keyword carries the weight. SHALL and MUST are the invariant, the scenario is how you check it.

### Pointing the agent at the spec

A spec is useful only when the agent reads it before generating code. With OpenSpec this is automatic, since any code it generates consults the existing specs and checks for violations first. Without it you wire the same behaviour by hand. Keep the specs in a known directory, tell the agent in its instructions to load the relevant ones before writing code, and back that with a check like the ADR hook above that fails the run if a changed file's spec was never opened. The tooling differs but the invariant concept still holds, which is that no code ships without its spec being consulted.

## Wrapping up

ADRs and RFC 2119 specs solve the same problem from two ends. ADRs pin down the decisions that shape the architecture and specs pin down the behaviour the code has to honour. Both only work if the agent actually reads them, which is why each one is backed by a deterministic check rather than a prompt.

These checks are deliberately shallow. They check if a rule was consulted, not that the code truly honours it, and the harder semantic judgment still falls to you and your tests. What they help with is the the most common problem, which is the agent never knowing the rule existed in the first place.

Prose tells an agent what you would like, a check decides what it can ship. The more of your invariants you can move from prose to checks, the less you have to trust that the model remembered, and the more your codebase stays in a state that you recognize.
