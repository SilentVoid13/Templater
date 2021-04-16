---
title: System Module
---

This module contains system related variables and functions.

## Documentation

:::tip

Function documentation is using a specific syntax. More informations [here](../../syntax#function-documentation-syntax)

:::

| Internal Variable / Function                                 | Arguments                                                    | Description                                         | Example Output           |
| ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------------------------------- | ------------------------ |
| `tp.file.clipboard()`                                        | None                                                         | Retrieves the clipboard's content                   | `This is my copied text` |
| `tp.system.prompt(prompt_text?: string, default_value?: string)` | - `prompt_text`: Text placed above the input field<br />- `default_value`: A default value for the input filed | Spawns a prompt modal and returns the user's input. | `A value I entered`      |

## Examples

```javascript
Clipboard content: <% tp.system.clipboard() %>

Entered value: <% tp.system.prompt("Please enter a value") %>
Mood today: <% tp.system.prompt("What is your mood today ?", "happy") %>
```