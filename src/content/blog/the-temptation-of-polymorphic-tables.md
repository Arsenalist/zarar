---
title: "Pass on polymorphic tables"
date: 2025-10-31T18:59Z
---

A decision I often have to make when designing databases is whether to create a polymorphic table or not. Let me give an example. I have:

-   A discount table with an id which stores discount codes
-   A mailing\_list table where signing up gives you a discount
-   A contest table where participating gives you a discount

You could design this as:

```
discount(id, code)
mailing_list_discounts(mailing_list_id, discount_id)
contest_discounts(contest_id, discount_id)
```

Or you could go:

```
discount(id, code)
auto_discounts(mailing_list_id, contest_id, discount_id)
```

One of `mailing_list_id` or `contest_id` would always be null. The query complexity for either will be very similar given proper indexing, and I find it generally easier to look for things in fewer tables than more, so `auto_discounts` is very tempting.

The challenge comes in when you have to store information related to specific types of discounts, say `contest_winning_attempt`, in which case we now have to have `null` values in cases where it doesn't apply:

| discount\_id | contest\_id | mailing\_list\_id | contest\_winning\_attempt |
| --- | --- | --- | --- |
| disc\_1 | null | list\_1 | null |
| disc\_2 | contest\_1 | null | 1 |
| disc\_3 | contest\_2 | null | 2 |
| disc\_4 | contest\_2 | null | 3 |
| disc\_5 | null | list\_2 | null |

Another issue is that when when querying against a single table you need to add a check for null. For example, if you want to find out which discount codes were awarded for people who didn't win on their first try, you'd have to do:

```
SELECT * FROM auto_discounts
WHERE contest_id IS NOT NULL AND contest_winning_attempt != 1;
```

You need the `contest_id IS NOT NULL` check or it would pick up records that have nothing to do with contests. You could add a discriminator like `type` which is either `contest` or `mailing_list` and that makes things even more verbose and error prone.

So as much I sometimes get critiqued for having too many tables in my app, I generally opt for separate tables to keep concerns separate (though are are somewhat related). There's also the benefit of optimizing indexes on a per-table basis and lesser chance of misuse since columns that don't concern you just aren't there to misuse.
