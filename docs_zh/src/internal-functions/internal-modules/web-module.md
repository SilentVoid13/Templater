# Web模块

Web模块提供与网络资源交互的功能，允许您获取网页内容或生成URL。

<!-- toc -->

## 文档

函数文档使用特定语法。更多信息[在此](../../syntax.md#函数文档语法)。

### `tp.web.daily_quote()` 

从https://api.quotable.io/random获取每日名言。

##### 示例

```javascript
// 基本用法
<% tp.web.daily_quote() %>
```

### `tp.web.random_picture(size, query, provider)` 

从Unsplash获取随机图片。

##### 参数

- `size`: 图片尺寸，格式为"宽度x高度"，例如"200x300"。
- `query`: 搜索查询，以获取特定类型的图片。
- `provider`: 提供商，目前只支持"unsplash"。

##### 示例

```javascript
// 基本用法
<% tp.web.random_picture() %>

// 指定尺寸
<% tp.web.random_picture("200x200") %>

// 使用查询
<% tp.web.random_picture("200x200", "nature") %>
```

## 示例

```javascript
// 基本用法
<% tp.web.daily_quote() %>

// 基本用法
<% tp.web.random_picture() %>

// 指定尺寸
<% tp.web.random_picture("200x200") %>

// 使用查询
<% tp.web.random_picture("200x200", "nature") %>
```