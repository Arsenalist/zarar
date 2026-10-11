---
title: "Prefer optional objects to optional arguments"
date: 2024-08-02T16:06Z
---

Every time I make a function with this type of signature, I end up regretting it:

```
const formatDate = (
  date: Date,
  format = "ddd MMM D, h:mm A",
): string => {
  // some logic to format a date
};
```

This is because invariably at some point in time I'm going to want to have more customizations on how to format a date. In this situation I wanted to, in some cases only, change the format of the date to exclude the year if the year was the same year as today.

I could do this check on the calling side but then I have date logic spread across the codebase which is not great. Adding a third parameter called `hide_year_if_current: boolean` (the second one that's optional) makes the caller having to specify the second parameter of `format` even when they really just want control over whether the year is specified or not.

Taking some guidance from [Uncle Bob's work from way back](https://www.goodreads.com/book/show/3735293-clean-code):

> The ideal number of arguments for a function is zero (niladic). Next comes one (monadic), followed closely by two (dyadic). Three arguments (triadic) should be avoided where possible.

> When a function seems to need more than two or three arguments, it is likely that some of those arguments ought to be wrapped into a class of their own. Consider, for example, the difference between the two following declarations:

```
Circle makeCircle(double x, double y, double radius);
Circle makeCircle(Point center, double radius);
```

> Reducing the number of arguments by creating objects out of them may seem like cheating, but it’s not. When groups of variables are passed together, the way x and y are in the example above, they are likely part of a concept that deserves a name of its own.

Since I've been living in the Elixir world lately and practically every function's last argument is an optional keyword list `opts \\ []`, I'm starting to take a page from that book and write the above instead as:

```
const formatDate = (
  date: Date,
  options?: { format?: string; hide_year_if_current?: boolean },
): string => {
  // some logic to format a date based on options
}
```

This adheres to the Clean Code worldview, makes testing easier, and allows for options to be added or removed without changing the function signature.

#### Subscribe to my blog

    

const signupForm = document.querySelector('.email-signup') const confirm = signupForm.querySelector('input\[name="confirm"\]') setTimeout(() => { confirm.value = "829389c2a9f0402"; }, 1000); signupForm.querySelector('input\[name="email"\]').addEventListener('input', () => { if(!confirm.value.includes("b8a3600e52f2ad4e1")) { confirm.value += "b8a3600e52f2ad4e1"; } }); signupForm.addEventListener('submit', (e) => { e.preventDefault(); fetch(signupForm.action, { method: signupForm.method, body: new FormData(signupForm), }).then(async (response) => { const message = document.createElement('i'); message.textContent = await response.text(); signupForm.replaceChildren(message); }); });

There's also the [RSS feed](/feed/).
