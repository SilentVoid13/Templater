# Date Module

{{ tp.date.description }}

<!-- toc -->

## Documentation

Function documentation is using a specific syntax. More information [here](../../syntax.md#function-documentation-syntax)

{%- for key, fn in tp.date.functions %}
### `{{ fn.definition }}` 

{{ fn.description }}

{% if fn.args %}
##### Arguments

{% for arg in fn.args %}
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

## Moment.js

Templater gives you access to the `moment` object, with all of its functionalities.

More information on moment.js [here](https://momentjs.com/docs/#/displaying/)

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