---
title: "Tailwind balances abstraction and transparency"
date: 2024-08-21T16:43Z
---

.blink\_me { animation: blinker 3s linear infinite; } @keyframes blinker { 50% { opacity: 0; } }

I remember writing my first CSS file in Dreamweaver ([still around](https://www.adobe.com/ca/products/dreamweaver.html)) and it blew my mind that I no longer needed to use font, center, b, i, s, u and blink. The idea of separation of concerns between content and design was revolutionary (or at least novel) and thinning out your templates in favour of a separate file which managed all layout was game-changing. I remember using having spent countless days trying to make my high school website look half-decent using table-based layouts and font tags, and here comes a way of doing that so much more cleanly and quickly. I was genuinely thrilled to start my career with this new technology in its infancy because it promised so much.

Then I got a job and had to support different browsers and now my stack became that CSS file plus a bunch of inline CSS to override stuff, JavaScript to manipulate that CSS and DOM, and of course the classic:

```
<!--[if IE]>
    <link rel="stylesheet" type="text/css" href="ie-styles.css" />
<![endif]-->
```

CSS quickly became something I adored to something I dreaded working with because it sucked up so much time and yielded so little reward. Spending half your day vertically aligning an image when your title was "programmer" didn't feel right, and I started to think that "look and feel" to be part of my job anymore. Except it became my entire job when the designers started designing Apple-like menus and I had to make it work in IE. You may be old enough to remember when Apple's website was all the rage, and everyone wanted to copy it (including my employer):

![apple-website](/images/zarar-1724190903.png)

So I did it. The code looked like crap and it was patched up with code that made the crap code glow. I wasn't proud, but it worked. It looked like Apple...ish. The request from the client was "Make it look like Apple exactly but with different colors". Gotcha boss, anything for that CAD 30K/year salary which I was thankful for and never asked for a promotion. I just didn't want to be fired because I had just leased a Honda Civic and the car payments felt like usury, man.

Then when browsers started adopting different standards I tried to keep up, I did. I got into the inline-block, float, absolute/relative/fixed positioning, table-based layouts, I even wrote JavaScript code which made DOM elements dance. Then came Bootstrap. I loved it because it abstracted away a lot of the things I hated, kind of like how jQuery abstracted away DOM manipulation. But it wasn't enough. There was always a requirement about pixel-perfect positioning where you had to get your hands dirty and say a quick prayer before shipping, hoping that some poor sod somewhere didn't visit the site in Netscape. Bootstrap and the like offered good boilerplate starting points, but they didn't solve the minutiae that designers loved to design and drool over, often times needlessly.

I finally got out of jobs where I had to worry about that stuff, and all the apps I wrote on contract had a simple Bootstrap/Material UI interface. If that wasn't acceptable to the client, I didn't take the job. I just didn't want to spend the effort making it look like the Photoshop design only to discover it bombs in Opera. I had had that sinking feeling before and wanted no part of it. Let me just program and make stuff happen. Someone else make it look good.

Then I started building mass-market consumer apps and here things changed. I had no money to hire anyone and the requirements kept coming hard and fast. Things needed to be crisp and people started demanding things that I either couldn't do, or didn't want to do, and it was all different for different screen sizes. Ugh, was I going to have to go back and re-learn flexbox or grid or whatever the latest thing is? I feared so, until I discovered Tailwind.

The thing about Tailwind I love is that it's the _right_ level of abstraction. That means different things to different people, but for me it means that I can meet any requirement by applying classes (often many of them), without abstracting away what the classes are doing. It gives both abstraction and transparency, something that is difficult to nail in any library.

As programmers we're uneasy about magical stuff happening underneath. We don't need to fully understand it, but we need to know the parameters of how it's working. I want you to do the hard stuff but also tell me how you're doing it. This is a handshake between what I don't know and what I understand. Without that handshake trust is tenuous and for me, Tailwind nails it. It's not _trust, but verify_, more like _trust, but tell me_.

I've been using Tailwind for two years now and I have no qualms about working with UIs and don't panic when a customer says, "Can I have the button in the top-right on mobile but on the bottom-left on desktop? And can you make it smaller on mobile?" That used to mean that I needed to clear out my schedule but now it's child's play. Now I love doing it because I have a tool that conceals my weaknesses to the point that, to my customers, it appears as a strength.

I'm sure we all love some libraries that make our lives easier, but Tailwind has a special place in my heart because its made me love doing what I used to dislike doing.
