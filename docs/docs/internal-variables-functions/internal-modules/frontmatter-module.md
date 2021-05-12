---
title: Frontmatter Module
---

This modules exposes all the frontmatter variables of a file as internal variables.

## Documentation

:::tip

Function documentation is using a specific syntax. More informations [here](../../syntax.md#function-documentation-syntax)

:::

| Internal Variable / Function                 | Arguments | Description                                      | Example Output |
| -------------------------------------------- | --------- | ------------------------------------------------ | -------------- |
| `tp.frontmatter.<frontmatter_variable_name>` | None      | Retrieves the file's frontmatter variable value. | `value`        |

:::note

- If your frontmatter variable name contains spaces, you can reference it using the bracket notation like so: 

  ````
  <% tp.frontmatter["variable name with spaces"] %>
  ````

:::

## Examples

Let's say you have the following file:

````
---
alias: myfile
note type: seedling
---

file content
````

Then you can use the following template:

````javascript
File's metadata alias: <% tp.frontmatter.alias %>
Note's type: <% tp.frontmatter["note type"] %>
````