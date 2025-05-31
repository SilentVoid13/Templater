# Date模块

日期模块包含与日期和时间相关的函数。

<!-- toc -->

## 文档

函数文档使用特定语法。更多信息[在此](../../syntax.md#函数文档语法)。

### `tp.date.now(format, offset, reference, reference_format)` 

返回当前日期和时间。

##### 参数

- `format`: 日期的输出格式。默认为"YYYY-MM-DD"。
- `offset`: 从当前日期开始的偏移量（可以是正数或负数）。默认为0。
- `reference`: 参考日期，偏移量将从该日期计算而不是当前日期。默认为null。
- `reference_format`: 参考日期的输入格式。默认为null。

##### 示例

```javascript
// 基本用法
<% tp.date.now() %>

// 自定义格式
<% tp.date.now("Do MMMM YYYY") %>

// 带偏移量
<% tp.date.now("dddd Do MMMM YYYY", 7) %>

// 使用参考日期
<% tp.date.now("dddd Do MMMM YYYY", 0, "2021-04-09") %>

// 使用参考日期和格式
<% tp.date.now("YYYY-MM-DD", 0, "2021-04-09", "YYYY-MM-DD") %>
```

### `tp.date.tomorrow(format)` 

返回明天的日期。

##### 参数

- `format`: 日期的输出格式。默认为"YYYY-MM-DD"。

##### 示例

```javascript
// 基本用法
<% tp.date.tomorrow() %>

// 自定义格式
<% tp.date.tomorrow("Do MMMM YYYY") %>
```

### `tp.date.weekday(format, weekday, reference, reference_format)` 

返回特定的工作日。

##### 参数

- `format`: 日期的输出格式。默认为"YYYY-MM-DD"。
- `weekday`: 工作日的数字(0-6，0表示星期日)。默认为1(星期一)。
- `reference`: 参考日期，将返回最接近参考日期的工作日。默认为null。
- `reference_format`: 参考日期的输入格式。默认为null。

##### 示例

```javascript
// 基本用法（默认星期一）
<% tp.date.weekday() %>

// 星期三
<% tp.date.weekday("YYYY-MM-DD", 3) %>

// 从参考日期开始的星期一
<% tp.date.weekday("YYYY-MM-DD", 1, "2021-04-09") %>

// 从参考日期开始的星期天
<% tp.date.weekday("YYYY-MM-DD", 0, "2021-04-09", "YYYY-MM-DD") %>
```

### `tp.date.yesterday(format)` 

返回昨天的日期。

##### 参数

- `format`: 日期的输出格式。默认为"YYYY-MM-DD"。

##### 示例

```javascript
// 基本用法
<% tp.date.yesterday() %>

// 自定义格式
<% tp.date.yesterday("Do MMMM YYYY") %>
```

## Moment.js

Templater提供了对`moment`对象的访问，可以使用它的所有功能。

关于moment.js的更多信息[在此](https://momentjs.com/docs/#/displaying/)。

##### 示例

```javascript
// 当前日期，格式为YYYY-MM-DD
<% moment().format("YYYY-MM-DD") %>

// 当前日期，使用"星期几，月份+日 年份"的格式
<% moment().format("dddd, MMMM Do YYYY") %>

// 7天前的日期
<% moment().subtract(7, 'days').format("YYYY-MM-DD") %>

// 一个月后的日期，使用自定义格式
<% moment().add(1, 'month').format("YYYY-MM-DD") %>
```

## 示例

```javascript
// 基本用法
<% tp.date.now() %>

// 自定义格式
<% tp.date.now("Do MMMM YYYY") %>

// 带偏移量
<% tp.date.now("dddd Do MMMM YYYY", 7) %>

// 使用参考日期
<% tp.date.now("dddd Do MMMM YYYY", 0, "2021-04-09") %>

// 使用参考日期和格式
<% tp.date.now("YYYY-MM-DD", 0, "2021-04-09", "YYYY-MM-DD") %>

// 基本用法（默认星期一）
<% tp.date.weekday() %>

// 星期三
<% tp.date.weekday("YYYY-MM-DD", 3) %>

// 从参考日期开始的星期一
<% tp.date.weekday("YYYY-MM-DD", 1, "2021-04-09") %>

// 从参考日期开始的星期天
<% tp.date.weekday("YYYY-MM-DD", 0, "2021-04-09", "YYYY-MM-DD") %>

// 基本用法
<% tp.date.yesterday() %>

// 自定义格式
<% tp.date.yesterday("Do MMMM YYYY") %>

// 基本用法
<% tp.date.tomorrow() %>

// 自定义格式
<% tp.date.tomorrow("Do MMMM YYYY") %>
```