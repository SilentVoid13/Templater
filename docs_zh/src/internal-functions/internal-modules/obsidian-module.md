# Obsidian模块

Obsidian模块提供对Obsidian API的访问，允许您使用Obsidian的内部功能。

这主要在编写脚本时有用。

更多信息请参考Obsidian API的[声明文件](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)。

## 示例

```javascript
// 获取所有文件夹
<%
tp.app.vault.getAllLoadedFiles()
  .filter(x => x instanceof tp.obsidian.TFolder)
  .map(x => x.name)
%>

// 规范化路径
<% tp.obsidian.normalizePath("Path/to/file.md") %>

// HTML转Markdown
<% tp.obsidian.htmlToMarkdown("\<h1>标题\</h1>\<p>段落\</p>") %>

// HTTP请求
<%*
const response = await tp.obsidian.requestUrl("https://jsonplaceholder.typicode.com/todos/1");
tR += response.json.title;
%>
```