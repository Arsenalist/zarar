---
title: "Penny Game Debrief"
date: 2024-12-18T14:17Z
---

## Introduction

This is a debrief of the popular [penny game](https://tastycupcakes.org/2013/05/the-penny-game/) which demonstrates flow. The questions a facilitator can ask during a debrief are varied. Some examples are below:

1.  How do individual times relate to delivery times?
2.  How was collaboration impacted?
3.  When was quality highest?
4.  When was re-work lowest?
5.  When was re-work cheapest/most expensive?
6.  When was the team most focused/least focused?
7.  How did waiting times change?

## Key Concepts

### 1\. Individual performance is not an indicator of team performance

Individual performance has very little impact on team performance. Individual can be expected to, at best, slightly improve through improvements between iterations, but that is not a driver of team outcome and speed. We tend to focus too much on individual efficiency when it is the system and how the team collaborates that determines outputs and outcomes.

### 2\. Overhead is not necessarily a bad thing

When batch sizes are small we introduce overhead to each individual. For example, we have to pass 20 times in a batch size of 1 versus just once in a batch size of 20. Introducing this overhead may seem harmful and counterintuitive, but in reality it is helping the team maintain flow in the system. Working in smaller batch sizes does introduce overhead such as more pull requests, more code reviews, more deployments, etc. However, when these steps are done efficiently it increases how much a team delivers (higher throughput, lower cycle time).

### 3\. Mistakes are less costly, allowing experimentation

As batch sizes decrease there is more room for individuals to correct errors and take more time completing individual work without impacting the system. If someone makes a mistake (e.g., drops coins), they have time to pick it up and fix it without their teammates waiting for long. If batch size are big (e.g., stories are large, PRs are large), then any delay by one teammate impacts another as idle time increases proportional to the size of the batch. Having less teammates waiting for you puts less pressure on the individual as you're not holding everybody up. This also gives you freedom to experiment as mistakes are not expensive.

### 4\. Improved focus leads to better quality

Smaller batch sizes increases focus - doing one thing at a time reduces context switching which negatively impacts productivity. We may think that flipping four coins with one hand at a time is more efficient, but it increases the chance of error as focus is spread across multiple items. This increases chance of error and reduces quality as we scramble to get everything done rather than focusing on getting one thing done with quality. This is analogous to working on multiple stories at the same time and context switching between them.

### 5\. Collaboration becomes necessary and feels natural

Smaller batch sizes improve collaboration as people have to be more attuned to what their neighbour is doing. A person will "sync" their work with their neighbuor as there is greater interaction between the two (i.e., more passes). This increased interaction improves collaboration and gives everyone a feel for each other. In large batch sizes, this need for collaboration goes away because the need for interaction is low.

### 6\. Earlier customer feedback

Large batch sizes assume that all the work in the batch is needed by the customer. Small batch sizes allow the customer to see the product earlier, thus enabling them to make a decision on whether more work is needed or whether what was delivered satisfies customer needs. Cost savings on agile teams come primarily from maximizing the amount of work not done, and smaller batch sizes open up this opportunity.

### 7\. Urgent requests are handled better

Smaller batch sizes allow urgent requests to be handled better. For example, if a batch size of 2 is being processed and an urgent request to complete an item comes in, only a maximum of 2 things need to be paused to let the urgent item through. In a batch size of 20, 20 things have to be paused.

### 8\. More opportunities to inspect-and-adapt

The opportunity to improve through inspect-and-adapt cycles increases when doing work in smaller batches. As the team gets to try their hand at the work more frequently, they have more opportunities to have retrospectives to improve their process. The focus of the retrospective is also smaller as we're discussing on how to flip a single coin, not how to flip all 20. This leads to more actionable improvements.

### 9\. Low work in process gets higher throughput

Reducing the amount of work in process increases throughput. This is coherent with [Little's Law](https://en.wikipedia.org/wiki/Little%27s_law) which states that:

![littles-law](/images/littles-law.webp)

As an example, as WIP (how much each worker is working on at the same time) decreases, throughput (how much is done) increases. Or stated otherwise, as WIP increases, Lead Time (the amount of time it takes from start to finish for an item to get completed) also increases.

The learning here can be that doing less produces more. This is counterintuitive to many people but the experiment bears this out.

## Criticisms

As with any simulated exercise there are criticisms of applicability. The main one is that work on a software development team is more variable in nature than the homogenous work of flipping coins. This can be addressed in the game by having different sized coins, but the criticism still stands. The concepts of individual efficiency being less important than system throughput still holds true.

The coin game has been criticized as being [Tayloristic](https://en.wikipedia.org/wiki/Scientific_management) in that it attempts to glean insights through scientific management concepts by treating workers as machines that can be programmed to create certain outcomes. This criticism is valid but doesn't take away from the learnings of the penny game, which relies less on the type of work being done and more on the interactions between the person and the work.

## More Resources

Donald Reinertsen's [The Principles of Product Development Flow: Second Generation Lean Product Development](https://www.goodreads.com/book/show/18892457-the-principles-of-product-development-flow) is a comprehensive view of how to achieve flow in product development. Concepts such as queue sizes, capacity, lead times and others are discussed with excellent examples.

A [summary Slidehare exists](https://www.slideshare.net/SebastianRadics/the-principles-of-product-development-flow-a-summary) and there are YouTube videos as well. For example, an [interview with the author](https://www.youtube.com/watch?v=Wo478M1TOBk&ab_channel=ae2) and a [talk given by the author](https://www.youtube.com/watch?v=L6v6W7jkwok&ab_channel=AdventureswithAgile).
