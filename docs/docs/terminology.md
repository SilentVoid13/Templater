---
title: Terminology
---

To understand how [Templater](https://github.com/SilentVoid13/Templater) works, let's define a few terms:

- A text snippet that starts with an opening tag `<%`, ends with a closing tag `%>` and that contains an expression (variable, function, ...) is what we will call a **command**. 

- A **template** is a file that contains different commands.

There are two different types of commands you can use:

- [Internal commands](https://github.com/SilentVoid13/Templater#internal-commands). This is a command that's using predefined variables / functions that are built within the plugin. We will call such variables and functions **internal** variables and functions. As an example, `<% tp.file.title %>` is an internal variable that will return the name of the file. A complete list of the internal variables / functions is given below.
- [User defined commands](https://github.com/SilentVoid13/Templater#user-commands). This is a command that's using a user's defined function. Users can define their own functions in the plugin settings, associating a **function name** with a **system command**. A user function that returns the system command's output will then be created.