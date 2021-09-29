---
title: Settings
---

You can set a `Template folder location` to tell [Templater](https://github.com/SilentVoid13/Templater) to only check this folder for templates.

You can set a timeout for your system commands with the `Timeout` option. A system command that takes longer than what you defined will be canceled and considered as a failure.

You can set [Templater](https://github.com/SilentVoid13/Templater) to be triggered on new file creation. It will listen for the new file creation event and replace every command it finds in the new file's content.

This makes Templater compatible with other plugins like the Daily note core plugin, Calendar plugin, Review plugin, Note refactor plugin, ...

:::caution 

This can be dangerous if you create new files with unknown / unsafe content on creation. Make sure that every new file's content is safe on creation.

:::

## Folder Templates

You can specify a template that will automatically be used on a selected folder and children using the `Folder Templates` functionality.

## System Commands

You can enable system commands. This allows you to create [user functions](./user-functions/overview.md) linked to system commands.

:::caution

It can be dangerous to execute arbitrary system commands from untrusted sources. Only run system commands that you understand, from trusted sources.

:::
