# App模块

{{ tp.app.description }}

这主要在编写脚本时有用。

更多信息请参考Obsidian的[开发者文档](https://docs.obsidian.md/Reference/TypeScript+API/App)。

## 示例

```javascript
// 获取所有文件夹
<%
tp.app.vault.getAllLoadedFiles()
  .filter(x => x instanceof tp.obsidian.TFolder)
  .map(x => x.name)
%>

// 更新现有文件的frontmatter
<%*
const file = tp.file.find_tfile("path/to/file");
await tp.app.fileManager.processFrontMatter(file, (frontmatter) => {
  frontmatter["key"] = "value";
});
%>
```