import ActiveMarkdownViewPage from "../page-objects/ActiveMarkdownView.page";
import EmptyStateViewPage from "../page-objects/EmptyStateView.page";
import ObsidianConfigPage from "../page-objects/ObsidianConfig.page";
import RenameFileModalPage from "../page-objects/RenameFileModal.page";
import VaultPage from "../page-objects/Vault.page";
import WorkspacePage from "../page-objects/Workspace.page";
import { resetVault } from "../utils/reset-vault";

describe("folder template matching", () => {
    it("applies the most-specific (deepest) folder template when parent and child both match", async () => {
        await resetVault("test/vault", {
            "templates/parent.md": "parent-template",
            "templates/child.md": "child-template",
            "notes/daily/.keep": "\n",
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.templates_folder = "templates";
            plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                "folder";
            plugins.templaterObsidian.settings.folder_templates = [
                { folder: "notes", template: "templates/parent.md" },
                { folder: "notes/daily", template: "templates/child.md" },
            ];
            await plugins.templaterObsidian.save_settings();
        });
        await browser.executeObsidian(({ app }) => {
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: true,
            });
        });

        await browser.executeObsidian(async ({ app }) => {
            await app.vault.create("notes/daily/today.md", "");
        });

        await VaultPage.expectFileToHaveContent(
            "notes/daily/today.md",
            "child-template",
        );
    });

    it("falls back to parent folder template when no direct match exists", async () => {
        await resetVault("test/vault", {
            "templates/parent.md": "parent-template",
            "notes/daily/.keep": "\n",
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.templates_folder = "templates";
            plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                "folder";
            plugins.templaterObsidian.settings.folder_templates = [
                { folder: "notes", template: "templates/parent.md" },
            ];
            await plugins.templaterObsidian.save_settings();
        });
        await browser.executeObsidian(({ app }) => {
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: true,
            });
        });

        await browser.executeObsidian(async ({ app }) => {
            await app.vault.create("notes/daily/today.md", "");
        });

        await VaultPage.expectFileToHaveContent(
            "notes/daily/today.md",
            "parent-template",
        );
    });
});

describe("trigger_on_file_creation", () => {
    it("processes template syntax in files created in vault when enabled", async () => {
        await resetVault("test/vault", {});
        await browser.executeObsidian(({ app }) => {
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: true,
            });
        });
        await browser.executeObsidian(async ({ app }) => {
            await app.vault.create(
                "notes/trigger-test.md",
                "<% tp.file.title %>",
            );
        });
        await VaultPage.expectFileToHaveContent(
            "notes/trigger-test.md",
            "trigger-test",
        );
    });

    it("does not process template syntax in files created when disabled", async () => {
        await resetVault("test/vault", {});
        await browser.executeObsidian(({ app }) => {
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: false,
            });
        });
        await browser.executeObsidian(async ({ app }) => {
            await app.vault.create(
                "notes/no-trigger-test.md",
                "<% tp.file.title %>",
            );
        });
        // Wait longer than the 300ms delay inside on_file_creation, then confirm
        // Templater has finished (no-op when disabled) before reading content
        // eslint-disable-next-line wdio/no-pause
        await browser.pause(600);
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/no-trigger-test.md",
            "<% tp.file.title %>",
        );
    });
});

describe("jump_to_cursor_after_file_name", () => {
    const template = {
        "templates/cursor.md": `Hello<% tp.file.cursor() %>World`,
    };

    async function enableToggle() {
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.jump_to_cursor_after_file_name =
                true;
            await plugins.templaterObsidian.save_settings();
        });
    }

    async function disableToggle() {
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.jump_to_cursor_after_file_name =
                false;
            await plugins.templaterObsidian.save_settings();
        });
    }

    afterEach(async () => {
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.auto_jump_to_cursor = false;
            plugins.templaterObsidian.settings.jump_to_cursor_after_file_name =
                false;
            plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                "none";
            plugins.templaterObsidian.settings.folder_templates = [];
            await plugins.templaterObsidian.save_settings();
        });
        await browser.executeObsidian(({ app }) => {
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: false,
            });
        });
        await ObsidianConfigPage.setShowInlineTitle(true);
        await ObsidianConfigPage.setShowViewHeader(true);
    });

    async function setupFolderTemplate() {
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.templates_folder = "templates";
            plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                "folder";
            plugins.templaterObsidian.settings.folder_templates = [
                { folder: "/", template: "templates/cursor.md" },
            ];
            await plugins.templaterObsidian.save_settings();
        });
        await browser.executeObsidian(({ app }) => {
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: true,
            });
        });
    }

    async function createNoteFromFolderTemplate() {
        await EmptyStateViewPage.clickCreateNewNote();
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
            await setupFolderTemplate();
            await createNoteFromFolderTemplate();
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
            await setupFolderTemplate();
            await createNoteFromFolderTemplate();
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
            await setupFolderTemplate();
            await createNoteFromFolderTemplate();
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
            await setupFolderTemplate();
            await createNoteFromFolderTemplate();
            await WorkspacePage.expectViewHeaderTitleFocused();
            await browser.keys("Tab");
            await ActiveMarkdownViewPage.expectCursorsToEqual([
                { line: 0, ch: 5 },
            ]);
        });
    });

    describe("with both showInlineTitle and showViewHeader disabled", () => {
        it("shows rename modal when enabled, then places cursor in note body after cancel", async () => {
            await resetVault("test/vault", template);
            await ObsidianConfigPage.setShowInlineTitle(false);
            await ObsidianConfigPage.setShowViewHeader(false);
            await enableToggle();
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.auto_jump_to_cursor = true;
                await plugins.templaterObsidian.save_settings();
            });
            await setupFolderTemplate();
            await createNoteFromFolderTemplate();
            await RenameFileModalPage.expectDisplayed();
            await RenameFileModalPage.clickCancel();
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
            await setupFolderTemplate();
            await createNoteFromFolderTemplate();
            await RenameFileModalPage.expectDisplayed();
            await RenameFileModalPage.clickCancel();
            await ActiveMarkdownViewPage.expectCursorsToEqual([
                { line: 0, ch: 5 },
            ]);
        });
    });
});
