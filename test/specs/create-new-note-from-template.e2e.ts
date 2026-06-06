import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import CreateNewNoteFromTemplateModalPage from "../page-objects/CreateNewNoteFromTemplateModal.page";
import WorkspacePage from "../page-objects/Workspace.page";
import VaultPage from "../page-objects/Vault.page";
import ActiveMarkdownViewPage from "../page-objects/ActiveMarkdownView.page";
import ObsidianConfigPage from "../page-objects/ObsidianConfig.page";
import RenameFileModalPage from "../page-objects/RenameFileModal.page";
import { resetVault } from "../utils/reset-vault";

describe("create_new_note_from_template", () => {
    it("creates file with processed content", async () => {
        await resetVault("test/vault", {
            "templates/template.md": "# <% tp.file.title %>",
        });
        await CreateNewNoteFromTemplateModalPage.open();
        await CreateNewNoteFromTemplateModalPage.selectSuggestionByName(
            "template",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "# Untitled");
    });

    it("auto-increments filename on conflict", async () => {
        await resetVault("test/vault", {
            "templates/template.md": "Test content",
        });
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
        await resetVault("test/vault", {
            "templates/template.md": "Folder test",
        });
        await browser.executeObsidian(async ({ app }) => {
            const plugin = app.plugins.getPlugin("templater-obsidian");
            if (!plugin) throw new Error("templater-obsidian is not loaded");
            const templateFile = app.vault.getFileByPath(
                "templates/template.md",
            );
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
        await resetVault("test/vault", {
            "templates/template.md":
                '---\ntitle: "<% tp.file.title %>"\n---\n# <% tp.file.title %>',
        });
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
        await resetVault("test/vault", {});
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

describe("jump_to_cursor_after_file_name", () => {
    const template = {
        "templates/cursor.md": `Hello<% tp.file.cursor() %>World`,
    };

    async function enableToggle() {
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.jump_to_cursor_after_file_name = true;
            await plugins.templaterObsidian.save_settings();
        });
    }

    async function disableToggle() {
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.jump_to_cursor_after_file_name = false;
            await plugins.templaterObsidian.save_settings();
        });
    }

    afterEach(async () => {
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.auto_jump_to_cursor = false;
            plugins.templaterObsidian.settings.jump_to_cursor_after_file_name =
                false;
            await plugins.templaterObsidian.save_settings();
        });
        await ObsidianConfigPage.setShowInlineTitle(true);
        await ObsidianConfigPage.setShowViewHeader(true);
    });

    async function createNoteFromTemplate() {
        await CreateNewNoteFromTemplateModalPage.open();
        await CreateNewNoteFromTemplateModalPage.selectSuggestionByName(
            "cursor",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
    }

    describe("with showInlineTitle enabled", () => {
        it("skips rename and places cursor in note body when enabled", async () => {
            await resetVault("test/vault", template);
            await ObsidianConfigPage.setShowInlineTitle(true);
            await enableToggle();
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.auto_jump_to_cursor = true;
                await plugins.templaterObsidian.save_settings();
            });
            await createNoteFromTemplate();
            await ActiveMarkdownViewPage.expectEditorFocused();
            await ActiveMarkdownViewPage.expectCursorsToEqual([
                { line: 0, ch: 5 },
            ]);
        });

        it("activates inline title rename when disabled, then places cursor in note body after Tab", async () => {
            await resetVault("test/vault", template);
            await ObsidianConfigPage.setShowInlineTitle(true);
            await disableToggle();
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.auto_jump_to_cursor = true;
                await plugins.templaterObsidian.save_settings();
            });
            await createNoteFromTemplate();
            await ActiveMarkdownViewPage.expectInlineTitleFocused();
            await browser.keys("Tab");
            await ActiveMarkdownViewPage.expectCursorsToEqual([
                { line: 0, ch: 5 },
            ]);
        });
    });

    describe("with showViewHeader enabled, showInlineTitle disabled", () => {
        it("skips rename and places cursor in note body when enabled", async () => {
            await resetVault("test/vault", template);
            await ObsidianConfigPage.setShowInlineTitle(false);
            await ObsidianConfigPage.setShowViewHeader(true);
            await enableToggle();
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.auto_jump_to_cursor = true;
                await plugins.templaterObsidian.save_settings();
            });
            await createNoteFromTemplate();
            await ActiveMarkdownViewPage.expectEditorFocused();
            await ActiveMarkdownViewPage.expectCursorsToEqual([
                { line: 0, ch: 5 },
            ]);
        });

        it("activates view header rename when disabled, then places cursor in note body after Tab", async () => {
            await resetVault("test/vault", template);
            await ObsidianConfigPage.setShowInlineTitle(false);
            await ObsidianConfigPage.setShowViewHeader(true);
            await disableToggle();
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.auto_jump_to_cursor = true;
                await plugins.templaterObsidian.save_settings();
            });
            await createNoteFromTemplate();
            await WorkspacePage.expectViewHeaderTitleFocused();
            await browser.keys("Tab");
            await ActiveMarkdownViewPage.expectCursorsToEqual([
                { line: 0, ch: 5 },
            ]);
        });
    });

    describe("with both showInlineTitle and showViewHeader disabled", () => {
        it("skips rename and places cursor in note body when enabled", async () => {
            await resetVault("test/vault", template);
            await ObsidianConfigPage.setShowInlineTitle(false);
            await ObsidianConfigPage.setShowViewHeader(false);
            await enableToggle();
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.auto_jump_to_cursor = true;
                await plugins.templaterObsidian.save_settings();
            });
            await createNoteFromTemplate();
            await ActiveMarkdownViewPage.expectEditorFocused();
            await ActiveMarkdownViewPage.expectCursorsToEqual([
                { line: 0, ch: 5 },
            ]);
        });

        it("shows rename modal when disabled, then places cursor in note body after cancel", async () => {
            await resetVault("test/vault", template);
            await ObsidianConfigPage.setShowInlineTitle(false);
            await ObsidianConfigPage.setShowViewHeader(false);
            await disableToggle();
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.auto_jump_to_cursor = true;
                await plugins.templaterObsidian.save_settings();
            });
            await createNoteFromTemplate();
            await RenameFileModalPage.expectDisplayed();
            await RenameFileModalPage.clickCancel();
            await ActiveMarkdownViewPage.expectCursorsToEqual([
                { line: 0, ch: 5 },
            ]);
        });
    });
});
