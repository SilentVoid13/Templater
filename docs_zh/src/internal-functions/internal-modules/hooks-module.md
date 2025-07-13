# Hooks模块

Hooks模块允许您在特定事件发生时注册回调函数。

<!-- toc -->

## 文档

函数文档使用特定语法。更多信息[在此](../../syntax.md#函数文档语法)。

### `tp.hooks.on_all_templates_executed(callback)` 

当当前活动文件中的所有模板都已执行完毕时调用。

##### 参数

- `callback`: 在所有模板执行完毕后要调用的回调函数。

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