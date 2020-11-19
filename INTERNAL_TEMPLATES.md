# Internal Templates

Thanks for considering contributing to [Templater](https://github.com/SilentVoid13/Templater) !

Developing a new internal template is really easy, let's see how.

All internal templates are located in the file https://github.com/SilentVoid13/Templater/blob/master/src/internal_templates.ts.

Let's take the `{{tp_today}}` internal template as an example:

```typescript
async function tp_today(_app: App, args: {[key: string]: string}): Promise<String> {
    let today;
    if (Object.keys(args).length === 0) {
        today = moment().format("YYYY-MM-DD");
    }
    else {
        let format = args["f"];
        today = moment().format(format);
    }
    return today;
}
```

**1st step:** First you need to develop your internal template function. As you can see, an internal template function is an asynchronous function: 

- This function takes as parameters the `App` object `app` and the internal template arguments `args` passed by the user. `args`  is a dictionary containing the argument name as a key and the argument value as a value. For example `{{tp_today:f=YYYY}}` will give `{"f": "YYYY"}`.
- This function returns a string. This string will replace the template pattern (here `{{tp_today:<args>}}`) in the file.

**2nd step:** When you finished your function, just add it to the `internal_templates_map` hashmap located at the top of the [internal_templates](https://github.com/SilentVoid13/Templater/blob/master/src/internal_templates.ts) file. Your desired template pattern is the key, and your internal template function is the value.

```typescript
export const internal_templates_map: {[id: string]: Function} = {
    "title": tp_title,
    "today": tp_today,
    "tomorrow": tp_tomorrow,
    "yesterday": tp_yesterday,
    "daily_quote": tp_daily_quote,
    "random_picture": tp_random_picture,
    "title_picture": tp_title_picture,
};
```

And you're done ! The function `replace_internal_templates` will loop through each function of the `internal_templates_map` and replace what needs to be replaced. Doubles braces and the prefix `tp_` will be added around your template keyword. So for example the keyword `title` will match the template pattern `{{tp_title}}`.

Here are some basic rules in order to keep the code clean:

- Your internal template function name should be prefixed with the keyword `tp_` and have the same name as your template keyword (e.g. `tp_title` function for the `title` keyword).

Just submit a [pull request](https://github.com/SilentVoid13/Templater/pulls) when you're finished, I'll try to be as reactive as possible.

