# File模块

File模块包含与当前文件和文件系统相关的函数和属性。

<!-- toc -->

## 文档

函数文档使用特定语法。更多信息[在此](../../syntax.md#函数文档语法)。

### `tp.file.content` 

获取当前文件的全部内容。

### `tp.file.create_new(template, filename, open_new, folder)` 

使用指定的模板创建一个新文件。

##### 参数

- `template`: 要使用的模板路径（相对于模板文件夹）。
- `filename`: 新文件的文件名。
- `open_new`: 创建后是否打开新文件。默认为true。
- `folder`: 新文件的目标文件夹（相对于保险库根目录）。默认为当前文件所在文件夹。

##### 示例

```javascript
// 基本用法
<% tp.file.create_new("my_template", "MyFile") %>

// 不打开新文件
<% tp.file.create_new("my_template", "MyFile", false) %>

// 指定目标文件夹（即保险库根目录下的"target_folder"文件夹）
<% tp.file.create_new("my_template", "MyFile", true, "target_folder") %>

// 指定目标文件夹（当前文件所在文件夹的子文件夹"target_folder"）
<% tp.file.create_new("my_template", "MyFile", true, "./target_folder") %>
```

### `tp.file.creation_date(format)` 

获取文件的创建日期。

##### 参数

- `format`: 日期的输出格式。默认为"YYYY-MM-DD"。

##### 示例

```javascript
// 基本用法
<% tp.file.creation_date() %>

// 自定义格式
<% tp.file.creation_date("dddd Do MMMM YYYY HH:mm") %>
```

### `tp.file.cursor(order)` 

在渲染后将光标放置在特定位置。

##### 参数

- `order`: 决定光标放置的顺序（如果有多个光标）。默认为1。

##### 示例

```javascript
// 基本用法
<% tp.file.cursor() %>

// 指定顺序
<% tp.file.cursor(2) %>
```

### `tp.file.cursor_append(content)` 

在光标位置追加内容。

##### 参数

- `content`: 要追加的内容。

##### 示例

```javascript
// 基本用法
<% tp.file.cursor_append("追加的内容") %>
```

### `tp.file.exists(filename)` 

检查文件是否存在。

##### 参数

- `filename`: 要检查的文件名（绝对路径或相对于保险库根目录的路径）。

##### 示例

```javascript
// 基本用法
<% tp.file.exists("MyFile.md") %>

// 使用绝对路径
<% tp.file.exists("C:\\Path\\To\\MyFile.md") %>
```

### `tp.file.find_tfile(filename)` 

通过名称查找一个TFile对象。

##### 参数

- `filename`: 文件名（绝对路径或相对于保险库根目录的路径）。

##### 示例

```javascript
// 基本用法
<% tp.file.find_tfile("MyFile.md") %>
```

### `tp.file.folder(relative)` 

获取文件所在的文件夹路径。

##### 参数

- `relative`: 是否返回相对于保险库根目录的路径。默认为false。

##### 示例

```javascript
// 绝对路径
<% tp.file.folder() %>

// 相对路径
<% tp.file.folder(true) %>
```

### `tp.file.include(include_link)` 

包含另一个文件的内容。

##### 参数

- `include_link`: 要包含的文件链接（可以是文件名、相对路径或Wiki链接）。

##### 示例

```javascript
// 使用文件名
<% tp.file.include("MyFile") %>

// 使用Wiki链接
<% tp.file.include("[[MyFile]]") %>
```

### `tp.file.last_modified_date(format)` 

获取文件的最后修改日期。

##### 参数

- `format`: 日期的输出格式。默认为"YYYY-MM-DD"。

##### 示例

```javascript
// 基本用法
<% tp.file.last_modified_date() %>

// 自定义格式
<% tp.file.last_modified_date("dddd Do MMMM YYYY HH:mm") %>
```

### `tp.file.move(new_path, file_to_move)` 

将文件移动到新位置。

##### 参数

- `new_path`: 新的文件路径（相对于保险库根目录）。
- `file_to_move`: 要移动的文件（TFile对象）。如果未提供，则使用当前文件。

##### 示例

```javascript
// 移动当前文件
<% tp.file.move("target_folder/new_name") %>

// 移动指定文件
<% tp.file.move("target_folder/new_name", tp.file.find_tfile("MyFile.md")) %>
```

### `tp.file.path(relative)` 

获取文件的路径。

##### 参数

- `relative`: 是否返回相对于保险库根目录的路径。默认为false。

##### 示例

```javascript
// 绝对路径
<% tp.file.path() %>

// 相对路径
<% tp.file.path(true) %>
```

### `tp.file.rename(new_title)` 

重命名当前文件。

##### 参数

- `new_title`: 文件的新标题/名称。

##### 示例

```javascript
// 基本用法
<% tp.file.rename("新文件名") %>
```

### `tp.file.selection()` 

获取当前选择的文本。

##### 示例

```javascript
// 基本用法
<% tp.file.selection() %>
```

### `tp.file.tags` 

获取文件的标签列表。

##### 示例

```javascript
// 基本用法
<% tp.file.tags %>
```

### `tp.file.title` 

获取当前文件的标题（不带扩展名）。

##### 示例

```javascript
// 基本用法
<% tp.file.title %>
```

## 示例

```javascript
// 基本用法
<% tp.file.creation_date() %>

// 自定义格式
<% tp.file.creation_date("dddd Do MMMM YYYY HH:mm") %>

// 基本用法
<% tp.file.cursor() %>

// 指定顺序
<% tp.file.cursor(2) %>

// 基本用法
<% tp.file.cursor_append("追加的内容") %>

// 基本用法
<% tp.file.exists("MyFile.md") %>

// 使用绝对路径
<% tp.file.exists("C:\\Path\\To\\MyFile.md") %>

// 基本用法
<% tp.file.find_tfile("MyFile.md") %>

// 绝对路径
<% tp.file.folder() %>

// 相对路径
<% tp.file.folder(true) %>

// 使用文件名
<% tp.file.include("MyFile") %>

// 使用Wiki链接
<% tp.file.include("[[MyFile]]") %>

// 基本用法
<% tp.file.last_modified_date() %>

// 自定义格式
<% tp.file.last_modified_date("dddd Do MMMM YYYY HH:mm") %>

// 移动当前文件
<% tp.file.move("target_folder/new_name") %>

// 移动指定文件
<% tp.file.move("target_folder/new_name", tp.file.find_tfile("MyFile.md")) %>

// 绝对路径
<% tp.file.path() %>

// 相对路径
<% tp.file.path(true) %>

// 基本用法
<% tp.file.rename("新文件名") %>

// 基本用法
<% tp.file.selection() %>

// 基本用法
<% tp.file.tags %>

// 基本用法
<% tp.file.title %>

// 基本用法
<% tp.file.create_new("my_template", "MyFile") %>

// 不打开新文件
<% tp.file.create_new("my_template", "MyFile", false) %>

// 指定目标文件夹（即保险库根目录下的"target_folder"文件夹）
<% tp.file.create_new("my_template", "MyFile", true, "target_folder") %>

// 指定目标文件夹（当前文件所在文件夹的子文件夹"target_folder"）
<% tp.file.create_new("my_template", "MyFile", true, "./target_folder") %>
```