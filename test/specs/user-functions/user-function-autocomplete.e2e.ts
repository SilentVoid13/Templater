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
        await EditorSuggestionsPage.waitForDisplayed();
        const names = await EditorSuggestionsPage.getSuggestionNames();
        expect(names).toContain("hello_world");
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
        await EditorSuggestionsPage.waitForDisplayed();
        const names = await EditorSuggestionsPage.getSuggestionNames();
        expect(names).toContain("alpha");
        expect(names).toContain("beta");
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
        await EditorSuggestionsPage.waitForDisplayed();
        const names = await EditorSuggestionsPage.getSuggestionNames();
        expect(names).toContain("greet");
    });

    it("typing tp.user.<script>. with an object user script shows exported function suggestions", async () => {
        await resetVault("test/vault", {
            "user scripts/foo.js": [
                "function doSomething() {",
                `    return "Something was done";`,
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
        await EditorSuggestionsPage.waitForDisplayed();
        const names = await EditorSuggestionsPage.getSuggestionNames();
        expect(names).toContain("func");
        expect(names).toContain("doSomething");
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
