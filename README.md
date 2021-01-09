# Templater Obsidian Plugin

This plugin for [Obsidian](https://obsidian.md/) offers 2 types of templates:

- [Internal templates](https://github.com/SilentVoid13/Templater#internal-templates). These templates are built within the plugin, with a unique template keyword and a pre-defined replacement output. For example `{{tp_title}}` will be replaced with the name of the active file. A complete list of all the internal templates is given below.
- [Users defined templates](https://github.com/SilentVoid13/Templater#user-templates). Users can define their own templates in the plugin settings, associating a template pattern with a system command. The template pattern will be replaced in template files with the system command output

Templater will automatically be triggered on new file creation. This means Templater will work well with the core Daily Note or the Calendar plugin.

## Demonstration

![templater_demo](https://raw.githubusercontent.com/SilentVoid13/Templater/master/imgs/templater_demo.gif)

## Usage

### Internal Templates

Here is the list of all of the internal templates that are built within this plugin. All internal template patterns are prefixed with the keyword `tp_` and are placed between double braces like so `{{tp_<name>}}`. This is to recognize them and to avoid conflicts with user defined templates.

Internal templates accept user arguments, they should be passed like so: `{{<template_name>:<argument_name1>=<argument_value1>,<argument_name2>=<argument_value2>}}`. 

If your argument value contains a special character (`,` or `=`) you can add quotes around your argument value like so: `<argument_name>="<argument_value>"`. If you want to use a quote inside quotes, you can escape it like so: `\"`.

I invite everyone to contribute to this plugin development by adding new internal templates. (Check [INTERNAL_TEMPLATES](https://github.com/SilentVoid13/Templater/blob/master/INTERNAL_TEMPLATES.md) for more informations).

| Internal Template            | Arguments   | Description                                                  | Example Output                                               |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `{{tp_title}}`        | None    | Retrieves the active file name.                              | `MyFile`                                                     |
| `{{tp_folder}}` | - `vault_path`: Appends the vault relative path to the folder name. Takes `true` or `false` as a value (default: `false`). | Retrieves the folder name in which the active file is. | `Permanent Notes` |
| `{{tp_include}}` | - `f`: The relative path from the vault root of the file to include. | Includes the file content. This file can be another template file, templates will be resolved recursively (Max inclusion depth: `10`) | `My header for all files` |
| `{{tp_today}}`       | - `f`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD`). | Retrieves today's date.          | `2020-11-06`                                                 |
| `{{tp_yesterday}}`    | - `f`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD`). | Retrieves yesterday's date.      | `2020-11-05`                                                 |
| `{{tp_tomorrow}}`     | - `f`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD`). | Retrieves tomorrow's date in the  format.        | `2020-11-07`                                                 |
| `{{tp_time}}` | - `f`: Format for the time, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `HH:mm`). | Retrieves the current time. | `08:36` |
| `{{tp_creation_date}}` | - `f`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD HH:mm`). | Gets the creation date of the active file. | `2021-01-06 20:27` |
| `{{tp_last_modif_date}}` | - `f`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD HH:mm`). | Gets the last modification date of the active file. | `2020-11-08 12:31` |
| `{{tp_title_today}}` | - `title_f`: Date format of the title, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD`). You want this argument to be the same as the daily note core plugin format setting.<br />- `f`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD HH:mm`). | Retrieves today's date from the file's title date referential. | `2021-01-09` |
| `{{tp_title_yesterday}}` | - `title_f`: Date format of the title, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD`). You want this argument to be the same as the daily note core plugin format setting.<br />- `f`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD HH:mm`). | Retrieves yesterday's date from the file's title date referential. | `2021-01-08` |
| `{{tp_title_tomorrow}}` | - `title_f`: Date format of the title, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD`). You want this argument to be the same as the daily note core plugin format setting.<br />- `f`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) (default: `YYYY-MM-DD HH:mm`). | Retrieves tomorrow's date from the file's title date referential. | `2021-01-10` |
| `{{tp_daily_quote}}`  | None | Retrieves and parses the daily quote from the API https://quotes.rest/. | ![templater_daily_quote](https://raw.githubusercontent.com/SilentVoid13/Templater/master/imgs/templater_daily_quote.png) |
| `{{tp_random_picture}}` | - `size`: Image size in the format `<width>x<height>`(default: `1600x900`).<br />- `query`: Limit selection to photos matching a search term. Multiple search terms can be passed separated by a comma `,` (don't forget to add quotes around the whole argument value) (default: `None`). | Gets a random image from https://unsplash.com/. | `![image](https://images.unsplash.com/photo-1602583019685-26371425dc0f)` |
| `{{tp_title_picture}}` | - `size`: Image size in the format `<width>x<height> ` (default: `1600x900`). | Gets an image from https://unsplash.com/ based on the note title. | `![title_image](https://images.unsplash.com/photo-1602583019685-26371425dc0f)` |
| `{{tp_cursor}}` | None | This will set the cursor to this location after the template has been inserted. | None |

### User templates

##### 1. Define templates

To define your own templates, you need to define a template pattern, associated with a system command. To configure that, go to the plugin settings and click `Add Template`.

The left input field defines the template pattern. I strongly suggest placing the template pattern between braces like so `{{<template_pattern>}}` to avoid conflicts with existing words. This is entirely up to you, you can set a template pattern that looks like this: `[[<template_pattern>]]` or whatever.

The right input field defines the system command that will be run. The output of the command will replace the template pattern in your template files. The command will be run as if it was in a shell, so you can chain commands, pipe them, etc. The current working directory for the shell is the vault root. You can define multiple commands for the same template pattern, you just have to separate the commands with a newline.

##### Internal Command Templates

You can also use some Internal command templates inside your commands. The command template will be replaced before your command gets executed.

I invite everyone to contribute to this plugin development by adding new internal command templates. (Check [INTERNAL_COMMAND_TEMPLATES](https://github.com/SilentVoid13/Templater/blob/master/INTERNAL_COMMAND_TEMPLATES.md) for more informations).

Here is the complete list of all the available internal command templates:

| Internal Command Template | Description                        | Example Output            |
| ------------------------- | ---------------------------------- | ------------------------- |
| `{{note_title}}`          | Retrieves the active file name.    | `MyFile`                  |
| `{{note_content}}`        | Retrieves the active file content. | `This is my note content` |

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

You can set a timeout for your custom commands with the `Timeout` option. A command that takes longer than what you defined will be canceled and considered as a command failure.

You set your locale in the settings, so the dates used in internal templates are formatted according to your language (e.g. `Montag` instead of `Monday` in german).

## Installation

After disabling Safe Mode, you can find third-party plugins in Settings > Third-party plugin > Community plugins > Browse > Search for "Templater".

After installing, you can then find the installed plugins under Settings > Third-party plugin. They need to be enabled in order to take effect. You can also uninstall them there.

#### Updates

You can follow the same procedure as installation to update the plugin once installed.

## Contributing

Feel free to contribute.

Check [INTERNAL_TEMPLATES](https://github.com/SilentVoid13/Templater/blob/master/INTERNAL_TEMPLATES.md) for informations on how to develop a new internal template.

You can create an [issue](https://github.com/SilentVoid13/Templater/issues) to report a bug, suggest an improvement for this plugin, etc.

You can make a [pull request](https://github.com/SilentVoid13/Templater/pulls) to contribute to this plugin development.

## License

[Templater](https://github.com/SilentVoid13/Templater) is licensed under the GNU AGPLv3 license. Refer to [LICENSE](https://github.com/SilentVoid13/Templater/blob/master/LICENSE.TXT) for more informations.

## Support

If you want to support me and my work, you can donate by click [**here**](https://www.paypal.com/donate?hosted_button_id=U2SRGAFYXT32Q).
