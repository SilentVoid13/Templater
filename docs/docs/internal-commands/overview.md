---
title: Overview
---

Internal commands are commands using internal variables and functions built within [Templater](https://github.com/SilentVoid13/Templater).

The different internal variables and functions offered by [Templater](https://github.com/SilentVoid13/Templater) are sorted by modules. The existing internal modules are:

- Date module
- File module
- Frontmatter module
- Web module

You can use an internal command using the following structure: ` <% tp.<module_name>.<internal_variable_or_function_name> %>`

As I said before, some internal functions are requiring arguments. Arguments must be passed between the opening and the closing parenthesis like so: `tp.<module_name>.<internal_variable_or_function_name>(arg1, arg2, arg3, ...)`. 

I invite everyone to contribute to this plugin development by adding new internal functions / variables. Check [INTERNAL_COMMANDS](https://github.com/SilentVoid13/Templater/blob/master/docs/INTERNAL_COMMANDS.md) for more informations