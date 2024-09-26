# Date Module

{{ tp.date.description }}

<!-- toc -->

## Documentation

Function documentation is using a specific syntax. More information [here](../../syntax.md#function-documentation-syntax).

{%- for key, fn in tp.date.functions %}
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

## Moment.js

Templater gives you access to the `moment` object, with all of its functionalities.

More information on moment.js [here](https://momentjs.com/docs/#/displaying/).

{% if tp.date.momentjs.examples %}
##### Examples

```javascript
{% for example in tp.date.momentjs.examples -%}
// {{ example.name}}
{{ example.example }}
{% endfor -%}
```
{% endif %}

## Examples

```javascript
{%- for key, fn in tp.date.functions %}
{% for example in fn.examples -%}
// {{ example.name}}
{{ example.example }}
{% endfor -%}
{%- endfor %}
```