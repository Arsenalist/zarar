---
title: "Painless widget development using Web Components"
date: 2024-12-04T14:46Z
---

I've been trying to find a good solution for having responsive widgets which people can use to embed show listings, sign-up forms and the like on their websites, and have finally come to a good solution: Web Components (with [Stencil](https://stenciljs.com/) to make things easier). It's got an acceptable [97% caniuse rating](https://caniuse.com/custom-elementsv1) (Safari having some caveats).

The iframe-based solutions were all unsatisfactory for a few different reasons:

1.  iframe height resizing is an absolute pain. Yes, there are libraries that help with this but they all involve having something on the parent and child page, and I don't have that luxury. The [iframe-resizer library](https://github.com/davidjbradshaw/iframe-resizer) (not free anymore) did this fairly well but it requires context-specific configuration to be part of the parent page. People who use my widgets wouldn't know this and I can't predict how they'll use them so can't given them the right embed code easily.
    
2.  CMS apps embed iframes differently. I have to support Squarespace and Wix to name a few, and they all treat iframes in varying ways. For example, Wix embeds your iframe code in their own iframe which causes all kinds of issues. I can't rely on hosts embedding the same code deterministically.
    
3.  Contextual CSS styling isn't possible with iframes. I want my widget to inherit the host's font family, background and other styling. Since iframes are isolated from the host's DOM, I can't inherit, say, the `<body>` styling into my widget.
    

Web Components solve this problem as they load my widget code into the actual DOM of the host website. Then I have control over what gets rendered into the DOM element and can manipulate it using the shadow DOM. This is where Stencil comes in and makes life easier by making shadow DOM manipulation easier, including state management and event handling.

As a bonus, Stencil offers backward compatible ways of loading web components for situations where `import` statements aren't supported (e.g., Wix) and you have to rely on ES5/lazy loading. I wrote earlier about [balancing abstraction and transparency](https://zarar.dev/tailwind-balances-abstraction-and-transparency/) and the design principles the Stencil team uses strikes it. You're writing code like:

```
@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {
   @Prop() my_prop
   @State() counter = 1

   render() {
      return <button onClick={() => this.counter++}>
                {this.my_prop} {this.counter}
             </button>
   }
}  
```

The above blends a few different ideas while still looking pretty much like how you'd write a vanilla web component. Except that you get easily configurable props, state management, JSX-style rendering and, as mentioned earlier, comes with [distribution targets](https://stenciljs.com/docs/output-targets) to meet any needs.

It's early days for me, but so far this looks like a sound choice in how to distribute widgets.
