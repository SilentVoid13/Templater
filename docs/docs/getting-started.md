---
title: Getting Started
slug: /
---

[Templater](https://github.com/SilentVoid13/Templater) uses the template engine [Eta](https://eta.js.org/). This engine allows us to expose JavaScript objects to users. 

In [Templater](https://github.com/SilentVoid13/Templater), all of our variables and functions are available under the `tp` object. This means that an variable / function invocation will always start with `tp.<something>`

All of Templater's variables and functions are JavaScript objects. 

For example, `tp.file.content` is an internal variable, while `tp.date.now` is an internal function. 

To call a function, we need to use a syntax specific to functions calls: appending an opening and a closing parenthesis after the function name. As an example, we would use `tp.date.now()` to call this internal function.

A function can have arguments and optional arguments. They are placed between the opening and the closing parenthesis. 

All informations about the different arguments taken by internal variables / functions are listed below.

A command **must** have both an opening tag `<%` and a closing tag `%>`. 

A complete command using the `tp.date.now` internal function would be: `<% tp.date.now() %>`