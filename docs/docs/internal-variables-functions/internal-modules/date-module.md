---
title: Date Module
---

This module contains every internal variable / function related to dates.

## Documentation

:::tip

Function documentation is using a specific syntax. More informations [here](../../syntax#function-documentation-syntax)

:::

| Internal Variable / Function                                 | Arguments                                                    | Description                | Example Output |
| ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------- | -------------- |
| `tp.date.now(format: string = "YYYY-MM-DD", offset?: number, reference?: string, reference_format?: string)` | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/)<br />- `offset`: Offset for the day, e.g. set this to `-7` to get last week's date.<br />- `reference`: The date referential, e.g: set this to the note's title<br />- `reference_format`: The date reference format. | Retrieves the date.        | `2021-01-15`   |
| `tp.date.tomorrow(format: string = "YYYY-MM-DD")`            | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) | Retrieves tomorrow's date  | `2020-11-07`   |
| `tp.date.yesterday(format: string = "YYYY-MM-DD")`           | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) | Retrieves yesterday's date | `2020-11-07`   |

## Examples

```
Date now: <% tp.date.now() %>
Date now with format: <% tp.date.now("Do MMMM YYYY") %>

Last week: <% tp.date.now("dddd Do MMMM YYYY", -7) %>
Today: <% tp.date.now("dddd Do MMMM YYYY, ddd") %>
Next week: <% tp.date.now("dddd Do MMMM YYYY", 7) %>

Date tomorrow with format: <% tp.date.tomorrow("Do MMMM YYYY") %>    

Date yesterday with format: <% tp.date.yesterday("Do MMMM YYYY") %>

File's title date + 1 day (tomorrow): <% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>

File's title date - 1 day (yesterday): <% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>
```
