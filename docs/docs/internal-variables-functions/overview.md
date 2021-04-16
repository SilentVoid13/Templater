---
title: Overview
slug: /internal-variables-functions
---

The different internal variables and functions offered by [Templater](https://github.com/SilentVoid13/Templater) are available under different **modules**, to sort them. The existing **internal modules** are:

- [Date module](internal-variables-functions/internal-modules/date-module): `tp.date`
- [File module](internal-variables-functions/internal-modules/file-module): `tp.file`
- [Frontmatter module](internal-variables-functions/internal-modules/frontmatter-module): `tp.frontmatter`
- [System module](internal-variables-functions/internal-modules/system-module): `tp.system`
- [Web module](internal-variables-functions/internal-modules/web-module): `tp.web`

If you understood the [object hierarchy](syntax#objects-hierarchy) correctly, this means that a typical internal variable / function call looks like this: ` <% tp.<module_name>.<internal_variable_or_function_name> %>`

:::note

I invite everyone to contribute to this plugin development by adding new internal functions / variables. More informations [here](internal-variables-functions/contribute).

:::