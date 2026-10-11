---
title: "Small Batch Thinking in UX Improves Usability and Code Quality"
date: 2024-08-06T07:32Z
---

UX is hard but it becomes easier if you eat enough of your own dogfood. For the last few months I've had most of my forms look like the one below, i.e., present all the fields for editing and have one big submit button at the bottom:

![submit-all-fields-at-same-time](/images/zarar-1722623808.gif)

This was a logical place to start but as the number of fields started growing I realized a few issues:

-   **High cognitive load:** for each field they change while not having hit save, they've done work which is not finished and have increasing anxiety about losing it (browser crash, accidentally hitting back button, closing a tab, etc)
-   **Delayed feedback:** The user does not receive any feedback on whether their change will be successful till the end, and not immediately after they have made the change - high WIP!
-   **Full operation unnecessarily fails:** When changing Fields A, B and C, even if only values for Field C were invalid, Field A and B are also not saved.
-   **Multiple sources of truth:** When showing conditional options or fields, I have to have an accurate representation of state. I have to consider the state stored in the database and the values the user has changed in the form, merge the two to get the "real" state. This makes for complicated code.
-   **Un-persisted entities:**: New entities added in the form don't have corresponding database ID fields as they only appear in the UI and don't have a DB record. This makes showing conditional fields difficult as those determinations usually come from DB, but the entity doesn't exist there. For example, if a user adds a Show and selects an existing Seating Chart, there is no relationship between the new show and the seating chart in the database.

To address the above I switched over to saving fields individually:

![in-line-edit](/images/zarar-1722624037.gif)

This addresses the UX issues as you're saving one field at a time and get instant feedback on whether something worked before moving onto the next step. It also makes the code/design clean:

-   State is easy to calculate as every change is persisted
-   It is easy to debug what operation failed
-   I can provide specific error messages to the user as the scope of the operation is small
-   Save operations are less likely to fail as change is small
-   I have smaller functions which are much more testable as they do one thing (Single Responsibility Principle)

The main negative is the overhead of Edit/Save on multiple fields, so overall number of clicks have increased if a user is saving more than one field. However, The time they spend on the edit screen has reduced and failed validations have decreased.

I like how applying the lean concept of small batches to UX had a direct impact on software design and quality. The cherry on top is that the Edit/Save overhead seems to be negligible, which is another proof point that smaller batches, despite having higher overhead, lead to higher throughput since people are getting their tasks done faster ([Little's Law](https://en.wikipedia.org/wiki/Little%27s_law)).

#### Subscribe to my blog

    

const signupForm = document.querySelector('.email-signup') const confirm = signupForm.querySelector('input\[name="confirm"\]') setTimeout(() => { confirm.value = "829389c2a9f0402"; }, 1000); signupForm.querySelector('input\[name="email"\]').addEventListener('input', () => { if(!confirm.value.includes("b8a3600e52f2ad4e1")) { confirm.value += "b8a3600e52f2ad4e1"; } }); signupForm.addEventListener('submit', (e) => { e.preventDefault(); fetch(signupForm.action, { method: signupForm.method, body: new FormData(signupForm), }).then(async (response) => { const message = document.createElement('i'); message.textContent = await response.text(); signupForm.replaceChildren(message); }); });

There's also the [RSS feed](/feed/).
