---
title: System Module
---

This module contains system related variables and functions.

## Documentation

:::tip

Function documentation is using a specific syntax. More informations [here](../../syntax.md#function-documentation-syntax)

:::

| Internal Variable / Function                                 | Arguments                                                    | Description                                                  | Example Output           |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------ |
| `tp.system.clipboard()`                                      | None                                                         | Retrieves the clipboard's content                            | `This is my copied text` |
| `tp.system.prompt(prompt_text?: string, default_value?: string, throw_on_cancel: boolean = false)` | - `prompt_text`: Text placed above the input field<br />- `default_value`: A default value for the input filed<br />- `throw_on_cancel`: Throws an error if the prompt is canceled, instead of returning a `null` value. | Spawns a prompt modal and returns the user's input.          | `A value I entered`      |
| `tp.system.suggester(text_items: string[] ⎮ ((item: T) => string), items: T[], throw_on_cancel: boolean = false, placeholder: string = "")` | - `text_items`: Array of strings representing the text that will be displayed for each item in the suggester prompt. This can also be a function that maps an item to its text representation.<br />- `items`: Array containing the values of each item in the correct order.<br />- `throw_on_cancel`: Throws an error if the suggester prompt is canceled, instead of returning a `null` value.<br />- `placeholder`: Placeholder string of the prompt. | Spawns a suggester prompt and returns the user's chosen item. | `A value I chose`        |

## Examples

```javascript
Clipboard content: <% tp.system.clipboard() %>

Entered value: <% tp.system.prompt("Please enter a value") %>
Mood today: <% tp.system.prompt("What is your mood today ?", "happy") %>

Mood today: <% tp.system.suggester(["Happy", "Sad", "Confused"], ["Happy", "Sad", "Confused"]) %>
Picked file: [[<% (await tp.system.suggester((item) => item.basename, app.vault.getMarkdownFiles())).basename %>]]
```