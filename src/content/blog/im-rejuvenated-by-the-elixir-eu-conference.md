---
title: "I'm rejuvenated by the Elixir EU Conference"
date: 2025-05-16T20:00Z
---

Finished my first ever Elixir conference and it feels great for three reasons:

1.  Learned a lot
2.  Realized that I don't know a lot
3.  Felt grateful to be part of a community where I can possibly fill the gap

More than ever I've felt I've made the right decision opting for the Elixir/Erlang stack for jumpcomedy.com. It was comforting to hear from people who were facing similar decisions 7-8 years ago and took the cold plunge. They were risk takers, and I'm merely a follower who has the benefit of a vast amount of work done by immensely talented people. Here are five highlights of many from the conference.

### Electric SQL / Phoenix Sync

[This](https://electric-sql.com/) is a game-changer. In a world where real-time views are the norm and attention spans are decreasing fast, having data sync'd between the UI and the data store is ever more important for a great UX. Phoenix Sync does this by looking at the PostGres replication logs and syncing your LiveViews (or even JS front-ends) in near instant time. Combine this with the power of LiveView streams and you literally have to change five characters, and an INSERT done from a PostGres GUI will show up in your LiveView UI. I kid you not - it seems too good to be true to not have to write any code to make this happen, but that's how it works.

### Ash AI

There was a lot of AI talk and some amazing demos using [LangChain](https://github.com/brainlid/langchain) but what excited me most was [Ash Framework's AI extension](https://github.com/ash-project/ash_ai), simply because I think they've nailed the declarative syntax and even made Model Context Protocol implementations, dare I say, rather trivial. Elixir/Phoenix has always given, and I don't say this lightly, a 5x productivity boost compared to anything else and this implementation just demonstrated how easy they've made it to power up your apps with AI.

### LiveVue / JS Escape Hatches

Any good Elixir abstraction library provides a clean escape hatch, and [LiveVue](https://github.com/Valian/live_vue/blob/v0.5.7/README.md#L1) (and LiveReact and LiveSvelte) do just that - instead of sending HTML diffs based on state changes across the wire, they sync props, which means that you can use any front-end framework with Phoenix backends seamlessly for cases where UIs need to have heavy JavaScript for whatever reason. This is a fear of many who contemplate LiveView which is extremely server-centric, i.e., not having control over front-end state can keep a lot of developers away, especially those who rely on framework utilities in their app (`npm i` is just too easy). This addresses that problem.

### Type Checking vs Type Inference

Jose Valim spoke about what's coming up in Elixir 1.19, which will have support for even more inferred types, notably inferring the types of keys in Maps. He suggested that in 18-24 months Elixir will have type declarations and that it's a matter of when, not if. This would close a huge perceived gap in the language and pave the way for developers who are used to TypeScript and Java to give Elixir a shot. Not having types never scared me because it forced me to not depend on types, which promoted a behaviour of writing more obvious code, smaller functions and better tests. There are already a lot of big companies using Elixir, like BBC, Bleacher Report, etc. but typing would open up the door even more to larger enterprises who often see it as a requirement simply because that's what they're used to.

### Waffle

I have to give a shout out to the many lightning talks, and one of them was [Waffle](https://github.com/elixir-waffle/waffle), which is a classic example of small Elixir library that does one job, does it well, and doesn't try to do anything else. Waffle is a file processor/uploader with extensions to S3, Azure etc. I like how the author said that "we're pretty much done" with this library and that's what I love about Elixir libraries: a "last commit" of months or even years ago doesn't imply that the library is abandoned, it's that it just did what it was supposed to do really well and there's nothing more to do.

\--

Chris McCord, the creator of Phoenix gave the closing keynote titled _Code Generators are Dead. Long Live Code Generators_, and man, he looked a little jaded as he was introducing how AIs he built are replacing the traditional Phoenix code generators. He literally built a customized TodoApp in 20 minutes and pondered the role of developers in the age of AI while doing it, and also while low-key dissing "vibe coding". His main idea seemed to be that AI isn't going to replace developers but understands why that might be a fear. That people who cut-and-pasted StackOverflow will continue to cut-and-paste AI-generated code and that once things normalize, the human will still end up being needed.

I don't know what to think of this but AI hits different than the Stack Overflow metaphor simply because Stack Overflow still required you to connect the dots. Lot of AIs don't. A metaphor that resonates with me is one comparing AI with the industrial revolution, which revolutionized everything but demand even more labour than before. Time will tell.

[View original](https://bitbytebit.substack.com/p/im-rejuvenated-by-the-elixir-eu-conference)
