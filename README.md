# Templater Obsidian Plugin

This template plugin for [Obsidian](https://obsidian.md/) offers 2 types of templates:

- [Internal templates](https://github.com/SilentVoid13/Templater#internal-templates). These templates are built within the plugin, with a unique template keyword and a pre-defined replacement output. For example `<% tp.file.title %>` will be replaced with the name of the file. A complete list of the internal templates is given below.
- [Users defined templates](https://github.com/SilentVoid13/Templater#user-templates). Users can define their own templates in the plugin settings, associating a template pattern with a system command. The template pattern will be replaced in template files with the system command output.

[Templater](https://github.com/SilentVoid13/Templater) is automatically triggered on new files creation. This means [Templater](https://github.com/SilentVoid13/Templater) works well with the core Daily Note plugin, the [Calendar](https://github.com/liamcain/obsidian-calendar-plugin) plugin, etc.

## Demonstration

![templater_demo](https://raw.githubusercontent.com/SilentVoid13/Templater/master/imgs/templater_demo.gif)

## Usage

[Templater](https://github.com/SilentVoid13/Templater) uses the template engine [Eta](https://eta.js.org/). This engine allows us to expose JavaScript objects to users. In our case, all templates are available under the `tp` object. This means that a template declaration will always start with `tp.<something>`

Because templates are JavaScript objects, a template can be a variable or a function. For example the `tp.file.content` internal template is a variable, so we must call it as a variable. On the other hand, an internal template like `tp.date.now` is a function, so we must call it like a function: `tp.date.now()`. A function can have arguments and optional arguments. All informations about the different templates are listed below.

A template **must** be declared using an opening tag `<%` and a closing tag `%>`. The complete declaration of the previous template example would be `<% tp.date.now() %>`

### Internal Templates

Internal templates are built within [Templater](https://github.com/SilentVoid13/Templater).

Internal templates are sorted by modules. The existing modules are:

- Date module
- File module
- Frontmatter module
- Web module

You can call an internal template using the following structure `tp.<module_name>.<template_name>`

As said before, some internal templates are functions requiring or accepting user arguments. You can call them like using the following syntax: `<% tp.<module_name>.<template_name>(arg1, arg2, arg3, ...) %>`. 

I invite everyone to contribute to this plugin development by adding new internal templates. (Check [INTERNAL_TEMPLATES](https://github.com/SilentVoid13/Templater/blob/master/docs/INTERNAL_TEMPLATES.md) for more informations).

### Internal Modules

Below is the documentation of every internal module of [Templater](https://github.com/SilentVoid13/Templater).

When an internal template is a function, the documentation for its arguments will be in the following form:  `tp.<module_name>.<template_name>(arg1: type, arg2: type, ...)`. 

The type is the expected type for the argument. This type must be respected when calling the internal template, or it will throw an error.

- A `string` type means the value must be placed within simple or double quotes (`"value"` or `'value'`)
- A `number` type means the value must be an integer (`15`, `-5`, ...)
- A `boolean` type means the value must be either `true` or `false` (completely lower case), but nothing else.

All arguments must be passed in the correct order.

If an argument is optional, it will be appended with a question mark `?`, e.g. `arg1?: type`

If an argument has a default value, it will be specified using an equal `=` sign, e.g. `arg1: string = 'default value'`. When an argument has a default value, it is therefore optional.

Let's take the internal template `tp.date.now(format: string = "YYYY-MM-DD", offset?: number, reference?: string, reference_format?: string)` documentation as an example. 

It's a function template, and it has 4 optional arguments: 

- a format of type `string`, with a default value of `"YYYY-MM-DD"`.
- an offset of type `number` .
- a reference of type `string` .
- a reference_format of type `string` .

That means that a valid call for this template could be `<% tp.date.now() %>` because all of its arguments are optional, but `<% tp.date.now("YYYY-MM-DD", 7) %>` is also valid.

#### Date module

This module contains every templates related to dates.

| Internal Template                                            | Arguments                                                    | Description                | Example Output |
| ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------- | -------------- |
| `tp.date.now(format: string = "YYYY-MM-DD", offset?: number, reference?: string, reference_format?: string)` | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/)<br />- `offset`: Offset for the day, e.g. set this to `-7` to get last week's date.<br />- `reference`: The date referential, e.g: set this to the note's title<br />- `reference_format`: The date reference format. | Retrieves the date.        | `2021-01-15`   |
| `tp.date.tomorrow(format: string = "YYYY-MM-DD")`            | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) | Retrieves tomorrow's date  | `2020-11-07`   |
| `tp.date.yesterday(format: string = "YYYY-MM-DD")`           | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) | Retrieves yesterday's date | `2020-11-07`   |

##### Examples

```
Date now: <% tp.date.now() %>
Date now with format: <% tp.date.now("Do MMMM YYYY") %>

Last week: <% tp.date.now("dddd Do MMMM YYYY", -7) %>
Today: <% tp.date.now("dddd Do MMMM YYYY, ddd") %>
Next week: <% tp.date.now("dddd Do MMMM YYYY", 7) %>

Date tomorrow with format: <% tp.date.tomorrow("Do MMMM YYYY") %>    

Date yesterday with format: <% tp.date.yesterday("Do MMMM YYYY") %>

File's title + 1 day: <% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>
```

#### File Module

This module contains every templates related to obsidian files.

| Internal Template                                            | Arguments                                                    | Description                                                  | Example Output              |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------- |
| `tp.file.content`                                            | None                                                         | Retrieves the file's content                                 | `This is some content`      |
| `tp.file.creation_date(format: string = "YYYY-MM-DD HH:mm")` | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) | Retrieves the file's creation date.                          | `2021-01-06 20:27`          |
| `tp.file.cursor`                                             | None                                                         | Sets the cursor to this location after the template has been inserted. You can navigate between the different `tp.file.cursor` using the configured hotkey in obsidian settings. | None                        |
| `tp.file.folder(relative: boolean = false)`                  | - `relative`: If `true`, appends the vault relative path to the folder name. | Retrieves the file's folder name.                            | `Permanent Notes`           |
| `tp.file.include(include_filename: string)`                  | - `include_filename`: The relative path (from vault root) of the file to include | Includes the file content. Included file's templates will be resolved. | `Header for all my files`   |
| `tp.file.last_modified_date(format: string = "YYYY-MM-DD HH:mm")` | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) | Retrieves the file's last modification date.                 | `2021-01-06 20:27`          |
| `tp.file.path(relative: boolean = false)`                    | - `relative` (optional): If `true`, only retrieves the vault's relative path. | Retrieves the file's absolute path on the system.            | `/path/to/file`             |
| `tp.file.rename(new_title: string)`                          | - `new_title`: The new file title                            | Renames the file (keeps the same file extension).            | None                        |
| `tp.file.selection()`                                        | None                                                         | Retrieves the active file's text selection.                  | `Some selected text`        |
| `tp.file.tags`                                               | None                                                         | Retrieves the file's tags (array of string, comma separated) | `#note,#seedling,#obsidian` |
| `tp.file.title`                                              | None                                                         | Retrieves the file's title.                                  | `MyFile`                    |

##### Examples

```
File content: <% tp.file.content %>

File creation date: <% tp.file.creation_date() %>
File creation date with format: <% tp.file.creation_date("dddd Do MMMM YYYY HH:mm") %>

File Folder: <% tp.file.folder() %>
File Folder with relative path: <% tp.file.folder(true) %>

File include: <% tp.file.include("Templates/Template1") %>

File Last Modif Date: <% tp.file.last_modified_date() %>
File Last Modif Date with format: <% tp.file.last_modified_date("dddd Do MMMM YYYY HH:mm") %>

File Path: <% tp.file.path() %>
File Path with relative path: <% tp.file.path(true) %>

Adding a "2" to file's title: <% tp.file.rename(tp.file.title + "2") %>

File Selection: <% tp.file.selection() %>

File tags: <% tp.file.tags %>

File title: <% tp.file.title %>
```

#### Frontmatter module

This modules exposes all the frontmatter variables of a file.

| Internal Template                | Arguments | Description                                      | Example Output |
| -------------------------------- | --------- | ------------------------------------------------ | -------------- |
| `tp.frontmatter.<variable_name>` | None      | Retrieves the file's frontmatter variable value. | `value`        |

##### Examples

Let's say you have the following file:

````
---
alias: myfile
---

file content
````

Then you can use the following template:

````
File's metadata alias: <% tp.frontmatter.alias %>
````

#### Web module

This modules contains every template related to the web (using web requests).

[Templater](https://github.com/SilentVoid13/Templater) doesn't escape characters by default. When doing web requests, it may be useful to escape dangerous characters. You can escape template response characters using the `<%~` opening tag. Go [here](https://github.com/SilentVoid13/Templater#eta-features) for more informations.

| Internal Template                                            | Arguments                                                    | Description                                                  | Example Output                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `tp.web.daily_quote()`                                       | None                                                         | Retrieves and parses the daily quote from the API https://quotes.rest/ | ![quote](https://raw.githubusercontent.com/SilentVoid13/Templater/master/imgs/templater_daily_quote.png) |
| `tp.web.random_picture(size: string = "1600x900", query?: string)` | - `size`: Image size in the format `<width>x<height>`.<br />- `query`: Limits selection to photos matching a search term. Multiple search terms can be passed separated by a comma `,` | Gets a random image from https://unsplash.com/               | `![image](https://images.unsplash.com/photo-1602583019685-26371425dc0f)` |

##### Examples

```javascript
Web Daily quote:  
<%~ tp.web.daily_quote() %>

Web Random picture: 
<%~ tp.web.random_picture() %>

Web Random picture with size: 
<%~ tp.web.random_picture("200x200") %>

Web random picture with size + query: 
<%~ tp.web.random_picture("200x200", "landscape,water") %>
```

### User templates

#### New user template

To define a new user template, you need to define a template name, associated with a system command. To do that, go to the plugin's settings and click `Add Template`.

![user_templates](https://raw.githubusercontent.com/SilentVoid13/Templater/master/imgs/templater_user_templates.png)

#### Calling User Templates

Just like internal templates, user templates are available under the `tp` JavaScript object, and more specifically under the `tp.user` object. You can call a user template using the following syntax: `tp.user.<template_name>()`, where `<template_name>` is the name you defined. 

User templates are functions, so you must call them like functions.

For example, if you defined a user template named `echo` like in the above screenshot, you can call it like so: `<% tp.user.echo() %>`

#### User Templates Arguments

You can pass optional arguments to user templates. They must be passed as a single JavaScript object containing properties and their corresponding values: `{arg1: value1, arg2: value2, ...}`.

These arguments will be made available for your programs / scripts in the form of [environment variables](https://en.wikipedia.org/wiki/Environment_variable).

In our previous example, this would give the following call: `<% tp.user.echo({a: "value 1", b: "value 2"})`. If our user template was calling a bash script, we would be able to access variables `a` and `b` using `$a` and `$b`.

#### Internal Templates in User Templates

You can also use some Internal templates inside your commands. The internal templates will get replaced before your command gets executed. Internal templates still needs to be placed between opening and closing tags.

For example, if you configure the system command `cat <% tp.file.path() %>`, it will be replaced with `cat /path/to/file` before the command gets executed.

### Eta features

Using the [Eta](https://eta.js.org/) templating engine, [Templater](https://github.com/SilentVoid13/Templater) defines 3 types of tags:

- `<%`:  Raw display tag.
- `<%*`: Executes JavaScript code tag. This will never output anything.
- `<%~`: Interpolation tag, adds some character escaping.

This means that using the execution opening tag, we can pretty much do everything that JavaScript allows us to do.

Here are some examples:

```javascript
<%* if (tp.file.title.startsWith("Hello")) { %>
This is a hello file !
<%* } else { %>
This is a normal file !
<%* } %>
```

```javascript
<%* if (tp.frontmatter.type === "seedling") { %>
This is a seedling file !
<%* } else { %>
This is a normal file !
<%* } %>
```

```javascript
<%* if (tp.file.tags.contains("#todo")) { %>
This is a todo file !
<%* } else { %>
This is a finished file !
<%* } %>
```

```javascript
<%*
function log(msg) {
	console.log(msg);
}
%>

<%* log("Title: " + tp.file.title) %>
```

## Settings

You can set a `Template folder location` to tell [Templater](https://github.com/SilentVoid13/Templater) to only check this folder for templates.

You can set a timeout for your custom commands with the `Timeout` option. A command that takes longer than what you defined will be canceled and considered as a failure.

## Installation

After disabling Safe Mode, you can find third-party plugins in Settings > Third-party plugin > Community plugins > Browse > Search for "Templater".

After installing, you can then find the installed plugins under Settings > Third-party plugin. They need to be enabled in order to take effect.

The first installation of [Templater](https://github.com/SilentVoid13/Templater) may require to restart the obsidian app if things are not working properly.

## Utilities

- If you want to bind a specific template to a specific hotkey, you can use the **[obsidian-hotkeys-for-templates](https://github.com/Vinzent03/obsidian-hotkeys-for-templates)** plugin.

## Alternatives

- https://github.com/garyng/obsidian-temple
- https://github.com/avirut/obsidian-metatemplates

## Contributing

Feel free to contribute.

Check [INTERNAL_TEMPLATES](https://github.com/SilentVoid13/Templater/blob/master/docs/INTERNAL_TEMPLATES.md) for informations on how to develop a new internal template.

You can create an [issue](https://github.com/SilentVoid13/Templater/issues) to report a bug, suggest an improvement for this plugin, etc.

You can make a [pull request](https://github.com/SilentVoid13/Templater/pulls) to contribute to this plugin development.

## License

[Templater](https://github.com/SilentVoid13/Templater) is licensed under the GNU AGPLv3 license. Refer to [LICENSE](https://github.com/SilentVoid13/Templater/blob/master/LICENSE.TXT) for more informations.

## Support

If you want to support me and my work, you can donate me a little something by clicking [**here**](https://www.paypal.com/donate?hosted_button_id=U2SRGAFYXT32Q).
