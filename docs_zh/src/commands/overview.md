# 命令

## 命令类型

[Templater](https://github.com/SilentVoid13/Templater) 定义了2种开始标签，它们定义了2种**命令**：

- `<%`: 插值命令。它将输出其中表达式的结果。
- `<%*`: [JavaScript执行命令](./execution-command.md)。它将执行其中的JavaScript代码。默认情况下不输出任何内容。

命令的结束标签始终相同：`%>`

## 命令工具

除了不同类型的命令外，您还可以使用命令工具。它们也在命令的开始标签中声明。所有命令工具适用于所有命令类型。可用的命令工具有：

- [空白控制](./whitespace-control.md)
- [动态命令](./dynamic-command.md)