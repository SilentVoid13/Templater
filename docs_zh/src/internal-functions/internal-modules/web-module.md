# Web模块

{{ tp.web.description }}

<!-- toc -->

## 文档

函数文档使用特定语法。更多信息[在此](../../syntax.md#函数文档语法)。

{%- for key, fn in tp.web.functions %}
### `{{ fn.definition }}` 

{{ fn.description }}

{% if fn.args %}
##### 参数

{% for arg in fn.args %}
- `{{ arg.name }}`: {{ arg.description }}
{% endfor %}
{% endif %}

{% if fn.examples %}
##### 示例

```javascript
{% for example in fn.examples -%}
// {{ example.name}}
{{ example.example }}
{% endfor -%}
```
{% endif %}
{%- endfor %}

## 示例

```javascript
{%- for key, fn in tp.web.functions %}
{% for example in fn.examples -%}
// {{ example.name}}
{{ example.example }}
{% endfor -%}
{%- endfor %}
```