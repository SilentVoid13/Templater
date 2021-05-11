---
title: Overview
slug: /internal-variables-functions
---

The different internal variables and functions offered by [Templater](https://github.com/SilentVoid13/Templater) are available under different **modules**, to sort them. The existing **internal modules** are:

- [Config module](./internal-modules/config-module.md): `tp.config`
- [Date module](./internal-variables-functions/internal-modules/date-module.md): `tp.date`
- [File module](./internal-variables-functions/internal-modules/file-module.md): `tp.file`
- [Frontmatter module](./internal-variables-functions/internal-modules/frontmatter-module.md): `tp.frontmatter`
- [Obsidian module](./internal-variables-functions/internal-modules/obsidian-module.md): `tp.obsidian`
- [System module](./internal-variables-functions/internal-modules/system-module.md): `tp.system`
- [Web module](./internal-variables-functions/internal-modules/web-module.md): `tp.web`

If you understood the [object hierarchy](../syntax.md#objects-hierarchy) correctly, this means that a typical internal variable / function call looks like this: ` <% tp.<module_name>.<internal_variable_or_function_name> %>`

:::note

I invite everyone to contribute to this plugin development by adding new internal functions / variables. More informations [here](./contribute.md).

:::