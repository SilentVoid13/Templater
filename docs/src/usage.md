# Usage

Templater can be used in different ways. You can follow along with the examples on this page.

## Creating a template

To use Templater you create and use special Obsidian notes that contain 1 or more [commands](./terminology.md). These template notes should live in a separate directory, `Templates/` for example.

#### Try it

In your vault make a directory called `Templates/` and create a note called `Example` in it.

Now configure Templater so the "Template folder location" setting points to this new directory.

Copy-paste the following content into the template note: `Templates/Example`:
```javascript
<% tp.date.now("YYYY-MM-DD") %>
```

We're going to use this template in the next sections.

## Using a template

You can use a template in multiple ways.

### When creating a new note

You can create a new note using a template. You can do this using the **Templater: Create note from template** command. This command will show you the list of templates you've defined and lets you choose one. When you choose a template the following things will happen:

- a new note will be created
- the new note is called "Untitled" ([customizeable](./internal-functions/internal-modules/file-module.md#tpfilerenamenew_title-string))
- the chosen template will be inserted into the new note
- Templater will run (interpret/execute) all the commands in this new note
- each command in the new note will either be replaced by something or disappear
- the resulting note will not have any commands in it
- the new note will be opened
- the title of the note will be selected (so you can change it immediately)

#### Try it

Now try it yourself: trigger the [Obsidian Command Palette](https://help.obsidian.md/Plugins/Command+palette) and type "Create note from template" to find the **Templater: Create note from template** command. Select that command and then select the `Example` template.

You should get a new note in your vault called `Untitled`. The first line of the note should be the current date in `YYYY-MM-DD` format.

This way of using templates is practical for creating templates for whole notes. You can imagine having these kinds of templates for recipes, movie reviews and book summaries.

### Inserting a template into the current note

(Obsidian has a built-in command called **Templates: Insert Template** which is not part of Templater. You cannot use this to insert Templater templates.)

Instead of creating a new note you can also *insert* a template into the note that you're currently editing.

You can do this using the command **Templater: Open Insert Template Model** from the command palette. You can also trigger this command by clicking the Templater icon `<%` in the sidebar ribbon. This command will show you the list of templates you've defined and lets you choose one. When you choose a template the following things will happen:

- the contents of the chosen template will be inserted into the currently active note, at the location of your cursor
- each command in the current note will either be replaced by something or disappear
- the resulting note will not have any commands in it

#### Try it

Create a new note called "Holiday". Write "before" on the first line. Then create an empty line. Write "after" on the last (3rd) line. Now put your cursor on the empty line and trigger the **Templater: Open Insert Template Model** command using the Command Palette or the Templater icon in the sidebar.

The empty line in your note should be replaced by the current date in `YYYY-MM-DD` format.

This way of using templates is useful when you write notes that often have similar parts. You can imagine having templates for [tables](https://help.obsidian.md/Editing+and+formatting/Advanced+formatting+syntax#Tables), [diagrams](https://help.obsidian.md/Editing+and+formatting/Advanced+formatting+syntax#Diagram) or [embedding webpages](https://help.obsidian.md/Editing+and+formatting/Embedding+web+pages). After inserting the template you can then edit the inserted content as you need.

---

These are the basics of how to use Templater. The [next section](./terminology.md) will formally introduce the terminology used.
