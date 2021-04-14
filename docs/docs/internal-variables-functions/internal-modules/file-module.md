---
title: File Module
---

This module contains every internal variable / function related to files.

## Documentation

:::tip

Function documentation is using a specific syntax. More informations [here](../../syntax#function-documentation-syntax)

:::

| Internal Variable / Function                                 | Arguments                                                    | Description                                                  | Example Output              |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------- |
| `tp.file.clipboard()`                                        | None                                                         | Retrieves the clipboard's content                            | `This is my copied text`    |
| `tp.file.content`                                            | None                                                         | Retrieves the file's content                                 | `This is some content`      |
| `tp.file.creation_date(format: string = "YYYY-MM-DD HH:mm")` | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) | Retrieves the file's creation date.                          | `2021-01-06 20:27`          |
| `tp.file.cursor(order?: number)`                             | - `order`: The order of the different cursors jump, e.g. it will jump from 1 to 2 to 3, and so on. | Sets the cursor to this location after the template has been inserted. You can navigate between the different `tp.file.cursor` using the configured hotkey in obsidian settings. | None                        |
| `tp.file.folder(relative: boolean = false)`                  | - `relative`: If `true`, appends the vault relative path to the folder name. | Retrieves the file's folder name.                            | `Permanent Notes`           |
| `tp.file.include(include_filename: string)`                  | - `include_filename`: The relative path (from vault root) of the file to include | Includes the file content. Included file's templates will be resolved. | `Header for all my files`   |
| `tp.file.last_modified_date(format: string = "YYYY-MM-DD HH:mm")` | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) | Retrieves the file's last modification date.                 | `2021-01-06 20:27`          |
| `tp.file.path(relative: boolean = false)`                    | - `relative` (optional): If `true`, only retrieves the vault's relative path. | Retrieves the file's absolute path on the system.            | `/path/to/file`             |
| `tp.file.rename(new_title: string)`                          | - `new_title`: The new file title                            | Renames the file (keeps the same file extension).            | None                        |
| `tp.file.selection()`                                        | None                                                         | Retrieves the active file's text selection.                  | `Some selected text`        |
| `tp.file.tags`                                               | None                                                         | Retrieves the file's tags (array of string, comma separated) | `#note,#seedling,#obsidian` |
| `tp.file.title`                                              | None                                                         | Retrieves the file's title.                                  | `MyFile`                    |

## Examples

```
Clipboard content: <% tp.file.clipboard() %>

File content: <% tp.file.content %>

File creation date: <% tp.file.creation_date() %>
File creation date with format: <% tp.file.creation_date("dddd Do MMMM YYYY HH:mm") %>

File Folder: <% tp.file.folder() %>
File Folder with relative path: <% tp.file.folder(true) %>

File Include: <% tp.file.include("Templates/Template1") %>

File Last Modif Date: <% tp.file.last_modified_date() %>
File Last Modif Date with format: <% tp.file.last_modified_date("dddd Do MMMM YYYY HH:mm") %>

File Path: <% tp.file.path() %>
File Path with relative path: <% tp.file.path(true) %>

Adding a "2" to file's title: <% tp.file.rename(tp.file.title + "2") %>

File Selection: <% tp.file.selection() %>

File tags: <% tp.file.tags %>

File title: <% tp.file.title %>
```
