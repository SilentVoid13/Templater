---
title: Script User Functions
---

This type of user functions allows you to call JavaScript functions from JavaScript files and retrieve their output.

To use script user functions, you need to specify a script folder in Templater's settings. This folder needs to be accessible from your vault. 

## Define a Script User Function

Let's say you specified the `Scripts` folder as your script folder in Templater's settings.

You can then create your script named `Scripts/my_script.js` (The `.js` extension is required) for example.

Scripts should follow the [CommonJS module specification](https://flaviocopes.com/commonjs/), and export a single function.

Let's have an example with our previous script `my_script.js`:

```javascript
function my_function (msg) {
    console.log("Message from my script:", msg);
}
module.exports = my_function;
```

Templater will then load all JavaScript (`.js` files) scripts in the `Scripts` folder.

You will then be able to call your scripts as user functions. The function name corresponds to the script file name.

In our previous example, a complete command invocation would look like this: 

```javascript
<% tp.user.my_script("Hello World!") %>
```

Which would print `Message from my script: Hello World!` in the console.

:::info 

In script user functions, you can still access global namespace variables like `app` or `moment`.

However, you can't access Eta scoped variables like `tp` or `tR`. If you want to use them, you must pass them as arguments for your function.

:::

## Functions Arguments

You can pass as much arguments as you want to your function, depending on how you defined it.

You can for example pass the `tp` object to your function, to be able to use all of the [internal variables / functions](../internal-variables-functions/overview.md) of Templater: `<% tp.user.<user_function_name>(tp) %>`