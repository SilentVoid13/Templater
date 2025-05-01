# Hooks模块

{{ tp.hooks.description }}

<!-- toc -->

## 文档

函数文档使用特定语法。更多信息[在此](../../syntax.md#函数文档语法)。


{%- for key, fn in tp.hooks.functions %}
### `{{ fn.definition }}` 

{{ fn.description }}

{% if fn.args %}
##### 参数

{% for arg in fn.args %}
- `{{ arg.name }}`: {{ arg.description }}
{% endfor %}
{% endif %}
{%- endfor %}

## 示例

```javascript
// 模板执行完成后更新frontmatter
<%*
tp.hooks.on_all_templates_executed(async () => {
  const file = tp.file.find_tfile(tp.file.path(true));
  await tp.app.fileManager.processFrontMatter(file, (frontmatter) => {
    frontmatter["key"] = "value";
  });
});
%>
// Templater更新文件后，从另一个插件运行修改当前文件的命令
<%*
tp.hooks.on_all_templates_executed(() => {
  tp.app.commands.executeCommandById("obsidian-linter:lint-file");
});
-%>
```