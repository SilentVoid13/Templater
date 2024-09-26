# Commands

## Command Types

[Templater](https://github.com/SilentVoid13/Templater) defines 2 types of opening tags, that defines 2 types of **commands**:

- `<%`:  Interpolation command. It will output the result of the expression that's inside.
- `<%*`: [JavaScript execution command](./execution-command.md). It will execute the JavaScript code that's inside. It does not output anything by default.

The closing tag for a command is always the same: `%>`

## Command utilities

In addition to the different types of commands, you can also use command utilities. They are also declared in the opening tag of the command. All command utilities work with all command types. The available command utilities are:

- [Whitespace Control](./whitespace-control.md)
- [Dynamic Commands](./dynamic-command.md)

