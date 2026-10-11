---
title: "NY Times Fade Text CSS Effect"
date: 2025-11-19T18:07Z
---

```
/* Fade-out gradient effect for truncated text */
.text-opacity-gradient {
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 1) 60%,
    rgba(0, 0, 0, 0.3) 90%,
    rgba(0, 0, 0, 0) 100%
  );
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 1) 60%,
    rgba(0, 0, 0, 0.3) 90%,
    rgba(0, 0, 0, 0) 100%
  );
}
```

```
<div class="text-opacity-gradient">
your text here
</div>
```

.text-opacity-gradient { -webkit-mask-image: linear-gradient( to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0.3) 90%, rgba(0, 0, 0, 0) 100% ); mask-image: linear-gradient( to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0.3) 90%, rgba(0, 0, 0, 0) 100% ); }

Example:

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc justo enim, vehicula ut bibendum vel, tincidunt ac ligula. Cras nec tempor dolor. Sed non elit quis urna sagittis maximus eget ac dui. Nunc nec lectus sit amet leo tempus aliquam ut quis ex. Sed sodales euismod tellus non congue. Ut dictum eu eros eget rutrum. Duis porttitor ligula sed auctor vestibulum. Nulla dignissim ex ut dignissim ullamcorper. Aenean at felis id nisi rhoncus tristique. Donec eu purus mauris. Duis ornare malesuada molestie. Donec cursus lobortis tortor et commodo. Proin nibh mi, maximus a neque eget, posuere tincidunt metus. Donec elementum cursus tortor, eu bibendum tellus convallis eget.
