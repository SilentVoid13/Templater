---
title: Date Module
---

This module contains every internal variable / function related to dates.

## Documentation

:::tip

Function documentation is using a specific syntax. More informations [here](../../syntax.md#function-documentation-syntax)

:::

| Internal Variable / Function                                 | Arguments                                                    | Description                    | Example Output |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------ | -------------- |
| `tp.date.now(format: string = "YYYY-MM-DD", offset?: number⎮string, reference?: string, reference_format?: string)` | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/)<br />- `offset`: Offset for the day, e.g. set this to `-7` to get last week's date. You can also specify the offset as a string using the [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) format, e.g. set this to `"P-1M"` to get last month's date.<br />- `reference`: The date referential, e.g. set this to the note's title<br />- `reference_format`: The date reference format. | Retrieves the date.            | `2021-01-15`   |
| `tp.date.tomorrow(format: string = "YYYY-MM-DD")`            | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) | Retrieves tomorrow's date      | `2020-11-07`   |
| `tp.date.weekday(format: string = "YYYY-MM-DD", weekday: number, reference?: string, reference_format?: string)` | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/)<br />- `weekday`: Week day number. If the locale assigns Monday as the first day of the week, `0` will be Monday, `-7` will be last week's day.<br />- `reference`: The date referential, e.g. set this to the note's title<br />- `reference_format`: The date reference format. | Retrieves the week's day date. | `2021-04-06`   |
| `tp.date.yesterday(format: string = "YYYY-MM-DD")`           | - `format`: Format for the date, refer to [format reference](https://momentjs.com/docs/#/displaying/format/) | Retrieves yesterday's date     | `2020-11-07`   |

:::tip

Templater gives you access to the `moment` object, with all of its functionalities.

More informations on moment.js [here](https://momentjs.com/docs/#/displaying/)

:::

## Examples

```javascript
Date now: <% tp.date.now() %>
Date now with format: <% tp.date.now("Do MMMM YYYY") %>

Last week: <% tp.date.now("dddd Do MMMM YYYY", -7) %>
Today: <% tp.date.now("dddd Do MMMM YYYY, ddd") %>
Next week: <% tp.date.now("dddd Do MMMM YYYY", 7) %>

Last month: <% tp.date.now("YYYY-MM-DD", "P-1M") %>
Next year: <% tp.date.now("YYYY-MM-DD", "P1Y") %>

File's title date + 1 day (tomorrow): <% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>
File's title date - 1 day (yesterday): <% tp.date.now("YYYY-MM-DD", -1, tp.file.title, "YYYY-MM-DD") %>

Date tomorrow with format: <% tp.date.tomorrow("Do MMMM YYYY") %>    

This week's monday: <% tp.date.weekday("YYYY-MM-DD", 0) %>
Next monday: <% tp.date.weekday("YYYY-MM-DD", 7) %>
File's title monday: <% tp.date.weekday("YYYY-MM-DD", 0, tp.file.title, "YYYY-MM-DD") %>
File's title next monday: <% tp.date.weekday("YYYY-MM-DD", 7, tp.file.title, "YYYY-MM-DD") %>

Date yesterday with format: <% tp.date.yesterday("Do MMMM YYYY") %>
```