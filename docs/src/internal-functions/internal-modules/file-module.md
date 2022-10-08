# File Module

{{ tp.file.description }}

<!-- toc -->

## Documentation

Function documentation is using a specific syntax. More information [here](../../syntax.md#function-documentation-syntax)


{%- for key, fn in tp.file.functions %}
### `{{ fn.definition }}` 

{{ fn.description }}

{% if fn.args %}
##### Arguments

{% for key, arg in fn.args %}
- `{{ arg.name }}`: {{ arg.description }}
{% endfor %}
{% endif %}

{% if fn.example %}
##### Example

```
{{ fn.example }}
```
{% endif %}
{%- endfor %}

## Examples

```javascript
<pre>File content: </pre><% tp.file.content %>

<pre>File creation date: </pre><% tp.file.creation_date() %>
<pre>File creation date with format: </pre><% tp.file.creation_date("dddd Do MMMM YYYY HH:mm") %>

<pre>File creation: </pre>[[<% (await tp.file.create_new("MyFileContent", "MyFilename")).basename %>]]

<pre>File cursor: </pre><% tp.file.cursor(1) %>

<pre>File cursor append: </pre><% tp.file.cursor_append("Some text") %>

<pre>File existence: </pre><% await tp.file.exists("MyFolder/MyFile.md") %>

<pre>File find TFile: </pre><% tp.file.find_tfile("MyFile").basename %>

<pre>File Folder: </pre><% tp.file.folder() %>
<pre>File Folder with relative path: </pre><% tp.file.folder(true) %>

<pre>File Include: </pre><% tp.file.include("[[Template1]]") %>

<pre>File Last Modif Date: </pre><% tp.file.last_modified_date() %>
<pre>File Last Modif Date with format: </pre><% tp.file.last_modified_date("dddd Do MMMM YYYY HH:mm") %>

<pre>File Move: </pre><% await tp.file.move("/A/B/" + tp.file.title) %>
<pre>File Move + Rename: </pre><% await tp.file.move("/A/B/NewTitle") %>

<pre>File Path: </pre><% tp.file.path() %>
<pre>File Path with relative path: </pre><% tp.file.path(true) %>

<pre>File Rename: </pre><% await tp.file.rename("MyNewName") %>
<pre>Append a "2": </pre><% await tp.file.rename(tp.file.title + "2") %>

<pre>File Selection: </pre><% tp.file.selection() %>

<pre>File tags: </pre><% tp.file.tags %>

<pre>File title: </pre><% tp.file.title %>
<pre>Strip the Zettelkasten ID of title (if space separated): </pre><% tp.file.title.split(" ")[1] %>
```
