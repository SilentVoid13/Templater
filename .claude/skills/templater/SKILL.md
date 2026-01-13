---
name: templater
description: Create dynamic templates using Templater's template syntax and tp.* functions. Use when the user mentions Templater, dynamic templates, tp.date, tp.file, template commands, or automated note creation.
---

# Templater Plugin Skill

This skill enables Claude Code to create valid Templater templates for dynamic content in Obsidian.

## Overview

Templater extends Obsidian's template system with:
- Dynamic date/time insertion
- File manipulation and creation
- User prompts and selections
- System clipboard access
- Web requests
- Custom user scripts

## Template Syntax

### Basic Syntax

```markdown
<% expression %>          Output result
<%* statement %>          Execute without output (for logic)
```

### Examples

```markdown
<% tp.date.now() %>                    Outputs: 2024-02-15
<%* await tp.file.rename("New Name") %>   Renames file (no output)
```

## Date Module (tp.date)

### tp.date.now

Get current date with optional formatting and offset.

```markdown
<% tp.date.now() %>
<% tp.date.now("YYYY-MM-DD") %>
<% tp.date.now("dddd, MMMM Do YYYY") %>
<% tp.date.now("YYYY-MM-DD", 7) %>
<% tp.date.now("YYYY-MM-DD", -7) %>
<% tp.date.now("YYYY-MM-DD", "P1M") %>
<% tp.date.now("YYYY-MM-DD", "P-1M") %>
<% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>
```

**Parameters:**
- `format` - Date format string (default: "YYYY-MM-DD")
- `offset` - Days as number or ISO 8601 duration string
- `reference` - Reference date string
- `reference_format` - Format of reference date

### tp.date.tomorrow

```markdown
<% tp.date.tomorrow() %>
<% tp.date.tomorrow("YYYY-MM-DD") %>
```

### tp.date.yesterday

```markdown
<% tp.date.yesterday() %>
<% tp.date.yesterday("YYYY-MM-DD") %>
```

### tp.date.weekday

Get a specific weekday relative to current/reference date.

```markdown
<% tp.date.weekday("YYYY-MM-DD", 0) %>
<% tp.date.weekday("YYYY-MM-DD", 7) %>
<% tp.date.weekday("YYYY-MM-DD", -7) %>
<% tp.date.weekday("YYYY-MM-DD", 0, tp.file.title, "YYYY-MM-DD") %>
```

**Parameters:**
- `format` - Date format string
- `weekday` - 0 = Monday of current week, 7 = next Monday, -7 = last Monday
- `reference` - Reference date string
- `reference_format` - Format of reference date

### Date Format Tokens (Moment.js)

| Token | Output | Description |
|-------|--------|-------------|
| `YYYY` | 2024 | 4-digit year |
| `YY` | 24 | 2-digit year |
| `MM` | 01-12 | Month (padded) |
| `M` | 1-12 | Month |
| `MMMM` | January | Full month name |
| `MMM` | Jan | Short month |
| `DD` | 01-31 | Day (padded) |
| `D` | 1-31 | Day |
| `Do` | 1st-31st | Day with ordinal |
| `dddd` | Monday | Full weekday |
| `ddd` | Mon | Short weekday |
| `dd` | Mo | Min weekday |
| `HH` | 00-23 | Hour 24h (padded) |
| `H` | 0-23 | Hour 24h |
| `hh` | 01-12 | Hour 12h (padded) |
| `h` | 1-12 | Hour 12h |
| `mm` | 00-59 | Minutes (padded) |
| `ss` | 00-59 | Seconds (padded) |
| `a` | am/pm | AM/PM lowercase |
| `A` | AM/PM | AM/PM uppercase |
| `W` | 1-53 | ISO week number |
| `Q` | 1-4 | Quarter |

### Moment.js Direct Usage

```markdown
<% moment(tp.file.title, "YYYY-MM-DD").format("MMMM Do, YYYY") %>
<% moment(tp.file.title, "YYYY-MM-DD").startOf("month").format("YYYY-MM-DD") %>
<% moment(tp.file.title, "YYYY-MM-DD").endOf("month").format("YYYY-MM-DD") %>
<% moment(tp.file.title, "YYYY-MM-DD").add(1, "week").format("YYYY-MM-DD") %>
<% moment(tp.file.title, "YYYY-MM-DD").subtract(1, "month").format("YYYY-MM-DD") %>
```

