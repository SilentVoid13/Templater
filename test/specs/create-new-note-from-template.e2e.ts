import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import CreateNewNoteFromTemplateModalPage from "../page-objects/CreateNewNoteFromTemplateModal.page";
import WorkspacePage from "../page-objects/Workspace.page";
import VaultPage from "../page-objects/Vault.page";

describe("create_new_note_from_template", () => {
    it("creates file with processed content", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/template.md": "# <% tp.file.title %>",
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await CreateNewNoteFromTemplateModalPage.open();
        await CreateNewNoteFromTemplateModalPage.selectSuggestionByName(
            "template",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "# Untitled");
    });

    it("auto-increments filename on conflict", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/template.md": "Test content",
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await CreateNewNoteFromTemplateModalPage.open();
        await CreateNewNoteFromTemplateModalPage.selectSuggestionByName(
            "template",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await CreateNewNoteFromTemplateModalPage.open();
        await CreateNewNoteFromTemplateModalPage.selectSuggestionByName(
            "template",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "Test content");
        await VaultPage.expectFileToHaveContent(
            "Untitled 1.md",
            "Test content",
        );
    });

    it("creates file in the requested folder", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/template.md": "Folder test",
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await browser.executeObsidian(async ({ app }) => {
            const plugin = app.plugins.getPlugin("templater-obsidian");
            if (!plugin) throw new Error("templater-obsidian is not loaded");
            const templateFile =
                app.vault.getFileByPath("templates/template.md");
            if (!templateFile) throw new Error("Template file not found");
            await plugin.templater.create_new_note_from_template(
                templateFile,
                "my-folder",
                "my-note",
                false,
            );
        });
        await VaultPage.expectFileToHaveContent(
            "my-folder/my-note.md",
            "Folder test",
        );
    });

    it("processes frontmatter and body", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/template.md":
                '---\ntitle: "<% tp.file.title %>"\n---\n# <% tp.file.title %>',
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await CreateNewNoteFromTemplateModalPage.open();
        await CreateNewNoteFromTemplateModalPage.selectSuggestionByName(
            "template",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        const content = await obsidianPage.read("Untitled.md");
        expect(content).toContain('title: "Untitled"');
        expect(content).toContain("# Untitled");
    });

    it("supports string template content", async () => {
        await obsidianPage.resetVault("test/vault", {});
        await obsidianPage.loadWorkspaceLayout("empty");
        await browser.executeObsidian(async ({ app }) => {
            const plugin = app.plugins.getPlugin("templater-obsidian");
            if (!plugin) throw new Error("templater-obsidian is not loaded");
            await plugin.templater.create_new_note_from_template(
                "# <% tp.file.title %>\nCreated via string",
                undefined,
                undefined,
                false,
            );
        });
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "# Untitled\nCreated via string",
        );
    });
});
