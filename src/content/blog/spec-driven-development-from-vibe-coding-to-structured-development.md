---
title: "Spec-Driven Development: From Vibe Coding to Structured Development"
date: 2026-02-25T00:46Z
---

Note: I currently work with a Payments Engineering team and wrote this as we are introducing spec-driven development into our development workflow.

## Introduction

If you've used an AI coding tool in the last year, you've probably had the experience: you describe what you want, the AI generates something that looks right, you run it, and... it doesn't quite work. You refine your prompt. The AI fixes one thing and breaks another. Three iterations later you're debugging code you didn't write and don't fully understand.

This is the failure mode of what Andrej Karpathy called "vibe coding" and it's become the default way most developers interact with AI. Spec driven development (SDD) is the emerging counter movement. Instead of throwing prompts at an LLM and hoping for the best, you write a structured specification first, then let the AI implement against it.

The idea isn't new. We've been writing requirements documents since forever, but the tooling is new. Tools like GitHub's Spec Kit, Amazon's Kiro, and Fission AI's OpenSpec are attempting to formalize this workflow into something repeatable. Whether that formalization helps or hinders depends entirely on what you're building, how you're building it, and the tradeoffs you're willing to make.

Our team uses OpenSpec, so most of the practical examples in this post come from that experience. But the principles apply regardless of which tool you pick.

* * *

## The Problem: Why "Just Prompting" Breaks Down

The pitch for AI assisted coding is attractive: describe what you want in English and get working code back. And for simple tasks, a helper function, a config change, renaming a module, it works remarkably well. The challenges starts when changes aren't trivial but require edits to multiple files or packages/modules.

The core issue is context loss. When you're five prompts deep into a feature, the AI has no persistent memory of the architectural decisions you made in prompt one. It doesn't know you chose a specific idempotency strategy for a reason. It doesn't remember that you explicitly avoided storing raw card data outside the tokenization boundary. Every new prompt starts from a partial view of the world, and the AI fills in the gaps with whatever patterns it's seen most in training data.

In payments systems, this produces particularly dangerous failures. Reconciliation logic scattered across three different modules because each prompt generated its own approach. A refund handler that doesn't account for partial captures. Currency conversion applied twice because the AI didn't know about the upstream normalization step. And perhaps most critically in our domain, security flaws: API keys committed to source, missing input validation on transaction amounts, authorization checks that live on the client instead of the server. Studies have found that roughly 45% of AI generated code contains security vulnerabilities. In a payments context, that's more than just a bug but a compliance issue.

The other failure is architectural drift. Without a shared plan, each prompt/response cycle makes locally reasonable decisions that are globally incoherent. The AI can't refactor itself out of architectural problems it doesn't understand. You ask it to add retry logic to a payment gateway call and it builds a standalone retry mechanism, unaware that you already have a circuit breaker pattern in your infrastructure layer. Once the codebase reaches a certain size, the context window can only see fragments of it. You end up with a system that processes transactions but that nobody, including the AI, fully understands anymore.

This isn't the AI being dumb. It's the natural consequence of building without a map.

* * *

## What Spec Driven Development Actually Is

At its simplest, spec driven development means: write down what you're building _before_ you write the code, and make that written artifact the thing your AI agent works from.

That might sound like waterfall but It's not, or at least, it doesn't have to be. The key differences are timescale and scope. Traditional waterfall specs were project level documents written over weeks and often carved in stone. SDD specs are feature level documents written in minutes and meant to evolve. You're not planning an entire system upfront; you're planning the next meaningful chunk of work in enough detail that an AI can implement it without guessing.

A typical SDD workflow looks like this:

1.  **Define requirements.** What should this feature do? Who is it for? What are the acceptance criteria? What are the edge cases?
2.  **Create a technical design.** How should it be implemented? What's the data model? What APIs are involved? What patterns should be followed?
3.  **Break it into tasks.** What are the discrete, testable units of work? In what order should they be done?
4.  **Implement.** The AI executes against the task list, one piece at a time, with the full spec as context.

You're not writing all of this yourself. You describe the intent in natural language, and the AI generates the spec artifacts: the proposal, the requirements, the design, the task breakdown. Your job is to review, refine, and correct. You steer and the AI does the heavy lifting. This is what makes the process fast enough to be practical. Writing a 200 line spec by hand for every feature would be painful. Having the AI draft it in 30 seconds and then spending 5 minutes reviewing and adjusting it is a different proposition entirely.

The spec becomes a persistent artifact, a "super prompt" that doesn't disappear when your chat session ends. It lives in version control alongside your code. When the AI drifts, you point it back to the spec. When requirements change, you update the spec and regenerate.

The fundamental shift is that the specification becomes the source of truth, and code becomes the derived artifact. Traditional documentation describes code that already exists. SDD inverts that relationship. You define the behaviour, constraints, and architecture in the spec, and the AI produces code that conforms to it. The spec isn't something you write after the fact to explain what was built but the input that determines what gets built. Code is the output.

