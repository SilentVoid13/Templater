---
title: Readwise Module
---

This module contains every internal variable / function for fetching content from the online service [readwise.io](https://readwise.io).

## Documentation

:::tip

Function documentation is using a specific syntax. More informations [here](../../syntax.md#function-documentation-syntax)

:::

| Internal Variable / Function                                 | Arguments                                                    | Description                    | Example Output |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------ | -------------- |
| `tp.readwise.random(access_token: string = "YOUR-ACCESS-TOKEN", bookd_id?: number)` | - `access_token`: Your readwise.io access token. [Find yours here.][access_token]<br />- `book_id`: Optional; if this is set, will limit result to highlights for this book. See below for instructions on how to find your book id. | Retrieves a random highlight. | `It is, in other words, not objects and events but the interpretations we place on them that are the problem. Our duty is therefore to exercise stringent control over the faculty of perception, with the aim of protecting our mind from error.<br><br>- [Marcus Aurelius (Meditations)](https://readwise.io/bookreview/9983669)`   |
| `tp.readwise.latest(access_token: string = "YOUR-ACCESS-TOKEN", bookd_id?: number)` | - `access_token`: Your readwise.io access token. [Find yours here.][access_token]<br />- `book_id`: Optional; if this is set, will limit result to highlights for this book. See below for instructions on how to find your book id. | Retrieves the latest highlight. | `If anyone can refute me—show me I’m making a mistake or looking at things from the wrong perspective—I’ll gladly change. It’s the truth I’m after, and the truth never harmed anyone. What harms us is to persist in self-deceit and ignorance.<br><br>- [Marcus Aurelius (Meditations)](https://readwise.io/bookreview/9983669)`   |

:::tip

To find the `book_id` parameter for your chosen book, find it in your [Readwise Library]. After you select it, the URL of your browser will have the id as the last parameter, for example:

`https://readwise.io/bookreview/9983669`

:::

## Examples

```javascript
Get a random highlight: <% tp.readwise.random("YOUR-ACCESS-KEY") %>
Get a random highlight from Meditations by Marcus Aurelius: <% tp.readwise.random("YOUR-ACCESS-KEY", 9983669) %>

Get the latest highlight: <% tp.readwise.latest("YOUR-ACCESS-KEY") %>
Get the latest highlight from Meditations by Marcus Aurelius: <% tp.readwise.latest("YOUR-ACCESS-KEY", 9983669) %>

```

[access_token]: https://readwise.io/access_token
[Readwise Library]: https://readwise.io/books
