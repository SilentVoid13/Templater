# Frontmatter模块

{{ tp.frontmatter.description }}

<!-- toc -->

## 文档

### `tp.frontmatter.<frontmatter变量名>` 

获取文件frontmatter变量的值。

如果您的frontmatter变量名称包含空格，可以使用方括号表示法引用它，如下所示：

````
<% tp.frontmatter["包含空格的变量名"] %>
````

## 示例

假设您有以下文件：

````
---
alias: myfile
note type: seedling
---

文件内容
````

那么您可以使用以下模板：

````
文件元数据别名：<% tp.frontmatter.alias %>
笔记类型：<% tp.frontmatter["note type"] %>
````

对于frontmatter中的列表，您可以使用JavaScript数组原型方法来操作数据的显示方式。

```
---
categories:
  - book
  - movie
---
```

```
<% tp.frontmatter.categories.map(prop => `  - "${prop}"`).join("\n") %>
```