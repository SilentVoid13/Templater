---
title: Config Module
---

This module exposes Templater's [running configuration](https://github.com/SilentVoid13/Templater/blob/master/src/Templater.ts#L16). 

This is mostly useful when writing scripts requiring some context informations.

| Internal Variable / Function | Description                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| `tp.config.template_file`    | The `TFile` object representing the template file.           |
| `tp.config.target_file`      | The `TFile` object representing the target file where the template will be inserted |
| `tp.config.run_mode`         | The `RunMode` [enumeration](https://github.com/SilentVoid13/Templater/blob/master/src/Templater.ts#L8), representing the way Templater was launched (Create new from template, Append to active file, ...) |
| `tp.config.active_file?`     | The active file (if existing) when launching Templater.      |