## File Module (tp.file)

### Properties

```markdown
<% tp.file.title %>                    File name without extension
<% tp.file.path(true) %>               Relative path from vault root
<% tp.file.path(false) %>              Absolute system path
<% tp.file.folder(true) %>             Folder path from vault root
<% tp.file.folder(false) %>            Folder name only
<% tp.file.tags %>                     Array of tags in file
<% tp.file.content %>                  Full file content as string
```

### tp.file.creation_date

```markdown
<% tp.file.creation_date() %>
<% tp.file.creation_date("YYYY-MM-DD HH:mm") %>
<% tp.file.creation_date("dddd, MMMM Do YYYY") %>
```

### tp.file.last_modified_date

```markdown
<% tp.file.last_modified_date() %>
<% tp.file.last_modified_date("YYYY-MM-DD HH:mm") %>
```

### tp.file.cursor

Place cursor after template insertion.

```markdown
<% tp.file.cursor() %>
<% tp.file.cursor(1) %>
<% tp.file.cursor(2) %>
```

Multiple cursors with same number create multi-cursor selection.

### tp.file.cursor_append

Append text at cursor position.

```markdown
<%* tp.file.cursor_append("Text to append") %>
```

### tp.file.selection

Get currently selected text.

```markdown
<% tp.file.selection() %>
```

### tp.file.include

Include another file's content.

```markdown
<% await tp.file.include("[[Template]]") %>
<% await tp.file.include("[[Note#Section]]") %>
<% await tp.file.include("[[Note#^blockid]]") %>
<% await tp.file.include(tp.file.find_tfile("TemplateName")) %>
```

### tp.file.exists

Check if file exists.

```markdown
<% await tp.file.exists("folder/file.md") %>
<% await tp.file.exists(tp.file.folder(true) + "/" + tp.file.title + ".md") %>
```

### tp.file.find_tfile

Get TFile object by name.

```markdown
<% tp.file.find_tfile("MyFile").basename %>
<% tp.file.find_tfile("MyTemplate") %>
```

### tp.file.create_new

Create a new file.

```markdown
<%* await tp.file.create_new("File content", "NewFileName") %>
<%* await tp.file.create_new(tp.file.find_tfile("MyTemplate"), "NewFileName") %>
<%* await tp.file.create_new("Content", "Name", true) %>
<%* await tp.file.create_new("Content", "Name", false, "Path/To/Folder") %>
```

**Parameters:**
- `template` - Content string or TFile template
- `filename` - Name for new file (default: "Untitled")
- `open_new` - Open file after creation (default: false)
- `folder` - Target folder path or TFolder

### tp.file.rename

Rename current file.

```markdown
<%* await tp.file.rename("New Name") %>
<%* await tp.file.rename(tp.file.title + " - Copy") %>
```

### tp.file.move

Move current file.

```markdown
<%* await tp.file.move("/New/Path/" + tp.file.title) %>
<%* await tp.file.move("/Archive/" + tp.file.title) %>
```

## System Module (tp.system)

### tp.system.clipboard

Get clipboard content.

```markdown
<% await tp.system.clipboard() %>
```

### tp.system.prompt

Show input prompt to user.

```markdown
<% await tp.system.prompt("Enter a value") %>
<% await tp.system.prompt("Enter title", "Default Value") %>
<% await tp.system.prompt("Enter notes", "", false, true) %>
```

**Parameters:**
- `prompt_text` - Text shown above input
- `default_value` - Default value in input
- `throw_on_cancel` - Throw error if cancelled (default: false)
- `multiline` - Use multiline textarea (default: false)

### tp.system.suggester

Show selection list to user.

```markdown
<% await tp.system.suggester(["Option 1", "Option 2", "Option 3"], ["value1", "value2", "value3"]) %>
<% await tp.system.suggester((item) => item, ["Apple", "Banana", "Cherry"]) %>
<% await tp.system.suggester((item) => item.basename, tp.app.vault.getMarkdownFiles()) %>
```

