---
title: "PayPal Has No Undo Button and It Cost Me $687.75"
date: 2026-05-22T19:34Z
---

AAAAAARRRGGHHH!!!!!!

A customer just cancelled one of the recurring events they were running and picked the wrong date - last week instead of next week.

So instead of refunding the two tickets that were sold for the show, they refunded $687.75 worth of tickets for the previous show. Now, this is a comic who runs a small business so I've decided to eat this cost but I really didn't need to. Let me explain.

Stripe has a feature where if you issue a refund, you have a grace period where you can cancel the refund. I think it's around 1-2 days even depending on payment method. PayPal does not - you issue and it goes straight through (that emdash was not AI). I called PayPal customer service and they confirmed it.

I recently switched from Stripe to PayPal because of a better processing rate, and I feel like I killed my savings in one shot (not really, but it sure feels that way).

I felt kind of helpless but I have a rule: when something bad happens, I have to take some corrective action, so in this case I changed the confirmation modal:

![modal-before-after](/images/modal-before-after.webp)

I thought of making them type something to confirm but I think this is good enough.
