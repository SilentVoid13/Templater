import { obsidianPage } from "wdio-obsidian-service";
import OpenInsertTemplateModalPage from "../../page-objects/OpenInsertTemplateModal.page";
import WorkspacePage from "../../page-objects/Workspace.page";
import VaultPage from "../../page-objects/Vault.page";
import { resetVault } from "../../utils/reset-vault";

describe("UserSystemFunctions", () => {
    it.skip("tp.user.date example from docs works", async () => {
        await resetVault("test/vault", {
            // TODO: pass arguments
            "templates/tp.user.date.md": `<% tp.user.date() %>`,
            "notes/note.md": `\n`,
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.enable_system_commands = true;
            plugins.templaterObsidian.settings.templates_pairs = [
                ["today", 'date + "%A, %d %B %Y"'],
            ];
            await plugins.templaterObsidian.save_settings();
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.user.date",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("notes/note.md", "");
    });

    it("tp.user.weather example from docs works", async () => {
        await resetVault("test/vault", {
            "templates/tp.user.weather.md": `<% tp.user.weather() %>`,
            "notes/note.md": `\n`,
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.enable_system_commands = true;
            plugins.templaterObsidian.settings.templates_pairs = [
                ["weather", 'curl "wttr.in/Paris?format=3"'],
            ];
            await plugins.templaterObsidian.save_settings();
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.user.weather",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            /^paris: .+\d+°F\n$/,
        );
    });

    it.skip("tp.user.date example from docs works", async () => {
        await resetVault("test/vault", {
            "templates/tp.user.echo.md": `<% tp.user.echo() %>`,
            "notes/note.md": `\n`,
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.enable_system_commands = true;
            plugins.templaterObsidian.settings.templates_pairs = [
                ["echo", 'echo "I love Templater"'],
            ];
            await plugins.templaterObsidian.save_settings();
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.user.echo",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        // TODO: validate echo
        await VaultPage.expectFileToHaveContent("notes/note.md", "");
    });
});
