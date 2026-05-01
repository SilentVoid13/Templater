import moment from "moment";
import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import OpenInsertTemplateModalPage from "../../page-objects/OpenInsertTemplateModal.page";
import WorkspacePage from "../../page-objects/Workspace.page";
import EmptyStateViewPage from "../../page-objects/EmptyStateView.page";
import VaultPage from "../../page-objects/Vault.page";

describe("InternalModuleFile", () => {
    const fixedTimestamp = 1619866800000; // 2021-05-01 07:00:00 UTC

    it("tp.file.title", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.title.md": `<% tp.file.title %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.file.title");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "Untitled");
    });

    it("tp.file.content returns file content", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.content.md": `<% tp.file.content %>`,
            "notes/note.md": `original content\n`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.file.content");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "original content\noriginal content\n",
        );
    });

    it("tp.file.tags returns file tags", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.tags.md": `<% tp.file.tags %>`,
            "notes/note.md": `---\ntags:\n- tag1\n- tag2\n---\n`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.file.tags");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "---\ntags:\n- tag1\n- tag2\n---\n#tag1,#tag2",
        );
    });

    it("tp.file.folder returns empty name for root file", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.folder.md": `folder:<% tp.file.folder() %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.file.folder");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "folder:");
    });

    it("tp.file.folder returns folder name and absolute path for file in subfolder", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.folder.md": `<% tp.file.folder() %>|<% tp.file.folder(true) %>`,
            "notes/sub/note.md": `\n`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/sub/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.file.folder");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/sub/note.md",
            "sub|notes/sub\n",
        );
    });

    it("tp.file.path returns relative path", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.path.md": `<% tp.file.path(true) %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.file.path");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("notes/note.md", "notes/note.md\n");
    });

    it("tp.file.cursor retains placeholder when auto jump is disabled", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.cursor.md": `<% tp.file.cursor(1) %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.file.cursor");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "<% tp.file.cursor(1) %>",
        );
    });

    it("tp.file.cursor removes placeholder when auto jump is enabled", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.cursor.md": `before<% tp.file.cursor(1) %>after`,
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.auto_jump_to_cursor = true;
            await plugins.templaterObsidian.save_settings();
        });
        try {
            await obsidianPage.loadWorkspaceLayout("empty");
            await EmptyStateViewPage.clickCreateNewNote();
            await WorkspacePage.expectActiveTabToHaveText("Untitled");
            await OpenInsertTemplateModalPage.open();
            await OpenInsertTemplateModalPage.selectSuggestionByName(
                "tp.file.cursor",
            );
            await WorkspacePage.waitForAllTemplatesExecuted();
            await VaultPage.expectFileToHaveContent("Untitled.md", "beforeafter");
        } finally {
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.auto_jump_to_cursor = false;
                await plugins.templaterObsidian.save_settings();
            });
        }
    });

    it("tp.file.exists returns true for existing file", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.exists.md": `<% tp.file.exists("notes/note.md") %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.file.exists");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "true");
    });

    it("tp.file.exists returns false for missing file", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.exists.md": `<% tp.file.exists("nonexistent.md") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.file.exists");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "false");
    });

    it("tp.file.find_tfile returns file by name", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.find_tfile.md": `<% tp.file.find_tfile("findme").path %>`,
            "notes/findme.md": `\n`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.find_tfile",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "notes/findme.md");
    });

    it("tp.file.find_tfile returns null for missing file", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.find_tfile.md": `<% tp.file.find_tfile("nonexistent") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.find_tfile",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "null");
    });

    it("tp.file.include includes another file's content", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.include.md": `<% tp.file.include('[[include-source]]') %>`,
            "notes/include-source.md": `Included content`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.include",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "Included content");
    });

    it("tp.file.creation_date with default format", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.creation_date.md": `<% tp.file.creation_date() %>`,
            "notes/note.md": `\n`,
        });
        await browser.executeObsidian(({ app }, ctime: number) => {
            const file = app.vault.getFileByPath("notes/note.md");
            if (!file) throw new Error("File not found");
            file.stat.ctime = ctime;
        }, fixedTimestamp);
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.creation_date",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            moment(fixedTimestamp).format("YYYY-MM-DD HH:mm") + "\n",
        );
    });

    it("tp.file.creation_date with custom format", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.creation_date.md": `<% tp.file.creation_date("YYYY-MM-DD") %>`,
            "notes/note.md": `\n`,
        });
        await browser.executeObsidian(({ app }, ctime: number) => {
            const file = app.vault.getFileByPath("notes/note.md");
            if (!file) throw new Error("File not found");
            file.stat.ctime = ctime;
        }, fixedTimestamp);
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.creation_date",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            moment(fixedTimestamp).format("YYYY-MM-DD") + "\n",
        );
    });

    it("tp.file.last_modified_date with default format", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.last_modified_date.md": `<% tp.file.last_modified_date() %>`,
            "notes/note.md": `\n`,
        });
        await browser.executeObsidian(({ app }, mtime: number) => {
            const file = app.vault.getFileByPath("notes/note.md");
            if (!file) throw new Error("File not found");
            file.stat.mtime = mtime;
        }, fixedTimestamp);
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.last_modified_date",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            moment(fixedTimestamp).format("YYYY-MM-DD HH:mm") + "\n",
        );
    });

    it("tp.file.last_modified_date with custom format", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.last_modified_date.md": `<% tp.file.last_modified_date("YYYY-MM-DD") %>`,
            "notes/note.md": `\n`,
        });
        await browser.executeObsidian(({ app }, mtime: number) => {
            const file = app.vault.getFileByPath("notes/note.md");
            if (!file) throw new Error("File not found");
            file.stat.mtime = mtime;
        }, fixedTimestamp);
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.last_modified_date",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            moment(fixedTimestamp).format("YYYY-MM-DD") + "\n",
        );
    });

    it("tp.file.move moves file to new path", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.move.md": `moved:<% tp.file.move("notes/moved") %>`,
            "notes/original.md": `\n`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/original.md");
        await WorkspacePage.expectActiveTabToHaveText("original");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.file.move");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("notes/moved.md", "moved:\n");
    });

    it("tp.file.rename renames file", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.file.rename.md": `renamed:<% tp.file.rename("renamed") %>`,
            "notes/original.md": `\n`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/original.md");
        await WorkspacePage.expectActiveTabToHaveText("original");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.rename",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("notes/renamed.md", "renamed:\n");
    });

    it.skip("tp.file.cursor_append", () => {
        // Requires complex active-editor cursor positioning.
    });

    it.skip("tp.file.selection", () => {
        // Requires programmatic text selection in editor.
    });

    it.skip("tp.file.create_new", () => {
        // Complex multi-note flow; warrants dedicated test suite.
    });
});
