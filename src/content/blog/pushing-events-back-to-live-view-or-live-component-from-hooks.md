---
title: "Pushing events back to Live View or Live Component from Hooks"
date: 2025-11-05T01:34Z
---

When writing hooks in Phoenix LiveView the pattern of pushing events from the JavaScript hook back to the Live View or Live Component is a little different.

1.  When pushing to a Live View Component, you have to use `pushEventTo` and specify the DOM `id` of the element present in the Live Component's template
2.  When pushing to a Live Component, you have to use `pushEvent` and it will call the `handle_event` in the Live View.

The pattern that I've been using from the hook is similar to this:

```
if (this.el.dataset.from_live_component) {
	this.pushEventTo(`#${this.el.id}`, 'file_removed', {
		id: this.el.id
	});
} else {
	this.pushEvent('file_removed', {
		id: this.el.id
	});
}
```

The only difference when using the hook from the Live Component is that you specify an additional `data-from_live_component` property to tell the hook how to push events back:

```
 <div id="my-unique-dom-id" phx-hook="MyHook" data-from-live_component="anything"></div>
```

One small note: the `id` is important as the event will be pushed to all Live Components that may be rendered, so if you only want to process this event of a particular Live Component, then something like this is needed:

```
def handle_event("file_removed", %{id: id}, socket) do 
	if id == "my-components-unique-id" do 
		# process event
	else
		# do not process event as this event is intended 
                # for another live component	
	end
        {:noreply, socket}
end
```

That's it!
