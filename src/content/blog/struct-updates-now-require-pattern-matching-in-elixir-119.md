---
title: "Struct Updates Now Require Pattern Matching in Elixir 1.19"
date: 2026-01-02T17:36Z
---

After upgrading to Elixir 1.19, you might see warnings like this:

```
warning: a struct for Amplify.Models.Product is expected on struct update:

    %Amplify.Models.Product{product | variants: variants}

but got type:

    dynamic()
```

The fix is to pattern match on the struct when you define the variable:

```
# Before (now warns)
{:ok, product} = Products.get_product(id)
product = %Product{product | variants: filtered}

# After (two options)

# Option 1: Pattern match + struct update
{:ok, %Product{} = product} = Products.get_product(id)
product = %Product{product | variants: filtered}

# Option 2: Pattern match + map update (recommended)
{:ok, %Product{} = product} = Products.get_product(id)
product = %{product | variants: filtered}
```

Both work. Elixir's hint suggests Option 2 since the pattern match already guarantees the type.

Why the change? The struct update syntax `%Product{product | key: value}` implies a runtime assertion that if `product` isn't actually a `Product`, it crashes. The compiler trusted you knew what you were doing but there wasn't any runtime enforcement despite the code appearing to look like a type was enforced.

This also doesn't work well with type inference, which is Elixir's typing approach (as opposed to explicit annotations). When `product` comes from a function returning `{:ok, any()}`, the compiler sees it as `dynamic()`. It can't verify the struct update is safe without runtime execution.

This change was needed since Elixir 1.19 continues the rollout of set-theoretic types, i.e., a [gradual typing system](https://hexdocs.pm/elixir/gradual-set-theoretic-types.html) that infers types from patterns and guards rather than explicit annotations. The goal is catching bugs at compile time without requiring you to annotate everything.

For this to work, the compiler needs evidence. A pattern match like `%Product{} = product` provides that evidence. Without it, the type system has to treat the variable as `dynamic()`, which defeats the purpose.

The struct update syntax was convenient shorthand, but it created a hole in type inference. You could write code that the compiler couldn't verify, getting neither the safety of static typing nor a clear signal that you'd opted out. The new approach is more verbose, but the pattern match documents your assumption explicitly. Six months from now, when someone refactors `get_product/1` to return a different struct, the compiler will catch it instead of production.

If you're updating many struct fields and want the old convenience, the map update syntax `%{product | key: value}` works identically at runtime but _only after you've pattern matched_ when defining the variable.
