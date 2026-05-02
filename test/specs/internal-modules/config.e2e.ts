import { obsidianPage } from "wdio-obsidian-service";
import OpenInsertTemplateModalPage from "../../page-objects/OpenInsertTemplateModal.page";
import WorkspacePage from "../../page-objects/Workspace.page";
import EmptyStateViewPage from "../../page-objects/EmptyStateView.page";
import VaultPage from "../../page-objects/Vault.page";
import CreateNewNoteFromTemplateModalPage from "../../page-objects/CreateNewNoteFromTemplateModal.page";
import NoticePage from "../../page-objects/Notice.page";

describe("InternalModuleConfig", () => {
    it("tp.config reports correct config on create new from template with no active file", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.config.md": `Template file: <% tp.config.template_file.path %>
Target file: <% tp.config.target_file.path %>
Active file: <% tp.config.active_file?.path %>
Run mode: <% tp.config.run_mode %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await CreateNewNoteFromTemplateModalPage.open();
        await CreateNewNoteFromTemplateModalPage.selectSuggestionByName(
            "tp.config",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        const expectedContent = `Template file: templates/tp.config.md
Target file: Untitled.md
Active file: undefined
Run mode: 0`;
        await VaultPage.expectFileToHaveContent("Untitled.md", expectedContent);
    });

    it("tp.config reports correct config on create new from template with active file", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.config.md": `Template file: <% tp.config.template_file.path %>
Target file: <% tp.config.target_file.path %>
Active file: <% tp.config.active_file?.path %>
Run mode: <% tp.config.run_mode %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await CreateNewNoteFromTemplateModalPage.open();
        await CreateNewNoteFromTemplateModalPage.selectSuggestionByName(
            "tp.config",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        const expectedContent = `Template file: templates/tp.config.md
Target file: Untitled 1.md
Active file: Untitled.md
Run mode: 0`;
        await VaultPage.expectFileToHaveContent(
            "Untitled 1.md",
            expectedContent,
        );
    });

    it("tp.config reports correct config on append to active file", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.config.md": `Template file: <% tp.config.template_file.path %>
Target file: <% tp.config.target_file.path %>
Active file: <% tp.config.active_file?.path %>
Run mode: <% tp.config.run_mode %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.config");
        await WorkspacePage.waitForAllTemplatesExecuted();
        const expectedContent = `Template file: templates/tp.config.md
Target file: Untitled.md
Active file: Untitled.md
Run mode: 1`;
        await VaultPage.expectFileToHaveContent("Untitled.md", expectedContent);
    });

    it.skip("reports correct config on overwrite file", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.config.md": `Template file: <% tp.config.template_file.path %>
Target file: <% tp.config.target_file.path %>
Active file: <% tp.config.active_file?.path %>
Run mode: <% tp.config.run_mode %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await CreateNewNoteFromTemplateModalPage.open();
        await CreateNewNoteFromTemplateModalPage.selectSuggestionByName(
            "tp.config",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        const expectedContent = `Template file: templates/tp.config.md
Target file: Untitled 1.md
Active file: Untitled.md
Run mode: 2`;
        await VaultPage.expectFileToHaveContent(
            "Untitled 1.md",
            expectedContent,
        );
    });

    it("tp.config reports correct config on overwrite active file", async () => {
        await obsidianPage.resetVault("test/vault", {
            "notes/tp.config.md": `Template file: <% tp.config.template_file.path %>
Target file: <% tp.config.target_file.path %>
Active file: <% tp.config.active_file?.path %>
Run mode: <% tp.config.run_mode %>`,
        });
        await obsidianPage.openFile("notes/tp.config.md");
        await WorkspacePage.expectActiveTabToHaveText("tp.config");
        await browser.executeObsidianCommand(
            "templater-obsidian:replace-in-file-templater",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        const expectedContent = `Template file: notes/tp.config.md
Target file: notes/tp.config.md
Active file: notes/tp.config.md
Run mode: 3`;
        await VaultPage.expectFileToHaveContent(
            "notes/tp.config.md",
            expectedContent,
        );
    });

    // Deprecated, do not need to test this functionality
    it.skip("reports correct config on dynamic processor", () => {});

    it("tp.config reports correct config on startup template with no active file", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.config.md":
                "<%*\n" +
                "new Notice(`Template file: ${tp.config.template_file.path}\n" +
                "Target file: ${tp.config.target_file.path}\n" +
                "Active file: ${tp.config.active_file?.path}\n" +
                "Run mode: ${tp.config.run_mode}`)\n" +
                "%>",
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.startup_templates = [
                "templates/tp.config.md",
            ];
            await plugins.templaterObsidian.save_settings();
        });
        await browser.reloadObsidian();
        await WorkspacePage.waitForAllTemplatesExecuted();
        const expectedContent = `Template file: templates/tp.config.md
Target file: templates/tp.config.md
Active file: undefined
Run mode: 5`;
        await NoticePage.expectNoticeElWithText(expectedContent);
    });

    it("tp.config reports correct config on startup template with active file", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.config.md":
                "<%*\n" +
                "new Notice(`Template file: ${tp.config.template_file.path}\n" +
                "Target file: ${tp.config.target_file.path}\n" +
                "Active file: ${tp.config.active_file?.path}\n" +
                "Run mode: ${tp.config.run_mode}`)\n" +
                "%>",
            "notes/note.md": "\n",
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.startup_templates = [
                "templates/tp.config.md",
            ];
            await plugins.templaterObsidian.save_settings();
        });
        await obsidianPage.openFile("notes/note.md");
        await browser.reloadObsidian();
        await WorkspacePage.waitForAllTemplatesExecuted();
        const expectedContent = `Template file: templates/tp.config.md
Target file: templates/tp.config.md
Active file: notes/note.md
Run mode: 5`;
        await NoticePage.expectNoticeElWithText(expectedContent);
    });
});
