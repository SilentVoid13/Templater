

# Templater Obsidian Plugin

This plugin for [Obsidian](https://obsidian.md/) allows users to define some custom template patterns that will be replaced in files with a custom system command output.

## Demonstration

TODO

## Usage

### 1. Define templates

To start using this plugin, you need to define your own templates pattern, with the associated system command. To configure that, go to the plugin settings.

The left input field defines the template pattern. I strongly suggest placing the template word between braces like so `{{<template_word>}}`. 

The right input field defines the command to run from your system that will replace the template pattern in your files. You can define multiple commands for the same template pattern, you just have to separate the commands with a newline.

### 2. Template !

TODO

## Configurations examples

| Custom Template | Linux / Mac OS command               | Output           |
| --------------- | ------------------------------------ | ---------------- |
| `{{yesterday}}` | `date --date "1 day ago" +"%Y-%m-%d` | `2020-11-05`     |
| `{{tomorrow}}`  | `date --date "1 day" +"%Y-%m-%d`     | `2020-11-07`     |
| `{{weather}}`   | `curl "wttr.in/Paris?format=3"`      | `Paris: ☀️ +12°C` |
| `{{}}`          |                                      |                  |

## Compatibility

This plugin should work on Obsidian **v0.9.10+**.

It was tested on Obsidian **v0.9.10**.

## Installation

You can activate this plugin within Obsidian by doing the following:

- Open Settings > Third-party plugin
- Make sure Safe mode is **off**
- Click Browse community plugins
- Search for "Templater"
- Click Install
- Once installed, close the community plugins window and activate the newly installed plugin

### Updates

You can follow the same procedure to update the plugin.

## Support

If you want to support me and my work, you can ![coffee](https://github.githubassets.com/images/icons/emoji/unicode/2615.png) [**buy me a coffee here**](https://buymeacoff.ee/SilentVoid13).