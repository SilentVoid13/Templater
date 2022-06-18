# System Module

{{ tp.system.description }}

<!-- toc -->

## Documentation

Function documentation is using a specific syntax. More information [here](../../syntax.md#function-documentation-syntax)

{%- for key, fn in tp.system.functions %}
### `{{ fn.definition }}` 

{{ fn.description }}

{% if fn.args %}
##### Arguments

{% for key, arg in fn.args %}
- `{{ arg.name }}`: {{ arg.description }}
{% endfor %}
{% endif %}

{% if fn.example %}
##### Example

```
{{ fn.example }}
```
{% endif %}
{%- endfor %}

## Examples
### Paste from clipboard
```javascript
Clipboard content: <% tp.system.clipboard() %>
```
### Standard prompt, will return null if cancelled.
```javascript
Entered value: <% tp.system.prompt("Please enter a value") %>
```
### Same prompt, but will stop the rest of the script if cancelled.
```javascript
Entered value: <% tp.system.prompt("Please enter a value", throw_on_cancel = true) %>
```
### Ask a question and pre-fill a suggested answer.
```javascript
Mood today: <% tp.system.prompt("What is your mood today ?", "happy") %>
```
### Ask a question and have the user select from a (searchable) list to ensure the correct spelling. 
```javascript
Mood today: <% tp.system.suggester(["Happy", "Sad", "Confused"], ["Happy", "Sad", "Confused"], throw_on_cancel = true) %>
```
### Have the user select a file from the vault.
```javascript
Picked file: [[<% (await tp.system.suggester((item) => item.basename, app.vault.getMarkdownFiles())).basename %>]]
```
