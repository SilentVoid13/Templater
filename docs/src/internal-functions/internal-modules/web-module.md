# Web Module

{{ tp.web.description }}

<!-- toc -->

## Documentation

Function documentation is using a specific syntax. More information [here](../../syntax.md#function-documentation-syntax)

{%- for key, fn in tp.web.functions %}
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
<pre>Web Daily quote: </pre>
<% tp.web.daily_quote() %>

<pre>Web Random picture: </pre>
<% tp.web.random_picture() %>

<pre>Web Random picture with size: </pre>
<% tp.web.random_picture("200x200") %>

<pre>Web random picture with size + query: </pre>
<% tp.web.random_picture("200x200", "landscape,water") %>
```
