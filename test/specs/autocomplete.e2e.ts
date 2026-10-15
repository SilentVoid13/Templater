import { obsidianPage } from "wdio-obsidian-service";
import ActiveMarkdownViewPage from "../page-objects/ActiveMarkdownView.page";
import EditorSuggestionsPage from "../page-objects/EditorSuggestions.page";
import NoticePage from "../page-objects/Notice.page";
import { resetVault } from "../utils/reset-vault";

describe("Autocomplete", () => {
    it("selecting a module completes its name", async () => {
        await resetVault("test/vault", {
            "notes/select module.md": `\n`,
        });
        await obsidianPage.openFile("notes/select module.md");
        await ActiveMarkdownViewPage.typeText("tp.fi");
        await EditorSuggestionsPage.selectSuggestionByName("file");
        await ActiveMarkdownViewPage.expectTextToEqual("tp.file\n");
    });

    it("selecting a module function completes its name", async () => {
        await resetVault("test/vault", {
            "notes/select module function.md": `\n`,
        });
        await obsidianPage.openFile("notes/select module function.md");
        await ActiveMarkdownViewPage.typeText("tp.file.titl");
        await EditorSuggestionsPage.selectSuggestionByName("title");
        await ActiveMarkdownViewPage.expectTextToEqual("tp.file.title\n");
    });

    it("does not suggest when tp is the tail of a longer word", async () => {
        await resetVault("test/vault", {
            "notes/tp in word.md": `\n`,
        });
        await obsidianPage.openFile("notes/tp in word.md");
        await ActiveMarkdownViewPage.typeText("http.file.");
        expect(await EditorSuggestionsPage.isDisplayed()).toBe(false);
        // the very same accessors do suggest once tp stands on its own
        await ActiveMarkdownViewPage.typeText(" tp.file.");
        await EditorSuggestionsPage.waitForDisplayed();
    });

    it("does not suggest when tp is a property of something else", async () => {
        await resetVault("test/vault", {
            "notes/tp as property.md": `\n`,
        });
        await obsidianPage.openFile("notes/tp as property.md");
        await ActiveMarkdownViewPage.typeText("obj.tp.file.");
        expect(await EditorSuggestionsPage.isDisplayed()).toBe(false);
        await ActiveMarkdownViewPage.typeText(" tp.file.");
        await EditorSuggestionsPage.waitForDisplayed();
    });

    it("selecting a tp.app property that isn't a valid identifier inserts bracket notation", async () => {
        await resetVault("test/vault", {
            "notes/select app property.md": `\n`,
        });
        await obsidianPage.openFile("notes/select app property.md");
        await ActiveMarkdownViewPage.typeText(
            "tp.app.plugins.plugins.templater",
        );
        await NoticePage.expectNoErrorNotice();
        await EditorSuggestionsPage.selectSuggestionByName(
            "templater-obsidian",
        );
        await ActiveMarkdownViewPage.expectTextToEqual(
            `tp.app.plugins.plugins["templater-obsidian"]\n`,
        );
    });

    it("suggests the members of a tp.app property accessed with bracket notation", async () => {
        await resetVault("test/vault", {
            "notes/select app bracket member.md": `\n`,
        });
        await obsidianPage.openFile("notes/select app bracket member.md");
        await ActiveMarkdownViewPage.typeText(
            "tp.app.plugins.plugins.templater",
        );
        await EditorSuggestionsPage.selectSuggestionByName(
            "templater-obsidian",
        );
        // wait for the completion to land before typing the next accessor
        await ActiveMarkdownViewPage.expectTextToEqual(
            `tp.app.plugins.plugins["templater-obsidian"]\n`,
        );
        await ActiveMarkdownViewPage.typeText(".");
        await EditorSuggestionsPage.expectSuggestionNamesToContain("settings");
        await EditorSuggestionsPage.selectSuggestionByName("settings");
        await ActiveMarkdownViewPage.expectTextToEqual(
            `tp.app.plugins.plugins["templater-obsidian"].settings\n`,
        );
    });
});
