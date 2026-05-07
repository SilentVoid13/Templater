import { obsidianPage } from "wdio-obsidian-service";
import OpenInsertTemplateModalPage from "../../page-objects/OpenInsertTemplateModal.page";
import WorkspacePage from "../../page-objects/Workspace.page";
import VaultPage from "../../page-objects/Vault.page";
import { resetVault } from "../../utils/reset-vault";
import PromptModalPage from "../../page-objects/PromptModal.page";

describe("UserScriptFunctions", () => {
    it("user script is callable as a function", async () => {
        await resetVault("test/vault", {
            "templates/tp.user.md": `<% tp.user.hello_world() %>`,
            "user scripts/hello_world.js": `
module.exports = function () {
    return "Hello world";
}`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.user");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "Hello world\n",
        );
    });

    it("user script function accepts one argument", async () => {
        await resetVault("test/vault", {
            "templates/tp.user.md": `<% tp.user.greeting("John") %>`,
            "user scripts/greeting.js": `
module.exports = function (name) {
    return "Hello " + name;
}`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.user");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "Hello John\n",
        );
    });

    it("user script function accepts multiple arguments", async () => {
        await resetVault("test/vault", {
            "templates/tp.user.md": `<% tp.user.greeting_two("Jack", "Jill") %>`,
            "user scripts/greeting_two.js": `
module.exports = function (name1, name2) {
    return "Hello " + name1 + " and " + name2;
}`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.user");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "Hello Jack and Jill\n",
        );
    });

    it("user script function accepts tp as an argument", async () => {
        await resetVault("test/vault", {
            "templates/tp.user.md": `<% await tp.user.greeting_prompt(tp) %>`,
            "user scripts/greeting_prompt.js": `
module.exports = async function (tp) {
    const name = await tp.system.prompt("Name");
    return "Hello " + name;
}`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.user");
        await PromptModalPage.enterValue("Jane");
        await PromptModalPage.submit();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "Hello Jane\n",
        );
    });

    // TODO: fix this
    it.skip("user script function accepts tR as an argument", async () => {
        await resetVault("test/vault", {
            "templates/tp.user.md": `Hello <%* tp.user.world(tR) %>`,
            "user scripts/world.js": `
module.exports = function (tR) {
    tR += "world";
}`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.user");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "Hello world\n",
        );
    });

    it("user script function can access global app", async () => {
        await resetVault("test/vault", {
            "templates/tp.user.md": `<% tp.user.global_app() %>`,
            "user scripts/global_app.js": `
module.exports = function () {
    return app.workspace.getActiveFile().path;
}`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.user");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "notes/note.md\n",
        );
    });

    it("user script function can access global moment", async () => {
        await resetVault("test/vault", {
            "templates/tp.user.md": `<% tp.user.global_moment() %>`,
            "user scripts/global_moment.js": `
module.exports = function () {
    return moment("2026-05-05").format("YYYY-MM-DD");
}`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.user");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "2026-05-05\n",
        );
    });

    it("user script is callable as an object of functions", async () => {
        await resetVault("test/vault", {
            "templates/tp.user.md": `<% tp.user.my_scripts.one() %> <% tp.user.my_scripts.two() %>`,
            "user scripts/my_scripts.js": `
module.exports = {
    one: () => "script one",
    two: () => "script two",
};`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.user");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "script one script two\n",
        );
    });

    it("user script object accepts arguments", async () => {
        await resetVault("test/vault", {
            "templates/tp.user.md": `<% tp.user.my_scripts_args.one(1) %> <% tp.user.my_scripts_args.two(1) %>`,
            "user scripts/my_scripts_args.js": `
module.exports = {
    one: (x) => "script one" + x,
    two: (x) => "script two" + x,
};`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.user");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "script one1 script two1\n",
        );
    });

    it("user script object accepts tp as argument", async () => {
        await resetVault("test/vault", {
            "templates/tp.user.md": `<% tp.user.my_scripts_tp.title(tp) %>`,
            "user scripts/my_scripts_tp.js": `
module.exports = {
    title: (tp) => tp.file.title,
};`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.user");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("notes/note.md", "note\n");
    });

    // TODO: fix this
    it.skip("user script object accepts tR as argument", async () => {
        await resetVault("test/vault", {
            "templates/tp.user.md": `<%* tp.user.my_scripts_tR.greeting(tR) %>`,
            "user scripts/my_scripts_tR.js": `
module.exports = {
    greeting: (tR) => tR += "Greeting",
};`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.user");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("notes/note.md", "Greeting\n");
    });
});
