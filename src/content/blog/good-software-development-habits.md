---
title: "Good software development habits"
date: 2024-09-05T13:00Z
---

Note: This got [posted on HN](https://news.ycombinator.com/item?id=42165057) and got some attention.

This post is not advice, it's what's working for me.

It's easy to pick up bad habits and hard to create good ones. Writing down what's working for me helps me maintain any good habits I've worked hard to develop. Here's an unordered list of 10 things that have helped me increase speed and maintain a respectable level of quality in the product I'm currently developing.

1.  Keep commits small enough that you wonder if you're taking this "keep commits small" thing a little too far. You just never know when you have to revert a particular change and there's a sense of bliss knowing where you introduced a bug six days ago and only reverting that commit without going through the savagery of merge conflicts. My rule of thumb: compiling software should be commitable.
    
2.  Live Kent Beck's [holy words of wisdom](https://x.com/KentBeck/status/250733358307500032?lang=en): "for each desired change, make the change easy (warning: this may be hard), then make the easy change". Aim for at least half of all commits to be refactorings. Continuous refactoring is thinking of changes I can make in under 10 minutes that improve something. Doing this pays off whenever a bigger requirement comes in and you find yourself making a small change to satisfy it only because of those smaller improvements. Big refactorings are a bad idea.
    
3.  All code is a liability. Undeployed code is the grim reaper of liabilities. I need to know if it works or at least doesn't break anything. Tests give you confidence, production gives you approval. The hosting costs might rack up a little with so many deploys but it's a small price to pay for knowing the last thing you did was a true sign of progression. _Working software is the primary measure of progress_, says one of the [agile principles](https://agilemanifesto.org/principles.html). Working and progress are doing a lot of heavy lifting in that sentence, so I've defined them for myself. Working is something being working enough to be deployed, and if it's code that's contributing to a capability, that's progress.
    
4.  Know when you're testing the framework's capability. If you are, don't do it. The framework is already tested by people who know a lot more than you, and you have to trust them that the `useState()` hook does what it's supposed to do. If you keep components small, then you reduce the need for a lot of tests as the framework will be doing most of the heavy lifting in the component. If the component is big, then you introduce more complexity and now you need to write a lot of tests.
    
5.  If a particular function doesn't fit anywhere, create a new module (or class or component) for it and you'll find a home for it later. It's better to create a new independent construct than to jam it into an existing module where you know deep down it doesn't make sense. Worst comes to worst, it lives as an independent module which isn't too bad anyway.
    
6.  If you don't know what an API should look like, write the tests first as it'll force you to think of the "customer" which in this case is you. You'll invariably discover cases that you would not have thought of if you had just written the code first and tests after. You don't have to be religious about TDD and it's OK to work in larger batches (e.g., write more than just a couple lines of code before making it pass). The amount of code to write in a red/failing state doesn't always have to be small. You know what you're doing, don't let dogma get in the way of productivity.
    
7.  Copy-paste is OK once. The second time you're introducing duplication (i.e., three copies), don't. You should have enough data points to create a good enough abstraction. The risk of diverging implementations of the same thing is too high at this point, and consolidation is needed. It's better to have some wonky parameterization than it is to have multiple implementations of nearly the same thing. Improving the parameters will be easier than to consolidate four different implementations if this situation comes up again.
    
8.  Designs get stale. You can slow the rate at which they get stale by refactoring, but ultimately you'll need to change how things work. Don't feel too bad about moving away from something that was dear to you a while ago and something you felt proud about at the time. You did the right thing then and shouldn't beat yourself up for not getting it right enough that you wouldn't need to change anything. Most of the time writing software is changing software. Just accept it and move on. There's no such thing as the perfect design, and change is at the core of software development. How good you are at changing things is how good you are at software development.
    
9.  Technical debt can be classified into three main types: 1) things that are preventing you from doing stuff now, 2) things that will prevent you from doing stuff later, and 3) things that _might_ prevent you from doing stuff later. Every other classification is a subset of these three. Minimize having lots of stuff in #1 and try to focus on #2. Ignore #3.
    
10.  Testability is correlated with good design. Something not being easily testable hints that the design needs to be changed. Sometimes that design is your test design. As an example, if you find yourself finding it difficult to mock `em.getRepository(User).findOneOrFail({id})`, then chances are you either need to put that call into its own function that can be mocked, or write a test utility which allows for easier mocking of the entity manager methods. Tests go unwritten when it's hard to test, not because you don't want to test.
     

There's probably a lot more, but 10 is a nice number.
