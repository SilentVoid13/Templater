# Internal Templates

Thanks for considering contributing to [Templater](https://github.com/SilentVoid13/Templater) !

Developing a new internal template is really easy.

Keep in mind that only pertinent Internal Templates will be accepted, don't submit a very specific internal template that you'll be the only one using.

## Layout

Internal templates are sorted by modules. Each module has a dedicated folder under [src/InternalTemplates](https://github.com/SilentVoid13/Templater/tree/master/src/InternalTemplates). 

Let's take the [date module](https://github.com/SilentVoid13/Templater/tree/master/src/InternalTemplates/date) as an example.

It contains an [InternalModuleDate](https://github.com/SilentVoid13/Templater/blob/master/src/InternalTemplates/date/InternalModuleDate.ts) file where all our internal date templates are defined and registered:

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
- `this.templates` attribute: A map that maps a string representing the name of the template with a function or a variable that will be the template output.
- `this.file` attribute: The destination file on which the template will be applied.
- `this.plugin` attribute: The Templater plugin object.
- `this.generateTemplates()` method: Registers every template in the `templates` map.

You can use these attributes in your templates if you need them.

## Registering a new template

Here are the different steps you need to follow to register a new template in a module.

**1st step:** Create a method inside the module called `generate_<template_name>()` that will generate your template and return either a lambda function or directly the value.

All generation methods are ordered by alphabetical order based on the template name.

Try to give a good, self-explanatory name for your template.

If the template is a lambda function, you can accept some arguments, make some arguments optional, etc.

**2nd step:** Register your internal template in the `templates` map within the `generateTemplates()` method.

To register your template, use your `this.generate_<template_name>()` method you defined earlier:

```typescript
this.templates.set(<template_name>, this.generate_<template_name>());
```

Templates registrations are also ordered by alphabetical order based on the template name.

**3rd step:** Add your template documentation in the [README](https://github.com/SilentVoid13/Templater/blob/master/README.md).



And you are done ! Thanks for the contribution.

Now, just submit a [pull request](https://github.com/SilentVoid13/Templater/pulls), I'll try to be as reactive as possible.