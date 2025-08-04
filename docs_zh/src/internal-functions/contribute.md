# 贡献

您可以通过开发新的内置函数/变量来为[Templater](https://github.com/SilentVoid13/Templater)做出贡献。

开发新功能的过程非常简单。

请记住，只有相关的提交才会被接受，不要提交只有您自己会使用的非常特定的内置变量/函数。

## 布局

内置变量/函数按模块分类。每个模块在[src/InternalTemplates](https://github.com/SilentVoid13/Templater/tree/master/src/InternalTemplates)下都有专门的文件夹。

让我们以[date模块](https://github.com/SilentVoid13/Templater/tree/master/src/InternalTemplates/date)为例。

它包含一个[InternalModuleDate](https://github.com/SilentVoid13/Templater/blob/master/src/core/functions/internal_functions/date/InternalModuleDate.ts)文件，其中定义并注册了所有与日期相关的内置变量和函数：

```typescript
export class InternalModuleDate extends InternalModule {
    name = "date";

    async createStaticTemplates() {
        this.static_templates.set("now", this.generate_now());
        this.static_templates.set("tomorrow", this.generate_tomorrow());
        this.static_templates.set("yesterday", this.generate_yesterday());
    }

    async updateTemplates() {}

    generate_now() {
        return (format: string = "YYYY-MM-DD", offset?: number, reference?: string, reference_format?: string) => {
            if (reference && !window.moment(reference, reference_format).isValid()) {
                throw new Error("Invalid title date format, try specifying one with the argument 'reference'");
            }
            return get_date_string(format, offset, reference, reference_format);
        }
    }

    generate_tomorrow() {
        return (format: string = "YYYY-MM-DD") => {
            return get_date_string(format, 1);
        }
    }

    generate_yesterday() {
        return (format: string = "YYYY-MM-DD") => {
            return get_date_string(format, -1);
        }
    }
}
```

每个模块都继承自[InternalModule](https://github.com/SilentVoid13/Templater/blob/master/src/core/functions/internal_functions/InternalModule.ts)抽象类，这意味着它们包含以下属性和方法：

- `this.app`属性：Obsidian API的`App`对象。
- `this.file`属性：模板将被插入的目标文件。
- `this.plugin`属性：Templater插件对象。
- `this.static_templates`属性：包含所有静态(名称；变量/函数)的映射。静态变量/函数意味着它在执行时不依赖于文件。每次插入新模板时，这类变量/函数不会更新，以节省开销。
- `this.dynamic_templates`属性：与`static_templates`相同，只是它包含执行时依赖于文件的变量/函数。
- `this.createStaticTemplates()`方法：注册该模块的所有静态内置变量/函数。
- `this.updateTemplates()`方法：注册该模块的所有动态内置变量/函数。

如果需要，您可以在新的内置变量/函数中使用这些属性。

## 注册新的内置变量/函数

以下是注册模块中新内置变量/函数的不同步骤。

**第1步：**在模块内创建一个名为`generate_<内置变量或函数名>()`的方法，该方法将生成您的内置变量/函数，这意味着它将返回lambda函数（表示内置函数）或直接返回您想要暴露的内置变量。

所有生成方法按照内置变量/函数名称的字母顺序排序。

尝试为您的变量/函数提供一个好的、自解释的名称。

**第2步：**根据您的内置变量/函数在执行时是否依赖于文件，在`static_templates`或`dynamic_templates`映射中注册它。注册发生在`createStaticTemplates`或`updateTemplates`中。

要注册您的变量/函数，请使用您之前定义的`this.generate_<内置变量或函数名>()`方法：

```typescript
this.static_templates.set(<内置变量或函数名>, this.generate_<内置变量或函数名>());
或
this.dynamic_templates.set(<内置变量或函数名>, this.generate_<内置变量或函数名>());
```

内置变量/函数注册也按变量/函数名称的字母顺序排序。

**第3步：**将您的内置变量/函数文档添加到Templater的[文档](https://github.com/SilentVoid13/Templater/tree/master/docs/docs/internal-variables-functions/internal-modules)中。

完成了！感谢您为[Templater](https://github.com/SilentVoid13/Templater)做出贡献！

现在，只需在Github上提交一个[拉取请求](https://github.com/SilentVoid13/Templater/pulls)，我会尽可能快地做出反应。