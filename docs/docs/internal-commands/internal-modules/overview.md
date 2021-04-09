---
title: Overview
---

Below is the documentation of every internal module of [Templater](https://github.com/SilentVoid13/Templater).

The documentation for an internal function will be in the following form:  `tp.<module_name>.<internal_variable_or_function_name>(arg1_name: type, arg2_name: type, ...)`. 

**Warning**: Please note that this syntax is for documentation purposes only, to be able to understand what the function expects. You won't need to specify the name nor the type of the argument that you pass to a function, only the value of that argument is required.

The type is the expected type for the argument. This type must be respected when calling the internal function, or it will throw an error.

- A `string` type means the value must be placed within simple or double quotes (`"value"` or `'value'`)
- A `number` type means the value must be an integer (`15`, `-5`, ...)
- A `boolean` type means the value must be either `true` or `false` (completely lower case), but nothing else.

All arguments must be passed in the correct order.

If an argument is optional, it will be appended with a question mark `?` in the documentation, e.g. `arg1?: type`

If an argument has a default value, it will be specified using an equal `=` sign in the documentation, e.g. `arg1: string = 'default value'`.

Let's take the `tp.date.now` internal function documentation as an example: `tp.date.now(format: string = "YYYY-MM-DD", offset?: number, reference?: string, reference_format?: string)`

When reading this, we understand that `tp.date.now` is an internal function, and not an internal variable, because of the opening / closing parenthesis. This internal function has 4 optional arguments: 

- a format of type `string`, with a default value of `"YYYY-MM-DD"`.
- an offset of type `number` .
- a reference of type `string` .
- a reference_format of type `string` .

That means that a valid internal command for this internal function could be `<% tp.date.now() %>` because all of its arguments are optional, but `<% tp.date.now("YYYY-MM-DD", 7) %>` is also valid.