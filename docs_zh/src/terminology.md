# 术语

在Templater中，我们使用以下术语：

- **命令**：一个由开始标签`<%`和结束标签`%>`包围的代码块，例如`<% tp.date.now() %>`。命令是用户与Templater交互的基本方式。

- **内置函数**：Templater预定义的函数，用于执行特定任务，如`tp.date.now()`、`tp.file.title`等。这些函数按功能分组到不同的模块中。

- **用户函数**：用户自定义的函数，可以是JavaScript脚本或系统命令。

- **变量**：存储值的容器，如`tp`（Templater的主对象）或`tR`（模板结果）。

### 示例

以下模板包含2个命令，调用2个不同的内置函数：

```
昨天: <% tp.date.yesterday("YYYY-MM-DD") %>
明天: <% tp.date.tomorrow("YYYY-MM-DD") %>
```

我们将在下一部分看到编写命令所需的语法。