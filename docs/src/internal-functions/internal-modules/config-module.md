# Config Module

{{ tp.config.description }}

<!-- toc -->

## Documentation

{%- for key, fn in tp.config.functions %}
### `{{ fn.definition }}` 

{{ fn.description }}

{% if fn.args %}
##### Arguments

{% for arg in fn.args %}
- `{{ arg.name }}` (*{{ arg.type }}*): {{ arg.description }}
{% if arg.default != undefined %} (default: `{{ arg.default }}`){% endif %}
{% endfor %}
{% endif %}

{% if fn.return %}
##### Returns

- *{{ fn.return.type }}*: {{ fn.return.description }}
{% endif %}

{% if fn.example %}
##### Example

```
{{ fn.example }}
```
{% endif %}
{%- endfor %}