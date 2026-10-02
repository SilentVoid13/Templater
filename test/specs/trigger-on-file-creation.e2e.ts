import type { WorkspaceLeaf } from "obsidian";
import { obsidianPage } from "wdio-obsidian-service";
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

        await VaultPage.createFile("notes/daily/today.md", "");

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

        await VaultPage.createFile("notes/daily/today.md", "");

        await VaultPage.expectFileToHaveContent(
            "notes/daily/today.md",
            "parent-template",
        );
    });
});

describe("non-markdown file templates", () => {
    afterEach(async () => {
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                "none";
            plugins.templaterObsidian.settings.folder_templates = [];
            plugins.templaterObsidian.settings.file_templates = [];
            await plugins.templaterObsidian.save_settings();
        });
        await browser.executeObsidian(async ({ app }) => {
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: false,
            });
            // Leave an empty tab behind for tests that use the empty state view
            const leaves: WorkspaceLeaf[] = [];
            app.workspace.iterateRootLeaves((leaf) => {
                leaves.push(leaf);
            });
            await Promise.all(
                leaves.map((leaf) => leaf.setViewState({ type: "empty" })),
            );
        });
    });

    async function enableTrigger() {
        await browser.executeObsidian(({ app }) => {
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: true,
            });
        });
    }

    const viewCases = [
        {
            extension: "canvas",
            template:
                '{"nodes":[{"id":"a","type":"text","text":"<% tp.file.title %>","x":0,"y":0,"width":250,"height":60}],"edges":[]}',
            // The canvas view may re-serialize the JSON when it saves
            expected: /"text":\s*"Untitled"/,
        },
        {
            extension: "base",
            template:
                "views:\n  - type: table\n    name: <% tp.file.title %>\n",
            expected: /name: Untitled/,
        },
    ];

    for (const { extension, template, expected } of viewCases) {
        it(`keeps the template content after the ${extension} view opens and saves`, async () => {
            await resetVault("test/vault", {
                [`templates/new.${extension}`]: template,
                "other.md": "other",
            });
            await browser.executeObsidian(
                async ({ plugins }, template_path: string) => {
                    plugins.templaterObsidian.settings.templates_folder =
                        "templates";
                    plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                        "folder";
                    plugins.templaterObsidian.settings.folder_templates = [
                        { folder: "/", template: template_path },
                    ];
                    await plugins.templaterObsidian.save_settings();
                },
                `templates/new.${extension}`,
            );
            await enableTrigger();

            // Mirrors the file explorer's "New canvas" / "New base" menu items
            const path = await browser.executeObsidian(
                async ({ app }, ext: string) => {
                    const file = await app.fileManager.createNewFile(
                        app.vault.getRoot(),
                        undefined,
                        ext,
                    );
                    await app.workspace.getLeaf(false).openFile(file, {
                        eState: { rename: "all" },
                    });
                    return file.path;
                },
                extension,
            );
            await VaultPage.expectFileToHaveContent(path, expected);
            await WorkspacePage.waitForAllTemplatesExecuted();

            // Give the view time to write its own state, which happened ~2s after creation when tested manually
            // eslint-disable-next-line wdio/no-pause -- Waiting to confirm the view doesn't overwrite the file
            await browser.pause(3000);
            const view_data = await browser.executeObsidian(
                ({ app, obsidian }, file_path: string) => {
                    let data: string | undefined;
                    app.workspace.iterateRootLeaves((leaf) => {
                        if (
                            leaf.view instanceof obsidian.TextFileView &&
                            leaf.view.file?.path === file_path
                        ) {
                            data = leaf.view.getViewData();
                        }
                    });
                    return data;
                },
                path,
            );
            expect(view_data).toMatch(expected);

            // Navigating away makes the view save its state to disk
            await browser.executeObsidian(async ({ app }) => {
                const other = app.vault.getFileByPath("other.md");
                if (other) {
                    await app.workspace.getLeaf(false).openFile(other);
                }
            });
            // eslint-disable-next-line wdio/no-pause -- Waiting to confirm the view doesn't overwrite the file
            await browser.pause(1000);
            expect(await obsidianPage.read(path)).toMatch(expected);
        });
    }

    it("applies a folder template to a new file with the same extension", async () => {
        await resetVault("test/vault", {
            "templates/note.md": "note-template",
            "templates/table.base": "views:\n  - name: <% tp.file.title %>\n",
            "bases/.keep": "\n",
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.templates_folder = "templates";
            plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                "folder";
            plugins.templaterObsidian.settings.folder_templates = [
                { folder: "bases", template: "templates/note.md" },
                { folder: "bases", template: "templates/table.base" },
            ];
            await plugins.templaterObsidian.save_settings();
        });
        await enableTrigger();

        await VaultPage.createFile("bases/projects.base", "");
        await VaultPage.expectFileToHaveContent(
            "bases/projects.base",
            "views:\n  - name: projects\n",
        );

        await VaultPage.createFile("bases/note.md", "");
        await VaultPage.expectFileToHaveContent(
            "bases/note.md",
            "note-template",
        );
    });

    it("does not apply a folder template with a different extension", async () => {
        await resetVault("test/vault", {
            "templates/note.md": "note-template",
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.templates_folder = "templates";
            plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                "folder";
            plugins.templaterObsidian.settings.folder_templates = [
                { folder: "/", template: "templates/note.md" },
            ];
            await plugins.templaterObsidian.save_settings();
        });
        await enableTrigger();

        await VaultPage.createFile("board.canvas", "");
        // eslint-disable-next-line wdio/no-pause -- Wait longer than the 300ms delay inside on_file_creation
        await browser.pause(600);
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("board.canvas", "");
    });

    it("skips regex templates with a different extension and uses the next match", async () => {
        await resetVault("test/vault", {
            "templates/note.md": "note-template",
            "templates/board.canvas": '{"nodes":[],"edges":[]}',
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.templates_folder = "templates";
            plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                "regex";
            plugins.templaterObsidian.settings.file_templates = [
                { regex: ".*", template: "templates/note.md" },
                { regex: ".*", template: "templates/board.canvas" },
            ];
            await plugins.templaterObsidian.save_settings();
        });
        await enableTrigger();

        await VaultPage.createFile("board.canvas", "");

        await VaultPage.expectFileToHaveContent(
            "board.canvas",
            '{"nodes":[],"edges":[]}',
        );
    });

    it("does not process non-markdown files created with content", async () => {
        await resetVault("test/vault", {
            "templates/board.canvas": '{"nodes":[],"edges":[]}',
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.templates_folder = "templates";
            plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                "folder";
            plugins.templaterObsidian.settings.folder_templates = [
                { folder: "/", template: "templates/board.canvas" },
            ];
            await plugins.templaterObsidian.save_settings();
        });
        await enableTrigger();

        await VaultPage.createFile(
            "synced.canvas",
            '{"title":"<% tp.file.title %>"}',
        );
        // eslint-disable-next-line wdio/no-pause -- Wait longer than the 300ms delay inside on_file_creation
        await browser.pause(600);
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "synced.canvas",
            '{"title":"<% tp.file.title %>"}',
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
        await VaultPage.createFile(
            "notes/trigger-test.md",
            "<% tp.file.title %>",
        );
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
        await VaultPage.createFile(
            "notes/no-trigger-test.md",
            "<% tp.file.title %>",
        );
        // Wait longer than the 300ms delay inside on_file_creation, then confirm
        // Templater has finished (no-op when disabled) before reading content
        // eslint-disable-next-line wdio/no-pause -- Wait longer than the 300ms delay inside on_file_creation
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
            plugins.templaterObsidian.settings.jump_to_cursor_after_file_name = false;
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
