# Internal Commands

Thanks for considering contributing to [Templater](https://github.com/SilentVoid13/Templater) !

Developing a new internal variable / function is really easy.

Keep in mind that only pertinent submissions will be accepted, don't submit a very specific internal variable / function that you'll be the only one using.

## Layout

Internal variables / functions are sorted by modules. Each module has a dedicated folder under [src/InternalTemplates](https://github.com/SilentVoid13/Templater/tree/master/src/InternalTemplates). 

Let's take the [date module](https://github.com/SilentVoid13/Templater/tree/master/src/InternalTemplates/date) as an example.

It contains an [InternalModuleDate](https://github.com/SilentVoid13/Templater/blob/master/src/InternalTemplates/date/InternalModuleDate.ts) file where all our internal date's related variable and functions are defined and registered:

```typescript
export class InternalModuleDate extends InternalModule {
    name = "date";

    async generateTemplates() {
        this.templates.set("now", this.generate_now());
        this.templates.set("tomorrow", this.generate_tomorrow());
        this.templates.set("yesterday", this.generate_yesterday());
    }

    generate_now() {
        return (format: string = "YYYY-MM-DD", offset?: number, reference?: string, reference_format?: string) => {
            if (reference && !window.moment(reference, reference_format).isValid()) {
                throw new Error("Invalid title date format, try specifying one with the argument 'reference'");
            }
            return get_date_string(format, offset, reference, reference_format);
        }
    }

    generate_tomorrow() {
        return (format: string = "YYYY-MM-DD") => {
            return get_date_string(format, 1);
        }
    }

    generate_yesterday() {
        return (format: string = "YYYY-MM-DD") => {
            return get_date_string(format, -1);
        }
    }
}
```

Every module extends the [InternalModule](https://github.com/SilentVoid13/Templater/blob/master/src/InternalTemplates/InternalModule.ts) abstract class, which means they contain the following attributes and methods:

- `this.app` attribute: the obsidian API `App` object.
- `this.templates` attribute: A map that maps a string representing the name of the variable / function with the actual variable / function.
- `this.file` attribute: The destination file where the template will be inserted.
- `this.plugin` attribute: The Templater plugin object.
- `this.generateTemplates()` method: Registers every internal variable / function in the `templates` map.

You can use these attributes in your new internal variable / function if you need them.

## Registering a new internal variable / function

Here are the different steps you need to follow to register a new internal variable / function in a module.

**1st step:** Create a method inside the module called `generate_<internal_variable_or_function_name>()` that will generate your internal variable / function, that means it will return either a lambda function (representing the internal function) or directly the internal variable you want to expose.

All generation methods are ordered by alphabetical order based on the internal variable / function name.

Try to give a good, self-explanatory name for your variable / function.

**2nd step:** Register your internal variable / function in the `templates` map within the `generateTemplates()` method.

To register your variable / function, use your `this.generate_<internal_variable_or_function_name>()` method you defined earlier:

```typescript
this.templates.set(<internal_variable_or_function_name>, this.generate_<internal_variable_or_function_name>());
```

Internal variable / function registrations are also ordered by alphabetical order based on the variable / function name.

**3rd step:** Add your internal variable / function documentation in the [README](https://github.com/SilentVoid13/Templater/blob/master/README.md).

And you are done ! Thanks for the contribution.

Now, just submit a [pull request](https://github.com/SilentVoid13/Templater/pulls), I'll try to be as reactive as possible.