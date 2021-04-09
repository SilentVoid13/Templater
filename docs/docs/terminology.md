---
title: Terminology
---

To understand how [Templater](https://github.com/SilentVoid13/Templater) works, let's define a few terms:

- A **template** is a file that contains **commands**.
- A text snippet that starts with an opening tag `<%`, ends with a closing tag `%>` and that contains some **variable / function** is what we will call a **command**. You can also call a command a **placeholder** if you prefer. Go [here](eta-features/) to find  some more advanced usage for commands.
- A **variable or a function** is an object that we can invoke using a **command** and that returns a value (the replacement string)

There are two types of variables / functions you can use:

- [Internal variables / functions](internal-variables-functions/overview). They are **predefined** variables / functions that are built within the plugin. As an example, `tp.file.title` is an internal variable that will return the name of the file. You can find a list of all the internal variables and functions [here](internal-variables-functions/overview).
- [User defined functions](user-functions/overview). Users can define their own functions in the plugin settings, associating a **function name** with a **system command**. [Templater](https://github.com/SilentVoid13/Templater) will then create the function that returns the system command's output when invoked.

To summarize things, we have the following idea: 

````
Templates contains Commands that contains Variables / Functions
Templates -------> Commands ------------> Variables / Functions
````

For example, the following template contains 2 commands:

```
Yesterday: <% tp.date.yesterday("YYYY-MM-DD") %>
Tomorrow: <% tp.date.tomorrow("YYYY-MM-DD") %>
```

We'll see in the next part the syntax required to write some commands.