# JavaScript执行命令

这种类型的命令允许我们执行JavaScript代码。

通过JavaScript执行命令，我们几乎可以做JavaScript允许我们做的所有事情。下面给出了一些示例。

我们仍然可以从这种类型的命令中访问`tp`对象和所有内置变量/函数。

JavaScript执行命令允许您访问全局命名空间变量。这意味着您可以访问诸如`app`或`moment`之类的内容。

## 异步函数

某些内置函数是异步的。在JavaScript执行命令中调用此类函数时，如有必要，不要忘记使用`await`关键字。

## 如何从JavaScript执行命令输出值？

有时，您可能希望在使用JS执行命令时输出某些内容。

当我们的模板引擎使用所有命令结果生成替换字符串时，它存储在名为`tR`的变量中。这个字符串将包含处理后的文件内容。您可以从JS执行命令访问该变量。

这意味着，要从JS执行命令输出内容，您只需要将要输出的内容附加到`tR`字符串变量上。

例如，以下命令：`<%* tR += "测试" %>`将输出`测试`。

### 建议器和提示

重要的是要注意`tp.system.prompt()`和`tp.system.suggester()`都需要`await`语句才能将值保存到变量中

## 示例

以下是使用JavaScript执行命令可以做的一些事情的示例：

```javascript
<%* if (tp.file.title.startsWith("Hello")) { %>
这是一个hello文件！
<%* } else { %>
这是一个普通文件！
<%* } %>
    
<%* if (tp.frontmatter.type === "seedling") { %>
这是一个seedling文件！
<%* } else { %>
这是一个普通文件！
<%* } %>
    
<%* if (tp.file.tags.contains("#todo")) { %>
这是一个待办事项文件！
<%* } else { %>
这是一个已完成文件！
<%* } %>

<%*
function log(msg) {
	console.log(msg);
}
%>
<%* log("标题: " + tp.file.title) %>
    
<%* tR += tp.file.content.replace(/stuff/, "things"); %>
```