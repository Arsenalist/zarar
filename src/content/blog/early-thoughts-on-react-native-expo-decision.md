---
title: "Early thoughts on React Native/Expo decision"
date: 2024-10-02T15:21Z
---

I have to make an iPhone app for ticket scanning at the door and chose [React Native/Expo](https://expo.dev/) as the stack. I had implemented this feature on the web using QR Code scanning libraries and things more or less worked fine. The main issues were the camera feeling a little clunky, especially when the browser tab went into the background, the constant asks for permission to use the camera, the browser being a little jittery with the horizontal scrolling, and a lot of my customers being used to the "snappy" experience of using the EventBrite app, which most of them switched over from.

React Native/Expo looked like the fastest way to go since I:

1.  Already have TS/JS/React knowledge which can help with speed
2.  I don't want to spend time on a separate codebase for Android, which I will eventually need (if my app becomes bigger outside of North America)
3.  Wanted to use the Expo router which is conceptually similar to the NextJS app router
4.  Like how Expo manages the Apple/iOS nuts and bolts (e.g., certificates, provisioning) allowing me to focus on value. Having published an iOS app 6 years ago, this was the biggest pain point.

I started developing it a few days ago and have a working prototype which far exceeded by speed expectations. My favourite Expo feature so far has been the Metro integration which allows you to write TS code on your Mac, see the changes instantly on a real device connected over WiFi. You only need to re-install the development version of the app (through EAS) if you make "native" changes which are few and far between, like adding some new libraries, changing splash logos etc. This development workflow is simply too good and feels like we've advanced 1000x since just five years ago.

It took me back to when I first made a J2ME app for a Nokia device in 2006, which I felt at the time was groundbreaking since you could use a subset of the JDK to develop things. Kudos to Expo for creating such a good developer experience, and I'm thankful I didn't go the React Native Bare route where all the foundational work of laying out navigation, screen structure etc. is all yours to do.

When it came down to choosing a UI framework for React Native, I started looking at [React Native Paper](https://reactnativepaper.com/), [React Native Elements](https://reactnativeelements.com/) and [Tamagui](https://tamagui.dev/). RNP is great if you want Material Design and don't want to customize a lot, RNE is less polished looks-wise but more customizable, and Tamagui is simply too low-level for me to consider ([here's how to create a button](https://tamagui.dev/docs/guides/how-to-build-a-button)), but it's so aspirational in its goal of reusability that I will keep track of the project.

I ended up choosing none of them because I asked myself, what problem am I solving by getting a UI framework? Why can't I just use [NativeWind](https://www.nativewind.dev/) (basically Tailwind for React Native) and just build my components from scratch like I've done using DaisyUI and Tailwind. Expo already gives me the structures of a drawer, bottom menu, etc. which is why I would normally get a framework on the web as that's just boilerplate stuff. Expo takes care of that leaving me to deal with things like buttons, cards etc.

I simply didn't see the need to introduce a framework just so my buttons look consistent. As I had [written about earlier](https://zarar.dev/tailwind-balances-abstraction-and-transparency/), Tailwind/Nativewind is a perfect abstraction for the developer that wants control but doesn't want to get into the nitty-gritty of layout quirks.

If I had to pick a negative, I'd say the build times can be painful for EAS. I've had to wait three hours before a development build of my app is published. The pricing for builds for iOS is $2 per build and $1-2 for Android, depending on device. This means every time I have to make a native(ish) change, I got to pony up. I'm trying to estimate how many builds I actually need since most changes are reflected in the app instantly, but I can see myself paying for this product in the future. I just wish it was cheaper.

Another slight negative is that the Expo framework seems to make a lot of changes and move libraries around within the framework, and deprecate stable libraries in favour of bringing them into the main Expo framework. This can cause upgrade anxiety but I've just accepted that this anxiety is the price to pay for the seamless developer experience.

So far so good with React Native because this is a [one-door decision](https://aws.amazon.com/executive-insights/content/how-amazon-defines-and-operationalizes-a-day-1-culture/) and right now it feels like I chose the right door.
