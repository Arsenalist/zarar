---
title: "Using DORA metrics to coach teams"
date: 2024-07-20T14:03Z
---

Related [Hacker News thread](https://news.ycombinator.com/item?id=41057386).

## What are the DORA metrics?

The [DORA metrics (PDF)](https://services.google.com/fh/files/misc/state-of-devops-2021.pdf) consist of four software delivery measurements.

1.  Deployment Frequency: How often are features deployed to the production environment - features can be deployed in an off state or made available to customers.
2.  Lead Time: The duration between two points in time: When code is committed to a source control repository (e.g., Git) When that code is deployed to production (in an off or released state)
3.  Time to restore service: In the event of a production outage, the duration of time to restore service
4.  Change failure rate: The percentage of changes that resulted in degraded service or outages.

The last two DORA metrics are a check against the first two. For example, a team can deploy very frequently which can gloss up their deployment frequency and lead time metrics, but if they break production frequently when deploying the metrics can be misleading. The change failure rate and time to restore service metrics are checks against this and guard against gaming, so any inferences drawn should consider all four metrics.

## Why are the DORA metrics important?

There are two main reasons why DORA metrics can be valuable.

### Predictors of Performance

The metrics are predictors of software delivery performance and organizational performance.

Significant research has been done across thousands of organizations showing that healthy DORA metrics are strongly correlated with how efficiently an organization delivers software and how well it performs in the market from a business perspective. There are also strong correlations with employee retention, sustainability, and psychological safety of team members, i.e., the better the DORA metrics, the happier the employees.

### Reference for Comparison

The metrics provide a framework for a team to compare themselves to other software delivery teams, and more importantly, previous versions of the team. The metrics serve as data points in time which can be used as inputs into improvement a team can make. For example, a team could ask:

1.  What can we change about our testing process to reduce lead time?
2.  How can we change our branching strategy to improve deployment frequency?
3.  How can we improve observability in production so that our mean time to restore service is reduced? The analysis found that there are four categories of performers as indicated by the four metrics. A team can use this as a guide on what they can do to "move up".

The analysis found that there are four categories of performers as indicated by the four metrics. A team can use this as a guide on what they can do to "move up".

![dora-metrics-new](/images/zarar-1721830452.png)

## Coaching using DORA Metrics

This section provides some guidance on how a coach can use DORA metrics to coach teams to improve their processes.

### How Product Experimentation is tied to Deployment Frequency

Customer value can be maximized by:

1.  Maximizing the features the customer needs
2.  Minimizing the features the customer doesn't need

Data-driven approaches such as A/B testing and multivariate analysis help team achieve this by iterating through a Lean Startup loop.

For teams to efficiently execute this loop they must be able to release code efficiently and frequently, so that customer feedback is actioned. A low deployment frequency results in fewer iterations of the Lean Startup loop while higher deployment frequencies result in more. This has a direct impact on the quality (e.g., staleness) of data that a Product Manager can base their decisions.

A low deployment frequency implies larger releases (high batch size) and delayed customer feedback. Teams that don't deploy frequently and inevitably left behind and have difficulty tuning into customer needs.

Coach Qs

1.  What is the relationship between quality of customer feedback and deployment frequency
2.  How is the team's ability to respond to customer feedback affected by increasing deployment frequency?

### Lead Time's relation with WIP and Throughput

![little-law](/images/zarar-1721830561.png)

The more things a team has in progress (i.e., high WIP), the lower their throughput (i.e., how much they get done). For software development teams, two major sources of high WIP are:

1.  Number of in progress tasks/stories
2.  Number of code branches

DORA's emphasis on reducing lead time (duration between commit to production) targets both these aspects. On most teams each task results in an associated branch being created where code for that ask is committed and eventually merged to the main branch.

Coach Qs

1.  What is the relationship between change failure rate and number of active branches?

A team focused on reducing lead time will not start another task (hence create another branch) before completing the the current one and sending it to production. This behaviour of focusing on lead time reduction results in lower WIP and hence higher throughput - as WIP decreases, lead time decreases.

### DORA and Smaller Stories

A developer's day consists of tasks relying on feedback from tools and people. Developers may spend significant time waiting for code to recompile, tests to run, applications to deploy, code reviews or information from Product Managers. This blocks their ability to make progress, and results in context switching where they take on additional tasks while waiting, thus increasing work in process and reducing throughput.

DORA's emphasis on deployment frequency and lead time acts as a forcing mechanism to reduce the amount of things that can block a task. By breaking work into smaller units, the likelihood of being blocked is reduced and more items are able to be completed end-to-end with minimal friction.

Coach Qs

1.  What is the relationship between story size and deployment frequency?
2.  How would larger stories affect lead time?

### Test Driven Development and Time to Restore Service

Teams which leak defects are often in firefighting mode where production issues and unplanned work take up significant team capacity, which causes frustration and waste. Their condition is exacerbated by having large releases which ship defects in large batches, resulting in root cause identification of defects becoming a time-consuming activity.

One method of motivating the team to make their release size smaller is to look at this pain point, i.e., identifying root cause of defects quicker. Consider the [following two methods of development](http://blog.wingman-sw.com/physics-of-test-driven-development).

![tdd-without](/images/zarar-1721830342.png)

![tdd-with](/images/zarar-1721830340.png)

Observe that when the time between bug injection and bug discovery is reduced, so is the time between bug discovery and bug found (i.e., root cause).

As part of addressing the problem, teams that leak defects can focus on the DORA metric of Time to Restore Service as an optimization target. The idea is to focus on the team's current pain point (leaking defects) which, once the onion is peeled, will lead to the natural conclusion of higher deployment frequency and small batch sizes.

Coach Qs

1.  How does using Test Driven Development impact how quickly the root cause of a defect is found? Does it make finding root cause quicker or slower?

### Technical Practices to improve DORA metrics

Key technical practices are highly correlated with healthy DORA metrics. Here we will go through some of them and map them to how they improve the metrics.

**Loosely Coupled Architecture**

Using a loosely coupled architecture where components are not highly interdependent on each other allows teams to deploy independently of one another, increasing deployment frequency. This also allows teams to reduce the size of their deployments, which means failure is easier to identify, which reduces mean time to recover.

**Trunk-based Development**

Trunk-based development emphasizes only to either have a single branch where developers commit to, or very short-lived branches. Either technique reduces the number of branches that exist, which in turn reduces merging risk, which in turn reduces the chance of the wrong thing being merged, which reduces change failure rate.

**Continuous Testing**

By incorporating early and frequent testing throughout the delivery process (rather than at the end), with testers working alongside developers throughout, teams can iterate and make changes to their product more quickly. Early and continuous detection (and prevention) of defects results in higher quality and a reduced change failure rate. Pair testing is a key techniques which can help drive this improvement on teams with QA roles.

**Automated (No Touch) Deployments**

A team can decrease lead time by enabling faster and more efficient deployments - having a manual step in the deployment process such as a tester sign-off hampers lead time. You also reduce the likelihood of deployment errors, which are more common in manual deployments and situations where manual approvals are being sought.

**Pair Programming and Mobbing**

Pair programming and mobbing are both techniques where multiple developers work together on a feature, thus increasing communication and reducing handoffs (e.g., Pull Request reviews). Along with higher quality code due to better quality feedback received during the development process, this reduces lead time by eliminating asynchronous code reviews in favour of synchronous development.
