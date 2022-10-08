# Frontmatter Module

{{ tp.frontmatter.description }}

<!-- toc -->

## Documentation

### `tp.frontmatter.<frontmatter_variable_name>` 

Retrieves the file's frontmatter variable value.

If your frontmatter variable name contains spaces, you can reference it using the bracket notation like so: 

````
<% tp.frontmatter["variable name with spaces"] %>
````

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
<pre>File's metadata alias: </pre><% tp.frontmatter.alias %>
<pre>Note's type: </pre><% tp.frontmatter["note type"] %>
````