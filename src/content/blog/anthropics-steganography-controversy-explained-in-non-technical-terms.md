---
title: "Anthropic's Steganography Controversy Explained in Non-Technical Terms"
date: 2026-07-01T16:24Z
---

You may have heard that Anthropic was caught doing something sneaky which I want to explain without any of the technical stuff because the lesson is for everyone, especially if you're paying for AI tools or deciding whether your team should use them.

[Someone looked at the internals of Claude Code](https://thereallo.dev/blog/claude-code-prompt-steganography) and found it had been quietly doing something they didn't tell anyone about, not exactly something malicious, but the point is that it was concealed from the user.

Every time it sent a message from the user to the backend (i.e., a prompt), it made a small inconsequential change to what was sent over the wire from your computer to Anthropic. Instead of sending a date like YYYY-MM-DD, they sent it like YYYY/MM/DD (notice hyphen replaced with slash) whenever the user was from certain parts of China. They also did similar things if you were using Claude through a reseller, etc., but the details of what they sent aren't the important point, but how they sent it.

Companies collect information about their users all the time so that part isn't the problem. If Anthropic wanted to know who its users are, they could just ask or relay that information plainly like, `{"location": "Shanghai"}` as part of the data that is sent to them from your Claude Code to Anthropic servers. What's bothering people is how they did it.

They own the whole chain as the tool is theirs and the servers are theirs. If they wanted this information, they could have written it down plainly, in the open, the way every normal company does. Instead they chose to hide it and to hide it inside the one part of the message a developer actually relies heavily on: the prompt. It's like a contractor you hired scribbling notes about you in invisible ink, on the very documents they hand back to you. This is known as _steganography_, the practice of concealing secret information within an ordinary, non-secret piece of information.

You don't hide something you're allowed to do. You hide something when you don't want the other person to know you did it. This is irking people because if they do something like this here, it's hard to believe they won't do it elsewhere as well, and it becomes harder to trust their word when it comes to security and privacy. And nobody would have known, except one person happened to take the software apart, and that's the problem: the fact that we only found it by accident.

These AI tools aren't little chat windows anymore. They're agents that run on our computers with total access to your computer. They can run commands, read your files, and reach out to the internet, all on your behalf. You hand them the keys to the house because they legitimately do something useful for you, and you inherently trust them.

So let's think about that. A company shipped software that runs on your machine with the keys to everything, and it was quietly doing something it never disclosed. The hidden mark (e.g., the hyphen/slash swapping to reveal Chinese users) itself was nothing but it proves they're willing to run things you can't see. And you can't check what you can't see. Essentially, you trust the person who shows you their work over the one who says "just trust me." Openness earns trust and hiding loses it and this is crystal clear evidence that Anthropic went out of their way to hide it from you. As an aside, the way they hid it is so sloppy that it makes you wonder whether "big tech" developers really are what they are propped up to be.

So where does that leave us? I think it's a real argument for running these tools on AI models you can run yourself, on your own machine, where your data and your work never leave the building. The local models ([like the one I wrote about here](https://zarar.dev/run-a-local-coding-model-with-pi-and-lm-studio/)) aren't quite as sophisticated as the big ones yet, and "open" doesn't automatically mean "safe" but the direction to run more locally is the right one (without even considering the cost angle). You want to be moving toward tools you can see into.

I'm not telling anyone to throw out their tools tomorrow. I'm saying this that when you're choosing who to trust with the keys, pay less attention to what a company promises and more to whether you can check for yourself. The ones worth trusting are the ones who don't ask you to take their word for it.
