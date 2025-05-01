# Config模块

Config模块允许您访问和更新Templater的配置设置。

<!-- toc -->

## 文档

{%- for key, fn in tp.config.functions %}
### `{{ fn.definition }}` 

{{ fn.description }}

{% if fn.args %}
##### 参数

{% for arg in fn.args %}
- `{{ arg.name }}`: {{ arg.description }}
{% endfor %}
{% endif %}

{% if fn.example %}
##### 示例

```
{{ fn.example }}
```
{% endif %}
{%- endfor %}