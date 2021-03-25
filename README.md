# Templater Obsidian Plugin

This plugin for [Obsidian](https://obsidian.md/) offers 2 types of templates:

- [Internal templates](https://github.com/SilentVoid13/Templater#internal-templates). These templates are built within the plugin, with a unique template keyword and a pre-defined replacement output. For example `{{tp.file.title}}` will be replaced with the name of the file. A complete list of all the internal templates is given below.
- [Users defined templates](https://github.com/SilentVoid13/Templater#user-templates). Users can define their own templates in the plugin settings, associating a template pattern with a system command. The template pattern will be replaced in template files with the system command output.

Templater is automatically triggered on new files creation. This means Templater works well with the core Daily Note or the [Calendar](https://github.com/liamcain/obsidian-calendar-plugin) plugin.

## Demonstration

![templater_demo](https://raw.githubusercontent.com/SilentVoid13/Templater/master/imgs/templater_demo.gif)

## Usage

### Internal Templates

Here is the list of all of the internal templates that are built within this plugin. All internal template patterns are prefixed with the keyword `tp.` and are placed between double braces like so `{{}}`. This is to recognize them and to avoid conflicts with user defined templates.

Internal templates are sorted by modules, and each modules have different templates. The existing modules are:

- Date module
- File module
- Frontmatter
- Web module

You can call an internal template using the following structure `tp.<module_name>.<template_name>`

Internal templates accept user arguments, you pass argument to a template the same way you do with functions: `{{tp.<module_name>.<template_name>(arg1, arg2, arg3, ...)}}`. 

I invite everyone to contribute to this plugin development by adding new internal templates. (Check [INTERNAL_TEMPLATES](https://github.com/SilentVoid13/Templater/blob/master/docs/INTERNAL_TEMPLATES.md) for more informations).

### Internal Modules

#### Date module

This module contains every templates related to dates.

| Internal Template                                            | Arguments                                                    | Description                | Example Output |
| ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------- | -------------- |
| `tp.date.now(format?: string, offset?: number, reference?: string, reference_format?: string)` | - `format` (optional): Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD`)<br />- `offset` (optional): Offset for the day, e.g. set this to `-7` to get last week's date.<br />- `reference` (optional): The date referential, e.g: set this to the daily note's title<br />- `reference_format` (optional): The date reference format. | Retrieves the date.        | `2021-01-15`   |
| `tp.date.tomorrow(format?: string)`                          | - `format` (optional): Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD`) | Retrieves tomorrow's date  | `2020-11-07`   |
| `tp.date.yesterday(format?: string)`                         | - `format` (optional): Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD`) | Retrieves yesterday's date | `2020-11-07`   |

##### Examples

```javascript
{{tp.date.now()}}
{{tp.date.tomorrow()}}
{{tp.date.yesterday()}}
```

#### File Module

This module contains every templates related to obsidian files.

| Internal Template                             | Arguments                                                    | Description                                                  | Example Output              |
| --------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------- |
| `tp.file.content`                             | None                                                         | Retrieves the file's content                                 | `This is some content`      |
| `tp.file.creation_date(format?: string)`      | - `format` (optional): Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD`) | Retrieves the file's creation date.                          | `2021-01-06 20:27`          |
| `tp.file.cursor`                              | None                                                         | Sets the cursor to this location after the template has been inserted. You can navigate between the different `tp.file.cursor` using the configured hotkey in obsidian settings. | None                        |
| `tp.file.folder(relative: boolean)`           | - `relative` (optional): If `true`, appends the vault relative path to the folder name. | Retrieve's the file's folder name.                           | `Permanent Notes`           |
| `tp.file.last_modified_date(format?: string)` | - `format` (optional): Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD`) | Retrieves the file's last modification date.                 | `2021-01-06 20:27`          |
| `tp.file.path(relative: boolean)`             | - `relative` (optional): If `true`, only retrieves the vault relative path. | Retrieves the file's absolute path on the system.            | `/path/to/file`             |
| `tp.file.selection()`                         | None                                                         | Retrieve's the active file text selection.                   | `Some selected text`        |
| `tp.file.tags`                                | None                                                         | Retrieve's the file's tags (comma separated)                 | `#note,#seedling,#obsidian` |
| `tp.file.title`                               | None                                                         | Retrieve's the file's title.                                 | `MyFile`                    |

##### Examples

```

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
{{tp.frontmatter.alias}}
````

#### Web module

This modules contains every template related to the web (making web requests).

| Internal Template                                      | Arguments                                                    | Description                                                  | Example Output                                               |
| ------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `tp.web.daily_quote`                                   | None                                                         | Retrieves and parses the daily quote from the API https://quotes.rest/ |                                                              |
| `tp.web.random_picture(size?: number, query?: string)` | - `size`: Image size in the format `<width>x<height>`(default: `1600x900`).<br />- `query`: Limits selection to photos matching a search term. Multiple search terms can be passed separated by a comma `,`. | Gets a random image from https://unsplash.com/               | `![image](https://images.unsplash.com/photo-1602583019685-26371425dc0f)` |



| Internal Template            | Arguments   | Description                                                  | Example Output                                               |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `{{tp_include}}` | - `f`: The relative path from the vault root of the file to include. | Includes the file content. This file can be another template file, templates will be resolved recursively (Max inclusion depth: `10`) | `My header for all files` |

### User templates

##### 1. Define templates

To define your own templates, you need to define a template pattern, associated with a system command. To configure that, go to the plugin settings and click `Add Template`.

The left input field defines the template pattern. I strongly suggest placing the template pattern between braces like so `{{<template_pattern>}}` to avoid conflicts with existing words. This is entirely up to you, you can set a template pattern that looks like this: `[[<template_pattern>]]` or whatever.

The right input field defines the system command that will be run. The output of the command will replace the template pattern in your template files. The command will be run as if it was in a shell, so you can chain commands, pipe them, etc. The current working directory for the shell is the vault root. You can define multiple commands for the same template pattern, you just have to separate the commands with a newline.

##### Internal Templates in User Templates

You can also use some Internal templates inside your commands. The internal template will be replaced before your command gets executed.

For example, the command `cat tp.file.path` will be replaced with `cat /path/to/file`.

##### 2. Create template files

Now, you can start creating some template files that contains your template patterns defined in **step 1** (or some internal templates). I suggest to group these template files into a dedicated folder. You can then specify this folder in the plugin settings.

##### 3. Use your template files

Now you can click on the **Templater** icon located on the left-side ribbon. You can also configure a **hotkey** to insert a template (default: `Alt+E`). 

You can now choose your template file created in **step 2**. It will then automatically replace all the template patterns with the corresponding output.

## User Configuration example

| Template pattern | Windows command (Only working with Powershell 3.0+)          | Linux / Mac OS command                | Example Output             |
| ---------------- | ------------------------------------------------------------ | ------------------------------------- | -------------------------- |
| `{{today}}`      | `powershell (Get-Date -UFormat '%A, %d %B %Y')`              | `date +"%A, %d %B %Y"`                | `Friday, 06 November 2020` |
| `{{yesterday}}`  | `powershell (Get-Date -UFormat '%Y-%m-%d' (Get-Date).addDays(-1))` | `date --date "1 day ago" +"%Y-%m-%d"` | `2020-11-05`               |
| `{{tomorrow}}`   | `powershell (Get-Date -UFormat '%Y-%m-%d' (Get-Date).addDays(1))` | `date --date "1 day" +"%Y-%m-%d"`     | `2020-11-07`               |
| `{{weather}}`    | `powershell ((Invoke-WebRequest -UseBasicParsing -Uri wttr.in/Paris?format=3).Content)` | `curl "wttr.in/Paris?format=3"`       | `Paris: ☀️ +12°C`           |

## Settings

You can set a `Template folder location` to tell Templater to only check this folder for templates.

You can set a timeout for your custom commands with the `Timeout` option. A command that takes longer than what you defined will be canceled and considered as a command failure.

## Installation

After disabling Safe Mode, you can find third-party plugins in Settings > Third-party plugin > Community plugins > Browse > Search for "Templater".

After installing, you can then find the installed plugins under Settings > Third-party plugin. They need to be enabled in order to take effect. You can also uninstall them there.

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
