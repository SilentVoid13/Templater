# System模块

System模块包含与系统交互相关的函数，例如复制到剪贴板、显示提示或创建建议器。

<!-- toc -->

## 文档

函数文档使用特定语法。更多信息[在此](../../syntax.md#函数文档语法)。

### `tp.system.clipboard()`

返回剪贴板的内容。

##### 示例

```javascript
// 基本用法
<% tp.system.clipboard() %>
```

### `tp.system.prompt(prompt_text, default_value, throw_on_cancel, multiline)`

显示一个提示窗口，要求用户输入内容。

##### 参数

- `prompt_text`: 显示给用户的提示文本。
- `default_value`: 提示中的默认值。默认为空字符串。
- `throw_on_cancel`: 如果为true，当用户取消提示时抛出错误。默认为false。
- `multiline`: 如果为true，显示多行输入框。默认为false。

##### 示例

```javascript
// 基本用法
<% tp.system.prompt("请输入文本") %>

// 带默认值
<% tp.system.prompt("请输入文本", "默认值") %>

// 多行输入
<% tp.system.prompt("请输入多行文本", "", false, true) %>
```

### `tp.system.suggester(text_items, items, throw_on_cancel, placeholder, limit)`

显示一个带有自动完成功能的建议器，让用户从列表中选择一个项目。

##### 参数

- `text_items`: 要向用户显示的文本项目数组。
- `items`: 选择相应文本项目时返回的值数组。默认为`text_items`。
- `throw_on_cancel`: 如果为true，当用户取消建议器时抛出错误。默认为false。
- `placeholder`: 建议器的占位符文本。默认为空字符串。
- `limit`: 要显示的项目数量限制。默认为无限制。

##### 示例

```javascript
// 基本用法
<% tp.system.suggester(["选项1", "选项2", "选项3"], ["值1", "值2", "值3"]) %>

// 使用相同的文本和值
<% tp.system.suggester(["值1", "值2", "值3"]) %>

// 带有占位符
<% tp.system.suggester(["选项1", "选项2", "选项3"], ["值1", "值2", "值3"], false, "请选择一个选项") %>
```

## 示例

```javascript
// 基本用法
<% tp.system.clipboard() %>

// 基本用法
<% tp.system.prompt("请输入文本") %>

// 带默认值
<% tp.system.prompt("请输入文本", "默认值") %>

// 多行输入
<% tp.system.prompt("请输入多行文本", "", false, true) %>

// 基本用法
<% tp.system.suggester(["选项1", "选项2", "选项3"], ["值1", "值2", "值3"]) %>

// 使用相同的文本和值
<% tp.system.suggester(["值1", "值2", "值3"]) %>

// 带有占位符
<% tp.system.suggester(["选项1", "选项2", "选项3"], ["值1", "值2", "值3"], false, "请选择一个选项") %>
```