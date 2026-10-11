---
title: "How I Lost $210 to a Stripe Dispute Despite Proof"
date: 2024-11-12T15:01Z
---

Note: This one has an [HN thread](https://zarar.dev/how-i-lost-210-to-a-stripe-dispute-despite-proof/).

I lost a Stripe dispute of USD $210 because the customer that purchased tickets from my site used an email that he claimed to his bank was not his. Stripe and the bank asked me to provide evidence that this wasn't fraudulent and I sent them:

1.  The invoice sent to the email the customer entered
2.  The actual tickets that were sent

Despite this evidence I lost the dispute because of the customer's "it wasn't me" defense. Here's Bank of America's response:

> Compelling documents shows name is matching with customer, but email id and ip address does not match with our customer. No proof our customer benefited from this transaction. Our customer maintains charge is unauthorized/fraud.

This is a lie because I never even sent them the IP address since that isn't shown in the evidence I submitted. Notice how the customer was OK using his real name and just used a different email (which anyone can create in five seconds). They used their real name because they need to show ID at the venue to match the tickets.

Basically, just having a different email gives you a way out of not paying for stuff since Stripe will happily throw the merchant under the bus here.

What a crap system. I contacted Stripe making my case and asking what I did wrong and how I can avoid this in the future, and they resorted to finger-pointing.

> The decision on who wins a dispute comes down to a judgment call by the bank in which Stripe unfortunately has no role or way of influencing. We are aware of how this resolution can impact you and your business, but as much as we wish we could do more in this scenario, this is the final outcome.

> I truly understand the frustration and as much as I would like to help, our hands are tied with this dispute process. Disputes are intended to give customers a line of recourse when fraudulent payments are levied against them. Unfortunately, they can be abused by bad actors.

> As much as we do not want to honor disputes here at Stripe, it is the right of a customer and the bank is obliged to fulfil it.

In short, as a merchant you are completely exposed.