**Parameters:**
- `text_items` - Array of display text or mapping function
- `items` - Array of values to return
- `throw_on_cancel` - Throw error if cancelled (default: false)
- `placeholder` - Placeholder text
- `limit` - Max items to render

### tp.system.multi_suggester

Select multiple items.

```markdown
<% await tp.system.multi_suggester(["A", "B", "C"], ["A", "B", "C"]) %>
<% (await tp.system.multi_suggester((f) => f.basename, tp.app.vault.getMarkdownFiles())).map(f => `[[${f.basename}]]`) %>
```

## Web Module (tp.web)

### tp.web.request

Make HTTP request.

```markdown
<% await tp.web.request("https://api.example.com/data") %>
<% await tp.web.request("https://jsonplaceholder.typicode.com/todos/1") %>
<% await tp.web.request("https://api.example.com/data", "items.0.name") %>
```

**Parameters:**
- `url` - URL to fetch
- `path` - JSON path to extract specific data

### tp.web.daily_quote

Get daily quote.

```markdown
<% await tp.web.daily_quote() %>
```

### tp.web.random_picture

Get random Unsplash image.

```markdown
<% await tp.web.random_picture() %>
<% await tp.web.random_picture("200x200") %>
<% await tp.web.random_picture("200x200", "nature,water") %>
```

## Config Module (tp.config)

Access Templater context information.

```markdown
<% tp.config.template_file %>          Template TFile
<% tp.config.target_file %>            Target TFile
<% tp.config.run_mode %>               How Templater was triggered
<% tp.config.active_file %>            Active file when triggered
```

## Frontmatter Module (tp.frontmatter)

Access current file's frontmatter.

```markdown
<% tp.frontmatter.title %>
<% tp.frontmatter.tags %>
<% tp.frontmatter.author %>
<% tp.frontmatter["custom-field"] %>
```

## Hooks Module (tp.hooks)

Execute code after all templates complete.

```markdown
<%*
tp.hooks.on_all_templates_executed(() => {
    // Code to run after template execution
    console.log("Template execution complete");
});
%>
```

## Obsidian Module (tp.obsidian)

Access Obsidian API.

```markdown
<%* new tp.obsidian.Notice("Hello!") %>
<%* tp.obsidian.moment().format("YYYY-MM-DD") %>
```

## User Scripts (tp.user)

Call custom scripts from configured folder.

```markdown
<% await tp.user.myFunction() %>
<% await tp.user.myFunction("arg1", "arg2") %>
```

## Complete Template Examples

### Daily Note Template

```markdown
---
created: <% tp.date.now("YYYY-MM-DD") %>
tags: daily
---

# <% tp.date.now("dddd, MMMM Do YYYY") %>

## Morning Review
- [ ] Review calendar
- [ ] Check email
- [ ] Set top 3 priorities

## Today's Tasks
- [ ] <% tp.file.cursor() %>

## Notes


## Evening Review
### What went well?

### What could improve?

---
[[<% tp.date.yesterday("YYYY-MM-DD") %>|Yesterday]] | [[<% tp.date.tomorrow("YYYY-MM-DD") %>|Tomorrow]]
```

### Meeting Note Template

```markdown
---
type: meeting
date: <% tp.date.now("YYYY-MM-DD") %>
attendees:
---

# Meeting: <% await tp.system.prompt("Meeting Title") %>

**Date:** <% tp.date.now("MMMM Do YYYY, h:mm A") %>
**Attendees:** <% await tp.system.prompt("Attendees (comma separated)") %>

## Agenda
1. <% tp.file.cursor(1) %>

## Discussion Notes


## Action Items
- [ ]

## Next Steps

```

### Weekly Review Template

```markdown
---
type: weekly-review
week: <% tp.date.now("YYYY-[W]WW") %>
---

# Weekly Review: <% tp.date.weekday("MMMM Do", 0) %> - <% tp.date.weekday("MMMM Do", 6) %>

## This Week's Accomplishments


## Incomplete Items


## Lessons Learned


## Next Week's Priorities
1.
2.
3.

## Notes

```

