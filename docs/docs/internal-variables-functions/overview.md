---
title: Overview
slug: /internal-variables-functions
---

The different internal variables and functions offered by [Templater](https://github.com/SilentVoid13/Templater) are available under different **modules**, to sort them. The existing **internal modules** are:

- [Config module](internal-modules/config-module): `tp.config`
- [Date module](internal-modules/date-module): `tp.date`
- [File module](internal-modules/file-module): `tp.file`
- [Frontmatter module](internal-modules/frontmatter-module): `tp.frontmatter`
- [Obsidian module](internal-modules/obsidian-module): `tp.obsidian`
- [System module](internal-modules/system-module): `tp.system`
- [Web module](internal-modules/web-module): `tp.web`

If you understood the [object hierarchy](syntax#objects-hierarchy) correctly, this means that a typical internal variable / function call looks like this: ` <% tp.<module_name>.<internal_variable_or_function_name> %>`

:::note

I invite everyone to contribute to this plugin development by adding new internal functions / variables. More informations [here](contribute).

:::
