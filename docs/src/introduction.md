# Introduction

[Templater](https://github.com/SilentVoid13/Templater) is a template plugin for Obsidian that lets you define and use templates to quickly create (parts of) notes. 

Templater's variables and functions allow you to insert and flexibly format all kinds of dynamic content into your notes. You can even write your own scripts to connect to external APIs on the web or your local computer.

Templater is one of the [most popular](https://obsidian.md/plugins?search=templater) Obsidian plugins because it's extremely useful if you often create (parts of) notes that are similar.

## Quick Example

The following template file, that is using [Templater](https://github.com/SilentVoid13/Templater) syntax:

```javascript
---
creation date: <% tp.file.creation_date() %>
modification date: <% tp.file.last_modified_date("dddd Do MMMM YYYY HH:mm:ss") %>
---

<< [[<% tp.date.now("YYYY-MM-DD", -1) %>]] | [[<% tp.date.now("YYYY-MM-DD", 1) %>]] >>

# <% tp.file.title %>

<% tp.web.daily_quote() %>
```

 Will produce the following result when inserted:

````
---
creation date: 2021-01-07 17:20
modification date: Thursday 7th January 2021 17:20:43
---

<< [[2021-04-08]] | [[2021-04-10]] >>

# Test Test

> Do the best you can until you know better. Then when you know better, do better.
> &mdash; <cite>Maya Angelou</cite>
````
