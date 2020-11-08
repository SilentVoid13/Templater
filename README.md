

# Templater Obsidian Plugin

This plugin for [Obsidian](https://obsidian.md/) allows users to define some custom template patterns that will be replaced in files with a custom system command output.

This plugin also offers some internal templates. A complete list of all the internal templates is given below.

## Demonstration

![demo_templater](imgs/demo_templater.gif)

## Usage

### 1. Define templates

To start using this plugin, you need to define your own templates pattern, along with an associated system command. To configure that, go to the plugin settings.

The left input field defines the template pattern. I strongly suggest placing the template word between braces like so `{{<template_word>}}` to avoid disruption with existing words.

The right input field defines the system command that will be run. The command output will replace the template pattern in your files. You can define multiple commands for the same template pattern, just have to separate the commands with a newline.

### 2. Create template files

Now, you can start creating some template files that contains your template patterns defined in **step 1**. I suggest to group these template files into a dedicated folder. You can then specify this folder in the plugin settings.

### 3. Use your template files

Now you can click on the **Templater** icon located on the left-side ribbon. You can now choose your template file created in **step 2**. It will then automatically replace all the template patterns with the corresponding output.

## Internal Templates

Here is the list of all of the internal templates that are already included in this plugin. All internal templates patterns are prefixed with the keyword `templater_` to avoid disruption with user defined templates. 

I invite all developers to contribute to this plugin development by adding new internal templates. (Check [INTERNAL_TEMPLATES](INTERNAL_TEMPLATES.md) for more informations).

| Internal Template            | Description                                                  | Example Output                                               |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `{{templater_daily_quote}}`  | This template retrieves and parse the daily quote from the API https://quotes.rest/. | ![templater_daily_quote](imgs/templater_daily_quote.png)     |
| `{{templater_random_image}}` | This template gets a random image from https://source.unsplash.com/random | `![image](https://images.unsplash.com/photo-1602583019685-26371425dc0f)` |

## User Configuration example

| Template pattern | Linux / Mac OS command                | Example Output             |
| ---------------- | ------------------------------------- | -------------------------- |
| `{{today}}`      | `date +"%A, %d %B %Y"`                | `Friday, 06 November 2020` |
| `{{yesterday}}`  | `date --date "1 day ago" +"%Y-%m-%d"` | `2020-11-05`               |
| `{{tomorrow}}`   | `date --date "1 day" +"%Y-%m-%d"`     | `2020-11-07`               |
| `{{weather}}`    | `curl "wttr.in/Paris?format=3"`       | `Paris: ☀️ +12°C`           |

## Installation

After disabling Safe Mode, you can find third-party plugins in Settings > Third-party plugin > Community plugins > Browse > Search for "Templater".

After installing, you can then find the installed plugins under Settings > Third-party plugin. They need to be enabled in order to take effect. You can also uninstall them there.

### Updates

You can follow the same procedure as installation to update the plugin once installed.

### Compatibility

This plugin should work on Obsidian **v0.9.10+**.

It was tested on Obsidian **v0.9.10** running on Linux. Windows users feedback would be appreciated as i didn't test it on Windows.

## Contributing

Feel free to contribute.

Check [INTERNAL_TEMPLATES](INTERNAL_TEMPLATES.md) for informations on how to develop a new internal template.

You can create an [issue](https://github.com/SilentVoid13/Templater) to report a bug, suggest an improvement for this plugin, etc.

You can make a [pull request](https://github.com/SilentVoid13/Templater) to contribute to this plugin development.

## License

[Templater](https://github.com/SilentVoid13/Templater) is licensed under the GNU AGPLv3 license. Refer to [LICENSE](https://github.com/SilentVoid13/Templater/blob/master/LICENSE.txt) for more informations.

## Support

If you want to support me and my work, you can ☕ [**buy me a coffee here**](https://buymeacoff.ee/SilentVoid13).
