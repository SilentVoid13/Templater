# 语法

[Templater](https://github.com/SilentVoid13/Templater) 使用自定义模板引擎（[rusty_engine](https://github.com/SilentVoid13/rusty_engine)）语法来声明命令。您可能需要一些时间来适应它，但一旦理解了基本概念，这种语法并不难掌握。

Templater的所有函数都是JavaScript对象，通过**命令**调用。

## 命令语法

命令**必须**同时包含开始标签`<%`和结束标签`%>`。

使用`tp.date.now`内置函数的完整命令示例：`<% tp.date.now() %>`

## 函数语法

### 对象层次结构

Templater的所有函数，无论是内置函数还是用户函数，都在`tp`对象下可用。可以说所有函数都是`tp`对象的子对象。要访问对象的"子对象"，我们需要使用点表示法`.`。

这意味着Templater函数调用总是以`tp.<something>`开始。

#### 函数调用

要调用函数，我们需要使用函数调用的特定语法：在函数名后附加一个开括号和一个闭括号。

例如，我们使用`tp.date.now()`来调用`tp.date.now`内置函数。

函数可以有参数和可选参数。它们放在开括号和闭括号之间，如下所示：

```javascript
tp.date.now(arg1_value, arg2_value, arg3_value, ...)
```

所有参数必须按正确顺序传递。

函数的参数可以有不同的**类型**。以下是函数可能的类型的非详尽列表：

- `string`类型表示值必须放在单引号或双引号内（`"value"`或`'value'`）
- `number`类型表示值必须是整数（`15`、`-5`等）
- `boolean`类型表示值必须是`true`或`false`（完全小写），不能是其他值。

调用函数时必须遵守参数的类型，否则函数将无法正常工作。

### 函数文档语法

Templater内置函数的文档使用以下语法：

```javascript
tp.<my_function>(arg1_name: type, arg2_name?: type, arg3_name: type = <default_value>, arg4_name: type1|type2, ...)
```

其中：

- `arg_name`表示参数的**符号性**名称，以便理解其用途。
- `type`表示参数的预期类型。调用内置函数时必须遵守此类型，否则会抛出错误。

如果参数是可选的，它将附加一个问号`?`，例如`arg2_name?: type`

如果参数有默认值，它将使用等号`=`指定，例如`arg3_name: type = <default_value>`。

如果参数可以有不同的类型，它将使用管道符号`|`指定，例如`arg4_name: type1|type2`

#### 语法警告

请注意，此语法仅用于文档目的，以便能够理解函数期望的参数。

调用函数时，您不必指定参数的名称、类型或默认值。如[此处](./syntax.md#函数调用)所述，只需要参数的值。

##### 示例

以`tp.date.now`内置函数文档为例：

```
tp.date.now(format?: string = "YYYY-MM-DD", offset?: number|string, reference?: string, reference_format?: string)
```

这个内置函数有4个可选参数：

- 类型为`string`的format，默认值为`"YYYY-MM-DD"`。
- 类型为`number`或`string`的offset。
- 类型为`string`的reference。
- 类型为`string`的reference_format。

这意味着该内置函数的**有效调用**包括：

- `<% tp.date.now() %>`
- `<% tp.date.now("YYYY-MM-DD", 7) %>`
- `<% tp.date.now("YYYY-MM-DD", 7, "2021-04-09", "YYYY-MM-DD") %>`
- `<% tp.date.now("dddd, MMMM Do YYYY", 0, tp.file.title, "YYYY-MM-DD") %>` *假设文件名格式为："YYYY-MM-DD"

另一方面，**无效调用**包括：

- `tp.date.now(format: string = "YYYY-MM-DD")`
- `tp.date.now(format: string = "YYYY-MM-DD", offset?: 0)`
- `tp.date.now(format = "YYYY-MM-DD")`
- `tp.date.now(offset: 7)`
- `tp.date.now(tp.file.title)`