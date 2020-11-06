

# Templater Obsidian Plugin

This plugin for [Obsidian](https://obsidian.md/) allows users to define some custom template patterns that will be replaced in files with a custom system command output.



## Some examples

| Custom Template | Linux / Mac OS command               | Output           |
| --------------- | ------------------------------------ | ---------------- |
| `{{yesterday}}` | `date --date "1 day ago" +"%Y-%m-%d` | `2020-11-05`     |
| `{{tomorrow}}`  | `date --date "1 day" +"%Y-%m-%d`     | `2020-11-07`     |
| `{{weather}}`   | `curl "wttr.in/Paris?format=3"`      | `Paris: ☀️ +12°C` |
| `{{}}`          |                                      |                  |

