---
title: Overview
---

Using the [Eta](https://eta.js.org/) templating engine, [Templater](https://github.com/SilentVoid13/Templater) defines 3 types of opening tags for commands:

- `<%`:  Raw display tag. It will just output the expression that's inside.
- `<%*`: JavaScript execution tag. It will execute the JavaScript code that's inside. It does not output anything by default.
- `<%~`: Interpolation tag. Same as the raw display tag, but adds some character escaping.

The closing tag for a command always stays the same: `%>`

## JavaScript Execution Tag

With this type of tag, we can pretty much do everything that JavaScript allows us to do.

**Warning:** Some internal functions are asynchronous. When calling such functions inside a JavaScript execution tag don't forget to use the `await` keyword if necessary.

### Output a value from a JavaScript Execution Tag

Sometimes, you may want to output something when using a JS execution tag. This is possible.

The [Eta](https://eta.js.org/) templating engine generates a replacement string using all of our commands results, that is stored in the `tR` variable. This string contains the processed file content result if you want. You are allowed to access that variable from a JS execution tag.

This means that, to output something from a JS execution tag, you just need to append what you want to output to that string.

For example, the following command: `<%* tR += "test" %>` will output `test`.

You usually don't want to override the `tR` variable (e.g. `tR = "test"`), because that means overriding the replacement string.

### Examples

Here are some examples of things you can do using JavaScript Execution Tags:

```javascript
<%* if (tp.file.title.startsWith("Hello")) { %>
This is a hello file !
<%* } else { %>
This is a normal file !
<%* } %>
    
<%* if (tp.frontmatter.type === "seedling") { %>
This is a seedling file !
<%* } else { %>
This is a normal file !
<%* } %>
    
<%* if (tp.file.tags.contains("#todo")) { %>
This is a todo file !
<%* } else { %>
This is a finished file !
<%* } %>
    
<%*
function log(msg) {
	console.log(msg);
}
%>
<%* log("Title: " + tp.file.title) %>
    
<%* tR += tp.file.content.replace(/stuff/, "things"); %>
```
