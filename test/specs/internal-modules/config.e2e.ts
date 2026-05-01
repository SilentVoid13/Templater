import { obsidianPage } from "wdio-obsidian-service";
import OpenInsertTemplateModalPage from "../../page-objects/OpenInsertTemplateModal.page";
import WorkspacePage from "../../page-objects/Workspace.page";
import EmptyStateViewPage from "../../page-objects/EmptyStateView.page";
import VaultPage from "../../page-objects/Vault.page";
import CreateNewNoteFromTemplateModalPage from "../../page-objects/CreateNewNoteFromTemplateModal.page";

describe("InternalModuleConfig", () => {
    it("reports correct config on insert", async () => {
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

    it("reports correct config on create from empty", async () => {
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

    it("reports correct config on create from active note", async () => {
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
});
