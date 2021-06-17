---
title: File Module
---

This module contains every internal variable / function related to files.

## Documentation

:::tip

Function documentation is using a specific syntax. More informations [here](../../syntax.md#function-documentation-syntax)

:::

| Internal Variable / Function                                 | Arguments                                                    | Description                                                  | Example Output                |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------- |
| `tp.file.content`                                            | None                                                         | Retrieves the file's content                                 | `This is some content`        |
| `tp.file.create_new(template: TFile ⎮ string, filename?: string, open_new: boolean = false, folder?: TFolder)` | - `template`: Either the template used for the new file content, or the file content as a string.<br />- `filename`: The filename of the new file, defaults to "Untitled".<br />- `open_new`: Whether to open or not the newly created file. **Warning**: if you use this option, since commands are executed asynchronously, the file can be opened first and then other commands are appended to that new file and not the previous file.<br />- `folder`: The folder to put the new file in, defaults to obsidian's default location. | Creates a new  file using a specified template or with a specified content. | None                          |
| `tp.file.creation_date(format: string = "YYYY-MM-DD HH:mm")` | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) | Retrieves the file's creation date.                          | `2021-01-06 20:27`            |
| `tp.file.cursor(order?: number)`                             | - `order`: The order of the different cursors jump, e.g. it will jump from 1 to 2 to 3, and so on. If you specify multiple `tp.file.cursor` with the same order, the editor will switch to multi-cursor. | Sets the cursor to this location after the template has been inserted. You can navigate between the different `tp.file.cursor` using the configured hotkey in obsidian settings. | None                          |
| `tp.file.cursor_append(content: string)`                     | - `content`: The content to append after the active cursor.  | Appends some content after the active cursor in the file     | None                          |
| `tp.file.exists(filename: string)`                           | - `filename`: The filename of the file we want to check existence, e.g. `MyFile`. | Checks if a file exists or not. Returns a `true` / `false` boolean. | `true`                        |
| `tp.file.find_tfile(filename: string)`                       | - `filename`: The filename we want to search and resolve as a [TFile](https://github.com/obsidianmd/obsidian-api/blob/ddd50214f530d23ee21f440a9fa64f4507176871/obsidian.d.ts#L2834) | Search for a file and returns its [TFile](https://github.com/obsidianmd/obsidian-api/blob/ddd50214f530d23ee21f440a9fa64f4507176871/obsidian.d.ts#L2834) instance. | `[object Object]`             |
| `tp.file.folder(relative: boolean = false)`                  | - `relative`: If `true`, appends the vault relative path to the folder name. | Retrieves the file's folder name.                            | `Permanent Notes`             |
| `tp.file.include(include_link: string ⎮ TFile)`              | - `include_link`: The link to the file to include, e.g. `[[MyFile]]`, or a [TFile](https://github.com/obsidianmd/obsidian-api/blob/ddd50214f530d23ee21f440a9fa64f4507176871/obsidian.d.ts#L2834) object. Also supports sections or blocks inclusions, e.g. `[[MyFile#Section1]]` | Includes the file's link content. Templates in the included content will be resolved. | `Header for all my templates` |
| `tp.file.last_modified_date(format: string = "YYYY-MM-DD HH:mm")` | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) | Retrieves the file's last modification date.                 | `2021-01-06 20:27`            |
| `tp.file.move(new_path: string)`                             | - `path`: The new vault relative path of the file, without the file extension. **Note**: the new path needs to include the folder **and** the filename, e.g. `/Notes/MyNote` | Moves the file to the desired vault's location.              | None                          |
| `tp.file.path(relative: boolean = false)`                    | - `relative` (optional): If `true`, only retrieves the vault's relative path. | Retrieves the file's absolute path on the system.            | `/path/to/file`               |
| `tp.file.rename(new_title: string)`                          | - `new_title`: The new file title                            | Renames the file (keeps the same file extension).            | None                          |
| `tp.file.selection()`                                        | None                                                         | Retrieves the active file's text selection.                  | `Some selected text`          |
| `tp.file.tags`                                               | None                                                         | Retrieves the file's tags (array of string, comma separated) | `#note,#seedling,#obsidian`   |
| `tp.file.title`                                              | None                                                         | Retrieves the file's title.                                  | `MyFile`                      |

## Examples

```javascript
File content: <% tp.file.content %>

File creation date: <% tp.file.creation_date() %>
File creation date with format: <% tp.file.creation_date("dddd Do MMMM YYYY HH:mm") %>

File creation: [[<% (await tp.file.create_new("MyFileContent", "MyFilename")).basename %>]]

File cursor: <% tp.file.cursor(1) %>

File cursor append: <% tp.file.cursor_append("Some text") %>
    
File existence: <% tp.file.exists("MyFile") %>

File find TFile: <% tp.file.find_tfile("MyFile").basename %>
    
File Folder: <% tp.file.folder() %>
File Folder with relative path: <% tp.file.folder(true) %>

File Include: <% tp.file.include("[[Template1]]") %>

File Last Modif Date: <% tp.file.last_modified_date() %>
File Last Modif Date with format: <% tp.file.last_modified_date("dddd Do MMMM YYYY HH:mm") %>

File Move: <% await tp.file.move("/A/B/" + tp.file.title) %>
File Move + Rename: <% await tp.file.move("/A/B/NewTitle") %>

File Path: <% tp.file.path() %>
File Path with relative path: <% tp.file.path(true) %>

File Rename: <% await tp.file.rename("MyNewName") %>
Append a "2": <% await tp.file.rename(tp.file.title + "2") %>

File Selection: <% tp.file.selection() %>

File tags: <% tp.file.tags %>

File title: <% tp.file.title %>
Strip the Zettelkasten ID of title (if space separated): <% tp.file.title.split(" ")[1] %>
```