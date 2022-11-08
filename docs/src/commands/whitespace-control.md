# Whitespace Control

By default, **commands** in Templater are not removing any newlines. Commands are replaced with their values and that's it.

It can sometimes be useful to have some whitespace control after commands are inserted, which is exactly what this command utility offers.

Let's have an example. The following template:

```
<%* if (tp.file.title == "MyFile" ) { %>
This is my file!
<%* } else { %>
This isn't my file!
<%* } %>
Some content ...
```

Will produce the following output if the condition is false (the same happens when it's true), notice the blank lines:

```

This isn't my file!

Some content ...
```

You may want to remove the blank lines produced by the **execution commands**, that do not produce any output.

A specific syntax exists for whitespace control:

- An underscore `_` at the **beginning** of a tag (`<%_`) will trim **all** whitespace **before** the command
- An underscore `_` at the **end** of a tag (`_%>`) will trim **all** whitespace **after** the command
- A dash `-` at the **beginning** of a tag (`<%-`) will trim **one** newline **before** the command
- A dash `-` at the **end** of a tag (`-%>`) will trim **one** newline **after** the command.

In our example, to fix our template to remove the blank lines, we would use the following template (notice the dashes `-` at the end of the tags), to remove the blank newlines **after** the execution commands:

```
<%* if (tp.file.title == "MyFile" ) { -%>
This is my file!
<%* } else { -%>
This isn't my file!
<%* } -%>
Some content ...
```

Which would produce the following output:

```
This isn't my file!
Some content ...
```
