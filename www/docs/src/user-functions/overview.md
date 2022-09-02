# User Functions

You can define your own functions in Templater.

There are two types of user functions you can use:

- [Script User Functions](./script-user-functions.md)
- [System Command User Functions](./system-user-functions.md)

## Invoking User Functions

You can call a user function using the usual function call syntax: `tp.user.<user_function_name>()`, where `<user_function_name>` is the function name you defined. 

For example, if you defined a system command user function named `echo`, a complete command invocation would look like this:

```js
<% tp.user.echo() %>
```

## No mobile support

Currently user functions are unavailable on Obsidian for mobile.