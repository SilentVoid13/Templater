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

```javascript
<pre>Clipboard content: </pre><% tp.system.clipboard() %>

<pre>Entered value: </pre><% tp.system.prompt("Please enter a value") %>
<pre>Mood today: </pre><% tp.system.prompt("What is your mood today ?", "happy") %>

<pre>Mood today: </pre><% tp.system.suggester(["Happy", "Sad", "Confused"], ["Happy", "Sad", "Confused"]) %>
<pre>Picked file: [[</pre><% (await tp.system.suggester((item) => item.basename, app.vault.getMarkdownFiles())).basename %>]]
```