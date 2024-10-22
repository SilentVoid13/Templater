# Internal Functions

The different internal variables and functions offered by [Templater](https://github.com/SilentVoid13/Templater) are available under different **modules**, to sort them. The existing **internal modules** are:

- [App module](./internal-modules/app-module.md): `tp.app`
- [Config module](./internal-modules/config-module.md): `tp.config`
- [Date module](./internal-modules/date-module.md): `tp.date`
- [File module](./internal-modules/file-module.md): `tp.file`
- [Frontmatter module](./internal-modules/frontmatter-module.md): `tp.frontmatter`
- [Hooks module](./internal-modules/hooks-module.md): `tp.hooks`
- [Obsidian module](./internal-modules/obsidian-module.md): `tp.obsidian`
- [System module](./internal-modules/system-module.md): `tp.system`
- [Web module](./internal-modules/web-module.md): `tp.web`

If you understood the [object hierarchy](../syntax.md#objects-hierarchy) correctly, this means that a typical internal function call looks like this: ` <% tp.<module_name>.<internal_function_name> %>`

## Contribution 

I invite everyone to contribute to this plugin development by adding new internal functions. More information [here](./contribute.md).