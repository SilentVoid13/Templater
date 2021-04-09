---
title: Overview
slug: /eta-features
---

Using the [Eta](https://eta.js.org/) templating engine, [Templater](https://github.com/SilentVoid13/Templater) defines 3 types of opening tags, that defines 3 types of **commands**:

- `<%`:  Raw display command. It will just output the expression that's inside.
- `<%~`: Interpolation command. Same as the raw display tag, but adds some character escaping.
- `<%*`: JavaScript execution command. It will execute the JavaScript code that's inside. It does not output anything by default.

The closing tag for a command always is always the same: `%>`

The first 2 types of commands are just displaying the values, the interesting one comes with the JavaScript execution command, that we'll discuss in the next part.