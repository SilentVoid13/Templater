# Terminology

To understand how Templater works, let's define a few terms:

## Template

A template is (just) an Obsidian note that contains 0 or more Templater [commands](#command). Templates should be located in a separate directory to separate them from regular Obsidian notes. The Templater plugin should be configured correctly so it knows where to find these templates.

A template can have 0 commands, but most will have at least 1 command.

## Command

A **[command](./commands/overview.md)** is a bit of JavaScript code surrounded by an opening tag `<%` and a closing tag `%>`.

```JavaScript
<% tp.file.title %>
<%* console.log('test') %>
```

The `<%` opening tag defines an ["interpolation command"](./commands/interpolation-command.md). 

The `<%*` opening tag defines an ["execution command"](./commands/execution-command.md). 

### Command utilities

[Command utilities](./commands/utilities.md) allow you to change some of the behaviour of commands.

## Code: Variables, functions, modules

The code between the tags of a command is JavaScript code. This code will be run by Templater. If the command is an [interpolation command](./commands/interpolation-command.md) it will be replaced by the result of the JavaScript code. If the command is an [execution command](./commands/execution-command.md) the command will only run. If an execution command needs to change the content of the note that behaviour needs to be defined in the command.








A **function** is something we can "invoke" or "call" inside a **command**. Templater has built-in functions and you can define your own.


There are different types of functions you can use:

- [Internal functions](./internal-functions/overview.md) are predefined functions that are built-in to Templater. For example, `tp.date.now` is an internal function that will return the current date.
- [User functions](./user-functions/overview.md) are functions defined by a user. User functions can be [script user functions](./user-functions/script-user-functions.md) or [system command user functions](./user-functions/system-user-functions.md).

### Example

The following template contains 2 commands, calling 2 different internal functions:

```
Yesterday: <% tp.date.yesterday("YYYY-MM-DD") %>
Tomorrow: <% tp.date.tomorrow("YYYY-MM-DD") %>
```


