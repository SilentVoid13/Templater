# Internal Templates

Thanks for considering contributing to [Templater](https://github.com/SilentVoid13/Templater) !

Developing a new internal template is really easy, let's see how.

All internal templates are located in the file https://github.com/SilentVoid13/Templater/blob/master/src/internal_templates.ts.

Let's take the `{{templater_daily_quote}}` internal template as an example:

```typescript
async function templater_daily_quote() {
    let response = await axios.get("https://quotes.rest/qod");
    let author = response.data.contents.quotes[0].author;
    let quote = response.data.contents.quotes[0].quote;

    let new_content = `> ${quote}\n> &mdash; <cite>${author}</cite>`;
    return new_content;
}
```

**1st step:** First you need to develop your internal template function. As you can see, an internal template function is a function that takes no arguments and returns a string. This string will replace the template pattern (here `{{templater_daily_quote}}`) in the file.

**2nd step:** When you finished your function, just add it to the `internal_templates_map` hashmap located at the top of the [internal_templates](https://github.com/SilentVoid13/Templater/blob/master/src/internal_templates.ts) file. Your desired template pattern is the key, and your internal template function is the value:

```typescript
export const internal_templates_map: {[id: string]: Function} = {
    "{{templater_daily_quote}}": templater_daily_quote,
};
```

And you're done ! The function `replace_internal_templates` will loop through each function of the `internal_templates_map` and replace what needs to be replaced.

Here are some basic rules in order to keep the code clean:

- All internal templates patterns should be prefixed with the keyword `templater_`.
- Your internal template function should have the same name as your template pattern.

Just submit a [pull request](https://github.com/SilentVoid13/Templater/pulls) when you're finished, I'll try to be as reactive as possible.

