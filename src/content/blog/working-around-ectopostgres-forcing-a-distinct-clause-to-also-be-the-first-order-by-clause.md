---
title: "Working around Postgres forcing DISTINCT fields to also be ORDER BY fields"
date: 2024-10-21T20:57Z
---

I've been using Flop for pagination in my Elixir app and learned that anytime a DISTINCT clause is used in Ecto when using Postgres, the columns in the clause are prepended to any ORDER BY clauses in the query. This was causing a lot of problems for Flop since it uses specific columns for cursor-based pagination and doing a `DISTINCT product.id` was breaking Flops's cursor-based pagination since the "real" order by column was second in line (after p.id).

The way around it is to "override" Flop's sorting by injecting your own field in the DISTINCT clause. So the distinct clause would be:

`distinct: [{^direction, variants.starts_at_utc}, p.id],`

From a business logic point of view, only p.is is needed, but since we don't want things sorted by p.id, we inject the real sort field as part of the distinct clause, which in-turn makes it the first column in the order by clause.

Kind of wonky, but works.
