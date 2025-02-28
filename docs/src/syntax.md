# Syntax

[Templater](https://github.com/SilentVoid13/Templater) uses a custom templating engine ([rusty_engine](https://github.com/SilentVoid13/rusty_engine)) syntax to declare a command. You may need a bit of time to get used to it, but once you get the idea, the syntax is not that hard.

All of Templater's functions are JavaScript objects that are invoked using a **command**.

## Command syntax

A command **must** have both an opening tag `<%` and a closing tag `%>`. 

A complete command using the `tp.date.now` internal function would be: `<% tp.date.now() %>`

## Function syntax

### Objects hierarchy

All of Templater's functions, whether it's an internal function or a user function, are available under the `tp` object. You could say that all our functions are children of the `tp` object. To access the "child" of an object, we have to use the dot notation `.`  

This means that a Templater function invocation will always start with `tp.<something>`

#### Function invocation

To invoke a function, we need to use a syntax specific to functions calls: appending an opening and a closing parenthesis after the function name. 

As an example, we would use `tp.date.now()` to invoke the `tp.date.now` internal function.

A function can have arguments and optional arguments. They are placed between the opening and the closing parenthesis, like so:

```javascript
tp.date.now(arg1_value, arg2_value, arg3_value, ...)
```

All arguments must be passed in the correct order.

The arguments of a function can have different **types**. Here is a non-exhaustive list of the possible types of a function:

- A `string` type means the value must be placed within simple or double quotes (`"value"` or `'value'`)
- A `number` type means the value must be an integer (`15`, `-5`, ...)
- A `boolean` type means the value must be either `true` or `false` (completely lower case), and nothing else.

The type of an argument must be respected when calling a function, or it won't work.

### Function documentation syntax

The documentation for the internal functions of Templater are using the following syntax:

```javascript
tp.<my_function>(arg1_name: type, arg2_name?: type, arg3_name: type = <default_value>, arg4_name: type1|type2, ...)
```

Where:

- `arg_name` represents a **symbolic** name for the argument, to understand what it is.
- `type` represents the expected type for the argument. This type must be respected when calling the internal function, or it will throw an error.

If an argument is optional, it will be appended with a question mark `?`, e.g. `arg2_name?: type`

If an argument has a default value, it will be specified using an equal sign `=`, e.g. `arg3_name: type = <default_value>`.

If an argument can have different types, it will be specified using a pipe `|`, e.g. `arg4_name: type1|type2`

#### Syntax warning

Please note that this syntax is for documentation purposes only, to be able to understand what arguments the function expects. 

You mustn't specify the name nor the type nor the default value of an argument when calling a function. Only the value of the arguments are required, as explained [here](./syntax.md#function-invocation)

##### Example

Let's take the `tp.date.now` internal function documentation as an example: 

```
tp.date.now(format?: string = "YYYY-MM-DD", offset?: number|string, reference?: string, reference_format?: string)
```

This internal function has 4 optional arguments: 

- a format of type `string`, with a default value of `"YYYY-MM-DD"`.
- an offset of type `number` or of type `string`.
- a reference of type `string` .
- a reference_format of type `string` .

That means that **valid invocations** for this internal function are:

- `<% tp.date.now() %>`
- `<% tp.date.now("YYYY-MM-DD", 7) %>`
- `<% tp.date.now("YYYY-MM-DD", 7, "2021-04-09", "YYYY-MM-DD") %>`
- `<% tp.date.now("dddd, MMMM Do YYYY", 0, tp.file.title, "YYYY-MM-DD") %>` *Assuming the file name is of the format: "YYYY-MM-DD"

On the other hand, **invalid invocations** are:

- `tp.date.now(format: string = "YYYY-MM-DD")`
- `tp.date.now(format: string = "YYYY-MM-DD", offset?: 0)`
