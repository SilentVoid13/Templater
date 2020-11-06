

# Templater Obsidian Plugin

This plugin for [Obsidian](https://obsidian.md/) allows users to define some custom template patterns that will be replaced in files with a custom system command output.

## Demonstration

TODO

## Usage

### 1. Define templates

To start using this plugin, you need to define your own templates pattern, with the associated system command. To configure that, go to the plugin settings.

The left input field defines the template pattern. I strongly suggest placing the template word between braces like so `{{<template_word>}}`. 

The right input field defines the command to run from your system that will replace the template pattern in your files. You can define multiple commands for the same template pattern, you just have to separate the commands with a newline.

### 2. Use your templates

TODO

## Configuration examples

| Custom Template | Linux / Mac OS command                | Output           |
| --------------- | ------------------------------------- | ---------------- |
| `{{yesterday}}` | `date --date "1 day ago" +"%Y-%m-%d"` | `2020-11-05`     |
| `{{tomorrow}}`  | `date --date "1 day" +"%Y-%m-%d"`     | `2020-11-07`     |
| `{{weather}}`   | `curl "wttr.in/Paris?format=3"`       | `Paris: ☀️ +12°C` |
| `{{}}`          |                                       |                  |

## Installation

After disabling Safe Mode, you can find third-party plugins created by the community in Settings -> Third-party plugin > Community plugins > Browse > Search for "Templater"

After installing, you can then find the installed plugins under Settings > Third-party plugin. They need to be enabled in order to take effect. You can also uninstall them there.

### Updates

You can follow the same procedure as installation to update the plugin once installed.

### Compatibility

This plugin should work on Obsidian **v0.9.10+**.

It was tested on Obsidian **v0.9.10**.

## Contributing

Feel free to contribute. 

You can create an [issue](https://github.com/SilentVoid13/Templater) to report a bug, suggest an improvement for this plugin, etc.

You can make a [pull request](https://github.com/SilentVoid13/Templater) to contribute to this plugin development.

## License

[Templater](https://github.com/SilentVoid13/Templater) is licensed under the GNU AGPLv3 license. Refer to [LICENSE](https://github.com/SilentVoid13/Templater/blob/master/LICENSE.txt) for more informations.

## Support

If you want to support me and my work, you can ☕ [**buy me a coffee here**](https://buymeacoff.ee/SilentVoid13).