* * *

## The Tooling Landscape

Three tools have emerged as the most prominent in this space. Each takes a different philosophical approach.

### GitHub Spec Kit

Spec Kit is an open source CLI from GitHub that scaffolds a spec driven workflow into your existing project. It's agent agnostic, working with GitHub Copilot, Claude Code, Gemini CLI, and others. The workflow follows rigid phases driven by slash commands: `/speckit.constitution` to establish project principles, `/speckit.specify` to create feature specs, `/speckit.plan` for a technical plan, `/speckit.tasks` for work items, and `/speckit.implement` to execute.

**Strengths:** Thorough documentation output, the "constitution" concept for project wide principles, works with many agents.

**Weaknesses:** Heavyweight. Sometimes it get generate a lot of artifacts for simple changes. Rigid phase gates mean you can't easily jump back and forth between planning and implementing.

### Amazon Kiro

Kiro is a full IDE (a VS Code fork) with spec driven development baked into the editing experience. The workflow follows a similar shape (requirements → design → tasks → implement) but is tightly integrated with the editor. It generates user stories with acceptance criteria, creates technical design documents, and produces task lists. It also introduces "Hooks," user defined prompts triggered by file changes.

**Strengths:** Most polished integrated experience. The Hooks system is excellent and something you'd have to configure manually if you decide to do it on your own. No context switching between planning and editing because of the IDE integration.

**Weaknesses:** You're locked into their IDE and limited to Claude models. Can be overkill for small changes. One developer reported a simple bug fix generating 4 user stories with 16 acceptance criteria. The overhead can be significant.

### OpenSpec (Fission AI)

OpenSpec is the most lightweight of the three. It's a TypeScript CLI with a fluid, iterative workflow and no rigid phase gates. Where Spec Kit enforces a strict sequence and Kiro wraps everything in an IDE, OpenSpec gets out of your way and lets you move between planning artifacts freely.

Its distinguishing philosophy is "brownfield first." While the other tools are optimized for building new things from scratch, OpenSpec is designed to work with existing codebases. Each change produces a "spec delta," a document that captures what's being added, modified, or removed relative to the existing system. Over time, these deltas merge into a living specification that reflects the current state of the system.

OpenSpec also handles change history better. Every completed change is archived with its full artifact set: the original proposal, the spec deltas, the design, and the task list. This means you can go back and see not just what changed in the system, but _why_ it changed, what alternatives were considered in the design, and what the original acceptance criteria were. Spec Kit and Kiro generate artifacts during planning but don't have the same structured archive and merge cycle. In OpenSpec, the `openspec/changes/archive/` directory becomes a chronological record of every significant change to the system, and the `openspec/specs/` directory is always the merged, current truth. For regulated environments where auditability matters, this distinction is significant.

**Strengths:** Works with 20+ AI tools including Claude Code, Cursor, Copilot, Windsurf, and many others. The brownfield focus is valuable in our context as most real work is on existing codebases. Fluid workflow lets you update any artifact at any time and you are not forced into a linear way of working. The archive/merge cycle produces both a living spec and an auditable change history.

**Weaknesses:** Less hand holding in the spec writing process is the trade-off it makes while allowing you to navigate back-and-forth between spec and implementation. The tool is newer and the ecosystem is still growing.

* * *

## Installing OpenSpec

OpenSpec requires Node.js 20.19.0 or higher.

Install OpenSpec globally:

```
npm install -g @fission-ai/openspec@latest
```

Then navigate to your project directory and initialize:

```
cd your-project
openspec init
```

The init process will ask which AI tool you're using and configure the appropriate slash commands or agent instructions for your environment.

