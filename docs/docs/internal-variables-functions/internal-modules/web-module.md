---
title: Web module
---

This modules contains every internal variable / function related to the web (using web requests).

[Templater](https://github.com/SilentVoid13/Templater) doesn't escape characters by default. When doing web requests, it may be useful to escape dangerous characters. You can escape a command's response characters using the `<%~` opening tag. More informations [here](../../commands/overview.md).

## Documentation

:::tip

Function documentation is using a specific syntax. More informations [here](../../syntax.md#function-documentation-syntax)

:::

| Internal Variable / Function                           | Arguments                                                    | Description                                                  | Example Output                                               |
| ------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `tp.web.daily_quote()`                                 | None                                                         | Retrieves and parses the daily quote from the API https://quotes.rest/ | ![quote](/img/templater_daily_quote.png)                     |
| `tp.web.random_picture(size?: string, query?: string)` | - `size`: Image size in the format `<width>x<height>`.<br />- `query`: Limits selection to photos matching a search term. Multiple search terms can be passed separated by a comma `,` | Gets a random image from https://unsplash.com/               | `![image](https://images.unsplash.com/photo-1602583019685-26371425dc0f)` |

## Examples

```javascript
Web Daily quote:  
<% tp.web.daily_quote() %>

Web Random picture: 
<% tp.web.random_picture() %>

Web Random picture with size: 
<% tp.web.random_picture("200x200") %>

Web random picture with size + query: 
<% tp.web.random_picture("200x200", "landscape,water") %>
```