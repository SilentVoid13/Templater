# Script User Functions

This type of user functions allows you to call JavaScript functions from JavaScript files and retrieve their output.

To use script user functions, you need to specify a script folder in Templater's settings. This folder needs to be accessible from your vault. 

## Define a Script User Function

Let's say you specified the `Scripts` folder as your script folder in Templater's settings.

Templater will load all JavaScript (`.js` files) scripts in the `Scripts` folder.

You can then create your script named `Scripts/my_script.js` (the `.js` extension is required) for example. You will likely have to create the file outside of Obsidian, as Obsidian only creates markdown files.

You will then be able to call your scripts as user functions. **The function name corresponds to the script file name**.

Scripts should follow the [CommonJS module specification](https://flaviocopes.com/commonjs/), and export a single function or object where all the keys are functions.

```javascript
module.exports = function (msg) {
    return `Message from my script: ${msg}`;
};
```

In this example, a complete command invocation would look like this: 

```javascript
<% tp.user.my_script("Hello World!") %>
```

Which would output `Message from my script: Hello World!`.

You can also export an object of functions. Note that every property of the object must be a function.

```javascript
function formatAsCallout(text, type = "note") {
  const blockQuoteLines = text.split("\n").map((line) => `> ${line}`);
  return `> [!${type}]\n${blockQuoteLines.join("\n")}`;
}

module.exports = {
  note: (text) => formatAsCallout(text, "note"),
  tip: (text) => formatAsCallout(text, "tip"),
  warning: (text) => formatAsCallout(text, "warning"),
};

```

In this example, a complete command invocation would look like this:

```javascript
<% tp.user.my_script.note("Line 1\nLine2") %>
```

Which would output:

```md
> [!note]
> Line 1
> Line2
```

## Global namespace

In script user functions, you can still access global namespace variables like `app` or `moment`.

However, you can't access the template engine scoped variables like `tp` or `tR`. If you want to use them, you must pass them as arguments for your function.


## Functions Arguments

You can pass as many arguments as you want to your function, depending on how you defined it.

You can for example pass the `tp` object to your function, to be able to use all of the [internal variables / functions](../internal-variables-functions/overview.md) of Templater: `<% tp.user.<user_function_name>(tp) %>`

## User Script Documentation

Optionally you can document what a script does using the [TSDoc Standard](https://tsdoc.org/) at the **top** of your method file. If provided, this will provide an intellisense-like experience for your user scripts similar to the experience of the other templater functions.

### Example of User Script with Documentation

```javascript
/**
 * This does something cool
 */
function doSomething() {
    console.log('Something was done')
}

module.exports = doSomething;
```
