# Date模块

{{ tp.date.description }}

<!-- toc -->

## 文档

函数文档使用特定语法。更多信息[在此](../../syntax.md#函数文档语法)。

{%- for key, fn in tp.date.functions %}
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

## Moment.js

Templater提供了对`moment`对象的访问，可以使用它的所有功能。

关于moment.js的更多信息[在此](https://momentjs.com/docs/#/displaying/)。

{% if tp.date.momentjs.examples %}
##### 示例

```javascript
{% for example in tp.date.momentjs.examples -%}
// {{ example.name}}
{{ example.example }}
{% endfor -%}
```
{% endif %}

## 示例

```javascript
{%- for key, fn in tp.date.functions %}
{% for example in fn.examples -%}
// {{ example.name}}
{{ example.example }}
{% endfor -%}
{%- endfor %}
```