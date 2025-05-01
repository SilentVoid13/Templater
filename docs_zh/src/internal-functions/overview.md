# 内置函数

[Templater](https://github.com/SilentVoid13/Templater) 提供的不同内置变量和函数分布在不同的**模块**中，以便对它们进行分类。现有的**内置模块**有：

- [App模块](./internal-modules/app-module.md): `tp.app`
- [Config模块](./internal-modules/config-module.md): `tp.config`
- [Date模块](./internal-modules/date-module.md): `tp.date`
- [File模块](./internal-modules/file-module.md): `tp.file`
- [Frontmatter模块](./internal-modules/frontmatter-module.md): `tp.frontmatter`
- [Hooks模块](./internal-modules/hooks-module.md): `tp.hooks`
- [Obsidian模块](./internal-modules/obsidian-module.md): `tp.obsidian`
- [System模块](./internal-modules/system-module.md): `tp.system`
- [Web模块](./internal-modules/web-module.md): `tp.web`

如果您正确理解了[对象层次结构](../syntax.md#对象层次结构)，这意味着一个典型的内置函数调用看起来像这样：`<% tp.<模块名>.<内置函数名> %>`

## 贡献

我邀请每个人通过添加新的内置函数来为这个插件的开发做出贡献。更多信息请点击[这里](./contribute.md)。