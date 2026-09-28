import { obsidianPage } from "wdio-obsidian-service";
import ActiveMarkdownViewPage from "../../page-objects/ActiveMarkdownView.page";
import EditorSuggestionsPage from "../../page-objects/EditorSuggestions.page";
import NoticePage from "../../page-objects/Notice.page";
import { resetVault } from "../../utils/reset-vault";

describe("User function autocomplete", () => {
    it("typing tp.user. with correctly configured user scripts folder shows suggestions without error", async () => {
        await resetVault("test/vault", {
            "user scripts/hello_world.js": `module.exports = function() { return "Hello world"; }`,
            "notes/show suggestion.md": `\n`,
        });
        await obsidianPage.openFile("notes/show suggestion.md");
        await ActiveMarkdownViewPage.typeText("tp.user.");
        await NoticePage.expectNoErrorNotice();
        await EditorSuggestionsPage.expectSuggestionNamesToContain(
            "hello_world",
        );
    });

    it("typing tp.user. with empty user scripts folder shows no suggestions and no error", async () => {
        await resetVault("test/vault", {
            "user scripts/readme.md": `\n`,
            "notes/show no suggestions.md": `\n`,
        });
        await obsidianPage.openFile("notes/show no suggestions.md");
        await ActiveMarkdownViewPage.typeText("tp.user.");
        await NoticePage.expectNoErrorNotice();
        const isDisplayed = await EditorSuggestionsPage.isDisplayed();
        expect(isDisplayed).toBe(false);
    });

    it("typing tp.user. with multiple user scripts shows all as suggestions", async () => {
        await resetVault("test/vault", {
            "user scripts/alpha.js": `module.exports = function() { return "alpha"; }`,
            "user scripts/beta.js": `module.exports = function() { return "beta"; }`,
            "notes/show multiple suggestions.md": `\n`,
        });
        await obsidianPage.openFile("notes/show multiple suggestions.md");
        await ActiveMarkdownViewPage.typeText("tp.user.");
        await NoticePage.expectNoErrorNotice();
        await EditorSuggestionsPage.expectSuggestionNamesToContain("alpha");
        await EditorSuggestionsPage.expectSuggestionNamesToContain("beta");
    });

    it("typing tp.user. with a JSDoc-annotated script shows it as a suggestion", async () => {
        await resetVault("test/vault", {
            "user scripts/greet.js": [
                "/**",
                " * Greets someone.",
                " * @param {string} name - The name to greet",
                " * @returns {string} A greeting",
                " */",
                `module.exports = function(name) { return "Hello " + name; }`,
            ].join("\n"),
            "notes/show jsdoc suggestion.md": `\n`,
        });
        await obsidianPage.openFile("notes/show jsdoc suggestion.md");
        await ActiveMarkdownViewPage.typeText("tp.user.");
        await NoticePage.expectNoErrorNotice();
        await EditorSuggestionsPage.expectSuggestionNamesToContain("greet");
    });

    it("typing tp.user.<script>. with an object user script shows exported function suggestions", async () => {
        await resetVault("test/vault", {
            "user scripts/foo.js": [
                "/**",
                " * Does something from an object export.",
                " * @param name - The name to use",
                " * @returns The result message",
                " */",
                "function doSomething(name) {",
                `    return "Something was done " + name;`,
                "}",
                "",
                "module.exports = {",
                "    func: () => console.log('test'),",
                "    doSomething,",
                "};",
            ].join("\n"),
            "notes/show object suggestions.md": `\n`,
        });
        await obsidianPage.openFile("notes/show object suggestions.md");
        await ActiveMarkdownViewPage.typeText("tp.user.foo.");
        await NoticePage.expectNoErrorNotice();
        await EditorSuggestionsPage.expectSuggestionNamesToContain("func");
        await EditorSuggestionsPage.expectSuggestionNamesToContain(
            "doSomething",
        );
        const texts = await EditorSuggestionsPage.getSuggestionTexts();
        const doSomethingText = texts.find((text) =>
            text.startsWith("doSomething"),
        );
        expect(doSomethingText).toContain(
            "Does something from an object export.",
        );
        expect(doSomethingText).toContain("name: The name to use");
        expect(doSomethingText).toContain("Returns: The result message");
    });

    it("typing tp.user.<script>. does not execute the user script (no RCE via autocomplete)", async () => {
        await resetVault("test/vault", {
            "user scripts/poc.js": [
                // side effect that fires only if the file runs
                "activeWindow.__templater_autocomplete_executed = true;",
                `module.exports = { safeMember: () => "ok" };`,
            ].join("\n"),
            "notes/no execute on autocomplete.md": `\n`,
        });
        await browser.executeObsidian(() => {
            delete (activeWindow as unknown as Record<string, unknown>)[
                "__templater_autocomplete_executed"
            ];
        });
        await obsidianPage.openFile("notes/no execute on autocomplete.md");
        await ActiveMarkdownViewPage.typeText("tp.user.poc.");
        await NoticePage.expectNoErrorNotice();
        await EditorSuggestionsPage.expectSuggestionNamesToContain(
            "safeMember",
        );
        // unset props return null over WebDriver, so check it was never set to true
        const executed = await browser.executeObsidian(
            () =>
                (activeWindow as unknown as Record<string, unknown>)[
                    "__templater_autocomplete_executed"
                ] ?? false,
        );
        expect(executed).toBe(false);
    });

    it("selecting a user script inserts it with dot notation", async () => {
        await resetVault("test/vault", {
            "user scripts/hello_world.js": `module.exports = function() { return "Hello world"; }`,
            "notes/select script.md": `\n`,
        });
        await obsidianPage.openFile("notes/select script.md");
        await ActiveMarkdownViewPage.typeText("tp.user.");
        await EditorSuggestionsPage.selectSuggestionByName("hello_world");
        await ActiveMarkdownViewPage.expectTextToEqual("tp.user.hello_world\n");
    });

    it("selecting a user script that isn't a valid identifier inserts bracket notation", async () => {
        await resetVault("test/vault", {
            "user scripts/obsidian-linter.js": `module.exports = function() { return "linted"; }`,
            "notes/select dashed script.md": `\n`,
        });
        await obsidianPage.openFile("notes/select dashed script.md");
        await ActiveMarkdownViewPage.typeText("tp.user.");
        await EditorSuggestionsPage.selectSuggestionByName("obsidian-linter");
        await ActiveMarkdownViewPage.expectTextToEqual(
            `tp.user["obsidian-linter"]\n`,
        );
    });

    it("selecting a user script member that isn't a valid identifier inserts bracket notation", async () => {
        await resetVault("test/vault", {
            "user scripts/foo.js": [
                "module.exports = {",
                `    "my-func": () => "dashed",`,
                "};",
            ].join("\n"),
            "notes/select dashed member.md": `\n`,
        });
        await obsidianPage.openFile("notes/select dashed member.md");
        await ActiveMarkdownViewPage.typeText("tp.user.foo.");
        await EditorSuggestionsPage.selectSuggestionByName("my-func");
        await ActiveMarkdownViewPage.expectTextToEqual(
            `tp.user.foo["my-func"]\n`,
        );
    });

    it("keeps suggesting a user script while typing a name that isn't a valid identifier", async () => {
        await resetVault("test/vault", {
            "user scripts/obsidian-linter.js": `module.exports = function() { return "linted"; }`,
            "notes/type dashed script.md": `\n`,
        });
        await obsidianPage.openFile("notes/type dashed script.md");
        await ActiveMarkdownViewPage.typeText("tp.user.obsidian-l");
        await NoticePage.expectNoErrorNotice();
        await EditorSuggestionsPage.expectSuggestionNamesToContain(
            "obsidian-linter",
        );
    });

    it("suggests the members of a user script accessed with bracket notation", async () => {
        await resetVault("test/vault", {
            "user scripts/obsidian-linter.js": [
                "module.exports = {",
                `    doSomething: () => "done",`,
                "};",
            ].join("\n"),
            "notes/select bracket member.md": `\n`,
        });
        await obsidianPage.openFile("notes/select bracket member.md");
        await ActiveMarkdownViewPage.typeText("tp.user.");
        await EditorSuggestionsPage.selectSuggestionByName("obsidian-linter");
        await ActiveMarkdownViewPage.expectTextToEqual(
            `tp.user["obsidian-linter"]\n`,
        );
        await ActiveMarkdownViewPage.typeText(".");
        await EditorSuggestionsPage.expectSuggestionNamesToContain(
            "doSomething",
        );
        await EditorSuggestionsPage.selectSuggestionByName("doSomething");
        await ActiveMarkdownViewPage.expectTextToEqual(
            `tp.user["obsidian-linter"].doSomething\n`,
        );
    });

    it("suggests the members of a user script whose name contains a dot", async () => {
        await resetVault("test/vault", {
            "user scripts/my.script.js": [
                "module.exports = {",
                `    doSomething: () => "done",`,
                "};",
            ].join("\n"),
            "notes/select dotted script.md": `\n`,
        });
        await obsidianPage.openFile("notes/select dotted script.md");
        await ActiveMarkdownViewPage.typeText("tp.user.");
        await EditorSuggestionsPage.selectSuggestionByName("my.script");
        await ActiveMarkdownViewPage.expectTextToEqual(
            `tp.user["my.script"]\n`,
        );
        await ActiveMarkdownViewPage.typeText(".");
        await EditorSuggestionsPage.expectSuggestionNamesToContain(
            "doSomething",
        );
        await EditorSuggestionsPage.selectSuggestionByName("doSomething");
        await ActiveMarkdownViewPage.expectTextToEqual(
            `tp.user["my.script"].doSomething\n`,
        );
    });

    it("does not suggest members of a dotted user script accessed with dot notation", async () => {
        await resetVault("test/vault", {
            "user scripts/my.script.js": [
                "module.exports = {",
                `    doSomething: () => "done",`,
                "};",
            ].join("\n"),
            "notes/dotted script dot notation.md": `\n`,
        });
        await obsidianPage.openFile("notes/dotted script dot notation.md");
        // `tp.user.my.script` reads as `tp.user.my["script"]`, which isn't the
        // script, so there is nothing to complete
        await ActiveMarkdownViewPage.typeText("tp.user.my.script.");
        await NoticePage.expectNoErrorNotice();
        expect(await EditorSuggestionsPage.isDisplayed()).toBe(false);
    });

    it("typing tp.user. with nonexistent user scripts folder shows error notice", async () => {
        await resetVault("test/vault", {
            "notes/nonexistent scripts folder.md": `\n`,
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.user_scripts_folder =
                "nonexistent-scripts";
            await plugins.templaterObsidian.save_settings();
        });
        await obsidianPage.openFile("notes/nonexistent scripts folder.md");
        await ActiveMarkdownViewPage.typeText("tp.user.");
        await NoticePage.expectUserScriptsFolderNotFoundErrorNotice(
            "nonexistent-scripts",
        );
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.user_scripts_folder =
                "user scripts";
            await plugins.templaterObsidian.save_settings();
        });
    });
});
