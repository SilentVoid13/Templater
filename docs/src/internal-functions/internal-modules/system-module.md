# System Module

{{ tp.system.description }}

<!-- toc -->

## Documentation

Function documentation is using a specific syntax. More information [here](../../syntax.md#function-documentation-syntax).

{%- for key, fn in tp.system.functions %}
### `{{ fn.definition }}` 

{{ fn.description }}

{% if fn.args %}
##### Arguments

{% for arg in fn.args %}
- `{{ arg.name }}`: {{ arg.description }}
{% endfor %}
{% endif %}

{% if fn.examples %}
##### Examples

```javascript
{% for example in fn.examples -%}
// {{ example.name}}
{{ example.example }}
{% endfor -%}
```
{% endif %}
{%- endfor %}

## Examples

```javascript
{%- for key, fn in tp.system.functions %}
{% for example in fn.examples -%}
// {{ example.name}}
{{ example.example }}
{% endfor -%}
{%- endfor %}
```
