---
title: "Bit by falsy truths again"
date: 2024-07-24T17:30Z
---

Spent about 3 hours figuring out why my PayPal integration wasn't working. I had [followed the directions](https://docs.medusajs.com/plugins/payment/paypal) but still was getting weird responses from PayPal:

![env](/images/zarar-1722349192.png)

I thought I had configured something in the PayPal developer console wrong, but after sifting through Medusa's Discord thread, discovered that this is ultimately a true/false thing. The sandbox environment variable is ultimately read in a JavaScript file to configure the system.

```
{
    resolve: `medusa-payment-paypal`,
    options: {
      sandbox: process.env.PAYPAL_SANDBOX,
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      authWebhookId: process.env.PAYPAL_AUTH_WEBHOOK_ID,
    }
```

In the internal MedusaJS code the `sandbox` is represented as a boolean and though `process.env.PAYPAL_SANDBOX` is `"false"`, it's being evaluated as `true` since `"false"` is a truthy value in JS.

The fix is simple:

`sandbox: process.env.PAYPAL_SANDBOX === "true"`

The true fix here would be to reject any string value when passed into the `sandbox` variable.

The problem of defining a true/false value in a config file is interesting in that there is no clean solution.

-   true/false has the problem of "false" being truthy
-   1/0 can be parsed as an integer or a string, resulting in similar issues
-   Y/N has casing issues which need to be dealt with

I sometimes tend to avoid booleanish values completely and opt for strings that mean something specific. I find that it also makes things more "future proof" (hate that term) as you can also add more values later. So instead of true/false for a variable called sandbox, I sometimes go with sandbox = enabled/disabled. But this also feels like over-engineering unless I know there's a possibility of a non-binary value in the future.

At the end of the day, validating config values types are accurate on application startup seems to be the common denominator in solving this problem.