### Project Note Template

```markdown
---
type: project
status: <% await tp.system.suggester(["Active", "Planning", "On Hold", "Complete"], ["active", "planning", "on-hold", "complete"]) %>
created: <% tp.date.now("YYYY-MM-DD") %>
due:
tags: project
---

# <% await tp.system.prompt("Project Name") %>

## Overview
<% tp.file.cursor() %>

## Goals
-

## Tasks
- [ ]

## Resources


## Notes


## Log
### <% tp.date.now("YYYY-MM-DD") %>
- Created project note
```

### Literature Note Template

```markdown
---
type: literature
title: <% await tp.system.prompt("Title") %>
author: <% await tp.system.prompt("Author") %>
year: <% await tp.system.prompt("Year") %>
status: queue
created: <% tp.date.now("YYYY-MM-DD") %>
---

# <% tp.frontmatter.title %>

**Author:** <% tp.frontmatter.author %>
**Year:** <% tp.frontmatter.year %>

## Summary


## Key Points
-

## Quotes


## My Thoughts


## Connections
-
```

### Quick Capture Template

```markdown
---
type: capture
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
---

# Quick Capture

<% await tp.system.clipboard() %>

---
*Captured on <% tp.date.now("MMMM Do YYYY [at] h:mm A") %>*
```

### File from Clipboard

```markdown
<%*
const content = await tp.system.clipboard();
const title = await tp.system.prompt("Note title", content.split('\n')[0].substring(0, 50));
await tp.file.rename(title);
%>
# <% tp.file.title %>

<% await tp.system.clipboard() %>
```

### Dynamic File Creation

```markdown
<%*
const type = await tp.system.suggester(
    ["Meeting", "Project", "Daily"],
    ["meeting", "project", "daily"]
);

let template;
switch(type) {
    case "meeting":
        template = tp.file.find_tfile("Meeting Template");
        break;
    case "project":
        template = tp.file.find_tfile("Project Template");
        break;
    case "daily":
        template = tp.file.find_tfile("Daily Template");
        break;
}

await tp.file.create_new(template, tp.date.now("YYYY-MM-DD") + " - " + type, true);
%>
```

### Conditional Content

```markdown
<%*
const includeSection = await tp.system.suggester(["Yes", "No"], [true, false]);
%>
<% includeSection ? "## Optional Section\n\nThis section was included." : "" %>
```

## Common Patterns

### Reference File Title as Date

```markdown
<% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>
```

### Navigate Between Daily Notes

```markdown
[[<% tp.date.now("YYYY-MM-DD", -1, tp.file.title, "YYYY-MM-DD") %>|Previous]] | [[<% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>|Next]]
```

### Week Navigation

```markdown
[[<% tp.date.weekday("YYYY-[W]WW", -7, tp.file.title, "YYYY-[W]WW") %>|Previous Week]] | [[<% tp.date.weekday("YYYY-[W]WW", 7, tp.file.title, "YYYY-[W]WW") %>|Next Week]]
```

### Month Range from Title

```markdown
Start: <% moment(tp.file.title, "YYYY-MM").startOf("month").format("YYYY-MM-DD") %>
End: <% moment(tp.file.title, "YYYY-MM").endOf("month").format("YYYY-MM-DD") %>
```

### Store and Reuse Values

```markdown
<%*
const projectName = await tp.system.prompt("Project name");
const priority = await tp.system.suggester(["High", "Medium", "Low"], ["high", "medium", "low"]);
-%>
---
project: <% projectName %>
priority: <% priority %>
---

# <% projectName %>
Priority: <% priority %>
```

### Append to Existing File

```markdown
<%*
const targetFile = tp.file.find_tfile("Log");
await tp.app.vault.append(targetFile, "\n- " + tp.date.now() + ": " + await tp.system.prompt("Log entry"));
%>
```

## References

- [Templater Documentation](https://silentvoid13.github.io/Templater/)
- [Templater GitHub](https://github.com/SilentVoid13/Templater)
- [Moment.js Format Tokens](https://momentjs.com/docs/#/displaying/format/)
