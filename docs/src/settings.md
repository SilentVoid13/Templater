# Settings

## General Settings

- `Template folder location`: Files in this folder will be available as templates.
- `Syntax Highlighting on Desktop` adds syntax highlighting for [Templater](https://github.com/SilentVoid13/Templater) commands in edit mode.
- `Syntax Highlighting on Mobile` adds syntax highlighting for [Templater](https://github.com/SilentVoid13/Templater) commands in edit mode on mobile. Use with caution: this may break live preview on mobile platforms.
- `Automatic jump to cursor` automatically triggers `tp.file.cursor` after inserting a template. You can also set a hotkey to manually trigger `tp.file.cursor`.

## Template Hotkeys

Template Hotkeys allows you to bind a template to a [command](https://obsidian.md/help/plugins/command-palette), and then bind that command to a [hotkey](https://obsidian.md/help/hotkeys) in the "Hotkeys" settings.

Each bound template exposes two commands, and you can choose which of them to register when adding or editing the hotkey:

- `Insert command` adds an `Insert <template>` command, which inserts the template into the active file.
- `Create command` adds a `Create <template>` command, which creates a new note from the template.

## File Creation

- `Trigger Templater on new file creation`: [Templater](https://github.com/SilentVoid13/Templater) will listen for the new file creation event and will replace every command it finds in the new file's content, after applying any template rules you've set. This makes [Templater](https://github.com/SilentVoid13/Templater) compatible with other plugins like the Daily note core plugin, Calendar plugin, Review plugin, Note refactor plugin, etc.
  - **Warning:** This can be dangerous if you create new files with unknown / unsafe content on creation. Make sure that every new file's content is safe on creation.

Once `Trigger Templater on new file creation` is enabled, the following settings become available:

- `Excluded folders`: New files created in these folders will never trigger Templater, regardless of the matching mode.
- `Template matching mode`: Controls how templates are matched to new files. Templates are applied only to empty files. Options:
  - **None**: Do not auto-apply templates. Templater will still listen for the new file creation event and replace every command it finds in the new file's content.
  - **Folder templates**: Apply templates based on folder structure.
  - **File regex templates**: Apply templates based on regex file path patterns.
- `Only trigger for files matching a template rule`: Shown when `Template matching mode` is **Folder templates** or **File regex templates**. When on, Templater only acts on empty new files that match a folder or file regex template. New files that don't match a rule are left untouched, and any Templater commands in them are not run. This is intended to limit Templater's code execution, which can be dangerous with untrusted content, to just the files you've explicitly configured in settings. Leave this off if another plugin, such as the Daily note core plugin, writes Templater commands into new files and relies on Templater running them.

## Folder Templates

Shown when `Template matching mode` is set to **Folder templates**.

You can specify a template that will automatically be used for empty new files created in a selected folder and its children. The most specific (deepest) matching folder wins, so a rule for a subfolder takes precedence over a rule for its parent.

Add a rule for "`/`" if you need a catch-all.

## File Regex Templates

Shown when `Template matching mode` is set to **File regex templates**.

You can specify regex declarations that the path of an empty new file will be tested against. If a regex matches, the associated template will automatically be used. Rules are tested top-to-bottom, and the first match will be used.

End with a rule for "`.*`" if you need a catch-all.

Use a tool like [Regex101](https://regex101.com/) to verify your regexes.

## Startup Templates

Enable the `Enable startup templates` toggle to allow templates to run automatically when Templater starts.

Startup Templates are templates that will get executed once when Templater starts. These templates won't output anything. This can be useful to set up templates adding hooks to obsidian events for example.

## User Script Functions

- `User scripts folder`: All JavaScript files in this folder will be loaded as CommonJS modules, to import custom [user functions](./user-functions/overview.md). The folder needs to be accessible from the vault. Check the [documentation](./user-functions/script-user-functions.md) for more information.
- `User script intellisense`: Controls how autocompletion hints render for user scripts. Options:
  - **Turn off intellisense**
  - **Render method description, parameters list, and return** (default)
  - **Render method description and parameters list**
  - **Render method description and return**
  - **Render method description**

## User System Command Functions

Enable the `Enable user system command functions` toggle to allow [user functions](./user-functions/overview.md) linked to system commands.

**Warning:** It can be dangerous to execute arbitrary system commands from untrusted sources. Only run system commands that you understand, from trusted sources.

Once enabled, the following settings become available:

- `Timeout`: Maximum timeout in seconds for a system command. Defaults to 5.
- `Shell binary location`: Full path to the shell binary to execute the command with. Optional — defaults to the system's default shell if not specified. You can use forward slashes (`/`) as path separators on all platforms.

Check the [documentation](./user-functions/system-user-functions.md) for more information.
