---
title: "Embedding-Based Tool Selection for AI Agents"
date: 2025-12-21T17:35Z
---

When I first built our AI assistant, it had five tools. Look up an order. Process a refund. Check ticket availability. Simple stuff. Fast forward six months and we're at nearly 40 tools spanning orders, events, marketing campaigns, contests, and customer management.

The problem became obvious during a routine cost review: we were burning thousands of tokens on every single request just describing tools the model would never use. Someone asks "What time does my show start?" and we're sending the full spec for `process_refund`, `create_email_campaign`, and `manage_contest_prizes`. Wasteful.

## The Tool Explosion Problem

Each tool definition isn't trivial. You need a name, a description detailed enough for the LLM to understand when to use it, and parameter specifications with types and constraints. Here's what one looks like in our codebase:

```
%ToolDefinition{
  name: "process_refund",
  description: """
  Process a refund for a specific order. Validates the refund amount
  against the original order total and available balance. Requires
  order_id from get_order_details. Returns confirmation with refund ID.
  """,
  parameters: [
    %{name: "order_id", type: :string, required: true},
    %{name: "amount", type: :number, required: true},
    %{name: "reason", type: :string, required: false}
  ],
  handler: {RefundsRegistry, :handle_process_refund},
  category: :refunds
}
```

Multiply by 40 and you're looking at 3,000+ tokens before the user even says anything. The costs add up, latency increases, and here's the kicker: having too many tools actually makes the model worse at picking the right one. More noise, more confusion.

## Semantic Selection with Embeddings

The fix is conceptually simple. Instead of sending every tool on every request, we embed all tool descriptions into vectors and store them in Postgres using pgvector. When a query comes in, we embed it too, then find the 5-10 most semantically similar tools using cosine distance.

The query "refund order #12345" gets embedded, compared against all tool embeddings, and returns `process_refund`, `calculate_refund_amount`, `get_order_details`. We send only those to the LLM.

This cuts our tool payload by 75-90% on most requests. The model sees fewer, more relevant options and picks better.

## Choosing an Embedding Provider

We debated two main approaches: calling OpenAI's embedding API or running our own model.

OpenAI's `text-embedding-3-small` is the path of least resistance. It's a REST call, returns 1536-dimensional vectors, costs about a hundredth of a cent per embedding, and just works. The semantic understanding is excellent. The downside is the external dependency. Every query needs a network round-trip, your data touches their servers, and you're subject to their rate limits and outages.

Running something like ModernBERT locally is appealing for different reasons. Zero marginal cost, sub-millisecond latency since there's no network hop, and complete data privacy. But now you're managing infrastructure. You need a server running the model, monitoring, scaling considerations, and you're on the hook for model selection and updates. For a small team, that operational burden is real.

There's also a hybrid approach: use OpenAI in production for reliability, run a local model in development and testing to avoid API costs and flakiness. We built our system with a provider abstraction to make this possible:

```
defmodule Amplify.EmbeddingProvider do
  @callback generate_embedding(String.t()) :: {:ok, list(float())} | {:error, any()}
  @callback dimensions() :: pos_integer()
  @callback model_id() :: String.t()
end
```

Switching providers is a config change. The abstraction cost an extra hour upfront but buys flexibility later.

## Why We Went With OpenAI

For our volume, OpenAI was the obvious choice. We process hundreds of queries daily, not millions. At $0.00001 per embedding, we're talking pennies per month. The reliability is excellent, the semantic quality is strong for our e-commerce domain, and there's zero infrastructure to manage.

If we were processing millions of queries or had strict data residency requirements, the calculus would be different. But for a small team running a ticketing platform, paying a few cents to avoid running another service is a good trade.

## Generating Embeddings in Development

Adding a new tool or updating an existing one means regenerating embeddings. In development, it's a mix task:

```
mix generate_tool_embeddings
```

This iterates through all tool definitions, calls OpenAI for each, and upserts the results into the `tool_embeddings` table. Takes about 10 seconds for 40 tools. The task is idempotent so you can run it whenever.

The implementation is straightforward. We convert each `ToolDefinition` to embedding text that captures the name, description, and parameter info, then store the vector alongside the tool name and model ID.

## Generating Embeddings in Production

For production, we built a simple admin page. Navigate to the AI operations screen, see the current embedding count, click a button to regenerate. Non-technical team members can trigger it after tool updates without touching the console.

The alternative is shelling into the production console:

```
Amplify.Services.ToolSelector.regenerate_embeddings()
```

Either way, regeneration is safe to run anytime. It deletes existing embeddings and creates fresh ones. The whole process takes seconds.

One gotcha: if you ever switch embedding providers, you must regenerate everything. OpenAI's 1536-dimension vectors are incompatible with a local model's 768-dimension vectors. We store `model_id` with each embedding to catch mismatches and make debugging easier.

## Handling Multi-Step Operations

Pure similarity search has a gap. If someone says "refund order #12345", we'll find `process_refund`. But the LLM also needs `get_order_details` to look up the order before it can refund anything. Those two tools aren't semantically similar enough to both appear in the top results.

We solved this with category expansion. Each tool has a category like `:orders`, `:refunds`, or `:events`. When we select tools via similarity, we expand to include related categories:

```
@category_expansions %{
  orders: [:orders, :refunds, :customers],
  refunds: [:orders, :refunds, :payments],
  events: [:events, :tickets]
}
```

So finding `process_refund` (category `:refunds`) automatically pulls in order lookup tools. The LLM gets everything it needs for multi-step workflows.

## The pgvector Query

For those curious about the database side, here's the actual query we run:

```
SELECT name, 1 - (embedding <=> $1) as similarity
FROM tool_embeddings
WHERE (embedding <=> $1) <= $3
ORDER BY embedding <=> $1
LIMIT $2
```

The `<=>` operator is pgvector's cosine distance. We filter by a similarity threshold (0.4 by default) to avoid returning completely irrelevant tools, then take the top K results. The whole thing runs in under 10ms.

## Testing Without Hitting OpenAI

We use Mimic for mocking in tests. Every test that touches tool selection stubs the embedding provider to return consistent vectors:

```
Mimic.stub(EmbeddingProvider, :generate, fn _text ->
  {:ok, List.duplicate(0.1, 1536)}
end)
```

This keeps tests fast, deterministic, and free of API dependencies. We can simulate failures too, testing that the system gracefully falls back to using all tools when embedding generation fails.

## What We Learned

A few things surprised us along the way.

The similarity threshold matters more than we expected. Too high and you filter out useful tools. Too low and you're back to noise. We settled on 0.4 after some experimentation but it's worth tuning for your domain.

Category expansion was an afterthought that became essential. Pure semantic similarity misses the dependencies between tools. If your assistant does multi-step operations, you need something like this.

The provider abstraction was worth it even though we haven't switched providers. It forced us to think cleanly about the interface and made testing much easier. The Mimic stubs work because there's a clear boundary to mock.

Cold start is a real concern. If your embeddings table is empty, you need a fallback. We log a warning and use all tools, which isn't ideal but prevents complete failure.

## Results

After rolling this out, our per-request token usage for tool definitions dropped 60-80%. Latency improved by about 200ms since the model processes fewer tokens. Tool selection accuracy actually got slightly better because there's less noise confusing the model.

The embedding costs are negligible. We're at maybe $0.01 per day for our volume. The whole system adds a 10ms database query per request, which disappears in the noise of the LLM call.

For anyone dealing with tool explosion in their AI agents, this approach is worth considering. The implementation isn't complex, the costs are minimal, and the benefits compound as your tool count grows.
