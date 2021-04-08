# Templater Obsidian Plugin

[Templater](https://github.com/SilentVoid13/Templater) is a template language that lets you insert **variables** and **functions** results into your notes. It will also let you execute JavaScript code manipulating those variables and functions.

## Demonstration

![templater_demo](https://raw.githubusercontent.com/SilentVoid13/Templater/master/imgs/templater_demo.gif)

## Terminology

To understand how [Templater](https://github.com/SilentVoid13/Templater) works, let's define a few terms:

- A text snippet that starts with an opening tag `<%`, ends with a closing tag `%>` and that is using an expression (variable, function, ...) is what we will call a **command**. 

- A **template** is a file that contains different commands.

There are two different types of commands you can use:

- [Internal commands](https://github.com/SilentVoid13/Templater#internal-commands). This is a command that's using predefined variables / functions that are built within the plugin. We will call such variables and functions **internal** variables and functions. As an example, `<% tp.file.title %>` is an internal variable that will return the name of the file. A complete list of the internal variables / functions is given below.
- [User defined commands](https://github.com/SilentVoid13/Templater#user-commands). This is a command that's using a user's defined function. Users can define their own functions in the plugin settings, associating a **function name** with a **system command**. A user function that returns the system command's output will then be created.

## Usage

[Templater](https://github.com/SilentVoid13/Templater) uses the template engine [Eta](https://eta.js.org/). This engine allows us to expose JavaScript objects to users. 

In [Templater](https://github.com/SilentVoid13/Templater), all of our variables and functions are available under the `tp` object. This means that an variable / function invocation will always start with `tp.<something>`

All of Templater's variables and functions are JavaScript objects. 

For example, `tp.file.content` is an internal variable, while `tp.date.now` is an internal function. 

To call a function, we need to use a syntax specific to functions calls: appending an opening and a closing parenthesis after the function name. As an example, we would use `tp.date.now()` to call this internal function.

A function can have arguments and optional arguments. They are placed between the opening and the closing parenthesis. 

All informations about the different arguments taken by internal variables / functions are listed below.

A command **must** have both an opening tag `<%` and a closing tag `%>`. 

A complete command using the `tp.date.now` internal function would be: `<% tp.date.now() %>`

### Internal Commands

Internal commands are commands using internal variables and functions built within [Templater](https://github.com/SilentVoid13/Templater).

The different internal variables and functions offered by [Templater](https://github.com/SilentVoid13/Templater) are sorted by modules. The existing internal modules are:

- Date module
- File module
- Frontmatter module
- Web module

You can use an internal command using the following structure: ` <% tp.<module_name>.<internal_variable_or_function_name> %>`

As I said before, some internal functions are requiring arguments. Arguments must be passed between the opening and the closing parenthesis like so: `tp.<module_name>.<internal_variable_or_function_name>(arg1, arg2, arg3, ...)`. 

I invite everyone to contribute to this plugin development by adding new internal functions / variables. Check [INTERNAL_COMMANDS](https://github.com/SilentVoid13/Templater/blob/master/docs/INTERNAL_COMMANDS.md) for more informations

### Internal Modules

Below is the documentation of every internal module of [Templater](https://github.com/SilentVoid13/Templater).

The documentation for an internal function will be in the following form:  `tp.<module_name>.<internal_variable_or_function_name>(arg1_name: type, arg2_name: type, ...)`. 

**Warning**: Please note that this syntax is for documentation purposes only, to be able to understand what the function expects. You won't need to specify the name nor the type of the argument that you pass to a function, only the value of that argument is required.

The type is the expected type for the argument. This type must be respected when calling the internal function, or it will throw an error.

- A `string` type means the value must be placed within simple or double quotes (`"value"` or `'value'`)
- A `number` type means the value must be an integer (`15`, `-5`, ...)
- A `boolean` type means the value must be either `true` or `false` (completely lower case), but nothing else.

All arguments must be passed in the correct order.

If an argument is optional, it will be appended with a question mark `?` in the documentation, e.g. `arg1?: type`

If an argument has a default value, it will be specified using an equal `=` sign in the documentation, e.g. `arg1: string = 'default value'`.

Let's take the `tp.date.now` internal function documentation as an example: `tp.date.now(format: string = "YYYY-MM-DD", offset?: number, reference?: string, reference_format?: string)`

When reading this, we understand that `tp.date.now` is an internal function, and not an internal variable, because of the opening / closing parenthesis. This internal function has 4 optional arguments: 

- a format of type `string`, with a default value of `"YYYY-MM-DD"`.
- an offset of type `number` .
- a reference of type `string` .
- a reference_format of type `string` .

That means that a valid internal command for this internal function could be `<% tp.date.now() %>` because all of its arguments are optional, but `<% tp.date.now("YYYY-MM-DD", 7) %>` is also valid.

#### Date module

This module contains every internal variable / function related to dates.

| Internal Variable / Function                                 | Arguments                                                    | Description                | Example Output |
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

File's title date + 1 day (tomorrow): <% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>

File's title date - 1 day (yesterday): <% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>
```

#### File Module

This module contains every internal variable / function related to obsidian files.

| Internal Variable / Function                                 | Arguments                                                    | Description                                                  | Example Output              |
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

This modules exposes all the frontmatter variables of a file as internal variables.

| Internal Variable / Function                 | Arguments | Description                                      | Example Output |
| -------------------------------------------- | --------- | ------------------------------------------------ | -------------- |
| `tp.frontmatter.<frontmatter_variable_name>` | None      | Retrieves the file's frontmatter variable value. | `value`        |

##### Notes

- If your frontmatter variable name contains spaces, you can reference it using the bracket notation like so: `<% tp.frontmatter["variable name with spaces"] %>`

##### Examples

Let's say you have the following file:

````
---
alias: myfile
note type: seedling
---

file content
````

Then you can use the following template:

````
File's metadata alias: <% tp.frontmatter.alias %>
Note's type: <% tp.frontmatter["note type"] %>
````

#### Web module

This modules contains every internal variable / function related to the web (using web requests).

[Templater](https://github.com/SilentVoid13/Templater) doesn't escape characters by default. When doing web requests, it may be useful to escape dangerous characters. You can escape a command's response characters using the `<%~` opening tag. Go [here](https://github.com/SilentVoid13/Templater#eta-features) for more informations.

| Internal Variable / Function                                 | Arguments                                                    | Description                                                  | Example Output                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `tp.web.daily_quote()`                                       | None                                                         | Retrieves and parses the daily quote from the API https://quotes.rest/ | ![quote](https://raw.githubusercontent.com/SilentVoid13/Templater/master/imgs/templater_daily_quote.png) |
| `tp.web.random_picture(size: string = "1600x900", query?: string)` | - `size`: Image size in the format `<width>x<height>`.<br />- `query`: Limits selection to photos matching a search term. Multiple search terms can be passed separated by a comma `,` | Gets a random image from https://unsplash.com/               | `![image](https://images.unsplash.com/photo-1602583019685-26371425dc0f)` |

##### Examples

```javascript
Web Daily quote:  
<% tp.web.daily_quote() %>

Web Random picture: 
<% tp.web.random_picture() %>

Web Random picture with size: 
<% tp.web.random_picture("200x200") %>

Web random picture with size + query: 
<% tp.web.random_picture("200x200", "landscape,water") %>
```

### User Commands

#### New user command

To define a new user command, you need to define a **function name**, associated with a **system command**. 

To do that, go to the plugin's settings and click `Add User Command`.

Once this is done, [Templater](https://github.com/SilentVoid13/Templater) will create a user function named after what you defined, that will execute your system command and return its output.

Just like internal functions, user functions are available under the `tp` JavaScript object, and more specifically under the `tp.user` object.

![user_templates](https://raw.githubusercontent.com/SilentVoid13/Templater/master/imgs/templater_user_templates.png)

#### Using User Commands

You can call a user function using the usual function calling syntax: `tp.user.<user_function_name>()`, where `<user_function_name>` is the name you defined in the settings. 

For example, if you defined a user function named `echo` like in the above screenshot, a complete user command invocation would look like: `<% tp.user.echo() %>`

#### User Functions Arguments

You can pass optional arguments to user functions. They must be passed as a single JavaScript object containing properties and their corresponding values: `{arg1: value1, arg2: value2, ...}`.

These arguments will be made available for your programs / scripts in the form of [environment variables](https://en.wikipedia.org/wiki/Environment_variable).

In our previous example, this would give the following user command declaration: `<% tp.user.echo({a: "value 1", b: "value 2"})`. 

If our system command was calling a bash script, we would be able to access variables `a` and `b` using `$a` and `$b`.

#### Internal commands in system commands

You can use internal commands inside your system command. The internal commands will be replaced with their results before your system command gets executed.

For example, if you configured the system command `cat <% tp.file.path() %>`, it would be replaced with `cat /path/to/file` before the system command gets executed.

### Eta features

Using the [Eta](https://eta.js.org/) templating engine, [Templater](https://github.com/SilentVoid13/Templater) defines 3 types of opening tags for commands:

- `<%`:  Raw display tag. It will just output the expression that's inside.
- `<%*`: JavaScript execution tag. It will execute the JavaScript code that's inside. It does not output anything by default.
- `<%~`: Interpolation tag. Same as the raw display tag, but adds some character escaping.

The closing tag for a command always stays the same: `%>`

#### JavaScript Execution Tag

With this type of tag, we can pretty much do everything that JavaScript allows us to do.

**Warning:** Some internal functions are asynchronous. When calling such functions inside a JavaScript execution tag don't forget to use the `await` keyword if necessary.

##### Output a value from a JavaScript Execution Tag

Sometimes, you may want to output something when using a JS execution tag. This is possible.

The [Eta](https://eta.js.org/) templating engine generates a replacement string using all of our commands results, that is stored in the `tR` variable. This string contains the processed file content result if you want. You are allowed to access that variable from a JS execution tag.

This means that, to output something from a JS execution tag, you just need to append what you want to output to that string.

For example, the following command: `<%* tR += "test" %>` will output `test`.

You usually don't want to override the `tR` variable (`tR = "test"`), because that means overriding the replacement string.

##### Examples

Here are some examples of things you can do using JavaScript Execution Tags:

```javascript
<%* if (tp.file.title.startsWith("Hello")) { %>
This is a hello file !
<%* } else { %>
This is a normal file !
<%* } %>
    
<%* if (tp.frontmatter.type === "seedling") { %>
This is a seedling file !
<%* } else { %>
This is a normal file !
<%* } %>
    
<%* if (tp.file.tags.contains("#todo")) { %>
This is a todo file !
<%* } else { %>
This is a finished file !
<%* } %>
    
<%*
function log(msg) {
	console.log(msg);
}
%>
<%* log("Title: " + tp.file.title) %>
    
<%* tR += tp.file.content.replace(/stuff/, "things"); %>
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

Check [INTERNAL_COMMANDS](https://github.com/SilentVoid13/Templater/blob/master/docs/INTERNAL_COMMANDS.md) for informations on how to develop a new internal variable / function.

You can create an [issue](https://github.com/SilentVoid13/Templater/issues) to report a bug, suggest an improvement for this plugin, etc.

You can make a [pull request](https://github.com/SilentVoid13/Templater/pulls) to contribute to this plugin development.

## License

[Templater](https://github.com/SilentVoid13/Templater) is licensed under the GNU AGPLv3 license. Refer to [LICENSE](https://github.com/SilentVoid13/Templater/blob/master/LICENSE.TXT) for more informations.

## Support

If you want to support me and my work, you can donate me a little something by clicking [**here**](https://www.paypal.com/donate?hosted_button_id=U2SRGAFYXT32Q).
