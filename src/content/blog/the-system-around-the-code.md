---
title: "The system around the code"
date: 2026-10-02T15:34Z
---

You've seen the demos. Someone spent an afternoon romancing Claude and built the thing the business has been asking about for years. Everyone is impressed and can feel the possibilities unlock, looks are exchanged, this feels like a game-changer and that we're now living in a different world. You might even be thinking about what to build next. As the applause dies down, some poor soul scarred by years of broken promises squeaks, "When can it go live?". You can feel the mood deflate, because that's when all the things that have little to do with the code start draining the enthusiasm in the room, replacing it with familiar dread. The truth is that the next step in getting this shiny new thing out the door has little to do with code itself, but the system around the code. Much of this post is dedicated to the components and structure of that system, and how AI will either twist the knife or heal the pain.

![system-around-the-code](/images/system-around-the-code.webp)

But first, an important demarcation is in order. In July 2025, Jason Lemkin of SaaStr spent what he called ["nine mad days of us vibe coding"](https://www.saastr.com/replits-new-release-address-most-of-the-challenges-we-hit-vibe-coding-but-is-prosumer-vibe-coding-really-ready-for-commercial-apps-yet/) on Replit. On day nine, tired and looking like Tom Hanks from Cast Away, he proclaimed that the agent deleted a production database despite many instructions pleading in all caps and exclamation marks. He called it ["unacceptable and should never be possible"](https://x.com/amasad/status/1946986468586721478), and with tired eyes and a depleted soul, shipped a fix. It wasn't a code fix but something trivial. He ensured that development and production configurations are isolated, and you can't access production while in development.

This incident was incorrectly framed as an "AI problem" when the solution was to conform to basic engineering hygiene. It highlighted the difference between running single-user apps and running production systems which people depend on. It also illustrates the first habit of systems thinking, which is to stop explaining events by the actor closest to them. The agent was the actor. The structure, two environments sharing one credential, was the cause. Blame the agent and you'll fix nothing, fix the structure and the next agent won't repeat the same mistake.

Andrej Karpathy, who coined "vibe coding" and gave birth to a billion software engineers overnight, drew the boundary himself in the [original tweet](https://x.com/karpathy/status/1886192184808149383). "I 'Accept All' always, I don't read the diffs anymore... It's not too bad for throwaway weekend projects", he said, calmly merging six PRs while making himself a margarita, which also happened to merge a PR.

Simon Willison [added the other half](https://simonwillison.net/2025/Mar/19/vibe-coding/): "if you reviewed it, tested it thoroughly and can explain how it works to someone else, that's not vibe coding, that's software development". One can only presume the word 'BOOM! Mic Drop' clanged in his head as he laid down the gauntlet of what is and isn't software engineering.

Socrates and Ibn Sina step aside, our new thought leaders have stumbled onto something, if not profound, then at least self-evident. These are two fundamentally different paradigms of developing software, and much of the hype around AI comes from the first one, but all your organization's risk and concerns are in the second category of work. That's where our focus today will be.

Before we go any further, let's also address some party poopers. There's a popular argument right now that software engineering itself is dying. [The paper making the rounds](https://arxiv.org/html/2606.05608v1) says engineers used to "decompose problems, encode decision logic into static code, and manually adapt that code as requirements evolve", and that agents dissolve all three. It's right about the code. Code is becoming cheap and disposable, and for one-shot tasks the bottleneck really has moved to stating intent clearly. But "encoding decision logic into static code" describes programming, not engineering. Engineering was always the part around it: data that has to survive, contracts with other systems, money moving, security, compliance, deployments, monitoring, and of course, the pager at 3am.

Most of the work we ever did was on code that we didn't write. Legacy systems, vendor SDKs, integrating another team's work, and now you can add another source of that code: agent output. Robert Glass put maintenance at [40 to 80 percent of software cost](https://www.ybrikman.com/blog/2017/03/30/facts-and-fallacies-of-software-engineering/), and maintaining existing code as the dominant activity within it. That hasn't changed, but the source and volume of that code has. I make this distinction because in a fast-moving world, it's important to not lose sight of the constants.

The paper's own numbers concede the point. Agent success drops from over 80% on isolated tasks to at most 38% once the software has to keep evolving, and the author lists the remaining human roles as intent articulation, architectural oversight, quality calibration and governance. Those remaining roles sure like like they're describing software engineering. Putting it crudely, AI ends the era of engineering-as-typing and makes engineering-as-productionizing more valuable, because there is now far more code to productionize. And I'm not devaluing the work by just using the word "typing" - I myself am such a poor soul, and have even scanned Craigslist for plumber training, in the event I need to rescue a plane or two.

So, AI has mostly solved typing the code. The job now is building a reliable and predictable system around the code such as the pipeline, the guardrails, the review, the docs, the team shape and the way people learn. It's beneficial to think of things not as AI-first, but System-first.

In any system, we must understand constants to ground ourselves, so I'll cover three things that didn't change with AI (the first explains the other two). Then I'll cover moves many organizations are making, and why they are stalling. Then the uncomfortable truth that the "AI SDLC" you're looking for isn't a product or process you can adopt, but a set of components you have to fit to your organization. No silver-bullets, only hard work. I then cover what those components are, from the pipeline outward to the people, and how to reason about them in an AI transition. Then comes Day 1, for reasons that will be obvious by then.

## Part I: Ground truth

### 1\. Structure produces behavior

Peter Senge's [The Fifth Discipline](https://www.goodreads.com/book/show/255127.The_Fifth_Discipline) emphasizes that the behaviour you see in an organization is produced by its structure, meaning the feedback loops, the delays and the accumulations in it, and not by the people or the events you happen to be looking at. Put different people into the same structure and you get the same behaviour. Senge offers three levels of explanation for anything that goes wrong.

1.  Events ("the agent deleted the database", "the demo was amazing") are the shallowest.
2.  Patterns of behavior ("every AI rollout spikes then dips") are better.
3.  Structure ("review capacity is fixed while PR volume is elastic") is the only level where you can actually change anything.

Most AI commentary lives at the event level, but it's dangerous to make strategic decisions based on events. They have to be made with the structure in mind.

The most familiar structural rule is Goldratt's: throughput is set by the slowest step in the whole chain, not the fastest. The rule in [The Goal](https://www.goodreads.com/en/book/show/113934.The_Goal) is that an hour gained at a non-bottleneck is an hour gained on paper. Agents producing five times the PRs changes nothing if the constraint sits in a platform team you don't own, the security review board, product and design that can't write specs fast enough, or a human review queue that isn't moving because only two people are trusted to review code, and those two people don't trust anyone, maybe not even each other.

![constraint-moves](/images/constraint-moves.webp)

AI-generated dashboards are happy to report success indicating nothing of import. The feature team's sprint board emptying and a glorious demo does not move the company's lead time. [Faros AI's data across 10,000 developers](https://www.faros.ai/blog/ai-software-engineering) shows high-AI teams merging 98% more PRs while review time rises 91%. The constraint simply moved, one part of the system got faster and the other slower, while the output didn't change. So what exactly is there to celebrate besides getting to the red light faster?

Senge calls that Faros pattern Limits to Growth, and it has two loops. A growth loop: adoption produces output, output produces visible wins, wins produce more adoption. And a brake: output fills a queue, the queue slows merges, slow merges erode the wins. The brake was there all along but didn't bite until the growth loop got going. The instinct when growth stalls is to push the growth loop harder, with more licences, more agents, more mandates. The leverage is always in the brake, which here is review capacity.

![limits-to-growth](/images/limits-to-growth.webp)

The five focusing steps from Goldratt's The Goal still apply.

1.  Identify the constraint
2.  Exploit it
3.  Subordinate everything else to it
4.  Elevate it
5.  Repeat

Subordinating is the counterintuitive one as your fast agent loop should idle when review or platform can't absorb its output. Anyone who has read [The Phoenix Project](https://www.goodreads.com/en/book/show/17255186-the-phoenix-project) knows Brent, the one engineer every change waits on. Brent is now every organization's senior engineer. Before you buy more tokens, find your Brent (it may not be a human), and measure the system (lead time, change failure rate, time in review), not the team. A team metric that improves while the system metric doesn't is the signature of a local optimum.

Three more of Senge's laws show up repeatedly below.

1.  The harder you push, the harder the system pushes back (mandates and leaderboards).
2.  Behaviour grows better before it grows worse (the demo, then the dip).
3.  Cause and effect are not closely related in time and space (the platform team you don't own, the maintenance bill in year two).

If you remember nothing else from this post, remember that every stalled AI strategy is one of these laws in action, and not a tooling problem.

### 2\. It's the best time to build software

Engineers and builders should be excited because the cost of trying out an idea has collapsed. Prototypes and spikes that took weeks take hours and tedious work like migrations, infrastructure management, test scaffolding are automated. The friction in solving problems has reduced, and we've gone from typing to deciding, specifying and verifying. We're able to build software and solve problems at a breakneck pace, and see our ideas come to life in hours rather than months. Whether it be personal annoyances solved using a vibe-coded app, new features in enterprise apps, or paying down technical debt by taking on those previously-feared refactoring tasks, we can now solve many more problems while auditioning many types of solutions. [People like](https://www.ted.com/talks/dan_pink_the_puzzle_of_motivation) to work on solving meaningful problems, improve their skill set, and be able to experiment independently.

People have heard the counter-evidence to this, so let's tackle some of it. [METR's 2025 study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) had 16 experienced open-source developers take 19% longer with AI tools. They expected to be 24% faster going in, and even believed they had been 20% faster but the numbers showed otherwise. That perception gap is why "measure, don't trust vibes" comes up throughout this post. But METR also noted they couldn't rule out learning effects beyond 50 hours of tool use, and their [2026 follow-up](https://metr.org/blog/2026-02-24-uplift-update/) says developers are "likely more sped up" now. [DORA 2025](https://services.google.com/fh/files/misc/2025_state_of_ai_assisted_software_development.pdf) found AI adoption now improves delivery throughput, a reversal from the year before. [Google's internal trial](https://arxiv.org/abs/2410.12944) of 96 engineers came in around 21% faster on an enterprise task.

![better-before-worse](/images/better-before-worse.webp)

Put those studies on one timeline and you get the shape Senge warned about: better before worse. The demo is the better. The 19% dip is the worse, and it's a learning curve of working with LLMs, especially with models that would now be considered sub-par (Sonnet 3.5 anyone?). The dip is also when it's tempting for organizations to make decisions. Organizations that fund the systemic and structural ramp-up through the dip get the payoff on the far side. Organizations that hand out licences and wait stay on the slow part of the curve, conclude "we tried AI", and then wonder why the needle on value-delivery hasn't moved. You can't buy your way past the learning curve, but you can climb it faster.

### 3\. Design, discipline and decomposition

The most valuable skill may just be breaking work into small, verifiable pieces, which is the same skill great engineers always had. For years we've been telling PMs and Business Analysts to write smaller stories and create lean MVPs. We want testers to think end-to-end, want developers to focus on tracer bullets and strive for small low-risk deployments. None of that has changed. Agents succeed on clear, bounded changes and trip up on "build the feature" type work. Small batches, tests, version control and clear interfaces were best practice before AI. Now they are a prerequisite of whether AI can help at all. [DORA says](https://services.google.com/fh/files/misc/2025_state_of_ai_assisted_software_development.pdf) that "with a high degree of certainty, we found that AI adoption's positive benefits depend on teams working in small batches." [Karpathy's own instruction](https://x.com/karpathy/status/1915581920022585597) for code he professionally cares about is to "describe the next single, concrete incremental change". Kent Beck's [augmented coding prompt](https://newsletter.kentbeck.com/p/augmented-coding-beyond-the-vibes) is "find the next unmarked test in plan.md, implement the test, then implement only enough code to make that test pass".

None of this is new, and this was best articulated in [Reinertsen's 2009 work on product development flow](https://innolution.com/blog/limiting-work-in-process-wip-and-having-small-batches-is-antifragile): "Reducing batch size reduces cycle time". His argument is that small batches cut queues, cycle time, variability, and feedback delay, and that you get these gains without giving up capacity.

Design principles used to be about taste, long-term maintainability, high-minded pub talk at conferences, mostly focused around either ripping or loving TDD. With agents these become operating prerequisites, because an agent's working memory is small and it takes everything literally. As an example:

| Principle | Why it matters more with agents |
| --- | --- |
| Deep modules, small interfaces | The agent loads the interface, not the implementation. Less context spent, better recall. |
| Single responsibility | One reason to change means one place to look and one place to verify. The agent can't wander. |
| DRY | Duplicates confuse agent decisions. An agent edits one copy and misses the siblings. [GitClear](https://www.gitclear.com/ai_assistant_code_quality_2025_research) measured copy/paste rising from 8.3% to 12.3% of changed lines while refactoring fell under 10%. |
| MECE task breakdown | Overlapping tasks make parallel agents redo each other's work; gaps leave work undone. Anthropic's [multi-agent write-up](https://www.anthropic.com/engineering/multi-agent-research-system) describes exactly this failure. |
| Clear seams, testable interfaces | The interface is the test surface and gives the agent something to check itself against, rather than getting bogged down in implementation details when black-box testing. |

One little caveat I'd like to add because it's bit me is to not turn single responsibility into "many tiny files". Ousterhout has [warned for years](https://newsletter.pragmaticengineer.com/p/the-philosophy-of-software-design) that over-splitting creates shallow modules, and that's worse for humans and agents alike ([my conversation with the great man](https://www.youtube.com/watch?v=bopwQ_YV06g)). The goal is deep modules with small interfaces. Design quality used to be a long-term bet while you fantasized about how a future team would thank you for the amazing code you had written, and how they have a poster of you as their desktop background. Now it pays back the next day as part of agent success rate metrics.

In structural terms, design quality is the delay between a decision and its consequence collapsing from years to hours, which is Senge's "cause and effect are distant" law working in your favour.

## Part II: The quest

### 4\. The strategies that aren't

Here is where many organizations are right now. These are reasonable first moves under pressure to act, and I don't mean this as a list of mistakes so much as a list of starts. The problem is that each one treats AI as a purchase instead of a system redesign, and nearly all of them are the same structure.

Senge calls that structure Shifting the Burden. A symptom appears (slow delivery, no visible return on AI). There's a symptomatic fix that relieves it fast and a fundamental fix that takes longer. The symptomatic fix works just well enough to take the pressure off the fundamental one, and usually has a side effect that erodes the organization's ability to ever do the fundamental fix. The system becomes dependent on the quick fix.

![shifting-the-burden](/images/shifting-the-burden.webp)

| What CTOs are doing | Why it isn't a strategy | Archetype | What to do instead |
| --- | --- | --- | --- |
| Buy tokens and hope. Licences for everyone, wait for productivity. | A licence is not a capability. It buys the slow part of the learning curve (section 2). | Shifting the burden | Fund the ramp-up: training, lanes, loops, guardrails. |
| Usage mandates. "Use AI or else", usage in performance reviews. | Mandates measure compliance, not outcomes. People optimize for looking busy. The harder you push, the harder the system pushes back. | Fixes that fail | Mandate outcomes and give people the system that makes AI useful. |
| Token leaderboards. Rank engineers by token burn. | They measure effort, not value, and get gamed within weeks. | Fixes that fail | Measure lead time, change failure rate and product outcomes. |
| Counting PRs and lines. | More PRs with the same reviewers is a longer queue (section 11). | Limits to growth | Measure merged, working change and review wait time. |
| Pilot purgatory. Endless proofs of concept. | Pilots skip productionizing, which is the riskier part and the harder part to solve. | Shifting the burden | Pick one real workflow, redesign it end to end, ship it. |
| One hero team. A tiger team "does AI" for everyone. | Know-how stays trapped. A local optimum by construction (section 1). | Shifting the burden | Enablers who teach and move on (section 14), akin to the enablement team in the [Team Topologies](https://teamtopologies.com/key-concepts) model. |
| Tool shopping. A new agent tool every quarter. | The tool isn't the bottleneck, the system around it is. Changing tools buys you little. | Fixes that fail | Invest in what outlasts tools: specs, tests, skills, observability. |
| Headcount cuts first. Pocket the savings before the gains exist. | You cut the reviewers and context holders you now need most. This is the side-effect arrow in the diagram. | Shifting the burden | Redeploy and retrain people toward review, product and platform work. |

The numbers behind this are consistent. MIT's NANDA report found [95% of organizations getting zero return](https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf) on $30–40 billion of GenAI investment, and named the barrier as "not integration or budget, it is organizational design" (self-reported figures, 52 organizations interviewed, so treat the 95% with a grain of salt). [McKinsey](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai) (I know, I know) puts high performers at about 6%, and they are three times more likely to have fundamentally redesigned workflows. [Gartner](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027) expects over 40% of agentic AI projects cancelled by end of 2027.

The leaderboard story is my favourite because it was all the rage for a couple months despite being nonsensical. Meta burned [60 trillion tokens in 30 days](https://blog.pragmaticengineer.com/the-pulse-tokenmaxxing-as-a-weird-new-trend/), roughly $900M at list price, then scrapped its leaderboard after the memes became too much to bear.

![Pasted image 20261002094411](/images/pasted-image-20261002094411.webp)

Salesforce set minimum spend targets and engineers burned tokens to hit them. By August, [LeadDev found only 19% of engineers](https://leaddev.com/reporting/the-tokenmaxxing-hype-didnt-last-long) rated "tokenmaxxing" effective. Mandates had a similar arc. Coinbase's CEO gave engineers a week to onboard and [fired the ones who didn't](https://techcrunch.com/2025/08/22/coinbase-ceo-explains-why-he-fired-engineers-who-didnt-try-ai-immediately); John Collison's response was that it's not clear how you run an AI-coded codebase. Shopify had a more reasonable approach saying that ["reflexive AI usage is now a baseline expectation"](https://thelogic.co/briefing/shopify-staff-must-use-ai-lutke-says/), which is more aligned with my thinking.

### 5\. The AI SDLC you're looking for doesn't exist

It's tempting to long for something familiar and easy. A hope that somewhere out there is the new SDLC, and if we could just find it and adopt it the way we adopted Scrum, Kanban or SAFe (gross), we'd be in the clear. If only there was a training course, a rollout plan, or a certificate that we'd get so we could just say our AI transformation is done so we could just move on with our lives. Unfortunately, it doesn't exist, and even the big consultancies aren't pitching solutions because the ground is shifting too fast. It's almost like instead of a framework you need a core set of principles and systems thinking to guide you through the inevitable change. I wish someone had come up with something like that, maybe like 25 years ago.

I've never subscribed to the idea that buying a product or a process will solve core organizational challenges, but with AI I'm convinced that attempting to look for a process silver-bullet is going to muck things up far worse than before, because the volume of code being generated is significantly higher. In Kanban terms, Work in Process has exploded.

Scrum and SAFe were adoptable because they proposed a packaged solution for the coordination of the scarce resource of human coding time - they did it well enough for a while, and very poorly after. Ceremonies, estimation and velocity all existed (and were abused) to monitor and control it. That resource stopped being scarce so we shouldn't expect the process of old to accommodate new constraints. There is no packaged process that you can buy, because what replaces it depends on your pipeline, your codebase, your risk profile, your people, their talent levels, your need for speed, and your budget. Again, if only we had maybe a set of four values and twelve principles to help us.

What exists instead is a set of components and the real work is making them fit your organization. Roughly speaking, they are a pipeline agents can use (6), change lanes (7), scripted loops with state on disk (8), docs that hold only the why (9), standards as skills and guardrails (10), review as proof-checking (11), a pull board with the WIP limit on review (12), roles that meet in the middle (13), managers who enable (14), and a learning system per person (15). Roughly, because what customer value means to your organization is going to be different so you have to find the right fit.

That fit is critical, and "fit" is just the word organizational theorists use for what Senge calls structure. Nadler and Tushman's [congruence model](https://strategicmanagementinsight.com/tools/nadler-tushman-congruence-model/), from a 1980 paper in Organizational Dynamics that has aged better than most, says an organization performs when four things fit each other and the strategy:

1.  The work (what gets done and how)
2.  The people (skills, expectations, identity)
3.  The formal organization (structure, process, metrics, tooling)
4.  The informal organization (culture, norms, what actually gets rewarded).

Change one without considering the others, and the others will offset any benefit. That offsetting is compensating feedback, which is the mechanism behind "the harder you push, the harder the system pushes back". To make a basketball analogy, if you're going to shoot a lot of threes, you're going to concede long rebounds which fuel the opposition's transition game. If you're going to do the first thing, be prepared to deal with the second because if don't it's going to be a wash, or worse.

For example, buying tokens is a formal-org change with no work change. Mandates and leaderboards are formal-org metrics fighting the informal org. Pilot purgatory is the work changing on one team with the structure unchanged around it. Every stalled strategy is a fit failure. Here's my mapping of the components onto Nadler and Tushman's four boxes (note that they weren't writing about software):

| Box | What has to change |
| --- | --- |
| Work | Decomposition, change lanes, loops instead of chats, review as proof |
| Formal organization | Pipeline and platform, docs, guardrails and skills, the pull board, branch protection and owners |
| People | Product engineers, designers who build, managers who enable, juniors who still learn |
| Informal organization | What gets rewarded (outcomes, not tokens), safety through an identity shift, learning as a norm |

The components are cheap and familiar, but the fit is the difficult part because it depends on your organization's context, appetite for change, and goals. That's why there's no book to buy and no quick fix, only a rewiring. The diagnostic question for a CTO isn't "which tool?" but "which box hasn't moved?"

## Part III: The components, work and structure

### 6\. Writing the code is the smallest part

An AI coding tool dropped into a weak delivery system makes the system worse. DORA measured that AI adoption ["continues to have a negative relationship with software delivery stability"](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report), and their explanation is that without strong automated testing, mature version control and fast feedback loops, more change volume means more instability. Their [platform engineering finding](https://dora.dev/capabilities/platform-engineering/) is that when platform quality is high, AI's effect on organizational performance is strong and positive; when it's low, the effect is negligible. The platform is usually a dependency the team doesn't own, and the source of more pain than 10 slow engineers.

This is Limits to Growth with a twist Senge calls Growth and Underinvestment. The limit (platform capacity, CI trust, test coverage) could be raised, but raising it takes investment with a delay before it pays off. When growth stalls against the limit, performance looks mediocre, which makes the case for investing weaker, which keeps the limit where it is. "AI doesn't work well for us" becomes self-fulfilling. The only way out is to invest in the limit before the growth demands it, which looks like waste to anyone reading the event level, but wisdom if you're thinking structurally.

![growth-and-underinvestment](/images/growth-and-underinvestment.webp)

Agents need the same feedback loop as humans. They should read CI failures, logs, traces and error reports directly, not have a human paste a stack trace into a chat window. The vendors have already moved here: [Sentry](https://blog.sentry.io/yes-sentry-has-an-mcp-server-and-its-pretty-good) and [Datadog](https://www.datadoghq.com/blog/datadog-remote-mcp-server/) both ship MCP servers that hand agents issues, logs and traces, and Birgitta Böckeler's [summary of OpenAI's harness engineering work](https://www.martinfowler.com/articles/exploring-gen-ai/harness-engineering-memo.html) lists agent access to observability data as a core ingredient. Observability becomes an input to development and product, not just to operations. "Why did this break in prod?" becomes a task an agent can start on at 3am and depending on what it finds, either ship a fix or send it to the appropriate party for review.

Glass's estimate that on average 60% of all costs are maintenance still holds. Even if AI could make launch cheaper, it doesn't make year two cheaper unless the system around the code is built for it. This is "cause and effect are distant in time" at its most expensive is the decision to skip the pipeline work made at launch, because when change inevitably comes, the bill will be higher and the work slower, and your only hope will be that it's getting charged to a different budget line.

The time spent on maintenance, rollout and change management combined is far greater than the initial development effort. Our strategies have to adapt accordingly and the pipeline _is_ now your AI strategy, and that pipeline includes deciding what to build next, how to react to the wild that is production. AI will amplify these problems because if you're relying on human comprehension to make sense of AI-generated line-by-line code when making a change, I'm afraid the battle and the war has been lost.

Take for example the decision of what to build next after you've launched. This is no longer an isolated decision made by a uniquely qualified set of stakeholders, but arises from the running software itself as it mines and analyzes how it is being used. Observability feeding backlog feeding agents feeding deploys feeding observability is a growth loop. You want a system that enables this loop to work like the proverbial well-oiled machine. Very little of this loop is actual coding, and most of it is designing the inputs, outputs and sub-processes that ensure smooth flow.

### 7\. The type of change decides the workflow

No single AI workflow fits every change, and running one process for everything will fail spectacularly. Heavy spec processes clash with how small fixes should be treated. Böckeler [put a small bug through a spec-driven tool](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) and got four user stories with sixteen acceptance criteria (I've had similar experiences). Lightweight chat prompting without full contextual understanding of boundaries does not consider cross-cutting changes, but may be just fine for minor changes. Her conclusion was that tools need different core workflows for different sizes and types of change, and I'd extend that to organizations.

"Software factory" is a term with an extreme end. [StrongDM runs one](https://factory.strongdm.ai/) where code must not be written or reviewed by humans. Dan Shapiro's [five levels](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/) run from autocomplete to a "dark factory" that turns specs into software, and he puts 90% of AI-native developers at level 2 (Junior Developer!). As an example, changes can be classified and then an appropriate lane can be picked based on classification. Some examples:

| Change type | Examples | Workflow | Human role |
| --- | --- | --- | --- |
| Mechanical | Renames, dependency bumps, copy edits, migrations across many files | Factory: scripted loop over a task list, parallel agents | Spot-check a sample, own the guardrails |
| Well-specified feature | A new report, an API endpoint, a form | Spec → tickets → agent loop → review | Write or approve the spec, review against it |
| Ambiguous or cross-cutting | Payment flow change, data model shift, auth | Human-led discovery and design first, agents after | Decide, then supervise closely |
| Exploratory | Prototype, spike, "would this even work?" | Vibe coding, then throw it away | Learn, then decide |

Anthropic's own [size rule](https://code.claude.com/docs/en/best-practices) is a good tie-breaker which states that if you could describe the diff in one sentence, skip the plan.

Code review, which we'll dive more into later, is also not a one-size-fits-all approach like it used to be, but review hasn't gone away. The [strategies around it](https://newsletter.pragmaticengineer.com/p/what-is-happening-with-code-reviews) have changed and you'll have to decide when to use what, depending on your context. A static workflow to process changes will either be over-engineered or under-designed, both risks that are amplified by the volume of AI-generated code.

### 8\. Loops, not chats

Prompting is the new finger-typing. It's fine for exploring but wrong for delivery. Delivery runs through repeatable, scripted loops with small tasks, fresh context and parallel workspaces. Those mechanics will get their own post so this section sticks to the concept level. There are four points to needle with here.

**Loops instead of prompts.** A chat session depends on one person's memory and immediate concern. A loop is written down, repeatable and reviewable. This is the core pattern:

1.  There is a task list on disk
2.  A script that picks the next task while considering inter-task dependencies
3.  A fresh agent session does that one task in an isolated environment
4.  Verification checks run, code is committed
5.  Repeat

Geoffrey Huntley's ["Ralph"](https://ghuntley.com/ralph/) is literally a `while` loop around an agent call, with one rule he repeats several times for emphasis: one item per loop.

Anthropic's [long-running harness post](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) uses a progress file, a feature list, one feature per session and a git commit each time. The change-of-shape examples: a 40-file migration goes from one long chat to 40 scripted calls each reporting OK or FAIL. The post also talks about how a production bug goes from a stack trace in a log, to the error tracker, to an agent, to a reproducible a failing test, and finally a PR.

Nightly hygiene (stale docs, dead code, dependency bumps) has no chat equivalent at all. These are scheduled loops opening small PRs.

**Context is a budget, not a bucket.** It was shocking to me how many people miss that the model remembers nothing. Every call to an LLM is stateless. A chat "remembers" only because the client resends the whole transcript every turn. When you type message #5 into a chat window, it's sending messages #1-5 and all the tool call results from messages 1-4. That can quickly eat up your context, resulting in poorer and riskier results. [Anthropic's](https://platform.claude.com/docs/en/build-with-claude/context-windows) and [OpenAI's](https://developers.openai.com/api/docs/guides/conversation-state) say this plainly. So a long chat is a context window filling up with its own dead ends, corrections and stale file contents, and every message costs more than the last while getting less of the model's attention.

The research consistently points to how harmful this is. ["Lost in the Middle"](https://arxiv.org/abs/2307.03172) in 2023, Chroma's [context rot study](https://www.trychroma.com/research/context-rot) across 18 models in 2025 come to the same conclusions. Loops on the other hand, reset. Each iteration starts from nothing and loads only what's required. The design rule is to put the state in the repo (task lists, notes, commits) and keep the conversation disposable. The analogy I use with non-engineers is that every prompt is a new contractor with no memory. Chats hand them an ever-growing pile of old emails. Loops hand them a clean brief.

As a rule of thumb, if running `/context` in your favourite CLI or chat app gives you a result more than 200K (even on a 1MM size context), you're needlessly burning tokens. We get seduced by 1 million context size announcements, but know that just because you have a bucket of a million tokens, does not mean performance will not suffer (and get more expensive) the closer you reach that limit. How we can chew up less than 20% of that per session while completing complex features is the secret sauce. One strategy is to run context checks in your loop and abort if it passes a certain threshold, because the task just exceeded your risk appetite.

![correction-spiral](/images/correction-spiral.webp)

**Mine the truth before you plan.** Unless you are exploring and diverging, never give an agent a task that is not bounded and verifiable. Most failures are misalignment between what you want and what the agent thinks you want, not bad code. The agent will simply build the wrong thing well. Any mistake the agent makes should be seen as a flaw in your system, not an agent doing something "wrong". Before creating any plan or task list, run an interview where the agent looks up facts in the codebase and puts only the decisions to the human, one round at a time, each with a recommended answer. Matt Pocock's [grilling skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md) has the rule right in that finding facts is the agent's job, never the user's. The decisions are the user's. This is important enough to restate: _Finding facts is the agent's job. Making decisions is yours._

This is also not a copy-paste situation where you can use a public skill and expect it to work seamlessly with your organization's context. Forking and modifying good skills to make them great is a responsibility that must be undertaken. Just like there's no off-the-shelf product to solve your process problems, there's no off-the-shelf skill you can download that fits your needs perfectly.

**Parallel agents need parallel workspaces.** Several agents running on one checked-out repo step on each other. Git worktrees give each its own branch and folder, and teams can run many changes against the same repo at the same time. The alternative is to process changes linearly, which leaves a lot of speed on the table. There are thousands of such examples. I like [incident.io showing how they run four or five at once](https://incident.io/blog/shipping-faster-with-claude-code-and-git-worktrees) using this method.

But workspaces aren't enough, each workspace needs its own local test infrastructure so test runs are clean, data is isolated, and false negatives are avoided. Sound local workstation setup is critical, and has been since the 90s when we switched to client-server applications at scale. Without local testing and verifiability, the risk is only deferred, not mitigated. This was true well before AI, and is doubly so after due to code volume increase.

### 9\. Code is the spec

Loops and fresh context only work if the agent can find the truth fast. So where does the truth live? In the code and the tests. They are now the living record of what the system does, and docs that restate them duplicate the truth and mislead agents. Duplication used to be a maintenance cost that we would accept by creating a refactoring ticket that we never got to. With agents it's a correctness risk because a stale doc produces plausible, confident, wrong code. Every stale wiki page is a bug waiting to be shipped.

The split I've arrived on is that code and tests hold what the system does, docs hold why. Decision records, domain glossaries, and short agent instruction file are useful assets. Wikis full of "how the system works" pages are liabilities because the code will tell you that with far better accuracy than someone describing what they think the code does. Michael Nygard's [2011 argument for ADRs](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions) was that without recorded rationale a newcomer can only blindly accept a decision or blindly change it. This is prescient because the agent is the ultimate newcomer as it shows up to work every day with no memory. It's like the guy from Memento showing up and asking to work on your payment engine.

The evidence on agent instruction files supports keeping them small. An [ETH Zurich study](https://arxiv.org/abs/2602.11988) of AGENTS.md files found they "do not generally improve task success rates, while increasing inference cost by over 20%", that repository overviews are not helpful, and that the files are useful for specifying non-standard coding practices. Anthropic's [memory docs](https://code.claude.com/docs/en/memory) say the same, i.e., instructions are context instead of enforced configuration, and to keep it under 200 lines.

Compliance, onboarding narratives and customer docs stay in wikis. Where deletion focus is needed is duplicated internal descriptions of behaviour that essentially compete with code, giving agents conflicting information. If two instructions contradict each other, the model may pick one arbitrarily, wreaking havoc to system flow.

### 10\. Encode standards, judgements are executable

If docs shrink to the why, the team's norms and standards need a new home, which is an executable instead of more documentatino. Standards used to live in people's heads and in review comments. Now they have to be written where agents can load them, and enforced where agents can't ignore them.

There are two layers to tackle: 1) guides that tell the agent how we do things, and 2) guardrails that stop it when it doesn't. Böckeler's [harness engineering](https://martinfowler.com/articles/harness-engineering.html) framing is Agent = Model + Harness, where the harness is feedforward guides plus feedback sensors, and the sensors are either computational (linters, types, tests) or inferential (LLM review).

Instructions are advice that can and will be ignored. Anything that _must_ never happen belongs in a deterministic check. I've written about [hooks](https://zarar.dev/agent-hooks-deterministic-guardrails-for-ai-generated-code/) and ADRs-as-invariants before so I won't repeat the mechanics, but the principle applies to the whole organization.

-   Skills are packaged know-how (how we write migrations, how we test, how we deploy) that [load only when needed](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) so they don't eat the context budget
-   Hooks give ["deterministic control: certain actions always happen rather than relying on the LLM to choose"](https://code.claude.com/docs/en/hooks-guide)
-   Ratchets fail CI on new violations while old ones are paid down slowly, which lets a legacy codebase improve without a big-bang rewrite.

The most useful habit is to solicit feedback and encode it. When the agent struggles, ask what was missing (a tool, a guardrail, a doc) and add it. Böckeler's account of [OpenAI's internal codebase](https://www.infoq.com/news/2026/02/openai-harness-engineering-codex), about a million lines with no manually written code, describes it held in place by deterministic linters and structural tests, and the team treating every agent struggle as a signal of a missing piece. Every mistake should only happen once. This is what Senge means by a learning organization, stripped of the management-speak: a system where a lesson learned by one person at 2pm is a constraint on every agent and every person by 3pm. Institutional knowledge can't only live in the SME or senior engineer's head anymore, because their judgement needs to become a `.exe` file (or more likely a `.sh` file).

### 11\. Code review: from reading lines to checking proof

Earlier we discussed how the type of change decides the workflow. The same is true for code review. We're used to thinking of human code review as the only form of code review, but the volume of code being generated quickly makes review the bottleneck, necessitating a change in strategy. Humans still review, but what they review has changed. Going back to [Faros AI's data](https://www.faros.ai/blog/ai-software-engineering): high-AI teams merge 98% more PRs, PR size is up 154%, review time is up 91%. Orosz's [survey of 900+ engineers](https://newsletter.pragmaticengineer.com/p/the-impact-of-ai-on-software-engineers-2026) found the quality-focused ones are "the most overwhelmed and derailed by reviewing a lot more AI-generated code". Humans can't line-read their way out of that.

The new question isn't "is this code good?" but "has the author, human or agent, proven this works?" Willison's [framing](https://simonwillison.net/2025/Dec/18/code-proven-to-work/) is that your job is to deliver code you have proven to work, and skipping that shifts the burden onto whoever reviews it. Much like handing off unverified code to QA was irresponsible of engineers, so is handing off agent-generated code (even if the tests are all green).

Addy Osmani's [version](https://addyo.substack.com/p/code-review-in-the-age-of-ai) of a similar thought is that the bottleneck moved from writing code to proving it works, and if nobody can explain the code, on-call becomes expensive. Options to deal with this include guardrails that take style, layering and banned patterns off the reviewer's concern. A fresh-context, and possibly a different LLM does a first pass, since [the writer is biased toward its own code](https://code.claude.com/docs/en/best-practices). The human reviews the review plus the risky parts, and puts effort where risk is worth your time, e.g. money, auth, data migrations, public API change. Mechanical changes get a simpler review as you adjust the process to the inherent risk.

In the previous paragraph, the "risky parts" is doing a lot of lifting, and I've purposely left it vague because risk is different for different teams. A payment processor's risk is much different from a merchant fulfilling t-shirt orders, and this is where humans have to define what their risk profile is and reflect that in agents.

From Orosz's [survey of how teams actually review now](https://newsletter.pragmaticengineer.com/p/what-is-happening-with-code-reviews), the review types map cleanly onto the lanes from section 7:

| Review type | What humans look at | Use when |
| --- | --- | --- |
| AI reviews, human reviews the AI review | The findings, not the diff | High-volume, low-risk changes; watch for noise |
| Risk-triaged by blast radius | Only the risky paths | Public APIs, auth, schema, design system, agent skills get humans; the rest get AI |
| Review the plan, tests and schema | The intent and the contract | Well-specified features where tests prove behaviour |
| Full human review | Every line | Money movement, security, irreversible data changes |
| No human review | Nothing; scenarios and harnesses gate it | The factory end (StrongDM), only with a mature harness |

One team in that piece moved to risk-based review and went from 80 to 154 merged PRs a week, with median merge time at 26 hours with human review and one hour without, and all without sacrificing quality. The code review step is so ingrained in us that to re-think it seems sacrilegious and highly risky. With the latest models, those fears are unfounded as long as we have the right infrastructure, purpose-built harnesses, and sound task break down so context sizes are kept small enough for agents to work effectively.

## Part IV: The components, people and culture

### 12\. Flow, not scrum teams

Everything in Part III focused on what software development activities a team does differently. This section is more focused on how the team works. Scrum is a good place to start simply because it's so widely used that it's become the default setting for teams. Its ceremonies exist to coordinate scarce human coding capacity, but when coding capacity is cheap and elastic, sprint planning, estimation and velocity cost more than they're worth (I'd argue they were always misused). The unit of delivery stops being a staffed scrum team sized for how fast humans can type, and becomes a smaller team running a flow of work where agents pull tickets into their own worktrees and humans decide, specify and verify.

Kanban fits agent work because of its [pull system](https://kanban.university/kanban-guide/), explicit WIP limits, and a focus on flow instead of Scrum's timeboxing. Agents are ultimately a worker pool which need work assigned. Kanban's concepts help since:

1.  Pull system determines which agent to assign what type of work when capacity is available (e.g., enough tokens, available infrastructure, work is defined to the right degree)
2.  WIP limits manage bottlenecks by ensuring things like agents are not overloading infrastructure, and we're keeping review queues to a manageable size. In The Goal, this is Goldratt's subordinate step applied to the board.
3.  Flow is the end-to-end task completion: how many things moved from "ready" to "done" and what blockers did we encounter. The analysis of those blockers improves our system, and feeds into our guardrails and rules.

The review queue is can be thought of as a stock. A stock rises whenever inflow exceeds outflow. Agents open the inflow valve wide. There are only two levers: close the inflow (a WIP limit on review, agents idle when the queue is full) or open the outflow (the review types from the earlier section). Buying more tokens only opens the inflow valve further and is a failing strategy.

![review-queue-stock-flow](/images/review-queue-stock-flow.webp)

The tooling already works this way, so if you're using GitHub, it lets you [assign Copilot to an issue](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent) as you would a person, Linear's [agent docs](https://linear.app/docs/agents-in-linear) keep the human assignee responsible after delegation, and [Beads](https://github.com/steveyegge/beads) (which I use daily) lets agents claim unblocked tasks atomically.

Teams get smaller and more senior-heavy, with fewer handoffs and more end-to-end ownership. Orosz's reporting has teams becoming ["smaller and more efficient in contrast to the more formal handoffs of the past"](https://newsletter.pragmaticengineer.com/p/when-ai-writes-almost-all-code-what), and Linear's Karri Saarinen calls directing agent work the craft. Shopify's memo asked teams to [show why AI can't do it before asking for headcount](https://techcrunch.com/2025/04/07/shopify-ceo-tells-teams-to-consider-using-ai-before-growing-headcount/). I'd frame the headcount question as "what would this area look like if agents were already on the team?"

Having said that, we should keep the counterargument in view. More agents make more PRs, not more mergeable PRs. DoltHub ran Steve Yegge's Gas Town for an hour, [spent about $100 and got four PRs](https://www.dolthub.com/blog/2026-01-15-a-day-in-gas-town/), none production-ready. Orchestration without a supporting system around it floods review and will cause frustrating slowdowns, especially for PRs that depend on each other.

In this flow, humans work the two ends: triaging and specifying on the way in, verifying proof on the way out, while agents fill the middle. At a 10,000-foot level, that's your system.

### 13\. Roles blur

Once the board is open to agents, it opens to more people as well. Designers, PMs and analysts can now build working software. Anthropic's own data scientists [build React apps without being fluent in TypeScript](https://claude.com/blog/how-anthropic-teams-use-claude-code), Vercel's design engineers [design, build and ship autonomously](https://vercel.com/blog/design-engineering-at-vercel). This works when the organization is clear about the seams in the system where roles can step in and contribute.

Design develops (working prototypes, not static mocks) and engineering productionizes (data, security, scale, observability, maintenance), which is aligned with the earlier point that taking other people's code into production was always the hard part of engineering. Software engineering isn't dead, its concerns have shifted since anyone can build now, but not everyone can ship. I attended the ElixirConf in Malaga this year and the [remote.com engineering team](https://engineering.remote.com/) stated that around 40% of their work is around shipping code that non-technical users wrote.

The PR has become the universal handoff instead of a hot potato juggled between engineers. A designer's prototype arrives as a PR against a preview environment, not as a Figma link. [v0](https://v0.app/docs) and [Lovable](https://docs.lovable.dev/integrations/github) are examples of companies that follow very similar workflows. Naturally, this requires guardrails: [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) for who signs off on what, [protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) that require owner approval and passing checks, and [preview deployments](https://vercel.com/docs/deployments/environments) per PR so UI can be tested without blocking main.

Agents must be seen as entities that need to follow rules, just like humans do. Both are actors governed by a system. As engineers, the focus has to shift to designing systems in which agents can effectively operate, rather than being the human gate-keepers of what code gets merged.

**Product engineers, not software engineers.** The other direction of the blur is that expectations of developers have gone up. When agents produce the code, the developer's value lies in whether the product succeeds, not whether the ticket got completed. "The PM wrote the spec, I built the spec" passes the buck because if users don't adopt the feature, it's a team failure rather than a role one.

PostHog's [definition](https://posthog.com/blog/what-is-a-product-engineer) is a developer who builds for real users, writes full-stack code and cares about their "hair on fire" problems, and they build their engineering org around the role: engineers [lead product teams, make product decisions](https://posthog.com/handbook/engineering/product-engineering) and make sure what they built is being used. incident.io hires under [the same title](https://jobs.insightpartners.com/companies/incident-io-2/jobs/53992037-product-engineer) at every level. Orosz described the [product-minded engineer](https://blog.pragmaticengineer.com/the-product-minded-engineer/) back in 2019 and 7 years later AI made that the default expectation, because when implementation is cheap, the bottleneck is knowing what to build and whether it worked. Designers and PMs move toward building, engineers move toward product, and they meet in the middle. For CTOs the practical move is to reward outcomes, not throughput or technical complexity.

![roles-converge](/images/roles-converge.webp)

### 14\. Engineering managers become enablers

If developers, designers and PMs change shape, so does the person managing them. When agents pull from a board, a manager assigning tickets and chasing status adds nothing. The value moves to shaping the flow, e.g., spotting missing capabilities (skills, guardrails, test coverage, agent access to observability), building them or bringing them in, unblocking, teaching, moving on. That is a [Team Topologies enabling team](https://teamtopologies.com/key-concepts), embedded in the team. The manager's job moves from assigning work to building the system the work runs through.

Managers get closer to the technical work again, because you can't enable a workflow you've never run. LeadDev's 2026 data has the share of EMs doing more hands-on work [rising from 20% to 35%](https://leaddev.com/management/engineering-managers-are-back-in-the-codebase) year over year, and one EM they [quoted](https://leaddev.com/career-development/demand-for-engineering-managers-is-surging-in-the-agentic-coding-era) put it as managing more people with much less management per person. Charity Majors' [pendulum](https://charity.wtf/2017/05/11/the-engineer-manager-pendulum/) argument, that the best frontline managers are never more than two or three years from hands-on work, has gone from advice to requirement.

What doesn't change are 1:1s, career growth, hiring, conflict, psychological safety (still [first of Google's five dynamics](https://rework.withgoogle.com/intl/en/guides/understand-team-effectiveness)), and helping people through a shift that threatens their identity. Senge lists "I am my position" as the first learning disability of an organization. He's referring to people who define themselves by the task they perform, and can't see the system the task sits in, and resist any change to the task because it reads as a change to them. "I am the person who writes the code" is exactly that disability, and it's currently epidemic.

There is real anxiety about what it means to be a software engineer, as many developers feel their craft is being devalued. It's incumbent on managers to see their teams through this period by adjusting the system in which engineers function, so that they can see clearly how their efforts deliver customer value. Agents don't need 1:1s but people still do.

### 15\. The developer's own system

Enablement works person by person, so each person's own system matters too. A developer's workflow now reaches well past the IDE. How they learn, how they capture knowledge, and what reusable tooling they build for themselves as part of the larger system is paramount. Running a query in prod, checking the last 5 warnings in the logs, emailing your PM the status of a feature, or summarizing your blockers for escalation. The same rule from section 8 applies at personal scale: these should be skills and small scripted loops you keep, not chats you retype. Without a strong focus on personal workflows, this is efficiency left on the table.

The risk is delegating the thinking. Anthropic ran an [RCT with 52 junior engineers](https://www.anthropic.com/research/AI-assistance-coding-skills) learning a new library. The AI group scored 50% on comprehension against 67% without, with no significant speed gain. Learning helped people who asked conceptual "why" questions rather than "just write it". The MIT Media Lab's ["Your Brain on ChatGPT"](https://arxiv.org/abs/2506.08872) points the same way, though it's a small preprint about essay writing so treat it as a signal.

This hits juniors hardest and they're your future seniors, making it the slowest-acting side effect in the Shifting the Burden diagram, as the atrophy shows up in five years, when today's juniors are the reviewers you need and can't explain the code they're reviewing. The fix is a posture of using AI to ask why and to explain, not only to produce. There's a reason learning management companies are getting slaughtered, since more than anything, AI is an unbeatable learning tool.

Personal knowledge management can become a force multiplier. Karpathy's [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) idea is a markdown wiki the model maintains as a persistent, compounding artifact while the human curates and asks. This isn't only for developers, as designers, PMs, QA and business analysts all have workflows outside software development that can be improved and made seamless. Tools like OpenClaw and Hermes may sound security alarms, but sandboxing them has become trivial, and part of any organization transformation must be how individual workflows can be streamlined, not just team delivery. If your Delivery Manager is still crafting a manual status report in Powerpoint, there's a big opportunity there. In the new AI world, there is no reason to forget what you learned, and learning is constant.

## Monday, which is day one

There's no framework to roll out, and I'm not going to give you a thirteen-item checklist either, because that would contradict everything above. Senge's point about leverage is that small changes at the right point in the structure beat large changes anywhere else, and the right point is rarely the obvious one. So Monday is a diagnostic. Find which loop you're in, then make the one move that loop responds to.

**Which loop are you in?**

| Signature | Loop | The move |
| --- | --- | --- |
| PRs opened is up, PRs merged is flat, reviewers are the most tired people in the building | Limits to growth | Put the WIP limit on review and map review types to lanes (sections 7, 11, 12). Do nothing to increase agent output until review time falls. |
| You've bought licences, mandated usage, or ranked people by tokens, and the dashboard says adoption while delivery says nothing | Shifting the burden | Stop the symptomatic fix and fund the ramp-up it was standing in for: training, lanes, loops, guardrails (sections 2, 8, 10). Measure outcomes, not usage. |
| Demos were great three months ago and now nobody mentions AI | Better before worse | You're in the dip. This is where the money goes, not where it gets pulled (section 2). Protect learning time, especially for juniors (section 15). |
| The agents work but CI is slow, tests aren't trusted, deploys are scary, and the platform team is "looking into it" | Growth and underinvestment | Audit the pipeline before scaling AI (section 6). Invest in the limit before the growth demands it, and expect it to look like waste for a month. |
| A tiger team is thriving and everyone else is waiting for them | Local optimum | Dissolve it into enablers who pair, encode what they learned as skills and guardrails (sections 10, 14). |
| Tests get skipped "just this once" to land agent PRs, the flaky suite is tolerated, and the quality bar is quietly lower than last quarter | Eroding goals | Pin the bar at the minimum. Turn the standard into executable guardrails and ratchet the legacy so it can only shrink (sections 10, 11). |
| The same review comment shows up every week, gets fixed by re-prompting every time, and never by a rule | Fixes that fail | Stop fixing the instance. Encode the comment as a guardrail or skill once and let the loop enforce it (sections 8, 10). |
| Every team's agents hammer shared CI, the platform team and security review, each team optimizes locally, and the shared thing collapses | Tragedy of the commons | Give the shared resource an owner, a capacity number and a queue before scaling agents further (sections 1, 6). Local wins that overload the commons are not wins. |

Most organizations are in multiple of these at once. Pick the one which resonates the most and make the move and measure the system (lead time, change failure rate, time in review) for a month before touching anything else. The other moves could be cutting docs that duplicate code, turning your top ten review comments into guardrails, opening the repo to designers through PRs, rewriting the ladder around outcomes, are all still worth doing. They just aren't where the leverage is until the loop you're stuck in has been released.

A couple months in it could look like this.

-   Change lanes written down and used at triage.
-   Three scripted loops running nightly with state in the repo.
-   The ten most repeated review comments now guardrails or skills, with a ratchet on the legacy.
-   Review types mapped to lanes and the WIP limit sitting on review.
-   One manager pairing weekly on loops and turning blockers into shared skills.
-   A system-level lead time chart on the wall instead of a token leaderboard or worse, velocity metrics.

The tools may have changed twice by then. The system will have stayed.

[View original](https://bitbytebit.substack.com/p/the-system-around-the-code)