OpenSpec also works with pnpm, yarn, bun, and nix. See the [official installation docs](https://github.com/Fission-AI/OpenSpec/blob/main/docs/installation.md) for alternative paths.

### Keeping OpenSpec Updated

Upgrade the package:

```
npm install -g @fission-ai/openspec@latest
```

Then refresh agent instructions in each project:

```
openspec update
```

* * *

## OpenSpec's Workflow in Depth

Understanding the full lifecycle of an OpenSpec change is worth the time, because the artifacts it generates serve different roles on the team in different ways.

### The Core Commands

OpenSpec's workflow is built around the `opsx` slash commands. Here's the complete set, the ones you interact with the most are bolded:

| Command | Purpose |
| --- | --- |
| `/opsx:onboard` | Guided tutorial through the complete workflow using real code |
| **`/opsx:explore`** | Think through ideas, investigate problems, clarify requirements before committing to a change |
| **`/opsx:new`** | Create a new change folder with metadata |
| `/opsx:continue` | Progress a change to its next phase (proposal → design → tasks) |
| **`/opsx:ff`** | "Fast forward": generate all planning artifacts at once |
| **`/opsx:apply`** | Implement tasks, writing code and checking off items |
| `/opsx:verify` | Validate that implementation matches the artifacts (completeness, correctness, coherence) |
| `/opsx:sync` | Merge delta specs into main specs without archiving (useful for long running changes) |
| **`/opsx:archive`** | Archive a completed change, merging delta specs into main specs |
| `/opsx:bulk-archive` | Archive multiple completed changes at once, handling spec conflicts |

The typical flow is `new → ff → apply → archive`, but the power of OpenSpec is that you can break out of that sequence at any point. Need to revisit the design after you've started implementing? Just edit `design.md`. Want to add acceptance criteria while coding? Update the spec delta. There are no phase gates forcing you to "finish" one stage before moving to another.

### Starting a Change: Explore vs. New

One of the first decisions in any OpenSpec workflow is how you enter it. There are two entry points, and choosing the right one makes a real difference in the quality of what comes out the other side.

**`/opsx:new` is for when you know what you're building.** You have a clear feature in mind, you understand the requirements well enough to describe them, and you're ready to start generating planning artifacts. Maybe you've already discussed this in a planning meeting. Maybe you've built something similar before. Maybe the ticket is well defined and you just need to formalize it. In these cases, `/opsx:new add-feature-name` followed by `/opsx:ff` gets you from zero to a full set of planning documents in minutes.

```
You: /opsx:new add-payment-retry-with-exponential-backoff

AI:  Created openspec/changes/add-payment-retry-with-exponential-backoff/
     Ready to create: proposal

You: /opsx:ff

AI:  Creating all planning artifacts...
     ✓ proposal.md
     ✓ specs/
     ✓ design.md
     ✓ tasks.md
     Ready for implementation!
```

This works well when the problem space is familiar and constraints are understood. You've implemented retry logic before, you know the gateway's behavior, you just need to formalize it.

**`/opsx:explore` is for when you're still figuring things out.** Maybe you have a vague idea but the requirements aren't clear. Maybe you're investigating a production anomaly and you don't know where the root cause is yet. Maybe a stakeholder said "we need to support instant payments" and you need to figure out what that actually means for your settlement architecture before you can spec anything.

Explore opens a broader, open ended conversation with the AI _before_ any change folder is created and before any artifacts are generated. There's no structure imposed, no proposal template to fill out, no pressure to define acceptance criteria. You're just thinking out loud with an assistant that has context on your codebase.

```
You: /opsx:explore

AI:  What would you like to explore?

You: We're seeing intermittent failures on our direct debit 
     collections via the pain.008 pathway. Some mandates are 
     being rejected with AM04 (insufficient funds) but the 
     retry logic doesn't seem to be kicking in correctly. I'm 
     not sure if it's a status mapping issue, a timing problem 
     with our batch processing window, or something in our 
     mandate lifecycle management. I want to figure out where 
     to focus before committing to a specific fix.

AI:  Let me help investigate. Based on your codebase, I can 
     see a few potential areas...
     [Analyzes code paths, suggests profiling approaches, 
      identifies likely bottlenecks, asks clarifying questions]
```

The explore conversation might last five minutes or an hour. It might branch into several tangents before converging on a clear problem statement. That's intentional. You're doing the messy, nonlinear thinking that produces good requirements, and you're doing it before the spec exists rather than discovering gaps during implementation.

This is also where existing requirements documents from business analysts become valuable. In payments organizations, BAs often produce detailed feature requirements independently of any SDD tool: field mapping spreadsheets, business rule matrices, sample ISO 20022 payloads (pain.001, pain.008, pacs.008), regulatory constraint documents, and workflow diagrams. These artifacts are the raw material that explore turns into actionable specs.

Rather than asking the AI to invent requirements from scratch, you feed it the BA's work:

```
You: /opsx:explore

AI:  What would you like to explore?

You: Our BA has written up requirements for adding SEPA Instant 
     Credit Transfers. I'm attaching their document which 
     includes the field mappings from our internal format to 
     pacs.008, the business rules for amount limits and BIC 
     validation, and sample XML payloads. I need to understand 
     how this fits into our existing payment orchestration 
     layer and what the technical implications are before we 
     spec the implementation.

AI:  I've reviewed the BA requirements document. Let me walk 
     through the key integration points...
     [Maps BA requirements against existing codebase, identifies 
      gaps, flags technical decisions that need to be made]
```

The explore phase becomes a bridge between the BA's domain knowledge and the engineering reality of the codebase. The BA doesn't need to know about your GenServer architecture or your Ecto schema conventions. The developer doesn't need to memorize the ISO 20022 payload structure. Explore lets both perspectives converge into a proposal that reflects both business intent and technical feasibility.

When you've reached clarity, you transition naturally into the structured workflow:

```
You: OK, the main complexity is in the real-time settlement 
     confirmation flow. The BA's field mappings look solid 
     but we need to add timeout handling for the 10 second 
     SCT Inst window. Let's spec that.

You: /opsx:new add-sepa-instant-credit-transfers

AI:  Created openspec/changes/add-sepa-instant-credit-transfers/
     Ready to create: proposal
```

Now the proposal and specs will be grounded in both the BA's requirements and the technical understanding you built during exploration, rather than being generated from a one line prompt.

**When to use which:**

Use `/opsx:new` when you can describe the feature or fix in a sentence and you're confident in the scope. Use `/opsx:explore` when any of the following are true: you're unsure what the root cause of a problem is, the requirements are ambiguous or underspecified, you need to evaluate multiple approaches before committing to one, or you want to pressure test an idea before investing in formal planning. In practice, we find ourselves using explore more often than we initially expected. The few minutes spent thinking before speccing consistently produce better specs, which in turn produce better code.

### The Artifact Lifecycle

When you run `/opsx:new add-idempotent-refunds`, OpenSpec creates a change directory:

```
openspec/changes/add-idempotent-refunds/
├── .openspec.yaml          # Metadata: change name, status, timestamps
└── (ready for artifacts)
```

Running `/opsx:ff` (or stepping through with `/opsx:continue`) generates the planning artifacts:

```
openspec/changes/add-idempotent-refunds/
├── .openspec.yaml
├── proposal.md             # Why we're doing this, what's changing, scope
├── specs/                  # Requirements and scenarios (the spec delta)
│   └── refunds/
│       └── spec.md         # Functional requirements with ADDED/MODIFIED/REMOVED markers
├── design.md               # Technical approach, data model, component structure
└── tasks.md                # Ordered implementation checklist
```

Each of these artifacts has a specific purpose and a specific audience. Let's look at what goes into them.

**proposal.md** is the "why" document. It describes the motivation for the change, the scope of what's included and excluded, and any constraints or dependencies. This is the document you'd share in a planning meeting or attach to a ticket. It answers the question: "Why are we doing this, and what does 'done' look like at a high level?" For a refunds feature, this might capture that the driver is duplicate refund incidents costing the business money, that the scope includes full and partial refunds but excludes chargebacks, and that the constraint is backwards compatibility with the existing refund API contract.

**specs/** contains the spec delta, the functional requirements for this specific change. Requirements are marked as `ADDED`, `MODIFIED`, or `REMOVED` relative to the current system. Each requirement uses structured language ("The system SHALL...") with clear acceptance criteria and scenarios. This is where edge cases live. This is where you define what happens when a refund is submitted with the same idempotency key as a previous request, what the system does when the gateway returns a timeout mid refund, or how partial refunds interact with the original transaction's settlement status.

**design.md** is the technical blueprint. It covers the data model, API contracts, component architecture, sequence flows, and any technology choices specific to this feature. For the refunds example, it's where you'd document the idempotency key storage strategy, the state machine transitions for refund lifecycle, and the gateway adapter interface for multi acquirer support.

**tasks.md** breaks the work into discrete, ordered implementation steps. Each task is small enough to verify independently, ideally something that can be implemented in under 30 minutes. Tasks have clear completion criteria so both the developer and the AI know when they're done.

### What Happens at Archive

When all tasks are complete and verified, `/opsx:archive` does something important: it merges the spec deltas from the change back into the main `openspec/specs/` directory. The change folder moves to `openspec/changes/archive/`, preserving the history. The main specs now reflect the updated state of the system.

This is the mechanism that turns specs into a living document. After a dozen features have been built and archived, `openspec/specs/` contains a comprehensive, up to date description of what the system does. Not what it was designed to do originally, but what it actually does right now.

* * *

## Who Benefits: SDD Across Roles

One of the underappreciated aspects of spec driven development is that the artifacts aren't just for the developer writing the code. They create value across every role that touches the project.

### For Developers

The immediate benefit is implementation quality. Instead of translating a vague Jira ticket into code via a series of increasingly frustrated prompts, you're working from a spec that already captures requirements, edge cases, and technical decisions. The AI produces better code because it has better context. You spend less time debugging and reworking because misunderstandings surface during spec review, not during code review.

The longer term benefit is onboarding and maintenance. When you come back to a feature six months later, or when a new developer joins the team, the spec explains not just what the code does but _why_ it was built that way. The proposal captures the business motivation. The design doc captures the technical rationale. The spec captures the behavioral contract.

### For Business Analysts and Product Managers

The proposal and spec artifacts are written in structured natural language, not code. A BA or PM can read `proposal.md` and immediately understand the scope, motivation, and acceptance criteria for a change without needing to parse a pull request.

More importantly, they can contribute to these documents. If the spec says "The system SHALL retry failed direct debit collections up to 3 times" and the BA knows the scheme rules mandate a maximum of 2 retries with specific interval requirements, they can flag that in the spec before any code is written. The spec becomes a shared contract between product and engineering, reviewable by both sides.

BAs in payments organizations often produce detailed requirements documents that exist outside of any development tool: field mapping spreadsheets between internal formats and ISO 20022 messages, business rule matrices for transaction routing, sample payloads for pain.001 or pacs.008 messages, regulatory constraint documents, and scheme specific validation rules. These documents don't need to be rewritten into OpenSpec format. Instead, they serve as input to the `/opsx:explore` conversation and as reference material that the proposal and specs can point to. The spec might say "Field mappings follow the BA's pain.008 mapping document (see docs/ba-requirements/sepa-dd-field-mappings.xlsx)" rather than duplicating that content. OpenSpec captures the engineering requirements; the BA's documents capture the domain requirements. The two reference each other.

For teams practicing any kind of requirements analysis, the spec delta format (ADDED/MODIFIED/REMOVED) maps naturally to how BAs think about change impact. You can see at a glance exactly what existing behavior is changing and what's new.

### For QA Engineers

The specs are essentially test plans waiting to happen. Each requirement with its acceptance criteria maps directly to test cases. "WHEN a refund is submitted with an idempotency key matching a previously completed refund, THEN the system SHALL return the original refund response without processing a duplicate" is a test case in all but name.

QA can review specs before implementation begins, catching gaps in test coverage at the cheapest possible point in the development cycle. In payments, where edge cases around timeouts, partial failures, and concurrent operations are where bugs hide, having QA eyes on the spec early is especially valuable. They can also use specs to verify completeness: does the implementation actually cover every scenario in the spec? OpenSpec's `/opsx:verify` command automates part of this check, but human QA review of the spec itself is where the real value lies.

### For Tech Leads and Principal Engineers

The design document is where architectural oversight happens. A principal can review `design.md` to ensure the proposed approach fits the system's overall architecture, without needing to wait for a code review to discover that someone introduced a new database table that duplicates an existing one, or bypassed the payment gateway abstraction layer by calling the acquirer API directly.

The proposal document is equally valuable at this level. It provides enough context to make prioritization decisions, estimate impact on downstream systems like settlement and reconciliation, and flag dependencies before work begins.

For organizations running architecture review boards or design review processes, OpenSpec artifacts slot directly into those workflows. The artifacts are markdown in version control, which means they can be reviewed through the same pull request process as code.

### For the Whole Team

The `openspec/specs/` directory, the living spec that accumulates as changes are archived, becomes something like institutional memory for the project. It captures not just the current state of the system but the evolution of requirements over time. New team members can browse the specs to understand the system. Archived changes provide an audit trail of what changed, when, and why.

This is especially valuable for distributed teams where not everyone is in every meeting. The spec is always available, always current, and always in the repo.

* * *

## Bridging BA Requirements and Engineering Specs

In most payments organizations, business analysts produce detailed requirements documents long before any developer opens an IDE. These documents are the product of weeks of domain analysis: field mapping spreadsheets that map internal data structures to ISO 20022 message formats like pain.001 or pacs.008, business rule matrices that define transaction routing logic, validation rules derived from scheme specifications, sample XML payloads, regulatory constraint summaries, and workflow diagrams for processes like mandate lifecycle management or chargeback dispute flows.

These artifacts are enormously valuable. They represent concentrated domain knowledge that no AI model has in its training data. But they exist outside of any development tool, usually in Confluence pages, shared drives, or Excel files. The question is: where do they plug into the SDD workflow?

The answer is `/opsx:explore`.

Rather than asking the AI to invent payment domain requirements from scratch (which it will get wrong in subtle, dangerous ways), you feed the BA's existing documents into the explore conversation. The AI reads the BA's field mappings, business rules, and sample payloads, then maps them against your actual codebase. The explore conversation becomes a structured dialogue about feasibility: which business rules can be implemented directly, which ones require architectural changes, where the BA's requirements conflict with existing behavior, and what edge cases the BA may not have considered from a technical perspective.

```
You: /opsx:explore

AI:  What would you like to explore?

You: The BA team has finalized requirements for adding SEPA 
     Direct Debit collections. I'm attaching their document 
     which includes the pain.008 field mappings from our 
     internal mandate format, the business rules for collection 
     timing windows, the R-transaction handling matrix (AM04, 
     MS02, MD01 etc.), and sample XML for both first and 
     recurring collections. I need to understand what this 
     means for our payment orchestration layer before we plan 
     the implementation.

AI:  I've reviewed the BA's requirements. Let me walk through 
     the integration points with your existing codebase...
     
     Your mandate schema already covers most of the creditor 
     reference fields, but the BA's mapping requires three 
     additional fields for the CreditorSchemeIdentification 
     that aren't in your current model...
     
     The R-transaction handling matrix defines 12 reason codes 
     but your existing rejection handler only supports 4 
     generic rejection states. This will need a more granular 
     status model...
```

This conversation might reveal that 70% of the BA's requirements map cleanly to existing patterns and 30% require new design decisions. Those design decisions then flow into the proposal and spec with full context, rather than being invented by the AI from a one sentence prompt.

The key principle: **the BA's documents are input to the spec, not replaced by it.** The OpenSpec proposal can reference them directly ("Field mappings follow the BA's pain.008 mapping document, see docs/ba-requirements/sepa-dd-field-mappings.xlsx"). The spec captures the engineering interpretation of business requirements, while the BA's artifacts remain the authoritative source for domain rules. The two complement each other.

For teams with a strong BA function, this workflow turns explore into the most valuable step in the entire process. It's where domain expertise meets technical reality, and where misunderstandings between product and engineering get caught before they become expensive.

* * *

## Beyond Epics and User Stories

For years, the standard way to decompose work in software organizations has been the Agile hierarchy: Epics break into Features, Features break into User Stories, User Stories break into Tasks. Each layer adds structure, and each layer adds overhead. Grooming sessions to refine stories. Estimation ceremonies to assign points. Sprint planning to negotiate what fits. Story splitting when something is "too big." Acceptance criteria written in Given/When/Then format.

This process was designed for a world where humans wrote every line of code, and work needed to be decomposed into pieces small enough for one developer to complete in a sprint. The granularity served a coordination function: if three developers are working on the same feature in parallel, you need clearly bounded units of work to avoid stepping on each other.

With AI agents handling the bulk of code generation, developers now work in significantly larger chunks. A feature that would have been split into 8 user stories with 24 tasks can be described as a single spec and implemented in one session. The AI doesn't need two week sprints to context switch between stories. It doesn't need story points to estimate effort. It doesn't care whether a unit of work is a 3 or a 5. It needs a clear description of what to build and enough context to build it correctly.

The overhead of the old hierarchy was always significant. Ceremonies consume 15-30% of a team's time. The BA writes detailed requirements and translates them into epics and stories. The tech lead estimates them. The developer re-interprets them during implementation. Each translation step is an opportunity for information loss.

SDD collapses this. Instead of an Epic with 5 Features containing 20 User Stories containing 60 Tasks, you have a proposal that captures the business intent, a spec that defines the requirements, a design that describes the technical approach, and a task list that the AI executes against. The entire chain from "why are we doing this" to "what code gets written" lives in one change folder, reviewable as a single unit. There's no translation loss and the spec is the shared artifact that all of those roles read, review, and contribute to.

This doesn't mean you abandon planning. It means the unit of planning shifts from "what can one developer finish in two days" to "what is the next coherent change to the system." That change might be small (fix a settlement rounding error) or large (add multi currency support). The spec scales to fit either. And because the AI generates the task breakdown from the spec, you don't need to spend planning meetings debating granularity. The tasks exist to guide the AI's implementation, not to fill a sprint board.

SDD offers a natural landing spot for a switch to AI-first development. You keep the parts that matter (clear requirements, technical review, incremental delivery) and shed the parts that were only ever coordination scaffolding.

* * *

## A Practical Workflow: Adding Multi Currency Settlement to a Payment Engine

Let's walk through a concrete example using OpenSpec to add multi currency settlement support to a payment processing platform.

**Step 1: Explore (optional but useful)**

If the requirements aren't fully clear, or if you have BA created documents that need to be digested before planning, start with exploration:

```
You: /opsx:explore
AI:  What would you like to explore?

You: We need to support settlement in multiple currencies. 
     Right now everything settles in the merchant's home 
     currency, but we're onboarding merchants in the EU who 
     need EUR settlement even when the cardholder pays in GBP.
     I've attached the BA's requirements document which includes 
     the field mappings, currency pair rules, and the regulatory 
     constraints for cross border settlement. I need to 
     understand how this fits into our existing reconciliation 
     pipeline and whether our current batch architecture can 
     handle currency grouping.

AI:  I've reviewed the BA requirements document. Let me map 
     these against your existing settlement pipeline...
     [Analyzes BA requirements against codebase, identifies 
      integration points, flags technical decisions needed]
```

This step is for thinking, not committing. No change folder is created yet.

**Step 2: Create the change**

```
You: /opsx:new add-multi-currency-settlement

AI:  Created openspec/changes/add-multi-currency-settlement/
     Ready to create: proposal
```

**Step 3: Generate planning artifacts**

If you have a clear picture of what to build, fast forward through all planning stages:

```
You: /opsx:ff

AI:  Creating all planning artifacts...
     ✓ proposal.md
     ✓ specs/
     ✓ design.md
     ✓ tasks.md
     Ready for implementation!
```

Alternatively, use `/opsx:continue` to step through one phase at a time, reviewing and refining each artifact before moving to the next.

**Step 4: Review and refine the artifacts**

This is the most important step. Read the generated proposal, specs, and design. Push back on anything that doesn't match your intent:

```
You: The design proposes fetching FX rates at settlement time. 
     We need to lock the rate at authorization and store it on 
     the transaction record. Also the spec is missing the 
     requirement that settlement files must include both the 
     original transaction currency and the settlement currency.

AI:  I'll update design.md to lock FX rates at authorization 
     and add the dual currency settlement file requirement 
     to the spec.
     [Updates artifacts]
```

**Step 5: Implement**

```
You: /opsx:apply

AI:  Working through tasks...
     ✓ 1.1 Add fx_rate and settlement_currency to transactions schema
     ✓ 1.2 Create FX rate locking module with gateway adapter
     ✓ 1.3 Update authorization flow to capture and persist rate
     ✓ 2.1 Modify settlement batch builder for multi currency grouping
     ✓ 2.2 Update reconciliation to match on settlement currency
     ✓ 2.3 Add settlement file format with dual currency columns
     All tasks complete!
```

**Step 6: Verify**

```
You: /opsx:verify

AI:  Checking implementation against artifacts...
     ✓ All requirements covered
     ✓ Design patterns followed
     ✓ All tasks marked complete
     ⚠ Spec mentions "handle rate expiration gracefully" but 
       current implementation raises an unhandled error when 
       the cached rate is older than 30 minutes. Consider a 
       re-fetch with merchant notification.
```

**Step 7: Archive**

```
You: /opsx:archive

AI:  ✓ Merged specs into openspec/specs/
     ✓ Archived to openspec/changes/archive/2026-02-24-add-multi-currency-settlement/
     Specs updated. Ready for the next feature.
```

### Handling Interrupts and Stopping Mid Implementation

Real work isn't linear. OpenSpec handles context switches gracefully because your plan lives in the artifacts, not in the AI's memory.

One important detail: during `/opsx:apply`, you can stop the AI at any point while monitoring its output. If you see it heading in the wrong direction on task 1.3, you stop it, correct course, and resume. The task list in `tasks.md` tracks what's been completed, so nothing about your plan is lost. This is fundamentally different from vibe coding, where stopping mid stream means losing context and hoping you can reconstruct where you were.

The same principle applies to bigger interrupts. You can pause an entire feature to handle something urgent:

```
You: I'm working on multi-currency-settlement but we have an 
     urgent issue: the nightly batch is double-settling some 
     transactions.

You: /opsx:new fix-duplicate-settlement-batch

AI:  Created openspec/changes/fix-duplicate-settlement-batch/

You: /opsx:ff
     [Plans the fix]

You: /opsx:apply
     [Implements the fix]

You: /opsx:archive
     ✓ Archived fix-duplicate-settlement-batch

You: Let's get back to multi currency settlement.

You: /opsx:apply add-multi-currency-settlement
AI:  Resuming add-multi-currency-settlement...
     Picking up at task 2.2: Update reconciliation to match 
     on settlement currency...
```

The multi currency feature picks up exactly where it left off. The artifacts held the plan while you were away, whether that was five minutes or five days.

* * *

## When NOT to Use Spec Driven Development

SDD is not appropriate in all cases. Here are some cases where the overhead isn't worth it:

**Quick bug fixes.** If you know exactly what's wrong and the fix is a one line change to a gateway timeout value, writing a spec is like filing a building permit to hang a picture frame. Just fix it.

**Exploratory prototyping.** When you're trying to figure out _what_ to build, not how to build it, specs slow you down. Vibe coding is genuinely great for rapid exploration. If you're prototyping a new merchant dashboard layout to see what feels right, just build it iteratively.

**Highly visual or interactive work.** SDD tools are text based. If your feature is primarily about UI layout, animation, or interaction design, you'll spend more time describing the visual result in markdown than you'd spend just building it with visual feedback (though pairing SDD with TideWave can work wonders for UI work).

**Trivial features.** Updating an error message string, renaming a config key, bumping a dependency version. These don't need a spec. Use your judgment about the complexity threshold.

**Rapidly changing requirements.** If you're in a phase where the payment scheme keeps revising the spec and requirements shift weekly, maintaining your own specs becomes overhead that fights against your pace. Get to stability first, then spec the features that need to stick.

The general rule: **if you can hold the entire change in your head and verify it by looking at it, you probably don't need a spec.** If the change involves multiple files, multiple concerns, or behavior you can't verify visually, a spec starts paying for itself.

* * *

## What to Watch Out For

Having used these tools and studied the experiences of others, here are the traps:

**Spec bloat.** The AI loves to generate exhaustive specifications. A feature that would take you 30 minutes to implement can produce 800+ lines of markdown. You have to be disciplined about trimming specs to what's actually useful. If you're not reading the spec carefully, it's worse than not having one because you'll have false confidence that edge cases are covered when they're not.

**The waterfall trap.** SDD can slide into big design up front if you're not careful and start bundling many features into one spec. If changing the spec feels expensive or bureaucratic, you've over formalized. OpenSpec's fluid workflow helps here since there are no phase gates, but you still need the discipline to keep specs lightweight enough to throw away and rewrite if you find yourself going down the wrong path.

**Spec drift.** The spec says one thing; the code does another. This happens when you make implementation fixes outside the spec workflow. Either update the spec when you deviate, or accept that the spec is aspirational rather than authoritative. OpenSpec's `/opsx:sync` command can help keep specs aligned during long running changes.

**The AI ignores its own spec.** This is a real and documented problem. Context windows are larger, but that doesn't mean the AI attends to everything in them equally. People have reported that AI agents generate code that contradicts the spec they just wrote, creating duplicate classes, ignoring constraints, or implementing patterns the spec explicitly avoided. The `/opsx:verify` step exists specifically to catch this.

**Review fatigue.** SDD adds a new category of artifact to review. You're now reviewing specs AND code. If your team doesn't value spec review as highly as code review, specs become rubber stamped documents that provide an illusion of rigour.

**Over application to small changes.** The tooling doesn't scale down well. Applying the full SDD workflow to a minor feature creates overhead that dwarfs the implementation time. You need a personal threshold for when to spec and when to just build.

* * *

## The Waterfall Question

Every discussion of SDD eventually arrives at the same question: isn't this just waterfall with better marketing?

The comparison is fair to raise and unfair to leave unexamined. Traditional waterfall failed because of long feedback loops: months of design, months of implementation, and discovery at the end that the design didn't match reality. The feedback cycle was measured in quarters.

SDD, practiced well, has feedback cycles measured in minutes to hours. You write a spec for a single feature, not an entire system. You review the generated design before implementation starts. You implement in small, verifiable tasks. And critically, changing the spec and regenerating is cheap. The whole point is that code is a derived artifact you can throw away and recreate.

SDD can slide into waterfall like rigidity if you treat specs as immutable, if the spec writing phase becomes its own bottleneck, or if you use SDD as a substitute for iterative discovery. As Gojko Adzic observed, the movement builds on solid intent-first ideas but could reintroduce rigidity if practitioners aren't thoughtful about it.

The Thoughtworks perspective captures the nuance well: the problems of vibe coding come from being too fast, spontaneous, and haphazard, while the problems of waterfall come from being too slow, rigid, and disconnected from reality. SDD, when practiced well, occupies the middle ground. It provides a mechanism for shorter and more effective feedback loops than either extreme.

The honest answer is that SDD sits on a spectrum. At one end, you have "spec as lightweight sketch," a quick outline that gives the AI direction without constraining it. At the other end, you have "spec as source of truth," a comprehensive document that the code must conform to. OpenSpec's fluid approach leans toward the lighter end of that spectrum, which is why it appeals to teams who want discipline without ceremony.

* * *

## Pros and Cons

### What SDD Gives You

**Reduced rework.** Catching misunderstandings at the spec level is dramatically cheaper than catching them in code. When a BA's field mapping is wrong, you want to discover that while reviewing a proposal, not while debugging a failed settlement file at 2 AM.

**Persistent context.** Specs survive session boundaries, tool switches, and team changes. Six months from now, when someone asks why the FX rate locking works the way it does, the spec and its proposal explain both the what and the why.

**Reviewable intent across roles.** You can review a spec without reading any code. Product managers, BAs, QA, and principals can participate in spec review and catch requirement gaps before implementation begins. In a payments context, this means compliance can review the spec for regulatory alignment without needing to read Elixir.

### What SDD Costs You

**Time upfront.** Writing and reviewing specs takes time that vibe coding doesn't require. For simple tasks, this overhead is pure cost with minimal benefit.

**False precision.** Detailed specs can create an illusion of completeness. Just because the spec covers edge cases on paper doesn't mean the AI will implement them correctly. You still need to test.

**Tool immaturity.** These tools are all early stage. Expect rough edges, breaking changes, and workflow gaps. The ecosystem is moving fast, which means today's best practices may be obsolete in six months.

* * *

## Where This Is Heading

Spec driven development is less than a year old as a named practice, and the tooling is evolving fast. The fundamental insight, that AI agents produce better code when given structured intent rather than ad hoc prompts, seems durable even if the specific tools don't survive.

What's interesting is the convergence. BDD (Behavior Driven Development), TDD (Test Driven Development), and now SDD all share the same DNA: define the desired behavior before writing the implementation. SDD is that idea adapted for a world where the implementer is an AI agent rather than a human developer.

The open question is whether specs will remain the domain of dedicated tools, or whether this discipline gets absorbed into the AI coding tools themselves. We're already seeing Cursor, Claude Code, and Copilot add planning and multi step reasoning capabilities that accomplish some of what SDD tools do, without the explicit spec writing step.

For now, the practical takeaway is simple: if you're doing anything more complex than a quick prototype with AI coding tools, some form of structured planning, whether you call it SDD or just "thinking before prompting," will produce better results than vibing your way through it. The tools can help enforce that discipline, but the discipline itself is what matters.

The spec isn't the point. The thinking is.
