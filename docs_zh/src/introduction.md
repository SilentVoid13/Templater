# 简介

[Templater](https://github.com/SilentVoid13/Templater) 是一种模板语言，允许你在笔记中插入**变量**和**函数**的结果。它还允许你执行JavaScript代码来操作这些变量和函数。

通过 [Templater](https://github.com/SilentVoid13/Templater)，你将能够创建强大的模板来自动化手动任务。

## 快速示例

以下是使用 [Templater](https://github.com/SilentVoid13/Templater) 语法的模板文件：

```javascript
---
creation date: <% tp.file.creation_date() %>
modification date: <% tp.file.last_modified_date("dddd Do MMMM YYYY HH:mm:ss") %>
---

<< [[<% tp.date.now("YYYY-MM-DD", -1) %>]] | [[<% tp.date.now("YYYY-MM-DD", 1) %>]] >>

# <% tp.file.title %>

<% tp.web.daily_quote() %>
```

插入后将产生以下结果：

````
---
creation date: 2021-01-07 17:20
modification date: Thursday 7th January 2021 17:20:43
---

<< [[2021-04-08]] | [[2021-04-10]] >>

# Test Test

> Do the best you can until you know better. Then when you know better, do better.
> &mdash; <cite>Maya Angelou</cite>
````