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

{% for arg in fn.args %}
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
Web Daily quote:  
<% tp.web.daily_quote() %>

Web Random picture: 
<% tp.web.random_picture() %>

Web Random picture with size: 
<% tp.web.random_picture("200x200") %>

Web random picture with size + query: 
<% tp.web.random_picture("200x200", "landscape,water") %>
```
