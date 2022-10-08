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

## Moment.js

Templater gives you access to the `moment` object, with all of its functionalities.

More information on moment.js [here](https://momentjs.com/docs/#/displaying/)

## Examples

```javascript
<pre>Date now: </pre><% tp.date.now() %>
<pre>Date now with format: </pre><% tp.date.now("Do MMMM YYYY") %>

<pre>Last week: </pre><% tp.date.now("dddd Do MMMM YYYY", -7) %>
<pre>Today: </pre><% tp.date.now("dddd Do MMMM YYYY, ddd") %>
<pre>Next week: </pre><% tp.date.now("dddd Do MMMM YYYY", 7) %>

<pre>Last month: </pre><% tp.date.now("YYYY-MM-DD", "P-1M") %>
<pre>Next year: </pre><% tp.date.now("YYYY-MM-DD", "P1Y") %>

<pre>File's title date + 1 day (tomorrow): </pre><% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>
<pre>File's title date - 1 day (yesterday): </pre><% tp.date.now("YYYY-MM-DD", -1, tp.file.title, "YYYY-MM-DD") %>

<pre>Date tomorrow with format: </pre><% tp.date.tomorrow("Do MMMM YYYY") %>    

<pre>This week's monday: </pre><% tp.date.weekday("YYYY-MM-DD", 0) %>
<pre>Next monday: </pre><% tp.date.weekday("YYYY-MM-DD", 7) %>
<pre>File's title monday: </pre><% tp.date.weekday("YYYY-MM-DD", 0, tp.file.title, "YYYY-MM-DD") %>
<pre>File's title next monday: </pre><% tp.date.weekday("YYYY-MM-DD", 7, tp.file.title, "YYYY-MM-DD") %>

<pre>Date yesterday with format: </pre><% tp.date.yesterday("Do MMMM YYYY") %>
```